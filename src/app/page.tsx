"use client";
import { useConvexAuth } from "convex/react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { toast } from "sonner";

const Home = () => {
  const router = useRouter();
  const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth();

  useEffect(() => {
    if (isAuthLoading) {
      toast.loading("Checking session...", {
        id: "checking-session",
      });
      return;
    }

    if (isAuthenticated) {
      toast.dismiss("checking-session");
      toast.success("Session restored successfully!");
      router.push("/auth/callback");
    } else {
      toast.dismiss("checking-session");
      router.push("/web");
    }
  }, [isAuthenticated, isAuthLoading, router]);
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-black px-6">
      <div className="flex flex-col items-center gap-2 text-center max-w-md mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="flex items-center gap-3 justify-center"
        >
          <Image
            src="/logo.svg"
            alt="logo"
            width={40}
            height={40}
            className="rounded-lg w-8 h-8 sm:w-10 sm:h-10"
          />
          <h1 className="text-xl sm:text-2xl text-white font-semibold font-pop">
            WeKraft
          </h1>
        </motion.div>

        <motion.h3
          className="text-sm sm:text-lg font-medium text-neutral-400 mt-2 leading-relaxed"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.3 }}
        >
          AI First Pm Platform where you execute not only manage...
        </motion.h3>

        <motion.p
          className="text-xs sm:text-sm font-light text-neutral-400 mt-2 leading-relaxed"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.3 }}
        >
          <span>Redirecting...</span> If you haven't been redirected, visit{" "}
          <Link
            href="/web"
            className="text-blue-500 underline underline-offset-2 hover:text-blue-400 transition-colors"
          >
            here
          </Link>
        </motion.p>
      </div>
    </div>
  );
};

export default Home;
