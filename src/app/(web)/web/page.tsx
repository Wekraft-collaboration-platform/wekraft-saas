import AIFirstSection from "@/modules/web/AIFirstSection";
import AllInOneSection from "@/modules/web/AllInOneSection";
import CustomerStories from "@/modules/web/CustomerStories";

import Hero from "@/modules/web/Hero";
import InfraSection from "@/modules/web/infraSection";
import Navbar from "@/modules/web/Navbar";
import Section1 from "@/modules/web/Section1";
import WhyWeKraft from "@/modules/web/WhyWeKraft";

import TrustedBy from "@/modules/web/TrustedBy";
import WallOfLove from "@/modules/web/WallOfLove";


const WebPage = () => {
  return (
    <div className="bg-black scroll-smooth selection:bg-blue-500/30 min-h-screen">
      <Navbar />
      <Hero />
      <TrustedBy />
      <Section1 />
      <WhyWeKraft />
      <AIFirstSection />
      <AllInOneSection />
    </div>
  );
};

export default WebPage;

{/* <CustomerStories />
      <WallOfLove />
      <InfraSection /> */}