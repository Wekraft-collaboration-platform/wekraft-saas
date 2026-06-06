import AIFirstSection from "@/modules/web/AIFirstSection";
import AllInOneSection from "@/modules/web/AllInOneSection";
import BeyondCode from "@/modules/web/BeyondCode";
import CustomerStories from "@/modules/web/CustomerStories";

import Hero from "@/modules/web/Hero";
import InfraSection from "@/modules/web/infraSection";
import Navbar from "@/modules/web/Navbar";
import Section1 from "@/modules/web/Section1";
import WhyWeKraft from "@/modules/web/WhyWeKraft";
import Testimonials from "@/modules/web/Testimonials";
import ProjectOnSteroids from "@/modules/web/ProjectOnSteroids";

import TrustedBy from "@/modules/web/TrustedBy";
import WallOfLove from "@/modules/web/WallOfLove";
import Footer from "@/modules/web/Footer";


const WebPage = () => {
  return (
    <div className="bg-black scroll-smooth selection:bg-blue-500/30 min-h-screen relative">
      <Navbar />
      <Hero />
      <TrustedBy />
      <Section1 />
      <WhyWeKraft />
      <BeyondCode />
      <AIFirstSection />
      <AllInOneSection />
      <InfraSection />
      <Testimonials />
      <ProjectOnSteroids />
      <Footer />
    </div>
  );
};

export default WebPage;

