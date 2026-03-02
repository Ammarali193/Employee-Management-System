const express = require("express");
require("dotenv").config();

const pool = require("./config/db");

const app = express();
app.use(express.json());


// ==============================
// 🔹 CREATE EMPLOYEES TABLE
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
        console.log("✅ Employees table ready");
    } catch (err) {
        console.error("❌ Error creating employees table:", err);
    }
};


// ==============================
// 🔹 CREATE ATTENDANCE TABLE
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
        console.log("✅ Attendance table ready");
    } catch (err) {
        console.error("❌ Error creating attendance table:", err);
    }
};


// ==============================
// 🔹 INITIALIZE DATABASE TABLES
// ==============================
const initializeTables = async () => {
    await createEmployeesTable();
    await createAttendanceTable();
};

initializeTables();


// ==============================
// 🔹 ROUTES
// ==============================
const employeeRoutes = require("./routes/employee.routes");
const authRoutes = require("./routes/auth.routes");
const attendanceRoutes = require("./routes/attendance.routes");

app.use("/api/employees", employeeRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/attendance", attendanceRoutes);


// ==============================
// 🔹 ROOT ROUTE
// ==============================
app.get("/", (req, res) => {
    res.send("🚀 EMS Backend Running");
});


// ==============================
// 🔹 START SERVER
// ==============================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🔥 Server running on port ${PORT}`);
});