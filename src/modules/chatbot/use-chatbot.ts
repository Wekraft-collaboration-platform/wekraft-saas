// hooks/use-chatbot.ts
import { useState, useCallback, useRef } from "react";
import { streamChatbot } from "./chatbot-stream";


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

export function useChatbot(userId: string) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [toolStatus, setToolStatus] = useState<ToolStatus | null>(null);
    const [isStreaming, setIsStreaming] = useState(false);
    const assistantIdRef = useRef(0);

    const sendMessage = useCallback(
        async (text: string) => {
            // 1. add user message
            const userMsg: Message = {
                id: `user-${Date.now()}`,
                role: "user",
                text,
            };
            setMessages((prev) => [...prev, userMsg]);

            // 2. prepare empty assistant bubble
            const assistantId = `assistant-${++assistantIdRef.current}`;
            setMessages((prev) => [
                ...prev,
                { id: assistantId, role: "assistant", text: "" },
            ]);
            setIsStreaming(true);
            setToolStatus(null);

            // 3. build messages array in UIMessage parts format, excluding UI-only tool messages
            const allMessages = [...messages, userMsg]
                .filter((m) => m.role === "user" || m.role === "assistant")
                .map((m) => ({
                    id: m.id,
                    role: m.role,
                    parts: [{ type: "text", text: m.text }],
                }));

            await streamChatbot(
                { userId, messages: allMessages },
                {
                    onText: (delta: string) => {
                        // append each chunk to the assistant bubble in real time
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
                        console.error("Stream error:", err);
                        setIsStreaming(false);
                        setToolStatus(null);
                    },
                }
            );
        },
        [messages, userId]
    );

    return { messages, toolStatus, isStreaming, sendMessage };
}