const jwt = require("jsonwebtoken");

const auth = (roles = []) => {
  return (req, res, next) => {
    try {
      const token = req.header("Authorization")?.split(" ")[1];

      if (!token) {
        return res.status(401).json({ error: "No token" });
      }

      const decoded = jwt.verify(
        token, 
process.env.JWT_SECRET
      );
      req.user = decoded;

      if (roles.length > 0 && !roles.includes((req.user.role || "").toLowerCase())) {
        return res.status(403).json({ error: "Access denied. Wrong role." });
      }

      next();
    } catch (err) {
      return res.status(403).json({ error: "Invalid or expired token." });
    }
  };
};

module.exports = auth;
