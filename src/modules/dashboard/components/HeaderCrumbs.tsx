"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const navigationItems = [
  { title: "Dashboard", url: "/dashboard" },
  { title: "Profile", url: "/dashboard/my-profile" },
  { title: "My Projects", url: "/dashboard/my-projects" },
];

function formatWorkspaceSubroute(subroute: string): string {
  const specialCases: Record<string, string> = {
    ai: "AI",
    docs: "Docs",
    meet: "Meet",
  };

  const lower = subroute.toLowerCase();
  if (specialCases[lower]) {
    return specialCases[lower];
  }

  return subroute
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function DashboardBreadcrumbs() {
  const pathname = usePathname();

  // 1. Check if it's a workspace route
  // e.g. /dashboard/my-projects/[slug]/workspace/...
  const workspaceRegex =
    /^\/dashboard\/my-projects\/([^/]+)\/workspace(?:\/([^/]+))?/;
  const workspaceMatch = pathname.match(workspaceRegex);

  if (workspaceMatch) {
    const slug = workspaceMatch[1];
    const subroute = workspaceMatch[2]; // e.g. "tasks", "issues", etc., or undefined

    return (
      <Breadcrumb>
        <BreadcrumbList>
          {/* Dashboard (clickable Link) */}
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/dashboard">Dashboard</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>

          <BreadcrumbSeparator />

          {/* Workspace */}
          <BreadcrumbItem>
            {subroute ? (
              <BreadcrumbLink asChild>
                <Link href={`/dashboard/my-projects/${slug}/workspace`}>
                  Workspace
                </Link>
              </BreadcrumbLink>
            ) : (
              <BreadcrumbPage>Workspace</BreadcrumbPage>
            )}
          </BreadcrumbItem>

          {/* Subroute label */}
          {subroute && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>
                  {formatWorkspaceSubroute(subroute)}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </>
          )}
        </BreadcrumbList>
      </Breadcrumb>
    );
  }

  // 2. Default routing fallback
  const activeItem = navigationItems
    .filter(
      (item) => pathname === item.url || pathname.startsWith(`${item.url}/`),
    )
    .sort((a, b) => b.url.length - a.url.length)[0];

  if (!activeItem) return null;

  const isDashboardOnly = activeItem.url === "/dashboard";
  const isMyProjectsRoot = pathname === "/dashboard/my-projects";

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {/* Dashboard */}
        <BreadcrumbItem>
          {isDashboardOnly ? (
            <BreadcrumbPage>Dashboard</BreadcrumbPage>
          ) : (
            <BreadcrumbLink asChild>
              <Link href="/dashboard">Dashboard</Link>
            </BreadcrumbLink>
          )}
        </BreadcrumbItem>

        {/* Active section (e.g. My Projects) */}
        {!isDashboardOnly && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              {isMyProjectsRoot ? (
                <BreadcrumbPage>{activeItem.title}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link href={activeItem.url}>{activeItem.title}</Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
