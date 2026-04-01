import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    
    // Check if user is admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    
    if (profile?.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Forbidden - Admin only" },
        { status: 403 }
      );
    }

    // Parse timeframe from query params
    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get("timeframe") || "30d";

    const days = timeframeToDays(timeframe);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    const cutoffISO = cutoffDate.toISOString();

    // Chart data shows last N days (max 14 for readability)
    const chartDays = Math.min(days, 30);

    // Fetch all analytics data in parallel
    const [
      totalStats,
      productViews,
      shopViews,
      whatsappClicks,
      allShops,
    ] = await Promise.all([
      // Total counts (all-time)
      Promise.all([
        supabase.from("shops").select("id", { count: "exact", head: true }),
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("product_views").select("id", { count: "exact", head: true }),
        supabase.from("whatsapp_clicks").select("id", { count: "exact", head: true }),
      ]),

      // Product views (within timeframe)
      supabase
        .from("product_views")
        .select("id, created_at")
        .gte("created_at", cutoffISO),

      // Shop views (within timeframe)
      supabase
        .from("shop_views")
        .select("id, created_at")
        .gte("created_at", cutoffISO),

      // WhatsApp clicks (within timeframe)
      supabase
        .from("whatsapp_clicks")
        .select("id, created_at")
        .gte("created_at", cutoffISO),

      // All shops with product/click counts (no is_active filter for complete data)
      supabase
        .from("shops")
        .select(`
          id,
          name,
          is_active,
          products (count),
          whatsapp_clicks (count),
          shop_views (count)
        `),
    ]);

    // Process total stats
    const totals = {
      shops: totalStats[0].count || 0,
      products: totalStats[1].count || 0,
      users: totalStats[2].count || 0,
      productViews: totalStats[3].count || 0,
      whatsappClicks: totalStats[4].count || 0,
    };

    // Process daily data for charts
    const dailyData = generateDailyData(
      productViews.data || [],
      shopViews.data || [],
      whatsappClicks.data || [],
      chartDays
    );

    // Process per-shop data — get product views per shop
    const shopAnalytics = await processShopStatsWithViews(supabase, allShops.data || []);

    return NextResponse.json({
      success: true,
      data: {
        totals,
        dailyData,
        shopAnalytics,
        periodDays: days,
        periodStats: {
          productViews: productViews.data?.length || 0,
          shopViews: shopViews.data?.length || 0,
          whatsappClicks: whatsappClicks.data?.length || 0,
        },
        // Keep backward compat
        last30Days: {
          productViews: productViews.data?.length || 0,
          shopViews: shopViews.data?.length || 0,
          whatsappClicks: whatsappClicks.data?.length || 0,
        },
      },
    });
  } catch (err) {
    console.error("Analytics API error:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

function timeframeToDays(tf: string): number {
  switch (tf) {
    case "1d": return 1;
    case "7d": return 7;
    case "14d": return 14;
    case "30d": return 30;
    case "90d": return 90;
    case "all": return 3650; // ~10 years
    default: return 30;
  }
}

function generateDailyData(
  productViews: { created_at: string }[],
  shopViews: { created_at: string }[],
  whatsappClicks: { created_at: string }[],
  days: number
) {
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  const data = [];
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];
    const displayDate = `${date.getDate()} ${monthNames[date.getMonth()]}`;
    
    data.push({
      date: displayDate,
      fullDate: dateStr,
      productViews: productViews.filter(v => v.created_at.startsWith(dateStr)).length,
      shopViews: shopViews.filter(v => v.created_at.startsWith(dateStr)).length,
      whatsappClicks: whatsappClicks.filter(v => v.created_at.startsWith(dateStr)).length,
    });
  }
  
  return data;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function processShopStatsWithViews(supabase: any, shops: any[]) {
  const result = [];

  for (const shop of shops) {
    // Get product views for this shop's products
    const { data: shopProducts } = await supabase
      .from("products")
      .select("id")
      .eq("shop_id", shop.id);

    let productViewCount = 0;
    if (shopProducts && shopProducts.length > 0) {
      const productIds = shopProducts.map((p: { id: string }) => p.id);
      const { count } = await supabase
        .from("product_views")
        .select("id", { count: "exact", head: true })
        .in("product_id", productIds);
      productViewCount = count || 0;
    }

    result.push({
      id: shop.id,
      name: shop.name,
      isActive: shop.is_active,
      products: shop.products?.[0]?.count || 0,
      productViews: productViewCount,
      shopViews: shop.shop_views?.[0]?.count || 0,
      whatsappClicks: shop.whatsapp_clicks?.[0]?.count || 0,
    });
  }

  return result.sort((a, b) => 
    (b.productViews + b.whatsappClicks + b.shopViews) - (a.productViews + a.whatsappClicks + a.shopViews)
  );
}
