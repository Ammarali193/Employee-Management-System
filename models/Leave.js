const pool = require("../config/db");

class Leave {
    static async ensureTable() {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS leaves (
                id SERIAL PRIMARY KEY,
                employee_id INTEGER REFERENCES employees(id) ON DELETE CASCADE,
                leave_type VARCHAR(100) NOT NULL,
                from_date DATE NOT NULL,
                to_date DATE NOT NULL,
                status VARCHAR(20) DEFAULT 'Pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
    }

    static async create(payload) {
        await this.ensureTable();

        const result = await pool.query(
            `
            INSERT INTO leaves
            (employee_id, leave_type, from_date, to_date, status)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
            `,
            [
                payload.employee_id,
                payload.leave_type,
                payload.from_date,
                payload.to_date,
                payload.status
            ]
        );

        return result.rows[0];
    }

    static async findAll() {
        await this.ensureTable();

        const result = await pool.query(
            `
            SELECT l.*, e.name AS employee_name
            FROM leaves l
            JOIN employees e ON e.id = l.employee_id
            ORDER BY l.id DESC
            `
        );

        return result.rows;
    }

    static async updateStatus(id, status) {
        await this.ensureTable();

        const result = await pool.query(
            `
            UPDATE leaves
            SET status = $2
            WHERE id = $1
            RETURNING *
            `,
            [id, status]
        );

        return result.rows[0] || null;
    }
}

module.exports = Leave;
