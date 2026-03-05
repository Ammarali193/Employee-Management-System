const express = require("express");
const router = express.Router();
const pool = require("../config/db");

// device attendance endpoint
router.post("/attendance", async (req, res) => {
    try {
        const { device_id, employee_code, timestamp } = req.body;

        const employee = await pool.query(
            `
            SELECT id FROM employees
            WHERE device_employee_code = $1
            `,
            [employee_code]
        );

        if (employee.rows.length === 0) {
            return res.status(404).json({
                message: "Employee not found"
            });
        }

        const employee_id = employee.rows[0].id;

        const result = await pool.query(
            `
            INSERT INTO attendance
            (employee_id, check_in, method)
            VALUES ($1, $2, 'Device')
            RETURNING *
            `,
            [employee_id, timestamp]
        );

        res.json({
            message: "Attendance received from device",
            attendance: result.rows[0]
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
