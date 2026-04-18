import React from "react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Calendar, Clock, Users } from "lucide-react";
import { format } from "date-fns";
import { Id } from "../../../convex/_generated/dataModel";

interface ProjectMember {
  _id: Id<"projectMembers">;
  _creationTime: number;
  joinedAt?: number;
  leftAt?: number;
  userId: Id<"users">;
  userName: string;
  userImage?: string;
  projectId: Id<"projects">;
  AccessRole?: "admin" | "member" | "viewer";
}

interface ProjectInfoProps {
  project: {
    _id: Id<"projects">;
    projectName: string;
    description?: string;
    tags?: string[];
    createdAt: number;
    updatedAt: number;
    ownerId: Id<"users">;
    ownerName: string;
    ownerImage: string;
  };
  members?: ProjectMember[];
}

const ProjectInfo = ({ project, members }: ProjectInfoProps) => {
  return (
    <div className="w-full flex flex-col gap-6">
      <div className="space-y-4">
        {/* Project Name */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-primary font-semibold min-w-[100px]">
            Project name:
          </span>
          <h3 className="text-lg font-bold tracking-tight">
            {project.projectName}
          </h3>
        </div>

        {/* Description */}
        <div className="flex items-start gap-3">
          <span className="text-sm text-primary font-semibold min-w-[100px] mt-0.5">
            Description:
          </span>
          <p className="text-sm text-foreground/80 leading-relaxed">
            {project.description || "no description provided...."}
          </p>
        </div>

        {/* Tags */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-primary font-semibold min-w-[100px]">
            Tags:
          </span>
          {project.tags && project.tags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="text-[10px] px-2 py-0 border-muted-foreground/30 font-medium"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground italic">
              No tags added
            </p>
          )}
        </div>
      </div>

      {/* Dates - Combined in one line */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted-foreground font-medium py-4 border-b border-accent">
        <div className="flex items-center gap-2">
          <Calendar className="w-3 h-3 text-primary/70" />
          <span>Created: {format(project.createdAt, "MMM d, yyyy")}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-3 h-3 text-primary/70" />
          <span>Updated: {format(project.updatedAt, "MMM d, yyyy")}</span>
        </div>
      </div>

      {/* Team Section */}
      <div className="space-y-5">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-primary" />
          <span className="text-sm text-primary font-semibold">
            Team details:
          </span>
        </div>

        <div className="space-y-4">
          {/* Owner */}
          <div className="flex items-center gap-2 group">
            <Avatar className="w-10 h-10 border border-primary/20 p-0.5 shadow-sm">
              <AvatarImage src={project.ownerImage} className="rounded-full" />
              <AvatarFallback className="text-xs bg-muted">
                {project.ownerName?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex gap-6">
              <p className="text-sm font-semibold text-primary transition-colors">
                {project.ownerName}
              </p>
              <div className="flex mt-0.5">
                <Badge
                  variant="default"
                  className="text-[11px] h-4 px-2.5 py-1 font-medium tracking-tighter"
                >
                  Owner
                </Badge>
              </div>
            </div>
          </div>

          {/* Members */}
          {members
            ?.filter((m) => m.userId !== project.ownerId)
            .map((member) => (
              <div key={member._id} className="flex items-center gap-4 group">
                <Avatar className="w-10 h-10 border border-border p-0.5">
                  <AvatarImage
                    src={member.userImage}
                    className="rounded-full"
                  />
                  <AvatarFallback className="text-xs">
                    {member.userName?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <p className="text-sm font-medium group-hover:text-primary transition-colors">
                    {member.userName}
                  </p>
                  <div className="flex mt-0.5">
                    <Badge
                      variant="outline"
                      className="text-[9px] h-4 px-1.5 py-0 uppercase font-bold tracking-tighter border-muted-foreground/30 text-muted-foreground"
                    >
                      {member.AccessRole || "Member"}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectInfo;
