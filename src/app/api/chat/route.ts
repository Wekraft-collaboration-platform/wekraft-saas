import { NextRequest, NextResponse } from "next/server";
import { roxo } from "@/modules/ai/agent";
import { HumanMessage } from "@langchain/core/messages";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, threadId = "default-thread" } = body;

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const config = { configurable: { thread_id: threadId } };

    // Standard invocation of the main network logic.
    const result = await roxo.invoke(
      { messages: [new HumanMessage(message)] },
      config
    );

    const lastMsg = result.messages?.at(-1);
    const content =
      typeof lastMsg?.content === "string"
        ? lastMsg.content
        : JSON.stringify(lastMsg?.content ?? "no output");

    // Fetch the pending interrupts to know if user review is needed
    // e.g. for `add_task_to_sprint` human-in-the-loop tool calling.
    const state = await roxo.getState(config);
    const pendingInterrupts = (state?.tasks ?? [])
      .flatMap((t: any) => t.interrupts ?? [])
      .map((i: any) => i.value);

    // Provide the clean JSON data back out. Later this can be adapted
    // to Langchain event streaming by Vercel AI SDK.
    return NextResponse.json({
      content,
      interrupts: pendingInterrupts,
      threadId,
    });
  } catch (error: any) {
    console.error("AI Route Error:", error);
    return NextResponse.json(
      { error: "Failed to process chat message", details: error.message },
      { status: 500 }
    );
  }
}
