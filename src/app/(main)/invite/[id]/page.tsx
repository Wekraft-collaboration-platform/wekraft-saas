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
  const [requestSent, setRequestSent] = React.useState(false);

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
      setRequestSent(true);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to send join request",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-screen bg-background text-foreground flex flex-col relative overflow-hidden">
      {/* BACKGROUND ASSET */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/bg-footer.jpg"
          alt="Night Background"
          fill
          className="object-cover opacity-60"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/20 to-background/60 " />
      </div>

      {/* HEADER */}
      <header className="p-6 flex items-center justify-between z-10 relative">
        <Link href="/" className="flex items-center gap-2 group">
          <Image
            src="/logo.svg"
            alt="logo"
            width={24}
            height={24}
            className="rounded-sm"
          />
          <span className="text-lg font-bold tracking-tight text-primary">
            WeKraft
          </span>
        </Link>
      </header>

      {/* CONTENT */}
      <main className="flex-1 flex items-center justify-center p-6 z-10 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-[380px]"
        >
          <div className="bg-background/40 backdrop-blur-xl border border-white/10 shadow-[0_24px_80px_rgba(0,0,0,0.5)] rounded-2xl overflow-hidden">
            {isLoading ? (
              <div className="p-8 space-y-6">
                <div className="flex justify-center">
                  <Skeleton className="w-16 h-16 rounded-2xl" />
                </div>
                <div className="space-y-2 text-center">
                  <Skeleton className="h-5 w-3/4 mx-auto" />
                  <Skeleton className="h-3 w-1/2 mx-auto" />
                </div>
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
            ) : !project ? (
              <div className="p-8 text-center space-y-6">
                <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto border border-red-500/20">
                  <ShieldAlert className="w-8 h-8 text-red-500" />
                </div>
                <div className="space-y-1.5">
                  <h2 className="text-lg font-bold tracking-tight">
                    Invalid Invite
                  </h2>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    This link has expired or is no longer valid.
                  </p>
                </div>
                <Button
                  className="w-full h-10 rounded-lg text-sm"
                  onClick={() => router.push("/dashboard")}
                >
                  Go to Dashboard
                </Button>
              </div>
            ) : requestSent ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-8 text-center space-y-6"
              >
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto border border-primary/20">
                  <CheckCircle2 className="w-8 h-8 text-primary" />
                </div>
                <div className="space-y-1.5">
                  <h2 className="text-lg font-bold tracking-tight">
                    Request Sent
                  </h2>
                  <p className="text-muted-foreground text-xs leading-relaxed px-4">
                    Your request to join <b>"{project.projectName}"</b> has been
                    sent to the owner.
                  </p>
                </div>
                <Button
                  className="w-full h-10 rounded-lg text-sm font-medium"
                  onClick={() => router.push("/dashboard")}
                >
                  Return to Dashboard
                </Button>
              </motion.div>
            ) : (
              <div className="flex flex-col">
                <div className="p-8 text-center space-y-6">
                  {/* PROJECT AVATAR */}
                  <div className="relative mx-auto w-16 h-16 group">
                    <div className="absolute -inset-1 bg-primary/20 rounded-2xl blur-md opacity-0 group-hover:opacity-100 transition duration-500" />
                    <Image
                      src={project.ownerImage || "/avatar-fallback.png"}
                      alt={project.ownerName}
                      fill
                      className="rounded-2xl object-cover border border-white/10 shadow-lg relative z-10"
                    />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary rounded-lg flex items-center justify-center shadow-lg border border-background z-20">
                      <Users className="w-3 h-3 text-primary-foreground" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <h2 className="text-lg font-bold tracking-tight">
                      Project Invitation
                    </h2>
                    <p className="text-muted-foreground text-xs leading-relaxed">
                      Collaborate on{" "}
                      <span className="font-semibold text-foreground">
                        {project.projectName}
                      </span>
                    </p>
                  </div>

                  {/* STATUS INDICATORS */}
                  <div className="flex flex-col gap-2 pt-2">
                    {isAuthenticated ? (
                      <div className="flex items-center gap-2.5 px-3 py-2 bg-white/5 rounded-xl border border-white/10">
                        <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                        <p className="text-[11px] text-left text-muted-foreground font-medium">
                          Signed in as {currentUser?.name || "Member"}
                        </p>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2.5 px-3 py-2 bg-yellow-500/5 rounded-xl border border-yellow-500/10">
                        <ShieldAlert className="w-4 h-4 text-yellow-500 shrink-0" />
                        <p className="text-[11px] text-left text-muted-foreground font-medium">
                          Login required to join project
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* ACTION BAR */}
                <div className="p-4 bg-white/5 border-t border-white/5">
                  {isAuthenticated ? (
                    <>
                      {currentUser?._id === project.ownerId ? (
                        <Button
                          className="w-full h-10 rounded-lg text-sm font-medium"
                          onClick={() =>
                            router.push(
                              `/dashboard/my-projects/${project.slug}`,
                            )
                          }
                        >
                          Manage Project
                        </Button>
                      ) : (
                        <Button
                          className="w-full h-10 rounded-lg text-sm font-medium group"
                          onClick={() => setIsOpen(true)}
                        >
                          Accept & Join
                          <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                        </Button>
                      )}

                      <Dialog open={isOpen} onOpenChange={setIsOpen}>
                        <DialogContent className="sm:max-w-[400px] bg-background border-border rounded-2xl shadow-2xl">
                          <DialogHeader>
                            <DialogTitle className="text-lg font-bold tracking-tight">
                              Join Project
                            </DialogTitle>
                            <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
                              Introduce yourself to <b>{project.ownerName}</b>.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="py-4">
                            <Textarea
                              placeholder="I'd love to help with this project..."
                              className="min-h-[100px] bg-accent/10 border-border focus:border-primary/50 transition-all rounded-xl resize-none text-xs placeholder:text-muted-foreground/30"
                              value={message}
                              onChange={(e) => setMessage(e.target.value)}
                            />
                          </div>
                          <DialogFooter>
                            <Button
                              type="submit"
                              className="w-full h-10 rounded-lg font-medium text-sm"
                              disabled={isSubmitting}
                              onClick={handleJoin}
                            >
                              {isSubmitting ? (
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                              ) : (
                                <Rocket className="w-4 h-4 mr-2" />
                              )}
                              Send Join Request
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </>
                  ) : (
                    <Button
                      className="w-full h-10 rounded-lg text-sm font-semibold group bg-primary text-primary-foreground"
                      onClick={() => router.push("/auth")}
                    >
                      Login to Continue
                      <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
