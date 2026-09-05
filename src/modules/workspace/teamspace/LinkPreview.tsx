import React from 'react';
import { ExternalLink } from 'lucide-react';

interface LinkPreviewProps {
  preview: {
    url: string;
    title?: string;
    description?: string;
    image?: string;
    siteName?: string;
  };
}

export const LinkPreview: React.FC<LinkPreviewProps> = ({ preview }) => {
  return (
    <div className="mt-2 max-w-md border border-border/50 rounded-lg overflow-hidden bg-muted/30 hover:bg-muted/50 transition-colors group cursor-pointer shadow-sm">
      <a href={preview.url} target="_blank" rel="noopener noreferrer" className="flex flex-col">
        {preview.image && (
          <div className="relative w-full h-40 bg-muted overflow-hidden border-b border-border/20">
            <img 
              src={preview.image} 
              alt={preview.title || "Link preview"} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={(e) => (e.currentTarget.style.display = 'none')}
            />
          </div>
        )}
        <div className="p-3 space-y-1">
          {preview.siteName && (
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80 flex items-center gap-1.5">
              {preview.siteName}
              <ExternalLink className="h-2.5 w-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          )}
          {preview.title && (
            <h4 className="text-sm font-semibold text-foreground line-clamp-1 leading-tight group-hover:text-primary transition-colors">
              {preview.title}
            </h4>
          )}
          {preview.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed opacity-90">
              {preview.description}
            </p>
          )}
          <div className="text-[10px] text-muted-foreground/60 truncate mt-1.5">
            {new URL(preview.url).hostname}
          </div>
        </div>
      </a>
    </div>
  );
};
