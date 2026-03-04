/**
 * Integration-style tests for API routes.
 * These tests use the staging Supabase instance.
 *
 * Env vars required:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY
 *   TEST_USER_EMAIL / TEST_USER_PASSWORD
 *   TEST_OWNER_EMAIL / TEST_OWNER_PASSWORD
 *   TEST_ADMIN_EMAIL / TEST_ADMIN_PASSWORD
 *
 * Run: npx vitest run src/__tests__/api-routes.integration.test.ts
 */
import { describe, it, expect, beforeAll } from "vitest";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3000";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);

interface TestTokens {
  user: string;
  owner: string;
  admin: string;
}

const tokens: TestTokens = { user: "", owner: "", admin: "" };

async function login(email: string, password: string): Promise<string> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw new Error(`Login failed for ${email}: ${error.message}`);
  return data.session.access_token;
}

beforeAll(async () => {
  const userEmail = process.env.TEST_USER_EMAIL || "buyer@gmail.com";
  const userPass = process.env.TEST_USER_PASSWORD || "buyer123456";
  const ownerEmail =
    process.env.TEST_OWNER_EMAIL || "owner.edelweis@gmail.com";
  const ownerPass = process.env.TEST_OWNER_PASSWORD || "owner123456";
  const adminEmail =
    process.env.TEST_ADMIN_EMAIL || "admin@flowermarket.com";
  const adminPass = process.env.TEST_ADMIN_PASSWORD || "admin123456";

  tokens.user = await login(userEmail, userPass);
  tokens.owner = await login(ownerEmail, ownerPass);
  tokens.admin = await login(adminEmail, adminPass);
});

function api(path: string, options: RequestInit = {}) {
  return fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
}

function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}` };
}

describe("Profile Ensure", () => {
  it("POST /api/profile/ensure returns 400 without user_id", async () => {
    const res = await api("/api/profile/ensure", {
      method: "POST",
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(400);
  });
});

describe("Favorites", () => {
  it("GET /api/favorites returns 401 without auth", async () => {
    const res = await api("/api/favorites");
    expect(res.status).toBe(401);
  });

  it("GET /api/favorites returns 200 with auth", async () => {
    const res = await api("/api/favorites", {
      headers: authHeaders(tokens.user),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
  });
});

describe("Cart", () => {
  it("GET /api/cart returns 401 without auth", async () => {
    const res = await api("/api/cart");
    expect(res.status).toBe(401);
  });

  it("GET /api/cart returns 200 with auth", async () => {
    const res = await api("/api/cart", {
      headers: authHeaders(tokens.user),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
  });
});

describe("Owner Products", () => {
  it("GET /api/owner/products returns 401 without auth", async () => {
    const res = await api("/api/owner/products");
    expect(res.status).toBe(401);
  });

  it("GET /api/owner/products returns 403 for regular user", async () => {
    const res = await api("/api/owner/products", {
      headers: authHeaders(tokens.user),
    });
    expect(res.status).toBe(403);
  });

  it("GET /api/owner/products returns 200 for owner", async () => {
    const res = await api("/api/owner/products", {
      headers: authHeaders(tokens.owner),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
  });
});

describe("Admin Shop Disable", () => {
  it("POST /api/admin/shops/:id/disable returns 401 without auth", async () => {
    const res = await api("/api/admin/shops/fake-id/disable", {
      method: "POST",
      body: JSON.stringify({ is_active: false }),
    });
    expect(res.status).toBe(401);
  });

  it("POST /api/admin/shops/:id/disable returns 403 for user", async () => {
    const res = await api("/api/admin/shops/fake-id/disable", {
      method: "POST",
      body: JSON.stringify({ is_active: false }),
      headers: authHeaders(tokens.user),
    });
    expect(res.status).toBe(403);
  });
});

describe("Applications", () => {
  it("GET /api/applications returns 401 without auth", async () => {
    const res = await api("/api/applications");
    expect(res.status).toBe(401);
  });

  it("GET /api/applications returns 200 for admin", async () => {
    const res = await api("/api/applications", {
      headers: authHeaders(tokens.admin),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
  });
});
