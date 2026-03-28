const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const router = express.Router();
const pool = require("../config/db");
const auth = require("../middleware/authMiddleware");
const { resolveTenantId } = require("../middlewares/auth.middleware");
const isAuthDebugEnabled = String(process.env.DEBUG_AUTH || "").trim().toLowerCase() === "true";

const debugAuthLog = (message, details = {}) => {
    if (!isAuthDebugEnabled) {
        return;
    }

    console.log(`[AUTH DEBUG] ${message}`, details);
};

const normalizeRole = (role) => String(role || "employee").trim().toLowerCase() || "employee";

const normalizeNullableText = (value) => {
    if (value === undefined || value === null) {
        return null;
    }

    const trimmed = String(value).trim();
    return trimmed === "" ? null : trimmed;
};

const splitEmployeeName = (name) => {
    const parts = String(name || "").trim().split(/\s+/).filter(Boolean);

    return {
        firstName: parts[0] || "",
        lastName: parts.slice(1).join(" ") || "User"
    };
};

const isBcryptHash = (value) => /^\$2[aby]\$\d{2}\$/.test(String(value || ""));

const resolveAvailableAuthTables = async () => {
    const result = await pool.query(
        `
        SELECT
            to_regclass('public.employees') AS employees_table,
            to_regclass('public.users') AS users_table
        `
    );

    const tables = [];

    if (result.rows[0]?.employees_table) {
        tables.push("employees");
    }

    if (result.rows[0]?.users_table) {
        tables.push("users");
    }

    return tables;
};

const findAuthUserByEmail = async (email) => {
    const normalizedEmail = String(email || "").trim();
    const authTables = await resolveAvailableAuthTables();

    debugAuthLog("Resolving auth user by email", {
        normalizedEmail,
        authTables
    });

    for (const authTable of authTables) {
        const result = await pool.query(
            `SELECT * FROM ${authTable} WHERE LOWER(BTRIM(email)) = LOWER(BTRIM($1)) LIMIT 1`,
            [normalizedEmail]
        );

        debugAuthLog("Auth lookup query completed", {
            authTable,
            rowCount: result.rows.length
        });

        if (result.rows.length > 0) {
            return {
                authTable,
                user: result.rows[0]
            };
        }
    }

    return {
        authTable: null,
        user: null
    };
};

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body || {};
        const normalizedEmail = String(email || "").trim();

        debugAuthLog("Login request received", {
            hasBody: Boolean(req.body),
            bodyKeys: Object.keys(req.body || {}),
            normalizedEmail,
            hasPassword: Boolean(password)
        });

        if (!normalizedEmail || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const { authTable, user: dbUser } = await findAuthUserByEmail(normalizedEmail);

        if (!dbUser) {
            debugAuthLog("No auth user found", { normalizedEmail });
            return res.status(400).json({ message: "User not found" });
        }

        let valid = false;

        debugAuthLog("Auth user found", {
            authTable,
            userId: dbUser.id,
            role: dbUser.role,
            passwordFormat: isBcryptHash(dbUser.password) ? "bcrypt" : "legacy"
        });

        if (isBcryptHash(dbUser.password)) {
            valid = await bcrypt.compare(password, dbUser.password);
        } else if (password === dbUser.password) {
            // Upgrade any legacy plain-text password record on first successful login.
            const upgradedPassword = await bcrypt.hash(password, 10);

            await pool.query(
                `UPDATE ${authTable}
                 SET password = $1
                 WHERE id = $2`,
                [upgradedPassword, dbUser.id]
            );

            valid = true;
        }

        debugAuthLog("Password verification finished", {
            userId: dbUser.id,
            valid
        });

        if (!valid) {
            return res.status(400).json({ message: "Wrong password" });
        }

        const normalizedRole = normalizeRole(dbUser.role);

        const token = jwt.sign(
            {
                id: dbUser.id,
                role: normalizedRole,
                tenant_id: dbUser.tenant_id || "default"
            },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        debugAuthLog("JWT generated", {
            userId: dbUser.id,
            role: normalizedRole,
            tenantId: dbUser.tenant_id || "default"
        });

        res.json({
            token,
            user: {
                id: dbUser.id,
                email: dbUser.email,
                name: dbUser.name,
                role: normalizedRole,
                tenant_id: dbUser.tenant_id || "default"
            }
        });
    } catch (err) {
        console.error("🔥 LOGIN ERROR:", err.message);
        res.status(500).json({ error: err.message });
    }
});

router.post("/create-hr", auth(["admin"]), async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const parsedName = splitEmployeeName(name);
        const tenantId = req.user?.tenant_id || resolveTenantId(req);
        const normalizedEmail = String(email || "").trim();

        if (!parsedName.firstName || !normalizedEmail || !password) {
            return res.status(400).json({
                message: "name, email, and password are required"
            });
        }

        const { user: existingHr } = await findAuthUserByEmail(normalizedEmail);

        if (existingHr) {
            return res.status(400).json({ message: "Email already exists" });
        }

        const hashed = await bcrypt.hash(password, 10);
        const result = await pool.query(
            `INSERT INTO employees (tenant_id, name, first_name, last_name, email, password, role)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING id, tenant_id, name, first_name, last_name, email, role, status`,
            [
                tenantId,
                `${parsedName.firstName} ${parsedName.lastName}`.trim(),
                parsedName.firstName,
                parsedName.lastName,
                normalizedEmail,
                hashed,
                "hr"
            ]
        );

        res.json(result.rows[0]);
    } catch (err) {
        console.error("🔥 CREATE-HR ERROR:", err.message);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
