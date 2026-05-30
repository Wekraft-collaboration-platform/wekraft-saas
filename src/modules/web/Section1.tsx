"use client";

import React, { useState } from "react";
import AIChatSimulation from "./AIChatSimulation";
import { StripedPattern } from "@/components/magicui/striped-pattern";
import { FlickeringGrid } from "@/components/ui/flickering-grid";
import { HexagonPattern } from "@/components/ui/hexagon-pattern";
import NotificationCenter from "@/components/forgeui/notification-center";
import VaultLock from "@/components/forgeui/vault-lock";
import FrameworkAgnostic from "@/components/forgeui/framework-agnostic";

const Section1 = () => {
  const [isHovered2, setIsHovered2] = useState(false);
  const [isHovered3, setIsHovered3] = useState(false);
  return (
    <section id="section1" className="bg-black py-24 px-6 md:px-12 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="border border-b-0 border-white/10 rounded-t-xl overflow-hidden bg-neutral-950 ">
          {/* Main Heading Section */}
          <div className="p-12 md:p-12 text-center border-b border-white/10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-500/20 backdrop-blur-md bg-blue-500/5 shadow-[0_0_20px_rgba(59,130,246,0.1)] mb-8">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)] animate-pulse" />
              <span className="text-sm  text-blue-200 tracking-wide">
                Purpose-built for engineering teams
              </span>
            </div>

            <h2 className="text-5xl font-semibold tracking-tight mb-6 leading-tight max-w-4xl mx-auto">
              <span className="text-white">Built for speed.</span> <br />
              <span className="text-neutral-400">
                Designed for simplicity.
              </span>
            </h2>

            <p className="text-neutral-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
              The cleanest way to manage ambitious projects. WeKraft combines
              intelligent PM with real-time collaboration.
            </p>
          </div>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Element 1 */}
            <div className="relative overflow-hidden border-b md:border-b md:border-r border-white/10 group hover:bg-white/[0.01] transition-colors duration-500 min-h-[500px] flex flex-col items-stretch justify-between">
              {/* Background Pattern */}
              <StripedPattern
                className="absolute inset-y-0 left-8 right-8 opacity-25 text-white/40 [mask-image:radial-gradient(ellipse_at_center,white,transparent)"
                width={20}
                height={20}
              />

              {/* Side Decorations */}
              <div className="absolute inset-y-0 left-0 w-8 border-r border-white/10 bg-neutral-900 z-20" />
              <div className="absolute inset-y-0 right-0 w-8 border-l border-white/10 bg-neutral-950 z-20" />

              {/* Content Container */}
              <div className="px-12 md:px-20 py-12 flex-1 flex flex-col justify-between relative z-10">
                <div className="w-full flex items-center justify-center scale-100">
                  <AIChatSimulation />
                </div>
                <div className="mt-12">
                  <h3 className="text-white text-xl font-semibold mb-2">
                    Meet your PM-Agent KAYA
                  </h3>
                  <p className="text-neutral-500 text-sm leading-relaxed max-w-md">
                    Experience real-time assistance. Ask your AI Agent to
                    coordinate tasks, answer questions, and maintain team
                    alignment.
                  </p>
                </div>
              </div>

              {/* Ticks/Markers */}
              <div className="absolute top-0 left-8 w-px h-5 bg-white/40" />
              <div className="absolute top-0 right-8 w-px h-5 bg-white/40" />
              <div className="absolute bottom-0 left-8 w-px h-5 bg-white/40" />
              <div className="absolute bottom-0 right-8 w-px h-5 bg-white/40" />
            </div>

            {/* Element 2 */}
            <div
              onMouseEnter={() => setIsHovered2(true)}
              onMouseLeave={() => setIsHovered2(false)}
              className="relative overflow-hidden border-b border-white/10 group hover:bg-white/[0.01] transition-colors duration-500 min-h-[500px] flex items-center justify-center"
            >
              <FlickeringGrid
                className="absolute inset-y-0 left-8 right-8 z-0 [mask-image:radial-gradient(ellipse_at_center,white,transparent)]"
                squareSize={3}
                gridGap={6}
                color="#F4F4F6"
                maxOpacity={0.3}
                flickerChance={0.1}
              />

              {/* Side Decorations */}
              <div className="absolute inset-y-0 left-0 w-8 border-r border-white/10 bg-neutral-950 z-20" />
              <div className="absolute inset-y-0 right-0 w-8 border-l border-white/10 bg-neutral-900 z-20" />

              <div className="w-full px-12 md:px-20 relative z-10 flex items-center justify-center scale-100">
                <NotificationCenter
                  isHovered={isHovered2}
                  cardTitle="Real-time project health"
                  cardDescription="Get instant updates from Kaya about deadlines, delays, and critical sprint updates."
                  notificationTitle="Kaya PM"
                  notificationDescription="Deadline Alert: Sprint 4 is at risk of a 2-day delay."
                  notificationTime="Just now"
                />
              </div>

              {/* Ticks/Markers */}
              <div className="absolute top-0 left-8 w-px h-5 bg-white/40" />
              <div className="absolute top-0 right-8 w-px h-5 bg-white/40" />
              <div className="absolute bottom-0 left-8 w-px h-5 bg-white/40" />
              <div className="absolute bottom-0 right-8 w-px h-5 bg-white/40" />
            </div>

            {/* Element 3 */}
            <div
              onMouseEnter={() => setIsHovered3(true)}
              onMouseLeave={() => setIsHovered3(false)}
              className="relative overflow-hidden border-b md:border-b-0 md:border-r border-white/10 group hover:bg-white/[0.01] transition-colors duration-500 min-h-[500px] flex items-center justify-center"
            >
              <FlickeringGrid
                className="absolute inset-y-0 left-8 right-8 z-0 [mask-image:radial-gradient(ellipse_at_center,white,transparent)]"
                squareSize={3}
                gridGap={6}
                color="#F4F4F6"
                maxOpacity={0.25}
                flickerChance={0.1}
              />

              {/* Side Decorations */}
              <div className="absolute inset-y-0 left-0 w-8 border-r border-white/10 bg-neutral-900 z-20" />
              <div className="absolute inset-y-0 right-0 w-8 border-l border-white/10 bg-neutral-950 z-20" />

              <div className="w-full px-12 md:px-20 relative z-10 flex items-center justify-center scale-100">
                <VaultLock
                  isHovered={isHovered3}
                  cardTitle="Vault Access"
                  cardDescription="Smooth and secure login experience, backed by encrypted access and seamless visual transitions"
                />
              </div>
              {/* Ticks/Markers */}
              <div className="absolute top-0 left-8 w-px h-5 bg-white/40" />
              <div className="absolute top-0 right-8 w-px h-5 bg-white/40" />
              <div className="absolute bottom-0 left-8 w-px h-5 bg-white/40" />
              <div className="absolute bottom-0 right-8 w-px h-5 bg-white/40" />
            </div>

            {/* Element 4 */}
            <div className="relative overflow-hidden group hover:bg-white/[0.01] transition-colors duration-500 min-h-[500px] flex items-center justify-center">
              <FlickeringGrid
                className="absolute inset-y-0 left-8 right-8 z-0 [mask-image:radial-gradient(ellipse_at_center,white,transparent)]"
                squareSize={3}
                gridGap={10}
                color="#F4F4F6"
                maxOpacity={0.3}
                flickerChance={0.05}
              />

              {/* Side Decorations */}
              <div className="absolute inset-y-0 left-0 w-8 border-r border-white/10 bg-neutral-950 z-20" />
              <div className="absolute inset-y-0 right-0 w-8 border-l  border-white/10 bg-neutral-900 z-20" />

              <div className="text-center relative z-10 px-12 md:px-20">
                <FrameworkAgnostic
                  cardTitle="All In one Place"
                  cardDescription="Channels to communicateand share/ Meet with stakeholders and Track project deadline in most simples way possible."
                />
              </div>
              {/* Ticks/Markers */}
              <div className="absolute top-0 left-8 w-px h-5 bg-white/40" />
              <div className="absolute top-0 right-8 w-px h-5 bg-white/40" />
              <div className="absolute bottom-0 left-8 w-px h-5 bg-white/40" />
              <div className="absolute bottom-0 right-8 w-px h-5 bg-white/40" />
            </div>
          </div>
        </div>
        {/* FOUNDER THOUGHT */}
        <div className="relative border border-white/10 border-t-0 rounded-b-2xl bg-neutral-900 p-16 flex flex-col items-center text-center overflow-hidden">
          <p className="relative z-10 text-white/90 text-2xl ` font-medium max-w-3xl mb-12 leading-relaxed tracking-tight">
            "Wekraft transformed the way our team executes projects. What once
            felt chaotic is now automated, and AI-driven — helping us move
            faster, and ship without missing deadlines."
          </p>

          <div className="relative z-10 flex  gap-4">
            <img
              src="/me3.jpg"
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
