"use client";
import { useClerk, useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Code2,
  Compass,
  Copy,
  Folder,
  FolderGit,
  Globe,
  Lightbulb,
  Loader2,
  Monitor,
  Moon,
  Rocket,
  Search,
  Share2,
  Shield,
  Sliders,
  Sun,
  TrendingUp,
  User,
} from "lucide-react";
import { nanoid } from "nanoid";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import type React from "react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { INVITE_LINK, PROJECT_STATUS, ROLES } from "@/lib/static-store";
import { cn } from "@/lib/utils";
import { api } from "../../../../convex/_generated/api";
import { IdentityRolePicker } from "./IdentityRolePicker";
import { OnboardingRightSide } from "./OnboardingRightSide";
import { PURPOSES, STEPS } from "./StaticContent";

const stepVariants = {
  enter: (direction: number) => ({
    y: direction > 0 ? 12 : -12,
    opacity: 0,
  }),
  center: {
    y: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    y: direction < 0 ? 12 : -12,
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

  // Authentication Context
  const { signOut } = useClerk();
  const { user: clerkUser, isLoaded: isUserLoaded } = useUser();

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
  const isPublic = true; // default always true.
  const [projectStatus, setProjectStatus] = useState("");
  const [generatedInviteLink, setGeneratedInviteLink] = useState("");

  const selectedTheme = "dark";

  const handleNext = async () => {
    try {
      setIsLoading(true);

      if (currentStep === 1) {
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
          return;
        }
      }

      if (currentStep === 3) {
        if (!projectName || !projectStatus) {
          toast.error("Please provide project name and status");
          setIsLoading(false);
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

      if (currentStep === 4) {
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

  const isSkip = currentStep === 1;

  return (
    <div className="min-h-screen w-full bg-black! text-white flex flex-row overflow-hidden font-sans relative">
      <div className="noise-bg" />

      {/* Left Column (40% width on Desktop, full width on Mobile) */}
      <div className="w-full lg:w-[40%] flex flex-col justify-between p-6 min-h-screen relative z-10 border-r border-zinc-800 bg-[#09090b]">
        {/* Header */}
        <header className="flex justify-between items-center w-full">
          <div className="flex items-center gap-2 select-none">
            <Image
              src="/logo.svg"
              alt="WeKraft Logo"
              width={28}
              height={28}
              className="shrink-0"
            />
            <span className="font-bold text-xl tracking-tight text-white font-pop">
              WeKraft
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px] truncate max-w-[200px] text-zinc-100">
            {isUserLoaded && clerkUser?.primaryEmailAddress?.emailAddress && (
              <span className="hidden sm:inline">
                Logged in as{" "}
                <span className="text-zinc-400 font-medium">
                  {clerkUser.primaryEmailAddress.emailAddress}
                </span>
              </span>
            )}
          </div>
        </header>

        {/* Center content containing active step */}
        <main className="flex-1 flex flex-col justify-center py-10 w-full max-w-[420px] mx-auto">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStep}
              custom={direction}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="w-full flex flex-col"
            >
              {/* Step Header */}
              <div className="mb-6">
                <h2 className="text-2xl font-semibold tracking-tight text-white flex items-center gap-2.5">
                  {currentStep === 1 && (
                    <>
                      {/* <Compass className="w-5.5 h-5.5 text-zinc-300 shrink-0" /> */}
                      <span>What brings you to WeKraft</span>
                    </>
                  )}
                  {currentStep === 2 && (
                    <>
                      {/* <User className="w-5.5 h-5.5 text-zinc-300 shrink-0" /> */}
                      <span>Let’s set up your identity</span>
                    </>
                  )}
                  {currentStep === 3 && (
                    <>
                      {/* <FolderGit className="w-5.5 h-5.5 text-zinc-300 shrink-0" /> */}
                      <span>Let's create your first project</span>
                    </>
                  )}
                  {currentStep === 4 && (
                    <>
                      {/* <Share2 className="w-5.5 h-5.5 text-zinc-300 shrink-0" /> */}
                      <span>Share invite link</span>
                    </>
                  )}
                </h2>
                {/* <p className="text-sm text-zinc-200 mt-1">
                  {currentStep === 1 && "Pick one or more options to help us customize your workspace."}
                  {currentStep === 2 && "Choose a unique username and select your role."}
                  {currentStep === 3 && "Create your project workspace to start syncing and collaborating."}
                  {currentStep === 4 && "Choose a theme preference that best fits your working style."}
                  {currentStep === 5 && "Invite your friends or teammates to start working together."}
                </p> */}
              </div>

              {/* Step Content */}
              <div className="flex-1 min-h-[250px] flex flex-col justify-center">
                {/* STEP 1 */}
                {currentStep === 1 && (
                  <div className="space-y-3.5">
                    {PURPOSES.map((p) => {
                      const selected = purposes.includes(p.id);
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => togglePurpose(p.id)}
                          className={cn(
                            "w-full flex items-center justify-between px-4 py-3.5 rounded-sm border text-left transition-all duration-200 cursor-pointer select-none",
                            selected
                              ? "bg-zinc-900/40! border-zinc-600! shadow-[0_0_12px_rgba(255,255,255,0.015)]"
                              : "bg-neutral-900/50! border-zinc-800! hover:border-zinc-600! hover:bg-zinc-900/10!",
                          )}
                        >
                          <div className="flex items-center gap-3.5">
                            <div
                              className={cn(
                                "w-8.5 h-8.5 rounded-md border flex items-center justify-center transition-all",
                                selected
                                  ? "bg-neutral-800 text-zinc-100 border-zinc-700"
                                  : "bg-[#161619] text-zinc-450 border-zinc-800/60",
                              )}
                            >
                              <p.icon className="w-4 h-4" />
                            </div>
                            <div>
                              <h4
                                className={cn(
                                  "text-sm font-medium tracking-wide transition-colors",
                                  selected ? "text-white" : "text-zinc-200",
                                )}
                              >
                                {p.label}
                              </h4>
                              <p
                                className={cn(
                                  "text-[11px] transition-colors mt-0.5",
                                  selected ? "text-zinc-200" : "text-zinc-400",
                                )}
                              >
                                {p.description}
                              </p>
                            </div>
                          </div>
                          <div
                            className={cn(
                              "w-4 h-4 rounded-full border flex items-center justify-center transition-all shrink-0",
                              selected
                                ? "border-zinc-400 bg-zinc-200"
                                : "border-zinc-700 bg-transparent",
                            )}
                          >
                            {selected && (
                              <Check className="w-2.5 h-2.5 text-zinc-900 stroke-[3.5px]" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* STEP 2 */}
                {currentStep === 2 && (
                  <IdentityRolePicker
                    username={username}
                    onUsernameChange={setUsername}
                    roles={ROLES}
                    selectedRole={selectedRole}
                    onRoleSelect={setSelectedRole}
                    onValidationError={setUsernameError}
                  />
                )}

                {/* STEP 3 */}
                {currentStep === 3 && (
                  <div className="space-y-5">
                    <div className="space-y-1.5 font-sans">
                      <Label
                        htmlFor="projectName"
                        className="text-base text-zinc-300 font-medium"
                      >
                        Project Name
                      </Label>
                      <Input
                        id="projectName"
                        placeholder="e.g. Acme SaaS"
                        className="border border-zinc-800! text-white placeholder:text-zinc-550 rounded-sm h-9 text-xs transition-all focus-visible:ring-1 focus-visible:ring-zinc-500/30! focus-visible:border-zinc-550!"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                      />
                    </div>

                    <div className="space-y-1.5  font-sans">
                      <Label className="text-base text-zinc-300 font-medium block">
                        Project Status{" "}
                        <span className="text-zinc-400 font-normal ml-1">
                          (community indicators)
                        </span>
                      </Label>
                      <div className="grid grid-cols-3 gap-3.5 mt-4">
                        {PROJECT_STATUS.map((status) => {
                          const isSelected = projectStatus === status;
                          const config = STATUS_CONFIG[status] || {
                            icon: FolderGit,
                            label: status,
                          };

                          return (
                            <button
                              key={status}
                              type="button"
                              onClick={() => setProjectStatus(status)}
                              className={cn(
                                "flex flex-col items-center justify-center p-4 rounded-lg border text-center transition-all duration-200 cursor-pointer h-20 select-none",
                                isSelected
                                  ? "bg-zinc-900/40! border-zinc-500! text-zinc-100! shadow-[0_0_12px_rgba(255,255,255,0.015)]"
                                  : "bg-[#0f0f12]! border-zinc-800! text-zinc-300 hover:border-zinc-600! hover:bg-zinc-900/10! hover:text-white",
                              )}
                            >
                              <config.icon
                                className={cn(
                                  "w-5 h-5 mb-2 transition-colors",
                                  isSelected
                                    ? "text-zinc-100"
                                    : "text-zinc-450",
                                )}
                              />
                              <span className="text-[10px] capitalize">
                                {config.label}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 4 */}
                {currentStep === 4 && (
                  <div className="space-y-4 font-sans">
                    <div className="space-y-1.5">
                      <Label className="text-base text-zinc-300 font-medium">
                        Project Invite Link
                      </Label>
                      <div className="flex gap-4">
                        <Input
                          readOnly
                          value={`${INVITE_LINK}${generatedInviteLink}`}
                          className="flex-1 bg-neutral-900! h-11 text-sm tracking-tight border border-zinc-800! rounded-sm focus-visible:ring-1 focus-visible:ring-zinc-500/25!"
                        />
                        <Button
                          variant="default"
                          size="sm"
                          className="bg-zinc-900 hover:bg-zinc-900/60 h-11 text-white px-5! text-xs border border-zinc-700/80 rounded-sm cursor-pointer transition-all"
                          onClick={() => {
                            navigator.clipboard.writeText(
                              `${INVITE_LINK}${generatedInviteLink}`,
                            );
                            toast.success("Link copied to clipboard!");
                          }}
                        >
                          <Copy className="w-3.5 h-3.5" />
                          Copy
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 my-5">
                      <div className="h-[1px] flex-1 bg-zinc-800" />
                      <span className="text-[9px] text-zinc-400 uppercase tracking-widest font-normal">
                        Share via
                      </span>
                      <div className="h-[1px] flex-1 bg-zinc-800" />
                    </div>

                    <div className="">
                      <Textarea
                        placeholder="enter your Teammate email here...."
                        className="resize-none bg-[#0f0f12]! border border-zinc-800! h-24! placeholder:text-zinc-500 text-neutral-100 rounded-sm focus-visible:ring-1 focus-visible:ring-zinc-500/25!"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Step Action Buttons */}
              <div className="flex items-center justify-between mt-8 pt-5 border-t border-zinc-700!">
                <div>
                  {currentStep > 1 && (
                    <Button
                      variant={"outline"}
                      type="button"
                      onClick={handleBack}
                      disabled={isLoading}
                      className="flex items-center gap-1 bg-zinc-950/20 hover:bg-zinc-900/40 border border-zinc-800 text-xs font-normal text-zinc-300 hover:text-white transition-colors disabled:opacity-40 cursor-pointer rounded-md h-8 px-4"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      Back
                    </Button>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {isSkip && (
                    <Button
                      variant={"ghost"}
                      type="button"
                      onClick={handleSkip}
                      disabled={isLoading}
                      className="text-xs px-3! font-normal text-zinc-450 hover:text-zinc-200 hover:bg-transparent transition-colors cursor-pointer"
                    >
                      Skip
                    </Button>
                  )}
                  <Button
                    onClick={handleNext}
                    disabled={isLoading}
                    className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-normal px-5 h-8 rounded-md flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-50 border-none"
                  >
                    {isLoading ? (
                      <>
                        {" "}
                        Saving <Loader2 className="w-3 h-3 animate-spin" />{" "}
                      </>
                    ) : currentStep === 4 ? (
                      <>
                        Get Started
                        <Rocket className="w-3.5 h-3.5" />
                      </>
                    ) : (
                      <>
                        Continue
                        <ChevronRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Progress Stepper at Bottom */}
        <footer className="w-full flex justify-center py-2 select-none">
          <div className="flex items-center gap-2.5">
            {STEPS.map((step) => {
              const isActive = currentStep === step.id;
              return (
                <div
                  key={step.id}
                  className={cn(
                    "h-1 rounded-full transition-all duration-300",
                    isActive ? "w-7 bg-zinc-100" : "w-1 bg-zinc-600",
                  )}
                />
              );
            })}
          </div>
        </footer>
      </div>

      {/* Right Column (60% width on Desktop, hidden on Mobile) */}
      <OnboardingRightSide
        currentStep={currentStep}
        purposes={purposes}
        username={username}
        selectedRole={selectedRole}
        projectName={projectName}
        projectStatus={projectStatus}
        theme={selectedTheme}
        clerkUser={clerkUser}
        onLaunch={handleNext}
        isLaunching={isLoading}
      />
    </div>
  );
}
