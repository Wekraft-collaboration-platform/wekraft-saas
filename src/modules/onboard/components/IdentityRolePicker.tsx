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

      <div className="">
        <Label htmlFor="role-search" className="text-xs text-white mb-1.5">
          Occupation
        </Label>

        <div className="border  rounded-xl overflow-hidden">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white" />
            <Input
              id="role-search"
              placeholder="Search role..."
              className="pl-9 bg-neutral-800! h-10 rounded-none border-none   text-white placeholder:text-neutral-300"
              value={roleSearch}
              onChange={(e) => setRoleSearch(e.target.value)}
            />
          </div>
          <ScrollArea className="h-[140px] px-5 py-3 bg-white/5  scrollbar-hide">
            <div className="space-y-2">
              {filteredRoles.length > 0 ? (
                filteredRoles.map((role, idx) => {
                  const isSelected = role === selectedRole;

                  return (
                    <button
                      key={`${role}-${idx}`}
                      type="button"
                      onClick={() => onRoleSelect(role)}
                      className={cn(
                        "w-full flex items-center justify-between rounded-lg border px-3 py-2.5 text-left text-xs tracking-wide font-medium capitalize transition-all",
                        isSelected
                          ? "bg-accent/40 border-white/30 text-white"
                          : "bg-accent/20!  text-neutral-300 border-white/5",
                      )}
                    >
                      <span>{role}</span>
                      {isSelected && (
                        <Check className="size-4 text-white p-1 bg-blue-500 rounded-full" />
                      )}
                    </button>
                  );
                })
              ) : (
                <div className="flex h-28 items-center justify-center rounded-lg border border-dashed border-white/10 text-sm text-white/60">
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
