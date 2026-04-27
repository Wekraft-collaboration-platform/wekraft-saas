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

// get project tasks
http.route({
  path: "/getProjectTasks",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.json();

    if (!body.projectId) {
      return new Response(JSON.stringify({ error: "projectId is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const tasks = await ctx.runQuery(internal.agentTools.getProjectTasks, {
      projectId: body.projectId,
      ...(body.status && { status: body.status }),
      ...(body.priority && { priority: body.priority }),
      ...(body.sprintId && { sprintId: body.sprintId }),
    });

    return new Response(JSON.stringify({ tasks }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }),
});

// get project issues
http.route({
  path: "/getProjectIssues",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.json();

    if (!body.projectId) {
      return new Response(JSON.stringify({ error: "projectId is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const issues = await ctx.runQuery(internal.agentTools.getProjectIssues, {
      projectId: body.projectId,
      ...(body.status && { status: body.status }),
      ...(body.severity && { severity: body.severity }),
      ...(body.environment && { environment: body.environment }),
      ...(body.sprintId && { sprintId: body.sprintId }),
    });

    return new Response(JSON.stringify({ issues }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }),
});

// get prject sprint planner context
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

// =======================INSIGHTS TOOLS HTTP===============================
// get member workload
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

export default http;
