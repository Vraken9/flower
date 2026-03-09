"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Store, 
  Trash2, 
  Edit, 
  ToggleLeft, 
  ToggleRight, 
  Search,
  MapPin,
  Package,
  ExternalLink
} from "lucide-react";
import { useAuth } from "@/lib/contexts/auth.context";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { formatDate } from "@/lib/utils";

interface Shop {
  id: string;
  owner_id: string;
  name: string;
  description: string | null;
  location: string | null;
  image_url: string | null;
  whatsapp: string | null;
  is_active: boolean;
  created_at: string;
  profiles: {
    full_name: string;
  } | null;
  products: { count: number }[];
}

export default function AdminShopsPage() {
  const { session } = useAuth();
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (session) fetchShops();
  }, [session]);

  const fetchShops = async () => {
    try {
      const res = await fetch("/api/admin/shops", {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setShops(data.data || []);
      }
    } catch (err) {
      console.error("Failed to load shops:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (shopId: string, currentStatus: boolean) => {
    setActionLoading(shopId);
    try {
      const res = await fetch(`/api/admin/shops/${shopId}/toggle`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !currentStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setShops(shops.map(s => 
          s.id === shopId ? { ...s, is_active: !currentStatus } : s
        ));
      }
    } catch (err) {
      console.error("Toggle failed:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (shopId: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus toko ini? Semua produk di toko ini juga akan terhapus.")) {
      return;
    }
    setActionLoading(shopId);
    try {
      const res = await fetch(`/api/admin/shops/${shopId}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setShops(shops.filter(s => s.id !== shopId));
      }
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredShops = shops.filter(shop =>
    shop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    shop.location?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div>
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Kelola Toko</h1>
          <span className="text-sm text-gray-500">{shops.length} toko terdaftar</span>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Cari toko..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-100"
            />
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 animate-pulse rounded-2xl bg-gray-100" />
            ))}
          </div>
        ) : filteredShops.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center">
            <Store className="mx-auto h-12 w-12 text-gray-300" />
            <p className="mt-3 text-gray-500">
              {searchQuery ? "Tidak ada toko yang cocok dengan pencarian" : "Belum ada toko terdaftar"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredShops.map((shop) => (
              <div
                key={shop.id}
                className={`rounded-2xl border bg-white p-5 shadow-sm transition-all ${
                  shop.is_active 
                    ? "border-gray-200" 
                    : "border-red-200 bg-red-50/30"
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Shop Image */}
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                    {shop.image_url ? (
                      <img
                        src={shop.image_url}
                        alt={shop.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Store className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Shop Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">{shop.name}</h3>
                        {shop.location && (
                          <p className="flex items-center gap-1 text-sm text-gray-500">
                            <MapPin className="h-3.5 w-3.5" />
                            {shop.location}
                          </p>
                        )}
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          shop.is_active
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {shop.is_active ? "Aktif" : "Nonaktif"}
                      </span>
                    </div>

                    {shop.description && (
                      <p className="mt-1 line-clamp-2 text-sm text-gray-600">
                        {shop.description}
                      </p>
                    )}

                    <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Package className="h-3.5 w-3.5" />
                        {shop.products?.[0]?.count || 0} produk
                      </span>
                      <span>•</span>
                      <span>Owner: {shop.profiles?.full_name || "Unknown"}</span>
                      <span>•</span>
                      <span>Dibuat: {formatDate(shop.created_at)}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 flex flex-wrap gap-2 border-t border-gray-100 pt-4">
                  <Link
                    href={`/shops/${shop.id}`}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Lihat
                  </Link>
                  
                  <button
                    onClick={() => handleToggleActive(shop.id, shop.is_active)}
                    disabled={actionLoading === shop.id}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50 ${
                      shop.is_active
                        ? "border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
                        : "border border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
                    }`}
                  >
                    {shop.is_active ? (
                      <>
                        <ToggleLeft className="h-3.5 w-3.5" />
                        Nonaktifkan
                      </>
                    ) : (
                      <>
                        <ToggleRight className="h-3.5 w-3.5" />
                        Aktifkan
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleDelete(shop.id)}
                    disabled={actionLoading === shop.id}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-100 disabled:opacity-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
