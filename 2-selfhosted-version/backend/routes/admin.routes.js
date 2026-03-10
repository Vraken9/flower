// ============================================
//  ADMIN ROUTES
//  Semua endpoint memerlukan role admin.
//
//  GET    /api/admin/stats          → Statistik dashboard
//  GET    /api/admin/shops          → Semua toko
//  GET    /api/admin/shops/:id      → Detail toko
//  DELETE /api/admin/shops/:id      → Hapus toko melanggar
//  GET    /api/admin/users          → Semua user
//  PUT    /api/admin/users/:id/role → Ubah role user
// ============================================

const router = require('express').Router()
const authenticate = require('../middlewares/auth.middleware')
const authorize = require('../middlewares/role.middleware')
const { ROLES } = require('../utils/constants')
const {
  getStats,
  getAllShops,
  getShopDetail,
  deleteShop,
  getAllUsers,
  updateUserRole,
} = require('../controllers/admin.controller')

// Semua route admin memerlukan auth + role admin
router.use(authenticate, authorize(ROLES.ADMIN))

router.get('/stats', getStats)
router.get('/shops', getAllShops)
router.get('/shops/:id', getShopDetail)
router.delete('/shops/:id', deleteShop)
router.get('/users', getAllUsers)
router.put('/users/:id/role', updateUserRole)

module.exports = router
