const express = require("express");
const bcrypt = require("bcryptjs");

const router = express.Router();
const pool = require("../config/db");
const auth = require("../middleware/authMiddleware");
const { verifyToken, authorizeRoles, resolveTenantId } = require("../middlewares/auth.middleware");

const hasOwn = (object, key) => Object.prototype.hasOwnProperty.call(object, key);

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
        lastName: parts.slice(1).join(" "),
        hasLastName: parts.length > 1
    };
};

const parseOptionalBoolean = (value) => {
    if (value === undefined || value === null || value === "") {
        return undefined;
    }

    if (typeof value === "boolean") {
        return value;
    }

    if (typeof value === "string") {
        const normalized = value.trim().toLowerCase();

        if (normalized === "true") {
            return true;
        }

        if (normalized === "false") {
            return false;
        }
    }

    if (typeof value === "number") {
        return value !== 0;
    }

    return undefined;
};

const parseOptionalDate = (value) => {
    if (value === undefined || value === null || value === "") {
        return null;
    }

    const parsedDate = value instanceof Date ? value : new Date(value);

    if (Number.isNaN(parsedDate.getTime())) {
        return undefined;
    }

    return parsedDate;
};

const resolveEmployeeWorkArrangement = (payload = {}, options = {}) => {
    const fallback = options.fallback || {};
    const requireWorkType = options.requireWorkType || false;
    const normalizedWorkType = normalizeNullableText(
        payload.workType ?? payload.work_type ?? fallback.workType
    );
    const normalizedShiftType = normalizeNullableText(
        payload.selectedShift ??
        payload.shiftType ??
        payload.shift_type ??
        fallback.shiftType
    );
    const emergencyInput =
        payload.isEmergency ??
        payload.isEmergencyRemote ??
        payload.is_emergency_remote ??
        fallback.isEmergencyRemote;
    const emergencyDateInput =
        payload.emergencyEndDate ??
        payload.emergency_end_date ??
        fallback.emergencyEndDate;
    const hasLogicSpecificInput =
        payload.selectedShift !== undefined ||
        payload.shiftType !== undefined ||
        payload.shift_type !== undefined ||
        payload.isEmergency !== undefined ||
        payload.isEmergencyRemote !== undefined ||
        payload.is_emergency_remote !== undefined ||
        payload.emergencyEndDate !== undefined ||
        payload.emergency_end_date !== undefined;

    const parsedAllowRemote = parseOptionalBoolean(payload.allowRemote ?? payload.allow_remote);

    if (
        (payload.allowRemote !== undefined || payload.allow_remote !== undefined) &&
        parsedAllowRemote === undefined
    ) {
        return { error: "allow_remote must be true or false" };
    }

    const parsedEmergencyFlag = parseOptionalBoolean(emergencyInput);

    if (
        (payload.isEmergency !== undefined ||
            payload.isEmergencyRemote !== undefined ||
            payload.is_emergency_remote !== undefined) &&
        parsedEmergencyFlag === undefined
    ) {
        return { error: "isEmergency must be true or false" };
    }

    const parsedEmergencyEndDate = parseOptionalDate(emergencyDateInput);

    if (
        emergencyDateInput !== undefined &&
        emergencyDateInput !== null &&
        emergencyDateInput !== "" &&
        parsedEmergencyEndDate === undefined
    ) {
        return { error: "emergencyEndDate must be a valid date" };
    }

    if (!normalizedWorkType) {
        if (requireWorkType || hasLogicSpecificInput) {
            return { error: "workType is required" };
        }

        return {
            workType: null,
            shiftType: null,
            allowRemote: parsedAllowRemote ?? Boolean(fallback.allowRemote),
            isEmergencyRemote: parsedEmergencyFlag ?? Boolean(fallback.isEmergencyRemote),
            emergencyEndDate: parsedEmergencyEndDate ?? fallback.emergencyEndDate ?? null
        };
    }

    const resolvedWorkType = normalizedWorkType.toLowerCase();

    if (!["remote", "office"].includes(resolvedWorkType)) {
        return { error: "workType must be remote or office" };
    }

    const requestedShiftType = normalizedShiftType ? normalizedShiftType.toLowerCase() : null;

    if (requestedShiftType && !["remote", "office"].includes(requestedShiftType)) {
        return { error: "selectedShift must be remote or office" };
    }

    const resolvedIsEmergencyRemote = parsedEmergencyFlag ?? Boolean(fallback.isEmergencyRemote);
    const resolvedEmergencyEndDate = parsedEmergencyEndDate ?? null;
    let resolvedShiftType;

    if (resolvedWorkType === "remote") {
        resolvedShiftType = requestedShiftType || "remote";
    } else {
        resolvedShiftType = "office";

        if (requestedShiftType === "remote") {
            if (!resolvedIsEmergencyRemote || !resolvedEmergencyEndDate) {
                return { error: "Remote only allowed in emergency with end date" };
            }

            resolvedShiftType = "remote";
        }
    }

    return {
        workType: resolvedWorkType,
        shiftType: resolvedShiftType,
        allowRemote: resolvedWorkType === "remote" || resolvedShiftType === "remote",
        isEmergencyRemote: resolvedIsEmergencyRemote,
        emergencyEndDate: resolvedEmergencyEndDate
    };
};

const getTenantId = (req) => resolveTenantId(req);

router.get("/employees", auth(["admin", "hr"]), async (req, res) => {
    try {
        const tenantId = getTenantId(req);
        const employees = await pool.query(`
            SELECT
                e.id,
                COALESCE(NULLIF(e.name, ''), TRIM(CONCAT(e.first_name, ' ', e.last_name))) AS name,
                e.email,
                e.role,
                e.department,
                e.shift,
                e.work_type,
                e.shift_type,
                e.allow_remote,
                e.is_emergency_remote,
                e.emergency_end_date,
                e.tenant_id,
                s.basic_salary AS salary,
                e.status,
                e.created_at,
                e.updated_at
            FROM employees e
            LEFT JOIN LATERAL (
                SELECT basic_salary
                FROM salaries
                WHERE employee_id = e.id
                ORDER BY created_at DESC
                LIMIT 1
            ) s ON true
            WHERE e.tenant_id = $1
            ORDER BY e.id DESC
        `, [tenantId]);

        res.json(employees.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

const createEmployeeHandler = async (req, res) => {
    let client;

    try {
        client = await pool.connect();
        const {
            first_name,
            last_name,
            name,
            email,
            password,
            role,
            department,
            salary,
            shift,
            workType,
            work_type,
            selectedShift,
            shiftType,
            allowRemote,
            allow_remote,
            isEmergency,
            isEmergencyRemote,
            emergencyEndDate,
            emergency_end_date
        } = req.body;

        const fallbackNameParts = String(name || "").trim().split(/\s+/).filter(Boolean);
        const resolvedFirstName = (first_name || fallbackNameParts[0] || "").trim();
        const resolvedLastName = (last_name || fallbackNameParts.slice(1).join(" ") || "-").trim();
        const fullName = `${resolvedFirstName} ${resolvedLastName}`.trim();
        const scheduleShift = normalizeNullableText(shift);
        const tenantId = getTenantId(req);
        const workArrangement = resolveEmployeeWorkArrangement(
            {
                workType,
                work_type,
                selectedShift,
                shiftType,
                allowRemote,
                allow_remote,
                isEmergency,
                isEmergencyRemote,
                emergencyEndDate,
                emergency_end_date
            }
        );

        if (!resolvedFirstName || !email || !password) {
            return res.status(400).json({ error: "name or first_name, email, and password are required" });
        }

        if (workArrangement.error) {
            return res.status(400).json({ error: workArrangement.error });
        }

        await client.query("BEGIN");

        const existingEmployee = await client.query(
            "SELECT id FROM employees WHERE email = $1",
            [email]
        );

        if (existingEmployee.rows.length > 0) {
            await client.query("ROLLBACK");
            return res.status(400).json({ error: "Email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newEmployee = await client.query(
            `INSERT INTO employees (name, first_name, last_name, email, password, role, department, shift, work_type, shift_type, allow_remote, is_emergency_remote, emergency_end_date, tenant_id)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
             RETURNING id, name, first_name, last_name, email, role, department, shift, work_type, shift_type, allow_remote, is_emergency_remote, emergency_end_date, tenant_id, status, created_at, updated_at`,
            [
                fullName,
                resolvedFirstName,
                resolvedLastName,
                email,
                hashedPassword,
                role || "Employee",
                department || null,
                scheduleShift,
                workArrangement.workType,
                workArrangement.shiftType,
                workArrangement.allowRemote,
                workArrangement.isEmergencyRemote,
                workArrangement.emergencyEndDate,
                tenantId
            ]
        );

        let salaryAmount = null;

        if (salary !== undefined && salary !== null && salary !== "") {
            const salaryResult = await client.query(
                `INSERT INTO salaries (employee_id, basic_salary)
                 VALUES ($1, $2)
                 RETURNING basic_salary`,
                [newEmployee.rows[0].id, salary]
            );

            salaryAmount = salaryResult.rows[0].basic_salary;
        }

        await client.query("COMMIT");

        res.json({
            message: "Employee created successfully",
            employee: {
                id: newEmployee.rows[0].id,
                name: newEmployee.rows[0].name,
                email: newEmployee.rows[0].email,
                role: newEmployee.rows[0].role,
                department: newEmployee.rows[0].department,
                shift: newEmployee.rows[0].shift,
                work_type: newEmployee.rows[0].work_type,
                shift_type: newEmployee.rows[0].shift_type,
                allow_remote: newEmployee.rows[0].allow_remote,
                is_emergency_remote: newEmployee.rows[0].is_emergency_remote,
                emergency_end_date: newEmployee.rows[0].emergency_end_date,
                tenant_id: newEmployee.rows[0].tenant_id,
                salary: salaryAmount,
                status: newEmployee.rows[0].status,
                created_at: newEmployee.rows[0].created_at,
                updated_at: newEmployee.rows[0].updated_at
            }
        });
    } catch (err) {
        if (client) {
            try {
                await client.query("ROLLBACK");
            } catch (rollbackError) {
                console.error(rollbackError);
            }
        }

        console.error(err);
        res.status(500).json({ error: "Server error" });
    } finally {
        if (client) {
            client.release();
        }
    }
};

router.post("/add-employee", auth(["admin", "hr"]), createEmployeeHandler);
router.post("/employees", auth(["admin", "hr"]), createEmployeeHandler);

router.put("/employees/:id", verifyToken, authorizeRoles("Admin", "HR"), async (req, res) => {
    let client;

    try {
        client = await pool.connect();
        const { id } = req.params;
        const payload = req.body || {};
        const {
            first_name,
            last_name,
            name,
            email,
            department,
            password,
            role,
            status,
            salary,
            shift,
            workType,
            work_type,
            selectedShift,
            shiftType,
            shift_type,
            allowRemote,
            allow_remote,
            isEmergency,
            isEmergencyRemote,
            is_emergency_remote,
            emergencyEndDate,
            emergency_end_date
        } = payload;
        const tenantId = getTenantId(req);

        await client.query("BEGIN");

        const existingEmployee = await client.query(
            `SELECT id, first_name, last_name, email, department, shift, work_type, shift_type, allow_remote, is_emergency_remote, emergency_end_date, role, status, tenant_id
             FROM employees
             WHERE id = $1 AND tenant_id = $2`,
            [id, tenantId]
        );

        if (existingEmployee.rows.length === 0) {
            await client.query("ROLLBACK");
            return res.status(404).json({ message: "Employee not found" });
        }

        const currentEmployee = existingEmployee.rows[0];
        const parsedName = normalizeNullableText(name)
            ? splitEmployeeName(name)
            : null;
        const resolvedFirstName =
            normalizeNullableText(first_name) ||
            parsedName?.firstName ||
            currentEmployee.first_name;
        const resolvedLastName =
            normalizeNullableText(last_name) ||
            (parsedName?.hasLastName ? parsedName.lastName : null) ||
            currentEmployee.last_name ||
            "-";
        const resolvedEmail =
            normalizeNullableText(email) ||
            currentEmployee.email;
        const resolvedDepartment = hasOwn(payload, "department")
            ? normalizeNullableText(department)
            : currentEmployee.department;
        const resolvedShift = hasOwn(payload, "shift")
            ? normalizeNullableText(shift)
            : currentEmployee.shift;
        const resolvedRole =
            normalizeNullableText(role) ||
            currentEmployee.role;
        const resolvedStatus =
            normalizeNullableText(status) ||
            currentEmployee.status;

        if (!resolvedFirstName || !resolvedEmail) {
            await client.query("ROLLBACK");
            return res.status(400).json({ error: "Employee first name and email are required" });
        }

        const workArrangement = resolveEmployeeWorkArrangement(
            {
                workType,
                work_type,
                selectedShift,
                shiftType,
                shift_type,
                allowRemote,
                allow_remote,
                isEmergency,
                isEmergencyRemote,
                is_emergency_remote,
                emergencyEndDate,
                emergency_end_date
            },
            {
                fallback: {
                    workType: currentEmployee.work_type,
                    shiftType: currentEmployee.shift_type,
                    allowRemote: currentEmployee.allow_remote,
                    isEmergencyRemote: currentEmployee.is_emergency_remote,
                    emergencyEndDate: currentEmployee.emergency_end_date
                }
            }
        );

        if (workArrangement.error) {
            await client.query("ROLLBACK");
            return res.status(400).json({ error: workArrangement.error });
        }

        const duplicateEmployee = await client.query(
            "SELECT id FROM employees WHERE email = $1 AND id <> $2",
            [resolvedEmail, id]
        );

        if (duplicateEmployee.rows.length > 0) {
            await client.query("ROLLBACK");
            return res.status(400).json({ error: "Email already exists" });
        }

        let hashedPassword = null;
        const normalizedPassword = normalizeNullableText(password);

        if (normalizedPassword) {
            hashedPassword = await bcrypt.hash(normalizedPassword, 10);
        }

        const updatedEmployee = await client.query(
            `UPDATE employees
             SET name = $1,
                 first_name = $2,
                 last_name = $3,
                 email = $4,
                 department = $5,
                 shift = $6,
                 work_type = $7,
                 shift_type = $8,
                 allow_remote = $9,
                 is_emergency_remote = $10,
                 emergency_end_date = $11,
                 role = $12,
                 status = $13,
                 password = COALESCE($14, password),
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $15 AND tenant_id = $16
             RETURNING id, name, first_name, last_name, email, department, shift, work_type, shift_type, allow_remote, is_emergency_remote, emergency_end_date, tenant_id, role, status, updated_at`,
            [
                `${resolvedFirstName} ${resolvedLastName}`.trim(),
                resolvedFirstName,
                resolvedLastName,
                resolvedEmail,
                resolvedDepartment,
                resolvedShift,
                workArrangement.workType,
                workArrangement.shiftType,
                workArrangement.allowRemote,
                workArrangement.isEmergencyRemote,
                workArrangement.emergencyEndDate,
                resolvedRole,
                resolvedStatus,
                hashedPassword,
                id,
                tenantId
            ]
        );

        let latestSalary = null;
        const normalizedSalary = normalizeNullableText(salary);

        if (hasOwn(payload, "salary") && normalizedSalary !== null) {
            const parsedSalary = Number(normalizedSalary);

            if (!Number.isFinite(parsedSalary)) {
                await client.query("ROLLBACK");
                return res.status(400).json({ error: "salary must be a valid number" });
            }

            const salaryResult = await client.query(
                `INSERT INTO salaries (employee_id, basic_salary)
                 VALUES ($1, $2)
                 RETURNING basic_salary`,
                [id, parsedSalary]
            );

            latestSalary = salaryResult.rows[0].basic_salary;
        } else {
            const salaryResult = await client.query(
                `SELECT basic_salary
                 FROM salaries
                 WHERE employee_id = $1
                 ORDER BY created_at DESC
                 LIMIT 1`,
                [id]
            );

            latestSalary = salaryResult.rows[0]?.basic_salary ?? null;
        }

        await client.query("COMMIT");

        res.json({
            message: "Employee updated",
            employee: {
                ...updatedEmployee.rows[0],
                salary: latestSalary
            }
        });
    } catch (err) {
        if (client) {
            try {
                await client.query("ROLLBACK");
            } catch (rollbackError) {
                console.error(rollbackError);
            }
        }

        console.error(err);
        res.status(500).json({ error: "Server error" });
    } finally {
        if (client) {
            client.release();
        }
    }
});

router.put("/employees/:id/allow-remote", verifyToken, authorizeRoles("Admin", "HR"), async (req, res) => {
    try {
        const tenantId = getTenantId(req);
        const result = await pool.query(
            `UPDATE employees
             SET allow_remote = true,
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $1 AND tenant_id = $2
             RETURNING id, name, email, shift, work_type, allow_remote, tenant_id, updated_at`,
            [req.params.id, tenantId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Employee not found" });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});

router.delete("/employees/:id", verifyToken, authorizeRoles("Admin"), async (req, res) => {
    try {
        const { id } = req.params;
        const tenantId = getTenantId(req);

        const deletedEmployee = await pool.query(
            "DELETE FROM employees WHERE id = $1 AND tenant_id = $2 RETURNING id, tenant_id",
            [id, tenantId]
        );

        if (deletedEmployee.rows.length === 0) {
            return res.status(404).json({ message: "Employee not found" });
        }

        res.json({ message: "Employee deleted" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
