"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ShoppingCart, Heart } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/lib/store/cart";
import { useAuth } from "@/lib/contexts/auth.context";
import { useFavorites } from "@/lib/contexts/favorites.context";
import { cn } from "@/lib/utils";
import type { ProductWithShop } from "@/lib/types";

interface ProductCardProps {
  product: ProductWithShop;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { addItemWithAuth } = useCartStore();
  const { user } = useAuth();
  const { isFavorited, toggleFavorite, addToFavoritesWithAuth } = useFavorites();

  const favorited = isFavorited(product.id);

  const handleFavoriteClick = async () => {
    if (!user) {
      await addToFavoritesWithAuth(product.id);
      return;
    }
    try {
      await toggleFavorite(product.id);
    } catch {
      // Error handled in context
    }
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08, ease: "easeOut" }}
      className="group relative overflow-hidden rounded-2xl bg-white shadow-sm transition-shadow duration-300 hover:shadow-lg"
    >
      {/* Image */}
      <Link
        href={`/products/${product.id}`}
        className="block overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2 rounded-t-2xl"
      >
        <div className="relative aspect-square overflow-hidden bg-rose-50">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-rose-300">
              <svg
                className="h-16 w-16"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          )}
        </div>
      </Link>

      {/* Favorite Button – optimistic toggle (hidden for admin/owner) */}
      {(!user || user.role === 'user') && (
        <button
          type="button"
          onClick={handleFavoriteClick}
          className={cn(
            "absolute right-3 top-3 rounded-full p-2 shadow-sm backdrop-blur-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2",
            favorited
              ? "bg-rose-500 text-white hover:bg-rose-600"
              : "bg-white/80 text-gray-400 hover:bg-white hover:text-rose-500"
          )}
          aria-label={favorited ? `Hapus ${product.name} dari favorit` : `Tambah ${product.name} ke favorit`}
        >
          <Heart className={cn("h-4 w-4", favorited && "fill-current")} aria-hidden="true" />
        </button>
      )}

      {/* Content */}
      <div className="p-4">
        {/* Shop name */}
        {product.shops?.name && (
          <p className="mb-1 text-xs font-medium text-rose-400 truncate">
            {product.shops.name}
          </p>
        )}

        {/* Product name */}
        <Link
          href={`/products/${product.id}`}
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 rounded"
        >
          <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 group-hover:text-rose-600 transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Price & Cart */}
        <div className="mt-3 flex items-center justify-between">
          <p className="text-base font-bold text-rose-600" style={{ fontVariantNumeric: "tabular-nums" }}>
            {formatPrice(product.price)}
          </p>
          {/* Cart button hidden for admin/owner */}
          {(!user || user.role === 'user') && (
            <button
              type="button"
              onClick={() => addItemWithAuth(product, !!user)}
              className="rounded-xl bg-rose-50 p-2 text-rose-500 transition-colors hover:bg-rose-100 active:bg-rose-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2"
              aria-label={`Tambah ${product.name} ke keranjang`}
            >
              <ShoppingCart className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    </motion.article>
  );
}
