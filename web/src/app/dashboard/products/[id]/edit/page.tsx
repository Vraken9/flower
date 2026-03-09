import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
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
  const supabase = await createServerClient();

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/auth/login");
  }

  // Get user's profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const isAdmin = profile?.role === "admin";

  // Get product
  const { data: product } = await supabase
    .from("products")
    .select("*, shops ( id, name, owner_id )")
    .eq("id", id)
    .single();

  if (!product) {
    return { product: null, shops: [], canEdit: false };
  }

  // Check if user can edit this product
  const shopData = product.shops as { id: string; name: string; owner_id: string } | null;
  const canEdit = isAdmin || (shopData && shopData.owner_id === user.id);

  if (!canEdit) {
    return { product: null, shops: [], canEdit: false };
  }

  // Get shops - admin sees all, owner sees only their shop
  let shops: Pick<Shop, "id" | "name">[] = [];
  if (isAdmin) {
    const { data } = await supabase.from("shops").select("id, name").order("name");
    shops = data || [];
  } else {
    const { data } = await supabase.from("shops").select("id, name").eq("owner_id", user.id);
    shops = data || [];
  }

  return {
    product: product as ProductWithShop,
    shops,
    canEdit: true,
  };
}

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;
  const { product, shops, canEdit } = await getData(id);

  if (!product || !canEdit) {
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
