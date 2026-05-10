"use client";
import { useConvexAuth } from "convex/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import Link from "next/link";

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
    <div className="flex h-screen w-full flex-col items-center justify-center bg-black">
      <div className="flex flex-col items-center gap-2">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="flex items-center gap-3"
        >
          <Image
            src="/logo.svg"
            alt="logo"
            width={40}
            height={40}
            className="rounded-lg"
          />
          <h1 className="text-2xl text-white font-semibold font-pop">WeKraft</h1>
        </motion.div>

        <motion.h3
          className="text-lg font-medium text-neutral-400 mt-2"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.3 }}
        >
          Find team ,Match skills ,Launch products & avoid Deadlines
        </motion.h3>

        <motion.p
          className="text-sm font-light text-neutral-400 mt-2"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.3 }}
        >
          <span className="">Redirecting...</span>{" "}
          If u havent redirected visit{" "}
          <Link href="/web" className="text-blue-500 underline underline-offset-2">
            here
          </Link>
        </motion.p>
      </div>
    </div>
  );
};

export default Home;
