const express = require("express");
const bcrypt = require("bcryptjs");

const router = express.Router();
const pool = require("../config/db");

router.get("/employees", async (req, res) => {
    try {
        const employees = await pool.query(`
            SELECT
                e.id,
                COALESCE(NULLIF(e.name, ''), TRIM(CONCAT(e.first_name, ' ', e.last_name))) AS name,
                e.email,
                e.role,
                e.department,
                s.basic_salary AS salary,
                e.status,
                e.created_at,
                e.updated_at
            FROM employees e
            LEFT JOIN LATERAL (
                SELECT basic_salary
                FROM salaries
                WHERE employee_id = e.id
                ORDER BY created_at DESC
                LIMIT 1
            ) s ON true
            ORDER BY e.id DESC
        `);

        res.json(employees.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

router.post("/employees", async (req, res) => {
    let client;

    try {
        client = await pool.connect();
        const { first_name, last_name, name, email, password, role, department, salary } = req.body;

        const fallbackNameParts = String(name || "").trim().split(/\s+/).filter(Boolean);
        const resolvedFirstName = (first_name || fallbackNameParts[0] || "").trim();
        const resolvedLastName = (last_name || fallbackNameParts.slice(1).join(" ") || "-").trim();
        const fullName = `${resolvedFirstName} ${resolvedLastName}`.trim();

        if (!resolvedFirstName || !email || !password) {
            return res.status(400).json({ error: "first_name, email, and password are required" });
        }

        await client.query("BEGIN");

        const existingEmployee = await client.query(
            "SELECT id FROM employees WHERE email = $1",
            [email]
        );

        if (existingEmployee.rows.length > 0) {
            await client.query("ROLLBACK");
            return res.status(400).json({ error: "Email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newEmployee = await client.query(
            `INSERT INTO employees (name, first_name, last_name, email, password, role, department)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING id, name, first_name, last_name, email, role, department, status, created_at, updated_at`,
            [fullName, resolvedFirstName, resolvedLastName, email, hashedPassword, role || "Employee", department || null]
        );

        let salaryAmount = null;

        if (salary !== undefined && salary !== null && salary !== "") {
            const salaryResult = await client.query(
                `INSERT INTO salaries (employee_id, basic_salary)
                 VALUES ($1, $2)
                 RETURNING basic_salary`,
                [newEmployee.rows[0].id, salary]
            );

            salaryAmount = salaryResult.rows[0].basic_salary;
        }

        await client.query("COMMIT");

        res.json({
            message: "Employee created successfully",
            employee: {
                id: newEmployee.rows[0].id,
                name: newEmployee.rows[0].name,
                email: newEmployee.rows[0].email,
                role: newEmployee.rows[0].role,
                department: newEmployee.rows[0].department,
                salary: salaryAmount,
                status: newEmployee.rows[0].status,
                created_at: newEmployee.rows[0].created_at,
                updated_at: newEmployee.rows[0].updated_at
            }
        });
    } catch (err) {
        if (client) {
            try {
                await client.query("ROLLBACK");
            } catch (rollbackError) {
                console.error(rollbackError);
            }
        }

        console.error(err);
        res.status(500).json({ error: "Server error" });
    } finally {
        if (client) {
            client.release();
        }
    }
});

router.put("/employees/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { first_name, last_name, email, department, password } = req.body;

        const firstName = String(first_name || "").trim();
        const lastName = String(last_name || "").trim() || "-";
        const name = `${firstName} ${lastName}`.trim();

        if (!firstName || !email) {
            return res.status(400).json({ error: "first_name and email are required" });
        }

        const result = await pool.query(
            `UPDATE employees
             SET name = $1,
                 first_name = $2,
                 last_name = $3,
                 email = $4,
                 department = $5,
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $6
             RETURNING id`,
            [name, firstName, lastName, email, department || null, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Employee not found" });
        }

        res.json({ message: "Employee updated" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

router.delete("/employees/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const deletedEmployee = await pool.query(
            "DELETE FROM employees WHERE id = $1 RETURNING id",
            [id]
        );

        if (deletedEmployee.rows.length === 0) {
            return res.status(404).json({ message: "Employee not found" });
        }

        res.json({ message: "Employee deleted" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
