"use client";

import { useEffect, useState } from "react";
import { useMutation } from "convex/react";
import { format } from "date-fns";
import { api } from "../../../convex/_generated/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Trash } from "lucide-react";

interface EventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: any;
  initialData?: any;
}

const colorOptions = [
  { value: "#c4b5fd", label: "Purple" },
  { value: "#bae6fd", label: "Blue" },
  { value: "#bbf7d0", label: "Green" },
  { value: "#fecdd3", label: "Pink" },
];

export default function EventDialog({ open, onOpenChange, projectId, initialData }: EventDialogProps) {
  const createEvent = useMutation(api.calendar.createEvent);
  const updateEvent = useMutation(api.calendar.updateEvent);
  const deleteEvent = useMutation(api.calendar.deleteEvent);

  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"event" | "milestone" | "comment">("event");
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("10:00");
  const [color, setColor] = useState(colorOptions[0].value);

  useEffect(() => {
    if (open) {
      if (initialData?.id) {
        setTitle(initialData.title || "");
        setDescription(initialData.description || "");
        setType(initialData.type || "event");
        setColor(initialData.color || colorOptions[0].value);
        if (initialData.start) {
          setStartDate(format(new Date(initialData.start), "yyyy-MM-dd"));
          setStartTime(format(new Date(initialData.start), "HH:mm"));
        }
        if (initialData.end) {
          setEndDate(format(new Date(initialData.end), "yyyy-MM-dd"));
          setEndTime(format(new Date(initialData.end), "HH:mm"));
        } else if (initialData.start && initialData.allDay) {
          setEndDate(format(new Date(initialData.start), "yyyy-MM-dd"));
          setEndTime("23:59");
        }
      } else {
        setTitle("");
        setDescription("");
        setType("event");
        setColor(colorOptions[0].value);
        const base = initialData?.start ? new Date(initialData.start) : new Date();
        setStartDate(format(base, "yyyy-MM-dd"));
        setStartTime("09:00");
        setEndDate(format(base, "yyyy-MM-dd"));
        setEndTime("10:00");
      }
    }
  }, [open, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const startDateTime = new Date(`${startDate}T${startTime}`).getTime();
      const endDateTime = new Date(`${endDate}T${endTime}`).getTime();
      const isComment = type === "comment";

      if (initialData?.id) {
        await updateEvent({
          id: initialData.id,
          title,
          description,
          type,
          start: startDateTime,
          end: endDateTime,
          allDay: isComment || (startTime === "00:00" && endTime === "23:59"),
          color,
        });
      } else {
        await createEvent({
          projectId,
          title,
          description,
          type,
          start: startDateTime,
          end: endDateTime,
          allDay: isComment,
          color,
        });
      }
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to save event:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!initialData?.id) return;
    setIsLoading(true);
    try {
      await deleteEvent({ id: initialData.id });
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to delete event:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-zinc-950 border border-zinc-800 text-zinc-100">
        <DialogHeader>
          <DialogTitle className="text-zinc-100">{initialData?.id ? "Edit Entry" : "New Entry"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2 p-1 bg-zinc-800/60 rounded-md border border-zinc-700/40">
            <button
              type="button"
              onClick={() => setType("event")}
              className={`flex-1 text-sm py-1.5 rounded font-medium transition-colors ${
                type === "event" ? "bg-zinc-700 text-zinc-100 shadow-sm" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Event
            </button>
            <button
              type="button"
              onClick={() => setType("milestone")}
              className={`flex-1 text-sm py-1.5 rounded font-medium transition-colors ${
                type === "milestone" ? "bg-zinc-700 text-zinc-100 shadow-sm" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Milestone
            </button>
            <button
              type="button"
              onClick={() => setType("comment")}
              className={`flex-1 text-sm py-1.5 rounded font-medium transition-colors ${
                type === "comment" ? "bg-zinc-700 text-zinc-100 shadow-sm" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Comment
            </button>
          </div>

          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label className="text-zinc-400" htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e: any) => setTitle(e.target.value)}
                placeholder={type === "comment" ? "Quick note..." : "Add title"}
                required
                className="bg-zinc-900 border-zinc-700 text-zinc-100 placeholder:text-zinc-600"
              />
            </div>

            {type !== "comment" && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-zinc-400">Start</Label>
                  <Input type="date" value={startDate} onChange={(e: any) => setStartDate(e.target.value)} required className="bg-zinc-900 border-zinc-700 text-zinc-300" />
                  <Input type="time" value={startTime} onChange={(e: any) => setStartTime(e.target.value)} required className="bg-zinc-900 border-zinc-700 text-zinc-300" />
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-400">End</Label>
                  <Input type="date" value={endDate} onChange={(e: any) => setEndDate(e.target.value)} required className="bg-zinc-900 border-zinc-700 text-zinc-300" />
                  <Input type="time" value={endTime} onChange={(e: any) => setEndTime(e.target.value)} required className="bg-zinc-900 border-zinc-700 text-zinc-300" />
                </div>
              </div>
            )}

            {type === "comment" && (
              <div className="space-y-2">
                <Label className="text-zinc-400">Date</Label>
                <Input type="date" value={startDate} onChange={(e: any) => {
                  setStartDate(e.target.value);
                  setEndDate(e.target.value);
                }} required className="bg-zinc-900 border-zinc-700 text-zinc-300" />
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-zinc-400">Description</Label>
              <Textarea
                placeholder="Add details, notes, or comments..."
                value={description}
                onChange={(e: any) => setDescription(e.target.value)}
                className="resize-none h-24 bg-zinc-900 border-zinc-700 text-zinc-300 placeholder:text-zinc-600"
              />
            </div>

            {type !== "comment" && (
              <div className="space-y-2">
                <Label className="text-zinc-400">Color</Label>
                <div className="flex gap-2">
                  {colorOptions.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setColor(c.value)}
                      className={`w-6 h-6 rounded-full border-2 ${color === c.value ? "border-zinc-300" : "border-transparent"}`}
                      style={{ backgroundColor: c.value }}
                      title={c.label}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-between pt-4 pb-2 border-t border-zinc-800">
            {initialData?.id ? (
              <Button type="button" variant="destructive" onClick={handleDelete} disabled={isLoading} size="icon">
                <Trash className="h-4 w-4" />
              </Button>
            ) : (
              <div />
            )}
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} className="w-24">
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
