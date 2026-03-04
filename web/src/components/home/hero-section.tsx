"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Search, ArrowRight } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-rose-50 via-pink-50 to-rose-100">
      {/* Decorative blobs */}
      <div
        className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-rose-200/30 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-pink-200/30 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-36">
        <div className="max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <span className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-rose-100 px-3 py-1 text-xs font-medium text-rose-600">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-500" aria-hidden="true" />
              Marketplace Bunga #1 di Indonesia
            </span>

            <h1
              className="mt-4 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl"
              style={{ textWrap: "balance" }}
            >
              Temukan Keindahan{" "}
              <span className="bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent">
                dalam Setiap Rangkaian
              </span>
            </h1>

            <p className="mt-5 max-w-lg text-base leading-relaxed text-gray-600 sm:text-lg">
              Jelajahi koleksi bunga segar dari florist terbaik. Sempurnakan
              setiap momen spesial dengan rangkaian bunga yang memukau.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
            className="mt-8 flex flex-col gap-3 sm:flex-row"
          >
            <Link
              href="/products"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-200 transition-all hover:bg-rose-600 hover:shadow-xl hover:shadow-rose-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2"
            >
              Jelajahi Produk
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>

            <Link
              href="/shops"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-200 bg-white/80 px-6 py-3 text-sm font-semibold text-rose-600 backdrop-blur-sm transition-all hover:bg-white hover:shadow-md active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2"
            >
              <Search className="h-4 w-4" aria-hidden="true" />
              Cari Toko
            </Link>
          </motion.div>
        </div>

        {/* Decorative flower emoji grid */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="absolute bottom-8 right-8 hidden select-none text-6xl opacity-20 lg:block"
          aria-hidden="true"
        >
          🌸🌷🌹
        </motion.div>
      </div>
    </section>
  );
}
