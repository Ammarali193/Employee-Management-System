const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");
const { sendError, sendSuccess } = require("./apiResponse");

const normalizeRole = (role) => String(role || "Employee").trim().toLowerCase() || "employee";

const login = async (req, res) => {
    try {
        const { email, password } = req.body || {};

        if (!email || !password) {
            return sendError(res, "email and password are required", 400);
        }

        const result = await pool.query(
            `
            SELECT id, name, email, password, role, tenant_id
            FROM employees
            WHERE LOWER(email) = LOWER($1)
            LIMIT 1
            `,
            [String(email).trim()]
        );

        const user = result.rows[0];

        if (!user) {
            return sendError(res, "Invalid credentials", 401);
        }

        const isValid = await bcrypt.compare(String(password), user.password);

        if (!isValid) {
            return sendError(res, "Invalid credentials", 401);
        }

        const normalizedRole = normalizeRole(user.role);

        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                role: normalizedRole,
                tenant_id: user.tenant_id || "default"
            },
            process.env.JWT_SECRET || "secretkey",
            { expiresIn: "8h" }
        );

        return sendSuccess(
            res,
            {
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: normalizedRole,
                    tenant_id: user.tenant_id || "default"
                }
            },
            "Login successful"
        );
    } catch (error) {
        console.error("Auth login error:", error);
        return sendError(res, "Internal server error", 500);
    }
};

module.exports = {
    login
};
