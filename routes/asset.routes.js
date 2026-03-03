const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const { verifyToken, authorizeRoles } = require("../middlewares/auth.middleware");
const { logAction } = require("../middlewares/audit.middleware");

// ==============================
// ADD NEW ASSET (Admin Only)
// ==============================
router.post("/add", verifyToken, authorizeRoles("Admin"), async (req, res) => {
    try {
        const { name, category, serial_number } = req.body;

        if (!name) {
            return res.status(400).json({
                message: "Asset name is required"
            });
        }

        const result = await pool.query(
            `
            INSERT INTO assets (name, category, serial_number)
            VALUES ($1, $2, $3)
            RETURNING *
            `,
            [name, category, serial_number]
        );

        res.status(201).json({
            message: "Asset added successfully",
            asset: result.rows[0]
        });

    } catch (error) {
        console.error("Add asset error:", error);
        res.status(500).json({
            message: "Server error"
        });
    }
});

// ==============================
// ASSIGN ASSET TO EMPLOYEE (Admin Only)
// ==============================
router.post("/assign", verifyToken, authorizeRoles("Admin"), async (req, res) => {
    try {
        const { asset_id, employee_id } = req.body;

        if (!asset_id || !employee_id) {
            return res.status(400).json({
                message: "Asset ID and Employee ID are required"
            });
        }

        // Check if asset exists and is available
        const assetCheck = await pool.query(
            "SELECT * FROM assets WHERE id = $1 AND status = 'available'",
            [asset_id]
        );

        if (assetCheck.rows.length === 0) {
            return res.status(400).json({
                message: "Asset not available or does not exist"
            });
        }

        await pool.query(
            "INSERT INTO asset_assignments (asset_id, employee_id) VALUES ($1, $2)",
            [asset_id, employee_id]
        );

        await pool.query(
            "UPDATE assets SET status = 'assigned' WHERE id = $1",
            [asset_id]
        );

        // 🔥 IMPORTANT: Audit BEFORE res.json
        await pool.query(
            `INSERT INTO audit_logs (user_id, action, module, details)
             VALUES ($1,$2,$3,$4)`,
            [1, "Assigned Asset", "Asset Module", "Test Log"]
        );

        res.json({
            message: "Assigned + Logged"
        });

    } catch (error) {
        console.error("Assign asset error:", error);
        res.status(500).json({
            message: "Server error"
        });
    }
});

// ==============================
// RETURN ASSET (Admin Only)
// ==============================
router.post("/return", verifyToken, authorizeRoles("Admin"), async (req, res) => {
    try {
        const { asset_id, condition_notes } = req.body;

        if (!asset_id) {
            return res.status(400).json({
                message: "Asset ID is required"
            });
        }

        // Check if asset is assigned
        const checkAssignment = await pool.query(
            `
            SELECT * FROM asset_assignments
            WHERE asset_id = $1 AND return_date IS NULL
            `,
            [asset_id]
        );

        if (checkAssignment.rows.length === 0) {
            return res.status(400).json({
                message: "Asset is not currently assigned"
            });
        }

        // Update assignment record
        await pool.query(
            `
            UPDATE asset_assignments
            SET return_date = CURRENT_DATE,
                condition_notes = $1
            WHERE asset_id = $2 AND return_date IS NULL
            `,
            [condition_notes || null, asset_id]
        );

        // Update asset status
        await pool.query(
            `
            UPDATE assets
            SET status = 'available'
            WHERE id = $1
            `,
            [asset_id]
        );

        res.json({
            message: "Asset returned successfully"
        });

    } catch (error) {
        console.error("Return asset error:", error);
        res.status(500).json({
            message: "Server error"
        });
    }
});

module.exports = router;
