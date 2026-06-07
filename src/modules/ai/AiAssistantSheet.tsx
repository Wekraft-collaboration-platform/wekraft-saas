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
  Paperclip,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
import { useParams, useRouter, useSearchParams } from "next/navigation";
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

import { AnimatePresence, motion } from "framer-motion";

import { useKayaStore } from "@/store/useKayaStore";
import { useHarryStore } from "@/store/useHarryStore";
import { useUpgradeModalStore } from "@/store/useUpgradeModalStore";

interface AiAssistantSheetProps { }

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

export function AiAssistantSheet({ }: AiAssistantSheetProps) {
  const { isOpen, setIsOpen, threadId, createNewSession } = useKayaStore();
  const currentUser = useQuery(api.user.getCurrentUser);
  const userId = currentUser?._id;
  const userName = currentUser?.name || "User";

  const searchParams = useSearchParams();
  const isHarryActive = searchParams?.get("harry") === "true";
  const router = useRouter();

  // Mutually exclusive sheets
  useEffect(() => {
    if (isOpen) {
      useHarryStore.getState().setIsOpen(false);
    }
  }, [isOpen]);

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
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    reset,
    restoring,
    isStreaming,
    agentStatus,
    activeNode,
  } = useLangGraphAgent<AgentState, InterruptValue, ResumeValue>({
    onCheckpointStateUpdate: (checkpoint) => {
      // Backend emits { analyst_tool_running: "tool_name" } for each parallel tool.
      // We store these on the checkpoint object so they persist after the run finishes.
      const toolName = (checkpoint.state as any).analyst_tool_running;
      if (toolName && typeof toolName === "string") {
        const cp = checkpoint as any;
        if (!cp._analystTools) cp._analystTools = [];
        if (!cp._analystTools.includes(toolName)) {
          cp._analystTools.push(toolName);
        }
      }
    },
  });


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
        if (typeof window !== "undefined" && window.location.pathname.includes("/workspace/ai")) {
          return;
        }
        if (isHarryActive) return; // Let Harry's sheet handle it
        e.preventDefault();
        setIsOpen(!isOpen);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [isOpen, setIsOpen, isHarryActive]);

  // Focus input when not running
  useEffect(() => {
    if (status !== "running" && !restoring) {
      inputRef.current?.focus();
    }
  }, [status, restoring]);

  // Auto-scroll
  useEffect(() => {
    if (shouldAutoScroll && appCheckpoints.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [appCheckpoints, status, shouldAutoScroll]);

  // Scroll button visibility
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handler = () => {
      const isAtBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 100;
      const hasOverflow = el.scrollHeight > el.clientHeight;
      setShowScrollButton(
        !isAtBottom && hasOverflow && appCheckpoints.length > 0,
      );
      setShouldAutoScroll(isAtBottom);
    };
    el.addEventListener("scroll", handler);
    handler(); // Initial check
    return () => el.removeEventListener("scroll", handler);
  }, [appCheckpoints, status]);

  const sendMessage = (content: string) => {
    if (!!(project && (project as any).ownerAccountType !== "pro")) {
      useUpgradeModalStore.getState().openModal();
      return;
    }
    if (!content.trim() || status === "running" || restoring) return;
    setRestoreError(false);
    run({
      thread_id: threadId,
      user_id: userId,
      user_name: userName,
      model: selectedModel,
      state: {
        user_id: userId,
        user_name: userName,
        project_id: projectId,
        messages: [{ type: "user", content }],
      },
    });
    setInputValue("");
  };

  const handleSuggestionClick = (suggestion: string) => {
    if (!!(project && (project as any).ownerAccountType !== "pro")) {
      useUpgradeModalStore.getState().openModal();
    } else {
      setInputValue(suggestion);
      inputRef.current?.focus();
    }
  };

  // ── Resume handler ──
  const handleResume = (value: ResumeValue) => {
    resume({
      thread_id: threadId,
      user_id: userId,
      user_name: userName,
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

      // Analyst execution nodes — render tools stored on the checkpoint
      case "analyst_think":
      case "analyst_tools": {
        const cp = checkpoint as any;
        const tools = cp._analystTools || [];
        if (tools.length > 0) {
          // Only render for the first node of this type in the checkpoint to avoid duplication
          const isFirst =
            checkpoint.nodes.indexOf(node) ===
            checkpoint.nodes.findIndex((n) => n.name === node.name);
          if (isFirst) {
            return (
              <div className="space-y-1">
                {tools.map((name: string) => (
                  <ToolCallCard key={name} toolName={name} />
                ))}
              </div>
            );
          }
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
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent
        side="right"
        className="w-[500px] flex flex-col p-0 gap-0 h-full focus-visible:ring-0 focus:ring-0 outline-none overflow-hidden"
      >
        {/* HEADER */}
        <SheetHeader className="px-4 py-3 border-b bg-card">
          <div className="flex items-center justify-between pr-10 gap-5">
            <div className="flex flex-col items-start">
              <SheetTitle className="flex items-center gap-2 text-lg font-pop font-semibold mb-1">
                <img src="/kaya.svg" alt="Kaya AI" width={24} height={24} />
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
              {appCheckpoints.length > 0 ? (
                <Button
                  className="text-[11px] cursor-pointer"
                  size="sm"
                  variant={"outline"}
                  onClick={() => {
                    createNewSession();
                    reset();
                  }}
                >
                  new <MessageSquare className="h-3! w-3!" />
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  className="text-[11px]  shrink-0 cursor-pointer"
                  onClick={() => {
                    setIsOpen(false);
                    useHarryStore.getState().setIsOpen(true);
                    if (typeof window !== "undefined" && window.location.pathname.includes("/workspace/ai")) {
                      router.replace(`/dashboard/my-projects/${slug}/workspace/ai?harry=true`);
                    }
                  }}
                >
                  <img src="/harry.svg" alt="Harry" width={24} height={24} />
                  Open Harry
                </Button>
              )}
              <Button size="sm" variant="default" className="text-[10px]">
                Visit space <MessagesSquare className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </SheetHeader>

        {/* MESSAGES */}
        <div className="flex-1 overflow-hidden relative flex flex-col">
          <div ref={containerRef} className="flex-1 overflow-y-auto py-4 px-2">
            <AnimatePresence>
              {appCheckpoints.length === 0 &&
                !restoring &&
                status === "idle" && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{
                      opacity: 0,
                      scale: 0.95,
                      transition: { duration: 0.3 },
                    }}
                    className="h-full flex flex-col items-center justify-center p-8 text-center"
                  >
                    <div className="relative mb-6">
                      <img
                        src="/kaya.svg"
                        alt="Kaya AI"
                        width={60}
                        height={60}
                        className="relative drop-shadow-2xl"
                      />
                    </div>
                    <h3 className="text-lg font-pop font-semibold text-primary tracking-tight">
                      Hello, I&apos;m Kaya <br /><span className="font-medium text-sm text-neutral-200">Start by asking</span>
                    </h3>
                    <div className="flex flex-col gap-2 w-full max-w-[320px] mt-4">
                      {[
                        "What's happening in my project",
                        "Automate bulk creation of tasks/issues",
                        "Get mine todays standup and work",
                      ].map((suggestion) => (
                        <button
                          key={suggestion}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="w-full text-center px-4 py-2.5 rounded-xl border border-border bg-muted hover:bg-muted/80 transition-colors cursor-pointer text-xs font-medium text-foreground/80 hover:text-foreground shadow-xs"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
            </AnimatePresence>

            {appCheckpoints.map((checkpoint, cpIndex) =>
              checkpoint.error ? (
                <div
                  key={checkpoint.checkpointConfig.configurable.checkpoint_id}
                  className="text-red-500 py-2 text-xs px-4"
                >
                  {checkpoint.error && checkpoint.errorMessage && (
                    <script dangerouslySetInnerHTML={{ __html: `console.error("🤖 [Kaya AI Error]:", ${JSON.stringify(checkpoint.errorMessage)})` }} />
                  )}
                  Mistake made by LLM. Try again.
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
              <div className="flex flex-col gap-1 py-3 px-4">
                <div className="flex gap-2 items-center text-neutral-300">
                  <KayaLoader />
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] uppercase tracking-normal">
                      {appCheckpoints.length === 0
                        ? "Kaya is spinning up, hang tight..."
                        : agentStatus || "Kaya is thinking..."}
                    </span>
                    {thinkingTime > 0 && (
                      <span className="text-[9px] tabular-nums text-neutral-200">
                        {thinkingTime}s
                      </span>
                    )}
                  </div>
                </div>
                {appCheckpoints.length === 0 && (
                  <div className="text-[10px] text-muted-foreground animate-pulse pl-10 tracking-tighter">
                    Initial response might take a few seconds to warm up...
                  </div>
                )}
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
                Error Occurred due to network connectivity retry after some
                time.
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {showScrollButton && (
            <Button
              className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full border border-border bg-muted/70 hover:bg-background shadow-lg z-50 animate-in fade-in slide-in-from-bottom-4 duration-300"
              size="icon"
              onClick={() => {
                messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
                setShouldAutoScroll(true);
              }}
            >
              <ArrowDown className="w-3.5 h-3.5! text-primary" />
            </Button>
          )}
        </div>

        {/* FOOTER */}
        <div className="px-4 py-6 bg-linear-to-b from-transparent via-indigo-200/10 to-purple-400/30">
          <div className="relative">
            {!!(project && (project as any).ownerAccountType !== "pro") && (
              <div
                className="absolute inset-0 z-30 cursor-pointer"
                onClick={() => useUpgradeModalStore.getState().openModal()}
              />
            )}
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".pdf,.doc,.docx"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  // TODO: handle file upload
                }
              }}
            />
            <div className="absolute left-2 top-1/2 -translate-y-1/2 z-10">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      disabled={isDisabled}
                      className="h-8 w-8 text-white rounded-lg cursor-pointer"
                      onClick={() => {
                        if (!!(project && (project as any).ownerAccountType !== "pro")) {
                          useUpgradeModalStore.getState().openModal();
                        } else {
                          fileInputRef.current?.click();
                        }
                      }}
                    >
                      <Paperclip className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="bg-popover text-popover-foreground border border-border">
                    <p className="text-xs">you can upload PRD/SRS etc pdf/doc upto 5mb limit.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Input
              ref={inputRef}
              placeholder="Ask anything..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") sendMessage(inputValue);
              }}
              disabled={isDisabled}
              className="h-12 rounded-xl bg-sidebar pr-36 pl-11"
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
                    onClick={(e) => {
                      if (!!(project && (project as any).ownerAccountType !== "pro")) {
                        e.preventDefault();
                        e.stopPropagation();
                        useUpgradeModalStore.getState().openModal();
                      }
                    }}
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
        </div>
      </SheetContent>
    </Sheet>
  );
}
