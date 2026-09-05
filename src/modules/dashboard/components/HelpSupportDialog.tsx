"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { useChatbot } from "@/modules/chatbot/use-chatbot";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { api } from "../../../../convex/_generated/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  LifeBuoy,
  MessageSquare,
  Bug,
  HelpCircle,
  CreditCard,
  MoreHorizontal,
  Clock,
  Zap,
  Loader2,
  HelpCircleIcon,
  Send,
  User,
  Headset,
  Trash2,
  Square,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const AIAssistantIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <defs>
      <linearGradient id="aiIconGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#3b82f6" />
        <stop offset="100%" stopColor="#8b5cf6" />
      </linearGradient>
    </defs>
    <path
      d="M12 3L14.5 8.5L20 11L14.5 13.5L12 19L9.5 13.5L4 11L9.5 8.5L12 3Z"
      fill="url(#aiIconGrad)"
    />
    <path
      d="M19 3L20 5.5L22.5 6.5L20 7.5L19 10L18 7.5L15.5 6.5L18 5.5L19 3Z"
      fill="url(#aiIconGrad)"
      opacity="0.7"
    />
    <path
      d="M5 15L6 17.5L8.5 18.5L6 19.5L5 22L4 19.5L1.5 18.5L4 17.5L5 15Z"
      fill="url(#aiIconGrad)"
      opacity="0.7"
    />
  </svg>
);

interface HelpSupportDialogProps {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function HelpSupportDialog({ trigger, open, onOpenChange }: HelpSupportDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = open !== undefined ? open : internalOpen;
  const setIsOpen = onOpenChange !== undefined ? onOpenChange : setInternalOpen;

  const currentUser = useQuery(api.user.getCurrentUser);
  const accountType = currentUser?.accountType || "free";
  const isPro = accountType === "pro";

  // Chatbot State
  const { messages, toolStatus, isStreaming, sendMessage, stop, clear } = useChatbot(currentUser?._id ?? "");
  const [chatInput, setChatInput] = useState("");
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setActiveTab("ai");
    }
  }, [isOpen]);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: isStreaming ? "auto" : "smooth",
      });
    }
  }, [messages, toolStatus, isStreaming]);

  // Form State
  const [activeTab, setActiveTab] = useState<"contact" | "ai">("ai");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedTag, setSelectedTag] = useState<"found bug" | "help needed" | "query" | "payment issue" | "others">("found bug");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createSupportTicket = useMutation(api.support.createSupportQuery);

  const supportTags = [
    { id: "found bug", label: "Found Bug", icon: Bug },
    { id: "help needed", label: "Help Needed", icon: HelpCircle },
    { id: "query", label: "Query", icon: MessageSquare },
    { id: "payment issue", label: "Payment Issue", icon: CreditCard },
    { id: "others", label: "Others", icon: MoreHorizontal },
  ] as const;

  const placeholders = {
    "found bug": {
      title: "e.g., Workspace calendar fails to sync dates",
      desc: "Please describe the bug, how to reproduce it, and the expected behavior...",
    },
    "help needed": {
      title: "e.g., How to link multiple repositories to a project",
      desc: "Tell us what you are trying to achieve and where you are stuck...",
    },
    "query": {
      title: "e.g., Custom webhook payloads support on Plus plan",
      desc: "Ask us anything about WeKraft features, integrations, or settings...",
    },
    "payment issue": {
      title: "e.g., Invoice details updated for subscription renewal",
      desc: "Specify the payment date, transaction/invoice ID, and describe the billing issue...",
    },
    "others": {
      title: "e.g., Collaboration proposal / feedback",
      desc: "How can we help you today?",
    },
  };

  const currentPlaceholder = placeholders[selectedTag];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      toast.error("Please fill in both title and description.");
      return;
    }

    setIsSubmitting(true);
    try {
      await createSupportTicket({
        title,
        reason: selectedTag,
        description,
      });
      toast.success("Support ticket submitted successfully! Check your email for updates.");
      setTitle("");
      setDescription("");
      setIsOpen(false);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to submit support ticket. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-[580px] p-4 rounded-xl h-[560px] flex flex-col overflow-hidden bg-sidebar border border-accent shadow-2xl animate-in fade-in-50 zoom-in-95 duration-200">
        <style dangerouslySetInnerHTML={{
          __html: `
          @keyframes chatbot-shimmer {
            0% {
              background-position: -200% 0;
            }
            100% {
              background-position: 200% 0;
            }
          }
          .text-shimmer {
            background: linear-gradient(90deg, #71717a 25%, #f4f4f5 50%, #71717a 75%);
            background-size: 200% auto;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            animation: chatbot-shimmer 2.2s infinite linear;
            display: inline-flex;
            align-items: center;
          }
          .animate-chatbot-shimmer {
            background: linear-gradient(90deg, #18181b 25%, #27272a 50%, #18181b 75%);
            background-size: 200% 100%;
            animation: chatbot-shimmer 1.5s infinite linear;
          }
        `}} />
        <DialogHeader className="mb-4">
          <DialogTitle className="text-base font-semibold text-white flex items-center gap-2">
            <HelpCircleIcon className="h-5 w-5 shrink-0" />
            Help & Support
          </DialogTitle>
          <div className="flex items-center text-xs text-muted-foreground  justify-between ">
            <p>Submit a ticket to our team or consult the AI assistant.</p>

            <div className="flex items-center rounded! gap-2 bg-zinc-900">
              <Button
                variant={activeTab === "ai" ? "default" : "outline"}
                className="text-[10px] h-7!"
                onClick={() => setActiveTab("ai")}
              >
                Talk to AI
              </Button>
              <Button
                variant={activeTab === "contact" ? "default" : "outline"}
                className="text-[10px] h-7!"
                onClick={() => setActiveTab("contact")}
              >
                Contact support
              </Button>
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as "contact" | "ai")} className="w-full -mt-1.5 flex-1 flex flex-col min-h-0">

          <TabsContent value="contact" className="flex-1 overflow-y-auto focus:outline-none space-y-4 pr-1 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
            <form onSubmit={handleSubmit} className="space-y-4 text-left flex flex-col h-full">
              {/* Support Tag select row */}
              <div className="space-y-4">
                <Label className="text-sm font-medium text-zinc-300">Category Tag</Label>
                <div className="flex flex-wrap gap-1.5">
                  {supportTags.map((tag) => {
                    const isSelected = selectedTag === tag.id;
                    const Icon = tag.icon;
                    return (
                      <button
                        key={tag.id}
                        type="button"
                        data-state={isSelected ? "active" : "inactive"}
                        onClick={() => setSelectedTag(tag.id as any)}
                        className={cn(
                          "flex items-center gap-2 px-3 py-1.5 text-[10px] rounded-full border font-medium cursor-pointer transition-all duration-200 select-none",
                          isSelected
                            ? "bg-neutral-100 text-zinc-950 border-white shadow-sm"
                            : "bg-zinc-900/50 text-zinc-400 border-zinc-800 hover:bg-zinc-800 hover:text-zinc-200"
                        )}
                      >
                        <Icon className="h-3 w-3 shrink-0" />
                        {tag.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Title input */}
              <div className="space-y-2">
                <Label htmlFor="support-title" className="text-xs font-medium text-zinc-300">Title</Label>
                <Input
                  id="support-title"
                  type="text"
                  required
                  placeholder={currentPlaceholder.title}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-[#0f0f12]! border border-zinc-800! text-white placeholder:text-zinc-600 h-9 rounded-md text-xs focus-visible:border-neutral-700! focus-visible:ring-0!"
                />
              </div>

              {/* Description textarea */}
              <div className="space-y-2">
                <Label htmlFor="support-description" className="text-xs font-medium text-zinc-300">Description</Label>
                <Textarea
                  id="support-description"
                  required
                  rows={4}
                  placeholder={currentPlaceholder.desc}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="resize-none bg-[#0f0f12]! h-26 border border-zinc-800! text-white placeholder:text-zinc-600 rounded-md text-xs focus-visible:border-neutral-700! focus-visible:ring-0! leading-relaxed"
                />
              </div>

              {/* Support SLA notice */}
              {isPro ? (
                <div className="flex items-center gap-3 mt-4">

                  <Headset className="h-4 w-4 " />

                  <div className="flex flex-col text-left">
                    <div className="text-xs  text-white flex items-center gap-1.5">
                      Priority Support Active
                      <span className="text-[10px] bg-blue-500/10 text-zinc-300  px-2.5 py-1 rounded-full"> Estimated response time: within 12 hours.</span>
                    </div>

                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3  p-3 mt-4">

                  <Headset className="h-4 w-4 text-zinc-400" />

                  <div className="flex flex-col text-left">
                    <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                      Basic Support Active
                      <span className="text-[10px] bg-zinc-800 text-zinc-300 font-medium capitalize px-2.5 py-1 rounded-full"> Estimated response time: within 48 hours.</span>
                    </div>

                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 mb-2 mt-auto!">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  disabled={isSubmitting}
                  className="text-xs h-7 cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs h-7 px-5 rounded-md flex items-center justify-center gap-1.5 cursor-pointer shadow-md border-none"
                >
                  {isSubmitting ? (
                    <>
                      Submitting
                      <Loader2 className="h-3 w-3 animate-spin" />
                    </>
                  ) : (
                    "Submit Ticket"
                  )}
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="ai" className="flex-1 flex flex-col min-h-0 focus:outline-none justify-between">
            {/* Messages Container */}
            <div
              ref={scrollContainerRef}
              className="flex-1 overflow-y-auto pr-1 mb-3 space-y-3 min-h-0 select-none scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent"
            >
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-4 space-y-4 select-none">
                  <AIAssistantIcon className="h-9 w-9" />
                  <div className="space-y-1">
                    <h4 className="text-base font-medium text-white">WeKraft AI Assistant</h4>
                  </div>
                  <div className="flex flex-col gap-2 w-full max-w-[400px] pt-1">
                    {[
                      { label: "Ask anything about WeKraft", query: "Help me get started with WeKraft and explain what I can do here." },
                      { label: "Raise queries", query: "I have a query regarding my account or project settings." },
                      { label: "Report bugs", query: "I found a bug in the app. Can you help me report it?" },
                      { label: "Know more features", query: "Tell me more about WeKraft and what makes it unique." }
                    ].map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => sendMessage(item.query)}
                        className="flex items-center justify-between px-4 py-2.5 bg-zinc-900/30 hover:bg-zinc-900/60 border border-zinc-800/80 rounded-xl text-xs text-zinc-300 transition-all duration-200 cursor-pointer group hover:border-zinc-700"
                      >
                        <span className="font-medium text-zinc-200 group-hover:text-white transition-colors">{item.label}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-3 text-left animate-in fade-in-50 duration-200">
                  {(() => {
                    const lastUserIndex = [...messages].reverse().findIndex((m) => m.role === "user");
                    const lastUserMsgIdx = lastUserIndex !== -1 ? messages.length - 1 - lastUserIndex : -1;

                    return messages
                      .filter((msg, idx) => {
                        if (msg.role === "tool") {
                          // Only show tool messages that are part of the current turn (after the last user query)
                          return idx > lastUserMsgIdx;
                        }
                        return true;
                      })
                      .map((msg) => {
                        if (msg.role === "tool") {
                          const Icon = msg.toolName === "createSupportQuery" ? MessageSquare : HelpCircle;
                          const isRunning = msg.toolStatus === "running";
                          return (
                            <div
                              key={msg.id}
                              className={cn(
                                "flex flex-col items-start pl-8 transition-all duration-300 ease-in-out overflow-hidden origin-top",
                                isStreaming ? "max-h-[300px] opacity-100 scale-100 my-2" : "max-h-0 opacity-0 scale-95 my-0! py-0! border-none!"
                              )}
                            >
                              <div className="flex items-center gap-2 px-3 py-2 bg-zinc-900/60 border border-zinc-800 rounded-xl text-xs text-zinc-300 shadow-sm">
                                {isRunning ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-400 shrink-0" />
                                ) : (
                                  <Icon className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                                )}
                                <span className={cn("text-[11px] font-medium", isRunning ? "text-shimmer" : "text-zinc-200")}>
                                  {msg.toolName === "createSupportQuery"
                                    ? (isRunning ? "Creating support ticket..." : "Created support ticket successfully")
                                    : msg.toolName === "getSupportQueries"
                                      ? (isRunning ? "Fetching support queries..." : "Fetched support queries")
                                      : msg.toolName === "searchDocumentation"
                                        ? (isRunning ? "Searching WeKraft docs..." : "Searched docs")
                                        : msg.toolName === "getDocumentationPage"
                                          ? (isRunning ? "Reading documentation..." : "Read documentation")
                                          : (isRunning ? `Running: ${msg.toolName}...` : `Executed: ${msg.toolName}`)
                                  }
                                </span>
                              </div>

                              {/* Temp results preview below, only shown while streaming (before text response streams) */}
                              {!isRunning && msg.toolOutput && (
                                <div className="mt-1 w-full max-w-[340px] pl-1 animate-in slide-in-from-top-2 duration-200">
                                  {msg.toolName === "searchDocumentation" && (
                                    <div className="p-2.5 bg-zinc-950/80 rounded-xl border border-zinc-800 text-[10px] space-y-1.5 shadow-md">
                                      <div className="text-zinc-500 font-semibold uppercase tracking-wider text-[8px]">Search Matches:</div>
                                      {(msg.toolOutput as any).results?.length > 0 ? (
                                        ((msg.toolOutput as any).results as any[]).map((r: any) => (
                                          <div key={r.slug} className="flex justify-between items-center text-zinc-300 border-b border-zinc-900/50 pb-1 last:border-b-0 last:pb-0">
                                            <span>📄 {r.title}</span>
                                            <span className="text-zinc-500 text-[8px] bg-zinc-900 px-1.5 py-0.5 rounded font-mono select-all">{r.slug}</span>
                                          </div>
                                        ))
                                      ) : (
                                        <div className="text-zinc-500 italic">No matching pages found.</div>
                                      )}
                                    </div>
                                  )}
                                  {msg.toolName === "getDocumentationPage" && (
                                    <div className="p-2.5 bg-zinc-950/80 rounded-xl border border-zinc-800 text-[10px] shadow-md text-zinc-400 leading-relaxed">
                                      <div className="text-zinc-500 font-semibold uppercase tracking-wider text-[8px] mb-1">Loaded Content:</div>
                                      <div className="italic font-mono text-[9px] line-clamp-3">
                                        "{(msg.toolOutput as any).content ? `${(msg.toolOutput as any).content.slice(0, 150)}...` : 'No content'}"
                                      </div>
                                    </div>
                                  )}
                                  {msg.toolName === "getSupportQueries" && (
                                    <div className="p-2.5 bg-zinc-950/80 rounded-xl border border-zinc-800 text-[10px] space-y-1 shadow-md text-zinc-300">
                                      <div className="text-zinc-500 font-semibold uppercase tracking-wider text-[8px] mb-1">Your Tickets:</div>
                                      {(msg.toolOutput as any).queries?.length > 0 ? (
                                        ((msg.toolOutput as any).queries as any[]).map((q: any) => (
                                          <div key={q._id} className="text-zinc-300">• {q.title} <span className="text-zinc-500 text-[8px] bg-zinc-900 px-1.5 py-0.5 rounded">{q.reason}</span></div>
                                        ))
                                      ) : (
                                        <div className="text-zinc-500 italic">No tickets found.</div>
                                      )}
                                    </div>
                                  )}
                                  {msg.toolName === "createSupportQuery" && (
                                    <div className="p-2.5 bg-zinc-950/80 rounded-xl border border-zinc-800 text-[10px] shadow-md text-zinc-300">
                                      {(msg.toolOutput as any).message}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        }

                        const isUser = msg.role === "user";
                        return (
                          <div
                            key={msg.id}
                            className={cn(
                              "flex w-full gap-2",
                              isUser ? "justify-end" : "justify-start"
                            )}
                          >
                            {!isUser && (
                              <AIAssistantIcon className="h-5 w-5 shrink-0 mt-0.5 text-blue-400" />
                            )}
                            <div
                              className={cn(
                                "max-w-[75%] rounded-2xl p-2 text-[11px] leading-relaxed wrap-break-word",
                                isUser
                                  ? "bg-blue-500 text-white rounded-tr-none shadow-md"
                                  : "bg-zinc-900/40 border border-zinc-800/80 text-zinc-100 rounded-tl-none"
                              )}
                            >
                              {isUser ? (
                                msg.text
                              ) : msg.text ? (
                                <ReactMarkdown
                                  remarkPlugins={[remarkGfm]}
                                  components={{
                                    p: ({ children }) => <p className="mb-1.5 last:mb-0 leading-relaxed">{children}</p>,
                                    ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>,
                                    ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>,
                                    li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                                    strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
                                    a: ({ href, children }) => (
                                      <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                                        {children}
                                      </a>
                                    ),
                                    code: ({ className, children, ...props }: any) => {
                                      const isInline = !className;
                                      return isInline ? (
                                        <code className="bg-zinc-800 px-1 py-0.5 rounded text-[10px] font-mono text-zinc-200">{children}</code>
                                      ) : (
                                        <pre className="bg-zinc-950 p-2 rounded-lg my-1.5 overflow-x-auto text-[10px] font-mono border border-zinc-800 text-zinc-300">
                                          <code {...props}>{children}</code>
                                        </pre>
                                      );
                                    }
                                  }}
                                >
                                  {msg.text}
                                </ReactMarkdown>
                              ) : (
                                <span className="flex items-center gap-1.5 font-medium text-shimmer">
                                  Assistant is thinking...
                                </span>
                              )}
                            </div>
                            {isUser && (
                              <Avatar className="h-6 w-6 border border-zinc-800 shrink-0 mt-0.5">
                                <AvatarImage src={currentUser?.avatarUrl} alt={currentUser?.name || "User"} />
                                <AvatarFallback className="text-[9px] font-semibold bg-zinc-800 text-zinc-300 flex items-center justify-center">
                                  {currentUser?.name ? currentUser.name.slice(0, 2).toUpperCase() : <User className="h-3 w-3 text-zinc-400" />}
                                </AvatarFallback>
                              </Avatar>
                            )}
                          </div>
                        );
                      });
                  })()}
                </div>
              )}
            </div>

            {/* Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!chatInput.trim() || isStreaming) return;
                sendMessage(chatInput.trim());
                setChatInput("");
              }}
              className="relative flex items-center gap-1.5 bg-[#0f0f12] border border-zinc-800 rounded-md p-1 focus-within:border-neutral-700"
            >
              {messages.length > 0 && (
                <Button
                  type="button"
                  onClick={clear}
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/40 rounded-md shrink-0 flex items-center justify-center cursor-pointer transition-colors"
                  title="Clear chat history"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
              <Input
                type="text"
                placeholder="Ask assistant anything..."
                value={chatInput}
                onChange={(e) => chatInput !== e.target.value && setChatInput(e.target.value)}
                disabled={isStreaming}
                className="bg-transparent! border-none! text-white placeholder:text-zinc-600 h-8 text-xs focus-visible:ring-0! flex-1 outline-none pr-2"
              />
              {isStreaming ? (
                <Button
                  type="button"
                  onClick={stop}
                  size="icon"
                  className="h-7 w-7 bg-rose-600/10 hover:bg-rose-600/20 text-rose-500 border border-rose-500/20 rounded-md shrink-0 flex items-center justify-center cursor-pointer transition-colors"
                  title="Stop generating"
                >
                  <Square className="h-3 w-3 fill-rose-500" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  size="icon"
                  disabled={!chatInput.trim()}
                  className="h-7 w-7 bg-blue-600 hover:bg-blue-500 text-white rounded-md shrink-0 flex items-center justify-center cursor-pointer disabled:bg-zinc-800 disabled:text-zinc-500 disabled:cursor-not-allowed transition-colors"
                  title="Send message"
                >
                  <Send className="h-3.5 w-3.5" />
                </Button>
              )}
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
