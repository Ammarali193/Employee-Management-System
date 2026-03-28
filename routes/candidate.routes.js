const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const bcrypt = require("bcrypt");
const { verifyToken, authorizeRoles } = require("../middlewares/auth.middleware");
const { sendError, sendSuccess } = require("../controllers/apiResponse");

const ensureCandidateSchema = async () => {
    await pool.query(`
        ALTER TABLE candidates
        ADD COLUMN IF NOT EXISTS status VARCHAR(40) DEFAULT 'Applied'
    `);
};

// ==============================
// CANDIDATE APPLY FOR JOB
// ==============================
const applyCandidateHandler = async (req, res) => {
    try {
        await ensureCandidateSchema();

        const { name, email, phone, resume_url, job_id, status } = req.body;

        if (!name || !email || !job_id) {
            return sendError(res, "name, email, and job_id are required", 400);
        }

        const result = await pool.query(
            `
            INSERT INTO candidates
            (name, email, phone, resume_url, job_id, status)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id, name, email, phone, resume_url, job_id, status, created_at
            `,
            [
                String(name).trim(),
                String(email).trim().toLowerCase(),
                phone ?? null,
                resume_url ?? null,
                job_id,
                String(status || "Applied").trim() || "Applied"
            ]
        );

        return sendSuccess(res, [result.rows[0]], "Application submitted successfully", 201);

    } catch (error) {
        console.error("Candidate apply error:", error);
        return sendError(res, "Server error", 500);
    }
};

router.post("/apply", applyCandidateHandler);
router.post("/", verifyToken, authorizeRoles("Admin", "HR", "Manager"), applyCandidateHandler);


// ==============================
// GET ALL CANDIDATES
// ==============================
router.get("/", verifyToken, authorizeRoles("Admin", "HR", "Manager"), async (_req, res) => {
    try {
        await ensureCandidateSchema();

        const result = await pool.query(
            `
            SELECT 
                c.id,
                c.name,
                c.email,
                c.phone,
                c.status,
                c.job_id,
                c.resume_url,
                j.title AS job_title,
                c.created_at
            FROM candidates c
            LEFT JOIN job_posts j ON c.job_id = j.id
            ORDER BY c.created_at DESC
            `
        );

        return sendSuccess(res, result.rows, "Candidates fetched");

    } catch (error) {
        console.error("Candidate fetch error:", error);
        return sendError(res, "Server error", 500);
    }
});

// ==============================
// HIRE CANDIDATE ? CREATE EMPLOYEE
// ==============================
router.put("/hire/:id", verifyToken, authorizeRoles("Admin", "HR"), async (req, res) => {
    try {

        const { id } = req.params;

        const candidate = await pool.query(
            "SELECT * FROM candidates WHERE id = $1",
            [id]
        );

        if (candidate.rows.length === 0) {
            return sendError(res, "Candidate not found", 404);
        }

        const data = candidate.rows[0];

        const nameParts = String(data.name || "").trim().split(" ");
        const firstName = nameParts[0] || "Candidate";
        const lastName = nameParts.slice(1).join(" ") || "User";

        const hashedPassword = await bcrypt.hash("123456", 10);

        const result = await pool.query(
            `
            INSERT INTO employees
            (name, first_name, last_name, email, password, role, department, join_date, status)
            VALUES ($1,$2,$3,$4,$5,'Employee','New Hire',CURRENT_DATE,'active')
            RETURNING id, name, first_name, last_name, email
            `,
            [data.name, firstName, lastName, data.email, hashedPassword]
        );

        return sendSuccess(res, [result.rows[0]], "Candidate hired successfully");

    } catch (error) {
        console.error("Hiring error:", error);
        return sendError(res, "Server error", 500);
    }
});


module.exports = router;
