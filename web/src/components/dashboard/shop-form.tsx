"use client";

import { useState, useRef } from "react";
import { Save, Loader2, Upload, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { getKabupatenList, getKecamatanList } from "@/lib/data/jawa-tengah";
import type { Shop, Category } from "@/lib/types";

interface ShopFormProps {
  shop: Shop | null;
  categories: Category[];
  parentShopId?: string;
}

export function ShopForm({ shop, categories, parentShopId }: ShopFormProps) {
  const isEditing = !!shop;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: shop?.name || "",
    description: shop?.description || "",
    location: shop?.location || "",
    kabupaten: shop?.kabupaten || "",
    kecamatan: shop?.kecamatan || "",
    image_url: shop?.image_url || "",
    whatsapp: shop?.whatsapp || "",
    category_id: shop?.category_id || "",
    parent_shop_id: shop?.parent_shop_id || parentShopId || "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [imageMode, setImageMode] = useState<"url" | "upload">("url");
  const [uploading, setUploading] = useState(false);

  const kabupatenList = getKabupatenList();
  const kecamatanList = formData.kabupaten
    ? getKecamatanList(formData.kabupaten)
    : [];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name === "kabupaten") {
      // Reset kecamatan when kabupaten changes
      setFormData((prev) => ({
        ...prev,
        kabupaten: value,
        kecamatan: "",
        location: value ? `${value}, Jawa Tengah` : "",
      }));
    } else if (name === "kecamatan") {
      setFormData((prev) => ({
        ...prev,
        kecamatan: value,
        location: value
          ? `${value}, ${prev.kabupaten}, Jawa Tengah`
          : `${prev.kabupaten}, Jawa Tengah`,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
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

    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: "error", text: "Ukuran file maksimal 5MB" });
      return;
    }
    if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type)) {
      setMessage({ type: "error", text: "Format file harus JPEG, PNG, WebP, atau GIF" });
      return;
    }

    setUploading(true);
    setMessage(null);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setMessage({ type: "error", text: "Anda harus login terlebih dahulu" });
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
        setMessage({ type: "error", text: "Gagal mengupload: " + uploadError.message });
        return;
      }

      const { data: urlData } = supabase.storage.from("images").getPublicUrl(fileName);
      setFormData((prev) => ({ ...prev, image_url: urlData.publicUrl }));
    } catch {
      setMessage({ type: "error", text: "Gagal mengupload gambar" });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const url = "/api/owner/shop";
      const res = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, id: shop?.id }),
      });

      const result = await res.json();

      if (result.success) {
        setMessage({
          type: "success",
          text: result.message || (isEditing
            ? "Profil toko berhasil diperbarui!"
            : "Toko berhasil dibuat!"),
        });
        
        // Refresh the page after successful creation/update
        if (!isEditing) {
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        }
      } else {
        setMessage({ 
          type: "error", 
          text: result.message || "Gagal menyimpan. Coba lagi." 
        });
      }
    } catch (error) {
      console.error("Shop form error:", error);
      setMessage({
        type: "error",
        text: "Terjadi kesalahan. Silakan coba lagi.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-xl space-y-5 rounded-2xl bg-white p-6 shadow-sm"
    >
      {/* Message */}
      {message && (
        <div
          className={`rounded-xl px-4 py-3 text-sm ${
            message.type === "success"
              ? "bg-green-50 text-green-600"
              : "bg-red-50 text-red-600"
          }`}
          role="alert"
          aria-live="polite"
        >
          {message.text}
        </div>
      )}

      <Input
        label="Nama Toko"
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="Contoh: Edelweis Senja…"
        required
      />

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-gray-700">
          Kategori Toko
        </label>
        <select
          name="category_id"
          value={formData.category_id}
          onChange={handleChange}
          className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-200"
        >
          <option value="">Pilih Kategori (Opsional)</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

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
          rows={3}
          value={formData.description}
          onChange={handleChange}
          placeholder="Ceritakan tentang toko Anda\u2026"
          className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-200"
        />
      </div>

      {/* Location — Kabupaten/Kecamatan */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Lokasi (Jawa Tengah)
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <select
            name="kabupaten"
            value={formData.kabupaten}
            onChange={handleChange}
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 transition-colors focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-200"
          >
            <option value="">Pilih Kabupaten/Kota\u2026</option>
            {kabupatenList.map((kab) => (
              <option key={kab} value={kab}>{kab}</option>
            ))}
          </select>
          <select
            name="kecamatan"
            value={formData.kecamatan}
            onChange={handleChange}
            disabled={!formData.kabupaten}
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 transition-colors focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-200 disabled:opacity-50"
          >
            <option value="">Pilih Kecamatan\u2026</option>
            {kecamatanList.map((kec) => (
              <option key={kec} value={kec}>{kec}</option>
            ))}
          </select>
        </div>
        {formData.location && (
          <p className="text-xs text-gray-500">📍 {formData.location}</p>
        )}
      </div>

      {/* Image — toggle URL / Upload */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Gambar Toko
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

      <Input
        label="Nomor WhatsApp (wajib untuk checkout)"
        name="whatsapp"
        type="tel"
        value={formData.whatsapp}
        onChange={handleChange}
        placeholder="08123456789"
        required
      />
      <p className="-mt-3 text-xs text-gray-500">
        Format: 08xxx (tanpa spasi). Pelanggan akan menghubungi nomor ini untuk checkout.
      </p>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full"
        size="lg"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            Menyimpan\u2026
          </>
        ) : (
          <>
            <Save className="h-4 w-4" aria-hidden="true" />
            {isEditing ? "Simpan Perubahan" : "Buat Toko"}
          </>
        )}
      </Button>
    </form>
  );
}
