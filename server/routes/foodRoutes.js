// filepath: c:\Users\Ryan\Desktop\bulkbuddy\server\routes\foodRoutes.js

const express = require('express');
const router = express.Router();
const { searchFood, getSuggestions } = require('../controllers/foodController'); // Corrected path

router.get('/', searchFood);
router.get('/suggestions', getSuggestions); // /api/food/suggestions?q=ban

module.exports = router;