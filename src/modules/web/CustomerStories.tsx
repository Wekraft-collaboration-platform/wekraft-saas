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
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-blue-500/50 to-transparent" />
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-120px" }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl text-center"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-1.5 text-sm text-neutral-400">
            <span className="size-1.5 rounded-full bg-blue-500" />
            Customer signal
          </div>
          <h2 className="bg-linear-to-b from-white via-white to-neutral-500 bg-clip-text text-4xl font-semibold tracking-normal text-transparent md:text-6xl">
            What teams say after shipping with Wekraft
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-neutral-500">
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
              className="group relative min-h-72 overflow-hidden rounded-lg border border-white/10 bg-neutral-950/70 p-7 shadow-[0_1px_0_rgba(255,255,255,0.04)_inset]"
            >
              <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="flex items-start justify-between gap-6">
                <Quote className="size-6 text-blue-400" />
                <ArrowUpRight className="size-5 text-neutral-700 transition-colors duration-300 group-hover:text-blue-400" />
              </div>

              <p className="mt-10 text-xl font-medium leading-snug tracking-normal text-neutral-100">
                {story.quote}
              </p>

              <div className="mt-10 flex items-end justify-between gap-5">
                <div className="flex items-center gap-4">
                  <div className="flex size-12 items-center justify-center rounded-md border border-white/10 bg-white/[0.04] text-sm font-semibold text-white">
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
