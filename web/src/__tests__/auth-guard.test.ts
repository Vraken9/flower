/**
 * Unit tests for the auth-guard helper.
 * Mocks Supabase – no network calls.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// We need to mock @supabase/supabase-js before importing auth-guard
vi.mock("@supabase/supabase-js", () => {
  const mockSelect = vi.fn();
  const mockEq = vi.fn();
  const mockSingle = vi.fn();
  const mockFrom = vi.fn(() => ({
    select: mockSelect.mockReturnValue({
      eq: mockEq.mockReturnValue({
        single: mockSingle,
      }),
    }),
  }));

  const mockGetUser = vi.fn();

  return {
    createClient: vi.fn(() => ({
      auth: {
        getUser: mockGetUser,
      },
      from: mockFrom,
    })),
    __mocks: { mockGetUser, mockFrom, mockSelect, mockEq, mockSingle },
  };
});

// Now import after mocking
import { getAuthUser, requireRole, AuthError } from "@/lib/api/auth-guard";
import { createClient } from "@supabase/supabase-js";

// Access the mocks
const mocks = (await import("@supabase/supabase-js")) as any;
const { mockGetUser, mockSingle } = mocks.__mocks;

function fakeRequest(token?: string) {
  const headers = new Map<string, string>();
  if (token) headers.set("authorization", `Bearer ${token}`);
  return {
    headers: {
      get: (key: string) => headers.get(key) || null,
    },
  } as any;
}

describe("getAuthUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns null when no authorization header", async () => {
    const result = await getAuthUser(fakeRequest());
    expect(result).toBeNull();
  });

  it("returns null when auth.getUser fails", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: null },
      error: { message: "Invalid token" },
    });
    const result = await getAuthUser(fakeRequest("bad-token"));
    expect(result).toBeNull();
  });

  it("returns user with role when everything succeeds", async () => {
    mockGetUser.mockResolvedValue({
      data: {
        user: { id: "user-123", email: "test@example.com" },
      },
      error: null,
    });
    mockSingle.mockResolvedValue({
      data: { role: "owner", full_name: "Test User" },
    });

    const result = await getAuthUser(fakeRequest("valid-token"));
    expect(result).toEqual({
      id: "user-123",
      email: "test@example.com",
      role: "owner",
      full_name: "Test User",
    });
  });
});

describe("requireRole", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("throws 401 when not authenticated", async () => {
    try {
      await requireRole(fakeRequest(), ["admin"]);
      expect.fail("Should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(AuthError);
      expect((err as AuthError).status).toBe(401);
    }
  });

  it("throws 403 when role doesn't match", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "u1", email: "a@b.com" } },
      error: null,
    });
    mockSingle.mockResolvedValue({
      data: { role: "user", full_name: "Regular" },
    });

    try {
      await requireRole(fakeRequest("token"), ["admin"]);
      expect.fail("Should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(AuthError);
      expect((err as AuthError).status).toBe(403);
    }
  });

  it("returns user when role matches", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "u1", email: "a@b.com" } },
      error: null,
    });
    mockSingle.mockResolvedValue({
      data: { role: "admin", full_name: "Admin" },
    });

    const user = await requireRole(fakeRequest("token"), ["admin"]);
    expect(user.role).toBe("admin");
  });
});
