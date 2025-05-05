// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/authMiddleware');
const { profileUpload } = require('../middleware/uploads');  // <— pull in your multer config
const {
  signup,
  login,
  logout,
  getMe,
  updateProfile
} = require('../controllers/authController');

// public routes
router.post('/signup', signup);
router.post('/login', login);

// protected user routes
router.get('/me', requireAuth, getMe);

// here we add profileUpload.single('profile_picture'):
router.put(
  '/profile/update',
  requireAuth,
  profileUpload.single('profile_picture'),
  updateProfile
);

router.post('/logout', requireAuth, logout);

module.exports = router;
