import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getPlanLimits } from "./pricing";
import { customAlphabet } from "nanoid";

const slugId = customAlphabet("0123456789abcdefghijklmnopqrstuvwxyz", 5);

function slugifyProjectName(name: string) {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return base.length ? base : "project";
}

// =============================
// CREATE PROJECT
// =============================
export const projectInit = mutation({
  args: {
    projectName: v.string(),
    description: v.optional(v.string()),
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

    if (userProjects.length >= limits.project_creation_limit) {
      throw new Error(
        `You've reached your limit of ${limits.project_creation_limit} projects. Please upgrade your plan to create more!`,
      );
    }

    // Check for unique invite link (only on new project creation)
    const existingProjectWithInvite = await ctx.db
      .query("projects")
      .withIndex("by_invite_link", (q) => q.eq("inviteLink", args.inviteLink))
      .unique();

    if (existingProjectWithInvite) {
      throw new Error("Invite link already exists.");
    }

    // Create globally-unique slug: "<kebab-name>-<5 random chars>"
    const slugBase = slugifyProjectName(args.projectName);
    let slug = `${slugBase}-${slugId()}`;
    for (let attempt = 0; attempt < 10; attempt++) {
      const existingBySlug = await ctx.db
        .query("projects")
        .withIndex("by_slug", (q) => q.eq("slug", slug))
        .unique();
      if (!existingBySlug) break;
      slug = `${slugBase}-${slugId()}`;
    }

    const stillExists = await ctx.db
      .query("projects")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();
    if (stillExists) {
      throw new Error("Could not create a unique project slug. Please retry.");
    }

    return await ctx.db.insert("projects", {
      projectName: args.projectName,
      slug,
      description: args.description,
      isPublic: args.isPublic,
      projectWorkStatus: args.projectStatus as any,
      ownerId: user._id,
      ownerName: user.name ?? "",
      ownerImage: user.avatarUrl ?? "",
      projectUpvotes: 0,
      inviteLink: args.inviteLink,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// =============================
// CREATE / UPDATE ONBOARDING DRAFT PROJECT
// =============================
export const projectInitOnboarding = mutation({
  args: {
    projectName: v.string(),
    description: v.optional(v.string()),
    isPublic: v.boolean(),
    projectStatus: v.string(),
    inviteLink: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Called projectInitOnboarding without authentication present");
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

    const userProjects = await ctx.db
      .query("projects")
      .withIndex("by_owner", (q) => q.eq("ownerId", user._id))
      .collect();

    const unlinkedProjects = userProjects
      .filter((p) => !p.repositoryId && !p.repoName)
      .sort((a, b) => b.createdAt - a.createdAt);

    const existingDraft = unlinkedProjects[0];

    if (existingDraft) {
      // Only allow a globally-unique invite link
      const existingProjectWithInvite = await ctx.db
        .query("projects")
        .withIndex("by_invite_link", (q) => q.eq("inviteLink", args.inviteLink))
        .unique();

      if (
        existingProjectWithInvite &&
        existingProjectWithInvite._id !== existingDraft._id
      ) {
        throw new Error("Invite link already exists.");
      }

      // Regenerate slug based on latest project name, enforcing global uniqueness
      const slugBase = slugifyProjectName(args.projectName);
      let slug = `${slugBase}-${slugId()}`;

      for (let attempt = 0; attempt < 10; attempt++) {
        const existingBySlug = await ctx.db
          .query("projects")
          .withIndex("by_slug", (q) => q.eq("slug", slug))
          .unique();

        if (!existingBySlug) break;
        if (existingBySlug._id === existingDraft._id) break;

        slug = `${slugBase}-${slugId()}`;
      }

      const stillExists = await ctx.db
        .query("projects")
        .withIndex("by_slug", (q) => q.eq("slug", slug))
        .unique();

      if (
        stillExists &&
        stillExists._id !== existingDraft._id
      ) {
        throw new Error(
          "Could not update a unique project slug. Please retry.",
        );
      }

      await ctx.db.patch(existingDraft._id, {
        projectName: args.projectName,
        slug,
        description: args.description,
        isPublic: args.isPublic,
        projectWorkStatus: args.projectStatus as any,
        inviteLink: args.inviteLink,
        updatedAt: Date.now(),
      });

      return existingDraft._id;
    }

    // No draft exists -> create one (onboarding only enforces slug+invite uniqueness)
    const existingProjectWithInvite = await ctx.db
      .query("projects")
      .withIndex("by_invite_link", (q) => q.eq("inviteLink", args.inviteLink))
      .unique();

    if (existingProjectWithInvite) {
      throw new Error("Invite link already exists.");
    }

    // Create globally-unique slug: "<kebab-name>-<5 random chars>"
    const slugBase = slugifyProjectName(args.projectName);
    let slug = `${slugBase}-${slugId()}`;
    // Extremely low collision risk, but enforce uniqueness globally.
    for (let attempt = 0; attempt < 10; attempt++) {
      const existingBySlug = await ctx.db
        .query("projects")
        .withIndex("by_slug", (q) => q.eq("slug", slug))
        .unique();
      if (!existingBySlug) break;
      slug = `${slugBase}-${slugId()}`;
    }

    const stillExists = await ctx.db
      .query("projects")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();
    if (stillExists) {
      throw new Error("Could not create a unique project slug. Please retry.");
    }

    return await ctx.db.insert("projects", {
      projectName: args.projectName,
      slug,
      description: args.description,
      isPublic: args.isPublic,
      projectWorkStatus: args.projectStatus as any,
      ownerId: user._id,
      ownerName: user.name ?? "",
      ownerImage: user.avatarUrl ?? "",
      projectUpvotes: 0,
      inviteLink: args.inviteLink,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// ====================================
// GET PROJECT USAGE
// ====================================
export const getProjectUsage = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("clerkToken", identity.tokenIdentifier),
      )
      .unique();

    if (!user) return null;

    const limits = getPlanLimits(user);
    const count = (await ctx.db
      .query("projects")
      .withIndex("by_owner", (q) => q.eq("ownerId", user._id))
      .collect()).length;

    return {
      canCreate: count < limits.project_creation_limit,
      currentCount: count,
      limit: limits.project_creation_limit,
      accountType: user.accountType,
    };
  },
});

// ====================================
// GET USER PROJECTS with members (LIMITED )
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
          slug: p.slug,
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
// GET PROJECT BY SLUG
// ====================================
export const getProjectBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const project = await ctx.db
      .query("projects")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
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

    let isMember = false;
    if (user) {
      const member = await ctx.db
        .query("projectMembers")
        .withIndex("by_project", (q) => q.eq("projectId", project._id))
        .filter((q) => q.eq(q.field("userId"), user._id))
        .unique();
      isMember = !!member;
    }

    // Security: Only return if public OR the user is the owner OR a project member
    if (project.isPublic || (user && project.ownerId === user._id) || isMember) {
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

// ============================================
// VERIFY PROJECT MEMBERSHIP
// ============================================
export const isProjectMember = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return false;

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("clerkToken", identity.tokenIdentifier),
      )
      .unique();

    if (!user) return false;

    const project = await ctx.db.get(args.projectId);
    if (!project) return false;

    // Check if user is owner
    if (project.ownerId === user._id) return true;

    // Check membership
    const member = await ctx.db
      .query("projectMembers")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .filter((q) => q.eq(q.field("userId"), user._id))
      .unique();

    return !!member;
  },
});
