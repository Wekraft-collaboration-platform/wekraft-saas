"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

export const useProjectPermissions = (projectId: Id<"projects"> | undefined) => {
  const permissions = useQuery(
    api.project.getProjectPermissions,
    projectId ? { projectId } : "skip"
  );

  return {
    isOwner: permissions?.isOwner ?? false,
    isAdmin: permissions?.isAdmin ?? false,
    isMember: permissions?.isMember ?? false,
    isViewer: permissions?.isViewer ?? false,
    isPower: permissions?.isPower ?? false, // owner or admin
    role: permissions?.role ?? null,
    userId: permissions?.userId,
    isLoading: permissions === undefined,
  };
};
