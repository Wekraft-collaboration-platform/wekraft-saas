"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  ChevronLeft,
  Check,
  SearchAlert,
  HandHeart,
  FolderGit2,
  Search,
  Lock,
  Globe,
  UserPlus,
  FolderGit,
  Loader2,
  Copy,
  UserRoundCog,
  Lightbulb,
  Code2,
  Rocket,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { STEPS, SOURCES, PURPOSES } from "./StaticContent";
import { PROJECT_STATUS, INVITE_LINK, ROLES } from "@/lib/static-store";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation } from "convex/react";
import { toast } from "sonner";
import { api } from "../../../../convex/_generated/api";
import { useRouter } from "next/navigation";
import { nanoid } from "nanoid";
import { IdentityRolePicker } from "./IdentityRolePicker";

const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 20 : -20,
    opacity: 0,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 20 : -20,
    opacity: 0,
  }),
};

const STATUS_CONFIG: Record<
  string,
  { icon: React.ElementType; label: string }
> = {
  ideation: { icon: Lightbulb, label: "Ideation" },
  validation: { icon: Search, label: "Validation" },
  development: { icon: Code2, label: "Development" },
  beta: { icon: Rocket, label: "Beta" },
  production: { icon: Globe, label: "Production" },
  scaling: { icon: TrendingUp, label: "Scaling" },
};

export function MultiStepOnboarding() {
  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Mutations
  const updatePurposes = useMutation(api.user.updateUserPrimaryUsage);
  const updateIdentity = useMutation(api.user.updateUserIdentity);
  const initProject = useMutation(api.project.projectInitOnboarding);
  const completeOnboarding = useMutation(api.user.completeOnboarding);

  // Form State
  const [purposes, setPurposes] = useState<string[]>([]);

  // Step 2
  const [username, setUsername] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [usernameError, setUsernameError] = useState<string | null>(null);

  // Step 3
  const [projectName, setProjectName] = useState("");
  const [isPublic, setIsPublic] = useState(true); // default always true.
  const [projectStatus, setProjectStatus] = useState("");
  const [generatedInviteLink, setGeneratedInviteLink] = useState("");

  // step 4
  const [selectedRepo, setSelectedRepo] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const handleNext = async () => {
    try {
      setIsLoading(true);

      if (currentStep === 1) {
        // optional
        if (purposes.length > 0) {
          await updatePurposes({ purposes });
        }
      }

      if (currentStep === 2) {
        if (usernameError) {
          toast.error(usernameError);
          setIsLoading(false);
          return;
        }

        if (!username || !selectedRole) {
          toast.error("Please provide a username and select a role");
          setIsLoading(false);
          return;
        }

        try {
          await updateIdentity({ name: username, occupation: selectedRole });
          toast.success("Identity updated successfully");
        } catch (error: any) {
          toast.error(error.message || "Username is already taken");
          setIsLoading(false);
          return; // Stop here, don't go to step 3
        }
      }

      if (currentStep === 3) {
        if (!projectName || !projectStatus) {
          toast.error("Please provide project name and status");
          return;
        }
        try {
          const inviteCode = nanoid(32);
          await initProject({
            projectName,
            isPublic,
            projectStatus,
            inviteLink: inviteCode,
          });
          setGeneratedInviteLink(inviteCode);
        } catch (error: any) {
          toast.error(error.message || "Try with another name");
          setIsLoading(false);
          return;
        }
      }

      if (currentStep === 5) {
        await completeOnboarding();
        toast.success("Welcome to WeKraft!");
        router.push("/dashboard");
        return;
      }

      setDirection(1);
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
    } catch (error: any) {
      console.error(error);
      if (
        error.message?.includes("unauthorized") ||
        error.message?.includes("authentication")
      ) {
        toast.error("Session expired. Please sign in again.");
      } else {
        toast.error("An error occurred while saving. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
    setDirection(1);
  };

  const handleBack = () => {
    setDirection(-1);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const togglePurpose = (id: string) => {
    setPurposes((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  };

  const isSkip = currentStep === 1 || currentStep === 4;

  return (
    <div className="dark flex flex-col items-center justify-center h-screen p-4 pt-10 relative text-foreground overflow-hidden">
      <Image
        src="/bg-footer.jpg"
        alt="bg-image"
        fill
        className="absolute w-full h-full object-cover opacity-20"
        priority
      />

      <div className="absolute -top-1/3 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[500px] bg-blue-500/55 transform-gpu blur-[200px] rounded-full pointer-events-none opacity-50" />

      {/* Progress Header */}
      <div className="flex items-center gap-3 absolute top-8">
        {STEPS.map((step) => (
          <React.Fragment key={step.id}>
            <div
              className={cn(
                "flex items-center justify-center w-8 h-8 rounded-full border text-sm transition-all duration-300",
                currentStep >= step.id
                  ? "bg-white text-black border-white"
                  : "bg-transparent text-muted-foreground border-white/40",
              )}
            >
              {currentStep > step.id ? <Check className="w-4 h-4" /> : step.id}
            </div>
            {step.id < 5 && (
              <div
                className={cn(
                  "w-8 h-[1px] transition-colors duration-300",
                  currentStep > step.id ? "bg-white" : "bg-white/40",
                )}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* BODY  */}
      <main className="w-full h-full flex flex-col max-h-[500px] max-w-2xl  bg-linear-to-b from-neutral-100/20 to-transparent rounded-2xl overflow-hidden font-sans">
        <div className="p-5 h-full flex flex-col">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStep}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              {/* ── STEP 1 : your Main purpose of using wekraft (SKIP) ── */}
              {currentStep === 1 && (
                <div className="space-y-5 relative">
                  <div className="text-center space-y-1 mb-5">
                    <h2 className="text-xl font-semibold tracking-tight text-white ">
                      What brings you to WeKraft{" "}
                      <HandHeart className="w-6 h-6 inline ml-2 text-white" />
                    </h2>
                    <p className="text-white/70 text-sm">
                      Pick one or more — helps us tailor your experience{" "}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {PURPOSES.map((p) => {
                      const selected = purposes.includes(p.id);
                      return (
                        <button
                          key={p.id}
                          onClick={() => togglePurpose(p.id)}
                          className={cn(
                            "relative flex items-start gap-3 p-3 rounded-xl border text-left transition-all duration-200 group overflow-hidden",
                            selected
                              ? `bg-linear-to-br from-white/30 to-white/10 shadow-[0_0_20px_rgba(255,255,255,0.06)]`
                              : "bg-white/5 border-white/10 hover:bg-white/[0.08] hover:border-white/20",
                          )}
                        >
                          {/* Icon bubble */}
                          <div
                            className={cn(
                              "shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200",
                              selected
                                ? `bg-white/70 text-black border ${p.border}`
                                : "bg-white/15 border-white/10 group-hover:scale-105",
                            )}
                          >
                            <p.icon
                              className={cn(
                                "w-4 h-4",
                                selected ? "text-neutral-800" : "text-white",
                              )}
                            />
                          </div>

                          {/* Text */}
                          <div className="min-w-0">
                            <p
                              className={cn(
                                "text-sm font-semibold leading-tight",
                                selected ? "text-white" : "text-white",
                              )}
                            >
                              {p.label}
                            </p>
                            <p
                              className={cn(
                                "text-xs mt-0.5 leading-snug",
                                selected ? "text-white" : "text-white/70",
                              )}
                            >
                              {p.description}
                            </p>
                          </div>

                          {/* Check badge */}
                          {selected && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="absolute top-2 right-2"
                            >
                              <div
                                className={cn(
                                  "rounded-full p-0.5 border bg-blue-500",
                                  p.border,
                                )}
                              >
                                <Check className={cn("w-3 h-3 text-white")} />
                              </div>
                            </motion.div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
              {/* ── STEP 2 : Update User Name and Occupation ── */}
              {currentStep === 2 && (
                <div className="space-y-4 relative">
                  <div className="text-center space-y-1 mb-3">
                    <h2 className="text-xl font-semibold tracking-tight text-white ">
                      Let’s set up your identity
                      <UserRoundCog className="w-6 h-6 inline ml-2 text-white" />
                    </h2>
                    <p className="text-white/70 text-sm px-8 text-center">
                      Choose unique name & Occupation — this is how people will
                      find you & build with you.
                    </p>
                  </div>

                  <IdentityRolePicker
                    username={username}
                    onUsernameChange={setUsername}
                    roles={ROLES}
                    selectedRole={selectedRole}
                    onRoleSelect={setSelectedRole}
                    onValidationError={setUsernameError}
                  />
                </div>
              )}
              {/* --- STEP 3 : CREATE FIRST PROJECT */}
              {currentStep === 3 && (
                <div className="space-y-5 relative">
                  <div className="text-center space-y-1 mb-5">
                    <h2 className="text-xl font-semibold tracking-tight text-white flex items-center justify-center gap-2">
                      Create your first project
                      <FolderGit className="w-6 h-6 " />
                    </h2>
                    <p className="text-white/50 text-sm">
                      Create your first project to sync and collab{" "}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="projectName"
                        className="text-sm text-white"
                      >
                        Project Name
                      </Label>
                      <Input
                        id="projectName"
                        placeholder={"Acme saas"}
                        className="bg-white/10! border border-white/30! text-white placeholder:text-neutral-300"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                      />
                    </div>

                    <div className="space-y-3">
                      <Label className="text-sm text-white">
                        Status{" "}
                        <span className="text-xs normal-case tracking-tight font-inter text-neutral-300 ml-1">
                          (will help the community to know about your project.)
                        </span>
                      </Label>
                      <div className="grid grid-cols-3 gap-3">
                        {PROJECT_STATUS.map((status) => {
                          const isSelected = projectStatus === status;
                          const config = STATUS_CONFIG[status] || {
                            icon: FolderGit,
                            label: status,
                          };

                          return (
                            <button
                              key={status}
                              onClick={() => setProjectStatus(status)}
                              className={cn(
                                "relative flex flex-col items-start gap-4 p-4 rounded-lg border text-left transition-all duration-300 overflow-hidden group h-20",
                                isSelected
                                  ? "bg-white/15 border-white text-white shadow-[0_0_20px_rgba(255,255,255,0.05)]"
                                  : "bg-white/5 border-white/10 text-neutral-400 hover:bg-white/5 hover:border-white/20 hover:text-white",
                              )}
                            >
                              <config.icon
                                className={cn(
                                  "w-5 h-5 transition-colors shrink-0",
                                  isSelected
                                    ? "text-white"
                                    : "text-neutral-200",
                                )}
                              />
                              <span
                                className={cn(
                                  "text-sm tracking-tight",
                                  isSelected
                                    ? "text-white"
                                    : "text-neutral-300",
                                )}
                              >
                                {config.label}
                              </span>

                              {isSelected && (
                                <motion.div
                                  layoutId="status-active-glow"
                                  className="absolute inset-0 bg-white/[0.02]"
                                  initial={false}
                                  transition={{
                                    type: "spring",
                                    bounce: 0.2,
                                    duration: 0.5,
                                  }}
                                />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {/* STE 4 :  REPO CONNECT (SKIP) --- */}
              {currentStep === 4 && (
                <div className="space-y-5 relative">
                  <div className="text-center space-y-2 mb-5">
                    <h2 className="text-2xl font-semibold tracking-tight text-white flex items-center justify-center gap-2">
                      Connect your repository
                      <FolderGit2 className="w-6 h-6 " />
                    </h2>
                    <p className="text-white/50 text-sm">
                      Connect your github repository to sync and collab{" "}
                      <span className="text-white relative font-inter ">
                        (Optional)
                      </span>
                    </p>
                  </div>

                  <div className="relative flex items-center">
                    <Search className="absolute left-3 top-2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search repositories..."
                      className="bg-white/5 border-white/10 pl-10 mb-4 focus:ring-1 focus:ring-white/20"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
              )}
              {/* STEP 5 : INVITE TO PROJECT */}
              {currentStep === 5 && (
                <div className="space-y-6 relative">
                  <div className="text-center space-y-2 mb-8">
                    <h2 className="text-2xl font-semibold tracking-tight text-white flex items-center justify-center gap-2">
                      Share invite link
                      <UserPlus className="w-6 h-6 " />
                    </h2>
                    <p className="text-neutral-300 text-sm">
                      Invite your friends or team to join your project and start
                      collaborating
                    </p>
                  </div>

                  <div className="bg-white/10 border border-white/10 rounded-2xl p-3 space-y-4">
                    <div className="space-y-2">
                      <Label className="text-sm text-white">
                        Project Invite Link
                      </Label>
                      <div className="flex gap-5">
                        <Input
                          readOnly
                          value={`${INVITE_LINK}${generatedInviteLink}`}
                          className="flex-1 truncate bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white font-inter"
                        />
                        <Button
                          variant="default"
                          size="sm"
                          className="shrink-0"
                          onClick={() => {
                            navigator.clipboard.writeText(
                              `${INVITE_LINK}${generatedInviteLink}`,
                            );
                            toast.success("Link copied to clipboard!");
                          }}
                        >
                          Copy
                          <Copy className="w-4 h-4 " />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 my-5">
                    <div className="h-px flex-1 bg-white/30"></div>
                    <span className="text-sm text-white capitalize whitespace-nowrap">
                      share it via
                    </span>
                    <div className="h-px flex-1 bg-white/30"></div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <Button
                      variant="outline"
                      className="h-18 flex flex-col items-center justify-center gap-2 bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 transition-all group"
                      onClick={() => {
                        navigator.clipboard.writeText(
                          `${INVITE_LINK}${generatedInviteLink}`,
                        );
                        toast.success("Link copied for WhatsApp!");
                      }}
                    >
                      <Image
                        src="/whatsapp.png"
                        alt="WhatsApp"
                        width={24}
                        height={24}
                        className="opacity-70 group-hover:opacity-100 transition-opacity"
                      />
                      <span className="text-[10px] text-white/50 group-hover:text-white transition-colors">
                        WhatsApp
                      </span>
                    </Button>

                    <Button
                      variant="outline"
                      className="h-18 flex flex-col items-center justify-center gap-2 bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 transition-all group"
                      onClick={() =>
                        window.open("https://discord.com", "_blank")
                      }
                    >
                      <Image
                        src="/discord.png"
                        alt="Discord"
                        width={24}
                        height={24}
                        className="opacity-70 group-hover:opacity-100 transition-opacity"
                      />
                      <span className="text-[10px] text-white/50 group-hover:text-white transition-colors">
                        Discord
                      </span>
                    </Button>

                    <Button
                      variant="outline"
                      className="h-18 flex flex-col items-center justify-center gap-2 bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 transition-all group"
                      onClick={() => window.open("https://slack.com", "_blank")}
                    >
                      <Image
                        src="/slack.png"
                        alt="Slack"
                        width={24}
                        height={24}
                        className="opacity-70 group-hover:opacity-100 transition-opacity"
                      />
                      <span className="text-[10px] text-white/50 group-hover:text-white transition-colors">
                        Slack
                      </span>
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Action Footer */}
          <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/10">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1 || isLoading}
              className="text-muted-foreground hover:text-white disabled:opacity-30 transition-all z-10 text-xs h-8 px-3"
            >
              <ChevronLeft className="w-3.5 h-3.5 mr-1" />
              Back
            </Button>

            <div className="flex items-center gap-5">
              {isSkip && (
                <Button
                  variant="default"
                  onClick={handleSkip}
                  disabled={isLoading}
                  className=" text-xs h-8 px-5 transition-all z-10"
                >
                  Skip <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              )}
              <Button
                onClick={handleNext}
                disabled={isLoading}
                className="text-xs font-medium px-6 h-8 transition-all active:scale-95 z-10 cursor-pointer rounded-lg flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <span>Continue</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Background Decorative Element */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full h-[300px] bg-black/30 blur-[120px] pointer-events-none" />
    </div>
  );
}
