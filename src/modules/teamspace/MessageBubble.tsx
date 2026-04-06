"use client";

import MDEditor from "@uiw/react-md-editor";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MoreHorizontal, Reply, Smile, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MessageBubbleProps {
  message: {
    id: string;
    senderId: string;
    text: string;
    createdAt: number;
  };
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const avatarFallback = message.senderId.slice(0, 2).toUpperCase();
  const timestamp = format(new Date(message.createdAt), "h:mm a");

  return (
    <div className="group flex gap-4 hover:bg-muted/40 px-4 py-2 transition-colors relative">
      <Avatar className="h-10 w-10 shrink-0 rounded-lg overflow-hidden border border-border/10 shadow-sm mt-1">
        <AvatarImage src={`https://avatar.vercel.sh/${message.senderId}`} />
        <AvatarFallback className="rounded-lg bg-primary/10 text-primary text-xs font-bold">
          {avatarFallback}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex flex-col flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-bold text-[15px] leading-tight hover:underline cursor-pointer decoration-2 underline-offset-2">
            User {message.senderId.substring(5, 10)} 
          </span>
          <span className="text-[11px] font-medium text-muted-foreground/60">
            {timestamp}
          </span>
        </div>
        
        <div className="text-[15px] text-foreground/90 leading-relaxed break-words">
           <MDEditor.Markdown 
              source={message.text}
              style={{ 
                backgroundColor: 'transparent', 
                fontSize: '15px',
                color: 'inherit',
              }} 
              className="prose prose-invert prose-sm max-w-none !bg-transparent"
            />
        </div>
      </div>

      {/* Floating Action Menu */}
      <div className="absolute right-4 top-2 opacity-0 group-hover:opacity-100 transition-all transform translate-y-1 group-hover:translate-y-0 flex items-center gap-1 bg-background border border-border/50 rounded-lg p-0.5 shadow-xl z-10 backdrop-blur-sm">
        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10 hover:text-primary">
          <Smile className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10 hover:text-primary">
          <Reply className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10 hover:text-primary">
          <Star className="h-4 w-4" />
        </Button>
        <div className="w-[1px] h-4 bg-border mx-0.5" />
        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
