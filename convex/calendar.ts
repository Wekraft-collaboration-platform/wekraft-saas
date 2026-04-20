import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createEvent = mutation({
  args: {
    projectId: v.id("projects"),
    title: v.string(),
    description: v.optional(v.string()),
    type: v.union(v.literal("event"), v.literal("milestone")),
    start: v.number(),
    end: v.number(),
    allDay: v.boolean(),
    color: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated call to mutation");
    }

    // Get the user from our db using clerkToken
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("clerkToken", identity.tokenIdentifier),
      )
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    const eventId = await ctx.db.insert("calendarEvents", {
      projectId: args.projectId,
      creatorId: user._id,
      title: args.title,
      description: args.description,
      type: args.type,
      start: args.start,
      end: args.end,
      allDay: args.allDay,
      color: args.color,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return eventId;
  },
});

export const getEvents = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      // Return empty if not auth instead of error, so UI can just show empty states cleanly if needed
      return [];
    }

    const events = await ctx.db
      .query("calendarEvents")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    return events;
  },
});

export const updateEvent = mutation({
  args: {
    id: v.id("calendarEvents"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    type: v.optional(v.union(v.literal("event"), v.literal("milestone"))),
    start: v.optional(v.number()),
    end: v.optional(v.number()),
    allDay: v.optional(v.boolean()),
    color: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated call to mutation");
    }

    const { id, ...updates } = args;

    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });

    return id;
  },
});

export const deleteEvent = mutation({
  args: { id: v.id("calendarEvents") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated call to mutation");
    }

    await ctx.db.delete(args.id);
  },
});
