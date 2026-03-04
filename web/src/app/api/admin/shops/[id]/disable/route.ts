import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireRole, AuthError } from "@/lib/api/auth-guard";

/**
 * POST /api/admin/shops/[id]/disable   → Toggle a shop's is_active flag
 *
 * Body: { is_active: boolean }
 * Only admin role can call this.
 */

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(request, ["admin"]);
    const { id } = await params;
    const token = request.headers.get("authorization")!.slice(7);

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    );

    const body = await request.json();
    const isActive = body.is_active ?? false;

    const { data: shop, error } = await supabase
      .from("shops")
      .update({ is_active: isActive })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    if (!shop) {
      return NextResponse.json(
        { success: false, message: "Shop not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: shop,
      message: isActive ? "Shop re-enabled" : "Shop disabled",
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
