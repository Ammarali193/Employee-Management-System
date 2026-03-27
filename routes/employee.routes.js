const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const bcrypt = require("bcryptjs");
const { verifyToken, authorizeRoles, resolveTenantId } = require("../middlewares/auth.middleware");

const normalizeNullableText = (value) => {
    if (value === undefined || value === null) {
        return null;
    }

    const trimmed = String(value).trim();
    return trimmed === "" ? null : trimmed;
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

const splitEmployeeName = (name) => {
    const parts = String(name || "").trim().split(/\s+/).filter(Boolean);

    return {
        firstName: parts[0] || "",
        lastName: parts.slice(1).join(" ")
    };
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

router.post("/add", verifyToken, authorizeRoles("Admin", "HR"), async (req, res) => {
    try {
        const {
            name,
            first_name,
            last_name,
            email,
            password,
            department,
            role,
            shift
        } = req.body;
        const parsedName = splitEmployeeName(name);
        const resolvedFirstName = normalizeNullableText(first_name) || parsedName.firstName;
        const resolvedLastName = normalizeNullableText(last_name) ?? parsedName.lastName;
        const fullName = `${resolvedFirstName} ${resolvedLastName || ""}`.trim();
        const scheduleShift = normalizeNullableText(shift);
        const tenantId = getTenantId(req);
        const workArrangement = resolveEmployeeWorkArrangement(req.body, {
            requireWorkType: true
        });

        if (!resolvedFirstName || !email || !password) {
            return res.status(400).json({
                message: "name or first_name, email, and password are required"
            });
        }

        if (workArrangement.error) {
            return res.status(400).json({ message: workArrangement.error });
        }

        const existingUser = await pool.query(
            "SELECT id FROM employees WHERE email = $1",
            [email]
        );

        if (existingUser.rows.length > 0) {
            return res.status(400).json({ message: "Email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await pool.query(
            `INSERT INTO employees
            (name, first_name, last_name, email, password, role, department, shift, work_type, shift_type, allow_remote, is_emergency_remote, emergency_end_date, tenant_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
            RETURNING id, name, first_name, last_name, email, role, department, shift, work_type, shift_type, allow_remote, is_emergency_remote, emergency_end_date, tenant_id, status`,
            [
                fullName,
                resolvedFirstName,
                resolvedLastName || "",
                email,
                hashedPassword,
                role || "Employee",
                normalizeNullableText(department),
                scheduleShift,
                workArrangement.workType,
                workArrangement.shiftType,
                workArrangement.allowRemote,
                workArrangement.isEmergencyRemote,
                workArrangement.emergencyEndDate,
                tenantId
            ]
        );

        res.status(201).json({
            message: "Employee added successfully",
            data: result.rows[0]
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});

// Register employee (Admin only)
router.post("/register", verifyToken, authorizeRoles("Admin"), async (req, res) => {
    try {
        const {
            first_name,
            last_name,
            email,
            password,
            department,
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
        const name = `${first_name} ${last_name}`.trim();
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

        if (workArrangement.error) {
            return res.status(400).json({ message: workArrangement.error });
        }

        const existingUser = await pool.query(
            "SELECT id FROM employees WHERE email = $1",
            [email]
        );

        if (existingUser.rows.length > 0) {
            return res.status(400).json({ message: "Email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await pool.query(
            `INSERT INTO employees 
            (name, first_name, last_name, email, password, department, shift, work_type, shift_type, allow_remote, is_emergency_remote, emergency_end_date, tenant_id) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            RETURNING id, name, first_name, last_name, email, department, shift, work_type, shift_type, allow_remote, is_emergency_remote, emergency_end_date, tenant_id, role, status`,
            [
                name,
                first_name,
                last_name,
                email,
                hashedPassword,
                department,
                scheduleShift,
                workArrangement.workType,
                workArrangement.shiftType,
                workArrangement.allowRemote,
                workArrangement.isEmergencyRemote,
                workArrangement.emergencyEndDate,
                tenantId
            ]
        );

        res.status(201).json({
            message: "Employee Registered Successfully",
            employee: result.rows[0]
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
});

// Get all employees (No Password)
router.get("/", verifyToken, authorizeRoles("Admin", "HR"), async (req, res) => {
    try {
        const tenantId = getTenantId(req);
        const result = await pool.query(
            "SELECT id, first_name, last_name, email, department, shift, work_type, shift_type, allow_remote, is_emergency_remote, emergency_end_date, tenant_id, role, status FROM employees WHERE tenant_id = $1 ORDER BY id ASC",
            [tenantId]
        );

        res.status(200).json({
            count: result.rows.length,
            employees: result.rows
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
});

// ==============================
// 🔹 GET MANAGER TEAM
// ==============================
// ==============================
// Create employee (Admin or HR)
router.post("/", verifyToken, authorizeRoles("Admin", "HR"), async (req, res) => {
    try {
        const {
            first_name,
            last_name,
            email,
            password,
            department,
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
        const name = `${first_name} ${last_name}`.trim();
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

        if (workArrangement.error) {
            return res.status(400).json({ message: workArrangement.error });
        }

        const existingUser = await pool.query(
            "SELECT id FROM employees WHERE email = $1",
            [email]
        );

        if (existingUser.rows.length > 0) {
            return res.status(400).json({ message: "Email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await pool.query(
            `INSERT INTO employees (name, first_name, last_name, email, password, department, shift, work_type, shift_type, allow_remote, is_emergency_remote, emergency_end_date, tenant_id)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
             RETURNING id, name, first_name, last_name, email, department, shift, work_type, shift_type, allow_remote, is_emergency_remote, emergency_end_date, tenant_id, role, status`,
            [
                name,
                first_name,
                last_name,
                email,
                hashedPassword,
                department,
                scheduleShift,
                workArrangement.workType,
                workArrangement.shiftType,
                workArrangement.allowRemote,
                workArrangement.isEmergencyRemote,
                workArrangement.emergencyEndDate,
                tenantId
            ]
        );

        res.status(201).json({
            message: "Employee created",
            employee: result.rows[0]
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error creating employee" });
    }
});

// EMPLOYEE DIRECTORY SEARCH
// ==============================
router.get("/directory/search", verifyToken, async (req, res) => {
    try {

        const { name, department, role, location } = req.query;
        const tenantId = getTenantId(req);

        let query = `
            SELECT 
                id,
                first_name,
                last_name,
                email,
                department,
                role,
                location
            FROM employees
            WHERE tenant_id = $1
        `;

        const values = [tenantId];
        let index = 2;

        if (name) {
            query += ` AND (first_name ILIKE $${index} OR last_name ILIKE $${index})`;
            values.push(`%${name}%`);
            index++;
        }

        if (department) {
            query += ` AND department = $${index}`;
            values.push(department);
            index++;
        }

        if (role) {
            query += ` AND role = $${index}`;
            values.push(role);
            index++;
        }

        if (location) {
            query += ` AND location = $${index}`;
            values.push(location);
            index++;
        }

        query += ` ORDER BY first_name ASC`;

        const result = await pool.query(query, values);

        res.json({
            count: result.rows.length,
            employees: result.rows
        });

    } catch (error) {
        console.error("Directory search error:", error);
        res.status(500).json({
            message: "Server error"
        });
    }
});

router.get("/my-team", verifyToken, async (req, res) => {
    try {

        const managerId = req.user.id;
        const tenantId = getTenantId(req);

        const result = await pool.query(
            `
            SELECT id, first_name, last_name, department, role
            FROM employees
            WHERE manager_id = $1 AND tenant_id = $2
            `,
            [managerId, tenantId]
        );

        res.json({
            team_members: result.rows
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

// ==============================
// UPDATE EMPLOYEE PROFILE
// ==============================
router.put("/profile/update", verifyToken, async (req, res) => {
    try {
        const employee_id = req.user.id;
        const { dob, gender, phone, grade, manager_id } = req.body;
        const tenantId = getTenantId(req);

        const result = await pool.query(
            `
            UPDATE employees
            SET dob=$1,
                gender=$2,
                phone=$3,
                grade=$4,
                manager_id=$5
            WHERE id=$6 AND tenant_id = $7
            RETURNING *
            `,
            [dob, gender, phone, grade, manager_id, employee_id, tenantId]
        );

        res.json({
            message: "Profile updated",
            employee: result.rows[0]
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

// Get single employee by id
router.get("/:id", verifyToken, async (req, res) => {
    try {
        const tenantId = getTenantId(req);
        const result = await pool.query(`
        SELECT id, first_name, last_name, email, department, shift, work_type, shift_type, allow_remote, is_emergency_remote, emergency_end_date, tenant_id, role
        FROM employees
        WHERE id=$1 AND tenant_id = $2
        `,[req.params.id, tenantId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Employee not found" });
        }

        const employee = result.rows[0];

        // Mask email if not admin
        if (String(req.user.role || "").toLowerCase() !== "admin") {
            employee.email = employee.email.replace(/(.{3}).+(@.+)/, "$1***$2");
        }

        res.json(employee);
    } catch (error) {
        console.error(error);
        res.status(500).json({message:"Server error"});
    }
});

// ==============================
// 🔹 ASSIGN MANAGER TO EMPLOYEE
// ==============================
router.put("/assign-manager/:id", verifyToken, authorizeRoles("Admin"), async (req, res) => {
    try {

        const { id } = req.params;
        const { manager_id } = req.body;
        const tenantId = getTenantId(req);

        const result = await pool.query(
            `
            UPDATE employees
            SET manager_id = $1
            WHERE id = $2 AND tenant_id = $3
            RETURNING id, first_name, last_name, manager_id
            `,
            [manager_id, id, tenantId]
        );

        res.json({
            message: "Manager assigned successfully",
            employee: result.rows[0]
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

router.put("/assign-rfid/:id", verifyToken, authorizeRoles("Admin"), async (req, res) => {
    try {

        const { id } = req.params;
        const { rfid_card_id } = req.body;
        const tenantId = getTenantId(req);

        const result = await pool.query(
            `
            UPDATE employees
            SET rfid_card_id = $1
            WHERE id = $2 AND tenant_id = $3
            RETURNING *
            `,
            [rfid_card_id, id, tenantId]
        );

        res.json({
            message: "RFID assigned",
            employee: result.rows[0]
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

router.put("/assign-qr/:id", verifyToken, authorizeRoles("Admin"), async (req, res) => {
    try {

        const { id } = req.params;
        const { qr_code } = req.body;
        const tenantId = getTenantId(req);

        const result = await pool.query(
            `
            UPDATE employees
            SET qr_code = $1
            WHERE id = $2 AND tenant_id = $3
            RETURNING *
            `,
            [qr_code, id, tenantId]
        );

        res.json({
            message: "QR code assigned",
            employee: result.rows[0]
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

router.put("/assign-biometric/:id", verifyToken, authorizeRoles("Admin"), async (req, res) => {
    try {

        const { id } = req.params;
        const { biometric_id } = req.body;
        const tenantId = getTenantId(req);

        const result = await pool.query(
            `
            UPDATE employees
            SET biometric_id = $1
            WHERE id = $2 AND tenant_id = $3
            RETURNING *
            `,
            [biometric_id, id, tenantId]
        );

        res.json({
            message: "Biometric ID assigned",
            employee: result.rows[0]
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

// Update employee
router.put("/:id", verifyToken, async (req, res) => {
    try {
        const {
            first_name,
            last_name,
            email,
            department,
            password,
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
        } = req.body;

        let hashedPassword = null;
        const scheduleShift = normalizeNullableText(shift);
        const tenantId = getTenantId(req);

        if (password) {
            hashedPassword = await bcrypt.hash(password, 10);
        }

        const currentEmployeeResult = await pool.query(
            `SELECT work_type, shift_type, allow_remote, is_emergency_remote, emergency_end_date
             FROM employees
             WHERE id = $1 AND tenant_id = $2`,
            [req.params.id, tenantId]
        );

        if (currentEmployeeResult.rows.length === 0) {
            return res.status(404).json({ message: "Employee not found" });
        }

        const currentEmployee = currentEmployeeResult.rows[0];
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
            return res.status(400).json({ message: workArrangement.error });
        }

        const result = await pool.query(
            `UPDATE employees
             SET name = TRIM(CONCAT($1, ' ', $2)),
                 first_name = $1,
                 last_name = $2,
                 email = $3,
                 department = $4,
                 shift = COALESCE($5, shift),
                 work_type = $6,
                 shift_type = $7,
                 allow_remote = $8,
                 is_emergency_remote = $9,
                 emergency_end_date = $10,
                 password = COALESCE($11, password)
             WHERE id = $12 AND tenant_id = $13
             RETURNING id`,
            [
                first_name,
                last_name,
                email,
                department,
                scheduleShift,
                workArrangement.workType,
                workArrangement.shiftType,
                workArrangement.allowRemote,
                workArrangement.isEmergencyRemote,
                workArrangement.emergencyEndDate,
                hashedPassword,
                req.params.id,
                tenantId
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Employee not found" });
        }

        res.json({ message: "Employee updated" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
});

// Role/status update (Admin only)
router.patch("/:id/role-status", verifyToken, authorizeRoles("Admin"), async (req, res) => {
    try {
        const { id } = req.params;
        const { role, status } = req.body;
        const tenantId = getTenantId(req);

        const result = await pool.query(
            `UPDATE employees
             SET role = COALESCE($1, role),
                 status = COALESCE($2, status),
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $3 AND tenant_id = $4
             RETURNING id, first_name, last_name, email, department, tenant_id, role, status`,
            [role, status, id, tenantId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Employee not found" });
        }

        res.status(200).json({
            message: "Employee role/status updated successfully",
            employee: result.rows[0]
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
});

// Delete my account
router.delete("/me", verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const tenantId = getTenantId(req);

        const result = await pool.query(
            "DELETE FROM employees WHERE id = $1 AND tenant_id = $2 RETURNING id, first_name, email, tenant_id",
            [userId, tenantId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({
            message: "Your account deleted successfully",
            user: result.rows[0]
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
});

// Delete employee by id (Admin only)
router.delete("/:id", verifyToken, authorizeRoles("Admin"), async (req, res) => {
    try {
        const { id } = req.params;
        const tenantId = getTenantId(req);

        const result = await pool.query(
            "DELETE FROM employees WHERE id = $1 AND tenant_id = $2 RETURNING id, first_name, email, tenant_id",
            [id, tenantId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Employee not found" });
        }

        res.status(200).json({
            message: "Employee deleted successfully",
            employee: result.rows[0]
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
});

module.exports = router;
