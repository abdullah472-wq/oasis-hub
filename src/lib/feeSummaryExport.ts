import type { FeeEntry } from "@/lib/feeEntries";

interface GuardianMonthlySummaryIdentity {
  guardianUid: string;
  guardianName: string;
  guardianPhone?: string;
  studentId: string;
  studentName: string;
  className: string;
}

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");

const formatCurrency = (value: number) => `৳${value.toLocaleString("en-US")}`;

const sanitizeFilePart = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u0980-\u09ff]+/gi, "-")
    .replace(/^-+|-+$/g, "") || "guardian";

export const buildGuardianMonthlySummaryOptions = (entries: FeeEntry[]) => {
  const map = new Map<string, GuardianMonthlySummaryIdentity>();

  entries.forEach((entry) => {
    const key = `${entry.guardianUid || "no-guardian"}::${entry.studentId}`;
    if (map.has(key)) return;

    map.set(key, {
      guardianUid: entry.guardianUid,
      guardianName: entry.guardianName || "অভিভাবক",
      guardianPhone: entry.guardianPhone,
      studentId: entry.studentId,
      studentName: entry.studentName,
      className: entry.className,
    });
  });

  return Array.from(map.entries())
    .map(([key, value]) => ({ key, ...value }))
    .sort((a, b) => a.studentName.localeCompare(b.studentName) || a.guardianName.localeCompare(b.guardianName));
};

export const downloadGuardianMonthlySummary = (
  entries: FeeEntry[],
  identity: GuardianMonthlySummaryIdentity,
  billingMonth: string,
) => {
  const html = buildGuardianMonthlySummaryHtml(entries, identity, billingMonth);
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `fee-summary-${sanitizeFilePart(identity.studentName)}-${billingMonth}.html`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
};

export const printGuardianMonthlySummary = (
  entries: FeeEntry[],
  identity: GuardianMonthlySummaryIdentity,
  billingMonth: string,
) => {
  const html = buildGuardianMonthlySummaryHtml(entries, identity, billingMonth);
  const printWindow = window.open("about:blank", "_blank", "width=980,height=800");

  if (!printWindow) return;

  printWindow.document.open();
  printWindow.document.write(html);
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

const buildGuardianMonthlySummaryHtml = (
  entries: FeeEntry[],
  identity: GuardianMonthlySummaryIdentity,
  billingMonth: string,
) => {
  const generatedOn = new Date().toLocaleDateString("bn-BD");
  const totalAmount = entries.reduce((sum, item) => sum + item.amount, 0);
  const totalPaid = entries.reduce((sum, item) => sum + item.paidAmount, 0);
  const totalDue = entries.reduce((sum, item) => sum + item.dueAmount, 0);
  const unpaidItems = entries.filter((item) => item.status !== "paid").length;

  const rows = entries
    .sort((a, b) => a.title.localeCompare(b.title))
    .map(
      (entry, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${escapeHtml(entry.title)}</td>
          <td>${escapeHtml(entry.category)}</td>
          <td>${formatCurrency(entry.amount)}</td>
          <td>${formatCurrency(entry.paidAmount)}</td>
          <td>${formatCurrency(entry.dueAmount)}</td>
          <td>${escapeHtml(entry.status)}</td>
        </tr>`,
    )
    .join("");

  return `<!DOCTYPE html>
  <html lang="bn">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Guardian Fee Summary</title>
      <style>
        @page {
          size: A4 portrait;
          margin: 16mm 12mm 12mm;
        }
        * { box-sizing: border-box; }
        body {
          margin: 0;
          background: #eef4f8;
          color: #102030;
          font-family: "Hind Siliguri", "Noto Sans Bengali", Arial, sans-serif;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        .sheet {
          width: 100%;
          max-width: 186mm;
          min-height: 273mm;
          margin: 18px auto;
          background: #ffffff;
          border: 1px solid #d9e5ef;
          border-radius: 24px;
          padding: 22px;
          box-shadow: 0 20px 50px rgba(16, 24, 40, 0.08);
        }
        .header {
          display: flex;
          align-items: end;
          justify-content: space-between;
          gap: 16px;
          border-bottom: 2px solid #dce8f2;
          padding-bottom: 14px;
        }
        h1 {
          margin: 0;
          font-size: 28px;
          line-height: 1.15;
        }
        .muted {
          margin-top: 6px;
          color: #61758a;
          font-size: 13px;
        }
        .month-badge {
          border-radius: 999px;
          border: 1px solid #dce8f2;
          background: #f7fbff;
          padding: 8px 14px;
          font-size: 13px;
          font-weight: 600;
          white-space: nowrap;
        }
        .header-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 10px;
        }
        .header-chip {
          border-radius: 999px;
          border: 1px solid #dce8f2;
          background: #f7fbff;
          padding: 6px 12px;
          font-size: 12px;
          font-weight: 600;
          color: #3f5368;
        }
        .meta {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
          margin-top: 20px;
        }
        .meta-card,
        .stat-card {
          border: 1px solid #dce8f2;
          border-radius: 18px;
          padding: 12px 14px;
          background: #fbfdff;
        }
        .meta-card strong,
        .stat-card strong {
          display: block;
          margin-bottom: 5px;
          color: #61758a;
          font-size: 12px;
          font-weight: 600;
        }
        .meta-card span,
        .stat-card span {
          font-size: 15px;
          font-weight: 600;
        }
        .stats {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
          margin: 16px 0 20px;
        }
        .stat-card span {
          font-size: 20px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        th,
        td {
          border: 1px solid #e5edf4;
          padding: 10px 8px;
          text-align: left;
          vertical-align: top;
          font-size: 13px;
        }
        th {
          background: #f3f8fc;
          font-weight: 700;
        }
        .footer-note {
          margin-top: 16px;
          font-size: 12px;
          color: #61758a;
          text-align: right;
        }
        @media print {
          body {
            background: #fff;
          }
          .sheet {
            margin: 0;
            min-height: auto;
            max-width: none;
            border: 0;
            border-radius: 0;
            box-shadow: none;
            padding: 6mm 0 0;
          }
        }
      </style>
    </head>
    <body>
      <div class="sheet">
        <div class="header">
          <div>
            <h1>গার্ডিয়ান মাসিক ফি সামারি</h1>
            <p class="muted">শিক্ষার্থীভিত্তিক মাসিক ফি, পরিশোধিত অংশ এবং বকেয়া হিসাব</p>
            <div class="header-meta">
              <div class="header-chip">প্রতিষ্ঠান: আননূর শিক্ষা পরিবার</div>
              <div class="header-chip">তারিখ: ${escapeHtml(generatedOn)}</div>
            </div>
          </div>
          <div class="month-badge">মাস: ${escapeHtml(billingMonth)}</div>
        </div>

        <div class="meta">
          <div class="meta-card">
            <strong>অভিভাবকের নাম</strong>
            <span>${escapeHtml(identity.guardianName)}</span>
          </div>
          <div class="meta-card">
            <strong>মোবাইল</strong>
            <span>${escapeHtml(identity.guardianPhone || "-")}</span>
          </div>
          <div class="meta-card">
            <strong>শিক্ষার্থীর নাম</strong>
            <span>${escapeHtml(identity.studentName)}</span>
          </div>
          <div class="meta-card">
            <strong>শ্রেণি</strong>
            <span>${escapeHtml(identity.className || "-")}</span>
          </div>
        </div>

        <div class="stats">
          <div class="stat-card">
            <strong>মোট ফি</strong>
            <span>${formatCurrency(totalAmount)}</span>
          </div>
          <div class="stat-card">
            <strong>পরিশোধিত</strong>
            <span>${formatCurrency(totalPaid)}</span>
          </div>
          <div class="stat-card">
            <strong>বাকি</strong>
            <span>${formatCurrency(totalDue)}</span>
          </div>
          <div class="stat-card">
            <strong>অসম্পূর্ণ আইটেম</strong>
            <span>${unpaidItems}</span>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>ফি আইটেম</th>
              <th>ক্যাটাগরি</th>
              <th>মোট</th>
              <th>পরিশোধিত</th>
              <th>বাকি</th>
              <th>স্ট্যাটাস</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>

        <p class="footer-note">প্রস্তুতকরণ তারিখ: ${new Date().toLocaleString("bn-BD")}</p>
      </div>
    </body>
  </html>`;
};
