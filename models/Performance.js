const pool = require("../config/db");

class Performance {
    static async ensureTable() {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS performance_records (
                id SERIAL PRIMARY KEY,
                employee_id INTEGER REFERENCES employees(id) ON DELETE CASCADE,
                rating INTEGER CHECK (rating BETWEEN 1 AND 5),
                feedback TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
    }

    static async create(payload) {
        await this.ensureTable();

        const result = await pool.query(
            `
            INSERT INTO performance_records (employee_id, rating, feedback)
            VALUES ($1, $2, $3)
            RETURNING *
            `,
            [payload.employee_id, payload.rating, payload.feedback]
        );

        return result.rows[0];
    }

    static async findAll() {
        await this.ensureTable();

        const result = await pool.query(
            `
            SELECT p.*, e.name AS employee_name
            FROM performance_records p
            JOIN employees e ON e.id = p.employee_id
            ORDER BY p.id DESC
            `
        );

        return result.rows;
    }
}

module.exports = Performance;
