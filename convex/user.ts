import { mutation, query, internalMutation } from "./_generated/server";
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

export const getUserByClerkToken = query({
  args: { clerkToken: v.string() },
  handler: async (ctx, args) => {
    // Try exact match first
    const exact = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("clerkToken", args.clerkToken))
      .unique();
    if (exact) return exact;

    // Try finding by suffix if it's just the Clerk user_id
    const all = await ctx.db.query("users").collect();
    return (
      all.find(
        (u) =>
          u.clerkToken === args.clerkToken ||
          u.clerkToken.endsWith(`|${args.clerkToken}`),
      ) ?? null
    );
  },
});

export const checkUsernameAvailability = query({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const currentUser = identity
      ? await ctx.db
        .query("users")
        .withIndex("by_token", (q) =>
          q.eq("clerkToken", identity.tokenIdentifier),
        )
        .unique()
      : null;

    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .unique();

    if (existingUser && currentUser && existingUser._id === currentUser._id) {
      return true; // It's them, so it's available
    }

    return !existingUser;
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
      .withIndex("by_token", (q) =>
        q.eq("clerkToken", identity.tokenIdentifier),
      )
      .unique();

    if (!currentUser) throw new Error("User not found");

    if (args.name.length < 3 || args.name.length > 20) {
      throw new Error("Username must be between 3 and 20 characters");
    }

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
// UPGRADE ACCOUNT (Coupons / internal server flows ONLY)
// SECURITY: This is intentionally an internalMutation — it MUST NOT be public.
// Any authenticated browser client can call public mutations, which would allow
// users to grant themselves free Pro access via the browser console.
// This can only be called from other Convex server functions.
// =============================
export const upgradeAccount = internalMutation({
  args: {
    userId: v.id("users"),
    plan: v.union(v.literal("plus"), v.literal("pro")),
    durationDays: v.optional(v.number()), // e.g., 7 days for a 1-week coupon
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");

    let planExpiry = undefined;
    if (args.durationDays) {
      planExpiry = Date.now() + args.durationDays * 24 * 60 * 60 * 1000;
    }

    await ctx.db.patch(args.userId, {
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

    const trimmedLinks = args.links.slice(0, 20);

    await ctx.db.patch(user._id, {
      socialLinks: trimmedLinks,
      updatedAt: Date.now(),
    });
  },
});

// ==================================
// GET USER BY ID (name + avatar + accountType)
// ==================================
export const getUserById = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return null;
    return {
      name: user.name ?? "Unknown",
      avatarUrl: user.avatarUrl ?? null,
      accountType: user.accountType,
      clerkToken: user.clerkToken,
      email: user.email,
    };
  },
});

export const getUserByName = query({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .unique();
  },
});

export const updateGithubUsername = mutation({
  args: { githubUsername: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    // console.log("Mutation args:", args);

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("clerkToken", identity.tokenIdentifier),
      )
      .unique();

    if (!user) throw new Error("User not found");

    console.log("Found user in DB:", user);

    await ctx.db.patch(user._id, {
      githubUsername: args.githubUsername,
      updatedAt: Date.now(),
    });
  },
});

export const updatePlanInternal = internalMutation({
  args: { userId: v.id("users"), plan: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      accountType: args.plan as "free" | "plus" | "pro",
    });
    console.log(`[Payments] Updated user ${args.userId} to plan ${args.plan}`);
  },
});

export const updateUserSubscriptionInternal = internalMutation({
  args: {
    userId: v.id("users"),
    // plan is optional here — if omitted, we only update status fields (e.g. past_due)
    plan: v.optional(v.union(v.literal("free"), v.literal("plus"), v.literal("pro"))),
    subscriptionId: v.optional(v.string()),
    customerId: v.optional(v.string()),
    status: v.optional(v.string()),
    currentPeriodEnd: v.optional(v.number()),
    provider: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const patch: Record<string, any> = {
      subscriptionId: args.subscriptionId,
      customerId: args.customerId,
      subscriptionStatus: args.status,
      currentPeriodEnd: args.currentPeriodEnd,
      subscriptionProvider: args.provider,
      updatedAt: Date.now(),
    };

    // Only update accountType when a plan is explicitly provided.
    // This prevents 'past_due' webhooks from silently downgrading users.
    if (args.plan !== undefined) {
      patch.accountType = args.plan;
    }

    await ctx.db.patch(args.userId, patch);
    console.log(
      `[Payments] Subscription updated: user=${args.userId}, plan=${args.plan ?? "unchanged"}, status=${args.status}, provider=${args.provider}`
    );
  },
});

export const getOnboardingProgress = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return { completedSteps: [] };

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("clerkToken", identity.tokenIdentifier),
      )
      .unique();

    if (!user) return { completedSteps: [] };

    const steps: number[] = [];

    // Step 1: Connect GitHub
    if (user.githubUsername) {
      steps.push(1);
    }

    // Check projects
    const myProjects = await ctx.db
      .query("projects")
      .withIndex("by_owner", (q) => q.eq("ownerId", user._id))
      .collect();

    const joinedMemberships = await ctx.db
      .query("projectMembers")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const allProjectIds = new Set([
      ...myProjects.map((p) => p._id),
      ...joinedMemberships.map((m) => m.projectId),
    ]);

    // Step 2: Link a repository — at least one project must have a connected repo
    const hasLinkedRepo = myProjects.some((p) => !!p.repositoryId);
    if (hasLinkedRepo) {
      steps.push(2);
    }

    // Let's check team members, deadlines, and tasks across projects
    let hasTeamMembers = false;
    let hasDeadline = false;
    let hasTasks = false;

    for (const projectId of allProjectIds) {
      if (hasTeamMembers && hasDeadline && hasTasks) break;

      if (!hasTeamMembers) {
        const members = await ctx.db
          .query("projectMembers")
          .withIndex("by_project", (q) => q.eq("projectId", projectId))
          .collect();
        if (members.length > 1) {
          hasTeamMembers = true;
        }
      }

      if (!hasDeadline) {
        const details = await ctx.db
          .query("projectDetails")
          .withIndex("by_project", (q) => q.eq("projectId", projectId))
          .unique();
        if (details && details.targetDate) {
          hasDeadline = true;
        }
      }

      if (!hasTasks) {
        const task = await ctx.db
          .query("tasks")
          .withIndex("by_project", (q) => q.eq("projectId", projectId))
          .first();
        if (task) {
          hasTasks = true;
        }
      }
    }

    if (hasTeamMembers) steps.push(4);
    if (hasDeadline) steps.push(5);
    if (hasTasks) steps.push(6);

    // Step 3: Visit workspace
    if (user.hasVisitedWorkspace) steps.push(3);

    // Step 7 (Download extension) might be checked locally or if we have a field in DB
    // Currently relying on the Zustand local storage or a local flag.

    return { completedSteps: steps };
  },
});

// ==================================
// MARK WORKSPACE AS VISITED (Step 4)
// ==================================
export const markWorkspaceVisited = mutation({
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
      hasVisitedWorkspace: true,
      updatedAt: Date.now(),
    });
  },
});

// ==================================
// MARK WELCOME DIALOG AS SEEN (new user, once)
// ==================================
export const markWelcomeSeen = mutation({
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
    if (user.hasSeenWelcome) return; // already marked — idempotent

    await ctx.db.patch(user._id, {
      hasSeenWelcome: true,
      updatedAt: Date.now(),
    });
  },
});

export const getHasSeenWelcome = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return true; // not logged in → don't show

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("clerkToken", identity.tokenIdentifier),
      )
      .unique();

    return user?.hasSeenWelcome ?? false;
  },
});

export const completeGettingStarted = mutation({
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
      gettingstartedcompleted: true,
      updatedAt: Date.now(),
    });
  },
});

export const markGettingStartedCompleteSeen = mutation({
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
      hasSeenGettingStartedComplete: true,
      updatedAt: Date.now(),
    });
  },
});

// =======================================
// CLOUD STORAGE MANAGEMENT (Owner-based)
// =======================================
export const checkAndIncrementStorage = mutation({
  args: {
    projectId: v.id("projects"),
    fileSize: v.number(),
    isTeamspace: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);
    if (!project) throw new Error("Project not found");

    const owner = await ctx.db.get(project.ownerId);
    if (!owner) throw new Error("Project owner not found");

    // Check 1: Free plan owner cannot upload task/issue attachments
    const plan = owner.accountType || "free";
    if (!args.isTeamspace && plan === "free") {
      throw new Error("Attachments are disabled for Free projects. Upgrade to Plus/Pro to unlock.");
    }

    const limits = getPlanLimits(owner);
    const limit = limits.cloud_storage;
    const currentUsage = owner.cloudStorageUsage ?? 0;

    if (currentUsage + args.fileSize > limit) {
      throw new Error("Storage limit exceeded");
    }

    const newUsage = currentUsage + args.fileSize;
    await ctx.db.patch(owner._id, {
      cloudStorageUsage: newUsage,
      updatedAt: Date.now(),
    });

    return { success: true, currentUsage: newUsage, limit };
  },
});

export const decrementStorage = mutation({
  args: {
    projectId: v.id("projects"),
    fileSize: v.number(),
  },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);
    if (!project) throw new Error("Project not found");

    const owner = await ctx.db.get(project.ownerId);
    if (!owner) throw new Error("Project owner not found");

    const currentUsage = owner.cloudStorageUsage ?? 0;
    const newUsage = Math.max(0, currentUsage - args.fileSize);

    await ctx.db.patch(owner._id, {
      cloudStorageUsage: newUsage,
      updatedAt: Date.now(),
    });

    return { success: true, currentUsage: newUsage };
  },
});


