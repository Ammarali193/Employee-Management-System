const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const { verifyToken } = require("../middlewares/auth.middleware");

// ADD DOCUMENT
router.post("/add", verifyToken, async (req, res) => {
    try {
        const employee_id = req.user.id;
        const { document_type, file_url, expiry_date } = req.body;

        const result = await pool.query(
            `
            INSERT INTO employee_documents
            (employee_id, document_type, file_url, expiry_date)
            VALUES ($1,$2,$3,$4)
            RETURNING *
            `,
            [employee_id, document_type, file_url, expiry_date]
        );

        res.json({
            message: "Document uploaded",
            document: result.rows[0],
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

// GET MY DOCUMENTS
router.get("/my", verifyToken, async (req, res) => {
    try {
        const employee_id = req.user.id;

        const result = await pool.query(
            `
            SELECT *
            FROM employee_documents
            WHERE employee_id = $1
            `,
            [employee_id]
        );

        res.json({
            documents: result.rows,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

// ==============================
// DOCUMENTS EXPIRING SOON
// ==============================
router.get("/expiring", verifyToken, async (req, res) => {
    try {
        const result = await pool.query(
            `
            SELECT 
                ed.id,
                ed.document_type,
                ed.expiry_date,
                e.first_name,
                e.last_name
            FROM employee_documents ed
            JOIN employees e ON ed.employee_id = e.id
            WHERE ed.expiry_date <= CURRENT_DATE + INTERVAL '30 days'
            ORDER BY ed.expiry_date ASC
            `
        );

        res.json({
            expiring_documents: result.rows,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

// ==============================
// EXPIRED DOCUMENTS
// ==============================
router.get("/expired", verifyToken, async (req, res) => {
    try {
        const result = await pool.query(
            `
            SELECT 
                ed.id,
                ed.document_type,
                ed.expiry_date,
                e.first_name,
                e.last_name
            FROM employee_documents ed
            JOIN employees e ON ed.employee_id = e.id
            WHERE ed.expiry_date < CURRENT_DATE
            ORDER BY ed.expiry_date DESC
            `
        );

        res.json({
            expired_documents: result.rows,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
