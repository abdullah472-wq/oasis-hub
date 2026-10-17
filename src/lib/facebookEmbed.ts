/**
 * Utilities for parsing and formatting Facebook post/video embed codes and URLs.
 * Supports:
 * 1. Full <iframe>...</iframe> snippets from Facebook "Embed" dialog
 * 2. Facebook plugin src URLs (https://www.facebook.com/plugins/post.php?...)
 * 3. Direct Facebook post, photo, video, or permalink URLs
 * 4. General iframe embed src extraction
 */

export const extractEmbedUrl = (rawInput?: string | null): string => {
  if (!rawInput) return "";
  const input = rawInput.trim();
  if (!input) return "";

  // 1. If it's a full <iframe> snippet, extract the `src` attribute
  if (input.includes("<iframe") || input.includes("src=")) {
    const srcMatch = input.match(/src=["']([^"']+)["']/i);
    if (srcMatch && srcMatch[1]) {
      return srcMatch[1].trim();
    }
  }

  // 2. If it's already a Facebook plugin embed URL
  if (input.startsWith("https://www.facebook.com/plugins/") || input.startsWith("https://web.facebook.com/plugins/")) {
    return input;
  }

  // 3. If it's a direct Facebook URL, construct the plugin embed URL
  if (input.includes("facebook.com") || input.includes("fb.watch")) {
    const isVideo =
      input.includes("/watch") ||
      input.includes("fb.watch") ||
      input.includes("/videos/") ||
      input.includes("video.php");

    const endpoint = isVideo ? "video.php" : "post.php";
    const extraParams = isVideo ? "&show_text=false" : "&show_text=true";

    return `https://www.facebook.com/plugins/${endpoint}?href=${encodeURIComponent(input)}${extraParams}&width=500`;
  }

  // 4. If it's an HTTP/HTTPS URL (e.g. YouTube embed or direct URL)
  if (input.startsWith("http://") || input.startsWith("https://")) {
    return input;
  }

  return "";
};

/**
 * Extracts the original Facebook post URL from an embed string or plugin URL for "View on Facebook" link.
 */
export const getOriginalPostUrl = (rawInput?: string | null): string => {
  if (!rawInput) return "";
  const input = rawInput.trim();
  if (!input) return "";

  // If it's a plugin URL or iframe containing one, extract the `href` parameter
  const embedUrl = extractEmbedUrl(input);
  if (embedUrl.includes("facebook.com/plugins/")) {
    try {
      const parsed = new URL(embedUrl);
      const originalHref = parsed.searchParams.get("href");
      if (originalHref) {
        return originalHref;
      }
    } catch {
      // Regex fallback
      const match = embedUrl.match(/[?&]href=([^&]+)/);
      if (match && match[1]) {
        return decodeURIComponent(match[1]);
      }
    }
  }

  // If input was already a direct facebook URL
  if ((input.includes("facebook.com") || input.includes("fb.watch")) && !input.includes("<iframe")) {
    return input;
  }

  return "";
};

/**
 * Helper to extract an embed URL from markdown or text content if embedded inline
 * e.g. <!-- fb_embed: URL --> or [fb_embed: URL]
 */
export const extractInlineEmbed = (content?: string | null): { cleanContent: string; embedUrl: string } => {
  if (!content) return { cleanContent: "", embedUrl: "" };

  const markerRegex = /(?:<!--\s*fb_embed:\s*([^\s>]+)\s*-->|\[fb_embed:\s*([^\s\]]+)\])/i;
  const match = content.match(markerRegex);

  if (match) {
    const foundUrl = match[1] || match[2] || "";
    const cleanContent = content.replace(markerRegex, "").trim();
    return {
      cleanContent,
      embedUrl: extractEmbedUrl(foundUrl),
    };
  }

  return { cleanContent: content, embedUrl: "" };
};
