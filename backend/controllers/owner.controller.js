// ============================================
//  OWNER CONTROLLER
//  Endpoint khusus pemilik toko
//  Mengelola toko & produk milik sendiri
// ============================================

const path = require('path')
const { supabaseAdmin } = require('../config/supabase')
const { success, error } = require('../utils/response')
const { ROLES, BUCKET_NAME } = require('../utils/constants')

// ══════════════════════════════════════════
//  TOKO (SHOP)
// ══════════════════════════════════════════

// ──────────────────────────────────────────
//  POST /api/owner/shop
//  Buat toko baru (user biasa → jadi owner)
// ──────────────────────────────────────────
const createShop = async (req, res) => {
  try {
    const { name, description, location } = req.body

    if (!name || !description || !location) {
      return error(res, 'Nama, deskripsi, dan lokasi toko wajib diisi.', 400)
    }

    // Cek apakah user sudah punya toko
    const { data: existingShop } = await supabaseAdmin
      .from('shops')
      .select('id')
      .eq('owner_id', req.user.id)
      .single()

    if (existingShop) {
      return error(res, 'Anda sudah memiliki toko. Satu akun hanya bisa memiliki satu toko.', 400)
    }

    // Buat toko baru
    const { data: shop, error: shopError } = await supabaseAdmin
      .from('shops')
      .insert({
        name,
        description,
        location,
        owner_id: req.user.id,
      })
      .select()
      .single()

    if (shopError) {
      return error(res, 'Gagal membuat toko.', 500)
    }

    // Update role user menjadi owner
    await supabaseAdmin
      .from('profiles')
      .update({ role: ROLES.OWNER, updated_at: new Date().toISOString() })
      .eq('id', req.user.id)

    return success(res, shop, 'Toko berhasil dibuat! Role Anda sekarang adalah owner.', 201)
  } catch (err) {
    console.error('Create shop error:', err.message)
    return error(res, 'Gagal membuat toko.', 500)
  }
}

// ──────────────────────────────────────────
//  GET /api/owner/shop
//  Ambil data toko milik owner
// ──────────────────────────────────────────
const getMyShop = async (req, res) => {
  try {
    const { data: shop, error: shopError } = await supabaseAdmin
      .from('shops')
      .select('*')
      .eq('owner_id', req.user.id)
      .single()

    if (shopError || !shop) {
      return error(res, 'Anda belum memiliki toko.', 404)
    }

    return success(res, shop)
  } catch (err) {
    console.error('Get my shop error:', err.message)
    return error(res, 'Gagal mengambil data toko.', 500)
  }
}

// ──────────────────────────────────────────
//  PUT /api/owner/shop
//  Update informasi toko milik owner
// ──────────────────────────────────────────
const updateMyShop = async (req, res) => {
  try {
    const { name, description, location } = req.body

    // Pastikan toko milik user ini
    const { data: shop } = await supabaseAdmin
      .from('shops')
      .select('id')
      .eq('owner_id', req.user.id)
      .single()

    if (!shop) {
      return error(res, 'Toko tidak ditemukan.', 404)
    }

    // Siapkan data yang akan diupdate
    const updateData = {}
    if (name) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (location) updateData.location = location

    const { data, error: updateError } = await supabaseAdmin
      .from('shops')
      .update(updateData)
      .eq('id', shop.id)
      .select()
      .single()

    if (updateError) {
      return error(res, 'Gagal mengupdate toko.', 500)
    }

    return success(res, data, 'Toko berhasil diupdate.')
  } catch (err) {
    console.error('Update my shop error:', err.message)
    return error(res, 'Gagal mengupdate toko.', 500)
  }
}

// ──────────────────────────────────────────
//  PUT /api/owner/shop/image
//  Upload atau ganti gambar toko
// ──────────────────────────────────────────
const updateShopImage = async (req, res) => {
  try {
    const file = req.file

    if (!file) {
      return error(res, 'File gambar tidak ditemukan.', 400)
    }

    // Ambil toko milik owner
    const { data: shop } = await supabaseAdmin
      .from('shops')
      .select('id, image_url')
      .eq('owner_id', req.user.id)
      .single()

    if (!shop) {
      return error(res, 'Toko tidak ditemukan.', 404)
    }

    // Hapus gambar lama dari storage (jika ada)
    if (shop.image_url) {
      const oldPath = shop.image_url.split(`/${BUCKET_NAME}/`)[1]
      if (oldPath) {
        await supabaseAdmin.storage.from(BUCKET_NAME).remove([oldPath])
      }
    }

    // Upload gambar baru
    const ext = path.extname(file.originalname)
    const fileName = `shops/${shop.id}-${Date.now()}${ext}`

    const { error: uploadError } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: true,
      })

    if (uploadError) {
      return error(res, 'Gagal mengupload gambar.', 500)
    }

    // Ambil public URL
    const { data: urlData } = supabaseAdmin.storage
      .from(BUCKET_NAME)
      .getPublicUrl(fileName)

    // Update URL di database
    await supabaseAdmin
      .from('shops')
      .update({ image_url: urlData.publicUrl })
      .eq('id', shop.id)

    return success(res, { image_url: urlData.publicUrl }, 'Gambar toko berhasil diupdate.')
  } catch (err) {
    console.error('Update shop image error:', err.message)
    return error(res, 'Gagal mengupload gambar toko.', 500)
  }
}

// ══════════════════════════════════════════
//  PRODUK (PRODUCTS)
// ══════════════════════════════════════════

/**
 * Helper: Ambil shop_id milik owner yang sedang login
 */
const _getOwnerShopId = async (userId) => {
  const { data: shop } = await supabaseAdmin
    .from('shops')
    .select('id')
    .eq('owner_id', userId)
    .single()

  return shop?.id || null
}

// ──────────────────────────────────────────
//  GET /api/owner/products
//  Ambil semua produk di toko owner
// ──────────────────────────────────────────
const getMyProducts = async (req, res) => {
  try {
    const shopId = await _getOwnerShopId(req.user.id)

    if (!shopId) {
      return error(res, 'Anda belum memiliki toko.', 404)
    }

    const { data: products, error: queryError } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('shop_id', shopId)
      .order('created_at', { ascending: false })

    if (queryError) {
      return error(res, 'Gagal mengambil data produk.', 500)
    }

    return success(res, products)
  } catch (err) {
    console.error('Get my products error:', err.message)
    return error(res, 'Gagal mengambil data produk.', 500)
  }
}

// ──────────────────────────────────────────
//  POST /api/owner/products
//  Tambah produk baru ke toko owner
// ──────────────────────────────────────────
const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, stock } = req.body

    if (!name || !price) {
      return error(res, 'Nama dan harga produk wajib diisi.', 400)
    }

    const shopId = await _getOwnerShopId(req.user.id)

    if (!shopId) {
      return error(res, 'Anda belum memiliki toko. Buat toko terlebih dahulu.', 404)
    }

    const { data: product, error: insertError } = await supabaseAdmin
      .from('products')
      .insert({
        shop_id: shopId,
        name,
        description: description || '',
        price: Number(price),
        category: category || 'Lainnya',
        stock: stock ? Number(stock) : 0,
      })
      .select()
      .single()

    if (insertError) {
      return error(res, 'Gagal menambah produk.', 500)
    }

    return success(res, product, 'Produk berhasil ditambahkan.', 201)
  } catch (err) {
    console.error('Create product error:', err.message)
    return error(res, 'Gagal menambah produk.', 500)
  }
}

// ──────────────────────────────────────────
//  PUT /api/owner/products/:id
//  Update produk milik owner
// ──────────────────────────────────────────
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params
    const { name, description, price, category, stock } = req.body

    const shopId = await _getOwnerShopId(req.user.id)
    if (!shopId) {
      return error(res, 'Anda belum memiliki toko.', 404)
    }

    // Pastikan produk ini milik toko owner
    const { data: existingProduct } = await supabaseAdmin
      .from('products')
      .select('id')
      .eq('id', id)
      .eq('shop_id', shopId)
      .single()

    if (!existingProduct) {
      return error(res, 'Produk tidak ditemukan di toko Anda.', 404)
    }

    // Siapkan data update
    const updateData = {}
    if (name) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (price !== undefined) updateData.price = Number(price)
    if (category) updateData.category = category
    if (stock !== undefined) updateData.stock = Number(stock)

    const { data, error: updateError } = await supabaseAdmin
      .from('products')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      return error(res, 'Gagal mengupdate produk.', 500)
    }

    return success(res, data, 'Produk berhasil diupdate.')
  } catch (err) {
    console.error('Update product error:', err.message)
    return error(res, 'Gagal mengupdate produk.', 500)
  }
}

// ──────────────────────────────────────────
//  PUT /api/owner/products/:id/image
//  Upload atau ganti gambar produk
// ──────────────────────────────────────────
const updateProductImage = async (req, res) => {
  try {
    const { id } = req.params
    const file = req.file

    if (!file) {
      return error(res, 'File gambar tidak ditemukan.', 400)
    }

    const shopId = await _getOwnerShopId(req.user.id)
    if (!shopId) {
      return error(res, 'Anda belum memiliki toko.', 404)
    }

    // Pastikan produk milik toko owner
    const { data: product } = await supabaseAdmin
      .from('products')
      .select('id, image_url')
      .eq('id', id)
      .eq('shop_id', shopId)
      .single()

    if (!product) {
      return error(res, 'Produk tidak ditemukan di toko Anda.', 404)
    }

    // Hapus gambar lama
    if (product.image_url) {
      const oldPath = product.image_url.split(`/${BUCKET_NAME}/`)[1]
      if (oldPath) {
        await supabaseAdmin.storage.from(BUCKET_NAME).remove([oldPath])
      }
    }

    // Upload gambar baru
    const ext = path.extname(file.originalname)
    const fileName = `products/${id}-${Date.now()}${ext}`

    const { error: uploadError } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: true,
      })

    if (uploadError) {
      return error(res, 'Gagal mengupload gambar.', 500)
    }

    // Ambil public URL & update database
    const { data: urlData } = supabaseAdmin.storage
      .from(BUCKET_NAME)
      .getPublicUrl(fileName)

    await supabaseAdmin
      .from('products')
      .update({ image_url: urlData.publicUrl })
      .eq('id', id)

    return success(res, { image_url: urlData.publicUrl }, 'Gambar produk berhasil diupdate.')
  } catch (err) {
    console.error('Update product image error:', err.message)
    return error(res, 'Gagal mengupload gambar produk.', 500)
  }
}

// ──────────────────────────────────────────
//  DELETE /api/owner/products/:id
//  Hapus produk milik owner
// ──────────────────────────────────────────
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params

    const shopId = await _getOwnerShopId(req.user.id)
    if (!shopId) {
      return error(res, 'Anda belum memiliki toko.', 404)
    }

    // Pastikan produk milik toko owner
    const { data: product } = await supabaseAdmin
      .from('products')
      .select('id, image_url')
      .eq('id', id)
      .eq('shop_id', shopId)
      .single()

    if (!product) {
      return error(res, 'Produk tidak ditemukan di toko Anda.', 404)
    }

    // Hapus gambar dari storage
    if (product.image_url) {
      const imagePath = product.image_url.split(`/${BUCKET_NAME}/`)[1]
      if (imagePath) {
        await supabaseAdmin.storage.from(BUCKET_NAME).remove([imagePath])
      }
    }

    // Hapus produk dari database
    const { error: deleteError } = await supabaseAdmin
      .from('products')
      .delete()
      .eq('id', id)

    if (deleteError) {
      return error(res, 'Gagal menghapus produk.', 500)
    }

    return success(res, null, 'Produk berhasil dihapus.')
  } catch (err) {
    console.error('Delete product error:', err.message)
    return error(res, 'Gagal menghapus produk.', 500)
  }
}

module.exports = {
  // Toko
  createShop,
  getMyShop,
  updateMyShop,
  updateShopImage,
  // Produk
  getMyProducts,
  createProduct,
  updateProduct,
  updateProductImage,
  deleteProduct,
}
