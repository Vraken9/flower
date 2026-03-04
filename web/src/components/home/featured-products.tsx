"use client";

import { ProductCard } from "@/components/product/product-card";
import type { ProductWithShop } from "@/lib/types";

interface FeaturedProductsProps {
  products: ProductWithShop[];
}

export function FeaturedProducts({ products }: FeaturedProductsProps) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl bg-white py-16 text-center shadow-sm">
        <div className="text-5xl" aria-hidden="true">
          🌻
        </div>
        <p className="mt-4 text-sm text-gray-500">
          Belum ada produk tersedia saat ini.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {products.map((product, index) => (
        <ProductCard key={product.id} product={product} index={index} />
      ))}
    </div>
  );
}
