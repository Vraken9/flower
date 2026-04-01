import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { ShopForm } from "@/components/dashboard/shop-form";
import { ShopBranches } from "@/components/dashboard/shop-branches";
import type { Shop, Category } from "@/lib/types";

export const metadata: Metadata = {
  title: "Profil Toko",
};

async function getOwnerShop() {
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

  // If admin, get first shop for selection (they can manage any shop)
  if (isAdmin) {
    const { data } = await supabase
      .from("shops")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1);
    return { shops: (data as Shop[]) || [], isAdmin: true };
  }

  // If owner, get all their shops
  const { data } = await supabase
    .from("shops")
    .select("*")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: true });

  return { shops: (data as Shop[]) || [], isAdmin: false };
}

async function getCategories() {
  const supabase = await createServerClient();
  const { data } = await supabase.from("categories").select("*").order("name");
  return data || [];
}

export default async function ShopDashboardPage() {
  const { shops, isAdmin } = await getOwnerShop();
  const categories = await getCategories();

  // Find main shop and branches
  const mainShop = shops.find((s) => !s.parent_shop_id) || shops[0] || null;
  const branches = shops.filter((s) => s.id !== mainShop?.id);

  return (
    <div>
      <h1
        className="mb-6 text-2xl font-bold text-gray-900"
        style={{ textWrap: "balance" }}
      >
        {mainShop ? "Profil Toko Utama" : "Buat Toko Baru"}
      </h1>
      
      <ShopForm shop={mainShop} categories={categories} />

      {mainShop && !isAdmin && (
        <div className="mt-12">
          <ShopBranches mainShop={mainShop} branches={branches} categories={categories} />
        </div>
      )}
    </div>
  );
}
