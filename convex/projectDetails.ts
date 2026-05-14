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

// ------------------------------------------------------
// set target date for the project ( 7 days to 1 year) 
// -------------------------------------------------------
export const updateTargetDate = mutation({
  args: {
    projectId: v.id("projects"),
    targetDate: v.number(),
  },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);
    if (!project) throw new Error("Project not found");

    const MS_IN_DAY = 24 * 60 * 60 * 1000;
    const durationDays = (args.targetDate - project.createdAt) / MS_IN_DAY;

    if (durationDays < 7) {
      throw new Error("Project duration must be at least 7 days from creation.");
    }
    if (durationDays > 365) {
      throw new Error("Project deadline cannot exceed 1 year from creation.");
    }

    const existing = await ctx.db
      .query("projectDetails")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        targetDate: args.targetDate,
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

export const updateProjectConfig = mutation({
  args: {
    projectId: v.id("projects"),
    memberCanCreate: v.optional(v.boolean()),
    memberUseKaya: v.optional(v.boolean()),
    kayaThreshold: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("projectDetails")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .unique();

    const updates: {
      memberCanCreate?: boolean;
      memberUseKaya?: boolean;
      kayaThreshold?: number;
    } = {};

    if (args.memberCanCreate !== undefined)
      updates.memberCanCreate = args.memberCanCreate;
    if (args.memberUseKaya !== undefined)
      updates.memberUseKaya = args.memberUseKaya;
    if (args.kayaThreshold !== undefined)
      updates.kayaThreshold = args.kayaThreshold;

    if (existing) {
      await ctx.db.patch(existing._id, updates);
      return existing._id;
    } else {
      return await ctx.db.insert("projectDetails", {
        projectId: args.projectId,
        ...updates,
      });
    }
  },
});
