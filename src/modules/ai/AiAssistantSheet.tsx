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
  Mic,
  Plus,
  Loader2,
  Check,
  FileText,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { ConnectorIcon, CONNECTOR_META } from "@/lib/mcp/connectors";

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
import {
  CalendarEventInterrupt,
  TaskCreationInterrupt,
} from "@/modules/ai/AgentTypes";
import { TaskApprovalCard } from "@/modules/ai/TaskApprovalCard";
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
import { useVoiceInput } from "@/modules/ai/useVoiceInput";
import { EmbeddedVoiceWaveform } from "@/modules/ai/VoiceInputBar";
import { cn } from "@/lib/utils";

interface AiAssistantSheetProps {}

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

export function AiAssistantSheet({}: AiAssistantSheetProps) {
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
  const mcpConnections = useQuery(
    api.mcp.getConnectionsByProject,
    projectId ? { projectId } : "skip",
  );
  const kayaConnectedApps = (mcpConnections || []).filter(
    (c) =>
      c.isConnected &&
      (c.agent === "kaya" || CONNECTOR_META[c.connectorId]?.agent === "kaya"),
  );

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showLiveTools, setShowLiveTools] = useState(true);

  const [inputValue, setInputValue] = useState("");
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const [restoreError, setRestoreError] = useState(false);
  const [thinkingTime, setThinkingTime] = useState(0);

  interface DocAttachment {
    fileId?: string;
    fileName: string;
    status: "parsing" | "ready" | "error";
    error?: string;
  }

  const [docAttachment, setDocAttachment] = useState<DocAttachment | null>(
    null,
  );
  const isDocParsing = docAttachment?.status === "parsing";

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_SIZE) {
      toast.error(
        `File size exceeds 10MB limit (${(file.size / (1024 * 1024)).toFixed(2)}MB).`,
      );
      return;
    }

    const allowedExts = [".pdf", ".docx", ".doc", ".txt", ".md"];
    const fileExt = "." + file.name.split(".").pop()?.toLowerCase();
    if (!allowedExts.includes(fileExt)) {
      toast.error(
        "Unsupported file format. Please upload PDF, DOCX, DOC, TXT, or MD.",
      );
      return;
    }

    if (!userId) {
      toast.error("User identification required to upload files.");
      return;
    }

    setDocAttachment({
      fileName: file.name,
      status: "parsing",
    });

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("user_id", userId);
      if (projectId) {
        formData.append("project_id", projectId);
      }

      const res = await fetch("/api/documents/parse", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to parse document.");
      }

      setDocAttachment({
        fileId: data.file_id,
        fileName: file.name,
        status: "ready",
      });
      toast.success(`${file.name} parsed successfully.`);
    } catch (err: any) {
      setDocAttachment({
        fileName: file.name,
        status: "error",
        error: err.message || "Failed to parse",
      });
      toast.error(err.message || "Failed to parse document.");
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const {
    isRecording: isVoiceRecording,
    isTranscribing: isVoiceTranscribing,
    formattedDuration: voiceDuration,
    toggleRecording: toggleVoiceRecording,
    cancelRecording: cancelVoiceRecording,
    stopRecording: stopVoiceRecording,
  } = useVoiceInput({
    onTranscript: (text) => {
      setInputValue((prev) => (prev ? `${prev} ${text}` : text));
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    },
  });

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
    reasoning,
    activeToolCalls,
    activeNode,
  } = useLangGraphAgent<AgentState, InterruptValue, ResumeValue>({
    onCheckpointStateUpdate: (checkpoint) => {
      const toolName = (checkpoint.state as any).analyst_tool_running;
      if (toolName && typeof toolName === "string") {
        const cp = checkpoint as any;
        if (!cp._toolCalls) cp._toolCalls = [];
        if (!cp._toolCalls.some((t: any) => t.toolName === toolName)) {
          cp._toolCalls.push({ toolName, caller: "Project analyst" });
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
    if (!content.trim() || status === "running" || restoring || isDocParsing)
      return;
    setRestoreError(false);

    const attachedFileId =
      docAttachment?.status === "ready" ? docAttachment.fileId : undefined;

    run({
      thread_id: threadId,
      user_id: userId,
      user_name: userName,
      state: {
        user_id: userId,
        user_name: userName,
        project_id: projectId,
        project_name: project?.projectName,
        messages: [{ type: "user", content }],
        file_id: attachedFileId,
      },
    } as any);

    setInputValue("");
    setDocAttachment(null);
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
      case "kaya_direct_node":
      case "kaya_synthesizer_node":
      case "db_write_node":
      case "sprint_node":
      case "analyst_node":
      case "mcp_node":
      case "tools":
      case "sprint_add_items":
      case "scheduler_setup": {
        const interrupt = checkpoint.interruptValue as
          | InterruptValue
          | undefined;

        // ── Task & Issue Creation HITL ──
        if (
          interrupt?.tool === "bulk_create_tasks" ||
          interrupt?.tool === "create_task" ||
          interrupt?.tool === "bulk_create_issues" ||
          interrupt?.tool === "create_issue"
        ) {
          const isCompleted =
            appCheckpoints.indexOf(checkpoint) < appCheckpoints.length - 1;
          return (
            <TaskApprovalCard
              interruptValue={interrupt as TaskCreationInterrupt}
              isCompleted={isCompleted}
              onResume={(value) => handleResume(value)}
            />
          );
        }

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

        // ── Normal chatbot message ──
        if (
          node.name === "kaya" ||
          node.name === "kaya_direct_node" ||
          node.name === "kaya_synthesizer_node"
        ) {
          const cp = checkpoint as any;
          const nodeMessages = (node.state as any)?.messages;
          const checkpointAiMessages = (
            checkpoint.state as any
          )?.messages?.filter((m: any) => m.type === "ai");
          const stateToUse =
            nodeMessages && nodeMessages.length > 0
              ? node.state
              : checkpointAiMessages && checkpointAiMessages.length > 0
                ? { messages: checkpointAiMessages }
                : node.state;
          const execTime =
            cp.executionTime ||
            (checkpoint.nodes[0]?.state as any)?.executionTime;

          return (
            <ChatbotNode nodeState={stateToUse} executionTime={execTime} />
          );
        }
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
        className="w-full sm:max-w-[580px] sm:w-[580px] flex flex-col p-0 gap-0 h-full focus-visible:ring-0 focus:ring-0 outline-none overflow-hidden"
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
                  className="text-[11px] shrink-0 cursor-pointer flex items-center gap-1.5"
                  onClick={() => {
                    setIsOpen(false);
                    useHarryStore.getState().setIsOpen(true);
                  }}
                >
                  <img src="/harry.svg" alt="Harry" width={18} height={18} />
                  Open Harry
                </Button>
              )}
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
                      Hello, I&apos;m Kaya <br />
                      <span className="font-medium text-sm text-neutral-200">
                        Start by asking
                      </span>
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
                      {reasoning
                        ? "Kaya is reasoning..."
                        : agentStatus || "Kaya is thinking..."}
                    </span>
                    {thinkingTime > 0 && (
                      <span className="text-[9px] tabular-nums text-muted-foreground">
                        {thinkingTime}s
                      </span>
                    )}
                  </div>
                </div>

                {reasoning && (
                  <div className="ml-7 mt-1 text-xs text-muted-foreground bg-neutral-900/80 border border-neutral-800 rounded-lg p-2.5 max-w-[420px] leading-relaxed animate-in fade-in duration-200">
                    <p className="text-[11px] text-neutral-300 leading-relaxed font-sans">
                      {reasoning.replace(/^Reasoning:\s*/i, "")}
                    </p>
                  </div>
                )}

                {activeToolCalls.length > 0 && (
                  <div className="flex flex-col gap-1 ml-3 my-1">
                    <button
                      type="button"
                      onClick={() => setShowLiveTools(!showLiveTools)}
                      className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground/75 hover:text-neutral-200 transition-colors cursor-pointer py-0.5 px-1 rounded select-none w-fit"
                    >
                      <ChevronRight
                        className={cn(
                          "w-3 h-3 transition-transform duration-200",
                          showLiveTools && "rotate-90",
                        )}
                      />
                      <span>
                        {activeToolCalls.length}{" "}
                        {activeToolCalls.length === 1
                          ? "tool called"
                          : "tools called"}
                      </span>
                    </button>
                    {showLiveTools && (
                      <div className="flex flex-col gap-0.5 animate-in fade-in duration-150">
                        {activeToolCalls.map((tc, idx) => (
                          <ToolCallCard
                            key={`live-${tc.toolName}-${idx}`}
                            toolName={tc.toolName}
                            caller={tc.caller}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {appCheckpoints.length === 0 && !reasoning && (
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
          {/* Phase 1: Uploaded document chip with loader and tick */}
          {docAttachment && (
            <div className="flex items-center gap-2 mb-2 px-3 py-1.5 rounded-md bg-neutral-800 text-neutral-200 text-xs w-fit max-w-full shadow-xs animate-in fade-in slide-in-from-bottom-2 duration-200">
              <Image
                src={
                  docAttachment.fileName.toLowerCase().endsWith(".pdf")
                    ? "/pdf.svg"
                    : docAttachment.fileName.toLowerCase().endsWith(".doc") ||
                        docAttachment.fileName.toLowerCase().endsWith(".docx")
                      ? "/doc.svg"
                      : "/file.svg"
                }
                alt="File format icon"
                width={16}
                height={16}
                className="w-4 h-4 object-contain shrink-0"
              />
              <span
                className="truncate max-w-[200px] font-medium"
                title={docAttachment.fileName}
              >
                {docAttachment.fileName}
              </span>

              {docAttachment.status === "parsing" && (
                <div className="flex items-center gap-1 text-neutral-400 shrink-0">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-neutral-300" />
                  <span className="text-xs">Parsing...</span>
                </div>
              )}

              {docAttachment.status === "ready" && (
                <span title="Parsed & saved" className="flex items-center">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                </span>
              )}

              {docAttachment.status === "error" && (
                <div
                  className="flex items-center gap-1 text-red-400 shrink-0"
                  title={docAttachment.error}
                >
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span className="text-xs">
                    {docAttachment.error || "Failed"}
                  </span>
                </div>
              )}

              <button
                type="button"
                onClick={() => setDocAttachment(null)}
                className="ml-1 p-0.5 text-neutral-400 hover:text-white rounded cursor-pointer"
                title="Remove attachment"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

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
              accept=".pdf,.doc,.docx,.txt,.md"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleFileUpload(file);
                }
              }}
            />
            {isVoiceRecording || isVoiceTranscribing ? (
              <EmbeddedVoiceWaveform
                isRecording={isVoiceRecording}
                isTranscribing={isVoiceTranscribing}
                formattedDuration={voiceDuration}
                onCancel={cancelVoiceRecording}
                onStop={stopVoiceRecording}
              />
            ) : (
              <>
                <div className="absolute left-2 top-1/2 -translate-y-1/2 z-10">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          disabled={isDisabled || isDocParsing}
                          className="h-8 w-8 text-white rounded-lg cursor-pointer"
                          onClick={() => {
                            if (
                              !!(
                                project &&
                                (project as any).ownerAccountType !== "pro"
                              )
                            ) {
                              useUpgradeModalStore.getState().openModal();
                            } else {
                              fileInputRef.current?.click();
                            }
                          }}
                        >
                          <Paperclip className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent
                        side="top"
                        className="bg-popover text-popover-foreground border border-border"
                      >
                        <p className="text-xs">
                          Upload PRD/SRS/Doc (PDF, DOCX, DOC, TXT, MD up to
                          10MB).
                        </p>
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
                    if (e.key === "Enter" && !isDocParsing)
                      sendMessage(inputValue);
                  }}
                  disabled={isDisabled || isDocParsing}
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
                      disabled={!inputValue.trim() || restoring || isDocParsing}
                    >
                      <Send className="h-3 w-3!" />
                    </Button>
                  )}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          disabled={isDisabled}
                          className="h-8 w-8 text-white rounded-lg cursor-pointer hover:bg-neutral-800"
                          onClick={() => {
                            if (
                              !!(
                                project &&
                                (project as any).ownerAccountType !== "pro"
                              )
                            ) {
                              useUpgradeModalStore.getState().openModal();
                            } else {
                              toggleVoiceRecording();
                            }
                          }}
                        >
                          <Mic className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent
                        side="top"
                        className="bg-popover text-popover-foreground border border-border"
                      >
                        <p className="text-xs">Voice input</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </>
            )}
          </div>

          <div className="flex items-center justify-center gap-2 mt-2">
            <span className="text-[11px] text-muted-foreground font-medium">
              MCP connections:
            </span>
            <div className="flex items-center gap-1.5">
              {kayaConnectedApps.slice(0, 4).map((app) => (
                <TooltipProvider key={app.connectorId} delayDuration={150}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        href={`/dashboard/my-projects/${slug}/workspace/integrations`}
                        className="cursor-pointer transition-transform hover:scale-110"
                      >
                        <ConnectorIcon
                          connectorId={app.connectorId}
                          size={22}
                        />
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs">
                      {CONNECTOR_META[app.connectorId]?.name || app.connectorId}{" "}
                      (Connected)
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
              <TooltipProvider delayDuration={150}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href={`/dashboard/my-projects/${slug}/workspace/integrations`}
                      className="flex items-center justify-center h-[22px] w-[22px] rounded-md border border-border/70 bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground transition-all hover:scale-105"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs">
                    Connect MCP Tools
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
