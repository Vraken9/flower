"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Heart, ShoppingCart, MapPin, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/lib/store/cart";
import type { ProductWithShop } from "@/lib/types";

interface ProductDetailProps {
  product: ProductWithShop;
}

export function ProductDetail({ product }: ProductDetailProps) {
  const addItem = useCartStore((s) => s.addItem);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Breadcrumb */}
      <nav className="mb-6" aria-label="Breadcrumb">
        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 transition-colors hover:text-rose-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2 rounded"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Kembali ke Produk
        </Link>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        {/* Image */}
        <div className="overflow-hidden rounded-3xl bg-rose-50">
          {product.image_url ? (
            <div className="relative aspect-square">
              <Image
                src={product.image_url}
                alt={product.name}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
                priority
              />
            </div>
          ) : (
            <div className="flex aspect-square items-center justify-center">
              <div className="text-8xl" aria-hidden="true">
                🌸
              </div>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col justify-center">
          {/* Shop badge */}
          {product.shops?.name && (
            <Link
              href={`/shops/${product.shop_id}`}
              className="mb-3 inline-flex w-fit items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1 text-xs font-medium text-rose-600 transition-colors hover:bg-rose-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2"
            >
              <Store className="h-3 w-3" aria-hidden="true" />
              {product.shops.name}
            </Link>
          )}

          <h1
            className="text-2xl font-bold text-gray-900 sm:text-3xl lg:text-4xl"
            style={{ textWrap: "balance" }}
          >
            {product.name}
          </h1>

          <p
            className="mt-4 text-3xl font-bold text-rose-600"
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {formatPrice(product.price)}
          </p>

          {product.description && (
            <div className="mt-6">
              <h2 className="text-sm font-semibold text-gray-800">Deskripsi</h2>
              <p className="mt-2 leading-relaxed text-gray-600">
                {product.description}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button
              size="lg"
              onClick={() => addItem(product)}
              className="flex-1"
            >
              <ShoppingCart className="h-4 w-4" aria-hidden="true" />
              Tambah ke Keranjang
            </Button>

            <Button variant="outline" size="lg" aria-label={`Tambah ${product.name} ke favorit`}>
              <Heart className="h-4 w-4" aria-hidden="true" />
              Favorit
            </Button>
          </div>

          {/* Meta */}
          <div className="mt-8 rounded-xl border border-gray-100 bg-gray-50/50 p-4">
            <div className="grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <span className="text-gray-500">Kategori</span>
                <p className="font-medium text-gray-800">
                  {product.category || "Bunga Segar"}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Stok</span>
                <p className="font-medium text-gray-800" style={{ fontVariantNumeric: "tabular-nums" }}>
                  {product.stock > 0 ? `${product.stock} tersedia` : "Habis"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
