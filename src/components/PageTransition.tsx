"use client";

import { motion } from "framer-motion";
import React from "react";

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

const variants = {
  hidden: { opacity: 0, y: 10 },
  enter: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1], // Vercel-style cubic bezier
    }
  },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
};

export const PageTransition = ({ children, className }: PageTransitionProps) => {
  return (
    <motion.div
      initial="hidden"
      animate="enter"
      exit="exit"
      // @ts-ignore
      variants={variants}
      className={className}
    >
      {children}
    </motion.div>
  );
};
