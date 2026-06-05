import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

const http = httpRouter();


// create calendar event (Kaya AI Agent tool)
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

// create sprint (Kaya AI Agent tool)
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

// add items to sprint (Kaya AI Agent tool)
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

// get scheduler (Kaya AI Agent tool)
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

// create or update scheduler (Kaya AI Agent tool)
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

// getMemberWorkloadPYAgent (Kaya AI Agent tool)
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

// getSprintInsights (Kaya AI Agent tool)
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


// =============================================================================
// IDE EXTENSION – REST API  (/ext/*)
// =============================================================================

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Wekraft-Client",
};

/**
 * HIGH OPTIMIZATION: Authenticates the key, tracks rate limit, and touches lastUsedAt
 * inside exactly 1 single mutation transaction context to prevent separate database round-trips!
 */
async function authenticateRequest(
  ctx: any,
  request: Request
): Promise<
  | { ok: true; userId: string; user: any }
  | { ok: false; response: Response }
> {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { ok: false, response: new Response(JSON.stringify({ error: "Missing or invalid Authorization header" }), { status: 401, headers: { "Content-Type": "application/json", ...CORS_HEADERS } }) };
  }
  const apiKey = authHeader.slice(7);

  // Unified authentication + rate limiting + last used touch mutation in exactly 1 round-trip!
  const authResult = await ctx.runMutation(internal.extensionApi.authenticateKeyInternal, { apiKey });

  if (!authResult.ok) {
    if (authResult.error === "rate_limit_exceeded") {
      return { ok: false, response: new Response(JSON.stringify({ error: "Rate limit exceeded. Max 60 requests per minute." }), { status: 429, headers: { "Content-Type": "application/json", "Retry-After": "60", ...CORS_HEADERS } }) };
    }
    return { ok: false, response: new Response(JSON.stringify({ error: authResult.error }), { status: authResult.status || 401, headers: { "Content-Type": "application/json", ...CORS_HEADERS } }) };
  }

  return { ok: true, userId: authResult.userId, user: authResult.safeUser };
}

["/ext/projects", "/ext/project-data", "/ext/tasks", "/ext/sprints", "/ext/issues", "/ext/team", "/ext/me"].forEach((path) => {
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

// Covers PATCH /ext/tickets/:id cross-origin preflight
http.route({
  pathPrefix: "/ext/tickets/",
  method: "OPTIONS",
  handler: httpAction(async () => new Response(null, { status: 204, headers: CORS_HEADERS })),
});

// ── GET /ext/me — returns display-safe authenticated user ───────────────────
http.route({
  path: "/ext/me",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const auth = await authenticateRequest(ctx, request);
    if (!auth.ok) return auth.response;
    return new Response(JSON.stringify(auth.user), { status: 200, headers: { "Content-Type": "application/json", ...CORS_HEADERS } });
  }),
});

// ── GET /ext/projects — list projects (inherently authorized) ──────────────────
http.route({
  path: "/ext/projects",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const auth = await authenticateRequest(ctx, request);
    if (!auth.ok) return auth.response;
    try {
      const projects = await ctx.runQuery(internal.extensionApi.getUserProjectsFull, { userId: auth.userId as any });
      const mapped = (projects ?? []).map((p: any) => ({
        id: p._id,
        name: p.projectName,
        ownerId: p.ownerId,
        description: p.description,
        status: p.projectWorkStatus,
        repoFullName: p.repoFullName,
        projectDeadline: p.projectDeadline ?? null,
      }));
      return new Response(JSON.stringify(mapped), { status: 200, headers: { "Content-Type": "application/json", ...CORS_HEADERS } });
    } catch (e: any) {
      return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { "Content-Type": "application/json", ...CORS_HEADERS } });
    }
  }),
});

// ── GET /ext/sprints?projectId=… — list sprints (authorized in query!) ─────
http.route({
  path: "/ext/sprints",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const auth = await authenticateRequest(ctx, request);
    if (!auth.ok) return auth.response;
    const url = new URL(request.url);
    const projectId = url.searchParams.get("projectId");
    if (!projectId) return new Response(JSON.stringify({ error: "projectId required" }), { status: 400, headers: { "Content-Type": "application/json", ...CORS_HEADERS } });

    try {
      const sprints = await ctx.runQuery(internal.extensionApi.getProjectSprintsFull, {
        projectId: projectId as any,
        userId: auth.userId as any
      });
      const mapped = (sprints ?? []).map((s: any) => ({
        id: s._id,
        sprintName: s.sprintName,
        status: s.status,
        duration: s.duration,
        startDate: s.duration?.startDate,
        endDate: s.duration?.endDate,
      }));
      return new Response(JSON.stringify(mapped), { status: 200, headers: { "Content-Type": "application/json", ...CORS_HEADERS } });
    } catch (e: any) {
      return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { "Content-Type": "application/json", ...CORS_HEADERS } });
    }
  }),
});

// ── GET /ext/project-data?projectId=…[&sprintId=…] — list all project data ──
http.route({
  path: "/ext/project-data",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const auth = await authenticateRequest(ctx, request);
    if (!auth.ok) return auth.response;
    const url = new URL(request.url);
    const projectId = url.searchParams.get("projectId");
    if (!projectId) return new Response(JSON.stringify({ error: "projectId required" }), { status: 400, headers: { "Content-Type": "application/json", ...CORS_HEADERS } });
    const sprintId = url.searchParams.get("sprintId") || undefined;

    try {
      const [sprints, tasks, issues, teamMembers] = await Promise.all([
        ctx.runQuery(internal.extensionApi.getProjectSprintsFull, { projectId: projectId as any, userId: auth.userId as any }),
        ctx.runQuery(internal.extensionApi.getProjectTasksFull, { projectId: projectId as any, userId: auth.userId as any, sprintId: sprintId as any }),
        ctx.runQuery(internal.extensionApi.getProjectIssuesFull, { projectId: projectId as any, userId: auth.userId as any }),
        ctx.runQuery(internal.extensionApi.getProjectMembersFull, { projectId: projectId as any, userId: auth.userId as any }),
      ]);

      const priorityMap: Record<string, string> = { critical: "critical", medium: "medium", low: "low" };

      const mappedSprints = (sprints ?? []).map((s: any) => ({
        id: s._id,
        sprintName: s.sprintName,
        status: s.status,
        duration: s.duration,
        startDate: s.duration?.startDate,
        endDate: s.duration?.endDate,
      }));

      const mappedTasks = (tasks ?? []).map((t: any) => ({
        id: t._id,
        projectId: t.projectId,
        sprintId: t.sprintId,
        title: t.title,
        description: t.description,
        status: t.status,
        type: t.type,
        priority: t.priority ?? "low",
        assigneeId: Array.isArray(t.assignedTo) && t.assignedTo[0] ? (typeof t.assignedTo[0] === "object" ? t.assignedTo[0].userId : t.assignedTo[0]) : (typeof t.assignedTo === "string" ? t.assignedTo : undefined),
        assignee: Array.isArray(t.assignedTo) && t.assignedTo[0] ? (typeof t.assignedTo[0] === "object" ? { id: t.assignedTo[0].userId, name: t.assignedTo[0].name || "Unknown", avatarUrl: t.assignedTo[0].avatar, role: "member" as const, email: "" } : { id: t.assignedTo[0], name: "Unknown", avatarUrl: undefined, role: "member" as const, email: "" }) : (typeof t.assignedTo === "string" ? { id: t.assignedTo, name: "Unknown", avatarUrl: undefined, role: "member" as const, email: "" } : undefined),
        assigneeIds: Array.isArray(t.assignedTo) ? t.assignedTo.map((a: any) => typeof a === "object" ? a.userId : a) : (typeof t.assignedTo === "string" ? [t.assignedTo] : []),
        assignees: Array.isArray(t.assignedTo) ? t.assignedTo.map((a: any) => typeof a === "object" ? { id: a.userId, name: a.name || "Unknown", avatarUrl: a.avatar, role: "member" as const, email: "" } : { id: a, name: "Unknown", avatarUrl: undefined, role: "member" as const, email: "" }) : (typeof t.assignedTo === "string" ? [{ id: t.assignedTo, name: "Unknown", avatarUrl: undefined, role: "member" as const, email: "" }] : []),
        reporterId: t.createdByUserId,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
        isBlocked: t.isBlocked ?? false,
        linkWithCodebase: t.linkWithCodebase ?? null,
        estimation: t.estimation ?? null,
      }));

      const mappedIssues = (issues ?? []).map((i: any) => ({
        id: i._id,
        projectId: i.projectId,
        title: i.title,
        description: i.description,
        status: i.status,
        taskId: i.taskId,
        priority: priorityMap[i.severity || ""] ?? "medium",
        severity: i.severity ?? "medium",
        environment: i.environment ?? "local",
        due_date: i.due_date,
        fileLinked: i.fileLinked ?? null,
        linkWithCodebase: i.fileLinked ?? null,
        assigneeId: i.IssueAssignee?.[0]?.userId,
        assignee: i.IssueAssignee?.[0] ? { id: i.IssueAssignee[0].userId, name: i.IssueAssignee[0].name, avatarUrl: i.IssueAssignee[0].avatar, role: "member" as const, email: "" } : undefined,
        assigneeIds: Array.isArray(i.IssueAssignee) ? i.IssueAssignee.map((a: any) => a.userId) : [],
        assignees: Array.isArray(i.IssueAssignee) ? i.IssueAssignee.map((a: any) => ({ id: a.userId, name: a.name || "Unknown", avatarUrl: a.avatar, role: "member" as const, email: "" })) : [],
        reporterId: i.createdByUserId,
        createdAt: i.createdAt,
        updatedAt: i.updatedAt,
      }));

      const mappedTeam = (teamMembers ?? []).map((m: any) => ({
        id: m._id,
        userId: m.userId,
        user: { id: m.userId, name: m.userName ?? "Unknown", avatarUrl: m.userImage, role: m.AccessRole ?? "member", email: "" },
        role: m.AccessRole ?? "member",
      }));

      return new Response(JSON.stringify({
        sprints: mappedSprints,
        tasks: mappedTasks,
        issues: mappedIssues,
        teamMembers: mappedTeam,
        tickets: []
      }), { status: 200, headers: { "Content-Type": "application/json", ...CORS_HEADERS } });
    } catch (e: any) {
      return new Response(JSON.stringify({ error: e.message }), { status: 403, headers: { "Content-Type": "application/json", ...CORS_HEADERS } });
    }
  }),
});

// ── GET /ext/tasks?projectId=…[&sprintId=…] — list tasks (authorized in query!)
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

    try {
      const tasks = await ctx.runQuery(internal.extensionApi.getProjectTasksFull, {
        projectId: projectId as any,
        userId: auth.userId as any,
        sprintId: sprintId as any
      });
      const mapped = (tasks ?? []).map((t: any) => ({
        id: t._id,
        projectId: t.projectId,
        sprintId: t.sprintId,
        title: t.title,
        description: t.description,
        status: t.status,
        type: t.type,
        priority: t.priority ?? "low",
        assigneeId: Array.isArray(t.assignedTo) && t.assignedTo[0] ? (typeof t.assignedTo[0] === "object" ? t.assignedTo[0].userId : t.assignedTo[0]) : (typeof t.assignedTo === "string" ? t.assignedTo : undefined),
        assignee: Array.isArray(t.assignedTo) && t.assignedTo[0] ? (typeof t.assignedTo[0] === "object" ? { id: t.assignedTo[0].userId, name: t.assignedTo[0].name || "Unknown", avatarUrl: t.assignedTo[0].avatar, role: "member" as const, email: "" } : { id: t.assignedTo[0], name: "Unknown", avatarUrl: undefined, role: "member" as const, email: "" }) : (typeof t.assignedTo === "string" ? { id: t.assignedTo, name: "Unknown", avatarUrl: undefined, role: "member" as const, email: "" } : undefined),
        assigneeIds: Array.isArray(t.assignedTo) ? t.assignedTo.map((a: any) => typeof a === "object" ? a.userId : a) : (typeof t.assignedTo === "string" ? [t.assignedTo] : []),
        assignees: Array.isArray(t.assignedTo) ? t.assignedTo.map((a: any) => typeof a === "object" ? { id: a.userId, name: a.name || "Unknown", avatarUrl: a.avatar, role: "member" as const, email: "" } : { id: a, name: "Unknown", avatarUrl: undefined, role: "member" as const, email: "" }) : (typeof t.assignedTo === "string" ? [{ id: t.assignedTo, name: "Unknown", avatarUrl: undefined, role: "member" as const, email: "" }] : []),
        reporterId: t.createdByUserId,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
        isBlocked: t.isBlocked ?? false,
        linkWithCodebase: t.linkWithCodebase ?? null,
        estimation: t.estimation ?? null,
      }));
      return new Response(JSON.stringify(mapped), { status: 200, headers: { "Content-Type": "application/json", ...CORS_HEADERS } });
    } catch (e: any) {
      return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { "Content-Type": "application/json", ...CORS_HEADERS } });
    }
  }),
});

// ── GET /ext/issues?projectId=… — list issues (authorized in query!) ────────
http.route({
  path: "/ext/issues",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const auth = await authenticateRequest(ctx, request);
    if (!auth.ok) return auth.response;
    const url = new URL(request.url);
    const projectId = url.searchParams.get("projectId");
    if (!projectId) return new Response(JSON.stringify({ error: "projectId required" }), { status: 400, headers: { "Content-Type": "application/json", ...CORS_HEADERS } });

    try {
      const issues = await ctx.runQuery(internal.extensionApi.getProjectIssuesFull, {
        projectId: projectId as any,
        userId: auth.userId as any
      });
      const priorityMap: Record<string, string> = { critical: "critical", medium: "medium", low: "low" };
      const mapped = (issues ?? []).map((i: any) => ({
        id: i._id,
        projectId: i.projectId,
        title: i.title,
        description: i.description,
        status: i.status,
        taskId: i.taskId,
        priority: priorityMap[i.severity || ""] ?? "medium",
        severity: i.severity ?? "medium",
        environment: i.environment ?? "local",
        due_date: i.due_date,
        fileLinked: i.fileLinked ?? null,
        linkWithCodebase: i.fileLinked ?? null,
        assigneeId: i.IssueAssignee?.[0]?.userId,
        assignee: i.IssueAssignee?.[0] ? { id: i.IssueAssignee[0].userId, name: i.IssueAssignee[0].name, avatarUrl: i.IssueAssignee[0].avatar, role: "member" as const, email: "" } : undefined,
        assigneeIds: Array.isArray(i.IssueAssignee) ? i.IssueAssignee.map((a: any) => a.userId) : [],
        assignees: Array.isArray(i.IssueAssignee) ? i.IssueAssignee.map((a: any) => ({ id: a.userId, name: a.name || "Unknown", avatarUrl: a.avatar, role: "member" as const, email: "" })) : [],
        reporterId: i.createdByUserId,
        createdAt: i.createdAt,
        updatedAt: i.updatedAt,
      }));
      return new Response(JSON.stringify(mapped), { status: 200, headers: { "Content-Type": "application/json", ...CORS_HEADERS } });
    } catch (e: any) {
      return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { "Content-Type": "application/json", ...CORS_HEADERS } });
    }
  }),
});

// ── GET /ext/team?projectId=… — list team (authorized in query!) ────────────
http.route({
  path: "/ext/team",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const auth = await authenticateRequest(ctx, request);
    if (!auth.ok) return auth.response;
    const url = new URL(request.url);
    const projectId = url.searchParams.get("projectId");
    if (!projectId) return new Response(JSON.stringify({ error: "projectId required" }), { status: 400, headers: { "Content-Type": "application/json", ...CORS_HEADERS } });

    try {
      const members = await ctx.runQuery(internal.extensionApi.getProjectMembersFull, {
        projectId: projectId as any,
        userId: auth.userId as any
      });
      const mapped = (members ?? []).map((m: any) => ({
        id: m._id,
        userId: m.userId,
        user: { id: m.userId, name: m.userName ?? "Unknown", avatarUrl: m.userImage, role: m.AccessRole ?? "member", email: "" },
        role: m.AccessRole ?? "member",
      }));
      return new Response(JSON.stringify(mapped), { status: 200, headers: { "Content-Type": "application/json", ...CORS_HEADERS } });
    } catch (e: any) {
      return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { "Content-Type": "application/json", ...CORS_HEADERS } });
    }
  }),
});

// ── POST /ext/tasks/:id/mark-as-issue — block task & create issue (authorized)
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
      const issueId = await ctx.runMutation(internal.extensionApi.markTaskAsIssueInternal, {
        taskId: taskId as any,
        userId: auth.userId as any
      });
      return new Response(JSON.stringify({ success: true, issueId }), { status: 200, headers: { "Content-Type": "application/json", ...CORS_HEADERS } });
    } catch (e: any) {
      return new Response(JSON.stringify({ error: e.message }), { status: 403, headers: { "Content-Type": "application/json", ...CORS_HEADERS } });
    }
  }),
});

// ── DELETE /ext/tasks/:id — delete task (authorized) ──────────────────────
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
      await ctx.runMutation(internal.extensionApi.deleteTaskInternal, {
        taskId: taskId as any,
        userId: auth.userId as any
      });
      return new Response(JSON.stringify({ success: true, taskId }), { status: 200, headers: { "Content-Type": "application/json", ...CORS_HEADERS } });
    } catch (e: any) {
      return new Response(JSON.stringify({ error: e.message }), { status: 403, headers: { "Content-Type": "application/json", ...CORS_HEADERS } });
    }
  }),
});

// ── DELETE /ext/issues/:id — delete issue (authorized) ────────────────────
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
      await ctx.runMutation(internal.extensionApi.deleteIssueInternal, {
        issueId: issueId as any,
        userId: auth.userId as any
      });
      return new Response(JSON.stringify({ success: true, issueId }), { status: 200, headers: { "Content-Type": "application/json", ...CORS_HEADERS } });
    } catch (e: any) {
      return new Response(JSON.stringify({ error: e.message }), { status: 403, headers: { "Content-Type": "application/json", ...CORS_HEADERS } });
    }
  }),
});

// ── POST /ext/tasks — create task (authorized) ─────────────────────────────
http.route({
  path: "/ext/tasks",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const auth = await authenticateRequest(ctx, request);
    if (!auth.ok) return auth.response;
    try {
      const body = await request.json();
      // Explicitly pick only known/safe fields — never spread raw body into a mutation
      // to prevent field-injection attacks (e.g. overwriting createdAt, userId).
      const created = await ctx.runMutation(internal.extensionApi.createTaskInternal, {
        projectId: body.projectId,
        title: body.title,
        description: body.description,
        status: body.status,
        priority: body.priority,
        sprintId: body.sprintId,
        estimation: body.estimation,
        type: body.type,
        linkWithCodebase: body.linkWithCodebase,
        assigneeId: body.assigneeId,
        assigneeIds: body.assigneeIds,
        isBlocked: body.isBlocked,
        userId: auth.userId as any,
      });

      const mapped = {
        id: created._id,
        projectId: created.projectId,
        sprintId: created.sprintId,
        title: created.title,
        description: created.description,
        status: created.status,
        type: created.type,
        priority: created.priority ?? "low",
        assigneeId: Array.isArray(created.assignedTo) && created.assignedTo[0] ? (typeof created.assignedTo[0] === "object" ? created.assignedTo[0].userId : created.assignedTo[0]) : (typeof created.assignedTo === "string" ? created.assignedTo : undefined),
        assignee: Array.isArray(created.assignedTo) && created.assignedTo[0] ? (typeof created.assignedTo[0] === "object" ? { id: created.assignedTo[0].userId, name: created.assignedTo[0].name || "Unknown", avatarUrl: created.assignedTo[0].avatar, role: "member" as const, email: "" } : { id: created.assignedTo[0], name: "Unknown", avatarUrl: undefined, role: "member" as const, email: "" }) : (typeof created.assignedTo === "string" ? { id: created.assignedTo, name: "Unknown", avatarUrl: undefined, role: "member" as const, email: "" } : undefined),
        assigneeIds: Array.isArray(created.assignedTo) ? created.assignedTo.map((a: any) => typeof a === "object" ? a.userId : a) : (typeof created.assignedTo === "string" ? [created.assignedTo] : []),
        assignees: Array.isArray(created.assignedTo) ? created.assignedTo.map((a: any) => typeof a === "object" ? { id: a.userId, name: a.name || "Unknown", avatarUrl: a.avatar, role: "member" as const, email: "" } : { id: a, name: "Unknown", avatarUrl: undefined, role: "member" as const, email: "" }) : (typeof created.assignedTo === "string" ? [{ id: created.assignedTo, name: "Unknown", avatarUrl: undefined, role: "member" as const, email: "" }] : []),
        reporterId: created.createdByUserId,
        createdAt: created.createdAt,
        updatedAt: created.updatedAt,
        isBlocked: created.isBlocked ?? false,
        linkWithCodebase: created.linkWithCodebase ?? null,
        estimation: created.estimation ?? null,
      };
      return new Response(JSON.stringify(mapped), { status: 200, headers: { "Content-Type": "application/json", ...CORS_HEADERS } });
    } catch (e: any) {
      return new Response(JSON.stringify({ error: e.message }), { status: 403, headers: { "Content-Type": "application/json", ...CORS_HEADERS } });
    }
  }),
});

// ── PATCH /ext/tasks/:id — update task (authorized) ────────────────────────
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
      const updated = await ctx.runMutation(internal.extensionApi.updateTaskInternal, {
        taskId: taskId as any,
        userId: auth.userId as any,
        ...body
      });
      const mapped = {
        id: updated._id,
        projectId: updated.projectId,
        sprintId: updated.sprintId,
        title: updated.title,
        description: updated.description,
        status: updated.status,
        type: updated.type,
        priority: updated.priority ?? "low",
        assigneeId: Array.isArray(updated.assignedTo) && updated.assignedTo[0] ? (typeof updated.assignedTo[0] === "object" ? updated.assignedTo[0].userId : updated.assignedTo[0]) : (typeof updated.assignedTo === "string" ? updated.assignedTo : undefined),
        assignee: Array.isArray(updated.assignedTo) && updated.assignedTo[0] ? (typeof updated.assignedTo[0] === "object" ? { id: updated.assignedTo[0].userId, name: updated.assignedTo[0].name || "Unknown", avatarUrl: updated.assignedTo[0].avatar, role: "member" as const, email: "" } : { id: updated.assignedTo[0], name: "Unknown", avatarUrl: undefined, role: "member" as const, email: "" }) : (typeof updated.assignedTo === "string" ? { id: updated.assignedTo, name: "Unknown", avatarUrl: undefined, role: "member" as const, email: "" } : undefined),
        assigneeIds: Array.isArray(updated.assignedTo) ? updated.assignedTo.map((a: any) => typeof a === "object" ? a.userId : a) : (typeof updated.assignedTo === "string" ? [updated.assignedTo] : []),
        assignees: Array.isArray(updated.assignedTo) ? updated.assignedTo.map((a: any) => typeof a === "object" ? { id: a.userId, name: a.name || "Unknown", avatarUrl: a.avatar, role: "member" as const, email: "" } : { id: a, name: "Unknown", avatarUrl: undefined, role: "member" as const, email: "" }) : (typeof updated.assignedTo === "string" ? [{ id: updated.assignedTo, name: "Unknown", avatarUrl: undefined, role: "member" as const, email: "" }] : []),
        reporterId: updated.createdByUserId,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
        isBlocked: updated.isBlocked ?? false,
        linkWithCodebase: updated.linkWithCodebase ?? null,
        estimation: updated.estimation ?? null,
      };
      return new Response(JSON.stringify(mapped), { status: 200, headers: { "Content-Type": "application/json", ...CORS_HEADERS } });
    } catch (e: any) {
      return new Response(JSON.stringify({ error: e.message }), { status: 403, headers: { "Content-Type": "application/json", ...CORS_HEADERS } });
    }
  }),
});

// ── POST /ext/issues — create issue (authorized) ───────────────────────────
http.route({
  path: "/ext/issues",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const auth = await authenticateRequest(ctx, request);
    if (!auth.ok) return auth.response;
    try {
      const body = await request.json();
      // Explicitly pick only known/safe fields — never spread raw body into a mutation
      // to prevent field-injection attacks (e.g. overwriting createdAt or userId).
      const created = await ctx.runMutation(internal.extensionApi.createIssueInternal, {
        title: body.title,
        description: body.description,
        environment: body.environment,
        severity: body.severity,
        due_date: body.due_date,
        status: body.status ?? "not opened",
        type: body.type ?? "manual",
        githubIssueUrl: body.githubIssueUrl,
        fileLinked: body.fileLinked,
        taskId: body.taskId,
        projectId: body.projectId,
        assignees: body.assignees,
        userId: auth.userId as any,
      });

      const priorityMap: Record<string, string> = { critical: "critical", medium: "medium", low: "low" };
      const mapped = {
        id: created._id,
        projectId: created.projectId,
        title: created.title,
        description: created.description,
        status: created.status,
        taskId: created.taskId,
        priority: priorityMap[created.severity || ""] ?? "medium",
        severity: created.severity ?? "medium",
        environment: created.environment ?? "local",
        due_date: created.due_date,
        fileLinked: created.fileLinked ?? null,
        linkWithCodebase: created.fileLinked ?? null,
        assigneeId: created.IssueAssignee?.[0]?.userId,
        assignee: created.IssueAssignee?.[0] ? { id: created.IssueAssignee[0].userId, name: created.IssueAssignee[0].name || "Unknown", avatarUrl: created.IssueAssignee[0].avatar, role: "member" as const, email: "" } : undefined,
        assigneeIds: Array.isArray(created.IssueAssignee) ? created.IssueAssignee.map((a: any) => a.userId) : [],
        assignees: Array.isArray(created.IssueAssignee) ? created.IssueAssignee.map((a: any) => ({ id: a.userId, name: a.name || "Unknown", avatarUrl: a.avatar, role: "member" as const, email: "" })) : [],
        reporterId: created.createdByUserId,
        createdAt: created.createdAt,
        updatedAt: created.updatedAt,
      };
      return new Response(JSON.stringify(mapped), { status: 200, headers: { "Content-Type": "application/json", ...CORS_HEADERS } });
    } catch (e: any) {
      return new Response(JSON.stringify({ error: e.message }), { status: 403, headers: { "Content-Type": "application/json", ...CORS_HEADERS } });
    }
  }),
});

// ── PATCH /ext/issues/:id — update issue (authorized) ──────────────────────
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
      const updated = await ctx.runMutation(internal.extensionApi.updateIssueInternal, {
        issueId: issueId as any,
        userId: auth.userId as any,
        ...body
      });
      const priorityMap: Record<string, string> = { critical: "critical", medium: "medium", low: "low" };
      const mapped = {
        id: updated._id,
        projectId: updated.projectId,
        title: updated.title,
        description: updated.description,
        status: updated.status,
        taskId: updated.taskId,
        priority: priorityMap[updated.severity || ""] ?? "medium",
        severity: updated.severity ?? "medium",
        environment: updated.environment ?? "local",
        due_date: updated.due_date,
        fileLinked: updated.fileLinked ?? null,
        linkWithCodebase: updated.fileLinked ?? null,
        assigneeId: updated.IssueAssignee?.[0]?.userId,
        assignee: updated.IssueAssignee?.[0] ? { id: updated.IssueAssignee[0].userId, name: updated.IssueAssignee[0].name || "Unknown", avatarUrl: updated.IssueAssignee[0].avatar, role: "member" as const, email: "" } : undefined,
        assigneeIds: Array.isArray(updated.IssueAssignee) ? updated.IssueAssignee.map((a: any) => a.userId) : [],
        assignees: Array.isArray(updated.IssueAssignee) ? updated.IssueAssignee.map((a: any) => ({ id: a.userId, name: a.name || "Unknown", avatarUrl: a.avatar, role: "member" as const, email: "" })) : [],
        reporterId: updated.createdByUserId,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
      };
      return new Response(JSON.stringify(mapped), { status: 200, headers: { "Content-Type": "application/json", ...CORS_HEADERS } });
    } catch (e: any) {
      return new Response(JSON.stringify({ error: e.message }), { status: 403, headers: { "Content-Type": "application/json", ...CORS_HEADERS } });
    }
  }),
});

// ── GET /ext/tickets?projectId=… — list my tickets (authorized) ───────────
http.route({
  path: "/ext/tickets",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const auth = await authenticateRequest(ctx, request);
    if (!auth.ok) return auth.response;
    const url = new URL(request.url);
    const projectId = url.searchParams.get("projectId");
    if (!projectId) return new Response(JSON.stringify({ error: "projectId required" }), { status: 400, headers: { "Content-Type": "application/json", ...CORS_HEADERS } });

    try {
      const tickets = await ctx.runQuery(internal.extensionApi.getMyTicketsFull, {
        projectId: projectId as any,
        userId: auth.userId as any,
      });
      return new Response(JSON.stringify(tickets), { status: 200, headers: { "Content-Type": "application/json", ...CORS_HEADERS } });
    } catch (e: any) {
      return new Response(JSON.stringify({ error: e.message }), { status: 403, headers: { "Content-Type": "application/json", ...CORS_HEADERS } });
    }
  }),
});

// ── PATCH /ext/tickets/:id — close or reopen a ticket (authorized) ─────────
http.route({
  pathPrefix: "/ext/tickets/",
  method: "PATCH",
  handler: httpAction(async (ctx, request) => {
    const auth = await authenticateRequest(ctx, request);
    if (!auth.ok) return auth.response;
    const url = new URL(request.url);
    const ticketId = url.pathname.replace(/^\/ext\/tickets\//, "").split("/")[0];
    if (!ticketId) return new Response(JSON.stringify({ error: "Missing ticketId" }), { status: 400, headers: { "Content-Type": "application/json", ...CORS_HEADERS } });

    try {
      const body = await request.json();
      if (body.status !== "open" && body.status !== "closed") {
        return new Response(JSON.stringify({ error: "status must be 'open' or 'closed'" }), { status: 400, headers: { "Content-Type": "application/json", ...CORS_HEADERS } });
      }
      const updated = await ctx.runMutation(internal.extensionApi.updateTicketStatusInternal, {
        ticketId: ticketId as any,
        userId: auth.userId as any,
        status: body.status,
      });
      return new Response(JSON.stringify(updated), { status: 200, headers: { "Content-Type": "application/json", ...CORS_HEADERS } });
    } catch (e: any) {
      return new Response(JSON.stringify({ error: e.message }), { status: 403, headers: { "Content-Type": "application/json", ...CORS_HEADERS } });
    }
  }),
});

export default http;

