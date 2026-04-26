"use client";

import { Check, BarChart2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Poll } from "./hooks/useMessages";

interface PollBlockProps {
  poll: Poll;
  messageId: string;
  currentUserId: string;
  onVote: (messageId: string, optionId: string) => void;
}

export function PollBlock({ poll, messageId, currentUserId, onVote }: PollBlockProps) {
  // If no options, don't render (shouldn't happen)
  if (!poll.options || poll.options.length === 0) return null;

  const totalVotes = poll.votes?.length || 0;
  
  // Calculate unique voters (since one user can vote for multiple options)
  const uniqueVoters = new Set<string>();
  poll.votes?.forEach(vote => uniqueVoters.add(vote.user_id));

  return (
    <div className="w-full min-w-[280px] max-w-[320px] bg-background/95 backdrop-blur-sm border border-border/80 rounded-2xl overflow-hidden mt-1 shadow-sm">
      <div className="p-3.5 pb-2.5 flex items-start gap-2.5">
        <BarChart2 className="h-5 w-5 mt-0.5 text-primary shrink-0" />
        <p className="text-sm font-bold text-foreground leading-snug">{poll.question}</p>
      </div>
      
      <div className="p-2 space-y-1.5">
        {poll.options.map((option) => {
          const optionVotes = poll.votes?.filter(v => v.option_id === option.id) || [];
          const votesCount = optionVotes.length;
          const percentage = totalVotes > 0 ? Math.round((votesCount / totalVotes) * 100) : 0;
          const isSelected = optionVotes.some(v => v.user_id === currentUserId);
          
          return (
            <div 
              key={option.id}
              onClick={() => onVote(messageId, option.id)}
              className="relative group cursor-pointer overflow-hidden rounded-xl border border-border/40 bg-accent/20 hover:bg-accent/40 transition-colors"
            >
              {/* Progress Bar Background */}
              <div 
                className={cn(
                  "absolute inset-0 transition-all duration-700 ease-out origin-left",
                  isSelected ? "bg-primary/15" : "bg-primary/5 group-hover:bg-primary/10"
                )}
                style={{ width: `${percentage}%` }}
              />
              
              <div className="relative flex items-center justify-between p-2.5 z-10 min-h-[44px]">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={cn(
                    "h-5 w-5 shrink-0 flex items-center justify-center transition-colors border-2 shadow-sm",
                    poll.allowMultiple ? "rounded-md" : "rounded-full",
                    isSelected 
                      ? "bg-primary border-primary text-primary-foreground" 
                      : "border-muted-foreground/40 bg-background/80 group-hover:border-primary/40"
                  )}>
                    {isSelected && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                  </div>
                  <span className={cn(
                    "text-sm font-medium truncate",
                    isSelected ? "text-foreground" : "text-foreground/80"
                  )}>
                    {option.text}
                  </span>
                </div>
                
                {votesCount > 0 && (
                  <div className="flex items-center gap-3 ml-3 shrink-0">
                    <span className={cn(
                      "text-[11px] font-bold tabular-nums",
                      isSelected ? "text-primary" : "text-muted-foreground"
                    )}>
                      {votesCount} {votesCount === 1 ? 'vote' : 'votes'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="px-3.5 py-2.5 bg-accent/20 border-t border-border/40 flex items-center justify-between">
        <span className="text-[11px] text-muted-foreground/80 font-semibold tracking-wide uppercase">
          {uniqueVoters.size} {uniqueVoters.size === 1 ? "vote" : "votes"}
        </span>
        {poll.allowMultiple && (
          <span className="text-[10px] text-muted-foreground/60 font-medium">Multiple answers allowed</span>
        )}
      </div>
    </div>
  );
}
