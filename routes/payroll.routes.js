const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const { verifyToken, authorizeRoles } = require("../middlewares/auth.middleware");

// ==============================
// 🔹 ASSIGN BASIC SALARY (Admin Only)
// ==============================
router.post("/assign", verifyToken, authorizeRoles("Admin"), async (req, res) => {
    try {
        const { employee_id, basic_salary } = req.body;

        if (!employee_id || !basic_salary) {
            return res.status(400).json({
                message: "Employee ID and Basic Salary are required"
            });
        }

        const result = await pool.query(
            `
            INSERT INTO salaries (employee_id, basic_salary)
            VALUES ($1, $2)
            RETURNING *
            `,
            [employee_id, basic_salary]
        );

        res.status(201).json({
            message: "Salary assigned successfully",
            salary: result.rows[0]
        });

    } catch (error) {
        console.error("Assign salary error:", error);
        res.status(500).json({
            message: "Server error"
        });
    }
});

// ==============================
// 🔹 CALCULATE MONTHLY SALARY (With Leave Logic)
// ==============================
router.get("/monthly/:employeeId", verifyToken, authorizeRoles("Admin"), async (req, res) => {
    try {
        const { employeeId } = req.params;
        const { month, year } = req.query;

        if (!month || !year) {
            return res.status(400).json({
                message: "Month and year are required"
            });
        }

        // Get latest salary
        const salaryResult = await pool.query(
            `
            SELECT basic_salary
            FROM salaries
            WHERE employee_id = $1
            ORDER BY created_at DESC
            LIMIT 1
            `,
            [employeeId]
        );

        if (salaryResult.rows.length === 0) {
            return res.status(404).json({
                message: "Salary not assigned"
            });
        }

        const basicSalary = parseFloat(salaryResult.rows[0].basic_salary);
        const dailySalary = basicSalary / 30;

        // Get present days
        const attendanceResult = await pool.query(
            `
            SELECT COUNT(*) AS present_days
            FROM attendance
            WHERE employee_id = $1
            AND check_out IS NOT NULL
            AND EXTRACT(MONTH FROM check_in) = $2
            AND EXTRACT(YEAR FROM check_in) = $3
            `,
            [employeeId, month, year]
        );

        const presentDays = parseInt(attendanceResult.rows[0].present_days);

        // Get approved leave days
        const leaveResult = await pool.query(
            `
            SELECT
                SUM((end_date - start_date) + 1) AS leave_days
            FROM leave_requests
            WHERE employee_id = $1
            AND status = 'approved'
            AND EXTRACT(MONTH FROM start_date) = $2
            AND EXTRACT(YEAR FROM start_date) = $3
            `,
            [employeeId, month, year]
        );

        const leaveDays = parseInt(leaveResult.rows[0].leave_days) || 0;

        const paidDays = presentDays + leaveDays;
        const finalSalary = dailySalary * paidDays;

        res.json({
            employee_id: employeeId,
            month,
            year,
            basic_salary: basicSalary,
            present_days: presentDays,
            approved_leave_days: leaveDays,
            paid_days: paidDays,
            calculated_salary: finalSalary.toFixed(2)
        });

    } catch (error) {
        console.error("Salary calculation error:", error);
        res.status(500).json({
            message: "Server error"
        });
    }
});

// ==============================
// 🔹 GENERATE SALARY SLIP
// ==============================
router.get("/slip/:employeeId", verifyToken, authorizeRoles("Admin"), async (req, res) => {
    try {
        const { employeeId } = req.params;
        const { month, year } = req.query;

        if (!month || !year) {
            return res.status(400).json({
                message: "Month and year are required"
            });
        }

        // Get employee info
        const employeeResult = await pool.query(
            "SELECT first_name, last_name FROM employees WHERE id = $1",
            [employeeId]
        );

        if (employeeResult.rows.length === 0) {
            return res.status(404).json({
                message: "Employee not found"
            });
        }

        const employee = employeeResult.rows[0];

        // Reuse payroll logic
        const salaryResponse = await pool.query(
            `
            SELECT basic_salary
            FROM salaries
            WHERE employee_id = $1
            ORDER BY created_at DESC
            LIMIT 1
            `,
            [employeeId]
        );

        const basicSalary = parseFloat(salaryResponse.rows[0].basic_salary);
        const dailySalary = basicSalary / 30;

        const attendanceResult = await pool.query(
            `
            SELECT COUNT(*) AS present_days
            FROM attendance
            WHERE employee_id = $1
            AND check_out IS NOT NULL
            AND EXTRACT(MONTH FROM check_in) = $2
            AND EXTRACT(YEAR FROM check_in) = $3
            `,
            [employeeId, month, year]
        );

        const presentDays = parseInt(attendanceResult.rows[0].present_days);

        const leaveResult = await pool.query(
            `
            SELECT SUM((end_date - start_date) + 1) AS leave_days
            FROM leave_requests
            WHERE employee_id = $1
            AND status = 'approved'
            AND EXTRACT(MONTH FROM start_date) = $2
            AND EXTRACT(YEAR FROM start_date) = $3
            `,
            [employeeId, month, year]
        );

        const leaveDays = parseInt(leaveResult.rows[0].leave_days) || 0;

        const paidDays = presentDays + leaveDays;
        const finalSalary = dailySalary * paidDays;

        res.json({
            employee_name: `${employee.first_name} ${employee.last_name}`,
            month,
            year,
            basic_salary: basicSalary,
            present_days: presentDays,
            approved_leave_days: leaveDays,
            paid_days: paidDays,
            final_salary: finalSalary.toFixed(2),
            generated_at: new Date()
        });

    } catch (error) {
        console.error("Salary slip error:", error);
        res.status(500).json({
            message: "Server error"
        });
    }
});

module.exports = router;
