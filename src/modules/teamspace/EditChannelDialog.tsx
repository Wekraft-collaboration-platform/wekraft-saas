/**
 * EditChannelDialog.tsx
 * 
 * Dialog component for editing an existing channel's properties (name, description).
 * 
 * Integration:
 * - Calls the `onUpdate` callback passed from `ChannelsSidebar`.
 * - Populates the form with existing channel data.
 */
"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Hash } from "lucide-react";
import { Channel } from "./hooks/useChannels";

const schema = z.object({
  name: z
    .string()
    .min(1, "Name required")
    .max(32, "Max 32 chars")
    .regex(/^[a-z0-9\s-]+$/, "Only lowercase letters, numbers, spaces and hyphens"),
  description: z.string().max(120).optional(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onUpdate: (channelId: string, name: string, description: string) => Promise<boolean>;
  channel: Channel | null;
}

export function EditChannelDialog({ open, onOpenChange, onUpdate, channel }: Props) {
  const [loading, setLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", description: "" },
  });

  useEffect(() => {
    if (channel) {
      form.reset({
        name: channel.name,
        description: channel.description ?? "",
      });
    }
  }, [channel, form]);

  async function onSubmit(values: FormValues) {
    if (!channel) return;
    setLoading(true);
    try {
      const success = await onUpdate(channel.id, values.name, values.description ?? "");
      if (success) {
        onOpenChange(false);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Hash className="h-4 w-4" />
            Edit Channel
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Channel Name</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-1 border rounded-md px-3 bg-input focus-within:ring-1 focus-within:ring-ring">
                      <Hash className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <Input
                        {...field}
                        placeholder="e.g. dev-chat"
                        className="border-0 p-0 h-9 shadow-none focus-visible:ring-0 bg-transparent"
                        onChange={(e) =>
                          field.onChange(e.target.value.toLowerCase().replace(/\s+/g, "-"))
                        }
                      />
                    </div>
                  </FormControl>
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
                  <FormLabel>Description <span className="text-muted-foreground">(optional)</span></FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="What's this channel for?"
                      className="resize-none h-20 text-sm"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
