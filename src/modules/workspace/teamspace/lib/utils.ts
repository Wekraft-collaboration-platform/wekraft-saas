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

  // Replace S3 upload links with 'uploaded doc'
  const uploadRegex = /!?\[[^\]]+\]\((https?:\/\/[^\s)]+(?:amazonaws\.com|wekraft-saas-upload-s3)[^\s)]*)\)/g;
  const formatted = content.replace(uploadRegex, "uploaded doc");

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
