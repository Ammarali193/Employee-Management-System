const Attendance = require("../models/Attendance");
const pool = require("../config/db");
const { sendError, sendSuccess } = require("./apiResponse");

const toDateTimeValue = (date, time) => {
    if (!date || !time) {
        return null;
    }

    return `${date} ${time}:00`;
};

const computeTotalHours = (checkInDateTime, checkOutDateTime) => {
    if (!checkInDateTime || !checkOutDateTime) {
        return 0;
    }

    const start = new Date(checkInDateTime);
    const end = new Date(checkOutDateTime);
    const diffMs = end.getTime() - start.getTime();

    if (Number.isNaN(diffMs) || diffMs <= 0) {
        return 0;
    }

    return Number((diffMs / (1000 * 60 * 60)).toFixed(2));
};

const computeOvertimeHours = (totalHours) => {
    const value = Number(totalHours || 0);

    if (Number.isNaN(value) || value <= 8) {
        return 0;
    }

    return Number((value - 8).toFixed(2));
};

const computeStatus = (checkIn) => {
    if (!checkIn) {
        return "Absent";
    }

    const checkInTime = new Date(checkIn).toTimeString().slice(0, 5);
    return checkInTime > "09:00" ? "Late" : "Present";
};

const formatReportTime = (value) => {
    if (!value) {
        return "--";
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return "--";
    }

    return date.toTimeString().slice(0, 5);
};

const toReportStatus = (checkIn) => {
    if (!checkIn) {
        return "Absent";
    }

    const checkInTime = new Date(checkIn).toTimeString().slice(0, 5);
    return checkInTime > "09:00" ? "Late" : "Present";
};

const mapAttendanceReportRow = (row) => ({
    employeeName: row.employee_name || "--",
    date: row.attendance_date || "--",
    checkIn: formatReportTime(row.check_in),
    checkOut: formatReportTime(row.check_out),
    totalHours: Number(row.total_hours || 0),
    status: toReportStatus(row.check_in)
});

const markAttendance = async (req, res) => {
    try {
        const { employee_id, date, check_in, check_out } = req.body || {};

        if (!employee_id || !date || !check_in || !check_out) {
            return sendError(res, "employee_id, date, check_in and check_out are required", 400);
        }

        const employeeExists = await pool.query(
            `SELECT id FROM employees WHERE id = $1 LIMIT 1`,
            [employee_id]
        );

        if (employeeExists.rows.length === 0) {
            return sendError(res, "employee_id does not exist", 404);
        }

        const checkInDateTime = toDateTimeValue(date, check_in);
        const checkOutDateTime = toDateTimeValue(date, check_out);

        if (!checkInDateTime || !checkOutDateTime) {
            return sendError(res, "Invalid check_in/check_out format", 400);
        }

        const total_hours = computeTotalHours(checkInDateTime, checkOutDateTime);
        const overtime_hours = computeOvertimeHours(total_hours);
        const status = computeStatus(checkInDateTime);

        const created = await Attendance.create({
            employee_id,
            date,
            check_in: checkInDateTime,
            check_out: checkOutDateTime,
            total_hours,
            overtime_hours,
            status
        });

        return sendSuccess(res, created, "Attendance marked", 201);
    } catch (error) {
        console.error("Mark attendance error:", error);
        return sendError(res, "Internal server error", 500);
    }
};

const getAttendance = async (_req, res) => {
    try {
        const tenantId = String(_req.user?.tenant_id || "default");
        const rows = await Attendance.findAll(tenantId);
        return sendSuccess(res, rows, "Attendance fetched");
    } catch (error) {
        console.error("Get attendance error:", error);
        return sendError(res, "Internal server error", 500);
    }
};

const getAttendanceReports = async (req, res) => {
    try {
        const { from, to, employeeId } = req.query || {};
        const tenantId = String(req.user?.tenant_id || "default");
        const rows = await Attendance.findReports({ from, to, employeeId, tenantId });

        const data = rows.map(mapAttendanceReportRow);

        return sendSuccess(res, data, "Attendance reports fetched");
    } catch (error) {
        console.error("Attendance reports error:", error);
        return sendError(res, "Internal server error", 500);
    }
};

module.exports = {
    getAttendance,
    getAttendanceReports,
    markAttendance
};
