const pool = require("../config/db");

class Compliance {
    static async ensureTable() {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS compliance_records (
                id SERIAL PRIMARY KEY,
                policy_name VARCHAR(200) NOT NULL,
                violation TEXT,
                action_taken TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
    }

    static async create(payload) {
        await this.ensureTable();

        const result = await pool.query(
            `
            INSERT INTO compliance_records (policy_name, violation, action_taken)
            VALUES ($1, $2, $3)
            RETURNING *
            `,
            [payload.policy_name, payload.violation, payload.action_taken]
        );

        return result.rows[0];
    }

    static async findAll() {
        await this.ensureTable();

        const result = await pool.query(
            `
            SELECT *
            FROM compliance_records
            ORDER BY id DESC
            `
        );

        return result.rows;
    }
}

module.exports = Compliance;
