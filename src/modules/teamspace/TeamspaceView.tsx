"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useChannels } from "./hooks/useChannels";
import { ChannelsSidebar } from "./ChannelsSidebar";
import { MessageFeed } from "./MessageFeed";
import { MembersPanel } from "./MembersPanel";
import { Channel } from "./hooks/useChannels";
import { Message } from "./hooks/useMessages";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  projectSlug: string;
  projectId: string;
}

export function TeamspaceView({ projectSlug, projectId }: Props) {
  const user = useQuery(api.user.getCurrentUser);

  const { channels, loading, createChannel, updateChannel, deleteChannel } = useChannels(projectId);
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null);
  const [showMembers, setShowMembers] = useState(false);

  // Auto-select default channel once loaded
  const resolvedChannel =
    activeChannel ?? channels.find((c) => c.is_default === 1) ?? channels[0] ?? null;

  const currentUserId = user?._id ?? "";
  const currentUserName = user?.name ?? user?.githubUsername ?? "User";
  const currentUserImage = user?.avatarUrl ?? null;

  return (
    <div className="flex h-[calc(100vh-76px)] overflow-hidden bg-sidebar">
      {/* Left: Channels */}
      <ChannelsSidebar
        projectId={projectId}
        channels={channels}
        loading={loading}
        activeChannelId={resolvedChannel?.id ?? null}
        onSelect={(ch) => {
          setActiveChannel(ch);
        }}
        onCreate={createChannel}
        onUpdate={updateChannel}
        onDelete={deleteChannel}
      />

      {/* Center: Message feed */}
      <MessageFeed
        channel={resolvedChannel}
        currentUserId={currentUserId}
        currentUserName={currentUserName}
        currentUserImage={currentUserImage}
        projectId={projectId}
        onToggleMembers={() => setShowMembers((prev) => !prev)}
      />


      {/* Right: Members panel */}
      <AnimatePresence>
        {showMembers && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 192, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
            className="overflow-hidden bg-black border-l border-border/80 h-full shrink-0"
          >
            <MembersPanel projectId={projectId} channelId={resolvedChannel?.id ?? null} />
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
