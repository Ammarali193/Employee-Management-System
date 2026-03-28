const bcrypt = require("bcryptjs");
const Employee = require("../models/Employee");
const { sendError, sendSuccess } = require("./apiResponse");

const splitName = (name = "") => {
    const parts = String(name).trim().split(/\s+/).filter(Boolean);

    return {
        first_name: parts[0] || "User",
        last_name: parts.slice(1).join(" ") || ""
    };
};

const normalizeText = (value) => {
    if (value === undefined || value === null) {
        return null;
    }

    const text = String(value).trim();
    return text || null;
};

const isValidDateInput = (value) => {
    if (value === undefined || value === null || value === "") {
        return true;
    }

    const parsed = new Date(value);
    return !Number.isNaN(parsed.getTime());
};

const createEmployee = async (req, res) => {
    try {
        const payload = req.body || {};
        const firstName = normalizeText(payload.first_name ?? payload.firstName);
        const lastName = normalizeText(payload.last_name ?? payload.lastName);
        const fullNameFromParts = `${firstName || ""} ${lastName || ""}`.trim();
        const name = normalizeText(payload.name) || fullNameFromParts || null;
        const email = normalizeText(payload.email ?? payload.work_email ?? payload.workEmail);
        const phone = normalizeText(payload.phone ?? payload.mobile ?? payload.contact_no ?? payload.contactNo);
        const department = normalizeText(payload.department ?? payload.department_name ?? payload.departmentName);
        const role = normalizeText(payload.role ?? payload.job_role ?? payload.jobRole);
        const join_date = payload.join_date ?? payload.joinDate;
        const status = normalizeText(payload.status);

        if (!email || (!name && !firstName)) {
            return sendError(res, "email and (name or first_name) are required", 400);
        }

        const existingEmployee = await Employee.findByEmail(String(email).trim());

        if (existingEmployee) {
            return sendError(res, "Employee email already exists", 409);
        }

        const names = splitName(name || firstName || "User");
        const hashedPassword = await bcrypt.hash("ChangeMe123!", 10);

        const created = await Employee.create({
            name: String(name).trim(),
            first_name: names.first_name,
            last_name: names.last_name,
            email: String(email).trim(),
            password: hashedPassword,
            phone: phone || null,
            department: department || null,
            role: role || "Employee",
            join_date: join_date || new Date().toISOString().slice(0, 10),
            status: status || "active"
        });

        return sendSuccess(res, created, "Employee created", 201);
    } catch (error) {
        console.error("Create employee error:", error);

        if (error.code === "23505" || String(error.message).toLowerCase().includes("duplicate") || String(error.message).toLowerCase().includes("unique")) {
            return sendError(res, "Employee email already exists", 409);
        }

        return sendError(res, "Internal server error", 500);
    }
};

const getEmployees = async (_req, res) => {
    try {
        const rows = await Employee.findAll();
        return sendSuccess(res, rows, "Employees fetched");
    } catch (error) {
        console.error("Get employees error:", error);
        return sendError(res, "Internal server error", 500);
    }
};

const getEmployeeById = async (req, res) => {
    try {
        const row = await Employee.findById(req.params.id);

        if (!row) {
            return sendError(res, "Employee not found", 404);
        }

        return sendSuccess(res, row, "Employee fetched");
    } catch (error) {
        console.error("Get employee by id error:", error);
        return sendError(res, "Internal server error", 500);
    }
};

const updateEmployee = async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return sendError(res, "Invalid employee id", 400);
        }

        const payload = req.body || {};

        if (typeof payload !== "object" || Array.isArray(payload)) {
            return sendError(res, "Request body must be a valid object", 400);
        }

        const existingEmployee = await Employee.findById(id);

        if (!existingEmployee) {
            return sendError(res, "Employee not found", 404);
        }

        const hasOwn = (key) => Object.prototype.hasOwnProperty.call(payload, key);

        if (hasOwn("join_date") && !isValidDateInput(payload.join_date)) {
            return sendError(res, "join_date must be a valid date", 400);
        }

        if (hasOwn("joinDate") && !isValidDateInput(payload.joinDate)) {
            return sendError(res, "joinDate must be a valid date", 400);
        }

        const firstName = normalizeText(payload.firstName ?? payload.first_name);
        const lastName = normalizeText(payload.lastName ?? payload.last_name);
        const explicitName = normalizeText(payload.name);

        const updates = {
            name: hasOwn("name") || hasOwn("firstName") || hasOwn("first_name") || hasOwn("lastName") || hasOwn("last_name")
                ? (explicitName || `${firstName || ""} ${lastName || ""}`.trim() || existingEmployee.name)
                : null,
            email: hasOwn("email") ? normalizeText(payload.email) : null,
            phone: hasOwn("phone") ? normalizeText(payload.phone) : null,
            department: hasOwn("department") ? normalizeText(payload.department) : null,
            role: hasOwn("role") ? normalizeText(payload.role) : null,
            join_date: hasOwn("join_date") || hasOwn("joinDate")
                ? (payload.join_date ?? payload.joinDate ?? null)
                : null,
            status: hasOwn("status") ? normalizeText(payload.status) : null
        };

        const providedFields = Object.values(updates).some((value) => value !== null);

        if (!providedFields) {
            return sendError(res, "No valid fields provided for update", 400);
        }

        const updated = await Employee.update(id, updates);

        if (!updated) {
            return sendError(res, "Employee not found", 404);
        }

        return sendSuccess(res, updated, "Employee updated");
    } catch (error) {
        console.error("Update employee error:", {
            message: error?.message,
            stack: error?.stack,
            code: error?.code
        });

        if (error?.code === "23505") {
            return sendError(res, "Employee email already exists", 409);
        }

        return sendError(res, "Failed to update employee", 500);
    }
};

const deleteEmployee = async (req, res) => {
    try {
        const removed = await Employee.remove(req.params.id);

        if (!removed) {
            return sendError(res, "Employee not found", 404);
        }

        return sendSuccess(res, removed, "Employee deleted");
    } catch (error) {
        console.error("Delete employee error:", error);

        if (error.code === "23503") {
            return sendError(
                res,
                "Employee cannot be deleted because it is referenced in other records",
                409
            );
        }

        return sendError(res, "Internal server error", 500);
    }
};

module.exports = {
    createEmployee,
    deleteEmployee,
    getEmployeeById,
    getEmployees,
    updateEmployee
};
