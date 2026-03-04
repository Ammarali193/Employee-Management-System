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

// ==============================
// 🔹 GET ALL LEAVE REQUESTS
// ==============================
router.get("/all", verifyToken, async (req, res) => {
    try {

        const result = await pool.query(`
            SELECT 
                lr.id,
                lr.employee_id,
                lt.name AS leave_type,
                lr.start_date,
                lr.end_date,
                lr.status
            FROM leave_requests lr
            JOIN leave_types lt 
            ON lr.leave_type_id = lt.id
        `);

        res.json({
            leave_requests: result.rows
        });

    } catch (error) {
        console.error("Leave fetch error:", error);
        res.status(500).json({
            message: "Server error"
        });
    }
});

// ==============================
// APPROVE / REJECT LEAVE
// ==============================
router.put("/approve/:id", verifyToken, async (req, res) => {
    try {

        const { id } = req.params;
        const { status } = req.body;

        if (!["approved", "rejected"].includes(status)) {
            return res.status(400).json({
                message: "Status must be approved or rejected"
            });
        }

        // Leave request get karo
        const leave = await pool.query(
            `SELECT * FROM leave_requests WHERE id = $1`,
            [id]
        );

        if (leave.rows.length === 0) {
            return res.status(404).json({
                message: "Leave request not found"
            });
        }

        const leaveRequest = leave.rows[0];

        // Leave approve karo
        const result = await pool.query(
            `UPDATE leave_requests
             SET status = $1
             WHERE id = $2
             RETURNING *`,
            [status, id]
        );

        // Agar approved hai to leave balance update karo
        if (status === "approved") {

            await pool.query(
                `
                UPDATE leave_balances
                SET used_leaves = used_leaves + 1
                WHERE employee_id = $1
                AND leave_type_id = $2
                `,
                [leaveRequest.employee_id, leaveRequest.leave_type_id]
            );

        }

        res.json({
            message: `Leave ${status} successfully`,
            leave: result.rows[0]
        });

    } catch (error) {
        console.error("Leave approval error:", error);
        res.status(500).json({
            message: "Server error"
        });
    }
});

module.exports = router;
