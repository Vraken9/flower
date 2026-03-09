"use server";

import { cookies } from "next/headers";
import { ensureProfile } from "@/lib/supabase/ensure-profile";
import { createClient } from "@/lib/supabase/client";

/**
 * Server action: called from the client after a user signs up
 * to guarantee a profiles row is created.
 */
export async function ensureProfileAction(userId: string, fullName?: string) {
  try {
    const profile = await ensureProfile(userId, fullName);
    return { success: true, profile };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unknown error creating profile";
    return { success: false, error: message };
  }
}

/**
 * Server action: Logout user
 * - Calls backend API to invalidate token in Redis blocklist
 * - Clears Supabase session cookies
 * - Returns success/error status
 */
export async function logoutAction(accessToken?: string) {
  try {
    const cookieStore = await cookies();
    
    // Call backend API to add token to Redis blocklist
    if (accessToken) {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      
      try {
        const response = await fetch(`${backendUrl}/api/auth/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          console.warn("Backend logout warning:", await response.text());
        }
      } catch (fetchError) {
        // Log but don't fail - we still want to clear cookies
        console.warn("Backend logout fetch error:", fetchError);
      }
    }

    // Clear all Supabase-related cookies
    const supabaseCookieNames = [
      "sb-access-token",
      "sb-refresh-token",
      "supabase-auth-token",
    ];

    // Also clear cookies with dynamic project prefixes
    const allCookies = cookieStore.getAll();
    for (const cookie of allCookies) {
      if (
        cookie.name.startsWith("sb-") ||
        cookie.name.includes("supabase") ||
        cookie.name.includes("auth-token")
      ) {
        cookieStore.delete(cookie.name);
      }
    }

    // Explicitly delete known cookie names
    for (const name of supabaseCookieNames) {
      try {
        cookieStore.delete(name);
      } catch {
        // Cookie might not exist, ignore
      }
    }

    return { success: true, message: "Logout berhasil" };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Gagal melakukan logout";
    console.error("Logout action error:", message);
    return { success: false, error: message };
  }
}

/**
 * Helper: Get current session from cookies (server-side)
 */
export async function getSessionFromCookies() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("sb-access-token")?.value;
    const refreshToken = cookieStore.get("sb-refresh-token")?.value;

    return {
      accessToken: accessToken || null,
      refreshToken: refreshToken || null,
    };
  } catch {
    return { accessToken: null, refreshToken: null };
  }
}
