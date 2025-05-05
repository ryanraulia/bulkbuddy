const express = require('express');
const router = express.Router();
const { 
  searchRecipes, 
  getRandomRecipes,
  getUserRecipes,
  getRecipeById
} = require('../controllers/recipeController');
const userRecipeController = require('../controllers/userRecipeController');


// Collection routes
router.get('/search', searchRecipes);
router.get('/random', getRandomRecipes);
router.get('/user', getUserRecipes);

router.get('/user-recipe/:id', userRecipeController.getUserRecipeById);

// Single recipe route
router.get('/:id', getRecipeById);

module.exports = router;