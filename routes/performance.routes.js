const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const { verifyToken, authorizeRoles } = require("../middlewares/auth.middleware");

// GET all performance records
router.get("/", verifyToken, authorizeRoles("Admin", "HR"), async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                p.id,
                e.first_name,
                e.last_name,
                p.rating AS score,
                p.comments AS feedback
            FROM performance_reviews p
            JOIN employees e ON p.employee_id = e.id
            ORDER BY p.id DESC
        `);

        res.json({
            records: result.rows
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

// ADD PERFORMANCE REVIEW (Admin Only)
router.post("/add", verifyToken, authorizeRoles("Admin", "HR"), async (req, res) => {
    try {
        const {
            employee_id,
            score,
            feedback,
            rating,
            review_period,
            comments
        } = req.body;

        const finalScore = score ?? rating;
        const finalFeedback = feedback ?? comments;
        const finalReviewPeriod = review_period ?? "General";

        if (!employee_id || finalScore == null) {
            return res.status(400).json({
                message: "Employee ID and score are required"
            });
        }

        const result = await pool.query(
            `
            INSERT INTO performance_reviews
            (employee_id, reviewer_id, rating, review_period, comments)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
            `,
            [employee_id, req.user.id, finalScore, finalReviewPeriod, finalFeedback]
        );

        const record = {
            ...result.rows[0],
            score: result.rows[0].rating,
            feedback: result.rows[0].comments
        };

        res.status(201).json({
            message: "Performance added",
            record,
            review: result.rows[0]
        });

    } catch (error) {
        console.error("Performance add error:", error);
        res.status(500).json({
            message: "Server error"
        });
    }
});

// TOP performers
router.get("/top", verifyToken, authorizeRoles("Admin", "HR"), async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                id,
                employee_id,
                rating AS score,
                comments AS feedback,
                review_period,
                created_at
            FROM performance_reviews
            ORDER BY rating DESC
            LIMIT 5
        `);

        res.json({
            top: result.rows
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

// PERFORMANCE SUMMARY (ADMIN)
router.get("/summary", verifyToken, authorizeRoles("Admin", "HR"), async (req, res) => {
    try {
        const totalReviews = await pool.query(
            `SELECT COUNT(*) FROM performance_reviews`
        );

        const avgRating = await pool.query(
            `SELECT AVG(rating) FROM performance_reviews`
        );

        const topPerformer = await pool.query(
            `
            SELECT 
                e.id,
                e.first_name,
                e.last_name,
                AVG(pr.rating) AS avg_rating
            FROM performance_reviews pr
            JOIN employees e ON pr.employee_id = e.id
            GROUP BY e.id
            ORDER BY avg_rating DESC
            LIMIT 1
            `
        );

        res.json({
            total_reviews: parseInt(totalReviews.rows[0].count),
            average_rating: parseFloat(avgRating.rows[0].avg) || 0,
            top_performer: topPerformer.rows[0] || null
        });

    } catch (error) {
        console.error("Performance summary error:", error);
        res.status(500).json({
            message: "Server error"
        });
    }
});

// GET MY PERFORMANCE
router.get("/me", verifyToken, async (req, res) => {
    try {
        const employeeId = req.user.id;

        const result = await pool.query(
            `
            SELECT pr.id, pr.rating, pr.review_period, pr.comments, pr.created_at
            FROM performance_reviews pr
            WHERE pr.employee_id = $1
            ORDER BY pr.created_at DESC
            `,
            [employeeId]
        );

        res.json({
            reviews: result.rows
        });

    } catch (error) {
        console.error("My performance fetch error:", error);
        res.status(500).json({
            message: "Server error"
        });
    }
});

// TOP PERFORMERS LIST
router.get("/top-performers", verifyToken, authorizeRoles("Admin", "HR"), async (req, res) => {
    try {
        const result = await pool.query(
            `
            SELECT 
                e.id,
                e.first_name,
                e.last_name,
                e.department,
                AVG(pr.rating) AS average_rating,
                COUNT(pr.id) AS total_reviews
            FROM performance_reviews pr
            JOIN employees e ON pr.employee_id = e.id
            GROUP BY e.id
            ORDER BY average_rating DESC
            LIMIT 5
            `
        );

        res.json({
            top_performers: result.rows
        });

    } catch (error) {
        console.error("Top performers error:", error);
        res.status(500).json({
            message: "Server error"
        });
    }
});

router.post("/kpi", verifyToken, authorizeRoles("Admin", "HR"), async (req,res)=>{
    try{

        const {employee_id, goal, target_value} = req.body;

        const result = await pool.query(`
        INSERT INTO kpis (employee_id, goal, target_value)
        VALUES ($1,$2,$3)
        RETURNING *
        `,[employee_id,goal,target_value]);

        res.json({
            message:"KPI created",
            kpi:result.rows[0]
        });

    }catch(error){
        console.error(error);
        res.status(500).json({message:"Server error"});
    }
});

router.put("/kpi/update/:id", verifyToken, async (req,res)=>{
    try{

        const {achieved_value} = req.body;

        const result = await pool.query(`
        UPDATE kpis
        SET achieved_value=$1
        WHERE id=$2
        RETURNING *
        `,[achieved_value,req.params.id]);

        res.json(result.rows[0]);

    }catch(error){
        res.status(500).json({message:"Server error"});
    }
});

router.post("/feedback", verifyToken, async (req,res)=>{
    try{

        const from_employee_id = req.user.id;
        const {to_employee_id, rating, comment} = req.body;

        const result = await pool.query(`
        INSERT INTO feedback
        (from_employee_id, to_employee_id, rating, comment)
        VALUES ($1,$2,$3,$4)
        RETURNING *
        `,[from_employee_id,to_employee_id,rating,comment]);

        res.json({
            message:"Feedback submitted",
            feedback:result.rows[0]
        });

    }catch(error){
        console.error(error);
        res.status(500).json({message:"Server error"});
    }
});

router.get("/feedback/:employee_id", verifyToken, async (req,res)=>{
    try{

        const result = await pool.query(`
        SELECT 
        f.rating,
        f.comment,
        e.first_name AS from_employee
        FROM feedback f
        JOIN employees e ON f.from_employee_id = e.id
        WHERE f.to_employee_id=$1
        ORDER BY f.created_at DESC
        `,[req.params.employee_id]);

        res.json({
            feedbacks:result.rows
        });

    }catch(error){
        console.error(error);
        res.status(500).json({message:"Server error"});
    }
});

router.post("/appraisal-cycle", verifyToken, authorizeRoles("Admin"), async (req,res)=>{
    try{

        const {name, year, start_date, end_date} = req.body;

        const result = await pool.query(`
        INSERT INTO appraisal_cycles
        (name, year, start_date, end_date)
        VALUES ($1,$2,$3,$4)
        RETURNING *
        `,[name,year,start_date,end_date]);

        res.json({
            message:"Appraisal cycle created",
            cycle:result.rows[0]
        });

    }catch(error){
        console.error(error);
        res.status(500).json({message:"Server error"});
    }
});

router.post("/appraisal-result", verifyToken, authorizeRoles("Admin"), async (req,res)=>{
    try{

        const {employee_id, cycle_id, rating, promotion, salary_increment, comments} = req.body;

        const result = await pool.query(`
        INSERT INTO appraisal_results
        (employee_id, cycle_id, rating, promotion, salary_increment, comments)
        VALUES ($1,$2,$3,$4,$5,$6)
        RETURNING *
        `,[employee_id,cycle_id,rating,promotion,salary_increment,comments]);

        res.json({
            message:"Appraisal recorded",
            appraisal:result.rows[0]
        });

    }catch(error){
        console.error(error);
        res.status(500).json({message:"Server error"});
    }
});

router.post("/training", verifyToken, authorizeRoles("Admin"), async (req,res)=>{
    try{

        const {course_name, description, duration_days} = req.body;

        const result = await pool.query(`
        INSERT INTO trainings (course_name, description, duration_days)
        VALUES ($1,$2,$3)
        RETURNING *
        `,[course_name,description,duration_days]);

        res.json({
            message:"Training course created",
            training:result.rows[0]
        });

    }catch(error){
        console.error(error);
        res.status(500).json({message:"Server error"});
    }
});

router.post("/training/assign", verifyToken, authorizeRoles("Admin"), async (req,res)=>{
    try{

        const {employee_id, training_id} = req.body;

        const result = await pool.query(`
        INSERT INTO employee_trainings (employee_id, training_id)
        VALUES ($1,$2)
        RETURNING *
        `,[employee_id,training_id]);

        res.json({
            message:"Training assigned",
            record:result.rows[0]
        });

    }catch(error){
        console.error(error);
        res.status(500).json({message:"Server error"});
    }
});

router.put("/training/complete/:id", verifyToken, async (req,res)=>{
    try{

        const result = await pool.query(`
        UPDATE employee_trainings
        SET status='Completed',
            completion_date=CURRENT_DATE
        WHERE id=$1
        RETURNING *
        `,[req.params.id]);

        res.json({
            message:"Training completed",
            record:result.rows[0]
        });

    }catch(error){
        console.error(error);
        res.status(500).json({message:"Server error"});
    }
});

router.get("/report/top-performers", verifyToken, authorizeRoles("Admin"), async (req,res)=>{
    try{

        const result = await pool.query(`
        SELECT 
        e.first_name,
        e.last_name,
        ar.rating
        FROM appraisal_results ar
        JOIN employees e ON ar.employee_id = e.id
        ORDER BY ar.rating DESC
        LIMIT 10
        `);

        res.json({
            top_performers: result.rows
        });

    }catch(error){
        console.error(error);
        res.status(500).json({message:"Server error"});
    }
});

router.get("/report/kpi-progress", verifyToken, authorizeRoles("Admin"), async (req,res)=>{
    try{

        const result = await pool.query(`
        SELECT 
        e.first_name,
        e.last_name,
        k.goal,
        k.target_value,
        k.achieved_value
        FROM kpis k
        JOIN employees e ON k.employee_id = e.id
        ORDER BY k.created_at DESC
        `);

        res.json({
            kpi_progress: result.rows
        });

    }catch(error){
        console.error(error);
        res.status(500).json({message:"Server error"});
    }
});

// GET EMPLOYEE PERFORMANCE HISTORY
router.get("/:employeeId", verifyToken, async (req, res) => {
    try {
        const { employeeId } = req.params;

        const result = await pool.query(
            `
            SELECT pr.id, pr.rating, pr.review_period, pr.comments, pr.created_at,
                   e.first_name || ' ' || e.last_name AS reviewer_name
            FROM performance_reviews pr
            LEFT JOIN employees e ON pr.reviewer_id = e.id
            WHERE pr.employee_id = $1
            ORDER BY pr.created_at DESC
            `,
            [employeeId]
        );

        res.json({
            reviews: result.rows
        });

    } catch (error) {
        console.error("Performance fetch error:", error);
        res.status(500).json({
            message: "Server error"
        });
    }
});

module.exports = router;
