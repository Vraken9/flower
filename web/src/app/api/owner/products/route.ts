import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireRole, AuthError } from "@/lib/api/auth-guard";

/**
 * GET  /api/owner/products       → List owner's products
 * POST /api/owner/products       → Create a new product
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
    const user = await requireRole(request, ["owner", "admin"]);
    const token = request.headers.get("authorization")!.slice(7);
    const supabase = supabaseWithToken(token);

    // Find the owner's shop
    const { data: shop } = await supabase
      .from("shops")
      .select("id")
      .eq("owner_id", user.id)
      .single();

    if (!shop) {
      return NextResponse.json({
        success: true,
        data: [],
        message: "No shop found for this owner",
      });
    }

    const { data: products, error } = await supabase
      .from("products")
      .select("*")
      .eq("shop_id", shop.id)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: products });
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

export async function POST(request: NextRequest) {
  try {
    const user = await requireRole(request, ["owner"]);
    const token = request.headers.get("authorization")!.slice(7);
    const supabase = supabaseWithToken(token);

    const body = await request.json();
    const { name, description, price, image_url, category, stock } = body;

    if (!name || price == null) {
      return NextResponse.json(
        { success: false, message: "name and price are required" },
        { status: 400 }
      );
    }

    // Find the owner's shop
    const { data: shop } = await supabase
      .from("shops")
      .select("id")
      .eq("owner_id", user.id)
      .single();

    if (!shop) {
      return NextResponse.json(
        { success: false, message: "You must create a shop first" },
        { status: 400 }
      );
    }

    const { data: product, error } = await supabase
      .from("products")
      .insert({
        shop_id: shop.id,
        name,
        description: description || null,
        price: Number(price),
        image_url: image_url || null,
        category: category || null,
        stock: stock != null ? Number(stock) : 0,
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
      { success: true, data: product, message: "Product created" },
      { status: 201 }
    );
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
