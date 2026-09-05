"use client"

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4 mt-0.5 shrink-0 text-black" />,
        info: <InfoIcon className="size-4 mt-0.5 shrink-0 text-black" />,
        warning: <TriangleAlertIcon className="size-4 mt-0.5 shrink-0 text-black" />,
        error: <OctagonXIcon className="size-4 mt-0.5 shrink-0 text-black" />,
        loading: <Loader2Icon className="size-4 mt-0.5 shrink-0 animate-spin text-black" />,
      }}
      style={
        {
          "--normal-bg": "oklch(1 0 0)",
          "--normal-text": "oklch(0.205 0 0)",
          "--normal-border": "oklch(0.922 0 0)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "cn-toast !bg-white !border-neutral-200 !items-start !text-neutral-900 !shadow-lg",
          icon: "!mt-0.5",
          title: "!text-neutral-900 !font-semibold",
          description: "!text-neutral-700",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
