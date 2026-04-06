"use client";

import { useState } from "react";
import { useTeamspace } from "@/providers/TeamspaceProvider";
import { useTeamspaceChat } from "@/hooks/useTeamspaceChat";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function ChatInput() {
  const { activeChannelId } = useTeamspace();
  const [text, setText] = useState("");
  
  // Notice that we pass activeChannelId to useTeamspaceChat
  // If activeChannelId is null, useTeamspaceChat handles it gracefully
  const { sendMessage, isSending } = useTeamspaceChat(activeChannelId);

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
    <form 
      onSubmit={handleSubmit} 
      className="flex gap-2 items-end bg-background p-2 border rounded-xl shadow-sm focus-within:ring-1 focus-within:ring-ring relative"
    >
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={activeChannelId ? "Type a message..." : "Connecting to Teamspace..."}
        className="min-h-[44px] max-h-32 resize-none border-0 focus-visible:ring-0 shadow-none py-3"
        rows={1}
        disabled={!activeChannelId}
      />
      <div className="flex shrink-0 pb-1 pr-1">
        <Button 
          type="submit" 
          size="icon" 
          disabled={!text.trim() || isSending || !activeChannelId}
          className="rounded-lg h-8 w-8"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}
