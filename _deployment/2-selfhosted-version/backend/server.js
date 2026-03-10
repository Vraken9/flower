// ============================================
//  🌸 FLOWER MARKETPLACE API
//  Entry point untuk backend server
// ============================================

require('dotenv').config()
const express = require('express')
const cors = require('cors')
const morgan = require('morgan')

const routes = require('./routes')
const errorHandler = require('./middlewares/error.middleware')

const app = express()
const PORT = process.env.PORT || 5000

// ============ GLOBAL MIDDLEWARES ============
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(morgan('dev'))

// ============ ROOT ENDPOINT ============
app.get('/', (_req, res) => {
  res.json({
    message: '🌸 Flower Marketplace API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth       → Register, Login, Profile',
      products: '/api/products   → Lihat produk (public)',
      shops: '/api/shops      → Lihat toko (public)',      favorites: '/api/favorites  → Kelola favorit (auth)',      owner: '/api/owner      → Kelola toko & produk (owner)',
      admin: '/api/admin      → Kelola semua (admin)',
    },
  })
})

// ============ API ROUTES ============
app.use('/api', routes)

// ============ 404 HANDLER ============
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} tidak ditemukan.`,
  })
})

// ============ GLOBAL ERROR HANDLER ============
app.use(errorHandler)

// ============ START SERVER ============
app.listen(PORT, () => {
  console.log(`🌸 Flower Marketplace API berjalan di http://localhost:${PORT}`)
  console.log(`📂 Environment: ${process.env.NODE_ENV || 'development'}`)
})
