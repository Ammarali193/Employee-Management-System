const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const { verifyToken, authorizeRoles } = require("../middlewares/auth.middleware");

// ADD EMPLOYMENT HISTORY
router.post("/add", verifyToken, authorizeRoles("Admin"), async (req, res) => {
    try {
        const { employee_id, role, department, change_type, effective_date } = req.body;

        const result = await pool.query(
            `
            INSERT INTO employment_history
            (employee_id, role, department, change_type, effective_date)
            VALUES ($1,$2,$3,$4,$5)
            RETURNING *
            `,
            [employee_id, role, department, change_type, effective_date]
        );

        res.json({
            message: "Employment history added",
            record: result.rows[0],
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

// GET EMPLOYEE HISTORY
router.get("/:employeeId", verifyToken, async (req, res) => {
    try {
        const { employeeId } = req.params;

        const result = await pool.query(
            `
            SELECT *
            FROM employment_history
            WHERE employee_id = $1
            ORDER BY effective_date DESC
            `,
            [employeeId]
        );

        res.json({
            history: result.rows,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
