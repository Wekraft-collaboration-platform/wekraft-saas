"use client";

import { useState, useRef, useEffect } from "react";
import { useTeamspace } from "@/providers/TeamspaceProvider";
import { useTeamspaceChat } from "@/hooks/useTeamspaceChat";
import { Send, Plus, Smile, AtSign, Paperclip, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export function ChatInput() {
  const { activeProjectId } = useTeamspace();
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const { sendMessage, isSending } = useTeamspaceChat(activeProjectId);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "0px";
      const scrollHeight = textarea.scrollHeight;
      textarea.style.height = `${Math.max(56, Math.min(scrollHeight, 200))}px`;
    }
  }, [text]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!text.trim() || isSending || !activeProjectId) return;

    try {
      await sendMessage({ text: text.trim() });
      setText("");
      // Reset height manually after clear
      if (textareaRef.current) textareaRef.current.style.height = "56px";
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
          !activeProjectId && "opacity-60 grayscale cursor-not-allowed pointer-events-none"
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
            placeholder={activeProjectId ? "Write a message..." : "Connecting to Teamspace..."}
            className="flex-1 resize-none bg-transparent border-0 focus-visible:ring-0 shadow-none px-0 py-2.5 text-[15px] scrollbar-thin scrollbar-thumb-border/40"
            rows={1}
            disabled={!activeProjectId}
          />
          
          <div className="flex items-center gap-1.5 pb-1">
             <Button 
                type="button" 
                size="icon" 
                variant="ghost" 
                className="h-8 w-8 text-muted-foreground hover:text-primary transition-colors"
                disabled={!activeProjectId}
             >
                <Paperclip className="h-4 w-4" />
             </Button>
             <Button 
                type="submit" 
                size="icon" 
                className="h-8 w-8 rounded-lg bg-primary text-primary-foreground shadow-md hover:scale-105 active:scale-95 transition-transform"
                disabled={!text.trim() || isSending || !activeProjectId}
              >
                <Send className="h-4 w-4" />
              </Button>
          </div>
        </div>
      </form>
    
    </div>
  );
}

function Separator({ orientation, className }: { orientation: "vertical"; className?: string }) {
  return <div className={cn("bg-border", orientation === "vertical" ? "w-[1px]" : "h-[1px]", className)} />;
}
