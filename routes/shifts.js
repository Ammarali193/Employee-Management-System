const express = require("express");
const router = express.Router();
const db = require("../config/db"); // 👈 Correct project DB connection

// ✅ GET ALL SHIFTS
router.get("/shifts", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM shifts ORDER BY id DESC");
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching shifts:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ CREATE SHIFT (🔥 YE MISSING THA)
router.post("/shifts", async (req, res) => {
  const { name, start_time, end_time } = req.body;

  try {
    const result = await db.query(
      "INSERT INTO shifts (name, start_time, end_time) VALUES ($1, $2, $3) RETURNING *",
      [name, start_time, end_time]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error creating shift:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
