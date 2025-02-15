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

const EDAMAM_APP_ID = process.env.REACT_APP_EDAMAM_APP_ID;
const EDAMAM_APP_KEY = process.env.REACT_APP_EDAMAM_APP_KEY;
const FDC_API_KEY = process.env.REACT_APP_FDC_API_KEY;



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


console.log("EDAMAM_APP_ID:", EDAMAM_APP_ID);
console.log("EDAMAM_APP_KEY:", EDAMAM_APP_KEY);
console.log("FDC_API_KEY:", FDC_API_KEY);
console.log("FDC_API_KEY:", process.env.REACT_APP_FDC_API_KEY);


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
    if (!q) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const response = await axios.get(
      `https://api.nal.usda.gov/fdc/v1/foods/search`,
      {
        params: {
          api_key: FDC_API_KEY,
          query: q,
          dataType: "Survey (FNDDS)", // Remove the array brackets and encode properly
          pageSize: 5
        },
        paramsSerializer: (params) => {
          // Use qs library to properly serialize the params
          return qs.stringify(params, { arrayFormat: 'repeat' });
        }
      }
    );

    const simplifiedResults = response.data.foods.map(food => {
      const nutrients = {};
      food.foodNutrients.forEach(nutrient => {
        switch(nutrient.nutrientId) {
          case 1008: // Calories
            nutrients.calories = nutrient.value;
            break;
          case 1003: // Protein
            nutrients.protein = nutrient.value;
            break;
          case 1004: // Fat
            nutrients.fat = nutrient.value;
            break;
          case 1005: // Carbs
            nutrients.carbs = nutrient.value;
            break;
        }
      });
      
      return {
        fdcId: food.fdcId,
        description: food.description,
        ...nutrients
      };
    });

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
    const tc = parseInt(targetCalories, 10);

    const breakfastTarget = Math.round(tc * 0.25);
    const lunchTarget = Math.round(tc * 0.35);
    const dinnerTarget = Math.round(tc * 0.40);

    const variance = 0.10;
    
    const breakfastMin = Math.round(breakfastTarget * (1 - variance));
    const breakfastMax = Math.round(breakfastTarget * (1 + variance));
    const lunchMin = Math.round(lunchTarget * (1 - variance));
    const lunchMax = Math.round(lunchTarget * (1 + variance));
    const dinnerMin = Math.round(dinnerTarget * (1 - variance));
    const dinnerMax = Math.round(dinnerTarget * (1 + variance));

    const edamamUrl = `https://api.edamam.com/api/meal-planner/v1/${EDAMAM_APP_ID}/select?app_id=${EDAMAM_APP_ID}&app_key=${EDAMAM_APP_KEY}`;

    const requestBody = {
      size: 1,
      plan: {
        sections: {
          "Breakfast": { accept: { all: [{ meal: ["breakfast"] }] }, fit: { ENERC_KCAL: { min: breakfastMin, max: breakfastMax } } },
          "Lunch": { accept: { all: [{ meal: ["lunch/dinner"] }] }, fit: { ENERC_KCAL: { min: lunchMin, max: lunchMax } } },
          "Dinner": { accept: { all: [{ meal: ["lunch/dinner"] }] }, fit: { ENERC_KCAL: { min: dinnerMin, max: dinnerMax } } }
        },
        fit: {
          ENERC_KCAL: {
            min: Math.round(tc * 0.95),
            max: Math.round(tc * 1.05)
          }
        }
      }
    };

    console.log("Calorie targets:", {
      total: tc,
      breakfast: { target: breakfastTarget, min: breakfastMin, max: breakfastMax },
      lunch: { target: lunchTarget, min: lunchMin, max: lunchMax },
      dinner: { target: dinnerTarget, min: dinnerMin, max: dinnerMax }
    });

    console.log("Requesting Edamam API at:", edamamUrl);
    console.log("Request Body:", JSON.stringify(requestBody, null, 2));

    const response = await axios.post(edamamUrl, requestBody, {
      headers: {
        "Content-Type": "application/json",
        "Edamam-Account-User": "testuser"
      }
    });

    const responseWithTargets = {
      ...response.data,
      calorieTargets: {
        total: tc,
        breakfast: breakfastTarget,
        lunch: lunchTarget,
        dinner: dinnerTarget
      }
    };

    res.json(responseWithTargets);
  } catch (error) {
    console.error("Error in /api/mealplan:", error.response?.data || error.message);
    res.status(500).json({
      error: 'Error fetching meal plan',
      details: error.response?.data || error.message
    });
  }
});

app.get('/api/lookup', async (req, res) => {
  const { recipeURI } = req.query;
  if (!recipeURI) {
    return res.status(400).json({ error: 'recipeURI parameter is required' });
  }
  
  const recipeId = recipeURI.split('#recipe_')[1];
  if (!recipeId) {
    return res.status(400).json({ error: 'Invalid recipe URI format' });
  }
  
  const lookupUrl = `https://api.edamam.com/api/recipes/v2/${recipeId}?type=public&app_id=${EDAMAM_APP_ID}&app_key=${EDAMAM_APP_KEY}`;
  
  try {
    console.log('Requesting recipe details from Edamam:', lookupUrl);
    const response = await axios.get(lookupUrl, {
      headers: {
        "Accept": "application/json",
        "Edamam-Account-User": "testuser"
      }
    });
    
    console.log('Received response from Edamam:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    
    const recipe = response.data.recipe;
    if (!recipe) {
      throw new Error('No recipe data in response');
    }
    
    res.json([recipe]);
  } catch (error) {
    console.error("Error in /api/lookup:", error.response?.data || error.message);
    res.status(500).json({
      error: 'Error fetching recipe details',
      details: error.response?.data || error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});