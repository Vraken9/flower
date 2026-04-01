"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Heart, ShoppingCart, Store, MessageCircle, Star, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/lib/store/cart";
import { useAuth } from "@/lib/contexts/auth.context";
import { useFavorites } from "@/lib/contexts/favorites.context";
import type { ProductWithShop } from "@/lib/types";

interface ProductDetailProps {
  product: ProductWithShop;
}

export function ProductDetail({ product }: ProductDetailProps) {
  const addItem = useCartStore((s) => s.addItem);
  const { user } = useAuth();
  const { isFavorited, toggleFavorite, addToFavoritesWithAuth } = useFavorites();
  const [favLoading, setFavLoading] = useState(false);

  const isFav = isFavorited(product.id);

  const handleToggleFavorite = async () => {
    if (!user) {
      addToFavoritesWithAuth(product.id);
      return;
    }
    setFavLoading(true);
    try {
      await toggleFavorite(product.id);
    } catch {
      // Ignore
    } finally {
      setFavLoading(false);
    }
  };

  // Track product view on mount
  useEffect(() => {
    const trackView = async () => {
      try {
        await fetch("/api/tracking/product-view", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            product_id: product.id,
            session_id: sessionStorage.getItem("session_id") || crypto.randomUUID(),
          }),
        });
      } catch {
        // Ignore tracking errors
      }
    };
    trackView();
  }, [product.id]);

  // Handle WhatsApp checkout
  const handleWhatsAppCheckout = async () => {
    if (!product.shops?.whatsapp) {
      alert("Toko ini belum menambahkan nomor WhatsApp.");
      return;
    }

    // Track WhatsApp click
    try {
      await fetch("/api/tracking/whatsapp-click", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: product.id,
          shop_id: product.shop_id,
          session_id: sessionStorage.getItem("session_id") || crypto.randomUUID(),
        }),
      });
    } catch {
      // Ignore tracking errors
    }

    // Create WhatsApp message with review link
    const reviewUrl = `${window.location.origin}/review?product_id=${product.id}&shop_id=${product.shop_id}&product_name=${encodeURIComponent(product.name)}&shop_name=${encodeURIComponent(product.shops?.name || "")}`;

    const message = encodeURIComponent(
      `Halo, saya tertarik dengan produk:\n\n` +
      `*${product.name}*\n` +
      `Harga: ${formatPrice(product.price)}\n\n` +
      `Apakah produk ini masih tersedia?\n\n` +
      `---\n` +
      `Setelah menerima pesanan, mohon beri review: ${reviewUrl}`
    );

    // Convert 08xxx to 62xxx for WhatsApp API
    let waNumber = product.shops.whatsapp.replace(/\D/g, "");
    if (waNumber.startsWith("08")) {
      waNumber = "62" + waNumber.substring(1);
    }

    const whatsappUrl = `https://wa.me/${waNumber}?text=${message}`;
    window.open(whatsappUrl, "_blank");
  };

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

          {/* Actions – hidden for admin/owner */}
          {(!user || user.role === 'user') && (
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              {product.shops?.whatsapp ? (
                <Button
                  size="lg"
                  onClick={handleWhatsAppCheckout}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <MessageCircle className="h-4 w-4" aria-hidden="true" />
                  Pesan via WhatsApp
                </Button>
              ) : (
                <Button
                  size="lg"
                  onClick={() => addItem(product)}
                  className="flex-1"
                >
                  <ShoppingCart className="h-4 w-4" aria-hidden="true" />
                  Tambah ke Keranjang
                </Button>
              )}

              <Button
                variant="outline"
                size="lg"
                onClick={handleToggleFavorite}
                disabled={favLoading}
                aria-label={isFav ? `Hapus ${product.name} dari favorit` : `Tambah ${product.name} ke favorit`}
                className={isFav ? "border-red-300 text-red-500 hover:bg-red-50" : ""}
              >
                {favLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Heart className={`h-4 w-4 ${isFav ? "fill-red-500" : ""}`} aria-hidden="true" />
                )}
                {isFav ? "Difavoritkan" : "Favorit"}
              </Button>
            </div>
          )}

          {/* Review link */}
          {(!user || user.role === 'user') && (
            <div className="mt-4">
              <Link
                href={`/review?product_id=${product.id}&shop_id=${product.shop_id}&product_name=${encodeURIComponent(product.name)}&shop_name=${encodeURIComponent(product.shops?.name || "")}`}
                className="inline-flex items-center gap-1.5 text-sm text-gray-500 transition-colors hover:text-rose-600"
              >
                <Star className="h-4 w-4" />
                Beri Review untuk produk ini
              </Link>
            </div>
          )}

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
