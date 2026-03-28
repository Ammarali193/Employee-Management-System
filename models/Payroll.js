const pool = require("../config/db");

class Payroll {
    static async ensureTable() {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS payrolls (
                id SERIAL PRIMARY KEY,
                employee_id INTEGER REFERENCES employees(id) ON DELETE CASCADE,
                basic_salary NUMERIC(12,2) NOT NULL,
                deductions NUMERIC(12,2) DEFAULT 0,
                net_salary NUMERIC(12,2) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
    }

    static async create(payload) {
        await this.ensureTable();

        const result = await pool.query(
            `
            INSERT INTO payrolls
            (employee_id, basic_salary, deductions, net_salary)
            VALUES ($1, $2, $3, $4)
            RETURNING *
            `,
            [payload.employee_id, payload.basic_salary, payload.deductions, payload.net_salary]
        );

        return result.rows[0];
    }

    static async findAll() {
        await this.ensureTable();

        const result = await pool.query(
            `
            SELECT p.*, e.name AS employee_name
            FROM payrolls p
            JOIN employees e ON e.id = p.employee_id
            ORDER BY p.id DESC
            `
        );

        return result.rows;
    }
}

module.exports = Payroll;
