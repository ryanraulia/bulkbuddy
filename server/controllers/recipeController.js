// server/controllers/recipeController.js
const axios = require('axios');
const db = require('../config/database');
const SPOONACULAR_API_KEY = process.env.SPOONACULAR_API_KEY;

// Filter mapping configuration
const mapFilterToColumn = {
  diet: {
    vegetarian: 'vegetarian',
    vegan: 'vegan',
    glutenFree: 'gluten_free',
    dairyFree: 'dairy_free',
    lowFodmap: 'low_fodmap'
  },
  intolerances: {
    dairy: 'dairy_free',
    gluten: 'gluten_free',
    peanut: 'peanut_free',
    soy: 'soy_free',
    treeNut: 'tree_nut_free',
    shellfish: 'shellfish_free'
  }
};

exports.searchRecipes = async (req, res) => {
  try {
    const { query, includeUser, ...filters } = req.query;
    const combinedResults = [];

    // List of allowed Spoonacular parameters
    const allowedFilters = [
      'diet', 'cuisine', 'intolerances', 'excludeIngredients', 'type',
      'maxReadyTime', 'minCalories', 'maxCalories', 'includeIngredients',
      'fillIngredients', 'sort', 'sortDirection', 'offset', 'number',
      'minProtein', 'maxProtein', 'minCarbs', 'maxCarbs', 'minFat', 'maxFat'
    ];

    // Determine if we should get random or filtered/search results
    const hasFilters = allowedFilters.some(param => filters[param]);
    const isEmptySearch = !query && !hasFilters;

    // 1) Fetch from Spoonacular
    if (isEmptySearch) {
      const randomResponse = await axios.get(
        'https://api.spoonacular.com/recipes/random',
        { params: { apiKey: SPOONACULAR_API_KEY, number: 8 } }
      );
      combinedResults.push(...randomResponse.data.recipes.map(r => ({
        ...r,
        source: 'spoonacular'
      })));
    } else {
      const spoonParams = {
        apiKey: SPOONACULAR_API_KEY,
        query: query || '',
        number: 8,
        addRecipeInformation: true,
        instructionsRequired: true,
        addRecipeNutrition: true
      };
      allowedFilters.forEach(p => { if (filters[p]) spoonParams[p] = filters[p]; });
      Object.keys(spoonParams).forEach(k => spoonParams[k] === undefined && delete spoonParams[k]);

      const searchRes = await axios.get(
        'https://api.spoonacular.com/recipes/complexSearch',
        { params: spoonParams }
      );
      combinedResults.push(...searchRes.data.results.map(r => ({
        ...r,
        source: 'spoonacular',
        healthScore: r.healthScore
      })));
    }

    // 2) Optionally fetch user recipes
    if (includeUser === 'true') {
      const userConditions = [];
      const userParams = [];
      if (query) {
        userConditions.push('LOWER(recipes.title) LIKE LOWER(?)');
        userParams.push(`%${query}%`);
      }
      if (filters.diet && mapFilterToColumn.diet[filters.diet]) {
        userConditions.push(`${mapFilterToColumn.diet[filters.diet]} = 1`);
      }
      if (filters.intolerances) {
        const ints = Array.isArray(filters.intolerances)
          ? filters.intolerances
          : [filters.intolerances];
        const conds = ints
          .filter(i => mapFilterToColumn.intolerances[i])
          .map(i => `${mapFilterToColumn.intolerances[i]} = 1`);
        if (conds.length) userConditions.push(`(${conds.join(' AND ')})`);
      }
      if (filters.type) {
        userConditions.push('recipes.meal_type = ?');
        userParams.push(filters.type);
      }
      // calorie & macro filters
      ['minCalories','maxCalories','minProtein','maxProtein','minCarbs','maxCarbs','minFat','maxFat']
        .forEach(key => {
          if (filters[key]) {
            const col = key.replace(/(min|max)([A-Z].*)/, (m, p, field) => {
              return field.charAt(0).toLowerCase() + field.slice(1);
            });
            const op = key.startsWith('min') ? '>=' : '<=';
            userConditions.push(`recipes.${col} ${op} ?`);
            userParams.push(filters[key]);
          }
        });

      const [userRows] = await db.promise().query(
        `SELECT 
  recipes.id AS recipe_id, 
  recipes.title, 
  recipes.image, 
  recipes.calories, 
  recipes.protein, 
  recipes.fat, 
  recipes.carbs,
  recipes.servings, 
  recipes.health_score, 
  recipes.gluten_free, 
  recipes.vegetarian, 
  recipes.vegan, 
  recipes.dairy_free,
  recipes.low_fodmap, 
  recipes.sustainable, 
  recipes.very_healthy, 
  recipes.budget_friendly, 
  recipes.ingredients, 
  recipes.created_at,
  users.name AS username
FROM recipes
JOIN users ON recipes.user_id = users.id
WHERE recipes.source = 'user' 
  AND recipes.status = 'approved'
         ${userConditions.length ? 'AND ' + userConditions.join(' AND ') : ''}`,
        userParams
      );

      const serverUrl = process.env.SERVER_URL || 'http://localhost:5000';
      combinedResults.push(...userRows.map(r => ({
        ...r,
        id: r.recipe_id,
        source: 'user',
        image: r.image ? `${serverUrl}${r.image}` : '/default-food.jpg',
        extendedIngredients: r.ingredients?.split('\n').map(i => ({ original: i })) || []
      })));
    }

    res.json(combinedResults);
  } catch (error) {
    console.error("Recipe search error:", error);
    res.status(500).json({ error: 'Error searching recipes' });
  }
};
