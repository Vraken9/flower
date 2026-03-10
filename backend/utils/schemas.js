// ============================================
//  ZOD SCHEMAS
//  Validasi input API dengan Zod
// ============================================

const { z } = require('zod')

// ══════════════════════════════════════════
//  AUTH SCHEMAS
// ══════════════════════════════════════════

/** Schema untuk registrasi user */
const registerSchema = z.object({
  email: z
    .string({ required_error: 'Email wajib diisi.' })
    .email('Format email tidak valid.'),
  password: z
    .string({ required_error: 'Password wajib diisi.' })
    .min(6, 'Password minimal 6 karakter.'),
  full_name: z
    .string({ required_error: 'Nama lengkap wajib diisi.' })
    .min(2, 'Nama minimal 2 karakter.')
    .max(100, 'Nama maksimal 100 karakter.'),
})

/** Schema untuk login user */
const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email wajib diisi.' })
    .email('Format email tidak valid.'),
  password: z
    .string({ required_error: 'Password wajib diisi.' })
    .min(1, 'Password wajib diisi.'),
})

/** Schema untuk update profil */
const updateProfileSchema = z.object({
  full_name: z
    .string()
    .min(2, 'Nama minimal 2 karakter.')
    .max(100, 'Nama maksimal 100 karakter.')
    .optional(),
  avatar_url: z
    .string()
    .url('Format URL avatar tidak valid.')
    .optional()
    .nullable(),
})

// ══════════════════════════════════════════
//  SHOP SCHEMAS
// ══════════════════════════════════════════

/** Schema untuk membuat toko */
const createShopSchema = z.object({
  name: z
    .string({ required_error: 'Nama toko wajib diisi.' })
    .min(3, 'Nama toko minimal 3 karakter.')
    .max(100, 'Nama toko maksimal 100 karakter.'),
  description: z
    .string({ required_error: 'Deskripsi toko wajib diisi.' })
    .min(10, 'Deskripsi minimal 10 karakter.')
    .max(1000, 'Deskripsi maksimal 1000 karakter.'),
  location: z
    .string({ required_error: 'Lokasi toko wajib diisi.' })
    .min(3, 'Lokasi minimal 3 karakter.')
    .max(200, 'Lokasi maksimal 200 karakter.'),
})

/** Schema untuk update toko */
const updateShopSchema = z.object({
  name: z
    .string()
    .min(3, 'Nama toko minimal 3 karakter.')
    .max(100, 'Nama toko maksimal 100 karakter.')
    .optional(),
  description: z
    .string()
    .min(10, 'Deskripsi minimal 10 karakter.')
    .max(1000, 'Deskripsi maksimal 1000 karakter.')
    .optional(),
  location: z
    .string()
    .min(3, 'Lokasi minimal 3 karakter.')
    .max(200, 'Lokasi maksimal 200 karakter.')
    .optional(),
})

// ══════════════════════════════════════════
//  PRODUCT SCHEMAS
// ══════════════════════════════════════════

/** Daftar kategori yang valid */
const VALID_CATEGORIES = [
  'Bunga Segar',
  'Bunga Artificial',
  'Bouquet',
  'Tanaman Hias',
  'Aksesoris',
  'Lainnya',
]

/** Schema untuk membuat produk */
const createProductSchema = z.object({
  name: z
    .string({ required_error: 'Nama produk wajib diisi.' })
    .min(3, 'Nama produk minimal 3 karakter.')
    .max(150, 'Nama produk maksimal 150 karakter.'),
  description: z
    .string()
    .max(2000, 'Deskripsi maksimal 2000 karakter.')
    .optional()
    .default(''),
  price: z
    .number({ required_error: 'Harga produk wajib diisi.' })
    .positive('Harga harus lebih dari 0.')
    .max(999999999, 'Harga terlalu besar.'),
  category: z
    .enum(VALID_CATEGORIES, {
      errorMap: () => ({ message: `Kategori harus salah satu dari: ${VALID_CATEGORIES.join(', ')}` }),
    })
    .optional()
    .default('Lainnya'),
  stock: z
    .number()
    .int('Stok harus berupa bilangan bulat.')
    .min(0, 'Stok tidak boleh negatif.')
    .optional()
    .default(0),
})

/** Schema untuk update produk */
const updateProductSchema = z.object({
  name: z
    .string()
    .min(3, 'Nama produk minimal 3 karakter.')
    .max(150, 'Nama produk maksimal 150 karakter.')
    .optional(),
  description: z
    .string()
    .max(2000, 'Deskripsi maksimal 2000 karakter.')
    .optional(),
  price: z
    .number()
    .positive('Harga harus lebih dari 0.')
    .max(999999999, 'Harga terlalu besar.')
    .optional(),
  category: z
    .enum(VALID_CATEGORIES, {
      errorMap: () => ({ message: `Kategori harus salah satu dari: ${VALID_CATEGORIES.join(', ')}` }),
    })
    .optional(),
  stock: z
    .number()
    .int('Stok harus berupa bilangan bulat.')
    .min(0, 'Stok tidak boleh negatif.')
    .optional(),
})

// ══════════════════════════════════════════
//  HELPER: Preprocess untuk konversi tipe
// ══════════════════════════════════════════

/**
 * Schema dengan preprocessing untuk request body
 * Mengkonversi string ke number jika diperlukan
 */
const createProductSchemaWithPreprocess = z.object({
  name: z
    .string({ required_error: 'Nama produk wajib diisi.' })
    .min(3, 'Nama produk minimal 3 karakter.')
    .max(150, 'Nama produk maksimal 150 karakter.'),
  description: z
    .string()
    .max(2000, 'Deskripsi maksimal 2000 karakter.')
    .optional()
    .default(''),
  price: z.preprocess(
    (val) => (typeof val === 'string' ? parseFloat(val) : val),
    z
      .number({ required_error: 'Harga produk wajib diisi.' })
      .positive('Harga harus lebih dari 0.')
      .max(999999999, 'Harga terlalu besar.')
  ),
  category: z
    .enum(VALID_CATEGORIES, {
      errorMap: () => ({ message: `Kategori harus salah satu dari: ${VALID_CATEGORIES.join(', ')}` }),
    })
    .optional()
    .default('Lainnya'),
  stock: z.preprocess(
    (val) => (typeof val === 'string' ? parseInt(val, 10) : val),
    z
      .number()
      .int('Stok harus berupa bilangan bulat.')
      .min(0, 'Stok tidak boleh negatif.')
      .optional()
      .default(0)
  ),
})

const updateProductSchemaWithPreprocess = z.object({
  name: z
    .string()
    .min(3, 'Nama produk minimal 3 karakter.')
    .max(150, 'Nama produk maksimal 150 karakter.')
    .optional(),
  description: z
    .string()
    .max(2000, 'Deskripsi maksimal 2000 karakter.')
    .optional(),
  price: z.preprocess(
    (val) => (val === undefined || val === '' ? undefined : typeof val === 'string' ? parseFloat(val) : val),
    z
      .number()
      .positive('Harga harus lebih dari 0.')
      .max(999999999, 'Harga terlalu besar.')
      .optional()
  ),
  category: z
    .enum(VALID_CATEGORIES, {
      errorMap: () => ({ message: `Kategori harus salah satu dari: ${VALID_CATEGORIES.join(', ')}` }),
    })
    .optional(),
  stock: z.preprocess(
    (val) => (val === undefined || val === '' ? undefined : typeof val === 'string' ? parseInt(val, 10) : val),
    z
      .number()
      .int('Stok harus berupa bilangan bulat.')
      .min(0, 'Stok tidak boleh negatif.')
      .optional()
  ),
})

module.exports = {
  // Auth
  registerSchema,
  loginSchema,
  updateProfileSchema,
  // Shop
  createShopSchema,
  updateShopSchema,
  // Product
  createProductSchema,
  updateProductSchema,
  createProductSchemaWithPreprocess,
  updateProductSchemaWithPreprocess,
  // Constants
  VALID_CATEGORIES,
}
