const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const { verifyToken, authorizeRoles } = require("../middlewares/auth.middleware");

router.post("/onboarding/start", verifyToken, authorizeRoles("Admin", "HR"), async (req, res) => {
    try {
        const { employee_id } = req.body;

        const result = await pool.query(`
        INSERT INTO onboarding (employee_id)
        VALUES ($1)
        RETURNING *
        `, [employee_id]);

        res.json({
            message: "Onboarding started",
            onboarding: result.rows[0]
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

router.put("/onboarding/update/:id", verifyToken, authorizeRoles("Admin", "HR"), async (req, res) => {
    try {
        const { documents_submitted, training_assigned, status } = req.body;

        const result = await pool.query(`
        UPDATE onboarding
        SET documents_submitted=$1,
            training_assigned=$2,
            status=$3
        WHERE id=$4
        RETURNING *
        `,
        [documents_submitted, training_assigned, status, req.params.id]);

        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

router.get("/report/onboarding-status", verifyToken, authorizeRoles("Admin", "HR"), async (req, res) => {
    try {
        const result = await pool.query(`
        SELECT 
        e.first_name,
        e.last_name,
        o.status,
        o.documents_submitted,
        o.training_assigned
        FROM onboarding o
        JOIN employees e ON o.employee_id = e.id
        `);

        res.json({
            onboarding_status: result.rows
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

router.get("/report/recruitment", verifyToken, authorizeRoles("Admin", "HR"), async (req, res) => {
    try {
        const result = await pool.query(`
        SELECT 
        status,
        COUNT(*) AS total_candidates
        FROM candidates
        GROUP BY status
        `);

        res.json({
            recruitment_pipeline: result.rows
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

router.get("/report/exit-reasons", verifyToken, authorizeRoles("Admin", "HR"), async (req, res) => {
    try {
        const result = await pool.query(`
        SELECT 
        reason,
        COUNT(*) AS total
        FROM exit_requests
        GROUP BY reason
        `);

        res.json({
            exit_reasons: result.rows
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
