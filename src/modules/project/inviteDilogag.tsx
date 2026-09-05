"use client";

import * as React from "react";
import { Copy, Mail, MessageSquare, Slack, Check, Users2, Link2, ChevronDown, UserPlus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { INVITE_LINK } from "@/lib/static-store";
import { toast } from "sonner";
import { LuExternalLink } from "react-icons/lu";
import { cn } from "@/lib/utils";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";

interface InviteDialogProps {
  inviteLink?: string;
  projectName?: string;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  contentClassName?: string;
  preventCloseOutside?: boolean;
}

export function InviteDialog({ inviteLink, projectName, trigger, open, onOpenChange, contentClassName, preventCloseOutside }: InviteDialogProps) {
  const [copied, setCopied] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [inviting, setInviting] = React.useState(false);
  const [role, setRole] = React.useState<"member" | "admin" | "viewer">("member");

  const fullInviteLink = inviteLink ? `${INVITE_LINK}invite/${inviteLink}?role=${role}` : "";

  const markInviteStepCompleted = useMutation(api.user.markInviteStepCompleted);

  const isValidEmail = (val: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  };

  const handleCopy = () => {
    if (!fullInviteLink) return;
    navigator.clipboard.writeText(fullInviteLink);
    setCopied(true);
    toast.success("Invite link copied!", {
      style: {
        background: "var(--popover)",
        color: "var(--popover-foreground)",
        border: "1px solid var(--border)",
      }
    });
    setTimeout(() => setCopied(false), 2000);
    markInviteStepCompleted().catch((err) => console.error("Error marking invite step complete:", err));
  };

  const handleInvite = async () => {
    if (!isValidEmail(email)) return;
    setInviting(true);
    try {
      const res = await fetch("/api/invite/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: email,
          projectName: projectName || "WeKraft Project",
          inviteLink: fullInviteLink,
          role: role,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to send invitation email");
      }

      toast.success(`Invitation sent to ${email}`, {
        style: {
          background: "var(--popover)",
          color: "var(--popover-foreground)",
          border: "1px solid var(--border)",
        }
      });
      setEmail("");
      markInviteStepCompleted().catch((err) => console.error("Error marking invite step complete:", err));
    } catch (err: any) {
      toast.error(err.message || "Failed to send invitation. Please try again.", {
        style: {
          background: "var(--popover)",
          color: "var(--popover-foreground)",
          border: "1px solid var(--border)",
        }
      });
    } finally {
      setInviting(false);
    }
  };

  const handleGenerateNewLink = () => {
    toast.success("New invite link generated!", {
      style: {
        background: "var(--popover)",
        color: "var(--popover-foreground)",
        border: "1px solid var(--border)",
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal={false}>
      <DialogTrigger asChild>
        {trigger || <Button variant="outline">Invite</Button>}
      </DialogTrigger>
      <DialogContent
        className={cn("w-full max-w-lg bg-sidebar border border-accent shadow-[0_0_50px_rgba(0,0,0,0.8)] rounded-xl p-0 overflow-hidden gap-0 text-white", contentClassName)}
        onPointerDownOutside={preventCloseOutside ? (e) => e.preventDefault() : undefined}
        onInteractOutside={preventCloseOutside ? (e) => e.preventDefault() : undefined}
        onEscapeKeyDown={preventCloseOutside ? (e) => e.preventDefault() : undefined}
      >
        <div className="p-6 pb-4">
          <DialogHeader className="gap-1">
            <DialogTitle className="text-xl font-bold tracking-tight text-white text-left">
              Invite to Project <Users2 className="inline w-5 h-5 ml-1 text-zinc-400" />
            </DialogTitle>
            <DialogDescription className="text-zinc-400 text-sm text-left">
              Share this link with your team to collaborate.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="px-6 pb-6 space-y-4">
          {/* Email Invite Section */}
          <div className="flex flex-col gap-2">
            <span className="text-sm text-white text-left pl-0.5">
              Invite Teammate <LuExternalLink className="inline w-4 h-4 -mt-1 ml-1" />
            </span>

            <div className="flex items-center gap-2">
              <div className="flex-grow flex items-center gap-2 p-1.5 pl-3.5 border border-accent rounded-lg focus-within:border-neutral-400 focus-within:ring-1 focus-within:ring-neutral-400/30 transition-all duration-150 bg-muted h-11">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && isValidEmail(email) && !inviting) {
                      e.preventDefault();
                      handleInvite();
                    }
                  }}
                  placeholder="Email address"
                  className="border-none bg-transparent outline-none focus:outline-none focus:ring-0 focus-visible:ring-0 text-sm font-normal text-white px-1 h-full truncate placeholder:text-zinc-500 flex-grow [&:-webkit-autofill]:transition-colors [&:-webkit-autofill]:duration-[5000000ms] [&:-webkit-autofill]:text-white"
                />

                <Button
                  size="sm"
                  onClick={handleInvite}
                  disabled={!isValidEmail(email) || inviting}
                  // variant={isValidEmail(email) ? "default" : "outline"}
                  className="h-8 px-4 text-xs bg-white text-black flex items-center gap-1.5 shrink-0"
                >
                  {inviting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span className="anim-fade-in">Inviting...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-3.5 h-3.5" />
                      <span className="anim-fade-in">Invite</span>
                    </>
                  )}
                </Button>
              </div>

              {/* Custom DropdownMenu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="flex items-center justify-between bg-muted border border-accent hover:border-accent text-zinc-300 text-xs font-normal rounded-lg px-3 h-10 outline-none cursor-pointer transition-all gap-1.5 focus:ring-0 focus:outline-none"
                  >
                    <span className="capitalize">{role}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-sidebar border border-accent text-white p-1.5 min-w-[220px] rounded-lg shadow-2xl">
                  <DropdownMenuItem
                    onClick={() => setRole("admin")}
                    className="text-[12px] rounded-md cursor-pointer px-3 py-2.5 flex items-start justify-between gap-3"
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium text-white">Admin</span>
                      <span className="text-[10px] text-zinc-400 font-normal">Full access after owner</span>
                    </div>
                    {role === "admin" && <Check className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setRole("member")}
                    className="text-[12px] rounded-md cursor-pointer px-3 py-2.5 flex items-start justify-between gap-3"
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium text-white">Member</span>
                      <span className="text-[10px] text-zinc-400 font-normal">Limited access</span>
                    </div>
                    {role === "member" && <Check className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setRole("viewer")}
                    className="text-[12px] rounded-md cursor-pointer px-3 py-2.5 flex items-start justify-between gap-3"
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium text-white">Viewer</span>
                      <span className="text-[10px] text-zinc-400 font-normal">Read-only — ideal for clients</span>
                    </div>
                    {role === "viewer" && <Check className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Copy Invite Link Option */}
          <Button
            id="copy-invite-link-btn"
            variant="outline"
            onClick={handleCopy}
            disabled={!fullInviteLink}
            className="flex  items-center justify-center gap-1.5 mx-auto text-xs text-white bg-transparent border border-white hover:bg-white/10 hover:text-white transition-all font-normal cursor-pointer w-fit px-8 h-9 rounded-md mt-8"
          >
            <Link2 className="w-3.5 h-3.5" />
            {copied ? "Copied invite link!" : "Copy invite link"}
          </Button>
        </div>

        <div className="bg-muted/80 px-6 py-4 flex items-center justify-between border-t border-accent">
          <p className="text-xs text-zinc-400">You can Generate New Link</p>
          <button onClick={handleGenerateNewLink} className="text-xs text-zinc-300 hover:text-white hover:underline underline-offset-2 cursor-pointer transition-colors">Generate new link</button>
        </div>
      </DialogContent>

      <style jsx global>{`
        @keyframes anim-fade-in {
          from { opacity: 0; transform: translateY(2px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .anim-fade-in {
          animation: anim-fade-in 0.2s ease-out forwards;
        }
      `}</style>
    </Dialog>
  );
}
