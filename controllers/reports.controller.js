const Attendance = require("../models/Attendance");
const Leave = require("../models/Leave");
const Payroll = require("../models/Payroll");
const { sendError, sendSuccess } = require("./apiResponse");

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

const attendanceReport = async (_req, res) => {
    try {
        const tenantId = String(_req.user?.tenant_id || "default");
        const { from, to, employeeId } = _req.query || {};
        const rows = await Attendance.findReports({ from, to, employeeId, tenantId });

        const data = rows.map((row) => ({
            employeeName: row.employee_name || "--",
            date: row.attendance_date || "--",
            checkIn: formatReportTime(row.check_in),
            checkOut: formatReportTime(row.check_out),
            totalHours: Number(row.total_hours || 0),
            status: toReportStatus(row.check_in)
        }));

        return sendSuccess(res, data, "Attendance report fetched");
    } catch (error) {
        console.error("Attendance report error:", error);
        return sendError(res, "Internal server error", 500);
    }
};

const payrollReport = async (_req, res) => {
    try {
        const rows = await Payroll.findAll();
        return sendSuccess(res, rows, "Payroll report fetched");
    } catch (error) {
        console.error("Payroll report error:", error);
        return sendError(res, "Internal server error", 500);
    }
};

const leaveReport = async (_req, res) => {
    try {
        const rows = await Leave.findAll();
        return sendSuccess(res, rows, "Leave report fetched");
    } catch (error) {
        console.error("Leave report error:", error);
        return sendError(res, "Internal server error", 500);
    }
};

module.exports = {
    attendanceReport,
    leaveReport,
    payrollReport
};
