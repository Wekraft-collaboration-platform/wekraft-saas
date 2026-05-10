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

    const projectId = await ctx.db.insert("projects", {
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

    // Add owner to projectMembers so they are visible in Teamspace
    await ctx.db.insert("projectMembers", {
      projectId,
      userId: user._id,
      userName: user.name ?? "Owner",
      userImage: user.avatarUrl,
      AccessRole: "owner",
      joinedAt: Date.now(),
    });

    return projectId;
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
      throw new Error(
        "Called projectInitOnboarding without authentication present",
      );
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

      if (stillExists && stillExists._id !== existingDraft._id) {
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
    const count = (
      await ctx.db
        .query("projects")
        .withIndex("by_owner", (q) => q.eq("ownerId", user._id))
        .collect()
    ).length;

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

    const owner = await ctx.db.get(project.ownerId);
    const ownerClerkId = owner?.clerkToken.split("|").pop();

    const projectWithOwner = {
      ...project,
      ownerClerkId,
    };

    // Security: Only return if public OR user is the owner OR user is a member
    if (project.isPublic || (user && project.ownerId === user._id)) {
      return projectWithOwner;
    }

    if (user) {
      const membership = await ctx.db
        .query("projectMembers")
        .withIndex("by_project", (q) => q.eq("projectId", project._id))
        .filter((q) => q.eq(q.field("userId"), user._id))
        .unique();

      if (membership) return projectWithOwner;
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

// ====================================
// GET PROJECT BY INVITE CODE
// ====================================
export const getProjectByInviteCode = query({
  args: { inviteCode: v.string() },
  handler: async (ctx, args) => {
    const project = await ctx.db
      .query("projects")
      .withIndex("by_invite_link", (q) => q.eq("inviteLink", args.inviteCode))
      .unique();

    if (!project) return null;

    return {
      _id: project._id,
      projectName: project.projectName,
      ownerName: project.ownerName,
      ownerImage: project.ownerImage,
      description: project.description,
      isPublic: project.isPublic,
      slug: project.slug,
      ownerId: project.ownerId,
    };
  },
});

// ====================================
// CREATE JOIN REQUEST
// ====================================
export const createJoinRequest = mutation({
  args: {
    projectId: v.id("projects"),
    message: v.optional(v.string()),
    source: v.union(v.literal("invited"), v.literal("manual")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
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

    const project = await ctx.db.get(args.projectId);
    if (!project) {
      throw new Error("Project not found");
    }
    // Check if user is the owner
    if (project.ownerId === user._id) {
      throw new Error("You are the owner of this project");
    }

    // Check if user is already a member
    const existingMember = await ctx.db
      .query("projectMembers")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .filter((q) => q.eq(q.field("userId"), user._id))
      .unique();

    if (existingMember) {
      throw new Error("You are already a member of this project");
    }

    // Check if there is already a pending request
    const existingRequest = await ctx.db
      .query("projectJoinRequests")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .filter((q) => q.eq(q.field("userId"), user._id))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .unique();

    if (existingRequest) {
      throw new Error(
        "You already have a pending join request for this project",
      );
    }

    const requestId = await ctx.db.insert("projectJoinRequests", {
      projectId: args.projectId,
      userId: user._id,
      userName: user.name || "Anonymous",
      userImage: user.avatarUrl,
      message: args.message,
      source: args.source,
      status: "pending",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return requestId;
  },
});

// ====================================
// GET PROJECT PERMISSIONS
// ====================================
export const getProjectPermissions = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity)
      return {
        isOwner: false,
        isAdmin: false,
        isMember: false,
        isViewer: false,
        isPower: false,
      };

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("clerkToken", identity.tokenIdentifier),
      )
      .unique();

    if (!user)
      return {
        isOwner: false,
        isAdmin: false,
        isMember: false,
        isViewer: false,
        isPower: false,
      };

    const project = await ctx.db.get(args.projectId);
    if (!project)
      return {
        isOwner: false,
        isAdmin: false,
        isMember: false,
        isViewer: false,
        isPower: false,
      };

    const isOwner = project.ownerId === user._id;

    const membership = await ctx.db
      .query("projectMembers")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .filter((q) => q.eq(q.field("userId"), user._id))
      .unique();

    const isAdmin = membership?.AccessRole === "admin";
    const isMember = membership?.AccessRole === "member";
    const isViewer = membership?.AccessRole === "viewer";
    const isPower = isOwner || isAdmin;

    return {
      isOwner,
      isAdmin,
      isMember,
      isViewer,
      isPower,
      role: isOwner ? "owner" : membership?.AccessRole || null,
    };
  },
});

export const getProjectPermissionsById = query({
  args: { projectId: v.id("projects"), userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return null;

    const project = await ctx.db.get(args.projectId);
    if (!project) return null;

    const isOwner = project.ownerId === user._id;

    const membership = await ctx.db
      .query("projectMembers")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .filter((q) => q.eq(q.field("userId"), user._id))
      .unique();

    const isAdmin = membership?.AccessRole === "admin";
    const isMember = membership?.AccessRole === "member";
    const isViewer = membership?.AccessRole === "viewer";
    const isPower = isOwner || isAdmin;

    return {
      isOwner,
      isAdmin,
      isMember,
      isViewer,
      isPower,
      role: isOwner ? "owner" : membership?.AccessRole || null,
    };
  },
});

// ====================================
// GET JOIN REQUESTS
// ====================================
export const getProjectJoinRequests = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("clerkToken", identity.tokenIdentifier),
      )
      .unique();

    if (!user) return [];

    const project = await ctx.db.get(args.projectId);
    if (!project) return [];

    const membership = await ctx.db
      .query("projectMembers")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .filter((q) => q.eq(q.field("userId"), user._id))
      .unique();

    const isAuthorized = project.ownerId === user._id || !!membership;

    if (!isAuthorized) {
      throw new Error("Unauthorized to view join requests");
    }

    return await ctx.db
      .query("projectJoinRequests")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .collect();
  },
});

// ====================================
// HANDLE JOIN REQUEST (ACCEPT/REJECT)
// ====================================
export const handleJoinRequest = mutation({
  args: {
    requestId: v.id("projectJoinRequests"),
    action: v.union(v.literal("accepted"), v.literal("rejected")),
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

    const request = await ctx.db.get(args.requestId);
    if (!request) throw new Error("Request not found");

    const project = await ctx.db.get(request.projectId);
    if (!project) throw new Error("Project not found");

    const membership = await ctx.db
      .query("projectMembers")
      .withIndex("by_project", (q) => q.eq("projectId", request.projectId))
      .filter((q) => q.eq(q.field("userId"), user._id))
      .unique();

    const isPower =
      project.ownerId === user._id || membership?.AccessRole === "admin";

    if (!isPower) {
      throw new Error("Unauthorized to handle join requests");
    }

    if (args.action === "accepted") {
      // Add to projectMembers
      const existingMember = await ctx.db
        .query("projectMembers")
        .withIndex("by_project", (q) => q.eq("projectId", request.projectId))
        .filter((q) => q.eq(q.field("userId"), request.userId))
        .unique();

      if (!existingMember) {
        const joiner = await ctx.db.get(request.userId);
        await ctx.db.insert("projectMembers", {
          projectId: request.projectId,
          userId: request.userId,
          userName: request.userName,
          userImage: request.userImage,
          AccessRole: "member",
          joinedAt: Date.now(),
        });
      }
    }

    await ctx.db.patch(args.requestId, {
      status: args.action,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

export const getProjectDetails = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("projectDetails")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .unique();
  },
});

// =============================================
// UPDATE PROJECT SETTINGSTAB
// ============================================
export const updateProject = mutation({
  args: {
    projectId: v.id("projects"),
    description: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    isPublic: v.optional(v.boolean()),
    lookingForMembers: v.optional(
      v.array(
        v.object({
          role: v.string(),
          type: v.union(
            v.literal("casual"),
            v.literal("part-time"),
            v.literal("serious"),
          ),
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

    const project = await ctx.db.get(args.projectId);
    if (!project) throw new Error("Project not found");

    if (project.ownerId !== user._id) {
      throw new Error("Unauthorized");
    }

    const { projectId, ...patches } = args;
    await ctx.db.patch(projectId, {
      ...patches,
      updatedAt: Date.now(),
    });
  },
});
// ---------------------------------------------

export const getProjectMembers = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);
    if (!project) return [];

    const members = await ctx.db
      .query("projectMembers")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    // Ensure the owner is in the list (synthesize if missing)
    const hasOwner = members.some((m) => m.userId === project.ownerId);
    if (!hasOwner) {
      // We don't insert here to keep it a pure query, but we include it in the results
      const ownerUser = await ctx.db.get(project.ownerId);
      if (ownerUser) {
        members.push({
          projectId: project._id,
          userId: project.ownerId,
          userName: ownerUser.name || "Owner",
          userImage: ownerUser.avatarUrl,
          AccessRole: "owner",
          joinedAt: project.createdAt,
        } as any);
      }
    }

    return await Promise.all(
      members.map(async (m) => {
        const user = await ctx.db.get(m.userId);
        return {
          ...m,
          userName: user?.name || m.userName || "Anonymous",
          userImage: user?.avatarUrl || m.userImage || "",
          AccessRole:
            m.AccessRole ||
            (m as any).role ||
            (m.userId === project.ownerId ? "owner" : "member"),
          clerkUserId: user?.clerkToken?.split("|").pop() ?? null,
        };
      }),
    );
  },
});

// ==========================================
// GET JOINED PROJECTS
// ==========================================

export const getJoinedProjects = query({
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

    const memberships = await ctx.db
      .query("projectMembers")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const joinedProjects = await Promise.all(
      memberships.map(async (m) => {
        const p = await ctx.db.get(m.projectId);
        if (!p) return null;

        // Exclude projects where user is owner (they already show in "My Creations")
        if (p.ownerId === user._id) return null;

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
          members: members.slice(0, 4).map((mt) => ({
            userId: mt.userId,
            userImage: mt.userImage,
            userName: mt.userName,
          })),
          totalMembers: members.length,
        };
      }),
    );

    return joinedProjects.filter((p) => p !== null);
  },
});

export const getProjectById = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);
    if (!project) return null;

    const owner = await ctx.db.get(project.ownerId);
    const ownerClerkId = owner?.clerkToken.split("|").pop();

    return {
      ...project,
      ownerClerkId,
    };
  },
});

export const updateProjectThumbnail = mutation({
  args: {
    projectId: v.id("projects"),
    thumbnailUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("clerkToken", identity.tokenIdentifier)
      )
      .unique();

    if (!user) throw new Error("User not found");

    const project = await ctx.db.get(args.projectId);
    if (!project) throw new Error("Project not found");

    if (project.ownerId !== user._id) {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(args.projectId, {
      thumbnailUrl: args.thumbnailUrl,
      updatedAt: Date.now(),
    });
  },
});
