import type { Metadata } from "next";
import { createServerClient } from "@/lib/supabase/server";
import { ShopGrid } from "@/components/shop/shop-grid";
import { ShopsFilter } from "@/components/shop/shops-filter";
import type { Shop, Category } from "@/lib/types";

export const metadata: Metadata = {
  title: "Daftar Toko",
  description:
    "Temukan toko bunga terpercaya dan koleksi terlengkap di Bloom Marketplace.",
};

async function getShops() {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("shops")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching shops:", error);
    return [];
  }

  return (data as Shop[]) || [];
}

async function getCategories() {
  const supabase = await createServerClient();
  const { data } = await supabase.from("categories").select("*").order("name");
  return (data as Category[]) || [];
}

export default async function ShopsPage() {
  const shops = await getShops();
  const categories = await getCategories();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1
          className="text-3xl font-bold text-gray-900"
          style={{ textWrap: "balance" }}
        >
          Daftar Toko Bunga
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          {shops.length} toko terdaftar di Bloom
        </p>
      </div>

      <ShopsFilter shops={shops} categories={categories} />
    </div>
  );
}
