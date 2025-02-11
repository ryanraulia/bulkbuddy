// server/index.js
const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const EDAMAM_APP_ID = process.env.EDAMAM_APP_ID;
const EDAMAM_APP_KEY = process.env.EDAMAM_APP_KEY;

console.log("EDAMAM_APP_ID:", EDAMAM_APP_ID);
console.log("EDAMAM_APP_KEY:", EDAMAM_APP_KEY);

app.get('/api/mealplan', async (req, res) => {
  try {
    const { targetCalories } = req.query;
    if (!targetCalories) {
      return res.status(400).json({ error: 'targetCalories parameter is required' });
    }
    const tc = parseInt(targetCalories, 10);

    // For testing, split calories roughly among the three meals.
    // (These are looser constraints than before.)
    const breakfastMin = Math.round(tc * 0.25 * 0.8);
    const breakfastMax = Math.round(tc * 0.25 * 1.2);
    const lunchMin = Math.round(tc * 0.35 * 0.8);
    const lunchMax = Math.round(tc * 0.35 * 1.2);
    const dinnerMin = Math.round(tc * 0.40 * 0.8);
    const dinnerMax = Math.round(tc * 0.40 * 1.2);

    const edamamUrl = `https://api.edamam.com/api/meal-planner/v1/${EDAMAM_APP_ID}/select?app_id=${EDAMAM_APP_ID}&app_key=${EDAMAM_APP_KEY}`;

    // A simplified request body without dish filters or an overall "fit"
    const requestBody = {
      size: 1, // one-day meal plan
      plan: {
        sections: {
          "Breakfast": {
            accept: {
              all: [
                { meal: ["breakfast"] }
              ]
            },
            fit: {
              ENERC_KCAL: {
                min: breakfastMin,
                max: breakfastMax
              }
            }
          },
          "Lunch": {
            accept: {
              all: [
                { meal: ["lunch/dinner"] }
              ]
            },
            fit: {
              ENERC_KCAL: {
                min: lunchMin,
                max: lunchMax
              }
            }
          },
          "Dinner": {
            accept: {
              all: [
                { meal: ["lunch/dinner"] }
              ]
            },
            fit: {
              ENERC_KCAL: {
                min: dinnerMin,
                max: dinnerMax
              }
            }
          }
        }
      }
    };

    console.log("Requesting Edamam API at:", edamamUrl);
    console.log("Request Body:", JSON.stringify(requestBody, null, 2));

    const response = await axios.post(edamamUrl, requestBody, {
      headers: {
        "Content-Type": "application/json",
        "Edamam-Account-User": "testuser" // Ensure this is valid per Edamam's requirements.
      }
    });

    // Log the entire response for debugging.
    console.log("Edamam response:", response.data);
    res.json(response.data);
  } catch (error) {
    console.error("Error in /api/mealplan:", error.response?.data || error.message);
    res.status(500).json({
      error: 'Error fetching meal plan',
      details: error.response?.data || error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
