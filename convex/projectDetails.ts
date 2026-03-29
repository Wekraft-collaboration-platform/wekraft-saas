import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getProjectDetails = query({
  args: {
    projectId: v.id("projects"),
    repoId: v.optional(v.id("repositories")),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("projectDetails")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .unique();
  },
});

export const updateTargetDate = mutation({
  args: {
    projectId: v.id("projects"),
    targetDate: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("projectDetails")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
         targetDate: args.targetDate 
      });
      return existing._id;
    } else {
      return await ctx.db.insert("projectDetails", {
        projectId: args.projectId,
        targetDate: args.targetDate,
      });
    }
  },
});
