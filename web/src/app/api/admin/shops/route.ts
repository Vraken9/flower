import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function GET() {
  try {
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
    
    // Get all shops with owner info and product count
    const { data: shops, error } = await supabase
      .from("shops")
      .select(`
        *,
        profiles:owner_id (full_name),
        products (count)
      `)
      .order("created_at", { ascending: false });
    
    if (error) {
      console.error("Error fetching shops:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true, data: shops });
  } catch (err) {
    console.error("Admin shops API error:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
