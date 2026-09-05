"use client";

import Image from "next/image";
import { useState } from "react";
import NotificationCenter from "@/components/forgeui/notification-center";
import { FlickeringGrid } from "@/components/ui/flickering-grid";
import AIChatSimulation from "./AIChatSimulation";
import { AnimatedListDemo } from "./NotificationList";
import { ProjectProgressChart } from "./ProjectProgressChart";

const Section1 = () => {
  const [isHovered2, setIsHovered2] = useState(false);
  const [_isHovered3, setIsHovered3] = useState(false);
  return (
    <section id="section1" className="bg-black py-12 px-4 md:py-24 md:px-12 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="border-t border-white/10 md:border md:border-b-0 rounded-t-xl overflow-hidden bg-neutral-950 ">
          {/* Main Heading Section */}
          <div className="py-8 px-4 md:p-12 text-center border-b border-white/10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/20 backdrop-blur-md bg-muted/10 shadow-[0_0_20px_rgba(59,130,246,0.1)] mb-6 md:mb-8">
              <div className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(96,165,250,0.8)] " />
              <span className="text-sm  text-neutral-200 tracking-wide">
                Purpose-built for engineering teams
              </span>
            </div>

            <h2 className="text-[26px] sm:text-3xl md:text-4xl font-semibold tracking-tight mb-6 leading-tight max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-x-2.5 gap-y-2">
              <span className="text-white">Why Teams</span>
              <span className="inline-flex items-center -space-x-3.5 mx-1">
                <span className="relative w-9 h-9 rounded-full border-2 border-black overflow-hidden bg-neutral-800 shrink-0 transition-transform duration-300 hover:scale-110 hover:z-10 cursor-pointer">
                  <Image
                    src="/riteshdp2.jpg"
                    alt="Team member 1"
                    fill
                    sizes="36px"
                    className="object-cover"
                  />
                </span>
                <span className="relative w-9 h-9 rounded-full border-2 border-black overflow-hidden bg-neutral-800 shrink-0 transition-transform duration-300 hover:scale-110 hover:z-10 cursor-pointer">
                  <Image
                    src="/bhanudp1.jpg"
                    alt="Bhanu"
                    fill
                    sizes="36px"
                    className="object-cover"
                  />
                </span>
                <span className="relative w-9 h-9 rounded-full border-2 border-black overflow-hidden bg-neutral-800 shrink-0 transition-transform duration-300 hover:scale-110 hover:z-10 cursor-pointer">
                  <Image
                    src="/roxdp.jpg"
                    alt="Team member 3"
                    fill
                    sizes="36px"
                    className="object-cover"
                  />
                </span>
                <span className="relative w-9 h-9 rounded-full border-2 border-black overflow-hidden bg-neutral-800 shrink-0 transition-transform duration-300 hover:scale-110 hover:z-10 cursor-pointer">
                  <Image
                    src="/sahildp.jpeg"
                    alt="Sahil"
                    fill
                    sizes="36px"
                    className="object-cover"
                  />
                </span>
              </span>
              <span className="text-white">Prefer WeKraft over others</span>
            </h2>

            <p className="text-neutral-400 text-sm sm:text-base md:text-lg max-w-xl mx-auto leading-relaxed">
              The cleanest way to manage ambitious projects. WeKraft combines
              intelligent PM with real-time collaboration.
            </p>
          </div>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Element 1 */}
            <div className="relative overflow-hidden border-b md:border-b md:border-r border-white/10 group hover:bg-white/[0.01] transition-colors duration-500 min-h-[450px] md:min-h-[500px] flex flex-col items-stretch justify-between">
              {/* Background Pattern */}
              <FlickeringGrid
                className="absolute inset-y-0 left-8 right-8 z-0 [mask-image:radial-gradient(ellipse_at_center,white,transparent)]"
                squareSize={3}
                gridGap={6}
                color="#F4F4F6"
                maxOpacity={0.1}
                flickerChance={0.1}
              />
              {/* Side Decorations */}
              <div className="hidden md:block absolute inset-y-0 left-0 w-8 border-r border-white/10 bg-neutral-900 z-20" />
              <div className="hidden md:block absolute inset-y-0 right-0 w-8 border-l border-white/10 bg-neutral-950 z-20" />

              {/* Content Container */}
              <div className="px-4 py-8 md:px-20 md:py-12 flex-1 flex flex-col justify-between relative z-10">
                <div className="w-full flex items-center justify-center scale-100">
                  <AIChatSimulation />
                </div>
                <div className="mt-8 md:mt-12">
                  <h3 className="text-white text-lg md:text-xl font-semibold mb-2">
                    Meet your PM-Agent KAYA
                  </h3>
                  <p className="text-neutral-500 text-xs md:text-sm leading-relaxed max-w-md">
                    Experience real-time assistance. Ask your AI Agent to
                    coordinate tasks, answer questions, and maintain team
                    alignment.
                  </p>
                </div>
              </div>

              {/* Ticks/Markers */}
              <div className="hidden md:block absolute top-0 left-8 w-px h-5 bg-white/40" />
              <div className="hidden md:block absolute top-0 right-8 w-px h-5 bg-white/40" />
              <div className="hidden md:block absolute bottom-0 left-8 w-px h-5 bg-white/40" />
              <div className="hidden md:block absolute bottom-0 right-8 w-px h-5 bg-white/40" />
            </div>

            {/* Element 2 */}
            <div
              onMouseEnter={() => setIsHovered2(true)}
              onMouseLeave={() => setIsHovered2(false)}
              className="relative overflow-hidden border-b border-white/10 group hover:bg-white/[0.01] transition-colors duration-500 min-h-[450px] md:min-h-[500px] flex items-center justify-center"
            >
              <FlickeringGrid
                className="absolute inset-y-0 left-8 right-8 z-0 [mask-image:radial-gradient(ellipse_at_center,white,transparent)]"
                squareSize={3}
                gridGap={6}
                color="#F4F4F6"
                maxOpacity={0.1}
                flickerChance={0.1}
              />

              {/* Side Decorations */}
              <div className="hidden md:block absolute inset-y-0 left-0 w-8 border-r border-white/10 bg-neutral-950 z-20" />
              <div className="hidden md:block absolute inset-y-0 right-0 w-8 border-l border-white/10 bg-neutral-900 z-20" />

              <div className="w-full px-4 md:px-20 relative z-10 flex items-center justify-center scale-100">
                <NotificationCenter
                  isHovered={isHovered2}
                  cardTitle="Real-time project health"
                  cardDescription="Get instant updates from Kaya about deadlines, delays, and critical sprint updates."
                  notificationTitle="Kaya PM"
                  notificationDescription="Sprint 4 is at risk of delay."
                  notificationTime="Just now"
                />
              </div>

              {/* Ticks/Markers */}
              <div className="hidden md:block absolute top-0 left-8 w-px h-5 bg-white/40" />
              <div className="hidden md:block absolute top-0 right-8 w-px h-5 bg-white/40" />
              <div className="hidden md:block absolute bottom-0 left-8 w-px h-5 bg-white/40" />
              <div className="hidden md:block absolute bottom-0 right-8 w-px h-5 bg-white/40" />
            </div>

            {/* Element 3 */}
            <div
              onMouseEnter={() => setIsHovered3(true)}
              onMouseLeave={() => setIsHovered3(false)}
              className="relative overflow-hidden border-b md:border-b-0 md:border-r border-white/10 group hover:bg-white/[0.01] transition-colors duration-500 min-h-[450px] md:min-h-[500px] flex flex-col items-stretch justify-between"
            >
              <FlickeringGrid
                className="absolute inset-y-0 left-8 right-8 z-0 [mask-image:radial-gradient(ellipse_at_center,white,transparent)]"
                squareSize={3}
                gridGap={6}
                color="#F4F4F6"
                maxOpacity={0.1}
                flickerChance={0.1}
              />

              {/* Side Decorations */}
              <div className="hidden md:block absolute inset-y-0 left-0 w-8 border-r border-white/10 bg-neutral-900 z-20" />
              <div className="hidden md:block absolute inset-y-0 right-0 w-8 border-l border-white/10 bg-neutral-950 z-20" />

              {/* Content Container */}
              <div className="px-4 py-8 md:px-20 md:py-12 flex-1 flex flex-col justify-between relative z-10 w-full">
                <div className="w-full flex items-center justify-center">
                  <AnimatedListDemo className="h-[320px] w-full" />
                </div>
                <div className="mt-6 md:mt-8">
                  <h3 className="text-white text-lg md:text-xl font-semibold mb-2">
                    Live Collaboration Feed
                  </h3>
                  <p className="text-neutral-500 text-xs md:text-sm leading-relaxed max-w-md">
                    Stay synced on team activity. Get instant updates on
                    messages, status completions, and automatic system upgrades.
                  </p>
                </div>
              </div>

              {/* Ticks/Markers */}
              <div className="hidden md:block absolute top-0 left-8 w-px h-5 bg-white/40" />
              <div className="hidden md:block absolute top-0 right-8 w-px h-5 bg-white/40" />
              <div className="hidden md:block absolute bottom-0 left-8 w-px h-5 bg-white/40" />
              <div className="hidden md:block absolute bottom-0 right-8 w-px h-5 bg-white/40" />
            </div>

            {/* Element 4 */}
            <div className="relative overflow-hidden group hover:bg-white/[0.01] transition-colors duration-500 min-h-[450px] md:min-h-[500px] flex flex-col items-stretch justify-between">
              <FlickeringGrid
                className="absolute inset-y-0 left-8 right-8 z-0 [mask-image:radial-gradient(ellipse_at_center,white,transparent)]"
                squareSize={3}
                gridGap={6}
                color="#F4F4F6"
                maxOpacity={0.1}
                flickerChance={0.1}
              />

              {/* Side Decorations */}
              <div className="hidden md:block absolute inset-y-0 left-0 w-8 border-r border-white/10 bg-neutral-950 z-20" />
              <div className="hidden md:block absolute inset-y-0 right-0 w-8 border-l border-white/10 bg-neutral-900 z-20" />

              {/* Content Container */}
              <div className="px-4 py-8 md:px-14 md:py-12 flex-1 flex flex-col justify-between relative z-10 w-full">
                <div className="w-full flex items-center justify-center">
                  <ProjectProgressChart />
                </div>
                <div className="mt-6 md:mt-8">
                  <h3 className="text-white text-lg md:text-xl font-semibold mb-2">
                    Track Progress in Real Time
                  </h3>
                  <p className="text-neutral-500 text-xs md:text-sm leading-relaxed max-w-md">
                    Watch your team's velocity grow sprint-over-sprint. Live
                    charts update as tasks are completed and milestones are hit.
                  </p>
                </div>
              </div>

              {/* Ticks/Markers */}
              <div className="hidden md:block absolute top-0 left-8 w-px h-5 bg-white/40" />
              <div className="hidden md:block absolute top-0 right-8 w-px h-5 bg-white/40" />
              <div className="hidden md:block absolute bottom-0 left-8 w-px h-5 bg-white/40" />
              <div className="hidden md:block absolute bottom-0 right-8 w-px h-5 bg-white/40" />
            </div>
          </div>
        </div>
        {/* FOUNDER THOUGHT */}
        <div className="relative border-b border-white/10 md:border md:border-t-0 rounded-b-2xl bg-neutral-900 py-10 px-6 md:p-16 flex flex-col items-center text-center overflow-hidden">
          <p className="relative z-10 text-white/90 text-lg sm:text-xl md:text-2xl font-medium max-w-3xl mb-6 md:mb-12 leading-relaxed tracking-tight">
            "WeKraft transformed the way our team executes projects. What once
            felt chaotic is now automated, and AI-driven — helping us move
            faster, and ship without missing deadlines."
          </p>

          <div className="relative z-10 flex  gap-4">
            <img
              src="/roxdp.jpg"
              alt="rox"
              className="w-14 h-14 rounded-full object-cover border border-white/20"
            />

            <div className="text-left">
              <h4 className="text-white font-bold text-lg tracking-tight">
                rox
              </h4>
              <p className="text-primary text-sm font-medium">
                founder of vrsa analytics
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Section1;
