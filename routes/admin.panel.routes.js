const express = require("express");
const { verifyToken } = require("../middlewares/auth.middleware");
const { checkRole } = require("../middleware/rbac");
const { login } = require("../controllers/auth.admin.controller");
const {
    createEmployee,
    deleteEmployee,
    getEmployeeById,
    getEmployees,
    updateEmployee
} = require("../controllers/employees.controller");
const {
    markAttendance,
    getAttendance,
    getAttendanceReports
} = require("../controllers/attendance.admin.controller");
const { applyLeave, getLeaves, updateLeave } = require("../controllers/leaves.controller");
const { createAsset, getAssets, updateAsset, deleteAsset } = require("../controllers/assets.controller");
const { getPayroll, generatePayroll } = require("../controllers/payroll.controller");
const { createPerformance, getPerformance } = require("../controllers/performance.controller");
const { getCompliance, createCompliance } = require("../controllers/compliance.controller");
const { attendanceReport, payrollReport, leaveReport } = require("../controllers/reports.controller");
const {
    assignShift,
    createDocument,
    createHoliday,
    createShift,
    createTenant,
    getAuditLogs,
    getDocuments,
    getEmploymentHistory,
    getHolidays,
    getLeaveBalance,
    getShiftAssignments,
    getShifts,
    getTenants,
    updateLeaveBalance,
    upload
} = require("../controllers/advanced.controller");

const router = express.Router();

const ROLES = {
    ADMIN: "Admin",
    MANAGER: "Manager",
    EMPLOYEE: "Employee",
    HR: "HR"
};

// Auth module
router.post("/auth/login", login);

// Protect all admin panel routes below
router.use(verifyToken);

// Governance-only route
router.get("/audit-logs", checkRole(ROLES.ADMIN), getAuditLogs);

// Employee module
router.post("/employees", checkRole(ROLES.ADMIN, ROLES.HR), createEmployee);
router.get("/employees", checkRole(ROLES.ADMIN, ROLES.MANAGER, ROLES.HR, ROLES.EMPLOYEE), getEmployees);
router.get("/employees/:id", checkRole(ROLES.ADMIN, ROLES.MANAGER, ROLES.HR, ROLES.EMPLOYEE), getEmployeeById);
router.put("/employees/:id", checkRole(ROLES.ADMIN, ROLES.MANAGER, ROLES.HR), updateEmployee);
router.delete("/employees/:id", checkRole(ROLES.ADMIN), deleteEmployee);

// Attendance module
router.post("/attendance", checkRole(ROLES.ADMIN, ROLES.MANAGER, ROLES.HR), markAttendance);
router.get("/attendance", checkRole(ROLES.ADMIN, ROLES.MANAGER, ROLES.HR, ROLES.EMPLOYEE), getAttendance);
router.get("/attendance/reports", checkRole(ROLES.ADMIN, ROLES.MANAGER, ROLES.HR, ROLES.EMPLOYEE), getAttendanceReports);

// Leave module
router.post("/leaves/apply", checkRole(ROLES.ADMIN, ROLES.MANAGER, ROLES.HR, ROLES.EMPLOYEE), applyLeave);
router.get("/leaves", checkRole(ROLES.ADMIN, ROLES.MANAGER, ROLES.HR, ROLES.EMPLOYEE), getLeaves);
router.put("/leaves/:id", checkRole(ROLES.ADMIN, ROLES.MANAGER, ROLES.HR), updateLeave);

// Leave balance module
router.get("/leave-balance", checkRole(ROLES.ADMIN, ROLES.MANAGER, ROLES.HR, ROLES.EMPLOYEE), getLeaveBalance);
router.put("/leave-balance/:employee_id", checkRole(ROLES.ADMIN, ROLES.MANAGER, ROLES.HR), updateLeaveBalance);

// Asset module
router.post("/assets", checkRole(ROLES.ADMIN, ROLES.MANAGER), createAsset);
router.get("/assets", checkRole(ROLES.ADMIN, ROLES.MANAGER, ROLES.EMPLOYEE), getAssets);
router.put("/assets/:id", checkRole(ROLES.ADMIN, ROLES.MANAGER), updateAsset);
router.delete("/assets/:id", checkRole(ROLES.ADMIN), deleteAsset);

// Payroll module
router.get("/payroll", checkRole(ROLES.ADMIN, ROLES.MANAGER, ROLES.EMPLOYEE), getPayroll);
router.post("/payroll/generate", checkRole(ROLES.ADMIN, ROLES.MANAGER), generatePayroll);

// Performance module
router.post("/performance", checkRole(ROLES.ADMIN, ROLES.MANAGER, ROLES.HR), createPerformance);
router.get("/performance", checkRole(ROLES.ADMIN, ROLES.MANAGER, ROLES.HR, ROLES.EMPLOYEE), getPerformance);

// Compliance module
router.get("/compliance", checkRole(ROLES.ADMIN, ROLES.MANAGER, ROLES.EMPLOYEE), getCompliance);
router.post("/compliance", checkRole(ROLES.ADMIN, ROLES.MANAGER), createCompliance);

// Shift management
router.post("/shifts", checkRole(ROLES.ADMIN, ROLES.MANAGER), createShift);
router.get("/shifts", checkRole(ROLES.ADMIN, ROLES.MANAGER, ROLES.EMPLOYEE), getShifts);
router.post("/shifts/assign", checkRole(ROLES.ADMIN, ROLES.MANAGER), assignShift);
router.get("/shifts/assignments", checkRole(ROLES.ADMIN, ROLES.MANAGER, ROLES.EMPLOYEE), getShiftAssignments);

// Holiday calendar
router.post("/holidays", checkRole(ROLES.ADMIN, ROLES.MANAGER, ROLES.HR), createHoliday);
router.get("/holidays", checkRole(ROLES.ADMIN, ROLES.MANAGER, ROLES.HR, ROLES.EMPLOYEE), getHolidays);

// Document management
router.post("/documents", checkRole(ROLES.ADMIN, ROLES.MANAGER, ROLES.HR, ROLES.EMPLOYEE), upload.single("file"), createDocument);
router.get("/documents", checkRole(ROLES.ADMIN, ROLES.MANAGER, ROLES.HR, ROLES.EMPLOYEE), getDocuments);

// Employment history
router.get("/history/:employee_id", checkRole(ROLES.ADMIN, ROLES.MANAGER, ROLES.HR, ROLES.EMPLOYEE), getEmploymentHistory);

// Multi-tenant
router.post("/tenants", checkRole(ROLES.ADMIN), createTenant);
router.get("/tenants", checkRole(ROLES.ADMIN, ROLES.MANAGER), getTenants);

// Reports module
router.get("/reports/attendance", checkRole(ROLES.ADMIN, ROLES.MANAGER, ROLES.HR, ROLES.EMPLOYEE), attendanceReport);
router.get("/reports/payroll", checkRole(ROLES.ADMIN, ROLES.MANAGER), payrollReport);
router.get("/reports/leave", checkRole(ROLES.ADMIN, ROLES.MANAGER, ROLES.HR, ROLES.EMPLOYEE), leaveReport);

module.exports = router;
