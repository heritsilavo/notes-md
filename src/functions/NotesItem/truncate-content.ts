export const truncateContent = (content: string, maxLength: number = 100) => {
  const cleanContent = content
    .replace(/#{1,6}\s+/g, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/```[\s\S]*?```/g, '[Code]')
    .replace(/`(.*?)`/g, '$1')
    .replace(/>\s+(.*)/g, '$1')
    .replace(/- \[.\] /g, '• ')
    .replace(/- /g, '• ')
    .trim();
  
  if (cleanContent.length <= maxLength) {
    return cleanContent;
  }
  
  return cleanContent.substring(0, maxLength).trim() + '...';
};