// ============================================
//  OWNER ROUTES
//  Semua endpoint memerlukan autentikasi.
//  createShop bisa diakses user biasa (akan jadi owner).
//  Sisanya memerlukan role owner/admin.
//
//  POST /api/owner/shop               → Buat toko
//  GET  /api/owner/shop               → Lihat toko sendiri
//  PUT  /api/owner/shop               → Update toko
//  PUT  /api/owner/shop/image         → Upload gambar toko
//  GET  /api/owner/products           → Semua produk di toko
//  POST /api/owner/products           → Tambah produk
//  PUT  /api/owner/products/:id       → Update produk
//  PUT  /api/owner/products/:id/image → Upload gambar produk
//  DELETE /api/owner/products/:id     → Hapus produk
// ============================================

const router = require('express').Router()
const authenticate = require('../middlewares/auth.middleware')
const authorize = require('../middlewares/role.middleware')
const upload = require('../middlewares/upload.middleware')
const { validate } = require('../middlewares/validate.middleware')
const { ROLES } = require('../utils/constants')
const {
  createShopSchema,
  updateShopSchema,
  createProductSchemaWithPreprocess,
  updateProductSchemaWithPreprocess,
} = require('../utils/schemas')
const {
  createShop,
  getMyShop,
  updateMyShop,
  updateShopImage,
  getMyProducts,
  createProduct,
  updateProduct,
  updateProductImage,
  deleteProduct,
} = require('../controllers/owner.controller')

// ── Toko ──
// Buat toko: user biasa bisa akses (akan menjadi owner setelah buat toko)
router.post('/shop', authenticate, validate(createShopSchema), createShop)

// Kelola toko: hanya owner & admin
router.get('/shop', authenticate, authorize(ROLES.OWNER, ROLES.ADMIN), getMyShop)
router.put('/shop', authenticate, authorize(ROLES.OWNER, ROLES.ADMIN), validate(updateShopSchema), updateMyShop)
router.put(
  '/shop/image',
  authenticate,
  authorize(ROLES.OWNER, ROLES.ADMIN),
  upload.single('image'),
  updateShopImage
)

// ── Produk ──
// Semua operasi produk: hanya owner & admin
router.get('/products', authenticate, authorize(ROLES.OWNER, ROLES.ADMIN), getMyProducts)
router.post('/products', authenticate, authorize(ROLES.OWNER, ROLES.ADMIN), validate(createProductSchemaWithPreprocess), createProduct)
router.put('/products/:id', authenticate, authorize(ROLES.OWNER, ROLES.ADMIN), validate(updateProductSchemaWithPreprocess), updateProduct)
router.put(
  '/products/:id/image',
  authenticate,
  authorize(ROLES.OWNER, ROLES.ADMIN),
  upload.single('image'),
  updateProductImage
)
router.delete('/products/:id', authenticate, authorize(ROLES.OWNER, ROLES.ADMIN), deleteProduct)

module.exports = router
