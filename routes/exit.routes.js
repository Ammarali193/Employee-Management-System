const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const { verifyToken, authorizeRoles } = require("../middlewares/auth.middleware");


// ==============================
// EMPLOYEE RESIGNATION REQUEST
// ==============================
router.post("/request", verifyToken, async (req, res) => {
    try {

        const employee_id = req.user.id;
        const { reason } = req.body;

        const result = await pool.query(
            `
            INSERT INTO exit_requests (employee_id, reason)
            VALUES ($1, $2)
            RETURNING *
            `,
            [employee_id, reason]
        );

        res.status(201).json({
            message: "Resignation request submitted",
            exit_request: result.rows[0]
        });

    } catch (error) {
        console.error("Exit request error:", error);
        res.status(500).json({
            message: "Server error"
        });
    }
});


// ==============================
// ADMIN APPROVE EXIT
// ==============================
router.put("/approve/:id", verifyToken, authorizeRoles("Admin"), async (req, res) => {
    try {

        const { id } = req.params;

        const result = await pool.query(
            `
            UPDATE exit_requests
            SET status = 'approved',
                approved_by = $1
            WHERE id = $2
            RETURNING *
            `,
            [req.user.id, id]
        );

        res.json({
            message: "Exit approved successfully",
            exit_request: result.rows[0]
        });

    } catch (error) {
        console.error("Exit approval error:", error);
        res.status(500).json({
            message: "Server error"
        });
    }
});


// ==============================
// GET ALL EXIT REQUESTS
// ==============================
router.get("/", verifyToken, authorizeRoles("Admin"), async (req, res) => {
    try {

        const result = await pool.query(
            `
            SELECT 
                er.id,
                e.first_name,
                e.last_name,
                er.reason,
                er.status,
                er.requested_at
            FROM exit_requests er
            JOIN employees e ON er.employee_id = e.id
            ORDER BY er.requested_at DESC
            `
        );

        res.json({
            exit_requests: result.rows
        });

    } catch (error) {
        console.error("Exit fetch error:", error);
        res.status(500).json({
            message: "Server error"
        });
    }
});


module.exports = router;
