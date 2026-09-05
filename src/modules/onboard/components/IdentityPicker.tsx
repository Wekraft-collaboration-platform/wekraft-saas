"use client";

import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface IdentityPickerProps {
  value: string;
  onChange: (value: string) => void;
  onValidationError: (error: string | null) => void;
}

export function IdentityPicker({
  value,
  onChange,
  onValidationError,
}: IdentityPickerProps) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  const [isTyping, setIsTyping] = useState(false);

  // Clean debounce logic
  useEffect(() => {
    if (value.length < 3) {
      setDebouncedValue("");
      return;
    }

    setIsTyping(true);
    const timer = setTimeout(() => {
      setDebouncedValue(value);
      setIsTyping(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [value]);

  const isLengthValid = value.length >= 3 && value.length <= 20;

  // React-ready availability check
  const isAvailable = useQuery(
    api.user.checkUsernameAvailability,
    debouncedValue.length >= 3 ? { name: debouncedValue } : "skip",
  );

  // Sync validation errors back to parent
  useEffect(() => {
    if (value.length > 0 && value.length < 3) {
      onValidationError("Username needs to be more than or 3 letters");
    } else if (value.length > 20) {
      onValidationError("Username must be less than 20 letters");
    } else if (isAvailable === false && !isTyping) {
      onValidationError("username exists!");
    } else {
      onValidationError(null);
    }
  }, [value, isAvailable, isTyping, onValidationError]);

  const getStatusIcon = () => {
    if (value.length < 3) return null;
    if (isTyping)
      return <Loader2 className="size-4 animate-spin text-muted-foreground" />;
    if (!isLengthValid) return <XCircle className="size-4 text-destructive" />;
    if (isAvailable === undefined)
      return <Loader2 className="size-4 animate-spin text-muted-foreground" />;
    if (isAvailable === false)
      return <XCircle className="size-4 text-destructive" />;
    return <CheckCircle2 className="size-4 text-blue-500" />;
  };

  return (
    <div className="space-y-1.5 font-sans">
      <div className="flex items-center justify-between">
        <Label htmlFor="username" className="text-base text-zinc-300 font-medium">
          Username
        </Label>
      </div>
      <div className="relative">
        <Input
          id="username"
          placeholder="e.g. johndoe"
          autoComplete="off"
          spellCheck={false}
          className={cn(
            "bg-zinc-900/70! border border-zinc-700 text-white placeholder:text-zinc-550 rounded-md h-9 text-xs transition-all focus-visible:ring-1 focus-visible:ring-zinc-500/30!",
            (value.length >= 3 && isAvailable === false && !isTyping) ||
              (value.length > 0 && !isLengthValid)
              ? "border-destructive/50! focus-visible:ring-destructive/20!"
              : "focus-visible:border-zinc-550! focus-visible:ring-zinc-500/25!",
          )}
          value={value}
          onChange={(e) =>
            onChange(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))
          }
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {getStatusIcon()}
        </div>
      </div>
      <div className="min-h-5 px-1">
        {value.length > 0 && value.length < 3 && (
          <p className="text-[11px] text-zinc-500">
            Username needs to be at least 3 characters
          </p>
        )}
        {value.length > 20 && (
          <p className="text-[11px] text-destructive">Too long (max 20)</p>
        )}
        {value.length >= 3 && isAvailable === false && !isTyping && (
          <p className="text-[11px] text-destructive animate-in fade-in slide-in-from-top-1">
            Username is already taken
          </p>
        )}
        {value.length >= 3 && isAvailable === true && !isTyping && (
          <p className="text-[11px] text-blue-400">Username is available</p>
        )}
      </div>
    </div>
  );
}
