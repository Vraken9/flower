// ============================================
//  KONSTANTA APLIKASI
// ============================================

/** Role yang tersedia di sistem */
const ROLES = {
  USER: 'user',     // Pembeli
  OWNER: 'owner',   // Pemilik toko
  ADMIN: 'admin',   // Administrator
}

/** Nama bucket di Supabase Storage */
const BUCKET_NAME = 'flower-images'

/** Kategori produk default */
const CATEGORIES = [
  'Bunga Segar',
  'Bunga Artificial',
  'Bouquet',
  'Tanaman Hias',
  'Aksesoris',
  'Lainnya',
]

module.exports = { ROLES, BUCKET_NAME, CATEGORIES }
