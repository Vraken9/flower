import { createServiceClient } from "@/lib/supabase/server";

/**
 * Server-side function to ensure a profile row exists for a given auth user.
 * Call this from server actions, API routes, or auth webhooks.
 */
export async function ensureProfile(userId: string, fullName?: string) {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("profiles")
    .upsert(
      {
        id: userId,
        full_name: fullName || "",
        role: "user",
      },
      { onConflict: "id", ignoreDuplicates: true }
    )
    .select()
    .single();

  if (error) {
    console.error("[ensureProfile] Error:", error.message);
    throw error;
  }

  return data;
}
