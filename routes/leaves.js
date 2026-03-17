const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const verifyToken = require("../middleware/auth");
const checkRole = require("../middleware/roles");

router.post("/", verifyToken, async (req, res) => {
    const { leave_type_id, start_date, end_date, reason } = req.body;
    const employeeId = req.user.id;

    if (!leave_type_id || !start_date || !end_date) {
        return res.status(400).json({
            message: "leave_type_id, start_date, and end_date are required"
        });
    }

    try {
        const result = await pool.query(
            `
            INSERT INTO leave_requests (employee_id, leave_type_id, start_date, end_date, reason, status)
            VALUES ($1, $2, $3, $4, $5, 'pending')
            RETURNING *
            `,
            [employeeId, leave_type_id, start_date, end_date, reason]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error("Apply leave error:", err);
        res.status(500).json({ message: "Server error" });
    }
});

router.get("/", verifyToken, async (req, res) => {
    try {
        const result = await pool.query(
            `
            SELECT
                lr.*,
                lt.name AS leave_type
            FROM leave_requests lr
            LEFT JOIN leave_types lt ON lr.leave_type_id = lt.id
            WHERE lr.employee_id = $1
            ORDER BY lr.applied_at DESC
            `
            ,
            [req.user.id]
        );

        res.json(result.rows);
    } catch (err) {
        console.error("Get my leaves error:", err);
        res.status(500).json({ message: "Server error" });
    }
});

router.get("/all", verifyToken, checkRole("admin"), async (req, res) => {
    try {
        const result = await pool.query(
            `
            SELECT
                lr.*,
                e.name,
                lt.name AS leave_type
            FROM leave_requests lr
            JOIN employees e ON lr.employee_id = e.id
            LEFT JOIN leave_types lt ON lr.leave_type_id = lt.id
            ORDER BY lr.applied_at DESC
            `
        );

        res.json(result.rows);
    } catch (err) {
        console.error("Get all leaves error:", err);
        res.status(500).json({ message: "Server error" });
    }
});

router.put("/approve/:id", verifyToken, checkRole("admin"), async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            `
            UPDATE leave_requests
            SET status = 'approved'
            WHERE id = $1
            RETURNING *
            `,
            [id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Leave not found" });
        }

        res.json({ message: "Leave approved" });
    } catch (err) {
        console.error("Approve leave error:", err);
        res.status(500).json({ message: "Server error" });
    }
});

router.put("/reject/:id", verifyToken, checkRole("admin"), async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            `
            UPDATE leave_requests
            SET status = 'rejected'
            WHERE id = $1
            RETURNING *
            `,
            [id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Leave not found" });
        }

        res.json({ message: "Leave rejected" });
    } catch (err) {
        console.error("Reject leave error:", err);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
