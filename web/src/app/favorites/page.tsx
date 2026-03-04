// ============================================
//  FAVORITES PAGE
//  /favorites
// ============================================

"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart, Store, Trash2 } from "lucide-react";
import { useFavorites } from "@/lib/contexts/favorites.context";
import { useAuth } from "@/lib/contexts/auth.context";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { formatPrice } from "@/lib/utils";

export default function FavoritesPage() {
  const { user } = useAuth();
  const { 
    favorites, 
    isLoading, 
    error, 
    removeFromFavorites, 
    getFavoriteCount 
  } = useFavorites();
  
  const [removingId, setRemovingId] = useState<string | null>(null);

  const handleRemove = async (productId: string) => {
    if (removingId) return;
    
    setRemovingId(productId);
    try {
      await removeFromFavorites(productId);
    } catch (error) {
      console.error('Error removing favorite:', error);
    } finally {
      setRemovingId(null);
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute requireAuth={true}>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="h-48 bg-gray-200 rounded mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requireAuth={true}>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Heart className="h-6 w-6 text-red-500 fill-current" />
              <h1 className="text-3xl font-bold text-gray-900">Favorit Saya</h1>
            </div>
            <p className="text-gray-600">
              {getFavoriteCount() > 0 
                ? `${getFavoriteCount()} produk favorit Anda`
                : 'Belum ada produk favorit'
              }
            </p>
          </div>

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && favorites.length === 0 && (
            <div className="text-center py-16">
              <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Belum Ada Favorit
              </h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Mulai jelajahi produk bunga indah dan tambahkan yang Anda suka ke favorit
              </p>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-6 py-3 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors"
              >
                Jelajahi Produk
              </Link>
            </div>
          )}

          {/* Favorites Grid */}
          {favorites.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {favorites.map((favorite) => (
                <div
                  key={favorite.id}
                  className="bg-white rounded-lg shadow-sm overflow-hidden group hover:shadow-md transition-all duration-200"
                >
                  {/* Product Image */}
                  <div className="relative aspect-square overflow-hidden">
                    <Image
                      src={favorite.products.image_url || '/placeholder.jpg'}
                      alt={favorite.products.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                    
                    {/* Remove from favorites button */}
                    <button
                      onClick={() => handleRemove(favorite.product_id)}
                      disabled={removingId === favorite.product_id}
                      className="absolute top-3 right-3 p-2 bg-white/80 hover:bg-white rounded-full shadow-sm transition-all duration-200 group-hover:scale-110"
                      title="Hapus dari favorit"
                    >
                      {removingId === favorite.product_id ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-500 border-t-transparent" />
                      ) : (
                        <Trash2 className="h-4 w-4 text-red-500" />
                      )}
                    </button>

                    {/* Stock badge */}
                    {favorite.products.stock_quantity <= 0 && (
                      <div className="absolute top-3 left-3 px-2 py-1 bg-red-500 text-white text-xs rounded-full font-medium">
                        Stok Habis
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <Link 
                      href={`/products/${favorite.product_id}`}
                      className="block group-hover:text-rose-600 transition-colors"
                    >
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                        {favorite.products.name}
                      </h3>
                    </Link>
                    
                    {/* Shop info */}
                    <Link
                      href={`/shops/${favorite.products.shops.id}`}  
                      className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-3"
                    >
                      <Store className="h-3 w-3" />
                      <span className="line-clamp-1">{favorite.products.shops.name}</span>
                    </Link>

                    {/* Price */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-lg font-bold text-rose-600">
                        {formatPrice(favorite.products.price)}
                      </span>
                      <span className="text-sm text-gray-500 capitalize">
                        {favorite.products.category}
                      </span>
                    </div>

                    {/* Stock info */}
                    {favorite.products.stock_quantity > 0 && favorite.products.stock_quantity < 5 && (
                      <p className="text-xs text-orange-600 mb-3">
                        Hanya {favorite.products.stock_quantity} tersisa!
                      </p>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      <AddToCartButton
                        product={favorite.products}
                        size="sm"
                        className="flex-1"
                        showIcon={true}
                        showText={false}
                      />
                      
                      <Link
                        href={`/products/${favorite.product_id}`}
                        className="px-3 py-2 text-gray-600 hover:text-gray-800 border border-gray-200 rounded-lg transition-colors text-sm"
                      >
                        Detail
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}