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

interface InviteDialogProps {
  inviteLink?: string;
  trigger?: React.ReactNode;
}

export function InviteDialog({ inviteLink, trigger }: InviteDialogProps) {
  const [copied, setCopied] = React.useState(false);

  const fullInviteLink = inviteLink ? `${INVITE_LINK}invite/${inviteLink}` : "";

  const handleCopy = () => {
    if (!fullInviteLink) return;
    navigator.clipboard.writeText(fullInviteLink);
    setCopied(true);
    toast.success("Invite link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || <Button variant="outline">Invite</Button>}
      </DialogTrigger>
      <DialogContent className="w-full max-w-lg bg-sidebar border-accent shadow-2xl rounded-2xl p-0 overflow-hidden gap-0">
        <div className="p-6 pb-4">
          <DialogHeader className="gap-1">
            <DialogTitle className="text-xl font-bold tracking-tight text-primary text-left">
              Invite to Project <Users2 className="inline w-5 h-5 ml-1"/>
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
              size="sm"
              onClick={handleCopy}
              disabled={!fullInviteLink}
              className={cn(
                "h-8 px-4 rounded-lg text-xs font-medium transition-all duration-200 active:scale-95 cursor-pointer",
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

          {/* Social Share Section */}
          <div className="space-y-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/60">
              Or send via
            </p>
            <div className="grid grid-cols-3 gap-3">
              <button className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl border border-accent/10 hover:bg-accent/5 transition-all duration-200 group active:scale-95 bg-card">
                <div className="w-10 h-10 flex items-center justify-center rounded-full bg-[#E01E5A]/5 group-hover:bg-[#E01E5A]/10 transition-colors">
                  {/* Slack Logo SVG Replacement for better look */}
                  <svg viewBox="0 0 122.8 122.8" className="w-5 h-5 fill-[#E01E5A]">
                    <path d="M25.8 77.6c0 7.1-5.7 12.8-12.8 12.8S.2 84.7.2 77.6s5.7-12.8 12.8-12.8h12.8v12.8zm6.4 0c0-7.1 5.7-12.8 12.8-12.8s12.8 5.7 12.8 12.8v32.3c0 7.1-5.7 12.8-12.8 12.8s-12.8-5.7-12.8-12.8V77.6zM45.2 25.8c-7.1 0-12.8-5.7-12.8-12.8S38.1.2 45.2.2s12.8 5.7 12.8 12.8v12.8H45.2zm0 6.4c7.1 0 12.8 5.7 12.8 12.8s-5.7 12.8-12.8 12.8H12.9C5.8 57.8.1 52.1.1 45c0-7.1 5.7-12.8 12.8-12.8h32.3zM97 45.2c0-7.1 5.7-12.8 12.8-12.8s12.8 5.7 12.8 12.8-5.7 12.8-12.8 12.8H97V45.2zm-6.4 0c0 7.1-5.7 12.8-12.8 12.8s-12.8-5.7-12.8-12.8V12.9c0-7.1 5.7-12.8 12.8-12.8s12.8 5.7 12.8 12.8v32.3zM77.6 97c7.1 0 12.8 5.7 12.8 12.8s-5.7 12.8-12.8 12.8-12.8-5.7-12.8-12.8V97h12.8zm0-6.4c-7.1 0-12.8-5.7-12.8-12.8s5.7-12.8 12.8-12.8h32.3c7.1 0 12.8 5.7 12.8 12.8s-5.7 12.8-12.8 12.8H77.6z"/>
                  </svg>
                </div>
                <span className="text-xs font-medium text-primary/70">Slack</span>
              </button>

              <button className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl border border-accent/10 hover:bg-accent/5 transition-all duration-200 group active:scale-95 bg-card">
                <div className="w-10 h-10 flex items-center justify-center rounded-full bg-[#25D366]/5 group-hover:bg-[#25D366]/10 transition-colors">
                  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-[#25D366]">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                </div>
                <span className="text-xs font-medium text-primary/70">WhatsApp</span>
              </button>

              <button className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl border border-accent/10 hover:bg-accent/5 transition-all duration-200 group active:scale-95 bg-card">
                <div className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-500/5 group-hover:bg-blue-500/10 transition-colors">
                  <Mail className="w-5 h-5 text-blue-500 fill-blue-500/10" />
                </div>
                <span className="text-xs font-medium text-primary/70">Email</span>
              </button>
            </div>
          </div>
        </div>

        <div className="bg-accent/5 px-6 py-4 flex items-center justify-between border-t border-accent/10">
           <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Link expires in 7 days</p>
           <button className="text-[10px] text-primary/40 font-bold hover:text-primary uppercase tracking-tight transition-colors">Generate new link</button>
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
