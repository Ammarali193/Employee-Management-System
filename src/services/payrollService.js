import api from "./api";

/**
 * Fetch all payroll records
 * @returns {Promise<Array>} List of all payroll records
 */
const getPayroll = async () => {
const res = await api.get("/payroll");
  return res.data;
};

/**
 * Get payroll record by ID
 * @param {number|string} id - Payroll record ID
 * @returns {Promise<Object>} Payroll record details
 */
const getPayrollById = async (id) => {
const res = await api.get(`/payroll/${id}`);
  return res.data;
};

/**
 * Assign salary to employee
 * @param {Object} data - Payroll data
 * @param {number|string} data.employee_id - Employee ID
 * @param {number} data.basic_salary - Basic salary amount
 * @param {number} [data.allowance] - Allowance amount
 * @param {number} [data.deduction] - Deduction amount
 * @param {string} [data.month] - Payroll month (YYYY-MM)
 * @returns {Promise<Object>} Created payroll record
 */
const assignSalary = async (data) => {
const res = await api.post("/payroll/assign", data);
  return res.data;
};

/**
 * Create a new payroll record
 * @param {Object} data - Payroll data
 * @returns {Promise<Object>} Created payroll record
 */
const createPayroll = async (data) => {
const res = await api.post("/payroll", data);
  return res.data;
};

/**
 * Update payroll record
 * @param {number|string} id - Payroll record ID
 * @param {Object} data - Update data
 * @returns {Promise<Object>} Updated payroll record
 */
const updatePayroll = async (id, data) => {
const res = await api.put(`/payroll/${id}`, data);
  return res.data;
};

/**
 * Delete payroll record
 * @param {number|string} id - Payroll record ID
 * @returns {Promise<Object>} Deletion confirmation
 */
const deletePayroll = async (id) => {
const res = await api.delete(`/payroll/${id}`);
  return res.data;
};

/**
 * Get payslip for employee
 * @param {number|string} id - Employee ID
 * @param {string} month - Month (MM)
 * @param {string} year - Year (YYYY)
 * @returns {Promise<Object>} Payslip details
 */
const getPayslip = async (id, month = "3", year = "2026") => {
const res = await api.get(`/payroll/slip/${id}?month=${month}&year=${year}`);
  return res.data;
};

const payrollService = {
  getPayroll,
  getPayrollById,
  assignSalary,
  createPayroll,
  updatePayroll,
  deletePayroll,
  getPayslip,
};

export default payrollService;

