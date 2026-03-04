// ============================================
//  SHOP CONTROLLER (PUBLIC)
//  Endpoint toko yang bisa diakses semua orang
// ============================================

const { supabaseAdmin } = require('../config/supabase')
const { success, error } = require('../utils/response')

// ──────────────────────────────────────────
//  GET /api/shops
//  Ambil semua toko dengan filter & pagination
// ──────────────────────────────────────────
const getAllShops = async (req, res) => {
  try {
    const { search, page = 1, limit = 12 } = req.query

    let query = supabaseAdmin
      .from('shops')
      .select('*', { count: 'exact' })

    // Pencarian berdasarkan nama toko
    if (search) {
      query = query.ilike('name', `%${search}%`)
    }

    query = query.order('created_at', { ascending: false })

    // Pagination
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
    console.error('Get all shops error:', err.message)
    return error(res, 'Gagal mengambil data toko.', 500)
  }
}

// ──────────────────────────────────────────
//  GET /api/shops/:id
//  Ambil detail toko beserta produk-produknya
// ──────────────────────────────────────────
const getShopById = async (req, res) => {
  try {
    const { id } = req.params

    // Ambil data toko
    const { data: shop, error: shopError } = await supabaseAdmin
      .from('shops')
      .select('*')
      .eq('id', id)
      .single()

    if (shopError || !shop) {
      return error(res, 'Toko tidak ditemukan.', 404)
    }

    // Ambil produk milik toko ini
    const { data: products } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('shop_id', id)
      .order('created_at', { ascending: false })

    return success(res, {
      ...shop,
      products: products || [],
    })
  } catch (err) {
    console.error('Get shop by id error:', err.message)
    return error(res, 'Gagal mengambil detail toko.', 500)
  }
}

module.exports = { getAllShops, getShopById }
