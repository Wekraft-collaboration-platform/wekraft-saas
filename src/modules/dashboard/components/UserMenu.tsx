"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useClerk, useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { ChevronDown, Github, LogOut, Settings, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { api } from "../../../../convex/_generated/api";

export function UserMenu() {
  const user = useQuery(api.user.getCurrentUser);
  const { user: clerkUser } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();

  if (!user) return null;

  const handleSignOut = async () => {
    await signOut();
    router.push("/web");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 hover:bg-accent/50 p-1 rounded-full transition-all outline-none group">
        <Avatar className="h-9 w-9 border-2 border-transparent group-hover:border-primary/20 transition-all">
          <AvatarImage src={user?.avatarUrl} alt={user?.name || "User"} />
          <AvatarFallback className="bg-primary/10 text-primary">
            {user?.name?.charAt(0) || user.name?.charAt(0) || "U"}
          </AvatarFallback>
        </Avatar>
        <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors mr-1" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-60 p-2 shadow-xl border-muted-foreground/20 bg-sidebar!"
      >
        <DropdownMenuLabel className="font-normal p-2">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-semibold leading-none capitalize">
              {user?.name}
            </p>
            <p className="text-xs leading-none text-muted-foreground truncate">
              {user?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="my-2" />
        {/* Github account */}
        <DropdownMenuItem
          onClick={() => router.push("/dashboard/profile")}
          className="cursor-pointer rounded-md transition-colors"
        >
          <Github className="mr-2 h-4 w-4" />
          <span>{user?.githubUsername ? `@${user?.githubUsername}` : "Not Connected yet"}</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => router.push("/dashboard/profile")}
          className="cursor-pointer rounded-md transition-colors"
        >
          <User className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => router.push("/dashboard/settings")}
          className="cursor-pointer rounded-md transition-colors"
        >
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="my-2" />
        <DropdownMenuItem
          onClick={handleSignOut}
          className=" cursor-pointer rounded-md transition-colors"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
