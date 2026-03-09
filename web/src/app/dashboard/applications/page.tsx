"use client";

import { useEffect, useState } from "react";
import { CheckCircle, XCircle, Clock, User, MapPin, MessageSquare } from "lucide-react";
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
  whatsapp: string | null;
  status: "pending" | "approved" | "rejected";
  rejection_reason: string | null;
  created_at: string;
  profiles?: {
    full_name: string;
  } | null;
}

export default function AdminApplicationsPage() {
  const { session } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");

  useEffect(() => {
    if (session) fetchApplications();
  }, [session]);

  const fetchApplications = async () => {
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
        headers: { "Content-Type": "application/json" },
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
      pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
      approved: "bg-green-100 text-green-700 border-green-200",
      rejected: "bg-red-100 text-red-700 border-red-200",
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

  const filteredApplications = applications.filter(app => 
    filter === "all" ? true : app.status === filter
  );

  const pendingCount = applications.filter(a => a.status === "pending").length;

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Aplikasi Owner</h1>
          <p className="text-sm text-gray-500">
            {pendingCount > 0 
              ? `${pendingCount} aplikasi menunggu persetujuan`
              : "Tidak ada aplikasi pending"
            }
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6 flex gap-2">
          {[
            { value: "pending", label: "Pending", count: applications.filter(a => a.status === "pending").length },
            { value: "approved", label: "Disetujui", count: applications.filter(a => a.status === "approved").length },
            { value: "rejected", label: "Ditolak", count: applications.filter(a => a.status === "rejected").length },
            { value: "all", label: "Semua", count: applications.length },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value as typeof filter)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                filter === tab.value
                  ? "bg-rose-500 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 animate-pulse rounded-2xl bg-gray-100" />
            ))}
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center">
            <User className="mx-auto h-12 w-12 text-gray-300" />
            <p className="mt-3 text-gray-500">
              {filter === "pending" 
                ? "Tidak ada aplikasi pending" 
                : "Tidak ada aplikasi"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredApplications.map((app) => (
              <div
                key={app.id}
                className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{app.shop_name}</h3>
                    {app.shop_location && (
                      <p className="flex items-center gap-1 text-sm text-gray-500">
                        <MapPin className="h-3.5 w-3.5" />
                        {app.shop_location}
                      </p>
                    )}
                  </div>
                  {statusBadge(app.status)}
                </div>

                {app.shop_description && (
                  <p className="mt-2 text-sm text-gray-600">{app.shop_description}</p>
                )}

                {app.motivation && (
                  <div className="mt-3 rounded-lg bg-gray-50 p-3">
                    <p className="text-xs font-medium text-gray-500 mb-1">Motivasi:</p>
                    <p className="text-sm text-gray-700">{app.motivation}</p>
                  </div>
                )}

                <div className="mt-3 flex flex-wrap gap-3 text-xs text-gray-500">
                  {app.whatsapp && (
                    <span className="flex items-center gap-1">
                      <MessageSquare className="h-3.5 w-3.5" />
                      {app.whatsapp}
                    </span>
                  )}
                  <span>Diajukan: {formatDate(app.created_at)}</span>
                </div>

                {app.status === "rejected" && app.rejection_reason && (
                  <div className="mt-3 rounded-lg bg-red-50 p-3">
                    <p className="text-xs font-medium text-red-600">Alasan penolakan:</p>
                    <p className="text-sm text-red-700">{app.rejection_reason}</p>
                  </div>
                )}

                {/* Actions for pending applications */}
                {app.status === "pending" && (
                  <div className="mt-4 border-t border-gray-100 pt-4">
                    {rejectingId === app.id ? (
                      <div className="space-y-3">
                        <textarea
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          placeholder="Alasan penolakan (opsional)..."
                          className="w-full rounded-lg border border-gray-200 p-3 text-sm focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-100"
                          rows={2}
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleReview(app.id, "reject", rejectReason)}
                            disabled={actionLoading === app.id}
                            className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 disabled:opacity-50"
                          >
                            Konfirmasi Tolak
                          </button>
                          <button
                            onClick={() => {
                              setRejectingId(null);
                              setRejectReason("");
                            }}
                            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
                          >
                            Batal
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleReview(app.id, "approve")}
                          disabled={actionLoading === app.id}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-green-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-600 disabled:opacity-50"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Setujui
                        </button>
                        <button
                          onClick={() => setRejectingId(app.id)}
                          disabled={actionLoading === app.id}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-100 disabled:opacity-50"
                        >
                          <XCircle className="h-4 w-4" />
                          Tolak
                        </button>
                      </div>
                    )}
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
