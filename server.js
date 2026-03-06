const express = require("express");
require("dotenv").config();
const bcrypt = require("bcryptjs");

const pool = require("./config/db");

const app = express();
app.use(express.json());

const { autoAudit } = require("./middlewares/audit.middleware");
app.use(autoAudit);

process.on("unhandledRejection", (reason) => {
    console.error("UNHANDLED REJECTION:", reason);
});

process.on("uncaughtException", (error) => {
    console.error("UNCAUGHT EXCEPTION:", error);
});

// ==============================
// CREATE EMPLOYEES TABLE
// ==============================
const createEmployeesTable = async () => {
    const query = `
        CREATE TABLE IF NOT EXISTS employees (
            id SERIAL PRIMARY KEY,
            first_name VARCHAR(100) NOT NULL,
            last_name VARCHAR(100) NOT NULL,
            email VARCHAR(150) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            department VARCHAR(100),
            role VARCHAR(50) DEFAULT 'Employee',
            join_date DATE DEFAULT CURRENT_DATE,
            status VARCHAR(20) DEFAULT 'active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;

    try {
        await pool.query(query);
        console.log("Employees table ready");
    } catch (err) {
        console.error("Error creating employees table:", err);
    }
};

// ==============================
// 🔹 CREATE DEPARTMENTS TABLE
// ==============================
// ==============================
// UPDATE EMPLOYEES TABLE
// ==============================
const updateEmployeesTable = async () => {
    try {
        await pool.query(`
            ALTER TABLE employees
            ADD COLUMN IF NOT EXISTS dob DATE;
        `);

        await pool.query(`
            ALTER TABLE employees
            ADD COLUMN IF NOT EXISTS gender VARCHAR(20);
        `);

        await pool.query(`
            ALTER TABLE employees
            ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
        `);

        await pool.query(`
            ALTER TABLE employees
            ADD COLUMN IF NOT EXISTS grade VARCHAR(50);
        `);

        await pool.query(`
            ALTER TABLE employees
            ADD COLUMN IF NOT EXISTS manager_id INTEGER REFERENCES employees(id);
        `);

        console.log("✅ Employees table updated");
    } catch (err) {
        console.error("❌ Employee table update error:", err);
    }
};

// ==============================
// ADD LOCATION COLUMN
// ==============================
const addEmployeeLocationColumn = async () => {
    try {

        await pool.query(`
            ALTER TABLE employees
            ADD COLUMN IF NOT EXISTS location VARCHAR(100);
        `);

        console.log("✅ Employee location column ready");

    } catch (err) {
        console.error("❌ Location column error:", err);
    }
};

// ==============================
// ADD RFID CARD COLUMN
// ==============================
const addRFIDColumn = async () => {
    try {

        await pool.query(`
            ALTER TABLE employees
            ADD COLUMN IF NOT EXISTS rfid_card_id VARCHAR(100) UNIQUE;
        `);

        console.log("✅ RFID column ready");

    } catch (err) {
        console.error("RFID column error:", err);
    }
};

// ==============================
// ADD QR CODE COLUMN
// ==============================
const addQRCodeColumn = async () => {
    try {

        await pool.query(`
            ALTER TABLE employees
            ADD COLUMN IF NOT EXISTS qr_code VARCHAR(100) UNIQUE;
        `);

        console.log("✅ QR code column ready");

    } catch (err) {
        console.error("QR column error:", err);
    }
};

// ==============================
// ADD BIOMETRIC ID COLUMN
// ==============================
const addBiometricColumn = async () => {
    try {

        await pool.query(`
            ALTER TABLE employees
            ADD COLUMN IF NOT EXISTS biometric_id VARCHAR(100) UNIQUE;
        `);

        console.log("✅ Biometric ID column ready");

    } catch (err) {
        console.error("Biometric column error:", err);
    }
};

const addDeviceCodeColumn = async () => {
    try {

        await pool.query(`
        ALTER TABLE employees
        ADD COLUMN IF NOT EXISTS device_employee_code VARCHAR(50) UNIQUE;
        `);

        console.log("✅ Device employee code ready");

    } catch (err) {
        console.error(err);
    }
};

// ==============================
// CREATE EMERGENCY CONTACTS TABLE
// ==============================
const createEmergencyContactsTable = async () => {
    const query = `
        CREATE TABLE IF NOT EXISTS emergency_contacts (
            id SERIAL PRIMARY KEY,
            employee_id INTEGER REFERENCES employees(id) ON DELETE CASCADE,
            name VARCHAR(150) NOT NULL,
            relationship VARCHAR(100),
            phone VARCHAR(20),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;

    try {
        await pool.query(query);
        console.log("✅ Emergency contacts table ready");
    } catch (err) {
        console.error("❌ Error creating emergency contacts table:", err);
    }
};

// ==============================
// CREATE EMPLOYMENT HISTORY TABLE
// ==============================
const createEmploymentHistoryTable = async () => {
    const query = `
        CREATE TABLE IF NOT EXISTS employment_history (
            id SERIAL PRIMARY KEY,
            employee_id INTEGER REFERENCES employees(id) ON DELETE CASCADE,
            role VARCHAR(100),
            department VARCHAR(100),
            change_type VARCHAR(50),
            effective_date DATE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;

    try {
        await pool.query(query);
        console.log("✅ Employment history table ready");
    } catch (err) {
        console.error("❌ Error creating employment history table:", err);
    }
};

// ==============================
// CREATE EMPLOYEE DOCUMENTS TABLE
// ==============================
const createEmployeeDocumentsTable = async () => {
    const query = `
        CREATE TABLE IF NOT EXISTS employee_documents (
            id SERIAL PRIMARY KEY,
            employee_id INTEGER REFERENCES employees(id) ON DELETE CASCADE,
            document_type VARCHAR(100),
            file_url TEXT,
            expiry_date DATE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;

    try {
        await pool.query(query);
        console.log("✅ Employee documents table ready");
    } catch (err) {
        console.error("❌ Error creating employee documents table:", err);
    }
};

// ==============================
// CREATE CUSTOM FIELDS TABLE
// ==============================
const createCustomFieldsTable = async () => {
    const query = `
        CREATE TABLE IF NOT EXISTS employee_custom_fields (
            id SERIAL PRIMARY KEY,
            employee_id INTEGER REFERENCES employees(id) ON DELETE CASCADE,
            field_name VARCHAR(150) NOT NULL,
            field_value TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;

    try {
        await pool.query(query);
        console.log("✅ Custom fields table ready");
    } catch (err) {
        console.error("❌ Error creating custom fields table:", err);
    }
};

// ==============================
// CREATE SHIFTS TABLE
// ==============================
const createShiftsTable = async () => {
    try {

        const query = `
        CREATE TABLE IF NOT EXISTS shifts (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100),
            start_time TIME,
            end_time TIME,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        `;

        await pool.query(query);

        console.log("✅ Shifts table ready");

    } catch (err) {
        console.error("Shift table error:", err);
    }
};

// ==============================
// CREATE EMPLOYEE SHIFTS TABLE
// ==============================
const createEmployeeShiftsTable = async () => {
    try {

        const query = `
        CREATE TABLE IF NOT EXISTS employee_shifts (
            id SERIAL PRIMARY KEY,
            employee_id INTEGER REFERENCES employees(id) ON DELETE CASCADE,
            shift_id INTEGER REFERENCES shifts(id) ON DELETE CASCADE,
            assigned_date DATE DEFAULT CURRENT_DATE
        );
        `;

        await pool.query(query);

        console.log("✅ Employee shifts table ready");

    } catch (err) {
        console.error("Employee shift error:", err);
    }
};

const createDepartmentsTable = async () => {
    const query = `
        CREATE TABLE IF NOT EXISTS departments (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) UNIQUE NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;

    try {
        await pool.query(query);
        console.log("✅ Departments table ready");
    } catch (err) {
        console.error("❌ Error creating departments table:", err);
    }
};

// ==============================
// CREATE ATTENDANCE TABLE
// ==============================
const createAttendanceTable = async () => {
    const query = `
        CREATE TABLE IF NOT EXISTS attendance (
            id SERIAL PRIMARY KEY,
            employee_id INTEGER REFERENCES employees(id) ON DELETE CASCADE,
            check_in TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            check_out TIMESTAMP,
            work_hours NUMERIC(5,2),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;

    try {
        await pool.query(query);
        console.log("Attendance table ready");
    } catch (err) {
        console.error("Error creating attendance table:", err);
    }
};

// ==============================
// ADD ATTENDANCE METHOD COLUMN
// ==============================
const addAttendanceMethodColumn = async () => {
    try {
        await pool.query(`
            ALTER TABLE attendance
            ADD COLUMN IF NOT EXISTS method VARCHAR(50);
        `);
        console.log("✅ Attendance method column ready");
    } catch (err) {
        console.error("❌ Attendance method column error:", err);
    }
};

// ==============================
// ADD OVERTIME COLUMN
// ==============================
const addOvertimeColumn = async () => {
    try {

        await pool.query(`
            ALTER TABLE attendance
            ADD COLUMN IF NOT EXISTS overtime_hours DECIMAL DEFAULT 0;
        `);

        console.log("✅ Overtime column ready");

    } catch (err) {
        console.error("Overtime column error:", err);
    }
};

// ==============================
// ADD STATUS COLUMN
// ==============================
const addAttendanceStatus = async () => {
    try {

        await pool.query(`
            ALTER TABLE attendance
            ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'Present';
        `);

        console.log("✅ Attendance status column ready");

    } catch (err) {
        console.error(err);
    }
};

// ==============================
// ADD GPS LOCATION FIELDS
// ==============================
const updateAttendanceGPS = async () => {
    try {

        await pool.query(`
            ALTER TABLE attendance
            ADD COLUMN IF NOT EXISTS location_lat DECIMAL;
        `);

        await pool.query(`
            ALTER TABLE attendance
            ADD COLUMN IF NOT EXISTS location_lng DECIMAL;
        `);

        console.log("✅ GPS location fields ready");

    } catch (err) {
        console.error(err);
    }
};

// ==============================
// CREATE LEAVE TYPES TABLE
// ==============================
const createLeaveTypesTable = async () => {
    const query = `
        CREATE TABLE IF NOT EXISTS leave_types (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL UNIQUE,
            description TEXT
        );
    `;

    try {
        await pool.query(query);
        console.log("Leave types table ready");
    } catch (err) {
        console.error("Error creating leave types table:", err);
    }
};

// ==============================
// CREATE LEAVE REQUESTS TABLE
// ==============================
const createLeaveRequestsTable = async () => {
    const query = `
        CREATE TABLE IF NOT EXISTS leave_requests (
            id SERIAL PRIMARY KEY,
            employee_id INTEGER REFERENCES employees(id) ON DELETE CASCADE,
            leave_type_id INTEGER REFERENCES leave_types(id) ON DELETE CASCADE,
            start_date DATE NOT NULL,
            end_date DATE NOT NULL,
            reason TEXT,
            status VARCHAR(20) DEFAULT 'pending',
            applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;

    try {
        await pool.query(query);
        console.log("Leave requests table ready");
    } catch (err) {
        console.error("Error creating leave requests table:", err);
    }
};

// ==============================
// CREATE ASSETS TABLE
// ==============================
const createAssetsTable = async () => {
    const query = `
        CREATE TABLE IF NOT EXISTS assets (
            id SERIAL PRIMARY KEY,
            name VARCHAR(150) NOT NULL,
            category VARCHAR(100),
            serial_number VARCHAR(150) UNIQUE,
            status VARCHAR(20) DEFAULT 'available',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;

    try {
        await pool.query(query);
        console.log("Assets table ready");
    } catch (err) {
        console.error("Error creating assets table:", err);
    }
};

// ==============================
// CREATE ASSET ASSIGNMENTS TABLE
// ==============================
const createAssetAssignmentsTable = async () => {
    const query = `
        CREATE TABLE IF NOT EXISTS asset_assignments (
            id SERIAL PRIMARY KEY,
            asset_id INTEGER REFERENCES assets(id) ON DELETE CASCADE,
            employee_id INTEGER REFERENCES employees(id) ON DELETE CASCADE,
            assigned_date DATE DEFAULT CURRENT_DATE,
            return_date DATE,
            condition_notes TEXT
        );
    `;

    try {
        await pool.query(query);
        console.log("Asset assignments table ready");
    } catch (err) {
        console.error("Error creating asset assignments table:", err);
    }
};

// ==============================
// CREATE ASSET MAINTENANCE TABLE
// ==============================
const createAssetMaintenanceTable = async () => {
    try {
        const query = `
        CREATE TABLE IF NOT EXISTS asset_maintenance (
            id SERIAL PRIMARY KEY,
            asset_id INTEGER REFERENCES assets(id) ON DELETE CASCADE,
            service_date DATE,
            warranty_expiry DATE,
            notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        `;

        await pool.query(query);

        console.log("✅ Asset maintenance table ready");
    } catch (err) {
        console.error("Asset maintenance table error:", err);
    }
};

const updateAssetStatus = async () => {
    try{

        await pool.query(`
        ALTER TABLE assets
        ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'Available'
        `);

        console.log("✅ Asset status column ready");

    }catch(err){
        console.error(err);
    }
};

// ==============================
// 🔹 CREATE SALARY TABLE
// ==============================
const createSalaryTable = async () => {
    const query = `
        CREATE TABLE IF NOT EXISTS salaries (
            id SERIAL PRIMARY KEY,
            employee_id INTEGER REFERENCES employees(id) ON DELETE CASCADE,
            basic_salary NUMERIC(10,2) NOT NULL,
            allowances NUMERIC(10,2) DEFAULT 0,
            deductions NUMERIC(10,2) DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;

    try {
        await pool.query(query);
        console.log("✅ Salary table ready");
    } catch (err) {
        console.error("❌ Error creating salary table:", err);
    }
};

const updateSalaryColumns = async () => {
    try {
        await pool.query(`
            ALTER TABLE salaries
            ADD COLUMN IF NOT EXISTS allowances NUMERIC(10,2) DEFAULT 0;
        `);

        await pool.query(`
            ALTER TABLE salaries
            ADD COLUMN IF NOT EXISTS deductions NUMERIC(10,2) DEFAULT 0;
        `);

        console.log("✅ Salary allowances/deductions columns ready");
    } catch (err) {
        console.error("Salary columns update error:", err);
    }
};

const addCurrencyColumn = async () => {
    try{

        await pool.query(`
        ALTER TABLE salaries
        ADD COLUMN IF NOT EXISTS currency VARCHAR(10) DEFAULT 'PKR'
        `);

        console.log("✅ Currency column added");

    }catch(err){
        console.error(err);
    }
};

// ==============================
// CREATE TAX RULES TABLE
// ==============================
const createTaxRulesTable = async () => {
    try {

        const query = `
        CREATE TABLE IF NOT EXISTS tax_rules (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100),
            percentage DECIMAL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        `;

        await pool.query(query);

        console.log("✅ Tax rules table ready");

    } catch (err) {
        console.error("Tax table error:", err);
    }
};

// ==============================
// 🔹 CREATE AUDIT LOG TABLE
// ==============================
const createAuditLogTable = async () => {
    const query = `
        CREATE TABLE IF NOT EXISTS audit_logs (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES employees(id) ON DELETE SET NULL,
            action VARCHAR(255) NOT NULL,
            module VARCHAR(100),
            details TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;

    try {
        await pool.query(query);
        console.log("✅ Audit log table ready");
    } catch (err) {
        console.error("❌ Error creating audit log table:", err);
    }
};

// ==============================
// 🔹 CREATE PERFORMANCE TABLE
// ==============================
const createPerformanceTable = async () => {
    const query = `
        CREATE TABLE IF NOT EXISTS performance_reviews (
            id SERIAL PRIMARY KEY,
            employee_id INTEGER REFERENCES employees(id) ON DELETE CASCADE,
            reviewer_id INTEGER REFERENCES employees(id) ON DELETE SET NULL,
            rating INTEGER CHECK (rating BETWEEN 1 AND 5),
            review_period VARCHAR(100),
            comments TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;

    try {
        await pool.query(query);
        console.log("✅ Performance table ready");
    } catch (err) {
        console.error("❌ Error creating performance table:", err);
    }
};

// ==============================
// CREATE KPI TABLE
// ==============================
const createKpiTable = async () => {
    try {

        const query = `
        CREATE TABLE IF NOT EXISTS kpis (
            id SERIAL PRIMARY KEY,
            employee_id INTEGER REFERENCES employees(id) ON DELETE CASCADE,
            goal VARCHAR(200),
            target_value INTEGER,
            achieved_value INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        `;

        await pool.query(query);

        console.log("✅ KPI table ready");

    } catch (err) {
        console.error("KPI table error:", err);
    }
};

// ==============================
// CREATE FEEDBACK TABLE
// ==============================
const createFeedbackTable = async () => {
    try {

        const query = `
        CREATE TABLE IF NOT EXISTS feedback (
            id SERIAL PRIMARY KEY,
            from_employee_id INTEGER REFERENCES employees(id),
            to_employee_id INTEGER REFERENCES employees(id),
            rating INTEGER,
            comment TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        `;

        await pool.query(query);

        console.log("✅ Feedback table ready");

    } catch (err) {
        console.error("Feedback table error:", err);
    }
};

// ==============================
// CREATE APPRAISAL CYCLE TABLE
// ==============================
const createAppraisalCycleTable = async () => {
    try {

        const query = `
        CREATE TABLE IF NOT EXISTS appraisal_cycles (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100),
            year INTEGER,
            start_date DATE,
            end_date DATE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        `;

        await pool.query(query);

        console.log("✅ Appraisal cycle table ready");

    } catch (err) {
        console.error("Appraisal cycle table error:", err);
    }
};

// ==============================
// CREATE APPRAISAL RESULTS TABLE
// ==============================
const createAppraisalResultTable = async () => {
    try {

        const query = `
        CREATE TABLE IF NOT EXISTS appraisal_results (
            id SERIAL PRIMARY KEY,
            employee_id INTEGER REFERENCES employees(id),
            cycle_id INTEGER REFERENCES appraisal_cycles(id),
            rating INTEGER,
            promotion BOOLEAN DEFAULT false,
            salary_increment INTEGER DEFAULT 0,
            comments TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        `;

        await pool.query(query);

        console.log("✅ Appraisal results table ready");

    } catch (err) {
        console.error("Appraisal results error:", err);
    }
};

// ==============================
// 🔹 CREATE LOANS TABLE
// ==============================
const createLoansTable = async () => {
    const query = `
        CREATE TABLE IF NOT EXISTS loans (
            id SERIAL PRIMARY KEY,
            employee_id INTEGER REFERENCES employees(id) ON DELETE CASCADE,
            amount NUMERIC(10,2) NOT NULL,
            reason TEXT,
            status VARCHAR(20) DEFAULT 'pending',
            applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            approved_by INTEGER REFERENCES employees(id)
        );
    `;

    try {
        await pool.query(query);
        console.log("✅ Loans table ready");
    } catch (err) {
        console.error("❌ Error creating loans table:", err);
    }
};

// ==============================
// 🔹 CREATE LEAVE BALANCE TABLE
// ==============================
const createLeaveBalanceTable = async () => {
    try {

        const query = `
        CREATE TABLE IF NOT EXISTS leave_balances (
            id SERIAL PRIMARY KEY,
            employee_id INTEGER REFERENCES employees(id) ON DELETE CASCADE,
            leave_type_id INTEGER REFERENCES leave_types(id) ON DELETE CASCADE,
            total_days INTEGER DEFAULT 0,
            used_days INTEGER DEFAULT 0,
            remaining_days INTEGER DEFAULT 0,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        `;

        await pool.query(query);

        console.log("? Leave balance table ready");

    } catch (err) {
        console.error("Leave balance table error:", err);
    }
};

// ==============================
// CREATE LEAVE POLICY TABLE
// ==============================
const createLeavePolicyTable = async () => {
    try {
        const query = `
        CREATE TABLE IF NOT EXISTS leave_policies (
            id SERIAL PRIMARY KEY,
            leave_type_id INTEGER REFERENCES leave_types(id) ON DELETE CASCADE,
            carry_forward_limit INTEGER DEFAULT 0,
            encashment_allowed BOOLEAN DEFAULT false,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        `;

        await pool.query(query);
        console.log("✅ Leave policy table ready");
    } catch (err) {
        console.error("Leave policy table error:", err);
    }
};

// ==============================
// CREATE HOLIDAYS TABLE
// ==============================
const createHolidayTable = async () => {
    try {
        const query = `
        CREATE TABLE IF NOT EXISTS holidays (
            id SERIAL PRIMARY KEY,
            name VARCHAR(150) NOT NULL,
            holiday_date DATE NOT NULL,
            description TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        `;

        await pool.query(query);

        console.log("✅ Holidays table ready");
    } catch (err) {
        console.error("Holiday table error:", err);
    }
};

// ==============================
// 🔹 CREATE JOB POSTS TABLE
// ==============================
const createJobPostsTable = async () => {
    const query = `
        CREATE TABLE IF NOT EXISTS job_posts (
            id SERIAL PRIMARY KEY,
            title VARCHAR(150) NOT NULL,
            department VARCHAR(100),
            description TEXT,
            status VARCHAR(20) DEFAULT 'open',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;

    try {
        await pool.query(query);
        console.log("✅ Job posts table ready");
    } catch (err) {
        console.error("❌ Error creating job posts table:", err);
    }
};

// ==============================
// 🔹 CREATE CANDIDATES TABLE
// ==============================
const createCandidatesTable = async () => {
    const query = `
        CREATE TABLE IF NOT EXISTS candidates (
            id SERIAL PRIMARY KEY,
            name VARCHAR(150) NOT NULL,
            email VARCHAR(150),
            phone VARCHAR(20),
            resume_url TEXT,
            job_id INTEGER REFERENCES job_posts(id) ON DELETE CASCADE,
            status VARCHAR(30) DEFAULT 'applied',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;

    try {
        await pool.query(query);
        console.log("✅ Candidates table ready");
    } catch (err) {
        console.error("❌ Error creating candidates table:", err);
    }
};

// ==============================
// 🔹 CREATE INTERVIEWS TABLE
// ==============================
const createInterviewsTable = async () => {
    const query = `
        CREATE TABLE IF NOT EXISTS interviews (
            id SERIAL PRIMARY KEY,
            candidate_id INTEGER REFERENCES candidates(id) ON DELETE CASCADE,
            interviewer_id INTEGER REFERENCES employees(id),
            interview_date TIMESTAMP,
            status VARCHAR(30) DEFAULT 'scheduled',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;

    try {
        await pool.query(query);
        console.log("✅ Interviews table ready");
    } catch (err) {
        console.error("❌ Error creating interviews table:", err);
    }
};

// ==============================
// 🔹 CREATE EXIT REQUESTS TABLE
// ==============================
const createExitRequestsTable = async () => {
    const query = `
        CREATE TABLE IF NOT EXISTS exit_requests (
            id SERIAL PRIMARY KEY,
            employee_id INTEGER REFERENCES employees(id) ON DELETE CASCADE,
            reason TEXT,
            status VARCHAR(30) DEFAULT 'pending',
            requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            approved_by INTEGER REFERENCES employees(id)
        );
    `;

    try {
        await pool.query(query);
        console.log("✅ Exit requests table ready");
    } catch (err) {
        console.error("❌ Error creating exit requests table:", err);
    }
};

// ==============================
// INSERT DEFAULT LEAVE TYPES
// ==============================
const insertDefaultLeaveTypes = async () => {
    try {
        const result = await pool.query("SELECT COUNT(*) FROM leave_types");

        if (parseInt(result.rows[0].count) === 0) {
            await pool.query(`
                INSERT INTO leave_types (name, description)
                VALUES
                ('Sick Leave', 'Medical leave'),
                ('Casual Leave', 'Personal leave'),
                ('Annual Leave', 'Yearly leave')
            `);

            console.log("Default leave types inserted");
        }
    } catch (err) {
        console.error("Error inserting leave types:", err);
    }
};

// ===============================
// SEED DEFAULT ADMIN (ONE-TIME)
// ===============================
const seedAdmin = async () => {
    try {
        const email = process.env.DEFAULT_ADMIN_EMAIL || "admin@company.com";
        const plainPassword = process.env.DEFAULT_ADMIN_PASSWORD || "Admin@123";

        const existing = await pool.query(
            "SELECT id FROM employees WHERE email = $1",
            [email]
        );

        if (existing.rows.length === 0) {
            const hashedPassword = await bcrypt.hash(plainPassword, 10);

            await pool.query(
                `
                INSERT INTO employees (first_name, last_name, email, password, role)
                VALUES ($1, $2, $3, $4, $5)
                `,
                ["Admin", "User", email, hashedPassword, "Admin"]
            );

            console.log("Default admin created");
        }
    } catch (err) {
        console.error("Error seeding admin:", err);
    }
};

// ==============================
// INITIALIZE DATABASE TABLES
// ==============================
const initializeTables = async () => {
    console.log("Initializing database...");

    await createEmployeesTable();
    await updateEmployeesTable();
    await addEmployeeLocationColumn();
    await addRFIDColumn();
    await addQRCodeColumn();
    await addBiometricColumn();
    await addDeviceCodeColumn();
    await createEmergencyContactsTable();
    await createEmploymentHistoryTable();
    await createEmployeeDocumentsTable();
    await createCustomFieldsTable();
    await createShiftsTable();
    await createEmployeeShiftsTable();
    await createDepartmentsTable();
    await createAttendanceTable();
    await addAttendanceMethodColumn();
    await addOvertimeColumn();
    await addAttendanceStatus();
    await updateAttendanceGPS();
    await createLeaveTypesTable();
    await createLeaveRequestsTable();
    await insertDefaultLeaveTypes();
    await createAssetsTable();
    await updateAssetStatus();
    await createAssetAssignmentsTable();
    await createAssetMaintenanceTable();
    await createSalaryTable();
    await updateSalaryColumns();
    await addCurrencyColumn();
    await createTaxRulesTable();
    await createAuditLogTable();
    await createPerformanceTable();
    await createKpiTable();
    await createFeedbackTable();
    await createAppraisalCycleTable();
    await createAppraisalResultTable();
    await createLoansTable();
    await createLeaveBalanceTable();
    await createLeavePolicyTable();
    await createHolidayTable();
    await createJobPostsTable();
    await createCandidatesTable();
    await createInterviewsTable();
    await createExitRequestsTable();

    console.log("Database initialization completed");
};

// Version 1 payroll formula:
// daily_salary = basic_salary / 30
// final_salary = present_days * daily_salary
const calculateSalaryV1 = (basicSalary, presentDays) => {
    const dailySalary = Number(basicSalary) / 30;
    return Number((presentDays * dailySalary).toFixed(2));
};

// ==============================
// ROUTES
// ==============================
const employeeRoutes = require("./routes/employee.routes");
const authRoutes = require("./routes/auth.routes");
const attendanceRoutes = require("./routes/attendance.routes");
const leaveRoutes = require("./routes/leave.routes");
const assetRoutes = require("./routes/asset.routes");
const payrollRoutes = require("./routes/payroll.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const employeeDashboardRoutes = require("./routes/employeeDashboard.routes");
const performanceRoutes = require("./routes/performance.routes");
const loanRoutes = require("./routes/loan.routes");
const departmentRoutes = require("./routes/department.routes");
const leaveBalanceRoutes = require("./routes/leaveBalance.routes");
const jobRoutes = require("./routes/job.routes");
const candidateRoutes = require("./routes/candidate.routes");
const interviewRoutes = require("./routes/interview.routes");
const exitRoutes = require("./routes/exit.routes");
const emergencyRoutes = require("./routes/emergency.routes");
const employmentRoutes = require("./routes/employment.routes");
const documentRoutes = require("./routes/documents.routes");
const customFieldsRoutes = require("./routes/customfields.routes");
const shiftRoutes = require("./routes/shift.routes");
const deviceRoutes = require("./routes/device.routes");
const holidayRoutes = require("./routes/holiday.routes");

app.use("/api/employees", employeeRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/leave", leaveRoutes);
app.use("/api/assets", assetRoutes);
app.use("/api/payroll", payrollRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/employee-dashboard", employeeDashboardRoutes);
app.use("/api/performance", performanceRoutes);
app.use("/api/loans", loanRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/leave-balance", leaveBalanceRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/candidates", candidateRoutes);
app.use("/api/interviews", interviewRoutes);
app.use("/api/exit", exitRoutes);
app.use("/api/emergency", emergencyRoutes);
app.use("/api/employment-history", employmentRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/custom-fields", customFieldsRoutes);
app.use("/api/shifts", shiftRoutes);
app.use("/api/device", deviceRoutes);
app.use("/api/holidays", holidayRoutes);

// ==============================
// ROOT ROUTE
// ==============================
app.get("/", (req, res) => {
    res.send("Server Working");
});

// Global Express error handler
app.use((err, req, res, next) => {
    console.error("EXPRESS ERROR:", err);
    if (res.headersSent) {
        return next(err);
    }
    return res.status(500).json({ message: "Server error" });
});

// ==============================
// START SERVER
// ==============================
const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {

        await initializeTables();

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });

    } catch (error) {
        console.error("Server startup error:", error);
    }
};

startServer();
