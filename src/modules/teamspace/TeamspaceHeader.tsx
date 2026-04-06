"use client";

import { Hash, Users, Pin, Bell, Search, Star, ChartBarIcon, MessageSquareText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface TeamspaceHeaderProps {
  title: string;
  memberCount?: number;
}

export function TeamspaceHeader({ title, memberCount = 1 }: TeamspaceHeaderProps) {
  return (
    <header className="h-14 border-b flex items-center px-4 justify-between bg-background/95 shrink-0">
      <div className="flex items-center gap-3 overflow-hidden">
        <div className="flex items-center gap-1.5 font-bold text-lg text-foreground truncate">
          <MessageSquareText className="h-5 w-5" />
          Teamspace
        </div>
        
        <Separator orientation="vertical" className="h-4" />
        
        <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground">
          <button className="flex items-center gap-1 hover:text-foreground transition-colors group">
            <Star className="h-3.5 w-3.5 group-hover:fill-yellow-400 group-hover:text-yellow-400" />
          </button>
          <div className="flex items-center gap-1 cursor-default">
            <Users className="h-3.5 w-3.5" />
            <span>{memberCount}</span>
          </div>
          <div className="flex items-center gap-1 hover:text-foreground transition-colors cursor-pointer hidden sm:flex">
            <Pin className="h-3.5 w-3.5" />
            <span>0 Pinned</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        <div className="relative group hidden md:block">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground group-focus-within:text-foreground transition-colors" />
          <input 
            type="text" 
            placeholder="Search messages..." 
            className="h-8 w-48 bg-muted/40 hover:bg-muted/60 focus:bg-background border-none rounded-md pl-7 text-xs transition-all focus:ring-1 focus:ring-ring outline-none"
          />
        </div>
      </div>
    </header>
  );
}
