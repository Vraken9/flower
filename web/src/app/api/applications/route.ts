import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getAuthUser, requireRole, AuthError } from "@/lib/api/auth-guard";

/**
 * GET  /api/applications        → List own applications (user) or all (admin)
 * POST /api/applications        → Submit a new owner application
 */

function supabaseWithToken(token: string) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  );
}

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = request.headers.get("authorization")!.slice(7);
    const supabase = supabaseWithToken(token);

    let query = supabase.from("applications").select("*");

    // Admins see all, users see only their own (RLS handles this too)
    if (user.role !== "admin") {
      query = query.eq("user_id", user.id);
    }

    const { data, error } = await query.order("created_at", {
      ascending: false,
    });

    if (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch {
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Only 'user' role can apply (owners/admins already have elevated roles)
    if (user.role !== "user") {
      return NextResponse.json(
        { success: false, message: "You already have an elevated role" },
        { status: 400 }
      );
    }

    const token = request.headers.get("authorization")!.slice(7);
    const supabase = supabaseWithToken(token);

    const body = await request.json();
    const { shop_name, shop_description, shop_location, motivation } = body;

    if (!shop_name) {
      return NextResponse.json(
        { success: false, message: "shop_name is required" },
        { status: 400 }
      );
    }

    // Check for existing pending application
    const { data: existing } = await supabase
      .from("applications")
      .select("id")
      .eq("user_id", user.id)
      .eq("status", "pending")
      .single();

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
        user_id: user.id,
        shop_name,
        shop_description: shop_description || null,
        shop_location: shop_location || null,
        motivation: motivation || null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, data, message: "Application submitted" },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
