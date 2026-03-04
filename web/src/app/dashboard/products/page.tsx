import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { PlusCircle, Pencil, Trash2 } from "lucide-react";
import { createServerClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/utils";
import { DeleteProductButton } from "@/components/dashboard/delete-product-button";
import type { ProductWithShop } from "@/lib/types";

export const metadata: Metadata = {
  title: "Kelola Produk",
};

async function getProducts() {
  const supabase = createServerClient();

  const { data } = await supabase
    .from("products")
    .select("*, shops ( name )")
    .order("created_at", { ascending: false });

  return (data as ProductWithShop[]) || [];
}

export default async function DashboardProductsPage() {
  const products = await getProducts();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1
          className="text-2xl font-bold text-gray-900"
          style={{ textWrap: "balance" }}
        >
          Kelola Produk
        </h1>
        <Link
          href="/dashboard/products/new"
          className="inline-flex items-center gap-2 rounded-xl bg-rose-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-rose-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2"
        >
          <PlusCircle className="h-4 w-4" aria-hidden="true" />
          Tambah Produk
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl bg-white py-16 text-center shadow-sm">
          <div className="text-5xl" aria-hidden="true">
            📦
          </div>
          <p className="mt-4 text-sm text-gray-500">
            Belum ada produk. Mulai tambahkan produk pertama Anda.
          </p>
          <Link
            href="/dashboard/products/new"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-rose-500 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-rose-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2"
          >
            <PlusCircle className="h-4 w-4" aria-hidden="true" />
            Tambah Produk Pertama
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/80">
                  <th className="px-4 py-3 font-medium text-gray-600">
                    Gambar
                  </th>
                  <th className="px-4 py-3 font-medium text-gray-600">
                    Nama Produk
                  </th>
                  <th className="hidden px-4 py-3 font-medium text-gray-600 sm:table-cell">
                    Toko
                  </th>
                  <th className="px-4 py-3 font-medium text-gray-600">
                    Harga
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr
                    key={product.id}
                    className="border-b border-gray-50 transition-colors hover:bg-gray-50/50"
                  >
                    <td className="px-4 py-3">
                      <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-rose-50">
                        {product.image_url ? (
                          <Image
                            src={product.image_url}
                            alt={product.name}
                            fill
                            sizes="48px"
                            className="object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div
                            className="flex h-full items-center justify-center text-lg"
                            aria-hidden="true"
                          >
                            🌸
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800 truncate max-w-[200px]">
                        {product.name}
                      </p>
                    </td>
                    <td className="hidden px-4 py-3 text-gray-500 sm:table-cell">
                      {product.shops?.name || "\u2013"}
                    </td>
                    <td
                      className="px-4 py-3 font-medium text-gray-800"
                      style={{ fontVariantNumeric: "tabular-nums" }}
                    >
                      {formatPrice(product.price)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/dashboard/products/${product.id}/edit`}
                          className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
                          aria-label={`Edit ${product.name}`}
                        >
                          <Pencil className="h-4 w-4" aria-hidden="true" />
                        </Link>
                        <DeleteProductButton
                          productId={product.id}
                          productName={product.name}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
