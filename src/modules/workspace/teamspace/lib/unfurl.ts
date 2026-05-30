export interface LinkPreviewData {
  url: string;
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
}

const URL_REGEX = /(https?:\/\/[^\s]+)/g;

export function extractUrls(text: string): string[] {
  const matches = text.match(URL_REGEX);
  if (!matches) return [];
  // Return unique URLs
  return Array.from(new Set(matches));
}

export async function unfurlUrl(url: string): Promise<LinkPreviewData | null> {
  try {
    const response = await fetch(url, {
      // @ts-ignore - signal timeout is supported in modern fetch
      signal: AbortSignal.timeout(2500), 
      headers: {
        "User-Agent": "WekraftBot/1.0 (Link Unfurling Service)",
        "Accept": "text/html",
      },
    });

    if (!response.ok) return null;

    const html = await response.text();
    
    const getMeta = (attr: string, value: string) => {
      // Matches <meta property="og:title" content="..." /> or <meta content="..." property="og:title" />
      const regex = new RegExp(`<meta[^>]+(?:${attr}=["']${value}["'][^>]+content=["']([^"']+)["']|content=["']([^"']+)["'][^>]+${attr}=["']${value}["'])`, "i");
      const match = html.match(regex);
      return match ? (match[1] || match[2]) : undefined;
    };

    const title = getMeta("property", "og:title") || 
                  getMeta("name", "twitter:title") || 
                  html.match(/<title[^>]*>(.*?)<\/title>/i)?.[1];
                  
    const description = getMeta("property", "og:description") || 
                        getMeta("name", "twitter:description") || 
                        getMeta("name", "description");
                        
    const image = getMeta("property", "og:image") || 
                  getMeta("name", "twitter:image");
                  
    const siteName = getMeta("property", "og:site_name");

    if (!title && !description) return null;

    // Basic HTML entity decoding for common chars
    const decode = (str?: string) => str?.replace(/&quot;/g, '"')?.replace(/&amp;/g, '&')?.replace(/&lt;/g, '<')?.replace(/&gt;/g, '>')?.replace(/&#39;/g, "'");

    return {
      url,
      title: decode(title?.trim()),
      description: decode(description?.trim()),
      image,
      siteName: decode(siteName?.trim()),
    };
  } catch (error) {
    console.error(`Failed to unfurl ${url}:`, error);
    return null;
  }
}
