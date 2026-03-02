const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// 🔐 LOGIN
router.post("/login", async (req, res) => {
    try {
        console.log("BODY RECEIVED:", req.body);

        // 🔹 Check if body exists
        if (!req.body) {
            return res.status(400).json({ message: "Request body missing" });
        }

        const { email, password } = req.body;

        // 🔹 Validate input
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        // 🔹 Check JWT Secret
        if (!process.env.JWT_SECRET) {
            console.error("JWT_SECRET is missing in .env file");
            return res.status(500).json({ message: "JWT configuration error" });
        }

        // 1️⃣ Check if user exists
        const result = await pool.query(
            "SELECT * FROM employees WHERE email = $1",
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        const user = result.rows[0];

        // 2️⃣ Compare password
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // 3️⃣ Generate JWT Token
        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.status(200).json({
            message: "Login successful",
            token
        });

    } catch (error) {
        console.error("LOGIN ERROR:", error);

        res.status(500).json({
            message: "Server Error",
            error: error.message
        });
    }
});

module.exports = router;