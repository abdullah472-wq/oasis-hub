import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

export interface FeeLedgerExportRow {
  studentId: string;
  studentName: string;
  className: string;
  dateLabel: string;
  monthlyAmount: number;
  othersAmount: number;
  dueAmount: number;
  totalAmount: number;
}

const formatCurrency = (value: number) => `৳${value.toLocaleString("en-US")}`;

const sanitizeFilePart = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u0980-\u09ff]+/gi, "-")
    .replace(/^-+|-+$/g, "") || "ledger";

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const getLedgerTotals = (rows: FeeLedgerExportRow[]) =>
  rows.reduce(
    (acc, row) => {
      acc.monthlyAmount += row.monthlyAmount;
      acc.othersAmount += row.othersAmount;
      acc.dueAmount += row.dueAmount;
      acc.totalAmount += row.totalAmount;
      return acc;
    },
    {
      monthlyAmount: 0,
      othersAmount: 0,
      dueAmount: 0,
      totalAmount: 0,
    },
  );

const chunkRows = (rows: FeeLedgerExportRow[], chunkSize: number) => {
  const chunks: FeeLedgerExportRow[][] = [];

  for (let index = 0; index < rows.length; index += chunkSize) {
    chunks.push(rows.slice(index, index + chunkSize));
  }

  return chunks.length > 0 ? chunks : [[]];
};

const buildLedgerPageSections = (
  rows: FeeLedgerExportRow[],
  billingMonth: string,
  t: (bn: string, en: string) => string,
) => {
  const totals = getLedgerTotals(rows);
  const generatedOn = new Date().toLocaleDateString("bn-BD");
  const pages = chunkRows(rows, 16);

  return pages
    .map((pageRows, pageIndex) => {
      const isLastPage = pageIndex === pages.length - 1;
      const tableRows = pageRows
        .map(
          (row) => `
            <tr>
              <td>${escapeHtml(row.studentId || "-")}</td>
              <td>${escapeHtml(row.studentName || "-")}</td>
              <td>${escapeHtml(row.className || "-")}</td>
              <td>${escapeHtml(row.dateLabel || "-")}</td>
              <td>${row.monthlyAmount ? escapeHtml(formatCurrency(row.monthlyAmount)) : "-"}</td>
              <td>${row.othersAmount ? escapeHtml(formatCurrency(row.othersAmount)) : "-"}</td>
              <td>${row.dueAmount ? escapeHtml(formatCurrency(row.dueAmount)) : "-"}</td>
              <td>${row.totalAmount ? escapeHtml(formatCurrency(row.totalAmount)) : "-"}</td>
            </tr>
          `,
        )
        .join("");

      return `
        <section class="ledger-pdf-page">
          <div class="ledger-sheet">
            <header class="ledger-header">
              <div>
                <h1>${t("মাসভিত্তিক ফি লেজার", "Monthly Fee Ledger")}</h1>
                <p>${t("শিক্ষার্থীভিত্তিক মাসিক, অন্যান্য, ডিউ এবং মোট ফি হিসাব", "Student-wise monthly, others, due, and total fee summary")}</p>
              </div>
              <div class="ledger-meta">
                <div class="ledger-chip">${t("মাস", "Month")}: ${escapeHtml(billingMonth)}</div>
                <div class="ledger-chip">${t("মোট সারি", "Total Rows")}: ${rows.length}</div>
                <div class="ledger-chip">${t("পৃষ্ঠা", "Page")} ${pageIndex + 1}/${pages.length}</div>
                <div class="ledger-date">${t("তারিখ", "Date")}: ${escapeHtml(generatedOn)}</div>
              </div>
            </header>

            <div class="ledger-stats">
              <div class="ledger-stat">
                <span>${t("মাসিক", "Monthly")}</span>
                <strong>${escapeHtml(formatCurrency(totals.monthlyAmount))}</strong>
              </div>
              <div class="ledger-stat">
                <span>Others</span>
                <strong>${escapeHtml(formatCurrency(totals.othersAmount))}</strong>
              </div>
              <div class="ledger-stat">
                <span>${t("ডিউ", "Due")}</span>
                <strong>${escapeHtml(formatCurrency(totals.dueAmount))}</strong>
              </div>
              <div class="ledger-stat">
                <span>${t("মোট", "Total")}</span>
                <strong>${escapeHtml(formatCurrency(totals.totalAmount))}</strong>
              </div>
            </div>

            <table class="ledger-table">
              <thead>
                <tr>
                  <th>${t("স্টুডেন্ট আইডি", "Student ID")}</th>
                  <th>${t("নাম", "Name")}</th>
                  <th>${t("ক্লাস", "Class")}</th>
                  <th>${t("তারিখ", "Date")}</th>
                  <th>M.P.</th>
                  <th>Others</th>
                  <th>Due</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                ${tableRows}
                ${
                  isLastPage
                    ? `
                      <tr class="ledger-total-row">
                        <td colspan="4">${t("মোট", "Total")}</td>
                        <td>${escapeHtml(formatCurrency(totals.monthlyAmount))}</td>
                        <td>${escapeHtml(formatCurrency(totals.othersAmount))}</td>
                        <td>${escapeHtml(formatCurrency(totals.dueAmount))}</td>
                        <td>${escapeHtml(formatCurrency(totals.totalAmount))}</td>
                      </tr>
                    `
                    : ""
                }
              </tbody>
            </table>
          </div>
        </section>
      `;
    })
    .join("");
};

const buildLedgerSharedStyles = () => `
  .ledger-pdf-page {
    width: 1122px;
    min-height: 794px;
    padding: 0;
    margin: 0 0 24px;
    background: #dfe9f1;
  }
  .ledger-sheet {
    box-sizing: border-box;
    width: 1122px;
    min-height: 794px;
    background: #ffffff;
    border: 1px solid #d9e5ef;
    border-radius: 18px;
    padding: 34px 38px;
    box-shadow: 0 20px 50px rgba(16, 24, 40, 0.08);
  }
  .ledger-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 18px;
    border-bottom: 2px solid #dce8f2;
    padding-bottom: 14px;
  }
  .ledger-header h1 {
    margin: 0;
    font-size: 30px;
    line-height: 1.15;
  }
  .ledger-header p {
    margin: 8px 0 0;
    font-size: 15px;
    color: #61758a;
  }
  .ledger-meta {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 8px;
  }
  .ledger-chip {
    border-radius: 999px;
    border: 1px solid #dce8f2;
    background: #f7fbff;
    padding: 7px 13px;
    font-size: 13px;
    font-weight: 700;
    white-space: nowrap;
  }
  .ledger-date {
    font-size: 13px;
    color: #61758a;
  }
  .ledger-stats {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 10px;
    margin: 16px 0 18px;
  }
  .ledger-stat {
    border: 1px solid #dce8f2;
    border-radius: 14px;
    background: #fbfdff;
    padding: 10px 12px;
  }
  .ledger-stat span {
    display: block;
    margin-bottom: 5px;
    color: #61758a;
    font-size: 12px;
  }
  .ledger-stat strong {
    font-size: 20px;
    line-height: 1.1;
  }
  .ledger-table {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
    font-size: 13px;
  }
  .ledger-table th,
  .ledger-table td {
    border: 1px solid #e5edf4;
    padding: 8px 7px;
    text-align: left;
    vertical-align: top;
    word-break: break-word;
  }
  .ledger-table th {
    background: #f3f8fc;
    font-size: 12px;
    font-weight: 700;
  }
  .ledger-total-row td {
    background: #f8fbfe;
    font-weight: 700;
  }
`;

const buildLedgerPdfPagesMarkup = (
  rows: FeeLedgerExportRow[],
  billingMonth: string,
  t: (bn: string, en: string) => string,
) => `
  <div id="ledger-pdf-root">
    <style>
      #ledger-pdf-root {
        position: fixed;
        left: -10000px;
        top: 0;
        z-index: -1;
        pointer-events: none;
        background: #dfe9f1;
        padding: 24px;
        font-family: "Hind Siliguri", "Noto Sans Bengali", Arial, sans-serif;
        color: #102030;
      }
      ${buildLedgerSharedStyles()}
    </style>
    ${buildLedgerPageSections(rows, billingMonth, t)}
  </div>
`;

const buildLedgerPrintHtml = (
  rows: FeeLedgerExportRow[],
  billingMonth: string,
  t: (bn: string, en: string) => string,
) => `<!DOCTYPE html>
  <html lang="bn">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Fee Ledger</title>
      <style>
        @page {
          size: A4 landscape;
          margin: 10mm;
        }
        * { box-sizing: border-box; }
        body {
          margin: 0;
          background: #dfe9f1;
          font-family: "Hind Siliguri", "Noto Sans Bengali", Arial, sans-serif;
          color: #102030;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        .print-root {
          padding: 12px;
        }
        ${buildLedgerSharedStyles()}
        .ledger-pdf-page {
          margin: 0 auto 18px;
          page-break-after: always;
        }
        .ledger-pdf-page:last-child {
          page-break-after: auto;
        }
        @media print {
          body {
            background: #ffffff;
          }
          .print-root {
            padding: 0;
          }
          .ledger-pdf-page {
            margin: 0;
          }
          .ledger-sheet {
            border-radius: 0;
            box-shadow: none;
            border: 0;
          }
        }
      </style>
    </head>
    <body>
      <div class="print-root">
        ${buildLedgerPageSections(rows, billingMonth, t)}
      </div>
    </body>
  </html>
`;

export const downloadFeeLedgerPdf = async (
  rows: FeeLedgerExportRow[],
  billingMonth: string,
  t: (bn: string, en: string) => string,
) => {
  const host = document.createElement("div");
  host.innerHTML = buildLedgerPdfPagesMarkup(rows, billingMonth, t);
  document.body.appendChild(host);

  try {
    if ("fonts" in document) {
      await document.fonts.ready;
    }

    await new Promise((resolve) => window.requestAnimationFrame(() => resolve(null)));

    const pageElements = Array.from(host.querySelectorAll<HTMLElement>(".ledger-pdf-page"));
    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    for (const [index, pageElement] of pageElements.entries()) {
      const canvas = await html2canvas(pageElement, {
        backgroundColor: "#dfe9f1",
        scale: 2,
        useCORS: true,
      });

      if (index > 0) {
        pdf.addPage();
      }

      const imageData = canvas.toDataURL("image/png");
      pdf.addImage(imageData, "PNG", 0, 0, pageWidth, pageHeight);
    }

    pdf.save(`fee-ledger-${sanitizeFilePart(billingMonth)}.pdf`);
  } finally {
    host.remove();
  }
};

export const printFeeLedger = async (
  rows: FeeLedgerExportRow[],
  billingMonth: string,
  t: (bn: string, en: string) => string,
) => {
  const printWindow = window.open("about:blank", "_blank", "width=1400,height=900");

  if (!printWindow) {
    throw new Error("Unable to open print window.");
  }

  printWindow.document.open();
  printWindow.document.write(buildLedgerPrintHtml(rows, billingMonth, t));
  printWindow.document.close();

  const triggerPrint = () => {
    printWindow.focus();
    printWindow.print();
  };

  if (printWindow.document.readyState === "complete") {
    setTimeout(triggerPrint, 150);
    return;
  }

  printWindow.addEventListener("load", () => setTimeout(triggerPrint, 150), { once: true });
};

export const downloadFeeLedgerExcel = (
  rows: FeeLedgerExportRow[],
  billingMonth: string,
  t: (bn: string, en: string) => string,
) => {
  const totals = getLedgerTotals(rows);
  const tableRows = rows
    .map(
      (row) => `
        <tr>
          <td>${escapeHtml(row.studentId || "-")}</td>
          <td>${escapeHtml(row.studentName || "-")}</td>
          <td>${escapeHtml(row.className || "-")}</td>
          <td>${escapeHtml(row.dateLabel || "-")}</td>
          <td>${row.monthlyAmount ? escapeHtml(formatCurrency(row.monthlyAmount)) : "-"}</td>
          <td>${row.othersAmount ? escapeHtml(formatCurrency(row.othersAmount)) : "-"}</td>
          <td>${row.dueAmount ? escapeHtml(formatCurrency(row.dueAmount)) : "-"}</td>
          <td>${row.totalAmount ? escapeHtml(formatCurrency(row.totalAmount)) : "-"}</td>
        </tr>
      `,
    )
    .join("");

  const html = `
    <html>
      <head>
        <meta charset="utf-8" />
      </head>
      <body>
        <table border="1">
          <thead>
            <tr>
              <th colspan="8">${t("মাসভিত্তিক ফি লেজার", "Monthly Fee Ledger")} - ${escapeHtml(billingMonth)}</th>
            </tr>
            <tr>
              <th>${t("স্টুডেন্ট আইডি", "Student ID")}</th>
              <th>${t("নাম", "Name")}</th>
              <th>${t("ক্লাস", "Class")}</th>
              <th>${t("তারিখ", "Date")}</th>
              <th>M.P.</th>
              <th>Others</th>
              <th>Due</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
            <tr>
              <td colspan="4">${t("মোট", "Total")}</td>
              <td>${escapeHtml(formatCurrency(totals.monthlyAmount))}</td>
              <td>${escapeHtml(formatCurrency(totals.othersAmount))}</td>
              <td>${escapeHtml(formatCurrency(totals.dueAmount))}</td>
              <td>${escapeHtml(formatCurrency(totals.totalAmount))}</td>
            </tr>
          </tbody>
        </table>
      </body>
    </html>
  `;

  const blob = new Blob([`\uFEFF${html}`], { type: "application/vnd.ms-excel;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `fee-ledger-${sanitizeFilePart(billingMonth)}.xls`;
  link.click();
  URL.revokeObjectURL(url);
};
