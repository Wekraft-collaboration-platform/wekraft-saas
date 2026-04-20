"use client";

import { useEffect, useRef, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  MessagesSquare,
  Send,
  Settings2,
  ArrowDown,
  Square,
  Cross,
  X,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Spinner } from "@/components/ui/spinner";
import { ChatbotNode } from "@/modules/ai/ChatbotNode";
import {
  AgentState,
  InterruptValue,
  ResumeValue,
} from "@/modules/ai/AgentTypes";
import { useLangGraphAgent } from "@/modules/ai/langGraphAgent/useLangGraphAgent";
import { AppCheckpoint, GraphNode } from "@/modules/ai/langGraphAgent/types";
import { api } from "../../../convex/_generated/api";
import { useQuery } from "convex/react";

interface AiAssistantSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AiAssistantSheet({
  open,
  onOpenChange,
}: AiAssistantSheetProps) {
  const [threadId] = useState(() => crypto.randomUUID());
  const currentUser = useQuery(api.user.getCurrentUser);
  const userId = currentUser?._id;

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [inputValue, setInputValue] = useState("");
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const [restoreError, setRestoreError] = useState(false);
  const [thinkingTime, setThinkingTime] = useState(0);

  const { status, appCheckpoints, run, resume, restore, stop, restoring } =
    useLangGraphAgent<AgentState, InterruptValue, ResumeValue>();

  // Console threadId
  useEffect(() => {
    console.log(`🤖 [Kaya AI] Session: ${threadId}`);
  }, [threadId]);

  // Thinking timer logic
  useEffect(() => {
    let interval: any;
    if (status === "running" || restoring) {
      interval = setInterval(() => {
        setThinkingTime((t) => t + 1);
      }, 1000);
    } else {
      setThinkingTime(0);
    }
    return () => clearInterval(interval);
  }, [status, restoring]);

  // Keyboard shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, onOpenChange]);

  // Focus input when not running
  useEffect(() => {
    if (status !== "running" && !restoring) {
      inputRef.current?.focus();
    }
  }, [status, restoring]);

  // Auto-scroll
  useEffect(() => {
    if (shouldAutoScroll) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [appCheckpoints, shouldAutoScroll]);

  // Scroll button visibility
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handler = () => {
      const isAtBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 100;
      setShowScrollButton(!isAtBottom);
      setShouldAutoScroll(isAtBottom);
    };
    el.addEventListener("scroll", handler);
    return () => el.removeEventListener("scroll", handler);
  }, []);

  const sendMessage = (content: string) => {
    if (!content.trim() || status === "running" || restoring) return;
    setRestoreError(false);
    run({
      thread_id: threadId,
      state: {
        user_id: userId, // added user_id here...
        messages: [{ type: "user", content }],
      },
    });
    setInputValue("");
  };

  const renderNode = (
    checkpoint: AppCheckpoint<AgentState, InterruptValue>,
    node: GraphNode<AgentState>,
  ): React.ReactNode => {
    switch (node.name) {
      case "__start__":
      case "kaya":
        return <ChatbotNode nodeState={node.state} />;
      default:
        return null;
    }
  };

  const isDisabled = status === "running" || restoring;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-[500px] flex flex-col p-0 gap-0 h-full focus-visible:ring-0 focus:ring-0 outline-none"
      >
        {/* HEADER */}
        <SheetHeader className="px-4 py-5 border-b bg-card">
          <div className="flex items-center justify-between pr-10 gap-5">
            <div className="flex flex-col items-start">
              <SheetTitle className="flex items-center gap-2 text-lg font-pop font-semibold">
                Kaya AI
              </SheetTitle>
              {threadId && (
                <p className="text-[9px] text-muted-foreground font-mono tracking-tight truncate max-w-[160px]">
                  <span className="text-primary">Session:</span> {threadId}
                </p>
              )}
            </div>
            <div className="flex items-center gap-4">
              {/* If messages */}
              {appCheckpoints.length > 0 && (
                <Button
                  className="text-[11px] cursor-pointer"
                  size="sm"
                  variant={"outline"}
                >
                  new <MessageSquare className="h-3! w-3!" />
                </Button>
              )}
              {/* <Button size="icon-sm" variant="outline" className="text-[10px]">
                <Settings2 className="h-3! w-3!" />
              </Button> */}
              <Button size="sm" variant="default" className="text-[10px]">
                Visit space <MessagesSquare className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </SheetHeader>

        {/* MESSAGES */}
        <div ref={containerRef} className="flex-1 overflow-y-auto">
          {appCheckpoints.map((checkpoint, cpIndex) =>
            checkpoint.error ? (
              <div
                key={checkpoint.checkpointConfig.configurable.checkpoint_id}
                className="text-red-500 py-2 text-xs px-4"
              >
                [ERROR]
              </div>
            ) : (
              checkpoint.nodes.map((node, i) => {
                const prevCheckpoint =
                  cpIndex > 0 ? appCheckpoints[cpIndex - 1] : null;
                const userMessages =
                  checkpoint.state.messages?.filter((m) => {
                    const isUser = m.type === "human" || m.type === "user";
                    if (!isUser) return false;
                    if (!prevCheckpoint) return true;
                    return !prevCheckpoint.state.messages.some(
                      (pm) => pm.id === m.id,
                    );
                  }) || [];

                return (
                  <div
                    key={`${checkpoint.checkpointConfig.configurable.checkpoint_id}-${i}`}
                  >
                    {i === 0 &&
                      userMessages.map((m, idx) => (
                        <ChatbotNode
                          key={`user-${idx}`}
                          nodeState={{ messages: [m] }}
                        />
                      ))}
                    {renderNode(checkpoint, node)}
                  </div>
                );
              })
            ),
          )}

          {status === "running" && !restoring && (
            <div className="flex gap-2 items-center py-3 px-4 text-neutral-500">
              <Spinner className="w-3 h-3" />
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] uppercase tracking-tighter">
                  Kaya is thinking...
                </span>
                {thinkingTime > 0 && (
                  <span className="text-[8px] tabular-nums  text-neutral-400">
                    {thinkingTime}s
                  </span>
                )}
              </div>
            </div>
          )}

          {restoring && (
            <div className="flex gap-2 items-center py-3 px-4 text-neutral-500">
              <Spinner className="w-3 h-3" />
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] uppercase tracking-tighter">
                  Initializing Kaya...
                </span>
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="text-red-500 py-2 px-4 text-xs">
              [CONNECTION ERROR]
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* FOOTER */}
        <div className="px-4 py-6 bg-linear-to-b from-transparent to-blue-500/20">
          <div className="relative">
            <Input
              ref={inputRef}
              placeholder="Ask anything..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") sendMessage(inputValue);
              }}
              disabled={isDisabled}
              className="h-12 rounded-xl bg-sidebar pr-24"
            />
            {status === "running" ? (
              <Button
                size="icon"
                variant="destructive"
                className="absolute right-12 top-2 h-8 w-8"
                onClick={() => stop(threadId)}
              >
                <Square className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                size="icon"
                variant="outline"
                className="absolute right-12 top-2 h-8 w-8"
                onClick={() => sendMessage(inputValue)}
                disabled={!inputValue.trim() || restoring}
              >
                <Send className="h-4 w-4" />
              </Button>
            )}
            <Button
              size="icon-sm"
              variant="outline"
              className="text-[10px] absolute right-2 top-2 h-8 w-8"
            >
              <Settings2 className="h-3! w-3!" />
            </Button>
          </div>
          <p className="text-[10px] text-center text-muted-foreground mt-2">
            Kaya is personal PM agent.{" "}
            <span className="text-blue-500 cursor-pointer">
              Click to configure
            </span>
          </p>
        </div>
      </SheetContent>
      {showScrollButton && (
        <Button
          className="fixed bottom-24 right-8 rounded-none border border-neutral-800 bg-background"
          size="icon"
          onClick={() =>
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
          }
        >
          <ArrowDown className="w-4 h-4" />
        </Button>
      )}
    </Sheet>
  );
}
