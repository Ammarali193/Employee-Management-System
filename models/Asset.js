const pool = require("../config/db");

class Asset {
    static async ensureColumns() {
        await pool.query(`
            ALTER TABLE assets
            ADD COLUMN IF NOT EXISTS type VARCHAR(100);
        `);
    }

    static async create(payload) {
        await this.ensureColumns();

        const result = await pool.query(
            `
            INSERT INTO assets (name, type, assigned_to, status)
            VALUES ($1, $2, $3, $4)
            RETURNING *
            `,
            [payload.name, payload.type, payload.assigned_to, payload.status]
        );

        return result.rows[0];
    }

    static async findAll() {
        await this.ensureColumns();

        const result = await pool.query(
            `
            SELECT a.*, e.name AS assigned_employee_name
            FROM assets a
            LEFT JOIN employees e ON e.id = a.assigned_to
            ORDER BY a.id DESC
            `
        );

        return result.rows;
    }

    static async update(id, payload) {
        await this.ensureColumns();

        const result = await pool.query(
            `
            UPDATE assets
            SET
                name = COALESCE($2, name),
                type = COALESCE($3, type),
                assigned_to = COALESCE($4, assigned_to),
                status = COALESCE($5, status)
            WHERE id = $1
            RETURNING *
            `,
            [id, payload.name, payload.type, payload.assigned_to, payload.status]
        );

        return result.rows[0] || null;
    }

    static async remove(id) {
        const result = await pool.query(
            `DELETE FROM assets WHERE id = $1 RETURNING id`,
            [id]
        );

        return result.rows[0] || null;
    }
}

module.exports = Asset;
