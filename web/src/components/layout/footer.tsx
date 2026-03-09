import Link from "next/link";
import { Flower2, Mail, Phone, Clock, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-rose-100 bg-rose-50/50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-lg font-bold text-rose-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2 rounded-lg"
            >
              <Flower2 className="h-6 w-6" aria-hidden="true" />
              <span>Bloom</span>
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-gray-500 max-w-xs">
              Marketplace bunga terpercaya. Temukan rangkaian bunga terindah
              untuk setiap momen spesial Anda.
            </p>
          </div>

          {/* Navigasi */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-gray-900">
              Jelajahi
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/products" className="text-gray-500 hover:text-rose-600 transition-colors">
                  Semua Produk
                </Link>
              </li>
              <li>
                <Link href="/shops" className="text-gray-500 hover:text-rose-600 transition-colors">
                  Toko Bunga
                </Link>
              </li>
              <li>
                <Link href="/apply-owner" className="text-gray-500 hover:text-rose-600 transition-colors">
                  Buka Toko
                </Link>
              </li>
            </ul>
          </div>

          {/* Bantuan */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-gray-900">
              Bantuan
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/help/cara-belanja" className="text-gray-500 hover:text-rose-600 transition-colors">
                  Cara Belanja
                </Link>
              </li>
              <li>
                <Link href="/help/privasi" className="text-gray-500 hover:text-rose-600 transition-colors">
                  Kebijakan Privasi
                </Link>
              </li>
              <li>
                <Link href="/help/ketentuan" className="text-gray-500 hover:text-rose-600 transition-colors">
                  Syarat & Ketentuan
                </Link>
              </li>
            </ul>
          </div>

          {/* Kontak */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-gray-900">
              Hubungi Kami
            </h3>
            <ul className="space-y-3 text-sm text-gray-500">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-rose-400" aria-hidden="true" />
                <span>support@bloom.id</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-rose-400" aria-hidden="true" />
                <span>0812 3456 7890</span>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-rose-400" aria-hidden="true" />
                <span>Senin – Jumat, 09:00 – 17:00</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-rose-400 mt-0.5" aria-hidden="true" />
                <span>Jakarta, Indonesia</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-rose-100 pt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="text-xs text-gray-400" suppressHydrationWarning>
            &copy; {new Date().getFullYear()} Bloom Flower Marketplace. Semua hak dilindungi.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/help/privasi" className="text-xs text-gray-400 hover:text-rose-500 transition-colors">
              Privasi
            </Link>
            <Link href="/help/ketentuan" className="text-xs text-gray-400 hover:text-rose-500 transition-colors">
              Ketentuan
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
