import { NextRequest, NextResponse } from "next/server";
import { roxo } from "@/modules/ai/agent";
import { HumanMessage } from "@langchain/core/messages";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, message, threadId = "default-thread", command } = body;

    // Support standard { messages: [...] } from useStream
    // or { message: "..." } from test script
    let payload;
    if (command) {
      // Used for resuming from an interrupt (e.g. HITL)
      const { Command } = await import("@langchain/langgraph");
      payload = new Command(command);
    } else {
      payload = { messages: messages ?? [new HumanMessage(message)] };
    }

    const config = { configurable: { thread_id: threadId } };

    // Create a ReadableStream from roxo.streamEvents
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const streamEvents = roxo.streamEvents(payload, {
            ...config,
            version: "v2",
          });

          for await (const event of streamEvents) {
            // Stream the raw event directly to the frontend in ndjson (Newline Delimited JSON) format
            controller.enqueue(
              new TextEncoder().encode(JSON.stringify(event) + "\n"),
            );
          }
        } catch (e) {
          console.error("Stream generation error:", e);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error: any) {
    console.error("AI Route Error:", error);
    return NextResponse.json(
      { error: "Failed to process chat message", details: error.message },
      { status: 500 },
    );
  }
}
