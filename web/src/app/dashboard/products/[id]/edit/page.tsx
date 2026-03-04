import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { ProductForm } from "@/components/dashboard/product-form";
import type { ProductWithShop, Shop } from "@/lib/types";

export const metadata: Metadata = {
  title: "Edit Produk",
};

interface Props {
  params: Promise<{ id: string }>;
}

async function getData(id: string) {
  const supabase = createServerClient();

  const [productRes, shopsRes] = await Promise.all([
    supabase
      .from("products")
      .select("*, shops ( name )")
      .eq("id", id)
      .single(),
    supabase.from("shops").select("id, name").order("name"),
  ]);

  return {
    product: productRes.data as ProductWithShop | null,
    shops: (shopsRes.data as Pick<Shop, "id" | "name">[]) || [],
  };
}

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;
  const { product, shops } = await getData(id);

  if (!product) {
    notFound();
  }

  return (
    <div>
      <h1
        className="mb-6 text-2xl font-bold text-gray-900"
        style={{ textWrap: "balance" }}
      >
        Edit Produk
      </h1>
      <ProductForm shops={shops} product={product} />
    </div>
  );
}
