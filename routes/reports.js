const express = require("express");
const router = express.Router();
const pool = require("../config/db");

router.get("/reports", async (req, res) => {
    try {
        const reports = await pool.query(
            "SELECT * FROM reports ORDER BY created_at DESC"
        );

        res.json(reports.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

router.post("/reports", async (req, res) => {
    try {
        const { title, category, status } = req.body;

        const newReport = await pool.query(
            "INSERT INTO reports (title, category, status) VALUES ($1,$2,$3) RETURNING *",
            [title, category, status]
        );

        res.json(newReport.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

router.get("/compliance/stats", async (req, res) => {
    try {
        const total = await pool.query("SELECT COUNT(*) FROM reports");
        const pending = await pool.query("SELECT COUNT(*) FROM reports WHERE status='pending'");
        const completed = await pool.query("SELECT COUNT(*) FROM reports WHERE status='completed'");

        res.json({
            total: total.rows[0].count,
            pending: pending.rows[0].count,
            completed: completed.rows[0].count
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
