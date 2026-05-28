// lib/chatbot-stream.ts

export type StreamEvent =
    | { type: "start" }
    | { type: "start-step" }
    | { type: "finish-step" }
    | { type: "finish"; finishReason: string }
    | { type: "text-start"; id: string }
    | { type: "text-delta"; id: string; delta: string }
    | { type: "text-end"; id: string }
    | { type: "tool-input-start"; toolCallId: string; toolName: string }
    | { type: "tool-input-delta"; toolCallId: string; inputTextDelta: string }
    | { type: "tool-input-available"; toolCallId: string; toolName: string; input: Record<string, unknown> }
    | { type: "tool-output-available"; toolCallId: string; output: unknown };

export interface ChatbotStreamCallbacks {
    onText?: (delta: string) => void;           // called per text chunk — use this to update UI
    onTextDone?: (fullText: string) => void;    // called once when text block finishes
    onToolStart?: (toolName: string) => void;   // e.g. show "Fetching queries..."
    onToolDone?: (toolName: string, output: unknown) => void;
    onFinish?: () => void;
    onError?: (err: Error) => void;
}

export async function streamChatbot(
    body: { userId: string; messages: unknown[] },
    callbacks: ChatbotStreamCallbacks
) {
    const res = await fetch("/api/chatbot", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "text/event-stream",
        },
        body: JSON.stringify(body),
    });

    if (!res.ok || !res.body) {
        callbacks.onError?.(new Error(`HTTP ${res.status}`));
        return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();

    // track text per id so we can assemble full text on text-end
    const textBlocks = new Map<string, string>();
    // track tool name per toolCallId
    const toolNames = new Map<string, string>();

    let buffer = "";

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // SSE lines are separated by \n
        const lines = buffer.split("\n");
        // keep the last incomplete line in the buffer
        buffer = lines.pop() ?? "";

        for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const raw = line.slice("data: ".length).trim();
            if (raw === "[DONE]") {
                callbacks.onFinish?.();
                return;
            }

            let event: StreamEvent;
            try {
                event = JSON.parse(raw);
            } catch {
                continue; // skip malformed lines
            }

            switch (event.type) {
                case "text-start":
                    textBlocks.set(event.id, "");
                    break;

                case "text-delta":
                    textBlocks.set(event.id, (textBlocks.get(event.id) ?? "") + event.delta);
                    callbacks.onText?.(event.delta);
                    break;

                case "text-end":
                    callbacks.onTextDone?.(textBlocks.get(event.id) ?? "");
                    textBlocks.delete(event.id);
                    break;

                case "tool-input-start":
                    toolNames.set(event.toolCallId, event.toolName);
                    callbacks.onToolStart?.(event.toolName);
                    break;

                case "tool-output-available":
                    callbacks.onToolDone?.(
                        toolNames.get(event.toolCallId) ?? "unknown",
                        event.output
                    );
                    toolNames.delete(event.toolCallId);
                    break;
            }
        }
    }
}