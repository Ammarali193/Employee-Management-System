const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const { verifyToken, authorizeRoles } = require("../middlewares/auth.middleware");
const { sendError, sendSuccess } = require("../controllers/apiResponse");

const ensureHolidaySchema = async () => {
    await pool.query(`
        ALTER TABLE holidays
        ADD COLUMN IF NOT EXISTS start_date DATE;
    `);

    await pool.query(`
        ALTER TABLE holidays
        ADD COLUMN IF NOT EXISTS end_date DATE;
    `);

    await pool.query(`
        ALTER TABLE holidays
        ADD COLUMN IF NOT EXISTS holiday_date DATE;
    `);

    await pool.query(`
        UPDATE holidays
        SET start_date = COALESCE(start_date, holiday_date),
            end_date = COALESCE(end_date, holiday_date)
        WHERE start_date IS NULL OR end_date IS NULL;
    `);
};

const createHolidayRecord = async (req, res) => {
    await ensureHolidaySchema();

    const { name, start_date, end_date, date } = req.body || {};
    const normalizedName = String(name || "").trim();
    const normalizedStartDate = String(start_date || date || "").trim();
    const normalizedEndDate = String(end_date || start_date || date || "").trim();

    if (!normalizedName || !normalizedStartDate || !normalizedEndDate) {
        return sendError(res, "name, start_date and end_date are required", 400);
    }

    if (new Date(normalizedEndDate) < new Date(normalizedStartDate)) {
        return sendError(res, "end_date must be greater than or equal to start_date", 400);
    }

    const result = await pool.query(`
    INSERT INTO holidays (name, start_date, end_date, holiday_date, description)
    VALUES ($1,$2,$3,$4,$5)
    RETURNING id, name, start_date, end_date
    `, [normalizedName, normalizedStartDate, normalizedEndDate, normalizedStartDate, null]);

    return sendSuccess(res, result.rows[0], "Holiday created", 201);
};


// CREATE HOLIDAY
router.post("/create", verifyToken, authorizeRoles("Admin", "Manager", "HR"), async (req,res)=>{
    try{
        return await createHolidayRecord(req, res);

    }catch(error){
        console.error(error);
        return sendError(res, "Server error", 500);
    }
});

router.post("/", verifyToken, authorizeRoles("Admin", "Manager", "HR"), async (req,res)=>{
    try {
        return await createHolidayRecord(req, res);
    }catch(error){
        console.error(error);
        return sendError(res, "Server error", 500);
    }
});


// GET ALL HOLIDAYS
router.get("/", verifyToken, async (req,res)=>{
    try{
        await ensureHolidaySchema();

        const result = await pool.query(`
        SELECT
            id,
            name,
            COALESCE(start_date, holiday_date) AS start_date,
            COALESCE(end_date, holiday_date) AS end_date
        FROM holidays
        ORDER BY COALESCE(start_date, holiday_date) ASC
        `);

        return sendSuccess(res, result.rows, "Holidays fetched");

    }catch(error){
        console.error(error);
        return sendError(res, "Server error", 500);
    }
});

module.exports = router;
