import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getPlanLimits } from "./pricing";

// ==================================
// CREATE NEW USER
// ==================================
export const createNewUser = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized sorry !");
    }
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("clerkToken", identity.tokenIdentifier),
      )
      .unique();

    if (user) {
      return user?._id;
    }

    return await ctx.db.insert("users", {
      // Excluded name for later unique constraint
      clerkToken: identity?.tokenIdentifier!,
      email: identity?.email!,
      githubUsername: identity.nickname,
      avatarUrl: identity.pictureUrl,
      accountType: "free",
      hasCompletedOnboarding: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});
// ==================================
// GET USER
// ==================================
export const getCurrentUser = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("clerkToken", identity.tokenIdentifier),
      )
      .unique();

    return user ?? null;
  },
});
// ================================
// UPDATE USER SKILL
// ================================
export const updateUserSkills = mutation({
  args: { skills: v.array(v.string()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Called updateUserSkills without authentication present");
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

    await ctx.db.patch(user._id, {
      skills: args.skills,
      lastUpdatedSkillsAt: Date.now(),
    });
  },
});

// ==================================
// GET USER LIMITS
// ==================================
export const getUserLimits = query({
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

    return getPlanLimits(user);
  },
});

// ==============================
// UPDATES USER FOR ONBOARDING
// =============================

export const updateUserPrimaryUsage = mutation({
  args: { purposes: v.array(v.string()) },
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

    await ctx.db.patch(user._id, {
      primaryUsage: args.purposes,
      updatedAt: Date.now(),
    });
  },
});

export const updateUserIdentity = mutation({
  args: {
    name: v.string(),
    occupation: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("unauthorized");
    }

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("clerkToken", identity.tokenIdentifier))
      .unique();

    if (!currentUser) throw new Error("User not found");

    // Check if name is already taken by a diff user
    const existingUserWithName = await ctx.db
      .query("users")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .unique();

    if (existingUserWithName && existingUserWithName._id !== currentUser._id) {
      throw new Error("Username is already taken");
    }

    await ctx.db.patch(currentUser._id, {
      name: args.name,
      occupation: args.occupation,
    });
  },
});

export const completeOnboarding = mutation({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("clerkToken", identity.tokenIdentifier),
      )
      .unique();

    if (!user) throw new Error("User not found");

    await ctx.db.patch(user._id, {
      hasCompletedOnboarding: true,
      updatedAt: Date.now(),
    });
  },
});

// ==============================
// UPGRADE ACCOUNT (Usage for Coupons/Payments)
// =============================
export const upgradeAccount = mutation({
  args: {
    plan: v.union(v.literal("plus"), v.literal("pro")),
    durationDays: v.optional(v.number()), // e.g., 7 days for a 1-week coupon
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("clerkToken", identity.tokenIdentifier),
      )
      .unique();

    if (!user) throw new Error("User not found");

    let planExpiry = undefined;
    if (args.durationDays) {
      planExpiry = Date.now() + args.durationDays * 24 * 60 * 60 * 1000;
    }

    await ctx.db.patch(user._id, {
      accountType: args.plan,
      planExpiry,
      updatedAt: Date.now(),
    });

    return { success: true, plan: args.plan, expires: planExpiry };
  },
});

// =======================================
// UPDATE USER PROFILE
// =======================================
export const updateUserBio = mutation({
  args: { bio: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("clerkToken", identity.tokenIdentifier),
      )
      .unique();

    if (!user) throw new Error("User not found");

    await ctx.db.patch(user._id, {
      bio: args.bio,
      updatedAt: Date.now(),
    });
  },
});

// Add this to r:\wekraft-saas\convex\user.ts

export const updateSocialLinks = mutation({
  args: { links: v.array(v.string()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("clerkToken", identity.tokenIdentifier),
      )
      .unique();

    if (!user) throw new Error("User not found");

    const trimmedLinks = args.links.slice(0, 3);

    await ctx.db.patch(user._id, {
      socialLinks: trimmedLinks,
      updatedAt: Date.now(),
    });
  },
});
