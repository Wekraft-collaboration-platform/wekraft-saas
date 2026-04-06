"use client";

import { use, useEffect, useRef } from "react";
import { useTeamspace } from "@/providers/TeamspaceProvider";
import { MessageSquare, Hash } from "lucide-react";
import { useTeamspaceChat } from "@/hooks/useTeamspaceChat";
import { ChatInput } from "@/modules/teamspace/ChatInput";
import { MessageBubble } from "@/modules/teamspace/MessageBubble";

export default function TeamspaceChannelPage({
  params,
}: {
  params: Promise<{ slug: string; channelId: string }>;
}) {
  const { setActiveChannelId } = useTeamspace();
  const { slug, channelId } = use(params);

  useEffect(() => {
    setActiveChannelId(channelId);
    return () => setActiveChannelId(null);
  }, [channelId, setActiveChannelId]);

  const { messages, isLoadingHistory } = useTeamspaceChat(channelId);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length]);

  return (
    <div className="flex flex-col h-full bg-background relative">
      <div className="h-14 border-b flex items-center px-4 shrink-0 shadow-sm z-10 text-muted-foreground bg-background/95 backdrop-blur">
        <Hash className="h-5 w-5 mr-2" />
        <h3 className="font-semibold text-foreground">Channel: {channelId}</h3>
      </div>
      
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 flex flex-col pt-8"
      >
        {messages.length === 0 && !isLoadingHistory && (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground mt-auto mb-auto">
             <MessageSquare className="h-12 w-12 opacity-20 mb-4" />
             <p>This is the start of the #{channelId} channel.</p>
          </div>
        )}

        {isLoadingHistory && messages.length === 0 && (
          <div className="text-center text-sm text-muted-foreground my-8">Loading history...</div>
        )}

        <div className="space-y-4 max-w-4xl mx-auto w-full">
          {messages.map((message) => (
             <MessageBubble key={message.id} message={message} />
          ))}
        </div>
      </div>
      
      <div className="p-4 bg-background shrink-0 pb-6 max-w-4xl mx-auto w-full">
        <ChatInput />
      </div>
    </div>
  );
}
