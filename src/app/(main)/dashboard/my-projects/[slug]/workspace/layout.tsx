"use client"
import { TeamspaceProvider, useTeamspace } from "@/providers/TeamspaceProvider"
import { useParams } from "next/navigation"
import { useQuery as useConvexQuery } from "convex/react"
import { api } from "../../../../../../../convex/_generated/api"
import { useEffect } from "react"

export default function WorkspaceLayout({
  children,
  sidebar,
}: {
  children: React.ReactNode,
  sidebar: React.ReactNode,
}) {
  return (
    <TeamspaceProvider>
      <LayoutContent sidebar={sidebar}>
        {children}
      </LayoutContent>
    </TeamspaceProvider>
  )
}

function LayoutContent({ children, sidebar }: { children: React.ReactNode, sidebar: React.ReactNode }) {
  const { slug } = useParams()
  const { setActiveProjectId } = useTeamspace()
  const project = useConvexQuery(api.project.getProjectBySlug, { slug: slug as string })

  useEffect(() => {
    if (project?._id) {
      setActiveProjectId(project._id)
    }
  }, [project?._id, setActiveProjectId])

  return (
    <div className="">
      {sidebar}
      <main className="flex-1">
        {children}
      </main>
    </div>
  )
}
