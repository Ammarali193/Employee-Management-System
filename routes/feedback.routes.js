const express = require("express");

const router = express.Router();
const pool = require("../config/db");
const { sendError, sendSuccess } = require("../controllers/apiResponse");
const { verifyToken, authorizeRoles } = require("../middlewares/auth.middleware");

router.post("/", verifyToken, authorizeRoles("Admin", "HR", "Manager", "Employee"), async (req, res) => {
    try {
        const { employee_id, feedback, rating } = req.body || {};

        if (!employee_id || !feedback) {
            return sendError(res, "employee_id and feedback are required", 400);
        }

        const normalizedRating = Number.isFinite(Number(rating)) ? Number(rating) : null;

        const result = await pool.query(
            `
            INSERT INTO feedback (from_employee_id, to_employee_id, rating, comment)
            VALUES ($1, $2, $3, $4)
            RETURNING id, to_employee_id AS employee_id, comment AS feedback, rating, created_at
            `,
            [req.user.id, employee_id, normalizedRating, feedback]
        );

        return sendSuccess(res, [result.rows[0]], "Feedback submitted", 201);
    } catch (error) {
        console.error("Create feedback error:", error);
        return sendError(res, "Internal server error", 500);
    }
});

router.get("/", verifyToken, authorizeRoles("Admin", "HR", "Manager", "Employee"), async (_req, res) => {
    try {
        const result = await pool.query(
            `
            SELECT
                f.id,
                f.to_employee_id AS employee_id,
                COALESCE(NULLIF(e.name, ''), TRIM(CONCAT(e.first_name, ' ', e.last_name))) AS employee_name,
                f.comment AS feedback,
                f.rating,
                f.created_at
            FROM feedback f
            LEFT JOIN employees e ON e.id = f.to_employee_id
            ORDER BY f.created_at DESC
            `
        );

        return sendSuccess(res, result.rows, "Feedback fetched");
    } catch (error) {
        console.error("Get feedback error:", error);
        return sendError(res, "Internal server error", 500);
    }
});

module.exports = router;