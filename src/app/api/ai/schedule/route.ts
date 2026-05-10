import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";

// Initialize Convex Client
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: NextRequest) {
  try {
    const { projectId } = await req.json();

    if (!projectId) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 },
      );
    }

    // 1. Fetch all data from Convex using our aggregator query
    console.log(`[AI Schedule] Fetching context for project: ${projectId}`);
    const context = await convex.query(
      api.scheduler.getProjectScheduleContext,
      {
        projectId,
      },
    );

    if (!context) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // 2. Construct the prompt
    const prompt = `
You are "Kaya", an elite AI Project Manager and Scrum Master. Your goal is to provide a concise, high-impact Project Schedule Brief based on the provided data.

DATA CONTEXT:
${JSON.stringify(context, null, 2)}

INSTRUCTIONS:
1. Summarize the project's current health and timeline status.
2. Analyze the current sprint progress and highlight any bottlenecks.
3. Review team workload and identify potential burnout or under-utilization.
4. Call out CRITICAL and BLOCKED tasks/issues that need immediate attention.
5. Provide 3-5 strategic recommendations for the next few days.

OUTPUT FORMAT:
- Use clear Markdown formatting with titles and subtitles.
- Use bullet points for readability.
- Keep the tone professional, encouraging, and highly analytical.
- The document should be titled "Project Schedule Brief: [Project Name]".

Begin the report:
`;

    console.log(`[AI Schedule] Generating brief with OpenAI...`);
    const { text } = await generateText({
      model: openai("gpt-4.1-mini"),
      prompt: prompt,
    });

    console.log("--- AI GENERATED BRIEF ---");
    console.log(text);
    console.log("--------------------------");

    return NextResponse.json({ text });
  } catch (error: any) {
    console.error("[AI Schedule Error]:", error);
    return NextResponse.json(
      { error: "Failed to generate schedule brief", details: error.message },
      { status: 500 },
    );
  }
}
