const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const { verifyToken, authorizeRoles } = require("../middlewares/auth.middleware");

// ==============================
// 🔹 ADD PERFORMANCE REVIEW (Admin Only)
// ==============================
router.post("/add", verifyToken, authorizeRoles("Admin"), async (req, res) => {
    try {
        const { employee_id, rating, review_period, comments } = req.body;

        if (!employee_id || !rating || !review_period) {
            return res.status(400).json({
                message: "Employee ID, rating and review period are required"
            });
        }

        const result = await pool.query(
            `
            INSERT INTO performance_reviews
            (employee_id, reviewer_id, rating, review_period, comments)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
            `,
            [employee_id, req.user.id, rating, review_period, comments]
        );

        res.status(201).json({
            message: "Performance review added successfully",
            review: result.rows[0]
        });

    } catch (error) {
        console.error("Performance add error:", error);
        res.status(500).json({
            message: "Server error"
        });
    }
});

// ==============================
// 🔹 PERFORMANCE SUMMARY (ADMIN)
// ==============================
router.get("/summary", verifyToken, authorizeRoles("Admin"), async (req, res) => {
    try {

        const totalReviews = await pool.query(
            `SELECT COUNT(*) FROM performance_reviews`
        );

        const avgRating = await pool.query(
            `SELECT AVG(rating) FROM performance_reviews`
        );

        const topPerformer = await pool.query(
            `
            SELECT 
                e.id,
                e.first_name,
                e.last_name,
                AVG(pr.rating) AS avg_rating
            FROM performance_reviews pr
            JOIN employees e ON pr.employee_id = e.id
            GROUP BY e.id
            ORDER BY avg_rating DESC
            LIMIT 1
            `
        );

        res.json({
            total_reviews: parseInt(totalReviews.rows[0].count),
            average_rating: parseFloat(avgRating.rows[0].avg) || 0,
            top_performer: topPerformer.rows[0] || null
        });

    } catch (error) {
        console.error("Performance summary error:", error);
        res.status(500).json({
            message: "Server error"
        });
    }
});

// ==============================
// 🔹 GET MY PERFORMANCE
// ==============================
router.get("/me", verifyToken, async (req, res) => {
    try {

        const employeeId = req.user.id;

        const result = await pool.query(
            `
            SELECT pr.id, pr.rating, pr.review_period, pr.comments, pr.created_at
            FROM performance_reviews pr
            WHERE pr.employee_id = $1
            ORDER BY pr.created_at DESC
            `,
            [employeeId]
        );

        res.json({
            reviews: result.rows
        });

    } catch (error) {
        console.error("My performance fetch error:", error);
        res.status(500).json({
            message: "Server error"
        });
    }
});

// ==============================
// 🔹 TOP PERFORMERS LIST
// ==============================
router.get("/top-performers", verifyToken, authorizeRoles("Admin"), async (req, res) => {
    try {

        const result = await pool.query(
            `
            SELECT 
                e.id,
                e.first_name,
                e.last_name,
                e.department,
                AVG(pr.rating) AS average_rating,
                COUNT(pr.id) AS total_reviews
            FROM performance_reviews pr
            JOIN employees e ON pr.employee_id = e.id
            GROUP BY e.id
            ORDER BY average_rating DESC
            LIMIT 5
            `
        );

        res.json({
            top_performers: result.rows
        });

    } catch (error) {
        console.error("Top performers error:", error);
        res.status(500).json({
            message: "Server error"
        });
    }
});

// ==============================
// 🔹 GET EMPLOYEE PERFORMANCE HISTORY
// ==============================
router.get("/:employeeId", verifyToken, async (req, res) => {
    try {
        const { employeeId } = req.params;

        const result = await pool.query(
            `
            SELECT pr.id, pr.rating, pr.review_period, pr.comments, pr.created_at,
                   e.first_name || ' ' || e.last_name AS reviewer_name
            FROM performance_reviews pr
            LEFT JOIN employees e ON pr.reviewer_id = e.id
            WHERE pr.employee_id = $1
            ORDER BY pr.created_at DESC
            `,
            [employeeId]
        );

        res.json({
            reviews: result.rows
        });

    } catch (error) {
        console.error("Performance fetch error:", error);
        res.status(500).json({
            message: "Server error"
        });
    }
});

module.exports = router;
