import { Apple, Monitor, Github, Twitter, Linkedin, Youtube } from "lucide-react";
import Link from "next/link";

const DiscordLogo = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
    <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
  </svg>
);

const XLogo = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const FooterColumn = ({ title, links }: { title: string, links: string[] }) => (
  <div className="flex flex-col gap-3">
    <h4 className="text-neutral-100 font-semibold text-sm mb-1">{title}</h4>
    <div className="flex flex-col gap-2.5">
      {links.map((link) => (
        <Link key={link} href="#" className="text-neutral-400 hover:text-white text-[13px] font-medium transition-colors">
          {link}
        </Link>
      ))}
    </div>
  </div>
);

const Footer = () => {
  return (
    <footer className="bg-[#0A0A0A] pt-24 pb-12 px-6 md:px-12 lg:px-16 border-t border-neutral-900 font-sans">
      <div className="max-w-[1440px] mx-auto">
        
        {/* Top Section: Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-x-8 gap-y-16 mb-24">
          
          {/* Column 1 */}
          <div className="flex flex-col gap-10">
            <FooterColumn 
              title="Product" 
              links={["Project Management", "Wiki", "Wekraft AI", "Code Review"]} 
            />
            <FooterColumn 
              title="Self-hosted" 
              links={["Commercial Edition", "Airgapped", "Enterprise Portal"]} 
            />
          </div>

          {/* Column 2 */}
          <div className="flex flex-col gap-10">
            <FooterColumn 
              title="Feature capabilities" 
              links={[
                "Work items", 
                "Work item types", 
                "Intake", 
                "Cycles", 
                "Workflows and Approvals", 
                "Epics and Initiatives", 
                "Customer requests", 
                "Dashboards", 
                "Teamspaces", 
                "State of Projects + Updates"
              ]} 
            />
            <FooterColumn 
              title="Marketplace" 
              links={["Apps and agents", "Importers", "Templates"]} 
            />
          </div>

          {/* Column 3 */}
          <div className="flex flex-col gap-10">
            <FooterColumn 
              title="Plan and pricing" 
              links={["Pro", "Business", "Enterprise"]} 
            />
            <FooterColumn 
              title="Use cases" 
              links={["Product", "Operations", "Marketing", "Agile", "Design", "Engineering"]} 
            />
          </div>

          {/* Column 4 */}
          <div className="flex flex-col gap-10">
            <FooterColumn 
              title="Industries" 
              links={["Aerospace", "Healthcare", "Government", "Retail", "Manufacturing", "Defense", "Finance"]} 
            />
            <FooterColumn 
              title="Compare" 
              links={["Jira", "Asana", "Monday.com", "Linear"]} 
            />
          </div>

          {/* Column 5 */}
          <div className="flex flex-col gap-10">
            <FooterColumn 
              title="Learn" 
              links={["Wekraft blog", "What's new (Changelog)", "Download", "Mobile"]} 
            />
            <FooterColumn 
              title="Support" 
              links={["Docs", "Developer Docs", "Status", "Forum"]} 
            />
          </div>

          {/* Column 6 */}
          <div className="flex flex-col gap-10">
            <FooterColumn 
              title="Company" 
              links={["Terms", "Privacy", "Security", "Legal", "Careers", "About", "Wallpapers"]} 
            />
            <FooterColumn 
              title="Wekraft in action" 
              links={["Manifesto", "Make the Switch", "Talk to sales", "General enquiries", "What our customers say"]} 
            />
          </div>

        </div>

        {/* Bottom Section: Downloads & Socials */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-8 border-t border-neutral-900">
          
          {/* Download Buttons */}
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2.5 bg-[#141414] hover:bg-[#1f1f1f] border border-neutral-800 text-white px-5 py-2.5 rounded-lg text-[13px] font-semibold transition-colors">
              <Apple className="w-4 h-4" />
              Download for Mac
            </button>
            <button className="flex items-center gap-2.5 bg-[#141414] hover:bg-[#1f1f1f] border border-neutral-800 text-white px-5 py-2.5 rounded-lg text-[13px] font-semibold transition-colors">
              <Monitor className="w-4 h-4" />
              Download for Windows
            </button>
          </div>

          {/* Social Icons */}
          <div className="flex items-center gap-3">
            {[
              { icon: <Linkedin className="w-4 h-4" />, name: "LinkedIn" },
              { icon: <Github className="w-4 h-4" />, name: "GitHub" },
              { icon: <XLogo />, name: "X" },
              { icon: <DiscordLogo />, name: "Discord" },
              { icon: <Youtube className="w-4 h-4" />, name: "YouTube" },
            ].map((social) => (
              <a 
                key={social.name} 
                href="#" 
                aria-label={social.name}
                className="w-10 h-10 flex items-center justify-center bg-[#141414] hover:bg-[#1f1f1f] border border-neutral-800 rounded-lg text-neutral-400 hover:text-white transition-colors"
              >
                {social.icon}
              </a>
            ))}
          </div>

        </div>
      </div>
    </footer>
  );
};

export default Footer;
