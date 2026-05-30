"use client";

import { useMemo, useState } from "react";
import { Check, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { IdentityPicker } from "./IdentityPicker";
import { cn } from "@/lib/utils";

type IdentityRolePickerProps = {
  username: string;
  onUsernameChange: (value: string) => void;
  roles: string[];
  selectedRole: string;
  onRoleSelect: (role: string) => void;
  onValidationError: (error: string | null) => void;
};

export function IdentityRolePicker({
  username,
  onUsernameChange,
  roles,
  selectedRole,
  onRoleSelect,
  onValidationError,
}: IdentityRolePickerProps) {
  const [roleSearch, setRoleSearch] = useState("");

  const uniqueRoles = useMemo(() => {
    const seen = new Set<string>();
    const out: string[] = [];

    for (const role of roles) {
      const normalized = role.trim().toLowerCase();
      if (!normalized) continue;
      if (seen.has(normalized)) continue;
      seen.add(normalized);
      out.push(role);
    }

    return out;
  }, [roles]);

  const filteredRoles = useMemo(() => {
    const query = roleSearch.trim().toLowerCase();

    if (!query) return uniqueRoles;

    return uniqueRoles.filter((role) => role.toLowerCase().includes(query));
  }, [roleSearch, uniqueRoles]);

  return (
    <div className="space-y-3">
      <IdentityPicker
        value={username}
        onChange={onUsernameChange}
        onValidationError={onValidationError}
      />

      <div className="space-y-1.5 font-sans">
        <Label htmlFor="role-search" className="text-base text-zinc-300 font-medium">
          Occupation
        </Label>

        <div className="rounded-sm overflow-hidden border border-zinc-800/80 bg-zinc-950/30">
          <div className="relative border-b border-zinc-800/60">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-zinc-500" />
            <Input
              id="role-search"
              placeholder="Search role..."
              className="pl-9 h-9 rounded-none border-border! text-xs text-white placeholder:text-zinc-550 focus-visible:ring-0 focus-visible:ring-offset-0"
              value={roleSearch}
              onChange={(e) => setRoleSearch(e.target.value)}
            />
          </div>
          <ScrollArea className="h-[140px] px-3 py-3 bg-black! scrollbar-hide">
            <div className="space-y-1.5">
              {filteredRoles.length > 0 ? (
                filteredRoles.map((role, idx) => {
                  const isSelected = role === selectedRole;

                  return (
                    <button
                      key={`${role}-${idx}`}
                      type="button"
                      onClick={() => onRoleSelect(role)}
                      className={cn(
                        "w-full flex items-center justify-between rounded-md border px-3 py-2 text-left text-xs tracking-wide font-normal cursor-pointer capitalize transition-all",
                        isSelected
                          ? "bg-zinc-900/45! border-zinc-500! text-zinc-100!"
                          : "bg-[#0f0f12]! border-zinc-800! text-zinc-300 hover:bg-zinc-900/40! hover:border-zinc-650! hover:text-white",
                      )}
                    >
                      <span>{role}</span>
                      {isSelected && (
                        <Check className="size-3.5 text-zinc-900 p-0.5 bg-zinc-200 rounded-full" />
                      )}
                    </button>
                  );
                })
              ) : (
                <div className="flex h-24 items-center justify-center rounded-md border border-dashed border-zinc-850 text-xs text-zinc-500">
                  No roles found for "{roleSearch}"
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
