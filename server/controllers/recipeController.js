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

    // Spoonacular filters
    const allowedFilters = [
      'diet', 'cuisine', 'intolerances', 'excludeIngredients', 'type',
      'maxReadyTime', 'minCalories', 'maxCalories', 'includeIngredients',
      'fillIngredients', 'sort', 'sortDirection', 'offset', 'number',
      'minProtein', 'maxProtein', 'minCarbs', 'maxCarbs', 'minFat', 'maxFat'
    ];
    const hasFilters = allowedFilters.some(param => filters[param]);
    const isEmptySearch = !query && !hasFilters;

    // 1) Spoonacular fetch
    if (isEmptySearch) {
      const randomRes = await axios.get(
        'https://api.spoonacular.com/recipes/random',
        { params: { apiKey: SPOONACULAR_API_KEY, number: 8 } }
      );
      combinedResults.push(...randomRes.data.recipes.map(r => ({
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
      allowedFilters.forEach(p => {
        if (filters[p]) spoonParams[p] = filters[p];
      });
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

    // 2) Include user-submitted recipes
    if (includeUser === 'true') {
      const userConditions = [];
      const userParams = [];

      // Title search
      if (query) {
        userConditions.push('LOWER(r.title) LIKE LOWER(?)');
        userParams.push(`%${query}%`);
      }
      // Diet filters on dietary_flags
      if (filters.diet && mapFilterToColumn.diet[filters.diet]) {
        userConditions.push(`df.${mapFilterToColumn.diet[filters.diet]} = 1`);
      }
      // Intolerances
      if (filters.intolerances) {
        const ints = Array.isArray(filters.intolerances)
          ? filters.intolerances
          : [filters.intolerances];
        const conds = ints
          .filter(i => mapFilterToColumn.intolerances[i])
          .map(i => `df.${mapFilterToColumn.intolerances[i]} = 1`);
        if (conds.length) userConditions.push(`(${conds.join(' AND ')})`);
      }
      // Meal type via meal_types
      if (filters.type) {
        userConditions.push('mt.name = ?');
        userParams.push(filters.type);
      }
      // Nutrition macro filters
      ['minCalories','maxCalories','minProtein','maxProtein','minCarbs','maxCarbs','minFat','maxFat']
        .forEach(key => {
          if (filters[key]) {
            const col = key.replace(/^(min|max)([A-Z].*)/, (_, p, field) =>
              field.charAt(0).toLowerCase() + field.slice(1)
            );
            const op = key.startsWith('min') ? '>=' : '<=';
            userConditions.push(`n.${col} ${op} ?`);
            userParams.push(filters[key]);
          }
        });

      const [userRows] = await db.promise().query(
        `SELECT 
           r.id AS recipe_id,
           r.title,
           r.image,
           n.calories,
           n.protein,
           n.fat,
           n.carbs,
           r.servings,
           r.health_score,
           df.gluten_free,
           df.vegetarian,
           df.vegan,
           df.dairy_free,
           df.low_fodmap,
           df.sustainable,
           df.very_healthy,
           df.budget_friendly,
           r.ingredients,
           r.created_at,
           u.name AS username
         FROM recipes r
         JOIN users u ON r.user_id = u.id
         LEFT JOIN nutrition n ON r.id = n.recipe_id
         LEFT JOIN dietary_flags df ON r.id = df.recipe_id
         LEFT JOIN meal_types mt ON r.meal_type_id = mt.id
         WHERE r.source = 'user'
           AND r.status = 'approved'
           ${userConditions.length ? 'AND ' + userConditions.join(' AND ') : ''}`,
        userParams
      );

      const serverUrl = process.env.SERVER_URL || 'http://localhost:5000';
      combinedResults.push(...userRows.map(r => ({
        id: r.recipe_id,
        title: r.title,
        image: r.image ? `${serverUrl}${r.image}` : '/default-food.jpg',
        source: 'user',
        status: 'approved',
        created_at: r.created_at,
        username: r.username,
        servings: r.servings,
        healthScore: r.health_score,
        extendedIngredients: r.ingredients?.split('\n').map(i => ({ original: i })) || [],
        nutrition: {
          nutrients: [
            { name: 'Calories', amount: r.calories, unit: 'kcal' },
            { name: 'Protein', amount: r.protein, unit: 'g' },
            { name: 'Fat', amount: r.fat, unit: 'g' },
            { name: 'Carbohydrates', amount: r.carbs, unit: 'g' }
          ]
        },
        gluten_free: Boolean(r.gluten_free),
        vegetarian: Boolean(r.vegetarian),
        vegan: Boolean(r.vegan),
        dairy_free: Boolean(r.dairy_free),
        low_fodmap: Boolean(r.low_fodmap),
        sustainable: Boolean(r.sustainable),
        very_healthy: Boolean(r.very_healthy),
        budget_friendly: Boolean(r.budget_friendly)
      })));
    }

    res.json(combinedResults);
  } catch (error) {
    console.error("Recipe search error:", error);
    res.status(500).json({ error: 'Error searching recipes' });
  }
};

exports.getRandomRecipes = async (req, res) => {
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
};

exports.getUserRecipes = async (req, res) => {
  try {
    const [recipes] = await db.promise().query(
      `SELECT 
         r.id, r.title, r.image,
         n.calories,
         r.status,
         r.created_at,
         u.name AS username
       FROM recipes r
       JOIN users u ON r.user_id = u.id
       LEFT JOIN nutrition n ON r.id = n.recipe_id
       WHERE r.source = 'user'
         AND r.status = 'approved'
       ORDER BY r.created_at DESC`
    );

    const serverUrl = process.env.SERVER_URL || 'http://localhost:5000';
    const updatedRecipes = recipes.map(recipe => ({
      ...recipe,
      source: 'user',
      image: recipe.image ? `${serverUrl}${recipe.image}` : '/default-food.jpg'
    }));

    res.json(updatedRecipes);
  } catch (error) {
    console.error("getUserRecipes error:", error);
    res.status(500).json({ error: 'Error fetching user recipes' });
  }
};

exports.getRecipeById = async (req, res) => {
  try {
    const { id } = req.params;

    // 1) Try to load a user-submitted recipe from our DB
    const [userRows] = await db.promise().query(`
      SELECT 
        r.id AS recipe_id,
        r.title,
        r.image,
        r.servings,
        r.health_score,
        r.ingredients,
        r.created_at,
        u.name AS username,
        n.calories,
        n.protein,
        n.fat,
        n.carbs,
        df.gluten_free,
        df.dairy_free,
        df.vegetarian,
        df.vegan,
        df.low_fodmap,
        df.sustainable,
        df.very_healthy,
        df.budget_friendly
      FROM recipes r
      JOIN users u ON r.user_id = u.id
      LEFT JOIN nutrition n ON r.id = n.recipe_id
      LEFT JOIN dietary_flags df ON r.id = df.recipe_id
      WHERE r.id = ? AND r.source = 'user' AND r.status = 'approved'
    `, [id]);

    if (userRows.length) {
      const r = userRows[0];
      const serverUrl = process.env.SERVER_URL || 'http://localhost:5000';
      return res.json({
        id:        r.recipe_id,
        title:     r.title,
        image:     r.image ? `${serverUrl}${r.image}` : '/default-food.jpg',
        servings:  r.servings,
        healthScore: r.health_score,
        created_at: r.created_at,
        username:  r.username,
        source:    'user',
        extendedIngredients: r.ingredients?.split('\n').map(i => ({ original: i })) || [],
        nutrition: {
          nutrients: [
            { name: 'Calories',      amount: r.calories, unit: 'kcal' },
            { name: 'Protein',       amount: r.protein,  unit: 'g'   },
            { name: 'Fat',           amount: r.fat,      unit: 'g'   },
            { name: 'Carbohydrates', amount: r.carbs,    unit: 'g'   },
          ]
        },
        gluten_free:    Boolean(r.gluten_free),
        dairy_free:     Boolean(r.dairy_free),
        vegetarian:     Boolean(r.vegetarian),
        vegan:          Boolean(r.vegan),
        low_fodmap:     Boolean(r.low_fodmap),
        sustainable:    Boolean(r.sustainable),
        very_healthy:   Boolean(r.very_healthy),
        budget_friendly:Boolean(r.budget_friendly)
      });
    }

    // 2) Fallback: spoonacular
    const recipeInfo = await axios.get(
      `https://api.spoonacular.com/recipes/${id}/information`,
      {
        params: {
          apiKey: SPOONACULAR_API_KEY,
          includeNutrition: true,
        },
      }
    );
    const data = recipeInfo.data;
    res.json({
      ...data,
      glutten_free: data.glutenFree,
      dairy_free:   data.dairyFree,
      vegetarian:   data.vegetarian,
      vegan:        data.vegan,
      low_fodmap:   data.lowFodmap,
      sustainable:  data.sustainable,
      very_healthy: data.veryHealthy,
      healthScore:  data.healthScore,
      calories:     data.nutrition?.nutrients.find(n => n.name === 'Calories')?.amount || 0,
      source:       'spoonacular'
    });

  } catch (error) {
    console.error('Error in /api/recipe/:id', error.response?.data || error.message);
    res.status(500).json({
      error:   'Error fetching recipe details',
      details: error.response?.data || error.message,
    });
  }
};
