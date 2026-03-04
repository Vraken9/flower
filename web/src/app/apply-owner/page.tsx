"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Store, Send, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/contexts/auth.context";
import { ProtectedRoute } from "@/components/auth/protected-route";

export default function ApplyOwnerPage() {
  const { user, session } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({
    shop_name: "",
    shop_description: "",
    shop_location: "",
    motivation: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.shop_name.trim()) {
      setError("Nama toko wajib diisi");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Gagal mengirim aplikasi");
        return;
      }

      setSuccess(true);
    } catch {
      setError("Terjadi kesalahan jaringan");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <ProtectedRoute allowedRoles={["user"]}>
        <div className="mx-auto max-w-lg px-4 py-16 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <Store className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Aplikasi Terkirim!
          </h1>
          <p className="mt-2 text-gray-600">
            Aplikasi Anda akan ditinjau oleh admin. Anda akan mendapatkan
            notifikasi setelah disetujui.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-rose-500 px-6 py-3 text-sm font-medium text-white hover:bg-rose-600"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={["user"]}>
      <div className="mx-auto max-w-lg px-4 py-8">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-rose-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali
        </Link>

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Daftar Sebagai Pemilik Toko
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Isi formulir di bawah untuk mengajukan permohonan menjadi pemilik
            toko di Bloom Marketplace.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Nama Toko <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.shop_name}
              onChange={(e) =>
                setForm({ ...form, shop_name: e.target.value })
              }
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-200"
              placeholder="cth. Toko Bunga Mawar"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Deskripsi Toko
            </label>
            <textarea
              value={form.shop_description}
              onChange={(e) =>
                setForm({ ...form, shop_description: e.target.value })
              }
              rows={3}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-200"
              placeholder="Ceritakan tentang toko Anda..."
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Lokasi
            </label>
            <input
              type="text"
              value={form.shop_location}
              onChange={(e) =>
                setForm({ ...form, shop_location: e.target.value })
              }
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-200"
              placeholder="cth. Jakarta Selatan"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Motivasi
            </label>
            <textarea
              value={form.motivation}
              onChange={(e) =>
                setForm({ ...form, motivation: e.target.value })
              }
              rows={3}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-200"
              placeholder="Mengapa Anda ingin berjualan di Bloom?"
            />
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-rose-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-rose-600 disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
            {loading ? "Mengirim..." : "Kirim Aplikasi"}
          </button>
        </form>
      </div>
    </ProtectedRoute>
  );
}
