"use client";

import { useState, useMemo } from "react";
import { MapPin, X, Search } from "lucide-react";
import { ShopGrid } from "@/components/shop/shop-grid";
import { getKabupatenList } from "@/lib/data/jawa-tengah";
import type { Shop, Category } from "@/lib/types";

interface ShopsFilterProps {
  shops: Shop[];
  categories: Category[];
}

export function ShopsFilter({ shops, categories }: ShopsFilterProps) {
  const [selectedKabupaten, setSelectedKabupaten] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const kabupatenList = getKabupatenList();

  // Get unique kabupaten values from shops
  const shopKabupatenSet = useMemo(() => {
    const set = new Set<string>();
    shops.forEach((s) => {
      if (s.kabupaten) set.add(s.kabupaten);
    });
    return set;
  }, [shops]);

  const filteredShops = useMemo(() => {
    let result = shops;
    if (selectedKabupaten) {
      result = result.filter(
        (s) =>
          s.kabupaten === selectedKabupaten ||
          (s.location &&
            s.location.toLowerCase().includes(selectedKabupaten.toLowerCase()))
      );
    }
    if (selectedCategory) {
      result = result.filter((s) => s.category_id === selectedCategory);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          (s.location && s.location.toLowerCase().includes(q))
      );
    }
    return result;
  }, [shops, selectedKabupaten, selectedCategory, searchQuery]);

  // Only show kabupaten options that have shops, plus all for discoverability
  const availableKabupaten = kabupatenList.filter(
    (kab) => shopKabupatenSet.has(kab)
  );

  return (
    <div>
      {/* Filter bar */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        {/* Text Search */}
        <div className="flex w-full sm:w-auto items-center gap-2 rounded-xl border border-gray-300 bg-white px-3 py-2 focus-within:border-rose-400 focus-within:ring-2 focus-within:ring-rose-200">
          <Search className="h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cari toko atau kecamatan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-gray-900 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-gray-400" />
          <select
            value={selectedKabupaten}
            onChange={(e) => setSelectedKabupaten(e.target.value)}
            className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-200"
          >
            <option value="">Semua Lokasi</option>
            {availableKabupaten.length > 0 ? (
              availableKabupaten.map((kab) => (
                <option key={kab} value={kab}>{kab}</option>
              ))
            ) : (
              kabupatenList.map((kab) => (
                <option key={kab} value={kab}>{kab}</option>
              ))
            )}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-200"
          >
            <option value="">Semua Kategori</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {selectedKabupaten && (
          <button
            onClick={() => setSelectedKabupaten("")}
            className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-3 py-1 text-xs font-medium text-rose-700 hover:bg-rose-200"
          >
            {selectedKabupaten}
            <X className="h-3 w-3" />
          </button>
        )}
        
        {selectedCategory && (
          <button
            onClick={() => setSelectedCategory("")}
            className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-3 py-1 text-xs font-medium text-rose-700 hover:bg-rose-200"
          >
            {categories.find(c => c.id === selectedCategory)?.name || "Kategori"}
            <X className="h-3 w-3" />
          </button>
        )}

        <span className="text-sm text-gray-400">
          {filteredShops.length} toko ditemukan
        </span>
      </div>

      <ShopGrid shops={filteredShops} />
    </div>
  );
}
