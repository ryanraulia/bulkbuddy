// server/controllers/adminRecipeController.js
const db = require('../config/database');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/auth');


exports.getPendingRecipes = async (req, res) => {
  try {
    const [recipes] = await db.promise().query(
      `SELECT id, title, image, calories, protein, fat, carbs, ingredients, created_at 
       FROM recipes 
       WHERE status = 'pending' 
         AND source = 'user'`
    );

    const serverUrl = process.env.SERVER_URL || 'http://localhost:5000';

    const formatted = recipes.map(recipe => {
      // 1) Turn the ingredients string into an array
      const ingredientsArr = recipe.ingredients.split('\n');

      // 2) Build a fully-qualified URL for the image
      let imageUrl = null;
      if (recipe.image) {
        try {
          // If recipe.image is already absolute (http:// or https://), this will succeed
          new URL(recipe.image);
          imageUrl = recipe.image;
        } catch {
          // Otherwise, resolve it relative to serverUrl
          imageUrl = new URL(recipe.image, serverUrl).href;
        }
      }

      return {
        ...recipe,
        image: imageUrl,
        ingredients: ingredientsArr
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
    // Get recipe details first
    const [recipes] = await db.promise().query(
      "SELECT image FROM recipes WHERE id = ?",
      [req.params.id]
    );

    if (recipes.length === 0) {
      return res.status(404).json({ error: "Recipe not found" });
    }

    const recipe = recipes[0];
    
    // Delete from database
    const [result] = await db.promise().query(
      "DELETE FROM recipes WHERE id = ?",
      [req.params.id]
    );

    // Delete associated image file
    if (recipe.image) {
      const filename = path.basename(recipe.image);
      const imagePath = path.join(__dirname, '../uploads/recipes', filename);
      fs.unlink(imagePath, (err) => {
        if (err) console.error("Error deleting image:", err);
        else console.log("Deleted image:", filename);
      });
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
    
    // Verify admin role
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: "Admin privileges required" });
    }

    // Get full recipe details including source
    const [recipes] = await db.promise().query(
      "SELECT id, image, source FROM recipes WHERE id = ?",
      [req.params.id]
    );

    if (recipes.length === 0) return res.status(404).json({ error: "Recipe not found" });
    
    const recipe = recipes[0];
    
    // Prevent deletion of Spoonacular recipes - even for admins
    if (recipe.source !== 'user') {
      return res.status(403).json({ 
        error: "Cannot delete Spoonacular recipes",
        message: "Only user-submitted recipes can be deleted"
      });
    }

    // Admin can delete any user-submitted recipe
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

// Reusable deletion logic
const deleteRecipeAndImage = async (recipe) => {
  await db.promise().query("DELETE FROM recipes WHERE id = ?", [recipe.id]);
  
  if (recipe.image) {
    const filename = path.basename(recipe.image);
    const imagePath = path.join(__dirname, '../uploads/recipes', filename);
    fs.unlink(imagePath, (err) => {
      if (err) console.error("Image delete error:", err);
      else console.log("Deleted image:", filename);
    });
  }
};
