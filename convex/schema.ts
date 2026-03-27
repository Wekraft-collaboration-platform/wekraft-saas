import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.optional(v.string()), // unique
    occupation: v.optional(v.string()),
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
    primaryUsage: v.optional(v.array(v.string())),

    createdAt: v.number(),
    updatedAt: v.number(),
    planExpiry: v.optional(v.number()), // For temporary upgrades/coupons
    bio: v.optional(v.string()),
    socialLinks: v.optional(v.array(v.string())), // max 3 links (excluding github)
  })
    .index("by_token", ["clerkToken"])
    .index("by_accountType", ["accountType"])
    .index("by_name", ["name"]),
  // ---------------------------------------------

  repositories: defineTable({
    githubId: v.int64(),
    repoName: v.string(),
    repoOwner: v.string(),
    repoFullName: v.string(),
    repoType: v.optional(v.string()),
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
    slug: v.string(), // Globally-unique, URL-safe slug (name + random suffix)
    description: v.optional(v.string()),
    tags: v.optional(v.array(v.string())), // (2-5)
    isPublic: v.boolean(),
    projectLiveLink: v.optional(v.string()),
    // for repo---
    repositoryId: v.optional(v.id("repositories")),
    repoName: v.optional(v.string()),
    repoFullName: v.optional(v.string()),
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
    .index("by_slug", ["slug"])
    .index("by_repository", ["repositoryId"])
    .index("by_public", ["isPublic"])
    .index("by_invite_link", ["inviteLink"]),

  // -------------------------------------------------------

  projectMembers: defineTable({
    projectId: v.id("projects"),
    userId: v.id("users"),
    userName: v.string(),
    userImage: v.optional(v.string()),
    AccessRole: v.optional(v.union(v.literal("admin"), v.literal("member"))),
    joinedAt: v.optional(v.number()),
    leftAt: v.optional(v.number()),
  })
    .index("by_project", ["projectId"])
    .index("by_user", ["userId"])
    .index("by_access_role", ["AccessRole"]),

  // ------------------------------------------------------------
  tasks: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    type: v.string(), // Custom tags like "dashboard", "mobile", "auth"
    priority: v.optional(v.union(v.literal("high"), v.literal("medium"), v.literal("low"))),
    assignedTo: v.optional(
      v.array(
        v.object({
          userId: v.id("users"),
          name: v.string(),
          avatar: v.optional(v.string()),
        }),
      ),
    ),
    status: v.union(
      v.literal("not started"),
      v.literal("inprogress"),
      v.literal("issue"),
      v.literal("reviewing"),
      v.literal("testing"),
      v.literal("completed"),
    ),
    estimation: v.object({
      startDate: v.number(),
      endDate: v.number(),
    }),
    linkWithCodebase: v.optional(v.string()),
    projectId: v.id("projects"),
    createdByUserId: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_project", ["projectId"])
    .index("by_creator", ["createdByUserId"])
    .index("by_status", ["status"])
    .index("by_priority", ["priority"])
    .index("by_project_status", ["projectId", "status"]),
});
