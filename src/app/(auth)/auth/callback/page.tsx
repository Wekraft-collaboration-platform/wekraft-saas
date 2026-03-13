"use client";

import { useStoreUser } from "@/hooks/use-user-store";
import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "../../../../../convex/_generated/api";

const AuthCallback = () => {
  const { isAuthenticated, isLoading: isStoreLoading } = useStoreUser();
  const router = useRouter();
  const user = useQuery(api.user.getCurrentUser);

 

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="flex flex-col items-center gap-2">
       hello
      </div>
    </div>
  );
};

export default AuthCallback;
