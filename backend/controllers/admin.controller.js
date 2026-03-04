// ============================================
//  ADMIN CONTROLLER
//  Endpoint khusus administrator
//  Mengelola semua toko, user, dan statistik
// ============================================

const { supabaseAdmin } = require('../config/supabase')
const { success, error } = require('../utils/response')
const { ROLES, BUCKET_NAME } = require('../utils/constants')

// ══════════════════════════════════════════
//  STATISTIK
// ══════════════════════════════════════════

// ──────────────────────────────────────────
//  GET /api/admin/stats
//  Ambil statistik dashboard admin
// ──────────────────────────────────────────
const getStats = async (_req, res) => {
  try {
    const [usersResult, shopsResult, productsResult] = await Promise.all([
      supabaseAdmin.from('profiles').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('shops').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('products').select('id', { count: 'exact', head: true }),
    ])

    return success(res, {
      totalUsers: usersResult.count || 0,
      totalShops: shopsResult.count || 0,
      totalProducts: productsResult.count || 0,
    })
  } catch (err) {
    console.error('Get stats error:', err.message)
    return error(res, 'Gagal mengambil statistik.', 500)
  }
}

// ══════════════════════════════════════════
//  KELOLA TOKO
// ══════════════════════════════════════════

// ──────────────────────────────────────────
//  GET /api/admin/shops
//  Ambil semua toko (dengan info owner)
// ──────────────────────────────────────────
const getAllShops = async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query

    let query = supabaseAdmin
      .from('shops')
      .select('*, profiles!owner_id(id, full_name, role)', { count: 'exact' })

    if (search) {
      query = query.ilike('name', `%${search}%`)
    }

    query = query.order('created_at', { ascending: false })

    const offset = (Number(page) - 1) * Number(limit)
    query = query.range(offset, offset + Number(limit) - 1)

    const { data, error: queryError, count } = await query

    if (queryError) {
      return error(res, 'Gagal mengambil data toko.', 500)
    }

    return success(res, {
      shops: data,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: count,
        totalPages: Math.ceil(count / Number(limit)),
      },
    })
  } catch (err) {
    console.error('Admin get all shops error:', err.message)
    return error(res, 'Gagal mengambil data toko.', 500)
  }
}

// ──────────────────────────────────────────
//  GET /api/admin/shops/:id
//  Ambil detail satu toko (admin)
// ──────────────────────────────────────────
const getShopDetail = async (req, res) => {
  try {
    const { id } = req.params

    const { data: shop, error: shopError } = await supabaseAdmin
      .from('shops')
      .select('*, profiles!owner_id(id, full_name, role), products(*)')
      .eq('id', id)
      .single()

    if (shopError || !shop) {
      return error(res, 'Toko tidak ditemukan.', 404)
    }

    return success(res, shop)
  } catch (err) {
    console.error('Admin get shop detail error:', err.message)
    return error(res, 'Gagal mengambil detail toko.', 500)
  }
}

// ──────────────────────────────────────────
//  DELETE /api/admin/shops/:id
//  Hapus toko yang melanggar aturan
//  Juga menghapus: produk, gambar, & reset role owner
// ──────────────────────────────────────────
const deleteShop = async (req, res) => {
  try {
    const { id } = req.params

    // Ambil toko beserta produknya
    const { data: shop, error: shopError } = await supabaseAdmin
      .from('shops')
      .select('*, products(id, image_url)')
      .eq('id', id)
      .single()

    if (shopError || !shop) {
      return error(res, 'Toko tidak ditemukan.', 404)
    }

    // 1. Hapus semua gambar produk dari Storage
    if (shop.products?.length > 0) {
      const imagePaths = shop.products
        .filter((p) => p.image_url)
        .map((p) => p.image_url.split(`/${BUCKET_NAME}/`)[1])
        .filter(Boolean)

      if (imagePaths.length > 0) {
        await supabaseAdmin.storage.from(BUCKET_NAME).remove(imagePaths)
      }

      // 2. Hapus semua produk dari database
      await supabaseAdmin
        .from('products')
        .delete()
        .eq('shop_id', id)
    }

    // 3. Hapus gambar toko dari Storage
    if (shop.image_url) {
      const shopImagePath = shop.image_url.split(`/${BUCKET_NAME}/`)[1]
      if (shopImagePath) {
        await supabaseAdmin.storage.from(BUCKET_NAME).remove([shopImagePath])
      }
    }

    // 4. Hapus toko dari database
    const { error: deleteError } = await supabaseAdmin
      .from('shops')
      .delete()
      .eq('id', id)

    if (deleteError) {
      return error(res, 'Gagal menghapus toko.', 500)
    }

    // 5. Reset role owner kembali ke user
    if (shop.owner_id) {
      await supabaseAdmin
        .from('profiles')
        .update({ role: ROLES.USER, updated_at: new Date().toISOString() })
        .eq('id', shop.owner_id)
    }

    return success(res, null, 'Toko beserta semua produknya berhasil dihapus.')
  } catch (err) {
    console.error('Admin delete shop error:', err.message)
    return error(res, 'Gagal menghapus toko.', 500)
  }
}

// ══════════════════════════════════════════
//  KELOLA USER
// ══════════════════════════════════════════

// ──────────────────────────────────────────
//  GET /api/admin/users
//  Ambil semua user dengan filter role
// ──────────────────────────────────────────
const getAllUsers = async (req, res) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query

    let query = supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact' })

    if (role) {
      query = query.eq('role', role)
    }

    if (search) {
      query = query.ilike('full_name', `%${search}%`)
    }

    query = query.order('created_at', { ascending: false })

    const offset = (Number(page) - 1) * Number(limit)
    query = query.range(offset, offset + Number(limit) - 1)

    const { data, error: queryError, count } = await query

    if (queryError) {
      return error(res, 'Gagal mengambil data user.', 500)
    }

    return success(res, {
      users: data,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: count,
        totalPages: Math.ceil(count / Number(limit)),
      },
    })
  } catch (err) {
    console.error('Admin get all users error:', err.message)
    return error(res, 'Gagal mengambil data user.', 500)
  }
}

// ──────────────────────────────────────────
//  PUT /api/admin/users/:id/role
//  Update role user (user/owner/admin)
// ──────────────────────────────────────────
const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params
    const { role } = req.body

    const validRoles = [ROLES.USER, ROLES.OWNER, ROLES.ADMIN]
    if (!validRoles.includes(role)) {
      return error(res, `Role tidak valid. Gunakan: ${validRoles.join(', ')}`, 400)
    }

    const { data, error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ role, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      return error(res, 'Gagal mengupdate role user.', 500)
    }

    return success(res, data, `Role user berhasil diubah menjadi "${role}".`)
  } catch (err) {
    console.error('Admin update user role error:', err.message)
    return error(res, 'Gagal mengupdate role user.', 500)
  }
}

module.exports = {
  getStats,
  getAllShops,
  getShopDetail,
  deleteShop,
  getAllUsers,
  updateUserRole,
}
