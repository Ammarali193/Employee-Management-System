const Leave = require("../models/Leave");
const pool = require("../config/db");
const { sendError, sendSuccess } = require("./apiResponse");

const resolveTenantId = (req) => String(req.user?.tenant_id || "default");

const applyLeave = async (req, res) => {
    try {
        const { employee_id, leave_type, from_date, to_date } = req.body || {};

        if (!employee_id || !leave_type || !from_date || !to_date) {
            return sendError(res, "employee_id, leave_type, from_date, to_date are required", 400);
        }

        const created = await Leave.create({
            employee_id,
            leave_type,
            from_date,
            to_date,
            status: "Pending"
        });

        return sendSuccess(res, created, "Leave applied", 201);
    } catch (error) {
        console.error("Apply leave error:", error);
        return sendError(res, "Internal server error", 500);
    }
};

const getLeaves = async (_req, res) => {
    try {
        const rows = await Leave.findAll();
        return sendSuccess(res, rows, "Leaves fetched");
    } catch (error) {
        console.error("Get leaves error:", error);
        return sendError(res, "Internal server error", 500);
    }
};

const updateLeave = async (req, res) => {
    try {
        const { status } = req.body || {};

        if (!status || !["Approved", "Rejected", "Pending"].includes(status)) {
            return sendError(res, "status must be Approved, Rejected or Pending", 400);
        }

        const updated = await Leave.updateStatus(req.params.id, status);

        if (!updated) {
            return sendError(res, "Leave not found", 404);
        }

        if (status === "Approved") {
            await pool.query(`
                CREATE TABLE IF NOT EXISTS leave_balance (
                    id SERIAL PRIMARY KEY,
                    employee_id INTEGER REFERENCES employees(id) ON DELETE CASCADE,
                    total_leaves INTEGER DEFAULT 0,
                    used_leaves INTEGER DEFAULT 0,
                    remaining_leaves INTEGER DEFAULT 0,
                    tenant_id VARCHAR(100) DEFAULT 'default',
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE(employee_id, tenant_id)
                );
            `);

            const fromDate = new Date(updated.from_date);
            const toDate = new Date(updated.to_date);
            const leaveDays = Math.max(1, Math.ceil((toDate - fromDate) / (1000 * 60 * 60 * 24)) + 1);
            const tenantId = resolveTenantId(req);

            await pool.query(
                `
                INSERT INTO leave_balance (employee_id, total_leaves, used_leaves, remaining_leaves, tenant_id)
                VALUES ($1, 20, $2, GREATEST(20 - $2, 0), $3)
                ON CONFLICT (employee_id, tenant_id)
                DO UPDATE SET
                    used_leaves = leave_balance.used_leaves + $2,
                    remaining_leaves = GREATEST(leave_balance.total_leaves - (leave_balance.used_leaves + $2), 0),
                    updated_at = CURRENT_TIMESTAMP
                `,
                [updated.employee_id, leaveDays, tenantId]
            );
        }

        return sendSuccess(res, updated, "Leave updated");
    } catch (error) {
        console.error("Update leave error:", error);
        return sendError(res, "Internal server error", 500);
    }
};

module.exports = {
    applyLeave,
    getLeaves,
    updateLeave
};
