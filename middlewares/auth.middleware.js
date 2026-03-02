const jwt = require("jsonwebtoken");

// 🔐 Verify JWT Token
const verifyToken = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "Access denied. No token provided."
            });
        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = decoded; // attach user info

        next();

    } catch (error) {
        return res.status(401).json({
            message: "Invalid or expired token"
        });
    }
};

// 🛡 Role-Based Authorization
const authorizeRoles = (...roles) => {
    return (req, res, next) => {

        if (!req.user) {
            return res.status(401).json({
                message: "User not authenticated"
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                message: "Access denied: You do not have permission"
            });
        }

        next();
    };
};

module.exports = { verifyToken, authorizeRoles };