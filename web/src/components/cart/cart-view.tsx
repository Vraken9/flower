"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  ArrowLeft,
  MessageCircle,
  Store,
  CheckSquare,
  Square,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/lib/store/cart";

interface ShopInfo {
  id: string;
  name: string;
  whatsapp: string | null;
}

interface GroupedCart {
  shop: ShopInfo;
  items: { product: import("@/lib/types").Product; quantity: number }[];
  subtotal: number;
}

export function CartView() {
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const clearCart = useCartStore((s) => s.clearCart);
  const totalPrice = useCartStore((s) => s.totalPrice());

  const [shopData, setShopData] = useState<Record<string, ShopInfo>>({});
  const [selectedShops, setSelectedShops] = useState<Set<string>>(new Set());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch shop info for all unique shop_ids in cart
  useEffect(() => {
    const shopIds = [...new Set(items.map((item) => item.product.shop_id))];
    if (shopIds.length === 0) return;

    const fetchShops = async () => {
      try {
        const res = await fetch(`/api/shops?ids=${shopIds.join(",")}`, {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.data)) {
            const map: Record<string, ShopInfo> = {};
            for (const s of data.data) {
              map[s.id] = { id: s.id, name: s.name, whatsapp: s.whatsapp };
            }
            setShopData(map);
          }
        }
      } catch {
        // Fallback: use shop_id as name
      }
    };
    fetchShops();
  }, [items]);

  // Auto-select all shops when items change
  useEffect(() => {
    const shopIds = [...new Set(items.map((i) => i.product.shop_id))];
    setSelectedShops(new Set(shopIds));
  }, [items]);

  if (!mounted) return null;

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl bg-white py-20 text-center shadow-sm">
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-rose-50">
          <ShoppingBag
            className="h-10 w-10 text-rose-300"
            aria-hidden="true"
          />
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

  // Group items by shop
  const grouped: GroupedCart[] = [];
  const shopMap = new Map<string, typeof items>();

  for (const item of items) {
    const shopId = item.product.shop_id;
    if (!shopMap.has(shopId)) shopMap.set(shopId, []);
    shopMap.get(shopId)!.push(item);
  }

  for (const [shopId, shopItems] of shopMap) {
    const shop = shopData[shopId] || {
      id: shopId,
      name: "Toko",
      whatsapp: null,
    };
    const subtotal = shopItems.reduce(
      (sum, i) => sum + i.product.price * i.quantity,
      0
    );
    grouped.push({ shop, items: shopItems, subtotal });
  }

  const toggleShopSelection = (shopId: string) => {
    setSelectedShops((prev) => {
      const next = new Set(prev);
      if (next.has(shopId)) next.delete(shopId);
      else next.add(shopId);
      return next;
    });
  };

  const handleWhatsAppCheckout = (group: GroupedCart) => {
    if (!group.shop.whatsapp) {
      alert("Toko ini belum menambahkan nomor WhatsApp.");
      return;
    }

    const itemList = group.items
      .map(
        (i) =>
          `- ${i.product.name} x${i.quantity} = ${formatPrice(i.product.price * i.quantity)}`
      )
      .join("\n");

    const message = encodeURIComponent(
      `Halo, saya ingin memesan:\n\n${itemList}\n\n` +
        `Total: ${formatPrice(group.subtotal)}\n\n` +
        `Apakah pesanan ini bisa diproses?`
    );

    let waNumber = group.shop.whatsapp.replace(/\D/g, "");
    if (waNumber.startsWith("08")) {
      waNumber = "62" + waNumber.substring(1);
    }

    window.open(`https://wa.me/${waNumber}?text=${message}`, "_blank");
  };

  const selectedTotal = grouped
    .filter((g) => selectedShops.has(g.shop.id))
    .reduce((sum, g) => sum + g.subtotal, 0);

  return (
    <div className="space-y-6">
      {/* Grouped by Shop */}
      {grouped.map((group) => (
        <div
          key={group.shop.id}
          className="overflow-hidden rounded-2xl bg-white shadow-sm"
        >
          {/* Shop Header */}
          <div className="flex items-center gap-3 border-b border-gray-100 bg-gray-50/50 px-4 py-3">
            <button
              type="button"
              onClick={() => toggleShopSelection(group.shop.id)}
              className="text-rose-500 hover:text-rose-600"
              aria-label={
                selectedShops.has(group.shop.id)
                  ? "Batalkan pilih toko"
                  : "Pilih toko"
              }
            >
              {selectedShops.has(group.shop.id) ? (
                <CheckSquare className="h-5 w-5" />
              ) : (
                <Square className="h-5 w-5" />
              )}
            </button>
            <Store className="h-4 w-4 text-gray-500" aria-hidden="true" />
            <Link
              href={`/shops/${group.shop.id}`}
              className="text-sm font-semibold text-gray-800 hover:text-rose-600 transition-colors"
            >
              {group.shop.name}
            </Link>
          </div>

          {/* Items */}
          <div className="divide-y divide-gray-50 px-4">
            <AnimatePresence mode="popLayout">
              {group.items.map((item) => (
                <motion.div
                  key={item.product.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.3 }}
                  className="flex gap-4 py-4 sm:gap-6"
                >
                  {/* Image */}
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-rose-50 sm:h-24 sm:w-24">
                    {item.product.image_url ? (
                      <Image
                        src={item.product.image_url}
                        alt={item.product.name}
                        fill
                        sizes="96px"
                        className="object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div
                        className="flex h-full items-center justify-center text-3xl"
                        aria-hidden="true"
                      >
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

          {/* Shop Footer — subtotal + WhatsApp checkout */}
          <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50/50 px-4 py-3">
            <div className="text-sm text-gray-600">
              Subtotal:{" "}
              <span
                className="font-bold text-gray-900"
                style={{ fontVariantNumeric: "tabular-nums" }}
              >
                {formatPrice(group.subtotal)}
              </span>
            </div>
            {group.shop.whatsapp ? (
              <button
                type="button"
                onClick={() => handleWhatsAppCheckout(group)}
                className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700"
              >
                <MessageCircle className="h-4 w-4" />
                Pesan via WA
              </button>
            ) : (
              <span className="text-xs text-gray-400">
                WhatsApp belum tersedia
              </span>
            )}
          </div>
        </div>
      ))}

      {/* Overall Summary */}
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <span className="text-sm text-gray-600">
            Total ({items.reduce((sum, i) => sum + i.quantity, 0)} item dari{" "}
            {grouped.length} toko)
          </span>
          <span
            className="text-xl font-bold text-gray-900"
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {formatPrice(selectedTotal || totalPrice)}
          </span>
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <Button
            variant="outline"
            size="lg"
            onClick={clearCart}
            className="text-gray-500 hover:text-red-500 hover:border-red-200"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            Kosongkan Keranjang
          </Button>
        </div>
      </div>
    </div>
  );
}
