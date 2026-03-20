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
    const existingProject = userProjects.find(p => p.projectName === args.projectName);

    if (!existingProject) {
      // Trying to create a NEW project
      if (userProjects.length >= limits.project_creation_limit) {
        throw new Error(
          `You've reached your limit of ${limits.project_creation_limit} projects. Please upgrade your plan to create more!`
        );
      }
    }
    // ------------------------------

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
