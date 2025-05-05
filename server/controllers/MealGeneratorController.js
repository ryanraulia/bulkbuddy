const axios = require('axios');

exports.generateMealPlan = async (req, res) => {
  try {
    const { targetCalories, diet, exclude, timeFrame = 'day' } = req.query;

    // Validate timeFrame
    if (!['day', 'week'].includes(timeFrame)) {
      return res.status(400).json({ error: 'Invalid time frame' });
    }

    const params = {
      apiKey: process.env.SPOONACULAR_API_KEY,
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

    // For daily plans, add detailed recipe information
    if (timeFrame === 'day') {
      const mealsWithNutrition = await Promise.all(
        response.data.meals.map(async (meal) => {
          const infoResponse = await axios.get(
            `https://api.spoonacular.com/recipes/${meal.id}/information`,
            { params: { apiKey: process.env.SPOONACULAR_API_KEY, includeNutrition: true } }
          );

          const data = infoResponse.data;
          const calories = data?.nutrition?.nutrients?.find(n => n.name === 'Calories')?.amount || 0;

          return {
            ...meal,
            title: data.title,
            image: data.image,
            readyInMinutes: data.readyInMinutes,
            servings: data.servings,
            healthScore: data.healthScore || 0, // Ensure healthScore is included
            nutrition: data.nutrition,
            calories,
            source: 'spoonacular',
            veryHealthy: data.veryHealthy,
            budget_friendly: data.cheap
          };
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
};