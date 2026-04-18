"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { useConvexAuth } from "convex/react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Rocket,
  Users,
  ShieldAlert,
  CheckCircle2,
  ArrowRight,
  LogIn,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useMutation } from "convex/react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

export default function InvitePage() {
  const params = useParams();
  const router = useRouter();
  const inviteCode = params.id as string;
  const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth();

  const project = useQuery(api.project.getProjectByInviteCode, {
    inviteCode,
  });

  const currentUser = useQuery(api.user.getCurrentUser);

  const createJoinRequest = useMutation(api.project.createJoinRequest);

  const [isOpen, setIsOpen] = React.useState(false);
  const [message, setMessage] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const isLoading = project === undefined || isAuthLoading;

  const handleJoin = async () => {
    if (!project) return;
    setIsSubmitting(true);
    try {
      await createJoinRequest({
        projectId: project._id,
        message: message.trim(),
        source: "invited",
      });
      toast.success("Join request sent successfully!");
      setIsOpen(false);
      // Wait a bit before redirecting so user sees the toast
      // router.push("/dashboard");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to send join request",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-screen bg-black text-foreground flex flex-col relative overflow-hidden">
      {/* HEADER */}
      <header className="p-8 flex items-center justify-between z-10">
        <Link href="/" className="flex items-center gap-2.5 group">
          <Image
            src="/logo.svg"
            alt="logo"
            width={26}
            height={26}
            className="rounded-sm"
          />

          <span className="text-xl font-bold tracking-tight text-primary">
            WeKraft
          </span>
        </Link>
      </header>

      {/* CONTENT */}
      <main className="flex-1 flex items-center justify-center p-6 z-10">
        <div className="w-full max-w-[420px]">
          <div className="bg-sidebar border border-accent shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] rounded-3xl overflow-hidden">
            {isLoading ? (
              <div className="p-10 space-y-6">
                <div className="flex justify-center">
                  <Skeleton className="w-20 h-20 rounded-full" />
                </div>
                <div className="space-y-3 text-center">
                  <Skeleton className="h-6 w-3/4 mx-auto" />
                  <Skeleton className="h-4 w-1/2 mx-auto" />
                </div>
                <Skeleton className="h-12 w-full rounded-xl" />
              </div>
            ) : !project ? (
              <div className="p-10 text-center space-y-6">
                <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
                  <ShieldAlert className="w-10 h-10 text-red-500" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold">Invalid Invite</h2>
                  <p className="text-muted-foreground text-sm">
                    This invite link has expired or is no longer valid.
                  </p>
                </div>
                <Link href="/dashboard" className="block">
                  <Button className="w-full h-12 rounded-xl">
                    Go to Dashboard
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="flex flex-col">
                <div className="p-8 md:p-10 text-center space-y-6">
                  {/* OWNER AVATAR */}
                  <div className="relative mx-auto w-20 h-20">
                    <Image
                      src={project.ownerImage || "/avatar-fallback.png"}
                      alt={project.ownerName}
                      fill
                      className="rounded-xl object-cover ring-4 ring-background border-2 border-accent/10"
                    />
                    <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-primary rounded-full flex items-center justify-center shadow-lg border-2 border-background">
                      <Users className="w-4 h-4 text-primary-foreground" />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h2 className="text-xl font-bold tracking-tight">
                      Project Invitation
                    </h2>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      you are invited to join & collaborate on
                      <span className="block mt-1 font-bold text-lg text-foreground">
                        "{project.projectName}"
                      </span>
                    </p>
                  </div>

                  {/* STATUS INDICATORS */}
                  <div className="flex flex-col gap-3 py-2">
                    <div className="flex items-center gap-3 p-3 bg-accent/30 rounded-xl border border-accent">
                      <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                      <p className="text-[13px] text-left text-muted-foreground font-medium">
                        Valid invitation detected
                      </p>
                    </div>

                    {isAuthenticated ? (
                      <div className="flex items-center gap-3 p-3 bg-blue-500/5 rounded-xl border border-blue-500/10">
                        <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0" />
                        <p className="text-[13px] text-left text-muted-foreground font-medium">
                          Session authenticated
                        </p>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 p-3 bg-yellow-500/5 rounded-xl border border-yellow-500/10">
                        <LogIn className="w-5 h-5 text-yellow-500 shrink-0" />
                        <p className="text-[13px] text-left text-muted-foreground font-medium">
                          Login required to join
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* ACTION BAR */}
                <div className="p-4 bg-accent/5 border-t border-accent/10">
                  {isAuthenticated ? (
                    <>
                      {currentUser?._id === project.ownerId ? (
                        <Button
                          className="w-full h-10 rounded-lg text-sm group relative overflow-hidden"
                          onClick={() =>
                            router.push(
                              `/dashboard/my-projects/${project.slug}`,
                            )
                          }
                        >
                          <span className="relative z-10 flex items-center gap-2">
                            Manage Project{" "}
                            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                          </span>
                        </Button>
                      ) : (
                        <Button
                          className="w-full h-10 rounded-lg text-sm group relative overflow-hidden"
                          onClick={() => setIsOpen(true)}
                        >
                          <span className="relative z-10 flex items-center gap-2">
                            Accept & Join{" "}
                            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                          </span>
                        </Button>
                      )}

                      <Dialog open={isOpen} onOpenChange={setIsOpen}>
                        <DialogContent className="sm:max-w-[425px] bg-sidebar border-accent rounded-2xl">
                          <DialogHeader>
                            <DialogTitle className="text-xl font-bold tracking-tight">
                              Join Project
                            </DialogTitle>
                            <DialogDescription className="text-muted-foreground">
                              Write a short message to the project owner about
                              why you want to join.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <Textarea
                              placeholder="Hello! I'd love to help with..."
                              className="min-h-[120px] bg-accent/20 border-accent/30 focus:border-primary/50 transition-colors rounded-xl resize-none"
                              value={message}
                              onChange={(e) => setMessage(e.target.value)}
                            />
                          </div>
                          <DialogFooter>
                            <Button
                              type="submit"
                              className="w-full h-11 rounded-xl font-medium"
                              disabled={isSubmitting}
                              onClick={handleJoin}
                            >
                              {isSubmitting ? (
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                              ) : (
                                <Rocket className="w-4 h-4 mr-2" />
                              )}
                              Send Request
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </>
                  ) : (
                    <Button
                      className="w-full h-12 rounded-xl text-sm font-semibold group"
                      onClick={() => router.push("/auth")}
                    >
                      <span className="flex items-center gap-2">
                        Login to Continue <ArrowRight className="w-4 h-4" />
                      </span>
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
