const checkRole = (...roles) => {
    const normalizedRoles = roles.map((role) => String(role).toLowerCase());

    return (req, res, next) => {
        const userRole = String(req.user?.role || "").toLowerCase();

        if (!req.user) {
            return res.status(401).json({
                message: "User not authenticated"
            });
        }

        if (!normalizedRoles.includes(userRole)) {
            return res.status(403).json({
                message: "Access forbidden"
            });
        }

        next();
    };
};

module.exports = checkRole;
