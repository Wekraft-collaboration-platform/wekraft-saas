"use client";

import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CalendarDays, Clock, FileText, Tag, Pencil } from "lucide-react";

interface EventDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventData: any;
  onEdit: () => void;
}

const typeLabels: Record<string, { label: string; color: string }> = {
  event:     { label: "Event",     color: "#c4b5fd" },
  milestone: { label: "Milestone", color: "#bae6fd" },
  comment:   { label: "Comment",   color: "#ffffff" },
};

export default function EventDetailDialog({ open, onOpenChange, eventData, onEdit }: EventDetailDialogProps) {
  if (!eventData) return null;

  const typeInfo = typeLabels[eventData.type] || typeLabels.event;
  const color = eventData.type === "comment" ? "#ffffff" : (eventData.color || typeInfo.color);

  const formatDate = (d: any) => {
    if (!d) return "—";
    try { return format(new Date(d), "dd MMM yyyy, hh:mm a"); }
    catch { return "—"; }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] bg-zinc-950 border border-zinc-800 text-zinc-100 p-0 overflow-hidden">
        {/* Color accent top bar */}
        <div className="h-1 w-full" style={{ backgroundColor: color }} />

        <div className="p-6">
          <DialogHeader className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <span
                className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border"
                style={{ color, borderColor: `${color}40`, backgroundColor: `${color}15` }}
              >
                {typeInfo.label}
              </span>
            </div>
            <DialogTitle className="text-lg font-bold text-zinc-100 leading-tight">
              {eventData.title}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            {eventData.start && (
              <div className="flex items-center gap-3 text-sm text-zinc-400">
                <CalendarDays className="w-4 h-4 flex-shrink-0 text-zinc-600" />
                <span>{formatDate(eventData.start)}</span>
              </div>
            )}
            {eventData.end && !eventData.allDay && (
              <div className="flex items-center gap-3 text-sm text-zinc-400">
                <Clock className="w-4 h-4 flex-shrink-0 text-zinc-600" />
                <span>Until {formatDate(eventData.end)}</span>
              </div>
            )}
            {eventData.description && (
              <div className="flex items-start gap-3 text-sm text-zinc-400 pt-1">
                <FileText className="w-4 h-4 flex-shrink-0 mt-0.5 text-zinc-600" />
                <p className="leading-relaxed whitespace-pre-wrap">{eventData.description}</p>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-zinc-800">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="border-zinc-700 text-zinc-400 hover:text-zinc-100"
            >
              Close
            </Button>
            <Button
              size="sm"
              onClick={() => { onOpenChange(false); onEdit(); }}
              className="gap-1.5"
              style={{ backgroundColor: `${color}22`, borderColor: `${color}40`, color }}
            >
              <Pencil className="w-3.5 h-3.5" />
              Edit
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
