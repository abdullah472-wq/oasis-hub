import type { AttendanceRecord } from "@/lib/attendanceService";

interface AttendanceSummaryIdentity {
  key: string;
  guardianUid: string;
  studentId: string;
  studentName: string;
  className: string;
  section: string;
  roll: number;
}

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");

const sanitizeFilePart = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u0980-\u09ff]+/gi, "-")
    .replace(/^-+|-+$/g, "") || "attendance";

export const buildAttendanceSummaryOptions = (records: AttendanceRecord[]) => {
  const map = new Map<string, AttendanceSummaryIdentity>();

  records.forEach((record) => {
    const key = `${record.guardianUid || "no-guardian"}::${record.studentId}`;
    if (map.has(key)) return;

    map.set(key, {
      key,
      guardianUid: record.guardianUid,
      studentId: record.studentId,
      studentName: record.studentName,
      className: record.className,
      section: record.section,
      roll: record.roll,
    });
  });

  return Array.from(map.values()).sort(
    (a, b) => a.studentName.localeCompare(b.studentName) || a.className.localeCompare(b.className) || a.studentId.localeCompare(b.studentId),
  );
};

const buildAttendanceSummaryHtml = (
  records: AttendanceRecord[],
  identity: AttendanceSummaryIdentity,
  month: string,
) => {
  const generatedOn = new Date().toLocaleDateString("bn-BD");
  const present = records.filter((item) => item.status === "present").length;
  const absent = records.filter((item) => item.status === "absent").length;
  const late = records.filter((item) => item.status === "late").length;
  const leave = records.filter((item) => item.status === "leave").length;
  const attendancePercent = records.length === 0 ? 0 : Math.round(((present + late + leave) / records.length) * 100);

  const rows = records
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(
      (record, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${escapeHtml(record.date)}</td>
          <td>${escapeHtml(record.status)}</td>
          <td>${escapeHtml(record.remark || "-")}</td>
        </tr>`,
    )
    .join("");

  return `<!DOCTYPE html>
  <html lang="bn">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Attendance Summary</title>
      <style>
        @page { size: A4 portrait; margin: 12mm; }
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
        h1 { margin: 0; font-size: 28px; line-height: 1.15; }
        .muted { margin-top: 6px; color: #61758a; font-size: 13px; }
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
        .meta, .stats { display: grid; gap: 12px; }
        .meta { grid-template-columns: repeat(2, minmax(0, 1fr)); margin-top: 20px; }
        .stats { grid-template-columns: repeat(5, minmax(0, 1fr)); margin: 16px 0 20px; }
        .card {
          border: 1px solid #dce8f2;
          border-radius: 18px;
          padding: 12px 14px;
          background: #fbfdff;
        }
        .card strong {
          display: block;
          margin-bottom: 5px;
          color: #61758a;
          font-size: 12px;
          font-weight: 600;
        }
        .card span { font-size: 15px; font-weight: 600; }
        .stats .card span { font-size: 20px; }
        table { width: 100%; border-collapse: collapse; }
        th, td {
          border: 1px solid #e5edf4;
          padding: 10px 8px;
          text-align: left;
          vertical-align: top;
          font-size: 13px;
        }
        th { background: #f3f8fc; font-weight: 700; }
        .footer-note {
          margin-top: 16px;
          font-size: 12px;
          color: #61758a;
          text-align: right;
        }
        @media print {
          body { background: #fff; }
          .sheet {
            margin: 0;
            min-height: auto;
            max-width: none;
            border: 0;
            border-radius: 0;
            box-shadow: none;
            padding: 0;
          }
        }
      </style>
    </head>
    <body>
      <div class="sheet">
        <div class="header">
          <div>
            <h1>মাসিক উপস্থিতি সামারি</h1>
            <p class="muted">শিক্ষার্থীর উপস্থিতি, অনুপস্থিতি এবং দৈনিক স্ট্যাটাসের সারাংশ</p>
            <div class="header-meta">
              <div class="header-chip">প্রতিষ্ঠান: আননূর শিক্ষা পরিবার</div>
              <div class="header-chip">তারিখ: ${escapeHtml(generatedOn)}</div>
            </div>
          </div>
          <div class="month-badge">মাস: ${escapeHtml(month)}</div>
        </div>

        <div class="meta">
          <div class="card"><strong>শিক্ষার্থীর নাম</strong><span>${escapeHtml(identity.studentName)}</span></div>
          <div class="card"><strong>শ্রেণি</strong><span>${escapeHtml(identity.className || "-")}</span></div>
          <div class="card"><strong>সেকশন</strong><span>${escapeHtml(identity.section || "-")}</span></div>
          <div class="card"><strong>স্টুডেন্ট আইডি</strong><span>${escapeHtml(identity.studentId || "-")}</span></div>
        </div>

        <div class="stats">
          <div class="card"><strong>মোট দিন</strong><span>${records.length}</span></div>
          <div class="card"><strong>উপস্থিত</strong><span>${present}</span></div>
          <div class="card"><strong>অনুপস্থিত</strong><span>${absent}</span></div>
          <div class="card"><strong>বিলম্বিত</strong><span>${late}</span></div>
          <div class="card"><strong>ছুটি</strong><span>${leave}</span></div>
        </div>

        <div class="card" style="margin-bottom: 20px;">
          <strong>উপস্থিতির হার</strong>
          <span>${attendancePercent}%</span>
        </div>

        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>তারিখ</th>
              <th>স্ট্যাটাস</th>
              <th>মন্তব্য</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>

        <p class="footer-note">প্রস্তুতকরণ তারিখ: ${new Date().toLocaleString("bn-BD")}</p>
      </div>
    </body>
  </html>`;
};

export const downloadAttendanceSummary = (
  records: AttendanceRecord[],
  identity: AttendanceSummaryIdentity,
  month: string,
) => {
  const html = buildAttendanceSummaryHtml(records, identity, month);
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `attendance-summary-${sanitizeFilePart(identity.studentName)}-${month}.html`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
};

export const printAttendanceSummary = (
  records: AttendanceRecord[],
  identity: AttendanceSummaryIdentity,
  month: string,
) => {
  const html = buildAttendanceSummaryHtml(records, identity, month);
  const printWindow = window.open("", "_blank", "noopener,noreferrer,width=980,height=800");

  if (!printWindow) return;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();

  setTimeout(() => {
    printWindow.print();
  }, 250);
};
