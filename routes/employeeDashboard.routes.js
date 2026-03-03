const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const { verifyToken } = require("../middlewares/auth.middleware");

// ==============================
// 🔹 EMPLOYEE SELF DASHBOARD
// ==============================
router.get("/me", verifyToken, async (req, res) => {
    try {

        const employeeId = req.user.id;

        // 1️⃣ Profile
        const profile = await pool.query(
            `SELECT id, first_name, last_name, email, department, role, status
             FROM employees
             WHERE id = $1`,
            [employeeId]
        );

        // 2️⃣ Attendance (Current Month)
        const attendance = await pool.query(
            `
            SELECT COUNT(*) AS present_days
            FROM attendance
            WHERE employee_id = $1
            AND check_out IS NOT NULL
            AND EXTRACT(MONTH FROM check_in) = EXTRACT(MONTH FROM CURRENT_DATE)
            AND EXTRACT(YEAR FROM check_in) = EXTRACT(YEAR FROM CURRENT_DATE)
            `,
            [employeeId]
        );

        // 3️⃣ Leave Requests
        const leaves = await pool.query(
            `
            SELECT id, leave_type_id, start_date, end_date, status
            FROM leave_requests
            WHERE employee_id = $1
            ORDER BY applied_at DESC
            `,
            [employeeId]
        );

        // 4️⃣ Assigned Assets
        const assets = await pool.query(
            `
            SELECT a.id, a.name, a.category
            FROM assets a
            JOIN asset_assignments aa ON a.id = aa.asset_id
            WHERE aa.employee_id = $1
            AND aa.return_date IS NULL
            `,
            [employeeId]
        );

        // 5️⃣ Current Salary
        const salary = await pool.query(
            `
            SELECT basic_salary
            FROM salaries
            WHERE employee_id = $1
            ORDER BY created_at DESC
            LIMIT 1
            `,
            [employeeId]
        );

        res.json({
            profile: profile.rows[0],
            current_month_present_days: parseInt(attendance.rows[0].present_days),
            leave_requests: leaves.rows,
            assigned_assets: assets.rows,
            basic_salary: salary.rows.length > 0 ? salary.rows[0].basic_salary : null
        });

    } catch (error) {
        console.error("Employee dashboard error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
