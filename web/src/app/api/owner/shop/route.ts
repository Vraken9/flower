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

    // Get user's shop
    const { data: shop, error } = await supabase
      .from("shops")
      .select("*")
      .eq("owner_id", user.id)
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

    // Check if user already has a shop
    const { data: existingShop, error: existingError } = await supabase
      .from("shops")
      .select("id")
      .eq("owner_id", user.id)
      .maybeSingle();

    if (existingError) {
      return NextResponse.json(
        { success: false, message: "Failed to check existing shop" },
        { status: 500 }
      );
    }

    if (existingShop) {
      return NextResponse.json(
        {
          success: false,
          message: "You already have a shop. Use PUT to update it.",
        },
        { status: 400 }
      );
    }

    // Get request body
    const body = await request.json();
    const { name, description, location, image_url, whatsapp } = body;

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
        image_url: image_url?.trim() || null,
        whatsapp: whatsapp?.trim() || null,
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

    // Get user's shop
    const { data: shop, error: fetchError } = await supabase
      .from("shops")
      .select("id")
      .eq("owner_id", user.id)
      .maybeSingle();

    if (fetchError) {
      return NextResponse.json(
        { success: false, message: "Failed to fetch shop" },
        { status: 500 }
      );
    }

    if (!shop) {
      return NextResponse.json(
        { success: false, message: "Shop not found. Create one first." },
        { status: 404 }
      );
    }

    // Get request body
    const body = await request.json();
    const { name, description, location, image_url, whatsapp } = body;

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
        image_url: image_url?.trim() || null,
        whatsapp: whatsapp?.trim() || null,
      })
      .eq("id", shop.id)
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
