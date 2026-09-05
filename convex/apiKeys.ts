import { mutation } from "./_generated/server";
import { v } from "convex/values";

// ============================================================
// IDE EXTENSION – AUTH HANDSHAKE
// ============================================================

// Helper: generate a cryptographically random hex string
function randomHex(bytes: number): string {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  return Array.from(arr)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// -------------------------------------------------------
// GET OR CREATE a permanent API key for the logged-in user
// -------------------------------------------------------
export const getOrCreateApiKey = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("clerkToken", identity.tokenIdentifier)
      )
      .unique();

    if (!user) throw new Error("User not found");

    // Return existing key if present
    const existing = await ctx.db
      .query("userApiKeys")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();

    if (existing) return existing.key;

    // Create a new permanent key
    const key = `wk_${randomHex(32)}`; // 64-char hex key prefixed with "wk_"
    await ctx.db.insert("userApiKeys", {
      userId: user._id,
      key,
      createdAt: Date.now(),
    });

    return key;
  },
});

// -------------------------------------------------------
// CREATE a short-lived one-time handshake token (5 min TTL)
// -------------------------------------------------------
export const createHandshakeToken = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("clerkToken", identity.tokenIdentifier)
      )
      .unique();

    if (!user) throw new Error("User not found");

    const token = randomHex(32); // 64-char hex token
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

    await ctx.db.insert("handshakeTokens", {
      token,
      userId: user._id,
      expiresAt,
    });

    return token;
  },
});

// -------------------------------------------------------
// EXCHANGE the handshake token for userId + apiKey
// Called by the IDE extension. Token is DELETED after use.
// -------------------------------------------------------
export const exchangeHandshakeToken = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const record = await ctx.db
      .query("handshakeTokens")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .unique();

    if (!record) {
      throw new Error("Invalid or already-used token");
    }

    if (Date.now() > record.expiresAt) {
      // Clean up expired token
      await ctx.db.delete(record._id);
      throw new Error("Token has expired");
    }

    // Delete token immediately — one-time use
    await ctx.db.delete(record._id);

    // Get or create the permanent API key
    const existing = await ctx.db
      .query("userApiKeys")
      .withIndex("by_user", (q) => q.eq("userId", record.userId))
      .unique();

    let apiKey: string;

    if (existing) {
      apiKey = existing.key;
    } else {
      apiKey = `wk_${Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("")}`;
      await ctx.db.insert("userApiKeys", {
        userId: record.userId,
        key: apiKey,
        createdAt: Date.now(),
      });
    }

    return {
      userId: record.userId,
      apiKey,
    };
  },
});
