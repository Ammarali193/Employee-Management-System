const Performance = require("../models/Performance");
const { sendError, sendSuccess } = require("./apiResponse");

const createPerformance = async (req, res) => {
    try {
        const { employee_id, rating, feedback } = req.body || {};

        if (!employee_id || rating === undefined) {
            return sendError(res, "employee_id and rating are required", 400);
        }

        const ratingValue = Number(rating);

        if (Number.isNaN(ratingValue) || ratingValue < 1 || ratingValue > 5) {
            return sendError(res, "rating must be between 1 and 5", 400);
        }

        const created = await Performance.create({
            employee_id,
            rating: ratingValue,
            feedback: feedback || null
        });

        return sendSuccess(res, created, "Performance created", 201);
    } catch (error) {
        console.error("Create performance error:", error);
        return sendError(res, "Internal server error", 500);
    }
};

const getPerformance = async (_req, res) => {
    try {
        const rows = await Performance.findAll();
        return sendSuccess(res, rows, "Performance fetched");
    } catch (error) {
        console.error("Get performance error:", error);
        return sendError(res, "Internal server error", 500);
    }
};

module.exports = {
    createPerformance,
    getPerformance
};
