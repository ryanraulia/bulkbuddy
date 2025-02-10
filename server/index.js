// server/index.js
const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Load credentials from .env
const EDAMAM_APP_ID = process.env.EDAMAM_APP_ID;
const EDAMAM_APP_KEY = process.env.EDAMAM_APP_KEY;

// (Optional) Log credentials for debugging – remove these logs in production!
console.log("EDAMAM_APP_ID:", EDAMAM_APP_ID);
console.log("EDAMAM_APP_KEY:", EDAMAM_APP_KEY);

/**
 * GET /api/mealplan?targetCalories=2000
 *
 * This endpoint accepts a targetCalories query parameter,
 * builds a meal plan specification, and then makes a POST request
 * to the new Edamam Meal Planner API.
 */
app.get('/api/mealplan', async (req, res) => {
  try {
    const { targetCalories } = req.query;
    if (!targetCalories) {
      return res.status(400).json({ error: 'targetCalories parameter is required' });
    }
    const tc = parseInt(targetCalories, 10);

    // Updated endpoint: include both app_id and app_key as query parameters.
    const edamamUrl = `https://api.edamam.com/api/meal-planner/v1/${EDAMAM_APP_ID}/select?app_id=${EDAMAM_APP_ID}&app_key=${EDAMAM_APP_KEY}`;

    /* 
      Revised Request Body:
      - We include a top-level "accept" field (using a default health filter as in the docs).
      - The overall "fit" is relaxed slightly (allowing a 100 kcal margin).
      - Section constraints are defined in proportion to the target calories.
    */
    const requestBody = {
      size: 1, // one-day meal plan
      plan: {
        accept: {
          // Including a default health filter; adjust or remove as needed.
          all: [
            {
              health: ["SOY_FREE", "FISH_FREE", "MEDITERRANEAN"]
            }
          ]
        },
        fit: {
          ENERC_KCAL: {
            // Allow a margin so that section splits have some flexibility.
            min: tc - 100,
            max: tc
          },
          "SUGAR.added": {
            max: 20
          }
        },
        sections: {
          "Breakfast": {
            accept: {
              all: [
                { meal: ["breakfast"] }
              ]
            },
            fit: {
              ENERC_KCAL: {
                min: Math.floor(tc * 0.25),
                max: Math.floor(tc * 0.35)
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
                min: Math.floor(tc * 0.30),
                max: Math.floor(tc * 0.40)
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
                min: Math.floor(tc * 0.30),
                max: Math.floor(tc * 0.40)
              }
            }
          }
        }
      }
    };

    // Log the URL and request body for debugging.
    console.log("Calling Edamam API with URL:", edamamUrl);
    console.log("Request body:", JSON.stringify(requestBody, null, 2));

    // Make the POST request to Edamam with the required header for active user tracking.
    const response = await axios.post(edamamUrl, requestBody, {
      headers: {
        "Content-Type": "application/json",
        "Edamam-Account-User": "testuser" // Use a valid user ID in production.
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching meal plan:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Error fetching meal plan',
      details: error.response?.data
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
