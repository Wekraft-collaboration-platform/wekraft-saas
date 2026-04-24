/**
 * CreateChannelDialog.tsx
 * 
 * Dialog component for creating a new channel in the teamspace.
 * 
 * Features:
 * - Form validation using Zod and React Hook Form.
 * - Selection between "Text" and "Announcement" channel types.
 * - Automatic name formatting (lowercase and hyphenated).
 * 
 * Integration:
 * - Calls the `onCreate` callback passed from `ChannelsSidebar`.
 */
"use client";

import { useState } from "react";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Hash, Megaphone } from "lucide-react";
import { Channel } from "./hooks/useChannels";

const schema = z.object({
  name: z
    .string()
    .min(1, "Name required")
    .max(32, "Max 32 chars")
    .regex(/^[a-z0-9\s-]+$/, "Only lowercase letters, numbers, spaces and hyphens"),
  description: z.string().max(120).optional(),
  type: z.enum(["text", "announcement"]),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreate: (name: string, description: string, type: "text" | "announcement") => Promise<Channel | undefined>;
}

export function CreateChannelDialog({ open, onOpenChange, onCreate }: Props) {
  const [loading, setLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", description: "", type: "text" },
  });

  async function onSubmit(values: FormValues) {
    setLoading(true);
    try {
      await onCreate(values.name, values.description ?? "", values.type);
      form.reset();
      onOpenChange(false);
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
            Create Channel
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Type */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Channel Type</FormLabel>
                  <FormControl>
                    <RadioGroup
                      value={field.value}
                      onValueChange={field.onChange}
                      className="grid grid-cols-2 gap-3"
                    >
                      <label
                        htmlFor="type-text"
                        className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                          field.value === "text"
                            ? "border-primary bg-accent"
                            : "border-border hover:bg-accent/50"
                        }`}
                      >
                        <RadioGroupItem value="text" id="type-text" className="sr-only" />
                        <Hash className="h-4 w-4 shrink-0" />
                        <div>
                          <p className="text-sm font-medium">Text</p>
                          <p className="text-xs text-muted-foreground">General chat</p>
                        </div>
                      </label>
                      <label
                        htmlFor="type-announcement"
                        className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                          field.value === "announcement"
                            ? "border-primary bg-accent"
                            : "border-border hover:bg-accent/50"
                        }`}
                      >
                        <RadioGroupItem value="announcement" id="type-announcement" className="sr-only" />
                        <Megaphone className="h-4 w-4 shrink-0" />
                        <div>
                          <p className="text-sm font-medium">Announcement</p>
                          <p className="text-xs text-muted-foreground">Read-only for members</p>
                        </div>
                      </label>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                {loading ? "Creating..." : "Create Channel"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
