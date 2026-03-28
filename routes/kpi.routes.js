const express = require("express");

const router = express.Router();
const pool = require("../config/db");
const { sendError, sendSuccess } = require("../controllers/apiResponse");
const { verifyToken, authorizeRoles } = require("../middlewares/auth.middleware");

const ensureKpiSchema = async () => {
    await pool.query(`
        ALTER TABLE kpis
        ADD COLUMN IF NOT EXISTS progress INTEGER DEFAULT 0
    `);

    await pool.query(`
        ALTER TABLE kpis
        ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'Pending'
    `);
};

router.post("/", verifyToken, authorizeRoles("Admin", "HR", "Manager"), async (req, res) => {
    try {
        const { employee_id, goal, progress, status } = req.body || {};

        if (!employee_id || !goal) {
            return sendError(res, "employee_id and goal are required", 400);
        }

        await ensureKpiSchema();

        const normalizedProgress = Number.isFinite(Number(progress)) ? Number(progress) : 0;
        const normalizedStatus = String(status || "Pending").trim() || "Pending";

        const result = await pool.query(
            `
            INSERT INTO kpis (employee_id, goal, target_value, achieved_value, progress, status)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id, employee_id, goal, progress, status, created_at
            `,
            [employee_id, goal, 100, normalizedProgress, normalizedProgress, normalizedStatus]
        );

        return sendSuccess(res, [result.rows[0]], "KPI created", 201);
    } catch (error) {
        console.error("Create KPI error:", error);
        return sendError(res, "Internal server error", 500);
    }
});

router.get("/", verifyToken, authorizeRoles("Admin", "HR", "Manager", "Employee"), async (_req, res) => {
    try {
        await ensureKpiSchema();

        const result = await pool.query(
            `
            SELECT
                k.id,
                k.employee_id,
                COALESCE(NULLIF(e.name, ''), TRIM(CONCAT(e.first_name, ' ', e.last_name))) AS employee_name,
                k.goal,
                COALESCE(k.progress, k.achieved_value, 0) AS progress,
                COALESCE(k.status, 'Pending') AS status,
                k.created_at
            FROM kpis k
            LEFT JOIN employees e ON e.id = k.employee_id
            ORDER BY k.created_at DESC
            `
        );

        return sendSuccess(res, result.rows, "KPI fetched");
    } catch (error) {
        console.error("Get KPI error:", error);
        return sendError(res, "Internal server error", 500);
    }
});

module.exports = router;