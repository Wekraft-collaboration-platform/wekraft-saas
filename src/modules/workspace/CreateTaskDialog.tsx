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
  Plus,
  X,
  ChevronRight,
  Flag,
  User,
  CalendarIcon,
  Tag,
  Link2,
  Loader2,
  LucideSettings2,
  Paperclip,
  Clock,
  Check,
  Trash2,
  AlertCircle,
} from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";

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
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { priorityIcons, statusIcons } from "@/lib/static-store";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StorageLimitDialog } from "./StorageLimitDialog";
import { useKayaStore } from "@/store/useKayaStore";

interface CreateTaskDialogProps {
  projectName: string;
  projectId: Id<"projects">; // From Convex
  repoFullName?: string; // owner/repo
  ownerClerkId?: string;
  trigger: React.ReactNode;
}

export const CreateTaskDialog = ({
  projectName,
  projectId,
  repoFullName,
  ownerClerkId,
  trigger,
}: CreateTaskDialogProps) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("not started");
  const [priority, setPriority] = useState<"low" | "medium" | "high" | "none">(
    "none",
  );
  const [date, setDate] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });
  const [tag, setTag] = useState<{ label: string; color: string } | null>(null);
  const [tagInput, setTagInput] = useState("");
  const [selectedTagColor, setSelectedTagColor] = useState("blue");

  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [assignedMembers, setAssignedMembers] = useState<
    { userId: Id<"users">; name: string; avatar?: string }[]
  >([]);
  const [attachments, setAttachments] = useState<
    { name: string; url: string }[]
  >([]);
  const [isPending, setIsPending] = useState(false);
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

  const createTask = useMutation(api.workspace.createTask);
  const existingTags = useQuery(api.workspace.getUniqueTags, { projectId });

  const defaultTags = [
    { label: "Payment", color: "green" },
    { label: "Auth", color: "blue" },
    { label: "Mobile", color: "purple" },
    { label: "CRM", color: "yellow" },
  ];

  const tagsToShow =
    existingTags && existingTags.length > 0 ? existingTags : defaultTags;

  const handleCreateTask = async () => {
    if (!title.trim()) {
      toast.error("Task title is required");
      return;
    }
    if (!date?.from || !date?.to) {
      toast.error("Please select a duration (start and target dates)");
      return;
    }

    try {
      setIsPending(true);
      await createTask({
        title,
        description: description.trim() || undefined,
        status: status as any,
        priority: priority === "none" ? undefined : (priority as any),
        estimation: {
          startDate: date.from.getTime(),
          endDate: date.to.getTime(),
        },
        type: tag ? tag : undefined,
        projectId,
        linkWithCodebase: selectedPath || undefined,
        assignees: assignedMembers.length > 0 ? assignedMembers : undefined,
        attachments: attachments.length > 0 ? attachments : undefined,
      });
      toast.success("Task created successfully");
      setOpen(false);
      // Reset form
      setTitle("");
      setDescription("");
      setStatus("not started");
      setPriority("none");
      setDate({ from: undefined, to: undefined });
      setTag(null);
      setTagInput("");
      setSelectedTagColor("blue");
      setSelectedPath(null);
      setAssignedMembers([]);
      setAttachments([]);
    } catch (error) {
      console.error(error);
      toast.error("Failed to create task");
    } finally {
      setIsPending(false);
    }
  };

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

      const response = await fetch("/api/attachments", {
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
        toast.dismiss(toastId);
        setShowStorageLimitDialog(true);
      } else {
        toast.error(msg || "Failed to upload file", { id: toastId });
      }
    } finally {
      setIsUploading(false);
    }
  };

  const removeAttachment = async (url: string) => {
    try {
      // Opt-in: Delete from S3 too
      await fetch("/api/attachments", {
        method: "DELETE",
        body: JSON.stringify({ url }),
      });
      setAttachments((prev) => prev.filter((a) => a.url !== url));
    } catch (error) {
      console.error("Failed to delete attachment from S3", error);
      // Still remove from local state
      setAttachments((prev) => prev.filter((a) => a.url !== url));
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="w-full max-w-[800px] h-[560px] bg-card dark:bg-[#1c1c1c] border-neutral-300 dark:border-[#2b2b2b] p-0 overflow-hidden text-foreground dark:text-neutral-200">
        <DialogHeader className="p-4 flex flex-row items-center justify-between gap-2 border-b border-neutral-200 dark:border-[#2b2b2b]">
          <div className="flex items-center gap-1.5 text-xs text-neutral-400 font-medium">
            <div className="w-3 h-3 rounded-full bg-blue-600 flex items-center justify-center text-[10px] text-white"></div>
            <span className="text-sm">{projectName}</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-xs">New Task</span>
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
                  <p>Create a bunch of tasks in 1 go with Kaya.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </DialogHeader>

        <div className="p-6 pb-2 space-y-4  overflow-y-auto scrollbar-thin">
          <div className="flex flex-col space-y-1.5">
            <Label className="text-sm">Task Title</Label>
            <Input
              autoFocus
              placeholder="Task title"
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
                  {statusIcons[status]}
                  <span className="capitalize">{status.replace("-", " ")}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-popover dark:bg-[#1c1c1c] border-neutral-200 dark:border-[#2b2b2b] text-foreground dark:text-neutral-200">
                <div className="text-xs text-center font-medium p-2 border-b border-accent">
                  Select Status
                </div>
                {Object.keys(statusIcons).map((s) => (
                  <DropdownMenuItem
                    key={s}
                    onClick={() => setStatus(s)}
                    className="gap-2 cursor-pointer"
                  >
                    {statusIcons[s]}
                    <span className="capitalize text-xs px-1.5">
                      {s.replace("-", " ")}
                    </span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Priority */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 bg-neutral-100 hover:bg-neutral-200 border-neutral-300 dark:bg-[#252525] dark:border-[#333] dark:hover:bg-[#2b2b2b] text-foreground dark:text-primary/80 px-2 gap-1.5 rounded-full text-[11px]"
                >
                  {priorityIcons[priority]}
                  <span>Priority</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-popover dark:bg-[#1c1c1c] border-neutral-200 dark:border-[#2b2b2b] text-foreground dark:text-neutral-200">
                <div className="text-xs text-center font-medium p-2 border-b border-accent">
                  Select Priority
                </div>
                {(["none", "low", "medium", "high"] as const).map((p) => (
                  <DropdownMenuItem
                    key={p}
                    onClick={() => setPriority(p)}
                    className="gap-2 cursor-pointer"
                  >
                    {priorityIcons[p]}
                    <span className="capitalize">{p}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Members Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "h-7 bg-neutral-100 hover:bg-neutral-200 border-neutral-300 dark:bg-[#252525] dark:border-[#333] dark:hover:bg-[#2b2b2b] text-foreground dark:text-primary/80 px-3 gap-1.5 rounded-full text-[11px]",
                    assignedMembers.length > 0 &&
                      "text-blue-500 border-blue-200 bg-blue-50 dark:text-blue-400 dark:border-blue-900/40 dark:bg-blue-900/10",
                  )}
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

            {/* Duration (Range) */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "h-7 bg-neutral-100 hover:bg-neutral-200 border-neutral-300 dark:bg-[#252525] dark:border-[#333] dark:hover:bg-[#2b2b2b] text-foreground dark:text-primary/80 px-2 gap-1.5 rounded-full text-[11px]",
                    date?.from &&
                      "text-blue-500 border-blue-200 bg-blue-50 dark:text-blue-400 dark:border-blue-900/40 dark:bg-blue-900/10",
                  )}
                >
                  <Clock className="w-3.5 h-3.5" />
                  {date?.from ? (
                    date.to ? (
                      <>
                        {format(date.from, "LLL dd")} -{" "}
                        {format(date.to, "LLL dd")}
                      </>
                    ) : (
                      format(date.from, "LLL dd")
                    )
                  ) : (
                    <span>Duration</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto p-0 bg-popover dark:bg-[#1c1c1c] border-neutral-200 dark:border-[#2b2b2b]"
                align="start"
              >
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={date?.from}
                  selected={date}
                  onSelect={setDate}
                  numberOfMonths={1}
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

            {/* Attachments */}
            <div className="relative">
              <TooltipProvider delayDuration={100}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="inline-block">
                      <Button
                        variant="outline"
                        size="sm"
                        className={cn(
                          "h-7 bg-neutral-100 hover:bg-neutral-200 border-neutral-300 dark:bg-[#252525] dark:border-[#333] dark:hover:bg-[#2b2b2b] text-foreground dark:text-primary/80 px-2 gap-1.5 rounded-full text-[11px]",
                          attachments.length > 0 &&
                            "text-blue-500 border-blue-200 bg-blue-50 dark:text-blue-400 dark:border-blue-900/40 dark:bg-blue-900/10",
                        )}
                        disabled={
                          isUploading || project?.ownerAccountType === "free"
                        }
                        onClick={() =>
                          document.getElementById("file-upload")?.click()
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
                id="file-upload"
                type="file"
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>

            {/* Type/Tag */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "h-7 bg-neutral-100 hover:bg-neutral-200 border-neutral-300 dark:bg-[#252525] dark:border-[#333] dark:hover:bg-[#2b2b2b] text-foreground dark:text-primary/80 px-2 gap-1.5 rounded-full text-[11px]",
                    tag &&
                      "text-blue-500 border-blue-200 bg-blue-50 dark:text-blue-400 dark:border-blue-900/40 dark:bg-blue-900/10",
                  )}
                >
                  <Tag className="w-3.5 h-3.5" />
                  {tag ? "1 Tag" : "Tags"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[280px] p-3 bg-popover dark:bg-[#1c1c1c] border-neutral-200 dark:border-[#2b2b2b] text-foreground dark:text-neutral-200">
                <div className="space-y-3">
                  <p className="text-xs font-medium text-center text-muted-foreground border-b border-accent pb-2">
                    {existingTags && existingTags.length > 0
                      ? "Project Tags"
                      : "Default Tags"}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-2 min-h-6">
                    {tagsToShow.map((t) => (
                      <Badge
                        key={t.label}
                        onClick={() => setTag(t)}
                        className={cn(
                          "text-[10px] py-0 px-2 h-5 gap-1 border-none font-medium capitalize cursor-pointer transition-all hover:scale-105",
                          tag?.label === t.label
                            ? "ring-1 ring-white/50"
                            : "opacity-70 hover:opacity-100",
                          t.color === "green" &&
                            "bg-emerald-500/20 text-emerald-400",
                          t.color === "yellow" &&
                            "bg-yellow-500/20 text-yellow-400",
                          t.color === "purple" &&
                            "bg-purple-500/20 text-purple-400",
                          t.color === "blue" && "bg-blue-500/20 text-blue-400",
                          t.color === "grey" &&
                            "bg-neutral-500/20 text-neutral-400",
                        )}
                      >
                        {t.label}
                        {tag?.label === t.label && (
                          <Check className="w-2.5 h-2.5 ml-1" />
                        )}
                      </Badge>
                    ))}
                  </div>

                  <p className="text-xs font-medium text-center text-muted-foreground border-b border-accent pb-2 pt-2">
                    Custom Tags
                  </p>

                  {/* Current Tag Display & Removal */}
                  {tag && (
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      <Badge
                        className={cn(
                          "text-[10px] py-0 px-2 h-5 gap-1 border-none font-medium capitalize",
                          tag.color === "green" &&
                            "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30",
                          tag.color === "yellow" &&
                            "bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30",
                          tag.color === "purple" &&
                            "bg-purple-500/20 text-purple-400 hover:bg-purple-500/30",
                          tag.color === "blue" &&
                            "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30",
                          tag.color === "grey" &&
                            "bg-neutral-500/20 text-neutral-400 hover:bg-neutral-500/30",
                        )}
                      >
                        {tag.label}
                        <button
                          type="button"
                          aria-label="Remove tag"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setTag(null);
                          }}
                          className="cursor-pointer opacity-70 hover:opacity-100 h-3 w-3 flex items-center justify-center rounded-sm hover:bg-neutral-800"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </Badge>
                    </div>
                  )}

                  {!tag && (
                    <div className="flex flex-col gap-4">
                      {/* Color Picker Section */}
                      <div className="space-y-2">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold ml-1">
                          Select color
                        </p>
                        <div className="flex items-center gap-2 justify-center py-1">
                          {["green", "yellow", "purple", "blue", "grey"].map(
                            (c) => (
                              <div
                                key={c}
                                onClick={() => setSelectedTagColor(c)}
                                className={cn(
                                  "w-5 h-5 rounded-full cursor-pointer transition-all border-2 flex items-center justify-center",
                                  c === "green" && "bg-emerald-500",
                                  c === "yellow" && "bg-yellow-500",
                                  c === "purple" && "bg-purple-500",
                                  c === "blue" && "bg-blue-500",
                                  c === "grey" && "bg-neutral-500",
                                  selectedTagColor === c
                                    ? "border-white scale-110 shadow-[0_0_8px_rgba(255,255,255,0.2)]"
                                    : "border-transparent opacity-50 hover:opacity-100",
                                )}
                              >
                                {selectedTagColor === c && (
                                  <Check className="w-3 h-3 text-white" />
                                )}
                              </div>
                            ),
                          )}
                        </div>
                      </div>

                      {/* Tag Input Section */}
                      <div className="space-y-1.5">
                        <div className="flex gap-2">
                          <Input
                            placeholder="Type tag name..."
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            className="h-8 bg-transparent border-[#333] text-xs focus-visible:ring-1 focus-visible:ring-primary/50"
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && tagInput.trim()) {
                                e.preventDefault();
                                setTag({
                                  label: tagInput.trim(),
                                  color: selectedTagColor,
                                });
                                setTagInput("");
                              }
                            }}
                          />
                          <Button
                            variant="secondary"
                            size="sm"
                            className="h-8 text-[10px] px-3 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                            onClick={() => {
                              if (tagInput.trim()) {
                                setTag({
                                  label: tagInput.trim(),
                                  color: selectedTagColor,
                                });
                                setTagInput("");
                              }
                            }}
                            disabled={!tagInput.trim()}
                          >
                            Save
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {tag && (
                    <p className="text-[10px] text-muted-foreground text-center italic mt-2">
                      Only 1 tag allowed. Remove to add a new one.
                    </p>
                  )}
                </div>
              </PopoverContent>
            </Popover>

            {/* Link Codebase */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "h-7 bg-neutral-100 hover:bg-neutral-200 border-neutral-300 dark:bg-[#252525] dark:border-[#333] dark:hover:bg-[#2b2b2b] text-foreground dark:text-primary/80 px-2 gap-1.5 rounded-full text-[11px]",
                    selectedPath &&
                      "text-blue-500 border-blue-200 bg-blue-50 dark:text-blue-400 dark:border-blue-900/50 dark:bg-blue-900/10",
                  )}
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
          </div>

          <Textarea
            placeholder="Add a description, a project brief, or collect ideas..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="h-[180px] overflow-y-scroll bg-neutral-100/60 dark:bg-neutral-900 border p-2 focus-visible:ring-0 placeholder:text-neutral-600 resize-none text-sm leading-relaxed"
          />

          {/* Attachments List */}
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2 border-t border-[#2b2b2b]/50">
              {attachments.map((file, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 bg-[#252525] border border-[#333] rounded-md px-2 py-1 group"
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

        <div className="p-4 border-t border-neutral-200 dark:border-[#2b2b2b] flex items-center justify-between">
          <div>
            {!projectDetails?.targetDate && (
              <span className="text-xs font-medium flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" /> Project deadline is not
                set! Don't forget to configure it in settings.
              </span>
            )}
          </div>
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
              onClick={handleCreateTask}
              className="h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white px-4"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create task"
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
