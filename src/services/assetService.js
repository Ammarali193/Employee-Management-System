import api from "./api";

/**
 * Fetch all assets from the server
 * @returns {Promise<Array>} List of all assets
 */
const getAssets = async () => {
const res = await api.get("/assets");

  return res.data;
};

/**
 * Create a new asset
 * @param {Object} data - Asset data
 * @param {string} data.name - Asset name
 * @param {string} data.type - Asset type/category
 * @returns {Promise<Object>} Created asset with ID
 */
const createAsset = async (data) => {
const res = await api.post("/assets", data);

  return res.data;
};

/**
 * Assign an asset to an employee
 * @param {Object} data - Assignment data
 * @param {string|number} data.asset_id - Asset ID
 * @param {string|number} data.employee_id - Employee ID
 * @param {string} data.assignment_date - Assignment date (YYYY-MM-DD)
 * @returns {Promise<Object>} Assignment confirmation
 */
const assignAsset = async (data) => {
const res = await api.post("/assets/assign", data);

  return res.data;
};

/**
 * Return an asset from an employee
 * @param {Object} data - Return data
 * @returns {Promise<Object>} Return confirmation
 */
const returnAsset = async (data) => {
const res = await api.post("/assets/return", data);

  return res.data;
};

/**
 * Update an existing asset
 * @param {number|string} id - Asset ID
 * @param {Object} data - Update data
 * @param {string} [data.name] - New asset name
 * @param {string} [data.type] - New asset type
 * @returns {Promise<Object>} Updated asset
 */
const updateAsset = async (id, data) => {
const res = await api.put(`/assets/${id}`, data);

  return res.data;
};

/**
 * Delete an asset
 * @param {number|string} id - Asset ID to delete
 * @returns {Promise<Object>} Deletion confirmation
 */
const deleteAsset = async (id) => {
const res = await api.delete(`/assets/${id}`);

  return res.data;
};

const assetService = {
  getAssets,
  assignAsset,
  createAsset,
  returnAsset,
  updateAsset,
  deleteAsset,
};

export default assetService;
