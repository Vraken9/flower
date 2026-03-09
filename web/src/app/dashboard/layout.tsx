"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Store,
  PlusCircle,
  ArrowLeft,
  Users,
  FileText,
  Shield,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { useAuth } from "@/lib/contexts/auth.context";

// Sidebar links for owner
const ownerLinks = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/products", label: "Produk", icon: Package },
  { href: "/dashboard/products/new", label: "Tambah Produk", icon: PlusCircle },
  { href: "/dashboard/shop", label: "Profil Toko", icon: Store },
];

// Sidebar links for admin
const adminLinks = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/shops", label: "Kelola Toko", icon: Store },
  { href: "/dashboard/products/admin-new", label: "Tambah Produk", icon: PlusCircle },
  { href: "/dashboard/applications", label: "Aplikasi Owner", icon: FileText },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user } = useAuth();
  
  const isAdmin = user?.role === "admin";
  const sidebarLinks = isAdmin ? adminLinks : ownerLinks;

  return (
    <ProtectedRoute allowedRoles={['owner', 'admin']} requireAuth={true}>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Back to Home */}
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-gray-500 transition-colors hover:text-rose-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2 rounded"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Kembali ke Beranda
        </Link>

        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Sidebar */}
          <aside className="w-full shrink-0 lg:w-56">
            <nav aria-label="Dashboard navigation">
              <ul className="flex gap-1 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-2 lg:flex-col lg:overflow-visible lg:snap-none lg:pb-0">
                {sidebarLinks.map((link) => {
                  const isActive =
                    pathname === link.href ||
                    (link.href !== "/dashboard" &&
                      pathname.startsWith(link.href));

                  return (
                    <li key={link.href} className="snap-start">
                      <Link
                        href={link.href}
                        className={cn(
                          "flex items-center gap-2.5 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-medium transition-colors",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2",
                          isActive
                            ? "bg-rose-50 text-rose-600"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                        )}
                        aria-current={isActive ? "page" : undefined}
                      >
                        <link.icon
                          className="h-4 w-4 shrink-0"
                          aria-hidden="true"
                        />
                        {link.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </aside>

          {/* Content */}
          <div className="min-w-0 flex-1">{children}</div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
