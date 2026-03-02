const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const { verifyToken } = require("../middlewares/auth.middleware");

// ==============================
// ?? CHECK-IN ROUTE
// ==============================
router.post("/checkin", verifyToken, async (req, res) => {
    try {
        const employeeId = req.user.id;

        // Check if already checked in today
        const existing = await pool.query(
            `
            SELECT * FROM attendance
            WHERE employee_id = $1
            AND DATE(check_in) = CURRENT_DATE
            `,
            [employeeId]
        );

        if (existing.rows.length > 0) {
            return res.status(400).json({
                message: "You have already checked in today"
            });
        }

        // Insert check-in
        const result = await pool.query(
            `
            INSERT INTO attendance (employee_id)
            VALUES ($1)
            RETURNING id, check_in
            `,
            [employeeId]
        );

        res.status(201).json({
            message: "Check-in successful",
            attendance: result.rows[0]
        });

    } catch (error) {
        console.error("Check-in error:", error);
        res.status(500).json({
            message: "Server error"
        });
    }
});

// ==============================
// 🔹 CHECK-OUT ROUTE
// ==============================
router.post("/checkout", verifyToken, async (req, res) => {
    try {
        const employeeId = req.user.id;

        // Find today's attendance
        const existing = await pool.query(
            `
            SELECT * FROM attendance
            WHERE employee_id = $1
            AND DATE(check_in) = CURRENT_DATE
            `,
            [employeeId]
        );

        if (existing.rows.length === 0) {
            return res.status(400).json({
                message: "You have not checked in today"
            });
        }

        const attendance = existing.rows[0];

        if (attendance.check_out) {
            return res.status(400).json({
                message: "You have already checked out today"
            });
        }

        // Update check_out time
        const result = await pool.query(
            `
            UPDATE attendance
            SET check_out = CURRENT_TIMESTAMP,
                work_hours = EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - check_in)) / 3600
            WHERE id = $1
            RETURNING id, check_in, check_out, work_hours
            `,
            [attendance.id]
        );

        res.json({
            message: "Check-out successful",
            attendance: result.rows[0]
        });

    } catch (error) {
        console.error("Check-out error:", error);
        res.status(500).json({
            message: "Server error"
        });
    }
});

module.exports = router;
