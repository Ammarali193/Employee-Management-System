const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const { verifyToken, authorizeRoles } = require("../middlewares/auth.middleware");


// ==============================
// SCHEDULE INTERVIEW (ADMIN / HR)
// ==============================
router.post("/schedule", verifyToken, authorizeRoles("Admin"), async (req, res) => {
    try {

        const { candidate_id, interview_date } = req.body;
        const interviewer_id = req.user.id;

        if (!candidate_id || !interview_date) {
            return res.status(400).json({
                message: "Candidate ID and interview date required"
            });
        }

        const result = await pool.query(
            `
            INSERT INTO interviews
            (candidate_id, interviewer_id, interview_date)
            VALUES ($1, $2, $3)
            RETURNING *
            `,
            [candidate_id, interviewer_id, interview_date]
        );

        res.status(201).json({
            message: "Interview scheduled successfully",
            interview: result.rows[0]
        });

    } catch (error) {
        console.error("Interview schedule error:", error);
        res.status(500).json({
            message: "Server error"
        });
    }
});


// ==============================
// GET ALL INTERVIEWS
// ==============================
router.get("/", verifyToken, async (req, res) => {
    try {

        const result = await pool.query(
            `
            SELECT 
                i.id,
                c.name AS candidate_name,
                e.first_name AS interviewer,
                i.interview_date,
                i.status
            FROM interviews i
            JOIN candidates c ON i.candidate_id = c.id
            JOIN employees e ON i.interviewer_id = e.id
            ORDER BY i.interview_date ASC
            `
        );

        res.json({
            interviews: result.rows
        });

    } catch (error) {
        console.error("Interview fetch error:", error);
        res.status(500).json({
            message: "Server error"
        });
    }
});

module.exports = router;
