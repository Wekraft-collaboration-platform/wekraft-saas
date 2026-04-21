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

export default http;
