const pool = require("../config/db");

// Manual logger (optional)
const logAction = async (userId, action, module, details) => {
    try {
        await pool.query(
            `INSERT INTO audit_logs (user_id, action, module, details)
             VALUES ($1, $2, $3, $4)`,
            [userId || null, action, module, details]
        );
    } catch (error) {
        console.error("Audit log error:", error);
    }
};

// ?? Auto Audit Middleware
const autoAudit = (req, res, next) => {

    res.on("finish", async () => {
        try {

            // Sirf POST, PUT, DELETE track karega
            if (["POST", "PUT", "DELETE"].includes(req.method)) {

                const userId = req.user ? req.user.id : null;

                await pool.query(
                    `INSERT INTO audit_logs (user_id, action, module, details)
                     VALUES ($1, $2, $3, $4)`,
                    [
                        userId,
                        `${req.method} ${req.originalUrl}`,
                        "Auto Audit",
                        `Status: ${res.statusCode}`
                    ]
                );
            }

        } catch (error) {
            console.error("Auto audit error:", error);
        }
    });

    next();
};

module.exports = { logAction, autoAudit };
