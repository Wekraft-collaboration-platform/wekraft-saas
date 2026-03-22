import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getPlanLimits } from "./pricing";

// =============================
// CREATE PROJECT
// =============================
export const projectInit = mutation({
  args: {
    projectName: v.string(),
    isPublic: v.boolean(),
    projectStatus: v.string(),
    inviteLink: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Called projectInit without authentication present");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("clerkToken", identity.tokenIdentifier),
      )
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    // --- PRICING & LIMITS CHECK ---
    const limits = getPlanLimits(user);
    const userProjects = await ctx.db
      .query("projects")
      .withIndex("by_owner", (q) => q.eq("ownerId", user._id))
      .collect();

    // Check for existing project by this owner with EXACT SAME NAME (for updates)
    const existingProject = userProjects.find(
      (p) => p.projectName === args.projectName,
    );

    if (!existingProject) {
      // Trying to create a NEW project
      if (userProjects.length >= limits.project_creation_limit) {
        throw new Error(
          `You've reached your limit of ${limits.project_creation_limit} projects. Please upgrade your plan to create more!`,
        );
      }
    }
    // ------------------------------

    const validStatuses = [
      "ideation",
      "validation",
      "development",
      "beta",
      "production",
      "scaling",
    ];
    if (!validStatuses.includes(args.projectStatus)) {
      throw new Error("Invalid project status selected.");
    }

    if (existingProject) {
      await ctx.db.patch(existingProject._id, {
        projectName: args.projectName,
        isPublic: args.isPublic,
        projectWorkStatus: args.projectStatus as any,
        updatedAt: Date.now(),
      });
      return existingProject._id;
    } else {
      // Check for unique invite link (only on new project creation)
      const existingProjectWithInvite = await ctx.db
        .query("projects")
        .withIndex("by_invite_link", (q) => q.eq("inviteLink", args.inviteLink))
        .unique();

      if (existingProjectWithInvite) {
        throw new Error("Invite link already exists.");
      }

      return await ctx.db.insert("projects", {
        projectName: args.projectName,
        isPublic: args.isPublic,
        projectWorkStatus: args.projectStatus as any,
        ownerId: user._id,
        ownerName: user.name,
        ownerImage: user.avatarUrl ?? "",
        projectUpvotes: 0,
        inviteLink: args.inviteLink,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
  },
});

// ====================================
// GET USER PROJECTS with members
// ====================================
export const getUserProjects = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("clerkToken", identity.tokenIdentifier),
      )
      .unique();

    if (!user) return [];

    const projects = await ctx.db
      .query("projects")
      .withIndex("by_owner", (q) => q.eq("ownerId", user._id))
      .collect();

    const projectsWithMembers = await Promise.all(
      projects.map(async (p) => {
        const members = await ctx.db
          .query("projectMembers")
          .withIndex("by_project", (q) => q.eq("projectId", p._id))
          .collect();

        return {
          _id: p._id,
          projectName: p.projectName,
          isPublic: p.isPublic,
          thumbnailUrl: p.thumbnailUrl,
          repoId: p.repositoryId,
          repoName: p.repoName,
          projectWorkStatus: p.projectWorkStatus,
          members: members.slice(0, 4).map((m) => ({
            userId: m.userId,
            userImage: m.userImage,
            userName: m.userName,
          })),
          totalMembers: members.length,
        };
      }),
    );

    return projectsWithMembers;
  },
});

// ====================================
// GET PROJECT BY ID
// ====================================
export const getProjectById = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);
    if (!project) return null;

    const identity = await ctx.auth.getUserIdentity();
    const user = identity
      ? await ctx.db
          .query("users")
          .withIndex("by_token", (q) =>
            q.eq("clerkToken", identity.tokenIdentifier),
          )
          .unique()
      : null;

    // Security: Only return if public OR the user is the owner
    if (project.isPublic || (user && project.ownerId === user._id)) {
      return project;
    }

    return null;
  },
});

// ============================================
// getUnlinkedProjects query. It retrieves all projects owned by the user that don't have a 
// repositoryId or repoName.
// ============================================
export const getUnlinkedProjects = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("clerkToken", identity.tokenIdentifier),
      )
      .unique();

    if (!user) return [];

    const projects = await ctx.db
      .query("projects")
      .withIndex("by_owner", (q) => q.eq("ownerId", user._id))
      .collect();

    return projects.filter((p) => !p.repositoryId && !p.repoName);
  },
});
