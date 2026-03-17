import { Ghost, Github, LucideGithub, LucideMail } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

import { redirect } from "next/navigation";
import Image from "next/image";
import DesignCarousel from "@/modules/auth/components/Design";
import { SignInButton, SignUpButton } from "@clerk/nextjs";

export default async function LoginPage() {
  return (
    <div className="h-screen bg-black text-white selection:bg-white selection:text-black font-sans dark">
      <main className="relative h-full flex flex-col items-center justify-center px-6 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[36px_36px]" />
          <div className="absolute -top-40 left-95 w-full max-w-[720px] h-[500px] bg-blue-500/30 blur-[160px] rounded-full pointer-events-none" />
        </div>

        <div className="max-w-6xl w-full z-10 grid lg:grid-cols-2 gap-12 items-center justify-center h-full relative">
          <div className="space-y-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-[11px] font-medium text-neutral-400 tracking-wider uppercase">
              <span className="size-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(96,165,250,0.8)]" />
              New Era of Collaboration
            </div>
            {/* main text */}
            <div className="space-y-6">
              <h1 className="text-5xl md:text-[60px] font-semibold  tracking-normal leading-[1.05] font-pop">
                The Platform for <br />
                <span className="text-transparent bg-clip-text bg-linear-to-b from-white to-neutral-500  font-sans font-bold">
                  Modern Collaboration.
                </span>
              </h1>
              <p className="text-base text-neutral-400 leading-relaxed max-w-md">
                WeKraft turns your GitHub activity into actionable insights.
                From collaboration To Project Management — Build together
                frictionless.
              </p>
            </div>

            <div className="h-[120px] flex items-center">
              <DesignCarousel />
            </div>
          </div>

          <div className="flex justify-center lg:justify-end ">
            {/* CARD LOGIN */}
            <div className="w-full max-w-[400px] space-y-8">
              <div className="p-10 rounded-lg  bg-linear-to-b from-black via-black/60  to-transparent   relative group">
                <div className="absolute -inset-px bg-linear-to-b to-transparent rounded-lg -z-10 from-white/20 transition-all duration-500" />

                <div className="space-y-6 text-center">
                  <div className="flex items-center justify-center">
                    <Image src="/logo.svg" alt="Logo" width={40} height={40} />
                  </div>
                  <div className="space-y-3">
                    <h2 className="text-3xl font-semibold tracking-tight">
                      Welcome Back
                    </h2>
                    <p className="text-[13px] text-neutral-300">
                      Access your dashboard, manage repositories and collaborate
                      with your team.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <SignInButton>
                      <Button className="w-full h-9 bg-white text-black hover:bg-neutral-200 text-sm font-medium flex items-center justify-center gap-3 transition-all rounded-lg">
                        <Image
                          src="/github.png"
                          alt="Github"
                          width={25}
                          height={25}
                        />
                        Continue with GitHub
                      </Button>
                    </SignInButton>

                    <h4 className="text-[11px] text-neutral-400 mt-4">
                      ALTERNATIVE
                    </h4>

                    <SignUpButton>
                      <Button
                        variant={"ghost"}
                        className="w-full cursor-pointer text-sm text-neutral-300"
                      >
                        <LucideMail className="size-4" />
                        Continue with Email
                      </Button>
                    </SignUpButton>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-white/20" />
                    </div>
                    <div className="relative flex justify-center text-[10px] uppercase tracking-widest">
                      <span className="bg-black/50 px-3 text-neutral-400">
                        Secure & Fast
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-neutral-500 leading-relaxed text-balance">
                    By joining, you agree to WeKraft
                    <Link
                      href="#"
                      className="text-neutral-300 hover:text-white underline underline-offset-4 mx-1"
                    >
                      Terms
                    </Link>
                    and
                    <Link
                      href="#"
                      className="text-neutral-300 hover:text-white underline underline-offset-4 mx-1"
                    >
                      Privacy Policy
                    </Link>
                    .
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
