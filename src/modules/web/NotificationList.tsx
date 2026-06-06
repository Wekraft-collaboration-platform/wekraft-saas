"use client";

import React from "react";
import { AnimatedList } from "@/components/ui/animated-list";
import { cn } from "@/lib/utils";
import { Bot, Clover, Zap } from "lucide-react";

interface Item {
    name: string;
    description: string;
    avatar?: string;
    icon?: React.ComponentType<{ className?: string }>;
    color?: string;
    time: string;
    hasButton?: boolean;
    buttonText?: string;
}

const notifications: Item[] = [
    {
        name: "Bhanu (Teamspace)",
        description: "@rox -> i have added new reported bugs from client",
        time: "Just now",
        avatar: "/bhanudp1.jpg",
        hasButton: true,
        buttonText: "View Bugs",
    },
    {
        name: "Rox (AI SAAS)",
        description: "Rox accepted your joining request in project AI SAAS.",
        time: "10m ago",
        avatar: "/roxdp.jpg",
    },
    {
        name: "Kaya PM Agent",
        description: "Alert - project duration is about to end...",
        time: "25m ago",
        avatar: "/kaya.svg",
    },
    {
        name: "Ritesh (Team Meet)",
        description: "Ritesh has started team meet, join now • ID: rite67-yduj",
        time: "40m ago",
        avatar: "/riteshdp2.jpg",
        hasButton: true,
        buttonText: "Join Meet",
    },
    {
        name: "Plan Upgradation",
        description: "You have successfully upgraded to Pro plan >",
        time: "1h ago",
        avatar: "/logo.svg",
    },
];

// Repeat to fill list for animation scrolling
const repeatedNotifications = Array.from({ length: 4 }, () => notifications).flat();

const Notification = ({
    name,
    description,
    avatar,
    icon: IconComponent,
    color,
    time,
    hasButton,
    buttonText,
}: Item) => {
    return (
        <figure
            className={cn(
                "relative mx-auto min-h-fit w-full max-w-[400px] cursor-pointer overflow-hidden rounded-xl p-4",
                "transition-all duration-300 ease-out hover:scale-[102%]",
                "bg-neutral-800 border border-white/5 backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.5)]"
            )}
        >
            <div className="flex flex-row items-start gap-3">
                {avatar ? (
                    <div className={cn(
                        "relative w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-white/10 bg-neutral-800 shadow-md",
                        (avatar.endsWith(".svg") && avatar !== "/logo.svg") && "p-2"
                    )}>
                        <img 
                            src={avatar} 
                            alt={name} 
                            className={cn(
                                "w-full h-full",
                                (avatar.endsWith(".svg") && avatar !== "/logo.svg") ? "object-contain" : "object-cover"
                            )} 
                        />
                    </div>
                ) : (
                    <div
                        className="flex size-10 shrink-0 items-center justify-center rounded-xl text-white shadow-md"
                        style={{
                            backgroundColor: color,
                        }}
                    >
                        {IconComponent && <IconComponent className="w-5 h-5" />}
                    </div>
                )}
                <div className="flex flex-col flex-1 overflow-hidden">
                    <figcaption className="flex flex-row items-center justify-between text-base font-medium whitespace-pre text-white">
                        <span className="text-sm font-semibold tracking-tight">{name}</span>
                        <span className="text-[10px] text-neutral-500 font-normal">{time}</span>
                    </figcaption>
                    <p className="text-xs font-normal text-neutral-400 mt-1.5 leading-snug">
                        {description}
                    </p>
                    {hasButton && (
                        <div className="mt-2 flex">
                            <button className="px-3 py-1 text-[10px] font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 rounded-md transition-all shadow-[0_2px_8px_rgba(37,99,235,0.3)]">
                                {buttonText || "View"}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </figure>
    );
};

export function AnimatedListDemo({
    className,
}: {
    className?: string;
}) {
    return (
        <div
            className={cn(
                "relative flex h-[340px] w-full flex-col overflow-hidden p-2",
                className
            )}
        >
            <AnimatedList delay={2500}>
                {repeatedNotifications.map((item, idx) => (
                    <Notification {...item} key={idx} />
                ))}
            </AnimatedList>

            {/* Elegant dark mode fading layers */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-neutral-950 via-neutral-950/40 to-transparent z-10"></div>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-neutral-950 via-neutral-950/80 to-transparent z-10"></div>
        </div>
    );
}
