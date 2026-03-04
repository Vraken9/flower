"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { ShopCard } from "@/components/shop/shop-card";
import type { Shop } from "@/lib/types";

interface ShopGridProps {
  shops: Shop[];
}

export function ShopGrid({ shops }: ShopGridProps) {
  const [search, setSearch] = useState("");

  const filtered = shops.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.location?.toLowerCase().includes(search.toLowerCase()) ||
      s.description?.toLowerCase().includes(search.toLowerCase())
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
          placeholder="Cari toko berdasarkan nama atau lokasi\u2026"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-200"
          aria-label="Cari toko"
        />
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl bg-white py-20 text-center shadow-sm">
          <div className="text-5xl" aria-hidden="true">
            🏪
          </div>
          <p className="mt-4 text-sm text-gray-500">
            Tidak ditemukan toko yang sesuai.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((shop, index) => (
            <ShopCard key={shop.id} shop={shop} index={index} />
          ))}
        </div>
      )}
    </>
  );
}
