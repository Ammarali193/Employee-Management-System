const express = require("express");
require("dotenv").config();
const bcrypt = require("bcryptjs");

const pool = require("./config/db");

const app = express();
app.use(express.json());

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
            leave_type_id INTEGER REFERENCES leave_types(id),
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
// CREATE SALARY TABLE
// ==============================
const createSalaryTable = async () => {
    const query = `
        CREATE TABLE IF NOT EXISTS salaries (
            id SERIAL PRIMARY KEY,
            employee_id INTEGER REFERENCES employees(id) ON DELETE CASCADE,
            basic_salary NUMERIC(10,2) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;

    try {
        await pool.query(query);
        console.log("Salary table ready");
    } catch (err) {
        console.error("Error creating salary table:", err);
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

// ==============================
// SEED DEFAULT ADMIN (ONE-TIME)
// ==============================
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
    await createEmployeesTable();
    await createAttendanceTable();
    await createLeaveTypesTable();
    await createLeaveRequestsTable();
    await createSalaryTable();
    await insertDefaultLeaveTypes();
    await createAssetsTable();
    await createAssetAssignmentsTable();
    await seedAdmin();
};

initializeTables();

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

app.use("/api/employees", employeeRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/leave", leaveRoutes);
app.use("/api/assets", assetRoutes);

// ==============================
// ROOT ROUTE
// ==============================
app.get("/", (req, res) => {
    res.send("EMS Backend Running");
});

// ==============================
// START SERVER
// ==============================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
