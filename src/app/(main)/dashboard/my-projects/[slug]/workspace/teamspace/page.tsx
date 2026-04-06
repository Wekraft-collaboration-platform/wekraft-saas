"use client";

import { use, useEffect, useRef } from "react";
import { TeamspaceProvider, useTeamspace } from "@/providers/TeamspaceProvider";
import { MessageSquare } from "lucide-react";
import { useTeamspaceChat } from "@/hooks/useTeamspaceChat";
import { ChatInput } from "@/modules/teamspace/ChatInput";
import { MessageBubble } from "@/modules/teamspace/MessageBubble";
import { useQuery as useConvexQuery } from "convex/react";
import { api } from "../../../../../../../../convex/_generated/api";
import { TeamspaceHeader } from "@/modules/teamspace/TeamspaceHeader";

export default function TeamspacePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <div className="h-full flex flex-col">
      <TeamspacePageInner params={params} />
    </div>
  );
}

function TeamspacePageInner({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { setActiveProjectId } = useTeamspace();
  const { slug } = use(params);
  const project = useConvexQuery(api.project.getProjectBySlug, { slug });

  useEffect(() => {
    if (project?._id) {
      setActiveProjectId(project._id);
    }
  }, [project?._id, setActiveProjectId]);

  const { messages, isLoadingHistory } = useTeamspaceChat(project?._id ?? null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages length changes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length]);

  return (
    <div className="flex flex-col h-full bg-background relative overflow-hidden">
      {/* Header section - Locked */}
      <div className="flex-none">
        <TeamspaceHeader 
          title={project?.projectName || "Teamspace"} 
          memberCount={1} 
        />
      </div>
      
      {/* Messages Area - Dynamic & Scrollable */}
      <div 
        ref={scrollRef}
        className="flex-1 min-h-0 overflow-y-auto scrollbar-thin scrollbar-thumb-border/40 hover:scrollbar-thumb-border/60"
      >
        <div className="flex flex-col h-full">
           {messages.length === 0 && !isLoadingHistory && (
            <div className="flex-1 flex flex-col items-start justify-end p-8 max-w-4xl mx-auto w-full pb-12">
               <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 shadow-inner">
                  <MessageSquare className="h-10 w-10 text-primary opacity-80" />
               </div>
               <h1 className="text-4xl font-bold tracking-tight mb-2">Welcome to your Teamspace</h1>
               <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
                  This is the heart of <strong>{project?.projectName}</strong>. 
                  Share updates, collaborate on logic, and keep your team in sync. 
                  Everything sent here is archived and searchable.
               </p>
               <div className="mt-8 flex gap-3">
                  <div className="px-3 py-1.5 rounded-full bg-muted/60 text-xs font-semibold border border-border/50 text-muted-foreground flex items-center gap-2">
                     <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                     Real-time sync active
                  </div>
               </div>
            </div>
          )}

          {isLoadingHistory && messages.length === 0 && (
            <div className="flex-1 flex flex-col items-start justify-end p-8 max-w-4xl mx-auto w-full pb-12">
              <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 shadow-inner">
                <MessageSquare className="h-10 w-10 text-primary opacity-40" />
              </div>
              <div className="h-9 w-72 rounded-lg bg-muted/60 animate-pulse mb-3" />
              <div className="h-4 w-96 rounded-md bg-muted/40 animate-pulse mb-2" />
              <div className="h-4 w-80 rounded-md bg-muted/40 animate-pulse mb-8" />
              <div className="h-7 w-36 rounded-full bg-muted/40 animate-pulse" />
            </div>
          )}

          <div className="py-6 flex flex-col justify-end">
            <div className="max-w-screen-xl mx-auto w-full px-4">
              {messages.map((message) => (
                 <MessageBubble key={message.id} message={message} />
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Input Area - Locked Footor */}
      <div className="flex-none bg-background border-t border-border/50 pt-3 pb-1 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] z-10">
        <ChatInput />
      </div>
    </div>
  );
}
