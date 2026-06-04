/**
 * CreateChannelDialog.tsx
 *
 * Dialog for creating a new channel in the teamspace.
 * Supports three channel types:
 *   - text       → General chat (default)
 *   - announcement → Read-only for non-admin members
 *   - private    → Only visible to explicitly selected members
 *
 * For private channels, fetches project members from Convex and renders
 * a scrollable multi-select member picker.
 */
"use client";

import { useState } from "react";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Hash, Megaphone, Lock, Check } from "lucide-react";
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
  type: z.enum(["text", "announcement", "private"]),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  /** The Convex project ID — required to fetch members for private channels */
  projectId: string;
  /** The current user's Clerk user ID — shown as pre-checked + disabled in member list */
  currentUserId?: string;
  onCreate: (
    name: string,
    description: string,
    type: "text" | "announcement" | "private",
    memberIds?: string[],
  ) => Promise<Channel | undefined>;
}

export function CreateChannelDialog({
  open,
  onOpenChange,
  projectId,
  currentUserId,
  onCreate,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);

  const form = useForm<FormValues>({
    // @ts-ignore
    resolver: zodResolver(schema),
    defaultValues: { name: "", description: "", type: "text" },
  });

  const watchedType = form.watch("type");

  // Lazily fetch project members — only when the "private" type is selected
  const projectMembers = useQuery(
    api.project.getProjectMembers,
    watchedType === "private" && projectId
      ? { projectId: projectId as Id<"projects"> }
      : "skip",
  );

  function toggleMember(clerkUserId: string) {
    setSelectedMemberIds((prev) =>
      prev.includes(clerkUserId)
        ? prev.filter((id) => id !== clerkUserId)
        : [...prev, clerkUserId],
    );
  }

  async function onSubmit(values: FormValues) {
    setLoading(true);
    try {
      await onCreate(
        values.name,
        values.description ?? "",
        values.type,
        values.type === "private" ? selectedMemberIds : undefined,
      );
      form.reset();
      setSelectedMemberIds([]);
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  }

  function handleOpenChange(v: boolean) {
    if (!v && open) {
      form.reset({ name: "", description: "", type: "text" });
      setSelectedMemberIds([]);
    }
    onOpenChange(v);
  }

  const roleLabel: Record<string, string> = {
    owner: "Owner",
    admin: "Admin",
    member: "Member",
    viewer: "Viewer",
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md bg-card rounded-lg!">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Hash className="h-4 w-4" />
            Create Channel
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            {/* ── Channel Type ── */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Channel Type</FormLabel>
                  <FormControl>
                    <RadioGroup
                      value={field.value}
                      onValueChange={(v) => {
                        field.onChange(v);
                        // Clear member selection when switching away from private
                        if (v !== "private") setSelectedMemberIds([]);
                      }}
                      className="grid grid-cols-3 gap-1.5"
                    >
                      {/* Text */}
                      <label
                        htmlFor="type-text"
                        className={cn(
                          "flex flex-col items-center gap-1 p-2 rounded-lg border cursor-pointer transition-colors text-center",
                          field.value === "text"
                            ? "border-primary/40 bg-accent/40"
                            : "border-border hover:bg-accent/20",
                        )}
                      >
                        <RadioGroupItem
                          value="text"
                          id="type-text"
                          className="sr-only"
                        />
                        <Hash className="h-3.5 w-3.5 shrink-0" />
                        <p className="text-[11px] font-medium leading-tight">
                          Text
                        </p>
                        <p className="text-[9px] text-muted-foreground leading-tight">
                          General chat
                        </p>
                      </label>

                      {/* Announcement */}
                      <label
                        htmlFor="type-announcement"
                        className={cn(
                          "flex flex-col items-center gap-1 p-2 rounded-lg border cursor-pointer transition-colors text-center",
                          field.value === "announcement"
                            ? "border-primary/40 bg-accent/40"
                            : "border-border hover:bg-accent/20",
                        )}
                      >
                        <RadioGroupItem
                          value="announcement"
                          id="type-announcement"
                          className="sr-only"
                        />
                        <Megaphone className="h-3.5 w-3.5 shrink-0" />
                        <p className="text-[11px] font-medium leading-tight">
                          Announcement
                        </p>
                        <p className="text-[9px] text-muted-foreground leading-tight">
                          Read-only
                        </p>
                      </label>

                      {/* Private */}
                      <label
                        htmlFor="type-private"
                        className={cn(
                          "flex flex-col items-center gap-1 p-2 rounded-lg border cursor-pointer transition-colors text-center",
                          field.value === "private"
                            ? "border-primary/40 bg-accent/40"
                            : "border-border hover:bg-accent/20",
                        )}
                      >
                        <RadioGroupItem
                          value="private"
                          id="type-private"
                          className="sr-only"
                        />
                        <Lock className="h-3.5 w-3.5 shrink-0" />
                        <p className="text-[11px] font-medium leading-tight">
                          Private
                        </p>
                        <p className="text-[9px] text-muted-foreground leading-tight">
                          Members only
                        </p>
                      </label>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* ── Member Picker (only shown for private channels) ── */}
            {watchedType === "private" && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <FormLabel className="text-xs">Add Members</FormLabel>
                  {selectedMemberIds.length > 0 && (
                    <span className="text-[11px] text-muted-foreground">
                      {selectedMemberIds.length} selected
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-muted-foreground leading-snug">
                  You're always included. Admins &amp; owners can view all
                  private channels.
                </p>
                <ScrollArea className="h-[110px] rounded-md border">
                  <div className="p-2 space-y-1">
                    {!projectMembers ? (
                      <p className="text-xs text-muted-foreground text-center py-6">
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

            {/* ── Channel Name ── */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Channel Name</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-1 border rounded-md px-3 bg-transparent! focus-within:ring-1 focus-within:ring-ring">
                      {watchedType === "private" ? (
                        <Lock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      ) : (
                        <Hash className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      )}
                      <Input
                        {...field}
                        placeholder="e.g. design-team"
                        className="border-0 p-0 h-9 shadow-none focus-visible:ring-0 bg-transparent!"
                        onChange={(e) =>
                          field.onChange(
                            e.target.value.toLowerCase().replace(/\s+/g, "-"),
                          )
                        }
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* ── Description ── */}
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

            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => handleOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="text-xs">
                {loading ? "Creating…" : "Create Channel"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
