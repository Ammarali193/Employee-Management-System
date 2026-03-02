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

// Get single employee by id
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            "SELECT id, first_name, last_name, email, department, role, status FROM employees WHERE id = $1",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Employee not found" });
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
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
