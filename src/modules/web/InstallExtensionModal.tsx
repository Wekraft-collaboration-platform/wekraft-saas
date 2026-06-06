"use client";

import React from "react";
import Image from "next/image";

interface InstallExtensionModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: "dropdown" | "modal";
}

export const InstallExtensionModal: React.FC<InstallExtensionModalProps> = ({
  isOpen,
  onClose,
  mode = "modal",
}) => {
  if (!isOpen) return null;

  const ides = [
    {
      name: "VS Code",
      desc: "marketplace.visualstudio.com",
      logo: "/vs-code.png",
      href: "vscode:extension/wekraft.wekraft",
      logoSize: 20,
      imgClass: "object-contain",
    },
    {
      name: "Cursor",
      desc: "open-vsx.org",
      logo: "/cursor.png",
      href: "cursor:extension/wekraft.wekraft",
      logoSize: 36,
      imgClass: "object-cover w-full h-full",
    },
    {
      name: "Antigravity IDE",
      desc: "open-vsx.org",
      logo: "/antigravity-color.svg",
      href: "https://open-vsx.org/vscode/item?itemName=WeKraft.wekraft",
      newTab: true,
      logoSize: 20,
      imgClass: "object-contain",
    },
  ];

  const containerClass =
    mode === "dropdown"
      ? "absolute left-1/2 -translate-x-1/2 top-full mt-3 z-50 w-[320px] rounded-2xl border border-white/[0.08] bg-[#111111] shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_32px_64px_rgba(0,0,0,0.9)] overflow-hidden"
      : "fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[320px] rounded-2xl border border-white/[0.08] bg-[#111111] shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_32px_64px_rgba(0,0,0,0.9)] overflow-hidden";

  const backdropClass =
    mode === "dropdown"
      ? "fixed inset-0 z-40"
      : "fixed inset-0 z-40 bg-black/55 backdrop-blur-sm";

  return (
    <>
      {/* backdrop */}
      <div className={backdropClass} onClick={onClose} />

      {/* dialog card */}
      <div className={containerClass}>
        {/* header */}
        <div className="px-4 pt-4 pb-3 flex items-center justify-between border-b border-white/[0.06]">
          <span className="text-[10px] font-medium text-white/30 uppercase tracking-[0.12em]">
            Install extension
          </span>
          <button
            onClick={onClose}
            className="text-white/20 hover:text-white/60 transition-colors text-xs leading-none cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* rows */}
        <div className="p-1.5 flex flex-col">
          {ides.map((ide) => (
            <a
              key={ide.name}
              href={ide.href}
              {...(ide.newTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              onClick={onClose}
              className="group flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.05] transition-colors duration-150 cursor-pointer"
            >
              {/* logo */}
              <div className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center shrink-0 overflow-hidden group-hover:bg-white/[0.07] transition-colors">
                <Image
                  src={ide.logo}
                  alt={ide.name}
                  width={ide.logoSize}
                  height={ide.logoSize}
                  className={ide.imgClass}
                />
              </div>

              {/* text */}
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-white/90 leading-none group-hover:text-white transition-colors">
                  {ide.name}
                </p>
                <p className="text-[11px] text-white/25 leading-none mt-1 font-mono">
                  {ide.desc}
                </p>
              </div>

              {/* install badge */}
              <span className="text-[10px] font-medium text-white/30 group-hover:text-black group-hover:bg-white border border-white/[0.08] group-hover:border-white rounded-md px-2 py-0.5 transition-all shrink-0">
                Install
              </span>
            </a>
          ))}
        </div>

        {/* footer */}
        <div className="px-4 py-3 border-t border-white/[0.06]">
          <p className="text-[10px] text-white/15 text-center font-mono">
            Your backlog. Your IDE. Zero context switching.
          </p>
        </div>
      </div>
    </>
  );
};
