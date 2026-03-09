import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

/**
 * GET  /api/owner/products       → List owner's products
 * POST /api/owner/products       → Create a new product
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

    // Check if user is owner or admin
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

    // Find the owner's shop (admin gets all)
    if (profile.role === "admin") {
      const { data: products, error } = await supabase
        .from("products")
        .select("*, shops ( name )")
        .order("created_at", { ascending: false });

      if (error) {
        return NextResponse.json(
          { success: false, message: error.message },
          { status: 500 }
        );
      }
      return NextResponse.json({ success: true, data: products });
    }

    // Owner sees only their products
    const { data: shop } = await supabase
      .from("shops")
      .select("id")
      .eq("owner_id", user.id)
      .single();

    if (!shop) {
      return NextResponse.json({
        success: true,
        data: [],
        message: "No shop found for this owner",
      });
    }

    const { data: products, error } = await supabase
      .from("products")
      .select("*, shops ( name )")
      .eq("shop_id", shop.id)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: products });
  } catch (error) {
    console.error("[GET /api/owner/products] Exception:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user is owner
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || !["owner", "admin"].includes(profile.role)) {
      return NextResponse.json(
        { success: false, message: "Forbidden - must be owner" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, description, price, image_url, category, stock, shop_id } = body;

    if (!name || price == null) {
      return NextResponse.json(
        { success: false, message: "name and price are required" },
        { status: 400 }
      );
    }

    // Find the owner's shop
    let targetShopId = shop_id;
    
    if (!targetShopId) {
      const { data: shop } = await supabase
        .from("shops")
        .select("id")
        .eq("owner_id", user.id)
        .single();

      if (!shop) {
        return NextResponse.json(
          { success: false, message: "You must create a shop first" },
          { status: 400 }
        );
      }
      targetShopId = shop.id;
    }

    const { data: product, error } = await supabase
      .from("products")
      .insert({
        shop_id: targetShopId,
        name,
        description: description || null,
        price: Number(price),
        image_url: image_url || null,
        category: category || null,
        stock: stock != null ? Number(stock) : 0,
      })
      .select()
      .single();

    if (error) {
      console.error("[POST /api/owner/products] Insert error:", error);
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, data: product, message: "Product created" },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/owner/products] Exception:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
