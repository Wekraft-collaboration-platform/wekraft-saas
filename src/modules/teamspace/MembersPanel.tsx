"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import Ably from "ably";
import { cn } from "@/lib/utils";
import { Users } from "lucide-react";

interface PresenceMember {
  clientId: string;
  data: { userId: string; userName: string };
}

interface Props {
  projectId: string;
  channelId: string | null;
}

let ablyClient: Ably.Realtime | null = null;

function getAblyClient(): Ably.Realtime {
  if (!ablyClient) {
    ablyClient = new Ably.Realtime({
      authUrl: "/api/teamspace/ably-token",
      authMethod: "GET",
    });
  }
  return ablyClient;
}

export function MembersPanel({ projectId, channelId }: Props) {
  const [onlineIds, setOnlineIds] = useState<Set<string>>(new Set());
  const members = useQuery(
    api.project.getProjectMembers,
    projectId ? { projectId: projectId as Id<"projects"> } : "skip",
  );

  // Track Ably presence for online status
  useEffect(() => {
    if (!channelId) return;

    const ably = getAblyClient();
    const ch = ably.channels.get(`teamspace:${channelId}`);

    // Enter presence
    ch.presence.enter({ channelId });

    // Watch all presence members
    ch.presence.subscribe(() => {
      ch.presence.get().then((members) => {
        setOnlineIds(new Set(members.map((m: any) => m.clientId)));
      }).catch(console.error);
    });

    // Get initial presence set
    ch.presence.get().then((members) => {
      setOnlineIds(new Set(members.map((m: any) => m.clientId)));
    }).catch(console.error);

    return () => {
      ch.presence.leave();
      ch.presence.unsubscribe();
    };
  }, [channelId]);

  const online = members?.filter((m) => onlineIds.has(m.userId)) ?? [];
  const offline = members?.filter((m) => !onlineIds.has(m.userId)) ?? [];

  return (
    <div className="flex flex-col h-full w-full">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-3 border-b border-border/80">
        <Users className="h-3.5 w-3.5 text-muted-foreground" />
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
          Members
        </h3>
      </div>

      <ScrollArea className="flex-1 px-2 py-3">
        {members === undefined ? (
          <div className="flex flex-col gap-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-2 px-1">
                <Skeleton className="h-6 w-6 rounded-full" />
                <Skeleton className="h-3 w-20" />
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Online */}
            {online.length > 0 && (
              <div className="mb-3">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-1 mb-1.5">
                  Online — {online.length}
                </p>
                <div className="flex flex-col gap-0.5">
                  {online.map((m) => (
                    <MemberRow key={m.userId} member={m} online />
                  ))}
                </div>
              </div>
            )}

            {/* Offline */}
            {offline.length > 0 && (
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-1 mb-1.5">
                  Offline — {offline.length}
                </p>
                <div className="flex flex-col gap-0.5">
                  {offline.map((m) => (
                    <MemberRow key={m.userId} member={m} online={false} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </ScrollArea>
    </div>
  );
}

function MemberRow({
  member,
  online,
}: {
  member: { userId: string; userName: string; userImage?: string; AccessRole?: string };
  online: boolean;
}) {
  return (
    <div className="flex items-center gap-2 px-1 py-1 rounded-md hover:bg-accent/50 transition-colors">
      <div className="relative shrink-0">
        <Avatar className="h-6 w-6">
          <AvatarImage src={member.userImage} />
          <AvatarFallback className="text-[9px]">
            {member.userName.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <span
          className={cn(
            "absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-black",
            online ? "bg-emerald-500" : "bg-muted-foreground/40"
          )}
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className={cn("text-xs truncate", online ? "text-foreground" : "text-muted-foreground")}>
          {member.userName}
        </p>
        {member.AccessRole && (
          <p className="text-[9px] text-muted-foreground/60 truncate capitalize">
            {member.AccessRole}
          </p>
        )}
      </div>
    </div>
  );
}
