// server/controllers/userRecipeController.js
const db = require('../config/database');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const { JWT_SECRET } = require('../config/auth');

// Helper: delete recipe and associated image
const deleteRecipeAndImage = async (recipe) => {
  // Deletes cascade to nutrition & dietary_flags via foreign keys
  await db.promise().query("DELETE FROM recipes WHERE id = ?", [recipe.id]);
  if (recipe.image) {
    const filename = path.basename(recipe.image);
    const imagePath = path.join(__dirname, '../uploads/recipes', filename);
    fs.unlink(imagePath, err => err && console.error("Image delete error:", err));
  }
};

exports.submitRecipe = async (req, res) => {
  try {
    console.log("Recipe submission started");
    const token = req.cookies.jwt;
    if (!token) return res.status(401).json({ error: "Not authenticated" });

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
      console.log("Token decoded successfully:", decoded);
    } catch (jwtError) {
      console.error("JWT verification failed:", jwtError);
      return res.status(401).json({ error: "Invalid token" });
    }

    const [userExists] = await db.promise().query(
      "SELECT id FROM users WHERE id = ?",
      [decoded.id]
    );
    if (!userExists.length) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const { title, instructions, calories, protein, fat, carbs, ingredients } = req.body;

    // Validation
    if (!title || !instructions || !calories || !protein || !fat || !carbs || !ingredients) {
      console.error("Validation failed. Missing required fields.");
      return res.status(400).json({ error: "All fields are required" });
    }

    // Safely parse cuisine and meal type IDs (guard against NaN)
    let cuisineId = null;
    if (req.body.cuisine) {
      const tmp = parseInt(req.body.cuisine, 10);
      cuisineId = isNaN(tmp) ? null : tmp;
    }
    let mealTypeId = null;
    if (req.body.mealType) {
      const tmp = parseInt(req.body.mealType, 10);
      mealTypeId = isNaN(tmp) ? null : tmp;
    }

    // Parse ingredients array into newline-separated list
    const parsedIngredients = JSON.parse(ingredients)
      .map(item => `${item.amount} ${item.unit} ${item.name}`)
      .join('\n');

    // Build recipe record
    const recipeRecord = {
      user_id: decoded.id,
      title,
      instructions,
      ingredients: parsedIngredients,
      servings: parseInt(req.body.servings, 10) || 1,
      health_score: parseInt(req.body.healthScore, 10) || 0,
      diet_type: req.body.dietType || 'all',
      cuisine_id: cuisineId,
      meal_type_id: mealTypeId,
      max_prep_time: req.body.maxPrepTime ? parseInt(req.body.maxPrepTime, 10) : null,
      source: 'user',
      status: 'pending',
      image: req.file ? `/uploads/recipes/${req.file.filename}` : null
    };

    // Insert into recipes
    const [insertResult] = await db.promise().query(
      "INSERT INTO recipes SET ?",
      [recipeRecord]
    );
    const recipeId = insertResult.insertId;
    console.log("Recipe inserted with ID", recipeId);

    // Build nutrition record
    await db.promise().query(
      `INSERT INTO nutrition
         (recipe_id, calories, protein, fat, carbs, sugar, fiber,
          vitamin_b6, folate, vitamin_b12, vitamin_c, vitamin_k, vitamin_e, vitamin_a,
          vitamin_d,
          sodium, zinc, iron, phosphorus, magnesium, potassium, calcium)
       VALUES
         (?,         ?,        ?,       ?,   ?,     ?,     ?,
          ?,           ?,      ?,           ?,         ?,         ?,         ?,
          ?,
          ?,      ?,    ?,     ?,           ?,         ?,         ?)`,

      [
        recipeId,
        parseFloat(calories) || 0,
        parseFloat(protein) || 0,
        parseFloat(fat) || 0,
        parseFloat(carbs) || 0,
        parseFloat(req.body.sugar) || 0,
        parseFloat(req.body.fiber) || 0,
        parseFloat(req.body.vitamin_b6) || 0,
        parseFloat(req.body.folate) || 0,
        parseFloat(req.body.vitamin_b12) || 0,
        parseFloat(req.body.vitamin_c) || 0,
        parseFloat(req.body.vitamin_k) || 0,
        parseFloat(req.body.vitamin_e) || 0,
        parseFloat(req.body.vitamin_a) || 0,
        parseFloat(req.body.vitamin_d) || 0, // Added vitamin_d
        parseFloat(req.body.sodium) || 0,
        parseFloat(req.body.zinc) || 0,
        parseFloat(req.body.iron) || 0,
        parseFloat(req.body.phosphorus) || 0,
        parseFloat(req.body.magnesium) || 0,
        parseFloat(req.body.potassium) || 0,
        parseFloat(req.body.calcium) || 0
      ]
    );

    // Build dietary flags record
    const flagMap = {
      glutenFree: 'gluten_free',
      vegetarian: 'vegetarian',
      vegan: 'vegan',
      dairyFree: 'dairy_free',
      lowFodmap: 'low_fodmap',
      sustainable: 'sustainable',
      veryHealthy: 'very_healthy',
      budgetFriendly: 'budget_friendly',
      eggFree: 'egg_free',
      peanutFree: 'peanut_free',
      soyFree: 'soy_free',
      treeNutFree: 'tree_nut_free',
      shellfishFree: 'shellfish_free'
    };
    const flagRecord = { recipe_id: recipeId };
    Object.entries(flagMap).forEach(([bodyKey, dbKey]) => {
      flagRecord[dbKey] = req.body[bodyKey] === 'true';
    });
    await db.promise().query("INSERT INTO dietary_flags SET ?", [flagRecord]);

    res.json({ success: true, recipeId });
  } catch (error) {
    console.error("submitRecipe error:", error);
    res.status(500).json({ error: "Error submitting recipe", details: error.message });
  }
};

exports.getUserRecipes = async (req, res) => {
  try {
    const token = req.cookies.jwt;
    if (!token) return res.status(401).json({ error: "Not authenticated" });
    const decoded = jwt.verify(token, JWT_SECRET);

    const [recipes] = await db.promise().query(
      `SELECT r.id, r.title, r.image, 
              n.calories, n.protein, n.fat, n.carbs,
              r.status, r.created_at, u.name AS username
       FROM recipes r
       JOIN users u ON r.user_id = u.id
       LEFT JOIN nutrition n ON r.id = n.recipe_id
       ORDER BY r.created_at DESC`,
      [decoded.id]
    );

    res.json(recipes);
  } catch (error) {
    console.error("getUserRecipes error:", error);
    res.status(500).json({ error: 'Error fetching recipes' });
  }
};

exports.getUserRecipeById = async (req, res) => {
  try {
    const token = req.cookies.jwt;
    if (!token) return res.status(401).json({ error: "Not authenticated" });
    const decoded = jwt.verify(token, JWT_SECRET);

    const [recipe] = await db.promise().query(
      "SELECT id FROM recipes WHERE id = ? AND user_id = ?",
      [req.params.id, decoded.id]
    );
    if (!recipe.length) {
      return res.status(404).json({ error: "Recipe not found" });
    }

    const [rows] = await db.promise().query(
      `SELECT r.*, n.*, df.*, c.name AS cuisine, mt.name AS meal_type
       FROM recipes r
       LEFT JOIN nutrition n ON r.id = n.recipe_id
       LEFT JOIN dietary_flags df ON r.id = df.recipe_id
       LEFT JOIN cuisines c ON r.cuisine_id = c.id
       LEFT JOIN meal_types mt ON r.meal_type_id = mt.id
       WHERE r.id = ?`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: "Recipe not found" });
    const u = rows[0];

    // Caloric breakdown
    const pCal = u.protein * 4;
    const fCal = u.fat * 9;
    const cCal = u.carbs * 4;
    const total = pCal + fCal + cCal;

    const formatted = {
      id: u.id,
      title: u.title,
      source: 'user',
      status: u.status,
      created_at: u.created_at,
      image: u.image || '/default-food.jpg',
      cuisine: u.cuisine,
      meal_type: u.meal_type,
      diet_type: u.diet_type,
      servings: u.servings,
      health_score: u.health_score,
      max_prep_time: u.max_prep_time,
      extendedIngredients: u.ingredients?.split('\n').map(i => ({ original: i })) || [],
      instructions: u.instructions || 'No instructions provided',
      nutrition: {
        nutrients: [
          { name: 'Calories', amount: u.calories, unit: 'kcal' },
          { name: 'Protein', amount: u.protein, unit: 'g' },
          { name: 'Fat', amount: u.fat, unit: 'g' },
          { name: 'Carbohydrates', amount: u.carbs, unit: 'g' },
          { name: 'Sugar', amount: u.sugar, unit: 'g' },
          { name: 'Fiber', amount: u.fiber, unit: 'g' },
          { name: 'Vitamin B6', amount: u.vitamin_b6, unit: 'mg' },
          { name: 'Folate', amount: u.folate, unit: 'mcg' },
          { name: 'Vitamin B12', amount: u.vitamin_b12, unit: 'mcg' },
          { name: 'Vitamin C', amount: u.vitamin_c, unit: 'mg' },
          { name: 'Vitamin K', amount: u.vitamin_k, unit: 'mcg' },
          { name: 'Vitamin E', amount: u.vitamin_e, unit: 'mg' },
          { name: 'Vitamin A', amount: u.vitamin_a, unit: 'IU' },
          { name: 'Vitamin D', amount: u.vitamin_d, unit: 'IU' }, // Added vitamin_d
          { name: 'Sodium', amount: u.sodium, unit: 'mg' },
          { name: 'Zinc', amount: u.zinc, unit: 'mg' },
          { name: 'Iron', amount: u.iron, unit: 'mg' },
          { name: 'Phosphorus', amount: u.phosphorus, unit: 'mg' },
          { name: 'Magnesium', amount: u.magnesium, unit: 'mg' },
          { name: 'Potassium', amount: u.potassium, unit: 'mg' },
          { name: 'Calcium', amount: u.calcium, unit: 'mg' }
        ],
        caloricBreakdown: {
          percentProtein: total ? (pCal / total * 100) : 0,
          percentFat: total ? (fCal / total * 100) : 0,
          percentCarbs: total ? (cCal / total * 100) : 0
        }
      },
      flags: {
        gluten_free: Boolean(u.gluten_free),
        vegetarian: Boolean(u.vegetarian),
        vegan: Boolean(u.vegan),
        dairy_free: Boolean(u.dairy_free),
        low_fodmap: Boolean(u.low_fodmap),
        sustainable: Boolean(u.sustainable),
        very_healthy: Boolean(u.very_healthy),
        budget_friendly: Boolean(u.budget_friendly),
        egg_free: Boolean(u.egg_free),
        peanut_free: Boolean(u.peanut_free),
        soy_free: Boolean(u.soy_free),
        tree_nut_free: Boolean(u.tree_nut_free),
        shellfish_free: Boolean(u.shellfish_free)
      }
    };

    res.json(formatted);
  } catch (error) {
    console.error("getUserRecipeById error:", error);
    res.status(500).json({ error: 'Error fetching recipe' });
  }
};

exports.deleteUserRecipe = async (req, res) => {
  try {
    const token = req.cookies.jwt;
    if (!token) return res.status(401).json({ error: "Not authenticated" });
    const decoded = jwt.verify(token, JWT_SECRET);

    const [rows] = await db.promise().query(
      "SELECT id, user_id, image, source FROM recipes WHERE id = ?",
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: "Recipe not found" });

    const recipe = rows[0];
    if (recipe.source !== 'user')
      return res.status(403).json({ error: "Cannot delete Spoonacular recipes" });
    if (decoded.id !== recipe.user_id)
      return res.status(403).json({ error: "Unauthorized to delete this recipe" });

    await deleteRecipeAndImage(recipe);
    res.json({ success: true });
  } catch (error) {
    console.error("deleteUserRecipe error:", error);
    res.status(500).json({ error: 'Error deleting recipe' });
  }
};

exports.getAllRecipes = async (req, res) => {
  try {
    const [recipes] = await db.promise().query(
      `SELECT r.id, r.title, r.image, n.calories, r.status, r.created_at, u.name AS username
       FROM recipes r
       JOIN users u ON r.user_id = u.id
       LEFT JOIN nutrition n ON r.id = n.recipe_id
       ORDER BY r.created_at DESC`
    );

    const serverUrl = process.env.SERVER_URL || 'http://localhost:5000';
    const updatedRecipes = recipes.map(r => ({
      ...r,
      source: 'user',
      image: r.image ? `${serverUrl}${r.image}` : '/default-food.jpg'
    }));

    res.json(updatedRecipes);
  } catch (error) {
    console.error("getAllRecipes error:", error);
    res.status(500).json({ error: 'Error fetching recipes' });
  }
};
