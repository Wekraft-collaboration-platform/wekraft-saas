import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { recordAuditEvent } from "./auditLog";
import { encryptField, decryptField, generateBlindIndex } from "./encryption";

// Helper to authenticate user and verify membership
async function checkProjectAccess(ctx: any, projectId: Id<"projects">) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Unauthenticated");
  }

  const user = await ctx.db
    .query("users")
    .withIndex("by_token", (q: any) =>
      q.eq("clerkToken", identity.tokenIdentifier)
    )
    .unique();

  if (!user) {
    throw new Error("User not found");
  }

  const project = await ctx.db.get(projectId);
  if (!project) {
    throw new Error("Project not found");
  }

  const isOwner = project.ownerId === user._id;

  const membership = await ctx.db
    .query("projectMembers")
    .withIndex("by_project", (q: any) => q.eq("projectId", projectId))
    .filter((q: any) => q.eq(q.field("userId"), user._id))
    .unique();

  const role = isOwner ? "owner" : membership?.AccessRole || null;

  return {
    user,
    project,
    role,
    isOwner,
    isAdmin: role === "admin",
    isMember: role === "member",
    isViewer: role === "viewer",
    isPower: isOwner || role === "admin",
    isAllowed: isOwner || !!membership,
  };
}

// ==========================================
// QUERIES
// ==========================================

export const getCustomerDeskData = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const access = await checkProjectAccess(ctx, args.projectId);
    if (!access.isAllowed) {
      throw new Error("Access denied");
    }

    const rawCustomers = await ctx.db
      .query("serviceCustomers")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    const customers = await Promise.all(
      rawCustomers.map(async (c) => ({
        ...c,
        name: (await decryptField(c.name)) || "",
        email: (await decryptField(c.email)) || "",
        contact: (await decryptField(c.contact)) || "",
      }))
    );

    const rawRequests = await ctx.db
      .query("serviceRequests")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    // Map of customer ID -> customer details for quick lookup
    const customerMap = new Map<string, typeof customers[0]>();
    for (const c of customers) {
      customerMap.set(c._id, c);
    }

    // Resolve details for each request (customer)
    const requests = await Promise.all(
      rawRequests.map(async (r) => {
        const customer = customerMap.get(r.customerId);
        const description = await decryptField(r.description);

        return {
          ...r,
          description: description || undefined,
          customerName: customer?.name || "Unknown Customer",
          customerEmail: customer?.email || "",
        };
      })
    );

    // Calculate stats
    const totalCustomers = customers.length;
    let requestedFeaturesCount = 0;
    let reportedBugsCount = 0;
    let pendingCount = 0;

    for (const r of rawRequests) {
      if (r.type === "feature_request") requestedFeaturesCount++;
      if (r.type === "bug_report") reportedBugsCount++;
      if (r.status === "pending") pendingCount++;
    }

    return {
      customers,
      requests,
      stats: {
        totalCustomers,
        totalRequestedFeatures: requestedFeaturesCount,
        totalReportedBugs: reportedBugsCount,
        totalPending: pendingCount,
      },
      userRole: access.role,
      isPower: access.isPower,
      isOwner: access.isOwner,
    };
  },
});

export const getCustomerList = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const access = await checkProjectAccess(ctx, args.projectId);
    if (!access.isAllowed) {
      throw new Error("Access denied");
    }

    const customers = await ctx.db
      .query("serviceCustomers")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    return await Promise.all(
      customers.map(async (c) => ({
        _id: c._id,
        name: (await decryptField(c.name)) || "",
        email: (await decryptField(c.email)) || "",
      }))
    );
  },
});

// ==========================================
// MUTATIONS
// ==========================================

export const createCustomer = mutation({
  args: {
    projectId: v.id("projects"),
    name: v.string(),
    email: v.string(),
    contact: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const access = await checkProjectAccess(ctx, args.projectId);
    if (!access.isOwner) {
      throw new Error("Only the owner can create customers");
    }

    const blindIndex = await generateBlindIndex(args.email);

    // Email check per project
    const existing = await ctx.db
      .query("serviceCustomers")
      .withIndex("by_project_email_blind_index", (q) =>
        q.eq("projectId", args.projectId).eq("emailBlindIndex", blindIndex)
      )
      .unique();

    if (existing) {
      throw new Error("A customer with this email already exists in this project.");
    }

    const encryptedName = await encryptField(args.name);
    const encryptedEmail = await encryptField(args.email);
    const encryptedContact = args.contact ? await encryptField(args.contact) : undefined;

    const customerId = await ctx.db.insert("serviceCustomers", {
      projectId: args.projectId,
      name: encryptedName,
      email: encryptedEmail,
      emailBlindIndex: blindIndex,
      contact: encryptedContact,
      createdBy: access.user._id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    await recordAuditEvent(ctx, {
      projectId: args.projectId,
      userId: access.user._id,
      userName: access.user.name || "User",
      userEmail: access.user.email,
      action: "customer.create",
      targetType: "customer",
      targetId: customerId,
      targetTitle: args.name,
    });

    return customerId;
  },
});

export const editCustomer = mutation({
  args: {
    customerId: v.id("serviceCustomers"),
    name: v.string(),
    email: v.string(),
    contact: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const customer = await ctx.db.get(args.customerId);
    if (!customer) {
      throw new Error("Customer not found");
    }

    const access = await checkProjectAccess(ctx, customer.projectId);
    if (!access.isOwner) {
      throw new Error("Only the owner can edit customers");
    }

    const newBlindIndex = await generateBlindIndex(args.email);

    if (customer.emailBlindIndex !== newBlindIndex) {
      const existing = await ctx.db
        .query("serviceCustomers")
        .withIndex("by_project_email_blind_index", (q) =>
          q.eq("projectId", customer.projectId).eq("emailBlindIndex", newBlindIndex)
        )
        .unique();

      if (existing) {
        throw new Error("A customer with this email already exists in this project.");
      }
    }

    const encryptedName = await encryptField(args.name);
    const encryptedEmail = await encryptField(args.email);
    const encryptedContact = args.contact ? await encryptField(args.contact) : undefined;

    await ctx.db.patch(args.customerId, {
      name: encryptedName,
      email: encryptedEmail,
      emailBlindIndex: newBlindIndex,
      contact: encryptedContact,
      updatedAt: Date.now(),
    });

    await recordAuditEvent(ctx, {
      projectId: customer.projectId,
      userId: access.user._id,
      userName: access.user.name || "User",
      userEmail: access.user.email,
      action: "customer.update",
      targetType: "customer",
      targetId: args.customerId,
      targetTitle: args.name,
    });

    return args.customerId;
  },
});

export const deleteCustomer = mutation({
  args: {
    customerId: v.id("serviceCustomers"),
  },
  handler: async (ctx, args) => {
    const customer = await ctx.db.get(args.customerId);
    if (!customer) {
      throw new Error("Customer not found");
    }

    const access = await checkProjectAccess(ctx, customer.projectId);
    if (!access.isOwner) {
      throw new Error("Only the owner can delete customers");
    }

    const customerName = (await decryptField(customer.name)) || "Customer";

    // Cascade delete requests
    const requests = await ctx.db
      .query("serviceRequests")
      .withIndex("by_customer", (q) => q.eq("customerId", args.customerId))
      .collect();

    for (const r of requests) {
      await ctx.db.delete(r._id);
    }

    await recordAuditEvent(ctx, {
      projectId: customer.projectId,
      userId: access.user._id,
      userName: access.user.name || "User",
      userEmail: access.user.email,
      action: "customer.delete",
      targetType: "customer",
      targetId: args.customerId,
      targetTitle: customerName,
    });

    await ctx.db.delete(args.customerId);
    return args.customerId;
  },
});

export const createRequest = mutation({
  args: {
    projectId: v.id("projects"),
    customerId: v.id("serviceCustomers"),
    title: v.string(),
    description: v.optional(v.string()),
    type: v.union(v.literal("feature_request"), v.literal("bug_report")),
  },
  handler: async (ctx, args) => {
    const access = await checkProjectAccess(ctx, args.projectId);
    if (!access.isAllowed || access.isViewer) {
      throw new Error("Unauthorized to log requests");
    }

    const encryptedDescription = args.description
      ? await encryptField(args.description)
      : undefined;

    const requestId = await ctx.db.insert("serviceRequests", {
      projectId: args.projectId,
      customerId: args.customerId,
      title: args.title,
      description: encryptedDescription,
      type: args.type,
      status: "pending",
      createdBy: access.user._id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    await recordAuditEvent(ctx, {
      projectId: args.projectId,
      userId: access.user._id,
      userName: access.user.name || "User",
      userEmail: access.user.email,
      action: "request.create",
      targetType: "request",
      targetId: requestId,
      targetTitle: args.title,
    });

    return requestId;
  },
});

export const approveRequest = mutation({
  args: {
    requestId: v.id("serviceRequests"),
    assignees: v.optional(
      v.array(
        v.object({
          userId: v.id("users"),
          name: v.string(),
          avatar: v.optional(v.string()),
        })
      )
    ),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const request = await ctx.db.get(args.requestId);
    if (!request) {
      throw new Error("Request not found");
    }

    if (request.status !== "pending") {
      throw new Error("Request is not pending approval");
    }

    const access = await checkProjectAccess(ctx, request.projectId);
    if (!access.isPower) {
      throw new Error("Only owners and admins can approve requests");
    }

    if (request.type === "feature_request") {
      // Create a Task
      const taskId = await ctx.db.insert("tasks", {
        title: request.title,
        description: request.description,
        status: "not started",
        estimation: {
          startDate: args.startDate ?? Date.now(),
          endDate: args.endDate ?? (Date.now() + 7 * 24 * 60 * 60 * 1000), // default to 7 days
        },
        isBlocked: false,
        projectId: request.projectId,
        createdByUserId: access.user._id,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      // Insert Assignees if provided
      if (args.assignees && args.assignees.length > 0) {
        await Promise.all(
          args.assignees.map((assignee) =>
            ctx.db.insert("taskAssignees", {
              taskId,
              userId: assignee.userId,
              name: assignee.name,
              avatar: assignee.avatar,
              projectId: request.projectId,
            })
          )
        );
      }

      // Approve request
      await ctx.db.patch(args.requestId, {
        status: "approved",
        approvedBy: access.user._id,
        updatedAt: Date.now(),
      });

      return { type: "task", id: taskId };
    } else {
      // Create an Issue
      const issueId = await ctx.db.insert("issues", {
        title: request.title,
        description: request.description,
        type: "manual",
        status: "not opened",
        projectId: request.projectId,
        createdByUserId: access.user._id,
        environment: "production", // default
        severity: "medium", // default
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      // Insert Assignees if provided
      if (args.assignees && args.assignees.length > 0) {
        await Promise.all(
          args.assignees.map((assignee) =>
            ctx.db.insert("issueAssignees", {
              issueId,
              userId: assignee.userId,
              name: assignee.name,
              avatar: assignee.avatar,
              projectId: request.projectId,
            })
          )
        );
      }

      // Approve request
      await ctx.db.patch(args.requestId, {
        status: "approved",
        approvedBy: access.user._id,
        updatedAt: Date.now(),
      });

      return { type: "issue", id: issueId };
    }
  },
});

export const rejectRequest = mutation({
  args: {
    requestId: v.id("serviceRequests"),
  },
  handler: async (ctx, args) => {
    const request = await ctx.db.get(args.requestId);
    if (!request) {
      throw new Error("Request not found");
    }

    if (request.status !== "pending") {
      throw new Error("Request is not pending");
    }

    const access = await checkProjectAccess(ctx, request.projectId);
    if (!access.isPower) {
      throw new Error("Only owners and admins can reject requests");
    }

    await ctx.db.patch(args.requestId, {
      status: "rejected",
      approvedBy: access.user._id,
      updatedAt: Date.now(),
    });

    return args.requestId;
  },
});
