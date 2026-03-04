import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireRole, AuthError } from "@/lib/api/auth-guard";

/**
 * PUT    /api/owner/products/[id]   → Update a product
 * DELETE /api/owner/products/[id]   → Delete a product
 */

function supabaseWithToken(token: string) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  );
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole(request, ["owner"]);
    const { id } = await params;
    const token = request.headers.get("authorization")!.slice(7);
    const supabase = supabaseWithToken(token);

    const body = await request.json();
    const { name, description, price, image_url, category, stock } = body;

    // Verify the product belongs to the owner's shop (RLS handles this too)
    const { data: product, error: fetchErr } = await supabase
      .from("products")
      .select("id, shop_id, shops!inner(owner_id)")
      .eq("id", id)
      .single();

    if (fetchErr || !product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    // Build update object (only include provided fields)
    const updates: Record<string, unknown> = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (price !== undefined) updates.price = Number(price);
    if (image_url !== undefined) updates.image_url = image_url;
    if (category !== undefined) updates.category = category;
    if (stock !== undefined) updates.stock = Number(stock);

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { success: false, message: "No fields to update" },
        { status: 400 }
      );
    }

    const { data: updated, error } = await supabase
      .from("products")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updated,
      message: "Product updated",
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json(
        { success: false, message: err.message },
        { status: err.status }
      );
    }
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(request, ["owner"]);
    const { id } = await params;
    const token = request.headers.get("authorization")!.slice(7);
    const supabase = supabaseWithToken(token);

    const { error } = await supabase.from("products").delete().eq("id", id);

    if (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Product deleted",
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json(
        { success: false, message: err.message },
        { status: err.status }
      );
    }
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
