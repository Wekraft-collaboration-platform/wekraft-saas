import { useUser } from "@clerk/nextjs";
import { useConvexAuth } from "convex/react";
import { useEffect, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

export function useStoreUser() {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const { isLoaded: isClerkLoaded } = useUser();

  const [userId, setUserId] = useState<Id<"users"> | null>(null);
  const storeUser = useMutation(api.user.createNewUser);

  useEffect(() => {
    if (!isAuthenticated || !isClerkLoaded) return;
    if (userId) return; 

    let cancelled = false;

    async function createUser() {
      try {
        const id = await storeUser();
        if (!cancelled) {
          setUserId(id);
        }
      } catch (err) {
        console.error("[useStoreUser] store failed", err);
      }
    }

    createUser();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, isClerkLoaded, storeUser, userId]);

  return {
    isLoading: isLoading || (isAuthenticated && userId === null),
    isAuthenticated: isAuthenticated && userId !== null,
  };
}
