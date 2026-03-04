import type { Metadata } from "next";
import { createServerClient } from "@/lib/supabase/server";
import { ProductGrid } from "@/components/product/product-grid";
import type { ProductWithShop } from "@/lib/types";

export const metadata: Metadata = {
  title: "Semua Produk",
  description: "Jelajahi koleksi bunga segar dari para florist terbaik di Bloom.",
};

async function getProducts() {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("products")
    .select("*, shops ( name )")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching products:", error);
    return [];
  }

  return (data as ProductWithShop[]) || [];
}

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1
          className="text-3xl font-bold text-gray-900"
          style={{ textWrap: "balance" }}
        >
          Semua Produk
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          {products.length} produk tersedia dari berbagai toko bunga
        </p>
      </div>

      {/* Product Grid */}
      <ProductGrid products={products} />
    </div>
  );
}
