const Payroll = require("../models/Payroll");
const { sendError, sendSuccess } = require("./apiResponse");

const getPayroll = async (_req, res) => {
    try {
        const rows = await Payroll.findAll();
        return sendSuccess(res, rows, "Payroll fetched");
    } catch (error) {
        console.error("Get payroll error:", error);
        return sendError(res, "Internal server error", 500);
    }
};

const generatePayroll = async (req, res) => {
    try {
        const { employee_id, basic_salary, deductions } = req.body || {};

        if (!employee_id || basic_salary === undefined) {
            return sendError(res, "employee_id and basic_salary are required", 400);
        }

        const basic = Number(basic_salary);
        const deduct = Number(deductions || 0);

        if (Number.isNaN(basic) || Number.isNaN(deduct)) {
            return sendError(res, "basic_salary and deductions must be numbers", 400);
        }

        const net_salary = Number((basic - deduct).toFixed(2));

        const created = await Payroll.create({
            employee_id,
            basic_salary: basic,
            deductions: deduct,
            net_salary
        });

        return sendSuccess(res, created, "Payroll generated", 201);
    } catch (error) {
        console.error("Generate payroll error:", error);
        return sendError(res, "Internal server error", 500);
    }
};

module.exports = {
    generatePayroll,
    getPayroll
};
