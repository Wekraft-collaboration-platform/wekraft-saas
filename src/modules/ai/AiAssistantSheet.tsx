"use client";

import { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Bot, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface AiAssistantSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AiAssistantSheet({
  open,
  onOpenChange,
}: AiAssistantSheetProps) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, onOpenChange]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[500px]! flex flex-col p-0 gap-0">
        <SheetHeader className="p-4 border-b bg-muted/30">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <SheetTitle className="text-base">Wekraft AI</SheetTitle>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge
                  variant="outline"
                  className="text-[10px] h-4 py-0 font-normal border-primary/20 bg-primary/5 text-primary"
                >
                  Pro Feature
                </Badge>
              </div>
            </div>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4"></div>
        </ScrollArea>

        <div className="p-4 border-t bg-background">
          <div className="relative">
            <Input
              placeholder="Ask anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter"}
              className="pr-10"
            />
            <Button
              size="icon"
              variant="ghost"
              className="absolute right-1 top-1 h-8 w-8"
              // onClick={}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-[10px] text-center text-muted-foreground mt-2">
            AI can make mistakes. Verify important information.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
