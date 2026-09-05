"use client";

import React, { useEffect } from "react";
import { useQuery, useConvexAuth } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "../../../convex/_generated/api";
import { Spinner } from "../ui/spinner";
import { ShieldAlert } from "lucide-react";
import { Button } from "../ui/button";

interface AdminGuardProps {
  children: React.ReactNode;
}

export function AdminGuard({ children }: AdminGuardProps) {
  const router = useRouter();
  const { isLoading: isAuthLoading, isAuthenticated } = useConvexAuth();
  const adminCheck = useQuery(api.admin.checkIsAdmin);

  const isChecking = isAuthLoading || (isAuthenticated && adminCheck === undefined);
  const hasAccess = isAuthenticated && adminCheck?.isAdmin === true;

  useEffect(() => {
    if (isChecking) return;

    if (!hasAccess) {
      // Move immediately to /web without blocking alerts
      router.replace("/web");
    }
  }, [isChecking, hasAccess, router]);

  // While auth loading or query is loading, show spinner
  if (isChecking) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-black text-white">
        <Spinner className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  // If access is granted, render the admin page content
  if (hasAccess) {
    return <>{children}</>;
  }

  // Not an admin: render Access Denied UI on page instead of children, and redirect
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-black text-white font-sans px-4">
      <div className="max-w-md w-full text-center space-y-6 p-8 rounded-2xl border border-zinc-800 bg-zinc-950/50 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-lg">
          <ShieldAlert className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-white">Access Denied</h2>
          <p className="text-zinc-400 text-sm">
            You cannot view this page. Redirecting to web...
          </p>
        </div>

        <Button
          onClick={() => router.push("/web")}
          className="w-full bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-800 cursor-pointer"
        >
          Go back to Web
        </Button>
      </div>
    </div>
  );
}
