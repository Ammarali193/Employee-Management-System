const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const { verifyToken } = require("../middlewares/auth.middleware");

// ==============================
// 🔹 APPLY LEAVE
// ==============================
router.post("/apply", verifyToken, async (req, res) => {
    try {
        const employeeId = req.user.id;
        const { leave_type_id, start_date, end_date, reason } = req.body;

        if (!leave_type_id || !start_date || !end_date) {
            return res.status(400).json({
                message: "Leave type, start date and end date are required"
            });
        }

        const result = await pool.query(
            `
            INSERT INTO leave_requests 
            (employee_id, leave_type_id, start_date, end_date, reason)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
            `,
            [employeeId, leave_type_id, start_date, end_date, reason]
        );

        res.status(201).json({
            message: "Leave applied successfully",
            leave: result.rows[0]
        });

    } catch (error) {
        console.error("Leave apply error:", error);
        res.status(500).json({
            message: "Server error"
        });
    }
});

module.exports = router;
