// ============================================
//  UPLOAD MIDDLEWARE
//  Konfigurasi Multer untuk upload file gambar
// ============================================

const multer = require('multer')

/** Format file yang diizinkan */
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

/** Ukuran maksimum file: 5MB */
const MAX_SIZE = 5 * 1024 * 1024

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_SIZE,
  },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_TYPES.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(
        new Error('Format file tidak didukung. Gunakan JPG, PNG, atau WebP.'),
        false
      )
    }
  },
})

module.exports = upload
