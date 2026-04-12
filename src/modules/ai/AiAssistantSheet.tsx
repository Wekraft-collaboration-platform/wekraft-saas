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

  // Use Langchain's native stream integration that automatically handles the thread, events, & states.
  const { messages, submit, isLoading, interrupt } = useStream({
    assistantId: "",
    apiUrl: "http://localhost:3000/api/chat",
  });

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

  const handleSend = () => {
    if (!input.trim()) return;
    submit({ messages: [{ role: "user", content: input }] });
    setInput("");
  };

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

        <ScrollArea className="flex-1 p-4 h-full">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-sm">
              empty state
            </div>
          ) : (
            <div className="flex flex-col gap-4 pb-4">
              {messages.map((msg: any, i: number) => (
                <div
                  key={i}
                  className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                >
                  <div
                    className={`p-3 rounded-2xl max-w-[85%] text-sm ${msg.role === "user" ? "bg-blue-600 text-white" : "bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100"}`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}

              {/* Active Tool Calls (Subagents) Loader */}
              {/* {isLoading &&
                toolCalls &&
                toolCalls.map((t: any) => (
                  <div
                    key={t.id || t.call?.name}
                    className="flex items-center gap-2 text-xs text-muted-foreground ml-2"
                  >
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Running subagent: {t.call?.name ?? "tool"}...
                  </div>
                ))} */}

              {/* Interrupt / Human in the loop Requests */}
              {/* {interrupt && (
                <div className="flex flex-col gap-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl mt-2">
                  <p className="text-sm font-medium text-blue-500 font-pop">
                    ROXO needs approval to run:{" "}
                    <span className="font-mono text-xs">
                      {interrupt.value?.action_requests?.[0]?.name ??
                        "Write tool"}
                    </span>
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="w-full bg-blue-600 hover:bg-blue-700 h-8 text-xs"
                      onClick={() => submit({ command: { resume: "approve" } })}
                    >
                      <Play className="w-3 h-3 mr-2" /> Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full h-8 text-xs"
                      onClick={() => submit({ command: { resume: "reject" } })}
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              )} */}
            </div>
          )}
        </ScrollArea>

        {/* ---------FOOTER--------- */}
        <div className="px-4 py-6 bg-linear-to-b from-transparent to-blue-500/15">
          <div className="relative">
            <Input
              placeholder="Ask anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSend();
              }}
              disabled={status === "inflight"}
              className="h-12 rounded-xl !bg-neutral-950"
            />
            <Button
              size="icon"
              variant="outline"
              className="absolute right-2 top-2 h-8 w-8"
              onClick={handleSend}
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
