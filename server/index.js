// server/index.js
const express = require('express');
const axios = require('axios');
const nodemailer = require('nodemailer');
const mysql = require("mysql2");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require('cors');
const qs = require('qs');
const path = require('path'); // Add this import
const multer = require('multer'); // Add this import
require('dotenv').config();
const cookieParser = require("cookie-parser");
const fs = require('fs'); // Add this import

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cookieParser());

// Configure CORS properly
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  exposedHeaders: ['Content-Disposition']  // Add this line
}));

const SPOONACULAR_API_KEY = process.env.SPOONACULAR_API_KEY;

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10, 
  queueLimit: 0
});

db.getConnection((err, connection) => {
  if (err) {
    console.error("Database connection failed:", err);
  } else {
    console.log("Connected to MySQL");
    connection.release();
  }
});

// Update the transporter configuration in server/index.js
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // Use TLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD
  },
  tls: {
    rejectUnauthorized: false // Accept self-signed certificates
  }
});

// Add a verification check when the server starts
transporter.verify(function(error, success) {
  if (error) {
    console.error('SMTP connection error:', error);
  } else {
    console.log('SMTP server is ready to take our messages');
  }
});

console.log("SPOONACULAR_API_KEY:", process.env.SPOONACULAR_API_KEY);

// Add near other API endpoints

// Add this after your transporter configuration to verify env variables are loaded
console.log('Email configuration:', {
  user: process.env.EMAIL_USER ? 'Set' : 'Not set',
  appPassword: process.env.EMAIL_APP_PASSWORD ? 'Set' : 'Not set'
});

app.post('/api/contact', async (req, res) => {
  const { name, email, message } = req.body;
  
  console.log('Received contact form submission:', { name, email, message });
  
  try {
    const mailOptions = {
      from: {
        name: 'BulkBuddy Contact Form',
        address: process.env.EMAIL_USER
      },
      to: process.env.EMAIL_USER,
      subject: `New Contact Form Submission from ${name}`,
      text: `
Name: ${name}
Email: ${email}
Message: ${message}
      `,
      html: `
<h2>New Contact Form Submission</h2>
<p><strong>Name:</strong> ${name}</p>
<p><strong>Email:</strong> ${email}</p>
<p><strong>Message:</strong></p>
<p>${message}</p>
      `
    };

    console.log('Attempting to send email with options:', mailOptions);

    try {
      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', info);
      res.json({ success: true, message: 'Email sent successfully' });
    } catch (emailError) {
      console.error('Detailed email error:', {
        error: emailError,
        code: emailError.code,
        command: emailError.command,
        response: emailError.response
      });
      throw emailError;
    }
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send email',
      error: error.message 
    });
  }
});

// Update the /api/recipes/search endpoint
app.get('/api/recipes/search', async (req, res) => {
  try {
    const { query } = req.query;
    const combinedResults = [];

    if (query) {
      // Spoonacular results
      const spoonacularResponse = await axios.get(
        'https://api.spoonacular.com/recipes/complexSearch',
        {
          params: {
            apiKey: SPOONACULAR_API_KEY,
            query: query,
            number: 8,
            addRecipeInformation: true,
            instructionsRequired: true
          }
        }
      );
      combinedResults.push(...spoonacularResponse.data.results.map(r => ({
        ...r,
        source: 'spoonacular'
      })));
    }

    // User recipes
    const [userRecipes] = await db.promise().query(
      `SELECT recipes.id AS recipe_id, recipes.title, recipes.image, recipes.calories, recipes.protein, recipes.fat, recipes.carbs, recipes.ingredients, recipes.created_at, users.name AS username
       FROM recipes 
       JOIN users ON recipes.user_id = users.id
       WHERE recipes.source = 'user' 
         AND recipes.status = 'approved' 
         AND LOWER(recipes.title) LIKE LOWER(?)`,
      [`%${query}%`]
    );

    // Add safe handling for ingredients and image URLs
    const serverUrl = process.env.SERVER_URL || 'http://localhost:5000';
    combinedResults.push(...userRecipes.map(recipe => ({
      ...recipe,
      id: recipe.recipe_id, // Use the alias for the recipe ID
      source: 'user',
      image: recipe.image ? `${serverUrl}${recipe.image}` : '/default-food.jpg',
      extendedIngredients: recipe.ingredients 
        ? recipe.ingredients.split('\n').map(ing => ({ original: ing }))
        : []
    })));

    res.json(combinedResults);
  } catch (error) {
    console.error("Recipe search error:", error);
    res.status(500).json({ error: 'Error searching recipes' });
  }
});

// Update the /api/recipes/random endpoint
app.get('/api/recipes/random', async (req, res) => {
  try {
    const response = await axios.get(
      'https://api.spoonacular.com/recipes/random',
      {
        params: {
          apiKey: SPOONACULAR_API_KEY,
          number: 8,
          tags: 'main course'
        }
      }
    );

    const recipes = response.data.recipes.map(r => ({
      ...r,
      source: 'spoonacular'
    }));

    res.json(recipes);
  } catch (error) {
    console.error("Random recipes error:", error.response?.data || error.message);
    res.status(500).json({ error: 'Error fetching random recipes' });
  }
});

// Update the /api/recipes/user endpoint
app.get('/api/recipes/user', async (req, res) => {
  try {
    const [recipes] = await db.promise().query(
      `SELECT recipes.id, recipes.user_id, recipes.title, recipes.image, recipes.calories, recipes.status, recipes.created_at, users.name AS username
       FROM recipes 
       JOIN users ON recipes.user_id = users.id
       WHERE recipes.source = 'user' 
         AND recipes.status = 'approved'
       ORDER BY recipes.created_at DESC`
    );

    const serverUrl = process.env.SERVER_URL || 'http://localhost:5000';
    const updatedRecipes = recipes.map(recipe => ({
      ...recipe,
      source: 'user',
      image: recipe.image ? `${serverUrl}${recipe.image}` : '/default-food.jpg'
    }));

    res.json(updatedRecipes);
  } catch (error) {
    console.error("Error fetching user recipes:", error);
    res.status(500).json({ error: 'Error fetching user recipes' });
  }
});

app.get('/api/food', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ error: 'Search query is required' });

    // Step 1: Search for ingredients
    const searchResponse = await axios.get(
      'https://api.spoonacular.com/food/ingredients/search',
      {
        params: {
          apiKey: process.env.SPOONACULAR_API_KEY,
          query: q,
          number: 3 // Limit results to manage API costs
        }
      }
    );

    if (!searchResponse.data.results || !searchResponse.data.results.length) {
      return res.json([]);
    }

    // Step 2: Get detailed nutrition for each ingredient
    const detailedRequests = searchResponse.data.results.map(ingredient => 
      axios.get(
        `https://api.spoonacular.com/food/ingredients/${ingredient.id}/information`,
        {
          params: {
            apiKey: process.env.SPOONACULAR_API_KEY,
            amount: 100,
            unit: 'grams'
          }
        }
      ).catch(err => null) // Handle individual request failures
    );

    const detailedResults = await Promise.allSettled(detailedRequests);

    // Step 3: Process successful responses
    const simplifiedResults = detailedResults
      .map(result => {
        if (result.status !== 'fulfilled' || !result.value?.data) return null;
        
        const data = result.value.data;
        const nutrients = (data.nutrition?.nutrients || []).reduce((acc, nutrient) => {
          switch(nutrient.name) {
            case 'Calories': acc.calories = nutrient.amount; break;
            case 'Protein': acc.protein = nutrient.amount; break;
            case 'Fat': acc.fat = nutrient.amount; break;
            case 'Carbohydrates': acc.carbs = nutrient.amount; break;
          }
          return acc;
        }, { calories: 0, protein: 0, fat: 0, carbs: 0 });

        return {
          fdcId: data.id,
          description: data.name,
          ...nutrients
        };
      })
      .filter(item => item !== null); // Remove failed requests

    res.json(simplifiedResults);
  } catch (error) {
    console.error("Error in /api/food:", error.response?.data || error.message);
    res.status(500).json({
      error: 'Error fetching food data',
      details: error.response?.data || error.message
    });
  }
});



// server/index.js - Update /api/mealplan endpoint
app.get('/api/mealplan', async (req, res) => {
  try {
    const { targetCalories, diet, exclude } = req.query;
    
    const params = {
      apiKey: SPOONACULAR_API_KEY,
      timeFrame: 'day',
      targetCalories: targetCalories,
      diet: diet || undefined,
      exclude: exclude || undefined // Add exclude parameter
    };

    // Remove undefined parameters
    Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);

    const response = await axios.get(
      'https://api.spoonacular.com/mealplanner/generate',
      { params }
    );

    // Get detailed nutritional information for each meal
    const mealsWithNutrition = await Promise.all(
      response.data.meals.map(async (meal) => {
        const nutritionResponse = await axios.get(
          `https://api.spoonacular.com/recipes/${meal.id}/nutritionWidget.json`,
          { params: { apiKey: SPOONACULAR_API_KEY } }
        );
        return { ...meal, calories: parseFloat(nutritionResponse.data.calories) };
      })
    );

    response.data.meals = mealsWithNutrition;
    response.data.filters = { 
      diet: diet || 'none',
      exclude: exclude || 'none' // Add exclude to filters
    };

    res.json(response.data);
  } catch (error) {
    console.error("Error in /api/mealplan:", error.response?.data || error.message);
    
    // Handle exclusion-related errors
    if (error.response?.status === 400) {
      return res.status(400).json({ 
        error: 'No meal plan found. Please adjust your filters or excluded ingredients.'
      });
    }
    
    res.status(500).json({ 
      error: 'Error fetching meal plan',
      details: error.response?.data || error.message
    });
  }
});



app.get('/api/recipe/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const recipeInfo = await axios.get(
      `https://api.spoonacular.com/recipes/${id}/information`,
      {
        params: {
          apiKey: SPOONACULAR_API_KEY,
          includeNutrition: true
        }
      }
    );

    const response = {
      ...recipeInfo.data,
      calories: recipeInfo.data.nutrition?.nutrients.find(n => n.name === 'Calories')?.amount || 0
    };
    
    res.json(response);
  } catch (error) {
    console.error("Error in /api/recipe:", error.response?.data || error.message);
    res.status(500).json({
      error: 'Error fetching recipe details',
      details: error.response?.data || error.message
    });
  }
});

// JWT Secret (add to .env)
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

// Add this after your JWT configuration
const requireAdmin = (req, res, next) => {
  const token = req.cookies.jwt;
  if (!token) return res.status(401).json({ error: "Not authenticated" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: "Admin privileges required" });
    }
    req.user = decoded;
    next();
  } catch (error) {
    console.error("Admin check error:", error);
    return res.status(401).json({ error: "Invalid token" });
  }
};

// Signup Endpoint
app.post('/api/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!(email && password && name)) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Check if user exists
    const [users] = await db.promise().query(
      "SELECT email FROM users WHERE email = ?",
      [email]
    );

    if (users.length > 0) {
      return res.status(409).json({ error: "Email already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const [result] = await db.promise().query(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name, email, hashedPassword]
    );

    // Generate JWT
    const token = jwt.sign(
      { 
        id: result.insertId, 
        email,
        role: 'user'  // Default role for new users
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Set cookie
    res.cookie('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    });

    return res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Login Endpoint
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt for:', email); // Add this

    const [users] = await db.promise().query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    console.log('Found users:', users); // Add this

    if (users.length === 0) {
      console.log('No user found for:', email);
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = users[0];
    console.log('Stored hash:', user.password); // Add this
    
    const validPassword = await bcrypt.compare(password, user.password);
    console.log('Password valid:', validPassword); // Add this

    if (!validPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate JWT
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email,
        role: user.role  // Add role to the token
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Set cookie
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
        profile_picture: user.profile_picture,  // Add these
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
app.post('/api/logout', (req, res) => {
  res.clearCookie('jwt', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });
  res.json({ message: "Logged out successfully" });
});

// Add this test endpoint
app.get('/api/admin/test', requireAdmin, (req, res) => {
  res.json({ message: "Admin access granted" });
});

// Auth Check Endpoint
app.get('/api/me', async (req, res) => {
  try {
    const token = req.cookies.jwt;
    if (!token) return res.status(401).json({ error: "Not authenticated" });

    const decoded = jwt.verify(token, JWT_SECRET);
    
    const [users] = await db.promise().query(
      "SELECT id, name, email, role, profile_picture, bio, location, website FROM users WHERE id = ?",
      [decoded.id]
    );

    if (users.length === 0) return res.status(404).json({ error: "User not found" });

    res.json(users[0]);
  } catch (error) {
    console.error("Auth check error:", error);
    return res.status(401).json({ error: "Invalid token" });
  }
});

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Create uploads directory if it doesn't exist
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/uploads/recipes', express.static(path.join(__dirname, 'uploads', 'recipes')));

// Update profile endpoint
app.put('/api/profile/update', upload.single('profile_picture'), async (req, res) => {
  try {
    const token = req.cookies.jwt;
    if (!token) return res.status(401).json({ error: "Not authenticated" });

    const decoded = jwt.verify(token, JWT_SECRET);
    const updateData = {
      name: req.body.name,
      bio: req.body.bio,
      location: req.body.location,
      website: req.body.website
    };

    if (req.file) {
      // Get current user data first
      const [currentUser] = await db.promise().query(
        "SELECT profile_picture FROM users WHERE id = ?",
        [decoded.id]
      );
      
      // Delete old profile picture if it exists
      if (currentUser[0].profile_picture && currentUser[0].profile_picture !== '/default-avatar.png') {
        const oldFilename = path.basename(currentUser[0].profile_picture);
        try {
          fs.unlinkSync(path.join(__dirname, 'uploads', oldFilename));
        } catch (err) {
          console.error("Error deleting old profile picture:", err);
        }
      }

      // Store full URL in database
      const serverUrl = process.env.SERVER_URL || 'http://localhost:5000';
      updateData.profile_picture = `${serverUrl}/uploads/${req.file.filename}`;
    }

    const [result] = await db.promise().query(
      "UPDATE users SET ? WHERE id = ?",
      [updateData, decoded.id]
    );

    // Add this check
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const [users] = await db.promise().query(
      "SELECT id, name, email, profile_picture, bio, location, website FROM users WHERE id = ?",
      [decoded.id]
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

// Add to server/index.js after other endpoints

// Configure multer for recipe image uploads
const recipeUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(__dirname, 'uploads/recipes'));
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, 'recipe-' + uniqueSuffix + path.extname(file.originalname));
    }
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

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

// Add this ABOVE the recipe submission endpoint
app.use('/uploads/recipes', express.static(path.join(__dirname, 'uploads', 'recipes')));

// Recipe submission endpoint
app.post('/api/recipes/submit', recipeUpload.single('image'), async (req, res) => {
  try {
    const token = req.cookies.jwt;
    if (!token) return res.status(401).json({ error: "Not authenticated" });

    const decoded = jwt.verify(token, JWT_SECRET);

    // Validate nutrition fields
    const { title, instructions, calories, protein, fat, carbs, ingredients } = req.body;
    if (!title || !instructions || !calories || !protein || !fat || !carbs || !ingredients) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const recipeData = {
      user_id: decoded.id,
      title,
      instructions,
      ingredients: JSON.parse(ingredients).map(ing => 
        `${ing.amount} ${ing.unit} ${ing.name}`
      ).join('\n'),
      calories: parseFloat(calories),
      protein: parseFloat(protein),
      fat: parseFloat(fat),
      carbs: parseFloat(carbs),
      source: 'user',
      status: 'pending', // Force status to pending for moderation
      image: req.file ? `/uploads/recipes/${req.file.filename}` : null // Remove SERVER_URL prefix
    };

    const [result] = await db.promise().query(
      "INSERT INTO recipes SET ?",
      [recipeData]
    );

    res.json({ 
      success: true, 
      recipeId: result.insertId 
    });
  } catch (error) {
    console.error("Recipe submission error:", error);
    res.status(500).json({ error: "Error submitting recipe" });
  }
});

// Update the user recipe endpoint
app.get('/api/user-recipe/:id', async (req, res) => {
  try {
    const [recipes] = await db.promise().query(
      `SELECT *, 
       ingredients AS extendedIngredients,
       CONCAT('User Submitted Recipe • ', status) as sourceText
       FROM recipes 
       WHERE id = ?`,
      [req.params.id]
    );

    if (recipes.length === 0) return res.status(404).json({ error: "Recipe not found" });

    const recipe = {
      ...recipes[0],
      source: 'user',
      title: recipes[0].title,
      extendedIngredients: recipes[0].ingredients 
        ? recipes[0].ingredients.split('\n').map(ing => ({ original: ing }))
        : [],
      instructions: recipes[0].instructions || 'No instructions provided',
      image: recipes[0].image || '/default-food.jpg'
    };

    res.json(recipe);
  } catch (error) {
    console.error("User recipe error:", error);
    res.status(500).json({ error: 'Error fetching recipe' });
  }
});

// Add after existing endpoints in server/index.js

// Get pending recipes
app.get('/api/admin/pending-recipes', requireAdmin, async (req, res) => {
  try {
    const [recipes] = await db.promise().query(
      `SELECT id, title, image, calories, protein, fat, carbs, ingredients, created_at 
       FROM recipes 
       WHERE status = 'pending' 
         AND source = 'user'`
    );
    
    res.json(recipes.map(recipe => ({
      ...recipe,
      ingredients: recipe.ingredients.split('\n')
    })));
  } catch (error) {
    console.error("Pending recipes error:", error);
    res.status(500).json({ error: 'Error fetching pending recipes' });
  }
});

app.options('/api/admin/approve-recipe/:id', cors());


// Approve recipe
app.put('/api/admin/approve-recipe/:id', requireAdmin, async (req, res) => {
  try {
    const [result] = await db.promise().query(
      "UPDATE recipes SET status = 'approved' WHERE id = ?",
      [req.params.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Recipe not found" });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error("Approve recipe error:", error);
    res.status(500).json({ error: 'Error approving recipe' });
  }
});

// Get user's submitted recipes
app.get('/api/users/recipes', async (req, res) => {
  try {
    const token = req.cookies.jwt;
    if (!token) return res.status(401).json({ error: "Not authenticated" });

    const decoded = jwt.verify(token, JWT_SECRET);
    
    const [recipes] = await db.promise().query(
      `SELECT recipes.id, recipes.title, recipes.image, recipes.calories, recipes.status, recipes.created_at, users.name AS username
       FROM recipes 
       JOIN users ON recipes.user_id = users.id
       WHERE recipes.user_id = ? 
       ORDER BY recipes.created_at DESC`,
      [decoded.id]
    );

    res.json(recipes);
  } catch (error) {
    console.error("Error fetching user recipes:", error);
    res.status(500).json({ error: 'Error fetching recipes' });
  }
});

// Update the /api/recipes endpoint
app.get('/api/recipes', async (req, res) => {
  try {
    const [recipes] = await db.promise().query(
      `SELECT recipes.id, recipes.title, recipes.image, recipes.calories, recipes.status, recipes.created_at, users.name AS username
       FROM recipes 
       JOIN users ON recipes.user_id = users.id
       ORDER BY recipes.created_at DESC`
    );

    // Add safe handling for image URLs
    const serverUrl = process.env.SERVER_URL || 'http://localhost:5000';
    const updatedRecipes = recipes.map(recipe => ({
      ...recipe,
      source: 'user',
      image: recipe.image ? `${serverUrl}${recipe.image}` : '/default-food.jpg'
    }));

    res.json(updatedRecipes);
  } catch (error) {
    console.error("Error fetching recipes:", error);
    res.status(500).json({ error: 'Error fetching recipes' });
  }
});

// Add this after the approve recipe endpoint in server/index.js
app.delete('/api/admin/reject-recipe/:id', requireAdmin, async (req, res) => {
  try {
    // Get recipe details first
    const [recipes] = await db.promise().query(
      "SELECT image FROM recipes WHERE id = ?",
      [req.params.id]
    );

    if (recipes.length === 0) {
      return res.status(404).json({ error: "Recipe not found" });
    }

    const recipe = recipes[0];
    
    // Delete from database
    const [result] = await db.promise().query(
      "DELETE FROM recipes WHERE id = ?",
      [req.params.id]
    );

    // Delete associated image file
    if (recipe.image) {
      const filename = path.basename(recipe.image);
      const imagePath = path.join(__dirname, 'uploads/recipes', filename);
      fs.unlink(imagePath, (err) => {
        if (err) console.error("Error deleting image:", err);
        else console.log("Deleted image:", filename);
      });
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Reject recipe error:", error);
    res.status(500).json({ error: 'Error rejecting recipe' });
  }
});
app.delete('/api/recipes/:id', async (req, res) => {
  try {
    const token = req.cookies.jwt;
    if (!token) return res.status(401).json({ error: "Not authenticated" });
    
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Get full recipe details
    const [recipes] = await db.promise().query(
      "SELECT user_id, image, source FROM recipes WHERE id = ?",
      [req.params.id]
    );

    if (recipes.length === 0) return res.status(404).json({ error: "Recipe not found" });
    const recipe = recipes[0];

    // Prevent deletion of Spoonacular recipes
    if (recipe.source !== 'user') {
      return res.status(403).json({ error: "Cannot delete Spoonacular recipes" });
    }

    // Authorization check
    if (decoded.role !== 'admin' && decoded.id !== recipe.user_id) {
      return res.status(403).json({ error: "Unauthorized to delete this recipe" });
    }

    // Delete from database
    await db.promise().query("DELETE FROM recipes WHERE id = ?", [req.params.id]);

    // Delete image file if exists
    if (recipe.image) {
      const filename = path.basename(recipe.image);
      const imagePath = path.join(__dirname, 'uploads/recipes', filename);
      fs.unlink(imagePath, (err) => err && console.error("Error deleting image:", err));
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Delete recipe error:", error);
    res.status(500).json({ error: 'Error deleting recipe' });
  }
});
// Existing code...
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});