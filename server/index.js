// Top imports
const express = require('express');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const path = require('path');
const fs = require('fs');
require('dotenv').config();
const axios = require("axios");        // ← add this
const multer = require("multer"); 
const corsOptions = require('./config/cors');
const cors = require('cors');
const db = require('./config/database');
const { requireAuth, requireAdmin } = require('./middleware/authMiddleware');
// Modularized imports
const transporter = require('./config/email');
const recipeRoutes = require('./routes/recipeRoutes');

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
app.use('/api', require('./routes/authRoutes'));
app.use('/api/recipes', recipeRoutes);


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
// Get meal plans endpoint - updated with complete nutrition data handling
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

    // Enrich with recipe data including nutrition
    const enrichedPlans = await Promise.all(
      mealPlans.map(async plan => {
        try {
          if (plan.source === 'spoonacular') {
            // Fetch both basic info and nutrition data in parallel
            const [infoResponse, nutritionResponse] = await Promise.all([
              axios.get(
                `https://api.spoonacular.com/recipes/${plan.recipe_id}/information`,
                { params: { apiKey: SPOONACULAR_API_KEY } }
              ),
              axios.get(
                `https://api.spoonacular.com/recipes/${plan.recipe_id}/nutritionWidget.json`,
                { params: { apiKey: SPOONACULAR_API_KEY } }
              ).catch(() => null) // Fallback if nutrition fails
            ]);

            const recipeInfo = infoResponse.data;
            const nutrition = nutritionResponse?.data || {};

            // Parse nutrition values
            const parseNutrition = (value) => {
              if (typeof value === 'string') {
                return parseFloat(value.replace(/[^\d.]/g, '')) || 0;
              }
              return value || 0;
            };

            return {
              ...plan,
              recipe: {
                ...recipeInfo,
                source: 'spoonacular',
                calories: parseNutrition(nutrition.calories),
                protein: parseNutrition(nutrition.protein),
                carbs: parseNutrition(nutrition.carbs),
                fat: parseNutrition(nutrition.fat),
                // Add image URL if not already present
                image: recipeInfo.image || `https://spoonacular.com/recipeImages/${plan.recipe_id}-312x231.jpg`
              }
            };
          } else {
            // Handle user recipes
            // In the user recipe handling section of /api/meal-plans endpoint
            const [recipes] = await db.promise().query(
              `SELECT r.*, 
              CONCAT('${process.env.SERVER_URL || 'http://localhost:5000'}', r.image) as image,
              u.name AS username
              FROM recipes r
              JOIN users u ON r.user_id = u.id
              WHERE r.id = ?`,
              [plan.recipe_id]
            );

            if (recipes.length > 0) {
              const recipe = recipes[0];
              return {
                ...plan,
                recipe: {
                  ...recipe,
                  source: 'user',
                  image: recipe.image || '/default-food.jpg',
                  calories: Number(recipe.calories) || 0,
                  protein: Number(recipe.protein) || 0,
                  carbs: Number(recipe.carbs) || 0,
                  fat: Number(recipe.fat) || 0
                }
              };
            }
            return plan;
          }
        } catch (error) {
          console.error("Error fetching recipe:", error);
          return plan; // Return basic plan if recipe fetch fails
        }
      })
    );

    res.json(enrichedPlans);
  } catch (error) {
    console.error("Meal plan fetch error:", error);
    res.status(500).json({ 
      error: "Internal server error",
      details: error.message 
    });
  }
});

// Add to server/index.js
// Update the /api/meal-plans/nutrition endpoint
app.get('/api/meal-plans/nutrition', async (req, res) => {
  const token = req.cookies.jwt;
  if (!token) return res.status(401).json({ error: "Not authenticated" });
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const { date } = req.query;

    // Get meal plans for the date
    const [mealPlans] = await db.promise().query(
      "SELECT * FROM meal_plans WHERE user_id = ? AND date = ?",
      [decoded.id, date]
    );

    let total = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0
    };
  
    // Process each meal
    for (const plan of mealPlans) {
      if (plan.source === 'spoonacular') {
        const response = await axios.get(
          `https://api.spoonacular.com/recipes/${plan.recipe_id}/nutritionWidget.json`,
          { params: { apiKey: SPOONACULAR_API_KEY } }
        );
        const nutrition = response.data;
        total.calories += parseFloat(nutrition.calories) || 0;
        total.protein += parseFloat(nutrition.protein?.replace('g', '')) || 0;
        total.carbs += parseFloat(nutrition.carbs?.replace('g', '')) || 0;
        total.fat += parseFloat(nutrition.fat?.replace('g', '')) || 0;
      } else {
        const [recipes] = await db.promise().query(
          "SELECT calories, protein, carbs, fat FROM recipes WHERE id = ?",
          [plan.recipe_id]
        );
        if (recipes.length > 0) {
          const recipe = recipes[0];
          total.calories += parseFloat(recipe.calories) || 0; // Use actual calories
          total.protein += parseFloat(recipe.protein) || 0;
          total.carbs += parseFloat(recipe.carbs) || 0;
          total.fat += parseFloat(recipe.fat) || 0;
        }
      }
    }
  
    // Calculate percentages based on ACTUAL CALORIES
    const caloriesFromProtein = total.protein * 4;
    const caloriesFromCarbs = total.carbs * 4;
    const caloriesFromFat = total.fat * 9;
    const calculatedCalories = caloriesFromProtein + caloriesFromCarbs + caloriesFromFat;
    
    // But use the actual summed calories for total
    const actualCalories = total.calories;
  
    const response = {
      total_calories: actualCalories, // Use actual summed calories
      protein: total.protein,
      carbs: total.carbs,
      fat: total.fat,
      protein_percentage: (caloriesFromProtein / calculatedCalories) * 100 || 0,
      carbs_percentage: (caloriesFromCarbs / calculatedCalories) * 100 || 0,
      fats_percentage: (caloriesFromFat / calculatedCalories) * 100 || 0,
      recommended_calories: 2000,
      protein_goal: 56
    };
  
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
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
      gluten_free: recipeInfo.data.glutenFree,
      dairy_free: recipeInfo.data.dairyFree,
      vegetarian: recipeInfo.data.vegetarian,
      vegan: recipeInfo.data.vegan,
      low_fodmap: recipeInfo.data.lowFodmap,
      sustainable: recipeInfo.data.sustainable,
      very_healthy: recipeInfo.data.veryHealthy,
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

// Add this test endpoint
app.get('/api/admin/test', [requireAuth, requireAdmin], (req, res) => {
  res.json({ message: "Admin access granted" });
});
// Serve static files
app.use('/uploads/recipes', express.static(path.join(__dirname, 'uploads', 'recipes')));

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
      diet_type: req.body.dietType || 'all',
      cuisine: req.body.cuisine,
      meal_type: req.body.mealType,
      max_prep_time: req.body.maxPrepTime ? parseInt(req.body.maxPrepTime) : null,
      egg_free: req.body.eggFree === 'true',
      peanut_free: req.body.peanutFree === 'true',
      soy_free: req.body.soyFree === 'true',
      tree_nut_free: req.body.treeNutFree === 'true',
      shellfish_free: req.body.shellfishFree === 'true',
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

    // Set vegetarian/vegan based on diet_type
if (recipeData.diet_type === 'vegetarian') {
  recipeData.vegetarian = true;
} else if (recipeData.diet_type === 'vegan') {
  recipeData.vegan = true;
}

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
    
    // Calculate calories from macros
    const proteinCal = userRecipe.protein * 4;
    const fatCal = userRecipe.fat * 9;
    const carbsCal = userRecipe.carbs * 4;
    const totalCalFromMacros = proteinCal + fatCal + carbsCal;

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
          percentProtein: totalCalFromMacros ? (proteinCal / totalCalFromMacros * 100) : 0,
          percentFat: totalCalFromMacros ? (fatCal / totalCalFromMacros * 100) : 0,
          percentCarbs: totalCalFromMacros ? (carbsCal / totalCalFromMacros * 100) : 0
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
app.get('/api/admin/pending-recipes', [requireAuth, requireAdmin], async (req, res) => {
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
app.put('/api/admin/approve-recipe/:id', [requireAuth, requireAdmin], async (req, res) => {
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
app.delete('/api/admin/reject-recipe/:id', [requireAuth, requireAdmin], async (req, res) => {
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