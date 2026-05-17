"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Quote } from "lucide-react";

const stories = [
  {
    quote:
      "Wekraft turned our weekly planning from scattered updates into one reliable execution loop.",
    name: "Alex Rivera",
    role: "CTO at Quantum Dynamics",
    metric: "40%",
    label: "faster sprint planning",
  },
  {
    quote:
      "The team finally has a single place where roadmap, commits, and ownership stay in sync.",
    name: "Sarah Chen",
    role: "Operations Head at NeoScale",
    metric: "18h",
    label: "saved every week",
  },
  {
    quote:
      "We reduced status meetings without losing the signal. Wekraft catches project drift early.",
    name: "James Wilson",
    role: "Project Director at Vertex Systems",
    metric: "60%",
    label: "less meeting time",
  },
  {
    quote:
      "It feels designed for builders. Fast to scan, sharp defaults, and no ceremony around the work.",
    name: "Tom Anderson",
    role: "CEO at BlueShift Solutions",
    metric: "3x",
    label: "clearer handoffs",
  },
  {
    quote:
      "We moved from three tools into one workspace and kept the engineering rhythm intact.",
    name: "Lisa Zhang",
    role: "Product Manager at Aurora Tech",
    metric: "1",
    label: "source of truth",
  },
  {
    quote:
      "Onboarding new contributors is much calmer now because context is attached to the work.",
    name: "David Kim",
    role: "HR Director at Cloudline",
    metric: "35%",
    label: "faster onboarding",
  },
];

const CustomerStories = () => {
  return (
    <section className="relative overflow-hidden bg-black px-6 py-28 font-sans text-white md:px-12">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-120px" }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl text-center"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/5 backdrop-blur-md shadow-[0_0_20px_rgba(59,130,246,0.1)] px-4 py-1.5 text-sm font-semibold tracking-wide text-blue-300">
            <span className="size-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)] animate-pulse" />
            Customer signal
          </div>
          <h2 className="bg-gradient-to-b from-white via-white to-neutral-500 bg-clip-text text-4xl font-bold tracking-tight text-transparent md:text-6xl leading-tight">
            What teams say after shipping with Wekraft
          </h2>
          <p className="mt-5 text-lg md:text-xl leading-relaxed text-neutral-400 max-w-2xl mx-auto">
            Real execution stories from product and engineering teams that care
            about speed, clarity, and fewer status meetings.
          </p>
        </motion.div>

        <div className="mt-20 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {stories.map((story, index) => (
            <motion.article
              key={story.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.55, delay: index * 0.06 }}
              className="group relative min-h-72 overflow-hidden rounded-2xl border border-white/10 bg-neutral-900/40 p-8 hover:bg-neutral-900/80 transition-all duration-500 hover:shadow-[0_8px_40px_rgba(0,0,0,0.6)] hover:-translate-y-1"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              
              <div className="relative z-10 flex items-start justify-between gap-6">
                <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 group-hover:bg-blue-500/20 transition-colors">
                  <Quote className="size-5 text-blue-400" />
                </div>
                <ArrowUpRight className="size-5 text-neutral-600 transition-colors duration-300 group-hover:text-blue-400" />
              </div>

              <p className="relative z-10 mt-8 text-xl font-medium leading-relaxed tracking-tight text-neutral-200 group-hover:text-white transition-colors duration-300">
                "{story.quote}"
              </p>

              <div className="relative z-10 mt-10 flex items-end justify-between gap-5">
                <div className="flex items-center gap-4">
                  <div className="flex size-12 items-center justify-center rounded-xl border border-white/10 bg-gradient-to-br from-white/10 to-transparent text-sm font-bold text-white shadow-inner">
                    {story.name
                      .split(" ")
                      .map((part) => part[0])
                      .join("")}
                  </div>
                  <div>
                    <p className="font-semibold text-white">{story.name}</p>
                    <p className="mt-1 text-sm text-neutral-500">
                      {story.role}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-semibold text-white">
                    {story.metric}
                  </p>
                  <p className="mt-1 text-xs uppercase text-neutral-600">
                    {story.label}
                  </p>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CustomerStories;
