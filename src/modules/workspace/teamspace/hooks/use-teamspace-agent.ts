// hooks/use-teamspace-agent.ts
import { useState, useCallback, useRef } from "react";

export interface Message {
    id: string;
    role: "user" | "assistant" | "tool";
    text: string;
    toolName?: string;
    toolStatus?: "running" | "done";
}

export interface ToolStatus {
    toolName: string;
    status: "running" | "done";
    output?: unknown;
}

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

export interface AgentStreamCallbacks {
    onText?: (delta: string) => void;
    onTextDone?: (fullText: string) => void;
    onToolStart?: (toolName: string) => void;
    onToolDone?: (toolName: string, output: unknown) => void;
    onFinish?: () => void;
    onError?: (err: Error) => void;
}

async function streamAgent(
    agent: "kaya" | "harry",
    body: { projectId: string; messages: unknown[] },
    callbacks: AgentStreamCallbacks
) {
    // Only Kaya route exists currently, default to kaya if harry is selected
    const route = `/api/${agent === "harry" ? "kaya" : agent}-teamspace`;

    const res = await fetch(route, {
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

    const textBlocks = new Map<string, string>();
    const toolNames = new Map<string, string>();
    let buffer = "";

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
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
                continue;
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

export function useTeamspaceAgent(projectId: string, agent: "kaya" | "harry") {
    const [messages, setMessages] = useState<Message[]>([]);
    const [toolStatus, setToolStatus] = useState<ToolStatus | null>(null);
    const [isStreaming, setIsStreaming] = useState(false);
    const assistantIdRef = useRef(0);

    const clearChat = useCallback(() => {
        setMessages([]);
        setToolStatus(null);
        setIsStreaming(false);
    }, []);

    const sendMessage = useCallback(
        async (text: string) => {
            const userMsg: Message = {
                id: `user-${Date.now()}`,
                role: "user",
                text,
            };
            setMessages((prev) => [...prev, userMsg]);

            const assistantId = `assistant-${++assistantIdRef.current}`;
            setMessages((prev) => [
                ...prev,
                { id: assistantId, role: "assistant", text: "" },
            ]);
            setIsStreaming(true);
            setToolStatus(null);

            const allMessages = [...messages, userMsg]
                .filter((m) => m.role === "user" || m.role === "assistant")
                .map((m) => ({
                    id: m.id,
                    role: m.role,
                    parts: [{ type: "text", text: m.text }],
                }));

            try {
                await streamAgent(
                    agent,
                    { projectId, messages: allMessages },
                    {
                        onText: (delta: string) => {
                            setMessages((prev) =>
                                prev.map((m) =>
                                    m.id === assistantId ? { ...m, text: m.text + delta } : m
                                )
                            );
                        },
                        onToolStart: (toolName: string) => {
                            setToolStatus({ toolName, status: "running" });
                            setMessages((prev) => [
                                ...prev,
                                {
                                    id: `tool-${toolName}-${Date.now()}`,
                                    role: "tool",
                                    text: "",
                                    toolName,
                                    toolStatus: "running",
                                },
                            ]);
                        },
                        onToolDone: (toolName: string, output: any) => {
                            setToolStatus({ toolName, status: "done", output });
                            setMessages((prev) =>
                                prev.map((m) =>
                                    m.role === "tool" && m.toolName === toolName && m.toolStatus === "running"
                                        ? { ...m, toolStatus: "done" }
                                        : m
                                )
                            );
                        },
                        onFinish: () => {
                            setIsStreaming(false);
                            setToolStatus(null);
                        },
                        onError: (err: any) => {
                            console.error("Agent Stream error:", err);
                            setIsStreaming(false);
                            setToolStatus(null);
                        },
                    }
                );
            } catch (err) {
                console.error("Fetch/Stream execution failed:", err);
                setIsStreaming(false);
                setToolStatus(null);
            }
        },
        [messages, projectId, agent]
    );

    return { messages, toolStatus, isStreaming, sendMessage, clearChat };
}
