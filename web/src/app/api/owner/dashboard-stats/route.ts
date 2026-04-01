import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

function timeframeToDays(tf: string): number {
  switch (tf) {
    case "1d": return 1;
    case "7d": return 7;
    case "14d": return 14;
    case "30d": return 30;
    case "90d": return 90;
    default: return 9999;
  }
}

/**
 * GET /api/owner/dashboard-stats?timeframe=30d
 * Get dashboard statistics for the current owner (or admin aggregate)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse timeframe
    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get("timeframe") || "all";

    const useTimeFilter = timeframe !== "all";
    let cutoffISO: string | null = null;
    if (useTimeFilter) {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - timeframeToDays(timeframe));
      cutoffISO = cutoff.toISOString();
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
          periodDays: useTimeFilter ? timeframeToDays(timeframe) : null,
        },
      });
    }

    // Get all product IDs for these shops
    const { data: products } = await supabase
      .from("products")
      .select("id, name, image_url")
      .in("shop_id", shopIds);

    const productIds = products?.map(p => p.id) || [];

    // Helper to build time-filtered count query
    const countWithTime = (table: string, filterCol: string, filterVals: string[]) => {
      let q = supabase.from(table).select("id", { count: "exact", head: true }).in(filterCol, filterVals);
      if (useTimeFilter && cutoffISO) {
        q = q.gte("created_at", cutoffISO);
      }
      return q;
    };

    // Get stats (with optional time filter)
    const [
      whatsappRes,
      shopViewsRes,
      productViewsRes,
      favoritesRes,
      cartRes,
    ] = await Promise.all([
      countWithTime("whatsapp_clicks", "shop_id", shopIds),
      countWithTime("shop_views", "shop_id", shopIds),
      productIds.length > 0
        ? countWithTime("product_views", "product_id", productIds)
        : Promise.resolve({ count: 0 }),
      productIds.length > 0
        ? countWithTime("favorites", "product_id", productIds)
        : Promise.resolve({ count: 0 }),
      productIds.length > 0
        ? countWithTime("cart_items", "product_id", productIds)
        : Promise.resolve({ count: 0 }),
    ]);

    // Get top products by views/favorites (with time filter)
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
        products.slice(0, 20).map(async (p) => {
          const buildQ = (table: string) => {
            let q = supabase.from(table).select("id", { count: "exact", head: true }).eq("product_id", p.id);
            if (useTimeFilter && cutoffISO) {
              q = q.gte("created_at", cutoffISO);
            }
            return q;
          };
          const [viewsRes, favsRes, cartItemRes] = await Promise.all([
            buildQ("product_views"),
            buildQ("favorites"),
            buildQ("cart_items"),
          ]);
          return {
            id: p.id,
            name: p.name,
            image_url: p.image_url,
            views: viewsRes.count || 0,
            favorites: favsRes.count || 0,
            cart_adds: cartItemRes.count || 0,
          };
        })
      );

      // Sort by total engagement
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
        periodDays: useTimeFilter ? timeframeToDays(timeframe) : null,
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
