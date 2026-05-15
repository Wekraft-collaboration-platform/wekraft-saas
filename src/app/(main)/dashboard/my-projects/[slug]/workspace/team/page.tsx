"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../../../../convex/_generated/api";
import { Id } from "../../../../../../../../convex/_generated/dataModel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Users,
  Crown,
  Shield,
  User,
  UserPlus,
  MoreHorizontal,
  Trash2,
  ArrowRightLeft,
  MessageSquare,
  CheckSquare,
  AlertCircle,
  CalendarDays,
  Sparkles,
  Zap,
  TrendingUp,
  ArrowUpRight,
} from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { InviteDialog } from "@/modules/project/inviteDilogag";

const ROLE_CONFIG: Record<string, { label: string; icon: typeof Crown }> = {
  owner: { label: "Owner", icon: Crown },
  admin: { label: "Admin", icon: Shield },
  member: { label: "Member", icon: User },
};

export default function TeamPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const project = useQuery(api.project.getProjectBySlug, { slug });
  const permissions = useQuery(
    api.project.getProjectPermissions,
    project?._id ? { projectId: project._id as Id<"projects"> } : "skip",
  );
  const teamData = useQuery(
    api.project.getTeamPageData,
    project?._id ? { projectId: project._id as Id<"projects"> } : "skip",
  );

  const removeMember = useMutation(api.project.removeMember);
  const updateRole = useMutation(api.project.updateMemberRole);

  const [removeTarget, setRemoveTarget] = useState<{
    id: Id<"projectMembers">;
    name: string;
  } | null>(null);

  const handleRemove = async () => {
    if (!removeTarget || !project) return;
    try {
      await removeMember({
        memberId: removeTarget.id,
        projectId: project._id as Id<"projects">,
      });
      toast.success(`${removeTarget.name} removed from project`);
    } catch (e: any) {
      toast.error(e.message || "Failed to remove member");
    }
    setRemoveTarget(null);
  };

  const handleRoleChange = async (
    memberId: Id<"projectMembers">,
    newRole: "admin" | "member",
    memberName: string,
  ) => {
    if (!project) return;
    try {
      await updateRole({
        memberId,
        projectId: project._id as Id<"projects">,
        newRole,
      });
      toast.success(`${memberName} is now ${newRole}`);
    } catch (e: any) {
      toast.error(e.message || "Failed to change role");
    }
  };

  // Loading state
  if (project === undefined || teamData === undefined) {
    return (
      <div className="w-full h-full p-6 2xl:p-8">
        <div className="flex items-center justify-between mb-8">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-9 w-28" />
        </div>
        <div className="flex gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-16 w-36 rounded-lg" />
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-56 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!project || !teamData) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Project not found</p>
      </div>
    );
  }

  const isPower = permissions?.isPower ?? false;
  const isOwner = permissions?.isOwner ?? false;

  return (
    <div className="w-full h-full">
      <div className="bg-linear-to-br from-blue-500 to-blue-200 p-4 relative">
        {/* Header */}
        <header className="flex items-center justify-between mb-8 z-20 relative">
          <div>
            <h1 className="text-2xl font-semibold flex text-white items-center gap-2">
              <Users className="w-6 h-6 text-white" />
              Team
            </h1>
            <p className="text-sm text-neutral-100 mt-1">
              Manage your project members and roles
            </p>
          </div>
          <InviteDialog
            inviteLink={project?.inviteLink}
            trigger={
              <Button
                size="sm"
                className="text-xs cursor-pointer px-6! bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <UserPlus className="w-4 h-4 mr-1.5" />
                Invite
              </Button>
            }
          />
        </header>

        {/* Stats Bar */}
        <div className="flex items-center gap-3 mb-8 flex-wrap">
          <StatPill
            icon={<Users className="w-3.5 h-3.5" />}
            label="Total"
            value={teamData.total}
          />
          <StatPill
            icon={<Crown className="w-3.5 h-3.5" />}
            label="Owner"
            value={teamData.ownerCount}
          />
          <StatPill
            icon={<Shield className="w-3.5 h-3.5" />}
            label="Admin"
            value={teamData.adminCount}
          />
          <StatPill
            icon={<User className="w-3.5 h-3.5" />}
            label="Members"
            value={teamData.memberCount}
          />
        </div>

        <Image
          src="/team.png"
          alt="Team"
          width={200}
          height={200}
          className="absolute -bottom-4 -right-2"
        />
      </div>

      {/* Plan & Capacity Banner */}
      <div className="px-6 mt-6">
        <div className="relative overflow-hidden rounded-md border border-accent bg-accent/30 shadow">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-3 px-8 relative z-10">
            <div className="flex items-center gap-8 flex-wrap">
              {/* Plan Info */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-primary">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] ">Owner Plan</p>
                  <p className="text-sm capitalize flex items-center gap-1.5">
                    {teamData.ownerPlan} Plan
                    {teamData.ownerPlan === "pro" && (
                      <Badge className="h-4 px-1 text-[8px] bg-amber-500/10 text-amber-500 border-amber-500/20">
                        ELITE
                      </Badge>
                    )}
                  </p>
                </div>
              </div>

              {/* Capacity Info */}
              <div className="h-8 w-[1px] bg-border hidden md:block" />

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center ">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px]">Member Limit</p>
                  <p className="text-sm font-semibold">
                    {teamData.total}{" "}
                    <span className="text-muted-foreground font-normal">
                      of
                    </span>{" "}
                    {teamData.memberLimit}{" "}
                    <span className="text-muted-foreground font-normal">
                      seats
                    </span>
                  </p>
                </div>
              </div>

              {/* Remaining Info */}
              <div className="h-8 w-[1px] bg-border hidden md:block" />

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center ">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px]">Availability</p>
                  <p
                    className={`text-sm text-primary`}
                  >
                    {teamData.memberLimit - teamData.total} Slots left
                  </p>
                </div>
              </div>
            </div>

            {/* Upgrade Action */}
            {isOwner && teamData.ownerPlan !== "pro" && (
              <Button
                variant="default"
                size="sm"
                onClick={() => router.push("/dashboard/pricing")}
                className="rounded-full text-xs bg-blue-500 text-white hover:bg-blue-600"
              >
                Upgrade to Pro
                <ArrowUpRight className="w-3.5 h-3.5 ml-1.5 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </Button>
            )}
          </div>

          {/* Decorative background element */}
          <div className="absolute top-0 right-0 w-80 h-full bg-linear-to-l from-blue-500/25 to-transparent pointer-events-none" />
        </div>
      </div>

      {/* Members Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 px-6 py-5">
        {teamData.members.map((member) => {
          const roleConfig =
            ROLE_CONFIG[member.AccessRole] || ROLE_CONFIG.member;
          const RoleIcon = roleConfig.icon;
          const canManage = isPower && member.AccessRole !== "owner";

          return (
            <div
              key={member.userId}
              className="group relative bg-muted border border-border rounded-xl p-5 transition-all duration-200 hover:border-primary/20 hover:shadow-sm"
            >
              {/* Actions Menu */}
              {canManage && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="absolute top-3.5 right-3.5 p-1 rounded-md  text-muted-foreground hover:text-foreground hover:bg-accent cursor-pointer">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44">
                    {isOwner && (
                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                          <ArrowRightLeft className="w-4 h-4 mr-2" />
                          Change Role
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent>
                          {(["admin", "member"] as const).map((role) => (
                            <DropdownMenuItem
                              key={role}
                              disabled={member.AccessRole === role}
                              onClick={() =>
                                member._id &&
                                handleRoleChange(
                                  member._id as Id<"projectMembers">,
                                  role,
                                  member.userName,
                                )
                              }
                              className="cursor-pointer"
                            >
                              {ROLE_CONFIG[role].label}
                              {member.AccessRole === role && (
                                <span className="ml-auto text-xs text-muted-foreground">
                                  Current
                                </span>
                              )}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuSubContent>
                      </DropdownMenuSub>
                    )}
                    <DropdownMenuItem
                      onClick={() =>
                        router.push(
                          `/dashboard/my-projects/${slug}/workspace/teamspace`,
                        )
                      }
                      className="cursor-pointer"
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Message
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() =>
                        member._id &&
                        setRemoveTarget({
                          id: member._id as Id<"projectMembers">,
                          name: member.userName,
                        })
                      }
                      className="cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Remove
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* Non-manageable members just get Message */}
              {!canManage && member.AccessRole !== "owner" && (
                <button
                  onClick={() =>
                    router.push(
                      `/dashboard/my-projects/${slug}/workspace/teamspace`,
                    )
                  }
                  className="absolute top-3.5 right-3.5 p-1 rounded-md  text-muted-foreground hover:text-foreground hover:bg-accent cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                </button>
              )}

              {/* Avatar + Name + Role */}
              <div className="flex items-start gap-3 mb-4">
                <Avatar className="w-10 h-10 border border-border">
                  <AvatarImage src={member.userImage} />
                  <AvatarFallback className="text-xs font-medium bg-secondary text-secondary-foreground">
                    {member.userName?.[0]?.toUpperCase() || "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground truncate">
                    {member.userName}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {member.userEmail}
                  </p>
                </div>
              </div>

              {/* Role Badge */}
              <div className="mb-4">
                <Badge
                  variant="outline"
                  className="text-[10px] font-medium gap-1 py-0.5"
                >
                  <RoleIcon className="w-3 h-3" />
                  {roleConfig.label}
                </Badge>
              </div>

              {/* Stats Row */}
              <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                <div className="flex items-center gap-1.5">
                  <CheckSquare className="w-3.5 h-3.5" />
                  <span>
                    <span className="text-foreground font-medium">
                      {member.taskCount}
                    </span>{" "}
                    tasks
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>
                    <span className="text-foreground font-medium">
                      {member.issueCount}
                    </span>{" "}
                    issues
                  </span>
                </div>
              </div>

              {/* Joined Date */}
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground pt-3 border-t border-border">
                <CalendarDays className="w-3 h-3" />
                Joined{" "}
                {new Date(member.joinedAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {teamData.members.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Users className="w-10 h-10 text-muted-foreground/40 mb-3" />
          <p className="text-sm text-muted-foreground">No team members yet</p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            Invite members to start collaborating
          </p>
        </div>
      )}

      {/* Remove Confirmation Dialog */}
      <AlertDialog
        open={!!removeTarget}
        onOpenChange={(open) => !open && setRemoveTarget(null)}
      >
        <AlertDialogContent className="bg-card border-border shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Remove member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove{" "}
              <span className="text-foreground font-medium">
                {removeTarget?.name}
              </span>{" "}
              from this project? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemove}
              className="bg-destructive text-white hover:bg-destructive/90 cursor-pointer"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/* Stat Pill Component */
function StatPill({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-md  bg-white text-sm">
      <span className="text-neutral-700">{icon}</span>
      <span className="text-neutral-700">{label}</span>
      <span className="font-semibold text-neutral-900">{value}</span>
    </div>
  );
}
