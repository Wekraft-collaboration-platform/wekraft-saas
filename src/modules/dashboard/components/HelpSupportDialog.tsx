"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { useChatbot } from "@/modules/chatbot/use-chatbot";
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
  Bot,
  Bug,
  HelpCircle,
  CreditCard,
  MoreHorizontal,
  Clock,
  Zap,
  Loader2,
  HelpCircleIcon,
  Send,
  User
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
  const { messages, toolStatus, isStreaming, sendMessage } = useChatbot(currentUser?._id ?? "");
  const [chatInput, setChatInput] = useState("");
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, toolStatus, isStreaming]);

  // Form State
  const [activeTab, setActiveTab] = useState<"contact" | "ai">("contact");
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
      desc: "Ask us anything about Wekraft features, integrations, or settings...",
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
        <DialogHeader className="mb-4">
          <DialogTitle className="text-base font-semibold text-white flex items-center gap-2">
            <HelpCircleIcon className="h-5 w-5 shrink-0" />
            Help & Support
          </DialogTitle>
          <div className="flex items-center text-xs  justify-between ">
            <p>Submit a ticket to our team or consult the AI assistant.</p>

            <div className="flex items-center gap-2 bg-zinc-900">
              <Button
                variant={activeTab === "contact" ? "default" : "outline"}
                className="text-[10px] h-7!"
                onClick={() => setActiveTab("contact")}
              >
                Contact support
              </Button>
              <Button
                variant={activeTab === "ai" ? "default" : "outline"}
                className="text-[10px] h-7!"
                onClick={() => setActiveTab("ai")}
              >
                Talk to AI
              </Button>
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as "contact" | "ai")} className="w-full -mt-1.5 flex-1 flex flex-col min-h-0">

          <TabsContent value="contact" className="flex-1 min-h-0 overflow-y-auto focus:outline-none space-y-4 pr-1 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
            <form onSubmit={handleSubmit} className="space-y-4 text-left">
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
              <div className="space-y-1.5">
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
              <div className="space-y-1.5">
                <Label htmlFor="support-description" className="text-xs font-medium text-zinc-300">Description</Label>
                <Textarea
                  id="support-description"
                  required
                  rows={4}
                  placeholder={currentPlaceholder.desc}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="resize-none bg-[#0f0f12]! h-24 border border-zinc-800! text-white placeholder:text-zinc-600 rounded-md text-xs focus-visible:border-neutral-700! focus-visible:ring-0! leading-relaxed"
                />
              </div>

              {/* Support SLA notice */}
              {isPro ? (
                <div className="flex items-center gap-3 -mt-2">
                  <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                    <Zap className="h-4.5 w-4.5 text-blue-400" />
                  </div>
                  <div className="flex flex-col text-left">
                    <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                      Priority Support Active
                      <span className="text-[10px] bg-blue-500/20 text-blue-300 font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"> Estimated response time: within 12 hours.</span>
                    </div>

                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3  p-3 -mt-2">
                  <div className="h-8 w-8 rounded-full bg-zinc-900 flex items-center justify-center shrink-0">
                    <Clock className="h-4.5 w-4.5 text-zinc-400" />
                  </div>
                  <div className="flex flex-col text-left">
                    <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                      Basic Support Active
                      <span className="text-[10px] bg-zinc-800 text-zinc-300 font-medium capitalize px-2.5 py-1 rounded-full"> Estimated response time: within 48 hours.</span>
                    </div>

                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  disabled={isSubmitting}
                  className="text-xs h-8 cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs h-8 px-5 rounded-md flex items-center justify-center gap-1.5 cursor-pointer shadow-md border-none"
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
                <div className="flex flex-col items-center justify-center h-full text-center p-4 space-y-3 select-none">
                  <Bot className="h-7 w-7" />
                  <div className="space-y-1">
                    <h4 className="text-base font-medium text-white">Wekraft AI Assistant</h4>

                  </div>
                  <div className="grid grid-cols-2 gap-2 w-full max-w-[440px] pt-1">
                    <button
                      type="button"
                      onClick={() => sendMessage("Help me get started with Wekraft and explain what I can do here.")}
                      className="flex flex-col items-start gap-1 p-2 text-left bg-zinc-900/40 hover:bg-zinc-800/60 border border-zinc-800/80 rounded-xl transition-all duration-200 cursor-pointer group hover:border-zinc-700"
                    >
                      <HelpCircle className="h-3.5 w-3.5 text-blue-400 group-hover:text-blue-300 transition-colors" />
                      <span className="text-[10px] font-medium text-zinc-200 mt-0.5">Get help about anything</span>
                      <span className="text-[8px] text-zinc-500 leading-tight">Ask questions or find features in Wekraft.</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => sendMessage("I have a query regarding my account or project settings.")}
                      className="flex flex-col items-start gap-1 p-2 text-left bg-zinc-900/40 hover:bg-zinc-800/60 border border-zinc-800/80 rounded-xl transition-all duration-200 cursor-pointer group hover:border-zinc-700"
                    >
                      <MessageSquare className="h-3.5 w-3.5 text-indigo-400 group-hover:text-indigo-300 transition-colors" />
                      <span className="text-[10px] font-medium text-zinc-200 mt-0.5">Raise queries</span>
                      <span className="text-[8px] text-zinc-500 leading-tight">Ask about pricing, plans, or configurations.</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => sendMessage("I found a bug in the app. Can you help me report it?")}
                      className="flex flex-col items-start gap-1 p-2 text-left bg-zinc-900/40 hover:bg-zinc-800/60 border border-zinc-800/80 rounded-xl transition-all duration-200 cursor-pointer group hover:border-zinc-700"
                    >
                      <Bug className="h-3.5 w-3.5 text-rose-400 group-hover:text-rose-300 transition-colors" />
                      <span className="text-[10px] font-medium text-zinc-200 mt-0.5">Report bugs</span>
                      <span className="text-[8px] text-zinc-500 leading-tight">Identify UI issues, performance bugs, or errors.</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => sendMessage("Tell me more about Wekraft and what makes it unique.")}
                      className="flex flex-col items-start gap-1 p-2 text-left bg-zinc-900/40 hover:bg-zinc-800/60 border border-zinc-800/80 rounded-xl transition-all duration-200 cursor-pointer group hover:border-zinc-700"
                    >
                      <Bot className="h-3.5 w-3.5 text-emerald-400 group-hover:text-emerald-300 transition-colors" />
                      <span className="text-[10px] font-medium text-zinc-200 mt-0.5">Understand Wekraft more</span>
                      <span className="text-[8px] text-zinc-500 leading-tight">Explore the platform's vision, tools, and integrations.</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 text-left animate-in fade-in-50 duration-200">
                  {messages.map((msg) => {
                    if (msg.role === "tool") {
                      const Icon = msg.toolName === "createSupportQuery" ? MessageSquare : HelpCircle;
                      const isRunning = msg.toolStatus === "running";
                      return (
                        <div key={msg.id} className="flex justify-start pl-8 my-2 animate-in fade-in duration-200">
                          <div className="flex items-center gap-2 px-3 py-2 bg-zinc-900/60 border border-zinc-800 rounded-xl text-xs text-zinc-300 shadow-sm">
                            {isRunning ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-400 shrink-0" />
                            ) : (
                              <Icon className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                            )}
                            <span className="text-sm font-medium text-zinc-200">
                              {msg.toolName === "createSupportQuery"
                                ? (isRunning ? "Creating support ticket..." : "Created support ticket successfully")
                                : msg.toolName === "getSupportQueries"
                                  ? (isRunning ? "Fetching support queries..." : "Fetched support queries")
                                  : (isRunning ? `Running: ${msg.toolName}...` : `Executed: ${msg.toolName}`)
                              }
                            </span>
                          </div>
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
                          <div className="h-6 w-6 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shrink-0 mt-0.5">
                            <Bot className="h-3 w-3 text-blue-400" />
                          </div>
                        )}
                        <div
                          className={cn(
                            "max-w-[75%] rounded-2xl p-2.5 text-[11px] leading-relaxed break-words",
                            isUser
                              ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-none shadow-md"
                              : "bg-zinc-900/40 border border-zinc-800/80 text-zinc-100 rounded-tl-none"
                          )}
                        >
                          {msg.text || (
                            <span className="flex items-center gap-1 text-zinc-500">
                              Thinking<span className="animate-pulse">...</span>
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
                  })}
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
              className="relative flex items-center gap-2 bg-[#0f0f12] border border-zinc-800 rounded-md p-1 focus-within:border-neutral-700"
            >
              <Input
                type="text"
                placeholder="Ask assistant anything..."
                value={chatInput}
                onChange={(e) => chatInput !== e.target.value && setChatInput(e.target.value)}
                disabled={isStreaming}
                className="bg-transparent! border-none! text-white placeholder:text-zinc-600 h-8 text-xs focus-visible:ring-0! flex-1 outline-none pr-10"
              />
              <Button
                type="submit"
                size="icon"
                disabled={!chatInput.trim() || isStreaming}
                className="h-7 w-7 bg-blue-600 hover:bg-blue-500 text-white rounded-md shrink-0 flex items-center justify-center cursor-pointer disabled:bg-zinc-800 disabled:text-zinc-500 disabled:cursor-not-allowed transition-colors"
              >
                {isStreaming ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Send className="h-3.5 w-3.5" />
                )}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
