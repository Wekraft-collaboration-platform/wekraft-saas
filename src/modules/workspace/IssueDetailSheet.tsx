"use client";

import React, { useState, useEffect } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Clock,
  Calendar,
  Tag,
  Users,
  AlertCircle,
  Plus,
  Edit2,
  Circle,
  Bug,
  CalendarClock,
  TextQuote,
  MessagesSquare,
  GitBranch,
  FastForward,
  FileText,
  ExternalLink,
  RotateCcw,
  CheckCircle2,
  Paperclip,
  Trash2,
} from "lucide-react";
import Image from "next/image";

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

const getProxyUrl = (url: string, download = false) => {
  if (!url) return "";
  const s3Prefix = "https://wekraft-saas-upload-s3.s3.ap-south-1.amazonaws.com/";
  if (url.startsWith(s3Prefix)) {
    const key = url.slice(s3Prefix.length);
    return `/api/teamspace/download?key=${encodeURIComponent(key)}&download=${download}`;
  }
  return `/api/teamspace/download?url=${encodeURIComponent(url)}&download=${download}`;
};

import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Send, User, Check, Globe, Zap } from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Loader2 } from "lucide-react";
import { EditIssueDialog } from "./EditIssueDialog";
import { MoveToSprintDialog } from "./MoveToSprintDialog";
import { StorageLimitDialog } from "./StorageLimitDialog";
import {
  ISSUE_STATUS_ICONS,
  ISSUE_SEVERITY_ICONS,
  ISSUE_ENVIRONMENT_ICONS,
} from "@/lib/static-store";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface IssueDetailSheetProps {
  issue: any | null;
  isOpen: boolean;
  onClose: () => void;
}

const severityConfig: Record<string, { label: string; color: string; bg: string }> = {
  low: { label: "low", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-500/10 border-blue-100 dark:border-blue-400/20" },
  medium: { label: "medium", color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-50 dark:bg-orange-500/10 border-orange-100 dark:border-orange-400/20" },
  critical: { label: "critical", color: "text-red-600 dark:text-red-500", bg: "bg-red-50 dark:bg-red-500/10 border-red-100 dark:border-red-500/20" },
  none: { label: "none", color: "text-slate-600 dark:text-slate-500", bg: "bg-slate-50 dark:bg-slate-500/10 border-slate-100 dark:border-slate-500/20" },
};

const statusColors: Record<string, string> = {
  "not opened": "bg-neutral-100 dark:bg-neutral-500/15 border-neutral-200 dark:border-neutral-500/30 text-neutral-600 dark:text-neutral-400",
  opened: "bg-blue-50 dark:bg-blue-500/15 border-blue-100 dark:border-blue-500/30 text-blue-600 dark:text-blue-400",
  reopened: "bg-purple-50 dark:bg-purple-500/15 border-purple-100 dark:border-purple-500/30 text-purple-600 dark:text-purple-400",
  closed: "bg-emerald-50 dark:bg-emerald-500/15 border-emerald-100 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400",
};

const envConfig: Record<string, string> = {
  local: "bg-slate-50 dark:bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-slate-400/20",
  dev: "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-400/20",
  staging: "bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-400/20",
  production: "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-500 border border-rose-100 dark:border-rose-500/20",
};

export const IssueDetailSheet = ({
  issue,
  isOpen,
  onClose,
}: IssueDetailSheetProps) => {
  const [commentText, setCommentText] = useState("");
  const [activeTab, setActiveTab] = useState("comments");
  const [cachedIssue, setCachedIssue] = useState<any | null>(null);

  useEffect(() => {
    if (issue) {
      setCachedIssue(issue);
    }
  }, [issue]);

  const currentIssue = issue || cachedIssue;

  // Real-time queries for detail updates
  const comments = useQuery(
    api.issue.getIssueComments,
    currentIssue ? { issueId: currentIssue._id } : "skip"
  );

  const allIssues = useQuery(
    api.issue.getIssuesForKanban,
    currentIssue ? { projectId: currentIssue.projectId } : "skip"
  );

  const realIssue = allIssues?.find((i) => i._id === currentIssue?._id) || currentIssue;

  const createComment = useMutation(api.issue.createIssueComment);

  const creator = useQuery(
    api.user.getUserById,
    realIssue ? { userId: realIssue.createdByUserId as any } : "skip"
  );

  const completer = useQuery(
    api.user.getUserById,
    realIssue?.finalCompletedBy
      ? { userId: realIssue.finalCompletedBy as any }
      : "skip"
  );

  const members = useQuery(
    api.project.getProjectMembers,
    realIssue ? { projectId: realIssue.projectId } : "skip"
  );

  const project = useQuery(
    api.project.getProjectById,
    realIssue ? { projectId: realIssue.projectId } : "skip"
  );

  const sprints = useQuery(
    api.sprint.getSprintsByProject,
    realIssue ? { projectId: realIssue.projectId } : "skip"
  );

  const updateIssue = useMutation(api.issue.updateIssue);
  const updateIssueStatus = useMutation(api.issue.updateIssueStatus);
  const assignIssueToSprint = useMutation(api.sprint.assignIssueToSprint);
  const addAttachment = useMutation(api.issue.addIssueAttachment);
  const removeAttachment = useMutation(api.issue.removeIssueAttachment);

  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isAssigningSprint, setIsAssigningSprint] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showStorageLimitDialog, setShowStorageLimitDialog] = useState(false);

  const owner = useQuery(
    api.user.getUserById,
    project?.ownerId ? { userId: project.ownerId } : "skip",
  );

  const handleAttachmentUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file || !realIssue) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File too large. Max 10MB allowed.");
      return;
    }

    const toastId = toast.loading(`Uploading ${file.name}...`);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("projectId", realIssue.projectId);

      const response = await fetch("/api/issue-attachments", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      await addAttachment({
        issueId: realIssue._id,
        name: data.name,
        url: data.url,
        size: file.size,
      });

      toast.success("Attachment added successfully", { id: toastId });
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
        toast.error(msg || "Failed to upload attachment", {
          id: toastId,
        });
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveAttachment = async (url: string) => {
    if (!realIssue) return;
    try {
      await removeAttachment({
        issueId: realIssue._id,
        url,
      });
      // Delete from S3
      const res = await fetch("/api/issue-attachments", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      if (res.ok) {
        console.log("[IssueAttachments] S3 delete successful:", url);
      } else {
        console.warn("[IssueAttachments] S3 delete failed:", await res.text());
      }
      toast.success("Attachment removed");
    } catch (error) {
      toast.error("Failed to remove attachment");
    }
  };

  if (!realIssue) return null;

  const severity =
    severityConfig[realIssue.severity || "none"] || severityConfig.none;

  const handleSendComment = async () => {
    if (!commentText.trim()) return;
    try {
      await createComment({
        issueId: realIssue._id,
        comment: commentText.trim(),
      });
      setCommentText("");
    } catch (error) {
      toast.error("Failed to post comment");
    }
  };

  const handleAssignMember = async (member: any, isSelected: boolean) => {
    let newAssignees = realIssue.assignedTo || [];
    if (isSelected) {
      newAssignees = newAssignees.filter((m: any) => m.userId !== member.userId);
    } else {
      newAssignees = [
        ...newAssignees,
        {
          userId: member.userId,
          name: member.userName,
          avatar: member.userImage,
        },
      ];
    }

    try {
      await updateIssue({
        issueId: realIssue._id,
        assignees: newAssignees.map((a: any) => ({
          userId: a.userId,
          name: a.name,
          avatar: a.avatar,
        })),
      });
      toast.success("Assignees updated");
    } catch (error) {
      toast.error("Failed to update assignees");
    }
  };

  const handleToggleCloseIssue = async () => {
    const isClosed = realIssue.status === "closed";
    const nextStatus = isClosed ? "reopened" : "closed";
    setIsUpdatingStatus(true);
    const toastId = toast.loading(`${isClosed ? "Reopening" : "Closing"} issue...`);
    try {
      await updateIssueStatus({
        issueId: realIssue._id,
        status: nextStatus,
      });
      toast.success(`Issue ${isClosed ? "reopened" : "closed"} successfully`, { id: toastId });
    } catch (error) {
      toast.error(`Failed to change issue status`, { id: toastId });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleAssignSprint = async (sprintId: string | undefined) => {
    setIsAssigningSprint(true);
    const toastId = toast.loading("Updating sprint assignment...");
    try {
      await assignIssueToSprint({
        issueId: realIssue._id,
        sprintId: sprintId as any,
      });
      toast.success("Sprint assignment updated", { id: toastId });
    } catch (error: any) {
      toast.error(error.message || "Failed to assign to sprint", { id: toastId });
    } finally {
      setIsAssigningSprint(false);
    }
  };

  const activeSprint = sprints?.find((s) => s._id === realIssue.sprintId);

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-lg w-full p-0 border-l border-border bg-sidebar">
        <div className="flex flex-col h-full">
          {/* Top Actions */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-accent">
            <div className="flex items-center gap-3">
              {project && (
                <EditIssueDialog
                  projectName={project.projectName}
                  projectId={realIssue.projectId}
                  repoFullName={project.repoFullName}
                  ownerClerkId={project.ownerClerkId}
                  issue={realIssue}
                  trigger={
                    <Button variant="default" size="sm" className="text-[10px]">
                      <Edit2 size={12} /> Edit Issue
                    </Button>
                  }
                />
              )}
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "text-[10px]",
                  realIssue.status === "closed" && "text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20"
                )}
                onClick={handleToggleCloseIssue}
                disabled={isUpdatingStatus}
              >
                {isUpdatingStatus ? (
                  <Loader2 className="w-3 h-3 animate-spin mr-1" />
                ) : realIssue.status === "closed" ? (
                  <RotateCcw size={12} className="mr-1" />
                ) : (
                  <CheckCircle2 size={12} className="mr-1" />
                )}
                {realIssue.status === "closed" ? "Reopen Issue" : "Close Issue"}
              </Button>

              <MoveToSprintDialog
                trigger={
                  <Button variant="outline" size="sm" className="text-[10px]">
                    <FastForward size={12} className="mr-1" /> Add to Sprint
                  </Button>
                }
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-6 scrollbar-hide space-y-4.5">
            {/* Title Section */}
            <div className="flex flex-col space-y-2.5">
              <h1 className="text-xl font-semibold tracking-tight text-primary capitalize max-w-[440px] truncate leading-tight">
                {realIssue.title}
              </h1>
              <div className="flex items-center gap-2 flex-wrap">
                {realIssue.type ? (
                  <div
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold border transition-all duration-200",
                      realIssue.type === "github" && "bg-neutral-500/10 text-primary/80 border-neutral-400/20 ",
                      realIssue.type === "manual" && "bg-blue-500/10 text-primary/80 border-blue-400/20 ",
                      realIssue.type === "task-issue" && "bg-neutral-500/10 text-primary/80 border-neutral-400/20 ",
                    )}
                  >

                    <span className="capitalize">{realIssue.type.replace("-", " ")}</span>
                  </div>
                ) : (
                  <span className="text-[10px] text-primary/10 tracking-widest px-2">—</span>
                )}
                <div className="flex items-center gap-1.5 ml-2">
                  <span className="text-xs text-muted-foreground">Created by: </span>
                  <Avatar className="w-6 h-6 border">
                    <AvatarImage src={creator?.avatarUrl || ""} />
                    <AvatarFallback className="text-sm bg-muted text-muted-foreground">
                      {creator?.name?.[0] || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-primary">
                    {creator?.name || "Loading..."}
                  </span>
                </div>
              </div>
            </div>

            {/* Stats Panel */}
            <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg bg-neutral-50 dark:bg-neutral-900/10 overflow-hidden mt-6">
              {/* Row 1: Due Date */}
              <div className="grid grid-cols-[100px_1fr] items-center px-4 py-3 border-b border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium">
                  <Calendar size={14} className="text-muted-foreground/80" /> Due Date
                </div>
                <div className="text-xs text-primary/80 pl-2">
                  {realIssue.due_date ? (
                    format(realIssue.due_date, "d MMMM, yyyy")
                  ) : (
                    <span className="text-neutral-500 italic">Not set</span>
                  )}
                </div>
              </div>

              {/* Row 2: Status & Assignee */}
              <div className="grid grid-cols-2 divide-x divide-neutral-200 dark:divide-neutral-800">
                {/* Status */}
                <div className="px-4 py-3 space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium">
                    <Clock size={14} className="text-muted-foreground/80" /> Status
                  </div>
                  <div className="flex items-center">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-500/15 text-neutral-800 dark:text-neutral-200 capitalize">
                      {ISSUE_STATUS_ICONS[realIssue.status] || <Circle size={8} className="fill-current" />}
                      {realIssue.status}
                    </span>
                  </div>
                </div>

                {/* Assignee */}
                <div className="px-4 py-3 space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium">
                    <Users size={14} className="text-muted-foreground/80" /> Assignee
                  </div>
                  <div className="flex items-center gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <div className="cursor-pointer flex items-center">
                          {realIssue.assignedTo && realIssue.assignedTo.length > 0 ? (
                            <div className="flex items-center gap-2">
                              <div className="flex -space-x-1.5">
                                <TooltipProvider>
                                  {realIssue.assignedTo.map((person: any, i: number) => (
                                    <Tooltip key={i}>
                                      <TooltipTrigger asChild>
                                        <Avatar
                                          className="w-6.5 h-6.5 border-2 border-white dark:border-neutral-900 shadow-sm cursor-pointer"
                                        >
                                          <AvatarImage src={person.avatar} />
                                          <AvatarFallback className="text-[10px] bg-neutral-800 text-neutral-400">
                                            {person.name[0]}
                                          </AvatarFallback>
                                        </Avatar>
                                      </TooltipTrigger>
                                      <TooltipContent className="bg-popover border border-border text-popover-foreground text-xs py-1 px-2 rounded-md">
                                        <p>{person.name}</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  ))}
                                </TooltipProvider>
                              </div>
                              <div className="flex items-center justify-center w-6 h-6 rounded-full border border-neutral-200 dark:border-neutral-800 bg-neutral-100/50 dark:bg-neutral-800/30 hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors">
                                <Plus size={10} />
                              </div>
                            </div>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-6 px-2 text-[10px] bg-muted/30 border-border/50 text-muted-foreground hover:text-foreground rounded-lg gap-1"
                            >
                              <Plus size={10} /> Unassigned
                            </Button>
                          )}
                        </div>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-popover border-border text-popover-foreground w-48">
                        <div className="text-xs text-center font-medium p-2 border-b border-accent">
                          Assign Members
                        </div>
                        {members?.map((member) => {
                          const isSelected = realIssue.assignedTo?.some(
                            (m: any) => m.userId === member.userId
                          );
                          return (
                            <DropdownMenuItem
                              key={member.userId}
                              onSelect={(e) => {
                                e.preventDefault();
                                handleAssignMember(member, !!isSelected);
                              }}
                              className="flex items-center gap-2 cursor-pointer"
                            >
                              <Avatar className="h-5 w-5">
                                <AvatarImage src={member.userImage} />
                                <AvatarFallback className="text-[8px]">
                                  {member.userName[0]}
                                </AvatarFallback>
                              </Avatar>
                              <span
                                className={cn(
                                  "text-xs",
                                  isSelected && "text-blue-500 font-bold"
                                )}
                              >
                                {member.userName}
                              </span>
                              {isSelected && (
                                <Check className="w-3 h-3 ml-auto text-blue-500" />
                              )}
                            </DropdownMenuItem>
                          );
                        })}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>

              {/* Row 3: Severity & Environment */}
              <div className="grid grid-cols-2 divide-x divide-neutral-200 dark:divide-neutral-800 border-t border-neutral-200 dark:border-neutral-800">
                {/* Severity */}
                <div className="px-4 py-3 space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium">
                    <Zap size={14} className="text-muted-foreground/80" /> Severity
                  </div>
                  <div className="flex items-center">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-500/15 text-neutral-800 dark:text-neutral-200 capitalize">
                      {realIssue.severity ? (
                        ISSUE_SEVERITY_ICONS[realIssue.severity]
                      ) : (
                        <Zap className="w-3.5 h-3.5" />
                      )}
                      {realIssue.severity || "No Severity"}
                    </span>
                  </div>
                </div>

                {/* Environment */}
                <div className="px-4 py-3 space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium">
                    <Globe size={14} className="text-muted-foreground/80" /> Environment
                  </div>
                  <div className="flex items-center">
                    {realIssue.environment ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-500/15 text-neutral-800 dark:text-neutral-200 capitalize">
                        {ISSUE_ENVIRONMENT_ICONS[realIssue.environment]}
                        {realIssue.environment}
                      </span>
                    ) : (
                      <span className="text-neutral-500 italic text-xs pl-1">Not set</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Row 4: Link Code */}
              <div className="grid grid-cols-[100px_1fr] items-center px-4 py-3 border-t border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium">
                  <GitBranch size={14} className="text-muted-foreground/80" /> Link Code
                </div>
                <div className="text-xs text-primary/80 pl-2 truncate max-w-[280px]">
                  {realIssue.fileLinked ? (
                    <span className="flex items-center gap-1.5 font-medium">
                      <span className="text-neutral-400 truncate">
                        {realIssue.fileLinked.split("/").pop()}
                      </span>
                      {realIssue.githubIssueUrl && (
                        <a
                          href={realIssue.githubIssueUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300"
                        >
                          <ExternalLink size={12} />
                        </a>
                      )}
                    </span>
                  ) : (
                    <span className="text-neutral-500 italic">Not linked any file</span>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-4">
              {realIssue.status === "closed" ? (
                <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-900/30 rounded-xl p-3.5 shadow-sm transition-all duration-300">
                  <p className="text-xs text-muted-foreground flex items-center">
                    <Check size={14} className="mr-2 text-emerald-500" />
                    Resolved at:
                    <span className="text-xs text-primary ml-2 font-normal">
                      {realIssue.finalCompletedAt
                        ? format(realIssue.finalCompletedAt, "d MMMM, yyyy")
                        : format(realIssue.updatedAt, "d MMMM, yyyy")}
                    </span>
                  </p>
                  <div className="flex items-center gap-2 border-l border-neutral-200 dark:border-neutral-800 pl-4 shrink-0">
                    <span className="text-[10px] text-muted-foreground">By:</span>
                    <Avatar className="w-6 h-6 border border-neutral-200 dark:border-neutral-800">
                      <AvatarImage src={completer?.avatarUrl || ""} />
                      <AvatarFallback className="text-[9px] bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 font-bold">
                        {completer?.name?.[0]?.toUpperCase() || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-neutral-700 dark:text-neutral-300 truncate max-w-[100px]">
                      {completer?.name || "Loading..."}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/5 rounded-xl p-3 text-muted-foreground text-xs">
                  <CalendarClock size={14} className="text-muted-foreground/80" />
                  <span>Last updated:</span>
                  <span className="text-primary/95 ml-1">
                    {format(realIssue.updatedAt, "d MMMM, yyyy")}
                  </span>
                </div>
              )}
            </div>

            {/* Description & Comments Tabs */}
            <div className="space-y-4 mt-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="w-full">
                  <TabsTrigger value="description" className="text-xs flex-1">
                    Description <TextQuote className="w-4 h-4 ml-1.5" />
                  </TabsTrigger>
                  <TabsTrigger value="attachments" className="text-xs flex-1">
                    Attachments <Paperclip className="w-4 h-4 ml-1.5" />
                  </TabsTrigger>
                  <TabsTrigger value="comments" className="text-xs flex-1">
                    Comments <MessagesSquare className="w-4 h-4 ml-1.5" />
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="description" className="pt-4">
                  {realIssue.description ? (
                    <div className="p-5 rounded-xl bg-neutral-50 dark:bg-neutral-950/10 border border-neutral-200 dark:border-neutral-800 group">
                      <p className="text-foreground/90 text-sm leading-relaxed whitespace-pre-wrap min-h-[100px] selection:bg-primary/20">
                        {realIssue.description}
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-8 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-xl bg-neutral-50 dark:bg-neutral-950/5">
                      <div className="p-3 rounded-full bg-neutral-100 dark:bg-neutral-900 text-muted-foreground transition-all duration-300">
                        <FileText size={24} />
                      </div>
                      <p className="mt-4 text-sm font-medium text-foreground/70">
                        No description provided
                      </p>
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        Click "Edit Issue" above to add more details.
                      </p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="attachments" className="pt-2">
                  <div className="p-2">
                    {realIssue.attachments && realIssue.attachments.length > 0 ? (
                      <div className="grid grid-cols-1 gap-2 w-full">
                        {realIssue.attachments.map((file: any, idx: number) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between bg-accent/20 border border-neutral-200 dark:border-[#333] rounded-xl px-4 py-2 group hover:border-blue-500/50 transition-all duration-200"
                          >
                            <div className="flex items-center gap-3 overflow-hidden">
                              <Image
                                src={getFileIcon(file.name)}
                                alt={file.name}
                                width={140}
                                height={140}
                                className="shrink-0 w-12 h-12 object-cover"
                              />
                              <div className="flex flex-col min-w-0">
                                <span className="text-xs font-medium text-primary truncate max-w-[200px]">
                                  {file.name}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                                onClick={() => window.open(getProxyUrl(file.url, false), "_blank")}
                              >
                                <ExternalLink size={14} />
                              </Button>
                              <TooltipProvider delayDuration={100}>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="inline-block">
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                        onClick={() => handleRemoveAttachment(file.url)}
                                        disabled={project?.ownerAccountType === "free"}
                                      >
                                        <Trash2 size={14} />
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
                            </div>
                          </div>
                        ))}
                        <TooltipProvider delayDuration={100}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="inline-block w-full mt-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-9 w-full px-3 text-xs bg-muted/30 border-border text-muted-foreground hover:text-foreground rounded-xl gap-2 border-dashed"
                                  disabled={isUploading || project?.ownerAccountType === "free"}
                                  onClick={() =>
                                    document
                                      .getElementById("issue-detail-file-upload")
                                      ?.click()
                                  }
                                >
                                  {isUploading ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                  ) : (
                                    <Plus size={14} />
                                  )}
                                  Add More
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
                      </div>
                    ) : (
                      <div className="text-center space-y-3 py-4 w-full">
                        <Paperclip
                          size={32}
                          className="text-muted-foreground/20 mx-auto"
                        />
                        <p className="text-muted-foreground text-xs font-medium">
                          No attachments yet
                        </p>
                        <TooltipProvider delayDuration={100}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="inline-block mt-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-9 px-4 text-xs bg-muted/30 border-border text-muted-foreground hover:text-foreground rounded-xl gap-2"
                                  disabled={isUploading || project?.ownerAccountType === "free"}
                                  onClick={() =>
                                    document
                                      .getElementById("issue-detail-file-upload")
                                      ?.click()
                                  }
                                >
                                  {isUploading ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                  ) : (
                                    <Plus size={14} />
                                  )}
                                  Add Attachment
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
                      </div>
                    )}
                    <input
                      id="issue-detail-file-upload"
                      type="file"
                      className="hidden"
                      onChange={handleAttachmentUpload}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="comments" className="pt-2">
                  <div className="pt-2">
                    {comments && comments.length > 0 ? (
                      <div className="border border-border rounded-lg overflow-hidden divide-y divide-border bg-accent/5 backdrop-blur-sm max-h-[240px] overflow-y-auto custom-scrollbar">
                        {comments.map((comment) => (
                          <div
                            key={comment._id}
                            className="group relative flex gap-4 px-4 py-2 hover:bg-accent/10 transition-colors duration-150"
                          >
                            <Avatar className="h-8 w-8 border border-border/50 shrink-0 shadow-sm">
                              <AvatarImage src={comment.userImage} />
                              <AvatarFallback className="bg-muted text-muted-foreground text-[10px] font-bold">
                                {comment.userName.charAt(0)}
                              </AvatarFallback>
                            </Avatar>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-semibold text-foreground capitalize truncate font-inter">
                                  {comment.userName}
                                </span>
                                <span className="text-[10px] text-muted-foreground/60 font-mono">
                                  {format(comment.createdAt, "MMM d, h:mm a")}
                                </span>
                              </div>
                              <p className="text-[12px] text-muted-foreground leading-relaxed break-words font-inter">
                                {comment.comment}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center border border-dashed border-neutral-200 dark:border-accent p-10 rounded-2xl justify-center text-center bg-neutral-50 dark:bg-accent/10">
                        <div className="p-3 rounded-full bg-muted/50 text-muted-foreground/40 group-hover:scale-110 transition-transform">
                          <MessagesSquare className="w-7 h-7" />
                        </div>
                        <div>
                          <p className="text-sm text-foreground/70 font-medium">
                            No comments yet
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Be the first to start the discussion
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {activeTab === "comments" && (
            <div className="px-4 py-5 border-t border-border bg-sidebar backdrop-blur-md sticky bottom-0 z-20 shrink-0">
              <div className="relative">
                <div className="relative flex items-center bg-accent/40 border border-border rounded-sm overflow-hidden focus-within:border-primary/20 transition-all duration-300">
                  <Input
                    placeholder="Drop a comment or update..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendComment();
                      }
                    }}
                    className="flex-1 bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-xs h-10 px-5 placeholder:text-muted-foreground/40"
                  />
                  <div className="pr-2">
                    <Button
                      size="icon"
                      onClick={handleSendComment}
                      disabled={!commentText.trim()}
                      className="h-8 w-8 rounded-md transition-all duration-300"
                    >
                      <Send size={14} />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </SheetContent>

      <StorageLimitDialog
        isOpen={showStorageLimitDialog}
        onClose={() => setShowStorageLimitDialog(false)}
        ownerName={owner?.name}
        ownerEmail={owner?.email}
      />
    </Sheet>
  );
};
