"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Package, Store, Eye, Heart, ShoppingCart, MessageCircle, Calendar } from "lucide-react";
import { useAuth } from "@/lib/contexts/auth.context";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const PIE_COLORS = ["#f43f5e", "#3b82f6", "#10b981", "#f59e0b"];

const TIMEFRAME_OPTIONS = [
  { value: "7d", label: "7 Hari" },
  { value: "14d", label: "14 Hari" },
  { value: "30d", label: "30 Hari" },
  { value: "90d", label: "90 Hari" },
  { value: "all", label: "Semua Waktu" },
];

interface TopProduct {
  id: string;
  name: string;
  image_url: string | null;
  views: number;
  favorites: number;
  cart_adds: number;
}

interface DashboardStatsData {
  totalProducts: number;
  totalWhatsAppClicks: number;
  totalShopViews: number;
  totalProductViews: number;
  totalFavorites: number;
  totalCartItems: number;
  topProducts: TopProduct[];
  periodDays: number | null;
}

interface DashboardStatsProps {
  totalProducts: number;
  totalShops: number;
}

export function DashboardStats({ totalProducts, totalShops }: DashboardStatsProps) {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState("all");

  const fetchStats = useCallback(async (tf: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/owner/dashboard-stats?timeframe=${tf}`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setStats(data.stats);
        }
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats(timeframe);
  }, [timeframe, fetchStats]);

  const isAdmin = user?.role === "admin";

  const mainCards = [
    {
      label: "Total Produk",
      value: stats?.totalProducts ?? totalProducts,
      icon: Package,
      href: "/dashboard/products",
      color: "bg-rose-50 text-rose-500",
    },
    {
      label: "Klik WhatsApp",
      value: stats?.totalWhatsAppClicks ?? 0,
      icon: MessageCircle,
      href: "/dashboard",
      color: "bg-green-50 text-green-500",
    },
    {
      label: "Kunjungan Toko",
      value: stats?.totalShopViews ?? 0,
      icon: Store,
      href: "/dashboard/shop",
      color: "bg-amber-50 text-amber-500",
    },
    {
      label: "Klik Produk",
      value: stats?.totalProductViews ?? 0,
      icon: Eye,
      href: "/dashboard/products",
      color: "bg-blue-50 text-blue-500",
    },
  ];

  const engagementCards = [
    {
      label: "Difavoritkan",
      value: stats?.totalFavorites ?? 0,
      icon: Heart,
      color: "bg-pink-50 text-pink-500",
    },
    {
      label: "Masuk Keranjang",
      value: stats?.totalCartItems ?? 0,
      icon: ShoppingCart,
      color: "bg-purple-50 text-purple-500",
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse rounded-2xl bg-white p-5 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-gray-200" />
                <div className="space-y-2">
                  <div className="h-3 w-20 rounded bg-gray-200" />
                  <div className="h-6 w-12 rounded bg-gray-200" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Timeframe Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          Statistik {TIMEFRAME_OPTIONS.find(o => o.value === timeframe)?.label || ""}
        </h2>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-400" />
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-200"
          >
            {TIMEFRAME_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {mainCards.map((card) => (
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

      {/* Engagement Stats */}
      <div className="grid gap-4 sm:grid-cols-2">
        {engagementCards.map((card) => (
          <div
            key={card.label}
            className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm"
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
          </div>
        ))}
      </div>

      {/* Engagement Pie Chart */}
      {stats && (() => {
        const pieData = [
          { name: "Klik Produk", value: stats.totalProductViews, color: PIE_COLORS[0] },
          { name: "Difavoritkan", value: stats.totalFavorites, color: PIE_COLORS[1] },
          { name: "Masuk Keranjang", value: stats.totalCartItems, color: PIE_COLORS[2] },
          { name: "Klik WhatsApp", value: stats.totalWhatsAppClicks, color: PIE_COLORS[3] },
        ].filter(d => d.value > 0);

        if (pieData.length === 0) return null;

        return (
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <h3 className="mb-4 text-sm font-medium text-gray-700">
              Distribusi Interaksi
            </h3>
            <div className="grid gap-4 sm:grid-cols-2 items-center">
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={75}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        borderRadius: "12px",
                        border: "1px solid #e5e7eb",
                        fontSize: "12px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-3">
                {pieData.map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-gray-600">{item.name}</span>
                    </div>
                    <span className="font-semibold text-gray-900">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Top Products */}
      {stats?.topProducts && stats.topProducts.length > 0 && (
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-medium text-gray-700">
            Produk Terpopuler
          </h3>
          <div className="space-y-3">
            {stats.topProducts.map((product, index) => (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className="flex items-center gap-4 rounded-xl p-2 transition-colors hover:bg-gray-50"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-xs font-medium text-gray-600">
                  {index + 1}
                </span>
                <div className="relative h-10 w-10 overflow-hidden rounded-lg bg-rose-50">
                  {product.image_url ? (
                    <Image
                      src={product.image_url}
                      alt={product.name}
                      fill
                      sizes="40px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm">
                      🌸
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-gray-800">
                    {product.name}
                  </p>
                  <div className="flex gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" /> {product.views}
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="h-3 w-3" /> {product.favorites}
                    </span>
                    <span className="flex items-center gap-1">
                      <ShoppingCart className="h-3 w-3" /> {product.cart_adds}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Admin Only: Total Shops */}
      {isAdmin && (
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-500">
              <Store className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Total Toko (Admin)</p>
              <p className="text-2xl font-bold text-gray-900">{totalShops}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
