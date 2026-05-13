"use client";

import { useUser, SignInButton } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
type State = "idle" | "loading" | "success" | "error";

// ─── Main page component (wrapped for Suspense boundary) ──────────────────────
function ExtensionPageInner() {
  const { isLoaded, isSignedIn, user } = useUser();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callback_url"); // e.g. vscode://wekraft.wekraft-vscode/auth

  const createHandshakeToken = useMutation(api.apiKeys.createHandshakeToken);

  const [state, setState] = useState<State>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  // Animate in on mount
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  async function handleGrantAccess() {
    if (!callbackUrl) {
      setErrorMsg(
        "No callback URL provided. Please launch this flow from your IDE extension."
      );
      setState("error");
      return;
    }

    setState("loading");
    try {
      const token = await createHandshakeToken();
      const redirectTarget = `${callbackUrl}?token=${token}`;
      setState("success");

      // Small delay so the user sees the success state before being redirected
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
    <div className="ext-root">
      {/* ── Ambient background ── */}
      <div className="ext-bg" aria-hidden="true">
        <div className="ext-orb ext-orb-1" />
        <div className="ext-orb ext-orb-2" />
        <div className="ext-orb ext-orb-3" />
        <div className="ext-grid" />
      </div>

      {/* ── Card ── */}
      <div className="ext-card">
        {/* Logo row */}
        <div className="ext-logo-row">
          <div className="ext-logo-icon" aria-hidden="true">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <rect width="28" height="28" rx="8" fill="url(#lg)" />
              <path
                d="M8 14L13 19L20 9"
                stroke="#fff"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <defs>
                <linearGradient id="lg" x1="0" y1="0" x2="28" y2="28">
                  <stop stopColor="#6366f1" />
                  <stop offset="1" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <span className="ext-logo-name">Wekraft</span>
          <div className="ext-badge">IDE Extension</div>
        </div>

        {/* Divider */}
        <div className="ext-divider" />

        {/* ── NOT SIGNED IN ── */}
        {isLoaded && !isSignedIn && (
          <div className="ext-section ext-fadein">
            <div className="ext-icon-wrap ext-icon-warn">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 11c-.55 0-1-.45-1-1V8c0-.55.45-1 1-1s1 .45 1 1v4c0 .55-.45 1-1 1zm1 4h-2v-2h2v2z"
                  fill="currentColor"
                />
              </svg>
            </div>
            <h1 className="ext-title">Connect your IDE</h1>
            <p className="ext-desc">
              Sign in to your Wekraft account to grant your IDE extension secure
              access to your projects and tasks.
            </p>
            <SignInButton mode="redirect">
              <button id="ext-signin-btn" className="ext-btn ext-btn-primary">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"
                    fill="currentColor"
                  />
                </svg>
                Sign in to Wekraft
              </button>
            </SignInButton>
          </div>
        )}

        {/* ── SIGNED IN – IDLE ── */}
        {isLoaded && isSignedIn && state === "idle" && (
          <div className="ext-section ext-fadein">
            <div className="ext-avatar-wrap">
              {user.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.imageUrl}
                  alt={user.fullName ?? "User"}
                  className="ext-avatar"
                />
              ) : (
                <div className="ext-avatar ext-avatar-fallback">
                  {(user.fullName ?? "U")[0]}
                </div>
              )}
              <div className="ext-avatar-badge" aria-hidden="true">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <circle cx="5" cy="5" r="5" fill="#22c55e" />
                </svg>
              </div>
            </div>
            <h1 className="ext-title">
              Hi, {user.firstName ?? user.fullName ?? "there"} 👋
            </h1>
            <p className="ext-desc">
              Your IDE extension is requesting access to Wekraft. Click below to
              grant it — a secure, one-time token will be sent to your IDE.
            </p>

            {!callbackUrl && (
              <div className="ext-warning-box">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"
                    fill="#f59e0b"
                  />
                </svg>
                No callback URL detected. Launch this page from your IDE
                extension.
              </div>
            )}

            <button
              id="ext-grant-btn"
              className="ext-btn ext-btn-primary"
              onClick={handleGrantAccess}
              disabled={!callbackUrl}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"
                  fill="currentColor"
                />
              </svg>
              Grant Access to IDE
            </button>

            <p className="ext-hint">
              This generates a one-time token valid for 5 minutes.
            </p>
          </div>
        )}

        {/* ── LOADING ── */}
        {state === "loading" && (
          <div className="ext-section ext-fadein ext-center">
            <div className="ext-spinner" aria-label="Loading" />
            <h1 className="ext-title">Generating token…</h1>
            <p className="ext-desc">
              Hang tight, we&apos;re securely handing off your credentials to
              your IDE.
            </p>
          </div>
        )}

        {/* ── SUCCESS ── */}
        {state === "success" && (
          <div className="ext-section ext-fadein ext-center">
            <div className="ext-icon-wrap ext-icon-success">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path
                  d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"
                  fill="currentColor"
                />
              </svg>
            </div>
            <h1 className="ext-title">Access granted!</h1>
            <p className="ext-desc">
              Redirecting you back to your IDE… If nothing happens,{" "}
              <span className="ext-muted">close this tab.</span>
            </p>
          </div>
        )}

        {/* ── ERROR ── */}
        {state === "error" && (
          <div className="ext-section ext-fadein ext-center">
            <div className="ext-icon-wrap ext-icon-error">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path
                  d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
                  fill="currentColor"
                />
              </svg>
            </div>
            <h1 className="ext-title">Something went wrong</h1>
            <p className="ext-desc">{errorMsg}</p>
            <button
              id="ext-retry-btn"
              className="ext-btn ext-btn-ghost"
              onClick={() => setState("idle")}
            >
              Try again
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="ext-footer">
          <span>
            Your API key is never exposed in the browser or URL bar.
          </span>
        </div>
      </div>

      {/* ── Scoped styles ── */}
      <style>{`
        /* Reset & root */
        .ext-root {
          min-height: 100dvh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #09090b;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          padding: 1.5rem;
          position: relative;
          overflow: hidden;
        }

        /* ── Ambient background ── */
        .ext-bg { position: fixed; inset: 0; pointer-events: none; z-index: 0; }

        .ext-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.35;
        }
        .ext-orb-1 {
          width: 500px; height: 500px;
          top: -120px; left: -100px;
          background: radial-gradient(circle, #6366f1 0%, transparent 70%);
          animation: orbFloat 12s ease-in-out infinite alternate;
        }
        .ext-orb-2 {
          width: 400px; height: 400px;
          bottom: -100px; right: -60px;
          background: radial-gradient(circle, #8b5cf6 0%, transparent 70%);
          animation: orbFloat 15s ease-in-out infinite alternate-reverse;
        }
        .ext-orb-3 {
          width: 300px; height: 300px;
          top: 40%; left: 50%;
          transform: translate(-50%, -50%);
          background: radial-gradient(circle, #3b82f6 0%, transparent 70%);
          opacity: 0.15;
        }
        .ext-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.025) 1px, transparent 1px);
          background-size: 40px 40px;
        }

        @keyframes orbFloat {
          from { transform: translateY(0) scale(1); }
          to   { transform: translateY(40px) scale(1.08); }
        }

        /* ── Card ── */
        .ext-card {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 440px;
          background: rgba(255,255,255,.04);
          border: 1px solid rgba(255,255,255,.09);
          border-radius: 20px;
          padding: 2rem;
          backdrop-filter: blur(20px);
          box-shadow:
            0 0 0 1px rgba(99,102,241,.12),
            0 24px 64px rgba(0,0,0,.55);
          animation: cardIn .45s cubic-bezier(.22,.61,.36,1) both;
        }

        @keyframes cardIn {
          from { opacity: 0; transform: translateY(24px) scale(.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* ── Logo row ── */
        .ext-logo-row {
          display: flex;
          align-items: center;
          gap: .625rem;
          margin-bottom: 1.25rem;
        }
        .ext-logo-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px; height: 36px;
          border-radius: 10px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          box-shadow: 0 4px 16px rgba(99,102,241,.4);
        }
        .ext-logo-name {
          font-size: 1.05rem;
          font-weight: 700;
          color: #f4f4f5;
          letter-spacing: -.02em;
        }
        .ext-badge {
          margin-left: auto;
          font-size: .68rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: .06em;
          color: #a78bfa;
          background: rgba(167,139,250,.12);
          border: 1px solid rgba(167,139,250,.22);
          border-radius: 99px;
          padding: .2rem .6rem;
        }

        /* ── Divider ── */
        .ext-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,.08), transparent);
          margin-bottom: 1.5rem;
        }

        /* ── Section ── */
        .ext-section { display: flex; flex-direction: column; gap: 1rem; }
        .ext-center  { align-items: center; text-align: center; }
        .ext-fadein  { animation: fadeUp .35s ease both; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ── Avatar ── */
        .ext-avatar-wrap { position: relative; width: 56px; height: 56px; }
        .ext-avatar {
          width: 56px; height: 56px;
          border-radius: 50%;
          border: 2px solid rgba(99,102,241,.5);
          object-fit: cover;
          display: block;
        }
        .ext-avatar-fallback {
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.4rem;
          font-weight: 700;
          color: #e4e4e7;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
        }
        .ext-avatar-badge {
          position: absolute;
          bottom: 1px; right: 1px;
          width: 14px; height: 14px;
          background: #09090b;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* ── Icon circles ── */
        .ext-icon-wrap {
          width: 52px; height: 52px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .ext-icon-warn    { background: rgba(245,158,11,.12); color: #fbbf24; border: 1px solid rgba(245,158,11,.2); }
        .ext-icon-success { background: rgba(34,197,94,.12);  color: #4ade80; border: 1px solid rgba(34,197,94,.2); }
        .ext-icon-error   { background: rgba(239,68,68,.12);  color: #f87171; border: 1px solid rgba(239,68,68,.2); }

        /* ── Typography ── */
        .ext-title {
          font-size: 1.3rem;
          font-weight: 700;
          color: #f4f4f5;
          letter-spacing: -.02em;
          margin: 0;
        }
        .ext-desc {
          font-size: .88rem;
          color: #a1a1aa;
          line-height: 1.6;
          margin: 0;
        }
        .ext-hint {
          font-size: .78rem;
          color: #52525b;
          text-align: center;
          margin: 0;
        }
        .ext-muted { color: #52525b; }

        /* ── Buttons ── */
        .ext-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: .5rem;
          border: none;
          border-radius: 10px;
          font-size: .9rem;
          font-weight: 600;
          cursor: pointer;
          padding: .7rem 1.4rem;
          transition: opacity .15s, transform .15s, box-shadow .15s;
          width: 100%;
        }
        .ext-btn:active { transform: scale(.97); }
        .ext-btn:disabled { opacity: .4; cursor: not-allowed; }

        .ext-btn-primary {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: #fff;
          box-shadow: 0 4px 20px rgba(99,102,241,.35);
        }
        .ext-btn-primary:hover:not(:disabled) {
          opacity: .92;
          box-shadow: 0 6px 28px rgba(99,102,241,.5);
        }

        .ext-btn-ghost {
          background: rgba(255,255,255,.06);
          color: #a1a1aa;
          border: 1px solid rgba(255,255,255,.1);
        }
        .ext-btn-ghost:hover { background: rgba(255,255,255,.1); color: #e4e4e7; }

        /* ── Warning box ── */
        .ext-warning-box {
          display: flex;
          align-items: center;
          gap: .5rem;
          padding: .65rem .9rem;
          background: rgba(245,158,11,.08);
          border: 1px solid rgba(245,158,11,.2);
          border-radius: 8px;
          font-size: .8rem;
          color: #d97706;
        }

        /* ── Spinner ── */
        .ext-spinner {
          width: 44px; height: 44px;
          border-radius: 50%;
          border: 3px solid rgba(255,255,255,.08);
          border-top-color: #6366f1;
          animation: spin .7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ── Footer ── */
        .ext-footer {
          margin-top: 1.5rem;
          padding-top: 1.1rem;
          border-top: 1px solid rgba(255,255,255,.06);
          text-align: center;
          font-size: .74rem;
          color: #3f3f46;
        }
      `}</style>
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
