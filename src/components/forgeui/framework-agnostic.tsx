"use client";

import type { SVGProps } from "react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type FrameworkAgnosticProps = {
  cardTitle?: string;
  cardDescription?: string;
};

const FrameworkAgnostic = ({
  cardTitle = "Framework Agnostic",
  cardDescription = "Seamlessly integrate with any tech stack, whether it's Next.js, React, HTML, or anything else. Statsio works everywhere.",
}: FrameworkAgnosticProps) => {
  return (
    <div
      className={cn(
        "relative",
        "flex flex-col justify-between",
        "h-80 space-y-4",
        "rounded-md bg-gradient-to-b from-transparent to-black",
      )}
    >
      <FrameworkCard />
      <div className="px-4 pb-4">
        <div className="text-sm font-semibold text-white">{cardTitle}</div>
        <div className="mt-2 text-xs text-neutral-400">{cardDescription}</div>
      </div>
    </div>
  );
};

export default FrameworkAgnostic;

const FrameworkCard = () => {
  const [chatTransform, setChatTransform] = useState("none");
  const [meetTransform, setMeetTransform] = useState("none");
  const [trackTransform, setTrackTransform] = useState("none");

  useEffect(() => {
    const cycleAnimations = async () => {
      const upStyle = "translateY(-3.71px) rotateX(10.71deg) translateZ(20px)";
      const downStyle = "none";

      const transitionDuration = 1100;
      const durationOfUpState = 1200;
      const delayBetweenCards = 600;

      while (true) {
        setChatTransform(upStyle);
        await new Promise((resolve) => setTimeout(resolve, durationOfUpState));
        setChatTransform(downStyle);
        await new Promise((resolve) =>
          setTimeout(resolve, transitionDuration + delayBetweenCards),
        );

        setMeetTransform(upStyle);
        await new Promise((resolve) => setTimeout(resolve, durationOfUpState));
        setMeetTransform(downStyle);
        await new Promise((resolve) =>
          setTimeout(resolve, transitionDuration + delayBetweenCards),
        );

        setTrackTransform(upStyle);
        await new Promise((resolve) => setTimeout(resolve, durationOfUpState));
        setTrackTransform(downStyle);
        await new Promise((resolve) =>
          setTimeout(resolve, transitionDuration + delayBetweenCards),
        );
      }
    };

    cycleAnimations();
  }, []);

  const cardClasses =
    "flex aspect-square items-center justify-center rounded-md border border-neutral-800/60 bg-linear-to-b from-neutral-800 to-neutral-900 p-4 " +
    "[@media(min-width:320px)]:h-20 [@media(min-width:500px)]:h-36 " +
    "transition-transform duration-1000 ease-out will-change-transform";

  return (
    <div
      className={cn(
        "",
        "relative",
        "flex flex-col items-center justify-center gap-1",
        "h-58 w-full",
      )}
    >
      <div className="absolute flex h-full w-full items-center justify-center">
        <div className="h-full w-60">
          <svg
            className="h-full w-full"
            width="100%"
            height="100%"
            viewBox="0 0 100 100"
            fill="none"
            role="img"
            aria-label="Framework connection graphic"
          >
            <title>Framework connection path</title>
            <g stroke="#737373" strokeWidth="0.1">
              <path d="M 1 0 v 5 q 0 5 5 5 h 39 q 5 0 5 5 v 71 q 0 5 5 5 h 39 q 5 0 5 5 v 20" />
            </g>
            <g mask="url(#framework-mask)">
              <circle
                className="frameworkline framework-line"
                cx="0"
                cy="0"
                r="12"
                fill="url(#framework-blue-grad)"
              />
            </g>
            <defs>
              <mask id="framework-mask">
                <path
                  d="M 1 0 v 5 q 0 5 5 5 h 39 q 5 0 5 5 v 71 q 0 5 5 5 h 39 q 5 0 5 5 v 20"
                  strokeWidth="0.3"
                  stroke="white"
                />
              </mask>
              <radialGradient id="framework-blue-grad" fx="1">
                <stop offset="0%" stopColor={"#3b82f6"} />
                <stop offset="100%" stopColor="transparent" />
              </radialGradient>
            </defs>
          </svg>
        </div>
      </div>
      <div
        className={cn(
          "flex items-center justify-center gap-4",
          "perspective-[1000px] transform-3d",
        )}
      >
        <div className={cardClasses} style={{ transform: chatTransform }}>
          <ChatIcon className="size-7 text-neutral-200/90 [@media(min-width:500px)]:size-11" />
        </div>
        <div className={cardClasses} style={{ transform: meetTransform }}>
          <MeetIcon className="size-7 text-neutral-200/90 [@media(min-width:500px)]:size-11" />
        </div>
        <div className={cardClasses} style={{ transform: trackTransform }}>
          <TrackIcon className="size-7 text-neutral-200/90 [@media(min-width:500px)]:size-11" />
        </div>
      </div>

      <div className="absolute bottom-0 left-0 h-3 w-full bg-linear-to-t from-neutral-950 to-transparent" />
    </div>
  );
};

const ChatIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 48 48"
    width="1em"
    height="1em"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    role="img"
    aria-label="Chat messaging icon"
    {...props}
  >
    <title>Chat</title>
    {/* Clean, detailed double chat threads */}
    <rect x="4" y="6" width="30" height="22" rx="5" strokeWidth="1.5" />
    <path d="M12 28v6l6-6" strokeWidth="1.5" />
    {/* Inner chat lines or text blocks with varying opacity for that premium UI look */}
    <path d="M10 13h18" strokeWidth="1.5" opacity="0.9" />
    <path d="M10 18h14" strokeWidth="1.5" opacity="0.6" />
    <path d="M10 23h8" strokeWidth="1.5" opacity="0.4" />

    {/* Overlapping secondary bubble in background */}
    <rect
      x="20"
      y="18"
      width="24"
      height="18"
      rx="4"
      fill="#0f172a"
      fillOpacity="0.8"
      strokeWidth="1"
      strokeDasharray="2 2"
      opacity="0.85"
    />
    <path
      d="M38 36v4l-4-4"
      strokeWidth="1"
      strokeDasharray="2 2"
      opacity="0.85"
    />
    <circle cx="28" cy="27" r="1" fill="currentColor" opacity="0.8" />
    <circle cx="32" cy="27" r="1" fill="currentColor" opacity="0.8" />
  </svg>
);

const MeetIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 48 48"
    width="1em"
    height="1em"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    role="img"
    aria-label="Team meeting icon"
    {...props}
  >
    <title>Meeting</title>
    {/* Sleek video screen frame */}
    <rect x="4" y="8" width="28" height="22" rx="4" strokeWidth="1.5" />
    {/* Sleek modern camera lens part */}
    <path d="m32 15 8-4.5v17l-8-4.5" strokeWidth="1.5" />

    {/* Grid / Split screen indicator representing multiple members */}
    <path d="M18 8v22" opacity="0.3" strokeDasharray="2 2" />
    {/* First user avatar silhouette */}
    <circle cx="11" cy="16" r="2.5" opacity="0.95" />
    <path d="M6 24.5c0-1.8 1.5-2.5 5-2.5s5 .7 5 2.5" opacity="0.95" />

    {/* Second user avatar silhouette */}
    <circle cx="25" cy="16" r="2.5" opacity="0.6" />
    <path d="M20 24.5c0-1.8 1.5-2.5 5-2.5s5 .7 5 2.5" opacity="0.6" />

    {/* Recording status dot */}
    <circle
      cx="11"
      cy="11.5"
      r="1"
      fill="#f43f5e"
      stroke="none"
      className="animate-pulse"
    />
  </svg>
);

const TrackIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 48 48"
    width="1em"
    height="1em"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    role="img"
    aria-label="Project deadline tracking icon"
    {...props}
  >
    <title>Tracking</title>
    {/* Kanban / Sprint timeline board wrapper */}
    <rect
      x="4"
      y="4"
      width="40"
      height="40"
      rx="6"
      strokeWidth="1.5"
      opacity="0.9"
    />

    {/* Column separators */}
    <path d="M17 4v40" opacity="0.2" />
    <path d="M31 4v40" opacity="0.2" />

    {/* Modern, gorgeous minimal sprint cards with task checklist */}
    {/* Column 1 Card (To Do) */}
    <rect
      x="8"
      y="10"
      width="6"
      height="8"
      rx="1.5"
      fill="currentColor"
      fillOpacity="0.1"
      strokeWidth="1"
    />
    <line x1="10" y1="14" x2="12" y2="14" strokeWidth="1" opacity="0.5" />

    {/* Column 2 Cards (In Progress) */}
    <rect
      x="21"
      y="16"
      width="6"
      height="12"
      rx="1.5"
      fill="currentColor"
      fillOpacity="0.1"
      strokeWidth="1.2"
    />
    <line x1="23" y1="20" x2="25" y2="20" strokeWidth="1" opacity="0.8" />
    <line x1="23" y1="24" x2="25" y2="24" strokeWidth="1" opacity="0.5" />

    {/* Column 3 Card (Done) */}
    <rect
      x="34"
      y="24"
      width="6"
      height="8"
      rx="1.5"
      fill="currentColor"
      fillOpacity="0.1"
      strokeWidth="1"
    />
    {/* Checked icon inside done column */}
    <path d="M36.2 28.2l.6.6 1.2-1.2" strokeWidth="1" stroke="currentColor" />

    {/* Elegant connecting line showing workflow progress */}
    <path
      d="M14 14h7v8h6v6h7"
      strokeWidth="1"
      strokeDasharray="2 2"
      opacity="0.8"
    />
  </svg>
);
