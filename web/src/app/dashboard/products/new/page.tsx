import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { ProductForm } from "@/components/dashboard/product-form";
import type { Shop } from "@/lib/types";

export const metadata: Metadata = {
  title: "Tambah Produk",
};

async function getShopsForUser() {
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

  // Admin sees all shops, owner sees only their shop
  if (isAdmin) {
    const { data } = await supabase.from("shops").select("id, name").order("name");
    return (data as Pick<Shop, "id" | "name">[]) || [];
  }

  const { data } = await supabase
    .from("shops")
    .select("id, name")
    .eq("owner_id", user.id)
    .order("name");
  
  return (data as Pick<Shop, "id" | "name">[]) || [];
}

export default async function NewProductPage() {
  const shops = await getShopsForUser();

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
