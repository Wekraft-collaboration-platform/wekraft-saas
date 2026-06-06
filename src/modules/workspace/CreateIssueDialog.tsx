"use client";

import { useMutation, useQuery } from "convex/react";
import { motion } from "framer-motion";
import {
  CalendarIcon,
  Check,
  ChevronRight,
  Globe,
  Link2,
  ListFilter,
  Loader2,
  LucideSettings2,
  Paperclip,
  Trash2,
  User,
  Zap,
} from "lucide-react";
import Image from "next/image";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { api } from "../../../convex/_generated/api";

const getFileIcon = (fileName: string) => {
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
  const map: Record<string, string> = {
    pdf: "/pdf.svg",
    jpg: "/jpg.svg",
    jpeg: "/jpg.svg",
    png: "/png.svg",
    doc: "/doc.svg",
    docx: "/doc.svg",
    ppt: "/ppt.svg",
    pptx: "/ppt.svg",
    xls: "/xls.svg",
    xlsx: "/xls.svg",
    svg: "/svg.svg",
  };
  return map[ext] ?? "/file.svg";
};

import { format } from "date-fns";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar } from "@/components/ui/calendar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ISSUE_ENVIRONMENT_ICONS,
  ISSUE_SEVERITY_ICONS,
  ISSUE_STATUS_ICONS,
} from "@/lib/static-store";
import { cn } from "@/lib/utils";
import type { Id } from "../../../convex/_generated/dataModel";
import { GetRepoStructure } from "./GetRepoStructure";
import { StorageLimitDialog } from "./StorageLimitDialog";
import { useKayaStore } from "@/store/useKayaStore";

const getCleanIcon = (icon: React.ReactNode) => {
  if (!React.isValidElement(icon)) return icon;
  const currentClassName = (icon.props as any).className || "";
  const cleanClassName = currentClassName
    .split(" ")
    .filter((c: string) => !c.startsWith("text-"))
    .join(" ");
  return React.cloneElement(icon as React.ReactElement<any>, {
    className: cleanClassName,
  });
};

interface CreateIssueDialogProps {
  projectName?: string;
  projectId: Id<"projects">;
  repoFullName?: string;
  ownerClerkId?: string;
  trigger: React.ReactNode;
}

export const CreateIssueDialog = ({
  projectName = "Project",
  projectId,
  repoFullName,
  ownerClerkId,
  trigger,
}: CreateIssueDialogProps) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<
    "not opened" | "opened" | "reopened" | "closed" | null
  >(null);
  const [severity, setSeverity] = useState<
    "critical" | "medium" | "low" | null
  >(null);
  const [environment, setEnvironment] = useState<
    "local" | "dev" | "staging" | "production" | null
  >(null);
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [assignedMembers, setAssignedMembers] = useState<
    { userId: Id<"users">; name: string; avatar?: string }[]
  >([]);
  const [isPending, setIsPending] = useState(false);
  const [attachments, setAttachments] = useState<
    { name: string; url: string; size?: number }[]
  >([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showStorageLimitDialog, setShowStorageLimitDialog] = useState(false);

  const members = useQuery(api.project.getProjectMembers, { projectId });
  const project = useQuery(api.project.getProjectById, { projectId });
  const projectDetails = useQuery(api.projectDetails.getProjectDetails, {
    projectId,
  });
  const owner = useQuery(
    api.user.getUserById,
    project?.ownerId ? { userId: project.ownerId } : "skip",
  );
  const createIssue = useMutation(api.issue.createIssue);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File too large. Max 10MB allowed.");
      return;
    }

    const toastId = toast.loading(`Uploading ${file.name}...`);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("projectId", projectId);

      const response = await fetch("/api/issue-attachments", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      setAttachments((prev) => [
        ...prev,
        { name: data.name, url: data.url, size: file.size },
      ]);
      toast.success("File uploaded successfully", { id: toastId });
    } catch (error: any) {
      const msg = error.message || "";
      if (
        msg.includes("limit") ||
        msg.includes("disabled") ||
        msg.includes("exceeded") ||
        msg.includes("upgrade")
      ) {
        setShowStorageLimitDialog(true);
        toast.dismiss(toastId);
      } else {
        toast.error(msg || "Failed to upload file", { id: toastId });
      }
    } finally {
      setIsUploading(false);
    }
  };

  const removeAttachment = async (url: string) => {
    try {
      await fetch("/api/issue-attachments", {
        method: "DELETE",
        body: JSON.stringify({ url }),
      });
      setAttachments((prev) => prev.filter((a) => a.url !== url));
    } catch (error) {
      console.error("Failed to delete attachment from S3", error);
      setAttachments((prev) => prev.filter((a) => a.url !== url));
    }
  };

  const handleCreateIssue = async () => {
    if (!title.trim()) {
      toast.error("Issue title is required");
      return;
    }

    try {
      setIsPending(true);
      await createIssue({
        title,
        description: description.trim() || undefined,
        status: status || "not opened",
        severity: severity || undefined,
        environment: environment || undefined,
        due_date: dueDate?.getTime(),
        type: "manual",
        projectId,
        fileLinked: selectedPath || undefined,
        assignees: assignedMembers.length > 0 ? assignedMembers : undefined,
        attachments: attachments.length > 0 ? attachments : undefined,
      });
      toast.success("Issue created successfully");
      setOpen(false);
      // Reset form
      setTitle("");
      setDescription("");
      setStatus(null);
      setSeverity(null);
      setEnvironment(null);
      setDueDate(undefined);
      setSelectedPath(null);
      setAssignedMembers([]);
      setAttachments([]);
    } catch (error) {
      console.error(error);
      toast.error("Failed to create issue");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="w-full max-w-[800px] h-full max-h-[560px] flex flex-col bg-card dark:bg-[#1c1c1c] border-neutral-300 dark:border-[#2b2b2b] p-0 overflow-hidden text-foreground dark:text-neutral-200">
        <DialogHeader className="p-4 flex flex-row items-center justify-between gap-2 border-b border-neutral-200 dark:border-[#2b2b2b] shrink-0">
          <div className="flex items-center gap-1.5 text-xs text-neutral-400 font-medium">
            <div className="w-3 h-3 rounded-full bg-blue-600 flex items-center justify-center text-[10px] text-white"></div>
            <span className="text-sm">{projectName}</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-xs">New Issue</span>
          </div>

          <div className="pr-10">
            <TooltipProvider>
              <Tooltip delayDuration={200}>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    className="bg-linear-to-t from-indigo-600/30 via-purple-600/10 to-transparent text-[10px] cursor-pointer px-4! flex items-center gap-1.5 overflow-hidden"
                    onClick={() => {
                      useKayaStore.getState().setIsOpen(true);
                      setOpen(false);
                    }}
                  >
                    <motion.div
                      initial={{ x: 55, scale: 0.9 }}
                      animate={{ x: 0, scale: 1 }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                      className="flex items-center shrink-0"
                    >
                      <Image
                        src="/kaya.svg"
                        alt="Kaya AI"
                        width={18}
                        height={18}
                      />
                    </motion.div>
                    <motion.span
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: "auto", opacity: 1 }}
                      transition={{
                        duration: 0.4,
                        delay: 0.4,
                        ease: "easeOut",
                      }}
                      className="whitespace-nowrap overflow-hidden"
                    >
                      Auto Create with Kaya
                    </motion.span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-neutral-900 border border-neutral-800 text-neutral-200 py-1.5 px-3 rounded text-xs shadow-lg">
                  <p>Create a bunch of issues in 1 go with Kaya.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </DialogHeader>

        <div className="p-6 pb-2 space-y-4 flex-1 overflow-y-auto">
          <div className="flex flex-col space-y-1.5">
            <Label className="text-sm">Issue Title</Label>
            <Input
              autoFocus
              placeholder="Issue title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-base font-medium border bg-neutral-100/60 dark:bg-neutral-900 p-2 focus-visible:ring-0 placeholder:text-neutral-600"
            />
          </div>

          <p className="text-sm tracking-tight ">
            Details <LucideSettings2 className="w-4 h-4 inline ml-1.5" />
          </p>
          <div className="flex flex-wrap gap-2 items-center">
            {/* Status */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 bg-neutral-100 hover:bg-neutral-200 border-neutral-300 dark:bg-[#252525] dark:border-[#333] dark:hover:bg-[#2b2b2b] text-foreground dark:text-primary/80 px-2 gap-1.5 rounded-full text-[11px]"
                >
                  {status ? (
                    getCleanIcon(ISSUE_STATUS_ICONS[status])
                  ) : (
                    <ListFilter className="w-3.5 h-3.5" />
                  )}
                  <span className="capitalize">{status || "Status"}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-popover dark:bg-[#1c1c1c] border-neutral-200 dark:border-[#2b2b2b] text-foreground dark:text-neutral-200 ">
                <div className="text-xs text-center font-medium p-2 border-b border-accent">
                  Select Status
                </div>
                {(["not opened", "opened", "reopened", "closed"] as const).map(
                  (s) => (
                    <DropdownMenuItem
                      key={s}
                      onClick={() => setStatus(s)}
                      className="gap-2 cursor-pointer"
                    >
                      {ISSUE_STATUS_ICONS[s]}
                      <span className="capitalize text-xs px-1.5">{s}</span>
                    </DropdownMenuItem>
                  ),
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Severity */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 bg-neutral-100 hover:bg-neutral-200 border-neutral-300 dark:bg-[#252525] dark:border-[#333] dark:hover:bg-[#2b2b2b] text-foreground dark:text-primary/80 px-2 gap-1.5 rounded-full text-[11px]"
                >
                  {severity ? (
                    getCleanIcon(ISSUE_SEVERITY_ICONS[severity])
                  ) : (
                    <Zap className="w-3.5 h-3.5" />
                  )}
                  <span className="capitalize">{severity || "Severity"}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-popover dark:bg-[#1c1c1c] border-neutral-200 dark:border-[#2b2b2b] text-foreground dark:text-neutral-200">
                <div className="text-xs text-center font-medium p-2 border-b border-accent">
                  Select Severity
                </div>
                {(["low", "medium", "critical"] as const).map((sev) => (
                  <DropdownMenuItem
                    key={sev}
                    onClick={() => setSeverity(sev)}
                    className="gap-2 cursor-pointer"
                  >
                    {ISSUE_SEVERITY_ICONS[sev]}
                    <span className="capitalize">{sev}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Environment */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 bg-neutral-100 hover:bg-neutral-200 border-neutral-300 dark:bg-[#252525] dark:border-[#333] dark:hover:bg-[#2b2b2b] text-foreground dark:text-primary/80 px-2 gap-1.5 rounded-full text-[11px]"
                >
                  {environment ? (
                    getCleanIcon(ISSUE_ENVIRONMENT_ICONS[environment])
                  ) : (
                    <Globe className="w-3.5 h-3.5" />
                  )}
                  <span className="capitalize">
                    {environment || "Environment"}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-popover dark:bg-[#1c1c1c] border-neutral-200 dark:border-[#2b2b2b] text-foreground dark:text-neutral-200">
                <div className="text-xs text-center font-medium p-2 border-b border-accent">
                  Select Environment
                </div>
                {(["local", "dev", "staging", "production"] as const).map(
                  (env) => (
                    <DropdownMenuItem
                      key={env}
                      onClick={() => setEnvironment(env)}
                      className="gap-2 cursor-pointer"
                    >
                      {ISSUE_ENVIRONMENT_ICONS[env]}
                      <span className="capitalize">{env}</span>
                    </DropdownMenuItem>
                  ),
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Due Date */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 bg-neutral-100 hover:bg-neutral-200 border-neutral-300 dark:bg-[#252525] dark:border-[#333] dark:hover:bg-[#2b2b2b] text-foreground dark:text-primary/80 px-2 gap-1.5 rounded-full text-[11px]"
                >
                  <CalendarIcon className="w-3.5 h-3.5" />
                  {dueDate ? (
                    format(dueDate, "LLL dd, yyyy")
                  ) : (
                    <span>Due Date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto p-0 bg-popover dark:bg-[#1c1c1c] border-neutral-200 dark:border-[#2b2b2b]"
                align="start"
              >
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={setDueDate}
                  initialFocus
                  disabled={
                    [
                      project?.createdAt
                        ? { before: new Date(project.createdAt) }
                        : undefined,
                      projectDetails?.targetDate
                        ? { after: new Date(projectDetails.targetDate) }
                        : undefined,
                    ].filter(Boolean) as any
                  }
                  className="bg-popover dark:bg-[#1c1c1c] text-foreground dark:text-neutral-200"
                />
              </PopoverContent>
            </Popover>

            {/* Link Codebase */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 bg-neutral-100 hover:bg-neutral-200 border-neutral-300 dark:bg-[#252525] dark:border-[#333] dark:hover:bg-[#2b2b2b] text-foreground dark:text-primary/80 px-2 gap-1.5 rounded-full text-[11px]"
                >
                  <Link2 className="w-3.5 h-3.5" />
                  {selectedPath ? selectedPath.split("/").pop() : "Link Code"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[320px] p-0 bg-popover dark:bg-[#1c1c1c] border-neutral-200 dark:border-[#2b2b2b] text-foreground dark:text-neutral-200">
                <GetRepoStructure
                  repoFullName={repoFullName}
                  onSelect={setSelectedPath}
                  selectedPath={selectedPath}
                  ownerClerkId={ownerClerkId}
                  projectName={projectName}
                />
              </PopoverContent>
            </Popover>

            {/* Members Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 bg-neutral-100 hover:bg-neutral-200 border-neutral-300 dark:bg-[#252525] dark:border-[#333] dark:hover:bg-[#2b2b2b] text-foreground dark:text-primary/80 px-3 gap-1.5 rounded-full text-[11px]"
                >
                  <User className="w-3.5 h-3.5" />
                  {assignedMembers.length > 0
                    ? `${assignedMembers.length} Assigned`
                    : "Assignees"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className={cn(
                  "bg-popover dark:bg-[#1c1c1c] border-neutral-200 dark:border-[#2b2b2b] text-foreground dark:text-neutral-200",
                  members && members.length >= 4 ? "w-[360px]" : "w-48",
                )}
              >
                <div className="text-xs text-center font-medium p-2 border-b border-accent">
                  Select Members
                </div>
                <div
                  className={cn(
                    "p-1.5",
                    members && members.length >= 4
                      ? "grid grid-cols-2 gap-1.5"
                      : "flex flex-col gap-0.5",
                  )}
                >
                  {members?.map((member) => {
                    const isSelected = assignedMembers.some(
                      (m) => m.userId === member.userId,
                    );
                    return (
                      <DropdownMenuItem
                        key={member.userId}
                        onSelect={(e) => {
                          e.preventDefault();
                          if (isSelected) {
                            setAssignedMembers(
                              assignedMembers.filter(
                                (m) => m.userId !== member.userId,
                              ),
                            );
                          } else {
                            setAssignedMembers([
                              ...assignedMembers,
                              {
                                userId: member.userId,
                                name: member.userName,
                                avatar: member.userImage,
                              },
                            ]);
                          }
                        }}
                        className="flex items-center gap-2 cursor-pointer p-1.5 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                      >
                        <Avatar className="h-5 w-5 shrink-0">
                          <AvatarImage src={member.userImage} />
                          <AvatarFallback className="text-[8px]">
                            {member.userName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <span
                          className={cn(
                            "text-xs truncate",
                            isSelected && "text-blue-500 font-bold",
                          )}
                        >
                          {member.userName}
                        </span>
                        {isSelected && (
                          <Check className="w-3 h-3 ml-auto text-blue-500 shrink-0" />
                        )}
                      </DropdownMenuItem>
                    );
                  })}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Attachments */}
            <div className="relative">
              <TooltipProvider delayDuration={100}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="inline-block">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-7 bg-neutral-100 hover:bg-neutral-200 border-neutral-300 dark:bg-[#252525] dark:border-[#333] dark:hover:bg-[#2b2b2b] text-foreground dark:text-primary/80 px-2 gap-1.5 rounded-full text-[11px]"
                        disabled={
                          isUploading || project?.ownerAccountType === "free"
                        }
                        onClick={() =>
                          document.getElementById("issue-file-upload")?.click()
                        }
                      >
                        {isUploading ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Paperclip className="w-3.5 h-3.5" />
                        )}
                        {attachments.length > 0
                          ? `${attachments.length} Attachments`
                          : "Attachments"}
                      </Button>
                    </div>
                  </TooltipTrigger>
                  {project?.ownerAccountType === "free" && (
                    <TooltipContent className="bg-[#1c1c1c] border-[#2b2b2b] text-neutral-200 text-xs p-2 max-w-[200px] text-center">
                      Ask project owner to upgrade to unlock cloud storage.
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
              <input
                id="issue-file-upload"
                type="file"
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>
          </div>

          <Textarea
            placeholder="Add a description, a project brief, or collect ideas..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="h-[220px] overflow-y-scroll bg-neutral-100/60 dark:bg-neutral-900 border p-2 focus-visible:ring-0 placeholder:text-neutral-600 resize-none text-sm leading-relaxed [field-sizing:normal]"
          />

          {/* Attachments List */}
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2 border-t border-[#2b2b2b]/50">
              {attachments.map((file, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 bg-neutral-100 dark:bg-[#252525] border border-neutral-200 dark:border-[#333] rounded-md px-2 py-1 group"
                >
                  <Image
                    src={getFileIcon(file.name)}
                    alt={file.name}
                    width={200}
                    height={200}
                    className="shrink-0 w-12 h-12 object-cover"
                  />
                  <span className="text-[10px] text-neutral-300 max-w-[120px] truncate">
                    {file.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeAttachment(file.url)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-neutral-500 hover:text-red-400"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-neutral-200 dark:border-[#2b2b2b] flex items-center justify-end shrink-0">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={() => setOpen(false)}
              className="h-8 text-xs text-neutral-400 hover:text-foreground dark:hover:text-white"
            >
              Cancel
            </Button>
            <Button
              disabled={isPending}
              onClick={handleCreateIssue}
              className="h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white px-4"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create issue"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>

      <StorageLimitDialog
        isOpen={showStorageLimitDialog}
        onClose={() => setShowStorageLimitDialog(false)}
        ownerName={owner?.name}
        ownerEmail={owner?.email}
      />
    </Dialog>
  );
};
