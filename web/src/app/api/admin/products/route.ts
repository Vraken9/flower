import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
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
    
    const body = await request.json();
    const { shop_id, name, description, price, stock, category, image_url } = body;
    
    if (!shop_id || !name) {
      return NextResponse.json(
        { success: false, error: "Shop ID and product name are required" },
        { status: 400 }
      );
    }
    
    // Verify shop exists
    const { data: shop } = await supabase
      .from("shops")
      .select("id")
      .eq("id", shop_id)
      .single();
    
    if (!shop) {
      return NextResponse.json(
        { success: false, error: "Shop not found" },
        { status: 404 }
      );
    }
    
    // Insert product
    const { data: product, error } = await supabase
      .from("products")
      .insert({
        shop_id,
        name,
        description: description || null,
        price: price || 0,
        stock: stock || 0,
        category: category || null,
        image_url: image_url || null,
      })
      .select()
      .single();
    
    if (error) {
      console.error("Error creating product:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true, data: product });
  } catch (err) {
    console.error("Admin products API error:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
