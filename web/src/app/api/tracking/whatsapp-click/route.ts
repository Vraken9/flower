import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

/**
 * POST /api/tracking/whatsapp-click
 * Track when a user clicks WhatsApp link on a product
 * 
 * Body: { product_id: string, shop_id: string, session_id?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const body = await request.json();
    const { product_id, shop_id, session_id } = body;

    if (!product_id || !shop_id) {
      return NextResponse.json(
        { success: false, message: "product_id and shop_id are required" },
        { status: 400 }
      );
    }

    // Get user if authenticated
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase.from("whatsapp_clicks").insert({
      product_id,
      shop_id,
      user_id: user?.id || null,
      session_id: session_id || null,
    });

    if (error) {
      console.error("[POST /api/tracking/whatsapp-click] Error:", error);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[POST /api/tracking/whatsapp-click] Exception:", error);
    return NextResponse.json({ success: true });
  }
}
