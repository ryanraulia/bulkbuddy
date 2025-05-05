const axios = require('axios');

// Existing searchFood handler
exports.searchFood = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ error: 'Search query is required' });

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
      ).catch(() => null)
    );

    const detailedResults = await Promise.allSettled(detailedRequests);

    const simplifiedResults = detailedResults
      .map(result => {
        if (result.status !== 'fulfilled' || !result.value?.data) return null;

        const data = result.value.data;
        const nutrients = data.nutrition?.nutrients || [];

        const nutrientMap = nutrients.reduce((acc, n) => {
          const key = n.name.toLowerCase().replace(/\s+/g, '');
          acc[key] = n.amount;
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
      .filter(Boolean);

    res.json(simplifiedResults);
  } catch (error) {
    console.error("Error in /api/food:", error.response?.data || error.message);
    res.status(500).json({
      error: 'Error fetching food data',
      details: error.response?.data || error.message
    });
  }
};

// ✅ NEW: Lightweight food suggestions for input autocomplete
exports.getSuggestions = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ error: 'Query is required' });

    const response = await axios.get(
      'https://api.spoonacular.com/food/ingredients/autocomplete',
      {
        params: {
          apiKey: process.env.SPOONACULAR_API_KEY,
          query: q,
          number: 8
        }
      }
    );

    const suggestions = response.data.map(item => ({
      id: item.id,
      name: item.name
    }));

    res.json(suggestions);
  } catch (error) {
    console.error("Error in /api/food/suggestions:", error.response?.data || error.message);
    res.status(500).json({
      error: 'Error fetching suggestions',
      details: error.response?.data || error.message
    });
  }
};
