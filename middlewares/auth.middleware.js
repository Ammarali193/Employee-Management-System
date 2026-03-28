const jwt = require("jsonwebtoken");

const getJwtSecret = () => {
    const configuredSecret = String(process.env.JWT_SECRET || "").trim();

    if (configuredSecret) {
        return configuredSecret;
    }

    if (String(process.env.NODE_ENV || "").trim().toLowerCase() === "production") {
        throw new Error("JWT_SECRET is required in production");
    }

    return "dev-insecure-secret-change-me";
};

const extractToken = (authorizationHeader) => {
    if (!authorizationHeader) {
        return null;
    }

    const normalizedHeader = String(authorizationHeader).trim();

    if (!normalizedHeader) {
        return null;
    }

    if (normalizedHeader.startsWith("Bearer ")) {
        return normalizedHeader.slice(7).trim() || null;
    }

    return normalizedHeader;
};

const extractTokenFromRequest = (req) => {
    const authorizationToken = extractToken(req.headers?.authorization);

    if (authorizationToken) {
        return authorizationToken;
    }

    const xAccessToken = extractToken(req.headers?.["x-access-token"]);

    if (xAccessToken) {
        return xAccessToken;
    }

    const legacyToken = extractToken(req.headers?.token);

    if (legacyToken) {
        return legacyToken;
    }

    return null;
};

const normalizeRoles = (roles) =>
    roles
        .flat()
        .map((role) => String(role || "").trim().toLowerCase())
        .filter(Boolean);

const resolveTenantId = (req) => String(req.user?.tenant_id || "default").trim() || "default";

const verifyToken = (req, res, next) => {
    try {
        const token = extractTokenFromRequest(req);

        if (!token) {
            return res.status(401).json({
                message: "Access denied. No token provided."
            });
        }

        const decoded = jwt.verify(token, getJwtSecret());
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            message: "Invalid or expired token"
        });
    }
};

const authorizeRoles = (...roles) => {
    const normalizedRoles = normalizeRoles(roles);

    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                message: "User not authenticated"
            });
        }

        const userRole = String(req.user.role || "").trim().toLowerCase();

        if (normalizedRoles.length && !normalizedRoles.includes(userRole)) {
            return res.status(403).json({
                message: "Access denied: You do not have permission"
            });
        }

        next();
    };
};

const auth = (roles = []) => {
    const normalizedRoles = Array.isArray(roles) ? roles : [roles];

    return (req, res, next) => {
        verifyToken(req, res, () => {
            if (!normalizedRoles.length) {
                return next();
            }

            return authorizeRoles(...normalizedRoles)(req, res, next);
        });
    };
};

module.exports = {
    auth,
    authorizeRoles,
    extractToken,
    extractTokenFromRequest,
    resolveTenantId,
    verifyToken
};
