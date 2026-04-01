import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

/**
 * GET  /api/reviews?product_id=xxx  → Get reviews for a product
 * GET  /api/reviews?shop_id=xxx     → Get reviews for a shop
 * POST /api/reviews                 → Submit a review (public, no auth needed)
 */

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("product_id");
    const shopId = searchParams.get("shop_id");

    let query = supabase.from("reviews").select("*").order("created_at", { ascending: false });

    if (productId) {
      query = query.eq("product_id", productId);
    } else if (shopId) {
      query = query.eq("shop_id", shopId);
    } else {
      return NextResponse.json(
        { success: false, message: "product_id or shop_id is required" },
        { status: 400 }
      );
    }

    const { data, error } = await query;

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
    const supabase = await createServerClient();
    const body = await request.json();

    const { product_id, shop_id, reviewer_name, rating, comment } = body;

    if (!reviewer_name?.trim()) {
      return NextResponse.json(
        { success: false, message: "Nama reviewer harus diisi" },
        { status: 400 }
      );
    }

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, message: "Rating harus antara 1-5" },
        { status: 400 }
      );
    }

    if (!product_id && !shop_id) {
      return NextResponse.json(
        { success: false, message: "product_id atau shop_id harus diisi" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("reviews")
      .insert({
        product_id: product_id || null,
        shop_id: shop_id || null,
        reviewer_name: reviewer_name.trim(),
        rating: Number(rating),
        comment: comment?.trim() || null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, data, message: "Review berhasil dikirim" },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
