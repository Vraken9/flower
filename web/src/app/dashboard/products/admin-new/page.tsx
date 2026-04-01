"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Loader2, Upload, Link as LinkIcon, CheckCircle } from "lucide-react";
import { useAuth } from "@/lib/contexts/auth.context";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { createClient } from "@/lib/supabase/client";

interface Shop {
  id: string;
  name: string;
  location: string | null;
}

interface Category {
  id: string;
  name: string;
}

export default function AdminNewProductPage() {
  const router = useRouter();
  const { session } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [shops, setShops] = useState<Shop[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [shopsLoading, setShopsLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [imageMode, setImageMode] = useState<"url" | "upload">("url");
  const [uploading, setUploading] = useState(false);

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
    fetchCategories();
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

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setCategories(data.data);
      }
    } catch {
      // Fallback to hardcoded
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("Ukuran file maksimal 5MB");
      return;
    }
    if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type)) {
      setError("Format file harus JPEG, PNG, WebP, atau GIF");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError("Anda harus login terlebih dahulu");
        return;
      }

      const ext = file.name.split(".").pop() || "jpg";
      const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("images")
        .upload(fileName, file, { contentType: file.type, upsert: false });

      if (uploadError) {
        setError("Gagal mengupload gambar: " + uploadError.message);
        return;
      }

      const { data: urlData } = supabase.storage.from("images").getPublicUrl(fileName);
      setFormData(prev => ({ ...prev, image_url: urlData.publicUrl }));
    } catch {
      setError("Gagal mengupload gambar");
    } finally {
      setUploading(false);
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
        setSuccess(true);
        setTimeout(() => {
          router.push("/dashboard/shops");
        }, 2000);
      } else {
        setError(data.error || "Gagal menambahkan produk");
      }
    } catch {
      setError("Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  const fallbackCategories = [
    "Buket",
    "Rangkaian",
    "Bunga Papan",
    "Vas Bunga",
    "Tanaman Hias",
    "Dekorasi",
    "Lainnya",
  ];

  const categoryList = categories.length > 0 ? categories.map(c => c.name) : fallbackCategories;

  if (success) {
    return (
      <ProtectedRoute allowedRoles={["admin"]}>
        <div className="mx-auto max-w-lg px-4 py-16 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Produk Berhasil Ditambahkan
          </h1>
          <p className="mt-2 text-gray-600">
            Mengarahkan ke halaman toko...
          </p>
        </div>
      </ProtectedRoute>
    );
  }

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
                    {categoryList.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Image — toggle URL / Upload */}
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Gambar Produk
                  </label>
                  <div className="mb-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setImageMode("url")}
                      className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                        imageMode === "url"
                          ? "bg-rose-100 text-rose-700"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      <LinkIcon className="h-3.5 w-3.5" />
                      URL
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageMode("upload")}
                      className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                        imageMode === "upload"
                          ? "bg-rose-100 text-rose-700"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      <Upload className="h-3.5 w-3.5" />
                      Upload File
                    </button>
                  </div>

                  {imageMode === "url" ? (
                    <input
                      type="url"
                      value={formData.image_url}
                      onChange={(e) =>
                        setFormData({ ...formData, image_url: e.target.value })
                      }
                      className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-100"
                      placeholder="https://..."
                    />
                  ) : (
                    <div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-sm text-gray-500 transition-colors hover:border-rose-300 hover:bg-rose-50 disabled:opacity-50"
                      >
                        {uploading ? (
                          <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            Mengupload...
                          </>
                        ) : (
                          <>
                            <Upload className="h-5 w-5" />
                            Pilih gambar (maks 5MB)
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Image Preview */}
                  {formData.image_url && (
                    <div className="mt-3 relative aspect-video w-full overflow-hidden rounded-xl bg-rose-50">
                      <Image
                        src={formData.image_url}
                        alt="Preview produk"
                        fill
                        sizes="500px"
                        className="object-cover"
                      />
                    </div>
                  )}
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
