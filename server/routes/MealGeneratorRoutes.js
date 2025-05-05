// filepath: c:\Users\Ryan\Desktop\bulkbuddy\server\routes\mealPlanRoutes.js

const express = require('express');
const router = express.Router();
const { generateMealPlan } = require('../controllers/MealGeneratorController');

router.get('/', generateMealPlan);

module.exports = router;