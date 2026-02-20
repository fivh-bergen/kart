export function getInstagramUsername(url: string): string | null {
  try {
    const parsedUrl = new URL(url);
    if (
      parsedUrl.hostname === "www.instagram.com" ||
      parsedUrl.hostname === "instagram.com"
    ) {
      const pathSegments = parsedUrl.pathname.split("/").filter(Boolean);
      if (pathSegments.length > 0) {
        return pathSegments[0];
      }
    }
  } catch (e) {
    console.error("Invalid URL:", url);
  }
  return null;
}
