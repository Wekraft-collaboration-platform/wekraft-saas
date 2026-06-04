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
    name: "Guy Hawkins",
    handle: "@leslie",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80",
    text: "Simply the best. Better than all the rest. I'd recommend this product to beginners and advanced users. #webflow_development",
    tags: ["#webflow_development"],
  },
  {
    name: "Eleanor Pena",
    handle: "@eleanor",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80",
    text: "The speed is absolutely incredible. Moving from Jira to Wekraft felt like upgrading from a tricycle to a rocket ship. The Git integration just works flawlessly.",
    tags: ["#dev", "#tools"],
  },
  {
    name: "Alex Rivera",
    handle: "@arivera",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80",
    text: "It's quicker with the customer, the customer is more ensured of getting exactly what they ordered, and I'm all for the efficiency.",
    tags: ["#dev", "#tools"],
  },
  {
    name: "Jane Cooper",
    handle: "@jane_c",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&h=150&q=80",
    text: "Tested by senior devs and early testers. The Git branch auto-sync is hands-down the best feature. We save hours of manual status updates every single sprint.",
    tags: ["#git", "#productivity"],
  },
];

const column2: Testimonial[] = [
  {
    name: "Courtney Henry",
    handle: "@courtney",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150&q=80",
    text: "This is a top quality product. No need to think twice before making it live on web.",
    tags: ["#quality", "#web"],
  },
  {
    name: "Dianne Russell",
    handle: "@dianne_r",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&h=150&q=80",
    text: "Finally, I've found a service that covers all bases for a bootstrap startup. The UI is clean, interactions are fast, and their customer support is super responsive.",
    tags: ["#startup", "#launch"],
  },
  {
    name: "Albert Flores",
    handle: "@albert_f",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80",
    text: "Simply the best execution loop. Planning, grooming, and follow-up work collapse into one calm loop. Recommended to all senior engineers.",
    tags: ["#engineering", "#scrum"],
  },
  {
    name: "Leslie Alexander",
    handle: "@leslie_alex",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80",
    text: "Our team shipped 2.4x faster in our first month. The context stays attached to the codebase, so new joiners get up to speed in minutes.",
    tags: ["#velocity", "#dev"],
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
              className="text-xs font-semibold text-blue-400 hover:underline cursor-pointer"
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
    <section className="bg-black py-20 px-4 md:px-8 font-sans overflow-hidden">
      <motion.div
        ref={containerRef}
        initial={{ opacity: 0, y: 40 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
        transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="max-w-7xl mx-auto "
      >
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-12 lg:gap-16 items-center">

          {/* Left Column: Heading & Stats */}
          <div className="flex flex-col text-left">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-4">
              TESTIMONIALS
            </span>
            <h2 className="text-4xl md:text-5xl lg:text-[54px] font-bold tracking-tight text-white leading-[1.1] mb-6">
              Don't just take our word for it.
            </h2>
            <p className="text-neutral-300 text-lg md:text-xl font-medium mb-5 max-w-xl leading-snug">
              Tested by senior devs and early testers.
            </p>
            <p className="text-neutral-400 text-sm md:text-base leading-relaxed mb-12 md:mb-16 max-w-md">
              We've built Wekraft to enable clean, lightning-fast cycles. Here is how teams and developers are scaling their workflow without tracking overhead.
            </p>

            {/* Bottom Stats */}
            <div className="grid grid-cols-2 gap-8 pt-8 border-t border-white/[0.08] max-w-sm mt-auto">
              <div>
                <span className="block text-4xl md:text-5xl font-extrabold text-white tracking-tight">
                  52+
                </span>
                <span className="block text-[11px] font-bold tracking-wider text-neutral-500 uppercase mt-2">
                  Early Testers
                </span>
              </div>
              <div>
                <span className="block text-4xl md:text-5xl font-extrabold text-white tracking-tight">
                  2M+
                </span>
                <span className="block text-[11px] font-bold tracking-wider text-neutral-500 uppercase mt-2">
                  Tasks Shipped
                </span>
              </div>
            </div>
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
