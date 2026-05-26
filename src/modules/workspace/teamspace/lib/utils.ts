export function getUserColor(identifier: string) {
  let hash = 0;
  for (let i = 0; i < identifier.length; i++) {
    hash = identifier.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash) % 360;
  return `hsl(${h}, 80%, 60%)`;
}

export function formatNotificationContent(content: string | undefined, maxLength: number = 50): string {
  if (!content) return "";
  
  // Regex to match our S3 media upload markdown format: ![filename](url) or [filename](url)
  const s3Regex = /^(!?)\[([^\]]+)\]\(((?:blob:)?https?:\/\/[^\s\)]+)\)(?:\s+([\s\S]*))?$/;
  const match = content.match(s3Regex);
  
  let formatted = content;
  if (match) {
    const fileName = match[2];
    const caption = match[4];
    if (caption) {
      formatted = `Shared a file "${fileName}": ${caption}`;
    } else {
      formatted = `Shared a file: ${fileName}`;
    }
  }
  
  if (formatted.length > maxLength) {
    return formatted.substring(0, maxLength).trimEnd() + "...";
  }
  
  return formatted;
}
export function getFileIconPath(fileName: string) {
  const ext = fileName.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'pdf': return '/pdf.svg';
    case 'ppt':
    case 'pptx': return '/ppt.svg';
    case 'doc':
    case 'docx': return '/doc.svg';
    case 'xls':
    case 'xlsx':
    case 'csv': return '/xls.svg';
    case 'png': return '/png.svg';
    case 'jpg':
    case 'jpeg': return '/jpg.svg';
    case 'svg': return '/svg.svg';
    default: return '/file.svg';
  }
}
