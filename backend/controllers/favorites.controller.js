// ============================================
//  FAVORITES CONTROLLER
//  Manage user favorites
// ============================================

const { supabaseAdmin } = require('../config/supabase');
const { successResponse, errorResponse } = require('../utils/response');

class FavoritesController {
  
  // Get user's favorites
  async getFavorites(req, res) {
    try {
      const userId = req.user.id;
      
      // Get favorites with product details
      const { data: favorites, error } = await supabaseAdmin
        .from('favorites')
        .select(`
          id,
          product_id,
          products (
            id,
            name,
            description,
            price,
            image_url,
            category,
            stock_quantity,
            shops (
              id,
              name,
              address
            )
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('❌ Error fetching favorites:', error);
        return errorResponse(res, 'Gagal mengambil data favorit', 500);
      }
      
      successResponse(res, favorites || [], 'Favorit berhasil diambil');
      
    } catch (error) {
      console.error('❌ Get favorites error:', error);
      errorResponse(res, 'Internal server error', 500);
    }
  }
  
  // Add product to favorites
  async addFavorite(req, res) {
    try {
      const userId = req.user.id;
      const { product_id } = req.body;
      
      if (!product_id) {
        return errorResponse(res, 'Product ID diperlukan', 400);
      }
      
      // Check if product exists
      const { data: product, error: productError } = await supabaseAdmin
        .from('products')
        .select('id, name')
        .eq('id', product_id)
        .single();
      
      if (productError || !product) {
        return errorResponse(res, 'Produk tidak ditemukan', 404);
      }
      
      // Check if already favorited
      const { data: existingFavorite } = await supabaseAdmin
        .from('favorites')
        .select('id')
        .eq('user_id', userId)
        .eq('product_id', product_id)
        .single();
      
      if (existingFavorite) {
        return errorResponse(res, 'Produk sudah ada di favorit', 400);
      }
      
      // Add to favorites
      const { data: newFavorite, error } = await supabaseAdmin
        .from('favorites')
        .insert({
          user_id: userId,
          product_id: product_id
        })
        .select('*, products(name)')
        .single();
      
      if (error) {
        console.error('❌ Error adding favorite:', error);
        return errorResponse(res, 'Gagal menambahkan ke favorit', 500);
      }
      
      successResponse(res, newFavorite, 'Produk berhasil ditambahkan ke favorit');
      
    } catch (error) {
      console.error('❌ Add favorite error:', error);
      errorResponse(res, 'Internal server error', 500);
    }
  }
  
  // Remove product from favorites
  async removeFavorite(req, res) {
    try {
      const userId = req.user.id;
      const { product_id } = req.params;
      
      if (!product_id) {
        return errorResponse(res, 'Product ID diperlukan', 400);
      }
      
      // Remove from favorites
      const { error } = await supabaseAdmin
        .from('favorites')
        .delete()
        .eq('user_id', userId)
        .eq('product_id', product_id);
      
      if (error) {
        console.error('❌ Error removing favorite:', error);
        return errorResponse(res, 'Gagal menghapus dari favorit', 500);
      }
      
      successResponse(res, null, 'Produk berhasil dihapus dari favorit');
      
    } catch (error) {
      console.error('❌ Remove favorite error:', error);
      errorResponse(res, 'Internal server error', 500);
    }
  }
  
  // Check if product is favorited
  async checkFavorite(req, res) {
    try {
      const userId = req.user.id;
      const { product_id } = req.params;
      
      if (!product_id) {
        return errorResponse(res, 'Product ID diperlukan', 400);
      }
      
      const { data: favorite, error } = await supabaseAdmin
        .from('favorites')
        .select('id')
        .eq('user_id', userId)
        .eq('product_id', product_id)
        .single();
      
      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('❌ Error checking favorite:', error);
        return errorResponse(res, 'Gagal memeriksa status favorit', 500);
      }
      
      const isFavorited = !!favorite;
      
      successResponse(res, { 
        product_id, 
        is_favorited: isFavorited,
        favorite_id: favorite?.id || null
      }, 'Status favorit berhasil diperiksa');
      
    } catch (error) {
      console.error('❌ Check favorite error:', error);
      errorResponse(res, 'Internal server error', 500);
    }
  }
  
  // Toggle favorite status
  async toggleFavorite(req, res) {
    try {
      const userId = req.user.id;
      const { product_id } = req.body;
      
      if (!product_id) {
        return errorResponse(res, 'Product ID diperlukan', 400);
      }
      
      // Check if already favorited
      const { data: existingFavorite } = await supabaseAdmin
        .from('favorites')
        .select('id')
        .eq('user_id', userId)
        .eq('product_id', product_id)
        .single();
      
      if (existingFavorite) {
        // Remove from favorites
        const { error } = await supabaseAdmin
          .from('favorites')
          .delete()
          .eq('id', existingFavorite.id);
        
        if (error) {
          return errorResponse(res, 'Gagal menghapus dari favorit', 500);
        }
        
        successResponse(res, { 
          product_id, 
          is_favorited: false,
          action: 'removed'
        }, 'Produk dihapus dari favorit');
        
      } else {
        // Add to favorites
        const { data: newFavorite, error } = await supabaseAdmin
          .from('favorites')
          .insert({
            user_id: userId,
            product_id: product_id
          })
          .select()
          .single();
        
        if (error) {
          return errorResponse(res, 'Gagal menambahkan ke favorit', 500);
        }
        
        successResponse(res, { 
          product_id, 
          is_favorited: true,
          action: 'added',
          favorite_id: newFavorite.id
        }, 'Produk ditambahkan ke favorit');
      }
      
    } catch (error) {
      console.error('❌ Toggle favorite error:', error);
      errorResponse(res, 'Internal server error', 500);
    }
  }
}

module.exports = new FavoritesController();