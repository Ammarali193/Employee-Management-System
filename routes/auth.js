const express = require("express");
const bcrypt = require("bcryptjs");

const router = express.Router();
const pool = require("../config/db");
const baseAuthRoutes = require("./auth.routes");

const splitName = (name) => {
    const parts = String(name || "").trim().split(/\s+/).filter(Boolean);

    return {
        firstName: parts[0] || "",
        lastName: parts.slice(1).join(" ") || "Admin"
    };
};

router.use(baseAuthRoutes);

router.post("/register-admin", async (req, res) => {
    try {
        const { name, email, password } = req.body || {};
        const parsedName = splitName(name);
        const tenantId = "default";
        const dbCheck = await pool.query("SELECT current_database()");

        console.log("DB:", dbCheck.rows);

        if (!parsedName.firstName || !email || !password) {
            return res.status(400).json({
                message: "name, email, and password are required"
            });
        }

        const existingAdmin = await pool.query(
            "SELECT id FROM employees WHERE email = $1",
            [email]
        );

        if (existingAdmin.rows.length > 0) {
            return res.status(400).json({
                message: "Email already exists"
            });
        }

        const hashed = await bcrypt.hash(password, 10);
        const result = await pool.query(
            `INSERT INTO employees (name, first_name, last_name, email, password, role, tenant_id)
             VALUES ($1, $2, $3, $4, $5, 'admin', $6)
             RETURNING id, name, first_name, last_name, email, role, tenant_id, status`,
            [
                `${parsedName.firstName} ${parsedName.lastName}`.trim(),
                parsedName.firstName,
                parsedName.lastName,
                email,
                hashed,
                tenantId
            ]
        );

        console.log("Inserted User:", result.rows);

        if (!result.rows.length) {
            throw new Error("Admin insert did not return any row");
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error("ERROR:", err.message);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
