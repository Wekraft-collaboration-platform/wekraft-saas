"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { useChannels } from "./hooks/useChannels";
import { ChannelsSidebar } from "./ChannelsSidebar";
import { MessageFeed } from "./MessageFeed";
import { MembersPanel } from "./MembersPanel";
import { ThreadPanel } from "./ThreadPanel";
import { Channel } from "./hooks/useChannels";
import { Message } from "./hooks/useMessages";

interface Props {
  projectSlug: string;
  projectId: string;
}

export function TeamspaceView({ projectSlug, projectId }: Props) {
  const user = useQuery(api.user.getCurrentUser);

  const { channels, loading, createChannel } = useChannels(projectId);
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null);
  const [threadMessage, setThreadMessage] = useState<Message | null>(null);

  // Auto-select default channel once loaded
  const resolvedChannel =
    activeChannel ?? channels.find((c) => c.is_default === 1) ?? channels[0] ?? null;

  const handleReply = (message: Message) => {
    setThreadMessage(message);
  };

  const currentUserId = user?._id ?? "";
  const currentUserName = user?.name ?? user?.githubUsername ?? "User";
  const currentUserImage = user?.avatarUrl ?? null;

  return (
    <div className="flex h-[calc(100vh-76px)] overflow-hidden bg-background">
      {/* Left: Channels */}
      <ChannelsSidebar
        channels={channels}
        loading={loading}
        activeChannelId={resolvedChannel?.id ?? null}
        onSelect={(ch) => {
          setActiveChannel(ch);
          setThreadMessage(null);
        }}
        onCreate={createChannel}
      />

      {/* Center: Message feed */}
      <MessageFeed
        channel={resolvedChannel}
        currentUserId={currentUserId}
        currentUserName={currentUserName}
        currentUserImage={currentUserImage}
        projectId={projectId}
        onReply={handleReply}
      />

      {/* Right: Thread panel (slides in) OR Members panel */}
      {threadMessage ? (
        <ThreadPanel
          parentMessage={threadMessage}
          channelId={resolvedChannel?.id ?? null}
          channelName={resolvedChannel?.name ?? ""}
          currentUserId={currentUserId}
          currentUserName={currentUserName}
          currentUserImage={currentUserImage}
          projectId={projectId}
          onClose={() => setThreadMessage(null)}
        />
      ) : (
        <MembersPanel projectId={projectId} channelId={resolvedChannel?.id ?? null} />
      )}
    </div>
  );
}
