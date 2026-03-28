const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const { verifyToken, authorizeRoles } = require("../middlewares/auth.middleware");
const { sendError, sendSuccess } = require("../controllers/apiResponse");

const ensureJobSchema = async () => {
    await pool.query(`
        ALTER TABLE job_posts
        ADD COLUMN IF NOT EXISTS location VARCHAR(120)
    `);

    await pool.query(`
        ALTER TABLE job_posts
        ADD COLUMN IF NOT EXISTS status VARCHAR(40) DEFAULT 'Open'
    `);
};

// ==============================
// CREATE JOB POST (ADMIN)
// ==============================
const createJobHandler = async (req, res) => {
    try {
        await ensureJobSchema();

        const { title, department, description, location, status } = req.body;

        if (!title || !department) {
            return sendError(res, "title and department are required", 400);
        }

        const result = await pool.query(
            `
            INSERT INTO job_posts (title, department, description, location, status)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, title, department, description, location, status, created_at
            `,
            [
                String(title).trim(),
                String(department).trim(),
                description ?? null,
                location ?? null,
                String(status || "Open").trim() || "Open"
            ]
        );

        return sendSuccess(res, [result.rows[0]], "Job created successfully", 201);

    } catch (error) {
        console.error("Job create error:", error);
        return sendError(res, "Server error", 500);
    }
};

router.post("/create", verifyToken, authorizeRoles("Admin", "HR"), createJobHandler);
router.post("/", verifyToken, authorizeRoles("Admin", "HR"), createJobHandler);


// ==============================
// GET ALL JOB POSTS
// ==============================
router.get("/", verifyToken, authorizeRoles("Admin", "HR", "Manager", "Employee"), async (_req, res) => {
    try {
        await ensureJobSchema();

        const result = await pool.query(
            `
            SELECT
                id,
                title,
                department,
                description,
                location,
                COALESCE(NULLIF(status, ''), 'Open') AS status,
                created_at
            FROM job_posts
            ORDER BY created_at DESC
            `
        );

        return sendSuccess(res, result.rows, "Jobs fetched");

    } catch (error) {
        console.error("Job fetch error:", error);
        return sendError(res, "Server error", 500);
    }
});

module.exports = router;
