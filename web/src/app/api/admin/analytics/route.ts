import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function GET() {
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

    // Get date range for last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysAgoISO = thirtyDaysAgo.toISOString();

    // Fetch all analytics data in parallel
    const [
      totalStats,
      productViews,
      shopViews,
      whatsappClicks,
      shopStats,
    ] = await Promise.all([
      // Total counts
      Promise.all([
        supabase.from("shops").select("id", { count: "exact", head: true }),
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("product_views").select("id", { count: "exact", head: true }),
        supabase.from("whatsapp_clicks").select("id", { count: "exact", head: true }),
      ]),

      // Product views (last 30 days)
      supabase
        .from("product_views")
        .select("id, created_at")
        .gte("created_at", thirtyDaysAgoISO),

      // Shop views (last 30 days)
      supabase
        .from("shop_views")
        .select("id, created_at")
        .gte("created_at", thirtyDaysAgoISO),

      // WhatsApp clicks (last 30 days)
      supabase
        .from("whatsapp_clicks")
        .select("id, created_at")
        .gte("created_at", thirtyDaysAgoISO),

      // Per-shop statistics
      supabase
        .from("shops")
        .select(`
          id,
          name,
          products (count),
          whatsapp_clicks (count)
        `)
        .eq("is_active", true),
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
      whatsappClicks.data || []
    );

    // Process per-shop data
    const shopAnalytics = processShopStats(shopStats.data || []);

    return NextResponse.json({
      success: true,
      data: {
        totals,
        dailyData,
        shopAnalytics,
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

function generateDailyData(
  productViews: { created_at: string }[],
  shopViews: { created_at: string }[],
  whatsappClicks: { created_at: string }[]
) {
  const days = 14;
  const data = [];
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];
    const displayDate = date.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
    
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- dynamic Supabase query result
function processShopStats(shops: any[]) {
  return shops.map(shop => {
    return {
      id: shop.id,
      name: shop.name,
      products: shop.products?.[0]?.count || 0,
      productViews: 0, // Would need separate query per shop
      whatsappClicks: shop.whatsapp_clicks?.[0]?.count || 0,
    };
  }).sort((a, b) => b.whatsappClicks - a.whatsappClicks);
}
