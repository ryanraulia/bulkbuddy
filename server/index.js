// Top imports
const express = require('express');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const path = require('path');
const fs = require('fs');
require('dotenv').config();
const axios = require("axios");       
const corsOptions = require('./config/cors');
const { JWT_SECRET } = require('./config/auth');
const cors = require('cors');
const db = require('./config/database');
const { requireAuth, requireAdmin } = require('./middleware/authMiddleware');
// Modularized imports
const transporter = require('./config/email');
const recipeRoutes = require('./routes/recipeRoutes');
const mealPlanRoutes = require('./routes/mealPlanRoutes');
const userRecipeRoutes = require('./routes/userRecipeRoutes');
const adminRecipeRoutes = require('./routes/adminRecipeRoutes');
const foodRoutes = require('./routes/foodRoutes');
const MealGeneratorRoutes = require('./routes/MealGeneratorRoutes');
const multer = require('multer');

// Initialize app
const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cookieParser());
// Replace the CORS setup with:
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); 


const SPOONACULAR_API_KEY = process.env.SPOONACULAR_API_KEY;

// Verify SMTP configuration
transporter.verify((error) => {
  if (error) console.error('SMTP error:', error);
  else console.log('SMTP server ready');
});

// Routes
app.use('/api/contact', require('./routes/contactRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/meal-plans', mealPlanRoutes);
app.use('/api/admin', adminRecipeRoutes);  // Admin recipe management
app.use('/api/recipe', recipeRoutes); // For single recipe endpoints
app.use('/api/recipes', recipeRoutes); // For collection endpoints
app.use('/api/user/recipes', userRecipeRoutes);
app.use('/api/food', foodRoutes);
app.use('/api/mealplan', MealGeneratorRoutes);


// Serve static files
app.use('/uploads/recipes', express.static(path.join(__dirname, 'uploads', 'recipes')));
// Serve profile pictures
app.use(
   '/uploads/profiles',
    express.static(path.join(__dirname, 'uploads', 'profiles'))
  );


// Error handling middleware for file uploads
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: err.message });
  } else if (err) {
    return res.status(500).json({ error: err.message });
  }
  next();
});

// Create recipe uploads directory if it doesn't exist
if (!fs.existsSync('uploads/recipes')) {
  fs.mkdirSync('uploads/recipes', { recursive: true });
}

// Existing code...
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});