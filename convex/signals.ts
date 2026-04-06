import { mutation, query, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { Doc, Id } from "./_generated/dataModel";

// Helper to check if a user is a member of a project
async function checkMembership(ctx: any, projectId: Id<"projects">) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return false;

  const user = await ctx.db
    .query("users")
    .withIndex("by_token", (q: any) => q.eq("clerkToken", identity.tokenIdentifier))
    .unique();

  if (!user) return false;

  const project = await ctx.db.get(projectId);
  if (!project) return false;

  // Owner check
  if (project.ownerId === user._id) return true;

  // Member check
  const member = await ctx.db
    .query("projectMembers")
    .withIndex("by_project", (q: any) => q.eq("projectId", projectId))
    .filter((q: any) => q.eq(q.field("userId"), user._id))
    .unique();

  return !!member;
}

// Send a real-time signal (called from Next.js API route)
export const sendSignal = mutation({
  args: { type: v.string(), channelId: v.string(), payload: v.any() },
  handler: async (ctx, { type, channelId, payload }) => {
    // Only authorized members can send signals
    // Note: The API route should setAuth with the user's token
    const isMember = await checkMembership(ctx, channelId as Id<"projects">);
    if (!isMember) throw new Error("Unauthorized");

    const expiresAt = Date.now() + 30_000; // expires in 30 seconds
    await ctx.db.insert("signals", { type, channelId, payload, expiresAt });
  },
});

// Watch a channel — frontend subscribes to this
export const watchChannel = query({
  args: { channelId: v.string() },
  handler: async (ctx, { channelId }) => {
    // Security: Only members can watch signals for this project
    const isMember = await checkMembership(ctx, channelId as Id<"projects">);
    if (!isMember) return [];

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
