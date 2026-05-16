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
      });

      toast.success("Attachment added successfully", { id: toastId });
    } catch (error: any) {
      toast.error(error.message || "Failed to upload attachment", {
        id: toastId,
      });
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
      // Optionally delete from S3 too
      await fetch("/api/attachments", {
        method: "DELETE",
        body: JSON.stringify({ url }),
      });
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
              <Button variant="outline" size="sm" className="text-[10px]">
                <FastForward size={12} /> Add to Sprint
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4 scrollbar-hide">
            {/* Title Section */}
            <div className="flex flex-col space-y-2.5">
              <h1 className="text-xl font-semibold tracking-tight text-primary capitalize max-w-[300px] truncate leading-tight">
                {currentTask.title}
              </h1>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {currentTask.type ? (
                    <div
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold border transition-all duration-200",
                        currentTask.type.color === "green" &&
                          "bg-emerald-500/10 text-emerald-400 border-emerald-400/20 shadow-[0_0_10px_rgba(52,211,153,0.05)]",
                        currentTask.type.color === "yellow" &&
                          "bg-yellow-500/10 text-yellow-400 border-yellow-400/20 shadow-[0_0_10px_rgba(250,204,21,0.05)]",
                        currentTask.type.color === "purple" &&
                          "bg-purple-500/10 text-purple-400 border-purple-400/20 shadow-[0_0_10px_rgba(192,132,252,0.05)]",
                        currentTask.type.color === "blue" &&
                          "bg-blue-500/10 text-blue-400 border-blue-400/20 shadow-[0_0_10px_rgba(96,165,250,0.05)]",
                        currentTask.type.color === "grey" &&
                          "bg-muted text-muted-foreground border-border",
                      )}
                    >
                      <div
                        className={cn(
                          "w-1.5 h-1.5 rounded-full animate-pulse",
                          currentTask.type.color === "green" &&
                            "bg-emerald-400",
                          currentTask.type.color === "yellow" &&
                            "bg-yellow-400",
                          currentTask.type.color === "purple" &&
                            "bg-purple-400",
                          currentTask.type.color === "blue" && "bg-blue-400",
                          currentTask.type.color === "grey" && "bg-neutral-400",
                        )}
                      />
                      {currentTask.type.label}
                    </div>
                  ) : (
                    <span className="text-[10px] text-primary/10 tracking-widest px-2">
                      —
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

            {/* Stats Grid */}
            <div className="space-y-4  mt-6">
              <div className="grid grid-cols-[120px_1fr] items-center">
                <div className="flex items-center gap-2.5 text-muted-foreground text-sm font-medium">
                  <Calendar size={16} /> Duration
                </div>
                <div className="text-xs font-semibold text-primary/80">
                  {currentTask.estimation ? (
                    <>
                      {format(currentTask.estimation.startDate, "d MMMM")} -{" "}
                      {format(currentTask.estimation.endDate, "d MMMM, yyyy")}
                    </>
                  ) : (
                    "Not set"
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-x-6 gap-y-5 justify-items-start w-full items-center">
                {/* STATUS */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
                    <Clock size={14} /> Status
                  </div>
                  <div>
                    <p
                      className={cn(
                        "px-3 py-1 flex items-center bg-accent rounded-full text-[10px] border capitalize gap-1.5",
                      )}
                    >
                      {statusIconsNoColors[currentTask.status] || (
                        <Circle size={12} />
                      )}
                      {currentTask.status}
                    </p>
                  </div>
                </div>

                {/* ASSIGNEE */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
                    <Users size={14} /> Assignee
                  </div>
                  <div className="flex items-center gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <div className="cursor-pointer">
                          {currentTask.assignees &&
                          currentTask.assignees.length > 0 ? (
                            <div className="flex -space-x-2">
                              {currentTask.assignees.map((person, i) => (
                                <Avatar
                                  key={i}
                                  className="w-7 h-7 border-2 border-neutral-900"
                                >
                                  <AvatarImage src={person.avatar} />
                                  <AvatarFallback className="text-[10px] bg-neutral-800 text-neutral-400">
                                    {person.name[0]}
                                  </AvatarFallback>
                                </Avatar>
                              ))}
                            </div>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-6 px-2 text-[10px] bg-muted/50 border-border/50 text-muted-foreground hover:text-foreground rounded-lg gap-1"
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

                {/* PRIORITY */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
                    <AlertCircle size={14} /> Priority
                  </div>
                  <div>
                    <p
                      className={
                        "flex items-center gap-2 text-xs capitalize text-primary ml-2"
                      }
                    >
                      {priorityIcons2[currentTask.priority || "none"]}
                      {priority.label}
                    </p>
                  </div>
                </div>

                {/* LINK WITH CODEBASE */}
                {currentTask.linkWithCodebase ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
                      <Tag size={14} /> Link Code
                    </div>
                    <div className="text-xs font-medium text-primary ml-2">
                      <GitBranch size={12} className="inline" />{" "}
                      {currentTask.linkWithCodebase.split("/").pop()}
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs text-muted-foreground">
                      <GitBranch size={12} className="inline mr-1" /> No codebase
                      linked
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="my-3">
              {currentTask.status === "completed" ? (
                <div className="flex items-center justify-between bg-emerald-100/5 border border-emerald-500/20 rounded-md p-3 shadow-sm transition-all duration-300">
                  <p className="text-xs text-muted-foreground flex items-center">
                    <Check size={16} className="mr-2 text-emerald-500" />
                    Completed at:
                    <span className="text-xs font-semibold ml-3 text-primary">
                      {currentTask.finalCompletedAt
                        ? format(currentTask.finalCompletedAt, "d MMMM, yyyy")
                        : format(currentTask.updatedAt, "d MMMM, yyyy")}
                    </span>
                  </p>
                  <div className="flex items-center gap-2 border-l border-primary/60 pl-4">
                    <span className="text-[10px] text-muted-foreground">
                      By:
                    </span>
                    <Avatar className="w-5 h-5 border border-emerald-500/30">
                      <AvatarImage src={completer?.avatarUrl || ""} />
                      <AvatarFallback className="text-[8px] bg-muted text-muted-foreground">
                        {completer?.name?.[0] || "?"}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  <CalendarClock size={16} className=" mr-1 inline -mt-1" />{" "}
                  Last updated:{" "}
                  <span className="text-xs font-medium ml-3 text-primary">
                    {format(currentTask.updatedAt, "d MMMM, yyyy")}
                  </span>
                </p>
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
                    <div className="p-5 rounded-2xl bg-accent/30 border border-border backdrop-blur-sm shadow-inner group">
                      <p className="text-foreground/90 text-sm leading-relaxed whitespace-pre-wrap min-h-[100px] selection:bg-primary/20">
                        {currentTask.description}
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-border rounded-2xl bg-accent/10 ">
                      <div className="p-3 rounded-full bg-muted/50 text-muted-foreground  transition-all duration-300 shadow-lg">
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
                            className="flex items-center justify-between bg-accent/20 border border-[#333] rounded-xl px-4 py-2 group hover:border-blue-500/50 transition-all duration-200"
                          >
                            <div className="flex items-center gap-3 overflow-hidden">
                              <div className="p-2 bg-blue-500/10 rounded-lg">
                                <FileText className="w-5 h-5 text-blue-400" />
                              </div>
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
                                onClick={() => window.open(file.url, "_blank")}
                              >
                                <ExternalLink size={14} />
                              </Button>
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
                          </div>
                        ))}
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-9 px-3 text-xs bg-muted/30 border-border text-muted-foreground hover:text-foreground rounded-xl gap-2 mt-2 border-dashed"
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
                    ) : (
                      <div className="text-center space-y-3 py-4 w-full">
                        <Paperclip
                          size={32}
                          className="text-muted-foreground/20 mx-auto"
                        />
                        <p className="text-muted-foreground text-xs font-medium">
                          No attachments yet
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-9 px-4 text-xs bg-muted/30 border-border text-muted-foreground hover:text-foreground rounded-xl gap-2 mt-2"
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
                      <div className="border border-border rounded-lg overflow-hidden divide-y divide-border bg-accent/5 backdrop-blur-sm max-h-[350px] overflow-y-auto custom-scrollbar">
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
            <div className="px-4 py-5 border-t border-border/50 bg-background/95 backdrop-blur-md sticky bottom-0 z-20">
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
    </Sheet>
  );
};
