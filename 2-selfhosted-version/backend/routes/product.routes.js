// ============================================
//  PRODUCT ROUTES (PUBLIC)
//  GET /api/products             → Semua produk
//  GET /api/products/categories  → Kategori unik
//  GET /api/products/:id         → Detail produk
// ============================================

const router = require('express').Router()
const {
  getAllProducts,
  getCategories,
  getProductById,
} = require('../controllers/product.controller')

// ⚠️ /categories HARUS di atas /:id agar tidak tertangkap sebagai id
router.get('/categories', getCategories)
router.get('/', getAllProducts)
router.get('/:id', getProductById)

module.exports = router
