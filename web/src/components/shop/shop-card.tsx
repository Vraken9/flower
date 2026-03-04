"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { MapPin, ArrowRight } from "lucide-react";
import type { Shop } from "@/lib/types";

interface ShopCardProps {
  shop: Shop;
  index?: number;
}

export function ShopCard({ shop, index = 0 }: ShopCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1, ease: "easeOut" }}
      className="group overflow-hidden rounded-2xl bg-white shadow-sm transition-shadow duration-300 hover:shadow-lg"
    >
      <Link
        href={`/shops/${shop.id}`}
        className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2 rounded-2xl"
      >
        {/* Cover Image */}
        <div className="relative h-48 overflow-hidden bg-gradient-to-br from-rose-100 to-pink-50">
          {shop.image_url ? (
            <Image
              src={shop.image_url}
              alt={shop.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <div className="text-5xl">🌸</div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="text-lg font-semibold text-gray-800 transition-colors group-hover:text-rose-600" style={{ textWrap: "balance" }}>
            {shop.name}
          </h3>

          {shop.description && (
            <p className="mt-1.5 text-sm text-gray-500 line-clamp-2">
              {shop.description}
            </p>
          )}

          <div className="mt-3 flex items-center justify-between">
            {shop.location && (
              <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                <MapPin className="h-3 w-3" aria-hidden="true" />
                {shop.location}
              </span>
            )}

            <span className="inline-flex items-center gap-1 text-xs font-medium text-rose-500 transition-colors group-hover:text-rose-600">
              Lihat Toko
              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
