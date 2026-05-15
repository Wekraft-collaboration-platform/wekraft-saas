import Hero from "@/modules/web/Hero";
import Navbar from "@/modules/web/Navbar";
import Section1 from "@/modules/web/Section1";
import Section2 from "@/modules/web/Section2";
import Features from "@/modules/web/Features";
import WhyUs from "@/modules/web/WhyUs";
import Link from "next/link";
import React from "react";
import InfraSection from "@/modules/web/infraSection";

const WebPage = () => {
  return (
    <div className="bg-black scroll-smooth selection:bg-blue-500/30 min-h-screen">
      <Navbar />
      <Hero />
      <Section1 />
      <Features />
      <WhyUs />
      <Section2 />
      <InfraSection/>
    </div>
  );
};

export default WebPage;
