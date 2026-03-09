import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createServerClient();
    
    console.log("Testing Supabase connection...");
    console.log("URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log("Key exists:", !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    
    const { data: shops, error: shopError } = await supabase
      .from("shops")
      .select("*")
      .limit(3);
      
    const { data: products, error: productError } = await supabase
      .from("products")
      .select("*, shops(name)")
      .limit(3);
    
    return NextResponse.json({
      success: true,
      shops: shops?.length || 0,
      products: products?.length || 0,
      shopError: shopError?.message || null,
      productError: productError?.message || null,
      sampleShop: shops?.[0] || null,
      sampleProduct: products?.[0] || null,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
