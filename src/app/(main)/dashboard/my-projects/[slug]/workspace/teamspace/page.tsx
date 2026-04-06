"use client";

import { use, useEffect, useRef } from "react";
import { useTeamspace } from "@/providers/TeamspaceProvider";
import { MessageSquare } from "lucide-react";
import { useTeamspaceChat } from "@/hooks/useTeamspaceChat";
import { ChatInput } from "@/modules/teamspace/ChatInput";
import { MessageBubble } from "@/modules/teamspace/MessageBubble";

export default function TeamspacePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { setActiveChannelId } = useTeamspace();
  const { slug } = use(params);
  const projectId = slug;

  useEffect(() => {
    setActiveChannelId(projectId);
    return () => setActiveChannelId(null);
  }, [projectId, setActiveChannelId]);

  const { messages, isLoadingHistory } = useTeamspaceChat(projectId);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages length changes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length]);

  return (
    <div className="flex flex-col h-full bg-background relative">
      <div className="h-14 border-b flex items-center px-4 shrink-0 shadow-sm z-10 text-muted-foreground bg-background/95 backdrop-blur">
        <MessageSquare className="h-5 w-5 mr-2" />
        <h3 className="font-semibold text-foreground">Project Teamspace</h3>
      </div>
      
      {/* Messages List Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 flex flex-col pt-8"
      >
        {messages.length === 0 && !isLoadingHistory && (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground mt-auto mb-auto">
             <MessageSquare className="h-12 w-12 opacity-20 mb-4" />
             <p>This is the start of the Teamspace.</p>
             <p className="text-sm">Send a message to get things going!</p>
          </div>
        )}

        {isLoadingHistory && messages.length === 0 && (
          <div className="text-center text-sm text-muted-foreground my-8">Loading chat history...</div>
        )}

        <div className="space-y-4 max-w-4xl mx-auto w-full">
          {messages.map((message) => (
             <MessageBubble key={message.id} message={message} />
          ))}
        </div>
      </div>
      
      {/* Input Area */}
      <div className="p-4 bg-background shrink-0 pb-6 max-w-4xl mx-auto w-full">
        <ChatInput />
      </div>
    </div>
  );
}
