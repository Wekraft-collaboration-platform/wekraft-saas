import { ConvexError, v } from "convex/values";
import { mutation, query, internalQuery } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { encryptField, decryptField } from "./encryption";

// Helper: Ensure the authenticated user is an Owner or Admin of the project
async function requireOwnerOrAdmin(ctx: any, projectId: Id<"projects">, userId: Id<"users">) {
  const project = await ctx.db.get(projectId);
  if (!project) throw new ConvexError("Project not found");

  if (project.ownerId === userId) {
    return { isOwner: true, isAdmin: true, role: "owner" as const };
  }

  const member = await ctx.db
    .query("projectMembers")
    .withIndex("by_project", (q: any) => q.eq("projectId", projectId))
    .filter((q: any) => q.eq(q.field("userId"), userId))
    .first();

  if (member?.AccessRole === "owner" || member?.AccessRole === "admin") {
    return { isOwner: member.AccessRole === "owner", isAdmin: true, role: member.AccessRole };
  }

  throw new ConvexError("Unauthorized: Only project Owners and Admins can manage MCP integrations.");
}

/**
 * Returns all active MCP connections for a given project (safe metadata for UI)
 */
export const getConnectionsByProject = query({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const connections = await ctx.db
      .query("mcpConnections")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    // Map to safe UI representation (omit encrypted raw tokens)
    return connections.map((conn) => ({
      _id: conn._id,
      connectorId: conn.connectorId,
      agent: conn.agent,
      isConnected: conn.isConnected,
      connectedByUserId: conn.connectedByUserId,
      connectedByUserName: conn.connectedByUserName,
      metadata: conn.metadata,
      createdAt: conn.createdAt,
      updatedAt: conn.updatedAt,
    }));
  },
});

/**
 * Checks if current user is an Owner or Admin for this project
 */
export const getUserProjectRole = query({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return { canManage: false, role: null };

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("clerkToken", identity.tokenIdentifier))
      .unique();

    if (!user) return { canManage: false, role: null };

    const project = await ctx.db.get(args.projectId);
    if (!project) return { canManage: false, role: null };

    if (project.ownerId === user._id) {
      return { canManage: true, role: "owner" as const, userId: user._id, userName: user.name || user.email };
    }

    const member = await ctx.db
      .query("projectMembers")
      .withIndex("by_project", (q: any) => q.eq("projectId", args.projectId))
      .filter((q: any) => q.eq(q.field("userId"), user._id))
      .first();

    if (member?.AccessRole === "owner" || member?.AccessRole === "admin") {
      return { canManage: true, role: member.AccessRole, userId: user._id, userName: user.name || user.email };
    }

    return { canManage: false, role: member?.AccessRole || "member", userId: user._id, userName: user.name || user.email };
  },
});

/**
 * Connect or update an MCP connector (Owner / Admin only)
 */
export const connectTool = mutation({
  args: {
    projectId: v.id("projects"),
    connectorId: v.string(), // "linear", "slack", "sentry", etc.
    agent: v.union(v.literal("kaya"), v.literal("harry")),
    credentials: v.string(), // API Key / Token plaintext to encrypt
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Unauthorized: Please sign in");

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("clerkToken", identity.tokenIdentifier))
      .unique();

    if (!user) throw new ConvexError("User not found");

    // Guard: Only Owner or Admin can manage integrations
    await requireOwnerOrAdmin(ctx, args.projectId, user._id);

    const encryptedCredentials = await encryptField(args.credentials);

    const existing = await ctx.db
      .query("mcpConnections")
      .withIndex("by_project_connector", (q) =>
        q.eq("projectId", args.projectId).eq("connectorId", args.connectorId)
      )
      .first();

    const userName = user.name || user.email.split("@")[0] || "Admin";

    if (existing) {
      await ctx.db.patch(existing._id, {
        credentials: encryptedCredentials,
        isConnected: true,
        agent: args.agent,
        connectedByUserId: user._id,
        connectedByUserName: userName,
        metadata: args.metadata ?? existing.metadata,
        updatedAt: Date.now(),
      });
      return { success: true, connectionId: existing._id };
    }

    const newId = await ctx.db.insert("mcpConnections", {
      projectId: args.projectId,
      connectorId: args.connectorId,
      agent: args.agent,
      credentials: encryptedCredentials,
      isConnected: true,
      connectedByUserId: user._id,
      connectedByUserName: userName,
      metadata: args.metadata,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return { success: true, connectionId: newId };
  },
});

/**
 * Disconnect an MCP connector (Owner / Admin only)
 */
export const disconnectTool = mutation({
  args: {
    projectId: v.id("projects"),
    connectorId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Unauthorized: Please sign in");

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("clerkToken", identity.tokenIdentifier))
      .unique();

    if (!user) throw new ConvexError("User not found");

    // Guard: Only Owner or Admin can manage integrations
    await requireOwnerOrAdmin(ctx, args.projectId, user._id);

    const existing = await ctx.db
      .query("mcpConnections")
      .withIndex("by_project_connector", (q) =>
        q.eq("projectId", args.projectId).eq("connectorId", args.connectorId)
      )
      .first();

    if (existing) {
      // Disconnect and remove sensitive credentials
      await ctx.db.delete(existing._id);
    }

    return { success: true };
  },
});

/**
 * Saves an OAuth 2.0 connection callback (called securely from OAuth callback routes)
 */
export const saveOAuthConnection = mutation({
  args: {
    projectId: v.id("projects"),
    connectorId: v.string(), // "linear", "notion", "sentry", etc.
    agent: v.union(v.literal("kaya"), v.literal("harry")),
    accessToken: v.string(),
    userId: v.optional(v.id("users")),
    userName: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);
    if (!project) throw new ConvexError("Project not found");

    const encryptedCredentials = await encryptField(args.accessToken);

    const existing = await ctx.db
      .query("mcpConnections")
      .withIndex("by_project_connector", (q) =>
        q.eq("projectId", args.projectId).eq("connectorId", args.connectorId)
      )
      .first();

    let finalUserId = args.userId ?? project.ownerId;
    let finalUserName = args.userName;

    if (args.userId) {
      const u = await ctx.db.get(args.userId);
      if (u) {
        finalUserName = u.name || u.email.split("@")[0] || finalUserName;
      }
    }

    if (!finalUserName) {
      finalUserName = project.ownerName ?? "Project Admin";
    }

    const now = Date.now();

    if (existing) {
      await ctx.db.patch(existing._id, {
        credentials: encryptedCredentials,
        isConnected: true,
        agent: args.agent,
        connectedByUserId: finalUserId,
        connectedByUserName: finalUserName,
        metadata: args.metadata ?? existing.metadata,
        updatedAt: now,
      });
      return { success: true, connectionId: existing._id };
    }

    const newId = await ctx.db.insert("mcpConnections", {
      projectId: args.projectId,
      connectorId: args.connectorId,
      agent: args.agent,
      credentials: encryptedCredentials,
      isConnected: true,
      connectedByUserId: finalUserId,
      connectedByUserName: finalUserName,
      metadata: args.metadata,
      createdAt: now,
      updatedAt: now,
    });

    return { success: true, connectionId: newId };
  },
});

/**
 * Internal query to fetch active MCP connections with decrypted credentials for the AI Agent
 */
export const getActiveMCPConnectionsWithTokens = internalQuery({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const connections = await ctx.db
      .query("mcpConnections")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .filter((q) => q.eq(q.field("isConnected"), true))
      .collect();

    const results = [];
    for (const conn of connections) {
      let decryptedToken = "";
      if (conn.credentials) {
        try {
          decryptedToken = (await decryptField(conn.credentials)) || "";
        } catch (e) {
          console.error(`Failed to decrypt credentials for connector ${conn.connectorId}:`, e);
        }
      }

      results.push({
        _id: conn._id,
        connectorId: conn.connectorId,
        agent: conn.agent,
        accessToken: decryptedToken,
        connectedByUserId: conn.connectedByUserId,
        connectedByUserName: conn.connectedByUserName,
        metadata: conn.metadata,
        updatedAt: conn.updatedAt,
      });
    }

    return results;
  },
});

