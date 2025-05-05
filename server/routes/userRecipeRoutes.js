const express = require('express');
const router = express.Router();
const { recipeUpload } = require('../middleware/uploads');
const { 
  submitRecipe, 
  getUserRecipes, 
  getUserRecipeById, 
  deleteUserRecipe, 
  getAllRecipes
} = require('../controllers/userRecipeController');
const { requireAuth } = require('../middleware/authMiddleware');

// POST: Submit new user recipe
router.post('/submit', requireAuth, recipeUpload.single('image'), submitRecipe);

// GET: Get all recipes submitted by logged-in user
router.get('/user-specific', requireAuth, getUserRecipes);

// GET: Get all recipes (admin/public view)
router.get('/all', getAllRecipes);

// GET: Get one user recipe by ID
router.get('/view/:id', getUserRecipeById);

// DELETE: Delete a recipe (must own it)
router.delete('/delete/:id', requireAuth, deleteUserRecipe);
router.get('/:id', getUserRecipeById);

module.exports = router;
