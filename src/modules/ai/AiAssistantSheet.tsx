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
  Sparkles,
  Clover,
  LayersPlus,
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
import { useParams } from "next/navigation";
import { CalendarApprovalCard } from "@/modules/ai/CalendarApprovalCard";
import { CalendarEventInterrupt } from "@/modules/ai/AgentTypes";
import { ToolCallCard } from "@/modules/ai/ToolCard";
import { SprintItemSelectionCard } from "@/modules/ai/SprintItemSelectionCard";
import Image from "next/image";
import { SchedulerSetupCard } from "./SchedulerSetupCard";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AiAssistantSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const KayaLoader = () => (
  <svg
    viewBox="0 0 100 100"
    width="34"
    height="34"
    xmlns="http://www.w3.org/2000/svg"
    className="shrink-0"
  >
    <defs>
      <linearGradient id="orb-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#9B8FF5" />
        <stop offset="50%" stopColor="#C084F5" />
        <stop offset="100%" stopColor="#F472B6" />
      </linearGradient>
    </defs>

    <style>{`
    @keyframes spin {
      from { transform: rotate(0deg); }
      to   { transform: rotate(360deg); }
    }
    @keyframes morph {
      0%, 100% { rx: 26px; ry: 26px; }
      50%      { rx: 4px;  ry: 4px;  }
    }
    .spin-group {
      animation: spin 2.4s linear infinite;
      transform-origin: center;
    }
    .morph-rect { animation: morph 2.4s ease-in-out infinite; }
  `}</style>

    <g className="spin-group">
      <rect
        className="morph-rect"
        fill="url(#orb-grad)"
        x="24"
        y="24"
        width="52"
        height="52"
        rx="26"
        ry="26"
      />
    </g>
  </svg>
);

export function AiAssistantSheet({
  open,
  onOpenChange,
}: AiAssistantSheetProps) {
  const [threadId] = useState(() => crypto.randomUUID());
  const currentUser = useQuery(api.user.getCurrentUser);
  const userId = currentUser?._id;

  const params = useParams();
  const slug = params?.slug as string;
  const project = useQuery(
    api.project.getProjectBySlug,
    slug ? { slug } : "skip",
  );
  const projectId = project?._id;

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [inputValue, setInputValue] = useState("");
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const [restoreError, setRestoreError] = useState(false);
  const [thinkingTime, setThinkingTime] = useState(0);
  const [selectedModel, setSelectedModel] = useState<"fast" | "deep">("fast");

  const {
    status,
    appCheckpoints,
    run,
    resume,
    restore,
    stop,
    restoring,
    isStreaming,
  } = useLangGraphAgent<AgentState, InterruptValue, ResumeValue>();

  // Console threadId
  useEffect(() => {
    console.log(`🤖 [Kaya AI] Session: ${threadId}`);
  }, [threadId]);

  // Thinking timer logic
  useEffect(() => {
    let interval: any;
    if (status === "running" || restoring) {
      if (!isStreaming) {
        interval = setInterval(() => {
          setThinkingTime((t) => t + 1);
        }, 1000);
      }
    } else {
      setThinkingTime(0);
    }
    return () => clearInterval(interval);
  }, [status, restoring, isStreaming]);

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
      model: selectedModel,
      state: {
        user_id: userId, // added user_id here...
        project_id: projectId, // added project_id here...
        messages: [{ type: "user", content }],
      },
    });
    setInputValue("");
  };

  // ── Resume handler ──
  const handleResume = (value: ResumeValue) => {
    resume({
      thread_id: threadId,
      user_id: userId,
      project_id: projectId,
      model: selectedModel,
      resume: value,
    });
  };

  // ── Node renderer ──
  const renderNode = (
    checkpoint: AppCheckpoint<AgentState, InterruptValue>,
    node: GraphNode<AgentState>,
  ): React.ReactNode => {
    switch (node.name) {
      case "__start__":
      case "kaya":
      case "tools":
      case "sprint_add_items":
      case "scheduler_setup": {
        const interrupt = checkpoint.interruptValue as
          | InterruptValue
          | undefined;

        // ── Calendar HITL ──
        if (interrupt?.tool === "create_calendar_event") {
          const isCompleted =
            appCheckpoints.indexOf(checkpoint) < appCheckpoints.length - 1;
          return (
            <CalendarApprovalCard
              interruptValue={interrupt as CalendarEventInterrupt}
              isCompleted={isCompleted}
              onResume={handleResume}
            />
          );
        }

        // ── Sprint item selection HITL ──
        if (interrupt?.tool === "add_items_to_sprint") {
          const isCompleted =
            appCheckpoints.indexOf(checkpoint) < appCheckpoints.length - 1;
          return (
            <SprintItemSelectionCard
              projectId={projectId as any}
              sprintId={interrupt.sprint_id}
              isCompleted={isCompleted}
              onResume={(value) => handleResume(value)}
            />
          );
        }

        // ── Scheduler setup HITL ──
        if (interrupt?.tool === "setup_report_scheduler") {
          const isCompleted =
            appCheckpoints.indexOf(checkpoint) < appCheckpoints.length - 1;
          return (
            <SchedulerSetupCard
              projectId={projectId as any}
              isCompleted={isCompleted}
              initialData={interrupt.existing_data as any}
              onResume={(value) => handleResume(value)}
            />
          );
        }

        // ── Kaya tool call in-flight ──
        const lastMsg = node.state.messages?.at(-1);
        if (lastMsg?.tool_calls?.length && node.name === "kaya") {
          return (
            <div className="space-y-1">
              {lastMsg.tool_calls.map((tc: any) => (
                <ToolCallCard key={tc.id} toolName={tc.name} />
              ))}
            </div>
          );
        }

        // ── Normal chatbot message ──
        if (node.name === "kaya") return <ChatbotNode nodeState={node.state} />;
        return null;
      }

      // ── Analyst entry — nothing to render ────────────────────────────────
      case "project_analyst": {
        return null;
      }

      // ── Analyst think — show tool calls in flight ─────────────────────────
      case "analyst_think": {
        const lastMsg = node.state.messages?.at(-1);
        if (lastMsg?.tool_calls?.length) {
          return (
            <div className="space-y-1">
              {lastMsg.tool_calls.map((tc: any) => (
                <ToolCallCard key={tc.id} toolName={tc.name} />
              ))}
            </div>
          );
        }
        return null;
      }

      // ── Sprint write node — show tool call card while running ─────────────
      case "sprint_create": {
        const lastMsg = node.state.messages?.at(-1);
        if (lastMsg?.tool_calls?.length) {
          return (
            <div className="space-y-1">
              {lastMsg.tool_calls.map((tc: any) => (
                <ToolCallCard key={tc.id} toolName={tc.name} />
              ))}
            </div>
          );
        }
        return null;
      }

      // case "analyst_tools":
      // case "analyst_done": {
      //   return null;
      // }
      // ── Internal plumbing — nothing to render ─────────────────────────────
      case "analyst_tools":
      case "analyst_done":
      case "kaya_read_tools":
      case "scheduler_setup": {
        return null;
      }

      default:
        return null;
    }
  };

  const isDisabled = status === "running" || restoring;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-[500px] flex flex-col p-0 gap-0 h-full focus-visible:ring-0 focus:ring-0 outline-none overflow-hidden"
      >
        {/* HEADER */}
        <SheetHeader className="px-4 py-3 border-b bg-card">
          <div className="flex items-center justify-between pr-10 gap-5">
            <div className="flex flex-col items-start">
              <SheetTitle className="flex items-center gap-2 text-lg font-pop font-semibold mb-1">
                <Image src="/kaya.svg" alt="Kaya AI" width={24} height={24} />
                <span className="text-xl font-semibold tracking-tight text-primary font-pop">
                  Kaya
                </span>
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
              <Button size="sm" variant="default" className="text-[10px]">
                Visit space <MessagesSquare className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </SheetHeader>

        {/* MESSAGES */}
        <div ref={containerRef} className="flex-1 overflow-y-auto py-4 px-2">
          {appCheckpoints.length === 0 && !restoring && (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in duration-500">
              <div className="relative mb-6">
                <Image
                  src="/kaya.svg"
                  alt="Kaya AI"
                  width={60}
                  height={60}
                  className="relative drop-shadow-2xl"
                />
              </div>
              <h3 className="text-lg font-pop font-semibold text-primary mb-1 tracking-tight">
                Hello, I&apos;m Kaya
              </h3>
              <p className="text-sm text-muted-foreground max-w-[240px] leading-relaxed">
                Start with asking ,{" "}
                <span className="font-pop text-primary">
                  &quot;What's happening in my project&quot;
                </span>
              </p>
            </div>
          )}

          {appCheckpoints.map((checkpoint, cpIndex) =>
            checkpoint.error ? (
              <div
                key={checkpoint.checkpointConfig.configurable.checkpoint_id}
                className="text-red-500 py-2 text-xs px-4"
              >
                Error occured by Agent. LLm sometimes give malformed response.
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

          {status === "running" && !restoring && !isStreaming && (
            <div className="flex gap-2 items-center py-3 px-4 text-neutral-500">
              <KayaLoader />
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] uppercase tracking-wide">
                  Kaya is thinking...
                </span>
                {thinkingTime > 0 && (
                  <span className="text-[9px] tabular-nums  text-neutral-400">
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
        <div className="px-4 py-6 bg-linear-to-b from-transparent via-indigo-200/10 to-purple-400/30">
          {currentUser && currentUser.accountType !== "pro" ? (
            <div className="flex flex-col items-center justify-center p-4 bg-card backdrop-blur-md rounded-xl border border-primary/20 shadow-lg">
              <div className="flex items-center gap-2 mb-2">
                <Clover className="w-5 h-5 text-primary" />
                <h4 className="text-sm font-semibold text-primary">
                  Pro Feature
                </h4>
              </div>
              <p className="text-[11px] text-muted-foreground text-center mb-3 px-6">
                Kaya is available for Pro users. Get advanced project analysis,
                automated reporting, and more.
              </p>
              <Button size="sm" className="w-full text-sm">
                Upgrade to Pro <LayersPlus />
              </Button>
            </div>
          ) : (
            <>
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
                  className="h-12 rounded-xl bg-sidebar pr-36"
                />
                <div className="flex items-center gap-2 absolute right-2 top-2">
                  {status === "running" ? (
                    <Button
                      size="icon"
                      variant="destructive"
                      className=" h-8 w-8"
                      onClick={() => stop(threadId)}
                    >
                      <Square className="h-3 w-3!" />
                    </Button>
                  ) : (
                    <Button
                      size="icon"
                      variant="outline"
                      className=" h-8 w-8"
                      onClick={() => sendMessage(inputValue)}
                      disabled={!inputValue.trim() || restoring}
                    >
                      <Send className="h-3 w-3!" />
                    </Button>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        className=" h-8 px-2 flex items-center gap-1.5 text-[10px] capitalize font-medium"
                      >
                        {selectedModel}
                        <Settings2 className="h-3 w-3!" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <div className="text-xs p-2 items-center border-b border-accent">
                        Select Model
                      </div>
                      <DropdownMenuItem
                        onClick={() => setSelectedModel("fast")}
                        className="text-[10px]"
                      >
                        Kaya Fast
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setSelectedModel("deep")}
                        className="text-[10px]"
                      >
                        Kaya Deep
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <p className="text-[10px] text-center text-muted-foreground mt-2">
                Kaya is personal PM agent.{" "}
                <span className="text-blue-500 cursor-pointer">
                  Click to configure
                </span>
              </p>
            </>
          )}
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
