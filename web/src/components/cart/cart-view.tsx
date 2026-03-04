"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/lib/store/cart";

export function CartView() {
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const clearCart = useCartStore((s) => s.clearCart);
  const totalPrice = useCartStore((s) => s.totalPrice());

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl bg-white py-20 text-center shadow-sm">
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-rose-50">
          <ShoppingBag className="h-10 w-10 text-rose-300" aria-hidden="true" />
        </div>
        <h2 className="text-lg font-semibold text-gray-800">
          Keranjang Anda masih kosong
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Temukan bunga indah untuk ditambahkan ke keranjang
        </p>
        <Link
          href="/products"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-rose-500 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-rose-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Jelajahi Produk
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Items */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {items.map((item) => (
            <motion.div
              key={item.product.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.3 }}
              className="flex gap-4 rounded-2xl bg-white p-4 shadow-sm sm:gap-6"
            >
              {/* Image */}
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-rose-50 sm:h-28 sm:w-28">
                {item.product.image_url ? (
                  <Image
                    src={item.product.image_url}
                    alt={item.product.name}
                    fill
                    sizes="112px"
                    className="object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-3xl" aria-hidden="true">
                    🌸
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex flex-1 flex-col justify-between min-w-0">
                <div>
                  <Link
                    href={`/products/${item.product.id}`}
                    className="text-sm font-semibold text-gray-800 hover:text-rose-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 rounded truncate block"
                  >
                    {item.product.name}
                  </Link>
                  <p
                    className="mt-0.5 text-sm font-bold text-rose-600"
                    style={{ fontVariantNumeric: "tabular-nums" }}
                  >
                    {formatPrice(item.product.price)}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  {/* Quantity */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(item.product.id, item.quantity - 1)
                      }
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
                      aria-label={`Kurangi jumlah ${item.product.name}`}
                    >
                      <Minus className="h-3 w-3" aria-hidden="true" />
                    </button>
                    <span
                      className="w-8 text-center text-sm font-medium"
                      style={{ fontVariantNumeric: "tabular-nums" }}
                    >
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(item.product.id, item.quantity + 1)
                      }
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
                      aria-label={`Tambah jumlah ${item.product.name}`}
                    >
                      <Plus className="h-3 w-3" aria-hidden="true" />
                    </button>
                  </div>

                  {/* Remove */}
                  <button
                    type="button"
                    onClick={() => removeItem(item.product.id)}
                    className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
                    aria-label={`Hapus ${item.product.name} dari keranjang`}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Summary */}
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <span className="text-sm text-gray-600">
            Total ({items.reduce((sum, i) => sum + i.quantity, 0)} item)
          </span>
          <span
            className="text-xl font-bold text-gray-900"
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {formatPrice(totalPrice)}
          </span>
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <Button className="flex-1" size="lg">
            <ShoppingBag className="h-4 w-4" aria-hidden="true" />
            Checkout via WhatsApp
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={clearCart}
            className="text-gray-500 hover:text-red-500 hover:border-red-200"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            Kosongkan
          </Button>
        </div>
      </div>
    </div>
  );
}
