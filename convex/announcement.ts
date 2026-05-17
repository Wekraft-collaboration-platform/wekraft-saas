import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// ==========================================
// GET ACTIVE ANNOUNCEMENT (FOR CURRENT USER)
// ==========================================
export const getActiveAnnouncement = query({
  args: {},
  handler: async (ctx) => {
    // 1. Get active announcement from database
    const active = await ctx.db
      .query("announcements")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .first();

    // 2. Define the active announcement details (either from DB or virtual default)
    let announcementId = "default";
    let title = "Welcome to Wekraft";
    let description =
      "Make sure you have downloaded our extension for seamless usage!";

    if (active) {
      announcementId = active._id;
      title = active.title;
      description = active.description;
    }

    // 3. Check if user is authenticated and has dismissed this announcement
    const identity = await ctx.auth.getUserIdentity();
    if (identity) {
      const user = await ctx.db
        .query("users")
        .withIndex("by_token", (q) =>
          q.eq("clerkToken", identity.tokenIdentifier),
        )
        .unique();

      if (user) {
        const dismissal = await ctx.db
          .query("announcementDismissals")
          .withIndex("by_user_announcement", (q) =>
            q.eq("userId", user._id).eq("announcementId", announcementId),
          )
          .unique();

        // If user already dismissed this announcement, hide it
        if (dismissal) return null;
      }
    }

    return {
      _id: announcementId,
      title,
      description,
    };
  },
});

// ==========================================
// DISMISS ANNOUNCEMENT FOR USER
// ==========================================
export const dismissAnnouncement = mutation({
  args: { announcementId: v.string() },
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

    const existing = await ctx.db
      .query("announcementDismissals")
      .withIndex("by_user_announcement", (q) =>
        q.eq("userId", user._id).eq("announcementId", args.announcementId),
      )
      .unique();

    if (!existing) {
      await ctx.db.insert("announcementDismissals", {
        userId: user._id,
        announcementId: args.announcementId,
        dismissedAt: Date.now(),
      });
    }

    return { success: true };
  },
});

// ==========================================
// CREATE NEW ANNOUNCEMENT (ADMIN/MUTATION)
// ==========================================
export const createAnnouncement = mutation({
  args: {
    title: v.string(),
    description: v.string(),
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

    // Deactivate all previous announcements
    const activeAnnouncements = await ctx.db
      .query("announcements")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();

    for (const ann of activeAnnouncements) {
      await ctx.db.patch(ann._id, { isActive: false });
    }

    // Insert new announcement
    const announcementId = await ctx.db.insert("announcements", {
      title: args.title,
      description: args.description,
      isActive: true,
      createdBy: user._id,
      createdAt: Date.now(),
    });

    return { success: true, announcementId };
  },
});
