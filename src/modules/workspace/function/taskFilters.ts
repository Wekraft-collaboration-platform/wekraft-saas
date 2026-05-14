import { Task } from "@/types/types";

export type SortConfig = {
  field: "duration" | "priority";
  direction: "asc" | "desc";
} | null;

export const applyTaskFilters = (
  tasks: Task[],
  sortConfig: SortConfig,
  tagFilter: string | null,
) => {
  let result = [...tasks];

  // 1. Tag Filtering
  if (tagFilter) {
    result = result.filter((task) => task.type?.label === tagFilter);
  }

  // 2. Sorting
  if (sortConfig) {
    result.sort((a, b) => {
      if (sortConfig.field === "priority") {
        const priorityMap: Record<string, number> = {
          none: 0,
          low: 1,
          medium: 2,
          high: 3,
        };
        const pA = priorityMap[a.priority || "none"];
        const pB = priorityMap[b.priority || "none"];
        return sortConfig.direction === "asc" ? pA - pB : pB - pA;
      }

      if (sortConfig.field === "duration") {
        if (sortConfig.direction === "asc") {
          // Upcoming First (Soonest start date)
          const startA = a.estimation?.startDate || Infinity;
          const startB = b.estimation?.startDate || Infinity;
          return startA - startB;
        } else {
          // Near Deadline (Soonest end date)
          const endA = a.estimation?.endDate || Infinity;
          const endB = b.estimation?.endDate || Infinity;
          return endA - endB;
        }
      }
      return 0;
    });
  }

  return result;
};
