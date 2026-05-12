"use client";

import { useStoreUser } from "@/hooks/use-user-store";
import { useMutation, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "../../../../../convex/_generated/api";
import { useEffect } from "react";
import { getUserTopLanguages } from "@/modules/github/actions/action";
import { toast } from "sonner";
import OnboardCard from "@/components/forgeui/onboard-card";

const AuthCallback = () => {
  const { isAuthenticated, isLoading: isStoreLoading } = useStoreUser();
  const router = useRouter();
  const user = useQuery(api.user.getCurrentUser);
  const updateUserSkills = useMutation(api.user.updateUserSkills);

  useEffect(() => {
    //Wait for syncing to finish
    if (isStoreLoading) return; 

    if (!isAuthenticated) {
      router.push("/");
      return;
    }

    if (user === undefined) return;

    const handleRedirect = async () => {
      // IF USER SKILLS ARE ALREADY PRESENT, JUST REDIRECT
      // if (user && user.skills && user.skills.length > 0) {
      //   if (user.hasCompletedOnboarding) {
      //     router.push("/dashboard");
      //   } else {
      //     router.push(`/onboard/user`);
      //   }
      //   return;
      // }

      // try {
      //   if (user && user.githubUsername) {
      //     const topLanguages = await getUserTopLanguages(user.githubUsername);
      //     if (topLanguages && topLanguages.length > 0) {
      //       await updateUserSkills({ skills: topLanguages });
      //       toast.success("Github User Profile Synced Successfully.");
      //     }
      //   }
      // } catch (error) {
      //   console.error("❌ Failed to update user skills:", error);
      //   toast.error("Failed to update user skills");
      // }

      if (user && user.hasCompletedOnboarding) {
        router.push("/dashboard");
      } else if (user) {
        router.push(`/onboard/user`);
      }
    };

    handleRedirect();
  }, [isAuthenticated, isStoreLoading, user, router, updateUserSkills]);

  return (
    <div className="flex h-screen w-full items-center justify-center">
    <OnboardCard
      duration={3000} // 3sec
      step1="Welcome Aboard"
      step2="Creating Environment"
      step3="Checking auth-token"
    />
    </div>
  );
};

export default AuthCallback;
