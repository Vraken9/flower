import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

export interface AuthUser {
  id: string;
  email: string;
  role: "user" | "owner" | "admin";
  full_name: string;
}

/**
 * Verify the Bearer token from the request and return the authenticated user
 * with their profile role. Returns null if unauthenticated.
 */
export async function getAuthUser(
  request: NextRequest
): Promise<AuthUser | null> {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const token = authHeader.slice(7);
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  );

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser(token);

  if (authError || !user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  return {
    id: user.id,
    email: user.email || "",
    role: (profile?.role as AuthUser["role"]) || "user",
    full_name: profile?.full_name || "",
  };
}

/**
 * Require specific role(s). Returns the user if authorized, or throws.
 */
export async function requireRole(
  request: NextRequest,
  roles: AuthUser["role"][]
): Promise<AuthUser> {
  const user = await getAuthUser(request);
  if (!user) throw new AuthError("Unauthorized", 401);
  if (!roles.includes(user.role))
    throw new AuthError("Forbidden – insufficient role", 403);
  return user;
}

export class AuthError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}
