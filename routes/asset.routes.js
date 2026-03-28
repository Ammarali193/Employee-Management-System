const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const { verifyToken, authorizeRoles } = require("../middlewares/auth.middleware");
const { logAction } = require("../middlewares/audit.middleware");
const { sendError, sendSuccess } = require("../controllers/apiResponse");

const ensureMaintenanceSchema = async () => {
    await pool.query(`
        ALTER TABLE asset_maintenance
        ADD COLUMN IF NOT EXISTS issue TEXT
    `);

    await pool.query(`
        ALTER TABLE asset_maintenance
        ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'Pending'
    `);

    await pool.query(`
        ALTER TABLE asset_maintenance
        ADD COLUMN IF NOT EXISTS date DATE DEFAULT CURRENT_DATE
    `);
};

// ==============================
// ADD NEW ASSET
// ==============================
router.post("/add", verifyToken, async (req, res) => {
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
// ASSIGN ASSET TO EMPLOYEE
// ==============================
router.post("/assign", verifyToken, async (req, res) => {
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
            `INSERT INTO audit_logs (user_name, action, module, details, created_at, tenant_id)
             VALUES ($1,$2,$3,$4, CURRENT_TIMESTAMP, $5)`,
            ["System", "Assigned Asset", "Asset", "Test Log", "default"]
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
            SET assigned_to = NULL,
                status = 'available'
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

// ADD MAINTENANCE RECORD
router.post("/maintenance", verifyToken, authorizeRoles("Admin"), async (req,res)=>{
    try{
        await ensureMaintenanceSchema();

        const { asset_id, issue, status, date } = req.body || {};

        if (!asset_id || !issue) {
            return sendError(res, "asset_id and issue are required", 400);
        }

        const normalizedStatus = String(status || "Pending").trim() || "Pending";
        const normalizedDate = date || new Date().toISOString().slice(0, 10);

        const result = await pool.query(`
        INSERT INTO asset_maintenance
        (asset_id, issue, status, date, service_date, notes)
        VALUES ($1,$2,$3,$4,$4,$2)
        RETURNING *
        `,[asset_id, issue, normalizedStatus, normalizedDate]);

        return sendSuccess(res, [result.rows[0]], "Maintenance record added", 201);

    }catch(error){
        console.error(error);
        return sendError(res, "Server error", 500);
    }
});

router.get("/maintenance", verifyToken, authorizeRoles("Admin", "HR", "Manager"), async (_req, res) => {
    try {
        await ensureMaintenanceSchema();

        const result = await pool.query(`
            SELECT
                am.id,
                am.asset_id,
                a.name AS asset_name,
                am.issue,
                am.status,
                am.date,
                am.created_at
            FROM asset_maintenance am
            LEFT JOIN assets a ON a.id = am.asset_id
            ORDER BY am.created_at DESC
        `);

        return sendSuccess(res, result.rows, "Maintenance records fetched");
    } catch (error) {
        console.error("Get maintenance error:", error);
        return sendError(res, "Server error", 500);
    }
});

router.put("/maintenance/:id/status", verifyToken, authorizeRoles("Admin", "HR", "Manager"), async (req, res) => {
    try {
        await ensureMaintenanceSchema();

        const normalizedStatus = String(req.body?.status || "").trim();

        if (!normalizedStatus || !["Pending", "Completed"].includes(normalizedStatus)) {
            return sendError(res, "status must be Pending or Completed", 400);
        }

        const updated = await pool.query(
            `
            UPDATE asset_maintenance
            SET status = $2
            WHERE id = $1
            RETURNING *
            `,
            [req.params.id, normalizedStatus]
        );

        if (!updated.rows.length) {
            return sendError(res, "Maintenance record not found", 404);
        }

        return sendSuccess(res, [updated.rows[0]], "Maintenance status updated");
    } catch (error) {
        console.error("Update maintenance status error:", error);
        return sendError(res, "Server error", 500);
    }
});

// ASSET USAGE REPORT
router.get("/report/usage", verifyToken, authorizeRoles("Admin"), async (req,res)=>{
    try{

        const result = await pool.query(`
        SELECT
        a.name,
        a.category AS asset_type,
        a.status,
        e.first_name,
        e.last_name
        FROM asset_assignments aa
        JOIN assets a ON aa.asset_id = a.id
        JOIN employees e ON aa.employee_id = e.id
        `);

        res.json({
            asset_usage:result.rows
        });

    }catch(error){
        console.error(error);
        res.status(500).json({message:"Server error"});
    }
});

// PENDING ASSET RETURNS REPORT
router.get("/report/pending", verifyToken, authorizeRoles("Admin"), async (req,res)=>{
    try{

        const result = await pool.query(`
        SELECT
        a.name,
        e.first_name,
        e.last_name,
        aa.assigned_date
        FROM asset_assignments aa
        JOIN assets a ON aa.asset_id = a.id
        JOIN employees e ON aa.employee_id = e.id
        WHERE aa.return_date IS NULL
        `);

        res.json({
            pending_returns:result.rows
        });

    }catch(error){
        console.error(error);
        res.status(500).json({message:"Server error"});
    }
});

module.exports = router;
