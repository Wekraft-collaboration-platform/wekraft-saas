"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { isSameMonth, startOfWeek, isSameDay } from "date-fns";
import { useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CalendarViewProps {
  calendarRef: React.RefObject<any>;
  events: any[];
  currentView: string;
  currentDate: Date;
  onDatesSet: (arg: any) => void;
  onPrev: () => void;
  onNext: () => void;
  onDateClick: (arg: any) => void;
  onEventClick: (arg: any) => void;
  onEventEdit: (eventData: any) => void;
  onEventView: (eventData: any) => void;
}

export default function CalendarView({
  calendarRef,
  events,
  currentView,
  currentDate,
  onDatesSet,
  onPrev,
  onNext,
  onDateClick,
  onEventClick,
  onEventEdit,
  onEventView,
}: CalendarViewProps) {
  useEffect(() => {
    if (calendarRef.current) {
      const api = calendarRef.current.getApi();
      if (api.view.type !== currentView) {
        api.changeView(currentView);
      }
    }
  }, [currentView]);

  const renderEventContent = (eventInfo: any) => {
    const { event } = eventInfo;
    const isComment = event.extendedProps.type === "comment";
    const description = event.extendedProps.description;

    // Light premium pastel colors
    const typeColors: Record<string, string> = {
      event: "#c4b5fd",
      milestone: "#bae6fd",
      comment: "#bbf7d0",
    };

    // Use saved color or type default; comments always white
    const color = isComment
      ? "#ffffff"
      : (event.extendedProps.color || typeColors[event.extendedProps.type as string] || typeColors.event);

    const eventData = {
      id: event.id,
      title: event.title,
      start: event.start,
      end: event.end,
      allDay: event.allDay,
      type: event.extendedProps.type,
      description: event.extendedProps.description,
      color: event.extendedProps.color,
    };

    if (isComment) {
      return (
        <div className="relative flex items-center gap-1.5 overflow-hidden p-1.5 w-full rounded-lg border border-white/10 shadow-sm bg-white/5 group">
          <svg className="w-3 h-3 flex-shrink-0 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          <span className="text-[11px] truncate font-medium text-white/80 group-hover:opacity-0 transition-opacity">{event.title}</span>
          {/* Hover action overlay */}
          <div className="absolute inset-0 flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-900/80 rounded-lg">
            <button
              onClick={(e) => { e.stopPropagation(); onEventView(eventData); }}
              className="text-[10px] font-semibold px-2 py-0.5 rounded bg-white/10 text-white hover:bg-white/20 transition-colors"
            >View</button>
            <button
              onClick={(e) => { e.stopPropagation(); onEventEdit(eventData); }}
              className="text-[10px] font-semibold px-2 py-0.5 rounded bg-white/10 text-white hover:bg-white/20 transition-colors"
            >Edit</button>
          </div>
        </div>
      );
    }

    return (
      <div
        className="relative flex flex-col h-full w-full p-2 leading-[1.2] overflow-hidden border-l-[3px] rounded-r-lg shadow-sm group transition-all"
        style={{ borderLeftColor: color, backgroundColor: `${color}18` }}
      >
        {eventInfo.timeText && (
          <div className="text-[10px] font-semibold mb-1 flex items-center justify-between tracking-tight" style={{ color: `${color}cc` }}>
            {eventInfo.timeText}
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
          </div>
        )}
        <div className="text-[11.5px] font-bold leading-tight line-clamp-2 group-hover:opacity-0 transition-opacity" style={{ color }}>
          {event.title}
        </div>
        {description && (
          <div className="text-[10px] mt-1 leading-snug line-clamp-2 opacity-70 group-hover:opacity-0 transition-opacity" style={{ color }}>
            {description}
          </div>
        )}
        {/* Hover action overlay */}
        <div className="absolute inset-0 flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity rounded-r-lg"
          style={{ backgroundColor: `${color}22` }}
        >
          <button
            onClick={(e) => { e.stopPropagation(); onEventView(eventData); }}
            className="text-[10px] font-bold px-2.5 py-1 rounded-md transition-colors"
            style={{ backgroundColor: `${color}30`, color, border: `1px solid ${color}50` }}
          >View</button>
          <button
            onClick={(e) => { e.stopPropagation(); onEventEdit(eventData); }}
            className="text-[10px] font-bold px-2.5 py-1 rounded-md transition-colors"
            style={{ backgroundColor: `${color}50`, color, border: `1px solid ${color}80` }}
          >Edit</button>
        </div>
      </div>
    );
  };

  const mappedEvents = events.map((e) => ({
    id: e._id,
    title: e.title,
    start: e.start,
    end: e.end,
    allDay: e.allDay || e.type === "comment",
    backgroundColor: "transparent", // Handled in renderEventContent
    borderColor: "transparent",
    textColor: "#f1f5f9",
    extendedProps: {
      type: e.type,
      description: e.description,
      color: e.color,
    },
  }));

  return (
    <div className="relative h-full w-full p-6 bg-background select-none">
      <style dangerouslySetInnerHTML={{ __html: `
        .fc-header-toolbar { display: none !important; }
        
        /* Dark Theme Variables */
        :root {
          --fc-border-color: #27272a; /* zinc-800 */
          --fc-daygrid-event-dot-width: 5px;
          --fc-now-indicator-color: #ef4444;
        }


        .fc .fc-scrollgrid { border-radius: 12px; }
        
        /* Day Headers */
        .fc-col-header-cell {
          background-color: #09090b !important; /* zinc-950 */
          padding: 16px 0 !important;
          text-transform: uppercase;
          font-size: 10.5px;
          letter-spacing: 0.1em;
          font-weight: 800;
          color: #71717a; /* zinc-500 */
        }
        
        .fc .fc-col-header-cell-cushion { padding: 0 !important; }
        .fc-timegrid-axis-cushion, .fc-timegrid-slot-label-cushion {
          font-size: 10px;
          font-weight: 700;
          color: #52525b; /* zinc-600 */
          text-transform: uppercase;
        }

        .fc-timegrid-slot-label { border-right: none !important; }
        .fc-timegrid-slot { height: 3.5em !important; border-top: 1px dashed #18181b !important; }
        
        /* Universal Pointer Cursor */
        .fc, .fc-view, .fc-view-harness {
          cursor: pointer !important;
        }

        /* Highlight Today - premium indigo tint */
        .fc .fc-day-today { background-color: rgba(141, 142, 149, 0.09) !important; }
        .fc .fc-timegrid-col.fc-day-today { background-color: rgba(67, 67, 72, 0.07) !important; }
        /* Today column header in indigo */
        .fc .fc-day-today .fc-col-header-cell-cushion { color: #aaaaaaff !important; font-weight: 700 !important; }

        /* Column Headers - shown in week view */
        .fc-col-header-cell {
          background-color: #09090b !important;
          padding: 10px 0 !important;
          font-size: 11px;
          letter-spacing: 0.05em;
          font-weight: 700;
          color: #52525b;
        }
        .fc .fc-col-header-cell-cushion { padding: 0 !important; color: #71717a; }

        /* Hide col-header ONLY for month view (dates are in day cells) */
        .fc-dayGridMonth-view .fc-col-header { display: none !important; }
        .fc-dayGridMonth-view .fc-scrollgrid-section-header { display: none !important; }

        /* The axis frame - blank in col-header row, 'ALL DAY' in all-day slot handled by FC */
        .fc-timegrid-axis-frame { 
          background-color: #09090b !important;
          border-color: var(--fc-border-color) !important;
        }

        /* Hide all-day row in week view (blank row) */
        .fc-timeGridWeek-view .fc-scrollgrid-section.fc-scrollgrid-section-body:first-of-type td,
        .fc-timeGridWeek-view .fc-daygrid-body,
        .fc-timeGridWeek-view tr.fc-scrollgrid-section-body:has(.fc-daygrid-body) {
          display: none !important;
        }

        /* Ensure axis labels don't show background text */
        .fc-timegrid-axis.fc-axis {
          color: transparent !important;
        }

        /* Ensure all axis cells are dark */
        .fc-timegrid-axis {
           background-color: #09090b !important;
        }

        .fc-event { 
          border: none !important; 
          margin: 1px 2px !important; 
          cursor: pointer !important;
          transition: transform 0.15s ease, box-shadow 0.15s ease, filter 0.15s ease !important;
        }

        .fc-event:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px -4px rgba(0, 0, 0, 0.4);
          filter: brightness(1.08);
          z-index: 50 !important;
        }

        /* Week view: hover on specific date column only (not whole row) */
        .fc-timegrid-col:not(.fc-day-disabled):hover {
          background-color: rgba(255, 255, 255, 0.025) !important;
          cursor: pointer !important;
        }

        /* Hover effect for day cells (Month view) */
        .fc-daygrid-day:hover {
          background-color: rgba(255, 255, 255, 0.03) !important;
          cursor: pointer !important;
        }

        /* Current month dates - white; other month dates - muted */
        .fc .fc-daygrid-day:not(.fc-day-other) .fc-daygrid-day-number {
          padding: 8px !important;
          font-weight: 600;
          color: #e4e4e7 !important; /* zinc-200 — bright white */
        }
        .fc .fc-daygrid-day.fc-day-other .fc-daygrid-day-number {
          padding: 8px !important;
          font-weight: 500;
          color: #3f3f46 !important; /* zinc-700 — clearly dimmed */
        }

        /* Premium Scrollbar styling */
        .fc-scroller::-webkit-scrollbar { 
          width: 5px !important; 
          height: 5px !important;
        }
        .fc-scroller::-webkit-scrollbar-track { 
          background: transparent !important; 
        }
        .fc-scroller::-webkit-scrollbar-thumb { 
          background: #27272a !important; /* zinc-800 */
          border-radius: 10px !important; 
        }
        .fc-scroller::-webkit-scrollbar-thumb:hover {
          background: #3f3f46 !important; /* zinc-700 */
        }
      `}} />

      <div className="h-fit overflow-visible rounded-2xl border border-zinc-800/70 shadow-[0_4px_16px_rgb(0,0,0,0.3)] bg-zinc-950">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView={currentView}
          initialDate={currentDate}
          headerToolbar={false}
          allDayText=""
          height={currentView === 'dayGridMonth' ? 'auto' : '800px'}
          firstDay={1}
          dayHeaderContent={(arg) => {
            // Show "Apr 1", "Mar 31" in week view col headers
            const d = arg.date;
            return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          }}
          slotMinTime="00:00:00"
          slotMaxTime="24:00:00"
          allDaySlot={true}
          nowIndicator={true}
          events={mappedEvents}
          eventContent={renderEventContent}
          datesSet={onDatesSet}
          dateClick={onDateClick}
          eventClick={onEventClick}
          editable={false}
          selectable={true}
          dayMaxEvents={true}
          dayHeaderFormat={{ day: 'numeric' }}
        />
      </div>
    </div>
  );
}
