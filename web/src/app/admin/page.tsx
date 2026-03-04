"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Store,
  Package,
  Users,
  FileText,
  Shield,
  ArrowLeft,
} from "lucide-react";
import { useAuth } from "@/lib/contexts/auth.context";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { createClient } from "@/lib/supabase/client";

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    shops: 0,
    products: 0,
    pendingApps: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      const supabase = createClient();
      const [shopsRes, productsRes] = await Promise.all([
        supabase.from("shops").select("id", { count: "exact", head: true }),
        supabase.from("products").select("id", { count: "exact", head: true }),
      ]);
      setStats({
        shops: shopsRes.count || 0,
        products: productsRes.count || 0,
        pendingApps: 0,
      });
    };
    fetchStats();
  }, []);

  const adminCards = [
    {
      label: "Total Toko",
      value: stats.shops,
      icon: Store,
      href: "/admin/shops",
      color: "bg-emerald-50 text-emerald-500",
    },
    {
      label: "Total Produk",
      value: stats.products,
      icon: Package,
      href: "/dashboard/products",
      color: "bg-blue-50 text-blue-500",
    },
    {
      label: "Aplikasi Owner",
      value: "Kelola",
      icon: FileText,
      href: "/admin/applications",
      color: "bg-amber-50 text-amber-500",
    },
  ];

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="mx-auto max-w-4xl px-4 py-8">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-rose-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Beranda
        </Link>

        <div className="mb-8 flex items-center gap-3">
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

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {adminCards.map((card) => (
            <Link
              key={card.label}
              href={card.href}
              className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${card.color}`}
              >
                <card.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs text-gray-500">{card.label}</p>
                <p className="text-lg font-bold text-gray-900">{card.value}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </ProtectedRoute>
  );
}
