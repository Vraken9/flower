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
  const { user, loading: authLoading } = useAuth();
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_BASE = 'http://localhost:5000/api';

  // Get auth headers
  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('access_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }, []);

  // Fetch favorites from API
  const fetchFavorites = useCallback(async () => {
    if (!user || authLoading) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE}/favorites`, {
        headers: getAuthHeaders(),
      });
      
      const result = await response.json();
      
      if (response.ok) {
        setFavorites(result.data || []);
      } else {
        setError(result.message || 'Gagal mengambil data favorit');
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
      setError('Gagal terhubung ke server');
    } finally {
      setIsLoading(false);
    }
  }, [user, authLoading, getAuthHeaders]);

  // Refresh favorites
  const refreshFavorites = useCallback(async () => {
    await fetchFavorites();
  }, [fetchFavorites]);

  // Add to favorites
  const addToFavorites = useCallback(async (productId: string) => {
    if (!user) {
      throw new Error('Anda harus login untuk menambahkan favorit');
    }
    
    try {
      const response = await fetch(`${API_BASE}/favorites`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ product_id: productId }),
      });
      
      const result = await response.json();
      
      if (response.ok) {
        // Refresh favorites list
        await fetchFavorites();
      } else {
        throw new Error(result.message || 'Gagal menambahkan ke favorit');
      }
    } catch (error) {
      console.error('Error adding to favorites:', error);
      throw error;
    }
  }, [user, getAuthHeaders, fetchFavorites]);

  // Remove from favorites
  const removeFromFavorites = useCallback(async (productId: string) => {
    if (!user) {
      throw new Error('Anda harus login untuk menghapus favorit');
    }
    
    try {
      const response = await fetch(`${API_BASE}/favorites/${productId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      
      const result = await response.json();
      
      if (response.ok) {
        // Remove from local state immediately for better UX
        setFavorites(prev => prev.filter(fav => fav.product_id !== productId));
      } else {
        throw new Error(result.message || 'Gagal menghapus dari favorit');
      }
    } catch (error) {
      console.error('Error removing from favorites:', error);
      throw error;
    }
  }, [user, getAuthHeaders]);

  // Toggle favorite status
  const toggleFavorite = useCallback(async (productId: string) => {
    if (!user) {
      throw new Error('Anda harus login untuk mengubah favorit');
    }
    
    try {
      const response = await fetch(`${API_BASE}/favorites/toggle`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ product_id: productId }),
      });
      
      const result = await response.json();
      
      if (response.ok) {
        // Update local state based on action
        if (result.data.action === 'added') {
          await fetchFavorites(); // Refresh to get full product data
        } else {
          setFavorites(prev => prev.filter(fav => fav.product_id !== productId));
        }
      } else {
        throw new Error(result.message || 'Gagal mengubah status favorit');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      throw error;
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
      // Redirect to login page
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
      // Clear favorites when user logs out
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