// ============================================
//  SHOP ROUTES (PUBLIC)
//  GET /api/shops      → Semua toko
//  GET /api/shops/:id  → Detail toko + produknya
// ============================================

const router = require('express').Router()
const {
  getAllShops,
  getShopById,
} = require('../controllers/shop.controller')

router.get('/', getAllShops)
router.get('/:id', getShopById)

module.exports = router
