import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

/**
 * PUT    /api/owner/products/[id]   → Update a product
 * DELETE /api/owner/products/[id]   → Delete a product
 */

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerClient();
    const { id } = await params;
    
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

    const body = await request.json();
    const { name, description, price, image_url, category, stock, shop_id } = body;

    // Verify the product exists and user can edit it
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

    // Check ownership (admin can edit any, owner only their own)
    const shopData = product.shops as unknown as { owner_id: string };
    if (profile.role !== "admin" && shopData.owner_id !== user.id) {
      return NextResponse.json(
        { success: false, message: "You can only edit your own products" },
        { status: 403 }
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
    if (shop_id !== undefined) updates.shop_id = shop_id;

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
      console.error("[PUT /api/owner/products/[id]] Update error:", error);
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
  } catch (error) {
    console.error("[PUT /api/owner/products/[id]] Exception:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerClient();
    const { id } = await params;
    
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

    // Verify the product exists and user can delete it
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

    // Check ownership (admin can delete any, owner only their own)
    const shopData = product.shops as unknown as { owner_id: string };
    if (profile.role !== "admin" && shopData.owner_id !== user.id) {
      return NextResponse.json(
        { success: false, message: "You can only delete your own products" },
        { status: 403 }
      );
    }

    const { error } = await supabase.from("products").delete().eq("id", id);

    if (error) {
      console.error("[DELETE /api/owner/products/[id]] Delete error:", error);
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Product deleted",
    });
  } catch (error) {
    console.error("[DELETE /api/owner/products/[id]] Exception:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
