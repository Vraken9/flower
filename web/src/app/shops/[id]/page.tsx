import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { MapPin } from "lucide-react";
import { createServerClient } from "@/lib/supabase/server";
import { FeaturedProducts } from "@/components/home/featured-products";
import type { Shop, ProductWithShop } from "@/lib/types";

interface Props {
  params: Promise<{ id: string }>;
}

async function getShopWithProducts(id: string) {
  const supabase = createServerClient();

  const [shopRes, productsRes] = await Promise.all([
    supabase.from("shops").select("*").eq("id", id).single(),
    supabase
      .from("products")
      .select("*, shops ( name )")
      .eq("shop_id", id)
      .order("created_at", { ascending: false }),
  ]);

  return {
    shop: shopRes.data as Shop | null,
    products: (productsRes.data as ProductWithShop[]) || [],
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const supabase = createServerClient();
  const { data } = await supabase.from("shops").select("name").eq("id", id).single();

  return {
    title: data?.name || "Toko Tidak Ditemukan",
  };
}

export default async function ShopDetailPage({ params }: Props) {
  const { id } = await params;
  const { shop, products } = await getShopWithProducts(id);

  if (!shop) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Shop Header */}
      <div className="mb-10 overflow-hidden rounded-3xl bg-gradient-to-br from-rose-50 to-pink-50">
        <div className="relative h-48 sm:h-64">
          {shop.image_url ? (
            <Image
              src={shop.image_url}
              alt={shop.name}
              fill
              sizes="100vw"
              className="object-cover"
              priority
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-rose-100 to-pink-100">
              <div className="text-7xl" aria-hidden="true">
                🌸
              </div>
            </div>
          )}
        </div>
        <div className="p-6 sm:p-8">
          <h1
            className="text-2xl font-bold text-gray-900 sm:text-3xl"
            style={{ textWrap: "balance" }}
          >
            {shop.name}
          </h1>
          {shop.description && (
            <p className="mt-2 max-w-2xl text-gray-600">{shop.description}</p>
          )}
          {shop.location && (
            <span className="mt-3 inline-flex items-center gap-1.5 text-sm text-gray-500">
              <MapPin className="h-4 w-4" aria-hidden="true" />
              {shop.location}
            </span>
          )}
        </div>
      </div>

      {/* Products */}
      <div>
        <h2
          className="mb-6 text-xl font-bold text-gray-900"
          style={{ textWrap: "balance" }}
        >
          Produk dari {shop.name}
        </h2>
        <FeaturedProducts products={products} />
      </div>
    </div>
  );
}
