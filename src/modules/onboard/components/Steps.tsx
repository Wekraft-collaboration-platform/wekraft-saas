"use client";
import { useClerk, useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
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
  ChevronDown,
  Link2,
  ExternalLink,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { INVITE_LINK, PROJECT_STATUS, ROLES } from "@/lib/static-store";
import { cn } from "@/lib/utils";
import { api } from "../../../../convex/_generated/api";
import { IdentityRolePicker } from "./IdentityRolePicker";
import { OnboardingRightSide } from "./OnboardingRightSide";
import { PURPOSES, STEPS, SOURCES } from "./StaticContent";

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
  const updateReferralAndSource = useMutation(api.user.updateUserReferralAndSource);
  const updatePurposes = useMutation(api.user.updateUserPrimaryUsage);
  const updateIdentity = useMutation(api.user.updateUserIdentity);
  const initProject = useMutation(api.project.projectInitOnboarding);
  const completeOnboarding = useMutation(api.user.completeOnboarding);

  // Form State
  // Step 1: Source & Referral
  const [heardFrom, setHeardFrom] = useState("");
  const [referralCode, setReferralCode] = useState("");

  const parts = referralCode.trim().split("-");
  const suffix = parts.length >= 2 ? parts[parts.length - 1] : "";
  const isReferralCodeReady = parts.length >= 2 && suffix.length >= 5;

  const checkResult = useQuery(
    api.user.checkReferralCode,
    isReferralCodeReady ? { code: referralCode.trim() } : "skip"
  );

  const isCheckingReferral = isReferralCodeReady && checkResult === undefined;

  let referralValid: boolean | undefined = undefined;
  let referralMessage = "";

  if (referralCode.trim().length > 0) {
    if (parts.length < 2) {
      referralValid = false;
      referralMessage = "Referral code format is username-suffix";
    } else if (suffix.length < 5) {
      referralValid = false;
      referralMessage = "Referral code suffix is incomplete";
    } else if (checkResult) {
      referralValid = checkResult.valid;
      referralMessage = checkResult.message;
    }
  }

  // Step 2: Purposes
  const [purposes, setPurposes] = useState<string[]>([]);

  // Step 3: Identity
  const [username, setUsername] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [usernameError, setUsernameError] = useState<string | null>(null);

  // Step 4: Project
  const [projectName, setProjectName] = useState("");
  const isPublic = true; // default always true.
  const [projectStatus, setProjectStatus] = useState("");
  const [generatedInviteLink, setGeneratedInviteLink] = useState("");

  // Step 5: Invite
  const [email, setEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [role, setRole] = useState<"member" | "admin">("member");
  const [copied, setCopied] = useState(false);

  const fullInviteLink = generatedInviteLink ? `${INVITE_LINK}invite/${generatedInviteLink}?role=${role}` : "";

  const isValidEmail = (val: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  };

  const handleCopy = () => {
    if (!fullInviteLink) return;
    navigator.clipboard.writeText(fullInviteLink);
    setCopied(true);
    toast.success("Invite link copied!", {
      style: {
        background: "var(--popover)",
        color: "var(--popover-foreground)",
        border: "1px solid var(--border)",
      }
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInvite = async () => {
    if (!isValidEmail(email)) return;
    setInviting(true);
    try {
      const res = await fetch("/api/invite/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: email,
          projectName: projectName || "WeKraft Project",
          inviteLink: fullInviteLink,
          role: role,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to send invitation email");
      }

      toast.success(`Invitation sent to ${email}`, {
        style: {
          background: "var(--popover)",
          color: "var(--popover-foreground)",
          border: "1px solid var(--border)",
        }
      });
      setEmail("");
    } catch (err: any) {
      toast.error(err.message || "Failed to send invitation. Please try again.", {
        style: {
          background: "var(--popover)",
          color: "var(--popover-foreground)",
          border: "1px solid var(--border)",
        }
      });
    } finally {
      setInviting(false);
    }
  };

  const selectedTheme = "dark";

  const handleNext = async () => {
    try {
      setIsLoading(true);

      if (currentStep === 1) {
        if (!heardFrom) {
          toast.error("Please select where you heard about us");
          setIsLoading(false);
          return;
        }

        if (referralCode.trim().length > 0 && referralValid === false) {
          toast.error(referralMessage || "Please enter a valid referral code or clear it");
          setIsLoading(false);
          return;
        }

        await updateReferralAndSource({
          heardFrom,
          referalUsing: referralCode.trim() || undefined,
        });
      }

      if (currentStep === 2) {
        if (purposes.length > 0) {
          await updatePurposes({ purposes });
        }
      }

      if (currentStep === 3) {
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

      if (currentStep === 4) {
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

      if (currentStep === 5) {
        await completeOnboarding();
        toast.success("Welcome to WeKraft!");
        const postLoginRedirect = typeof window !== "undefined" ? sessionStorage.getItem("wekraft_post_login_redirect") : null;
        if (postLoginRedirect) {
          typeof window !== "undefined" && sessionStorage.removeItem("wekraft_post_login_redirect");
          router.push(postLoginRedirect);
        } else {
          router.push("/dashboard");
        }
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

  const isSkip = currentStep === 1 || currentStep === 2;

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
                      <span>Where did you hear about us?</span>
                    </>
                  )}
                  {currentStep === 2 && (
                    <>
                      <span>What brings you to WeKraft</span>
                    </>
                  )}
                  {currentStep === 3 && (
                    <>
                      <span>Let’s set up your identity</span>
                    </>
                  )}
                  {currentStep === 4 && (
                    <>
                      <span>Let's create your first project</span>
                    </>
                  )}
                  {currentStep === 5 && (
                    <>
                      <span>Share invite link</span>
                    </>
                  )}
                </h2>
              </div>

              {/* Step Content */}
              <div className="flex-1 min-h-[250px] flex flex-col justify-center">
                {/* STEP 1: Source & Referral */}
                {currentStep === 1 && (
                  <div className="space-y-5">
                    <div className="grid grid-cols-3 gap-3">
                      {SOURCES.map((s) => {
                        const selected = heardFrom === s.id;
                        return (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => setHeardFrom(s.id)}
                            className={cn(
                              "flex flex-col items-center justify-center p-3 rounded-lg border text-center transition-all duration-200 cursor-pointer h-18 select-none",
                              selected
                                ? "bg-white/5! border-white/20! text-zinc-100! shadow-[0_0_12px_rgba(255,255,255,0.015)]"
                                : "bg-[#0f0f12]! border-zinc-800! text-zinc-300 hover:border-zinc-700! hover:bg-zinc-900/10! hover:text-white",
                            )}
                          >
                            <s.icon
                              className={cn(
                                "w-5 h-5 mb-2 transition-colors",
                                selected ? "text-zinc-100" : "text-zinc-455",
                              )}
                            />
                            <span className="text-[11px] font-medium tracking-wide">
                              {s.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    <div className="space-y-2 mt-4 font-sans">
                      <Label
                        htmlFor="referralCode"
                        className="text-sm font-medium text-zinc-300"
                      >
                        Referral Code <span className="text-zinc-500 font-normal text-xs">(optional)</span>
                      </Label>
                      <div className="relative">
                        <Input
                          id="referralCode"
                          placeholder="e.g. madhav-906y79"
                          className={cn(
                            "border rounded-sm h-10 text-xs transition-all tracking-wider font-mono bg-[#0f0f12]!",
                            referralValid === false
                              ? "border-red-500! focus-visible:ring-red-500/20!"
                              : referralValid === true
                                ? "border-emerald-500! focus-visible:ring-emerald-500/20!"
                                : "border-zinc-800! focus-visible:ring-zinc-500/30!"
                          )}
                          value={referralCode}
                          onChange={(e) => setReferralCode(e.target.value)}
                        />
                        {isCheckingReferral && (
                          <div className="absolute right-3 top-3">
                            <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
                          </div>
                        )}
                        {!isCheckingReferral && referralValid === true && (
                          <div className="absolute right-3 top-3">
                            <Check className="w-4 h-4 text-emerald-500" />
                          </div>
                        )}
                      </div>
                      {referralCode.trim().length > 0 && referralMessage && (
                        <p className={cn(
                          "text-[11px] mt-1 font-medium",
                          referralValid === true ? "text-emerald-500" : "text-red-500"
                        )}>
                          {referralMessage}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* STEP 2 */}
                {currentStep === 2 && (
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
                                  : "bg-[#161619] text-zinc-455 border-zinc-800/60",
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

                {/* STEP 3 */}
                {currentStep === 3 && (
                  <IdentityRolePicker
                    username={username}
                    onUsernameChange={setUsername}
                    roles={ROLES}
                    selectedRole={selectedRole}
                    onRoleSelect={setSelectedRole}
                    onValidationError={setUsernameError}
                  />
                )}

                {/* STEP 4 */}
                {currentStep === 4 && (
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

                {/* STEP 5 */}
                {currentStep === 5 && (
                  <div className="space-y-6 font-sans bg-[#0a0a0a] border border-[#333333] shadow-[0_0_50px_rgba(0,0,0,0.8)] rounded-xl p-6 text-white animate-in fade-in duration-300">
                    {/* Header */}
                    <div className="space-y-1.5 text-left">
                      <h3 className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                        Invite Teammate
                      </h3>
                      <p className="text-zinc-400 text-xs leading-relaxed">
                        Share this link with your team to collaborate.
                      </p>
                    </div>

                    {/* Email Invite Section */}
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2 p-1.5 pl-3.5 border border-[#333333] rounded-lg focus-within:border-neutral-400 focus-within:ring-1 focus-within:ring-neutral-400/30 transition-all duration-150 bg-black">
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && isValidEmail(email) && !inviting) {
                              e.preventDefault();
                              handleInvite();
                            }
                          }}
                          placeholder="Email address"
                          className="border-none bg-transparent outline-none focus:outline-none focus:ring-0 focus-visible:ring-0 text-xs font-normal text-white px-1 h-10 truncate placeholder:text-zinc-500 flex-grow [&:-webkit-autofill]:transition-colors [&:-webkit-autofill]:duration-[5000000ms] [&:-webkit-autofill]:text-white"
                        />

                        <Button
                          size="sm"
                          onClick={handleInvite}
                          disabled={!isValidEmail(email) || inviting}
                          variant={isValidEmail(email) ? "default" : "secondary"}
                          className="h-8 px-4 rounded-md text-xs border border-accent! cursor-pointer "
                        >
                          {inviting ? (
                            <span className="animate-in fade-in duration-200">Inviting...</span>
                          ) : (
                            <span className="animate-in fade-in duration-200">Invite</span>
                          )}
                          <ExternalLink className="w-3 h-3 -mt-1" />
                        </Button>
                      </div>
                    </div>

                    {/* Copy Invite Link Option */}
                    <Button
                      variant="outline"
                      onClick={handleCopy}
                      disabled={!fullInviteLink}
                      className="flex items-center gap-2 justify-center mx-auto text-xs"
                    >
                      <Link2 className="w-3.5 h-3.5" />
                      {copied ? "Copied invite link!" : "Copy invite link"}
                    </Button>
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
                    ) : currentStep === 5 ? (
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
