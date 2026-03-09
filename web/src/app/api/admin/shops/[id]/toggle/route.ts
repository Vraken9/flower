import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createServerClient();
    
    // Check if user is admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    
    if (profile?.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Forbidden - Admin only" },
        { status: 403 }
      );
    }
    
    const body = await request.json();
    const { is_active } = body;
    
    const { data, error } = await supabase
      .from("shops")
      .update({ is_active, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();
    
    if (error) {
      console.error("Error toggling shop:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error("Toggle shop API error:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
