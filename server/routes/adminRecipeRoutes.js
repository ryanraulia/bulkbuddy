// server/routes/adminRecipeRoutes.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminRecipeController');
const { requireAuth, requireAdmin } = require('../middleware/authMiddleware');

// Pending recipe approvals
router.get('/pending', requireAuth, requireAdmin, adminController.getPendingRecipes);

// Approve recipe
router.put('/approve/:id', requireAuth, requireAdmin, adminController.approveRecipe);

// Reject recipe (with image cleanup)
router.delete('/reject/:id', requireAuth, requireAdmin, adminController.rejectRecipe);

// Admin force-delete any user recipe
router.delete('/recipes/:id', requireAuth, requireAdmin, adminController.deleteRecipe);

module.exports = router;