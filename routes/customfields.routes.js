const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const { verifyToken } = require("../middlewares/auth.middleware");

// ADD CUSTOM FIELD
router.post("/add", verifyToken, async (req, res) => {
    try {
        const employee_id = req.user.id;
        const { field_name, field_value } = req.body;

        const result = await pool.query(
            `
            INSERT INTO employee_custom_fields
            (employee_id, field_name, field_value)
            VALUES ($1,$2,$3)
            RETURNING *
            `,
            [employee_id, field_name, field_value]
        );

        res.json({
            message: "Custom field added",
            field: result.rows[0],
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

// GET MY CUSTOM FIELDS
router.get("/my", verifyToken, async (req, res) => {
    try {
        const employee_id = req.user.id;

        const result = await pool.query(
            `
            SELECT *
            FROM employee_custom_fields
            WHERE employee_id = $1
            `,
            [employee_id]
        );

        res.json({
            custom_fields: result.rows,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
