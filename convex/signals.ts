import { mutation, query, internalMutation } from "./_generated/server";
import { v } from "convex/values";

// Send a real-time signal (called from Next.js API route)
export const sendSignal = mutation({
  args: { type: v.string(), channelId: v.string(), payload: v.any() },
  handler: async (ctx, { type, channelId, payload }) => {
    const expiresAt = Date.now() + 30_000; // expires in 30 seconds
    await ctx.db.insert("signals", { type, channelId, payload, expiresAt });
  },
});

// Watch a channel — frontend subscribes to this
export const watchChannel = query({
  args: { channelId: v.string() },
  handler: async (ctx, { channelId }) => {
    return ctx.db
      .query("signals")
      .withIndex("by_channel", (q) => q.eq("channelId", channelId))
      .order("desc")
      .take(20);
  },
});

// Cleanup expired signals 
export const cleanupSignals = internalMutation({
  handler: async (ctx) => {
    const expired = await ctx.db
      .query("signals")
      .withIndex("by_expiry", (q) => q.lt("expiresAt", Date.now()))
      .collect();
    await Promise.all(expired.map((s) => ctx.db.delete(s._id)));
  },
});
