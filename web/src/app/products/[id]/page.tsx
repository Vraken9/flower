import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { ProductDetail } from "@/components/product/product-detail";
import type { ProductWithShop } from "@/lib/types";

interface Props {
  params: Promise<{ id: string }>;
}

async function getProduct(id: string) {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("products")
    .select("*, shops ( name )")
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return data as ProductWithShop;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    return { title: "Produk Tidak Ditemukan" };
  }

  return {
    title: product.name,
    description: product.description || `Beli ${product.name} di Bloom`,
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <ProductDetail product={product} />
    </div>
  );
}
