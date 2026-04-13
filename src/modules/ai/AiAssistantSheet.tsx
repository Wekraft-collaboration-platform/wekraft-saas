"use client";

import { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Bot,
  MessagesSquare,
  Send,
  Settings2,
  Loader2,
  Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useStream } from "@langchain/react";

interface AiAssistantSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AiAssistantSheet({
  open,
  onOpenChange,
}: AiAssistantSheetProps) {
  const [input, setInput] = useState("");

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };

    // const handleSend = async() {

    // }

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, onOpenChange]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-[500px] flex flex-col p-0 gap-0 h-full"
      >
        {/* HEADER */}
        <SheetHeader className="px-4 py-5 border-b bg-card ">
          <div className="flex items-center justify-between pr-10 gap-5">
            <SheetTitle className="flex items-center gap-2 text-lg font-pop font-semibold">
              <Bot className="w-5 h-5 text-blue-500" />
              Roxo AI
            </SheetTitle>
            <div className="flex items-center gap-4">
              <Button size="sm" variant="outline" className="text-[10px]">
                Config <Settings2 className="h-3 w-3" />
              </Button>
              <Button size="sm" variant="outline" className="text-[10px]">
                Visit space <MessagesSquare className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1 p-4 h-full"></ScrollArea>

        {/* ---------FOOTER--------- */}
        <div className="px-4 py-6 bg-linear-to-b from-transparent to-blue-500/15">
          <div className="relative">
            <Input
              placeholder="Ask anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              // onKeyDown={(e) => {
              //   if (e.key === "Enter") handleSend();
              // }}
              disabled={status === "inflight"}
              className="h-12 rounded-xl !bg-neutral-950"
            />
            <Button
              size="icon"
              variant="outline"
              className="absolute right-2 top-2 h-8 w-8"
              // onClick={handleSend}
              disabled={status === "inflight"}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-[10px] text-center text-muted-foreground mt-2">
            Roxo is personal PM agent.{" "}
            <span className="text-blue-500 cursor-pointer">
              Click to configure
            </span>
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
