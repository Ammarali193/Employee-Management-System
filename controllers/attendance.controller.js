const Attendance = require("../models/Attendance");

const parseDate = (value) => {
    if (!value) {
        return null;
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
        return null;
    }

    return value;
};

const formatTime = (dateValue) => {
    if (!dateValue) {
        return "--";
    }

    const date = new Date(dateValue);
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

const getAttendanceReports = async (req, res) => {
    try {
        const { from, to, employeeId } = req.query;

        if (from && !parseDate(from)) {
            return res.status(400).json({
                success: false,
                message: "Invalid from date. Use YYYY-MM-DD"
            });
        }

        if (to && !parseDate(to)) {
            return res.status(400).json({
                success: false,
                message: "Invalid to date. Use YYYY-MM-DD"
            });
        }

        if (employeeId && Number.isNaN(Number(employeeId))) {
            return res.status(400).json({
                success: false,
                message: "employeeId must be a number"
            });
        }

        const records = await Attendance.findReports({ from, to, employeeId });

        const data = records.map((row) => ({
            employeeName: row.employee_name || "--",
            date: row.attendance_date || "--",
            checkIn: formatTime(row.check_in),
            checkOut: formatTime(row.check_out),
            totalHours: Number(row.total_hours || 0),
            status: toReportStatus(row.check_in)
        }));

        return res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        console.error("Attendance reports error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

module.exports = {
    getAttendanceReports
};
