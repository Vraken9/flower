import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireRole, AuthError } from "@/lib/api/auth-guard";
import { createServiceClient } from "@/lib/supabase/server";

/**
 * POST /api/applications/[id]/review
 *
 * Admin approves or rejects an application.
 *
 * Body: { action: "approve" | "reject", rejection_reason?: string }
 *
 * On approve:
 *   1. Update application status → approved
 *   2. Update user's profile role → owner (via service client)
 *   3. Create a shop row for the user
 */

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireRole(request, ["admin"]);
    const { id } = await params;
    const token = request.headers.get("authorization")!.slice(7);

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    );

    const body = await request.json();
    const { action, rejection_reason } = body;

    if (!["approve", "reject"].includes(action)) {
      return NextResponse.json(
        { success: false, message: 'action must be "approve" or "reject"' },
        { status: 400 }
      );
    }

    // Fetch the application
    const { data: application, error: fetchErr } = await supabase
      .from("applications")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchErr || !application) {
      return NextResponse.json(
        { success: false, message: "Application not found" },
        { status: 404 }
      );
    }

    if (application.status !== "pending") {
      return NextResponse.json(
        { success: false, message: "Application already reviewed" },
        { status: 400 }
      );
    }

    if (action === "reject") {
      const { error } = await supabase
        .from("applications")
        .update({
          status: "rejected",
          reviewed_by: admin.id,
          reviewed_at: new Date().toISOString(),
          rejection_reason: rejection_reason || null,
        })
        .eq("id", id);

      if (error) {
        return NextResponse.json(
          { success: false, message: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Application rejected",
      });
    }

    // APPROVE flow – use service client to bypass RLS for role update
    const serviceClient = createServiceClient();

    // 1. Update application status
    const { error: appErr } = await supabase
      .from("applications")
      .update({
        status: "approved",
        reviewed_by: admin.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (appErr) {
      return NextResponse.json(
        { success: false, message: appErr.message },
        { status: 500 }
      );
    }

    // 2. Promote user to owner role (service client bypasses RLS)
    const { error: roleErr } = await serviceClient
      .from("profiles")
      .update({ role: "owner" })
      .eq("id", application.user_id);

    if (roleErr) {
      console.error("[approve] Role update failed:", roleErr);
      return NextResponse.json(
        { success: false, message: "Approved but role update failed" },
        { status: 500 }
      );
    }

    // 3. Create shop for the new owner
    const { error: shopErr } = await serviceClient.from("shops").insert({
      owner_id: application.user_id,
      name: application.shop_name,
      description: application.shop_description,
      location: application.shop_location,
      is_active: true,
    });

    if (shopErr) {
      console.error("[approve] Shop creation failed:", shopErr);
      // Don't fail the whole operation — role was already updated
    }

    return NextResponse.json({
      success: true,
      message: "Application approved – user promoted to owner",
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
