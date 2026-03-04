import Link from "next/link";
import { Flower2 } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-rose-100 bg-rose-50/50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-lg font-bold text-rose-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2 rounded-lg"
            >
              <Flower2 className="h-5 w-5" aria-hidden="true" />
              <span>Bloom</span>
            </Link>
            <p className="text-sm leading-relaxed text-gray-500">
              Marketplace bunga terpercaya. Temukan rangkaian bunga terindah
              untuk setiap momen spesial Anda.
            </p>
          </div>

          {/* Navigasi */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-gray-900" style={{ textWrap: "balance" }}>
              Navigasi
            </h3>
            <ul className="space-y-2">
              {[
                { href: "/", label: "Beranda" },
                { href: "/products", label: "Semua Produk" },
                { href: "/shops", label: "Daftar Toko" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-500 transition-colors hover:text-rose-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2 rounded"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Untuk Penjual */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-gray-900" style={{ textWrap: "balance" }}>
              Untuk Penjual
            </h3>
            <ul className="space-y-2">
              {[
                { href: "/dashboard", label: "Dashboard" },
                { href: "/dashboard/products", label: "Kelola Produk" },
                { href: "/dashboard/products/new", label: "Tambah Produk" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-500 transition-colors hover:text-rose-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2 rounded"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Kontak */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-gray-900" style={{ textWrap: "balance" }}>
              Hubungi Kami
            </h3>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>support@bloom.id</li>
              <li>+62&nbsp;812&nbsp;3456&nbsp;7890</li>
              <li>Senin&nbsp;&ndash;&nbsp;Jumat, 09:00&nbsp;&ndash;&nbsp;17:00</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-rose-100 pt-6 text-center text-xs text-gray-400">
          &copy; {new Date().getFullYear()} Bloom Flower Marketplace. Semua hak dilindungi.
        </div>
      </div>
    </footer>
  );
}
