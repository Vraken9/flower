import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Search, ShoppingCart, MessageCircle, Heart, Store } from "lucide-react";

export const metadata: Metadata = {
  title: "Cara Belanja",
  description: "Panduan lengkap cara berbelanja di Bloom Flower Marketplace",
};

export default function CaraBelanjaPage() {
  const steps = [
    {
      icon: Search,
      title: "1. Jelajahi Produk",
      description:
        "Telusuri berbagai pilihan bunga segar dari toko-toko terpercaya. Gunakan filter kategori atau pencarian untuk menemukan bunga yang Anda inginkan.",
    },
    {
      icon: Heart,
      title: "2. Simpan Favorit",
      description:
        "Temukan bunga yang menarik? Klik tombol ❤️ untuk menyimpannya ke daftar favorit Anda agar mudah ditemukan kembali nanti.",
    },
    {
      icon: ShoppingCart,
      title: "3. Tambah ke Keranjang",
      description:
        "Pilih produk yang ingin dibeli dan klik 'Tambah ke Keranjang'. Anda dapat menambahkan beberapa produk sebelum checkout.",
    },
    {
      icon: MessageCircle,
      title: "4. Checkout via WhatsApp",
      description:
        "Klik tombol 'Pesan via WhatsApp' untuk langsung terhubung dengan pemilik toko. Anda akan diarahkan ke WhatsApp dengan pesan otomatis berisi detail produk.",
    },
    {
      icon: Store,
      title: "5. Konfirmasi & Pembayaran",
      description:
        "Diskusikan detail pesanan, alamat pengiriman, dan metode pembayaran langsung dengan penjual melalui WhatsApp. Pembayaran dilakukan sesuai kesepakatan dengan toko.",
    },
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-rose-600 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke Beranda
      </Link>

      <h1 className="text-3xl font-bold text-gray-900 mb-4">Cara Belanja di Bloom</h1>
      <p className="text-gray-600 mb-10">
        Belanja bunga di Bloom sangat mudah! Ikuti langkah-langkah berikut untuk mendapatkan
        rangkaian bunga impian Anda.
      </p>

      <div className="space-y-8">
        {steps.map((step, index) => (
          <div
            key={index}
            className="flex gap-4 p-6 rounded-2xl bg-white shadow-sm border border-gray-100"
          >
            <div className="flex-shrink-0 flex h-12 w-12 items-center justify-center rounded-xl bg-rose-100">
              <step.icon className="h-6 w-6 text-rose-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h2>
              <p className="text-gray-600 leading-relaxed">{step.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 p-6 rounded-2xl bg-rose-50 border border-rose-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">💡 Tips Belanja</h3>
        <ul className="space-y-2 text-gray-600">
          <li>• Periksa foto dan deskripsi produk dengan teliti sebelum memesan</li>
          <li>• Tanyakan ketersediaan stok kepada penjual sebelum melakukan pembayaran</li>
          <li>• Simpan bukti pembayaran dan percakapan dengan penjual</li>
          <li>• Berikan ulasan setelah menerima pesanan untuk membantu pembeli lain</li>
        </ul>
      </div>

      <div className="mt-8 text-center">
        <Link
          href="/products"
          className="inline-flex items-center gap-2 rounded-xl bg-rose-500 px-6 py-3 text-sm font-medium text-white hover:bg-rose-600 transition-colors"
        >
          <Search className="h-4 w-4" />
          Mulai Belanja Sekarang
        </Link>
      </div>
    </div>
  );
}
