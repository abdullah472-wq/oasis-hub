import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import type { Result, ResultSubjectMark } from "./results";

declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: Record<string, unknown>) => jsPDF;
  }
}

export const exportResultsToExcel = (results: Result[], fileName: string) => {
  const data = results.map((r) => {
    const row: Record<string, string | number> = {
      "Student ID": r.studentId || "",
      "Student Name": r.studentName || "",
      Class: r.className || "",
      Section: r.section || "",
      Roll: r.roll || 0,
      Exam: r.exam || "",
      "Total Marks": r.totalMarks || 0,
      "Obtained Marks": r.obtainedMarks || 0,
      GPA: r.gpa || 0,
      Grade: r.grade || "",
      Position: r.position || 0,
    };
    r.subjects?.forEach((s) => {
      row[s.name] = s.totalMark;
      row[`${s.name} (Max)`] = s.totalMaxMark;
    });
    return row;
  });

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Results");
  XLSX.writeFile(wb, `${fileName}.xlsx`);
};

export const exportResultsToCSV = (results: Result[], fileName: string) => {
  const headers = ["ID", "Name", "Class", "Section", "Roll", "Exam", "Total", "Obtained", "GPA", "Grade", "Position"];
  const rows = results.map((r) => [
    r.studentId || "", r.studentName || "", r.className || "", r.section || "", r.roll || 0,
    r.exam || "", r.totalMarks || 0, r.obtainedMarks || 0, r.gpa || 0, r.grade || "", r.position || 0,
  ]);
  const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${fileName}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
};

export const exportMeritListToPDF = (
  results: { rank: number; name: string; roll: number; total: number; gpa: number; grade: string }[],
  title: string,
) => {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text(title, 14, 20);
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 28);

  const headers = [["#", "Name", "Roll", "Total", "GPA", "Grade"]];
  const data = results.map((r) => [r.rank, r.name, r.roll, r.total, r.gpa.toFixed(2), r.grade]);

  doc.autoTable({
    head: headers,
    body: data,
    startY: 35,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [30, 64, 175] },
  });

  doc.save(`${title.replace(/\s+/g, "_")}.pdf`);
};

export const generateResultCardPDF = (result: Result, institutionName: string) => {
  const doc = new jsPDF();
  let y = 20;

  doc.setFontSize(18);
  doc.setTextColor(30, 64, 175);
  doc.text(institutionName, 105, y, { align: "center" });
  y += 10;
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text("RESULT CARD", 105, y, { align: "center" });
  y += 12;
  doc.setFontSize(10);
  doc.text(`Exam: ${result.exam}`, 14, y);
  y += 7;
  doc.text(`Student: ${result.studentName || ""}`, 14, y);
  doc.text(`Class: ${result.className || ""}`, 120, y);
  y += 7;
  doc.text(`Roll: ${result.roll || ""}`, 14, y);
  doc.text(`ID: ${result.studentId || ""}`, 120, y);
  y += 10;

  const headers = [["Subject", "Max Marks", "Obtained"]];
  const data = (result.subjects || []).map((s: ResultSubjectMark) => [s.name, s.totalMaxMark, s.totalMark]);
  data.push(["TOTAL", result.totalMarks || 0, result.obtainedMarks || 0]);

  doc.autoTable({
    head: headers,
    body: data,
    startY: y,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [30, 64, 175] },
  });

  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
  doc.setFontSize(11);
  doc.text(`GPA: ${(result.gpa || 0).toFixed(2)}`, 14, y);
  doc.text(`Grade: ${result.grade || ""}`, 80, y);
  doc.text(`Position: ${result.position || ""}`, 140, y);

  doc.save(`Result_Card_${result.studentName || result.studentId || "unknown"}.pdf`);
};
