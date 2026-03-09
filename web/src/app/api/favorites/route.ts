import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

/**
 * POST /api/favorites → Toggle a product in/out of favorites
 * GET  /api/favorites → List user's favorites with product details
 * DELETE /api/favorites?product_id=xxx → Remove from favorites
 *
 * Body (POST): { product_id: string }
 * Response: { success, data: { action: "added" | "removed" } }
 */

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { data, error } = await supabase
      .from("favorites")
      .select("*, products(id, shop_id, name, description, price, image_url, category, stock, created_at, shops(id, name, location))")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[GET /api/favorites] Supabase error:", error);
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("[GET /api/favorites] Exception:", error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { product_id } = body;

    if (!product_id) {
      return NextResponse.json(
        { success: false, message: "product_id is required" },
        { status: 400 }
      );
    }

    // Check if already favorited
    const { data: existing } = await supabase
      .from("favorites")
      .select("id")
      .eq("user_id", user.id)
      .eq("product_id", product_id)
      .single();

    if (existing) {
      // Remove favorite
      const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("id", existing.id);

      if (error) {
        return NextResponse.json(
          { success: false, message: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        data: { action: "removed" as const },
        message: "Removed from favorites",
      });
    } else {
      // Add favorite
      const { error } = await supabase
        .from("favorites")
        .insert({ user_id: user.id, product_id });

      if (error) {
        return NextResponse.json(
          { success: false, message: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        data: { action: "added" as const },
        message: "Added to favorites",
      });
    }
  } catch (error) {
    console.error("[POST /api/favorites] Exception:", error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const product_id = searchParams.get("product_id");

    if (!product_id) {
      return NextResponse.json(
        { success: false, message: "product_id is required" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("favorites")
      .delete()
      .eq("user_id", user.id)
      .eq("product_id", product_id);

    if (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Removed from favorites",
    });
  } catch (error) {
    console.error("[DELETE /api/favorites] Exception:", error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
