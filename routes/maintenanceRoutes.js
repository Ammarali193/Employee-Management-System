const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const { verifyToken } = require("../middlewares/auth.middleware");
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

// GET all maintenance records
router.get("/maintenance", verifyToken, async (req, res) => {
  try {
    await ensureMaintenanceSchema();

    const data = await pool.query(`
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

    return sendSuccess(res, data.rows, "Maintenance fetched");
  } catch (error) {
    return sendError(res, "Server error", 500);
  }
});

// PUT update maintenance record
router.put("/maintenance/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const status = String(req.body?.status || "").trim();

    if (!status || !["Pending", "Completed"].includes(status)) {
      return sendError(res, "status must be Pending or Completed", 400);
    }

    await ensureMaintenanceSchema();

    const updated = await pool.query(
      `
      UPDATE asset_maintenance
      SET status = $2
      WHERE id = $1
      RETURNING *
      `,
      [id, status]
    );

    if (!updated.rows.length) {
      return sendError(res, "Maintenance record not found", 404);
    }

    return sendSuccess(res, [updated.rows[0]], "Updated successfully");
  } catch (error) {
    return sendError(res, "Update failed", 500);
  }
});

module.exports = router;
