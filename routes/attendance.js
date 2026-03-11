const express = require("express");

const router = express.Router();
const pool = require("../config/db");

// GET all attendance
router.get("/", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                a.id,
                e.name AS employee_name,
                a.check_in,
                a.check_out,
                a.status
            FROM attendance a
            JOIN employees e
                ON a.employee_id = e.id
            ORDER BY a.check_in DESC
        `);

        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

router.get("/reports", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                e.id AS employee_id,
                e.name AS employee_name,
                COUNT(CASE WHEN a.status = 'Present' THEN 1 END) AS present,
                COUNT(CASE WHEN a.status = 'Absent' THEN 1 END) AS absent,
                COALESCE(
                    SUM(EXTRACT(EPOCH FROM (a.check_out - a.check_in)) / 3600),
                    0
                ) AS hours
            FROM attendance a
            JOIN employees e
                ON a.employee_id = e.id
            GROUP BY e.id, e.name
        `);

        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
