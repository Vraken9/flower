import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getAuthUser } from "@/lib/api/auth-guard";

/**
 * POST /api/cart/add    → Add / increment item in user's cart
 * GET  /api/cart        → List user's cart items with product details
 * 
 * Body (POST): { product_id: string, qty?: number }
 *
 * Uses upsert with ON CONFLICT to increment quantity.
 */

function supabaseWithToken(token: string) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  );
}

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = request.headers.get("authorization")!.slice(7);
    const supabase = supabaseWithToken(token);

    const { data, error } = await supabase
      .from("cart_items")
      .select("*, products(id, name, price, image_url, stock, shops(name))")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch {
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = request.headers.get("authorization")!.slice(7);
    const supabase = supabaseWithToken(token);

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
      // Update quantity
      const result = await supabase
        .from("cart_items")
        .update({ qty: existing.qty + quantity })
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
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = request.headers.get("authorization")!.slice(7);
    const supabase = supabaseWithToken(token);
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
