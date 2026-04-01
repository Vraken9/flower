import { NextResponse } from "next/server";
import { createServerClient as createSupabaseSSRClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * GET /auth/callback?code=xxx
 * Handles OAuth callback from Supabase (Google sign-in).
 * Exchanges the code for a session and ensures the user has a profile row.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const cookieStore = await cookies();
    const supabase = createSupabaseSSRClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Ensure profile exists for Google OAuth users
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: existing } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", user.id)
          .maybeSingle();

        if (!existing) {
          await supabase.from("profiles").insert({
            id: user.id,
            email: user.email ?? "",
            full_name:
              (user.user_metadata?.full_name as string) ??
              (user.user_metadata?.name as string) ??
              "",
            role: "user",
            avatar_url:
              (user.user_metadata?.avatar_url as string) ?? null,
          });
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Auth error — redirect to login with error message
  return NextResponse.redirect(
    `${origin}/auth/login?error=auth_callback_failed`
  );
}
