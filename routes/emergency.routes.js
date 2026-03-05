const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const { verifyToken } = require("../middlewares/auth.middleware");

// ADD EMERGENCY CONTACT
router.post("/add", verifyToken, async (req, res) => {
    try {
        const employee_id = req.user.id;
        const { name, relationship, phone } = req.body;

        const result = await pool.query(
            `
            INSERT INTO emergency_contacts
            (employee_id, name, relationship, phone)
            VALUES ($1, $2, $3, $4)
            RETURNING *
            `,
            [employee_id, name, relationship, phone]
        );

        res.json({
            message: "Emergency contact added",
            contact: result.rows[0],
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

// GET MY EMERGENCY CONTACTS
router.get("/my", verifyToken, async (req, res) => {
    try {
        const employee_id = req.user.id;

        const result = await pool.query(
            `
            SELECT *
            FROM emergency_contacts
            WHERE employee_id = $1
            `,
            [employee_id]
        );

        res.json({
            contacts: result.rows,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
