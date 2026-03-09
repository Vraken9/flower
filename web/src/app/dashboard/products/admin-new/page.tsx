"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Upload, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/contexts/auth.context";
import { ProtectedRoute } from "@/components/auth/protected-route";

interface Shop {
  id: string;
  name: string;
  location: string | null;
}

export default function AdminNewProductPage() {
  const router = useRouter();
  const { session } = useAuth();
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(false);
  const [shopsLoading, setShopsLoading] = useState(true);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    shop_id: "",
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "",
    image_url: "",
  });

  useEffect(() => {
    fetchShops();
  }, [session]);

  const fetchShops = async () => {
    try {
      const res = await fetch("/api/admin/shops", { credentials: "include" });
      const data = await res.json();
      if (data.success) {
        setShops(data.data || []);
        if (data.data?.length > 0) {
          setFormData(prev => ({ ...prev, shop_id: data.data[0].id }));
        }
      }
    } catch (err) {
      console.error("Failed to load shops:", err);
    } finally {
      setShopsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price) || 0,
          stock: parseInt(formData.stock) || 0,
        }),
      });

      const data = await res.json();
      if (data.success) {
        router.push("/dashboard/shops");
      } else {
        setError(data.error || "Gagal menambahkan produk");
      }
    } catch (err) {
      setError("Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    "Buket",
    "Rangkaian",
    "Bunga Papan",
    "Vas Bunga",
    "Tanaman Hias",
    "Dekorasi",
    "Lainnya",
  ];

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div>
        <Link
          href="/dashboard/shops"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-rose-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali
        </Link>

        <h1 className="mb-6 text-2xl font-bold text-gray-900">
          Tambah Produk (Admin)
        </h1>

        {shopsLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
          </div>
        ) : shops.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center">
            <p className="text-gray-500">Belum ada toko terdaftar</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
                {error}
              </div>
            )}

            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              {/* Shop Selection */}
              <div className="mb-6">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Pilih Toko *
                </label>
                <select
                  value={formData.shop_id}
                  onChange={(e) =>
                    setFormData({ ...formData, shop_id: e.target.value })
                  }
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-100"
                  required
                >
                  {shops.map((shop) => (
                    <option key={shop.id} value={shop.id}>
                      {shop.name} {shop.location ? `(${shop.location})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                {/* Product Name */}
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Nama Produk *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-100"
                    placeholder="Buket Mawar Merah"
                    required
                  />
                </div>

                {/* Description */}
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Deskripsi
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={3}
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-100"
                    placeholder="Deskripsi produk..."
                  />
                </div>

                {/* Price */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Harga (Rp) *
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-100"
                    placeholder="150000"
                    min="0"
                    required
                  />
                </div>

                {/* Stock */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Stok *
                  </label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) =>
                      setFormData({ ...formData, stock: e.target.value })
                    }
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-100"
                    placeholder="10"
                    min="0"
                    required
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Kategori
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-100"
                  >
                    <option value="">Pilih kategori</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Image URL */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    URL Gambar
                  </label>
                  <input
                    type="url"
                    value={formData.image_url}
                    onChange={(e) =>
                      setFormData({ ...formData, image_url: e.target.value })
                    }
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-100"
                    placeholder="https://..."
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-xl bg-rose-500 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-rose-600 disabled:opacity-50"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Tambah Produk
              </button>
              <Link
                href="/dashboard/shops"
                className="rounded-xl border border-gray-200 px-6 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Batal
              </Link>
            </div>
          </form>
        )}
      </div>
    </ProtectedRoute>
  );
}
