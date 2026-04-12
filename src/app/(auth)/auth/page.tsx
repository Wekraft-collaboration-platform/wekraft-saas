import {
  Ghost,
  GhostIcon,
  Github,
  LucideGithub,
  LucideMail,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

import { redirect } from "next/navigation";
import Image from "next/image";
import DesignCarousel from "@/modules/auth/components/Design";
import { SignInButton, SignUpButton } from "@clerk/nextjs";

export default async function LoginPage() {
  return (
    <div className="h-screen bg-black text-white selection:bg-white selection:text-black font-sans dark p-5">
      {/* Main Container */}
      <div className="flex h-full">
        {/* LEFT SIDE */}
        <div className="border border-border/40 relative overflow-hidden w-[65%] h-full rounded-lg p-8">
          <div className="absolute z-10 -top-20 left-1/2 -translate-x-1/2 w-full max-w-[560px] h-[300px] bg-blue-500/25 blur-[160px] rounded-full pointer-events-none" />
          <div className="absolute z-10 -bottom-10 left-1/2 -translate-x-1/2 w-full h-[200px] bg-black blur-[160px] rounded-full pointer-events-none" />
          <Image
            src="/bg-footer.jpg"
            alt="Background"
            fill
            className="object-cover z-0 opacity-30"
          />
          <div className="flex items-center gap-2 z-20 relative">
            <Image src="/logo.svg" alt="Logo" width={35} height={35} />
            <h1 className="text-xl font-semibold font-pop">WeKraft</h1>
          </div>

          <div className="absolute bottom-10 z-20">
            <h1 className=" text-6xl font-semibold tracking-tight font-pop bg-linear-to-r from-white to-neutral-800 text-transparent bg-clip-text">
              AI-Native
            </h1>
            <h1 className=" text-6xl font-semibold tracking-tight font-pop bg-linear-to-r from-white to-neutral-800 text-transparent bg-clip-text">
              Execution Platform for
            </h1>
            <h1 className=" text-6xl leading-snug -mt-1 font-semibold tracking-wide font-pop bg-linear-to-r from-white to-neutral-800 text-transparent bg-clip-text">
              Builders and Startups
            </h1>
          </div>
        </div>
        {/* RIGHT SIDE */}
        <div className="w-[35%] h-full flex flex-col justify-center items-center px-12 relative overflow-hidden bg-black">
          {/* Header */}
          <div className="flex flex-col items-center gap-5 mb-12 relative z-10">
            <div className="flex items-center gap-3">
              <Image src="/logo.svg" alt="Logo" width={40} height={40} />

              <h1 className="text-3xl font-bold font-pop tracking-tight text-white">
                WeKraft
              </h1>
            </div>
            <div className="text-center space-y-1">
              <p className="text-sm font-medium text-neutral-400 tracking-wide uppercase">
                Building the future together
              </p>
              <div className="h-px w-28 bg-linear-to-r from-transparent via-neutral-700 to-transparent mx-auto" />
            </div>
          </div>

          {/* Auth Card/Options */}
          <div className="w-full max-w-sm space-y-8 relative z-10">
            <div className="space-y-2 text-center">
              <h2 className="text-2xl font-semibold tracking-tight text-white">
                Welcome back
              </h2>
              <p className="text-sm text-neutral-500">
                Sign in to manage your AI-native projects
              </p>
            </div>

            <div className="space-y-3.5">
              <SignInButton>
                <Button
                  variant="outline"
                  className="w-full h-9 bg-neutral-900/50 border-neutral-800 hover:bg-neutral-800 hover:border-neutral-700 transition-all duration-300 gap-3 text-white rounded-lg group cursor-pointer shadow-sm relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-linear-to-r from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <LucideGithub className="w-5 h-5 transition-transform group-hover:scale-110" />
                  <span className="text-xs font-medium tracking-tight">
                    Continue with GitHub
                  </span>
                </Button>
              </SignInButton>

              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-neutral-800/50" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-black px-3 text-neutral-600 font-medium tracking-widest">
                    OR
                  </span>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full h-9 bg-neutral-900/50 border-neutral-800 hover:bg-neutral-800 hover:border-neutral-700 transition-all duration-300 gap-3 text-white rounded-lg group cursor-pointer shadow-sm relative overflow-hidden"
              >
                <GhostIcon className="w-5 h-5 transition-transform group-hover:scale-110" />
                <span className="text-xs font-medium tracking-tight">
                  Continue as Guest
                </span>
              </Button>
            </div>
          </div>

          {/* Footer Items */}
          <div className="absolute bottom-10 left-0 right-0 px-12">
            <div className="flex flex-col items-center gap-6">
              <div className="flex items-center gap-8">
                <Link
                  href="/terms"
                  className="text-[11px] font-medium text-neutral-600 hover:text-neutral-300 transition-colors tracking-wider uppercase"
                >
                  Terms
                </Link>
                <Link
                  href="/privacy"
                  className="text-[11px] font-medium text-neutral-600 hover:text-neutral-300 transition-colors tracking-wider uppercase"
                >
                  Privacy
                </Link>
                <Link
                  href="/support"
                  className="text-[11px] font-medium text-neutral-600 hover:text-neutral-300 transition-colors tracking-wider uppercase"
                >
                  Support
                </Link>
              </div>
              <p className="text-[10px] text-neutral-700 font-medium tracking-widest uppercase">
                © 2024 WeKraft Labs
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
