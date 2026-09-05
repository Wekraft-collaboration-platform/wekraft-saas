"use client";

import {
  Check,
  Copy,
  ExternalLink,
  Globe,
  Linkedin,
  MessageSquare,
  Share2,
  Twitter,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ShareProjectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  projectSlug: string;
}

export function ShareProjectDialog({
  isOpen,
  onClose,
  projectSlug,
}: ShareProjectDialogProps) {
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setShareUrl(`${window.location.origin}/projects/${projectSlug}`);
    }
  }, [projectSlug]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Public project link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (_err) {
      toast.error("Failed to copy link. Please try again.");
    }
  };

  const handleShare = (platform: "twitter" | "linkedin" | "whatsapp") => {
    let url = "";
    const text = `Check out my project on WeKraft! 🚀\n`;

    if (platform === "twitter") {
      url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`;
    } else if (platform === "linkedin") {
      url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    } else if (platform === "whatsapp") {
      url = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${text} ${shareUrl}`)}`;
    }

    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-sidebar border border-border shadow-2xl rounded-2xl p-5 overflow-hidden">

        <DialogHeader className="space-y-3 relative z-10">
          <div className="mx-auto sm:mx-0 w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/25 flex items-center justify-center">
            <Share2 className="w-5 h-5 animate-pulse" />
          </div>
          <DialogTitle className="text-xl font-bold tracking-tight text-zinc-100 flex items-center gap-2">
            Share Project Showcase
          </DialogTitle>
          <DialogDescription className="text-sm text-zinc-400 leading-relaxed">
            Invite others to view your public project profile, upvotes, language
            breakdown, and repository health dashboard.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6 space-y-5 relative z-10">
          {/* Link input group */}
          <div className="space-y-2">
            <label
              htmlFor="project-showcase-url"
              className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5"
            >
              <Globe className="w-3.5 h-3.5 text-zinc-400" />
              Public Showcase URL
            </label>
            <div className="flex items-center gap-2 bg-zinc-900/60 border border-zinc-800 rounded-xl p-1.5 pl-3.5 transition-all duration-200 focus-within:border-indigo-500/50 focus-within:bg-zinc-900">
              <input
                id="project-showcase-url"
                type="text"
                readOnly
                value={shareUrl}
                className="w-full bg-transparent border-0 outline-hidden text-sm text-zinc-200 placeholder-zinc-500 select-all"
              />
              <Button
                size="sm"
                variant={copied ? "default" : "secondary"}
                onClick={handleCopy}
                className={`rounded-lg px-4 h-9 font-medium text-xs transition-all duration-200 shrink-0 ${
                  copied
                    ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/10"
                    : "bg-blue-600 hover:bg-blue-500 text-white shadow-indigo-600/10"
                }`}
              >
                {copied ? (
                  <span className="flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    Copied
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <Copy className="w-3.5 h-3.5" />
                    Copy
                  </span>
                )}
              </Button>
            </div>
          </div>

          {/* Social shares */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Quick Share
            </h4>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleShare("twitter")}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-medium hover:bg-zinc-800 hover:text-white transition-all duration-200 group"
              >
                <Twitter className="w-4 h-4 text-sky-400 group-hover:scale-110 transition-transform" />
                Twitter
              </button>
              <button
                type="button"
                onClick={() => handleShare("linkedin")}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-medium hover:bg-zinc-800 hover:text-white transition-all duration-200 group"
              >
                <Linkedin className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
                LinkedIn
              </button>
              <button
                type="button"
                onClick={() => handleShare("whatsapp")}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-medium hover:bg-zinc-800 hover:text-white transition-all duration-200 group"
              >
                <MessageSquare className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                WhatsApp
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-zinc-800/80 flex items-center justify-between relative z-10">
          <a
            href={shareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 hover:underline transition-all font-medium"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Open live page
          </a>
          <Button
            size="sm"
            variant="ghost"
            onClick={onClose}
            className="text-xs font-medium text-zinc-400 hover:text-zinc-200"
          >
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
