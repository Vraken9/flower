import type { NextConfig } from "next";

// Extract Supabase hostname from env (e.g. "xyz.supabase.co" from "https://xyz.supabase.co")
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseHostname = supabaseUrl.replace(/^https?:\/\//, "");

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      // Supabase Storage (dynamic from env)
      ...(supabaseHostname
        ? [
            {
              protocol: "https" as const,
              hostname: supabaseHostname,
              pathname: "/storage/v1/object/public/**",
            },
          ]
        : []),
      // Placeholder & stock images
      { protocol: "https" as const, hostname: "via.placeholder.com" },
      { protocol: "https" as const, hostname: "images.unsplash.com" },
      { protocol: "https" as const, hostname: "plus.unsplash.com" },
      { protocol: "https" as const, hostname: "loremflickr.com" },
    ],
  },
};

export default nextConfig;
