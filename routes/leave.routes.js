const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const { verifyToken, authorizeRoles } = require("../middlewares/auth.middleware");

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
router.put("/approve/:id", verifyToken, authorizeRoles("Admin"), async (req, res) => {
    try {

        const leaveId = req.params.id;

        // leave request
        const leave = await pool.query(
            `
            SELECT * FROM leave_requests WHERE id=$1
            `,
            [leaveId]
        );

        if (leave.rows.length === 0) {
            return res.status(404).json({ message: "Leave not found" });
        }

        const data = leave.rows[0];
        const start = new Date(data.start_date);
        const end = new Date(data.end_date);
        const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

        // approve leave
        await pool.query(
            `
            UPDATE leave_requests
            SET status='approved'
            WHERE id=$1
            `,
            [leaveId]
        );

        // update leave balance
        await pool.query(
            `
            UPDATE leave_balances
            SET 
            used_days = used_days + $1,
            remaining_days = remaining_days - $1
            WHERE employee_id=$2 AND leave_type_id=$3
            `,
            [days, data.employee_id, data.leave_type_id]
        );

        res.json({
            message: "Leave approved & balance updated"
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

router.post("/balance/assign", verifyToken, authorizeRoles("Admin"), async (req, res) => {
    try {
        const { employee_id, leave_type_id, total_days } = req.body;

        const result = await pool.query(
            `
            INSERT INTO leave_balances
            (employee_id, leave_type_id, total_days, used_days, remaining_days)
            VALUES ($1, $2, $3, 0, $3)
            RETURNING *
            `,
            [employee_id, leave_type_id, total_days]
        );

        res.json({
            message: "Leave balance assigned",
            balance: result.rows[0]
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

router.get("/balance/:employee_id", verifyToken, async (req, res) => {
    try {
        const employee_id = req.params.employee_id;

        const result = await pool.query(
            `
            SELECT
                lt.name AS leave_type,
                lb.total_days,
                lb.used_days,
                lb.remaining_days
            FROM leave_balances lb
            JOIN leave_types lt ON lb.leave_type_id = lt.id
            WHERE lb.employee_id = $1
            `,
            [employee_id]
        );

        res.json({
            balances: result.rows
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
