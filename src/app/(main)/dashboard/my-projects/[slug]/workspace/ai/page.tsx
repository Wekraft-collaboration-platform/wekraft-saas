"use client";
import { useQuery } from "convex/react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowDown,
  ArrowRight,
  Bell,
  Brain,
  CalendarCheck,
  CalendarSync,
  ChartPie,
  FastForward,
  Globe,
  History,
  Plus,
  Search,
  Settings2,
  Sparkles,
  X,
  Clover,
  Paperclip,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Image from "next/image";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useKayaStore } from "@/store/useKayaStore";
import { useHarryStore } from "@/store/useHarryStore";
import type {
  AgentState,
  CalendarEventInterrupt,
  InterruptValue,
  ResumeValue,
} from "@/modules/ai/AgentTypes";
import { CalendarApprovalCard } from "@/modules/ai/CalendarApprovalCard";
import { ChatbotNode } from "@/modules/ai/ChatbotNode";
import type {
  AppCheckpoint,
  GraphNode,
} from "@/modules/ai/langGraphAgent/types";
import { useLangGraphAgent } from "@/modules/ai/langGraphAgent/useLangGraphAgent";
import { SchedulerSetupCard } from "@/modules/ai/SchedulerSetupCard";
import { SprintItemSelectionCard } from "@/modules/ai/SprintItemSelectionCard";
import { ToolCallCard } from "@/modules/ai/ToolCard";
import { api } from "../../../../../../../../convex/_generated/api";
import { QuickTemplates } from "@/modules/ai/QuickTemplates";

const KayaLoader = () => (
  <svg
    viewBox="0 0 100 100"
    width="28"
    height="28"
    xmlns="http://www.w3.org/2000/svg"
    className="shrink-0"
  >
    <defs>
      <linearGradient id="orb-grad-space" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#9B8FF5" />
        <stop offset="50%" stopColor="#C084F5" />
        <stop offset="100%" stopColor="#F472B6" />
      </linearGradient>
    </defs>
    <style>{`
      @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      @keyframes morph { 0%, 100% { rx: 26px; ry: 26px; } 50% { rx: 4px; ry: 4px; } }
      .spin-group { animation: spin 2.4s linear infinite; transform-origin: center; }
      .morph-rect { animation: morph 2.4s ease-in-out infinite; }
    `}</style>
    <g className="spin-group">
      <rect
        className="morph-rect"
        fill="url(#orb-grad-space)"
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

const AIWorkspace = () => {
  const [threadId] = useState(() => crypto.randomUUID());
  const params = useParams();
  const slug = params?.slug as string;

  const currentUser = useQuery(api.user.getCurrentUser);
  const userId = currentUser?._id;

  const searchParams = useSearchParams();
  const isHarry = searchParams?.get("harry") === "true";
  const router = useRouter();
  const project = useQuery(
    api.project.getProjectBySlug,
    slug ? { slug } : "skip",
  );
  const projectId = project?._id;

  const [message, setMessage] = useState("");
  const [thinkingTime, setThinkingTime] = useState(0);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const isPro = project && (project as any).ownerAccountType === "pro";

  // Close both sheets when landing on workspace AI page
  useEffect(() => {
    useKayaStore.getState().setIsOpen(false);
    useHarryStore.getState().setIsOpen(false);
  }, []);

  useEffect(() => {
    if (appCheckpoints.length > 0 && shouldAutoScroll) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [appCheckpoints, status, shouldAutoScroll]);

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
  }, [appCheckpoints]);

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

  const handleSendMessage = (content: string) => {
    if (!content.trim() || status === "running" || restoring) return;
    run({
      thread_id: threadId,
      state: {
        user_id: userId,
        project_id: projectId,
        messages: [{ type: "user", content }],
      },
    });
    setMessage("");
  };

  const handleResume = (value: ResumeValue) => {
    resume({
      thread_id: threadId,
      user_id: userId,
      project_id: projectId,
      resume: value,
    });
  };

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

        if (interrupt?.tool === "add_items_to_sprint") {
          const isCompleted =
            appCheckpoints.indexOf(checkpoint) < appCheckpoints.length - 1;
          return (
            <SprintItemSelectionCard
              projectId={projectId as any}
              sprintId={interrupt.sprint_id}
              isCompleted={isCompleted}
              onResume={handleResume}
            />
          );
        }

        if (interrupt?.tool === "setup_report_scheduler") {
          const isCompleted =
            appCheckpoints.indexOf(checkpoint) < appCheckpoints.length - 1;
          return (
            <SchedulerSetupCard
              projectId={projectId as any}
              isCompleted={isCompleted}
              initialData={interrupt.existing_data as any}
              onResume={handleResume}
            />
          );
        }

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

        if (node.name === "kaya") return <ChatbotNode nodeState={node.state} />;
        return null;
      }
      case "analyst_think":
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
      default:
        return null;
    }
  };

  const hasMessages = appCheckpoints.length > 0;

  return (
    <div className="h-[calc(100vh-80px)] w-full bg-background relative overflow-hidden flex flex-col">
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept=".pdf,.doc,.docx"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            console.log("Selected file for upload:", file);
          }
        }}
      />
      {/* Top Config Setting */}
      <div className="absolute top-4 right-4 flex items-center gap-4 z-20">
        <Button variant="outline" size="icon-sm" className="cursor-pointer">
          <Settings2 className="w-4 h-4!" />
        </Button>
        <Button variant="outline" size="icon-sm" className="cursor-pointer">
          <History className="w-4 h-4!" />
        </Button>
      </div>

      <div className="flex-1 flex flex-col items-center relative overflow-y-auto pt-10 pb-32 px-6">
        <div className="w-full max-w-[800px]">
          <AnimatePresence mode="wait">
            {!hasMessages ? (
              <motion.div
                key="empty-state"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center pt-10 gap-8"
              >
                <div className="flex items-center gap-3 h-[50px]">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={isHarry ? "harry-logo" : "kaya-logo"}
                      initial={{ opacity: 0, scale: 0.8, rotate: -15 }}
                      animate={{ opacity: 1, scale: 1, rotate: 0 }}
                      exit={{ opacity: 0, scale: 0.8, rotate: 15 }}
                      transition={{ duration: 0.2 }}
                      className="relative w-[50px] h-[50px]"
                    >
                      <img
                        src={isHarry ? "/harry.svg" : "/kaya.svg"}
                        alt={isHarry ? "Harry AI" : "Kaya AI"}
                        width={50}
                        height={50}
                        className="object-contain"
                      />
                    </motion.div>
                  </AnimatePresence>
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={isHarry ? "harry-text" : "kaya-text"}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2 }}
                      className={cn(
                        "text-3xl font-semibold tracking-tight font-pop"
                      )}
                    >
                      {isHarry ? "Harry" : "Kaya"}
                    </motion.span>
                  </AnimatePresence>
                </div>

                <div className="w-full max-w-2xl flex flex-col relative group">
                  <div className="flex ml-3 gap-1">
                    <button
                      onClick={() => router.replace(`/dashboard/my-projects/${slug}/workspace/ai?kaya=true`)}
                      className={cn(
                        "flex items-center gap-2 px-5 pt-2 pb-1.5 cursor-pointer rounded-t-2xl text-sm font-medium tracking-tight transition-all duration-300 relative",
                        !isHarry
                          ? "text-black"
                          : "text-muted-foreground hover:text-foreground bg-muted"
                      )}
                      style={!isHarry ? { background: "linear-gradient(135deg, #f9a8d4 0%, #93c5fd 40%, #c4b5fd 70%, #fda4af 100%)" } : undefined}
                    >
                      <img src="/kaya.svg" alt="" width={20} height={20} className="shrink-0" />
                      <span>Ask Kaya</span>
                    </button>

                    <button
                      onClick={() => router.replace(`/dashboard/my-projects/${slug}/workspace/ai?harry=true`)}
                      className={cn(
                        "flex items-center gap-2 px-5 pt-2 pb-1.5 cursor-pointer rounded-t-2xl text-sm font-medium tracking-tight transition-all duration-300 relative",
                        isHarry
                          ? "text-white"
                          : "text-muted-foreground hover:text-foreground bg-muted"
                      )}
                      style={isHarry ? { background: "linear-gradient(135deg, #fcd34d 0%, #f97316 50%, #ef4444 100%)" } : undefined}
                    >
                      <img src="/harry.svg" alt="" width={20} height={20} className="shrink-0" />
                      <span>Ask Harry</span>
                    </button>
                  </div>

                  <div
                    className={cn(
                      "rounded-2xl p-0.5 shadow-2xl transition-all duration-500",
                      isHarry
                        ? "group-hover:shadow-orange-500/10"
                        : "group-hover:shadow-indigo-500/10"
                    )}
                    style={{
                      background: isHarry
                        ? "linear-gradient(135deg, #fcd34d 0%, #f97316 50%, #ef4444 100%)"
                        : "linear-gradient(135deg, #f9a8d4 0%, #93c5fd 40%, #c4b5fd 70%, #fda4af 100%)",
                    }}
                  >
                    <div className="rounded-2xl bg-background flex flex-col relative overflow-hidden">
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage(message);
                          }
                        }}
                        disabled={!isPro}
                        placeholder={
                          !isPro
                            ? (isHarry ? "Harry is available for Pro projects. Upgrade to Pro to unlock." : "Kaya is available for Pro projects. Upgrade to Pro to unlock.")
                            : (isHarry ? "Ask Harry to review code, suggest architecture or write PR summaries..." : "Get instant answers, insights, and ideas.")
                        }
                        className="resize-none border-none outline-none focus:ring-0 min-h-[130px] text-primary/90 placeholder:text-muted-foreground text-[16px] px-5 pt-5 pb-2 bg-input/30 rounded-2xl w-full"
                      />

                      <div className="flex items-center justify-between px-4 py-3 border-t border-border/10">
                        <div className="flex items-center gap-2">
                          <Select defaultValue="auto">
                            <SelectTrigger disabled={!isPro} className="h-7! px-3 rounded-full border border-border bg-accent text-xs text-primary font-medium shadow-none focus:ring-0 gap-1.5 min-w-[110px]">
                              <Brain size={15} className="text-white" />
                              <SelectValue placeholder="Auto" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="auto">Auto</SelectItem>
                              {isHarry ? (
                                <>
                                  <SelectItem value="harry-fast">
                                    Harry Fast
                                  </SelectItem>
                                  <SelectItem value="harry-pro">Harry Pro</SelectItem>
                                </>
                              ) : (
                                <>
                                  <SelectItem value="kaya-fast">
                                    Kaya Fast
                                  </SelectItem>
                                  <SelectItem value="kaya-pro">Kaya Pro</SelectItem>
                                </>
                              )}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="flex items-center gap-2">
                          {!isHarry && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="inline-block">
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="icon"
                                      disabled={!isPro}
                                      className="h-8 w-8 text-white rounded-full cursor-pointer shrink-0"
                                      onClick={() => fileInputRef.current?.click()}
                                    >
                                      <Paperclip className="h-4 w-4" />
                                    </Button>
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="bg-popover text-popover-foreground border border-border">
                                  <p className="text-xs">you can upload PRD/SRS etc pdf/doc upto 5mb limit.</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                          {!isPro ? (
                            <Link href="/web/pricing">
                              <Button
                                size="sm"
                                className={cn(
                                  "h-8 px-4 rounded-full font-semibold text-xs text-white transition-all cursor-pointer flex items-center gap-1 shrink-0",
                                  isHarry
                                    ? "bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
                                    : "bg-gradient-to-r from-pink-500 to-violet-600 hover:from-pink-600 hover:to-violet-700"
                                )}
                              >
                                Upgrade to Pro <Clover className="w-3.5 h-3.5" />
                              </Button>
                            </Link>
                          ) : (
                            <button
                              onClick={() => handleSendMessage(message)}
                              disabled={!message.trim() || status === "running"}
                              className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center transition-all",
                                message.trim()
                                  ? isHarry
                                    ? "bg-linear-to-br from-[#f59e0b] to-[#ea580c] text-white"
                                    : "bg-linear-to-br from-[#f472b6] to-[#818cf8] text-white"
                                  : "bg-muted text-muted-foreground",
                              )}
                            >
                              <ArrowRight size={15} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <QuickTemplates
                  isHarry={isHarry}
                  onSelectPrompt={handleSendMessage}
                  onToggleAgent={(targetIsHarry) => {
                    if (targetIsHarry) {
                      router.replace(`/dashboard/my-projects/${slug}/workspace/ai?harry=true`);
                    } else {
                      router.replace(`/dashboard/my-projects/${slug}/workspace/ai?kaya=true`);
                    }
                  }}
                />
              </motion.div>
            ) : (
              <motion.div
                key="chat-history"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                ref={containerRef}
                className="space-y-4 pt-4 max-h-[540px] overflow-y-auto scrollbar-hide"
              >
                {appCheckpoints.map((checkpoint, cpIndex) =>
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
                  }),
                )}
                {status === "running" && !isStreaming && (
                  <div className="flex gap-2 items-center py-2 px-6 text-neutral-500">
                    <KayaLoader />
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] uppercase tracking-wide">
                        Kaya is thinking...
                      </span>
                      {thinkingTime > 0 && (
                        <span className="text-[9px] tabular-nums text-neutral-400">
                          {thinkingTime}s
                        </span>
                      )}
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} className="h-10" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Sticky Bottom Input Bar (Chat Mode Only) */}
      <AnimatePresence>
        {hasMessages && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-6 inset-x-0 flex justify-center px-6 z-30"
          >
            <div className="w-full max-w-2xl bg-sidebar backdrop-blur-md border border-border rounded-full p-1.5 flex items-center gap-2 shadow-2xl">
              <div className="pl-4">
                <Brain size={18} className="text-primary/50" />
              </div>
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSendMessage(message);
                }}
                disabled={!isPro}
                placeholder={!isPro ? "Upgrade to Pro to send follow up messages..." : "Ask follow up..."}
                className="flex-1 bg-transparent border-none outline-none text-[14px] text-primary placeholder:text-muted-foreground py-2"
              />
              {!isHarry && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="inline-block">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          disabled={!isPro}
                          className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-full cursor-pointer shrink-0"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <Paperclip className="h-4 w-4" />
                        </Button>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="bg-popover text-popover-foreground border border-border">
                      <p className="text-xs">you can upload PRD/SRS etc pdf/doc upto 5mb limit.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              {!isPro ? (
                <Link href="/web/pricing">
                  <Button
                    size="sm"
                    className="h-8 px-4 rounded-full font-semibold text-xs text-white bg-primary cursor-pointer shrink-0 flex items-center gap-1"
                  >
                    Upgrade to Pro <Clover className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              ) : (
                <button
                  onClick={() => handleSendMessage(message)}
                  disabled={!message.trim() || status === "running"}
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center transition-all",
                    message.trim()
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {status === "running" ? (
                    <Spinner className="w-4 h-4 text-primary-foreground" />
                  ) : (
                    <ArrowRight size={16} />
                  )}
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {showScrollButton && (
        <Button
          className="fixed bottom-24 left-[60%] rounded-full border border-border bg-muted/70 hover:bg-background shadow-lg z-50 animate-in fade-in slide-in-from-bottom-4 duration-300"
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
  );
};

export default AIWorkspace;
