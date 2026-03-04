// ============================================
//  PRODUCT CONTROLLER (PUBLIC)
//  Endpoint produk yang bisa diakses semua orang
// ============================================

const { supabaseAdmin } = require('../config/supabase')
const { success, error } = require('../utils/response')

// ──────────────────────────────────────────
//  GET /api/products
//  Ambil semua produk dengan filter & pagination
// ──────────────────────────────────────────
const getAllProducts = async (req, res) => {
  try {
    const {
      category,
      search,
      sort = 'newest',
      page = 1,
      limit = 12,
    } = req.query

    let query = supabaseAdmin
      .from('products')
      .select('*, shops(id, name, location)', { count: 'exact' })

    // Filter berdasarkan kategori
    if (category) {
      query = query.eq('category', category)
    }

    // Pencarian berdasarkan nama produk
    if (search) {
      query = query.ilike('name', `%${search}%`)
    }

    // Pengurutan
    switch (sort) {
      case 'price_asc':
        query = query.order('price', { ascending: true })
        break
      case 'price_desc':
        query = query.order('price', { ascending: false })
        break
      case 'name_asc':
        query = query.order('name', { ascending: true })
        break
      case 'oldest':
        query = query.order('created_at', { ascending: true })
        break
      default: // newest
        query = query.order('created_at', { ascending: false })
    }

    // Pagination
    const offset = (Number(page) - 1) * Number(limit)
    query = query.range(offset, offset + Number(limit) - 1)

    const { data, error: queryError, count } = await query

    if (queryError) {
      return error(res, 'Gagal mengambil data produk.', 500)
    }

    return success(res, {
      products: data,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: count,
        totalPages: Math.ceil(count / Number(limit)),
      },
    })
  } catch (err) {
    console.error('Get all products error:', err.message)
    return error(res, 'Gagal mengambil data produk.', 500)
  }
}

// ──────────────────────────────────────────
//  GET /api/products/categories
//  Ambil daftar kategori unik
// ──────────────────────────────────────────
const getCategories = async (_req, res) => {
  try {
    const { data, error: queryError } = await supabaseAdmin
      .from('products')
      .select('category')

    if (queryError) {
      return error(res, 'Gagal mengambil kategori.', 500)
    }

    // Ambil kategori unik dan hilangkan null
    const categories = [...new Set(data.map((d) => d.category).filter(Boolean))]

    return success(res, categories)
  } catch (err) {
    console.error('Get categories error:', err.message)
    return error(res, 'Gagal mengambil kategori.', 500)
  }
}

// ──────────────────────────────────────────
//  GET /api/products/:id
//  Ambil detail satu produk
// ──────────────────────────────────────────
const getProductById = async (req, res) => {
  try {
    const { id } = req.params

    const { data, error: queryError } = await supabaseAdmin
      .from('products')
      .select('*, shops(id, name, description, location, image_url)')
      .eq('id', id)
      .single()

    if (queryError || !data) {
      return error(res, 'Produk tidak ditemukan.', 404)
    }

    return success(res, data)
  } catch (err) {
    console.error('Get product by id error:', err.message)
    return error(res, 'Gagal mengambil detail produk.', 500)
  }
}

module.exports = { getAllProducts, getCategories, getProductById }
