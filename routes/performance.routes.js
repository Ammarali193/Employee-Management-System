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
