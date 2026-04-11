import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";

// =============================
// 1. CREATE ISSUE
// =============================
export const createIssue = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    environment: v.optional(
      v.union(
        v.literal("local"),
        v.literal("dev"),
        v.literal("staging"),
        v.literal("production"),
      ),
    ),
    severity: v.optional(
      v.union(
        v.literal("critical"),
        v.literal("medium"),
        v.literal("low"),
      ),
    ),
    due_date: v.optional(v.number()),
    status: v.union(
      v.literal("not opened"),
      v.literal("opened"),
      v.literal("in review"),
      v.literal("reopened"),
      v.literal("closed"),
    ),
    type: v.union(v.literal("user-created"), v.literal("github")),
    githubIssueUrl: v.optional(v.string()),
    fileLinked: v.optional(v.string()),
    taskId: v.optional(v.id("tasks")),
    projectId: v.id("projects"),
    IssueAssignee: v.optional(
      v.array(
        v.object({
          userId: v.id("users"),
          name: v.string(),
          avatar: v.optional(v.string()),
        }),
      ),
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("clerkToken", identity.tokenIdentifier))
      .unique();

    if (!user) throw new Error("User not found");

    const issueId = await ctx.db.insert("issues", {
      ...args,
      createdByUserId: user._id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return issueId;
  },
});

// =============================
// 2. GET ISSUES (PAGINATED)
// =============================
export const getIssues = query({
  args: {
    projectId: v.id("projects"),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("issues")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

// =============================
// 3. GET FILTERED ISSUES
// =============================
export const getFilteredIssues = query({
  args: {
    projectId: v.id("projects"),
    environment: v.optional(
      v.union(
        v.literal("local"),
        v.literal("dev"),
        v.literal("staging"),
        v.literal("production"),
      ),
    ),
    severity: v.optional(
      v.union(
        v.literal("critical"),
        v.literal("medium"),
        v.literal("low"),
      ),
    ),
    status: v.optional(
      v.union(
        v.literal("not opened"),
        v.literal("opened"),
        v.literal("in review"),
        v.literal("reopened"),
        v.literal("closed"),
      ),
    ),
  },
  handler: async (ctx, args) => {
    let baseQuery = ctx.db
      .query("issues")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId));

    // Custom filtering
    // Note: Convex filters are less efficient than indexes, but for project-specific issues, 
    // it should be fine. If scale grows, we can add composite indexes.
    if (args.environment) {
      baseQuery = baseQuery.filter((q) => q.eq(q.field("environment"), args.environment));
    }
    if (args.severity) {
      baseQuery = baseQuery.filter((q) => q.eq(q.field("severity"), args.severity));
    }
    if (args.status) {
      baseQuery = baseQuery.filter((q) => q.eq(q.field("status"), args.status));
    }

    return await baseQuery.order("desc").collect();
  },
});

// =============================
// 4. UPDATE ISSUE
// =============================
export const updateIssue = mutation({
  args: {
    issueId: v.id("issues"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    fileLinked: v.optional(v.string()),
    environment: v.optional(
      v.union(
        v.literal("local"),
        v.literal("dev"),
        v.literal("staging"),
        v.literal("production"),
      ),
    ),
    severity: v.optional(
      v.union(
        v.literal("critical"),
        v.literal("medium"),
        v.literal("low"),
      ),
    ),
    due_date: v.optional(v.number()),
    status: v.optional(
      v.union(
        v.literal("not opened"),
        v.literal("opened"),
        v.literal("in review"),
        v.literal("reopened"),
        v.literal("closed"),
      ),
    ),
    IssueAssignee: v.optional(
      v.array(
        v.object({
          userId: v.id("users"),
          name: v.string(),
          avatar: v.optional(v.string()),
        }),
      ),
    ),
  },
  handler: async (ctx, args) => {
    const { issueId, ...updates } = args;

    const existing = await ctx.db.get(issueId);
    if (!existing) throw new Error("Issue not found");

    await ctx.db.patch(issueId, {
      ...updates,
      updatedAt: Date.now(),
    });

    return issueId;
  },
});
