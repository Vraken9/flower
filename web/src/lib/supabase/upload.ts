import { createClient } from "@/lib/supabase/client";

/**
 * Upload a file to Supabase Storage bucket "images".
 * Returns the public URL on success or null on error.
 *
 * Files are stored under: images/{userId}/{timestamp}-{filename}
 */
export async function uploadImage(
  file: File,
  userId: string
): Promise<{ url: string | null; error: string | null }> {
  // Validate file size (max 5MB)
  const MAX_SIZE = 5 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    return { url: null, error: "Ukuran file maks 5 MB" };
  }

  // Validate file type
  const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!ALLOWED.includes(file.type)) {
    return { url: null, error: "Format file harus JPG, PNG, WebP, atau GIF" };
  }

  const supabase = createClient();

  // Generate unique file path
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const timestamp = Date.now();
  const path = `${userId}/${timestamp}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error } = await supabase.storage
    .from("images")
    .upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    console.error("Upload error:", error);
    return { url: null, error: error.message };
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from("images").getPublicUrl(path);

  return { url: publicUrl, error: null };
}
