const pool = require("../config/db");

class Attendance {
    static async ensureColumns() {
        await pool.query(`
            ALTER TABLE attendance
            ADD COLUMN IF NOT EXISTS date DATE;
        `);

        await pool.query(`
            ALTER TABLE attendance
            ADD COLUMN IF NOT EXISTS total_hours NUMERIC(6, 2) DEFAULT 0;
        `);

        await pool.query(`
            ALTER TABLE attendance
            ADD COLUMN IF NOT EXISTS overtime_hours NUMERIC(6, 2) DEFAULT 0;
        `);

        await pool.query(`
            ALTER TABLE attendance
            ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'Present';
        `);

        await pool.query(`
            ALTER TABLE attendance
            ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(100) DEFAULT 'default';
        `);
    }

    static async create(payload) {
        await this.ensureColumns();

        if (!payload?.employee_id) {
            throw new Error("employee_id is required");
        }

        if (!payload?.check_in) {
            throw new Error("check_in is required");
        }

        if (!payload?.check_out) {
            throw new Error("check_out is required");
        }

        const result = await pool.query(
            `
            INSERT INTO attendance
            (employee_id, date, check_in, check_out, total_hours, overtime_hours, status, tenant_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING id, employee_id, date, check_in, check_out, total_hours, overtime_hours, status
            `,
            [
                payload.employee_id,
                payload.date,
                payload.check_in,
                payload.check_out,
                payload.total_hours,
                payload.overtime_hours,
                payload.status,
                payload.tenant_id || "default"
            ]
        );

        return result.rows[0];
    }

    static async findAll(tenantId) {
        await this.ensureColumns();

        const values = [];
        let whereClause = "";

        if (tenantId) {
            values.push(tenantId);
            whereClause = `WHERE COALESCE(a.tenant_id, 'default') = $${values.length}`;
        }

        const result = await pool.query(
            `
            SELECT
                a.id,
                a.employee_id,
                COALESCE(NULLIF(e.name, ''), NULLIF(TRIM(CONCAT(COALESCE(e.first_name, ''), ' ', COALESCE(e.last_name, ''))), '')) AS employee_name,
                a.date,
                a.check_in,
                a.check_out,
                COALESCE(a.total_hours, 0) AS total_hours,
                COALESCE(a.overtime_hours, GREATEST(COALESCE(a.total_hours, 0) - 8, 0)) AS overtime_hours,
                a.status
            FROM attendance a
            JOIN employees e ON e.id = a.employee_id
            ${whereClause}
            ORDER BY COALESCE(a.date, DATE(a.check_in), CURRENT_DATE) DESC, a.id DESC
            `,
            values
        );

        return result.rows;
    }

    static async findReports(filters = {}) {
        await this.ensureColumns();

        const conditions = [];
        const values = [];

        if (filters.from) {
            values.push(filters.from);
            conditions.push(`COALESCE(a.date, DATE(a.check_in), DATE(a.created_at)) >= $${values.length}`);
        }

        if (filters.to) {
            values.push(filters.to);
            conditions.push(`COALESCE(a.date, DATE(a.check_in), DATE(a.created_at)) <= $${values.length}`);
        }

        if (filters.employeeId) {
            values.push(Number(filters.employeeId));
            conditions.push(`a.employee_id = $${values.length}`);
        }

        if (filters.tenantId) {
            values.push(filters.tenantId);
            conditions.push(`COALESCE(a.tenant_id, 'default') = $${values.length}`);
        }

        const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

        const query = `
            SELECT
                a.id,
                a.employee_id,
                COALESCE(NULLIF(e.name, ''), NULLIF(TRIM(CONCAT(COALESCE(e.first_name, ''), ' ', COALESCE(e.last_name, ''))), '')) AS employee_name,
                e.email AS employee_email,
                COALESCE(a.date, DATE(a.check_in), DATE(a.created_at)) AS attendance_date,
                a.check_in,
                a.check_out,
                CASE
                    WHEN a.check_in IS NOT NULL AND a.check_out IS NOT NULL THEN ROUND(EXTRACT(EPOCH FROM (a.check_out - a.check_in)) / 3600.0, 2)
                    ELSE 0
                END AS total_hours,
                COALESCE(a.overtime_hours, GREATEST(COALESCE(a.total_hours, 0) - 8, 0)) AS overtime_hours,
                CASE
                    WHEN a.check_in IS NULL THEN 'Absent'
                    WHEN a.check_in::time > TIME '09:00:00' THEN 'Late'
                    ELSE 'Present'
                END AS calculated_status
            FROM attendance a
            JOIN employees e ON e.id = a.employee_id
            ${whereClause}
            ORDER BY attendance_date DESC, a.id DESC
        `;

        const result = await pool.query(query, values);
        return result.rows;
    }
}

module.exports = Attendance;
