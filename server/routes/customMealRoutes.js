const express = require('express');
const router = express.Router();
const {
  addToMealPlan,
  getMealPlans,
  getMealPlanNutrition,
  deleteMealPlan
} = require('../controllers/customMealController');
const { requireAuth } = require('../middleware/authMiddleware');

router.post('/', requireAuth, addToMealPlan);
router.get('/', requireAuth, getMealPlans);
router.get('/nutrition', requireAuth, getMealPlanNutrition);
router.delete('/:id', requireAuth, deleteMealPlan);

module.exports = router;