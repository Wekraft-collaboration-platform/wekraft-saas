/**
 * DeleteChannelDialog.tsx
 * 
 * Confirmation dialog for deleting a channel.
 * 
 * Features:
 * - Warning about permanent data loss.
 * - Disables the default channel from being deleted (handled in parent).
 * 
 * Integration:
 * - Calls the `onConfirm` callback passed from `ChannelsSidebar`.
 */
"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertTriangle, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Channel } from "./hooks/useChannels";
import { useEffect } from "react";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onConfirm: () => Promise<void>;
  channel: Channel | null;
}

export function DeleteChannelDialog({ open, onOpenChange, onConfirm, channel }: Props) {
  const [loading, setLoading] = useState(false);
  const [confirmName, setConfirmName] = useState("");

  useEffect(() => {
    if (!open) {
      setConfirmName("");
    }
  }, [open]);

  async function handleConfirm() {
    setLoading(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] border-border/40 bg-background/95 backdrop-blur-xl shadow-2xl overflow-hidden p-0 dark">
        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-destructive/40 via-destructive to-destructive/40" />

        <div className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center">
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              >
                <AlertTriangle className="w-6 h-6 text-destructive" />
              </motion.div>
            </div>
            <div>
              <DialogTitle className="text-xl font-bold tracking-tight mb-1">
                Delete Channel
              </DialogTitle>
              <DialogDescription className="text-muted-foreground/80 font-medium">
                This action is permanent and cannot be undone.
              </DialogDescription>
            </div>
          </div>

          <div className="bg-accent/40 rounded-2xl p-4 border border-border/40 mb-6">
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              Are you sure you want to delete <span className="text-foreground font-bold italic">#{channel?.name}</span>? 
              All messages and attachments in this channel will be purged from our servers.
            </p>
            
            <div className="space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/60">
                To confirm, type <span className="text-foreground select-none">"{channel?.name}"</span> below:
              </p>
              <Input
                value={confirmName}
                onChange={(e) => setConfirmName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && confirmName === channel?.name && !loading) {
                    handleConfirm();
                  }
                }}
                onPaste={(e) => e.preventDefault()}
                placeholder="Enter channel name"
                className="bg-background/50 border-border/60 focus:border-destructive/40 focus:ring-destructive/10 h-10"
                autoComplete="off"
              />
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              variant="destructive"
              className="w-full h-11 text-sm font-bold shadow-lg shadow-destructive/20 hover:shadow-destructive/40 transition-all duration-300 group"
              onClick={handleConfirm}
              disabled={loading || confirmName !== channel?.name}
            >
              <Trash2 className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
              {loading ? "Deleting Channel..." : "Delete Permanently"}
            </Button>
            <Button
              variant="ghost"
              className="w-full h-11 text-sm font-semibold hover:bg-accent/50 transition-colors"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </div>

        {/* Dynamic background element */}
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-destructive/5 rounded-full blur-3xl pointer-events-none" />
      </DialogContent>
    </Dialog>
  );
}
