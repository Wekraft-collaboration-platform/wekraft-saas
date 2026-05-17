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

export default http;
