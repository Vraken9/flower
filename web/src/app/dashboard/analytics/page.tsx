"use client";

import { useEffect, useState } from "react";
import {
  BarChart3,
  TrendingUp,
  Eye,
  MessageCircle,
  Store,
  Package,
  Users,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/lib/contexts/auth.context";
import { ProtectedRoute } from "@/components/auth/protected-route";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface AnalyticsData {
  totals: {
    shops: number;
    products: number;
    users: number;
    productViews: number;
    whatsappClicks: number;
  };
  dailyData: {
    date: string;
    fullDate: string;
    productViews: number;
    shopViews: number;
    whatsappClicks: number;
  }[];
  shopAnalytics: {
    id: string;
    name: string;
    products: number;
    productViews: number;
    whatsappClicks: number;
  }[];
  last30Days: {
    productViews: number;
    shopViews: number;
    whatsappClicks: number;
  };
}

const COLORS = ["#f43f5e", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899"];

export default function AnalyticsDashboardPage() {
  const { session } = useAuth();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session) fetchAnalytics();
  }, [session]);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch("/api/admin/analytics", { credentials: "include" });
      const result = await res.json();
      if (result.success) {
        setData(result.data);
      }
    } catch (err) {
      console.error("Failed to load analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={["admin"]}>
        <div className="flex min-h-[400px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
        </div>
      </ProtectedRoute>
    );
  }

  if (!data) {
    return (
      <ProtectedRoute allowedRoles={["admin"]}>
        <div className="text-center text-gray-500">Gagal memuat data analytics</div>
      </ProtectedRoute>
    );
  }

  const statCards = [
    {
      label: "Total Toko",
      value: data.totals.shops,
      icon: Store,
      color: "bg-emerald-50 text-emerald-500",
    },
    {
      label: "Total Produk",
      value: data.totals.products,
      icon: Package,
      color: "bg-blue-50 text-blue-500",
    },
    {
      label: "Total User",
      value: data.totals.users,
      icon: Users,
      color: "bg-purple-50 text-purple-500",
    },
    {
      label: "Total Views Produk",
      value: data.totals.productViews,
      icon: Eye,
      color: "bg-amber-50 text-amber-500",
    },
    {
      label: "Total Klik WhatsApp",
      value: data.totals.whatsappClicks,
      icon: MessageCircle,
      color: "bg-green-50 text-green-500",
    },
  ];

  // Prepare pie chart data for shop distribution
  const pieData = data.shopAnalytics.slice(0, 5).map((shop, index) => ({
    name: shop.name.length > 15 ? shop.name.substring(0, 15) + "..." : shop.name,
    value: shop.whatsappClicks || 1,
    color: COLORS[index % COLORS.length],
  }));

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100">
            <BarChart3 className="h-5 w-5 text-rose-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-sm text-gray-500">Statistik dan performa platform</p>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {statCards.map((card) => (
            <div
              key={card.label}
              className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm border border-gray-100"
            >
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${card.color}`}
              >
                <card.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs text-gray-500">{card.label}</p>
                <p className="text-xl font-bold text-gray-900">
                  {card.value.toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Last 30 Days Summary */}
        <div className="rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 p-6 text-white">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <TrendingUp className="h-5 w-5" />
            Ringkasan 30 Hari Terakhir
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl bg-white/20 p-4">
              <p className="text-sm text-white/80">Views Produk</p>
              <p className="text-2xl font-bold">{data.last30Days.productViews.toLocaleString()}</p>
            </div>
            <div className="rounded-xl bg-white/20 p-4">
              <p className="text-sm text-white/80">Views Toko</p>
              <p className="text-2xl font-bold">{data.last30Days.shopViews.toLocaleString()}</p>
            </div>
            <div className="rounded-xl bg-white/20 p-4">
              <p className="text-sm text-white/80">Klik WhatsApp</p>
              <p className="text-2xl font-bold">{data.last30Days.whatsappClicks.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Traffic Line Chart */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              Traffic 14 Hari Terakhir
            </h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.dailyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 11 }} 
                    tickLine={false}
                    axisLine={{ stroke: "#e5e7eb" }}
                  />
                  <YAxis 
                    tick={{ fontSize: 11 }} 
                    tickLine={false}
                    axisLine={{ stroke: "#e5e7eb" }}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "1px solid #e5e7eb",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="productViews"
                    name="Views Produk"
                    stroke="#f43f5e"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="shopViews"
                    name="Views Toko"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="whatsappClicks"
                    name="Klik WA"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* WhatsApp Clicks Bar Chart */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              Klik WhatsApp per Hari
            </h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.dailyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 11 }} 
                    tickLine={false}
                    axisLine={{ stroke: "#e5e7eb" }}
                  />
                  <YAxis 
                    tick={{ fontSize: 11 }} 
                    tickLine={false}
                    axisLine={{ stroke: "#e5e7eb" }}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "1px solid #e5e7eb",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Bar
                    dataKey="whatsappClicks"
                    name="Klik WhatsApp"
                    fill="#10b981"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Per-Shop Analytics */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Shop Performance Table */}
          <div className="lg:col-span-2 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              Performa Toko
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="pb-3 text-left text-xs font-medium uppercase text-gray-500">
                      Toko
                    </th>
                    <th className="pb-3 text-right text-xs font-medium uppercase text-gray-500">
                      Produk
                    </th>
                    <th className="pb-3 text-right text-xs font-medium uppercase text-gray-500">
                      Views
                    </th>
                    <th className="pb-3 text-right text-xs font-medium uppercase text-gray-500">
                      Klik WA
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data.shopAnalytics.slice(0, 10).map((shop, index) => (
                    <tr key={shop.id} className="hover:bg-gray-50">
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-xs font-medium text-gray-600">
                            {index + 1}
                          </span>
                          <span className="text-sm font-medium text-gray-900">
                            {shop.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 text-right text-sm text-gray-600">
                        {shop.products}
                      </td>
                      <td className="py-3 text-right text-sm text-gray-600">
                        {shop.productViews.toLocaleString()}
                      </td>
                      <td className="py-3 text-right">
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                          {shop.whatsappClicks}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {data.shopAnalytics.length === 0 && (
                <p className="py-8 text-center text-sm text-gray-500">
                  Belum ada data toko
                </p>
              )}
            </div>
          </div>

          {/* Distribution Pie Chart */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              Distribusi Klik WA
            </h3>
            {pieData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={2}
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
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-gray-500">
                Belum ada data
              </p>
            )}
            <div className="mt-4 space-y-2">
              {pieData.map((item, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-gray-600">{item.name}</span>
                  </div>
                  <span className="font-medium text-gray-900">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
