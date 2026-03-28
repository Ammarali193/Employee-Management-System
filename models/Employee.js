const pool = require("../config/db");

class Employee {
    static async findAll() {
        const result = await pool.query(
            `
            SELECT id, name, email, phone, department, role, join_date, status
            FROM employees
            ORDER BY id DESC
            `
        );

        return result.rows;
    }

    static async findById(id) {
        const result = await pool.query(
            `
            SELECT id, name, email, phone, department, role, join_date, status
            FROM employees
            WHERE id = $1
            LIMIT 1
            `,
            [id]
        );

        return result.rows[0] || null;
    }

    static async create(payload) {
        const result = await pool.query(
            `
            INSERT INTO employees
            (name, first_name, last_name, email, password, phone, department, role, join_date, status)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING id, name, email, phone, department, role, join_date, status
            `,
            [
                payload.name,
                payload.first_name,
                payload.last_name,
                payload.email,
                payload.password,
                payload.phone,
                payload.department,
                payload.role,
                payload.join_date,
                payload.status
            ]
        );

        return result.rows[0];
    }

    static async findByEmail(email) {
        const result = await pool.query(
            `
            SELECT id, name, email
            FROM employees
            WHERE email = $1
            LIMIT 1
            `,
            [email]
        );

        return result.rows[0] || null;
    }

    static async update(id, payload) {
        const result = await pool.query(
            `
            UPDATE employees
            SET
                name = COALESCE($2, name),
                email = COALESCE($3, email),
                phone = COALESCE($4, phone),
                department = COALESCE($5, department),
                role = COALESCE($6, role),
                join_date = COALESCE($7, join_date),
                status = COALESCE($8, status),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
            RETURNING id, name, email, phone, department, role, join_date, status
            `,
            [
                id,
                payload.name,
                payload.email,
                payload.phone,
                payload.department,
                payload.role,
                payload.join_date,
                payload.status
            ]
        );

        return result.rows[0] || null;
    }

    static async remove(id) {
        await pool.query("BEGIN");

        try {
            // Keep historical approvals while allowing employee deletion.
            await pool.query(
                `
                UPDATE loans
                SET approved_by = NULL
                WHERE approved_by = $1
                `,
                [id]
            );

            await pool.query(
                `
                UPDATE exit_requests
                SET approved_by = NULL
                WHERE approved_by = $1
                `,
                [id]
            );

            const result = await pool.query(
                `
                DELETE FROM employees
                WHERE id = $1
                RETURNING id
                `,
                [id]
            );

            await pool.query("COMMIT");
            return result.rows[0] || null;
        } catch (error) {
            await pool.query("ROLLBACK");
            throw error;
        }
    }
}

module.exports = Employee;
