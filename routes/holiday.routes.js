const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const { verifyToken, authorizeRoles } = require("../middlewares/auth.middleware");


// CREATE HOLIDAY
router.post("/create", verifyToken, authorizeRoles("Admin"), async (req,res)=>{
    try{

        const {name, holiday_date, description} = req.body;

        const result = await pool.query(`
        INSERT INTO holidays (name, holiday_date, description)
        VALUES ($1,$2,$3)
        RETURNING *
        `,[name,holiday_date,description]);

        res.json({
            message:"Holiday created",
            holiday:result.rows[0]
        });

    }catch(error){
        console.error(error);
        res.status(500).json({message:"Server error"});
    }
});


// GET ALL HOLIDAYS
router.get("/", verifyToken, async (req,res)=>{
    try{

        const result = await pool.query(`
        SELECT * FROM holidays
        ORDER BY holiday_date ASC
        `);

        res.json({
            holidays:result.rows
        });

    }catch(error){
        console.error(error);
        res.status(500).json({message:"Server error"});
    }
});

module.exports = router;
