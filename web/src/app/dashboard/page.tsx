import type { Metadata } from "next";
import Link from "next/link";
import { Package, Store, ShoppingCart, TrendingUp } from "lucide-react";
import { createServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Dashboard",
};

async function getDashboardStats() {
  const supabase = createServerClient();

  const [productsRes, shopsRes] = await Promise.all([
    supabase.from("products").select("id", { count: "exact", head: true }),
    supabase.from("shops").select("id", { count: "exact", head: true }),
  ]);

  return {
    totalProducts: productsRes.count || 0,
    totalShops: shopsRes.count || 0,
  };
}

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  const cards = [
    {
      label: "Total Produk",
      value: stats.totalProducts,
      icon: Package,
      href: "/dashboard/products",
      color: "bg-rose-50 text-rose-500",
    },
    {
      label: "Total Toko",
      value: stats.totalShops,
      icon: Store,
      href: "/dashboard/shop",
      color: "bg-amber-50 text-amber-500",
    },
    {
      label: "Pesanan Masuk",
      value: 0,
      icon: ShoppingCart,
      href: "/dashboard",
      color: "bg-blue-50 text-blue-500",
    },
    {
      label: "Pendapatan",
      value: "\u2013",
      icon: TrendingUp,
      href: "/dashboard",
      color: "bg-emerald-50 text-emerald-500",
    },
  ];

  return (
    <div>
      <h1
        className="mb-6 text-2xl font-bold text-gray-900"
        style={{ textWrap: "balance" }}
      >
        Dashboard Penjual
      </h1>

      <div className="grid gap-4 sm:grid-cols-2">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2"
          >
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${card.color}`}
            >
              <card.icon className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{card.label}</p>
              <p
                className="text-2xl font-bold text-gray-900"
                style={{ fontVariantNumeric: "tabular-nums" }}
              >
                {card.value}
              </p>
            </div>
          </Link>
        ))}
      </div>

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
