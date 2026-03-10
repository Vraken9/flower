// ============================================
//  FAVORITES ROUTES
//  Routes for managing user favorites
// ============================================

const express = require('express');
const router = express.Router();
const favoritesController = require('../controllers/favorites.controller');
const authenticate = require('../middlewares/auth.middleware');

// All favorites routes require authentication
router.use(authenticate);

// GET /api/favorites - Get user's favorites
router.get('/', favoritesController.getFavorites);

// POST /api/favorites - Add product to favorites
router.post('/', favoritesController.addFavorite);

// POST /api/favorites/toggle - Toggle favorite status
router.post('/toggle', favoritesController.toggleFavorite);

// GET /api/favorites/check/:product_id - Check if product is favorited
router.get('/check/:product_id', favoritesController.checkFavorite);

// DELETE /api/favorites/:product_id - Remove from favorites
router.delete('/:product_id', favoritesController.removeFavorite);

module.exports = router;