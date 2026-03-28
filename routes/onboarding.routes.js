const express = require("express");

const router = express.Router();
const pool = require("../config/db");
const { sendError, sendSuccess } = require("../controllers/apiResponse");
const { verifyToken, authorizeRoles } = require("../middlewares/auth.middleware");

const ensureOnboardingSchema = async () => {
    await pool.query(`
        ALTER TABLE onboarding
        ADD COLUMN IF NOT EXISTS start_date DATE
    `);

    await pool.query(`
        ALTER TABLE onboarding
        ADD COLUMN IF NOT EXISTS mentor VARCHAR(150)
    `);

    await pool.query(`
        ALTER TABLE onboarding
        ADD COLUMN IF NOT EXISTS checklist_notes TEXT
    `);
};

router.post("/", verifyToken, authorizeRoles("Admin", "HR"), async (req, res) => {
    try {
        await ensureOnboardingSchema();

        const {
            employee_id,
            documents_submitted,
            training_assigned,
            status,
            start_date,
            mentor,
            checklist_notes
        } = req.body || {};

        if (!employee_id) {
            return sendError(res, "employee_id is required", 400);
        }

        const result = await pool.query(
            `
            INSERT INTO onboarding (
                employee_id,
                documents_submitted,
                training_assigned,
                status,
                start_date,
                mentor,
                checklist_notes
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
            `,
            [
                employee_id,
                Boolean(documents_submitted),
                Boolean(training_assigned),
                String(status || "Pending").trim() || "Pending",
                start_date || null,
                mentor || null,
                checklist_notes || null
            ]
        );

        return sendSuccess(res, [result.rows[0]], "Onboarding started", 201);
    } catch (error) {
        console.error("Create onboarding error:", error);
        return sendError(res, "Internal server error", 500);
    }
});

router.get("/", verifyToken, authorizeRoles("Admin", "HR", "Manager"), async (_req, res) => {
    try {
        await ensureOnboardingSchema();

        const result = await pool.query(
            `
            SELECT
                o.id,
                o.employee_id,
                COALESCE(NULLIF(e.name, ''), TRIM(CONCAT(e.first_name, ' ', e.last_name))) AS employee_name,
                o.documents_submitted,
                o.training_assigned,
                o.status,
                o.start_date,
                o.mentor,
                o.checklist_notes,
                o.created_at
            FROM onboarding o
            LEFT JOIN employees e ON e.id = o.employee_id
            ORDER BY o.created_at DESC
            `
        );

        return sendSuccess(res, result.rows, "Onboarding fetched");
    } catch (error) {
        console.error("Get onboarding error:", error);
        return sendError(res, "Internal server error", 500);
    }
});

module.exports = router;
