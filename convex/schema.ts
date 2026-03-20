import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    clerkToken: v.string(),
    email: v.string(),
    githubUsername: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    last_signIn: v.optional(v.number()),
    accountType: v.union(
      v.literal("free"),
      v.literal("plus"),
      v.literal("pro"),
      v.literal("sclae"),
    ),
    skills: v.optional(v.array(v.string())),
    lastUpdatedSkillsAt: v.optional(v.number()),
    // For Onboarding
    hasCompletedOnboarding: v.boolean(),
    whereFoundPlatform: v.optional(v.string()),
    primaryUsage: v.optional(v.array(v.string())),

    createdAt: v.number(),
    updatedAt: v.number(),
    planExpiry: v.optional(v.number()), // For temporary upgrades/coupons
  })
    .index("by_token", ["clerkToken"])
    .index("by_accountType", ["accountType"]),
  // ---------------------------------------------

  repositories: defineTable({
    githubId: v.int64(),
    repoName: v.string(),
    repoOwner: v.string(),
    repoFullName: v.string(),
    repoUrl: v.string(),
    userId: v.id("users"),
    language: v.optional(v.any()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_github_id", ["githubId"]),
  // --------------------------------------------------

  projects: defineTable({
    projectName: v.string(),
    description: v.optional(v.string()),
    tags: v.optional(v.array(v.string())), // (2-5)
    isPublic: v.boolean(),
    // for repo---
    repositoryId: v.optional(v.id("repositories")),
    repoName: v.optional(v.string()),
    repoFullName: v.optional(v.string()),
    repoOwner: v.optional(v.string()),
    repoUrl: v.optional(v.string()),
    // ----
    thumbnailUrl: v.optional(v.string()),
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
    ownerId: v.id("users"),
    ownerName: v.string(),
    ownerImage: v.string(),
    about: v.optional(v.string()),
    projectStars: v.number(), // wekraft platfrom likes
    projectUpvotes: v.number(),
    inviteLink: v.optional(v.string()),
    projectWorkStatus: v.optional(
      v.union(
        v.literal("ideation"),
        v.literal("validation"),
        v.literal("development"),
        v.literal("beta"),
        v.literal("production"),
        v.literal("scaling"),
      ),
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_owner", ["ownerId"])
    .index("by_owner_name", ["ownerId", "projectName"])
    .index("by_repository", ["repositoryId"])
    .index("by_public", ["isPublic"])
    .index("by_invite_link", ["inviteLink"]),
});
