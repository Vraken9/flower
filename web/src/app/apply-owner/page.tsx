"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Store, Send, ArrowLeft, Clock, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/contexts/auth.context";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { formatDate } from "@/lib/utils";

type ApplicationStatus = "pending" | "approved" | "rejected" | null;

interface ExistingApplication {
  id: string;
  status: ApplicationStatus;
  shop_name: string;
  rejection_reason?: string;
  created_at: string;
  reviewed_at?: string;
}

export default function ApplyOwnerPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({
    shop_name: "",
    shop_description: "",
    shop_location: "",
    whatsapp: "",
    motivation: "",
  });
  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [existingApplication, setExistingApplication] = useState<ExistingApplication | null>(null);

  // Check if user already has an application
  useEffect(() => {
    const checkExistingApplication = async () => {
      try {
        const res = await fetch("/api/applications/my-status", {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          if (data.application) {
            setExistingApplication(data.application);
          }
        }
      } catch {
        // Ignore errors - user might not have an application
      } finally {
        setCheckingStatus(false);
      }
    };

    if (user) {
      checkExistingApplication();
    } else {
      setCheckingStatus(false);
    }
  }, [user]);

  // Redirect owner/admin to dashboard
  useEffect(() => {
    if (user?.role === "owner" || user?.role === "admin") {
      router.replace("/dashboard");
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.shop_name.trim()) {
      setError("Nama toko wajib diisi");
      return;
    }
    if (!form.whatsapp.trim()) {
      setError("Nomor WhatsApp wajib diisi");
      return;
    }
    // Validate WhatsApp format (must start with 08 or 62)
    let waNumber = form.whatsapp.trim().replace(/\D/g, "");
    if (waNumber.startsWith("08")) {
      // Convert 08xxx to 62xxx for WhatsApp API
      waNumber = "62" + waNumber.substring(1);
    }
    if (!waNumber.startsWith("62") || waNumber.length < 10) {
      setError("Nomor WhatsApp harus diawali 08 atau 62 dan minimal 10 digit");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
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

  // Loading state while checking existing application
  if (checkingStatus) {
    return (
      <ProtectedRoute allowedRoles={["user"]}>
        <div className="mx-auto max-w-lg px-4 py-16 text-center">
          <div className="animate-pulse">
            <div className="mx-auto h-16 w-16 rounded-full bg-gray-200" />
            <div className="mt-4 h-6 w-48 mx-auto bg-gray-200 rounded" />
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  // Show existing application status
  if (existingApplication) {
    const statusConfig = {
      pending: {
        icon: Clock,
        color: "text-yellow-600",
        bgColor: "bg-yellow-100",
        title: "Aplikasi Sedang Ditinjau",
        description: "Aplikasi Anda sedang ditinjau oleh admin. Mohon tunggu konfirmasi.",
      },
      approved: {
        icon: CheckCircle,
        color: "text-green-600",
        bgColor: "bg-green-100",
        title: "Aplikasi Disetujui!",
        description: "Selamat! Aplikasi Anda telah disetujui. Silakan masuk ke dashboard untuk mengelola toko Anda.",
      },
      rejected: {
        icon: XCircle,
        color: "text-red-600",
        bgColor: "bg-red-100",
        title: "Aplikasi Ditolak",
        description: existingApplication.rejection_reason || "Maaf, aplikasi Anda tidak dapat disetujui saat ini.",
      },
    };

    const status = statusConfig[existingApplication.status || "pending"];
    const Icon = status.icon;

    return (
      <ProtectedRoute allowedRoles={["user"]}>
        <div className="mx-auto max-w-lg px-4 py-16 text-center">
          <div className={`mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full ${status.bgColor}`}>
            <Icon className={`h-8 w-8 ${status.color}`} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{status.title}</h1>
          <p className="mt-2 text-gray-600">{status.description}</p>
          
          <div className="mt-6 rounded-xl bg-gray-50 p-4 text-left">
            <h3 className="text-sm font-medium text-gray-700">Detail Aplikasi:</h3>
            <div className="mt-2 space-y-1 text-sm text-gray-600">
              <p><span className="font-medium">Nama Toko:</span> {existingApplication.shop_name}</p>
              <p><span className="font-medium">Tanggal Pengajuan:</span> {formatDate(existingApplication.created_at)}</p>
              {existingApplication.reviewed_at && (
                <p><span className="font-medium">Tanggal Review:</span> {formatDate(existingApplication.reviewed_at)}</p>
              )}
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3">
            {existingApplication.status === "approved" ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-500 px-6 py-3 text-sm font-medium text-white hover:bg-rose-600"
              >
                <Store className="h-4 w-4" />
                Buka Dashboard
              </Link>
            ) : (
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-500 px-6 py-3 text-sm font-medium text-white hover:bg-rose-600"
              >
                Kembali ke Beranda
              </Link>
            )}
          </div>
        </div>
      </ProtectedRoute>
    );
  }

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
              Nomor WhatsApp <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={form.whatsapp}
              onChange={(e) =>
                setForm({ ...form, whatsapp: e.target.value })
              }
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-200"
              placeholder="08123456789"
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              Format: 08xxx (tanpa spasi). Pelanggan akan menghubungi nomor ini untuk checkout.
            </p>
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
