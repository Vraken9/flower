"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ProductWithShop, Shop } from "@/lib/types";

interface ProductFormProps {
  shops: Pick<Shop, "id" | "name">[];
  product?: ProductWithShop;
}

export function ProductForm({ shops, product }: ProductFormProps) {
  const router = useRouter();
  const isEditing = !!product;

  const [formData, setFormData] = useState({
    shop_id: product?.shop_id || "",
    name: product?.name || "",
    description: product?.description || "",
    price: product?.price?.toString() || "",
    image_url: product?.image_url || "",
    category: product?.category || "",
    stock: product?.stock?.toString() || "0",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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

      {/* Shop */}
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

      {/* Category */}
      <Input
        label="Kategori"
        name="category"
        value={formData.category}
        onChange={handleChange}
        placeholder="Contoh: Bouquet, Bunga Potong\u2026"
      />

      {/* Image URL */}
      <Input
        label="URL Gambar"
        name="image_url"
        type="url"
        value={formData.image_url}
        onChange={handleChange}
        placeholder="https://\u2026"
      />

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
