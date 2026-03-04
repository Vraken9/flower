"use client";

import { useState } from "react";
import { Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Shop } from "@/lib/types";

interface ShopFormProps {
  shop: Shop | null;
}

export function ShopForm({ shop }: ShopFormProps) {
  const isEditing = !!shop;

  const [formData, setFormData] = useState({
    name: shop?.name || "",
    description: shop?.description || "",
    location: shop?.location || "",
    image_url: shop?.image_url || "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      // TODO: Replace with server action when backend is ready
      const url = isEditing
        ? `http://localhost:3000/api/admin/shops/${shop.id}`
        : "http://localhost:3000/api/admin/shops";

      const res = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await res.json();

      if (result.success) {
        setMessage({
          type: "success",
          text: isEditing
            ? "Profil toko berhasil diperbarui!"
            : "Toko berhasil dibuat!",
        });
      } else {
        setMessage({ type: "error", text: "Gagal menyimpan. Coba lagi." });
      }
    } catch {
      setMessage({
        type: "error",
        text: "Pastikan server backend aktif.",
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
        placeholder="Contoh: Edelweis Senja\u2026"
        required
      />

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

      <Input
        label="Lokasi"
        name="location"
        value={formData.location}
        onChange={handleChange}
        placeholder="Contoh: Jakarta Selatan\u2026"
      />

      <Input
        label="URL Gambar Toko"
        name="image_url"
        type="url"
        value={formData.image_url}
        onChange={handleChange}
        placeholder="https://\u2026"
      />

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
