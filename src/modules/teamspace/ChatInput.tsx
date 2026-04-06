"use client";

import { useState, useRef, useEffect } from "react";
import { useTeamspace } from "@/providers/TeamspaceProvider";
import { useTeamspaceChat } from "@/hooks/useTeamspaceChat";
import { Send, Plus, Smile, AtSign, Paperclip, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export function ChatInput() {
  const { activeChannelId } = useTeamspace();
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const { sendMessage, isSending } = useTeamspaceChat(activeChannelId);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "inherit";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [text]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!text.trim() || isSending || !activeChannelId) return;

    try {
      await sendMessage({ text: text.trim() });
      setText("");
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex flex-col w-full pb-3 px-4">
      <form 
        onSubmit={handleSubmit} 
        className={cn(
          "relative flex flex-col bg-muted/30 border border-border/40 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-ring focus-within:border-transparent transition-all shadow-sm",
          !activeChannelId && "opacity-60 grayscale cursor-not-allowed pointer-events-none"
        )}
      >
        <div className="flex items-center px-1 pt-1 h-9 gap-1 border-b border-border/10">
          <Button type="button" size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-foreground">
            <Plus className="h-4 w-4" />
          </Button>
          <Separator orientation="vertical" className="h-3" />
          <Button type="button" size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-foreground">
            <AtSign className="h-3.5 w-3.5" />
          </Button>
          <Button type="button" size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-foreground">
            <Smile className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-end px-3 py-2 gap-2">
          <Textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={activeChannelId ? "Write a message..." : "Connecting to Teamspace..."}
            className="min-h-[3.5rem] max-h-[300px] flex-1 resize-none bg-transparent border-0 focus-visible:ring-0 shadow-none px-0 py-2.5 text-[15px] scrollbar-none"
            rows={1}
            disabled={!activeChannelId}
          />
          
          <div className="flex items-center gap-1.5 pb-1">
             <Button 
                type="button" 
                size="icon" 
                variant="ghost" 
                className="h-8 w-8 text-muted-foreground hover:text-primary transition-colors"
                disabled={!activeChannelId}
             >
                <Paperclip className="h-4 w-4" />
             </Button>
             <Button 
                type="submit" 
                size="icon" 
                className="h-8 w-8 rounded-lg bg-primary text-primary-foreground shadow-md hover:scale-105 active:scale-95 transition-transform"
                disabled={!text.trim() || isSending || !activeChannelId}
              >
                <Send className="h-4 w-4" />
              </Button>
          </div>
        </div>
      </form>
      <div className="mt-2 text-[10px] text-muted-foreground/40 text-center uppercase tracking-widest font-semibold flex items-center justify-center gap-2">
         <span>Markdown supported</span>
         <span className="h-1 w-1 rounded-full bg-border" />
         <span>Enter to send</span>
      </div>
    </div>
  );
}

function Separator({ orientation, className }: { orientation: "vertical"; className?: string }) {
  return <div className={cn("bg-border", orientation === "vertical" ? "w-[1px]" : "h-[1px]", className)} />;
}
