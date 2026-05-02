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
      v.union(v.literal("critical"), v.literal("medium"), v.literal("low")),
    ),
    due_date: v.optional(v.number()),
    status: v.union(
      v.literal("not opened"),
      v.literal("opened"),
      v.literal("in review"),
      v.literal("reopened"),
      v.literal("closed"),
    ),
    type: v.union(v.literal("manual"), v.literal("github")),
    githubIssueUrl: v.optional(v.string()),
    fileLinked: v.optional(v.string()),
    taskId: v.optional(v.id("tasks")),
    projectId: v.id("projects"),
    assignees: v.optional(
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
      .withIndex("by_token", (q) =>
        q.eq("clerkToken", identity.tokenIdentifier),
      )
      .unique();

    if (!user) throw new Error("User not found");

    const { assignees, ...issueData } = args;

    const issueId = await ctx.db.insert("issues", {
      ...issueData,
      createdByUserId: user._id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Handle Assignees
    if (assignees && assignees.length > 0) {
      await Promise.all(
        assignees.map((assignee) =>
          ctx.db.insert("issueAssignees", {
            issueId,
            userId: assignee.userId,
            name: assignee.name,
            avatar: assignee.avatar,
            projectId: args.projectId,
          }),
        ),
      );
    }

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
    const results = await ctx.db
      .query("issues")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .order("desc")
      .paginate(args.paginationOpts);

    const issuesWithAssignees = await Promise.all(
      results.page.map(async (issue) => {
        const assignees = await ctx.db
          .query("issueAssignees")
          .withIndex("by_issue", (q) => q.eq("issueId", issue._id))
          .collect();
        return { ...issue, assignedTo: assignees };
      }),
    );

    return { ...results, page: issuesWithAssignees };
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
      v.union(v.literal("critical"), v.literal("medium"), v.literal("low")),
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

    if (args.environment) {
      baseQuery = baseQuery.filter((q) =>
        q.eq(q.field("environment"), args.environment),
      );
    }
    if (args.severity) {
      baseQuery = baseQuery.filter((q) =>
        q.eq(q.field("severity"), args.severity),
      );
    }
    if (args.status) {
      baseQuery = baseQuery.filter((q) => q.eq(q.field("status"), args.status));
    }

    const issues = await baseQuery.order("desc").collect();

    const issuesWithAssignees = await Promise.all(
      issues.map(async (issue) => {
        const assignees = await ctx.db
          .query("issueAssignees")
          .withIndex("by_issue", (q) => q.eq("issueId", issue._id))
          .collect();
        return { ...issue, assignedTo: assignees };
      }),
    );

    return issuesWithAssignees;
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
      v.union(v.literal("critical"), v.literal("medium"), v.literal("low")),
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
    assignees: v.optional(
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
    const { issueId, assignees, ...updates } = args;

    const existing = await ctx.db.get(issueId);
    if (!existing) throw new Error("Issue not found");

    await ctx.db.patch(issueId, {
      ...updates,
      updatedAt: Date.now(),
    });

    // Handle Assignees update if provided
    if (assignees !== undefined) {
      // 1. Delete existing assignees
      const existingAssignees = await ctx.db
        .query("issueAssignees")
        .withIndex("by_issue", (q) => q.eq("issueId", issueId))
        .collect();

      await Promise.all(existingAssignees.map((a) => ctx.db.delete(a._id)));

      // 2. Insert new assignees
      await Promise.all(
        assignees.map((assignee) =>
          ctx.db.insert("issueAssignees", {
            issueId,
            userId: assignee.userId,
            name: assignee.name,
            avatar: assignee.avatar,
            projectId: existing.projectId,
          }),
        ),
      );
    }

    return issueId;
  },
});
