const express = require("express");

const router = express.Router();
const pool = require("../config/db");
const { sendError, sendSuccess } = require("../controllers/apiResponse");
const { verifyToken, authorizeRoles } = require("../middlewares/auth.middleware");

const ensureAppraisalSchema = async () => {
    await pool.query(`
        ALTER TABLE appraisal_results
        ADD COLUMN IF NOT EXISTS review_date DATE DEFAULT CURRENT_DATE
    `);

    await pool.query(`
        ALTER TABLE appraisal_results
        ADD COLUMN IF NOT EXISTS result VARCHAR(100)
    `);

    await pool.query(`
        ALTER TABLE appraisal_results
        ADD COLUMN IF NOT EXISTS remarks TEXT
    `);
};

router.post("/", verifyToken, authorizeRoles("Admin", "HR", "Manager"), async (req, res) => {
    try {
        const { employee_id, review_date, result, remarks } = req.body || {};

        if (!employee_id) {
            return sendError(res, "employee_id is required", 400);
        }

        await ensureAppraisalSchema();

        const created = await pool.query(
            `
            INSERT INTO appraisal_results (employee_id, review_date, result, remarks, comments)
            VALUES ($1, $2, $3, $4, $4)
            RETURNING id, employee_id, review_date, result, remarks, created_at
            `,
            [employee_id, review_date || new Date().toISOString().slice(0, 10), result || null, remarks || null]
        );

        return sendSuccess(res, [created.rows[0]], "Appraisal created", 201);
    } catch (error) {
        console.error("Create appraisal error:", error);
        return sendError(res, "Internal server error", 500);
    }
});

router.get("/", verifyToken, authorizeRoles("Admin", "HR", "Manager", "Employee"), async (_req, res) => {
    try {
        await ensureAppraisalSchema();

        const rows = await pool.query(
            `
            SELECT
                ar.id,
                ar.employee_id,
                COALESCE(NULLIF(e.name, ''), TRIM(CONCAT(e.first_name, ' ', e.last_name))) AS employee_name,
                ar.review_date,
                ar.result,
                ar.remarks,
                ar.created_at
            FROM appraisal_results ar
            LEFT JOIN employees e ON e.id = ar.employee_id
            ORDER BY COALESCE(ar.review_date, ar.created_at::date) DESC, ar.id DESC
            `
        );

        return sendSuccess(res, rows.rows, "Appraisal fetched");
    } catch (error) {
        console.error("Get appraisal error:", error);
        return sendError(res, "Internal server error", 500);
    }
});

module.exports = router;