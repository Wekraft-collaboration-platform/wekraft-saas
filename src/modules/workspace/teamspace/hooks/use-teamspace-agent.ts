// hooks/use-teamspace-agent.ts
import { useState, useCallback, useRef, useEffect } from "react";
import { toast } from "sonner";
import * as Ably from "ably";
import { getAblyClient } from "@/lib/ably";

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
  | {
      type: "tool-input-available";
      toolCallId: string;
      toolName: string;
      input: Record<string, unknown>;
    }
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
  callbacks: AgentStreamCallbacks,
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
    if (res.status === 429) {
      callbacks.onError?.(new Error("rate-limit"));
    } else {
      callbacks.onError?.(new Error(`HTTP ${res.status}`));
    }
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
          textBlocks.set(
            event.id,
            (textBlocks.get(event.id) ?? "") + event.delta,
          );
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
            event.output,
          );
          toolNames.delete(event.toolCallId);
          break;
      }
    }
  }
}

export function useTeamspaceAgent(
  projectId: string,
  agent: "kaya" | "harry",
  channelId: string | null,
) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [toolStatus, setToolStatus] = useState<ToolStatus | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const assistantIdRef = useRef(0);
  const myClientIdRef = useRef(crypto.randomUUID());

  // Subscribe to remote agent state updates
  useEffect(() => {
    if (!channelId) return;

    const ably = getAblyClient();
    const ch = ably.channels.get(`teamspace:${channelId}`);

    const handleAgentState = (msg: Ably.Message) => {
      const data = msg.data;
      if (data.agent !== agent) return;
      if (data.senderClientId === myClientIdRef.current) return;

      setIsStreaming(data.isStreaming);
      setToolStatus(data.toolStatus);
      if (data.isStreaming) {
        setMessages([
          { id: `remote-${agent}-temp-user`, role: "user", text: "" },
          {
            id: `remote-${agent}-temp-assistant`,
            role: "assistant",
            text: data.text,
          },
        ]);
      } else {
        setMessages([]);
      }
    };

    ch.subscribe("agent.state", handleAgentState);

    return () => {
      ch.unsubscribe("agent.state", handleAgentState);
    };
  }, [channelId, agent]);

  const clearChat = useCallback(() => {
    setMessages([]);
    setToolStatus(null);
    setIsStreaming(false);
  }, []);

  const sendMessage = useCallback(
    async (
      text: string,
      channelId: string,
      threadParentId: string | null,
      channelMessages: any[],
      currentUserName: string,
    ) => {
      const publishState = (state: {
        isStreaming: boolean;
        toolStatus: ToolStatus | null;
        text: string;
      }) => {
        try {
          const ably = getAblyClient();
          const ch = ably.channels.get(`teamspace:${channelId}`);
          ch.publish("agent.state", {
            agent,
            senderClientId: myClientIdRef.current,
            ...state,
          });
        } catch (e) {
          console.error("Failed to publish agent state to Ably:", e);
        }
      };

      const userMsg: Message = {
        id: `user-${Date.now()}`,
        role: "user",
        text,
      };
      const assistantId = `assistant-${++assistantIdRef.current}`;
      setMessages([userMsg, { id: assistantId, role: "assistant", text: "" }]);
      setIsStreaming(true);
      setToolStatus(null);
      publishState({ isStreaming: true, toolStatus: null, text: "" });

      const assistantTextRef = { current: "" };

      // 1. Filter history: last 5 messages that are less than 1 hour old and are agent-related
      const oneHourAgo = Date.now() - 60 * 60 * 1000;
      const recentMessages = channelMessages
        .filter((m) => {
          const isTimeValid = m.created_at >= oneHourAgo;
          if (!isTimeValid) return false;
          const isAgent = m.user_id === "kaya" || m.user_id === "harry";
          const mentionsAgent =
            m.content.toLowerCase().includes("@kaya") ||
            m.content.toLowerCase().includes("@harry");
          return isAgent || mentionsAgent;
        })
        .slice(-5);

      // 2. Format history prefixing usernames for user messages
      const history = recentMessages.map((m) => {
        const isAgent = m.user_id === "kaya" || m.user_id === "harry";
        return {
          id: m.id,
          role: isAgent ? ("assistant" as const) : ("user" as const),
          parts: [
            {
              type: "text" as const,
              text: isAgent ? m.content : `[User: ${m.user_name}] ${m.content}`,
            },
          ],
        };
      });

      // 3. Append the active message
      const allMessages = [
        ...history,
        {
          id: `user-temp-${Date.now()}`,
          role: "user" as const,
          parts: [
            {
              type: "text" as const,
              text: `[User: ${currentUserName}] ${text}`,
            },
          ],
        },
      ];

      try {
        await streamAgent(
          agent,
          { projectId, messages: allMessages },
          {
            onText: (delta: string) => {
              const prevText = assistantTextRef.current;
              assistantTextRef.current += delta;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId ? { ...m, text: m.text + delta } : m,
                ),
              );
              if (prevText === "") {
                publishState({
                  isStreaming: true,
                  toolStatus: null,
                  text: "Kaya is typing...",
                });
              }
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
              publishState({
                isStreaming: true,
                toolStatus: { toolName, status: "running" },
                text: "",
              });
            },
            onToolDone: (toolName: string, output: any) => {
              setToolStatus({ toolName, status: "done", output });
              setMessages((prev) =>
                prev.map((m) =>
                  m.role === "tool" &&
                  m.toolName === toolName &&
                  m.toolStatus === "running"
                    ? { ...m, toolStatus: "done" }
                    : m,
                ),
              );
              publishState({
                isStreaming: true,
                toolStatus: { toolName, status: "done" },
                text: "",
              });
            },
            onFinish: async () => {
              // Save final response to the DB
              const finalMsgText = assistantTextRef.current;
              if (finalMsgText) {
                try {
                  await fetch("/api/teamspace/messages", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      channelId,
                      projectId,
                      content: finalMsgText,
                      threadParentId,
                      isAgent: true,
                      agentName: agent === "kaya" ? "Kaya" : "Harry",
                    }),
                  });
                } catch (e) {
                  console.error("Failed to save agent message to database:", e);
                }
              }

              publishState({ isStreaming: false, toolStatus: null, text: "" });

              // Delay hiding the streaming bubble to allow Ably propagation
              setTimeout(() => {
                setIsStreaming(false);
                setToolStatus(null);
              }, 800);
            },
            onError: (err: any) => {
              console.error("Agent Stream error:", err);
              const errMsg =
                err.message === "rate-limit"
                  ? `Too many requests to ${agent === "kaya" ? "Kaya" : "Harry"}. Please wait for a minute to send again.`
                  : `Failed to connect to ${agent === "kaya" ? "Kaya" : "Harry"}.`;

              toast.error(errMsg);

              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId ? { ...m, text: errMsg } : m,
                ),
              );

              publishState({ isStreaming: false, toolStatus: null, text: "" });

              // Keep error message bubble visible for 5 seconds so the user can read it
              setTimeout(() => {
                setIsStreaming(false);
                setToolStatus(null);
              }, 5000);
            },
          },
        );
      } catch (err) {
        console.error("Fetch/Stream execution failed:", err);
        setIsStreaming(false);
        setToolStatus(null);
        publishState({ isStreaming: false, toolStatus: null, text: "" });
      }
    },
    [messages, projectId, agent],
  );

  return { messages, toolStatus, isStreaming, sendMessage, clearChat };
}
