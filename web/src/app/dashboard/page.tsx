import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { Shield, Store, FileText, Package } from "lucide-react";

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

  const [productsRes, shopsRes, pendingAppsRes] = await Promise.all([
    supabase.from("products").select("id", { count: "exact", head: true }),
    supabase.from("shops").select("id", { count: "exact", head: true }),
    supabase.from("applications").select("id", { count: "exact", head: true }).eq("status", "pending"),
  ]);

  return {
    totalProducts: productsRes.count || 0,
    totalShops: shopsRes.count || 0,
    pendingApps: pendingAppsRes.count || 0,
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
      <div>
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100">
            <Shield className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Admin Dashboard
            </h1>
            <p className="text-sm text-gray-500">
              Kelola toko, produk, dan aplikasi pemilik
            </p>
          </div>
        </div>

        {/* Admin Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="mb-4 text-lg font-semibold text-gray-800">
            Aksi Cepat
          </h2>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/dashboard/applications"
              className="inline-flex items-center gap-2 rounded-xl bg-rose-500 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-rose-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2"
            >
              Review Aplikasi Owner
            </Link>
            <Link
              href="/dashboard/shops"
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2"
            >
              Kelola Toko
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
