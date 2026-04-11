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
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { toast } from "sonner";
import { Task } from "@/types/types";
import { priorityIcons2, statusColors, statusIcons } from "@/lib/static-store";

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

  if (!currentTask) return null;

  const priority =
    priorityConfig[currentTask.priority || "none"] || priorityConfig.none;

  const handleSendComment = async () => {
    if (!commentText.trim()) return;
    try {
      await createComment({
        taskId: task._id,
        comment: commentText.trim(),
      });
      setCommentText("");
    } catch (error) {
      toast.error("Failed to post comment");
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-lg w-full p-0 border-l border-neutral-800 bg-sidebar">
        <div className="flex flex-col h-full">
          {/* Top Actions */}
          <div className="flex items-center justify-between px-6 py-3 border-b border-neutral-800/50">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="text-[10px]">
                <Edit2 size={12} /> Edit Task
              </Button>
              <Button variant="outline" size="sm" className="text-[10px]">
                <Bug size={12} /> Mark as Issue
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
                          "bg-neutral-500/10 text-neutral-400 border-neutral-400/20",
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
                    <AvatarFallback className="text-sm bg-neutral-800 text-neutral-400">
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
                      {statusIcons[currentTask.status] || <Circle size={12} />}
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
                    <div className="flex -space-x-2">
                      {currentTask.assignedTo?.map((person, i) => (
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
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-6 px-2 text-[10px] bg-neutral-800/30 border-neutral-700/50 text-neutral-400 hover:text-white rounded-lg gap-1"
                    >
                      <Plus size={10} /> Invite
                    </Button>
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
                      No codebase linked
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="my-3">
              <p className="text-sm text-muted-foreground">
                <CalendarClock size={16} className=" mr-1 inline -mt-1" /> Last
                updated:{" "}
                <span className="text-xs font-medium ml-3 text-primary">
                  {format(currentTask.updatedAt, "d MMMM, yyyy")}
                </span>
              </p>
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

                <TabsContent value="description" className=" pt-2">
                  <div className="p-4 border-2 border-dashed border-neutral-800/80 rounded-2xl bg-neutral-900/40">
                    <p className="text-primary/80 text-sm leading-relaxed whitespace-pre-wrap h-[70px]">
                      {currentTask.description || "No description provided."}
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="attachments" className="pt-2">
                  <div className="flex flex-wrap gap-4 items-center justify-center p-4 border-2 border-dashed border-neutral-800/50 rounded-2xl bg-neutral-900/20">
                    <div className="text-center space-y-2">
                      <Paperclip
                        size={24}
                        className="text-primary/20 mx-auto"
                      />
                      <p className="text-primary/40 text-xs font-medium">
                        No attachments yet
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 px-3 text-[10px] bg-neutral-800/30 border-neutral-800 text-primary/60 hover:text-primary rounded-lg gap-1.5 mt-2"
                      >
                        <Plus size={12} /> Add Attachment
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="comments" className="pt-2">
                  <div className="pt-2">
                    {comments && comments.length > 0 ? (
                      <div className="border border-border/60 rounded-xl overflow-hidden divide-y divide-border/40 bg-card/30 backdrop-blur-sm max-h-[260px] py-6 overflow-y-auto">
                        {comments.map((comment) => (
                          <div
                            key={comment._id}
                            className="group relative flex gap-3 px-3 py-2.5 hover:bg-accent/30 transition-colors duration-150"
                          >
                            <Avatar className="h-5 w-5 border border-border/70 shrink-0 mt-0.5">
                              <AvatarImage src={comment.userImage} />
                              <AvatarFallback className="bg-muted text-muted-foreground text-[9px] uppercase font-bold">
                                {comment.userName.charAt(0)}
                              </AvatarFallback>
                            </Avatar>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-baseline gap-1.5 mb-0.5">
                                <span className="text-[11px] font-semibold text-primary/90 truncate max-w-[120px] font-mono">
                                  {comment.userName}
                                </span>
                                <span className="text-[9px] text-muted-foreground/50 whitespace-nowrap tabular-nums">
                                  {format(comment.createdAt, "MMM d, h:mm a")}
                                </span>
                              </div>
                              <p className="text-[11px] text-muted-foreground leading-relaxed break-words">
                                {comment.comment}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center border border-dashed border-border/60 p-6 rounded-xl justify-center text-center bg-accent/10 gap-2">
                        <MessagesSquare className="w-8 h-8 text-muted-foreground/30" />
                        <div>
                          <p className="text-xs text-primary/70 font-medium">
                            No comments yet
                          </p>
                          <p className="text-[10px] text-muted-foreground/50 mt-0.5">
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
            <div className="px-3 py-4 border-t border-border/60 bg-card/80 backdrop-blur-sm sticky bottom-0">
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Type your message..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendComment();
                    }
                  }}
                  className="flex-1 bg-transparent border-border/60 focus-visible:ring-0 focus-visible:ring-offset-0 text-[11px] h-8 px-3 placeholder:text-muted-foreground/30 rounded-lg"
                />
                <Button
                  size="icon"
                  onClick={handleSendComment}
                  disabled={!commentText.trim()}
                  className="h-8 w-8 shrink-0 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Send size={12} />
                </Button>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
