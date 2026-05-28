// hooks/use-chatbot.ts
import { useState, useCallback, useRef } from "react";
import { streamChatbot } from "./chatbot-stream";


export interface Message {
    id: string;
    role: "user" | "assistant";
    text: string;
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

            // 3. build messages array in UIMessage parts format
            const allMessages = [...messages, userMsg].map((m) => ({
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
                    },
                    onToolDone: (toolName: string, output: any) => {
                        setToolStatus({ toolName, status: "done", output });
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