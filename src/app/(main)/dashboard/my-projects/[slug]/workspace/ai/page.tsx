"use client";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";
import {
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
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useQuery } from "convex/react";

import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useLangGraphAgent } from "@/modules/ai/langGraphAgent/useLangGraphAgent";
import {
  AgentState,
  InterruptValue,
  ResumeValue,
  CalendarEventInterrupt,
} from "@/modules/ai/AgentTypes";
import { AppCheckpoint, GraphNode } from "@/modules/ai/langGraphAgent/types";
import { ChatbotNode } from "@/modules/ai/ChatbotNode";
import { ToolCallCard } from "@/modules/ai/ToolCard";
import { CalendarApprovalCard } from "@/modules/ai/CalendarApprovalCard";
import { SprintItemSelectionCard } from "@/modules/ai/SprintItemSelectionCard";
import { SchedulerSetupCard } from "@/modules/ai/SchedulerSetupCard";
import { Spinner } from "@/components/ui/spinner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { api } from "../../../../../../../../convex/_generated/api";
import { cn } from "@/lib/utils";

const quickActions = [
  {
    icon: <ChartPie size={20} />,
    title: "Project report",
    sub: "Analysis & generates structured report.",
    prompt: "Generate a project report for me",
  },
  {
    icon: <CalendarCheck size={20} />,
    title: "Set Reminder",
    sub: "Creates events on your calendar.",
    prompt: "Remind me to check the deployment tomorrow",
  },
  {
    icon: <FastForward size={20} />,
    title: "Creates Sprints",
    sub: "Creates sprints for your team.",
    prompt: "Help me create a new sprint",
  },
  {
    icon: <CalendarSync size={20} />,
    title: "Auto Schedulers",
    sub: "Creates automated schedules for your team.",
    prompt: "Setup an automated report scheduler",
  },
];

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
  const project = useQuery(
    api.project.getProjectBySlug,
    slug ? { slug } : "skip",
  );
  const projectId = project?._id;

  const [message, setMessage] = useState("");
  const [thinkingTime, setThinkingTime] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { status, appCheckpoints, run, resume, restore, stop, restoring } =
    useLangGraphAgent<AgentState, InterruptValue, ResumeValue>();

  useEffect(() => {
    if (appCheckpoints.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [appCheckpoints, status]);

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
                <div className="flex items-center gap-3">
                  <Image src="/kaya.svg" alt="Kaya AI" width={50} height={50} />
                  <span className="text-3xl font-semibold tracking-tight text-primary font-pop">
                    Kaya
                  </span>
                </div>

                <div className="w-full max-w-2xl flex flex-col relative group">
                  <div className="flex ml-3">
                    <div
                      className="flex items-center gap-2 px-4 pt-2 pb-1 rounded-t-full text-sm font-medium text-primary-foreground"
                      style={{
                        background:
                          "linear-gradient(135deg, #f9a8d4 0%, #93c5fd 40%, #c4b5fd 70%, #fda4af 100%)",
                      }}
                    >
                      <Image src="/kaya.svg" alt="" width={18} height={18} />
                      Ask Kaya
                    </div>
                  </div>

                  <div
                    className="rounded-2xl p-0.5 shadow-2xl transition-all duration-500 group-hover:shadow-[#818cf8]/10"
                    style={{
                      background:
                        "linear-gradient(135deg, #f9a8d4 0%, #93c5fd 40%, #c4b5fd 70%, #fda4af 100%)",
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
                        placeholder="Get instant answers, insights, and ideas."
                        className="resize-none border-none outline-none focus:ring-0 min-h-[130px] text-primary/90 placeholder:text-muted-foreground text-[16px] px-5 pt-5 pb-2 bg-input/30 rounded-2xl w-full"
                      />

                      <div className="flex items-center justify-between px-4 py-3 border-t border-border/10">
                        <div className="flex items-center gap-2">
                          <Select defaultValue="auto">
                            <SelectTrigger className="h-7! px-3 rounded-full border border-border bg-accent text-xs text-primary font-medium shadow-none focus:ring-0 gap-1.5 min-w-[110px]">
                              <Brain size={15} />
                              <SelectValue placeholder="Auto" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="auto">Auto</SelectItem>
                              <SelectItem value="kaya-fast">
                                Kaya Fast
                              </SelectItem>
                              <SelectItem value="kaya-pro">Kaya Pro</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleSendMessage(message)}
                            disabled={!message.trim() || status === "running"}
                            className={cn(
                              "w-8 h-8 rounded-full flex items-center justify-center transition-all",
                              message.trim()
                                ? "bg-linear-to-br from-[#f472b6] to-[#818cf8] text-white"
                                : "bg-muted text-muted-foreground",
                            )}
                          >
                            <ArrowRight size={15} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-4 w-full gap-3 mt-4">
                  {quickActions.map((item, i) => (
                    <button
                      key={i}
                      onClick={() => handleSendMessage(item.prompt)}
                      className="flex flex-col gap-2 p-3 rounded-lg border border-border bg-linear-to-b from-card to-sidebar hover:bg-card text-left transition-all group"
                    >
                      <span className="text-muted-foreground ">
                        {item.icon}
                      </span>
                      <span className="text-[14px] font-semibold text-primary leading-tight">
                        {item.title}
                      </span>
                      <span className="text-[12px] text-muted-foreground leading-tight line-clamp-2">
                        {item.sub}
                      </span>
                    </button>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="chat-history"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4 pt-4"
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
                {status === "running" && (
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
                placeholder="Ask follow up..."
                className="flex-1 bg-transparent border-none outline-none text-[14px] text-primary placeholder:text-muted-foreground py-2"
              />
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
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AIWorkspace;
