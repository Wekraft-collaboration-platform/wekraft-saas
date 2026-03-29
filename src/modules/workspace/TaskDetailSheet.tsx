"use client";

import React, { useState } from "react";
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Clock,
  Calendar,
  Tag,
  Users,
  AlertCircle,
  MessageSquare,
  Paperclip,
  X,
  CheckCircle2,
  Trash2,
  Copy,
  ChevronRight,
  Send,
  Plus,
  Maximize2,
  ExternalLink,
  Edit2,
  MoreVertical,
  FileText,
  FileSpreadsheet,
  Bug
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { toast } from "sonner";
import { Task } from "@/types/types";

interface TaskDetailSheetProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
}

const statusColors: Record<string, string> = {
  "not started": "bg-slate-500/10 text-slate-500 border-slate-500/20",
  inprogress: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  reviewing: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  testing: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
  completed: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  issue: "bg-red-500/10 text-red-500 border-red-500/20",
};

const priorityConfig: Record<string, { label: string; color: string; icon: any }> = {
  low: { label: "Low", color: "text-green-500 bg-green-500/10", icon: CheckCircle2 },
  medium: { label: "Medium", color: "text-purple-500 bg-purple-500/10", icon: AlertCircle },
  high: { label: "High", color: "text-red-500 bg-red-500/10", icon: AlertCircle },
  none: { label: "None", color: "text-slate-500 bg-slate-500/10", icon: CheckCircle2 },
};

export const TaskDetailSheet = ({ task, isOpen, onClose }: TaskDetailSheetProps) => {
  const [commentText, setCommentText] = useState("");
  const [activeTab, setActiveTab] = useState("comments");

  const comments = useQuery(api.workspace.getComments, task ? { taskId: task._id } : "skip");
  const createComment = useMutation(api.workspace.createComment);

  if (!task) return null;

  const priority = priorityConfig[task.priority || "none"] || priorityConfig.none;

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

            <div className="px-4 py-2 space-y-2">
              {/* Title Section */}
              <div className="">
                <h1 className="text-xl font-semibold tracking-tight text-primary capitalize max-w-[300px] truncate leading-tight">
                  {task.title}
                </h1>
              </div>

              {/* Stats Grid */}
              <div className="space-y-4  mt-5">
                <div className="grid grid-cols-[120px_1fr] items-center">
                  <div className="flex items-center gap-2.5 text-muted-foreground text-sm font-medium">
                    <Calendar size={16} /> Duration
                  </div>
                  <div className="text-xs font-semibold text-primary/80">
                    {task.estimation ? (
                      <>
                        {format(task.estimation.startDate, "d MMMM")} - {format(task.estimation.endDate, "d MMMM, yyyy")}
                      </>
                    ) : "Not set"}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-x-6 gap-y-5 justify-items-start w-full items-center">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
                      <Clock size={14} /> Status
                    </div>
                    <div>
                      <Badge className={cn("px-3 py-1 rounded-full text-[10px]  border capitalize", statusColors[task.status] || "bg-neutral-800")}>
                        {task.status}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
                      <Users size={14} /> Assignee
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2">
                        {task.assignedTo?.map((person, i) => (
                          <Avatar key={i} className="w-7 h-7 border-2 border-neutral-900">
                            <AvatarImage src={person.avatar} />
                            <AvatarFallback className="text-[10px] bg-neutral-800 text-neutral-400">
                              {person.name[0]}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                      </div>
                      <Button variant="outline" size="sm" className="h-6 px-2 text-[10px] bg-neutral-800/30 border-neutral-700/50 text-neutral-400 hover:text-white rounded-lg gap-1">
                        <Plus size={10} /> Invite
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
                      <AlertCircle size={14} /> Priority
                    </div>
                    <div>
                      <Badge className={cn("px-3 py-1 rounded-full text-[10px]  border capitalize", priority.color)}>
                        <priority.icon size={11} className="mr-1.5 inline" />
                        {priority.label}
                      </Badge>
                    </div>
                  </div>

                  {task.linkWithCodebase && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
                        <Tag size={14} /> Link Code
                      </div>
                      <div className="text-[11px] font-medium text-blue-400 truncate max-w-[150px] bg-blue-500/10 px-2 py-1 rounded-md border border-blue-500/20">
                        {task.linkWithCodebase.split("/").pop()}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Description & Attachments Tabs */}
              <div className="space-y-4 mt-5">
                <Tabs defaultValue="description" className="w-full">
                  <TabsList className="w-full">
                    <TabsTrigger value="description" className="text-xs">Description</TabsTrigger>
                    <TabsTrigger value="attachments" className="text-xs">Attachments</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="description" className=" pt-2">
                    <div className="p-4 border-2 border-dashed border-neutral-800/80 rounded-2xl bg-neutral-900/40">
                      <p className="text-primary/80 text-sm leading-relaxed whitespace-pre-wrap h-[70px]">
                        {task.description || "No description provided."}
                      </p>
                    </div>
                  </TabsContent>

                  <TabsContent value="attachments" className="pt-2">
                    <div className="flex flex-wrap gap-4 items-center justify-center p-4 border-2 border-dashed border-neutral-800/50 rounded-2xl bg-neutral-900/20">
                      <div className="text-center space-y-2">
                        <Paperclip size={24} className="text-primary/20 mx-auto" />
                        <p className="text-primary/40 text-xs font-medium">No attachments yet</p>
                        <Button variant="outline" size="sm" className="h-8 px-3 text-[10px] bg-neutral-800/30 border-neutral-800 text-primary/60 hover:text-primary rounded-lg gap-1.5 mt-2">
                          <Plus size={12} /> Add Attachment
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>

          {/* Comment Input Fixed at Bottom */}
          {/* <div className="p-1 border-t border-neutral-800/50 bg-neutral-900/80 backdrop-blur-md">
            <div className="relative group">
              <textarea 
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendComment();
                  }
                }}
                placeholder="Write a comment..." 
                className="w-full bg-neutral-800/50 border border-neutral-700/50 rounded-2xl p-4 pr-14 text-sm focus:outline-none focus:ring-1 focus:ring-white/20 transition-all resize-none min-h-[90px] text-neutral-200 placeholder:text-neutral-500 scrollbar-hide"
              />
              <div className="absolute bottom-4 right-4 animate-in fade-in zoom-in duration-300">
                <Button 
                   size="icon" 
                   onClick={handleSendComment}
                   className="h-8 w-8 rounded-full bg-white text-neutral-900 hover:bg-neutral-200 hover:scale-105 transition-all shadow-lg active:scale-95 disabled:opacity-50"
                   disabled={!commentText.trim()}
                >
                  <Send size={14} />
                </Button>
              </div>
            </div>
          </div> */}
        </div>
      </SheetContent>
    </Sheet>
  );
};
