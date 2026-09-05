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
    name: "Arjun Kotha",
    handle: "@arjun.kotha_",
    avatar: "/testuser4.png",
    text: "WeKraft feels like a complete workspace for development teams - combining messaging, meetings, task management, GitHub, and a project-aware AI agent in one clean interface. It reduces the need for disconnected tools.",
    tags: ["#workspace", "#dx"],
  },
  {
    name: "Somesh",
    handle: "@someshh_01",
    avatar: "/testuser2.jpeg",
    text: "WeKraft combines a clean dashboard, excellent documentation, and a user-friendly experience. It simplifies project management while maintaining a modern and professional feel. I'm excited to see how it evolves.",
    tags: ["#ux", "#docs"],
  },
  {
    name: "Tanya Garg",
    handle: "@tanya.gargg",
    avatar: "/palakdp.jpg",
    text: "WeKraft offers an innovative AI-powered approach to project management. The platform is intuitive, well-designed, and has the potential to simplify complex workflows for teams. I'm excited to see how it evolves.",
    tags: ["#ai", "#workflow"],
  },
  {
    name: "Apurve Karanwal",
    handle: "@karanwal_apurve",
    avatar: "/testuser3.jpeg",
    text: "WeKraft is an excellent platform, if you do not like platforms like Linear, Jira, or Asana, give WeKraft a chance, you will definitely love it. The UI is just too good, easy to navigate, and very descriptive.",
    tags: ["#ui", "#alternative"],
  },
];

const column2: Testimonial[] = [
  {
    name: "Shaurya Hindocha",
    handle: "@shaurya_17",
    avatar: "/testuser.jpg",
    text: "My overall experience with WeKraft has been very positive. The platform provides a great opportunity to collaborate on projects, connect with like-minded individuals, and gain practical industry exposure.",
    tags: ["#learning", "#community"],
  },
  {
    name: "Akash Singh",
    handle: "@akash.singh_",
    avatar: "/akash.jpg",
    text: "I really like the WeKraft UI. It's clean, modern, and intuitive. It shows strong potential for managing complex projects while reducing manual effort.",
    tags: ["#ui", "#ux"],
  },
  {
    name: "Shubham Choudhary",
    handle: "@_shubham_18",
    avatar: "/shubhamdp.jpg",
    text: "WeKraft is really good and impressive. I liked the modern interface, AI-driven approach to project management, and the way tasks and collaboration are organized in a single workspace.",
    tags: ["#impressive", "#workspace"],
  },
  {
    name: "Animesh Tripathi",
    handle: "@animesh_t_",
    avatar: "/animesh.jpeg",
    text: "The overall experience is good. Connecting planning with the actual codebase is incredibly useful, especially for developers and small teams who want to build faster.",
    tags: ["#devflow", "#codebase"],
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
              Why fast-moving engineering teams are migrating to WeKraft.
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
