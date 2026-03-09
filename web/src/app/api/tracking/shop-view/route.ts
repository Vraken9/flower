import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

/**
 * POST /api/tracking/shop-view
 * Track when a user views a shop profile
 * 
 * Body: { shop_id: string, session_id?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const body = await request.json();
    const { shop_id, session_id } = body;

    if (!shop_id) {
      return NextResponse.json(
        { success: false, message: "shop_id is required" },
        { status: 400 }
      );
    }

    // Get user if authenticated
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase.from("shop_views").insert({
      shop_id,
      user_id: user?.id || null,
      session_id: session_id || null,
    });

    if (error) {
      console.error("[POST /api/tracking/shop-view] Error:", error);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[POST /api/tracking/shop-view] Exception:", error);
    return NextResponse.json({ success: true });
  }
}
