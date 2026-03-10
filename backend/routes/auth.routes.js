// ============================================
//  AUTH ROUTES
//  POST /api/auth/register  → Daftar user baru
//  POST /api/auth/login     → Login
//  POST /api/auth/logout    → Logout (invalidasi token)
//  GET  /api/auth/profile   → Profil user (auth)
//  PUT  /api/auth/profile   → Update profil (auth)
// ============================================

const router = require('express').Router()
const authenticate = require('../middlewares/auth.middleware')
const { validate } = require('../middlewares/validate.middleware')
const {
  registerSchema,
  loginSchema,
  updateProfileSchema,
} = require('../utils/schemas')
const {
  register,
  login,
  logout,
  getProfile,
  updateProfile,
} = require('../controllers/auth.controller')

// Public routes (dengan validasi Zod)
router.post('/register', validate(registerSchema), register)
router.post('/login', validate(loginSchema), login)

// Protected routes (perlu login)
router.post('/logout', authenticate, logout)
router.get('/profile', authenticate, getProfile)
router.put('/profile', authenticate, validate(updateProfileSchema), updateProfile)

module.exports = router
