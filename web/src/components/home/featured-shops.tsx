"use client";

import { ShopCard } from "@/components/shop/shop-card";
import type { Shop } from "@/lib/types";

interface FeaturedShopsProps {
  shops: Shop[];
}

export function FeaturedShops({ shops }: FeaturedShopsProps) {
  if (shops.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl bg-white py-16 text-center shadow-sm">
        <div className="text-5xl" aria-hidden="true">
          🏵️
        </div>
        <p className="mt-4 text-sm text-gray-500">
          Belum ada toko terdaftar saat ini.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {shops.map((shop, index) => (
        <ShopCard key={shop.id} shop={shop} index={index} />
      ))}
    </div>
  );
}
