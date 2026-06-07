"use client";

import { useQuery } from "convex/react";
import { ArrowLeft, Loader2, ShieldAlert } from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AiAssistantSheet } from "@/modules/ai/AiAssistantSheet";
import { HarryAssistantSheet } from "@/modules/ai/HarryAssistantSheet";
import { FloatingKaya } from "@/modules/ai/FloatingKaya";
import ProjectSidebar from "@/modules/workspace/Projectsidebar";
import { api } from "../../../../../../../convex/_generated/api";
import type { Id } from "../../../../../../../convex/_generated/dataModel";
import StreamVideoProvider from "@/modules/team-meet/VideoProvider";

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const project = useQuery(api.project.getProjectBySlug, { slug });
  const permissions = useQuery(
    api.project.getProjectPermissions,
    project?._id ? { projectId: project._id as Id<"projects"> } : "skip",
  );

  // 1. Loading State
  if (project === undefined || (project && permissions === undefined)) {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground animate-pulse">
            Securing workspace access...
          </p>
        </div>
      </div>
    );
  }

  // 2. Project not found state
  if (!project) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-background p-4 text-center">
        <ShieldAlert className="h-16 w-16 text-destructive mb-4 animate-bounce" />
        <h1 className="text-2xl font-bold text-foreground">
          Project Not Found
        </h1>
        <p className="text-muted-foreground mt-2 max-w-md">
          The project you are looking for does not exist or may have been
          deleted.
        </p>
        <Button
          onClick={() => router.push("/dashboard")}
          className="mt-6"
          variant="outline"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Projects
        </Button>
      </div>
    );
  }

  // 3. Authorization Check
  const isAuthorized =
    permissions?.isOwner ||
    permissions?.isAdmin ||
    permissions?.isMember ||
    permissions?.isViewer;

  if (!isAuthorized) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="relative max-w-md border border-border rounded-lg bg-sidebar p-4 w-full overflow-hidden  text-center">
          <Image
            src="/pat106.svg"
            alt="Access Denied"
            width={100}
            height={100}
            className="w-24 h-24 mx-auto dark:invert-0 invert"
          />
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Access Denied
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            You are not a member of this project, or you don&apos;t have
            authorization to view this workspace. Please contact the project
            owner if you believe this is an error.
          </p>

          <div className="mt-8 flex flex-col gap-3">
            <Button
              onClick={() => router.push("/dashboard")}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2 rounded-lg transition-all"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // 4. Authorized Access State
  return (
    <div className="">
      <StreamVideoProvider>
        <ProjectSidebar />
        <main className="flex-1">{children}</main>
        <FloatingKaya />
        <AiAssistantSheet />
        <HarryAssistantSheet />
      </StreamVideoProvider>

    </div>
  );
}
