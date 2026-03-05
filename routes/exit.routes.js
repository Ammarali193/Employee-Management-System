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

        // exit request get karo
        const exitRequest = await pool.query(
            `SELECT * FROM exit_requests WHERE id = $1`,
            [id]
        );

        if (exitRequest.rows.length === 0) {
            return res.status(404).json({
                message: "Exit request not found"
            });
        }

        const employee_id = exitRequest.rows[0].employee_id;

        // exit approve
        const result = await pool.query(
            `
            UPDATE exit_requests
            SET status='approved',
                approved_by=$1
            WHERE id=$2
            RETURNING *
            `,
            [req.user.id, id]
        );

        // employee ka role & department lo
        const employee = await pool.query(
            `
            SELECT role, department
            FROM employees
            WHERE id=$1
            `,
            [employee_id]
        );

        const role = employee.rows[0].role;
        const department = employee.rows[0].department;

        // employment history me exit record add karo
        await pool.query(
            `
            INSERT INTO employment_history
            (employee_id, role, department, change_type, effective_date)
            VALUES ($1,$2,$3,'Exit',CURRENT_DATE)
            `,
            [employee_id, role, department]
        );

        res.json({
            message: "Exit approved and recorded in employment history",
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
