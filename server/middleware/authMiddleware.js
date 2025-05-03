// server/middleware/authMiddleware.js
require('dotenv').config();
const jwt = require('jsonwebtoken');            // ← add this
const { JWT_SECRET } = require('../config/auth');

exports.requireAuth = (req, res, next) => {
  const token = req.cookies.jwt;
  if (!token) return res.status(401).json({ error: "Not authenticated" });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (err) {
    console.error("Auth check error:", err);
    res.status(401).json({ error: "Invalid token" });
  }
};

exports.requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: "Admin privileges required" });
  }
  next();
};
