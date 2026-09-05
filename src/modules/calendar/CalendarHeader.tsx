import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CalendarDays,
  CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Filter,
  LucideCalendar,
  MessageSquare,
  Milestone,
  MoreHorizontal,
  Plus,
  Search,
  Star,
  Target,
  TicketCheck,
  UserPlus,
} from "lucide-react";
import {
  format,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  addDays,
  subDays,
  isSameDay,
  isSameMonth,
  startOfWeek,
} from "date-fns";
import { useState } from "react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

const tabs = [
  { name: "All Scheduled", icon: <CalendarDays className="w-4 h-4 mr-2" /> },
  { name: "Events", icon: <TicketCheck className="w-4 h-4 mr-2" /> },
  { name: "Milestones", icon: <Milestone className="w-4 h-4 mr-2" /> },
];

interface CalendarHeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentView: string;
  setCurrentView: (view: string) => void;
  currentDate: Date;
  handlePrev: () => void;
  handleNext: () => void;
  handleToday: () => void;
  onNewEvent: () => void;
  onDateSelect: (date: Date) => void;
}

export default function CalendarHeader({
  activeTab,
  setActiveTab,
  currentView,
  setCurrentView,
  currentDate,
  handlePrev,
  handleNext,
  handleToday,
  onNewEvent,
  onDateSelect,
}: CalendarHeaderProps) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  return (
    <div className="flex flex-col ">
      <style
        dangerouslySetInnerHTML={{
          __html: `
        button, 
        .flex.space-x-1 button, 
        .flex.items-center.bg-muted\\/50 button {
          cursor: pointer !important;
        }
      `,
        }}
      />
      {/* Top Banner section */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">
            <LucideCalendar className="w-6 h-6 mr-2 -mt-1 inline" />
            Project Calendar
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5 font-medium">
            Stay Organized and On Track with Your Personalized Calendar
          </p>
        </div>
        <div className="flex items-center gap-5">
          {/* Removed avatars and invite button */}
        </div>
      </div>

      {/* Tabs and Actions Row */}
      <div className="flex items-center justify-between px-6 border-b border-accent">
        <div className="flex space-x-1">
          {tabs.map((tab) => (
            <button
              key={tab.name}
              onClick={() => setActiveTab(tab.name)}
              className={`flex items-center px-4 py-3.5 text-sm transition-all border-b-1 mb-[-1px] relative active:scale-[0.98] ${
                activeTab === tab.name
                  ? "border-primary/70 text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
              }`}
            >
              {tab.icon}
              {tab.name}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-3 py-2.5">
          <div className="relative hidden md:flex items-center">
            <Search className="absolute left-3 h-4 w-4 text-muted-foreground/60" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-[260px] pl-9 h-9.5 bg-muted border-border rounded-lg placeholder:text-muted-foreground/50 focus-visible:ring-1 focus-visible:ring-primary/40 ring-offset-background"
            />
          </div>
          <Button size="sm" onClick={onNewEvent} className="py-2 px-5 text-xs">
            <Plus className="w-4 h-4 mr-1.5" strokeWidth={2.5} /> New
          </Button>
        </div>
      </div>

      {(() => {
        const isTodayInRange =
          (currentView === "dayGridMonth" &&
            isSameMonth(currentDate, new Date())) ||
          (currentView === "timeGridWeek" &&
            isSameDay(
              startOfWeek(currentDate, { weekStartsOn: 1 }),
              startOfWeek(new Date(), { weekStartsOn: 1 }),
            ));

        return (
          <div className="flex items-center justify-between px-6 py-4.5">
            <div className="flex items-center gap-5">
              <button
                onClick={handleToday}
                className="text-xl font-bold text-foreground tracking-tight hover:text-muted-foreground transition-colors cursor-pointer"
              >
                {format(new Date(), "EEEE, MMMM d")}
              </button>
            </div>

            <div className="flex items-center gap-5">
              <div className="flex items-center gap-2 mr-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground border-border/60 hover:bg-muted hover:text-foreground active:scale-95 transition-transform"
                  onClick={handlePrev}
                >
                  <ChevronLeft className="w-4 h-4" strokeWidth={2} />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground border-border/60 hover:bg-muted hover:text-foreground active:scale-95 transition-transform"
                  onClick={handleNext}
                >
                  <ChevronRight className="w-4 h-4" strokeWidth={2} />
                </Button>
              </div>

              <div className="flex items-center bg-muted p-1 rounded-lg border border-border">
                <button
                  onClick={() => setCurrentView("timeGridWeek")}
                  className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all duration-150 ${
                    currentView === "timeGridWeek"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Week
                </button>
                <button
                  onClick={() => setCurrentView("dayGridMonth")}
                  className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all duration-150 ${
                    currentView === "dayGridMonth"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Month
                </button>
              </div>

              {/* Date Picker Trigger Wrapper */}
              <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <PopoverTrigger asChild>
                  <button className="flex items-center text-sm  text-foreground/80 border border-border rounded-lg px-4 h-9 bg-card  hover:border-border transition-all active:scale-95 group">
                    <CalendarIcon className="w-4 h-4 mr-3 text-muted-foreground group-hover:text-foreground/70 transition-colors" />
                    <span className="group-hover:text-foreground transition-colors">
                      {currentView === "timeGridWeek"
                        ? (() => {
                            // Monday-start week range (matching firstDay=1)
                            const day = currentDate.getDay();
                            const diff = day === 0 ? -6 : 1 - day; // offset to get Monday
                            const weekStart = addDays(currentDate, diff);
                            const weekEnd = addDays(weekStart, 6);
                            return `${format(weekStart, "d MMM")} – ${format(weekEnd, "d MMM yyyy")}`;
                          })()
                        : format(currentDate, "MMMM yyyy")}
                    </span>
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto p-0 bg-background border-border shadow-2xl rounded-xl overflow-hidden"
                  align="end"
                >
                  <Calendar
                    mode="single"
                    selected={currentDate}
                    onSelect={(date) => {
                      if (date) {
                        onDateSelect(date);
                        setIsCalendarOpen(false);
                      }
                    }}
                    initialFocus
                    className="bg-zinc-950 text-foreground"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
