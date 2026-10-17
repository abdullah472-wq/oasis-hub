import { useState } from "react";
import { ExternalLink, Loader2 } from "lucide-react";
import { extractEmbedUrl, getOriginalPostUrl } from "@/lib/facebookEmbed";

const FacebookBrandIcon = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M22 12.07C22 6.5 17.52 2 11.93 2C6.35 2 1.86 6.5 1.86 12.07C1.86 17.1 5.53 21.26 10.33 22v-7.05H7.7v-2.88h2.63V9.85c0-2.6 1.55-4.04 3.93-4.04c1.14 0 2.33.2 2.33.2v2.56h-1.31c-1.29 0-1.69.8-1.69 1.62v1.95h2.88l-.46 2.88h-2.42V22c4.8-.74 8.47-4.9 8.47-9.93Z" />
  </svg>
);

interface FacebookEmbedProps {
  embedCode?: string | null;
  title?: string;
  className?: string;
  minHeight?: number | string;
}

export const FacebookEmbed = ({
  embedCode,
  title = "Facebook Post",
  className = "",
  minHeight = "480px",
}: FacebookEmbedProps) => {
  const [loaded, setLoaded] = useState(false);
  const embedUrl = extractEmbedUrl(embedCode);
  const directUrl = getOriginalPostUrl(embedCode);

  if (!embedUrl) return null;

  return (
    <div
      className={`my-4 overflow-hidden rounded-2xl border border-blue-200/70 bg-gradient-to-b from-blue-50/50 via-card to-card p-3 sm:p-5 shadow-sm dark:border-blue-900/40 dark:from-blue-950/20 ${className}`}
    >
      {/* Top Header Bar */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-border/70 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#1877F2] text-white shadow-sm">
            <FacebookBrandIcon className="h-4 w-4" />
          </div>
          <div>
            <h4 className="font-bengali text-xs font-bold text-foreground">
              অফিসিয়াল ফেসবুক পোস্ট (Official Facebook Post)
            </h4>
            <span className="font-bengali text-[10px] text-muted-foreground">
              আননূর তাহফিজুল কুরআন মাদরাসা ফেসবুক পেজ
            </span>
          </div>
        </div>

        {directUrl && (
          <a
            href={directUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl border border-blue-200 bg-white px-2.5 py-1 font-bengali text-xs font-semibold text-[#1877F2] shadow-xs transition-colors hover:bg-blue-50 dark:border-blue-800 dark:bg-slate-900 dark:text-blue-400"
          >
            <span>ফেসবুকে দেখুন</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>

      {/* Embed Container */}
      <div className="relative mx-auto flex w-full max-w-[500px] justify-center overflow-hidden rounded-xl border border-border/80 bg-white shadow-inner dark:bg-slate-950">
        {!loaded && (
          <div
            style={{ minHeight }}
            className="flex w-full items-center justify-center bg-muted/30 text-muted-foreground"
          >
            <div className="flex items-center gap-2 font-bengali text-xs">
              <Loader2 className="h-4 w-4 animate-spin text-[#1877F2]" />
              <span>ফেসবুক পোস্ট লোড হচ্ছে...</span>
            </div>
          </div>
        )}

        <iframe
          src={embedUrl}
          title={title}
          onLoad={() => setLoaded(true)}
          className={`w-full max-w-[500px] border-0 transition-opacity duration-300 ${
            loaded ? "opacity-100" : "absolute opacity-0"
          }`}
          style={{
            minHeight,
            border: "none",
            overflow: "hidden",
          }}
          scrolling="no"
          frameBorder="0"
          allowFullScreen={true}
          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
        />
      </div>
    </div>
  );
};

export default FacebookEmbed;
