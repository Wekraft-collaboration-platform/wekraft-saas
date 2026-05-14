"use client";

import React, { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  ChevronRight,
  Loader2,
  LucideSettings2,
  CalendarIcon,
  Globe,
  Zap,
  CheckCircle2,
  Clock,
  AlertCircle,
  Link2,
  ListFilter,
  Paperclip,
  Check,
  User,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Id } from "../../../convex/_generated/dataModel";
import { GetRepoStructure } from "./GetRepoStructure";
import {
  ISSUE_ENVIRONMENT_ICONS,
  ISSUE_SEVERITY_ICONS,
  ISSUE_STATUS_ICONS,
} from "@/lib/static-store";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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

  const members = useQuery(api.project.getProjectMembers, { projectId });
  const project = useQuery(api.project.getProjectById, { projectId });
  const projectDetails = useQuery(api.projectDetails.getProjectDetails, {
    projectId,
  });
  const createIssue = useMutation(api.issue.createIssue);

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
      <DialogContent className="w-full max-w-[800px] h-full max-h-[560px] flex flex-col dark:bg-[#1c1c1c] border-[#2b2b2b] p-0 overflow-hidden dark:text-neutral-200">
        <DialogHeader className="p-4 flex flex-row items-center gap-2 border-b border-[#2b2b2b] shrink-0">
          <div className="flex items-center gap-1.5 text-xs text-neutral-400 font-medium">
            <div className="w-3 h-3 rounded-full bg-blue-600 flex items-center justify-center text-[10px] text-white"></div>
            <span className="text-sm">{projectName}</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-xs">New issue</span>
          </div>
        </DialogHeader>

        <div className="p-6 pb-2 space-y-4 flex-1 overflow-y-auto">
          <div className="flex flex-col space-y-1.5">
            <Label className="text-sm">Issue Title</Label>
            <Input
              placeholder="Issue title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-base font-medium border bg-transparent p-2 focus-visible:ring-0 placeholder:text-neutral-600"
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
                  className={cn(
                    "h-7 bg-[#252525] border-[#333] hover:bg-[#2b2b2b] text-primary/80 px-2 gap-1.5 rounded-full text-[11px]",
                    status && "text-blue-400 border-blue-900/40 bg-blue-900/10",
                  )}
                >
                  {status ? (
                    ISSUE_STATUS_ICONS[status]
                  ) : (
                    <ListFilter className="w-3.5 h-3.5" />
                  )}
                  <span className="capitalize">{status || "Status"}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-[#1c1c1c] border-[#2b2b2b] text-neutral-200 ">
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
                  className={cn(
                    "h-7 bg-[#252525] border-[#333] hover:bg-[#2b2b2b] text-primary/80 px-2 gap-1.5 rounded-full text-[11px]",
                    severity &&
                      "text-blue-400 border-blue-900/40 bg-blue-900/10",
                  )}
                >
                  {severity ? (
                    ISSUE_SEVERITY_ICONS[severity]
                  ) : (
                    <Zap className="w-3.5 h-3.5" />
                  )}
                  <span className="capitalize">{severity || "Severity"}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-[#1c1c1c] border-[#2b2b2b] text-neutral-200">
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
                  className={cn(
                    "h-7 bg-[#252525] border-[#333] hover:bg-[#2b2b2b] text-primary/80 px-2 gap-1.5 rounded-full text-[11px]",
                    environment &&
                      "text-blue-400 border-blue-900/40 bg-blue-900/10",
                  )}
                >
                  {environment ? (
                    ISSUE_ENVIRONMENT_ICONS[environment]
                  ) : (
                    <Globe className="w-3.5 h-3.5" />
                  )}
                  <span className="capitalize">
                    {environment || "Environment"}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-[#1c1c1c] border-[#2b2b2b] text-neutral-200">
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
                  className={cn(
                    "h-7 bg-[#252525] border-[#333] hover:bg-[#2b2b2b] text-primary/80 px-2 gap-1.5 rounded-full text-[11px]",
                    dueDate &&
                      "text-blue-400 border-blue-900/40 bg-blue-900/10",
                  )}
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
                className="w-auto p-0 bg-[#1c1c1c] border-[#2b2b2b]"
                align="start"
              >
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={setDueDate}
                  initialFocus
                  disabled={[
                    project?.createdAt
                      ? { before: new Date(project.createdAt) }
                      : undefined,
                    projectDetails?.targetDate
                      ? { after: new Date(projectDetails.targetDate) }
                      : undefined,
                  ].filter(Boolean) as any}
                  className="bg-[#1c1c1c] text-neutral-200"
                />
              </PopoverContent>
            </Popover>

            {/* Link Codebase */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "h-7 bg-[#252525] border-[#333] hover:bg-[#2b2b2b] text-primary/80 px-2 gap-1.5 rounded-full text-[11px]",
                    selectedPath &&
                      "text-blue-400 border-blue-900/50 bg-blue-900/10",
                  )}
                >
                  <Link2 className="w-3.5 h-3.5" />
                  {selectedPath ? selectedPath.split("/").pop() : "Link Code"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[320px] p-0 bg-[#1c1c1c] border-[#2b2b2b] text-neutral-200">
                <GetRepoStructure
                  repoFullName={repoFullName}
                  onSelect={setSelectedPath}
                  selectedPath={selectedPath}
                  ownerClerkId={ownerClerkId}
                />
              </PopoverContent>
            </Popover>

            {/* Members Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "h-7 bg-[#252525] border-[#333] hover:bg-[#2b2b2b] text-primary/80 px-3 gap-1.5 rounded-full text-[11px]",
                    assignedMembers.length > 0 &&
                      "text-blue-400 border-blue-900/40 bg-blue-900/10",
                  )}
                >
                  <User className="w-3.5 h-3.5" />
                  {assignedMembers.length > 0
                    ? `${assignedMembers.length} Assigned`
                    : "Assignees"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-[#1c1c1c] border-[#2b2b2b] text-neutral-200 w-48">
                <div className="text-xs text-center font-medium p-2 border-b border-accent">
                  Select Members
                </div>
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

            {/* Attachments (UI Only) */}
            <Button
              variant="outline"
              size="sm"
              className="h-7 bg-[#252525] border-[#333] hover:bg-[#2b2b2b] text-primary/80 px-2 gap-1.5 rounded-full text-[11px]"
              onClick={() => toast.info("Attachments module coming soon!")}
            >
              <Paperclip className="w-3.5 h-3.5" />
              Attachments
            </Button>
          </div>

          <Textarea
            placeholder="Add a description, a project brief, or collect ideas..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="h-[220px] overflow-y-scroll bg-transparent border p-2 focus-visible:ring-0 placeholder:text-neutral-600 resize-none text-sm leading-relaxed [field-sizing:normal]"
          />
        </div>

        <div className="p-4 border-t border-[#2b2b2b] flex items-center justify-end shrink-0">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={() => setOpen(false)}
              className="h-8 text-xs text-neutral-400 hover:text-white"
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
    </Dialog>
  );
};
