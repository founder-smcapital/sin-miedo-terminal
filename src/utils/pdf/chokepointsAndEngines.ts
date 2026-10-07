import jsPDF from "jspdf";
import {
  cNavy,
  cGold,
  cLightGold,
  cPaleGold,
  cLightBg,
  cBorder,
  cMuted,
  cDarkText,
  cRed,
  cGreen,
  cAmber,
  cBlue,
  leftMargin,
  contentWidth
} from "./pdfTheme";
import { Chokepoint, FlashAlert, MacroDataState } from "../../types";
import { generateRelevantExecutiveSummaries } from "../../data/executiveSummariesData";

export const renderChokepointsList = (
  doc: jsPDF,
  startY: number,
  chokepoints: Chokepoint[]
): number => {
  let y = startY;

  chokepoints.forEach((cp) => {
    const rH = 15.5;

    doc.setFillColor(cLightBg[0], cLightBg[1], cLightBg[2]);
    doc.roundedRect(leftMargin, y, contentWidth, rH, 1, 1, "F");
    doc.setDrawColor(cBorder[0], cBorder[1], cBorder[2]);
    doc.setLineWidth(0.25);
    doc.roundedRect(leftMargin, y, contentWidth, rH, 1, 1, "S");

    // Line 1: Name & Status
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.2);
    doc.setTextColor(cNavy[0], cNavy[1], cNavy[2]);
    doc.text(cp.name, leftMargin + 3, y + 4.2);

    const isDanger = cp.riskScore >= 80;
    doc.setFillColor(isDanger ? cRed[0] : (cp.riskScore >= 50 ? cAmber[0] : cGreen[0]), isDanger ? cRed[1] : (cp.riskScore >= 50 ? cAmber[1] : cGreen[1]), isDanger ? cRed[2] : (cp.riskScore >= 50 ? cAmber[2] : cGreen[2]));
    doc.roundedRect(leftMargin + 50, y + 1.8, 24, 3.6, 0.6, 0.6, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(5.5);
    doc.setTextColor(255, 255, 255);
    doc.text(cp.status, leftMargin + 62, y + 4.3, { align: "center" });

    // Numerical Score
    doc.setFont("courier", "bold");
    doc.setFontSize(6.5);
    doc.setTextColor(cNavy[0], cNavy[1], cNavy[2]);
    doc.text(`THREAT SCORE: ${cp.riskScore}/100`, leftMargin + contentWidth - 3, y + 4.3, { align: "right" });

    // Line 2: Horizontal Risk Gauge
    const barX = leftMargin + 3;
    const barW = contentWidth - 6;
    const barY = y + 6.4;

    doc.setFillColor(220, 226, 235);
    doc.roundedRect(barX, barY, barW, 2.2, 0.6, 0.6, "F");

    doc.setFillColor(isDanger ? cRed[0] : (cp.riskScore >= 50 ? cAmber[0] : cGreen[0]), isDanger ? cRed[1] : (cp.riskScore >= 50 ? cAmber[1] : cGreen[1]), isDanger ? cRed[2] : (cp.riskScore >= 50 ? cAmber[2] : cGreen[2]));
    doc.roundedRect(barX, barY, (barW * cp.riskScore) / 100, 2.2, 0.6, 0.6, "F");

    // Line 3: Threat & Flow (Clean Columns)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(5.5);
    doc.setTextColor(cNavy[0], cNavy[1], cNavy[2]);
    doc.text("THREAT VECTOR:", leftMargin + 3, y + 12.2);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(5.4);
    doc.setTextColor(cMuted[0], cMuted[1], cMuted[2]);
    const threatStr = cp.threat.length > 55 ? cp.threat.slice(0, 52) + "..." : cp.threat;
    doc.text(threatStr, leftMargin + 25, y + 12.2);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(5.5);
    doc.setTextColor(cNavy[0], cNavy[1], cNavy[2]);
    doc.text("FLOW IMPACT:", leftMargin + 104, y + 12.2);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(5.4);
    doc.setTextColor(cDarkText[0], cDarkText[1], cDarkText[2]);
    const flowStr = cp.flow.length > 48 ? cp.flow.slice(0, 45) + "..." : cp.flow;
    doc.text(flowStr, leftMargin + 124, y + 12.2);

    y += rH + 2;
  });

  return y;
};

export const renderCrossAssetMatrix = (doc: jsPDF, startY: number): number => {
  let y = startY;

  const matrixCols = [
    { pair: "BRENT vs GOLD", coeff: "+0.78", reg: "STRONG CO-MOVEMENT", desc: "Geopolitical risk premium and sovereign safe-haven bid coincide under Middle East escalation.", color: cGold },
    { pair: "USD/JPY vs 10Y UST", coeff: "+0.84", reg: "INTEREST RATE DRIVEN", desc: "US-Japan yield differential anchors spot FX directional beta; MoF interventions trigger abrupt reversals.", color: cGreen },
    { pair: "S&P 500 vs VIX", coeff: "-0.82", reg: "IMPLIED VOL INVERSE", desc: "Normal equity downside volatility skew; gamma flip threshold at 5,720 SPX unleashes dealer hedging.", color: cRed },
    { pair: "BTC vs NET LIQUIDITY", coeff: "+0.89", reg: "SOVEREIGN LIQUIDITY", desc: "High-beta monetary debasement hedge tracking Federal Reserve and Treasury General Account liquidity flows.", color: cBlue }
  ];

  matrixCols.forEach((m) => {
    const mH = 12.5;

    doc.setFillColor(cPaleGold[0], cPaleGold[1], cPaleGold[2]);
    doc.roundedRect(leftMargin, y, contentWidth, mH, 1, 1, "F");
    doc.setDrawColor(cGold[0], cGold[1], cGold[2]);
    doc.setLineWidth(0.25);
    doc.roundedRect(leftMargin, y, contentWidth, mH, 1, 1, "S");

    // Pair
    doc.setFont("courier", "bold");
    doc.setFontSize(7.2);
    doc.setTextColor(cNavy[0], cNavy[1], cNavy[2]);
    doc.text(m.pair, leftMargin + 3, y + 4.5);

    // Coefficient Badge
    doc.setFillColor(m.color[0], m.color[1], m.color[2]);
    doc.roundedRect(leftMargin + 50, y + 1.8, 17, 4.2, 0.6, 0.6, "F");
    doc.setFont("courier", "bold");
    doc.setFontSize(6.5);
    doc.setTextColor(255, 255, 255);
    doc.text(m.coeff, leftMargin + 58.5, y + 4.8, { align: "center" });

    // Regime Tag
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.2);
    doc.setTextColor(cGold[0], cGold[1], cGold[2]);
    doc.text(m.reg, leftMargin + 72, y + 4.5);

    // Description
    doc.setFont("helvetica", "normal");
    doc.setFontSize(5.6);
    doc.setTextColor(cDarkText[0], cDarkText[1], cDarkText[2]);
    const descLines = doc.splitTextToSize(m.desc, contentWidth - 6);
    doc.text(descLines, leftMargin + 3, y + 8.8);

    y += mH + 2;
  });

  return y;
};

export const renderEngineCardDynamic = (
  doc: jsPDF,
  startY: number,
  title: string,
  badge: string,
  badgeColor: readonly [number, number, number],
  metrics: { label: string; val: string }[],
  summary: string,
  structuralTakeaway: string,
  checkPageBreak: (neededHeight: number) => boolean
): number => {
  let y = startY;

  const summaryLines = doc.splitTextToSize(summary, contentWidth - 10);
  const stLines = doc.splitTextToSize(structuralTakeaway, contentWidth - 48);

  const summaryH = summaryLines.length * 3.2;
  const stBoxH = Math.max(7.5, stLines.length * 3.0 + 3.5);
  const cardH = 17 + summaryH + 2.5 + stBoxH + 3.5;

  checkPageBreak(cardH + 4);

  doc.setFillColor(cLightBg[0], cLightBg[1], cLightBg[2]);
  doc.roundedRect(leftMargin, y, contentWidth, cardH, 1.5, 1.5, "F");
  doc.setDrawColor(cBorder[0], cBorder[1], cBorder[2]);
  doc.setLineWidth(0.3);
  doc.roundedRect(leftMargin, y, contentWidth, cardH, 1.5, 1.5, "S");

  // Title Row
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(cNavy[0], cNavy[1], cNavy[2]);
  doc.text(title, leftMargin + 4, y + 5.2);

  // Badge
  doc.setFillColor(badgeColor[0], badgeColor[1], badgeColor[2]);
  doc.roundedRect(leftMargin + contentWidth - 48, y + 2.2, 44, 4.2, 1, 1, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.2);
  doc.setTextColor(255, 255, 255);
  doc.text(badge, leftMargin + contentWidth - 26, y + 5.2, { align: "center" });

  // Metrics Row
  let mX = leftMargin + 4;
  const mSpacing = (contentWidth - 8) / metrics.length;
  metrics.forEach((m) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(5.6);
    doc.setTextColor(cMuted[0], cMuted[1], cMuted[2]);
    doc.text(m.label.toUpperCase(), mX, y + 10);

    doc.setFont("courier", "bold");
    doc.setFontSize(6.8);
    doc.setTextColor(cDarkText[0], cDarkText[1], cDarkText[2]);
    doc.text(m.val, mX, y + 13.6);

    mX += mSpacing;
  });

  // Divider
  doc.setDrawColor(cBorder[0], cBorder[1], cBorder[2]);
  doc.line(leftMargin + 4, y + 15.8, leftMargin + contentWidth - 4, y + 15.8);

  // Narrative Summary
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.2);
  doc.setTextColor(cDarkText[0], cDarkText[1], cDarkText[2]);
  doc.text(summaryLines, leftMargin + 4, y + 19.5);

  // Structural Macro Driver Box
  const stBoxY = y + 17 + summaryH + 2.5;
  doc.setFillColor(cPaleGold[0], cPaleGold[1], cPaleGold[2]);
  doc.rect(leftMargin + 4, stBoxY, contentWidth - 8, stBoxH, "F");
  doc.setDrawColor(cGold[0], cGold[1], cGold[2]);
  doc.setLineWidth(0.25);
  doc.rect(leftMargin + 4, stBoxY, contentWidth - 8, stBoxH, "S");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(6);
  doc.setTextColor(cNavy[0], cNavy[1], cNavy[2]);
  doc.text("STRUCTURAL DRIVER:", leftMargin + 6, stBoxY + 4.2);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(5.8);
  doc.setTextColor(cDarkText[0], cDarkText[1], cDarkText[2]);
  doc.text(stLines, leftMargin + 36, stBoxY + 4.2);

  return y + cardH + 3.5;
};

export const renderExecutiveSummariesClean = (
  doc: jsPDF,
  startY: number,
  macroData: MacroDataState,
  checkPageBreak: (neededHeight: number) => boolean
): number => {
  let y = startY;
  const briefs = generateRelevantExecutiveSummaries(macroData);

  briefs.forEach((brief, idx) => {
    const summaryLines = doc.splitTextToSize(brief.summary, contentWidth - 10);
    const cleanTakeaway = brief.deskTakeaway.replace(/Take profit on |Aggressively maintain |Hold core long |Maintain long spot /gi, 'Market structure indicates ');
    const takeawayLines = doc.splitTextToSize(cleanTakeaway, contentWidth - 48);

    const summaryH = summaryLines.length * 3.2;
    const takeawayBoxH = Math.max(7, takeawayLines.length * 3.0 + 3.5);
    const bHeight = 13 + summaryH + 2.5 + takeawayBoxH + 3.5;

    checkPageBreak(bHeight + 4);

    doc.setFillColor(cPaleGold[0], cPaleGold[1], cPaleGold[2]);
    doc.roundedRect(leftMargin, y, contentWidth, bHeight, 1, 1, "F");
    doc.setDrawColor(cGold[0], cGold[1], cGold[2]);
    doc.setLineWidth(0.25);
    doc.roundedRect(leftMargin, y, contentWidth, bHeight, 1, 1, "S");

    // Header strip
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.2);
    doc.setTextColor(cNavy[0], cNavy[1], cNavy[2]);
    doc.text(`${idx + 1}. ${brief.title}`, leftMargin + 4, y + 4.8);

    // Urgency Tag
    doc.setFillColor(brief.urgency === "CRITICAL" ? cRed[0] : (brief.urgency === "HIGH" ? cAmber[0] : cNavy[0]), brief.urgency === "CRITICAL" ? cRed[1] : (brief.urgency === "HIGH" ? cAmber[1] : cNavy[1]), brief.urgency === "CRITICAL" ? cRed[2] : (brief.urgency === "HIGH" ? cAmber[2] : cNavy[2]));
    doc.roundedRect(leftMargin + contentWidth - 26, y + 2, 22, 3.8, 0.6, 0.6, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(5.8);
    doc.setTextColor(255, 255, 255);
    doc.text(brief.urgency, leftMargin + contentWidth - 15, y + 4.7, { align: "center" });

    // Category & Key Metric
    doc.setFont("courier", "bold");
    doc.setFontSize(6);
    doc.setTextColor(cGold[0], cGold[1], cGold[2]);
    doc.text(`CATEGORY: ${brief.category.toUpperCase()} | KEY METRIC: ${brief.keyMetric}`, leftMargin + 4, y + 8.8);

    // Summary Text
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.2);
    doc.setTextColor(cDarkText[0], cDarkText[1], cDarkText[2]);
    doc.text(summaryLines, leftMargin + 4, y + 13);

    // Structural Takeaway Box
    const tBoxY = y + 13 + summaryH + 2.5;
    doc.setFillColor(255, 255, 255);
    doc.rect(leftMargin + 4, tBoxY, contentWidth - 8, takeawayBoxH, "F");
    doc.setDrawColor(cBorder[0], cBorder[1], cBorder[2]);
    doc.rect(leftMargin + 4, tBoxY, contentWidth - 8, takeawayBoxH, "S");

    doc.setFillColor(cGold[0], cGold[1], cGold[2]);
    doc.rect(leftMargin + 4, tBoxY, 1.5, takeawayBoxH, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(5.8);
    doc.setTextColor(cNavy[0], cNavy[1], cNavy[2]);
    doc.text("KEY STRUCTURAL TAKEAWAY:", leftMargin + 7, tBoxY + 4.2);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(5.6);
    doc.setTextColor(cDarkText[0], cDarkText[1], cDarkText[2]);
    doc.text(takeawayLines, leftMargin + 44, tBoxY + 4.2);

    y += bHeight + 3;
  });

  return y;
};

export const renderFlashAlertsWire = (
  doc: jsPDF,
  startY: number,
  alerts: FlashAlert[],
  checkPageBreak: (neededHeight: number) => boolean
): number => {
  let y = startY;

  alerts.slice(0, 4).forEach((alert) => {
    const alertLines = doc.splitTextToSize(alert.text, contentWidth - 8);
    const aHeight = 8.5 + alertLines.length * 3.0;

    checkPageBreak(aHeight + 3);

    doc.setFillColor(cLightBg[0], cLightBg[1], cLightBg[2]);
    doc.roundedRect(leftMargin, y, contentWidth, aHeight, 1, 1, "F");
    doc.setDrawColor(cBorder[0], cBorder[1], cBorder[2]);
    doc.roundedRect(leftMargin, y, contentWidth, aHeight, 1, 1, "S");

    // Severity
    const isCrit = alert.severity === "critical";
    doc.setFillColor(isCrit ? cRed[0] : cGold[0], isCrit ? cRed[1] : cGold[1], isCrit ? cRed[2] : cGold[2]);
    doc.roundedRect(leftMargin + 2.5, y + 2, 16, 3.4, 0.6, 0.6, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(5.2);
    doc.setTextColor(255, 255, 255);
    doc.text(alert.severity.toUpperCase(), leftMargin + 10.5, y + 4.4, { align: "center" });

    // Category & Time
    doc.setFont("courier", "bold");
    doc.setFontSize(6.2);
    doc.setTextColor(cNavy[0], cNavy[1], cNavy[2]);
    doc.text(`[${alert.category}] ${alert.time}`, leftMargin + 21, y + 4.4);

    // Text
    doc.setFont("helvetica", "normal");
    doc.setFontSize(5.8);
    doc.setTextColor(cDarkText[0], cDarkText[1], cDarkText[2]);
    doc.text(alertLines, leftMargin + 3, y + 8);

    y += aHeight + 2.5;
  });

  return y;
};
