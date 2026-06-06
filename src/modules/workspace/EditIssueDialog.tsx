"use client";

import { useMutation, useQuery } from "convex/react";
import { format } from "date-fns";
import {
  CalendarIcon,
  Check,
  ChevronRight,
  Globe,
  Link2,
  Loader2,
  LucideSettings2,
  User,
  Zap,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import {
  ISSUE_ENVIRONMENT_ICONS,
  ISSUE_SEVERITY_ICONS,
  ISSUE_STATUS_ICONS,
} from "@/lib/static-store";
import { cn } from "@/lib/utils";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { GetRepoStructure } from "./GetRepoStructure";

const getCleanIcon = (icon: React.ReactNode) => {
  if (!React.isValidElement(icon)) return icon;
  const currentClassName = (icon.props as any).className || "";
  const cleanClassName = currentClassName
    .split(" ")
    .filter((c: string) => !c.startsWith("text-"))
    .join(" ");
  return React.cloneElement(icon as any, {
    className: cleanClassName,
  });
};

interface EditIssueDialogProps {
  projectName: string;
  projectId: Id<"projects">;
  repoFullName?: string;
  ownerClerkId?: string;
  trigger: React.ReactNode;
  issue: any; // The issue object to edit
}

export const EditIssueDialog = ({
  projectName,
  projectId,
  repoFullName,
  ownerClerkId,
  trigger,
  issue,
}: EditIssueDialogProps) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(issue.title || "");
  const [description, setDescription] = useState(issue.description || "");
  const [status, setStatus] = useState<
    "not opened" | "opened" | "reopened" | "closed"
  >(issue.status || "not opened");
  const [severity, setSeverity] = useState<
    "low" | "medium" | "critical" | null
  >(issue.severity || null);
  const [environment, setEnvironment] = useState<
    "local" | "dev" | "staging" | "production" | null
  >(issue.environment || null);
  const [dueDate, setDueDate] = useState<Date | undefined>(
    issue.due_date ? new Date(issue.due_date) : undefined,
  );
  const [selectedPath, setSelectedPath] = useState<string | null>(
    issue.fileLinked || null,
  );
  const [assignedMembers, setAssignedMembers] = useState<
    { userId: Id<"users">; name: string; avatar?: string }[]
  >(
    (issue.assignedTo || issue.assignees)?.map((a: any) => ({
      userId: a.userId,
      name: a.name,
      avatar: a.avatar,
    })) || [],
  );
  const [isPending, setIsPending] = useState(false);

  const members = useQuery(api.project.getProjectMembers, { projectId });
  const project = useQuery(api.project.getProjectById, { projectId });
  const projectDetails = useQuery(api.projectDetails.getProjectDetails, {
    projectId,
  });
  const editIssue = useMutation(api.issue.updateIssue);

  // Update states when issue changes or dialog opens
  useEffect(() => {
    if (open) {
      setTitle(issue.title || "");
      setDescription(issue.description || "");
      setStatus(issue.status || "not opened");
      setSeverity(issue.severity || null);
      setEnvironment(issue.environment || null);
      setDueDate(issue.due_date ? new Date(issue.due_date) : undefined);
      setSelectedPath(issue.fileLinked || null);
      setAssignedMembers(
        (issue.assignedTo || issue.assignees)?.map((a: any) => ({
          userId: a.userId,
          name: a.name,
          avatar: a.avatar,
        })) || [],
      );
    }
  }, [issue, open]);

  const handleEditIssue = async () => {
    if (!title.trim()) {
      toast.error("Issue title is required");
      return;
    }

    try {
      setIsPending(true);
      await editIssue({
        issueId: issue._id,
        title,
        description: description.trim() || undefined,
        status,
        severity: severity || undefined,
        environment: environment || undefined,
        due_date: dueDate?.getTime(),
        fileLinked: selectedPath || undefined,
        assignees:
          assignedMembers.length > 0
            ? assignedMembers.map((a) => ({
                userId: a.userId,
                name: a.name,
                avatar: a.avatar,
              }))
            : [],
      });
      toast.success("Issue updated successfully");
      setOpen(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to update issue");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="w-full max-w-[800px] h-full max-h-[560px] flex flex-col bg-card dark:bg-[#1c1c1c] border-neutral-300 dark:border-[#2b2b2b] p-0 overflow-hidden text-foreground dark:text-neutral-200">
        <DialogHeader className="p-4 flex flex-row items-center gap-2 border-b border-neutral-200 dark:border-[#2b2b2b] shrink-0">
          <div className="flex items-center gap-1.5 text-xs text-neutral-400 font-medium">
            <div className="w-3 h-3 rounded-full bg-blue-600 flex items-center justify-center text-[10px] text-white"></div>
            <span className="text-sm">{projectName}</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-xs">Edit issue</span>
          </div>
        </DialogHeader>

        <div className="p-6 pb-2 space-y-4 flex-1 overflow-y-auto">
          <div className="flex flex-col space-y-1.5">
            <Label className="text-sm">Issue Title</Label>
            <Input
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
                    <LucideSettings2 className="w-3.5 h-3.5" />
                  )}
                  <span className="capitalize">{status.replace("-", " ")}</span>
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
          </div>

          <Textarea
            placeholder="Add a description, a project brief, or collect ideas..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="h-[220px] overflow-y-scroll bg-neutral-100/60 dark:bg-neautral-900 border p-2 focus-visible:ring-0 placeholder:text-neutral-600 resize-none text-sm leading-relaxed"
          />
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
              onClick={handleEditIssue}
              className="h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white px-4"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save changes"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
