import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { ShopForm } from "@/components/dashboard/shop-form";
import type { Shop } from "@/lib/types";

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

  // If admin, get all shops for selection (they can manage any shop)
  if (isAdmin) {
    const { data } = await supabase
      .from("shops")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1);
    return (data as Shop[])?.[0] || null;
  }

  // If owner, get only their shop
  const { data } = await supabase
    .from("shops")
    .select("*")
    .eq("owner_id", user.id)
    .single();

  return data as Shop | null;
}

export default async function ShopDashboardPage() {
  const shop = await getOwnerShop();

  return (
    <div>
      <h1
        className="mb-6 text-2xl font-bold text-gray-900"
        style={{ textWrap: "balance" }}
      >
        {shop ? "Profil Toko" : "Buat Toko Baru"}
      </h1>
      <ShopForm shop={shop} />
    </div>
  );
}
