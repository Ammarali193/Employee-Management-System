const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/auth.middleware");

// GET all maintenance records
router.get("/maintenance", verifyToken, async (req, res) => {
  try {
    // dummy data (test ke liye)
    const data = [
      { id: 1, asset: "AC", status: "pending" },
      { id: 2, asset: "Generator", status: "completed" },
    ];

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// PUT update maintenance record
router.put("/maintenance/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    // dummy update
    res.json({ message: "Updated successfully", id });
  } catch (error) {
    res.status(500).json({ error: "Update failed" });
  }
});

module.exports = router;
