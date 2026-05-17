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
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
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

interface IssueDetailSheetProps {
  issue: any | null;
  isOpen: boolean;
  onClose: () => void;
}

const severityConfig: Record<string, { label: string; color: string; bg: string }> = {
  low: { label: "low", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-400/20" },
  medium: { label: "medium", color: "text-orange-400", bg: "bg-orange-500/10 border-orange-400/20" },
  critical: { label: "critical", color: "text-red-500", bg: "bg-red-500/10 border-red-500/20" },
  none: { label: "none", color: "text-slate-500", bg: "bg-slate-500/10 border-slate-500/20" },
};

const statusColors: Record<string, string> = {
  "not opened": "bg-neutral-500/15 border-neutral-500/30 text-neutral-400",
  opened: "bg-blue-500/15 border-blue-500/30 text-blue-400",
  reopened: "bg-purple-500/15 border-purple-500/30 text-purple-400",
  closed: "bg-emerald-500/15 border-emerald-500/30 text-emerald-400",
};

const envConfig: Record<string, string> = {
  local: "bg-slate-500/10 text-slate-400 border-slate-400/20",
  dev: "bg-blue-500/10 text-blue-400 border-blue-400/20",
  staging: "bg-purple-500/10 text-purple-400 border-purple-400/20",
  production: "bg-rose-500/10 text-rose-500 border-rose-500/20",
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

  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isAssigningSprint, setIsAssigningSprint] = useState(false);

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
      <SheetContent className="sm:max-w-lg w-full p-0 border-l border-border bg-sidebar overflow-hidden flex flex-col h-full">
        {/* Top Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-accent shrink-0">
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
                realIssue.status === "closed" && "text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 border-emerald-500/20"
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

            {/* Add to Sprint Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="text-[10px]" disabled={isAssigningSprint}>
                  {isAssigningSprint ? (
                    <Loader2 className="w-3 h-3 animate-spin mr-1" />
                  ) : (
                    <FastForward size={12} className="mr-1" />
                  )}
                  {activeSprint ? activeSprint.sprintName : "Add to Sprint"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-popover border-border text-popover-foreground w-48">
                <div className="text-xs text-center font-medium p-2 border-b border-accent">
                  Move to Sprint
                </div>
                <DropdownMenuItem
                  onClick={() => handleAssignSprint(undefined)}
                  className="text-xs cursor-pointer flex items-center justify-between"
                >
                  <span className="text-muted-foreground">None (Backlog)</span>
                  {!realIssue.sprintId && <Check className="w-3.5 h-3.5 text-blue-500" />}
                </DropdownMenuItem>
                {sprints?.filter(s => s.status !== "completed").map((sprint) => {
                  const isCurrent = sprint._id === realIssue.sprintId;
                  return (
                    <DropdownMenuItem
                      key={sprint._id}
                      onClick={() => handleAssignSprint(sprint._id)}
                      className="text-xs cursor-pointer flex items-center justify-between"
                    >
                      <span>{sprint.sprintName}</span>
                      {isCurrent && <Check className="w-3.5 h-3.5 text-blue-500" />}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 scrollbar-hide">
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
                    realIssue.type === "github" && "bg-neutral-500/10 text-neutral-400 border-neutral-400/20 shadow-[0_0_10px_rgba(156,163,175,0.05)]",
                    realIssue.type === "manual" && "bg-blue-500/10 text-blue-400 border-blue-400/20 shadow-[0_0_10px_rgba(96,165,250,0.05)]",
                    realIssue.type === "task-issue" && "bg-purple-500/10 text-purple-400 border-purple-400/20 shadow-[0_0_10px_rgba(192,132,252,0.05)]",
                  )}
                >
                  <div
                    className={cn(
                      "w-1.5 h-1.5 rounded-full animate-pulse",
                      realIssue.type === "github" && "bg-neutral-400",
                      realIssue.type === "manual" && "bg-blue-400",
                      realIssue.type === "task-issue" && "bg-purple-400",
                    )}
                  />
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

          {/* Stats Grid */}
          <div className="space-y-4 mt-6">
            <div className="grid grid-cols-[120px_1fr] items-center">
              <div className="flex items-center gap-2.5 text-muted-foreground text-sm font-medium">
                <Calendar size={16} /> Due Date
              </div>
              <div className="text-xs font-semibold text-primary/80">
                {realIssue.due_date ? (
                  format(realIssue.due_date, "d MMMM, yyyy")
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
                      "px-3 py-1 flex items-center rounded-full text-[10px] border capitalize gap-1.5",
                      statusColors[realIssue.status] || "bg-accent text-neutral-400"
                    )}
                  >
                    <Circle size={10} className="fill-current w-2 h-2" />
                    {realIssue.status}
                  </p>
                </div>
              </div>

              {/* ASSIGNEES */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
                  <Users size={14} /> Assignees
                </div>
                <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <div className="cursor-pointer">
                        {realIssue.assignedTo && realIssue.assignedTo.length > 0 ? (
                          <div className="flex -space-x-2">
                            {realIssue.assignedTo.map((person: any, i: number) => (
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

              {/* SEVERITY */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
                  <Zap size={14} /> Severity
                </div>
                <div>
                  <p
                    className={cn(
                      "px-3 py-1 flex items-center rounded-full text-[10px] border capitalize gap-1.5",
                      severity.bg,
                      severity.color
                    )}
                  >
                    {realIssue.severity || "No Severity"}
                  </p>
                </div>
              </div>

              {/* ENVIRONMENT */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
                  <Globe size={14} /> Environment
                </div>
                <div>
                  {realIssue.environment ? (
                    <p
                      className={cn(
                        "px-3 py-1 flex items-center rounded-full text-[10px] border capitalize gap-1.5",
                        envConfig[realIssue.environment] || "bg-accent text-neutral-400"
                      )}
                    >
                      {realIssue.environment}
                    </p>
                  ) : (
                    <span className="text-xs text-muted-foreground ml-2">—</span>
                  )}
                </div>
              </div>
            </div>

            {/* LINK WITH CODEBASE */}
            <div className="grid grid-cols-[120px_1fr] items-center pt-2">
              <div className="flex items-center gap-2.5 text-muted-foreground text-sm font-medium">
                <GitBranch size={16} /> Link Code
              </div>
              <div className="text-xs font-semibold text-primary/80 truncate max-w-[280px]">
                {realIssue.fileLinked ? (
                  <span className="flex items-center gap-1.5">
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
                  <span className="text-muted-foreground font-normal">Not linked any file</span>
                )}
              </div>
            </div>
          </div>

          <div className="my-3">
            {realIssue.status === "closed" ? (
              <div className="flex items-center justify-between bg-emerald-100/5 border border-emerald-500/20 rounded-md p-3 shadow-sm transition-all duration-300">
                <p className="text-xs text-muted-foreground flex items-center">
                  <Check size={16} className="mr-2 text-emerald-500" />
                  Resolved at:
                  <span className="text-xs font-semibold ml-3 text-primary">
                    {realIssue.finalCompletedAt
                      ? format(realIssue.finalCompletedAt, "d MMMM, yyyy")
                      : format(realIssue.updatedAt, "d MMMM, yyyy")}
                  </span>
                </p>
                <div className="flex items-center gap-2 border-l border-primary/60 pl-4">
                  <span className="text-[10px] text-muted-foreground">By:</span>
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
                <CalendarClock size={16} className="mr-1 inline -mt-1" /> Last updated:{" "}
                <span className="text-xs font-medium ml-3 text-primary">
                  {format(realIssue.updatedAt, "d MMMM, yyyy")}
                </span>
              </p>
            )}
          </div>

          {/* Description & Comments Tabs */}
          <div className="space-y-4 mt-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full">
                <TabsTrigger value="description" className="text-xs flex-1">
                  Description <TextQuote className="w-4 h-4 ml-1.5" />
                </TabsTrigger>
                <TabsTrigger value="comments" className="text-xs flex-1">
                  Comments <MessagesSquare className="w-4 h-4 ml-1.5" />
                </TabsTrigger>
              </TabsList>

              <TabsContent value="description" className="pt-4">
                {realIssue.description ? (
                  <div className="p-5 rounded-2xl bg-accent/30 border border-border backdrop-blur-sm shadow-inner">
                    <p className="text-foreground/90 text-sm leading-relaxed whitespace-pre-wrap min-h-[100px] selection:bg-primary/20">
                      {realIssue.description}
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-border rounded-2xl bg-accent/10">
                    <div className="p-3 rounded-full bg-muted/50 text-muted-foreground transition-all duration-300 shadow-lg">
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
                              <span className="text-xs font-semibold text-foreground capitalize truncate">
                                {comment.userName}
                              </span>
                              <span className="text-[10px] text-muted-foreground/60 font-mono">
                                {format(comment.createdAt, "MMM d, h:mm a")}
                              </span>
                            </div>
                            <p className="text-[12px] text-muted-foreground leading-relaxed break-words">
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
          <div className="px-4 py-5 border-t border-border/50 bg-background/95 backdrop-blur-md sticky bottom-0 z-20 shrink-0">
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
                    className="h-8 w-8 rounded-lg transition-all duration-300"
                  >
                    <Send size={14} />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};
