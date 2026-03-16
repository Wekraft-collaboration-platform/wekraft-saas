import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

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

    // Check for existing project by this owner 
    const existingProject = await ctx.db
      .query("projects")
      .withIndex("by_owner", (q) => q.eq("ownerId", user._id))
      .first();

    // Check if the project name is taken by ANOTHER project of the user
    if (args.projectName) {
      const duplicateName = await ctx.db
        .query("projects")
        .withIndex("by_owner_name", (q) =>
          q.eq("ownerId", user._id).eq("projectName", args.projectName),
        )
        .unique();

      if (duplicateName && duplicateName._id !== existingProject?._id) {
        throw new Error("You already have a project with this name.");
      }
    }

    const validStatuses = ["ideation", "validation", "development", "beta", "production", "scaling"];
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
        projectStars: 0,
        projectUpvotes: 0,
        inviteLink: args.inviteLink,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
  },
});
