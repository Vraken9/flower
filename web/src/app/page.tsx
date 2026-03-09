import Link from "next/link";
import { ArrowRight, Flower2, Truck, ShieldCheck, Star } from "lucide-react";
import { createServerClient } from "@/lib/supabase/server";
import { HeroSection } from "@/components/home/hero-section";
import { FeaturedProducts } from "@/components/home/featured-products";
import { FeaturedShops } from "@/components/home/featured-shops";
import type { ProductWithShop, Shop } from "@/lib/types";

// Force dynamic rendering - no caching
export const dynamic = "force-dynamic";
export const revalidate = 0;

async function getHomeData() {
  const supabase = await createServerClient();

  const [productsRes, shopsRes] = await Promise.all([
    supabase
      .from("products")
      .select("*, shops ( name )")
      .order("created_at", { ascending: false })
      .limit(8),
    supabase
      .from("shops")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(6),
  ]);

  // Debug logging
  console.log("[getHomeData] Products:", productsRes.data?.length, "Error:", productsRes.error);
  console.log("[getHomeData] Shops:", shopsRes.data?.length, "Error:", shopsRes.error);

  return {
    products: (productsRes.data as ProductWithShop[]) || [],
    shops: (shopsRes.data as Shop[]) || [],
  };
}

export default async function HomePage() {
  const { products, shops } = await getHomeData();

  return (
    <>
      {/* Hero */}
      <HeroSection />

      {/* Features */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: Flower2,
              title: "Bunga Segar",
              desc: "Dipetik langsung dari kebun terbaik",
            },
            {
              icon: Truck,
              title: "Pengiriman Cepat",
              desc: "Sampai di hari yang sama untuk area lokal",
            },
            {
              icon: ShieldCheck,
              title: "Garansi Kualitas",
              desc: "Jaminan kesegaran bunga yang dikirim",
            },
            {
              icon: Star,
              title: "Penjual Terpercaya",
              desc: "Mitra florist berpengalaman dan terverifikasi",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="flex items-start gap-4 rounded-2xl bg-white p-5 shadow-sm"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-500">
                <feature.icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-800">
                  {feature.title}
                </h3>
                <p className="mt-0.5 text-xs text-gray-500">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2
              className="text-2xl font-bold text-gray-900 sm:text-3xl"
              style={{ textWrap: "balance" }}
            >
              Produk Terbaru
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Rangkaian bunga terbaru dari para florist pilihan
            </p>
          </div>
          <Link
            href="/products"
            className="hidden items-center gap-1 rounded-xl px-4 py-2 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2 sm:inline-flex"
          >
            Lihat Semua
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <FeaturedProducts products={products} />

        <div className="mt-6 text-center sm:hidden">
          <Link
            href="/products"
            className="inline-flex items-center gap-1 rounded-xl px-5 py-2.5 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2"
          >
            Lihat Semua Produk
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>

      {/* Featured Shops */}
      <section className="bg-white/60 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h2
                className="text-2xl font-bold text-gray-900 sm:text-3xl"
                style={{ textWrap: "balance" }}
              >
                Toko Populer
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Kunjungi toko-toko pilihan dengan koleksi terlengkap
              </p>
            </div>
            <Link
              href="/shops"
              className="hidden items-center gap-1 rounded-xl px-4 py-2 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2 sm:inline-flex"
            >
              Lihat Semua
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          <FeaturedShops shops={shops} />
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-rose-500 to-pink-600 p-8 text-center text-white sm:p-12 lg:p-16">
          <h2
            className="text-2xl font-bold sm:text-3xl lg:text-4xl"
            style={{ textWrap: "balance" }}
          >
            Punya toko bunga? Bergabung bersama kami
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-rose-100 sm:text-base">
            Daftarkan toko Anda dan mulai jangkau ribuan pelanggan baru melalui
            platform Bloom.
          </p>
          <Link
            href="/dashboard"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-rose-600 shadow-lg transition-transform hover:scale-105 active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-rose-500"
          >
            Mulai Sekarang
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </>
  );
}
