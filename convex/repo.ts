import { mutation, query } from "./_generated/server";
import { v } from "convex/values";


// ====================================
// CONNECT REPO  & update project.
// ====================================
export const connectRepository = mutation({
  args: {
    projectId: v.id("projects"),
    githubId: v.int64(),
    repoName: v.string(),
    repoOwner: v.string(),
    repoFullName: v.string(),
    repoType: v.string(),
    repoUrl: v.string(),
    language: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
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

    // Check if repo already exists for this user
    let repoId = (await ctx.db
      .query("repositories")
      .withIndex("by_github_id", (q) => q.eq("githubId", args.githubId))
      .unique())?._id;

    if (!repoId) {
      repoId = await ctx.db.insert("repositories", {
        githubId: args.githubId,
        repoName: args.repoName,
        repoOwner: args.repoOwner,
        repoFullName: args.repoFullName,
        repoType: args.repoType,
        repoUrl: args.repoUrl,
        userId: user._id,
        language: args.language,
        isWebhookConnected: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }

    // Update project
    await ctx.db.patch(args.projectId, {
      repositoryId: repoId,
      repoName: args.repoName,
      repoFullName: args.repoFullName,
      updatedAt: Date.now(),
    });

    return { success: true, repoId, projectId: args.projectId };
  },
});



export const getConnectedRepos = query({
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

    // Get all projects where the user is either the owner or a member
    const ownedProjects = await ctx.db
      .query("projects")
      .withIndex("by_owner", (q) => q.eq("ownerId", user._id))
      .collect();

    const memberships = await ctx.db
      .query("projectMembers")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const memberProjects = [];
    for (const membership of memberships) {
      const p = await ctx.db.get(membership.projectId);
      if (p) memberProjects.push(p);
    }

    // Combine projects uniquely
    const allProjects = [...ownedProjects];
    const ownedIds = new Set(ownedProjects.map((p) => p._id));
    for (const p of memberProjects) {
      if (!ownedIds.has(p._id)) {
        allProjects.push(p);
      }
    }

    // Gather all linked repositories for these projects
    const linkedRepos = [];
    for (const project of allProjects) {
      if (project.repositoryId) {
        const repo = await ctx.db.get(project.repositoryId);
        if (repo) {
          linkedRepos.push({
            ...repo,
            projectName: project.projectName,
            projectId: project._id,
            projectSlug: project.slug,
          });
        }
      }
    }

    return linkedRepos;
  },
});

// ====================================
// get repo by id
// ====================================
export const getRepositoryById = query({
  args: { repoId: v.optional(v.id("repositories")) },
  handler: async (ctx, args) => {
    if (!args.repoId) return null;
    const repo = await ctx.db.get(args.repoId);
    if (!repo) return null;

    const owner = await ctx.db.get(repo.userId);
    
    // Extract raw clerk ID from tokenIdentifier (e.g., "https://clerk...|user_2...")
    const ownerClerkId = owner?.clerkToken.split("|").pop();

    return {
      ...repo,
      ownerClerkId,
    };
  },
});

export const setWebhookConnected = mutation({
  args: { githubId: v.int64() },
  handler: async (ctx, args) => {
    const repo = await ctx.db
      .query("repositories")
      .withIndex("by_github_id", (q) => q.eq("githubId", args.githubId))
      .unique();

    if (repo) {
      await ctx.db.patch(repo._id, {
        isWebhookConnected: true,
        updatedAt: Date.now(),
      });
    }
  },
});


