/**
 * Dummy Photos Script
 * ===================
 * Populates product & shop image_url columns with flower/plant images
 * from Unsplash (or placeholder fallback).
 *
 * Usage:
 *   node scripts/dummy-photos.mjs                    # default: update all empty image_urls
 *   node scripts/dummy-photos.mjs --dry-run           # preview changes without writing
 *   node scripts/dummy-photos.mjs --limit 5           # limit to N rows
 *   node scripts/dummy-photos.mjs --upload            # download + upload to Supabase Storage
 *
 * Env vars required:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from "@supabase/supabase-js";

// ──────────────────────────────────────────
//  CONFIG
// ──────────────────────────────────────────
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error(
    "❌  Missing env vars: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY"
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Unsplash flower/plant photo IDs (free, commercial OK)
const FLOWER_PHOTOS = [
  "https://images.unsplash.com/photo-1490750967868-88aa4f44baee?w=600",
  "https://images.unsplash.com/photo-1455659817273-f96807779a8a?w=600",
  "https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=600",
  "https://images.unsplash.com/photo-1508610048659-a06b669e3321?w=600",
  "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?w=600",
  "https://images.unsplash.com/photo-1494972308805-463bc619d34e?w=600",
  "https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=600",
  "https://images.unsplash.com/photo-1457089328109-e5d9bd499191?w=600",
  "https://images.unsplash.com/photo-1519378058457-4c29a0a2efac?w=600",
  "https://images.unsplash.com/photo-1490750967868-88aa4f44baee?w=600",
  "https://images.unsplash.com/photo-1468327768560-75b778cbb551?w=600",
  "https://images.unsplash.com/photo-1548586196-aa5803b77379?w=600",
  "https://images.unsplash.com/photo-1574263867128-a3d5c1b1decc?w=600",
  "https://images.unsplash.com/photo-1496062031456-07b8f162a322?w=600",
  "https://images.unsplash.com/photo-1531501410720-c8d437636169?w=600",
  "https://images.unsplash.com/photo-1596438459194-f275867a60ee?w=600",
];

const SHOP_PHOTOS = [
  "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600",
  "https://images.unsplash.com/photo-1562290383-751f7ad5f1e0?w=600",
  "https://images.unsplash.com/photo-1445853997832-a17e46dcab66?w=600",
  "https://images.unsplash.com/photo-1585222515068-7201a72c4181?w=600",
  "https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=600",
  "https://images.unsplash.com/photo-1536750698870-1c3e1c2f46e3?w=600",
];

// ──────────────────────────────────────────
//  PARSE ARGS
// ──────────────────────────────────────────
const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const UPLOAD_MODE = args.includes("--upload");
const limitIdx = args.indexOf("--limit");
const LIMIT = limitIdx !== -1 ? parseInt(args[limitIdx + 1], 10) : Infinity;

function pick(arr, idx) {
  return arr[idx % arr.length];
}

// ──────────────────────────────────────────
//  UPLOAD HELPERS
// ──────────────────────────────────────────
async function downloadImage(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to download: ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

async function uploadToStorage(bucket, path, buffer) {
  // Ensure bucket exists (ignore error if already exists)
  await supabase.storage.createBucket(bucket, { public: true }).catch(() => {});

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, buffer, {
      contentType: "image/jpeg",
      upsert: true,
    });

  if (error) throw error;

  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(data.path);

  return publicUrl;
}

// ──────────────────────────────────────────
//  MAIN
// ──────────────────────────────────────────
async function main() {
  console.log("🌸 Dummy Photos Script");
  console.log(`   Mode: ${DRY_RUN ? "DRY RUN" : UPLOAD_MODE ? "UPLOAD" : "URL-ONLY"}`);
  console.log(`   Limit: ${LIMIT === Infinity ? "all" : LIMIT}`);
  console.log();

  // ── PRODUCTS ──
  const { data: products, error: pErr } = await supabase
    .from("products")
    .select("id, name, image_url")
    .or("image_url.is.null,image_url.eq.")
    .limit(LIMIT);

  if (pErr) {
    console.error("Error fetching products:", pErr.message);
  } else {
    console.log(`📦 Products without images: ${products.length}`);
    for (let i = 0; i < products.length; i++) {
      const p = products[i];
      const unsplashUrl = pick(FLOWER_PHOTOS, i);
      let finalUrl = unsplashUrl;

      if (UPLOAD_MODE && !DRY_RUN) {
        try {
          const buf = await downloadImage(unsplashUrl);
          finalUrl = await uploadToStorage(
            "product-images",
            `dummy/${p.id}.jpg`,
            buf
          );
          console.log(`   ⬆ Uploaded: ${p.name} → ${finalUrl}`);
        } catch (e) {
          console.error(`   ❌ Upload failed for ${p.name}:`, e.message);
          continue;
        }
      }

      if (DRY_RUN) {
        console.log(`   [DRY] ${p.name} → ${finalUrl}`);
      } else {
        const { error } = await supabase
          .from("products")
          .update({ image_url: finalUrl })
          .eq("id", p.id);
        if (error) {
          console.error(`   ❌ Update failed for ${p.name}:`, error.message);
        } else {
          console.log(`   ✅ ${p.name} → ${finalUrl.substring(0, 60)}…`);
        }
      }
    }
  }

  console.log();

  // ── SHOPS ──
  const { data: shops, error: sErr } = await supabase
    .from("shops")
    .select("id, name, image_url")
    .or("image_url.is.null,image_url.eq.")
    .limit(LIMIT);

  if (sErr) {
    console.error("Error fetching shops:", sErr.message);
  } else {
    console.log(`🏪 Shops without images: ${shops.length}`);
    for (let i = 0; i < shops.length; i++) {
      const s = shops[i];
      const unsplashUrl = pick(SHOP_PHOTOS, i);
      let finalUrl = unsplashUrl;

      if (UPLOAD_MODE && !DRY_RUN) {
        try {
          const buf = await downloadImage(unsplashUrl);
          finalUrl = await uploadToStorage(
            "shop-images",
            `dummy/${s.id}.jpg`,
            buf
          );
          console.log(`   ⬆ Uploaded: ${s.name} → ${finalUrl}`);
        } catch (e) {
          console.error(`   ❌ Upload failed for ${s.name}:`, e.message);
          continue;
        }
      }

      if (DRY_RUN) {
        console.log(`   [DRY] ${s.name} → ${finalUrl}`);
      } else {
        const { error } = await supabase
          .from("shops")
          .update({ image_url: finalUrl })
          .eq("id", s.id);
        if (error) {
          console.error(`   ❌ Update failed for ${s.name}:`, error.message);
        } else {
          console.log(`   ✅ ${s.name} → ${finalUrl.substring(0, 60)}…`);
        }
      }
    }
  }

  console.log("\n🎉 Done!");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
