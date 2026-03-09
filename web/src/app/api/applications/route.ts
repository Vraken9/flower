import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

/**
 * GET  /api/applications → List own applications (user) or all (admin)
 * POST /api/applications → Submit a new owner application
 */

export async function GET() {
  try {
    const supabase = await createServerClient();
    
    // Get authenticated user with profile
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !authUser) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get user role from profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", authUser.id)
      .maybeSingle();

    if (profileError) {
      console.error("[GET /api/applications] Profile error:", profileError);
      return NextResponse.json(
        { success: false, message: "Failed to fetch user profile" },
        { status: 500 }
      );
    }

    const userRole = profile?.role || "user";

    let query = supabase.from("applications").select("*");

    // Admins see all, users see only their own (RLS handles this too)
    if (userRole !== "admin") {
      query = query.eq("user_id", authUser.id);
    }

    const { data, error } = await query.order("created_at", {
      ascending: false,
    });

    if (error) {
      console.error("[GET /api/applications] Supabase error:", error);
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("[GET /api/applications] Exception:", error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    
    // Get authenticated user with profile
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !authUser) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get user role from profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", authUser.id)
      .maybeSingle();

    if (profileError) {
      console.error("[POST /api/applications] Profile error:", profileError);
      return NextResponse.json(
        { success: false, message: "Failed to fetch user profile" },
        { status: 500 }
      );
    }

    const userRole = profile?.role || "user";

    // Only 'user' role can apply (owners/admins already have elevated roles)
    if (userRole !== "user") {
      return NextResponse.json(
        { success: false, message: "You already have an elevated role" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { shop_name, shop_description, shop_location, motivation, whatsapp } = body;

    if (!shop_name) {
      return NextResponse.json(
        { success: false, message: "shop_name is required" },
        { status: 400 }
      );
    }

    if (!whatsapp) {
      return NextResponse.json(
        { success: false, message: "WhatsApp number is required" },
        { status: 400 }
      );
    }

    // Check for existing pending application
    const { data: existing, error: existingError } = await supabase
      .from("applications")
      .select("id")
      .eq("user_id", authUser.id)
      .eq("status", "pending")
      .maybeSingle();

    // If there's an error (not "not found"), return it
    if (existingError && existingError.code !== 'PGRST116') {
      console.error("[POST /api/applications] Check existing error:", existingError);
      return NextResponse.json(
        { success: false, message: existingError.message },
        { status: 500 }
      );
    }

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          message: "You already have a pending application",
        },
        { status: 409 }
      );
    }

    const { data, error } = await supabase
      .from("applications")
      .insert({
        user_id: authUser.id,
        shop_name,
        shop_description: shop_description || null,
        shop_location: shop_location || null,
        motivation: motivation || null,
        whatsapp: whatsapp || null,
      })
      .select()
      .single();

    if (error) {
      console.error("[POST /api/applications] Supabase error:", error);
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, data, message: "Application submitted" },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/applications] Exception:", error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
