import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

/**
 * POST /api/tracking/product-view
 * Track when a user views a product
 * 
 * Body: { product_id: string, session_id?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const body = await request.json();
    const { product_id, session_id } = body;

    if (!product_id) {
      return NextResponse.json(
        { success: false, message: "product_id is required" },
        { status: 400 }
      );
    }

    // Get user if authenticated
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase.from("product_views").insert({
      product_id,
      user_id: user?.id || null,
      session_id: session_id || null,
    });

    if (error) {
      console.error("[POST /api/tracking/product-view] Error:", error);
      // Don't fail the request - tracking should be fire-and-forget
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[POST /api/tracking/product-view] Exception:", error);
    return NextResponse.json({ success: true }); // Don't fail tracking requests
  }
}
