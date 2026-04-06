"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface TeamspaceContextType {
  workspaceId: string | null;
  setWorkspaceId: (id: string | null) => void;
  activeChannelId: string | null;
  setActiveChannelId: (id: string | null) => void;
  activeThreadMessageId: string | null; // If open, we slide in the right sidebar
  setActiveThreadMessageId: (id: string | null) => void;
}

const TeamspaceContext = createContext<TeamspaceContextType | undefined>(undefined);

export function TeamspaceProvider({ children }: { children: ReactNode }) {
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [activeChannelId, setActiveChannelId] = useState<string | null>(null);
  const [activeThreadMessageId, setActiveThreadMessageId] = useState<string | null>(null);

  return (
    <TeamspaceContext.Provider
      value={{
        workspaceId,
        setWorkspaceId,
        activeChannelId,
        setActiveChannelId,
        activeThreadMessageId,
        setActiveThreadMessageId,
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
