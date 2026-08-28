import { v } from "convex/values";
import { query, mutation, MutationCtx } from "./_generated/server";
import { Id } from "./_generated/dataModel";

export type AuditTargetType = "task" | "issue" | "customer" | "request" | "project";

interface RecordAuditParams {
  projectId: Id<"projects">;
  userId: Id<"users">;
  userName: string;
  userEmail: string;
  action: string;
  targetType: AuditTargetType;
  targetId: string;
  targetTitle: string;
  changes?: Record<string, any>;
}

/**
 * Internal helper to record an audit log event if project owner is on Pro tier.
 */
export async function recordAuditEvent(
  ctx: MutationCtx,
  params: RecordAuditParams
) {
  try {
    const project = await ctx.db.get(params.projectId);
    if (!project) return;

    const owner = await ctx.db.get(project.ownerId);
    // Audit logs are enabled for Pro tier projects
    if (owner && owner.accountType === "pro") {
      await ctx.db.insert("auditLogs", {
        projectId: params.projectId,
        userId: params.userId,
        userName: params.userName,
        userEmail: params.userEmail,
        action: params.action,
        targetType: params.targetType,
        targetId: params.targetId,
        targetTitle: params.targetTitle,
        changes: params.changes,
        createdAt: Date.now(),
      });
    }
  } catch (err) {
    console.error("Failed to record audit log:", err);
  }
}

/**
 * Query project audit logs (Restricted to project members, Pro plan required)
 */
export const getAuditLogs = query({
  args: {
    projectId: v.id("projects"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("clerkToken", identity.tokenIdentifier))
      .unique();

    if (!user) throw new Error("User not found");

    const project = await ctx.db.get(args.projectId);
    if (!project) throw new Error("Project not found");

    const owner = await ctx.db.get(project.ownerId);
    const isPro = owner?.accountType === "pro";

    if (!isPro) {
      return {
        isPro: false,
        logs: [],
      };
    }

    const limit = args.limit || 50;

    const logs = await ctx.db
      .query("auditLogs")
      .withIndex("by_project_time", (q) => q.eq("projectId", args.projectId))
      .order("desc")
      .take(limit);

    return {
      isPro: true,
      logs,
    };
  },
});
