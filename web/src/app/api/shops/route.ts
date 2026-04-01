import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

/**
 * GET /api/shops?ids=id1,id2,id3
 * Fetch shop info for given IDs (used by cart grouping)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const idsParam = request.nextUrl.searchParams.get("ids");

    if (!idsParam) {
      return NextResponse.json(
        { success: false, message: "ids parameter required" },
        { status: 400 }
      );
    }

    const ids = idsParam.split(",").filter(Boolean);

    if (ids.length === 0) {
      return NextResponse.json({ success: true, data: [] });
    }

    const { data, error } = await supabase
      .from("shops")
      .select("id, name, whatsapp, location, image_url")
      .in("id", ids);

    if (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: data || [] });
  } catch (error) {
    console.error("[GET /api/shops] Exception:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
