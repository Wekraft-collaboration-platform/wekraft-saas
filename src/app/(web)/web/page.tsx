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
import type { Metadata } from "next";
import StructuredData from "@/components/StructuredData";

export const metadata: Metadata = {
  title: {
    absolute: "WeKraft | AI-Powered Project Management Platform & Collaborative Workspace"
  },
  description: "WeKraft is the next-generation AI project management platform that helps software teams plan, track, and execute sprints with an AI PM agent, developer workspace, and seamless issue tracking.",
  alternates: {
    canonical: "https://wekraft.xyz/web",
  },
};

const softwareAppSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "@id": "https://wekraft.xyz/web/#softwareapp",
  "name": "WeKraft",
  "operatingSystem": "All",
  "applicationCategory": "BusinessApplication",
  "description": "Next-generation AI project management platform and collaborative workspace built for software teams. Integrated with VS Code, Git, and custom PM agents.",
  "offers": {
    "@type": "AggregateOffer",
    "priceCurrency": "USD",
    "lowPrice": "0",
    "highPrice": "20",
    "offerCount": "3"
  }
};

const WebPage = () => {
  return (
    <div className="bg-black scroll-smooth selection:bg-blue-500/30 min-h-screen relative">
      <StructuredData data={softwareAppSchema} />
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
