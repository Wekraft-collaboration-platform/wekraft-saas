"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
  Loader2 
} from "lucide-react";
import { cn } from "@/lib/utils";

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

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedTag, setSelectedTag] = useState<"found bug" | "help needed" | "query" | "payment issue" | "others">("found bug");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createSupportTicket = useMutation(api.support.createSupportQuery);

  const supportTags = [
    { id: "found bug", label: "Found Bug", icon: Bug, color: "border-red-500/20 text-red-400 hover:bg-red-500/10 data-[state=active]:bg-red-500/20 data-[state=active]:border-red-500" },
    { id: "help needed", label: "Help Needed", icon: HelpCircle, color: "border-blue-500/20 text-blue-400 hover:bg-blue-500/10 data-[state=active]:bg-blue-500/20 data-[state=active]:border-blue-500" },
    { id: "query", label: "Query", icon: MessageSquare, color: "border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10 data-[state=active]:bg-emerald-500/20 data-[state=active]:border-emerald-500" },
    { id: "payment issue", label: "Payment Issue", icon: CreditCard, color: "border-amber-500/20 text-amber-400 hover:bg-amber-500/10 data-[state=active]:bg-amber-500/20 data-[state=active]:border-amber-500" },
    { id: "others", label: "Others", icon: MoreHorizontal, color: "border-zinc-700 text-zinc-400 hover:bg-zinc-800 data-[state=active]:bg-zinc-800/80 data-[state=active]:border-zinc-400" },
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
      <DialogContent className="sm:max-w-[480px] p-6 rounded-2xl bg-sidebar border border-accent shadow-2xl overflow-hidden animate-in fade-in-50 zoom-in-95 duration-200">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-lg font-bold text-white flex items-center gap-2">
            <LifeBuoy className="h-5 w-5 text-blue-500 shrink-0" />
            Help & Support
          </DialogTitle>
          <DialogDescription className="text-zinc-400 text-xs mt-1">
            Submit a ticket to our team or consult the AI assistant.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="contact" className="w-full">
          <TabsList className="grid grid-cols-2 w-full h-9 rounded-lg p-[3px] bg-zinc-900 border border-zinc-800/80 mb-5">
            <TabsTrigger value="contact" className="text-xs font-semibold text-zinc-400 data-[state=active]:text-white transition-all">
              <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
              Contact Support
            </TabsTrigger>
            <TabsTrigger value="ai" className="text-xs font-semibold text-zinc-400 data-[state=active]:text-white transition-all">
              <Bot className="h-3.5 w-3.5 mr-1.5" />
              Talk to AI
            </TabsTrigger>
          </TabsList>

          <TabsContent value="contact" className="space-y-4 focus:outline-none">
            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              {/* Support Tag select row */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-zinc-300">Category Tag</Label>
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
                          "flex items-center gap-1.5 px-2.5 py-1 text-[11px] rounded-full border bg-transparent font-medium cursor-pointer transition-all duration-200 select-none",
                          tag.color
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
                  className="bg-[#0f0f12]! border border-zinc-800! text-white placeholder:text-zinc-550 h-9 rounded-md text-xs focus-visible:ring-1 focus-visible:ring-zinc-550!"
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
                  className="resize-none bg-[#0f0f12]! border border-zinc-800! text-white placeholder:text-zinc-550 rounded-md text-xs focus-visible:ring-1 focus-visible:ring-zinc-550! leading-relaxed"
                />
              </div>

              {/* Support SLA notice */}
              {isPro ? (
                <div className="flex items-center gap-3 border border-blue-500/30 bg-blue-500/5 rounded-xl p-3 shadow-[0_0_15px_rgba(59,130,246,0.05)]">
                  <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                    <Zap className="h-4.5 w-4.5 text-blue-400" />
                  </div>
                  <div className="flex flex-col text-left">
                    <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                      Priority Support Active
                      <span className="text-[8px] bg-blue-500/20 text-blue-300 font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full">Pro</span>
                    </div>
                    <p className="text-[10px] text-zinc-400 mt-0.5 leading-normal">
                      Priority support active. Estimated response time: **within 12 hours** of submissions.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 border border-zinc-800 bg-zinc-950/20 rounded-xl p-3">
                  <div className="h-8 w-8 rounded-full bg-zinc-900 flex items-center justify-center shrink-0">
                    <Clock className="h-4.5 w-4.5 text-zinc-400" />
                  </div>
                  <div className="flex flex-col text-left">
                    <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                      Basic Support Active
                      <span className="text-[8px] bg-zinc-800 text-zinc-400 font-medium capitalize px-1.5 py-0.5 rounded-full">{accountType}</span>
                    </div>
                    <p className="text-[10px] text-zinc-400 mt-0.5 leading-normal">
                      Basic support active. Estimated response time: **within 28 hours**.
                    </p>
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

          <TabsContent value="ai" className="focus:outline-none">
            <div className="relative border border-dashed border-zinc-800 rounded-xl p-6 flex flex-col items-center justify-center text-center bg-zinc-950/40 min-h-[300px] overflow-hidden">
              {/* Simulated chat preview */}
              <div className="w-full space-y-3 opacity-15 select-none pointer-events-none mb-4">
                <div className="flex items-start gap-2 max-w-[85%]">
                  <div className="h-5 w-5 rounded-full bg-blue-500/20 flex items-center justify-center text-[9px] text-blue-400 font-bold shrink-0">AI</div>
                  <div className="bg-zinc-900 p-2 rounded-lg text-[10px] text-left leading-normal text-zinc-300">
                    Hello! I am the Wekraft AI support assistant. You can ask me questions about syncing your repository, configuring deadlines, or managing team invites!
                  </div>
                </div>
                <div className="flex items-start gap-2 max-w-[85%] ml-auto justify-end">
                  <div className="bg-blue-600/10 border border-blue-500/10 p-2 rounded-lg text-[10px] text-left text-blue-300">
                    How do I connect my GitHub repository to a project?
                  </div>
                </div>
                <div className="flex items-start gap-2 max-w-[85%]">
                  <div className="h-5 w-5 rounded-full bg-blue-500/20 flex items-center justify-center text-[9px] text-blue-400 font-bold shrink-0">AI</div>
                  <div className="bg-zinc-900 p-2 rounded-lg text-[10px] text-left leading-normal text-zinc-300">
                    To connect a repository, navigate to the Dashboard settings or onboarding steps, connect your GitHub identity, and select your repository from the list.
                  </div>
                </div>
              </div>

              {/* Cover Banner */}
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#09090b]/80 backdrop-blur-[0.5px] p-6 rounded-xl">
                <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center mb-3">
                  <Bot className="h-5 w-5 text-blue-400" />
                </div>
                <span className="text-[9px] bg-blue-600/30 text-blue-300 font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full mb-3 animate-pulse">
                  Coming Soon
                </span>
                <h4 className="text-sm font-bold text-white mb-1.5">Talk to AI Assistant</h4>
                <p className="text-[11px] text-zinc-400 max-w-[280px] leading-relaxed">
                  This can maybe resolve your query. Get instant answers using Wekraft AI.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
