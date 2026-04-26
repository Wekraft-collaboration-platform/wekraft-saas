"use client";

import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../../../../../../convex/_generated/api";
import { Id } from "../../../../../../../../convex/_generated/dataModel";
import Link from "next/link";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Zap,
  Clock,
  CheckCircle2,
  Target,
  FastForward,
  FileCodeCorner,
  FastForwardIcon,
  Sparkles,
  MoveRight,
} from "lucide-react";
import { CreateSprintDialog } from "@/modules/workspace/CreateSprintDialog";
import Image from "next/image";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Filter, Calendar, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useKayaStore } from "@/store/useKayaStore";

const SprintPage = () => {
  const params = useParams();
  const slug = params.slug as string;
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { setIsOpen } = useKayaStore();

  const project = useQuery(api.project.getProjectBySlug, { slug });
  const sprints = useQuery(
    api.sprint.getSprintsByProject,
    project?._id ? { projectId: project._id as Id<"projects"> } : "skip",
  );

  if (!project || sprints === undefined) {
    return (
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-72" />
          </div>

          <div className="flex gap-2">
            <Skeleton className="h-9 w-32 rounded-md" />
            <Skeleton className="h-9 w-28 rounded-md" />
          </div>
        </div>

        {/* Search + Filter */}
        <div className="flex gap-3">
          <Skeleton className="h-10 flex-1 rounded-md" />
          <Skeleton className="h-10 w-40 rounded-md" />
        </div>

        {/* Sprint Card */}
        <div className="rounded-xl border p-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Skeleton className="w-12 h-12 rounded-lg" />

            <div className="space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right space-y-2">
              <Skeleton className="h-4 w-16 ml-auto" />
              <Skeleton className="h-5 w-10 ml-auto" />
            </div>

            <Skeleton className="w-8 h-8 rounded-full" />
          </div>
        </div>

        <div className="rounded-xl border p-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Skeleton className="w-12 h-12 rounded-lg" />

            <div className="space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right space-y-2">
              <Skeleton className="h-4 w-16 ml-auto" />
              <Skeleton className="h-5 w-10 ml-auto" />
            </div>

            <Skeleton className="w-8 h-8 rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  const filteredSprints = sprints?.filter((s) => {
    const matchesSearch = s.sprintName
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/20 px-2.5 py-0.5 rounded-full capitalize">
            {status}
          </Badge>
        );
      case "planned":
        return (
          <Badge className="bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border-amber-500/20 px-2.5 py-0.5 rounded-full capitalize">
            {status}
          </Badge>
        );
      case "completed":
        return (
          <Badge className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-blue-500/20 px-2.5 py-0.5 rounded-full capitalize">
            {status}
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="rounded-full capitalize">
            {status}
          </Badge>
        );
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <Zap className="w-4 h-4 text-emerald-500" />;
      case "planned":
        return <Clock className="w-4 h-4 text-amber-500" />;
      case "completed":
        return <CheckCircle2 className="w-4 h-4 text-blue-500" />;
      default:
        return <Target className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="w-full h-full p-6 max-w-7xl mx-auto">
      {/* Header */}
      <header className="flex items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-semibold">
            <FastForward className="w-6 h-6 mr-2 text-primary inline-block" />
            Sprints
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your project sprints and track progress effectively.
          </p>
        </div>

        <div className="flex items-center gap-5">
          {/* AI button */}
          <Button
            size="sm"
            variant={"outline"}
            onClick={() => setIsOpen(true)}
            className="bg-linear-to-t from-indigo-600/30 via-purple-600/10 to-transparent text-xs cursor-pointer"
          >
            <Image src="/kaya.svg" alt="Kaya AI" width={18} height={18} />
            Manage Sprints
          </Button>
          <CreateSprintDialog
            projectId={project._id as Id<"projects">}
            projectName={project.projectName || "Project"}
            trigger={
              <Button size="sm" className="shadow-sm text-xs">
                <Plus className="w-4 h-4 mr-2" />
                New Sprint
              </Button>
            }
          />
        </div>
      </header>

      {sprints?.length === 0 ? (
        <div className="mt-20">
          {/* Empty State */}
          <div className="flex flex-col items-start justify-center space-y-1.5 p-4 w-[360px] mx-auto">
            <Image
              src="/pat103.svg"
              alt="Empty Workspace"
              width={100}
              height={100}
              className=""
            />

            <div className="space-y-1.5">
              <p className="text-xl font-semibold text-primary">
                No Sprint Created
              </p>
              <p className="text-muted-foreground text-sm lg:text-[15px]">
                Create Sprints to organize your work into manageable timeframes
                and track progress effectively.
              </p>
            </div>

            <div className="flex  gap-3 mt-4">
              <CreateSprintDialog
                projectId={project._id as Id<"projects">}
                projectName={project.projectName || "Project"}
                trigger={
                  <Button
                    variant="default"
                    size="sm"
                    className="rounded-full px-5"
                  >
                    <FastForwardIcon className="w-4 h-4 mr-2" />
                    Create Sprint
                  </Button>
                }
              />
              <Button variant="outline" size="sm" className="rounded-full px-5">
                Check Docs
                <FileCodeCorner className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6 max-w-[88%] mx-auto">
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative w-full sm:flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by sprint name..."
                className="pl-9 bg-muted/30 focus-visible:bg-background transition-colors border border-border"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[160px] bg-muted/30">
                  <div className="flex items-center gap-2">
                    <Filter className="w-3.5 h-3.5 text-muted-foreground" />
                    <SelectValue placeholder="Status" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="planned">Planned</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Sprints List */}
          <div className="grid gap-4 mt-10 mb-20">
            {filteredSprints?.map((sprint) => (
              <div
                key={sprint._id}
                onClick={() =>
                  router.push(
                    `/dashboard/my-projects/${slug}/workspace/sprint/${encodeURIComponent(sprint.sprintName)}`,
                  )
                }
                className="group relative overflow-hidden bg-sidebar border border-border rounded-md transition-all duration-200 cursor-pointer "
              >
                <div className="p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start md:items-center gap-4">
                    <div
                      className={`p-2 rounded-md bg-opacity-10 ${
                        sprint.status === "active"
                          ? "bg-blue-500/30"
                          : sprint.status === "planned"
                            ? "bg-amber-500/30"
                            : "bg-emerald-500/30"
                      }`}
                    >
                      <FastForward className="w-5 h-5" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-4 flex-wrap">
                        <h3 className="font-semibold text-base group-hover:text-primary transition-colors">
                          {sprint.sprintName}
                        </h3>
                        <Badge
                          variant="outline"
                          className="capitalize px-3 py-1"
                        >
                          {sprint.status}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>
                            {format(sprint.duration.startDate, "MMM d")}
                            <MoveRight className="w-3.5 h-3.5 inline mx-1.5" />
                            {format(sprint.duration.endDate, "MMM d, yyyy")}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1.5 opacity-80">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                            <span>{sprint.totalTasks || 0} tasks</span>
                          </div>
                          <div className="flex items-center gap-1.5 opacity-80">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                            <span>{sprint.totalIssues || 0} issues</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end md:self-center">
                    <div className="text-right hidden sm:block mr-2">
                      <p className="text-xs font-medium text-muted-foreground tracking-wider">
                        Progress
                      </p>
                      <p className="text-sm font-semibold">
                        {(sprint.totalTasks || 0) + (sprint.totalIssues || 0) >
                        0
                          ? Math.round(
                              (((sprint.completedTasks || 0) +
                                (sprint.closedIssues || 0)) /
                                ((sprint.totalTasks || 0) +
                                  (sprint.totalIssues || 0))) *
                                100,
                            )
                          : 0}
                        %
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full bg-secondary/50 group-hover:bg-primary group-hover:text-primary-foreground transition-all"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {filteredSprints?.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed rounded-3xl bg-muted/5">
                <div className="bg-muted p-4 rounded-full mb-4">
                  <Search className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium">No results found</h3>
                <p className="text-muted-foreground mt-1 max-w-[250px] text-center">
                  We couldn&apos;t find any sprints matching &quot;{search}
                  &quot; with {statusFilter} status.
                </p>
                <Button
                  variant="link"
                  onClick={() => {
                    setSearch("");
                    setStatusFilter("all");
                  }}
                  className="mt-2"
                >
                  Clear all filters
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SprintPage;
