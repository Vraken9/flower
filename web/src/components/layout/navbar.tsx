"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  Search,
  ShoppingCart,
  Menu,
  X,
  Flower2,
  LayoutDashboard,
  User,
  LogOut,
  LogIn,
  UserPlus,
  Settings,
  Heart,
  Store,
} from "lucide-react";
import { useCartStore } from "@/lib/store/cart";
import { useAuth } from "@/lib/contexts/auth.context";
import { useFavorites } from "@/lib/contexts/favorites.context";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const totalItemsRaw = useCartStore((s) => s.totalItems());
  const { user, logout, loading, hasPermission } = useAuth();
  const { getFavoriteCount } = useFavorites();
  
  const favoriteCountRaw = getFavoriteCount();

  // Prevent hydration mismatch - only show counts after mount
  const totalItems = mounted ? totalItemsRaw : 0;
  const favoriteCount = mounted ? favoriteCountRaw : 0;

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional for hydration fix
    setMounted(true);
  }, []);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setUserMenuOpen(false)
    }
    
    if (userMenuOpen) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [userMenuOpen])

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen])

  const navLinks = [
    { href: "/", label: "Beranda" },
    { href: "/products", label: "Produk" },
    { href: "/shops", label: "Toko" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-rose-100 bg-white/80 backdrop-blur-lg">
      <nav
        className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8"
        aria-label="Navigasi utama"
      >
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 text-xl font-bold text-rose-600 transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2 rounded-lg"
        >
          <Flower2 className="h-6 w-6" aria-hidden="true" />
          <span>Bloom</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-rose-50 hover:text-rose-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-2 md:flex">
          <Link
            href="/products"
            className="rounded-xl p-2.5 text-gray-500 transition-colors hover:bg-rose-50 hover:text-rose-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2"
            aria-label="Cari produk"
          >
            <Search className="h-5 w-5" aria-hidden="true" />
          </Link>

          {/* Cart - only show for regular users */}
          {user && user.role === 'user' && (
            <Link
              href="/cart"
              className="relative rounded-xl p-2.5 text-gray-500 transition-colors hover:bg-rose-50 hover:text-rose-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2"
              aria-label={`Keranjang belanja, ${totalItems} item`}
            >
              <ShoppingCart className="h-5 w-5" aria-hidden="true" />
              {totalItems > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                  {totalItems}
                </span>
              )}
            </Link>
          )}

          {/* Favorites - only show for regular users */}
          {user && user.role === 'user' && (
            <Link
              href="/favorites"
              className="relative rounded-xl p-2.5 text-gray-500 transition-colors hover:bg-rose-50 hover:text-rose-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2"
              aria-label={`Favorit, ${favoriteCount} produk`}
            >
              <Heart className="h-5 w-5" aria-hidden="true" />
              {favoriteCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                  {favoriteCount}
                </span>
              )}
            </Link>
          )}

          {/* Auth Actions */}
          {loading ? (
            <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200" />
          ) : user ? (
            <div className="relative">
              {/* Jadi Penjual - regular users only */}
              {user.role === 'user' && (
                <Link
                  href="/apply-owner"
                  className="mr-2 inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2"
                >
                  <Store className="h-4 w-4" aria-hidden="true" />
                  Jadi Penjual
                </Link>
              )}

              {/* Dashboard - show based on permissions */}
              {hasPermission('canViewDashboard') && (
                <Link
                  href="/dashboard"
                  className="mr-2 inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-rose-50 hover:text-rose-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2"
                >
                  <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
                  {user.role === 'admin' ? 'Admin' : 'Dashboard'}
                </Link>
              )}

              {/* User Menu */}
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="inline-flex items-center gap-2 rounded-xl bg-rose-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-rose-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2"
              >
                <User className="h-4 w-4" aria-hidden="true" />
                {user.full_name.split(' ')[0]}
              </button>

              {/* User Dropdown */}
              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 rounded-lg border border-gray-200 bg-white shadow-lg">
                  <div className="p-3 border-b border-gray-100">
                    <p className="font-medium text-sm text-gray-900">{user.full_name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                    <p className="text-xs font-medium text-rose-600 mt-1 capitalize">
                      Role: {user.role}
                    </p>
                  </div>
                  <div className="p-2">
                    <Link
                      href="/profile"
                      className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <Settings className="h-4 w-4" />
                      Profil Saya
                    </Link>
                    <button
                      onClick={async () => {
                        setUserMenuOpen(false)
                        await logout()
                      }}
                      className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4" />
                      Keluar
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-rose-50 hover:text-rose-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2"
              >
                <LogIn className="h-4 w-4" aria-hidden="true" />
                Masuk
              </Link>
              <Link
                href="/auth/register"
                className="inline-flex items-center gap-2 rounded-xl bg-rose-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-rose-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2"
              >
                <UserPlus className="h-4 w-4" aria-hidden="true" />
                Daftar
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex items-center gap-2 md:hidden">
          {/* Cart - only show for regular users */}
          {user && user.role === 'user' && (
            <Link
              href="/cart"
              className="relative rounded-xl p-2 text-gray-500 transition-colors hover:bg-rose-50 hover:text-rose-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2"
              aria-label={`Keranjang belanja, ${totalItems} item`}
            >
              <ShoppingCart className="h-5 w-5" aria-hidden="true" />
              {totalItems > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                  {totalItems}
                </span>
              )}
            </Link>
          )}

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-xl p-2 text-gray-500 transition-colors hover:bg-rose-50 hover:text-rose-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2"
            aria-label={mobileMenuOpen ? "Tutup menu" : "Buka menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        className={cn(
          "transition-all duration-300 ease-in-out md:hidden",
          mobileMenuOpen ? "max-h-[80vh] overflow-y-auto border-t border-rose-100" : "max-h-0 overflow-hidden"
        )}
      >
        <div className="space-y-1 px-4 pb-4 pt-2">
          {/* Navigation Links */}
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block rounded-lg px-4 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-rose-50 hover:text-rose-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}

          {/* Auth-based Navigation */}
          {user ? (
            <>
              {/* Quick Actions for regular users only */}
              {user.role === 'user' && (
              <div className="border-t border-gray-200 pt-2 mt-2 space-y-1">
                <Link
                  href="/cart"
                  className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-rose-50 hover:text-rose-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <ShoppingCart className="h-4 w-4" aria-hidden="true" />
                  <span>Keranjang</span>
                  {totalItems > 0 && (
                    <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                      {totalItems}
                    </span>
                  )}
                </Link>

                <Link
                  href="/favorites"
                  className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-rose-50 hover:text-rose-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Heart className="h-4 w-4" aria-hidden="true" />
                  <span>Favorit</span>
                  {favoriteCount > 0 && (
                    <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                      {favoriteCount}
                    </span>
                  )}
                </Link>
              </div>
              )}

              {/* Jadi Penjual - regular users only (mobile) */}
              {user.role === 'user' && (
                <Link
                  href="/apply-owner"
                  className="flex items-center gap-2 rounded-lg bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Store className="h-4 w-4" aria-hidden="true" />
                  Jadi Penjual
                </Link>
              )}

              {/* Dashboard - show based on permissions */}
              {hasPermission('canViewDashboard') && (
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 rounded-lg bg-rose-50 px-4 py-2.5 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
                  {user.role === 'admin' ? 'Admin Panel' : 'Dashboard Toko'}
                </Link>
              )}

              <div className="border-t border-gray-200 pt-2 mt-2">
                <div className="px-4 py-2">
                  <p className="font-medium text-sm text-gray-900">{user.full_name}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                  <p className="text-xs font-medium text-rose-600 mt-1 capitalize">
                    Role: {user.role}
                  </p>
                </div>
                
                <Link
                  href="/profile"
                  className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Settings className="h-4 w-4" aria-hidden="true" />
                  Profil Saya
                </Link>
                
                <button
                  onClick={async () => {
                    setMobileMenuOpen(false)
                    await logout()
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2"
                >
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  Keluar
                </button>
              </div>
            </>
          ) : (
            <div className="border-t border-gray-200 pt-2 mt-2 space-y-1">
              <Link
                href="/auth/login"
                className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-rose-50 hover:text-rose-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <LogIn className="h-4 w-4" aria-hidden="true" />
                Masuk
              </Link>
              <Link
                href="/auth/register"
                className="flex items-center gap-2 rounded-lg bg-rose-50 px-4 py-2.5 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <UserPlus className="h-4 w-4" aria-hidden="true" />
                Daftar
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
