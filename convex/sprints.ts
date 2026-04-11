import { v } from "convex/values";
import { mutation, query } from "./_generated/server";


// =============================
// 2. GET SPRINTS BY PROJECT
// =============================
export const getSprintsByProject = query({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("sprints")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();
  },
});

// =============================
// 3. UPDATE SPRINT (including status/sprintId logic)
// =============================
export const updateSprint = mutation({
  args: {
    sprintId: v.id("sprints"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    status: v.optional(v.union(v.literal("active"), v.literal("completed"), v.literal("planned"))),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { sprintId, ...updates } = args;
    await ctx.db.patch(sprintId, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

// =============================
// 4. LINK TASK/ISSUE TO SPRINT
// =============================
export const linkItemToSprint = mutation({
  args: {
    itemId: v.union(v.id("tasks"), v.id("issues")),
    sprintId: v.optional(v.id("sprints")),
  },
  handler: async (ctx, args) => {
    const { itemId, sprintId } = args;
    await ctx.db.patch(itemId as any, { sprintId });
  },
});

// =============================
// 5. DELETE SPRINT
// =============================
export const deleteSprint = mutation({
  args: {
    sprintId: v.id("sprints"),
  },
  handler: async (ctx, args) => {
    // Unlink any tasks/issues
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_sprint", (q) => q.eq("sprintId", args.sprintId))
      .collect();
    for (const task of tasks) {
      await ctx.db.patch(task._id, { sprintId: undefined });
    }

    const issues = await ctx.db
      .query("issues")
      .withIndex("by_sprint", (q) => q.eq("sprintId", args.sprintId))
      .collect();
    for (const issue of issues) {
      await ctx.db.patch(issue._id, { sprintId: undefined });
    }

    await ctx.db.delete(args.sprintId);
  },
});
