const express = require('express');
const axios = require('axios');
const nodemailer = require('nodemailer');
const mysql = require("mysql2");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require('cors');
const qs = require('qs');
require('dotenv').config();
const cookieParser = require("cookie-parser");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Add after other middleware
app.use(cookieParser());

// Configure CORS properly
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
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


app.get('/api/mealplan', async (req, res) => {
  try {
    const { targetCalories } = req.query;
    if (!targetCalories) {
      return res.status(400).json({ error: 'targetCalories parameter is required' });
    }

    const response = await axios.get(
      'https://api.spoonacular.com/mealplanner/generate',
      {
        params: {
          apiKey: SPOONACULAR_API_KEY,
          timeFrame: 'day',
          targetCalories: targetCalories
        }
      }
    );

    // Get detailed nutritional information for each meal
    const mealsWithNutrition = await Promise.all(
      response.data.meals.map(async (meal) => {
        const nutritionResponse = await axios.get(
          `https://api.spoonacular.com/recipes/${meal.id}/nutritionWidget.json`,
          {
            params: {
              apiKey: SPOONACULAR_API_KEY
            }
          }
        );
        return {
          ...meal,
          calories: parseFloat(nutritionResponse.data.calories)
        };
      })
    );

    // Update the response with detailed nutrition info
    response.data.meals = mealsWithNutrition;

    res.json(response.data);
  } catch (error) {
    console.error("Error in /api/mealplan:", error.response?.data || error.message);
    res.status(500).json({
      error: 'Error fetching meal plan',
      details: error.response?.data || error.message
    });
  }
});

app.get('/api/recipe/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [recipeInfo, nutritionInfo] = await Promise.all([
      axios.get(
        `https://api.spoonacular.com/recipes/${id}/information`,
        {
          params: {
            apiKey: SPOONACULAR_API_KEY
          }
        }
      ),
      axios.get(
        `https://api.spoonacular.com/recipes/${id}/nutritionWidget.json`,
        {
          params: {
            apiKey: SPOONACULAR_API_KEY
          }
        }
      )
    ]);
    
    const response = {
      ...recipeInfo.data,
      calories: parseFloat(nutritionInfo.data.calories)
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
      { id: result.insertId, email },
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

    if (!(email && password)) {
      return res.status(400).json({ error: "Email and password required" });
    }

    // Get user
    const [users] = await db.promise().query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = users[0];

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email },
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

    return res.json({ message: "Login successful", user: { id: user.id, name: user.name, email: user.email } });
  } catch (error) {
    console.error("Login error:", error);
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

// Auth Check Endpoint
app.get('/api/me', async (req, res) => {
  try {
    const token = req.cookies.jwt;
    if (!token) return res.status(401).json({ error: "Not authenticated" });

    const decoded = jwt.verify(token, JWT_SECRET);
    
    const [users] = await db.promise().query(
      "SELECT id, name, email FROM users WHERE id = ?",
      [decoded.id]
    );

    if (users.length === 0) return res.status(404).json({ error: "User not found" });

    res.json(users[0]);
  } catch (error) {
    console.error("Auth check error:", error);
    return res.status(401).json({ error: "Invalid token" });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});