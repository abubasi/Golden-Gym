const jwt = require("jsonwebtoken");

const requireAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: "Admin token is required." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "golden-gym-dev-secret");

    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "Admin access only." });
    }

    req.user = decoded;
    return next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired admin token." });
  }
};

module.exports = {
  requireAdmin,
};
