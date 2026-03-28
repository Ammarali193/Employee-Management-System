const Compliance = require("../models/Compliance");
const { sendError, sendSuccess } = require("./apiResponse");

const createCompliance = async (req, res) => {
    try {
        const { policy_name, violation, action_taken } = req.body || {};

        if (!policy_name) {
            return sendError(res, "policy_name is required", 400);
        }

        const created = await Compliance.create({
            policy_name,
            violation: violation || null,
            action_taken: action_taken || null
        });

        return sendSuccess(res, created, "Compliance record created", 201);
    } catch (error) {
        console.error("Create compliance error:", error);
        return sendError(res, "Internal server error", 500);
    }
};

const getCompliance = async (_req, res) => {
    try {
        const rows = await Compliance.findAll();
        return sendSuccess(res, rows, "Compliance fetched");
    } catch (error) {
        console.error("Get compliance error:", error);
        return sendError(res, "Internal server error", 500);
    }
};

module.exports = {
    createCompliance,
    getCompliance
};
