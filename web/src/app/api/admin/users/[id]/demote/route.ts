import { NextRequest, NextResponse } from "next/server";
import { createServerClient, createServiceClient } from "@/lib/supabase/server";

/**
 * POST /api/admin/users/[id]/demote
 * Demote an owner back to user role (admin only)
 * Also deactivates their shop
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Forbidden" },
        { status: 403 }
      );
    }

    const { id: targetUserId } = await params;

    // Cannot demote yourself
    if (targetUserId === user.id) {
      return NextResponse.json(
        { success: false, message: "Tidak bisa menurunkan diri sendiri" },
        { status: 400 }
      );
    }

    // Check target user exists and is an owner
    const { data: targetProfile } = await supabase
      .from("profiles")
      .select("role, full_name")
      .eq("id", targetUserId)
      .single();

    if (!targetProfile) {
      return NextResponse.json(
        { success: false, message: "User tidak ditemukan" },
        { status: 404 }
      );
    }

    if (targetProfile.role !== "owner") {
      return NextResponse.json(
        { success: false, message: "User ini bukan owner" },
        { status: 400 }
      );
    }

    // Use service client to bypass RLS
    const serviceClient = createServiceClient();

    // 1. Demote role to user
    const { error: roleErr } = await serviceClient
      .from("profiles")
      .update({ role: "user" })
      .eq("id", targetUserId);

    if (roleErr) {
      console.error("[demote] Role update failed:", roleErr);
      return NextResponse.json(
        { success: false, message: "Gagal mengubah role" },
        { status: 500 }
      );
    }

    // 2. Deactivate their shop(s)
    const { error: shopErr } = await serviceClient
      .from("shops")
      .update({ is_active: false })
      .eq("owner_id", targetUserId);

    if (shopErr) {
      console.error("[demote] Shop deactivation failed:", shopErr);
      // Don't fail — role already updated
    }

    return NextResponse.json({
      success: true,
      message: `${targetProfile.full_name || "User"} berhasil diturunkan menjadi user`,
    });
  } catch (error) {
    console.error("[POST /api/admin/users/[id]/demote] Exception:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
