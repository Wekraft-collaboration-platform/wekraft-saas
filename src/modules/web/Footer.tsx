"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  FaDiscord,
  FaGithub,
  FaInstagram,
  FaLinkedin,
  FaWhatsapp,
  FaXTwitter,
  FaYoutube,
} from "react-icons/fa6";
import { InstallExtensionModal } from "./InstallExtensionModal";

interface FooterLinkItem {
  label: string;
  href: string;
  external?: boolean;
  onClick?: (e: React.MouseEvent) => void;
}

const FooterColumn = ({
  title,
  links,
}: {
  title: string;
  links: FooterLinkItem[];
}) => (
  <div className="flex flex-col gap-3">
    <h4 className="text-neutral-200 font-semibold text-xs uppercase tracking-wider mb-1">
      {title}
    </h4>
    <div className="flex flex-col gap-2.5">
      {links.map((link) =>
        link.onClick ? (
          <button
            key={link.label}
            onClick={link.onClick}
            className="text-neutral-400 hover:text-white text-[13px] font-medium transition-colors text-left bg-transparent border-none p-0 cursor-pointer"
          >
            {link.label}
          </button>
        ) : link.external ? (
          <a
            key={link.label}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-neutral-400 hover:text-white text-[13px] font-medium transition-colors"
          >
            {link.label}
          </a>
        ) : (
          <Link
            key={link.label}
            href={link.href}
            className="text-neutral-400 hover:text-white text-[13px] font-medium transition-colors"
          >
            {link.label}
          </Link>
        ),
      )}
    </div>
  </div>
);

const Footer = () => {
  const [idePickerOpen, setIdePickerOpen] = useState(false);

  return (
    <footer
      id="footer"
      className="bg-[#050505] pt-20 pb-12 px-6 md:px-12 lg:px-16 border-t border-white/[0.03] font-sans relative"
    >
      <div className="max-w-7xl mx-auto">
        {/* Top Section: Branding + Links Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-12 lg:gap-8 mb-20">
          {/* Brand Column (Spans 2 columns on lg screens) */}
          <div className="lg:col-span-2 flex flex-col gap-5 text-left">
            <div className="flex items-center gap-2.5">
              <Image
                src="/logo.svg"
                alt="WeKraft Logo"
                width={28}
                height={28}
              />
              <span className="font-semibold font-pop text-white text-lg tracking-tight">
                WeKraft
              </span>
            </div>
            <p className="text-neutral-400 text-[13px] leading-relaxed max-w-sm">
              Find teams, match skills, launch products, and avoid deadlines.
              WeKraft brings your team space, code cycles, issues, and AI agents
              into a single, cohesive interface.
            </p>

            {/* Social Icons inside brand column */}
            <div className="flex items-center gap-2 mt-2">
              {[
                {
                  icon: <FaLinkedin className="w-4 h-4" />,
                  name: "LinkedIn",
                  href: "https://www.linkedin.com/company/we-kraft/",
                },
                {
                  icon: <FaGithub className="w-4 h-4" />,
                  name: "GitHub",
                  href: "https://github.com/WeKraft-collaboration-platform",
                },
                {
                  icon: <FaXTwitter className="w-4 h-4" />,
                  name: "X",
                  href: "https://x.com/wekraftt",
                },
                {
                  icon: <FaDiscord className="w-4 h-4" />,
                  name: "Discord",
                  href: "https://discord.gg/V7EHK6uuwZ",
                },
                {
                  icon: <FaInstagram className="w-4 h-4" />,
                  name: "Instagram",
                  href: "https://www.instagram.com/wekraft.xyz/",
                },
                {
                  icon: <FaYoutube className="w-4 h-4" />,
                  name: "YouTube",
                  href: "https://www.youtube.com/@wekraft.xyz_official",
                },
                {
                  icon: <FaWhatsapp className="w-4 h-4" />,
                  name: "WhatsApp",
                  href: "https://chat.whatsapp.com/K0aokYtMGOqHWNFZYlfqb5?s=cl&p=a&ilr=1",
                },
              ].map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.name}
                  className="w-9 h-9 flex items-center justify-center bg-white/[0.02] hover:bg-white/[0.08] border border-white/[0.05] hover:border-white/[0.12] rounded-lg text-neutral-400 hover:text-white transition-all duration-200"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Platform Column */}
          <div className="lg:col-span-1">
            <FooterColumn
              title="Platform"
              links={[
                { label: "Overview", href: "/web" },
                { label: "Pricing", href: "/web/pricing" },
                { label: "Why WeKraft?", href: "/web/why-wekraft" },
                { label: "About WeKraft", href: "/web/about" },
                { label: "Dashboard", href: "/dashboard" },
                {
                  label: "Download Extension",
                  href: "#",
                  onClick: (e) => {
                    e.preventDefault();
                    setIdePickerOpen(true);
                  },
                },
              ]}
            />
          </div>

          {/* Features Column */}
          <div className="lg:col-span-1">
            <FooterColumn
              title="Features"
              links={[
                { label: "Tasks", href: "/web/docs/tasks" },
                { label: "Issues", href: "/web/docs/issues" },
                { label: "Teamspaces", href: "/web/docs/team-space" },
                { label: "Team meeting", href: "/web/docs/team-meet" },
                { label: "Repo Heatmaps", href: "/web/docs/heatmaps" },
                { label: "Time Tracking", href: "/web/docs/time-logs" },
                { label: "Kaya AI PM", href: "/web/docs/kaya-pm" },
                { label: "Harry Dev Agent", href: "/web/docs/harry-dev" },
              ]}
            />
          </div>

          {/* Comparisons Column */}
          <div className="lg:col-span-1">
            <FooterColumn
              title="Compare"
              links={[
                { label: "Linear", href: "/web/wekraft-vs-linear" },
                { label: "Jira", href: "/web/wekraft-vs-jira" },
                { label: "Asana", href: "/web/wekraft-vs-asana" },
                { label: "Notion", href: "/web/wekraft-vs-notion" },
                { label: "Plane", href: "/web/wekraft-vs-plane" },
              ]}
            />
          </div>

          {/* Resources Column */}
          <div className="lg:col-span-1">
            <FooterColumn
              title="Resources"
              links={[
                { label: "Docs Index", href: "/web/docs" },
                { label: "AI Specs (llms.txt)", href: "/llms.txt" },
                { label: "Help & Support", href: "/web/docs/support" },
                { label: "Referral Program", href: "/web/docs/referrals" },
                { label: "Billing & Plans", href: "/web/docs/billing" },
                { label: "Shortcuts", href: "/web/docs/shortcuts" },
                { label: "Community Hub", href: "/web/docs/community" },
                { label: "IDE Extension", href: "/web/docs/extension" },
                { label: "Notifications", href: "/web/docs/notifications" },
              ]}
            />
          </div>

          {/* Legal Column */}
          <div className="lg:col-span-1">
            <FooterColumn
              title="Legal"
              links={[
                { label: "Security & Trust", href: "/web/docs/security" },
                { label: "Terms of Service", href: "/web/docs/terms" },
                { label: "Privacy Policy", href: "/web/docs/privacy" },
              ]}
            />
          </div>
        </div>

        {/* Bottom Section: Copyright */}
        <div className="pt-8 border-t border-white/[0.04] flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-neutral-500 text-xs font-normal">
            &copy; {new Date().getFullYear()} WeKraft Inc. All rights reserved.
          </span>
          <span className="text-neutral-600 text-[11px] font-normal hover:text-neutral-400 transition-colors duration-200 cursor-pointer">
            Built for developers, loved by product managers.
          </span>
        </div>
      </div>

      <InstallExtensionModal
        isOpen={idePickerOpen}
        onClose={() => setIdePickerOpen(false)}
        mode="modal"
      />
    </footer>
  );
};

export default Footer;
