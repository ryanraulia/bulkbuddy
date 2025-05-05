// server/index.js
const express = require('express');
const bcrypt = require('bcryptjs');
const cookieParser = require('cookie-parser');
const path = require('path');
const fs = require('fs');
require('dotenv').config();
const cors = require('cors');
const corsOptions = require('./config/cors');
const { requireAuth, requireAdmin } = require('./middleware/authMiddleware');

// Modularized imports
const transporter = require('./config/email');
const recipeRoutes       = require('./routes/recipeRoutes');
const mealPlanRoutes     = require('./routes/mealPlanRoutes');
const userRecipeRoutes   = require('./routes/userRecipeRoutes');
const adminRecipeRoutes  = require('./routes/adminRecipeRoutes');
const foodRoutes         = require('./routes/foodRoutes');
const MealGeneratorRoutes = require('./routes/MealGeneratorRoutes');
const multer             = require('multer');

// Initialize app
const app = express();
const PORT = process.env.PORT || 5000;

// Built-in middleware
app.use(express.json());
app.use(cookieParser());

// CORS
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Verify SMTP configuration
transporter.verify(err => {
  if (err) console.error('SMTP error:', err);
  else console.log('SMTP server ready');
});

// Ensure upload directories exist _before_ mounting them
const UPLOAD_RECIPE_DIR  = path.join(__dirname, 'uploads', 'recipes');
const UPLOAD_PROFILE_DIR = path.join(__dirname, 'uploads', 'profiles');
if (!fs.existsSync(UPLOAD_RECIPE_DIR))  fs.mkdirSync(UPLOAD_RECIPE_DIR,  { recursive: true });
if (!fs.existsSync(UPLOAD_PROFILE_DIR)) fs.mkdirSync(UPLOAD_PROFILE_DIR, { recursive: true });

// Static file serving
app.use('/uploads/recipes', express.static(UPLOAD_RECIPE_DIR));
app.use('/uploads/profiles', express.static(UPLOAD_PROFILE_DIR));

// API routes
app.use('/api/contact', require('./routes/contactRoutes'));
app.use('/api/auth',    require('./routes/authRoutes'));
app.use('/api/meal-plans',     mealPlanRoutes);
app.use('/api/admin',          adminRecipeRoutes);
app.use('/api/recipe',         recipeRoutes);
app.use('/api/recipes',        recipeRoutes);
app.use('/api/user/recipes',   userRecipeRoutes);
app.use('/api/food',           foodRoutes);
app.use('/api/mealplan',       MealGeneratorRoutes);

// Multer-specific error handler (for file uploads)
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: err.message });
  } else if (err) {
    return res.status(500).json({ error: err.message });
  }
  next();
});

// 404 catch-all
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// Centralized error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
