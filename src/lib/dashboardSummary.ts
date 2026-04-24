import { jsPDF } from "jspdf";

import type { ActivityItem, Event, Notice, Review } from "@/lib/adminDashboard";
import type { AdminUser } from "@/lib/adminDashboard";

interface DashboardSummaryPayload {
  user: AdminUser;
  stats: {
    totalNews: number;
    totalNotices: number;
    pendingReviews: number;
    activeManagers: number;
  };
  notices: Notice[];
  events: Event[];
  reviews: Review[];
  activityFeed: ActivityItem[];
  t: (bn: string, en: string) => string;
  lang: "bn" | "en";
}

const formatDateTime = (lang: "bn" | "en") =>
  new Date().toLocaleString(lang === "bn" ? "bn-BD" : "en-BD", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

const createSection = (title: string, lines: string[]) => ["", title, ...lines].join("\n");

const sanitizeFileStem = (value: string) =>
  value.replace(/[^a-z0-9-_]+/gi, "-").replace(/-+/g, "-").replace(/^-|-$/g, "") || "dashboard-summary";

const wrapCanvasText = (context: CanvasRenderingContext2D, text: string, maxWidth: number) => {
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  words.forEach((word) => {
    const nextLine = currentLine ? `${currentLine} ${word}` : word;
    if (context.measureText(nextLine).width <= maxWidth || !currentLine) {
      currentLine = nextLine;
      return;
    }

    lines.push(currentLine);
    currentLine = word;
  });

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines.length > 0 ? lines : [text];
};

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Unable to load image: ${src}`));
    image.src = src;
  });

const drawPdfHeader = (
  context: CanvasRenderingContext2D,
  canvasWidth: number,
  horizontalPadding: number,
  topPadding: number,
  logo: HTMLImageElement | null,
) => {
  const logoSize = 110;

  if (logo) {
    context.drawImage(logo, horizontalPadding, topPadding, logoSize, logoSize);
  }

  const textStartX = horizontalPadding + logoSize + 28;
  context.fillStyle = "#0f172a";
  context.textBaseline = "top";

  context.font = 'bold 34px Arial, "Noto Sans Bengali", sans-serif';
  context.fillText("Annoor Education Family", textStartX, topPadding + 8);

  context.font = '24px Arial, "Noto Sans Bengali", sans-serif';
  context.fillText("Kapasia, Gazipur", textStartX, topPadding + 52);
  context.fillText("01820-811511, 01581818361", textStartX, topPadding + 84);

  const dividerY = topPadding + logoSize + 18;
  context.strokeStyle = "#cbd5e1";
  context.lineWidth = 3;
  context.beginPath();
  context.moveTo(horizontalPadding, dividerY);
  context.lineTo(canvasWidth - horizontalPadding, dividerY);
  context.stroke();

  return dividerY + 26;
};

const drawPdfFooter = (
  context: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  horizontalPadding: number,
  bottomPadding: number,
  pageNumber: number,
) => {
  const dividerY = canvasHeight - bottomPadding - 92;
  const signatureLineWidth = 240;
  const signatureX = canvasWidth - horizontalPadding - signatureLineWidth;
  const signatureLineY = canvasHeight - bottomPadding - 40;

  context.strokeStyle = "#cbd5e1";
  context.lineWidth = 2;
  context.beginPath();
  context.moveTo(horizontalPadding, dividerY);
  context.lineTo(canvasWidth - horizontalPadding, dividerY);
  context.stroke();

  context.beginPath();
  context.moveTo(signatureX, signatureLineY);
  context.lineTo(signatureX + signatureLineWidth, signatureLineY);
  context.stroke();

  context.fillStyle = "#475569";
  context.font = '20px Arial, "Noto Sans Bengali", sans-serif';
  context.fillText("Authorized Signature", signatureX, signatureLineY + 10);
  context.fillText(`Page ${pageNumber}`, horizontalPadding, signatureLineY + 10);
};

export const buildDashboardSummaryText = ({ user, stats, notices, events, reviews, activityFeed, t, lang }: DashboardSummaryPayload) => {
  const pendingReviews = reviews.filter((item) => !item.approved).slice(0, 5);
  const latestNotices = notices.slice(0, 5);
  const latestEvents = events.slice(0, 5);
  const latestActivity = activityFeed.slice(0, 6);

  const lines = [
    t("আননূর ড্যাশবোর্ড সামারি", "Annoor Dashboard Summary"),
    `${t("ডাউনলোড সময়", "Downloaded at")}: ${formatDateTime(lang)}`,
    `${t("রিপোর্ট প্রস্তুত করেছেন", "Prepared by")}: ${user.fullName} (${user.role})`,
    createSection(t("মূল পরিসংখ্যান", "Key Statistics"), [
      `- ${t("প্রকাশিত সংবাদ", "Published News")}: ${stats.totalNews}`,
      `- ${t("লাইভ নোটিশ", "Live Notices")}: ${stats.totalNotices}`,
      `- ${t("অপেক্ষমান রিভিউ", "Pending Reviews")}: ${stats.pendingReviews}`,
      `- ${t("সক্রিয় ম্যানেজার", "Active Managers")}: ${stats.activeManagers}`,
    ]),
    createSection(
      t("সাম্প্রতিক নোটিশ", "Latest Notices"),
      latestNotices.length === 0
        ? [`- ${t("কোনো নোটিশ নেই", "No notices found")}`]
        : latestNotices.map((item) => `- ${item.titleBn}`),
    ),
    createSection(
      t("আসন্ন ইভেন্ট", "Upcoming Events"),
      latestEvents.length === 0
        ? [`- ${t("কোনো ইভেন্ট নেই", "No events found")}`]
        : latestEvents.map((item) => `- ${item.titleBn} (${item.startDate})`),
    ),
    createSection(
      t("অপেক্ষমান রিভিউ", "Pending Reviews"),
      pendingReviews.length === 0
        ? [`- ${t("কোনো অপেক্ষমান রিভিউ নেই", "No pending reviews")}`]
        : pendingReviews.map((item) => `- ${item.name}`),
    ),
    createSection(
      t("সাম্প্রতিক কার্যক্রম", "Recent Activity"),
      latestActivity.length === 0
        ? [`- ${t("কোনো কার্যক্রম লগ নেই", "No activity logged")}`]
        : latestActivity.map((item) => `- ${item.title} • ${item.detail}`),
    ),
  ];

  return lines.join("\n");
};

export const downloadDashboardSummary = async (text: string, fileStem = "dashboard-summary") => {
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "a4",
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 40;
  const canvasWidth = 1200;
  const canvasHeight = Math.round((pageHeight / pageWidth) * canvasWidth);
  const scale = canvasWidth / pageWidth;
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Unable to create canvas context for PDF export.");
  }

  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  const fontSize = 28;
  const lineHeight = 42;
  const horizontalPadding = margin * scale;
  const verticalPadding = margin * scale;
  const headerTopPadding = verticalPadding;
  const footerBottomPadding = verticalPadding;
  const maxTextWidth = canvasWidth - horizontalPadding * 2;
  const pages: string[][] = [[]];
  let currentPageIndex = 0;
  const logo = await loadImage("/site-logo.png").catch(() => null);
  const textStartY = drawPdfHeader(context, canvasWidth, horizontalPadding, headerTopPadding, logo);
  const footerReservedHeight = 130;
  let usedHeight = textStartY;

  context.font = `${fontSize}px Arial, "Noto Sans Bengali", sans-serif`;

  text.split("\n").forEach((rawLine) => {
    const line = rawLine.trimEnd();
    const wrappedLines = line.length === 0 ? [""] : wrapCanvasText(context, line, maxTextWidth);

    wrappedLines.forEach((wrappedLine) => {
      if (usedHeight + lineHeight > canvasHeight - footerBottomPadding - footerReservedHeight) {
        pages.push([]);
        currentPageIndex += 1;
        usedHeight = textStartY;
      }

      pages[currentPageIndex].push(wrappedLine);
      usedHeight += lineHeight;
    });
  });

  for (const [index, pageLines] of pages.entries()) {
    if (index > 0) {
      pdf.addPage();
    }

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvasWidth, canvasHeight);
    context.fillStyle = "#111827";
    context.font = `${fontSize}px Arial, "Noto Sans Bengali", sans-serif`;
    context.textBaseline = "top";

    const pageTextStartY = drawPdfHeader(context, canvasWidth, horizontalPadding, headerTopPadding, logo);
    let cursorY = pageTextStartY;
    pageLines.forEach((line) => {
      context.fillText(line, horizontalPadding, cursorY);
      cursorY += lineHeight;
    });

    drawPdfFooter(context, canvasWidth, canvasHeight, horizontalPadding, footerBottomPadding, index + 1);

    const imageData = canvas.toDataURL("image/png");
    pdf.addImage(imageData, "PNG", 0, 0, pageWidth, pageHeight);
  }

  pdf.save(`${sanitizeFileStem(fileStem)}-${new Date().toISOString().slice(0, 10)}.pdf`);
};
