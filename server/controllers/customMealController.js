const db = require('../config/database');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const { SPOONACULAR_API_KEY } = process.env;
const JWT_SECRET = process.env.JWT_SECRET;

exports.addToMealPlan = async (req, res) => {
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
    if (errors.length) {
      return res.status(400).json({ error: errors.join(', ') });
    }

    // If it's a user‐created recipe, ensure it exists
    if (source === 'user') {
      const [recipes] = await db.promise().query(
        "SELECT id FROM recipes WHERE id = ? AND source = 'user'",
        [recipeId]
      );
      if (!recipes.length) {
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
};

exports.getMealPlans = async (req, res) => {
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
  };
  exports.getMealPlanNutrition = async (req, res) => {
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
  };
  
  exports.deleteMealPlan = async (req, res) => {
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
  };