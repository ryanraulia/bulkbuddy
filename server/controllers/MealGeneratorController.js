const axios = require('axios');

exports.generateMealPlan = async (req, res) => {
  try {
    // Pull raw input from query
    const { targetCalories: rawCalories, diet, exclude, timeFrame = 'day' } = req.query;

    // Validate & normalize calorie input
    const targetCalories = parseInt(rawCalories, 10);
    if (!rawCalories || isNaN(targetCalories) || targetCalories <= 0) {
      return res.status(400).json({ error: "Invalid calorie input" });
    }

    // Validate timeFrame
    if (!['day', 'week'].includes(timeFrame)) {
      return res.status(400).json({ error: 'Invalid time frame' });
    }

    const params = {
      apiKey: process.env.SPOONACULAR_API_KEY,
      timeFrame,
      targetCalories, // Now a proper number
      diet: diet || undefined,
      exclude: exclude || undefined,
    };

    // Remove undefined parameters
    Object.keys(params).forEach((key) => params[key] === undefined && delete params[key]);

    // Fetch meal plan from Spoonacular API
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
            healthScore: data.healthScore || 0,
            nutrition: data.nutrition,
            calories,
            source: 'spoonacular',
          };
        })
      );
      processedData.meals = mealsWithNutrition;
    }

    processedData.filters = { 
      diet: diet || 'none',
      exclude: exclude || 'none',
      timeFrame,
    };

    res.json(processedData);
  } catch (error) {
    console.error("Error in /api/mealplan:", error.response?.data || error.message);

    if (error.response?.status === 400) {
      return res.status(400).json({ 
        error: 'No meal plan found. Please adjust your filters or excluded ingredients.',
      });
    }

    res.status(500).json({ 
      error: 'Error fetching meal plan',
      details: error.response?.data || error.message,
    });
  }
};