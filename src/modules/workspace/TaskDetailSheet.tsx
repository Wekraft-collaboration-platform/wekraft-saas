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
  Paperclip,
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
  Trash2,
  ExternalLink,
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
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Send, User, Check } from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { toast } from "sonner";
import { Task } from "@/types/types";
import {
  priorityIcons2,
  statusColors,
  statusIcons,
  statusIconsNoColors,
} from "@/lib/static-store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";
import { EditTaskDialog } from "./EditTaskDialog";
import { MoveToSprintDialog } from "./MoveToSprintDialog";
import { StorageLimitDialog } from "./StorageLimitDialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TaskDetailSheetProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
}

const priorityConfig: Record<string, { label: string; color: string }> = {
  low: { label: "low", color: "text-green-500 bg-green-500/10" },
  medium: { label: "medium", color: "text-purple-500 bg-purple-500/10" },
  high: { label: "high", color: "text-red-500 bg-red-500/10" },
  none: { label: "none", color: "text-slate-500 bg-slate-500/10" },
};

export const TaskDetailSheet = ({
  task,
  isOpen,
  onClose,
}: TaskDetailSheetProps) => {
  const [commentText, setCommentText] = useState("");
  const [activeTab, setActiveTab] = useState("comments");
  const [cachedTask, setCachedTask] = useState<Task | null>(null);

  useEffect(() => {
    if (task) {
      setCachedTask(task);
    }
  }, [task]);

  const currentTask = task || cachedTask;

  const comments = useQuery(
    api.workspace.getComments,
    currentTask ? { taskId: currentTask._id } : "skip",
  );
  const createComment = useMutation(api.workspace.createComment);

  const creator = useQuery(
    api.user.getUserById,
    currentTask ? { userId: currentTask.createdByUserId as any } : "skip",
  );

  const completer = useQuery(
    api.user.getUserById,
    currentTask?.finalCompletedBy
      ? { userId: currentTask.finalCompletedBy as any }
      : "skip",
  );

  const members = useQuery(
    api.project.getProjectMembers,
    currentTask ? { projectId: currentTask.projectId } : "skip",
  );

  const updateAssignees = useMutation(api.workspace.updateTaskAssignees);
  const markAsIssue = useMutation(api.workspace.markTaskAsIssue);
  const addAttachment = useMutation(api.workspace.addTaskAttachment);
  const removeAttachment = useMutation(api.workspace.removeTaskAttachment);

  const project = useQuery(
    api.project.getProjectById,
    currentTask ? { projectId: currentTask.projectId } : "skip",
  );

  const [isMarkingIssue, setIsMarkingIssue] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showStorageLimitDialog, setShowStorageLimitDialog] = useState(false);

  const owner = useQuery(
    api.user.getUserById,
    project?.ownerId ? { userId: project.ownerId } : "skip",
  );

  if (!currentTask) return null;

  const priority =
    priorityConfig[currentTask.priority || "none"] || priorityConfig.none;

  const handleSendComment = async () => {
    if (!commentText.trim()) return;
    try {
      await createComment({
        taskId: currentTask._id,
        comment: commentText.trim(),
      });
      setCommentText("");
    } catch (error) {
      toast.error("Failed to post comment");
    }
  };

  const handleAssignMember = async (member: any, isSelected: boolean) => {
    if (!currentTask) return;

    let newAssignees = currentTask.assignees || [];
    if (isSelected) {
      newAssignees = newAssignees.filter((m) => m.userId !== member.userId);
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
      await updateAssignees({
        taskId: currentTask._id,
        assignees: newAssignees.map((a) => ({
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

  const handleMarkAsIssue = async () => {
    if (!currentTask) return;
    setIsMarkingIssue(true);
    const toastId = toast.loading("Marking task as issue...");
    try {
      await markAsIssue({ taskId: currentTask._id });
      toast.success("Task marked as issue successfully", { id: toastId });
      setShowConfirmDialog(false);
    } catch (error) {
      toast.error("Failed to mark task as issue", { id: toastId });
    } finally {
      setIsMarkingIssue(false);
    }
  };

  const handleAttachmentUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file || !currentTask) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File too large. Max 10MB allowed.");
      return;
    }

    const toastId = toast.loading(`Uploading ${file.name}...`);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("projectId", currentTask.projectId);

      const response = await fetch("/api/attachments", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      await addAttachment({
        taskId: currentTask._id,
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
    if (!currentTask) return;
    try {
      await removeAttachment({
        taskId: currentTask._id,
        url,
      });
      // Delete from S3
      const res = await fetch("/api/attachments", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      if (res.ok) {
        console.log("[Attachments] S3 delete successful:", url);
      } else {
        console.warn("[Attachments] S3 delete failed:", await res.text());
      }
      toast.success("Attachment removed");
    } catch (error) {
      toast.error("Failed to remove attachment");
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-lg w-full p-0 border-l border-border bg-sidebar">
        <div className="flex flex-col h-full">
          {/* Top Actions */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-accent">
            <div className="flex items-center gap-3">
              <EditTaskDialog
                projectName={project?.projectName || "Project"}
                projectId={currentTask.projectId}
                repoFullName={project?.repoFullName}
                ownerClerkId={project?.ownerClerkId}
                task={currentTask}
                trigger={
                  <Button variant="default" size="sm" className="text-[10px]">
                    <Edit2 size={12} /> Edit Task
                  </Button>
                }
              />
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "text-[10px]",
                  currentTask.isBlocked && "text-primary bg-red-500!",
                )}
                onClick={() => setShowConfirmDialog(true)}
                disabled={currentTask.isBlocked || isMarkingIssue}
              >
                {isMarkingIssue ? (
                  <Loader2 className="w-3 h-3 animate-spin mr-1" />
                ) : (
                  <Bug size={12} />
                )}
                {currentTask.isBlocked ? "Blocked by Issue" : "Mark as Issue"}
              </Button>
              <MoveToSprintDialog
                trigger={
                  <Button variant="outline" size="sm" className="text-[10px]">
                    <FastForward size={12} /> Add to Sprint
                  </Button>
                }
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-6 scrollbar-hide space-y-4.5">
            {/* Title Section */}
            <div className="flex flex-col space-y-3">
              <h1 className="text-xl font-semibold tracking-tight text-primary capitalize max-w-[300px] truncate leading-tight">
                {currentTask.title}
              </h1>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {currentTask.type ? (
                    <div
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs border transition-all duration-200",
                        currentTask.type.color === "green" &&
                        "bg-emerald-500/10 text-primary/80 border-emerald-400/20 shadow-[0_0_10px_rgba(52,211,153,0.05)]",
                        currentTask.type.color === "yellow" &&
                        "bg-yellow-500/10 text-primary/80 border-yellow-400/20 shadow-[0_0_10px_rgba(250,204,21,0.05)]",
                        currentTask.type.color === "purple" &&
                        "bg-purple-500/10 text-primary/80 border-purple-400/20 shadow-[0_0_10px_rgba(192,132,252,0.05)]",
                        currentTask.type.color === "blue" &&
                        "bg-blue-500/10 text-primary/80 border-blue-400/20 shadow-[0_0_10px_rgba(96,165,250,0.05)]",
                        currentTask.type.color === "grey" &&
                        "bg-muted text-muted-foreground border-border",
                      )}
                    >
                      {currentTask.type.label}
                    </div>
                  ) : (
                    <span className="text-[10px] text-muted-foreground tracking-widest px-2">
                      —-
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 ml-2">
                  <span className="text-xs text-muted-foreground">
                    Created by:{" "}
                  </span>
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
            <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg bg-neutral-100/50 dark:bg-neutral-900/10 overflow-hidden">
              {/* Row 1: Duration */}
              <div className="grid grid-cols-[100px_1fr] items-center px-4 py-3 border-b border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium">
                  <Calendar size={14} className="text-muted-foreground/80" /> Duration
                </div>
                <div className="text-xs text-primary/80 pl-2">
                  {currentTask.estimation ? (
                    <>
                      {format(currentTask.estimation.startDate, "d MMMM")} -{" "}
                      {format(currentTask.estimation.endDate, "d MMMM, yyyy")}
                    </>
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
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300 capitalize">
                      {statusIconsNoColors[currentTask.status] || (
                        <Circle size={10} />
                      )}
                      {currentTask.status}
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
                          {currentTask.assignees &&
                            currentTask.assignees.length > 0 ? (
                            <div className="flex items-center gap-2">
                              <div className="flex -space-x-1.5">
                                {currentTask.assignees.map((person, i) => (
                                  <Avatar
                                    key={i}
                                    className="w-6.5 h-6.5 border-2 border-white dark:border-neutral-900 shadow-sm"
                                  >
                                    <AvatarImage src={person.avatar} />
                                    <AvatarFallback className="text-[10px] bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                                      {person.name[0]}
                                    </AvatarFallback>
                                  </Avatar>
                                ))}
                              </div>
                              <div className="w-6 h-6 rounded-full border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-800/30 hover:bg-neutral-200 dark:hover:bg-neutral-800 flex items-center justify-center text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors">
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
                          const isSelected = currentTask.assignees?.some(
                            (m) => m.userId === member.userId,
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
                                  isSelected && "text-blue-500 font-bold",
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

              {/* Row 3: Priority & Codebase Link */}
              <div className="grid grid-cols-2 divide-x divide-neutral-200 dark:divide-neutral-800 border-t border-neutral-200 dark:border-neutral-800">
                {/* Priority */}
                <div className="px-4 py-3 space-y-4">
                  <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium">
                    <AlertCircle size={14} className="text-muted-foreground/80" /> Priority
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-primary capitalize pl-1">
                    {priorityIcons2[currentTask.priority || "none"]}
                    {priority.label}
                  </div>
                </div>

                {/* Link with Codebase */}
                <div className="px-4 py-3 space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium">
                    <Tag size={14} className="text-muted-foreground/80" /> Codebase
                  </div>
                  <div>
                    {currentTask.linkWithCodebase ? (
                      <div className="text-xs font-medium text-primary truncate max-w-[190px] pl-1 flex items-center gap-1">
                        <GitBranch size={12} className="inline text-muted-foreground" />{" "}
                        {currentTask.linkWithCodebase}
                      </div>
                    ) : (
                      <p className="text-[11px] text-muted-foreground italic pl-1 flex items-center gap-1">
                        <GitBranch size={12} className="inline text-muted-foreground/55" /> No codebase
                        linked
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4">
              {currentTask.status === "completed" ? (
                <div className="flex items-center justify-between bg-emerald-950/10 border border-emerald-900/30 rounded-xl p-3.5 shadow-sm transition-all duration-300">
                  <p className="text-xs text-muted-foreground flex items-center">
                    <Check size={14} className="mr-2 text-emerald-500" />
                    Completed at:
                    <span className="text-xs text-primary ml-2 font-normal">
                      {currentTask.finalCompletedAt
                        ? format(currentTask.finalCompletedAt, "d MMMM, yyyy")
                        : format(currentTask.updatedAt, "d MMMM, yyyy")}
                    </span>
                  </p>
                  <div className="flex items-center gap-2 border-l border-neutral-800 pl-4 shrink-0">
                    <span className="text-[10px] text-muted-foreground">
                      By:
                    </span>
                    <Avatar className="w-6 h-6 border border-neutral-800">
                      <AvatarImage src={completer?.avatarUrl || ""} />
                      <AvatarFallback className="text-[9px] bg-neutral-800 text-neutral-400 font-bold">
                        {completer?.name?.[0]?.toUpperCase() || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-neutral-300 truncate max-w-[100px]">
                      {completer?.name || "Loading..."}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 border border-neutral-200 dark:border-neutral-800 bg-neutral-100/50 dark:bg-neutral-900/5 rounded-xl p-3 text-muted-foreground text-xs">
                  <CalendarClock size={14} className="text-muted-foreground/80" />
                  <span>Last updated:</span>
                  <span className="text-primary/95 ml-1">
                    {format(currentTask.updatedAt, "d MMMM, yyyy")}
                  </span>
                </div>
              )}
            </div>

            {/* Description & Attachments Tabs */}
            <div className="space-y-4 mt-6">
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="w-full">
                  <TabsTrigger value="description" className="text-xs">
                    Description <TextQuote className="w-4 h-4" />{" "}
                  </TabsTrigger>
                  <TabsTrigger value="attachments" className="text-xs">
                    Attachments <Paperclip className="w-4 h-4" />{" "}
                  </TabsTrigger>
                  <TabsTrigger value="comments" className="text-xs">
                    Comments <MessagesSquare className="w-4 h-4" />{" "}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="description" className="pt-4">
                  {currentTask.description ? (
                    <div className="p-5 rounded-xl bg-neutral-100/50 dark:bg-neutral-950/10 border border-neutral-200 dark:border-neutral-800 group">
                      <p className="text-foreground/90 text-sm leading-relaxed whitespace-pre-wrap min-h-[100px] selection:bg-primary/20">
                        {currentTask.description}
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-8 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-xl bg-neutral-100/30 dark:bg-neutral-950/5">
                      <div className="p-3 rounded-full bg-neutral-100 dark:bg-neutral-900 text-muted-foreground transition-all duration-300">
                        <FileText size={24} />
                      </div>
                      <p className="mt-4 text-sm font-medium text-foreground/70">
                        No description provided
                      </p>
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        Click "Edit Task" above to add more details.
                      </p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="attachments" className="pt-2">
                  <div className="p-2 ">
                    {project?.ownerAccountType === "free" && (
                      <div className="mb-4 p-3 rounded-md bg-blue-500/5 border border-blue-500/20 text-center">
                        <p className="text-xs font-medium">
                          Project owner must be Plus account to use attachments.
                        </p>
                      </div>
                    )}
                    {currentTask.attachments &&
                      currentTask.attachments.length > 0 ? (
                      <div className="grid grid-cols-1 gap-2 w-full">
                        {currentTask.attachments.map((file, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between bg-neutral-50 dark:bg-accent/20 border border-neutral-200 dark:border-[#333] rounded-xl px-4 py-2 group hover:border-blue-500/50 transition-all duration-200"
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
                                      .getElementById("detail-file-upload")
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
                                      .getElementById("detail-file-upload")
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
                      id="detail-file-upload"
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
                      <div className="flex flex-col items-center border border-dashed border-accent p-10 rounded-2xl justify-center text-center bg-accent/10">
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
            <div className="px-4 py-4 border-t border-border bg-card  sticky bottom-0 z-20">
              <div className="relative">
                <div className="relative flex items-center bg-accent/40 border border-border rounded-xl overflow-hidden focus-within:border-primary/20 transition-all duration-300">
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
                      className={cn(
                        "h-8 w-8 rounded-lg transition-all duration-300",
                      )}
                    >
                      <Send
                        size={14}
                        className={cn(
                          "transition-transform",
                        )}
                      />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </SheetContent>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent className="bg-sidebar border-accent">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-primary">
              Are you sure?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              This will mark the task as blocked and create a new issue. This
              action cannot be easily undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border-accent text-primary hover:bg-accent/20">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleMarkAsIssue}
              className="bg-blue-600! hover:bg-blue-700! text-white! "
              disabled={isMarkingIssue}
            >
              {isMarkingIssue ? "Marking..." : "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <StorageLimitDialog
        isOpen={showStorageLimitDialog}
        onClose={() => setShowStorageLimitDialog(false)}
        ownerName={owner?.name}
        ownerEmail={owner?.email}
      />
    </Sheet>
  );
};
