"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './auth.context';

// Types
export interface FavoriteItem {
  id: string;
  product_id: string;
  products: {
    id: string;
    name: string;
    description: string;
    price: number;
    image_url: string;
    category: string;
    stock_quantity: number;
    shops: {
      id: string;
      name: string;
      address: string;
    };
  };
}

export interface FavoritesContextType {
  favorites: FavoriteItem[];
  isLoading: boolean;
  error: string | null;

  // Actions
  addToFavorites: (productId: string) => Promise<void>;
  removeFromFavorites: (productId: string) => Promise<void>;
  toggleFavorite: (productId: string) => Promise<void>;
  isFavorited: (productId: string) => boolean;
  getFavoriteCount: () => number;
  refreshFavorites: () => Promise<void>;

  // Auth-aware actions (redirect if not authenticated)
  addToFavoritesWithAuth: (productId: string) => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextType | null>(null);

interface FavoritesProviderProps {
  children: React.ReactNode;
}

export function FavoritesProvider({ children }: FavoritesProviderProps) {
  const { user, loading: authLoading, getAccessToken } = useAuth();
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get auth headers using Supabase session token
  const getAuthHeaders = useCallback(async () => {
    const token = await getAccessToken();
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    };
  }, [getAccessToken]);

  // Fetch favorites from Next.js API route
  const fetchFavorites = useCallback(async () => {
    if (!user || authLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const headers = await getAuthHeaders();
      const response = await fetch('/api/favorites', { headers });
      const result = await response.json();

      if (response.ok) {
        setFavorites(result.data || []);
      } else {
        setError(result.error || 'Gagal mengambil data favorit');
      }
    } catch (err) {
      console.error('Error fetching favorites:', err);
      setError('Gagal terhubung ke server');
    } finally {
      setIsLoading(false);
    }
  }, [user, authLoading, getAuthHeaders]);

  // Refresh favorites
  const refreshFavorites = useCallback(async () => {
    await fetchFavorites();
  }, [fetchFavorites]);

  // Add to favorites (POST /api/favorites with toggle semantics)
  const addToFavorites = useCallback(async (productId: string) => {
    if (!user) throw new Error('Anda harus login untuk menambahkan favorit');

    try {
      const headers = await getAuthHeaders();
      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers,
        body: JSON.stringify({ product_id: productId }),
      });

      const result = await response.json();
      if (response.ok) {
        await fetchFavorites();
      } else {
        throw new Error(result.error || 'Gagal menambahkan ke favorit');
      }
    } catch (err) {
      console.error('Error adding to favorites:', err);
      throw err;
    }
  }, [user, getAuthHeaders, fetchFavorites]);

  // Remove from favorites (DELETE /api/favorites?product_id=xxx)
  const removeFromFavorites = useCallback(async (productId: string) => {
    if (!user) throw new Error('Anda harus login untuk menghapus favorit');

    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`/api/favorites?product_id=${productId}`, {
        method: 'DELETE',
        headers,
      });

      if (response.ok) {
        setFavorites(prev => prev.filter(fav => fav.product_id !== productId));
      } else {
        const result = await response.json();
        throw new Error(result.error || 'Gagal menghapus dari favorit');
      }
    } catch (err) {
      console.error('Error removing from favorites:', err);
      throw err;
    }
  }, [user, getAuthHeaders]);

  // Toggle favorite status (POST /api/favorites returns action: "added"|"removed")
  const toggleFavorite = useCallback(async (productId: string) => {
    if (!user) throw new Error('Anda harus login untuk mengubah favorit');

    try {
      const headers = await getAuthHeaders();
      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers,
        body: JSON.stringify({ product_id: productId }),
      });

      const result = await response.json();

      if (response.ok) {
        if (result.action === 'added') {
          await fetchFavorites();
        } else {
          setFavorites(prev => prev.filter(fav => fav.product_id !== productId));
        }
      } else {
        throw new Error(result.error || 'Gagal mengubah status favorit');
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
      throw err;
    }
  }, [user, getAuthHeaders, fetchFavorites]);

  // Check if product is favorited
  const isFavorited = useCallback((productId: string) => {
    return favorites.some(fav => fav.product_id === productId);
  }, [favorites]);

  // Get favorite count
  const getFavoriteCount = useCallback(() => {
    return favorites.length;
  }, [favorites]);

  // Auth-aware add to favorites (redirect if not authenticated)
  const addToFavoritesWithAuth = useCallback(async (productId: string) => {
    if (!user) {
      window.location.href = '/auth/login';
      return;
    }
    await addToFavorites(productId);
  }, [user, addToFavorites]);

  // Load favorites when user logs in
  useEffect(() => {
    if (user && !authLoading) {
      fetchFavorites();
    } else if (!user) {
      setFavorites([]);
      setError(null);
    }
  }, [user, authLoading, fetchFavorites]);

  const value: FavoritesContextType = {
    favorites,
    isLoading,
    error,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    isFavorited,
    getFavoriteCount,
    refreshFavorites,
    addToFavoritesWithAuth,
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

// Custom hook to use favorites context
export function useFavorites() {
  const context = useContext(FavoritesContext);

  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }

  return context;
}