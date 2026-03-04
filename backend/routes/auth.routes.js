// ============================================
//  AUTH ROUTES
//  POST /api/auth/register  → Daftar user baru
//  POST /api/auth/login     → Login
//  GET  /api/auth/profile   → Profil user (auth)
//  PUT  /api/auth/profile   → Update profil (auth)
// ============================================

const router = require('express').Router()
const authenticate = require('../middlewares/auth.middleware')
const {
  register,
  login,
  getProfile,
  updateProfile,
} = require('../controllers/auth.controller')

// Public routes
router.post('/register', register)
router.post('/login', login)

// Protected routes (perlu login)
router.get('/profile', authenticate, getProfile)
router.put('/profile', authenticate, updateProfile)

module.exports = router
