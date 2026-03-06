const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const bcrypt = require("bcryptjs");
const { verifyToken, authorizeRoles } = require("../middlewares/auth.middleware");

// Register employee (Admin only)
router.post("/register", verifyToken, authorizeRoles("Admin"), async (req, res) => {
    try {
        const { first_name, last_name, email, password, department } = req.body;

        const existingUser = await pool.query(
            "SELECT id FROM employees WHERE email = $1",
            [email]
        );

        if (existingUser.rows.length > 0) {
            return res.status(400).json({ message: "Email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await pool.query(
            `INSERT INTO employees 
            (first_name, last_name, email, password, department) 
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, first_name, last_name, email, department, role, status`,
            [first_name, last_name, email, hashedPassword, department]
        );

        res.status(201).json({
            message: "Employee Registered Successfully",
            employee: result.rows[0]
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
});

// Get all employees (No Password)
router.get("/", async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT id, first_name, last_name, email, department, role, status FROM employees ORDER BY id ASC"
        );

        res.status(200).json({
            count: result.rows.length,
            employees: result.rows
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
});

// ==============================
// 🔹 GET MANAGER TEAM
// ==============================
// ==============================
// EMPLOYEE DIRECTORY SEARCH
// ==============================
router.get("/directory/search", verifyToken, async (req, res) => {
    try {

        const { name, department, role, location } = req.query;

        let query = `
            SELECT 
                id,
                first_name,
                last_name,
                email,
                department,
                role,
                location
            FROM employees
            WHERE 1=1
        `;

        const values = [];
        let index = 1;

        if (name) {
            query += ` AND (first_name ILIKE $${index} OR last_name ILIKE $${index})`;
            values.push(`%${name}%`);
            index++;
        }

        if (department) {
            query += ` AND department = $${index}`;
            values.push(department);
            index++;
        }

        if (role) {
            query += ` AND role = $${index}`;
            values.push(role);
            index++;
        }

        if (location) {
            query += ` AND location = $${index}`;
            values.push(location);
            index++;
        }

        query += ` ORDER BY first_name ASC`;

        const result = await pool.query(query, values);

        res.json({
            count: result.rows.length,
            employees: result.rows
        });

    } catch (error) {
        console.error("Directory search error:", error);
        res.status(500).json({
            message: "Server error"
        });
    }
});

router.get("/my-team", verifyToken, async (req, res) => {
    try {

        const managerId = req.user.id;

        const result = await pool.query(
            `
            SELECT id, first_name, last_name, department, role
            FROM employees
            WHERE manager_id = $1
            `,
            [managerId]
        );

        res.json({
            team_members: result.rows
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

// ==============================
// UPDATE EMPLOYEE PROFILE
// ==============================
router.put("/profile/update", verifyToken, async (req, res) => {
    try {
        const employee_id = req.user.id;
        const { dob, gender, phone, grade, manager_id } = req.body;

        const result = await pool.query(
            `
            UPDATE employees
            SET dob=$1,
                gender=$2,
                phone=$3,
                grade=$4,
                manager_id=$5
            WHERE id=$6
            RETURNING *
            `,
            [dob, gender, phone, grade, manager_id, employee_id]
        );

        res.json({
            message: "Profile updated",
            employee: result.rows[0]
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

// Get single employee by id
router.get("/:id", verifyToken, async (req, res) => {
    try {
        const result = await pool.query(`
        SELECT id, first_name, last_name, email, department, role
        FROM employees
        WHERE id=$1
        `,[req.params.id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Employee not found" });
        }

        const employee = result.rows[0];

        // Mask email if not admin
        if (req.user.role !== "Admin") {
            employee.email = employee.email.replace(/(.{3}).+(@.+)/, "$1***$2");
        }

        res.json(employee);
    } catch (error) {
        console.error(error);
        res.status(500).json({message:"Server error"});
    }
});

// ==============================
// 🔹 ASSIGN MANAGER TO EMPLOYEE
// ==============================
router.put("/assign-manager/:id", verifyToken, authorizeRoles("Admin"), async (req, res) => {
    try {

        const { id } = req.params;
        const { manager_id } = req.body;

        const result = await pool.query(
            `
            UPDATE employees
            SET manager_id = $1
            WHERE id = $2
            RETURNING id, first_name, last_name, manager_id
            `,
            [manager_id, id]
        );

        res.json({
            message: "Manager assigned successfully",
            employee: result.rows[0]
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

router.put("/assign-rfid/:id", verifyToken, authorizeRoles("Admin"), async (req, res) => {
    try {

        const { id } = req.params;
        const { rfid_card_id } = req.body;

        const result = await pool.query(
            `
            UPDATE employees
            SET rfid_card_id = $1
            WHERE id = $2
            RETURNING *
            `,
            [rfid_card_id, id]
        );

        res.json({
            message: "RFID assigned",
            employee: result.rows[0]
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

router.put("/assign-qr/:id", verifyToken, authorizeRoles("Admin"), async (req, res) => {
    try {

        const { id } = req.params;
        const { qr_code } = req.body;

        const result = await pool.query(
            `
            UPDATE employees
            SET qr_code = $1
            WHERE id = $2
            RETURNING *
            `,
            [qr_code, id]
        );

        res.json({
            message: "QR code assigned",
            employee: result.rows[0]
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

router.put("/assign-biometric/:id", verifyToken, authorizeRoles("Admin"), async (req, res) => {
    try {

        const { id } = req.params;
        const { biometric_id } = req.body;

        const result = await pool.query(
            `
            UPDATE employees
            SET biometric_id = $1
            WHERE id = $2
            RETURNING *
            `,
            [biometric_id, id]
        );

        res.json({
            message: "Biometric ID assigned",
            employee: result.rows[0]
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

// Update employee (Admin only)
router.put("/:id", verifyToken, authorizeRoles("Admin"), async (req, res) => {
    try {
        const { id } = req.params;
        const { first_name, last_name, department, role, status } = req.body;

        const result = await pool.query(
            `UPDATE employees
             SET first_name = $1,
                 last_name = $2,
                 department = $3,
                 role = $4,
                 status = $5,
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $6
             RETURNING id, first_name, last_name, email, department, role, status`,
            [first_name, last_name, department, role, status, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Employee not found" });
        }

        res.status(200).json({
            message: "Employee updated successfully",
            employee: result.rows[0]
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
});

// Role/status update (Admin only)
router.patch("/:id/role-status", verifyToken, authorizeRoles("Admin"), async (req, res) => {
    try {
        const { id } = req.params;
        const { role, status } = req.body;

        const result = await pool.query(
            `UPDATE employees
             SET role = COALESCE($1, role),
                 status = COALESCE($2, status),
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $3
             RETURNING id, first_name, last_name, email, department, role, status`,
            [role, status, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Employee not found" });
        }

        res.status(200).json({
            message: "Employee role/status updated successfully",
            employee: result.rows[0]
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
});

// Delete employee by id (Admin only)
router.delete("/:id", verifyToken, authorizeRoles("Admin"), async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            "DELETE FROM employees WHERE id = $1 RETURNING id, first_name, email",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Employee not found" });
        }

        res.status(200).json({
            message: "Employee deleted successfully",
            employee: result.rows[0]
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
});

// Delete my account
router.delete("/me", verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await pool.query(
            "DELETE FROM employees WHERE id = $1 RETURNING id, first_name, email",
            [userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({
            message: "Your account deleted successfully",
            user: result.rows[0]
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
});

module.exports = router;
