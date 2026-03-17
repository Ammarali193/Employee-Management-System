const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const { verifyToken, authorizeRoles } = require("../middlewares/auth.middleware");

const createShift = async (req, res) => {
    const { name, start_time, end_time } = req.body;

    if (!name || !start_time || !end_time) {
        return res.status(400).json({ message: "Name, start time, and end time are required" });
    }

    try {
        const newShift = await pool.query(
            "INSERT INTO shifts(name,start_time,end_time) VALUES($1,$2,$3) RETURNING *",
            [name, start_time, end_time]
        );

        res.status(201).json({
            message: "Shift created successfully",
            shift: newShift.rows[0]
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

const createShiftAdmin = async (req, res) => {
    try {
        const { name, start_time, end_time } = req.body;

        if (!name || !start_time || !end_time) {
            return res.status(400).json({ message: "Name, start time, and end time are required" });
        }

        const result = await pool.query(
            `
            INSERT INTO shifts (name, start_time, end_time)
            VALUES ($1, $2, $3)
            RETURNING *
            `,
            [name, start_time, end_time]
        );

        res.json({
            message: "Shift created",
            shift: result.rows[0]
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

const getShifts = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT * FROM shifts
            ORDER BY id ASC
        `);

        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

const deleteShift = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            "DELETE FROM shifts WHERE id=$1 RETURNING id",
            [id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Shift not found" });
        }

        res.json({ message: "Shift deleted successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

const updateShift = async (req, res) => {
    const { id } = req.params;
    const { name, start_time, end_time } = req.body;

    if (!name || !start_time || !end_time) {
        return res.status(400).json({ message: "Name, start time, and end time are required" });
    }

    try {
        const result = await pool.query(
            "UPDATE shifts SET name=$1,start_time=$2,end_time=$3 WHERE id=$4 RETURNING *",
            [name, start_time, end_time, id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Shift not found" });
        }

        res.json({
            message: "Shift updated successfully",
            shift: result.rows[0]
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

const assignShift = async (req, res) => {
    try {
        const { employee_id, shift_id } = req.body;

        const result = await pool.query(
            `
            INSERT INTO employee_shifts (employee_id, shift_id)
            VALUES ($1, $2)
            RETURNING *
            `,
            [employee_id, shift_id]
        );

        res.json({
            message: "Shift assigned",
            assignment: result.rows[0]
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

router.post("/shifts", createShift);
router.get("/shifts", getShifts);
router.put("/shifts/:id", updateShift);
router.delete("/shifts/:id", deleteShift);

// CREATE SHIFT
router.post("/shifts/create", verifyToken, authorizeRoles("Admin"), createShiftAdmin);

// ASSIGN SHIFT TO EMPLOYEE
router.post("/shifts/assign", verifyToken, authorizeRoles("Admin"), assignShift);

module.exports = router;
