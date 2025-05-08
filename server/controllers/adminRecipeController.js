const db = require('../config/database');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/auth');

// Helper: delete recipe and associated image
const deleteRecipeAndImage = async (recipe) => {
  // Deletes cascade to nutrition & dietary_flags via foreign keys
  await db.promise().query("DELETE FROM recipes WHERE id = ?", [recipe.id]);
  if (recipe.image) {
    const filename = path.basename(recipe.image);
    const imagePath = path.join(__dirname, '../uploads/recipes', filename);
    fs.unlink(imagePath, err => err && console.error("Image delete error:", err));
  }
};

exports.getPendingRecipes = async (req, res) => {
  try {
    const [recipes] = await db.promise().query(
      `SELECT 
         r.id, 
         r.title, 
         r.image, 
         n.calories, 
         n.protein, 
         n.fat, 
         n.carbs, 
         r.ingredients, 
         r.created_at
       FROM recipes r
       LEFT JOIN nutrition n ON r.id = n.recipe_id
       WHERE r.status = 'pending'
         AND r.source = 'user'`
    );

    const serverUrl = process.env.SERVER_URL || 'http://localhost:5000';
    const formatted = recipes.map(recipe => {
      // Turn ingredients string into array
      const ingredientsArr = recipe.ingredients?.split('\n') || [];

      // Resolve image URL
      let imageUrl = null;
      if (recipe.image) {
        try {
          new URL(recipe.image);
          imageUrl = recipe.image;
        } catch {
          imageUrl = new URL(recipe.image, serverUrl).href;
        }
      }

      return {
        id: recipe.id,
        title: recipe.title,
        image: imageUrl,
        ingredients: ingredientsArr,
        nutrition: {
          calories: recipe.calories,
          protein: recipe.protein,
          fat: recipe.fat,
          carbs: recipe.carbs
        },
        created_at: recipe.created_at
      };
    });

    res.json(formatted);
  } catch (error) {
    console.error("Pending recipes error:", error);
    res.status(500).json({ error: 'Error fetching pending recipes' });
  }
};

exports.approveRecipe = async (req, res) => {
  try {
    const [result] = await db.promise().query(
      "UPDATE recipes SET status = 'approved' WHERE id = ?",
      [req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Recipe not found" });
    }
    res.json({ success: true });
  } catch (error) {
    console.error("Approve recipe error:", error);
    res.status(500).json({ error: 'Error approving recipe' });
  }
};

exports.rejectRecipe = async (req, res) => {
  try {
    const [recipes] = await db.promise().query(
      "SELECT image FROM recipes WHERE id = ?",
      [req.params.id]
    );
    if (recipes.length === 0) {
      return res.status(404).json({ error: "Recipe not found" });
    }
    const recipe = recipes[0];

    // Delete the recipe (cascades nutrition & flags)
    await db.promise().query(
      "DELETE FROM recipes WHERE id = ?",
      [req.params.id]
    );

    // Remove image file
    if (recipe.image) {
      const filename = path.basename(recipe.image);
      const imagePath = path.join(__dirname, '../uploads/recipes', filename);
      fs.unlink(imagePath, err => err && console.error("Error deleting image:", err));
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Reject recipe error:", error);
    res.status(500).json({ error: 'Error rejecting recipe' });
  }
};

exports.deleteRecipe = async (req, res) => {
  try {
    const token = req.cookies.jwt;
    if (!token) return res.status(401).json({ error: "Not authenticated" });

    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: "Admin privileges required" });
    }

    const [recipes] = await db.promise().query(
      "SELECT id, image, source FROM recipes WHERE id = ?",
      [req.params.id]
    );
    if (recipes.length === 0) {
      return res.status(404).json({ error: "Recipe not found" });
    }
    const recipe = recipes[0];

    if (recipe.source !== 'user') {
      return res.status(403).json({
        error: "Cannot delete Spoonacular recipes",
        message: "Only user-submitted recipes can be deleted"
      });
    }

    await deleteRecipeAndImage(recipe);
    res.json({
      success: true,
      message: `Admin successfully deleted recipe ${req.params.id}`
    });
  } catch (error) {
    console.error("Admin delete recipe error:", error);
    res.status(500).json({
      error: 'Error deleting recipe',
      details: error.message
    });
  }
};
