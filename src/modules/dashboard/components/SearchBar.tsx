"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Typewriter } from "react-simple-typewriter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Rocket, Wrench, ChevronUp, ArrowUp, UserSearch, Check, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const MODES = [
  {
    id: "Collaborate",
    label: "Find Projects to Collab",
    shortLabel: "Collab",
    icon: Rocket,
    placeholders: [
      "Web3 project needing UI/UX designer",
      "Python projects for beginners",
      "Full-stack projects in typescript",
    ],
  },
  {
    id: "Teammates",
    label: "Find Teammates or Builders",
    shortLabel: "Teammates",
    icon: UserSearch,
    placeholders: [
      "React developer open to weekend projects",
      "Designer with Web3 experience, available now",
      "Backend dev who knows Rust and wants to collab",
    ],
  },
  {
    id: "Discover",
    label: "Discover Products",
    shortLabel: "Discover",
    icon: Wrench,
    placeholders: [
      "AI healthcare projects",
      "AI native saas",
      "Web3 projects",
    ],
  },
];

export function CommunitySearchBar() {
  const [mode, setMode] = useState(MODES[0]);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const ActiveIcon = mode.icon;

  const handleQuery = () => {
    if (!query.trim()) {
      toast.info("Query can't be empty!");
      return;
    }
    router.push(
      `/dashboard/community?query=${encodeURIComponent(query)}&mode=${mode.id}`
    );
  };

  return (
    <div className="w-[580px] mx-auto">
      <div className="flex items-center gap-2 rounded-md bg-accent/10 dark:bg-[#111113] border border-border/40 px-4 py-1 focus-within:border-border/70 transition-colors">
        
        {/* QUERY INPUT */}
        <div className="relative flex-1 min-w-0">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleQuery()}
            className="h-7.5 border-0 bg-transparent shadow-none focus-visible:ring-0 px-4 pl-7 text-sm placeholder:text-transparent"
          />
          <Search className="h-3 w-3 opacity-50 absolute left-2 top-1/2 -translate-y-1/2" />
          {query.length === 0 && (
            <div className="pointer-events-none absolute left-8 top-1/2 -translate-y-1/2 text-xs text-primary/80">
              <Typewriter
                words={mode.placeholders}
                loop
                cursor
                cursorStyle="|"
                typeSpeed={60}
                deleteSpeed={40}
                delaySpeed={2000}
              />
            </div>
          )}
        </div>

        {/* DIVIDER */}
        <div className="w-px h-6 bg-accent shrink-0" />

        {/* MODE POPOVER */}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "flex items-center gap-1.5 rounded-[9px] px-3 h-[34px] text-xs font-medium",
                "bg-accent/20 border border-border/40 text-muted-foreground",
                "hover:bg-accent/40 hover:text-foreground hover:border-border/60",
                "transition-all flex-shrink-0",
                open && "bg-accent/40 text-foreground border-border/60"
              )}
            >
              <ActiveIcon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{mode.shortLabel}</span>
              <ChevronUp
                className={cn(
                  "h-3 w-3 opacity-50 transition-transform",
                  !open && "rotate-180"
                )}
              />
            </Button>
          </PopoverTrigger>

          <PopoverContent
            align="end"
            side="top"
            sideOffset={10}
            className="w-64 rounded-xl p-1.5"
          >
            <div className="flex flex-col gap-0.5">
              {MODES.map((m) => {
                const Icon = m.icon;
                const active = m.id === mode.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => { setMode(m); setOpen(false); }}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-md tracking-tight px-3 py-2.5 text-sm transition-colors",
                      active
                        ? "bg-accent/50 text-foreground"
                        : "text-muted-foreground hover:bg-accent/30 hover:text-foreground"
                    )}
                  >
                    <Icon className="h-3.5 w-3.5 flex-shrink-0" />
                    <span className="flex-1 text-left">{m.label}</span>
                    {active && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.15 }}
                      >
                        <Check className="h-3.5 w-3.5 text-primary" />
                      </motion.div>
                    )}
                  </button>
                );
              })}
            </div>
          </PopoverContent>
        </Popover>

        {/* SEND BUTTON */}
        <Button
          size="icon-sm"
          variant={'outline'}
          onClick={handleQuery}
          className=" flex-shrink-0"
        >
          <ArrowUp className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}