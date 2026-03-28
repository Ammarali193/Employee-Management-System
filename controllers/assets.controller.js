const Asset = require("../models/Asset");
const { sendError, sendSuccess } = require("./apiResponse");

const createAsset = async (req, res) => {
    try {
        const { name, type, assigned_to, status } = req.body || {};

        if (!name || !type) {
            return sendError(res, "name and type are required", 400);
        }

        const created = await Asset.create({
            name,
            type,
            assigned_to: assigned_to || null,
            status: status || "Issued"
        });

        return sendSuccess(res, created, "Asset created", 201);
    } catch (error) {
        console.error("Create asset error:", error);
        return sendError(res, "Internal server error", 500);
    }
};

const getAssets = async (_req, res) => {
    try {
        const rows = await Asset.findAll();
        return sendSuccess(res, rows, "Assets fetched");
    } catch (error) {
        console.error("Get assets error:", error);
        return sendError(res, "Internal server error", 500);
    }
};

const updateAsset = async (req, res) => {
    try {
        const updated = await Asset.update(req.params.id, req.body || {});

        if (!updated) {
            return sendError(res, "Asset not found", 404);
        }

        return sendSuccess(res, updated, "Asset updated");
    } catch (error) {
        console.error("Update asset error:", error);
        return sendError(res, "Internal server error", 500);
    }
};

const deleteAsset = async (req, res) => {
    try {
        const removed = await Asset.remove(req.params.id);

        if (!removed) {
            return sendError(res, "Asset not found", 404);
        }

        return sendSuccess(res, removed, "Asset deleted");
    } catch (error) {
        console.error("Delete asset error:", error);
        return sendError(res, "Internal server error", 500);
    }
};

module.exports = {
    createAsset,
    deleteAsset,
    getAssets,
    updateAsset
};
