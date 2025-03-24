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

// Replace the existing CORS config with this:
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Disposition']
}));

// Add OPTIONS handler before other routes
app.options('*', cors());

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

app.get('/api/recipes/search', async (req, res) => {
  try {
    const { query, includeUser, ...filters } = req.query;
    const combinedResults = [];

    // List of allowed Spoonacular parameters
    const allowedFilters = [
      'diet', 'cuisine', 'intolerances', 'excludeIngredients', 'type',
      'maxReadyTime', 'minCalories', 'maxCalories', 'includeIngredients',
      'fillIngredients', 'sort', 'sortDirection', 'offset', 'number',
      // Add macronutrient filters
      'minProtein', 'maxProtein', 'minCarbs', 'maxCarbs', 'minFat', 'maxFat'
    ];

    // Check if we should call Spoonacular (either has query or filters)
    const hasFilters = allowedFilters.some(param => filters[param]);
    const isEmptySearch = !query && !hasFilters;

    // Fetch Spoonacular results in all cases
    if (isEmptySearch) {
      // Get random recipes when no search/filters
      const randomResponse = await axios.get(
        'https://api.spoonacular.com/recipes/random',
        {
          params: {
            apiKey: SPOONACULAR_API_KEY,
            number: 8
          }
        }
      );
      combinedResults.push(...randomResponse.data.recipes.map(r => ({
        ...r,
        source: 'spoonacular'
      })));
    } else {
      // Existing search logic with query/filters
      if (query || hasFilters) {
        // Spoonacular API parameters
        const spoonacularParams = {
          apiKey: SPOONACULAR_API_KEY,
          query: query || '', // Allow empty query with filters
          number: 8,
          addRecipeInformation: true,
          instructionsRequired: true,
          addRecipeNutrition: true
        };

        // Add allowed filters
        allowedFilters.forEach(param => {
          if (filters[param]) {
            spoonacularParams[param] = filters[param];
          }
        });

        // Remove undefined parameters
        Object.keys(spoonacularParams).forEach(key => 
          spoonacularParams[key] === undefined && delete spoonacularParams[key]
        );

        const spoonacularResponse = await axios.get(
          'https://api.spoonacular.com/recipes/complexSearch',
          { params: spoonacularParams }
        );
        
        combinedResults.push(...spoonacularResponse.data.results.map(r => ({
          ...r,
          source: 'spoonacular',
          healthScore: r.healthScore // Add this line to preserve Spoonacular's health score
          
        })));
      }
    }

    // User recipes handling with filters
    if (includeUser === 'true') {
      const userConditions = [];
      const userParams = [];

      if (query) {
        userConditions.push('LOWER(recipes.title) LIKE LOWER(?)');
        userParams.push(`%${query}%`);
      }

      // Add numeric filters for user recipes
      if (filters.minCalories) {
        userConditions.push('recipes.calories >= ?');
        userParams.push(filters.minCalories);
      }
      if (filters.maxCalories) {
        userConditions.push('recipes.calories <= ?');
        userParams.push(filters.maxCalories);
      }

      // Add macronutrient filters for user recipes
      if (filters.minProtein) {
        userConditions.push('recipes.protein >= ?');
        userParams.push(filters.minProtein);
      }
      if (filters.maxProtein) {
        userConditions.push('recipes.protein <= ?');
        userParams.push(filters.maxProtein);
      }
      if (filters.minCarbs) {
        userConditions.push('recipes.carbs >= ?');
        userParams.push(filters.minCarbs);
      }
      if (filters.maxCarbs) {
        userConditions.push('recipes.carbs <= ?');
        userParams.push(filters.maxCarbs);
      }
      if (filters.minFat) {
        userConditions.push('recipes.fat >= ?');
        userParams.push(filters.minFat);
      }
      if (filters.maxFat) {
        userConditions.push('recipes.fat <= ?');
        userParams.push(filters.maxFat);
      }

      const [userRecipes] = await db.promise().query(
        `SELECT recipes.id AS recipe_id, recipes.title, recipes.image, 
         recipes.calories, recipes.protein, recipes.fat, recipes.carbs,recipes.servings, recipes.health_score, 
         recipes.ingredients, recipes.created_at, users.name AS username
         FROM recipes 
         JOIN users ON recipes.user_id = users.id
         WHERE recipes.source = 'user' 
           AND recipes.status = 'approved'
           ${userConditions.length ? 'AND ' + userConditions.join(' AND ') : ''}`,
        userParams
      );

      // Add user recipes to results
      const serverUrl = process.env.SERVER_URL || 'http://localhost:5000';
      combinedResults.push(...userRecipes.map(recipe => ({
        ...recipe,
        id: recipe.recipe_id, // Use the alias for the recipe ID
        source: 'user',
        image: recipe.image ? `${serverUrl}${recipe.image}` : '/default-food.jpg',
        extendedIngredients: recipe.ingredients?.split('\n').map(ing => ({ original: ing })) || []
      })));
    }

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
          number: 3
        }
      }
    );

    if (!searchResponse.data.results?.length) return res.json([]);

    // Step 2: Get detailed nutrition
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
      ).catch(err => null)
    );

    const detailedResults = await Promise.allSettled(detailedRequests);

    // Step 3: Process responses with full nutrition data
    const simplifiedResults = detailedResults
      .map(result => {
        if (result.status !== 'fulfilled' || !result.value?.data) return null;
        
        const data = result.value.data;
        const nutrition = data.nutrition || {};
        const nutrients = nutrition.nutrients || [];
        
        // Create a map of nutrients by lowercase name
        const nutrientMap = nutrients.reduce((acc, nutrient) => {
          const name = nutrient.name.toLowerCase().replace(/\s+/g, '');
          acc[name] = nutrient.amount;
          return acc;
        }, {});

        return {
          fdcId: data.id,
          description: data.name,
          calories: nutrientMap.calories || 0,
          protein: nutrientMap.protein || 0,
          fat: nutrientMap.fat || 0,
          carbs: nutrientMap.carbohydrates || 0,
          sugar: nutrientMap.sugars || nutrientMap.sugar || 0,
          fiber: nutrientMap.fiber || nutrientMap.dietaryfiber || 0,
          sodium: nutrientMap.sodium || 0
        };
      })
      .filter(item => item !== null);

    res.json(simplifiedResults);
  } catch (error) {
    console.error("Error in /api/food:", error.response?.data || error.message);
    res.status(500).json({
      error: 'Error fetching food data',
      details: error.response?.data || error.message
    });
  }
});


// Modify the /api/mealplan endpoint
app.get('/api/mealplan', async (req, res) => {
  try {
    const { targetCalories, diet, exclude, timeFrame = 'day' } = req.query;
    
    
    // Validate timeFrame
    if (!['day', 'week'].includes(timeFrame)) {
      return res.status(400).json({ error: 'Invalid time frame' });
    }

    const params = {
      apiKey: SPOONACULAR_API_KEY,
      timeFrame: timeFrame,
      targetCalories: targetCalories,
      diet: diet || undefined,
      exclude: exclude || undefined
    };

    // Remove undefined parameters
    Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);

    const response = await axios.get(
      'https://api.spoonacular.com/mealplanner/generate',
      { params }
    );

    // Process response based on timeFrame
    let processedData = response.data;

    // For daily plans, add nutrition details
    if (timeFrame === 'day') {
      const mealsWithNutrition = await Promise.all(
        response.data.meals.map(async (meal) => {
          const nutritionResponse = await axios.get(
            `https://api.spoonacular.com/recipes/${meal.id}/nutritionWidget.json`,
            { params: { apiKey: SPOONACULAR_API_KEY } }
          );
          return { ...meal, calories: parseFloat(nutritionResponse.data.calories) };
        })
      );
      processedData.meals = mealsWithNutrition;
    }

    processedData.filters = { 
      diet: diet || 'none',
      exclude: exclude || 'none',
      timeFrame: timeFrame
    };

    res.json(processedData);
  } catch (error) {
    console.error("Error in /api/mealplan:", error.response?.data || error.message);
    
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

// Add to meal plan
app.post('/api/meal-plans', async (req, res) => {
  const token = req.cookies.jwt;
  if (!token) return res.status(401).json({ error: "Not authenticated" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const { recipeId, source, date, mealType } = req.body;

    // Enhanced validation
    const errors = [];
    if (!recipeId) errors.push('Recipe ID is required');
    if (!source || !['spoonacular', 'user'].includes(source)) errors.push('Invalid source');
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) errors.push('Invalid date format (YYYY-MM-DD)');
    if (!mealType || !['breakfast', 'lunch', 'dinner', 'snack'].includes(mealType)) {
      errors.push('Invalid meal type');
    }

    if (errors.length > 0) {
      return res.status(400).json({ error: errors.join(', ') });
    }

    // Check recipe existence for user recipes
    if (source === 'user') {
      const [recipes] = await db.promise().query(
        "SELECT id FROM recipes WHERE id = ? AND source = 'user'",
        [recipeId]
      );
      if (recipes.length === 0) {
        return res.status(404).json({ error: "Recipe not found" });
      }
    }

    // Insert meal plan entry
    const [result] = await db.promise().query(
      "INSERT INTO meal_plans (user_id, recipe_id, source, date, meal_type) VALUES (?, ?, ?, ?, ?)",
      [decoded.id, recipeId, source, date, mealType]
    );

    res.status(201).json({ id: result.insertId });
  } catch (error) {
    console.error("Meal plan add error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
// Get meal plans
app.get('/api/meal-plans', async (req, res) => {
  const token = req.cookies.jwt;
  if (!token) return res.status(401).json({ error: "Not authenticated" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const { startDate, endDate } = req.query;

    let query = "SELECT * FROM meal_plans WHERE user_id = ?";
    const params = [decoded.id];

    if (startDate && endDate) {
      query += " AND date BETWEEN ? AND ?";
      params.push(startDate, endDate);
    }

    const [mealPlans] = await db.promise().query(query, params);

    // Enrich with recipe data
    const enrichedPlans = await Promise.all(
      mealPlans.map(async plan => {
        try {
          if (plan.source === 'spoonacular') {
            const response = await axios.get(
              `https://api.spoonacular.com/recipes/${plan.recipe_id}/information`,
              { params: { apiKey: SPOONACULAR_API_KEY } }
            );
            return { ...plan, recipe: response.data };
          } else {
            const [recipes] = await db.promise().query(
              "SELECT * FROM recipes WHERE id = ?",
              [plan.recipe_id]
            );
            return { ...plan, recipe: recipes[0] };
          }
        } catch (error) {
          console.error("Error fetching recipe:", error);
          return plan;
        }
      })
    );

    res.json(enrichedPlans);
  } catch (error) {
    console.error("Meal plan fetch error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Delete from meal plan
app.delete('/api/meal-plans/:id', async (req, res) => {
  const token = req.cookies.jwt;
  if (!token) return res.status(401).json({ error: "Not authenticated" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const [result] = await db.promise().query(
      "DELETE FROM meal_plans WHERE id = ? AND user_id = ?",
      [req.params.id, decoded.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Entry not found" });
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Meal plan delete error:", error);
    res.status(500).json({ error: "Internal server error" });
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
app.post('/api/recipes/submit', recipeUpload.single('image'), async (req, res) => {
  try {
    const token = req.cookies.jwt;
    if (!token) return res.status(401).json({ error: "Not authenticated" });

    const decoded = jwt.verify(token, JWT_SECRET);

    // Validate required fields
    const { title, instructions, calories, protein, fat, carbs, ingredients } = req.body;
    if (!title || !instructions || !calories || !protein || !fat || !carbs || !ingredients) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Parse and validate nutritional fields
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
      sugar: parseFloat(req.body.sugar),
      fiber: parseFloat(req.body.fiber),
      vitamin_b6: parseFloat(req.body.vitamin_b6),
      folate: parseFloat(req.body.folate),
      vitamin_b12: parseFloat(req.body.vitamin_b12),
      vitamin_c: parseFloat(req.body.vitamin_c),
      vitamin_k: parseFloat(req.body.vitamin_k),
      vitamin_e: parseFloat(req.body.vitamin_e),
      vitamin_a: parseFloat(req.body.vitamin_a),
      sodium: parseFloat(req.body.sodium),
      zinc: parseFloat(req.body.zinc),
      iron: parseFloat(req.body.iron),
      phosphorus: parseFloat(req.body.phosphorus),
      magnesium: parseFloat(req.body.magnesium),
      potassium: parseFloat(req.body.potassium),
      calcium: parseFloat(req.body.calcium),
      servings: parseInt(req.body.servings) || 1,
      health_score: parseInt(req.body.healthScore) || 0,
      gluten_free: req.body.glutenFree ? req.body.glutenFree === 'true' : false,
      vegetarian: req.body.vegetarian ? req.body.vegetarian === 'true' : false,
      vegan: req.body.vegan ? req.body.vegan === 'true' : false,
      dairy_free: req.body.dairyFree ? req.body.dairyFree === 'true' : false,
      low_fodmap: req.body.lowFodmap ? req.body.lowFodmap === 'true' : false,
      sustainable: req.body.sustainable ? req.body.sustainable === 'true' : false,
      very_healthy: req.body.veryHealthy ? req.body.veryHealthy === 'true' : false,
      budget_friendly: req.body.budgetFriendly ? req.body.budgetFriendly === 'true' : false,
      source: 'user',
      status: 'pending', // Force status to pending for moderation
      image: req.file ? `/uploads/recipes/${req.file.filename}` : null // Remove SERVER_URL prefix
    };

    // Insert recipe into the database
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

    // Convert user recipe format to match Spoonacular's nutrition structure
    const userRecipe = recipes[0];
    const formattedRecipe = {
      ...userRecipe,
      source: 'user',
      nutrition: {
        nutrients: [
          { name: 'Calories', amount: userRecipe.calories, unit: 'kcal' },
          { name: 'Protein', amount: userRecipe.protein, unit: 'g' },
          { name: 'Fat', amount: userRecipe.fat, unit: 'g' },
          { name: 'Carbohydrates', amount: userRecipe.carbs, unit: 'g' },
          { name: 'Sugar', amount: userRecipe.sugar, unit: 'g' },
          { name: 'Fiber', amount: userRecipe.fiber, unit: 'g' },
          { name: 'Vitamin B6', amount: userRecipe.vitamin_b6, unit: 'mg' },
          { name: 'Folate', amount: userRecipe.folate, unit: 'mcg' },
          { name: 'Vitamin B12', amount: userRecipe.vitamin_b12, unit: 'mcg' },
          { name: 'Vitamin C', amount: userRecipe.vitamin_c, unit: 'mg' },
          { name: 'Vitamin K', amount: userRecipe.vitamin_k, unit: 'mcg' },
          { name: 'Vitamin E', amount: userRecipe.vitamin_e, unit: 'mg' },
          { name: 'Vitamin A', amount: userRecipe.vitamin_a, unit: 'IU' },
          { name: 'Sodium', amount: userRecipe.sodium, unit: 'mg' },
          { name: 'Zinc', amount: userRecipe.zinc, unit: 'mg' },
          { name: 'Iron', amount: userRecipe.iron, unit: 'mg' },
          { name: 'Phosphorus', amount: userRecipe.phosphorus, unit: 'mg' },
          { name: 'Magnesium', amount: userRecipe.magnesium, unit: 'mg' },
          { name: 'Potassium', amount: userRecipe.potassium, unit: 'mg' },
          { name: 'Calcium', amount: userRecipe.calcium, unit: 'mg' }
        ],
        caloricBreakdown: {
          percentProtein: ((userRecipe.protein * 4) / userRecipe.calories * 100) || 0,
          percentFat: ((userRecipe.fat * 9) / userRecipe.calories * 100) || 0,
          percentCarbs: ((userRecipe.carbs * 4) / userRecipe.calories * 100) || 0
        }
      },
      extendedIngredients: userRecipe.ingredients?.split('\n').map(ing => ({ original: ing })) || [],
      instructions: userRecipe.instructions || 'No instructions provided',
      image: userRecipe.image || '/default-food.jpg'
    };

    res.json(formattedRecipe);
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