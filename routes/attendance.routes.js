const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const auth = require("../middleware/authMiddleware");

// Health check route
router.get("/attendance", auth([]), async (req, res) => {
  const user = req.user;
  if (!user || !user.role || user.role.toLowerCase() !== "admin") {
    return res.status(403).json({ error: "Forbidden" });
  }

  res.json({ message: "Attendance data" });
});

// GET all attendance
router.get("/", auth([]), async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        a.id,
        a.employee_id,
        e.name AS employee_name,
        a.check_in,
        a.check_out,
        a.status
      FROM attendance a
      JOIN employees e ON a.employee_id = e.id
      ORDER BY a.check_in DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});
// ✅ STATS - dashboard cards ke liye
// ✅ GET Attendance Stats (MOCK)
router.get("/stats", (req, res) => {
  res.json({
    total: 10,
    present: 8,
    absent: 2,
  });
});

// ==============================
// ✅ CHECK-IN ROUTE
// ==============================
// ✅ POST Check-in (MOCK)
router.post("/checkin", (req, res) => {
  res.json({
    message: "Check-in successful",
  });
});

// ==============================
// ✅ CHECK-OUT ROUTE
// ==============================
router.post("/checkout", auth([]), async (req, res) => {
  try {
    const employee_id = req.body.employee_id || req.user.id;
    const result = await pool.query(
      `UPDATE attendance SET check_out = NOW()
       WHERE employee_id = $1 
         AND DATE(check_in) = CURRENT_DATE
         AND check_out IS NULL
       RETURNING *`,
      [employee_id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "No active check-in found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/my", async (req, res) => {
    try {
        const employeeId = req.user?.id || req.query.employee_id;

        if (!employeeId) {
            return res.status(400).json({
                message: "employee_id is required when auth is disabled"
            });
        }

        const result = await pool.query(
            `
            SELECT * FROM attendance
            WHERE employee_id = $1
            ORDER BY check_in DESC
            `,
            [employeeId]
        );

        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

router.get("/history", auth([]), async (req, res) => {
    try {
        const employeeId = req.user.id;

        const result = await pool.query(
            `
            SELECT * FROM attendance
            WHERE employee_id = $1
            ORDER BY created_at DESC
            `,
            [employeeId]
        );

        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

// ==============================
// 🔹 MONTHLY ATTENDANCE REPORT
// ==============================
router.post("/rfid/checkin", async (req, res) => {
    try {

        const { rfid_card_id } = req.body;

        const employee = await pool.query(
            `
            SELECT id FROM employees
            WHERE rfid_card_id = $1
            `,
            [rfid_card_id]
        );

        if (employee.rows.length === 0) {
            return res.status(404).json({
                message: "RFID card not registered"
            });
        }

        const employee_id = employee.rows[0].id;

        const result = await pool.query(
            `
            INSERT INTO attendance (employee_id, check_in, method)
            VALUES ($1, NOW(), 'RFID')
            RETURNING *
            `,
            [employee_id]
        );

        res.json({
            message: "RFID check-in successful",
            attendance: result.rows[0]
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

router.post("/rfid/checkout", async (req, res) => {
    try {

        const { rfid_card_id } = req.body;

        const employee = await pool.query(
            `
            SELECT id FROM employees
            WHERE rfid_card_id = $1
            `,
            [rfid_card_id]
        );

        if (employee.rows.length === 0) {
            return res.status(404).json({
                message: "RFID card not registered"
            });
        }

        const employee_id = employee.rows[0].id;

        const result = await pool.query(
            `
            UPDATE attendance
            SET check_out = NOW()
            WHERE employee_id = $1
            AND DATE(check_in) = CURRENT_DATE
            RETURNING *
            `,
            [employee_id]
        );

        res.json({
            message: "RFID check-out successful",
            attendance: result.rows[0]
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

router.post("/qr/checkin", async (req, res) => {
    try {

        const { qr_code } = req.body;

        const employee = await pool.query(
            `
            SELECT id FROM employees
            WHERE qr_code = $1
            `,
            [qr_code]
        );

        if (employee.rows.length === 0) {
            return res.status(404).json({
                message: "QR code not registered"
            });
        }

        const employee_id = employee.rows[0].id;

        const result = await pool.query(
            `
            INSERT INTO attendance (employee_id, check_in, method)
            VALUES ($1, NOW(), 'QR')
            RETURNING *
            `,
            [employee_id]
        );

        res.json({
            message: "QR check-in successful",
            attendance: result.rows[0]
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

router.post("/qr/checkout", async (req, res) => {
    try {

        const { qr_code } = req.body;

        const employee = await pool.query(
            `
            SELECT id FROM employees
            WHERE qr_code = $1
            `,
            [qr_code]
        );

        if (employee.rows.length === 0) {
            return res.status(404).json({
                message: "QR code not registered"
            });
        }

        const employee_id = employee.rows[0].id;

        const result = await pool.query(
            `
            UPDATE attendance
            SET check_out = NOW()
            WHERE employee_id = $1
            AND DATE(check_in) = CURRENT_DATE
            RETURNING *
            `,
            [employee_id]
        );

        res.json({
            message: "QR check-out successful",
            attendance: result.rows[0]
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

router.post("/gps/checkin", auth([]), async (req, res) => {
    try {

        const employee_id = req.user.id;
        const { location_lat, location_lng } = req.body;

        if (!location_lat || !location_lng) {
            return res.status(400).json({
                message: "GPS location required"
            });
        }

        const result = await pool.query(
            `
            INSERT INTO attendance
            (employee_id, check_in, method, location_lat, location_lng)
            VALUES ($1, NOW(), 'GPS', $2, $3)
            RETURNING *
            `,
            [employee_id, location_lat, location_lng]
        );

        res.json({
            message: "GPS check-in successful",
            attendance: result.rows[0]
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

router.post("/gps/checkout", auth([]), async (req, res) => {
    try {

        const employee_id = req.user.id;

        const result = await pool.query(
            `
            UPDATE attendance
            SET check_out = NOW()
            WHERE employee_id = $1
            AND DATE(check_in) = CURRENT_DATE
            RETURNING *
            `,
            [employee_id]
        );

        res.json({
            message: "GPS check-out successful",
            attendance: result.rows[0]
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

router.post("/biometric/checkin", async (req, res) => {
    try {

        const { biometric_id } = req.body;

        const employee = await pool.query(
            `
            SELECT id FROM employees
            WHERE biometric_id = $1
            `,
            [biometric_id]
        );

        if (employee.rows.length === 0) {
            return res.status(404).json({
                message: "Biometric ID not registered"
            });
        }

        const employee_id = employee.rows[0].id;

        const result = await pool.query(
            `
            INSERT INTO attendance (employee_id, check_in, method)
            VALUES ($1, NOW(), 'Biometric')
            RETURNING *
            `,
            [employee_id]
        );

        res.json({
            message: "Biometric check-in successful",
            attendance: result.rows[0]
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

router.post("/biometric/checkout", async (req, res) => {
    try {

        const { biometric_id } = req.body;

        const employee = await pool.query(
            `
            SELECT id FROM employees
            WHERE biometric_id = $1
            `,
            [biometric_id]
        );

        if (employee.rows.length === 0) {
            return res.status(404).json({
                message: "Biometric ID not registered"
            });
        }

        const employee_id = employee.rows[0].id;

        const result = await pool.query(
            `
            UPDATE attendance
            SET check_out = NOW()
            WHERE employee_id = $1
            AND DATE(check_in) = CURRENT_DATE
            RETURNING *
            `,
            [employee_id]
        );

        res.json({
            message: "Biometric check-out successful",
            attendance: result.rows[0]
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

router.get("/monthly/:employeeId", auth([]), async (req, res) => {
    try {
        const { employeeId } = req.params;
        const { month, year } = req.query;

        if (!month || !year) {
            return res.status(400).json({
                message: "Month and year are required"
            });
        }

        const result = await pool.query(
            `
            SELECT 
                COUNT(*) FILTER (WHERE check_out IS NOT NULL) AS present_days,
                COALESCE(SUM(work_hours), 0) AS total_hours
            FROM attendance
            WHERE employee_id = $1
            AND EXTRACT(MONTH FROM check_in) = $2
            AND EXTRACT(YEAR FROM check_in) = $3
            `,
            [employeeId, month, year]
        );

        res.json({
            employee_id: employeeId,
            month,
            year,
            present_days: result.rows[0].present_days,
            total_hours: result.rows[0].total_hours
        });

    } catch (error) {
        console.error("Monthly report error:", error);
        res.status(500).json({
            message: "Server error"
        });
    }
});

// ==============================
// DAILY ATTENDANCE REPORT
// ==============================
router.get("/report/daily", auth(["Admin"]), async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                e.id,
                e.first_name,
                e.last_name,
                a.check_in,
                a.check_out,
                a.status,
                a.overtime_hours
            FROM attendance a
            JOIN employees e ON a.employee_id = e.id
            WHERE DATE(a.check_in) = CURRENT_DATE
            ORDER BY e.first_name
        `);

        res.json({
            date: new Date().toISOString().split("T")[0],
            records: result.rows
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

// ==============================
// WEEKLY ATTENDANCE REPORT
// ==============================
router.get("/report/weekly", auth(["Admin"]), async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                e.first_name,
                e.last_name,
                COUNT(a.id) AS total_days,
                SUM(a.overtime_hours) AS total_overtime
            FROM attendance a
            JOIN employees e ON a.employee_id = e.id
            WHERE DATE(a.check_in) >= CURRENT_DATE - INTERVAL '7 days'
            GROUP BY e.first_name, e.last_name
            ORDER BY e.first_name
        `);

        res.json({
            period: "Last 7 days",
            records: result.rows
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

// ==============================
// MONTHLY ATTENDANCE REPORT
// ==============================
router.get("/report/monthly", auth(["Admin"]), async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                e.first_name,
                e.last_name,
                COUNT(a.id) AS days_present,
                SUM(a.overtime_hours) AS total_overtime
            FROM attendance a
            JOIN employees e ON a.employee_id = e.id
            WHERE DATE_TRUNC('month', a.check_in) = DATE_TRUNC('month', CURRENT_DATE)
            GROUP BY e.first_name, e.last_name
            ORDER BY e.first_name
        `);

        res.json({
            month: new Date().toLocaleString("default", { month: "long" }),
            records: result.rows
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

router.get("/reports", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        e.id,
        e.name,
        COUNT(a.id) FILTER (WHERE a.status = 'present') AS present_days,
        COUNT(a.id) FILTER (WHERE a.status = 'absent') AS absent_days,
        COALESCE(
          SUM(EXTRACT(EPOCH FROM (a.check_out - a.check_in)) / 3600),
          0
        ) AS total_hours
      FROM employees e
      LEFT JOIN attendance a ON e.id = a.employee_id
      GROUP BY e.id, e.name
      ORDER BY e.id;
    `);

    res.json(result.rows);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal error" });
  }
});

router.post("/mark-absent", auth(["Admin"]), async (req, res) => {
    try {
        const employees = await pool.query(`
            SELECT id FROM employees
        `);

        const today = new Date().toISOString().split("T")[0];

        for (const emp of employees.rows) {
            const attendance = await pool.query(
                `
                SELECT * FROM attendance
                WHERE employee_id = $1 AND DATE(check_in) = $2
                `,
                [emp.id, today]
            );

            const leave = await pool.query(
                `
                SELECT * FROM leave_requests
                WHERE employee_id = $1
                AND status = 'approved'
                AND $2 BETWEEN start_date AND end_date
                `,
                [emp.id, today]
            );

            if (attendance.rows.length === 0 && leave.rows.length === 0) {
                await pool.query(
                    `
                    INSERT INTO attendance
                    (employee_id, status)
                    VALUES ($1, 'Absent')
                    `,
                    [emp.id]
                );
            }
        }

        res.json({
            message: "Absence detection completed"
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
