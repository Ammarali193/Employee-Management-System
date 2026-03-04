const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const { verifyToken, authorizeRoles } = require("../middlewares/auth.middleware");

// ==============================
// 🔹 EMPLOYEE APPLY LOAN
// ==============================
router.post("/apply", verifyToken, async (req, res) => {
    try {

        const employeeId = req.user.id;
        const { amount, reason } = req.body;

        if (!amount) {
            return res.status(400).json({
                message: "Loan amount is required"
            });
        }

        const result = await pool.query(
            `
            INSERT INTO loans (employee_id, amount, reason)
            VALUES ($1, $2, $3)
            RETURNING *
            `,
            [employeeId, amount, reason]
        );

        res.status(201).json({
            message: "Loan request submitted",
            loan: result.rows[0]
        });

    } catch (error) {
        console.error("Loan apply error:", error);
        res.status(500).json({
            message: "Server error"
        });
    }
});

// ==============================
// 🔹 ADMIN APPROVE / REJECT LOAN
// ==============================
router.put("/approve/:loanId", verifyToken, authorizeRoles("Admin"), async (req, res) => {
    try {

        const { loanId } = req.params;
        const { status } = req.body;

        if (!["approved", "rejected"].includes(status)) {
            return res.status(400).json({
                message: "Status must be approved or rejected"
            });
        }

        const result = await pool.query(
            `
            UPDATE loans
            SET status = $1,
                approved_by = $2
            WHERE id = $3
            RETURNING *
            `,
            [status, req.user.id, loanId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Loan request not found"
            });
        }

        res.json({
            message: `Loan ${status} successfully`,
            loan: result.rows[0]
        });

    } catch (error) {
        console.error("Loan approval error:", error);
        res.status(500).json({
            message: "Server error"
        });
    }
});

// ==============================
// 🔹 GET EMPLOYEE LOANS
// ==============================
router.get("/my-loans", verifyToken, async (req, res) => {
    try {

        const employeeId = req.user.id;

        const result = await pool.query(
            `
            SELECT *
            FROM loans
            WHERE employee_id = $1
            ORDER BY applied_at DESC
            `,
            [employeeId]
        );

        res.json({
            loans: result.rows
        });

    } catch (error) {
        console.error("Loan fetch error:", error);
        res.status(500).json({
            message: "Server error"
        });
    }
});

module.exports = router;
