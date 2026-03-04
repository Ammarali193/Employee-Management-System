const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const { verifyToken } = require("../middlewares/auth.middleware");


// GET EMPLOYEE LEAVE BALANCE
router.get("/my-balance", verifyToken, async (req, res) => {
    try {

        const employeeId = req.user.id;

        const result = await pool.query(
            `
            SELECT 
                lt.name AS leave_type,
                lb.total_leaves,
                lb.used_leaves,
                (lb.total_leaves - lb.used_leaves) AS remaining
            FROM leave_balances lb
            JOIN leave_types lt ON lb.leave_type_id = lt.id
            WHERE lb.employee_id = $1
            `,
            [employeeId]
        );

        res.json({
            leave_balances: result.rows
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
