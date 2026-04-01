"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Save, Loader2, Upload, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import type { ProductWithShop, Shop, Category } from "@/lib/types";

interface ProductFormProps {
  shops: Pick<Shop, "id" | "name">[];
  product?: ProductWithShop;
}

export function ProductForm({ shops, product }: ProductFormProps) {
  const router = useRouter();
  const isEditing = !!product;
  const fileInputRef = useRef<HTMLInputElement>(null);

  // If owner has exactly 1 shop, auto-select it
  const autoShopId = shops.length === 1 ? shops[0].id : "";

  const [formData, setFormData] = useState({
    shop_id: product?.shop_id || autoShopId,
    name: product?.name || "",
    description: product?.description || "",
    price: product?.price?.toString() || "",
    image_url: product?.image_url || "",
    category: product?.category || "",
    stock: product?.stock?.toString() || "0",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [imageMode, setImageMode] = useState<"url" | "upload">("url");
  const [uploading, setUploading] = useState(false);

  // Fetch dynamic categories
  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setCategories(data.data);
        }
      })
      .catch(() => {});
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Helper to extract storage path from public URL
  const extractStoragePath = (url: string): string | null => {
    try {
      const match = url.match(/\/storage\/v1\/object\/public\/images\/(.+)$/);
      return match ? decodeURIComponent(match[1]) : null;
    } catch {
      return null;
    }
  };

  // Delete old image from Supabase Storage
  const deleteOldImage = async (oldUrl: string) => {
    const path = extractStoragePath(oldUrl);
    if (!path) return;
    try {
      const supabase = createClient();
      await supabase.storage.from("images").remove([path]);
    } catch {
      // Ignore deletion errors
    }
  };

  // Handle image file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate
    if (file.size > 5 * 1024 * 1024) {
      setError("Ukuran file maksimal 5MB");
      return;
    }
    if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type)) {
      setError("Format file harus JPEG, PNG, WebP, atau GIF");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError("Anda harus login terlebih dahulu");
        return;
      }

      // Delete old image from storage if it exists
      const oldUrl = formData.image_url;
      if (oldUrl && extractStoragePath(oldUrl)) {
        await deleteOldImage(oldUrl);
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

      const { data: urlData } = supabase.storage
        .from("images")
        .getPublicUrl(fileName);

      setFormData((prev) => ({ ...prev, image_url: urlData.publicUrl }));
    } catch {
      setError("Gagal mengupload gambar");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Use owner API endpoints
      const apiUrl = isEditing
        ? `/api/owner/products/${product.id}`
        : "/api/owner/products";

      const res = await fetch(apiUrl, {
        method: isEditing ? "PUT" : "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          price: Number(formData.price),
          stock: Number(formData.stock),
        }),
      });

      const result = await res.json();

      if (result.success) {
        router.push("/dashboard/products");
        router.refresh();
      } else {
        setError(result.message || "Gagal menyimpan produk. Silakan coba lagi.");
      }
    } catch {
      setError("Terjadi kesalahan. Pastikan server backend aktif.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-xl space-y-5 rounded-2xl bg-white p-6 shadow-sm"
    >
      {/* Error Message */}
      {error && (
        <div
          className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600"
          role="alert"
          aria-live="polite"
        >
          {error}
        </div>
      )}

      {/* Shop — auto-selected if only one */}
      {shops.length === 1 ? (
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-700">
            Toko
          </label>
          <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-700">
            {shops[0].name}
          </div>
          <input type="hidden" name="shop_id" value={shops[0].id} />
        </div>
      ) : (
        <div className="space-y-1.5">
          <label
            htmlFor="shop_id"
            className="block text-sm font-medium text-gray-700"
          >
            Toko
          </label>
          <select
            id="shop_id"
            name="shop_id"
            value={formData.shop_id}
            onChange={handleChange}
            required
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 transition-colors focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-200"
          >
            <option value="">Pilih toko\u2026</option>
            {shops.map((shop) => (
              <option key={shop.id} value={shop.id}>
                {shop.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Name */}
      <Input
        label="Nama Produk"
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="Contoh: Bouquet Mawar Merah\u2026"
        required
      />

      {/* Description */}
      <div className="space-y-1.5">
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700"
        >
          Deskripsi
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          value={formData.description}
          onChange={handleChange}
          placeholder="Jelaskan produk bunga Anda\u2026"
          className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-200"
        />
      </div>

      {/* Price & Stock */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Harga (Rp)"
          name="price"
          type="number"
          value={formData.price}
          onChange={handleChange}
          placeholder="50000"
          required
          min="0"
        />
        <Input
          label="Stok"
          name="stock"
          type="number"
          value={formData.stock}
          onChange={handleChange}
          placeholder="10"
          min="0"
        />
      </div>

      {/* Category — dynamic from DB */}
      <div className="space-y-1.5">
        <label
          htmlFor="category"
          className="block text-sm font-medium text-gray-700"
        >
          Kategori
        </label>
        {categories.length > 0 ? (
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 transition-colors focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-200"
          >
            <option value="">Pilih kategori\u2026</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>
        ) : (
          <Input
            name="category"
            value={formData.category}
            onChange={handleChange}
            placeholder="Contoh: Bouquet, Bunga Potong\u2026"
          />
        )}
      </div>

      {/* Image — toggle URL / Upload */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Gambar Produk
        </label>
        <div className="flex gap-2">
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
          <Input
            name="image_url"
            type="url"
            value={formData.image_url}
            onChange={handleChange}
            placeholder="https://\u2026"
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
      </div>

      {/* Image Preview */}
      {formData.image_url && (
        <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-rose-50">
          <Image
            src={formData.image_url}
            alt="Preview produk"
            fill
            sizes="500px"
            className="object-cover"
          />
        </div>
      )}

      {/* Submit */}
      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full"
        size="lg"
      >
        {isSubmitting ? (
          <>
            <Loader2
              className="h-4 w-4 animate-spin"
              aria-hidden="true"
            />
            Menyimpan\u2026
          </>
        ) : (
          <>
            <Save className="h-4 w-4" aria-hidden="true" />
            {isEditing ? "Simpan Perubahan" : "Tambah Produk"}
          </>
        )}
      </Button>
    </form>
  );
}
