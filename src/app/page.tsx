"use client";
import { useConvexAuth } from "convex/react";
import Image from "next/image";
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
  return <div>Home</div>;
};

export default Home;
