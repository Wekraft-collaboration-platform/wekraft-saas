"use client";

import MDEditor from "@uiw/react-md-editor";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface MessageBubbleProps {
  message: {
    id: string;
    senderId: string;
    text: string;
    createdAt: number;
    // We will expand these types later for Users/Polls etc
  };
}

export function MessageBubble({ message }: MessageBubbleProps) {
  // Temporary: we don't have user profiles joined to the messages query yet,
  // so we'll use a placeholder or substring of senderId
  const avatarFallback = message.senderId.slice(0, 2).toUpperCase();

  return (
    <div className="group flex gap-3 hover:bg-muted/30 p-2 -mx-2 rounded-md transition-colors">
      <Avatar className="h-9 w-9 shrink-0 mt-0.5">
        {/* Placeholder avatar logic */}
        <AvatarImage src={`https://avatar.vercel.sh/${message.senderId}`} />
        <AvatarFallback>{avatarFallback}</AvatarFallback>
      </Avatar>
      
      <div className="flex flex-col flex-1 min-w-0">
        <div className="flex items-baseline gap-2 mb-0.5">
          <span className="font-semibold text-sm truncate">
             {/* Fetching actual names happens in backend later, using Sender ID for now */}
            User {message.senderId.substring(5, 10)} 
          </span>
          <span className="text-xs text-muted-foreground">
            {format(new Date(message.createdAt), "h:mm a")}
          </span>
        </div>
        
        {/* Safe Markdown rendering */}
        <div data-color-mode="light" className="text-sm prose prose-sm max-w-none">
           <MDEditor.Markdown 
              source={message.text}
              style={{ backgroundColor: 'transparent', fontSize: '14px' }} 
            />
        </div>

        {/* We will add Poll UI or Task Links here if message.type !== 'text' */}
      </div>

      {/* Action menu (Reply, React, More) surfaces on hover */}
      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-start gap-1">
        {/* Buttons go here */}
      </div>
    </div>
  );
}
