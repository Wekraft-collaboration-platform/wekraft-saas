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
      v.literal("pro"),
      v.literal("elite"),
    ),
    skills: v.optional(v.array(v.string())),
    lastUpdatedSkillsAt: v.optional(v.number()),
    // For Onboarding
    hasCompletedOnboarding: v.boolean(),
    whereFoundPlatform: v.optional(v.string()),
    primaryUsage: v.optional(v.string()),

    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_token", ["clerkToken"])
  .index("by_accountType", ["accountType"]),

});
