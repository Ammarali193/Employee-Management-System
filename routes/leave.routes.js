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
        const { leave_type, start_date, end_date, reason } = req.body;

        const result = await pool.query(
            `
            INSERT INTO leave_requests
            (employee_id, leave_type, start_date, end_date, reason, status)
            VALUES ($1, $2, $3, $4, $5, 'Pending')
            RETURNING *
            `,
            [employeeId, leave_type, start_date, end_date, reason]
        );

        res.json(result.rows[0]);
    } catch (error) {
        console.error("Leave apply error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// ==============================
// 🔹 GET ALL LEAVE REQUESTS
// ==============================
router.get("/all", verifyToken, async (req, res) => {
    try {

        const result = await pool.query(`
            SELECT
                id,
                employee_id,
                leave_type,
                start_date,
                end_date,
                status
            FROM leave_requests
            ORDER BY id DESC
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

router.get("/my", verifyToken, async (req, res) => {
    try {
        const employeeId = req.user.id;

        const result = await pool.query(
            `
            SELECT
                lr.*,
                lt.name AS leave_type
            FROM leave_requests lr
            LEFT JOIN leave_types lt
            ON lr.leave_type_id = lt.id
            WHERE lr.employee_id = $1
            ORDER BY lr.applied_at DESC
            `,
            [employeeId]
        );

        res.json({ leaves: result.rows });
    } catch (error) {
        console.error("My leave fetch error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

router.get("/pending", verifyToken, authorizeRoles("Admin", "HR"), async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                lr.*,
                e.first_name,
                e.last_name,
                lt.name AS leave_type
            FROM leave_requests lr
            JOIN employees e ON lr.employee_id = e.id
            LEFT JOIN leave_types lt ON lr.leave_type_id = lt.id
            WHERE LOWER(lr.status) = 'pending'
            ORDER BY lr.applied_at DESC
        `);

        res.json({ leaves: result.rows });
    } catch (error) {
        console.error("Pending leave fetch error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// ==============================
// APPROVE / REJECT LEAVE
// ==============================
router.put("/approve/:id", verifyToken, authorizeRoles("Admin", "HR"), async (req, res) => {
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

router.post("/policy", verifyToken, authorizeRoles("Admin"), async (req, res) => {
    try {
        const { leave_type_id, carry_forward_limit, encashment_allowed } = req.body;

        const result = await pool.query(
            `
            INSERT INTO leave_policies
            (leave_type_id, carry_forward_limit, encashment_allowed)
            VALUES ($1,$2,$3)
            RETURNING *
            `,
            [leave_type_id, carry_forward_limit, encashment_allowed]
        );

        res.json({
            message: "Leave policy created",
            policy: result.rows[0]
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

router.get("/policy", verifyToken, async (req, res) => {
    try {
        const result = await pool.query(`
        SELECT lp.*, lt.name AS leave_type
        FROM leave_policies lp
        JOIN leave_types lt ON lp.leave_type_id = lt.id
        `);

        res.json({
            policies: result.rows
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
