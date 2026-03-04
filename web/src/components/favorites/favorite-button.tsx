"use client";

import { useState } from 'react';
import { Heart } from 'lucide-react';
import { useFavorites } from '@/lib/contexts/favorites.context';
import { useAuth } from '@/lib/contexts/auth.context';
import { cn } from '@/lib/utils';

interface FavoriteButtonProps {
  productId: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'icon' | 'button';
  showText?: boolean;
  className?: string;
  onToggle?: (isFavorited: boolean) => void;
}

export function FavoriteButton({
  productId,
  size = 'md',
  variant = 'icon',
  showText = false,
  className,
  onToggle,
}: FavoriteButtonProps) {
  const { user } = useAuth();
  const {
    isFavorited,
    toggleFavorite,
    addToFavoritesWithAuth,
    isLoading,
  } = useFavorites();
  
  const [isToggling, setIsToggling] = useState(false);

  const favorited = isFavorited(productId);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isToggling) return;
    
    setIsToggling(true);
    
    try {
      if (user) {
        await toggleFavorite(productId);
        onToggle?.(isFavorited(productId));
      } else {
        // Redirect to login if not authenticated
        await addToFavoritesWithAuth(productId);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      // Could show toast notification here
    } finally {
      setIsToggling(false);
    }
  };

  // Size configurations
  const sizeConfig = {
    sm: {
      icon: 'h-4 w-4',
      button: 'px-2 py-1 text-xs',
    },
    md: {
      icon: 'h-5 w-5',
      button: 'px-3 py-2 text-sm',
    },
    lg: {
      icon: 'h-6 w-6',
      button: 'px-4 py-2 text-base',
    },
  };

  if (variant === 'button') {
    return (
      <button
        onClick={handleClick}
        disabled={isToggling || isLoading}
        className={cn(
          'inline-flex items-center gap-2 rounded-lg font-medium transition-all duration-200',
          sizeConfig[size].button,
          favorited
            ? 'bg-red-50 text-red-600 hover:bg-red-100'
            : 'bg-gray-50 text-gray-600 hover:bg-red-50 hover:text-red-600',
          (isToggling || isLoading) && 'opacity-50 cursor-not-allowed',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2',
          className
        )}
        title={user ? (favorited ? 'Hapus dari favorit' : 'Tambah ke favorit') : 'Login untuk menambah favorit'}
      >
        <Heart 
          className={cn(
            sizeConfig[size].icon,
            'transition-all duration-200',
            favorited ? 'fill-current' : 'fill-none',
            (isToggling || isLoading) && 'animate-pulse'
          )}
        />
        {showText && (
          <span>
            {favorited ? 'Favorit' : 'Tambah Favorit'}
          </span>
        )}
      </button>
    );
  }

  // Icon variant (default)
  return (
    <button
      onClick={handleClick}
      disabled={isToggling || isLoading}
      className={cn(
        'group relative rounded-full p-2 transition-all duration-200',
        'hover:bg-white/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2',
        'backdrop-blur-sm',
        (isToggling || isLoading) && 'cursor-not-allowed',
        className
      )}
      title={user ? (favorited ? 'Hapus dari favorit' : 'Tambah ke favorit') : 'Login untuk menambah favorit'}
    >
      <Heart
        className={cn(
          sizeConfig[size].icon,
          'transition-all duration-200',
          favorited
            ? 'fill-red-500 text-red-500'
            : 'fill-none text-gray-500 group-hover:text-red-500',
          (isToggling || isLoading) && 'animate-pulse'
        )}
      />
      
      {/* Add some visual feedback */}
      {favorited && (
        <div className="absolute -top-1 -right-1">
          <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
        </div>
      )}
    </button>
  );
}