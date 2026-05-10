import { Button } from "@/components/ui/button";
import Hero from "@/modules/web/Hero";
import Navbar from "@/modules/web/Navbar";
import Link from "next/link";
import React from "react";

const WebPage = () => {
 return (
    <div className="bg-black! scroll-smooth selection:bg-blue-500/30">
      <Navbar />
      <Hero/>
    </div>
  );
};

export default WebPage;
