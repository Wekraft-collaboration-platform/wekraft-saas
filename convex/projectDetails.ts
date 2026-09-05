import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

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

// Helper: Reschedule project duration alerts using Convex Scheduled Functions
async function rescheduleProjectAlerts(ctx: any, projectId: Id<"projects">) {
  const project = await ctx.db.get(projectId);
  if (!project) return;

  const details = await ctx.db
    .query("projectDetails")
    .withIndex("by_project", (q: any) => q.eq("projectId", projectId))
    .unique();

  if (!details) return;

  // 1. Cancel all currently scheduled jobs
  if (details.scheduledJobs && details.scheduledJobs.length > 0) {
    for (const job of details.scheduledJobs) {
      try {
        await ctx.scheduler.cancel(job.jobId);
      } catch (e) {
        console.error(`Failed to cancel scheduled job ${job.jobId}:`, e);
      }
    }
  }

  const newScheduledJobs: { percent: number; jobId: string }[] = [];

  // 2. Schedule new jobs if there is a targetDate and alerts configured
  if (details.targetDate && details.alerts && details.alerts.length > 0) {
    const total = details.targetDate - project.createdAt;

    for (const percent of details.alerts) {
      const triggerTime = Math.round(project.createdAt + total * (percent / 100));

      if (triggerTime > Date.now()) {
        const jobId = await ctx.scheduler.runAt(
          triggerTime,
          internal.notifications.sendProjectDurationAlert,
          {
            projectId,
            alertPercent: percent,
          }
        );
        newScheduledJobs.push({ percent, jobId: jobId as string });
      }
    }
  }

  // 3. Save the new scheduled jobs list
  await ctx.db.patch(details._id, {
    scheduledJobs: newScheduledJobs,
  });
}

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

    let detailsId: Id<"projectDetails">;
    if (existing) {
      await ctx.db.patch(existing._id, {
        targetDate: args.targetDate,
      });
      detailsId = existing._id;
    } else {
      detailsId = await ctx.db.insert("projectDetails", {
        projectId: args.projectId,
        targetDate: args.targetDate,
      });
    }

    await rescheduleProjectAlerts(ctx, args.projectId);
    return detailsId;
  },
});

// Update project duration alerts configuration
export const updateProjectAlerts = mutation({
  args: {
    projectId: v.id("projects"),
    alerts: v.array(v.number()),
  },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);
    if (!project) throw new Error("Project not found");

    const existing = await ctx.db
      .query("projectDetails")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .unique();

    let detailsId: Id<"projectDetails">;
    if (existing) {
      await ctx.db.patch(existing._id, {
        alerts: args.alerts,
      });
      detailsId = existing._id;
    } else {
      detailsId = await ctx.db.insert("projectDetails", {
        projectId: args.projectId,
        alerts: args.alerts,
      });
    }

    await rescheduleProjectAlerts(ctx, args.projectId);
    return detailsId;
  },
});

export const updateProjectConfig = mutation({
  args: {
    projectId: v.id("projects"),
    memberCanCreate: v.optional(v.boolean()),
    memberUseKaya: v.optional(v.boolean()),
    canUseAITeamspace: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("projectDetails")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .unique();

    const updates: {
      memberCanCreate?: boolean;
      memberUseKaya?: boolean;
      canUseAITeamspace?: boolean;
    } = {};

    if (args.memberCanCreate !== undefined)
      updates.memberCanCreate = args.memberCanCreate;
    if (args.memberUseKaya !== undefined)
      updates.memberUseKaya = args.memberUseKaya;
    if (args.canUseAITeamspace !== undefined)
      updates.canUseAITeamspace = args.canUseAITeamspace;

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
