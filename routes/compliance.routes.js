const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const { verifyToken, authorizeRoles } = require("../middlewares/auth.middleware");

router.post("/policy", verifyToken, authorizeRoles("Admin"), async (req,res)=>{
    try{

        const {title, category, description} = req.body;

        const result = await pool.query(`
        INSERT INTO policies (title, category, description)
        VALUES ($1,$2,$3)
        RETURNING *
        `,[title,category,description]);

        res.json({
            message:"Policy created",
            policy:result.rows[0]
        });

    }catch(error){
        console.error(error);
        res.status(500).json({message:"Server error"});
    }
});

router.get("/report/audit-logs", verifyToken, authorizeRoles("Admin"), async (req,res)=>{
    try{

        const result = await pool.query(`
        SELECT 
        a.action,
        a.module AS entity,
        a.created_at,
        e.first_name,
        e.last_name
        FROM audit_logs a
        JOIN employees e ON a.user_id = e.id
        ORDER BY a.created_at DESC
        `);

        res.json({
            audit_report: result.rows
        });

    }catch(error){
        console.error(error);
        res.status(500).json({message:"Server error"});
    }
});

router.get("/report/policies", verifyToken, authorizeRoles("Admin"), async (req,res)=>{
    try{

        const result = await pool.query(`
        SELECT 
        title,
        category,
        created_at
        FROM policies
        ORDER BY created_at DESC
        `);

        res.json({
            policies_report: result.rows
        });

    }catch(error){
        console.error(error);
        res.status(500).json({message:"Server error"});
    }
});

router.get("/report/system-activity", verifyToken, authorizeRoles("Admin"), async (req,res)=>{
    try{

        const result = await pool.query(`
        SELECT 
        action,
        module AS entity,
        created_at
        FROM audit_logs
        ORDER BY created_at DESC
        LIMIT 20
        `);

        res.json({
            system_activity: result.rows
        });

    }catch(error){
        console.error(error);
        res.status(500).json({message:"Server error"});
    }
});

module.exports = router;
