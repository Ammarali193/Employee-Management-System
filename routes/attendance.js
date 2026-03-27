// const express = require("express");

// const router = express.Router();
// const pool = require("../config/db");

// // GET all attendance
// router.get("/", async (req, res) => {
//     try {
//         const result = await pool.query(`
//             SELECT
//                 a.id,
//                 e.name AS employee_name,
//                 a.check_in,
//                 a.check_out,
//                 a.status
//             FROM attendance a
//             JOIN employees e
//                 ON a.employee_id = e.id
//             ORDER BY a.check_in DESC
//         `);

//         res.json(result.rows);
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ error: "Server error" });
//     }
// });

// router.get("/reports", async (req, res) => {
//     try {
//         const result = await pool.query(`
//             SELECT
//                 e.id AS employee_id,
//                 e.name AS employee_name,
//                 COUNT(CASE WHEN a.status = 'Present' THEN 1 END) AS present,
//                 COUNT(CASE WHEN a.status = 'Absent' THEN 1 END) AS absent,
//                 COALESCE(
//                     SUM(EXTRACT(EPOCH FROM (a.check_out - a.check_in)) / 3600),
//                     0
//                 ) AS hours
//             FROM attendance a
//             JOIN employees e
//                 ON a.employee_id = e.id
//             GROUP BY e.id, e.name
//         `);

//         res.json(result.rows);
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ error: "Server error" });
//     }
// });

// module.exports = router;


 // New Code 
 const express = require("express");
const router = express.Router();
const pool = require("../config/db");

// ✅ GET stats - dashboard cards ke liye
router.get("/stats", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        COUNT(*) AS total,
        COUNT(CASE WHEN status = 'Present' THEN 1 END) AS present,
        COUNT(CASE WHEN status = 'Absent' THEN 1 END) AS absent
      FROM attendance
      WHERE DATE(check_in) = CURRENT_DATE
    `);
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ POST check-in
router.post("/checkin", async (req, res) => {
  const { employee_id } = req.body;
  try {
    const result = await pool.query(`
      INSERT INTO attendance (employee_id, check_in, status)
      VALUES ($1, NOW(), 'Present')
      RETURNING *
    `, [employee_id]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ POST check-out
router.post("/checkout", async (req, res) => {
  const { employee_id } = req.body;
  try {
    const result = await pool.query(`
      UPDATE attendance
      SET check_out = NOW()
      WHERE employee_id = $1
        AND DATE(check_in) = CURRENT_DATE
        AND check_out IS NULL
      RETURNING *
    `, [employee_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "No active check-in found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ GET all attendance (already tha)
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        a.id,
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

// ✅ GET reports (already tha)
router.get("/reports", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        e.id AS employee_id,
        e.name AS employee_name,
        COUNT(CASE WHEN a.status = 'Present' THEN 1 END) AS present,
        COUNT(CASE WHEN a.status = 'Absent' THEN 1 END) AS absent,
        COALESCE(
          SUM(EXTRACT(EPOCH FROM (a.check_out - a.check_in)) / 3600), 0
        ) AS hours
      FROM attendance a
      JOIN employees e ON a.employee_id = e.id
      GROUP BY e.id, e.name
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;