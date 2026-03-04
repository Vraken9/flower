import type { Metadata } from "next";
import { createServerClient } from "@/lib/supabase/server";
import { ShopForm } from "@/components/dashboard/shop-form";
import type { Shop } from "@/lib/types";

export const metadata: Metadata = {
  title: "Profil Toko",
};

async function getShops() {
  const supabase = createServerClient();
  const { data } = await supabase
    .from("shops")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1);

  return (data as Shop[]) || [];
}

export default async function ShopDashboardPage() {
  const shops = await getShops();
  const shop = shops[0] || null;

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
