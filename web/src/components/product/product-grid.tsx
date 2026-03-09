"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { ProductCard } from "@/components/product/product-card";
import type { ProductWithShop } from "@/lib/types";

interface ProductGridProps {
  products: ProductWithShop[];
}

export function ProductGrid({ products }: ProductGridProps) {
  const [search, setSearch] = useState("");

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.shops?.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      {/* Search */}
      <div className="relative mb-8">
        <Search
          className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
          aria-hidden="true"
        />
        <input
          type="search"
          placeholder="Cari bunga, rangkaian, atau toko\u2026"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-200"
          aria-label="Cari produk"
        />
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl bg-white py-20 text-center shadow-sm">
          <div className="text-5xl" aria-hidden="true">
            🔍
          </div>
          <p className="mt-4 text-sm text-gray-500">
            Tidak ditemukan produk yang sesuai.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
      )}
    </>
  );
}
