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

// ====================================
// GET UPCOMING EVENTS (WITHIN 3 WEEKS)
// ====================================
export const getUpcomingEvents = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("clerkToken", identity.tokenIdentifier)
      )
      .unique();

    if (!user) return [];

    // Owned projects
    const ownedProjects = await ctx.db
      .query("projects")
      .withIndex("by_owner", (q) => q.eq("ownerId", user._id))
      .collect();

    // Joined projects
    const memberships = await ctx.db
      .query("projectMembers")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const joinedProjects: any[] = [];
    for (const m of memberships) {
      const p = await ctx.db.get(m.projectId);
      if (p && p.ownerId !== user._id) {
        joinedProjects.push(p);
      }
    }

    const allProjects = [...ownedProjects, ...joinedProjects];
    const results = [];
    const now = Date.now();
    const threeWeeksFromNow = now + 21 * 24 * 60 * 60 * 1000;

    for (const p of allProjects) {
      const events = await ctx.db
        .query("calendarEvents")
        .withIndex("by_project", (q) => q.eq("projectId", p._id))
        .collect();

      for (const event of events) {
        if (event.start >= now && event.start <= threeWeeksFromNow) {
          results.push({
            _id: event._id,
            title: event.title,
            description: event.description || "",
            start: event.start,
            end: event.end,
            allDay: event.allDay,
            color: event.color || null,
            projectId: p._id,
            projectName: p.projectName,
            projectSlug: p.slug,
            role: p.ownerId === user._id ? "owned" : "joined",
          });
        }
      }
    }

    // Sort by start time ascending
    results.sort((a, b) => a.start - b.start);
    return results.slice(0, 35);
  },
});

