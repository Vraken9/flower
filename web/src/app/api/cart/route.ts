import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

/**
 * GET  /api/cart        → List user's cart items with product details
 * POST /api/cart        → Add / set item in user's cart
 * DELETE /api/cart?product_id=xxx → Remove item from cart
 *
 * Body (POST): { product_id: string, qty?: number }
 * Uses cookie-based auth via createServerClient.
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

    const { data, error } = await supabase
      .from("cart_items")
      .select("*, products(*)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, items: data });
  } catch {
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

    const body = await request.json();
    const { product_id, qty } = body;
    const quantity = qty || 1;

    if (!product_id) {
      return NextResponse.json(
        { success: false, message: "product_id is required" },
        { status: 400 }
      );
    }

    // Check if item already in cart
    const { data: existing } = await supabase
      .from("cart_items")
      .select("id, qty")
      .eq("user_id", user.id)
      .eq("product_id", product_id)
      .single();

    let data;
    let error;

    if (existing) {
      // Update quantity (set to the given value, not increment)
      const result = await supabase
        .from("cart_items")
        .update({ qty: quantity })
        .eq("id", existing.id)
        .select()
        .single();
      data = result.data;
      error = result.error;
    } else {
      // Insert new cart item
      const result = await supabase
        .from("cart_items")
        .insert({
          user_id: user.id,
          product_id,
          qty: quantity,
        })
        .select()
        .single();
      data = result.data;
      error = result.error;
    }

    if (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
      message: existing ? "Cart updated" : "Added to cart",
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("product_id");

    if (!productId) {
      return NextResponse.json(
        { success: false, message: "product_id query param required" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("user_id", user.id)
      .eq("product_id", productId);

    if (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Item removed from cart",
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
