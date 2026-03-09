import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

/**
 * GET /api/owner/dashboard-stats
 * Get dashboard statistics for the current owner
 */
export async function GET() {
  try {
    const supabase = await createServerClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get user's profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || !["owner", "admin"].includes(profile.role)) {
      return NextResponse.json(
        { success: false, message: "Forbidden" },
        { status: 403 }
      );
    }

    const isAdmin = profile.role === "admin";

    // Get shop(s) - admin sees aggregate, owner sees their shop
    let shopIds: string[] = [];
    
    if (isAdmin) {
      const { data: shops } = await supabase.from("shops").select("id");
      shopIds = shops?.map(s => s.id) || [];
    } else {
      const { data: shop } = await supabase
        .from("shops")
        .select("id")
        .eq("owner_id", user.id)
        .single();
      if (shop) shopIds = [shop.id];
    }

    if (shopIds.length === 0) {
      return NextResponse.json({
        success: true,
        stats: {
          totalProducts: 0,
          totalWhatsAppClicks: 0,
          totalShopViews: 0,
          totalProductViews: 0,
          totalFavorites: 0,
          totalCartItems: 0,
          topProducts: [],
        },
      });
    }

    // Get all product IDs for these shops
    const { data: products } = await supabase
      .from("products")
      .select("id, name, image_url")
      .in("shop_id", shopIds);

    const productIds = products?.map(p => p.id) || [];

    // Get stats
    const [
      whatsappRes,
      shopViewsRes,
      productViewsRes,
      favoritesRes,
      cartRes
    ] = await Promise.all([
      supabase.from("whatsapp_clicks").select("id", { count: "exact", head: true }).in("shop_id", shopIds),
      supabase.from("shop_views").select("id", { count: "exact", head: true }).in("shop_id", shopIds),
      productIds.length > 0 
        ? supabase.from("product_views").select("id", { count: "exact", head: true }).in("product_id", productIds)
        : Promise.resolve({ count: 0 }),
      productIds.length > 0
        ? supabase.from("favorites").select("id", { count: "exact", head: true }).in("product_id", productIds)
        : Promise.resolve({ count: 0 }),
      productIds.length > 0
        ? supabase.from("cart_items").select("id", { count: "exact", head: true }).in("product_id", productIds)
        : Promise.resolve({ count: 0 }),
    ]);

    // Get top products by views/favorites
    let topProducts: Array<{
      id: string;
      name: string;
      image_url: string | null;
      views: number;
      favorites: number;
      cart_adds: number;
    }> = [];

    if (products && products.length > 0) {
      const productStats = await Promise.all(
        products.slice(0, 10).map(async (p) => {
          const [viewsRes, favsRes, cartRes] = await Promise.all([
            supabase.from("product_views").select("id", { count: "exact", head: true }).eq("product_id", p.id),
            supabase.from("favorites").select("id", { count: "exact", head: true }).eq("product_id", p.id),
            supabase.from("cart_items").select("id", { count: "exact", head: true }).eq("product_id", p.id),
          ]);
          return {
            id: p.id,
            name: p.name,
            image_url: p.image_url,
            views: viewsRes.count || 0,
            favorites: favsRes.count || 0,
            cart_adds: cartRes.count || 0,
          };
        })
      );

      // Sort by total engagement (views + favorites + cart)
      topProducts = productStats
        .sort((a, b) => (b.views + b.favorites + b.cart_adds) - (a.views + a.favorites + a.cart_adds))
        .slice(0, 5);
    }

    return NextResponse.json({
      success: true,
      stats: {
        totalProducts: productIds.length,
        totalWhatsAppClicks: whatsappRes.count || 0,
        totalShopViews: shopViewsRes.count || 0,
        totalProductViews: productViewsRes.count || 0,
        totalFavorites: favoritesRes.count || 0,
        totalCartItems: cartRes.count || 0,
        topProducts,
      },
    });
  } catch (error) {
    console.error("[GET /api/owner/dashboard-stats] Exception:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
