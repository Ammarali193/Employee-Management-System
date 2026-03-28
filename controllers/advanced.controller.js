const multer = require("multer");
const path = require("path");
const pool = require("../config/db");
const { sendError, sendSuccess } = require("./apiResponse");

const resolveTenantId = (req) => String(req.user?.tenant_id || "default");

const uploadStorage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, path.join(process.cwd(), "uploads")),
    filename: (_req, file, cb) => {
        const timestamp = Date.now();
        const sanitized = String(file.originalname || "file").replace(/\s+/g, "-");
        cb(null, `${timestamp}-${sanitized}`);
    }
});

const upload = multer({ storage: uploadStorage });

const ensureAdvancedTables = async () => {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS tenants (
            id SERIAL PRIMARY KEY,
            name VARCHAR(150) NOT NULL,
            plan VARCHAR(100) DEFAULT 'Basic',
            status VARCHAR(50) DEFAULT 'Active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);

    await pool.query(`
        ALTER TABLE tenants
        ADD COLUMN IF NOT EXISTS plan VARCHAR(100) DEFAULT 'Basic';
    `);

    await pool.query(`
        ALTER TABLE tenants
        ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'Active';
    `);

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

    await pool.query(`
        ALTER TABLE shifts
        ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(100) DEFAULT 'default';
    `);

    await pool.query(`
        ALTER TABLE employee_shifts
        ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(100) DEFAULT 'default';
    `);

    await pool.query(`
        ALTER TABLE holidays
        ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(100) DEFAULT 'default';
    `);

    await pool.query(`
        ALTER TABLE holidays
        ADD COLUMN IF NOT EXISTS start_date DATE;
    `);

    await pool.query(`
        ALTER TABLE holidays
        ADD COLUMN IF NOT EXISTS end_date DATE;
    `);

    await pool.query(`
        ALTER TABLE holidays
        ADD COLUMN IF NOT EXISTS holiday_date DATE;
    `);

    await pool.query(`
        UPDATE holidays
        SET start_date = COALESCE(start_date, holiday_date),
            end_date = COALESCE(end_date, holiday_date)
        WHERE start_date IS NULL OR end_date IS NULL;
    `);

    await pool.query(`
        ALTER TABLE employee_documents
        ADD COLUMN IF NOT EXISTS document_name VARCHAR(200);
    `);

    await pool.query(`
        ALTER TABLE employee_documents
        ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(100) DEFAULT 'default';
    `);

    await pool.query(`
        ALTER TABLE employment_history
        ADD COLUMN IF NOT EXISTS change_date DATE;
    `);

    await pool.query(`
        ALTER TABLE employment_history
        ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(100) DEFAULT 'default';
    `);

    await pool.query(`
        ALTER TABLE audit_logs
        ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(100) DEFAULT 'default';
    `);

    await pool.query(`
        ALTER TABLE audit_logs
        ADD COLUMN IF NOT EXISTS user_name VARCHAR(255);
    `);

    await pool.query(`
        ALTER TABLE audit_logs
        ADD COLUMN IF NOT EXISTS module VARCHAR(100);
    `);

    await pool.query(`
        ALTER TABLE audit_logs
        ADD COLUMN IF NOT EXISTS details TEXT;
    `);

    await pool.query(`
        ALTER TABLE audit_logs
        ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    `);
};

const createShift = async (req, res) => {
    try {
        await ensureAdvancedTables();
        const { name, start_time, end_time } = req.body || {};

        if (!name || !start_time || !end_time) {
            return sendError(res, "name, start_time and end_time are required", 400);
        }

        const tenantId = resolveTenantId(req);
        const result = await pool.query(
            `
            INSERT INTO shifts (name, start_time, end_time, tenant_id)
            VALUES ($1, $2, $3, $4)
            RETURNING id, name, start_time, end_time
            `,
            [name, start_time, end_time, tenantId]
        );

        return sendSuccess(res, result.rows[0], "Shift created", 201);
    } catch (error) {
        console.error("Create shift error:", error);
        return sendError(res, "Internal server error", 500);
    }
};

const getShifts = async (req, res) => {
    try {
        await ensureAdvancedTables();
        const tenantId = resolveTenantId(req);

        const result = await pool.query(
            `
            SELECT id, name, start_time, end_time
            FROM shifts
            WHERE COALESCE(tenant_id, 'default') = $1
            ORDER BY id DESC
            `,
            [tenantId]
        );

        return sendSuccess(res, result.rows, "Shifts fetched");
    } catch (error) {
        console.error("Get shifts error:", error);
        return sendError(res, "Internal server error", 500);
    }
};

const assignShift = async (req, res) => {
    try {
        await ensureAdvancedTables();
        const { employee_id, shift_id } = req.body || {};

        if (!employee_id || !shift_id) {
            return sendError(res, "employee_id and shift_id are required", 400);
        }

        const tenantId = resolveTenantId(req);
        const result = await pool.query(
            `
            INSERT INTO employee_shifts (employee_id, shift_id, tenant_id)
            VALUES ($1, $2, $3)
            RETURNING id, employee_id, shift_id
            `,
            [employee_id, shift_id, tenantId]
        );

        return sendSuccess(res, result.rows[0], "Shift assigned", 201);
    } catch (error) {
        console.error("Assign shift error:", error);
        return sendError(res, "Internal server error", 500);
    }
};

const getShiftAssignments = async (req, res) => {
    try {
        await ensureAdvancedTables();
        const tenantId = resolveTenantId(req);

        const result = await pool.query(
            `
            SELECT
                es.id,
                es.employee_id,
                es.shift_id,
                e.name AS employee_name,
                s.name AS shift_name,
                s.start_time,
                s.end_time
            FROM employee_shifts es
            JOIN employees e ON e.id = es.employee_id
            JOIN shifts s ON s.id = es.shift_id
            WHERE COALESCE(es.tenant_id, 'default') = $1
            ORDER BY es.id DESC
            `,
            [tenantId]
        );

        return sendSuccess(res, result.rows, "Shift assignments fetched");
    } catch (error) {
        console.error("Get shift assignments error:", error);
        return sendError(res, "Internal server error", 500);
    }
};

const getLeaveBalance = async (req, res) => {
    try {
        await ensureAdvancedTables();
        const tenantId = resolveTenantId(req);

        const result = await pool.query(
            `
            SELECT
                lb.id,
                lb.employee_id,
                e.name AS employee_name,
                lb.total_leaves,
                lb.used_leaves,
                lb.remaining_leaves
            FROM leave_balance lb
            JOIN employees e ON e.id = lb.employee_id
            WHERE COALESCE(lb.tenant_id, 'default') = $1
            ORDER BY lb.employee_id ASC
            `,
            [tenantId]
        );

        return sendSuccess(res, result.rows, "Leave balance fetched");
    } catch (error) {
        console.error("Get leave balance error:", error);
        return sendError(res, "Internal server error", 500);
    }
};

const updateLeaveBalance = async (req, res) => {
    try {
        await ensureAdvancedTables();
        const { employee_id } = req.params;
        const { total_leaves, used_leaves } = req.body || {};
        const total = Number(total_leaves || 0);
        const used = Number(used_leaves || 0);

        if (Number.isNaN(total) || Number.isNaN(used)) {
            return sendError(res, "total_leaves and used_leaves must be numbers", 400);
        }

        const remaining = Math.max(0, total - used);
        const tenantId = resolveTenantId(req);

        const result = await pool.query(
            `
            INSERT INTO leave_balance (employee_id, total_leaves, used_leaves, remaining_leaves, tenant_id)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (employee_id, tenant_id)
            DO UPDATE SET
                total_leaves = EXCLUDED.total_leaves,
                used_leaves = EXCLUDED.used_leaves,
                remaining_leaves = EXCLUDED.remaining_leaves,
                updated_at = CURRENT_TIMESTAMP
            RETURNING id, employee_id, total_leaves, used_leaves, remaining_leaves
            `,
            [employee_id, total, used, remaining, tenantId]
        );

        return sendSuccess(res, result.rows[0], "Leave balance updated");
    } catch (error) {
        console.error("Update leave balance error:", error);
        return sendError(res, "Internal server error", 500);
    }
};

const createHoliday = async (req, res) => {
    try {
        await ensureAdvancedTables();
        const { name, start_date, end_date, date } = req.body || {};

        const normalizedName = String(name || "").trim();
        const normalizedStartDate = String(start_date || date || "").trim();
        const normalizedEndDate = String(end_date || start_date || date || "").trim();

        if (!normalizedName || !normalizedStartDate || !normalizedEndDate) {
            return sendError(res, "name, start_date and end_date are required", 400);
        }

        if (new Date(normalizedEndDate) < new Date(normalizedStartDate)) {
            return sendError(res, "end_date must be greater than or equal to start_date", 400);
        }

        const tenantId = resolveTenantId(req);
        const result = await pool.query(
            `
            INSERT INTO holidays (name, start_date, end_date, holiday_date, tenant_id)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, name, start_date, end_date
            `,
            [normalizedName, normalizedStartDate, normalizedEndDate, normalizedStartDate, tenantId]
        );

        const row = result.rows[0];
        return sendSuccess(
            res,
            {
                id: row.id,
                name: row.name,
                start_date: row.start_date,
                end_date: row.end_date
            },
            "Holiday created",
            201
        );
    } catch (error) {
        console.error("Create holiday error:", error);
        return sendError(res, "Internal server error", 500);
    }
};

const getHolidays = async (req, res) => {
    try {
        await ensureAdvancedTables();
        const tenantId = resolveTenantId(req);

        const result = await pool.query(
            `
            SELECT
                id,
                name,
                COALESCE(start_date, holiday_date) AS start_date,
                COALESCE(end_date, holiday_date) AS end_date
            FROM holidays
            WHERE COALESCE(tenant_id, 'default') = $1
            ORDER BY COALESCE(start_date, holiday_date) ASC
            `,
            [tenantId]
        );

        return sendSuccess(res, result.rows, "Holidays fetched");
    } catch (error) {
        console.error("Get holidays error:", error);
        return sendError(res, "Internal server error", 500);
    }
};

const createDocument = async (req, res) => {
    try {
        await ensureAdvancedTables();

        const employee_id = Number(req.body?.employee_id || req.user?.id);
        const document_name = req.body?.document_name || req.body?.document_type;
        const expiry_date = req.body?.expiry_date || null;
        const tenantId = resolveTenantId(req);

        let file_url = req.body?.file_url || null;

        if (req.file) {
            file_url = `/uploads/${req.file.filename}`;
        }

        if (!employee_id || !document_name || !file_url) {
            return sendError(res, "employee_id, document_name and file_url/file are required", 400);
        }

        const result = await pool.query(
            `
            INSERT INTO employee_documents (employee_id, document_type, document_name, file_url, expiry_date, tenant_id)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id, employee_id, document_name, file_url, expiry_date
            `,
            [employee_id, document_name, document_name, file_url, expiry_date, tenantId]
        );

        return sendSuccess(res, result.rows[0], "Document uploaded", 201);
    } catch (error) {
        console.error("Create document error:", error);
        return sendError(res, "Internal server error", 500);
    }
};

const getDocuments = async (req, res) => {
    try {
        await ensureAdvancedTables();
        const tenantId = resolveTenantId(req);

        const result = await pool.query(
            `
            SELECT
                d.id,
                d.employee_id,
                e.name AS employee_name,
                COALESCE(d.document_name, d.document_type) AS document_name,
                d.file_url,
                d.expiry_date,
                CASE
                    WHEN d.expiry_date IS NULL THEN FALSE
                    WHEN d.expiry_date <= CURRENT_DATE + INTERVAL '30 days' THEN TRUE
                    ELSE FALSE
                END AS is_expiring_soon
            FROM employee_documents d
            JOIN employees e ON e.id = d.employee_id
            WHERE COALESCE(d.tenant_id, 'default') = $1
            ORDER BY d.id DESC
            `,
            [tenantId]
        );

        return sendSuccess(res, result.rows, "Documents fetched");
    } catch (error) {
        console.error("Get documents error:", error);
        return sendError(res, "Internal server error", 500);
    }
};

const getEmploymentHistory = async (req, res) => {
    try {
        await ensureAdvancedTables();
        const employeeId = req.params.employee_id;
        const tenantId = resolveTenantId(req);

        const result = await pool.query(
            `
            SELECT
                id,
                employee_id,
                role,
                department,
                COALESCE(change_date, effective_date) AS change_date,
                change_type
            FROM employment_history
            WHERE employee_id = $1
              AND COALESCE(tenant_id, 'default') = $2
            ORDER BY COALESCE(change_date, effective_date) DESC
            `,
            [employeeId, tenantId]
        );

        return sendSuccess(res, result.rows, "Employment history fetched");
    } catch (error) {
        console.error("Get employment history error:", error);
        return sendError(res, "Internal server error", 500);
    }
};

const getAuditLogs = async (req, res) => {
    try {
        await ensureAdvancedTables();
        const tenantId = resolveTenantId(req);
        const moduleFilter = String(req.query?.module || "").trim();
        const userFilter = String(req.query?.user_name || "").trim();
        const actionFilter = String(req.query?.action || "").trim();

        const filters = ["tenant_id = $1"];
        const params = [tenantId];

        if (moduleFilter) {
            params.push(moduleFilter);
            filters.push(`module = $${params.length}`);
        }

        if (userFilter) {
            params.push(`%${userFilter}%`);
            filters.push(`user_name ILIKE $${params.length}`);
        }

        if (actionFilter) {
            params.push(`%${actionFilter}%`);
            filters.push(`action ILIKE $${params.length}`);
        }

        const result = await pool.query(
            `
            SELECT
                id,
                user_name,
                action,
                module,
                created_at AS timestamp,
                details
            FROM audit_logs
            WHERE ${filters.join(" AND ")}
            ORDER BY created_at DESC
            LIMIT 1000
            `,
            params
        );

        return sendSuccess(res, result.rows, "Audit logs fetched");
    } catch (error) {
        console.error("Get audit logs error:", error);
        return sendError(res, "Internal server error", 500);
    }
};

const createTenant = async (req, res) => {
    try {
        await ensureAdvancedTables();
        const { name, plan, status } = req.body || {};

        if (!name) {
            return sendError(res, "name is required", 400);
        }

        const result = await pool.query(
            `
            INSERT INTO tenants (name, plan, status)
            VALUES ($1, $2, $3)
            RETURNING id, name, plan, status
            `,
            [name, plan || "Basic", status || "Active"]
        );

        return sendSuccess(res, result.rows[0], "Tenant created", 201);
    } catch (error) {
        console.error("Create tenant error:", error);
        return sendError(res, "Internal server error", 500);
    }
};

const getTenants = async (_req, res) => {
    try {
        await ensureAdvancedTables();

        const result = await pool.query(
            `
            SELECT id, name, plan, status
            FROM tenants
            ORDER BY id DESC
            `
        );

        return sendSuccess(res, result.rows, "Tenants fetched");
    } catch (error) {
        console.error("Get tenants error:", error);
        return sendError(res, "Internal server error", 500);
    }
};

module.exports = {
    assignShift,
    createDocument,
    createHoliday,
    createShift,
    createTenant,
    getAuditLogs,
    getDocuments,
    getEmploymentHistory,
    getHolidays,
    getLeaveBalance,
    getShiftAssignments,
    getShifts,
    getTenants,
    updateLeaveBalance,
    upload
};
