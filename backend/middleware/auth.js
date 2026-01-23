const jwt = require("jsonwebtoken");

// IMPORTANT: Use the same secret key as in your auth routes.
const JWT_SECRET = "your_super_secret_key_change_this";

module.exports = function (req, res, next) {
  // Get token from the header
  const authHeader = req.header("Authorization");

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  const token = authHeader.split(' ')[1];

  // Check if not token
  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ message: "Token is not valid" });
  }
};
