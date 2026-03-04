const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const { verifyToken, authorizeRoles } = require("../middlewares/auth.middleware");


// ==============================
// CREATE JOB POST (ADMIN)
// ==============================
router.post("/create", verifyToken, authorizeRoles("Admin"), async (req, res) => {
    try {

        const { title, department, description } = req.body;

        if (!title) {
            return res.status(400).json({
                message: "Job title is required"
            });
        }

        const result = await pool.query(
            `
            INSERT INTO job_posts (title, department, description)
            VALUES ($1, $2, $3)
            RETURNING *
            `,
            [title, department, description]
        );

        res.status(201).json({
            message: "Job created successfully",
            job: result.rows[0]
        });

    } catch (error) {
        console.error("Job create error:", error);
        res.status(500).json({
            message: "Server error"
        });
    }
});


// ==============================
// GET ALL JOB POSTS
// ==============================
router.get("/", async (req, res) => {
    try {

        const result = await pool.query(
            `
            SELECT *
            FROM job_posts
            ORDER BY created_at DESC
            `
        );

        res.json({
            jobs: result.rows
        });

    } catch (error) {
        console.error("Job fetch error:", error);
        res.status(500).json({
            message: "Server error"
        });
    }
});

module.exports = router;
