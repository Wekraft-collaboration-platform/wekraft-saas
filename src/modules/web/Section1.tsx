"use client";

import AIChatSimulation from "./AIChatSimulation";
import { StripedPattern } from "@/components/magicui/striped-pattern";
import { FlickeringGrid } from "@/components/ui/flickering-grid";
import { HexagonPattern } from "@/components/ui/hexagon-pattern";

const Section1 = () => {
  return (
    <section id="section1" className="bg-black py-24 px-6 md:px-12 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="border border-white/10 rounded-xl overflow-hidden bg-neutral-950 ">
          {/* Main Heading Section */}
          <div className="p-12 md:p-12 text-center border-b border-white/10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/20 bg-blue-500/5 mb-8">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-[10px] md:text-xs font-medium text-blue-400 uppercase tracking-widest">
                Purpose-built for engineering teams
              </span>
            </div>
            
            <h2 className="text-5xl font-bold tracking-tight mb-8 leading-[1.1] max-w-4xl mx-auto">
              <span className="text-white">Build with clarity.</span> <br />
              <span className="text-neutral-500">Ship with confidence.</span>
            </h2>
            
            <p className="text-neutral-400 text-lg max-w-2xl mx-auto leading-relaxed">
              WeKraft combines intelligent PM, real-time collaboration, and deep 
              Analysis into one unified developer platform.
            </p>
          </div>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Element 1 */}
            <div className="relative overflow-hidden p-12 md:p-16 border-b md:border-b md:border-r border-white/10 group hover:bg-white/2 transition-colors duration-500 min-h-[500px] flex flex-col items-start justify-between">
              <StripedPattern
                className="absolute inset-0 opacity-30 text-white/70 [mask-image:radial-gradient(ellipse_at_center,white,transparent)]"
                width={20}
                height={20}
              />
              <div className="w-full relative z-10">
                <AIChatSimulation />
              </div>
              <div className="mt-8 relative z-10">
                <h3 className="text-white text-xl font-semibold mb-2">Meet your PM-Agent KAYA</h3>
                <p className="text-neutral-500 text-sm leading-relaxed max-w-md">
                  Experience real-time assistance. Ask your AI Agent to coordinate tasks, answer questions, and maintain team alignment.
                </p>
              </div>
            </div>

            {/* Element 2 */}
            <div className="relative overflow-hidden p-12 md:p-16 border-b border-white/10 group hover:bg-white/[0.02] transition-colors duration-500 min-h-[400px] flex items-center justify-center">
               <FlickeringGrid
                className="absolute inset-0 z-0 [mask-image:radial-gradient(ellipse_at_center,white,transparent)]"
                squareSize={4}
                gridGap={6}
                color="#3b82f6"
                maxOpacity={0.20}
                flickerChance={0.1}
              />
               <div className="text-center relative z-10">
                <p className="text-neutral-500 font-mono text-sm uppercase tracking-[0.2em] mb-4">Feature 02</p>
                <p className="text-white/30 text-2xl font-semibold">element-2</p>
              </div>
            </div>

            {/* Element 3 */}
            <div className="relative overflow-hidden p-12 md:p-16 border-b md:border-b-0 md:border-r border-white/10 group hover:bg-white/[0.02] transition-colors duration-500 min-h-[400px] flex items-center justify-center">
              <HexagonPattern
                className="absolute inset-0 opacity-[0.2] text-white/40 [mask-image:radial-gradient(ellipse_at_center,white,transparent)]"
                radius={24}
                gap={4}
              />
              <div className="text-center relative z-10">
                <p className="text-neutral-500 font-mono text-sm uppercase tracking-[0.2em] mb-4">Feature 03</p>
                <p className="text-white/30 text-2xl font-semibold">element-3</p>
              </div>
            </div>

            {/* Element 4 */}
            <div className="relative overflow-hidden p-12 md:p-16 group hover:bg-white/[0.02] transition-colors duration-500 min-h-[400px] flex items-center justify-center">
               <FlickeringGrid
                className="absolute inset-0 z-0 [mask-image:radial-gradient(ellipse_at_center,white,transparent)]"
                squareSize={3}
                gridGap={10}
                color="#60a5fa"
                maxOpacity={0.1}
                flickerChance={0.05}
              />
               <div className="text-center relative z-10">
                <p className="text-neutral-500 font-mono text-sm uppercase tracking-[0.2em] mb-4">Feature 04</p>
                <p className="text-white/30 text-2xl font-semibold">element-4</p>
              </div>
            </div>

            {/* If the user wants more, they can add them. I'll stick to 2 for now as they said grid-cols-2 and hinted at multiple elements */}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Section1;
