const { sendError } = require("../controllers/apiResponse");

const normalizeRole = (role) => String(role || "").trim().toLowerCase();

const checkRole = (...allowedRoles) => {
    const normalizedAllowed = allowedRoles.map(normalizeRole).filter(Boolean);

    return (req, res, next) => {
        const userRole = normalizeRole(req.user?.role);

        if (!userRole) {
            return sendError(res, "Unauthorized", 401);
        }

        if (normalizedAllowed.length && !normalizedAllowed.includes(userRole)) {
            return sendError(res, "Forbidden", 403);
        }

        return next();
    };
};

module.exports = {
    checkRole
};
