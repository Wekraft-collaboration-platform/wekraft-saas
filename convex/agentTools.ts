import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const insertCalendarEvent = internalMutation({
  args: {
    projectId: v.id("projects"),
    title: v.string(),
    description: v.string(),
    type: v.union(v.literal("event"), v.literal("milestone")),
    start: v.number(),
    end: v.number(),
    allDay: v.boolean(),
  },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);
    if (!project) throw new Error(`Project not found: ${args.projectId}`);

    const now = Date.now();
    const id = await ctx.db.insert("calendarEvents", {
      projectId: args.projectId,
      creatorId: project.ownerId,
      title: args.title,
      description: args.description,
      type: args.type,
      start: args.start,
      end: args.end,
      allDay: args.allDay,
      color: "#3b82f6",
      createdAt: now,
      updatedAt: now,
    });

    return id;
  },
});
