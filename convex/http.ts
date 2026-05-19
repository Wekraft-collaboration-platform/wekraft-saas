import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

const http = httpRouter();

// create calendar event
http.route({
  path: "/createCalendarEvent",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.json();
    console.log("[createCalendarEvent] received:", body);

    // Validate required fields
    if (!body.projectId || !body.title || !body.type) {
      return new Response(
        JSON.stringify({ error: "projectId, title, type are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    const id = await ctx.runMutation(internal.agentTools.insertCalendarEvent, {
      projectId: body.projectId,
      title: body.title,
      description: body.description ?? "",
      type: body.type,
      start: body.start,
      end: body.end,
      allDay: body.allDay ?? true,
    });

    console.log("[createCalendarEvent] created id:", id);

    return new Response(JSON.stringify({ id }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }),
});

// getSprintPlannerContext: Returns project deadline, all sprint names, count of incomplete unassigned tasks, and duration to deadline.
// returns: { projectDeadline: number | null, daysToDeadline: string | null, sprintTitles: string[], unassignedTasksCount: number }
http.route({
  path: "/getSprintPlannerContext",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.json();

    if (!body.projectId) {
      return new Response(JSON.stringify({ error: "projectId is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const sprintPlannerContext = await ctx.runQuery(
      internal.agentTools.getSprintPlannerContext,
      {
        projectId: body.projectId,
      },
    );

    return new Response(JSON.stringify({ sprintPlannerContext }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }),
});

// create sprint
http.route({
  path: "/createSprint",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.json();

    if (
      !body.projectId ||
      !body.sprintName ||
      !body.sprintGoal ||
      !body.startDate ||
      !body.endDate
    ) {
      return new Response(
        JSON.stringify({
          error:
            "projectId, sprintName, sprintGoal, startDate, endDate are required",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const sprint = await ctx.runMutation(internal.agentTools.createSprint, {
      projectId: body.projectId,
      sprintName: body.sprintName,
      sprintGoal: body.sprintGoal,
      startDate: body.startDate,
      endDate: body.endDate,
    });

    return new Response(JSON.stringify({ sprint }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }),
});

// add items to sprint
http.route({
  path: "/addItemsToSprint",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.json();

    if (!body.sprintId || !body.taskIds) {
      return new Response(
        JSON.stringify({ error: "sprintId and taskIds are required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const result = await ctx.runMutation(internal.agentTools.addItemsToSprint, {
      sprintId: body.sprintId,
      taskIds: body.taskIds,
    });

    return new Response(JSON.stringify({ result }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }),
});

// get scheduler
http.route({
  path: "/getScheduler",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.json();

    if (!body.projectId) {
      return new Response(JSON.stringify({ error: "projectId is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const scheduler = await ctx.runQuery(internal.agentTools.getScheduler, {
      projectId: body.projectId,
    });

    return new Response(JSON.stringify({ scheduler }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }),
});

// create or update scheduler
http.route({
  path: "/createOrUpdateScheduler",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.json();

    if (!body.projectId || !body.name || body.frequencyDays === undefined) {
      return new Response(
        JSON.stringify({
          error: "projectId, name, frequencyDays are required",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const result = await ctx.runMutation(
      internal.agentTools.createOrUpdateScheduler,
      {
        projectId: body.projectId,
        name: body.name,
        frequencyDays: body.frequencyDays,
        recipientEmail: body.recipientEmail,
        isActive: body.isActive ?? false,
      },
    );

    return new Response(JSON.stringify({ result }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }),
});

// ==============ANALYSIST-AGENT-TOOLS=====================================
// getTasksSummary: High-level task analytics and critical items.
// getIssuesSummary: Focuses on active and critical project issues.
// getMemberWorkload: Breakdown of assignments per team member.
// getSprintPlannerContext: Essential data for planning new sprints.
// getUserStandup: Personalized active items for daily planning. (Kaya TOOL for direct access)

// =======================INSIGHTS TOOLS HTTP===============================
// getMemberWorkload: Returns a detailed breakdown of each team member's current task and issue assignments.
// returns: Array<{ name: string, role: string, tasks: Array<{ title: string, priority: string, status: string }>, totalTasks: number, issues: Array<{ title: string, status: string }>, totalIssues: number }>
http.route({
  path: "/getMemberWorkload",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.json();

    if (!body.projectId) {
      return new Response(JSON.stringify({ error: "projectId is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const members = await ctx.runQuery(internal.agentTools.getMemberWorkload, {
      projectId: body.projectId,
    });

    return new Response(JSON.stringify({ members }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }),
});

// get sprint insights
http.route({
  path: "/getMemberWorkloadPYAgent",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.json();
    if (!body.projectId) {
      return new Response(JSON.stringify({ error: "projectId is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    const members = await ctx.runQuery(
      internal.agentTools.getMemberWorkloadPYAgent,
      {
        projectId: body.projectId,
      },
    );
    return new Response(JSON.stringify({ members }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }),
});

http.route({
  path: "/getSprintInsights",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.json();

    if (!body.projectId) {
      return new Response(JSON.stringify({ error: "projectId is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const sprints = await ctx.runQuery(internal.agentTools.getSprintInsights, {
      projectId: body.projectId,
    });

    return new Response(JSON.stringify({ sprints }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }),
});

// getTasksSummary: Returns a high-level summary of all tasks including critical and active ones.
// returns: { criticalAndActiveTasks: Array<{ title: string, status: string, priority: string, isBlocked: boolean, assignees: string[], endDate: string, timelineStatus: string }>, completedCount: number, blockedCount: number, totalCount: number }
http.route({
  path: "/getTasksSummary",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.json();
    if (!body.projectId) {
      return new Response(JSON.stringify({ error: "projectId is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    const tasksSummary = await ctx.runQuery(
      internal.agentTools.getTasksSummary,
      {
        projectId: body.projectId,
      },
    );
    return new Response(JSON.stringify({ tasksSummary }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }),
});

// getIssuesSummary: Returns a summary of all issues, focusing on active and critical ones.
// returns: { activeIssues: Array<{ title: string, status: string, severity: string, type: string, assignees: string[] }>, closedCount: number, criticalCount: number, totalCount: number }
http.route({
  path: "/getIssuesSummary",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.json();
    if (!body.projectId) {
      return new Response(JSON.stringify({ error: "projectId is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    const issuesSummary = await ctx.runQuery(
      internal.agentTools.getIssuesSummary,
      {
        projectId: body.projectId,
      },
    );
    return new Response(JSON.stringify({ issuesSummary }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }),
});

// getUserStandup: Returns active tasks and issues for a specific user to prioritize.
// returns: { tasks: Array<{ id: string, title: string, status: string, priority: string, endDate: number, isBlocked: boolean }>, issues: Array<{ id: string, title: string, status: string, severity: string, due_date: number | null }> }
http.route({
  path: "/getUserStandup",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.json();
    if (!body.projectId || !body.userId) {
      return new Response(
        JSON.stringify({ error: "projectId and userId are required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }
    const standup = await ctx.runQuery(internal.agentTools.getUserStandup, {
      projectId: body.projectId,
      userId: body.userId,
    });
    return new Response(JSON.stringify({ standup }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }),
});

// getProjectInsights: Returns basic project timeline information.
// returns: { projectName: string, createdAt: number, deadline: number | null, daysRemaining: number | null, isOverdue: boolean }
http.route({
  path: "/getProjectInsights",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.json();
    if (!body.projectId) {
      return new Response(JSON.stringify({ error: "projectId is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    const projectInsights = await ctx.runQuery(
      internal.agentTools.getProjectInsights,
      {
        projectId: body.projectId,
      },
    );
    return new Response(JSON.stringify({ projectInsights }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }),
});

http.route({
  path: "/razorpay-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const signature = request.headers.get("x-razorpay-signature");
    const payload = await request.text();

    if (!signature) {
      return new Response("Missing signature", { status: 400 });
    }

    const success = await ctx.runAction(internal.razorpayWebhook.processWebhook, {
      signature,
      payload,
    });

    if (success) {
      return new Response("OK", { status: 200 });
    } else {
      return new Response("Webhook Error", { status: 400 });
    }
  }),
});

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Wekraft-Client",
};

async function authenticateRequest(
  ctx: any,
  request: Request
): Promise<
  | { ok: true; userId: string; apiKeyId: string; user: any }
  | { ok: false; response: Response }
> {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { ok: false, response: new Response(JSON.stringify({ error: "Missing or invalid Authorization header" }), { status: 401, headers: { "Content-Type": "application/json", ...CORS_HEADERS } }) };
  }
  const apiKey = authHeader.slice(7);
  const authResult = await ctx.runQuery(internal.agentTools.authenticateApiKey, { apiKey });
  if (!authResult) {
    return { ok: false, response: new Response(JSON.stringify({ error: "Invalid or revoked API key" }), { status: 401, headers: { "Content-Type": "application/json", ...CORS_HEADERS } }) };
  }
  ctx.runMutation(internal.agentTools.touchApiKeyLastUsed, { apiKeyId: authResult.apiKeyId });
  return { ok: true, userId: authResult.id, apiKeyId: authResult.apiKeyId, user: authResult };
}

["/ext/projects", "/ext/tasks", "/ext/sprints", "/ext/issues", "/ext/team", "/ext/me"].forEach((path) => {
  http.route({
    path,
    method: "OPTIONS",
    handler: httpAction(async () => new Response(null, { status: 204, headers: CORS_HEADERS })),
  });
});

http.route({
  pathPrefix: "/ext/tasks/",
  method: "OPTIONS",
  handler: httpAction(async () => new Response(null, { status: 204, headers: CORS_HEADERS })),
});

http.route({
  pathPrefix: "/ext/issues/",
  method: "OPTIONS",
  handler: httpAction(async () => new Response(null, { status: 204, headers: CORS_HEADERS })),
});

http.route({
  path: "/ext/me",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const auth = await authenticateRequest(ctx, request);
    if (!auth.ok) return auth.response;
    return new Response(JSON.stringify(auth.user), { status: 200, headers: { "Content-Type": "application/json", ...CORS_HEADERS } });
  }),
});

http.route({
  path: "/ext/projects",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const auth = await authenticateRequest(ctx, request);
    if (!auth.ok) return auth.response;
    const projects = await ctx.runQuery(internal.agentTools.getUserProjectsFull, { userId: auth.userId as any });
    const mapped = (projects ?? []).map((p: any) => ({
      id: p._id,
      name: p.projectName,
      ownerId: p.ownerId,
      description: p.description,
      status: p.projectWorkStatus,
      repoFullName: p.repoFullName,
    }));
    return new Response(JSON.stringify(mapped), { status: 200, headers: { "Content-Type": "application/json", ...CORS_HEADERS } });
  }),
});

http.route({
  path: "/ext/sprints",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const auth = await authenticateRequest(ctx, request);
    if (!auth.ok) return auth.response;
    const url = new URL(request.url);
    const projectId = url.searchParams.get("projectId");
    if (!projectId) return new Response(JSON.stringify({ error: "projectId required" }), { status: 400, headers: { "Content-Type": "application/json", ...CORS_HEADERS } });
    const sprints = await ctx.runQuery(internal.agentTools.getProjectSprintsFull, { projectId: projectId as any });
    const mapped = (sprints ?? []).map((s: any) => ({
      id: s._id,
      name: s.name,
      status: s.status,
      startDate: s.startDate,
      endDate: s.endDate,
    }));
    return new Response(JSON.stringify(mapped), { status: 200, headers: { "Content-Type": "application/json", ...CORS_HEADERS } });
  }),
});

http.route({
  path: "/ext/tasks",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const auth = await authenticateRequest(ctx, request);
    if (!auth.ok) return auth.response;
    const url = new URL(request.url);
    const projectId = url.searchParams.get("projectId");
    if (!projectId) return new Response(JSON.stringify({ error: "projectId required" }), { status: 400, headers: { "Content-Type": "application/json", ...CORS_HEADERS } });
    const sprintId = url.searchParams.get("sprintId") || undefined;
    const tasks = await ctx.runQuery(internal.agentTools.getProjectTasksFull, { projectId: projectId as any, sprintId: sprintId as any });
    const mapped = (tasks ?? []).map((t: any) => ({
      id: t._id,
      projectId: t.projectId,
      sprintId: t.sprintId,
      title: t.title,
      description: t.description,
      status: t.status,
      priority: t.priority ?? "low",
      assigneeId: Array.isArray(t.assignedTo) && t.assignedTo[0] ? (typeof t.assignedTo[0] === "object" ? t.assignedTo[0].userId : t.assignedTo[0]) : (typeof t.assignedTo === "string" ? t.assignedTo : undefined),
      assignee: Array.isArray(t.assignedTo) && t.assignedTo[0] ? (typeof t.assignedTo[0] === "object" ? { id: t.assignedTo[0].userId, name: t.assignedTo[0].name || "Unknown", avatarUrl: t.assignedTo[0].avatar, role: "member" as const, email: "" } : { id: t.assignedTo[0], name: "Unknown", avatarUrl: undefined, role: "member" as const, email: "" }) : (typeof t.assignedTo === "string" ? { id: t.assignedTo, name: "Unknown", avatarUrl: undefined, role: "member" as const, email: "" } : undefined),
      reporterId: t.createdByUserId,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
      isBlocked: t.isBlocked ?? false,
      linkWithCodebase: t.linkWithCodebase ?? null,
    }));
    return new Response(JSON.stringify(mapped), { status: 200, headers: { "Content-Type": "application/json", ...CORS_HEADERS } });
  }),
});

http.route({
  path: "/ext/issues",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const auth = await authenticateRequest(ctx, request);
    if (!auth.ok) return auth.response;
    const url = new URL(request.url);
    const projectId = url.searchParams.get("projectId");
    if (!projectId) return new Response(JSON.stringify({ error: "projectId required" }), { status: 400, headers: { "Content-Type": "application/json", ...CORS_HEADERS } });
    const issues = await ctx.runQuery(internal.agentTools.getProjectIssuesFull, { projectId: projectId as any });
    const activeIssues = (issues ?? []).filter((i: any) => i.status !== "closed");
    const priorityMap: Record<string, string> = { critical: "critical", medium: "medium", low: "low" };
    const mapped = activeIssues.map((i: any) => ({
      id: i._id,
      projectId: i.projectId,
      title: i.title,
      description: i.description,
      status: i.status,
      taskId: i.taskId,
      priority: priorityMap[i.severity] ?? "medium",
      assigneeId: i.IssueAssignee?.[0]?.userId,
      assignee: i.IssueAssignee?.[0] ? { id: i.IssueAssignee[0].userId, name: i.IssueAssignee[0].name, avatarUrl: i.IssueAssignee[0].avatar, role: "member" as const, email: "" } : undefined,
      reporterId: i.createdByUserId,
      createdAt: i.createdAt,
      updatedAt: i.updatedAt,
    }));
    return new Response(JSON.stringify(mapped), { status: 200, headers: { "Content-Type": "application/json", ...CORS_HEADERS } });
  }),
});

http.route({
  path: "/ext/team",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const auth = await authenticateRequest(ctx, request);
    if (!auth.ok) return auth.response;
    const url = new URL(request.url);
    const projectId = url.searchParams.get("projectId");
    if (!projectId) return new Response(JSON.stringify({ error: "projectId required" }), { status: 400, headers: { "Content-Type": "application/json", ...CORS_HEADERS } });
    const members = await ctx.runQuery(internal.agentTools.getProjectMembersFull, { projectId: projectId as any });
    const mapped = (members ?? []).map((m: any) => ({
      id: m._id,
      userId: m.userId,
      user: { id: m.userId, name: m.userName ?? "Unknown", avatarUrl: m.userImage, role: m.AccessRole ?? "member", email: "" },
      role: m.AccessRole ?? "member",
    }));
    return new Response(JSON.stringify(mapped), { status: 200, headers: { "Content-Type": "application/json", ...CORS_HEADERS } });
  }),
});

http.route({
  pathPrefix: "/ext/tasks/",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const auth = await authenticateRequest(ctx, request);
    if (!auth.ok) return auth.response;
    const url = new URL(request.url);
    const taskId = url.pathname.replace(/^\/ext\/tasks\//, "").split("/")[0];
    const action = url.pathname.replace(/^\/ext\/tasks\//, "").split("/")[1];
    if (!taskId || action !== "mark-as-issue") {
      return new Response(JSON.stringify({ error: "Invalid path" }), { status: 400, headers: { "Content-Type": "application/json", ...CORS_HEADERS } });
    }
    try {
      const issueId = await ctx.runMutation(internal.agentTools.markTaskAsIssueInternal, { taskId: taskId as any, userId: auth.userId as any });
      return new Response(JSON.stringify({ success: true, issueId }), { status: 200, headers: { "Content-Type": "application/json", ...CORS_HEADERS } });
    } catch (e: any) {
      return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { "Content-Type": "application/json", ...CORS_HEADERS } });
    }
  }),
});

http.route({
  pathPrefix: "/ext/tasks/",
  method: "DELETE",
  handler: httpAction(async (ctx, request) => {
    const auth = await authenticateRequest(ctx, request);
    if (!auth.ok) return auth.response;
    const url = new URL(request.url);
    const taskId = url.pathname.replace(/^\/ext\/tasks\//, "").split("/")[0];
    if (!taskId) return new Response(JSON.stringify({ error: "Missing taskId" }), { status: 400, headers: { "Content-Type": "application/json", ...CORS_HEADERS } });
    try {
      await ctx.runMutation(internal.agentTools.deleteTaskInternal, { taskId: taskId as any, userId: auth.userId as any });
      return new Response(JSON.stringify({ success: true, taskId }), { status: 200, headers: { "Content-Type": "application/json", ...CORS_HEADERS } });
    } catch (e: any) {
      return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { "Content-Type": "application/json", ...CORS_HEADERS } });
    }
  }),
});

http.route({
  pathPrefix: "/ext/issues/",
  method: "DELETE",
  handler: httpAction(async (ctx, request) => {
    const auth = await authenticateRequest(ctx, request);
    if (!auth.ok) return auth.response;
    const url = new URL(request.url);
    const issueId = url.pathname.replace(/^\/ext\/issues\//, "").split("/")[0];
    if (!issueId) return new Response(JSON.stringify({ error: "Missing issueId" }), { status: 400, headers: { "Content-Type": "application/json", ...CORS_HEADERS } });
    try {
      await ctx.runMutation(internal.agentTools.deleteIssueInternal, { issueId: issueId as any, userId: auth.userId as any });
      return new Response(JSON.stringify({ success: true, issueId }), { status: 200, headers: { "Content-Type": "application/json", ...CORS_HEADERS } });
    } catch (e: any) {
      return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { "Content-Type": "application/json", ...CORS_HEADERS } });
    }
  }),
});

http.route({
  path: "/ext/tasks",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const auth = await authenticateRequest(ctx, request);
    if (!auth.ok) return auth.response;
    try {
      const body = await request.json();
      const taskId = await ctx.runMutation(internal.agentTools.createTaskInternal, { ...body, userId: auth.userId as any });
      return new Response(JSON.stringify({ id: taskId }), { status: 200, headers: { "Content-Type": "application/json", ...CORS_HEADERS } });
    } catch (e: any) {
      return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { "Content-Type": "application/json", ...CORS_HEADERS } });
    }
  }),
});

http.route({
  pathPrefix: "/ext/tasks/",
  method: "PATCH",
  handler: httpAction(async (ctx, request) => {
    const auth = await authenticateRequest(ctx, request);
    if (!auth.ok) return auth.response;
    const url = new URL(request.url);
    const taskId = url.pathname.replace(/^\/ext\/tasks\//, "").split("/")[0];
    if (!taskId) return new Response(JSON.stringify({ error: "Missing taskId" }), { status: 400, headers: { "Content-Type": "application/json", ...CORS_HEADERS } });
    try {
      const body = await request.json();
      const updated = await ctx.runMutation(internal.agentTools.updateTaskInternal, { taskId: taskId as any, userId: auth.userId as any, ...body });
      return new Response(JSON.stringify(updated), { status: 200, headers: { "Content-Type": "application/json", ...CORS_HEADERS } });
    } catch (e: any) {
      return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { "Content-Type": "application/json", ...CORS_HEADERS } });
    }
  }),
});

http.route({
  pathPrefix: "/ext/issues/",
  method: "PATCH",
  handler: httpAction(async (ctx, request) => {
    const auth = await authenticateRequest(ctx, request);
    if (!auth.ok) return auth.response;
    const url = new URL(request.url);
    const issueId = url.pathname.replace(/^\/ext\/issues\//, "").split("/")[0];
    if (!issueId) return new Response(JSON.stringify({ error: "Missing issueId" }), { status: 400, headers: { "Content-Type": "application/json", ...CORS_HEADERS } });
    try {
      const body = await request.json();
      const updated = await ctx.runMutation(internal.agentTools.updateIssueInternal, { issueId: issueId as any, userId: auth.userId as any, ...body });
      return new Response(JSON.stringify(updated), { status: 200, headers: { "Content-Type": "application/json", ...CORS_HEADERS } });
    } catch (e: any) {
      return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { "Content-Type": "application/json", ...CORS_HEADERS } });
    }
  }),
});

export default http;
