// server/controllers/userRecipeController.js
const db = require('../config/database');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const { JWT_SECRET } = require('../config/auth');



exports.submitRecipe = async (req, res) => {
  try {
    console.log("Recipe submission started");
    console.log("Request body:", req.body);

    const token = req.cookies.jwt;
    if (!token) {
      console.error("Authentication error: No token provided");
      return res.status(401).json({ error: "Not authenticated" });
    }
    let decoded;

    try {
       decoded = jwt.verify(token, JWT_SECRET);
      console.log("Token decoded successfully:", decoded);
    } catch (jwtError) {
      console.error("JWT verification failed:", jwtError);
      return res.status(401).json({ error: "Invalid token" });
    }

    const { title, instructions, calories, protein, fat, carbs, ingredients } = req.body;

    // Log validation
    if (!title || !instructions || !calories || !protein || !fat || !carbs || !ingredients) {
      console.error("Validation failed. Missing fields:", {
        hasTitle: !!title,
        hasInstructions: !!instructions,
        hasCalories: !!calories,
        hasProtein: !!protein,
        hasFat: !!fat,
        hasCarbs: !!carbs,
        hasIngredients: !!ingredients
      });
      return res.status(400).json({ error: "All fields are required" });
    }

    console.log("Creating recipe data object");
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

    console.log("Attempting database insertion");
    const [result] = await db.promise().query(
      "INSERT INTO recipes SET ?",
      [recipeData]
    );

    console.log("Recipe inserted successfully:", {
      recipeId: result.insertId,
      title: recipeData.title
    });

    res.json({ 
      success: true, 
      recipeId: result.insertId 
    });
  } catch (error) {
    console.error("Recipe submission error:", {
      message: error.message,
      stack: error.stack,
      details: error
    });
    res.status(500).json({ error: "Error submitting recipe", details: error.message });
  }
};

exports.getUserRecipes = async (req, res) => {
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
};

exports.getUserRecipeById = async (req, res) => {
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
};

exports.deleteUserRecipe = async (req, res) => {
  try {
    const token = req.cookies.jwt;
    if (!token) 
      return res.status(401).json({ error: "Not authenticated" });

    const decoded = jwt.verify(token, JWT_SECRET);

    // Pull id, user_id, image, and source so we can both authorize and delete
    const [rows] = await db.promise().query(
      "SELECT id, user_id, image, source FROM recipes WHERE id = ?",
      [req.params.id]
    );

    if (rows.length === 0) 
      return res.status(404).json({ error: "Recipe not found" });

    const recipe = rows[0];

    // Only allow deleting user-submitted recipes
    if (recipe.source !== 'user') {
      return res.status(403).json({ error: "Cannot delete Spoonacular recipes" });
    }

    // Ensure the logged-in user owns it
    if (decoded.id !== recipe.user_id) {
      return res.status(403).json({ error: "Unauthorized to delete this recipe" });
    }

    // Now we have recipe.id defined, so this actually removes the row
    await deleteRecipeAndImage(recipe);

    res.json({ success: true });
  } catch (error) {
    console.error("Delete recipe error:", error);
    res.status(500).json({ error: 'Error deleting recipe' });
  }
};

// Reusable deletion logic
const deleteRecipeAndImage = async (recipe) => {
  await db.promise().query("DELETE FROM recipes WHERE id = ?", [recipe.id]);
  
  if (recipe.image) {
    const filename = path.basename(recipe.image);
    const imagePath = path.join(__dirname, '../uploads/recipes', filename);
    fs.unlink(imagePath, (err) => err && console.error("Image delete error:", err));
  }
};

// filepath: c:\Users\Ryan\Desktop\bulkbuddy\server\controllers\userRecipeController.js

exports.getAllRecipes = async (req, res) => {
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
};