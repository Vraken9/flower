"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Star, Send, ArrowLeft, CheckCircle, Loader2 } from "lucide-react";

function ReviewForm() {
  const searchParams = useSearchParams();
  const productId = searchParams.get("product_id");
  const shopId = searchParams.get("shop_id");
  const productName = searchParams.get("product_name") || "Produk";
  const shopName = searchParams.get("shop_name") || "Toko";

  const [form, setForm] = useState({
    reviewer_name: "",
    rating: 0,
    comment: "",
  });
  const [hoveredStar, setHoveredStar] = useState(0);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.rating === 0) {
      setError("Pilih rating terlebih dahulu");
      return;
    }
    if (!form.reviewer_name.trim()) {
      setError("Nama harus diisi");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: productId || null,
          shop_id: shopId || null,
          reviewer_name: form.reviewer_name,
          rating: form.rating,
          comment: form.comment,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setSuccess(true);
      } else {
        setError(data.message || "Gagal mengirim review");
      }
    } catch {
      setError("Terjadi kesalahan jaringan");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-rose-50 to-pink-50 px-4">
        <div className="max-w-md w-full rounded-2xl bg-white p-8 text-center shadow-lg">
          <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
          <h1 className="mt-4 text-2xl font-bold text-gray-900">
            Terima Kasih!
          </h1>
          <p className="mt-2 text-gray-600">
            Review Anda telah berhasil dikirim. Kami sangat menghargai feedback
            Anda.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-rose-500 px-6 py-3 text-sm font-medium text-white hover:bg-rose-600"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50 px-4 py-10">
      <div className="mx-auto max-w-md">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-rose-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Beranda
        </Link>

        <div className="rounded-2xl bg-white p-6 shadow-lg sm:p-8">
          {/* Header */}
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-rose-100">
              <Star className="h-7 w-7 text-rose-500" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">Beri Review</h1>
            <p className="mt-1 text-sm text-gray-500">
              {productId
                ? `Review untuk "${decodeURIComponent(productName)}"`
                : `Review untuk toko "${decodeURIComponent(shopName)}"`}
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Nama */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Nama Anda <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.reviewer_name}
                onChange={(e) =>
                  setForm({ ...form, reviewer_name: e.target.value })
                }
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-200"
                placeholder="Nama Anda"
                required
              />
            </div>

            {/* Rating Stars */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Rating <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoveredStar(star)}
                    onMouseLeave={() => setHoveredStar(0)}
                    onClick={() => setForm({ ...form, rating: star })}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`h-8 w-8 ${
                        star <= (hoveredStar || form.rating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
              {form.rating > 0 && (
                <p className="mt-1 text-xs text-gray-500">
                  {form.rating === 1 && "Buruk"}
                  {form.rating === 2 && "Kurang"}
                  {form.rating === 3 && "Cukup"}
                  {form.rating === 4 && "Bagus"}
                  {form.rating === 5 && "Sangat Bagus"}
                </p>
              )}
            </div>

            {/* Comment */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Komentar (opsional)
              </label>
              <textarea
                value={form.comment}
                onChange={(e) =>
                  setForm({ ...form, comment: e.target.value })
                }
                rows={3}
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-200"
                placeholder="Ceritakan pengalaman Anda..."
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-rose-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-rose-600 disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              {loading ? "Mengirim..." : "Kirim Review"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

/**
 * Public review page — accessible via WhatsApp link
 * URL: /review?product_id=xxx&shop_id=xxx&product_name=xxx
 */
export default function ReviewPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
        </div>
      }
    >
      <ReviewForm />
    </Suspense>
  );
}
