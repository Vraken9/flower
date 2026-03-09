"use client";

import { useEffect, useState } from "react";
import { CheckCircle, XCircle, Clock, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/contexts/auth.context";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { formatDate } from "@/lib/utils";

interface Application {
  id: string;
  user_id: string;
  shop_name: string;
  shop_description: string | null;
  shop_location: string | null;
  motivation: string | null;
  status: "pending" | "approved" | "rejected";
  rejection_reason: string | null;
  created_at: string;
}

export default function AdminApplicationsPage() {
  const { session } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectingId, setRejectingId] = useState<string | null>(null);

  useEffect(() => {
    fetchApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fetch only on session change
  }, [session]);

  const fetchApplications = async () => {
    if (!session) return;
    try {
      const res = await fetch("/api/applications", {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) setApplications(data.data || []);
    } catch (err) {
      console.error("Failed to load applications:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (
    id: string,
    action: "approve" | "reject",
    rejectionReason?: string
  ) => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/applications/${id}/review`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action, rejection_reason: rejectionReason }),
      });

      const data = await res.json();
      if (data.success) {
        await fetchApplications();
        setRejectingId(null);
        setRejectReason("");
      }
    } catch (err) {
      console.error("Review failed:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const statusBadge = (status: Application["status"]) => {
    const styles = {
      pending:
        "bg-yellow-100 text-yellow-700 border-yellow-200",
      approved:
        "bg-green-100 text-green-700 border-green-200",
      rejected:
        "bg-red-100 text-red-700 border-red-200",
    };
    const icons = {
      pending: <Clock className="h-3.5 w-3.5" />,
      approved: <CheckCircle className="h-3.5 w-3.5" />,
      rejected: <XCircle className="h-3.5 w-3.5" />,
    };
    const labels = { pending: "Menunggu", approved: "Disetujui", rejected: "Ditolak" };

    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${styles[status]}`}
      >
        {icons[status]}
        {labels[status]}
      </span>
    );
  };

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="mx-auto max-w-4xl px-4 py-8">
        <Link
          href="/dashboard"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-rose-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Dashboard
        </Link>

        <h1 className="mb-6 text-2xl font-bold text-gray-900">
          Aplikasi Pemilik Toko
        </h1>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-32 animate-pulse rounded-2xl bg-gray-100"
              />
            ))}
          </div>
        ) : applications.length === 0 ? (
          <p className="text-gray-500">Belum ada aplikasi.</p>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <div
                key={app.id}
                className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {app.shop_name}
                    </h3>
                    {app.shop_location && (
                      <p className="text-sm text-gray-500">{app.shop_location}</p>
                    )}
                  </div>
                  {statusBadge(app.status)}
                </div>

                {app.shop_description && (
                  <p className="mt-2 text-sm text-gray-600">
                    {app.shop_description}
                  </p>
                )}

                {app.motivation && (
                  <div className="mt-3 rounded-lg bg-gray-50 p-3">
                    <p className="text-xs font-medium text-gray-500">Motivasi:</p>
                    <p className="mt-1 text-sm text-gray-700">
                      {app.motivation}
                    </p>
                  </div>
                )}

                <p className="mt-3 text-xs text-gray-400">
                  Diajukan: {formatDate(app.created_at)}
                </p>

                {app.status === "pending" && (
                  <div className="mt-4 flex items-center gap-3">
                    <button
                      onClick={() => handleReview(app.id, "approve")}
                      disabled={actionLoading === app.id}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-green-500 px-4 py-2 text-sm font-medium text-white hover:bg-green-600 disabled:opacity-50"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Setujui
                    </button>

                    {rejectingId === app.id ? (
                      <div className="flex flex-1 items-center gap-2">
                        <input
                          type="text"
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          placeholder="Alasan penolakan..."
                          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200"
                        />
                        <button
                          onClick={() =>
                            handleReview(app.id, "reject", rejectReason)
                          }
                          disabled={actionLoading === app.id}
                          className="rounded-lg bg-red-500 px-3 py-2 text-sm font-medium text-white hover:bg-red-600 disabled:opacity-50"
                        >
                          Tolak
                        </button>
                        <button
                          onClick={() => {
                            setRejectingId(null);
                            setRejectReason("");
                          }}
                          className="text-sm text-gray-500 hover:text-gray-700"
                        >
                          Batal
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setRejectingId(app.id)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                      >
                        <XCircle className="h-4 w-4" />
                        Tolak
                      </button>
                    )}
                  </div>
                )}

                {app.status === "rejected" && app.rejection_reason && (
                  <div className="mt-3 rounded-lg bg-red-50 p-3">
                    <p className="text-xs font-medium text-red-500">
                      Alasan penolakan:
                    </p>
                    <p className="mt-1 text-sm text-red-700">
                      {app.rejection_reason}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
