import Hero from "@/modules/web/Hero";
import Navbar from "@/modules/web/Navbar";
import Section1 from "@/modules/web/Section1";
import Features from "@/modules/web/Features";
import Link from "next/link";
import React from "react";

const WebPage = () => {
  return (
    <div className="bg-black scroll-smooth selection:bg-blue-500/30 min-h-screen">
      <Navbar />
      <Hero />
      <Section1 />
      <Features />
    </div>
  );
};

export default WebPage;
