"use client";

import { useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/lib/store/cart';
import { useAuth } from '@/lib/contexts/auth.context';
import { cn } from '@/lib/utils';
import type { Product } from '@/lib/types';

interface AddToCartButtonProps {
  product: Product;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'outline';
  showIcon?: boolean;
  showText?: boolean;
  className?: string;
  disabled?: boolean;
  onAdd?: (product: Product) => void;
}

export function AddToCartButton({
  product,
  size = 'md',
  variant = 'primary',
  showIcon = true,
  showText = true,
  className,
  disabled = false,
  onAdd,
}: AddToCartButtonProps) {
  const { user } = useAuth();
  const { addItemWithAuth } = useCartStore();
  const [isAdding, setIsAdding] = useState(false);

  // Hide entire button for admin/owner roles
  if (user && (user.role === 'admin' || user.role === 'owner')) return null;

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (disabled || isAdding || product.stock <= 0) return;

    setIsAdding(true);

    try {
      if (user) {
        addItemWithAuth(product, true);
        onAdd?.(product);

        // Optional: Show success feedback
        // Could integrate with toast notification system

      } else {
        // Redirect to login
        addItemWithAuth(product, false);
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setIsAdding(false);
    }
  };

  // Check if product is out of stock
  const isOutOfStock = product.stock <= 0;
  const isDisabled = disabled || isOutOfStock || isAdding;

  // Size configurations
  const sizeConfig = {
    sm: {
      button: 'px-3 py-1.5 text-xs',
      icon: 'h-4 w-4',
    },
    md: {
      button: 'px-4 py-2 text-sm',
      icon: 'h-4 w-4',
    },
    lg: {
      button: 'px-6 py-3 text-base',
      icon: 'h-5 w-5',
    },
  };

  // Variant configurations
  const variantConfig = {
    primary: {
      normal: 'bg-rose-600 text-white hover:bg-rose-700 focus-visible:ring-rose-500',
      disabled: 'bg-gray-300 text-gray-500 cursor-not-allowed',
    },
    secondary: {
      normal: 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus-visible:ring-gray-500',
      disabled: 'bg-gray-100 text-gray-400 cursor-not-allowed',
    },
    outline: {
      normal: 'border border-rose-600 text-rose-600 hover:bg-rose-50 focus-visible:ring-rose-500',
      disabled: 'border border-gray-300 text-gray-400 cursor-not-allowed',
    },
  };

  const buttonText = () => {
    if (isOutOfStock) return 'Stok Habis';
    if (isAdding) return 'Menambahkan...';
    if (!user) return 'Tambah ke Keranjang';
    return 'Tambah ke Keranjang';
  };

  const buttonTitle = () => {
    if (isOutOfStock) return 'Produk sedang tidak tersedia';
    if (!user) return 'Login untuk menambahkan ke keranjang';
    return 'Tambah produk ke keranjang belanja';
  };

  return (
    <button
      onClick={handleClick}
      disabled={isDisabled}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        sizeConfig[size].button,
        isDisabled
          ? variantConfig[variant].disabled
          : variantConfig[variant].normal,
        isAdding && 'animate-pulse',
        className
      )}
      title={buttonTitle()}
    >
      {showIcon && (
        isAdding ? (
          <div className={cn('animate-spin rounded-full border-2 border-current border-t-transparent', sizeConfig[size].icon)} />
        ) : (
          <ShoppingCart className={cn(sizeConfig[size].icon)} />
        )
      )}

      {showText && (
        <span>{buttonText()}</span>
      )}

      {/* Stock indicator */}
      {product.stock < 5 && product.stock > 0 && showText && (
        <span className="text-xs opacity-75">
          ({product.stock} tersisa)
        </span>
      )}
    </button>
  );
}

// Quick add button variant (icon only, small)
export function QuickAddToCartButton({
  product,
  className,
  ...props
}: Omit<AddToCartButtonProps, 'size' | 'showText' | 'showIcon'>) {
  return (
    <AddToCartButton
      product={product}
      size="sm"
      variant="primary"
      showIcon={true}
      showText={false}
      className={cn('rounded-full p-2', className)}
      {...props}
    />
  );
}