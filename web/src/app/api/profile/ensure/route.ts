import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

/**
 * POST /api/profile/ensure
 *
 * Called after signup (or on first login) to guarantee a `profiles` row exists.
 *
 * Body: { user_id: string, full_name?: string }
 *
 * Uses the service-role client so it bypasses RLS.
 * In production, protect with a webhook secret or internal auth check.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, full_name } = body;

    if (!user_id) {
      return NextResponse.json(
        { success: false, message: "user_id is required" },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    // Upsert: insert if not exists, otherwise do nothing (keep existing data)
    const { data, error } = await supabase
      .from("profiles")
      .upsert(
        {
          id: user_id,
          full_name: full_name || "",
          role: "user",
        },
        { onConflict: "id", ignoreDuplicates: true }
      )
      .select()
      .single();

    if (error) {
      console.error("[profile/ensure] upsert error:", error);
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (err: unknown) {
    console.error("[profile/ensure] unexpected error:", err);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
