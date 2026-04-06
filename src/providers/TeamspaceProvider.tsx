"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useTeamspaceChat } from "@/hooks/useTeamspaceChat";

interface Message {
  id: string;
  senderId: string;
  projectId: string;
  text: string;
  type: string;
  createdAt: number;
}

interface TeamspaceContextType {
  workspaceId: string | null;
  setWorkspaceId: (id: string | null) => void;
  activeProjectId: string | null;
  setActiveProjectId: (id: string | null) => void;
  activeThreadMessageId: string | null;
  setActiveThreadMessageId: (id: string | null) => void;
  
  // Chat Data (Persisted in layout)
  messages: Message[];
  isLoadingHistory: boolean;
  sendMessage: (args: { text: string; type?: string }) => Promise<any>;
  isSending: boolean;
}

const TeamspaceContext = createContext<TeamspaceContextType | undefined>(undefined);

export function TeamspaceProvider({ children }: { children: ReactNode }) {
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [activeThreadMessageId, setActiveThreadMessageId] = useState<string | null>(null);

  // Background Chat Sync
  // This starts loading history and connects to signals as soon as activeProjectId is set
  const chat = useTeamspaceChat(activeProjectId);

  return (
    <TeamspaceContext.Provider
      value={{
        workspaceId,
        setWorkspaceId,
        activeProjectId,
        setActiveProjectId,
        activeThreadMessageId,
        setActiveThreadMessageId,
        messages: chat.messages,
        isLoadingHistory: chat.isLoadingHistory,
        sendMessage: chat.sendMessage,
        isSending: chat.isSending,
      }}
    >
      {children}
    </TeamspaceContext.Provider>
  );
}

export function useTeamspace() {
  const context = useContext(TeamspaceContext);
  if (context === undefined) {
    throw new Error("useTeamspace must be used within a TeamspaceProvider");
  }
  return context;
}
