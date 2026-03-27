import api from "./api";

/**
 * Fetch all maintenance records
 * @returns {Promise<Array>} List of all maintenance records
 */
const getMaintenanceRecords = async () => {
const res = await api.get("/maintenance");
  return res.data;
};

/**
 * Create a new maintenance record
 * @param {Object} data - Maintenance data
 * @param {number|string} data.asset_id - Asset ID
 * @param {string} data.issue - Issue description
 * @param {string} data.status - Status (Pending, In Progress, Resolved)
 * @returns {Promise<Object>} Created maintenance record
 */
const createMaintenance = async (data) => {
const res = await api.post("/maintenance", data);
  return res.data;
};

/**
 * Update a maintenance record
 * @param {number|string} id - Maintenance record ID
 * @param {Object} data - Update data
 * @param {string} [data.status] - New status
 * @param {string} [data.issue] - Updated issue description
 * @param {string} [data.resolved_date] - Resolution date
 * @returns {Promise<Object>} Updated maintenance record
 */
const updateMaintenance = async (id, data) => {
const res = await api.put(`/maintenance/${id}`, data);
  return res.data;
};

/**
 * Delete a maintenance record
 * @param {number|string} id - Maintenance record ID to delete
 * @returns {Promise<Object>} Deletion confirmation
 */
const deleteMaintenance = async (id) => {
const res = await api.delete(`/maintenance/${id}`);
  return res.data;
};

const maintenanceService = {
  getMaintenanceRecords,
  createMaintenance,
  updateMaintenance,
  deleteMaintenance,
};

export default maintenanceService;
