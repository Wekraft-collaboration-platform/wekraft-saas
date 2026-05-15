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
import { ChevronDown, LogOut, Settings, User } from "lucide-react";
import { useRouter } from "next/navigation";

export function UserMenu() {
  const { user } = useUser();
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
          <AvatarImage src={user.imageUrl} alt={user.fullName || "User"} />
          <AvatarFallback className="bg-primary/10 text-primary">
            {user.fullName?.charAt(0) || user.username?.charAt(0) || "U"}
          </AvatarFallback>
        </Avatar>
        <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors mr-1" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60 p-2 shadow-xl border-muted-foreground/20 backdrop-blur-xl">
        <DropdownMenuLabel className="font-normal p-2">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-semibold leading-none">{user.fullName}</p>
            <p className="text-xs leading-none text-muted-foreground truncate">
              {user.primaryEmailAddress?.emailAddress}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="my-2" />
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
          className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer rounded-md transition-colors"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
