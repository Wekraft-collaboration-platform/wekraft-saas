"use client";

import { useQuery } from "convex/react";
import { useParams } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { api } from "../../../convex/_generated/api";
import { format, addMonths, subMonths, addWeeks, subWeeks, addDays, subDays } from "date-fns";
import CalendarHeader from "@/modules/calendar/CalendarHeader";
import dynamic from "next/dynamic";
const CalendarView = dynamic(() => import("@/modules/calendar/CalendarView"), { ssr: false });
import EventDialog from "@/modules/calendar/EventDialog";
import EventDetailDialog from "@/modules/calendar/EventDetailDialog";
import { Loader2 } from "lucide-react";
import { Id } from "../../../convex/_generated/dataModel";

export default function CalendarContainer() {
  const params = useParams();
  const slug = params.slug as string;

  const project = useQuery(api.project.getProjectBySlug, { slug });
  
  // Wait until we have the project to query events
  const events = useQuery(
    api.calendar.getEvents,
    project?._id ? { projectId: project._id } : "skip" 
  );

  const [activeTab, setActiveTab] = useState("All Scheduled");
  const [currentView, setCurrentView] = useState("timeGridWeek");
  const [currentDate, setCurrentDate] = useState(new Date());
  const calendarRef = useRef<any>(null);

  // Navigation handlers
  const handlePrev = () => {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      calendarApi.prev();
      setCurrentDate(calendarApi.getDate());
    }
  };

  const handleNext = () => {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      calendarApi.next();
      setCurrentDate(calendarApi.getDate());
    }
  };

  const handleToday = () => {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      calendarApi.today();
      setCurrentDate(calendarApi.getDate());
    }
  };

  const handleDateSelect = (date: Date) => {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      calendarApi.gotoDate(date);
      setCurrentDate(date);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't navigate if the user is typing in an input
      if (
        document.activeElement?.tagName === "INPUT" || 
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }

      if (e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === "ArrowRight") {
        handleNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedEventInfo, setSelectedEventInfo] = useState<any>(null);

  // View detail dialog state
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [viewEventInfo, setViewEventInfo] = useState<any>(null);

  const handleDateClick = (arg: any) => {
    setSelectedEventInfo({
      start: arg.date,
      allDay: arg.allDay,
    });
    setIsDialogOpen(true);
  };

  // Called from hover Edit button
  const handleEventEdit = (eventData: any) => {
    setSelectedEventInfo(eventData);
    setIsDialogOpen(true);
  };

  // Called from hover View button
  const handleEventView = (eventData: any) => {
    setViewEventInfo(eventData);
    setIsDetailOpen(true);
  };

  // Legacy click handler — now bypassed by hover actions, kept for fallback
  const handleEventClick = (arg: any) => {
    const { event } = arg;
    handleEventView({
      id: event.id,
      title: event.title,
      start: event.start,
      end: event.end,
      allDay: event.allDay,
      type: event.extendedProps.type,
      description: event.extendedProps.description,
      color: event.extendedProps.color,
    });
  };

  if (project === undefined || events === undefined) {
    return (
      <div className="flex h-full min-h-[60vh] items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (project === null) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground min-h-[60vh]">
        Project not found
      </div>
    );
  }

  // Filter events based on tab
  const filteredEvents = events.filter((e: any) => {
    if (activeTab === "All Scheduled") return true;
    if (activeTab === "Events") return e.type === "event";
    if (activeTab === "Milestones") return e.type === "milestone";
    if (activeTab === "Comments") return e.type === "comment";
    return true;
  });

  return (
    <div className="flex flex-col h-full  ">
      <CalendarHeader
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentView={currentView}
        setCurrentView={setCurrentView}
        currentDate={currentDate}
        handlePrev={handlePrev}
        handleNext={handleNext}
        handleToday={handleToday}
        onDateSelect={handleDateSelect}
        onNewEvent={() => {
          setSelectedEventInfo(null);
          setIsDialogOpen(true);
        }}
      />
      <div className="flex-1 p-0 overflow-hidden">
        <CalendarView
          calendarRef={calendarRef}
          events={filteredEvents}
          currentView={currentView}
          currentDate={currentDate}
          onPrev={handlePrev}
          onNext={handleNext}
          onDatesSet={(arg: any) => setCurrentDate(arg.view.currentStart)}
          onDateClick={handleDateClick}
          onEventClick={handleEventClick}
          onEventEdit={handleEventEdit}
          onEventView={handleEventView}
        />
      </div>

      <EventDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        projectId={project._id}
        initialData={selectedEventInfo}
      />

      <EventDetailDialog
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        eventData={viewEventInfo}
        onEdit={() => {
          if (viewEventInfo) handleEventEdit(viewEventInfo);
        }}
      />
    </div>
  );
}
