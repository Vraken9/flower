"use server";

import { ensureProfile } from "@/lib/supabase/ensure-profile";

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
