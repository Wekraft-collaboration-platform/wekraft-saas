"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Hash, Lock, Check } from "lucide-react";
import { Channel } from "./hooks/useChannels";
import { cn } from "@/lib/utils";

const schema = z.object({
  name: z
    .string()
    .min(1, "Name required")
    .max(32, "Max 32 chars")
    .regex(
      /^[a-z0-9\s-]+$/,
      "Only lowercase letters, numbers, spaces and hyphens",
    ),
  description: z.string().max(120).optional(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onUpdate: (
    channelId: string,
    name: string,
    description: string,
    type?: "community" | "announcement" | "private",
    memberIds?: string[],
  ) => Promise<boolean>;
  channel: Channel | null;
  projectId: string;
  currentUserId?: string;
  isPower: boolean;
}

export function EditChannelDialog({
  open,
  onOpenChange,
  onUpdate,
  channel,
  projectId,
  currentUserId,
  isPower,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [fetchingMembers, setFetchingMembers] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);

  // Creator, admin, or owner can toggle a private channel back to public
  const isCreator = channel?.created_by === currentUserId;
  const canTogglePublic = isCreator || isPower;

  const form = useForm<FormValues>({
    // @ts-ignore
    resolver: zodResolver(schema),
    defaultValues: { name: "", description: "" },
  });

  // Fetch project members when channel is private (existing) OR when user toggles private ON
  const shouldFetchMembers = (isPrivate || channel?.type === "private") && isPower && projectId;
  const projectMembers = useQuery(
    api.project.getProjectMembers,
    shouldFetchMembers
      ? { projectId: projectId as Id<"projects"> }
      : "skip",
  );

  // Sync form values when the target channel changes
  useEffect(() => {
    if (channel) {
      form.reset({
        name: channel.name,
        description: channel.description ?? "",
      });
      // Sync private toggle state from channel type
      setIsPrivate(channel.type === "private");
    }
  }, [channel, form]);

  // Pre-load existing private channel members when opening
  useEffect(() => {
    if (channel && channel.type === "private" && open) {
      setFetchingMembers(true);
      fetch(`/api/teamspace/channels/${channel.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.memberIds) {
            setSelectedMemberIds(data.memberIds);
          }
        })
        .catch((err) =>
          console.error("Failed to fetch private channel members", err),
        )
        .finally(() => setFetchingMembers(false));
    } else if (channel?.type !== "private") {
      setSelectedMemberIds([]);
    }
  }, [channel, open]);

  function toggleMember(clerkUserId: string) {
    setSelectedMemberIds((prev) =>
      prev.includes(clerkUserId)
        ? prev.filter((id) => id !== clerkUserId)
        : [...prev, clerkUserId],
    );
  }

  async function onSubmit(values: FormValues) {
    if (!channel) return;
    setLoading(true);
    try {
      const wasAlreadyPrivate = channel.type === "private";

      // Converting private → public: send type="community" to revert
      const newType: "community" | "private" | undefined =
        isPrivate && !wasAlreadyPrivate
          ? "private"
          : !isPrivate && wasAlreadyPrivate
          ? "community"
          : undefined;

      // Pass memberIds when managing private channel members
      const memberIdsToSend = isPrivate && isPower ? selectedMemberIds : undefined;

      const success = await onUpdate(
        channel.id,
        values.name,
        values.description ?? "",
        newType,
        memberIdsToSend,
      );
      if (success) {
        onOpenChange(false);
      }
    } finally {
      setLoading(false);
    }
  }

  const roleLabel: Record<string, string> = {
    owner: "Owner",
    admin: "Admin",
    member: "Member",
    viewer: "Viewer",
  };

  const isAlreadyPrivate = channel?.type === "private";
  const isDefault = channel?.is_default === 1;
  const showMemberPicker = isPrivate && isPower && !isDefault;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card rounded-lg!">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isPrivate ? (
              <Lock className="h-4 w-4 text-primary" />
            ) : (
              <Hash className="h-4 w-4 text-primary" />
            )}
            Edit Channel
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3.5">
            {/* Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Channel Name</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-1 border rounded-md px-3 bg-transparent! focus-within:ring-1 focus-within:ring-ring">
                      {isPrivate ? (
                        <Lock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      ) : (
                        <Hash className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      )}
                      <Input
                        {...field}
                        placeholder="e.g. dev-chat"
                        disabled={isDefault}
                        className="border-0 p-0 h-9 shadow-none focus-visible:ring-0 bg-transparent! disabled:cursor-not-allowed disabled:opacity-60"
                        onChange={(e) =>
                          field.onChange(
                            e.target.value.toLowerCase().replace(/\s+/g, "-"),
                          )
                        }
                      />
                    </div>
                  </FormControl>
                  {isDefault && (
                    <p className="text-[10px] text-muted-foreground">
                      Default channel names cannot be changed.
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Description{" "}
                    <span className="text-muted-foreground">(optional)</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="What's this channel for?"
                      className="resize-none h-14 text-sm"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* ── Private Toggle (hidden for default channels) ── */}
            {!isDefault && (
            <div
              className={cn(
                "flex items-center justify-between rounded-lg border px-3 py-2.5",
                isPrivate
                  ? "border-primary/20 bg-primary/5"
                  : "border-border bg-muted/30",
              )}
            >
              <div className="flex items-center gap-2.5">
                <Lock
                  className={cn(
                    "h-3.5 w-3.5 shrink-0",
                    isPrivate ? "text-primary" : "text-muted-foreground",
                  )}
                />
                <div>
                  <p className="text-xs font-medium leading-tight">
                    Private Channel
                  </p>
                  <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">
                    {isAlreadyPrivate
                      ? canTogglePublic
                        ? "Toggle off to make this channel public"
                        : "This channel is already private"
                      : "Only selected members can access"}
                  </p>
                </div>
              </div>
              <Switch
                id="edit-private-toggle"
                checked={isPrivate}
                disabled={isAlreadyPrivate && !canTogglePublic}
                onCheckedChange={(v) => {
                  setIsPrivate(v);
                  if (!v) setSelectedMemberIds([]);
                }}
                size="sm"
              />
            </div>
            )}

            {/* Member Picker (shown when private toggle is on and user is owner/admin) */}
            {showMemberPicker && (
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between">
                  <FormLabel className="text-xs font-semibold">
                    {isAlreadyPrivate ? "Manage Members" : "Add Members"}
                  </FormLabel>
                  {selectedMemberIds.length > 0 && (
                    <span className="text-[11px] text-muted-foreground">
                      {selectedMemberIds.length} selected
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-muted-foreground leading-snug">
                  {isAlreadyPrivate
                    ? "Admins & owners can add or remove members from this private channel."
                    : "You're always included. Admins & owners can view all private channels."}
                </p>
                <ScrollArea className="h-[110px] rounded-md border bg-background/50">
                  <div className="p-2 space-y-1">
                    {fetchingMembers || !projectMembers ? (
                      <p className="text-xs text-muted-foreground text-center py-6 animate-pulse">
                        Loading members…
                      </p>
                    ) : (
                      (() => {
                        const currentUserMember = projectMembers.find(
                          (m: any) => m.clerkUserId === currentUserId,
                        );
                        const currentUserRole = currentUserMember?.AccessRole;

                        const filteredMembers = projectMembers.filter(
                          (member: any) => {
                            const clerkId = member.clerkUserId;
                            const isCurrentUser = clerkId === currentUserId;

                            if (isCurrentUser) return false;
                            if (
                              currentUserRole === "owner" &&
                              member.AccessRole === "owner"
                            )
                              return false;
                            if (
                              currentUserRole === "admin" &&
                              member.AccessRole === "admin"
                            )
                              return false;
                            return true;
                          },
                        );

                        if (filteredMembers.length === 0) {
                          return (
                            <p className="text-xs text-muted-foreground text-center py-6">
                              No other selectable members found.
                            </p>
                          );
                        }

                        return filteredMembers.map((member: any) => {
                          const clerkId = member.clerkUserId as string | null;
                          const isChecked = clerkId
                            ? selectedMemberIds.includes(clerkId)
                            : false;

                          return (
                            <div
                              key={member.userId}
                              role="checkbox"
                              aria-checked={isChecked}
                              aria-disabled={!clerkId}
                              tabIndex={!clerkId ? -1 : 0}
                              onClick={() => clerkId && toggleMember(clerkId)}
                              onKeyDown={(e) => {
                                if (
                                  (e.key === "Enter" || e.key === " ") &&
                                  clerkId
                                ) {
                                  e.preventDefault();
                                  toggleMember(clerkId);
                                }
                              }}
                              className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md text-left transition-colors select-none hover:bg-accent/50 cursor-pointer"
                            >
                              <div
                                className={cn(
                                  "size-4 shrink-0 rounded-[4px] border flex items-center justify-center transition-colors shadow-xs pointer-events-none",
                                  isChecked
                                    ? "border-primary bg-primary text-primary-foreground"
                                    : "border-input",
                                )}
                              >
                                {isChecked && (
                                  <Check className="size-3 w-3 stroke-[3]" />
                                )}
                              </div>
                              <Avatar className="h-6 w-6 shrink-0">
                                <AvatarImage src={member.userImage} />
                                <AvatarFallback className="text-[10px]">
                                  {(member.userName || "?")
                                    .charAt(0)
                                    .toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium truncate">
                                  {member.userName}
                                </p>
                              </div>
                              <Badge
                                variant="secondary"
                                className="text-[10px] px-1.5 py-0 shrink-0 capitalize"
                              >
                                {roleLabel[member.AccessRole] ??
                                  member.AccessRole ??
                                  "Member"}
                              </Badge>
                            </div>
                          );
                        });
                      })()
                    )}
                  </div>
                </ScrollArea>
              </div>
            )}

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="text-xs">
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
