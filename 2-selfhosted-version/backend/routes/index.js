// ============================================
//  ROUTE AGGREGATOR
//  Menggabungkan semua route ke satu tempat
// ============================================

const router = require('express').Router()

router.use('/auth', require('./auth.routes'))
router.use('/products', require('./product.routes'))
router.use('/shops', require('./shop.routes'))
router.use('/favorites', require('./favorites.routes'))
router.use('/owner', require('./owner.routes'))
router.use('/admin', require('./admin.routes'))

module.exports = router
