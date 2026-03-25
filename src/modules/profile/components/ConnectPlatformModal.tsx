"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronRight, ArrowLeft, Loader2, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { PLATFORM_REGISTRY, type PlatformConfig } from "@/modules/profile/config/platforms";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ConnectPlatformModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConnect: (url: string) => void;
  isLoading: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ConnectPlatformModal({
  open,
  onOpenChange,
  onConnect,
  isLoading,
}: ConnectPlatformModalProps) {
  const [selected, setSelected] = React.useState<PlatformConfig | null>(null);
  const [url, setUrl] = React.useState("");

  const reset = () => { setSelected(null); setUrl(""); };

  const handleOpenChange = (val: boolean) => {
    onOpenChange(val);
    if (!val) reset();
  };

  const handleConnect = () => {
    const trimmed = url.trim();
    if (!trimmed) return;
    onConnect(trimmed);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden border-none shadow-2xl bg-[#0F0F0F]">
        <DialogHeader className="p-6 pb-2 border-b border-white/5">
          <div className="flex items-center gap-3">
            {selected && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 text-muted-foreground hover:text-white hover:bg-white/5"
                onClick={reset}
                aria-label="Go back"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <div>
              <DialogTitle className="text-base font-bold tracking-tight text-white uppercase">
                {selected ? `Connect ${selected.name}` : "Connect Platform"}
              </DialogTitle>
              {!selected && (
                <DialogDescription className="text-zinc-500 text-xs mt-0.5">
                  Select a platform to showcase your stats.
                </DialogDescription>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="p-4 max-h-[70vh] overflow-y-auto no-scrollbar">
          {!selected ? (
            /* ── Platform List — auto-generated from registry ── */
            <div className="space-y-0.5" role="listbox" aria-label="Available platforms">
              {PLATFORM_REGISTRY.map((platform) => (
                <button
                  key={platform.id}
                  role="option"
                  aria-selected={false}
                  onClick={() => setSelected(platform)}
                  className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors group text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center shrink-0", platform.color)}>
                      <platform.icon className="h-5 w-5" aria-hidden />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-zinc-100">{platform.name}</p>
                      <p className="text-[11px] text-zinc-500">{platform.description}</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-zinc-700 group-hover:text-zinc-400 transition-colors shrink-0" aria-hidden />
                </button>
              ))}
            </div>
          ) : (
            /* ── URL Input ── */
            <div className="p-4 space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5">
                <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center shrink-0", selected.color)}>
                  <selected.icon className="h-6 w-6" aria-hidden />
                </div>
                <div>
                  <p className="font-semibold text-white">{selected.name}</p>
                  <p className="text-xs text-zinc-500">Paste your profile URL below</p>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="platform-url" className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                  Profile URL
                </label>
                <Input
                  id="platform-url"
                  placeholder={selected.placeholder}
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleConnect()}
                  className="bg-black/50 border-white/10 h-11 focus-visible:ring-primary/50 text-sm"
                  autoFocus
                  autoComplete="off"
                  spellCheck={false}
                />
                <p className="text-[10px] text-zinc-600 italic">e.g. {selected.placeholder}</p>
              </div>

              <div className="flex flex-col gap-3">
                <Button
                  className="w-full h-11 font-bold"
                  disabled={!url.trim() || isLoading}
                  onClick={handleConnect}
                >
                  {isLoading
                    ? <Loader2 className="animate-spin h-4 w-4 mr-2" aria-hidden />
                    : <Globe className="h-4 w-4 mr-2" aria-hidden />}
                  Connect {selected.name}
                </Button>
                <p className="text-[10px] text-center text-zinc-600">
                  Only your public profile data will be used.
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
