"use client";

import React from "react";
import {
  Clock,
  Tag,
  ArrowUpNarrowWide,
  ArrowDownWideNarrow,
  Calendar,
  Check,
  RotateCcw,
  Signal,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { SortPopover } from "@/lib/static-store";
import { cn } from "@/lib/utils";
import { Task } from "@/types/types";

interface SortOptionProps {
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  isActive?: boolean;
}

const SortOption = ({ label, icon, onClick, isActive }: SortOptionProps) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center gap-3 w-full px-3 py-2 text-[11px] font-medium transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800/50 rounded-lg group",
      isActive ? "text-primary bg-primary/5" : "text-muted-foreground",
    )}
  >
    {icon && (
      <div className="shrink-0 transition-transform group-hover:scale-110">
        {icon}
      </div>
    )}
    <span>{label}</span>
    {isActive && <Check className="w-3.5 h-3.5 ml-auto text-primary" />}
  </button>
);

// 1. DURATION POPOVER
export const DurationSortPopover = ({
  sortConfig,
  setSortConfig,
  trigger,
}: {
  sortConfig: { field: string; direction: "asc" | "desc" } | null;
  setSortConfig: (config: any) => void;
  trigger: React.ReactNode;
}) => (
  <SortPopover title="Sort Duration" icon={Clock} trigger={trigger}>
    <SortOption
      label="Upcoming First"
      icon={<Calendar className="w-3.5 h-3.5" />}
      isActive={sortConfig?.field === "duration" && sortConfig?.direction === "asc"}
      onClick={() => setSortConfig({ field: "duration", direction: "asc" })}
    />
    <SortOption
      label="Near Deadline"
      icon={<Clock className="w-3.5 h-3.5" />}
      isActive={sortConfig?.field === "duration" && sortConfig?.direction === "desc"}
      onClick={() => setSortConfig({ field: "duration", direction: "desc" })}
    />
    <SortOption
      label="Clear Sort"
      icon={<RotateCcw className="w-3.5 h-3.5" />}
      onClick={() => setSortConfig(null)}
    />
  </SortPopover>
);

// 2. TAGS POPOVER
export const TagFilterPopover = ({
  tasks,
  activeTag,
  setTagFilter,
  trigger,
}: {
  tasks: Task[];
  activeTag: string | null;
  setTagFilter: (tag: string | null) => void;
  trigger: React.ReactNode;
}) => {
  const uniqueTags = Array.from(
    new Set(tasks.map((t) => t.type?.label).filter(Boolean)),
  );

  return (
    <SortPopover title="Filter by Tags" icon={Tag} trigger={trigger}>
      <SortOption
        label="View All"
        isActive={activeTag === null}
        onClick={() => setTagFilter(null)}
      />
      {uniqueTags.map((tag) => (
        <SortOption
          key={tag as string}
          label={tag as string}
          isActive={activeTag === tag}
          onClick={() => setTagFilter(tag as string)}
        />
      ))}
    </SortPopover>
  );
};

// 3. PRIORITY POPOVER
export const PrioritySortPopover = ({
  sortConfig,
  setSortConfig,
  trigger,
}: {
  sortConfig: { field: string; direction: "asc" | "desc" } | null;
  setSortConfig: (config: any) => void;
  trigger: React.ReactNode;
}) => (
  <SortPopover title="Sort Priority" icon={Signal} trigger={trigger}>
    <SortOption
      label="High to Low"
      icon={<ArrowDown className="w-3.5 h-3.5" />}
      isActive={sortConfig?.field === "priority" && sortConfig?.direction === "desc"}
      onClick={() => setSortConfig({ field: "priority", direction: "desc" })}
    />
    <SortOption
      label="Low to High"
      icon={<ArrowUp className="w-3.5 h-3.5" />}
      isActive={sortConfig?.field === "priority" && sortConfig?.direction === "asc"}
      onClick={() => setSortConfig({ field: "priority", direction: "asc" })}
    />
    <SortOption
      label="Clear Sort"
      icon={<RotateCcw className="w-3.5 h-3.5" />}
      onClick={() => setSortConfig(null)}
    />
  </SortPopover>
);
