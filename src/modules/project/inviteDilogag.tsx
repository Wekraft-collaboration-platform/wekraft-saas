"use client";

import * as React from "react";
import { Copy, Mail, MessageSquare, Slack, Check, Users2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { INVITE_LINK } from "@/lib/static-store";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";

interface InviteDialogProps {
  inviteLink?: string;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function InviteDialog({ inviteLink, trigger, open, onOpenChange }: InviteDialogProps) {
  const [copied, setCopied] = React.useState(false);

  const fullInviteLink = inviteLink ? `${INVITE_LINK}invite/${inviteLink}` : "";

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
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal={false}>
      <DialogTrigger asChild>
        {trigger || <Button variant="outline">Invite</Button>}
      </DialogTrigger>
      <DialogContent className="w-full max-w-lg bg-sidebar border-accent shadow-2xl rounded-2xl p-0 overflow-hidden gap-0">
        <div className="p-6 pb-4">
          <DialogHeader className="gap-1">
            <DialogTitle className="text-xl font-bold tracking-tight text-primary text-left">
              Invite to Project <Users2 className="inline w-5 h-5 ml-1" />
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm text-left">
              Share this link with your team to collaborate.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="px-6 pb-6 space-y-6">
          {/* Copy Link Section */}
          <div className="flex items-center gap-2 p-1 pl-3  border border-accent/10 rounded-xl focus-within:ring-2 focus-within:ring-primary/20 transition-all duration-200">
            <Input
              readOnly
              value={fullInviteLink}
              placeholder="Generating link..."
              className="border-0 bg-transparent focus-visible:ring-0 text-xs font-medium text-primary/80 px-2 h-9 truncate"
            />
            <Button
              id="copy-invite-link-btn"
              size="sm"
              onClick={handleCopy}
              disabled={!fullInviteLink}
              className={cn(
                "h-8 px-4 rounded-lg text-sm font-medium transition-all duration-200 active:scale-95 cursor-pointer",
                copied ? "bg-primary text-primary-foreground" : "bg-primary hover:bg-primary/90 text-primary-foreground"
              )}
            >
              {copied ? (
                <div className="flex items-center gap-1.5 anim-fade-in">
                  <Check className="w-3.5 h-3.5" /> Copied
                </div>
              ) : (
                <div className="flex items-center gap-1.5 anim-fade-in">
                  <Copy className="w-3.5 h-3.5" /> Copy Link
                </div>
              )}
            </Button>
          </div>

          {/* Email */}
          <div className="">
            <Textarea
              placeholder="Enter Teammate email to send invite..."
              className="resize-none border h-20"
            />
          </div>


        </div>

        <div className="bg-accent/5 px-6 py-4 flex items-center justify-between border-t border-accent/10">
          <p className="text-xs text-muted-foreground ">You can Gnerate New Link</p>
          <button className="text-xs text-primary hover:underline underline-offset-2 cursor-pointer">Generate new link</button>
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
