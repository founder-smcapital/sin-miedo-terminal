import jsPDF from "jspdf";

export const pageWidth = 210;
export const pageHeight = 297;
export const leftMargin = 14;
export const contentWidth = 182; // 210 - 28
export const bottomMargin = 18;

// Exact Institutional Color Palette
export const cNavy = [14, 26, 43] as const;
export const cDeepNavy = [10, 17, 28] as const;
export const cGold = [176, 141, 87] as const;
export const cLightGold = [229, 199, 148] as const;
export const cPaleGold = [248, 244, 237] as const;
export const cCharcoal = [26, 29, 36] as const;
export const cLightBg = [248, 250, 252] as const;
export const cBorder = [226, 232, 240] as const;
export const cMuted = [100, 116, 139] as const;
export const cDarkText = [15, 23, 42] as const;
export const cRed = [185, 28, 28] as const;
export const cGreen = [16, 185, 129] as const;
export const cAmber = [217, 119, 6] as const;
export const cBlue = [37, 99, 235] as const;

export const drawSectionHeading = (doc: jsPDF, y: number, title: string, subtitle?: string): number => {
  doc.setFillColor(cNavy[0], cNavy[1], cNavy[2]);
  doc.rect(leftMargin, y, 3, 7.5, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(cNavy[0], cNavy[1], cNavy[2]);
  doc.text(title.toUpperCase(), leftMargin + 5.5, y + 5.3);

  if (subtitle) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.2);
    doc.setTextColor(cMuted[0], cMuted[1], cMuted[2]);
    doc.text(subtitle, leftMargin + contentWidth, y + 5.3, { align: "right" });
  }

  const lineY = y + 8.5;
  doc.setDrawColor(cGold[0], cGold[1], cGold[2]);
  doc.setLineWidth(0.4);
  doc.line(leftMargin, lineY, leftMargin + contentWidth, lineY);
  return lineY + 3.5;
};

export const drawRunningHeadersFooters = (doc: jsPDF, refCode: string, timeUtcStr: string): void => {
  const totalPages = doc.getNumberOfPages();

  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);

    // Running top header on pages > 1
    if (p > 1) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(6.8);
      doc.setTextColor(cNavy[0], cNavy[1], cNavy[2]);
      doc.text("SIN MIEDO CAPITAL", leftMargin, 11);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(6.2);
      doc.setTextColor(cGold[0], cGold[1], cGold[2]);
      doc.text("// DAILY MACRO BRIEFING & DATA VISUALIZATION DOSSIER", leftMargin + 26, 11);

      doc.setTextColor(cMuted[0], cMuted[1], cMuted[2]);
      doc.text(`REF: ${refCode} | ${timeUtcStr}`, leftMargin + contentWidth, 11, { align: "right" });

      doc.setDrawColor(cBorder[0], cBorder[1], cBorder[2]);
      doc.setLineWidth(0.2);
      doc.line(leftMargin, 13, leftMargin + contentWidth, 13);
    }

    // Running bottom footer on all pages
    doc.setDrawColor(cBorder[0], cBorder[1], cBorder[2]);
    doc.setLineWidth(0.25);
    doc.line(leftMargin, pageHeight - 11, leftMargin + contentWidth, pageHeight - 11);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(6);
    doc.setTextColor(cMuted[0], cMuted[1], cMuted[2]);
    doc.text("RESEARCH & CONTENT DOSSIER // © 2026 SIN MIEDO CAPITAL & TRADE IN MOTIONS. CITATION AUTHORIZED.", leftMargin, pageHeight - 7.5);

    doc.setFont("courier", "bold");
    doc.setFontSize(6.5);
    doc.setTextColor(cNavy[0], cNavy[1], cNavy[2]);
    doc.text(`Page ${p} of ${totalPages}`, leftMargin + contentWidth, pageHeight - 7.5, { align: "right" });
  }
};
