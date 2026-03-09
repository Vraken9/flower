import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Kebijakan Privasi",
  description: "Kebijakan Privasi Bloom Flower Marketplace",
};

export default function KebijakanPrivasiPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-rose-600 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke Beranda
      </Link>

      <h1 className="text-3xl font-bold text-gray-900 mb-4">Kebijakan Privasi</h1>
      <p className="text-gray-500 text-sm mb-8">Terakhir diperbarui: Maret 2026</p>

      <div className="prose prose-gray max-w-none">
        <div className="space-y-8">
          <section className="p-6 rounded-2xl bg-white shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Informasi yang Kami Kumpulkan</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Bloom Flower Marketplace mengumpulkan informasi yang Anda berikan secara langsung saat:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>Mendaftarkan akun (nama, email, kata sandi)</li>
              <li>Mendaftar sebagai pemilik toko (nama toko, lokasi, nomor WhatsApp)</li>
              <li>Menghubungi penjual melalui WhatsApp</li>
              <li>Menyimpan produk ke favorit atau keranjang</li>
            </ul>
          </section>

          <section className="p-6 rounded-2xl bg-white shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Penggunaan Informasi</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Informasi yang kami kumpulkan digunakan untuk:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>Menyediakan dan memelihara layanan marketplace</li>
              <li>Memproses pendaftaran akun dan verifikasi pemilik toko</li>
              <li>Menghubungkan pembeli dengan penjual</li>
              <li>Menampilkan statistik kunjungan kepada pemilik toko</li>
              <li>Meningkatkan pengalaman pengguna</li>
            </ul>
          </section>

          <section className="p-6 rounded-2xl bg-white shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Berbagi Informasi</h2>
            <p className="text-gray-600 leading-relaxed">
              Kami <strong>tidak menjual</strong> data pribadi Anda kepada pihak ketiga. Informasi Anda hanya
              dibagikan dengan:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600 mt-4">
              <li>Penjual (saat Anda menghubungi mereka via WhatsApp)</li>
              <li>Penyedia layanan teknis (hosting, database) untuk operasional platform</li>
              <li>Pihak berwenang jika diwajibkan oleh hukum</li>
            </ul>
          </section>

          <section className="p-6 rounded-2xl bg-white shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Keamanan Data</h2>
            <p className="text-gray-600 leading-relaxed">
              Kami menggunakan enkripsi dan praktik keamanan standar industri untuk melindungi data Anda.
              Kata sandi disimpan dalam bentuk terenkripsi dan tidak dapat diakses oleh siapa pun,
              termasuk tim kami.
            </p>
          </section>

          <section className="p-6 rounded-2xl bg-white shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Hak Anda</h2>
            <p className="text-gray-600 leading-relaxed mb-4">Anda memiliki hak untuk:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>Mengakses dan memperbarui informasi akun Anda</li>
              <li>Menghapus akun Anda kapan saja</li>
              <li>Meminta salinan data yang kami miliki tentang Anda</li>
              <li>Menolak penggunaan data untuk tujuan tertentu</li>
            </ul>
          </section>

          <section className="p-6 rounded-2xl bg-white shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Kontak</h2>
            <p className="text-gray-600 leading-relaxed">
              Jika Anda memiliki pertanyaan tentang kebijakan privasi ini, silakan hubungi kami di:
            </p>
            <p className="text-rose-600 font-medium mt-2">support@bloom.id</p>
          </section>
        </div>
      </div>
    </div>
  );
}
