"use client";

import { SignInButton, useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  KeyRound,
  Loader2,
  Lock,
  LogIn,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import { api } from "../../../convex/_generated/api";

// ─── Types ────────────────────────────────────────────────────────────────────
type State = "idle" | "loading" | "success" | "error";

// ─── Security: only these IDE deep-link schemes are allowed ──────────────────
const ALLOWED_CALLBACK_SCHEMES = [
  "vscode://",
  "vscode-insiders://",
  "cursor://",
  "windsurf://",
  "zed://",
  "jetbrains://",
  "antigravity://",
  "antigravity-ide://",
];

function isCallbackUrlSafe(url: string | null): url is string {
  if (!url) return false;
  return ALLOWED_CALLBACK_SCHEMES.some((scheme) =>
    url.toLowerCase().startsWith(scheme)
  );
}

// ─── Main page component (wrapped for Suspense boundary) ──────────────────────
function ExtensionPageInner() {
  const { isLoaded, isSignedIn, user } = useUser();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callback_url"); // e.g. vscode://wekraft.wekraft/auth

  const createHandshakeToken = useMutation(api.apiKeys.createHandshakeToken);

  const [state, setState] = useState<State>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const isSafeCallback = isCallbackUrlSafe(callbackUrl);

  async function handleGrantAccess() {
    if (!callbackUrl) {
      setErrorMsg(
        "No callback URL provided. Please launch this flow from your IDE extension."
      );
      setState("error");
      return;
    }

    if (!isSafeCallback) {
      setErrorMsg(
        `Blocked: the callback URL "${callbackUrl}" does not use a recognized IDE scheme. ` +
        `Launch this page from your IDE extension (VS Code, Cursor, Windsurf, etc.).`
      );
      setState("error");
      return;
    }

    setState("loading");
    try {
      const token = await createHandshakeToken();
      const redirectTarget = `${callbackUrl}?token=${token}`;
      setState("success");

      setTimeout(() => {
        window.location.href = redirectTarget;
      }, 1200);
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : "Something went wrong. Try again."
      );
      setState("error");
    }
  }

  return (
    <div className="h-screen bg-background text-foreground flex flex-col relative overflow-hidden">
      {/* Background image — same as invite page */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/bg-footer.jpg"
          alt="Background"
          fill
          className="object-cover opacity-50"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 to-background/70" />
      </div>

      {/* Header */}
      <header className="p-6 flex items-center justify-between z-10 relative">
        <Link href="/" className="flex items-center gap-2 group">
          <Image
            src="/logo.svg"
            alt="WeKraft logo"
            width={22}
            height={22}
            className="rounded-sm"
          />
          <span className="text-base font-bold tracking-tight text-primary">
            WeKraft
          </span>
        </Link>
      </header>

      {/* Card */}
      <main className="flex-1 flex items-center justify-center p-6 z-10 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="w-full max-w-[380px]"
        >
          <div className="bg-background/40 backdrop-blur-xl border border-white/10 shadow-[0_24px_80px_rgba(0,0,0,0.5)] rounded-2xl overflow-hidden">

            {/* ── NOT LOADED ── */}
            {!isLoaded && (
              <div className="p-8 flex flex-col items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
                </div>
                <div className="space-y-1.5 text-center">
                  <div className="h-4 bg-white/10 rounded w-36 mx-auto" />
                  <div className="h-3 bg-white/5 rounded w-48 mx-auto" />
                </div>
              </div>
            )}

            {/* ── NOT SIGNED IN ── */}
            {isLoaded && !isSignedIn && (
              <div className="p-8 text-center space-y-6">
                <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mx-auto">
                  <LogIn className="w-6 h-6 text-muted-foreground" />
                </div>

                <div className="space-y-1.5">
                  <h2 className="text-lg font-bold tracking-tight">
                    Connect your IDE
                  </h2>
                  <p className="text-muted-foreground text-xs leading-relaxed px-2">
                    Sign in to your WeKraft account to grant your IDE extension
                    secure access to your projects and tasks.
                  </p>
                </div>

                <SignInButton mode="redirect">
                  <button
                    id="ext-signin-btn"
                    className="w-full h-10 rounded-xl bg-primary text-primary-foreground text-sm font-semibold flex items-center justify-center gap-2 transition-opacity hover:opacity-90 active:scale-[.98]"
                  >
                    <LogIn className="w-4 h-4" />
                    Sign in to WeKraft
                  </button>
                </SignInButton>
              </div>
            )}

            {/* ── SIGNED IN – IDLE ── */}
            {isLoaded && isSignedIn && state === "idle" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col"
              >
                <div className="p-8 space-y-6">
                  {/* Avatar */}
                  <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 shrink-0">
                      {user.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={user.imageUrl}
                          alt={user.fullName ?? "User"}
                          className="w-10 h-10 rounded-xl object-cover border border-white/10"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center text-sm font-bold text-foreground">
                          {(user.fullName ?? "U")[0]}
                        </div>
                      )}
                      <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-background rounded-full" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold tracking-tight">
                        Hi, {user.firstName ?? user.fullName ?? "there"} 👋
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {user.primaryEmailAddress?.emailAddress}
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-1.5">
                    <h2 className="text-base font-bold tracking-tight">
                      IDE Extension Access
                    </h2>
                    <p className="text-muted-foreground text-xs leading-relaxed">
                      Your IDE extension is requesting access to WeKraft. Grant
                      it a secure, one-time token to link your workspace.
                    </p>
                  </div>

                  {/* Status indicators */}
                  <div className="flex flex-col gap-2">
                    {/* Callback URL status */}
                    {!callbackUrl && (
                      <div className="flex items-center gap-2.5 px-3 py-2 bg-yellow-500/5 border border-yellow-500/10 rounded-xl">
                        <AlertTriangle className="w-4 h-4 text-yellow-500 shrink-0" />
                        <p className="text-[11px] text-left text-muted-foreground font-medium">
                          No callback URL detected. Launch from your IDE extension.
                        </p>
                      </div>
                    )}

                    {callbackUrl && !isSafeCallback && (
                      <div className="flex items-center gap-2.5 px-3 py-2 bg-red-500/5 border border-red-500/10 rounded-xl">
                        <ShieldAlert className="w-4 h-4 text-red-500 shrink-0" />
                        <p className="text-[11px] text-left text-muted-foreground font-medium">
                          Unrecognized callback scheme — access blocked for your security.
                        </p>
                      </div>
                    )}

                    {callbackUrl && isSafeCallback && (
                      <div className="flex items-center gap-2.5 px-3 py-2 bg-white/5 border border-white/10 rounded-xl">
                        <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
                        <p className="text-[11px] text-left text-muted-foreground font-medium">
                          IDE extension verified and ready to connect
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action bar — matches invite page footer */}
                <div className="p-4 bg-white/5 border-t border-white/5">
                  <button
                    id="ext-grant-btn"
                    className="w-full h-10 rounded-xl bg-primary text-primary-foreground text-sm font-semibold flex items-center justify-center gap-2 transition-opacity hover:opacity-90 active:scale-[.98] disabled:opacity-40 disabled:cursor-not-allowed"
                    onClick={handleGrantAccess}
                    disabled={!callbackUrl || !isSafeCallback}
                  >
                    <KeyRound className="w-4 h-4" />
                    Grant Access to IDE
                  </button>
                  <p className="text-center text-[10px] text-muted-foreground/60 mt-2.5">
                    Generates a one-time token valid for 5 minutes
                  </p>
                </div>
              </motion.div>
            )}

            {/* ── LOADING ── */}
            {state === "loading" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-8 text-center space-y-6"
              >
                <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mx-auto">
                  <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
                </div>
                <div className="space-y-1.5">
                  <h2 className="text-base font-bold tracking-tight">
                    Generating token…
                  </h2>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    Securely handing off your credentials to your IDE.
                  </p>
                </div>
              </motion.div>
            )}

            {/* ── SUCCESS ── */}
            {state === "success" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-8 text-center space-y-6"
              >
                <div className="w-14 h-14 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7 text-primary" />
                </div>
                <div className="space-y-1.5">
                  <h2 className="text-base font-bold tracking-tight">
                    Access granted!
                  </h2>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    Redirecting you back to your IDE…{" "}
                    <span className="text-muted-foreground/50">
                      If nothing happens, close this tab.
                    </span>
                  </p>
                </div>
              </motion.div>
            )}

            {/* ── ERROR ── */}
            {state === "error" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col"
              >
                <div className="p-8 text-center space-y-6">
                  <div className="w-14 h-14 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center mx-auto">
                    <ShieldAlert className="w-7 h-7 text-red-500" />
                  </div>
                  <div className="space-y-1.5">
                    <h2 className="text-base font-bold tracking-tight">
                      Something went wrong
                    </h2>
                    <p className="text-muted-foreground text-xs leading-relaxed px-2">
                      {errorMsg}
                    </p>
                  </div>
                </div>
                <div className="p-4 bg-white/5 border-t border-white/5">
                  <button
                    id="ext-retry-btn"
                    className="w-full h-10 rounded-xl bg-white/5 border border-white/10 text-muted-foreground text-sm font-medium flex items-center justify-center gap-2 hover:bg-white/10 hover:text-foreground transition-all active:scale-[.98]"
                    onClick={() => setState("idle")}
                  >
                    Try again
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Footer note */}
          <p className="text-center text-[10px] text-muted-foreground/40 mt-4 flex items-center justify-center gap-1.5">
            <Lock className="w-3 h-3" />
            Your API key is never exposed in the browser or URL bar.
          </p>
        </motion.div>
      </main>
    </div>
  );
}

// ── Suspense wrapper required because useSearchParams() needs it in Next.js ──
export default function ExtensionPage() {
  return (
    <Suspense>
      <ExtensionPageInner />
    </Suspense>
  );
}
