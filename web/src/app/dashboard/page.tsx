import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import {
  Shield,
  Store,
  FileText,
  Package,
  Users,
  UserCheck,
  BarChart3,
  AlertCircle,
  TrendingUp,
  Clock,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Dashboard",
};

async function getUserProfile() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;
  
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
    
  return profile;
}

async function getOwnerStats(userId: string) {
  const supabase = await createServerClient();
  
  // Get owner's shop
  const { data: shop } = await supabase
    .from("shops")
    .select("id")
    .eq("owner_id", userId)
    .single();
  
  if (!shop) {
    return { totalProducts: 0, totalShops: 0 };
  }
  
  const { count } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("shop_id", shop.id);
  
  return {
    totalProducts: count || 0,
    totalShops: 1,
  };
}

async function getAdminStats() {
  const supabase = await createServerClient();

  const [productsRes, shopsRes, pendingAppsRes, usersRes, ownersRes, recentAppsRes, lowStockRes] = await Promise.all([
    supabase.from("products").select("id", { count: "exact", head: true }),
    supabase.from("shops").select("id", { count: "exact", head: true }),
    supabase.from("applications").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "owner"),
    supabase.from("applications").select("id, shop_name, status, created_at").order("created_at", { ascending: false }).limit(5),
    supabase.from("products").select("id, name, stock").lt("stock", 5).order("stock", { ascending: true }).limit(5),
  ]);

  return {
    totalProducts: productsRes.count || 0,
    totalShops: shopsRes.count || 0,
    pendingApps: pendingAppsRes.count || 0,
    totalUsers: usersRes.count || 0,
    totalOwners: ownersRes.count || 0,
    recentApps: recentAppsRes.data || [],
    lowStockProducts: lowStockRes.data || [],
  };
}

export default async function DashboardPage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect("/auth/login");
  }
  
  const profile = await getUserProfile();
  const isAdmin = profile?.role === "admin";
  
  if (isAdmin) {
    const stats = await getAdminStats();
    
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100">
            <Shield className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Admin Dashboard
            </h1>
            <p className="text-sm text-gray-500">
              Ringkasan dan manajemen platform
            </p>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Link
            href="/dashboard/shops"
            className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm transition-shadow hover:shadow-md border border-gray-100"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-500">
              <Store className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Total Toko</p>
              <p className="text-lg font-bold text-gray-900">{stats.totalShops}</p>
            </div>
          </Link>

          <Link
            href="/dashboard/shops"
            className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm transition-shadow hover:shadow-md border border-gray-100"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-500">
              <Package className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Total Produk</p>
              <p className="text-lg font-bold text-gray-900">{stats.totalProducts}</p>
            </div>
          </Link>

          <Link
            href="/dashboard/applications"
            className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm transition-shadow hover:shadow-md border border-gray-100"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-500">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Aplikasi Pending</p>
              <p className="text-lg font-bold text-gray-900">{stats.pendingApps}</p>
            </div>
          </Link>

          <div className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm border border-gray-100">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-500">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Total Pengguna</p>
              <p className="text-lg font-bold text-gray-900">{stats.totalUsers}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm border border-gray-100">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-500">
              <UserCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Total Owner</p>
              <p className="text-lg font-bold text-gray-900">{stats.totalOwners}</p>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Applications */}
          <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                <Clock className="h-5 w-5 text-gray-400" />
                Aplikasi Terbaru
              </h2>
              <Link
                href="/dashboard/applications"
                className="text-sm text-rose-600 hover:underline"
              >
                Lihat Semua
              </Link>
            </div>
            {stats.recentApps.length > 0 ? (
              <div className="space-y-3">
                {stats.recentApps.map((app: { id: string; shop_name: string; status: string; created_at: string }) => (
                  <div key={app.id} className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{app.shop_name}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(app.created_at).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        app.status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : app.status === "approved"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {app.status === "pending" ? "Menunggu" : app.status === "approved" ? "Disetujui" : "Ditolak"}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Belum ada aplikasi</p>
            )}
          </div>

          {/* Low Stock Alert */}
          <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
            <div className="mb-4 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              <h2 className="text-lg font-semibold text-gray-800">
                Stok Rendah
              </h2>
            </div>
            {stats.lowStockProducts.length > 0 ? (
              <div className="space-y-3">
                {stats.lowStockProducts.map((product: { id: string; name: string; stock: number }) => (
                  <div key={product.id} className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
                    <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]">
                      {product.name}
                    </p>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      product.stock === 0
                        ? "bg-red-100 text-red-700"
                        : "bg-amber-100 text-amber-700"
                    }`}>
                      Stok: {product.stock}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Semua stok aman</p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="mb-4 text-lg font-semibold text-gray-800">
            Aksi Cepat
          </h2>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/dashboard/applications"
              className="inline-flex items-center gap-2 rounded-xl bg-rose-500 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-rose-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2"
            >
              <FileText className="h-4 w-4" />
              Review Aplikasi Owner
            </Link>
            <Link
              href="/dashboard/shops"
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2"
            >
              <Store className="h-4 w-4" />
              Kelola Toko
            </Link>
            <Link
              href="/dashboard/analytics"
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2"
            >
              <BarChart3 className="h-4 w-4" />
              Lihat Analytics
            </Link>
            <Link
              href="/dashboard/users"
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2"
            >
              <Users className="h-4 w-4" />
              Kelola Pengguna
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  // Owner dashboard
  const stats = await getOwnerStats(user.id);

  return (
    <div>
      <h1
        className="mb-6 text-2xl font-bold text-gray-900"
        style={{ textWrap: "balance" }}
      >
        Dashboard Penjual
      </h1>

      <DashboardStats
        totalProducts={stats.totalProducts}
        totalShops={stats.totalShops}
      />

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="mb-4 text-lg font-semibold text-gray-800">
          Aksi Cepat
        </h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/dashboard/products/new"
            className="inline-flex items-center gap-2 rounded-xl bg-rose-500 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-rose-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2"
          >
            Tambah Produk Baru
          </Link>
          <Link
            href="/dashboard/products"
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2"
          >
            Kelola Produk
          </Link>
        </div>
      </div>
    </div>
  );
}
