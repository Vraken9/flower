import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Syarat & Ketentuan",
  description: "Syarat dan Ketentuan penggunaan Bloom Flower Marketplace",
};

export default function SyaratKetentuanPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-rose-600 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke Beranda
      </Link>

      <h1 className="text-3xl font-bold text-gray-900 mb-4">Syarat & Ketentuan</h1>
      <p className="text-gray-500 text-sm mb-8">Terakhir diperbarui: Maret 2026</p>

      <div className="space-y-8">
        <section className="p-6 rounded-2xl bg-white shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Ketentuan Umum</h2>
          <p className="text-gray-600 leading-relaxed">
            Dengan menggunakan Bloom Flower Marketplace, Anda menyetujui syarat dan ketentuan ini.
            Bloom adalah platform yang menghubungkan pembeli dengan penjual bunga. Kami tidak bertindak
            sebagai penjual langsung, melainkan sebagai fasilitator transaksi.
          </p>
        </section>

        <section className="p-6 rounded-2xl bg-white shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Akun Pengguna</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-600">
            <li>Anda harus berusia minimal 17 tahun untuk mendaftar</li>
            <li>Informasi yang diberikan harus akurat dan terkini</li>
            <li>Anda bertanggung jawab menjaga kerahasiaan kata sandi</li>
            <li>Satu orang hanya boleh memiliki satu akun</li>
            <li>Akun tidak boleh diperjualbelikan atau dipindahtangankan</li>
          </ul>
        </section>

        <section className="p-6 rounded-2xl bg-white shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Ketentuan Pemilik Toko</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-600">
            <li>Pemilik toko wajib menyediakan nomor WhatsApp yang aktif</li>
            <li>Produk yang dijual harus sesuai dengan deskripsi dan foto</li>
            <li>Harga yang ditampilkan harus akurat (termasuk informasi biaya tambahan)</li>
            <li>Pemilik toko bertanggung jawab penuh atas kualitas produk dan layanan</li>
            <li>Dilarang menjual produk ilegal, palsu, atau melanggar hukum</li>
            <li>Bloom berhak menonaktifkan toko yang melanggar ketentuan</li>
          </ul>
        </section>

        <section className="p-6 rounded-2xl bg-white shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Transaksi & Pembayaran</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-600">
            <li>Semua transaksi dilakukan langsung antara pembeli dan penjual via WhatsApp</li>
            <li>Bloom tidak memproses atau menyimpan pembayaran</li>
            <li>Metode pembayaran disepakati antara pembeli dan penjual</li>
            <li>Bloom tidak bertanggung jawab atas sengketa pembayaran</li>
          </ul>
        </section>

        <section className="p-6 rounded-2xl bg-white shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Batasan Tanggung Jawab</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            Bloom Flower Marketplace:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-600">
            <li>Tidak menjamin ketersediaan produk</li>
            <li>Tidak bertanggung jawab atas kualitas produk dari penjual</li>
            <li>Tidak bertanggung jawab atas keterlambatan atau kegagalan pengiriman</li>
            <li>Tidak bertanggung jawab atas kerugian akibat transaksi dengan penjual</li>
          </ul>
        </section>

        <section className="p-6 rounded-2xl bg-white shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Konten Terlarang</h2>
          <p className="text-gray-600 leading-relaxed mb-4">Dilarang memposting:</p>
          <ul className="list-disc list-inside space-y-2 text-gray-600">
            <li>Konten yang melanggar hukum atau hak pihak lain</li>
            <li>Informasi palsu atau menyesatkan</li>
            <li>Spam atau konten promosi berlebihan</li>
            <li>Konten yang mengandung SARA, pornografi, atau kekerasan</li>
          </ul>
        </section>

        <section className="p-6 rounded-2xl bg-white shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Perubahan Ketentuan</h2>
          <p className="text-gray-600 leading-relaxed">
            Bloom berhak mengubah syarat dan ketentuan ini sewaktu-waktu. Perubahan akan
            diumumkan melalui platform. Dengan terus menggunakan layanan setelah perubahan,
            Anda dianggap menyetujui ketentuan yang baru.
          </p>
        </section>

        <section className="p-6 rounded-2xl bg-white shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Penyelesaian Sengketa</h2>
          <p className="text-gray-600 leading-relaxed">
            Sengketa antara pembeli dan penjual harus diselesaikan secara langsung antara kedua
            belah pihak. Bloom dapat membantu mediasi namun keputusan akhir tetap di tangan
            pihak yang bersengketa. Sengketa yang melibatkan platform akan diselesaikan sesuai
            hukum yang berlaku di Indonesia.
          </p>
        </section>

        <section className="p-6 rounded-2xl bg-rose-50 border border-rose-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">📧 Kontak</h2>
          <p className="text-gray-600 leading-relaxed">
            Untuk pertanyaan mengenai syarat dan ketentuan ini, hubungi kami di:
          </p>
          <p className="text-rose-600 font-medium mt-2">support@bloom.id</p>
        </section>
      </div>
    </div>
  );
}
