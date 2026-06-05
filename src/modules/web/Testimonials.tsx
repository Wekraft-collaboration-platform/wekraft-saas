"use client";

import { motion, useInView } from "framer-motion";
import Image from "next/image";
import { useRef } from "react";

interface Testimonial {
  name: string;
  handle: string;
  avatar: string;
  text: string;
  tags: string[];
}

const column1: Testimonial[] = [
  {
    name: "Akash Singh",
    handle: "@nniceguy0",
    avatar: "/akash.jpg",
    text: "The platform has a clean interface, modern design, and promising project management workflow. Improving session handling and access-state detection would further enhance usability and create a more seamless user experience.",
    tags: ["#dx", "#pm"],
  },
  {
    name: "Palak Sharma",
    handle: "@palaksharma_",
    avatar: "/palakdp.jpg",
    text: "The dashboard is beautiful and extremely fast. Integrating time-tracking directly with git branches is absolute genius. After using this, going back to Jira would feel like a chore. Wekraft is where we are staying.",
    tags: ["#git", "#speed"],
  },
  {
    name: "Ishaan Verma",
    handle: "@ishaan.v_",
    avatar: "/testuser.jpg",
    text: "A beautifully polished dev workspace. The GitHub issue sync is near real-time and works without any friction. Grateful for the automation features Kaya provides for tracking PR blocker risks.",
    tags: ["#sync", "#automation"],
  },
  {
    name: "Shubham Choudhary",
    handle: "@_shubham_18",
    avatar: "/shubhamdp.jpg",
    text: "The task view switching feels extremely robust. Kanban drag-and-drop is highly responsive. I had a few workspace invite bugs early on, but the core developer cycle is so cohesive I can't imagine migrating back to our old tool.",
    tags: ["#dx", "#kanban"],
  },
];

const column2: Testimonial[] = [
  {
    name: "Siddharth Mehta",
    handle: "@siddharth.m",
    avatar: "/testuser2.jpeg",
    text: "Managing engineering tasks directly connected to our repos is a game changer. It saves us so much status-update overhead that the whole team agreed we can never switch back. Wekraft keeps us in our flow.",
    tags: ["#scrum", "#dx"],
  },
  {
    name: "Rakesh Sinha",
    handle: "@iamrakesh",
    avatar: "/testuser3.jpeg",
    text: "Love the Slack-style team channels combined with project management. Lightweight and keeps the team focused. Once auth session persistence is refined, the communication loop here will be top-tier.",
    tags: ["#chat", "#auth"],
  },
  {
    name: "Kabir Sen",
    handle: "@kabirsen99",
    avatar: "/testuser4.png",
    text: "Kaya PM summaries are a great way to start the morning. It keeps the whole team aligned on priorities without annoying standup meetings. The roadmap visualization is very promising.",
    tags: ["#kaya", "#meetings"],
  },
];

const TestimonialCard = ({ item }: { item: Testimonial }) => {
  return (
    <div className="bg-[#121316] p-6 rounded-2xl border border-white/[0.04] shadow-[0_1px_3px_rgba(0,0,0,0.3),0_10px_24px_-10px_rgba(0,0,0,0.5)] flex flex-col gap-4 text-left transition-all duration-300 hover:shadow-[0_12px_32px_-8px_rgba(0,0,0,0.8)] hover:scale-[1.01] hover:border-white/[0.08]">
      <div className="flex items-center gap-3">
        <div className="relative w-10 h-10 rounded-full overflow-hidden bg-neutral-800 flex-shrink-0">
          <Image
            src={item.avatar}
            alt={item.name}
            fill
            sizes="40px"
            className="object-cover"
            priority={false}
          />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-white leading-tight">
            {item.name}
          </h4>
          <span className="text-xs text-neutral-500 font-medium leading-none">
            {item.handle}
          </span>
        </div>
      </div>
      <p className="text-[13px] leading-relaxed text-neutral-300 font-normal">
        {item.text}
      </p>
      {item.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-1">
          {item.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs font-semibold text-neutral-500 hover:text-neutral-300 transition-colors duration-200 cursor-pointer"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

const Testimonials = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-80px 0px" });

  return (
    <section className="bg-black py-20 px-4 md:px-8 font-sans overflow-hidden min-h-screen flex items-center justify-center w-full">
      <motion.div
        ref={containerRef}
        initial={{ opacity: 0, y: 40 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
        transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="max-w-7xl mx-auto w-full"
      >
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-12 lg:gap-16 items-center">

          {/* Left Column: Heading & Sub-copy */}
          <div className="flex flex-col text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/10 bg-neutral-900/50 backdrop-blur-sm mb-6 self-start">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
              <span className="text-[13px] font-medium text-white tracking-wide">
                Testimonials
              </span>
            </div>
            
            <h2 className="text-4xl md:text-5xl lg:text-[54px] font-bold tracking-tight text-white leading-[1.1] mb-6">
              Designed for flow.<br />
              Loved by creators.
            </h2>
            <p className="text-neutral-300 text-lg md:text-xl font-medium mb-5 max-w-xl leading-snug">
              Why fast-moving engineering teams are migrating to Wekraft.
            </p>
            <p className="text-neutral-400 text-sm md:text-base leading-relaxed mb-8 max-w-md">
              From real-time issue sync to git-integrated time tracking and autonomous AI agents. See how software creators are shipping faster and staying focused.
            </p>
          </div>

          {/* Right Column: Vertically Scrolling Columns */}
          <div className="relative h-[550px] overflow-hidden rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Top and Bottom Fading Gradient Masks */}
            <div className="absolute top-0 left-0 right-0 h-20 bg-linear-to-b from-[#0a0a0b] to-transparent z-10 pointer-events-none" />
            <div className="absolute bottom-0 left-0 right-0 h-20 bg-linear-to-t from-[#0a0a0b] to-transparent z-10 pointer-events-none" />

            {/* Column 1 (Scrolls Upward) */}
            <div className="relative h-full overflow-hidden">
              <div className="animate-marquee-up flex flex-col gap-4">
                {/* biome-ignore lint/suspicious/noArrayIndexKey: duplicated list for infinite marquee */}
                {[...column1, ...column1].map((item, i) => (
                  <TestimonialCard key={`col1-${i}`} item={item} />
                ))}
              </div>
            </div>

            {/* Column 2 (Scrolls Downward) */}
            <div className="relative h-full overflow-hidden hidden md:block">
              <div className="animate-marquee-down flex flex-col gap-4">
                {/* biome-ignore lint/suspicious/noArrayIndexKey: duplicated list for infinite marquee */}
                {[...column2, ...column2].map((item, i) => (
                  <TestimonialCard key={`col2-${i}`} item={item} />
                ))}
              </div>
            </div>

          </div>

        </div>
      </motion.div>
    </section>
  );
};

export default Testimonials;
