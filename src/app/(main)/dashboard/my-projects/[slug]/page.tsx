"use client";

import { api } from "@/../convex/_generated/api";
import { Id } from "@/../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import {
  ArrowUpRight,
  ChevronLeft,
  ExternalLink,
  Globe,
  GlobeLock,
  ImageIcon,
  Link2,
  Loader2,
  LucideExternalLink,
  LucideLayers3,
  Settings2,
  UploadCloud,
  UserPlus,
  Calendar,
  Clock,
  Users,
  CopyPlus,
  Globe2,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";

import Link from "next/link";
import { useParams } from "next/navigation";
import { InviteDialog } from "@/modules/project/inviteDilogag";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import Image from "next/image";
import { ProjectJoinRequests } from "@/modules/project/project-join-requests";
import { useRouter } from "next/navigation";
import SettingTab from "@/modules/project/SettingsTab";
import ProjectInfo from "@/modules/project/ProjectInfo";

const ProjectPage = () => {
  const params = useParams();
  const slug = params.slug as string;
  const router = useRouter();

  const project = useQuery(api.project.getProjectBySlug, { slug });
  const projectInviteLink = project?.inviteLink;
  const user = useQuery(api.user.getCurrentUser);
  const members = useQuery(api.project.getProjectMembers, {
    projectId: project?._id as Id<"projects">,
  });

  const [isUploading, setIsUploading] = useState(false);
  const [homeTab, setHomeTab] = useState("settings");

  const updateThumbnail = useMutation(api.project.updateProjectThumbnail);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation
    if (file.size > 1 * 1024 * 1024) {
      toast.error("File too large. Max 1MB allowed.");
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file.");
      return;
    }

    const toastId = toast.loading("Uploading thumbnail...");
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      if (project?.thumbnailUrl) {
        formData.append("oldUrl", project.thumbnailUrl);
      }

      const response = await fetch("/api/objects", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      await updateThumbnail({
        projectId: project?._id as Id<"projects">,
        thumbnailUrl: data.url,
      });

      toast.success("Thumbnail updated successfully!", { id: toastId });
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.message || "Failed to upload thumbnail", { id: toastId });
    } finally {
      setIsUploading(false);
    }
  };

  if (project === undefined) {
    return <ProjectSkeleton />;
  }

  if (project === null) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4 p-6">
        <h2 className="text-2xl font-bold">Project not found</h2>
        <Link href="/dashboard">
          <Button variant="default">Go Back Dashboard</Button>
        </Link>
      </div>
    );
  }
  return (
    <div className="w-full min-h-screen animate-in fade-in duration-700 p-6">
      <header className="flex justify-between items-center mb-5">
        <div className="flex flex-col space-y-1.5">
          <div className="flex items-center gap-5">
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <LucideLayers3 className="w-6 h-6 text-primary" />{" "}
              {project.projectName}
            </h1>
            <Badge
              variant={"outline"}
              className="px-3! py-0.5 text-[10px] bg-transparent"
            >
              {project?.isPublic ? (
                <span className="flex items-center gap-2">
                  <Globe className="w-3 h-3 text-blue-500" /> Public
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <GlobeLock className="w-3 h-3 text-muted-foreground" />{" "}
                  Private
                </span>
              )}
            </Badge>
          </div>
          {project?.repoFullName && project?.repositoryId ? (
            <Link href={`/dashboard/my-projects/${project?.slug}/workspace`}>
              <p className="text-muted-foreground text-sm cursor-pointer hover:text-primary/90">
                <Link2 className="inline w-5 h-5" /> {project.repoFullName}
              </p>
            </Link>
          ) : (
            <p className="text-muted-foreground text-sm cursor-pointer hover:text-primary/90">
              No repository connected{" "}
              <span
                className="text-primary hover:underline"
                onClick={() => {
                  router.push(`/dashboard/repositories`);
                }}
              >
                Click here to connect{" "}
                <ExternalLink className="inline w-3 h-3 ml-0.5 -mt-1" />
              </span>
            </p>
          )}
        </div>
        <div className="flex gap-5">
          <Link href={`/dashboard/`}>
            <Button
              size="sm"
              variant={"outline"}
              className="px-6 text-xs cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4 inline mr-2" /> Back
            </Button>
          </Link>

          <Link href={`/dashboard/my-projects/${project?.slug}/workspace`}>
            <Button size="sm" className="px-4! text-[10px]" variant={"default"}>
              Visit workspace{" "}
              <LucideExternalLink className="ml-2 w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </header>

      {/* ----------------------------------------------- */}
      {/* -------------------AWS SETUP HERE ------------- */}
      <div className="w-[1080px] h-[260px] mx-auto bg-primary/10 rounded-lg overflow-hidden my-8 relative group border border-border">
        {project.thumbnailUrl ? (
          <Image
            src={project.thumbnailUrl}
            alt="Project Thumbnail"
            fill
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <ImageIcon className="w-10 h-10 mb-2 opacity-50" />
            <p>No thumbnail uploaded</p>
          </div>
        )}

        {/* Overlay for upload */}
        <div
          className={`absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
            isUploading ? "opacity-100" : ""
          }`}
        >
          {isUploading ? (
            <div className="flex flex-col items-center text-white">
              <Loader2 className="w-8 h-8 animate-spin mb-2" />
              <p>Uploading...</p>
            </div>
          ) : (
            <label className="cursor-pointer flex flex-col items-center text-white">
              <UploadCloud className="w-10 h-10 mb-2" />
              <span className="font-semibold">Click to Upload Thumbnail</span>
              <span className="text-xs text-white/70 mt-1">
                1080 x 260 Recommended (Max 1MB)
              </span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
          )}
        </div>
      </div>

      {/* ---------------------TABS / SETTINGS BELOW---------------- */}
      <div className="w-full flex items-center justify-end mb-6">
        <div className="flex items-center gap-5">
          <InviteDialog
            inviteLink={projectInviteLink}
            trigger={
              <Button
                className="px-5! h-7! rounded-md text-xs cursor-pointer bg-blue-500 text-white hover:bg-blue-600"
                size="sm"
              >
                Invite <CopyPlus className="ml-2 w-3.5 h-3.5" />
              </Button>
            }
          />
          <Link href={`/dashboard/my-projects/${project?.slug}/workspace`}>
            <Button
              size="sm"
              className=" px-4! text-[10px]"
              variant={"default"}
            >
              Visit workspace{" "}
              <LucideExternalLink className="ml-2 w-3.5 h-3.5" />
            </Button>
          </Link>
          <Button
            className="px-3! text-xs cursor-pointer"
            size="sm"
            variant={"outline"}
          >
            View Public Page <Globe className="ml-2 w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* PARENT CONTAINER LEFT SIDE TABS || RIGHT SIDE PROJECT INFO */}
      <div className="flex">
        {/* LEFT SIDE 3 TABS */}
        <div className="w-[65%] h-full">
          {/* TABS */}
          <div className="flex items-center justify-center gap-6  px-4 border-b border-accent pb-4">
            <Button
              size="sm"
              className="rounded-full px-4! text-[10px]"
              variant={homeTab === "settings" ? "default" : "outline"}
              onClick={() => setHomeTab("settings")}
            >
              Settings <Settings2 />
            </Button>

            <Button
              size="sm"
              className="rounded-full px-4! text-[10px]"
              variant={homeTab === "requests" ? "default" : "outline"}
              onClick={() => setHomeTab("requests")}
            >
              Requests <UserPlus />
            </Button>

            <Button
              size="sm"
              className="rounded-full px-4! text-[10px]"
              variant={homeTab === "community" ? "default" : "outline"}
              onClick={() => setHomeTab("community")}
            >
              Community <Globe />
            </Button>
          </div>

          <div className="px-4">
            {homeTab === "settings" && (
              <div className="py-10">
                <SettingTab project={project as any} />
              </div>
            )}
            {homeTab === "requests" && (
              <ProjectJoinRequests projectId={project._id} />
            )}
            {homeTab === "community" && (
              <div className="py-10 text-center text-muted-foreground text-sm">
                Community features coming soon...
              </div>
            )}
          </div>
        </div>
        <Separator orientation="vertical" className="h-100!" />
        {/* RIGHT SIDE , Info */}
        <div className="w-[30%] h-full pl-6">
          <ProjectInfo project={project as any} members={members} />
        </div>
      </div>
    </div>
  );
};

const ProjectSkeleton = () => {
  return (
    <div className="w-full h-full p-6 lg:p-10 space-y-8">
      <Skeleton className="w-40 h-6" />

      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div className="space-y-4 w-full max-w-2xl">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-6 w-full" />
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>

        <div className="flex gap-2">
          <Skeleton className="h-8 w-20 rounded-full" />
          <Skeleton className="h-8 w-24 rounded-full" />
          <Skeleton className="h-8 w-20 rounded-full" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Skeleton className="md:col-span-2 h-64 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    </div>
  );
};

export default ProjectPage;
