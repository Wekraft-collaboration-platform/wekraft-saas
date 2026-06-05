const fs = require('fs');
const file = 'src/modules/web/AllInOneSection.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace bigCards
const newBigCards = `const bigCards: BigCard[] = [
  { label: 'Deadline Tracking', col: 4, row: 2 },
  { label: 'Docs & Flow Charts', col: 6, row: 2 },
  { label: 'Agents', col: 4, row: 4 },
  { label: 'Meet & Chat', col: 6, row: 4 },
];`;

content = content.replace(/const bigCards: BigCard\[\] = \[[^\]]+\];/, newBigCards);

// Replace renderCardContent
const newRenderCardContent = `const renderCardContent = (card: BigCard) => {
  switch (card.label) {
    case 'Deadline Tracking':
      return (
        <div className="relative w-full h-full flex flex-col justify-between overflow-hidden select-none text-left bg-white">
          {/* Light Theme Background Pattern (optional) */}
          <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-30" />
          
          <div className="relative pt-5 px-4 flex flex-col gap-3 w-full h-full">
            {/* Visual project columns */}
            <div className="flex gap-3 justify-center w-full mt-2">
              {/* Needs Updates Column */}
              <div className="flex-1 flex flex-col gap-2 max-w-[110px]">
                <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded text-[9px] text-amber-800 w-fit font-medium shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span>Needs Updates</span>
                  <span className="opacity-60 ml-0.5">5</span>
                </div>
                <div className="bg-white border border-neutral-200 rounded-lg p-2.5 flex flex-col gap-2 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)]">
                  <div className="space-y-1.5">
                    <div className="h-1.5 bg-neutral-200 rounded-full w-[85%]" />
                    <div className="h-1.5 bg-neutral-100 rounded-full w-[60%]" />
                  </div>
                  <div className="flex items-center justify-between mt-1.5">
                    <div className="flex -space-x-1.5">
                      <div className="w-4 h-4 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center text-[7px] font-bold text-blue-600">K</div>
                      <div className="w-4 h-4 rounded-full bg-purple-100 border-2 border-white flex items-center justify-center text-[7px] font-bold text-purple-600">H</div>
                    </div>
                    <div className="text-neutral-400">
                      <Calendar className="w-3 h-3" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Closed Column */}
              <div className="flex-1 flex flex-col gap-2 max-w-[110px]">
                <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded text-[9px] text-emerald-800 w-fit font-medium shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>Closed</span>
                  <span className="opacity-60 ml-0.5">3</span>
                </div>
                <div className="bg-white border border-neutral-200 rounded-lg p-2.5 flex flex-col gap-2 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)]">
                  <div className="space-y-1.5">
                    <div className="h-1.5 bg-neutral-200 rounded-full w-[70%]" />
                    <div className="h-1.5 bg-neutral-100 rounded-full w-[40%]" />
                  </div>
                  <div className="flex items-center justify-between mt-1.5">
                    <div className="w-4 h-4 rounded-full bg-emerald-100 border-2 border-white flex items-center justify-center text-[7px] font-bold text-emerald-600">S</div>
                    <div className="text-neutral-400">
                      <Calendar className="w-3 h-3" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Fade Overlay */}
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#0d0d0d] via-[#0d0d0d]/90 to-transparent z-10 pointer-events-none" />

          {/* Title centered at bottom */}
          <div className="absolute bottom-3 inset-x-0 z-20 flex items-center justify-center gap-2">
            <div className="w-6 h-6 rounded-md bg-blue-600 flex items-center justify-center shrink-0 shadow-lg shadow-blue-600/20">
              <FolderClosed className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-white font-semibold text-sm tracking-tight">
              Deadline Tracking
            </span>
          </div>
        </div>
      );
    case 'Docs & Flow Charts':
      return (
        <div className="relative w-full h-full flex flex-col justify-between overflow-hidden select-none text-left bg-white">
          <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-30" />
          
          <div className="relative pt-8 px-4 flex items-start justify-center w-full h-full">
            {/* Stained stacked docs */}
            <div className="relative w-full max-w-[200px] h-24 flex items-center justify-center">
              <div className="absolute left-[10%] top-[10%] w-[60%] h-[90%] rounded-lg border border-neutral-200 bg-white -rotate-6 transform origin-bottom-left shadow-sm" />
              <div className="absolute right-[10%] top-[10%] w-[60%] h-[90%] rounded-lg border border-neutral-200 bg-white rotate-6 transform origin-bottom-right shadow-sm" />
              <div className="absolute z-10 w-[70%] h-full rounded-lg border border-neutral-200 bg-white p-3 flex flex-col gap-2 shadow-xl shadow-black/5">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[10px] text-neutral-800 font-bold truncate leading-none">
                    Convergence Brief
                  </span>
                  <div className="flex -space-x-1">
                    <div className="w-3.5 h-3.5 rounded-full bg-blue-100 border-[1.5px] border-white" />
                    <div className="w-3.5 h-3.5 rounded-full bg-pink-100 border-[1.5px] border-white" />
                  </div>
                </div>
                <div className="flex items-center gap-1.5 leading-none mt-1">
                  <span className="text-[8px] text-amber-400">★</span>
                  <div className="h-1 bg-neutral-200 rounded-full w-12" />
                </div>
                <div className="space-y-1.5 mt-1.5">
                  <div className="h-1.5 bg-neutral-200 rounded-full w-[85%]" />
                  <div className="h-1.5 bg-neutral-100 rounded-full w-[65%]" />
                  <div className="h-1.5 bg-neutral-100 rounded-full w-[55%]" />
                </div>
              </div>
            </div>
          </div>

          {/* Fade Overlay */}
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#0d0d0d] via-[#0d0d0d]/90 to-transparent z-10 pointer-events-none" />

          {/* Title centered at bottom */}
          <div className="absolute bottom-3 inset-x-0 z-20 flex items-center justify-center gap-2">
            <div className="w-6 h-6 rounded-md bg-blue-500 flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20">
              <FileText className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-white font-semibold text-sm tracking-tight">
              Docs & Flow Charts
            </span>
          </div>
        </div>
      );
    case 'Agents':
      return (
        <div className="relative w-full h-full flex flex-col justify-between overflow-hidden select-none text-left bg-white">
          <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-30" />
          
          <div className="relative pt-6 px-5 w-full h-full">
            <div className="space-y-3 w-full max-w-[220px] mx-auto">
              {/* User message */}
              <div className="ml-auto bg-neutral-100 border border-neutral-200 rounded-2xl rounded-tr-sm px-3 py-1.5 text-[10px] text-neutral-700 w-fit max-w-[85%] text-right leading-tight shadow-sm font-medium">
                What did I miss last week?
              </div>
              {/* Search Box */}
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-purple-50 border border-purple-100 flex items-center justify-center text-[10px] shrink-0">
                  🧠
                </div>
                <div className="flex-1 bg-white border border-neutral-200 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] rounded-md px-2.5 py-1.5 flex items-center justify-between text-[9px] text-neutral-400">
                  <span>Search</span>
                  <span className="text-[8px] text-neutral-500 bg-neutral-100 px-1 py-0.5 rounded font-mono">
                    ⌘K
                  </span>
                </div>
              </div>
              {/* Checkbox item */}
              <div className="flex items-center justify-between bg-white border border-neutral-200 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] rounded-md px-2.5 py-1.5 mt-1">
                <div className="flex items-center gap-1.5">
                  <div className="w-3.5 h-3.5 rounded border border-neutral-300 flex items-center justify-center bg-emerald-50">
                    <span className="text-[8px] text-emerald-500 font-bold">✓</span>
                  </div>
                  <span className="text-[10px] text-neutral-800 font-medium">
                    OOH Campaign
                  </span>
                </div>
                <div className="flex items-center gap-1.5 scale-90 origin-right">
                  <span className="text-[7px] bg-pink-50 text-pink-600 border border-pink-200 px-1 py-0.5 rounded font-bold tracking-wider">
                    IN PROGRESS
                  </span>
                  <div className="w-3 h-3 rounded-full bg-amber-400 border border-white shadow-sm shrink-0" />
                </div>
              </div>
            </div>
          </div>

          {/* Fade Overlay */}
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#0d0d0d] via-[#0d0d0d]/90 to-transparent z-10 pointer-events-none" />

          {/* Title centered at bottom */}
          <div className="absolute bottom-3 inset-x-0 z-20 flex items-center justify-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-purple-500 via-pink-500 to-blue-500 flex items-center justify-center shrink-0 shadow-lg shadow-purple-500/20">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-white font-semibold text-sm tracking-tight">
              Agents
            </span>
          </div>
        </div>
      );
    case 'Meet & Chat':
      return (
        <div className="relative w-full h-full flex flex-col justify-between overflow-hidden select-none text-left bg-white">
          <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-30" />
          
          <div className="relative pt-6 px-6 w-full h-full">
            <div className="space-y-3.5 w-full max-w-[220px] mx-auto">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-blue-100 border-[1.5px] border-white shadow-sm shrink-0 flex items-center justify-center text-[10px] font-bold text-blue-600">M</div>
                <div className="space-y-1.5 flex-1">
                  <div className="h-2 bg-neutral-200 rounded-full w-[50%]" />
                  <div className="h-1.5 bg-neutral-100 rounded-full w-[85%]" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-pink-100 border-[1.5px] border-white shadow-sm shrink-0 flex items-center justify-center text-[10px] font-bold text-pink-600 relative">
                  E
                  <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border-2 border-white rounded-full" />
                </div>
                <div className="space-y-1.5 flex-1">
                  <div className="h-2 bg-neutral-200 rounded-full w-[35%]" />
                  <div className="h-1.5 bg-neutral-100 rounded-full w-[60%]" />
                </div>
              </div>
              <div className="flex gap-2 pl-10 origin-left">
                <div className="flex items-center gap-1 bg-white border border-neutral-200 shadow-sm rounded-full px-2 py-0.5 text-[9px] text-neutral-600 font-medium">
                  <span>🚀</span>
                  <span>16</span>
                </div>
                <div className="flex items-center gap-1 bg-white border border-neutral-200 shadow-sm rounded-full px-2 py-0.5 text-[9px] text-neutral-600 font-medium">
                  <span>✨</span>
                  <span>5</span>
                </div>
              </div>
            </div>
          </div>

          {/* Fade Overlay */}
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#0d0d0d] via-[#0d0d0d]/90 to-transparent z-10 pointer-events-none" />

          {/* Title centered at bottom */}
          <div className="absolute bottom-3 inset-x-0 z-20 flex items-center justify-center gap-2">
            <div className="w-6 h-6 rounded-md bg-indigo-600 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-600/20">
              <MessageCircle className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-white font-semibold text-sm tracking-tight">
              Meet & Chat
            </span>
          </div>
        </div>
      );
    default:
      return null;
  }
};`;

content = content.replace(/const renderCardContent = \(card: BigCard\) => \{[\s\S]*?default:\s*return null;\s*\}\s*\};/, newRenderCardContent);

fs.writeFileSync(file, content);
console.log('Successfully updated AllInOneSection.tsx');
