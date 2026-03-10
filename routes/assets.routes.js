const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const { verifyToken } = require("../middlewares/auth.middleware");
const assetManagementRoutes = require("./asset.routes");

router.get("/", verifyToken, async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM assets ORDER BY id DESC"
        );

        res.json({
            assets: result.rows
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

router.post("/assign", verifyToken, async (req, res) => {
    try {
        const { asset_id, employee_id } = req.body;

        if (!asset_id || !employee_id) {
            return res.status(400).json({ message: "Asset ID and Employee ID are required" });
        }

        const result = await pool.query(
            "UPDATE assets SET assigned_to=$1,status='assigned' WHERE id=$2",
            [employee_id, asset_id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Asset not found" });
        }

        await pool.query(
            `
            INSERT INTO asset_assignments (asset_id, employee_id)
            VALUES ($1, $2)
            `,
            [asset_id, employee_id]
        );

        res.json({ message: "Asset assigned successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

router.use("/", assetManagementRoutes);

module.exports = router;
