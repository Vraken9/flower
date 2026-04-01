import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

/**
 * GET /api/owner/shop
 * Get the current owner's shop
 */
export async function GET() {
  try {
    const supabase = await createServerClient();

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    // Get user's main shop
    const { data: shop, error } = await supabase
      .from("shops")
      .select("*")
      .eq("owner_id", user.id)
      .is("parent_shop_id", null)
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: shop });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/owner/shop
 * Create a new shop for the current owner
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    // Check if user is an owner
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      return NextResponse.json(
        { success: false, message: "Failed to fetch user profile" },
        { status: 500 }
      );
    }

    if (!profile || profile.role !== "owner") {
      return NextResponse.json(
        {
          success: false,
          message: "Only users with 'owner' role can create shops",
        },
        { status: 403 }
      );
    }

    // Get request body
    const body = await request.json();
    const { name, description, location, kabupaten, kecamatan, image_url, whatsapp, category_id, parent_shop_id } = body;

    // Check if user already has a MAIN shop
    const { data: mainShop, error: existingError } = await supabase
      .from("shops")
      .select("id")
      .eq("owner_id", user.id)
      .is("parent_shop_id", null)
      .maybeSingle();

    if (existingError) {
      return NextResponse.json(
        { success: false, message: "Failed to check existing shop" },
        { status: 500 }
      );
    }

    if (mainShop && !parent_shop_id) {
      return NextResponse.json(
        {
          success: false,
          message: "You already have a main shop. Use PUT to update it or create a branch with parent_shop_id.",
        },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, message: "Shop name is required" },
        { status: 400 }
      );
    }

    if (!whatsapp || !whatsapp.trim()) {
      return NextResponse.json(
        { success: false, message: "WhatsApp number is required for checkout" },
        { status: 400 }
      );
    }

    // Create shop
    const { data: newShop, error } = await supabase
      .from("shops")
      .insert({
        owner_id: user.id,
        name: name.trim(),
        description: description?.trim() || null,
        location: location?.trim() || null,
        kabupaten: kabupaten?.trim() || null,
        kecamatan: kecamatan?.trim() || null,
        image_url: image_url?.trim() || null,
        whatsapp: whatsapp?.trim() || null,
        category_id: category_id || null,
        parent_shop_id: parent_shop_id || null,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      console.error("[POST /api/owner/shop] Error:", error);
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Shop created successfully!",
        data: newShop,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/owner/shop] Exception:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/owner/shop
 * Update the current owner's shop
 */
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createServerClient();

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    // Get request body
    const body = await request.json();
    const { id, name, description, location, kabupaten, kecamatan, image_url, whatsapp, category_id } = body;

    let shopToUpdateId = id;

    if (!shopToUpdateId) {
      // Get user's main shop
      const { data: shop, error: fetchError } = await supabase
        .from("shops")
        .select("id")
        .eq("owner_id", user.id)
        .is("parent_shop_id", null)
        .maybeSingle();

      if (fetchError || !shop) {
        return NextResponse.json(
          { success: false, message: "Shop not found. Create one first." },
          { status: 404 }
        );
      }
      shopToUpdateId = shop.id;
    } else {
      // Verify the owner actually owns this specific branch/shop
      const { data: shop, error: fetchError } = await supabase
        .from("shops")
        .select("id")
        .eq("id", shopToUpdateId)
        .eq("owner_id", user.id)
        .maybeSingle();

      if (fetchError || !shop) {
        return NextResponse.json(
          { success: false, message: "Shop not found or you don't have permission." },
          { status: 404 }
        );
      }
    }

    // Validate required fields
    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, message: "Shop name is required" },
        { status: 400 }
      );
    }

    if (!whatsapp || !whatsapp.trim()) {
      return NextResponse.json(
        { success: false, message: "WhatsApp number is required for checkout" },
        { status: 400 }
      );
    }

    // Update shop
    const { data: updatedShop, error } = await supabase
      .from("shops")
      .update({
        name: name.trim(),
        description: description?.trim() || null,
        location: location?.trim() || null,
        kabupaten: kabupaten?.trim() || null,
        kecamatan: kecamatan?.trim() || null,
        image_url: image_url?.trim() || null,
        whatsapp: whatsapp?.trim() || null,
        category_id: category_id || null,
      })
      .eq("id", shopToUpdateId)
      .select()
      .single();

    if (error) {
      console.error("[PUT /api/owner/shop] Error:", error);
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Shop updated successfully!",
      data: updatedShop,
    });
  } catch (error) {
    console.error("[PUT /api/owner/shop] Exception:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
