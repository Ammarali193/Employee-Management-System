const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const { verifyToken, authorizeRoles } = require("../middlewares/auth.middleware");

// CREATE SHIFT
router.post("/create", verifyToken, authorizeRoles("Admin"), async (req, res) => {
    try {
        const { name, start_time, end_time } = req.body;

        const result = await pool.query(
            `
            INSERT INTO shifts (name, start_time, end_time)
            VALUES ($1, $2, $3)
            RETURNING *
            `,
            [name, start_time, end_time]
        );

        res.json({
            message: "Shift created",
            shift: result.rows[0]
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

// GET SHIFTS
router.get("/", verifyToken, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT * FROM shifts
            ORDER BY id ASC
        `);

        res.json({
            shifts: result.rows
        });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

// ASSIGN SHIFT TO EMPLOYEE
router.post("/assign", verifyToken, authorizeRoles("Admin"), async (req, res) => {
    try {
        const { employee_id, shift_id } = req.body;

        const result = await pool.query(
            `
            INSERT INTO employee_shifts (employee_id, shift_id)
            VALUES ($1, $2)
            RETURNING *
            `,
            [employee_id, shift_id]
        );

        res.json({
            message: "Shift assigned",
            assignment: result.rows[0]
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
