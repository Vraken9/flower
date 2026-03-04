import type { Metadata } from "next";
import { createServerClient } from "@/lib/supabase/server";
import { ProductForm } from "@/components/dashboard/product-form";
import type { Shop } from "@/lib/types";

export const metadata: Metadata = {
  title: "Tambah Produk",
};

async function getShops() {
  const supabase = createServerClient();
  const { data } = await supabase.from("shops").select("id, name").order("name");
  return (data as Pick<Shop, "id" | "name">[]) || [];
}

export default async function NewProductPage() {
  const shops = await getShops();

  return (
    <div>
      <h1
        className="mb-6 text-2xl font-bold text-gray-900"
        style={{ textWrap: "balance" }}
      >
        Tambah Produk Baru
      </h1>
      <ProductForm shops={shops} />
    </div>
  );
}
