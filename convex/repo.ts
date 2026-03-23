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

    const repos = await ctx.db
      .query("repositories")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const projects = await ctx.db
      .query("projects")
      .withIndex("by_owner", (q) => q.eq("ownerId", user._id))
      .collect();

    return repos.map((repo) => {
      const project = projects.find((p) => p.repositoryId === repo._id);
      return {
        ...repo,
        projectName: project?.projectName,
        projectId: project?._id,
      };
    });
  },
});

// ====================================
// get repo by id
// ====================================
export const getRepositoryById = query({
  args: { repoId: v.optional(v.id("repositories")) },
  handler: async (ctx, args) => {
    if (!args.repoId) return null;
    return await ctx.db.get(args.repoId);
  },
});


