const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const { verifyToken, authorizeRoles } = require("../middlewares/auth.middleware");

// ==============================
// 🔹 ADMIN DASHBOARD SUMMARY
// ==============================
router.get("/summary", verifyToken, authorizeRoles("Admin", "HR"), async (req, res) => {
    try {

        const totalEmployees = await pool.query(
            "SELECT COUNT(*) FROM employees"
        );

        const activeEmployees = await pool.query(
            "SELECT COUNT(*) FROM employees WHERE status = 'active'"
        );

        const totalAssets = await pool.query(
            "SELECT COUNT(*) FROM assets"
        );

        const assignedAssets = await pool.query(
            "SELECT COUNT(*) FROM assets WHERE status = 'assigned'"
        );

        const pendingLeaves = await pool.query(
            "SELECT COUNT(*) FROM leave_requests WHERE status = 'pending'"
        );

        const currentMonthAttendance = await pool.query(
            `
            SELECT COUNT(*) FROM attendance
            WHERE EXTRACT(MONTH FROM check_in) = EXTRACT(MONTH FROM CURRENT_DATE)
            AND EXTRACT(YEAR FROM check_in) = EXTRACT(YEAR FROM CURRENT_DATE)
            `
        );

        const totalSalaryExpense = await pool.query(
            `
            SELECT SUM(basic_salary) FROM salaries
            `
        );

        res.json({
            total_employees: parseInt(totalEmployees.rows[0].count),
            active_employees: parseInt(activeEmployees.rows[0].count),
            total_assets: parseInt(totalAssets.rows[0].count),
            assigned_assets: parseInt(assignedAssets.rows[0].count),
            pending_leave_requests: parseInt(pendingLeaves.rows[0].count),
            current_month_attendance_records: parseInt(currentMonthAttendance.rows[0].count),
            total_salary_structure: parseFloat(totalSalaryExpense.rows[0].sum) || 0
        });

    } catch (error) {
        console.error("Dashboard error:", error);
        res.status(500).json({
            message: "Server error"
        });
    }
});

module.exports = router;
