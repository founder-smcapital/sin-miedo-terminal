import { InstitutionalBrief, MacroDataState, UserSession, Currency, Chokepoint } from "../types";
import { generateRelevantExecutiveSummaries } from "../data/executiveSummariesData";
import jsPDF from "jspdf";
import {
  pageWidth,
  pageHeight,
  leftMargin,
  contentWidth,
  bottomMargin,
  cNavy,
  cDeepNavy,
  cGold,
  cLightGold,
  cPaleGold,
  cCharcoal,
  cLightBg,
  cBorder,
  cMuted,
  cDarkText,
  cRed,
  cGreen,
  cAmber,
  cBlue,
  drawSectionHeading,
  drawRunningHeadersFooters,
} from "./pdf/pdfTheme";
import {
  renderVixSurfaceChart,
  renderVixTermCurveChart,
  renderSpikeCallouts,
} from "./pdf/vixCharts";
import {
  renderGoldSupercycleChart,
  renderGprIndexChart,
} from "./pdf/macroMacroCharts";
import {
  renderNetLiquidityChart,
  renderSovereignDebtChart,
} from "./pdf/liquidityFiscalCharts";
import {
  renderChokepointsList,
  renderCrossAssetMatrix,
  renderEngineCardDynamic,
  renderExecutiveSummariesClean,
  renderFlashAlertsWire,
} from "./pdf/chokepointsAndEngines";

/**
 * Generates an institutional-grade, highly styled PDF document preview & triggers native print-to-PDF.
 * Formatted cleanly without proprietary desk execution commands, optimized for daily macro briefings and content snippets.
 */
export const downloadInstitutionalBriefPDF = (brief: InstitutionalBrief) => {
  const printWindow = window.open("", "_blank", "width=900,height=1000");
  if (!printWindow) {
    // Fallback if popup blocked: create downloadable structured text report
    const textContent = `
================================================================================
SIN MIEDO CAPITAL / TRADE IN MOTIONS - INSTITUTIONAL MACRO RESEARCH DOSSIER
================================================================================
DOCUMENT REF: ${brief.reportRefNumber}
CLASSIFICATION: ${brief.securityClassification}
INSTITUTION: ${brief.institution} (${brief.institutionAcronym})
RELEVANT DASHBOARD: ${brief.relevantDashboard}
PUBLICATION DATE: ${brief.publishDate} | LAST UPDATED: ${brief.lastUpdated}
FOCUS AREA: ${brief.authorDesk}

TITLE: ${brief.title}
SUBTITLE: ${brief.subtitle}

--------------------------------------------------------------------------------
EXECUTIVE SUMMARY:
--------------------------------------------------------------------------------
${brief.executiveSummary}

--------------------------------------------------------------------------------
QUANTITATIVE MACRO METRICS:
--------------------------------------------------------------------------------
${brief.metrics.map(m => `• ${m.label.padEnd(35)} : ${m.value} ${m.change ? `(${m.change})` : ''} [${m.note || ''}]`).join('\n')}

--------------------------------------------------------------------------------
CORE INSTITUTIONAL FINDINGS & QUANTITATIVE MODELS:
--------------------------------------------------------------------------------
${brief.keyFindings.map((f, i) => `${i + 1}. ${f}`).join('\n\n')}

--------------------------------------------------------------------------------
STRUCTURAL MARKET DRIVERS & VALUATION IMPACT:
--------------------------------------------------------------------------------
${brief.deskImplications.replace(/Maintain core long |Aggressively maintain |Take profit on |Buy |Sell /gi, 'Quantitative analysis indicates ')}

================================================================================
DISCLAIMER: This research document is prepared for institutional macro analysis 
and content repurposing by Sin Miedo Capital and Trade in Motions.
================================================================================
`;
    const blob = new Blob([textContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = brief.pdfFileName.replace(/\.pdf$/, ".txt");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return;
  }

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${brief.reportRefNumber} - ${brief.title}</title>
  <style>
    @page {
      size: A4;
      margin: 18mm 16mm 18mm 16mm;
    }
    @media print {
      body {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      .no-print {
        display: none !important;
      }
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #111827;
      background: #FFFFFF;
      line-height: 1.55;
      font-size: 13px;
      padding: 24px;
    }
    .header-bar {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2.5px solid #0E1A2B;
      padding-bottom: 12px;
      margin-bottom: 16px;
    }
    .logo-area {
      display: flex;
      flex-direction: column;
    }
    .logo-main {
      font-size: 20px;
      font-weight: 800;
      color: #0E1A2B;
      letter-spacing: -0.5px;
      text-transform: uppercase;
    }
    .logo-sub {
      font-size: 10px;
      font-weight: 600;
      color: #B08D57;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      margin-top: 2px;
    }
    .meta-box {
      text-align: right;
      font-family: "Courier New", Courier, monospace;
      font-size: 10px;
      color: #4B5563;
      line-height: 1.4;
    }
    .badge {
      display: inline-block;
      background: #0E1A2B;
      color: #EDE9DE;
      padding: 3px 8px;
      font-weight: 700;
      font-size: 9px;
      border-radius: 3px;
      text-transform: uppercase;
      margin-bottom: 4px;
    }
    .classification-tag {
      background: #FEF2F2;
      color: #991B1B;
      border: 1px solid #FCA5A5;
      padding: 2px 6px;
      font-size: 9px;
      font-weight: 700;
      border-radius: 3px;
    }
    .report-title-section {
      margin-bottom: 20px;
    }
    .source-institution {
      font-size: 12px;
      font-weight: 700;
      color: #B08D57;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      margin-bottom: 4px;
    }
    h1 {
      font-size: 21px;
      font-weight: 800;
      color: #0E1A2B;
      line-height: 1.25;
      margin-bottom: 6px;
      letter-spacing: -0.3px;
    }
    .subtitle {
      font-size: 13px;
      color: #4B5563;
      font-weight: 500;
      line-height: 1.4;
    }
    .grid-metrics {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
      margin: 18px 0;
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 6px;
      padding: 12px;
    }
    .metric-card {
      border-right: 1px solid #E2E8F0;
      padding-right: 8px;
    }
    .metric-card:last-child {
      border-right: none;
    }
    .metric-label {
      font-size: 9.5px;
      color: #64748B;
      text-transform: uppercase;
      font-weight: 600;
      margin-bottom: 2px;
    }
    .metric-val {
      font-size: 15px;
      font-weight: 800;
      color: #0E1A2B;
      font-family: "Courier New", Courier, monospace;
    }
    .metric-note {
      font-size: 9px;
      color: #94A3B8;
      margin-top: 1px;
    }
    .section-title {
      font-size: 13px;
      font-weight: 800;
      color: #0E1A2B;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      border-bottom: 1.5px solid #E2E8F0;
      padding-bottom: 4px;
      margin-top: 18px;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .summary-text {
      color: #1E293B;
      font-size: 12.5px;
      line-height: 1.65;
      margin-bottom: 12px;
      text-align: justify;
    }
    .findings-list {
      list-style-type: none;
      padding-left: 0;
      margin: 10px 0;
    }
    .findings-list li {
      position: relative;
      padding-left: 18px;
      margin-bottom: 8px;
      font-size: 12px;
      line-height: 1.55;
      color: #334155;
    }
    .findings-list li::before {
      content: "▪";
      position: absolute;
      left: 2px;
      top: -1px;
      color: #B08D57;
      font-size: 14px;
    }
    .callout-box {
      background: #F8F4ED;
      border-left: 4px solid #B08D57;
      padding: 12px 16px;
      border-radius: 0 6px 6px 0;
      margin: 16px 0;
      font-size: 12px;
      color: #1F2937;
      line-height: 1.6;
    }
    .callout-box strong {
      color: #0E1A2B;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      display: block;
      margin-bottom: 4px;
    }
    .footer-bar {
      margin-top: 24px;
      padding-top: 10px;
      border-top: 1px solid #E2E8F0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 9px;
      color: #94A3B8;
      font-family: "Courier New", Courier, monospace;
    }
    .action-panel {
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: #0E1A2B;
      padding: 10px 16px;
      border-radius: 8px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.3);
      display: flex;
      gap: 10px;
      z-index: 1000;
    }
    .btn-print {
      background: #B08D57;
      color: #0E1A2B;
      font-weight: 700;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .btn-close {
      background: transparent;
      color: #EDE9DE;
      border: 1px solid #4B5563;
      padding: 8px 12px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="action-panel no-print">
    <button class="btn-print" onclick="window.print()">Print / Save as PDF</button>
    <button class="btn-close" onclick="window.close()">Close</button>
  </div>

  <div class="header-bar">
    <div class="logo-area">
      <div class="logo-main">SIN MIEDO CAPITAL</div>
      <div class="logo-sub">TRADE IN MOTIONS // GLOBAL MACRO RESEARCH BRIEFING</div>
    </div>
    <div class="meta-box">
      <div class="badge">${brief.documentType}</div><br/>
      <span class="classification-tag">${brief.securityClassification}</span><br/>
      <strong>REF:</strong> ${brief.reportRefNumber} | <strong>DATE:</strong> ${brief.publishDate}
    </div>
  </div>

  <div class="report-title-section">
    <div class="source-institution">${brief.institution} (${brief.institutionAcronym})</div>
    <h1>${brief.title}</h1>
    <div class="subtitle">${brief.subtitle}</div>
  </div>

  <!-- Key Quantitative Metrics -->
  <div class="grid-metrics">
    ${brief.metrics.map(m => `
      <div class="metric-card">
        <div class="metric-label">${m.label}</div>
        <div class="metric-val">${m.value}</div>
        <div class="metric-note">${m.change ? `(${m.change}) ` : ''}${m.note || ''}</div>
      </div>
    `).join('')}
  </div>

  <!-- Executive Summary -->
  <div class="section-title">
    <span>Executive Summary</span>
  </div>
  <div class="summary-text">
    ${brief.executiveSummary.replace(/\n\n/g, '<br/><br/>')}
  </div>

  <!-- Key Institutional Findings -->
  <div class="section-title">
    <span>Key Institutional Findings & Quantitative Models</span>
  </div>
  <ul class="findings-list">
    ${brief.keyFindings.map(f => `<li>${f}</li>`).join('')}
  </ul>

  <!-- Structural Macro Highlights (Omitting Desk Positioning) -->
  <div class="callout-box">
    <strong>STRUCTURAL MARKET DRIVER & VALUATION CATALYST:</strong>
    ${brief.deskImplications.replace(/Maintain core long |Aggressively maintain |Take profit on |Buy |Sell /gi, 'Quantitative analysis highlights ')}
  </div>

  <!-- Footer -->
  <div class="footer-bar">
    <div>SIN MIEDO CAPITAL &copy; 2026 // ALL RIGHTS RESERVED</div>
    <div>LINKED TO: ${brief.relevantDashboard.toUpperCase()} // RESEARCH DOSSIER</div>
    <div>PAGE 1 OF 1 (EXECUTIVE BRIEF)</div>
  </div>

  <script>
    window.addEventListener('load', () => {
      setTimeout(() => {
        window.print();
      }, 500);
    });
  </script>
</body>
</html>
  `;

  printWindow.document.open();
  printWindow.document.write(htmlContent);
  printWindow.document.close();
};

/**
 * Downloads a complete composite institutional research pack containing all executive summaries
 * with proprietary desk execution commands omitted in favor of structural market analysis.
 */
export const downloadCompleteBriefingPackPDF = (briefs: InstitutionalBrief[]) => {
  const printWindow = window.open("", "_blank", "width=900,height=1000");
  if (!printWindow) return;

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>SIN MIEDO CAPITAL - Institutional Macro Briefing Pack Q3 2026</title>
  <style>
    @page {
      size: A4;
      margin: 18mm 16mm 18mm 16mm;
    }
    @media print {
      body {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      .page-break {
        page-break-after: always;
      }
      .no-print {
        display: none !important;
      }
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #111827;
      background: #FFFFFF;
      line-height: 1.55;
      font-size: 12px;
      padding: 24px;
    }
    .header-bar {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2.5px solid #0E1A2B;
      padding-bottom: 12px;
      margin-bottom: 16px;
    }
    .logo-main { font-size: 20px; font-weight: 800; color: #0E1A2B; }
    .logo-sub { font-size: 10px; font-weight: 600; color: #B08D57; letter-spacing: 1.5px; }
    .badge { background: #0E1A2B; color: #EDE9DE; padding: 3px 8px; font-weight: 700; font-size: 9px; border-radius: 3px; }
    .brief-container { margin-bottom: 30px; }
    h1 { font-size: 18px; font-weight: 800; color: #0E1A2B; margin-bottom: 4px; }
    .source { font-size: 11px; font-weight: 700; color: #B08D57; text-transform: uppercase; }
    .summary { font-size: 11.5px; line-height: 1.6; color: #1E293B; margin: 10px 0; }
    .findings { list-style: square; padding-left: 18px; font-size: 11px; color: #334155; margin: 8px 0; }
    .findings li { margin-bottom: 4px; }
    .callout { background: #F8F4ED; border-left: 4px solid #B08D57; padding: 8px 12px; font-size: 11px; margin: 8px 0; }
    .action-panel { position: fixed; bottom: 20px; right: 20px; background: #0E1A2B; padding: 10px 16px; border-radius: 8px; }
    .btn-print { background: #B08D57; color: #0E1A2B; font-weight: 700; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; }
  </style>
</head>
<body>
  <div class="action-panel no-print">
    <button class="btn-print" onclick="window.print()">Print / Save Complete Pack (PDF)</button>
  </div>

  <div class="header-bar">
    <div>
      <div class="logo-main">SIN MIEDO CAPITAL // TRADE IN MOTIONS</div>
      <div class="logo-sub">INSTITUTIONAL MACRO RESEARCH COMPENDIUM // Q3 2026</div>
    </div>
    <div style="text-align: right; font-family: monospace; font-size: 10px;">
      <span class="badge">RESEARCH COMPENDIUM</span><br/>
      DATE: ${new Date().toLocaleDateString()} | REVISION: 4.2
    </div>
  </div>

  <div style="background: #0E1A2B; color: #EDE9DE; padding: 14px; border-radius: 6px; margin-bottom: 20px;">
    <h2 style="font-size: 15px; margin-bottom: 4px;">Executive Research Compendium</h2>
    <p style="font-size: 11px; color: #94A3B8;">Multi-source quantitative briefings from Bank of Japan, Goldman Sachs, Banco de España, Oxford Institute for Energy Studies, CSIS, World Gold Council, and US Treasury OFAC.</p>
  </div>

  ${briefs.map((brief, idx) => `
    <div class="brief-container ${idx < briefs.length - 1 ? 'page-break' : ''}">
      <div class="source">${brief.institution} (${brief.institutionAcronym}) • REF: ${brief.reportRefNumber}</div>
      <h1>${brief.title}</h1>
      <div style="font-size: 11px; color: #64748B; margin-bottom: 8px;">${brief.subtitle} • <em>Linked to: ${brief.relevantDashboard}</em></div>
      
      <div style="font-weight: 700; font-size: 11px; text-transform: uppercase; color: #0E1A2B; border-bottom: 1px solid #E2E8F0; padding-bottom: 2px;">Executive Summary</div>
      <div class="summary">${brief.executiveSummary.replace(/\n\n/g, '<br/><br/>')}</div>

      <div style="font-weight: 700; font-size: 11px; text-transform: uppercase; color: #0E1A2B; border-bottom: 1px solid #E2E8F0; padding-bottom: 2px; margin-top: 8px;">Key Takeaways</div>
      <ul class="findings">
        ${brief.keyFindings.map(f => `<li>${f}</li>`).join('')}
      </ul>

      <div class="callout">
        <strong>STRUCTURAL MARKET DRIVER:</strong> ${brief.deskImplications.replace(/Maintain core long |Aggressively maintain |Take profit on |Buy |Sell /gi, 'Analysis highlights ')}
      </div>
    </div>
  `).join('')}

  <script>
    window.addEventListener('load', () => {
      setTimeout(() => { window.print(); }, 500);
    });
  </script>
</body>
</html>
  `;

  printWindow.document.open();
  printWindow.document.write(htmlContent);
  printWindow.document.close();
};

export interface DashboardPDFOptions {
  userSession?: UserSession;
  currency?: Currency;
  customNotes?: string;
}

/**
 * Generates and downloads a comprehensive institutional macro intelligence PDF report.
 * 
 * DIRECTIVE COMPLIANCE:
 * 1. OMITS proprietary desk execution/trading commands ("what the desk is doing").
 * 2. INCORPORATES AND HIGHLIGHTS rich data visualizations (vector VIX volatility surface chart with intraday spikes,
 *    key risk asset momentum range visualizers, maritime chokepoints threat gauges, and cross-asset correlation matrix),
 *    specifically formatted as standalone snippets for daily briefing content and analysis.
 */
export const downloadDashboardReportPDF = (
  macroData: MacroDataState,
  options?: DashboardPDFOptions
): void => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);
  const timeUtcStr = now.toISOString().slice(11, 19) + " UTC";
  const refCode = `SMC-MB-${dateStr.replace(/-/g, "")}-${now.getUTCHours().toString().padStart(2, "0")}${now.getUTCMinutes().toString().padStart(2, "0")}`;
  const recipientEmail = options?.userSession?.email || "tradeinmotions@gmail.com";
  const userTier = options?.userSession?.tier || "Founding Member";

  let y = 14;

  const checkPageBreak = (neededHeight: number): boolean => {
    if (y + neededHeight > pageHeight - bottomMargin) {
      doc.addPage();
      y = 20;
      return true;
    }
    return false;
  };

  // ==========================================
  // PAGE 1: COVER HEADER, SNIPPETS & TELEMETRY
  // ==========================================
  
  // Executive Header Banner
  doc.setFillColor(cNavy[0], cNavy[1], cNavy[2]);
  doc.roundedRect(leftMargin, y, contentWidth, 24, 1.5, 1.5, "F");

  // Gold Seal / Icon
  doc.setFillColor(cGold[0], cGold[1], cGold[2]);
  doc.circle(leftMargin + 10, y + 12, 6, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(cNavy[0], cNavy[1], cNavy[2]);
  doc.text("SMC", leftMargin + 10, y + 14.2, { align: "center" });

  // Main Header Text
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(255, 255, 255);
  doc.text("SIN MIEDO CAPITAL // INSTITUTIONAL MACRO BRIEFING", leftMargin + 20, y + 8.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(cLightGold[0], cLightGold[1], cLightGold[2]);
  doc.text("CROSS-ASSET TELEMETRY, VOLATILITY ARCHITECTURE & GEOPOLITICAL FLOWS", leftMargin + 20, y + 13.5);

  doc.setFont("courier", "bold");
  doc.setFontSize(6.8);
  doc.setTextColor(210, 225, 245);
  doc.text(`SESSION: ${dateStr} • ${timeUtcStr} | REF: ${refCode} | DESK: GLOBAL MACRO`, leftMargin + 20, y + 18.5);

  // Metadata Pill Right
  doc.setFillColor(cDeepNavy[0], cDeepNavy[1], cDeepNavy[2]);
  doc.roundedRect(leftMargin + contentWidth - 48, y + 4.5, 45, 15, 1, 1, "F");
  doc.setDrawColor(cGold[0], cGold[1], cGold[2]);
  doc.setLineWidth(0.25);
  doc.roundedRect(leftMargin + contentWidth - 48, y + 4.5, 45, 15, 1, 1, "S");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(5.2);
  doc.setTextColor(cLightGold[0], cLightGold[1], cLightGold[2]);
  doc.text("AUTHORIZED RECIPIENT", leftMargin + contentWidth - 45.5, y + 8);

  doc.setFont("courier", "bold");
  doc.setFontSize(5.8);
  doc.setTextColor(255, 255, 255);
  const shortEmail = recipientEmail.length > 20 ? recipientEmail.slice(0, 18) + "..." : recipientEmail;
  doc.text(shortEmail, leftMargin + contentWidth - 45.5, y + 12);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(5.5);
  doc.setTextColor(cGold[0], cGold[1], cGold[2]);
  doc.text(`TIER: ${userTier.toUpperCase()}`, leftMargin + contentWidth - 45.5, y + 16.5);

  y += 26.5;

  // Compliance Ribbon
  doc.setFillColor(cPaleGold[0], cPaleGold[1], cPaleGold[2]);
  doc.roundedRect(leftMargin, y, contentWidth, 7, 0.8, 0.8, "F");
  doc.setDrawColor(cGold[0], cGold[1], cGold[2]);
  doc.setLineWidth(0.25);
  doc.roundedRect(leftMargin, y, contentWidth, 7, 0.8, 0.8, "S");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(5.8);
  doc.setTextColor(cNavy[0], cNavy[1], cNavy[2]);
  doc.text("EXECUTIVE COMPLIANCE NOTICE // QUANTITATIVE BRIEFING & DATA VISUALIZATION DOSSIER", leftMargin + 3, y + 4.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(5.6);
  doc.setTextColor(cMuted[0], cMuted[1], cMuted[2]);
  doc.text("Proprietary desk execution commands omitted. Formatted for structural analysis and daily briefing publication.", leftMargin + contentWidth - 3, y + 4.5, { align: "right" });

  y += 9.5;

  // 3 Snippet Cards
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.2);
  doc.setTextColor(cNavy[0], cNavy[1], cNavy[2]);
  doc.text("DAILY MACRO BRIEFING SNIPPETS // KEY QUANTITATIVE HIGHLIGHTS", leftMargin, y + 3);

  const snippetCardW = (contentWidth - 6) / 3;
  const snippetCardH = 43;
  const snippetY = y + 5;

  const snippetCards = [
    {
      tag: "VOLATILITY & OPTIONS RADAR",
      title: "VIX Spikes & 0DTE Pin Mechanics",
      stat: "VIX 18.95 | +8.7% Session Peak 21.64",
      body: "Intraday CPI shock triggered 3.42 pt volatility spike. Gamma flip at 5,720 SPX forced dealer short hedging before late 0DTE call pins stabilized close.",
      color: cRed,
    },
    {
      tag: "GEOPOLITICAL CHOKEPOINTS",
      title: "Hormuz 100% Funneling Alert",
      stat: "Brent $104.20 | DEFCON 2 Escalation",
      body: "Petroline pipeline halt forces 20.8M bpd Gulf export flow through Hormuz. AIS dark fleet spoofing detected at 67 tankers. War risk premium at +$18.50/bbl.",
      color: cAmber,
    },
    {
      tag: "SOVEREIGN DEBASEMENT",
      title: "Gold Supercycle & Debt Interest",
      stat: "Gold $4,185.60 | US Debt $36.84T",
      body: "US annualized debt interest ($1,180B) exceeds defense ($892B). Central bank physical gold accumulation absorbs 32% of global mine output at record highs.",
      color: cGold,
    }
  ];

  snippetCards.forEach((snip, idx) => {
    const sx = leftMargin + idx * (snippetCardW + 3);

    doc.setFillColor(cLightBg[0], cLightBg[1], cLightBg[2]);
    doc.roundedRect(sx, snippetY, snippetCardW, snippetCardH, 1.2, 1.2, "F");
    doc.setDrawColor(cBorder[0], cBorder[1], cBorder[2]);
    doc.setLineWidth(0.3);
    doc.roundedRect(sx, snippetY, snippetCardW, snippetCardH, 1.2, 1.2, "S");

    // Tag
    doc.setFillColor(snip.color[0], snip.color[1], snip.color[2]);
    doc.roundedRect(sx + 2.5, snippetY + 2.2, snippetCardW - 5, 4.2, 0.6, 0.6, "F");
    doc.setFont("courier", "bold");
    doc.setFontSize(5.8);
    doc.setTextColor(255, 255, 255);
    doc.text(snip.tag, sx + snippetCardW / 2, snippetY + 5.2, { align: "center" });

    // Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(cNavy[0], cNavy[1], cNavy[2]);
    doc.text(snip.title, sx + 3, snippetY + 10.2);

    // Key Stat Badge
    doc.setFillColor(cPaleGold[0], cPaleGold[1], cPaleGold[2]);
    doc.roundedRect(sx + 2.5, snippetY + 12.2, snippetCardW - 5, 4.8, 0.6, 0.6, "F");
    doc.setFont("courier", "bold");
    doc.setFontSize(5.6);
    doc.setTextColor(cNavy[0], cNavy[1], cNavy[2]);
    doc.text(snip.stat, sx + snippetCardW / 2, snippetY + 15.6, { align: "center" });

    // Body Text
    doc.setFont("helvetica", "normal");
    doc.setFontSize(5.5);
    doc.setTextColor(cDarkText[0], cDarkText[1], cDarkText[2]);
    const bodyLines = doc.splitTextToSize(snip.body, snippetCardW - 6);
    doc.text(bodyLines, sx + 3, snippetY + 20.2);
  });

  y = snippetY + snippetCardH + 4;

  // Section 1: Quantitative Telemetry Table
  y = drawSectionHeading(doc, y, "1. Quantitative Cross-Asset Telemetry Table", "LIVE FEED & REGIME CLASSIFICATION");

  // Table Header
  doc.setFillColor(cNavy[0], cNavy[1], cNavy[2]);
  doc.rect(leftMargin, y, contentWidth, 5.8, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(5.8);
  doc.setTextColor(255, 255, 255);

  const colX = {
    sym: leftMargin + 2,
    name: leftMargin + 28,
    price: leftMargin + 76,
    change: leftMargin + 108,
    status: leftMargin + 134,
    signal: leftMargin + 168
  };

  doc.text("TICKER", colX.sym, y + 4.1);
  doc.text("ASSET / INSTRUMENT", colX.name, y + 4.1);
  doc.text("SPOT LEVEL", colX.price, y + 4.1);
  doc.text("24H CHANGE", colX.change, y + 4.1);
  doc.text("QUANT REGIME / STATUS", colX.status, y + 4.1);
  doc.text("SIGNAL", colX.signal, y + 4.1);

  y += 5.8;

  // 12 Tickers
  const displayTickers = macroData.tickers.slice(0, 12);
  displayTickers.forEach((t, idx) => {
    const rowH = 5.2;
    if (idx % 2 === 0) {
      doc.setFillColor(cLightBg[0], cLightBg[1], cLightBg[2]);
      doc.rect(leftMargin, y, contentWidth, rowH, "F");
    }

    doc.setDrawColor(cBorder[0], cBorder[1], cBorder[2]);
    doc.setLineWidth(0.15);
    doc.line(leftMargin, y + rowH, leftMargin + contentWidth, y + rowH);

    // Symbol
    doc.setFont("courier", "bold");
    doc.setFontSize(6.2);
    doc.setTextColor(cNavy[0], cNavy[1], cNavy[2]);
    doc.text(t.symbol, colX.sym, y + 3.8);

    // Name
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6);
    doc.setTextColor(cDarkText[0], cDarkText[1], cDarkText[2]);
    const cleanName = t.name.length > 25 ? t.name.slice(0, 23) + "..." : t.name;
    doc.text(cleanName, colX.name, y + 3.8);

    // Price
    doc.setFont("courier", "bold");
    doc.setFontSize(6.2);
    doc.setTextColor(cNavy[0], cNavy[1], cNavy[2]);
    const priceStr = t.price >= 1000 ? t.price.toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 2 }) : t.price.toFixed(2);
    doc.text(priceStr, colX.price, y + 3.8);

    // Change
    const isUp = t.change >= 0;
    doc.setFont("courier", "bold");
    doc.setFontSize(6);
    doc.setTextColor(isUp ? cGreen[0] : cRed[0], isUp ? cGreen[1] : cRed[1], isUp ? cGreen[2] : cRed[2]);
    doc.text(`${isUp ? "+" : ""}${t.change.toFixed(2)}${t.changeUnit}`, colX.change, y + 3.8);

    // Regime / Status
    doc.setFont("helvetica", "normal");
    doc.setFontSize(5.5);
    doc.setTextColor(cMuted[0], cMuted[1], cMuted[2]);
    const cleanStatus = t.status.length > 20 ? t.status.slice(0, 18) + ".." : t.status;
    doc.text(cleanStatus, colX.status, y + 3.8);

    // Signal Badge
    const sigColor = t.signal === "danger" ? cRed : (t.signal === "brass" ? cAmber : (t.signal === "emerald" ? cGreen : cMuted));
    doc.setFillColor(sigColor[0], sigColor[1], sigColor[2]);
    doc.roundedRect(colX.signal, y + 1.1, 12, 3.2, 0.6, 0.6, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(5);
    doc.setTextColor(255, 255, 255);
    doc.text(t.signal.toUpperCase(), colX.signal + 6, y + 3.3, { align: "center" });

    y += rowH;
  });

  y += 4;

  // Section 1B: Key Risk Assets 24H Session Range Bars
  y = drawSectionHeading(doc, y, "1B. Key Risk Assets 24H Momentum & Session Range", "NORMALIZED INTRADAY PERCENTILE BARS");

  const riskAssets = [
    { sym: "BRENT", name: "Brent Crude Oil", price: "$104.20", change: "+3.8%", pos: 0.88, low: "$100.80", high: "$106.40", color: cRed },
    { sym: "XAU/USD", name: "Gold Spot", price: "$4,185.60", change: "+1.3%", pos: 0.82, low: "$4,128.20", high: "$4,198.80", color: cGold },
    { sym: "SPX", name: "S&P 500 Index", price: "7,654.80", change: "+0.86%", pos: 0.72, low: "7,610.50", high: "7,688.00", color: cGreen },
    { sym: "IBEX 35", name: "IBEX 35 Benchmark", price: "19,812.00", change: "+0.91%", pos: 0.78, low: "19,640.00", high: "19,884.00", color: cGreen },
    { sym: "BTC", name: "Bitcoin / USD", price: "$118,450", change: "+2.4%", pos: 0.75, low: "$114,200", high: "$119,800", color: cGold },
    { sym: "US10Y", name: "US 10-Year Benchmark", price: "5.28%", change: "+4 bps", pos: 0.78, low: "5.23%", high: "5.30%", color: cAmber }
  ];

  riskAssets.forEach((ra) => {
    const raH = 7.5;
    doc.setFillColor(cLightBg[0], cLightBg[1], cLightBg[2]);
    doc.roundedRect(leftMargin, y, contentWidth, raH, 0.8, 0.8, "F");
    doc.setDrawColor(cBorder[0], cBorder[1], cBorder[2]);
    doc.setLineWidth(0.2);
    doc.roundedRect(leftMargin, y, contentWidth, raH, 0.8, 0.8, "S");

    // Symbol & Name
    doc.setFont("courier", "bold");
    doc.setFontSize(6.2);
    doc.setTextColor(cNavy[0], cNavy[1], cNavy[2]);
    doc.text(ra.sym, leftMargin + 2.5, y + 4.8);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(5.5);
    doc.setTextColor(cMuted[0], cMuted[1], cMuted[2]);
    doc.text(ra.name, leftMargin + 20, y + 4.8);

    // Price & Change
    doc.setFont("courier", "bold");
    doc.setFontSize(6);
    doc.setTextColor(cNavy[0], cNavy[1], cNavy[2]);
    doc.text(ra.price, leftMargin + 56, y + 4.8);

    const isUp = ra.change.startsWith("+");
    doc.setFont("courier", "bold");
    doc.setFontSize(5.8);
    doc.setTextColor(isUp ? cGreen[0] : cRed[0], isUp ? cGreen[1] : cRed[1], isUp ? cGreen[2] : cRed[2]);
    doc.text(ra.change, leftMargin + 75, y + 4.8);

    // Low Callout
    doc.setFont("courier", "normal");
    doc.setFontSize(5);
    doc.setTextColor(cMuted[0], cMuted[1], cMuted[2]);
    doc.text(`L: ${ra.low}`, leftMargin + 92, y + 4.8);

    // Range Bar
    const rBarX = leftMargin + 114;
    const rBarW = 46;
    doc.setFillColor(225, 232, 240);
    doc.roundedRect(rBarX, y + 2.8, rBarW, 2.4, 0.5, 0.5, "F");

    doc.setFillColor(ra.color[0], ra.color[1], ra.color[2]);
    doc.roundedRect(rBarX, y + 2.8, rBarW * ra.pos, 2.4, 0.5, 0.5, "F");

    // High Callout
    doc.setFont("courier", "normal");
    doc.setFontSize(5);
    doc.setTextColor(cMuted[0], cMuted[1], cMuted[2]);
    doc.text(`H: ${ra.high}`, leftMargin + 163, y + 4.8);

    y += raH + 1.4;
  });

  // ==========================================
  // PAGE 2: CBOE VIX VOLATILITY SURFACE & TERM CURVE
  // ==========================================
  doc.addPage();
  y = 20;

  y = drawSectionHeading(doc, y, "2. CBOE VIX Volatility Surface & Intraday Spikes Visualizer", "DYNAMIC TICK CURVE & SPIKE ANATOMY");

  // VIX Vector Surface Chart
  renderVixSurfaceChart(doc, leftMargin, y, contentWidth, 64);
  y += 68;

  // VIX Futures Term Curve Chart
  y = drawSectionHeading(doc, y, "2B. CBOE VIX Futures Term Structure Curve (UX1 - UX6)", "FORWARD VOLATILITY ARCHITECTURE & ROLL YIELD");
  renderVixTermCurveChart(doc, leftMargin, y, contentWidth, 46);
  y += 50;

  // Intraday Spikes Breakdown
  y = drawSectionHeading(doc, y, "2C. Intraday Volatility Spike Anatomy & Transmission Mechanics", "CATALYSTS & EQUITIES IMPACT");
  y = renderSpikeCallouts(doc, leftMargin, y, contentWidth);

  // ==========================================
  // PAGE 3: GOLD SUPERCYCLE & GPR INDEX
  // ==========================================
  doc.addPage();
  y = 20;

  y = drawSectionHeading(doc, y, "3. Gold (XAU/USD) Multi-Year Sovereign Supercycle Visualizer", "DE-DOLLARIZATION & CENTRAL BANK ACCUMULATION");
  renderGoldSupercycleChart(doc, leftMargin, y, contentWidth, 74);
  y += 77;

  // Decoupling Callout Ribbon
  doc.setFillColor(cPaleGold[0], cPaleGold[1], cPaleGold[2]);
  doc.roundedRect(leftMargin, y, contentWidth, 10, 1, 1, "F");
  doc.setDrawColor(cGold[0], cGold[1], cGold[2]);
  doc.setLineWidth(0.25);
  doc.roundedRect(leftMargin, y, contentWidth, 10, 1, 1, "S");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.2);
  doc.setTextColor(cNavy[0], cNavy[1], cNavy[2]);
  doc.text("MACRO DECOUPLING INSIGHT:", leftMargin + 3, y + 4.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(5.6);
  doc.setTextColor(cDarkText[0], cDarkText[1], cDarkText[2]);
  const gdLines = doc.splitTextToSize("Gold trades at all-time highs above $4,180/oz despite US 10Y Real Yields at +2.15%, confirming the complete structural abandonment of G7 fiat debt instruments by non-aligned reserve managers.", contentWidth - 44);
  doc.text(gdLines, leftMargin + 40, y + 4.5);

  y += 13.5;

  y = drawSectionHeading(doc, y, "4. Geopolitical Risk (GPR) Index 24-Month Kinetic Trajectory", "ENERGY RISK PREMIUM & CHOKEPOINTS WAR RISK");
  renderGprIndexChart(doc, leftMargin, y, contentWidth, 74);
  y += 77;

  // GPR Implication Box
  doc.setFillColor(cLightBg[0], cLightBg[1], cLightBg[2]);
  doc.roundedRect(leftMargin, y, contentWidth, 11, 1, 1, "F");
  doc.setDrawColor(cBorder[0], cBorder[1], cBorder[2]);
  doc.setLineWidth(0.25);
  doc.roundedRect(leftMargin, y, contentWidth, 11, 1, 1, "S");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.2);
  doc.setTextColor(cRed[0], cRed[1], cRed[2]);
  doc.text("GPR REGIME IMPLICATION:", leftMargin + 3, y + 4.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(5.6);
  doc.setTextColor(cDarkText[0], cDarkText[1], cDarkText[2]);
  const gprLines = doc.splitTextToSize("Calderara-Iacoviello GPR index at 364.5 points sits in the 99th historical percentile. Sustained tanker insurance surge to 2.8% hull value compounds global stagflationary supply friction.", contentWidth - 42);
  doc.text(gprLines, leftMargin + 38, y + 4.5);

  // ==========================================
  // PAGE 4: NET LIQUIDITY & US SOVEREIGN DEBT
  // ==========================================
  doc.addPage();
  y = 20;

  y = drawSectionHeading(doc, y, "5. Federal Reserve Net Liquidity Transmission Engine", "BALANCE SHEET WATERFALL & ASSET BETAS");
  renderNetLiquidityChart(doc, leftMargin, y, contentWidth, 74);
  y += 77;

  // Liquidity Dynamics Ribbon
  doc.setFillColor(cPaleGold[0], cPaleGold[1], cPaleGold[2]);
  doc.roundedRect(leftMargin, y, contentWidth, 10, 1, 1, "F");
  doc.setDrawColor(cGold[0], cGold[1], cGold[2]);
  doc.setLineWidth(0.25);
  doc.roundedRect(leftMargin, y, contentWidth, 10, 1, 1, "S");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.2);
  doc.setTextColor(cNavy[0], cNavy[1], cNavy[2]);
  doc.text("TRANSMISSION DYNAMICS:", leftMargin + 3, y + 4.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(5.6);
  doc.setTextColor(cDarkText[0], cDarkText[1], cDarkText[2]);
  const lLines = doc.splitTextToSize("With the $2.5T Reverse Repo (RRP) cushion depleted to $215B, every dollar of Treasury issuance now drains commercial bank reserves directly, amplifying asset sensitivity to fiscal refunding announcements.", contentWidth - 42);
  doc.text(lLines, leftMargin + 38, y + 4.5);

  y += 13.5;

  y = drawSectionHeading(doc, y, "6. US Sovereign Debt Servicing vs National Defense Visualizer", "INTEREST BURDEN & DEBT-TO-GDP REGIME RADAR");
  renderSovereignDebtChart(doc, leftMargin, y, contentWidth, 74);
  y += 77;

  // Fiscal Dominance Ribbon
  doc.setFillColor(cLightBg[0], cLightBg[1], cLightBg[2]);
  doc.roundedRect(leftMargin, y, contentWidth, 11, 1, 1, "F");
  doc.setDrawColor(cBorder[0], cBorder[1], cBorder[2]);
  doc.setLineWidth(0.25);
  doc.roundedRect(leftMargin, y, contentWidth, 11, 1, 1, "S");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.2);
  doc.setTextColor(cRed[0], cRed[1], cRed[2]);
  doc.text("FISCAL DOMINANCE REGIME:", leftMargin + 3, y + 4.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(5.6);
  doc.setTextColor(cDarkText[0], cDarkText[1], cDarkText[2]);
  const fdLines = doc.splitTextToSize("US Net Interest ($1,180B) exceeding total defense spending ($892B) by +$288B marks an irreversible fiscal dominance regime. Central bank rate decisions are structurally subjugated to sovereign funding rollover costs.", contentWidth - 42);
  doc.text(fdLines, leftMargin + 39, y + 4.5);

  // ==========================================
  // PAGE 5: MARITIME CHOKEPOINTS & CORRELATION MATRIX
  // ==========================================
  doc.addPage();
  y = 20;

  y = drawSectionHeading(doc, y, "7. Strategic Maritime Chokepoints Threat & Flow Security Visualizer", "KINETIC ESCALATION RADAR & DAILY FLOW TELEMETRY");

  const chokepointsData: Chokepoint[] = [
    { name: "Strait of Hormuz", status: "DEFCON 2", riskScore: 88, threat: "Coastal ballistic missile batteries & drone swarms active along Larak Island.", flow: "20.8M bpd tanker flow (100% Gulf funnel under Petroline halt)." },
    { name: "Bab el-Mandeb", status: "CRITICAL", riskScore: 92, threat: "Sustained anti-ship cruise missile threats against Red Sea commercial convoys.", flow: "Transit down -68% YoY; 12-14 day Cape rerouting penalty." },
    { name: "Suez Canal", status: "HIGH", riskScore: 78, threat: "Secondary blockage risk from northern Red Sea interdictions.", flow: "Daily container transit volume down -62% vs 2023 baseline." },
    { name: "Strait of Malacca", status: "MEDIUM", riskScore: 54, threat: "Subsurface surveillance operations and naval patrol escalation.", flow: "16.2M bpd Asian crude import lifeline operates under heightened security." },
    { name: "Bosporus Strait", status: "WATCH", riskScore: 42, threat: "Black Sea drifting naval mine hazard and grain corridor monitoring.", flow: "3.2M bpd Russian/Caspian crude flows maintain constrained passage." },
    { name: "Panama Canal", status: "WATCH", riskScore: 36, threat: "Freshwater draft restrictions normalized; booking auction premia stable.", flow: "32 daily vessel transits operating near maximum seasonal capacity." }
  ];

  y = renderChokepointsList(doc, y, chokepointsData);
  y += 2;

  y = drawSectionHeading(doc, y, "8. Cross-Asset Correlation & Macro Transmission Matrix", "REGIME SHIFTS & INTER-MARKET REACTION BETAS");
  y = renderCrossAssetMatrix(doc, y);

  // Synthesis Box
  doc.setFillColor(cPaleGold[0], cPaleGold[1], cPaleGold[2]);
  doc.roundedRect(leftMargin, y, contentWidth, 18, 1, 1, "F");
  doc.setDrawColor(cGold[0], cGold[1], cGold[2]);
  doc.setLineWidth(0.25);
  doc.roundedRect(leftMargin, y, contentWidth, 18, 1, 1, "S");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.5);
  doc.setTextColor(cNavy[0], cNavy[1], cNavy[2]);
  doc.text("QUANTITATIVE TRANSMISSION SYNTHESIS // DAILY TAKEAWAYS", leftMargin + 4, y + 5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(5.8);
  doc.setTextColor(cDarkText[0], cDarkText[1], cDarkText[2]);
  const synLines = doc.splitTextToSize("Persistent positive co-movement between Gold (+1.3%), Brent Crude (+3.8%), and Sovereign Yields (+8 bps) confirms a classic stagflationary geopolitical supply shock regime. The complete collapse of the traditional stock/bond diversification buffer reinforces non-sovereign monetary stores (Gold and Bitcoin) as the sole uncorrelated macro hedges.", contentWidth - 8);
  doc.text(synLines, leftMargin + 4, y + 9);

  // ==========================================
  // PAGE 6: ENGINES, INTELLIGENCE & DISCLAIMER
  // ==========================================
  doc.addPage();
  y = 20;

  y = drawSectionHeading(doc, y, "9. Macro Analysis Engines & Structural Risk Models", "EXECUTION COMMANDS OMITTED FOR BRIEFING SNIPPETS");

  // Engine A: Yen Intervention
  const yenEngine = macroData.engines.yenIntervention;
  y = renderEngineCardDynamic(
    doc,
    y,
    "ENGINE A // BANK OF JAPAN & MOF YEN INTERVENTION TELEMETRY",
    `DEFCON ${yenEngine.defcon} • ${yenEngine.defconStatus}`,
    yenEngine.interventionOdds > 70 ? cRed : cAmber,
    [
      { label: "Spot Level", val: `${yenEngine.spot.toFixed(2)}` },
      { label: "Threshold", val: `${yenEngine.threshold.toFixed(2)}` },
      { label: "Intervention Odds", val: `${yenEngine.interventionOdds}%` },
      { label: "US-Japan Spread", val: `${yenEngine.ustJgbSpread}` }
    ],
    `Spot USD/JPY trades within striking distance of the MoF direct intervention threshold at ${yenEngine.threshold.toFixed(2)}. Verbal jawboning by Kanda/Mimuro has ascended to Level ${yenEngine.jawboningLevel} ('${yenEngine.jawboningLabel}'). The wide 10Y US-Japan yield spread continues to incentivize structural carry trades until official liquidity lines trigger sharp forced unwinds.`,
    "Widening US-Japan yield differentials exert mechanical pressure on spot yen; historical intervention episodes generate abrupt 350-500 pip gap-downs upon covert reserve sales.",
    checkPageBreak
  );

  // Engine B: IBEX 35
  const ibexEngine = macroData.engines.ibexBias;
  y = renderEngineCardDynamic(
    doc,
    y,
    "ENGINE B // IBEX 35 STRUCTURAL DIRECTIONAL RISK MODEL",
    `${ibexEngine.propExecutionBias} • ${ibexEngine.volatilityRegime}`,
    cGreen,
    [
      { label: "IBEX Spot", val: `${ibexEngine.level.toFixed(1)}` },
      { label: "Daily Change", val: `${ibexEngine.dailyChange}` },
      { label: "Directional Score", val: `${ibexEngine.directionalScore}` },
      { label: "R1 Resistance", val: `${ibexEngine.keyLevels.r1}` }
    ],
    `The IBEX 35 benchmark exhibits high structural leverage to the European banking sector and sovereign bond spreads. Resilient net interest margins across Spanish domestic lenders continue to support index outperformance vs DAX/CAC amidst global energy supply shocks, with key pivot level established at ${ibexEngine.keyLevels.pivot}.`,
    "Banking net interest margin resilience provides cyclical support to Spanish equities; however, sovereign bond spread widening vs German Bunds remains the core downside tail catalyst.",
    checkPageBreak
  );

  // Engine C: Middle East War-Risk
  const meEngine = macroData.engines.middleEastWarRisk;
  y = renderEngineCardDynamic(
    doc,
    y,
    "ENGINE C // MIDDLE EAST WAR-RISK & CHOKEPOINT KINETIC ESCALATION",
    `${meEngine.riskStatus} • ESCALATION ZONE`,
    cRed,
    [
      { label: "Regional Risk", val: `${meEngine.riskIndex}/100` },
      { label: "War Premium", val: `${meEngine.brentGeopoliticalPremium}` },
      { label: "Hormuz Threat", val: `${meEngine.hormuzThreatLevel}` },
      { label: "Tanker Rate", val: `${meEngine.tankerInsuranceSurcharge}` }
    ],
    `Kinetic naval exchanges along the Persian Gulf have triggered DEFCON 2 escalation protocols (GPR Index: ${meEngine.gprIndex}). Commercial tanker war insurance has soared to ${meEngine.tankerInsuranceSurcharge} of hull value. The Petroline pipeline bypass suspension leaves 100% of regional maritime export capacity dependent on the Strait of Hormuz bottleneck.`,
    "Energy risk premia remain structurally asymmetric to the upside; supply disruption elasticity curves indicate $120/bbl is mathematically achievable if Hormuz transit falls by >15%.",
    checkPageBreak
  );

  // Engine D: Global Shadow Fleet (Iran & Russia Dual-Corridor)
  const iranEngine = macroData.engines.iranShadowFleet;
  y = renderEngineCardDynamic(
    doc,
    y,
    "ENGINE D // GLOBAL SHADOW FLEET & SANCTIONS RADAR (IRAN & RUSSIA 88% INDIA CRUDE)",
    "DUAL-CORRIDOR ACTIVE // 88.0% RUSSIA→INDIA CRUDE VIA DARK HULLS",
    cAmber,
    [
      { label: "Total Dark Fleet", val: "1,097 Hulls (412 Iran / 685 Russia)" },
      { label: "Russia→India Dark", val: "88.0% (1.65M / 1.88M bpd)" },
      { label: "Combined Outflow", val: "3.27M bpd ($139.4B 24M Inflow)" },
      { label: "Primary Corridors", val: "Lakonikos (Greece) & Riau (Malacca)" }
    ],
    `Dual-corridor satellite telemetry verifies 88.0% of Russian crude shipped to India travels aboard dark tankers bypassing G7 price cap limits, while Iranian dark crude continues funneling into Shandong teapots via Riau transshipment. AIS transponder spoofing has been verified across 342 active beacons, with 9 ship-to-ship transfer clusters monitored globally.`,
    "Shadow fleet bypass volumes cap immediate supply deficits to Asian refiners, but create significant tail risk if naval interdiction operations expand into international waters.",
    checkPageBreak
  );

  // Section 10: Executive Intelligence Summaries
  y = drawSectionHeading(doc, y, "10. Executive Intelligence Summaries & Structural Insights", "MULTI-ASSET CROSS-CUTTING SYNTHESIS");
  y = renderExecutiveSummariesClean(doc, y, macroData, checkPageBreak);

  // Section 11: Real-Time Flash Alerts
  y = drawSectionHeading(doc, y, "11. Real-Time Macro Flash Alerts Wire", "LIVE TELEMETRY BROADCASTS");
  y = renderFlashAlertsWire(doc, y, macroData.flashAlerts, checkPageBreak);

  // Section 12: Disclaimer
  checkPageBreak(20);
  doc.setFillColor(cLightBg[0], cLightBg[1], cLightBg[2]);
  doc.roundedRect(leftMargin, y, contentWidth, 16, 1, 1, "F");
  doc.setDrawColor(cBorder[0], cBorder[1], cBorder[2]);
  doc.setLineWidth(0.25);
  doc.roundedRect(leftMargin, y, contentWidth, 16, 1, 1, "S");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.2);
  doc.setTextColor(cNavy[0], cNavy[1], cNavy[2]);
  doc.text("INSTITUTIONAL RESEARCH USAGE & CITATION AUTHORIZATION", leftMargin + 3, y + 4.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(5.2);
  doc.setTextColor(cMuted[0], cMuted[1], cMuted[2]);
  const discLines = doc.splitTextToSize("This daily briefing document is prepared for institutional research, intelligence briefing, and content snippet publication. Proprietary desk execution directives have been stripped to provide pure macroeconomic and quantitative risk modeling. Data sources include CBOE, Bank of Japan, Federal Reserve H.4.1, US Treasury, Bloomberg terminal feeds, and proprietary Sin Miedo Capital quantitative models. Past performance does not guarantee future results.", contentWidth - 6);
  doc.text(discLines, leftMargin + 3, y + 8);

  // Draw Headers & Footers across all generated pages
  drawRunningHeadersFooters(doc, refCode, timeUtcStr);

  // Save PDF
  const safeFilename = `SMC_Daily_Macro_Briefing_${dateStr}_${now.getUTCHours().toString().padStart(2, "0")}${now.getUTCMinutes().toString().padStart(2, "0")}UTC.pdf`;
  doc.save(safeFilename);
};
