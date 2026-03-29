"use client"
import { ChartNoAxesGantt, Loader2, CalendarPlus, Target, ArrowRight } from 'lucide-react'
import React, { useState } from 'react'
import { useParams } from 'next/navigation'
import { useQuery } from 'convex/react'
import { api } from "../../../../../../../../convex/_generated/api"
import { Id } from '../../../../../../../../convex/_generated/dataModel'
import { PageTransition } from '@/components/PageTransition'
import { SetTargetDateDialog } from '@/modules/workspace/SetTargetDateDialog'
import { Button } from '@/components/ui/button'

const TimeLogsPage = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const params = useParams();
  const slug = params.slug as string;

  const project = useQuery(api.project.getProjectBySlug, { slug });
  const tasks = useQuery(api.workspace.getTimelineTasks, { 
    projectId: project?._id as any 
  });
  const projectId = project?._id;
  
  const projectDetails = useQuery(api.projectDetails.getProjectDetails, {
      projectId: projectId as Id<"projects">,
    });

    if(project === undefined || projectDetails === undefined) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="w-8 h-8 animate-spin" />
            </div>
        )
    }
    if(project === null) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p className="text-muted-foreground">Project not found</p>
            </div>
        )
    }

  return (
    <PageTransition className='w-full h-full p-6 2xl:p-8'>
        <header>
             <h1 className="text-3xl font-semibold">
        <ChartNoAxesGantt className="w-6 h-6 ml-1 text-primary inline" />  Time Logs 
        </h1>
        </header>

        <div className="my-5 border border-dashed rounded-md h-[200px] w-full flex items-center justify-center">
            <p className="text-muted-foreground">Rsereved for Future deadline tracking charts & Insights</p>
        </div>

        {/* Timeline tracker */}
        <div className='mt-10 h-[calc(100vh-280px)]'>
           {projectDetails?.targetDate ? (
            <div className="h-full">
                {/* Timeline logic will go here */}
                <div className="text-muted-foreground text-xs italic opacity-60">
                   Timeline engine initialized. Waiting for task data streams...
                </div>
            </div>
           ): (
            <div className="">
                <p>deadline not set for this project</p>
              <Button 
                        onClick={() => setIsDialogOpen(true)}
                        className=""
                    >
                        Initialize Project Timeline <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
            </div>
           )}
        </div>

        <SetTargetDateDialog
            isOpen={isDialogOpen}
            onOpenChange={setIsDialogOpen}
            projectId={project._id}
            projectName={project.projectName}
        />
    </PageTransition>
  )
}

export default TimeLogsPage;