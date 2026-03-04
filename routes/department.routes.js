const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const { verifyToken, authorizeRoles } = require("../middlewares/auth.middleware");


// ADD DEPARTMENT
router.post("/add", verifyToken, authorizeRoles("Admin"), async (req, res) => {
    try {

        const { name } = req.body;

        if (!name) {
            return res.status(400).json({ message: "Department name required" });
        }

        const result = await pool.query(
            `INSERT INTO departments (name) VALUES ($1) RETURNING *`,
            [name]
        );

        res.status(201).json({
            message: "Department created",
            department: result.rows[0]
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});


// GET ALL DEPARTMENTS
router.get("/", verifyToken, async (req, res) => {
    try {

        const result = await pool.query(
            `SELECT * FROM departments ORDER BY id ASC`
        );

        res.json({
            departments: result.rows
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
