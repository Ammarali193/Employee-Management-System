const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const { verifyToken, authorizeRoles } = require("../middlewares/auth.middleware");
const { sendError, sendSuccess } = require("../controllers/apiResponse");

const ensureExitSchema = async () => {
    await pool.query(`
        ALTER TABLE exit_requests
        ADD COLUMN IF NOT EXISTS exit_date DATE
    `);

    await pool.query(`
        ALTER TABLE exit_requests
        ADD COLUMN IF NOT EXISTS remarks TEXT
    `);
};

// ==============================
// EMPLOYEE RESIGNATION REQUEST
// ==============================
const createExitRequestHandler = async (req, res) => {
    try {
        await ensureExitSchema();

        const { reason, employee_id, exit_date, remarks } = req.body || {};

        if (!reason) {
            return sendError(res, "reason is required", 400);
        }

        const resolvedEmployeeId =
            employee_id && ["admin", "hr", "manager"].includes(String(req.user?.role || "").toLowerCase())
                ? employee_id
                : req.user.id;

        const result = await pool.query(
            `
            INSERT INTO exit_requests (employee_id, reason, exit_date, remarks)
            VALUES ($1, $2, $3, $4)
            RETURNING *
            `,
            [resolvedEmployeeId, reason, exit_date || null, remarks || null]
        );

        return sendSuccess(res, [result.rows[0]], "Resignation request submitted", 201);

    } catch (error) {
        console.error("Exit request error:", error);
        return sendError(res, "Server error", 500);
    }
};

router.post("/request", verifyToken, createExitRequestHandler);
router.post("/", verifyToken, createExitRequestHandler);


// ==============================
// ADMIN APPROVE EXIT
// ==============================
router.put("/approve/:id", verifyToken, authorizeRoles("Admin"), async (req, res) => {
    try {

        const { id } = req.params;

        const exitRequest = await pool.query(
            `SELECT * FROM exit_requests WHERE id = $1`,
            [id]
        );

        if (exitRequest.rows.length === 0) {
            return sendError(res, "Exit request not found", 404);
        }

        const employee_id = exitRequest.rows[0].employee_id;

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

        const employee = await pool.query(
            `
            SELECT role, department
            FROM employees
            WHERE id=$1
            `,
            [employee_id]
        );

        const role = employee.rows[0]?.role || "Employee";
        const department = employee.rows[0]?.department || "General";

        await pool.query(
            `
            INSERT INTO employment_history
            (employee_id, role, department, change_type, effective_date)
            VALUES ($1,$2,$3,'Exit',CURRENT_DATE)
            `,
            [employee_id, role, department]
        );

        return sendSuccess(res, [result.rows[0]], "Exit approved and recorded in employment history");

    } catch (error) {
        console.error("Exit approval error:", error);
        return sendError(res, "Server error", 500);
    }
});


// ==============================
// GET ALL EXIT REQUESTS
// ==============================
router.get("/", verifyToken, authorizeRoles("Admin", "HR", "Manager"), async (_req, res) => {
    try {
        await ensureExitSchema();

        const result = await pool.query(
            `
            SELECT 
                er.id,
                er.employee_id,
                e.first_name,
                e.last_name,
                er.reason,
                er.remarks,
                er.exit_date,
                er.status,
                er.requested_at
            FROM exit_requests er
            JOIN employees e ON er.employee_id = e.id
            ORDER BY er.requested_at DESC
            `
        );

        return sendSuccess(res, result.rows, "Exit requests fetched");

    } catch (error) {
        console.error("Exit fetch error:", error);
        return sendError(res, "Server error", 500);
    }
});


module.exports = router;
