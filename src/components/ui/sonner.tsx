"use client"

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  const isDark = theme === "dark"

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4 mt-0.5 shrink-0" />,
        info: <InfoIcon className="size-4 mt-0.5 shrink-0" />,
        warning: <TriangleAlertIcon className="size-4 mt-0.5 shrink-0" />,
        error: <OctagonXIcon className="size-4 mt-0.5 shrink-0" />,
        loading: <Loader2Icon className="size-4 mt-0.5 shrink-0 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": isDark ? "oklch(96.7% 0 0)" : "oklch(8.5% 0 0)",
          "--normal-text": isDark ? "oklch(20.5% 0 0)" : "oklch(92.8% 0 0)",
          "--normal-border": isDark ? "oklch(87% 0 0)" : "oklch(20% 0 0)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "cn-toast !items-start",
          icon: "!mt-0.5",
          title: isDark
            ? "!text-neutral-900 !font-semibold"
            : "!text-neutral-100 !font-semibold",
          description: isDark
            ? "!text-neutral-700"
            : "!text-neutral-300",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
