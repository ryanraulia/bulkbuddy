const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const db = require('../config/database');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config/auth');
const { requireAuth } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploads');

// Signup Endpoint
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!(email && password && name)) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const [users] = await db.promise().query(
      "SELECT email FROM users WHERE email = ?",
      [email]
    );

    if (users.length > 0) {
      return res.status(409).json({ error: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await db.promise().query(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name, email, hashedPassword]
    );

    const token = jwt.sign(
      { 
        id: result.insertId, 
        email,
        role: 'user'
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.cookie('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000
    });

    return res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Login Endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const [users] = await db.promise().query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = users[0];
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.cookie('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000
    });

    return res.json({ 
      message: "Login successful", 
      user: { 
        id: user.id, 
        name: user.name, 
        email: user.email,
        profile_picture: user.profile_picture,
        bio: user.bio,
        location: user.location,
        website: user.website
      } 
    });
  } catch (error) {
    console.error("Login error details:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Logout Endpoint
router.post('/logout', (req, res) => {
  res.clearCookie('jwt', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });
  res.json({ message: "Logged out successfully" });
});

// Auth Check Endpoint
router.get('/me', requireAuth, async (req, res) => {
  try {
    const [users] = await db.promise().query(
      "SELECT id, name, email, role, profile_picture, bio, location, website FROM users WHERE id = ?",
      [req.user.id]
    );

    if (users.length === 0) return res.status(404).json({ error: "User not found" });
    res.json(users[0]);
  } catch (error) {
    console.error("Auth check error:", error);
    return res.status(401).json({ error: "Invalid token" });
  }
});

// Update Profile Endpoint
router.put('/profile/update', requireAuth, upload.single('profile_picture'), async (req, res) => {
  try {
    const updateData = {
      name: req.body.name,
      bio: req.body.bio,
      location: req.body.location,
      website: req.body.website
    };

    if (req.file) {
      const serverUrl = process.env.SERVER_URL || 'http://localhost:5000';
      updateData.profile_picture = `${serverUrl}/uploads/${req.file.filename}`;
    }

    const [result] = await db.promise().query(
      "UPDATE users SET ? WHERE id = ?",
      [updateData, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const [users] = await db.promise().query(
      "SELECT id, name, email, profile_picture, bio, location, website FROM users WHERE id = ?",
      [req.user.id]
    );

    res.json(users[0]);
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({ 
      error: "Error updating profile",
      details: error.message 
    });
  }
});

module.exports = router;