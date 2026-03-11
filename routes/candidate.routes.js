const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const bcrypt = require("bcrypt");
const { verifyToken } = require("../middlewares/auth.middleware");


// ==============================
// CANDIDATE APPLY FOR JOB
// ==============================
router.post("/apply", async (req, res) => {
    try {

        const { name, email, phone, resume_url, job_id } = req.body;

        if (!name || !job_id) {
            return res.status(400).json({
                message: "Name and Job ID are required"
            });
        }

        const result = await pool.query(
            `
            INSERT INTO candidates
            (name, email, phone, resume_url, job_id)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
            `,
            [name, email, phone, resume_url, job_id]
        );

        res.status(201).json({
            message: "Application submitted successfully",
            candidate: result.rows[0]
        });

    } catch (error) {
        console.error("Candidate apply error:", error);
        res.status(500).json({
            message: "Server error"
        });
    }
});


// ==============================
// GET ALL CANDIDATES
// ==============================
router.get("/", async (req, res) => {
    try {

        const result = await pool.query(
            `
            SELECT 
                c.id,
                c.name,
                c.email,
                c.phone,
                c.status,
                j.title AS job_title
            FROM candidates c
            JOIN job_posts j ON c.job_id = j.id
            ORDER BY c.created_at DESC
            `
        );

        res.json({
            candidates: result.rows
        });

    } catch (error) {
        console.error("Candidate fetch error:", error);
        res.status(500).json({
            message: "Server error"
        });
    }
});

// ==============================
// HIRE CANDIDATE → CREATE EMPLOYEE
// ==============================
router.put("/hire/:id", verifyToken, async (req, res) => {
    try {

        const { id } = req.params;

        // Get candidate
        const candidate = await pool.query(
            "SELECT * FROM candidates WHERE id = $1",
            [id]
        );

        if (candidate.rows.length === 0) {
            return res.status(404).json({
                message: "Candidate not found"
            });
        }

        const data = candidate.rows[0];

        // Name split
        const nameParts = data.name.split(" ");
        const firstName = nameParts[0];
        const lastName = nameParts[1] || "User";

        // Default password
        const hashedPassword = await bcrypt.hash("123456", 10);

        const result = await pool.query(
            `
            INSERT INTO employees
            (name, first_name, last_name, email, password, role, department, join_date, status)
            VALUES ($1,$2,$3,$4,$5,'Employee','New Hire',CURRENT_DATE,'active')
            RETURNING id, name, first_name, email
            `,
            [data.name, firstName, lastName, data.email, hashedPassword]
        );

        res.json({
            message: "Candidate hired successfully",
            employee: result.rows[0]
        });

    } catch (error) {
        console.error("Hiring error:", error);
        res.status(500).json({
            message: "Server error"
        });
    }
});


module.exports = router;
