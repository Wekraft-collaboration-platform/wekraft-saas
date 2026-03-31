"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { CalendarIcon, Loader2 } from "lucide-react";
import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../../../../../../convex/_generated/api";

export default function ProjectCalendarPage() {
  const params = useParams();
  const slug = params.slug as string;

  const project = useQuery(api.project.getProjectBySlug, { slug });

  if (project === undefined) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (project === null) {
    return (
      <div className="flex h-[60vh] items-center justify-center text-muted-foreground">
        Project not found
      </div>
    );
  }

  return (
    <section className="fc-shell p-6">
      <div className="mb-3 flex items-center justify-between px-1 mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">
          <CalendarIcon className="w-6 h-6 inline mr-2" /> Project Calendar
        </h1>
      </div>

      <div className="fc-theme h-[760px] overflow-hidden rounded-lg border">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          height="100%"
          fixedWeekCount={false}
          dayMaxEventRows={3}
          nowIndicator
          displayEventTime={false}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek",
          }}
          buttonText={{
            today: "Today",
            month: "Month",
            week: "Week",
          }}
          events={[]}
          eventDisplay="block"
        />
      </div>
    </section>
  );
}