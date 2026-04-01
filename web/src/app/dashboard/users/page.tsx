"use client";

import { useEffect, useState } from "react";
import {
  Users,
  Shield,
  ShieldCheck,
  User,
  ChevronDown,
  Loader2,
  ArrowDownCircle,
  Search,
} from "lucide-react";
import { ProtectedRoute } from "@/components/auth/protected-route";

interface UserProfile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: "user" | "owner" | "admin";
  created_at: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "user" | "owner" | "admin">("all");
  const [search, setSearch] = useState("");
  const [demoting, setDemoting] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users", { credentials: "include" });
      const data = await res.json();
      if (data.success) {
        setUsers(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDemote = async (userId: string, name: string) => {
    if (!confirm(`Yakin ingin menurunkan "${name || "User"}" dari Owner menjadi User?\n\nToko mereka akan dinonaktifkan.`)) {
      return;
    }

    setDemoting(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}/demote`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        // Update local state
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role: "user" as const } : u))
        );
      } else {
        alert(data.message || "Gagal menurunkan user");
      }
    } catch {
      alert("Terjadi kesalahan");
    } finally {
      setDemoting(null);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesFilter = filter === "all" || u.role === filter;
    const matchesSearch =
      !search ||
      (u.full_name || "").toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const roleConfig = {
    admin: {
      icon: Shield,
      label: "Admin",
      color: "bg-red-100 text-red-700",
    },
    owner: {
      icon: ShieldCheck,
      label: "Owner",
      color: "bg-blue-100 text-blue-700",
    },
    user: {
      icon: User,
      label: "User",
      color: "bg-gray-100 text-gray-700",
    },
  };

  const counts = {
    all: users.length,
    user: users.filter((u) => u.role === "user").length,
    owner: users.filter((u) => u.role === "owner").length,
    admin: users.filter((u) => u.role === "admin").length,
  };

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100">
            <Users className="h-5 w-5 text-rose-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Kelola Pengguna</h1>
            <p className="text-sm text-gray-500">
              {users.length} pengguna terdaftar
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-2">
            {(["all", "owner", "user", "admin"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  filter === f
                    ? "bg-rose-100 text-rose-700"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {f === "all" ? "Semua" : f.charAt(0).toUpperCase() + f.slice(1)}{" "}
                ({counts[f]})
              </button>
            ))}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama..."
              className="rounded-xl border border-gray-200 py-2 pl-9 pr-4 text-sm focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-100"
            />
          </div>
        </div>

        {/* User List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
            <p className="text-gray-500">Tidak ada pengguna ditemukan</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="px-5 py-3 text-left text-xs font-medium uppercase text-gray-500">
                    Pengguna
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium uppercase text-gray-500">
                    Role
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium uppercase text-gray-500">
                    Bergabung
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-medium uppercase text-gray-500">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredUsers.map((u) => {
                  const rc = roleConfig[u.role];
                  const RoleIcon = rc.icon;

                  return (
                    <tr key={u.id} className="hover:bg-gray-50">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-rose-100 text-sm font-medium text-rose-600">
                            {(u.full_name || "?").charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {u.full_name || "Tanpa Nama"}
                            </p>
                            <p className="text-xs text-gray-500 font-mono">
                              {u.id.slice(0, 8)}...
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${rc.color}`}
                        >
                          <RoleIcon className="h-3 w-3" />
                          {rc.label}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-500">
                        {new Date(u.created_at).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-5 py-4 text-right">
                        {u.role === "owner" && (
                          <button
                            onClick={() => handleDemote(u.id, u.full_name || "")}
                            disabled={demoting === u.id}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-orange-50 px-3 py-1.5 text-xs font-medium text-orange-700 transition-colors hover:bg-orange-100 disabled:opacity-50"
                          >
                            {demoting === u.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <ArrowDownCircle className="h-3.5 w-3.5" />
                            )}
                            Turunkan
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
