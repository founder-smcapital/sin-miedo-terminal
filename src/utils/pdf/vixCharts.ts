import jsPDF from "jspdf";
import {
  cDeepNavy,
  cGold,
  cLightGold,
  cPaleGold,
  cNavy,
  cRed,
  cAmber,
  cGreen,
  cDarkText
} from "./pdfTheme";

export const renderVixSurfaceChart = (
  doc: jsPDF,
  chartX: number,
  chartY: number,
  chartW: number,
  chartH: number
): void => {
  const plotLeft = chartX + 16;
  const plotRight = chartX + chartW - 12;
  const plotW = plotRight - plotLeft;
  const plotTop = chartY + 12;
  const plotBottom = chartY + chartH - 14;
  const plotH = plotBottom - plotTop;

  // Background Container
  doc.setFillColor(cDeepNavy[0], cDeepNavy[1], cDeepNavy[2]);
  doc.roundedRect(chartX, chartY, chartW, chartH, 1.5, 1.5, "F");
  doc.setDrawColor(cGold[0], cGold[1], cGold[2]);
  doc.setLineWidth(0.4);
  doc.roundedRect(chartX, chartY, chartW, chartH, 1.5, 1.5, "S");

  // Chart Title inside Canvas
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(cLightGold[0], cLightGold[1], cLightGold[2]);
  doc.text("INTRADAY VIX TELEMETRY // SPIKE ANATOMY & REGIME THRESHOLDS", plotLeft, chartY + 7.5);

  doc.setFont("courier", "normal");
  doc.setFontSize(6);
  doc.setTextColor(160, 175, 195);
  doc.text("SESSION TICK FEED // RANGE: 17.72 - 21.64", plotRight, chartY + 7.5, { align: "right" });

  const vMin = 14.0;
  const vMax = 26.0;
  const getYForVix = (val: number) => {
    const clamped = Math.max(vMin, Math.min(vMax, val));
    const ratio = (clamped - vMin) / (vMax - vMin);
    return plotBottom - ratio * plotH;
  };

  // Horizontal Grid Lines & Thresholds
  const thresholds = [
    { level: 25.0, label: "25.0 CRISIS / SYSTEMIC SQUEEZE", color: cRed, dash: true },
    { level: 20.0, label: "20.0 ELEVATED HEDGE THRESHOLD", color: cAmber, dash: true },
    { level: 17.0, label: "17.0 NORMAL REGIME BASELINE", color: [75, 85, 99] as const, dash: false },
    { level: 15.0, label: "15.0 COMPLACENCY FLOOR", color: cGreen, dash: true }
  ];

  thresholds.forEach((th) => {
    const ty = getYForVix(th.level);
    doc.setDrawColor(th.color[0], th.color[1], th.color[2]);
    doc.setLineWidth(th.dash ? 0.35 : 0.2);
    if (th.dash) {
      doc.setLineDashPattern([2, 1.5], 0);
    } else {
      doc.setLineDashPattern([], 0);
    }
    doc.line(plotLeft, ty, plotRight, ty);

    doc.setFont("courier", "bold");
    doc.setFontSize(5.5);
    doc.setTextColor(th.color[0], th.color[1], th.color[2]);
    doc.text(`${th.level.toFixed(1)}`, plotLeft - 2, ty + 1.2, { align: "right" });
    doc.text(th.label, plotRight - 1, ty - 1.2, { align: "right" });
  });

  doc.setLineDashPattern([], 0);

  // Intraday Data Points (6 key moments)
  const vixPoints = [
    { t: "00:00", val: 17.85, isSpike: false, label: "" },
    { t: "02:30", val: 19.45, isSpike: true, label: "Carry Unwind" },
    { t: "07:15", val: 20.85, isSpike: true, label: "Hormuz Standoff" },
    { t: "13:30", val: 21.64, isSpike: true, label: "Peak: CPI Shock" },
    { t: "15:45", val: 20.25, isSpike: true, label: "0DTE Gamma Pin" },
    { t: "LIVE", val: 18.95, isSpike: false, label: "Current (18.95)" }
  ];

  const coords = vixPoints.map((p, i) => {
    const cx = plotLeft + (i / (vixPoints.length - 1)) * plotW;
    const cy = getYForVix(p.val);
    return { ...p, cx, cy };
  });

  // Area Fill under VIX curve
  for (let i = 0; i < coords.length - 1; i++) {
    const c1 = coords[i];
    const c2 = coords[i + 1];
    doc.setFillColor(28, 40, 58);
    doc.triangle(c1.cx, c1.cy, c2.cx, c2.cy, c1.cx, plotBottom, "F");
    doc.triangle(c2.cx, c2.cy, c2.cx, plotBottom, c1.cx, plotBottom, "F");
  }

  // Draw VIX Polyline
  doc.setDrawColor(cLightGold[0], cLightGold[1], cLightGold[2]);
  doc.setLineWidth(0.8);
  for (let i = 0; i < coords.length - 1; i++) {
    doc.line(coords[i].cx, coords[i].cy, coords[i + 1].cx, coords[i + 1].cy);
  }

  // 20D Realized Volatility Reference Line
  const rvY = getYForVix(14.3);
  doc.setDrawColor(cGreen[0], cGreen[1], cGreen[2]);
  doc.setLineWidth(0.35);
  doc.setLineDashPattern([1.5, 1.5], 0);
  doc.line(plotLeft, rvY, plotRight, rvY);
  doc.setLineDashPattern([], 0);
  doc.setFont("courier", "bold");
  doc.setFontSize(5.2);
  doc.setTextColor(cGreen[0], cGreen[1], cGreen[2]);
  doc.text("20D REALIZED VOLATILITY (14.3%) // VRP SPREAD +4.65p", plotLeft + 2, rvY - 1.2);

  // Nodes & Labels
  coords.forEach((pt) => {
    const nodeColor = pt.val >= 21 ? cRed : (pt.isSpike ? cAmber : (pt.t === "LIVE" ? cGreen : cGold));
    doc.setFillColor(nodeColor[0], nodeColor[1], nodeColor[2]);
    doc.circle(pt.cx, pt.cy, pt.isSpike || pt.t === "LIVE" ? 1.8 : 1.2, "F");
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(0.25);
    doc.circle(pt.cx, pt.cy, pt.isSpike || pt.t === "LIVE" ? 1.8 : 1.2, "S");

    doc.setFont("courier", "bold");
    doc.setFontSize(5.8);
    doc.setTextColor(255, 255, 255);
    const textYOffset = pt.val >= 21 ? -3.5 : (pt.isSpike ? -3 : -2.5);
    doc.text(pt.val.toFixed(2), pt.cx, pt.cy + textYOffset, { align: "center" });

    doc.setFont("courier", "normal");
    doc.setFontSize(5.5);
    doc.setTextColor(160, 175, 195);
    doc.text(pt.t, pt.cx, plotBottom + 4.5, { align: "center" });

    if (pt.label) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(4.8);
      doc.setTextColor(nodeColor[0], nodeColor[1], nodeColor[2]);
      doc.text(pt.label.toUpperCase(), pt.cx, plotBottom + 8.2, { align: "center" });
    }
  });
};

export const renderVixTermCurveChart = (
  doc: jsPDF,
  chartX: number,
  chartY: number,
  chartW: number,
  chartH: number
): void => {
  // Container
  doc.setFillColor(cDeepNavy[0], cDeepNavy[1], cDeepNavy[2]);
  doc.roundedRect(chartX, chartY, chartW, chartH, 1.5, 1.5, "F");
  doc.setDrawColor(cGold[0], cGold[1], cGold[2]);
  doc.setLineWidth(0.35);
  doc.roundedRect(chartX, chartY, chartW, chartH, 1.5, 1.5, "S");

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.2);
  doc.setTextColor(cLightGold[0], cLightGold[1], cLightGold[2]);
  doc.text("CBOE VIX FUTURES TERM STRUCTURE // 6-MONTH CURVE ARCHITECTURE", chartX + 4, chartY + 6.5);

  const plotLeft = chartX + 16;
  const plotW = 96;
  const plotTop = chartY + 11;
  const plotBottom = chartY + chartH - 10;
  const plotH = plotBottom - plotTop;

  const yMin = 18.0;
  const yMax = 22.5;
  const getY = (val: number) => plotBottom - ((val - yMin) / (yMax - yMin)) * plotH;

  // Horizontal Grid
  [18.0, 19.0, 20.0, 21.0, 22.0].forEach((lvl) => {
    const gy = getY(lvl);
    doc.setDrawColor(50, 65, 85);
    doc.setLineWidth(0.2);
    doc.line(plotLeft, gy, plotLeft + plotW, gy);
    doc.setFont("courier", "normal");
    doc.setFontSize(5);
    doc.setTextColor(140, 155, 175);
    doc.text(lvl.toFixed(1), plotLeft - 2, gy + 1, { align: "right" });
  });

  const maturities = [
    { code: "UX1", month: "Sep '26", val: 18.95 },
    { code: "UX2", month: "Oct '26", val: 19.40 },
    { code: "UX3", month: "Nov '26", val: 20.10 },
    { code: "UX4", month: "Dec '26", val: 20.80 },
    { code: "UX5", month: "Jan '27", val: 21.20 },
    { code: "UX6", month: "Feb '27", val: 21.50 },
  ];

  const coords = maturities.map((m, i) => {
    const cx = plotLeft + (i / (maturities.length - 1)) * plotW;
    const cy = getY(m.val);
    return { ...m, cx, cy };
  });

  // Polyline
  doc.setDrawColor(cGold[0], cGold[1], cGold[2]);
  doc.setLineWidth(0.75);
  for (let i = 0; i < coords.length - 1; i++) {
    doc.line(coords[i].cx, coords[i].cy, coords[i + 1].cx, coords[i + 1].cy);
  }

  // Nodes & labels
  coords.forEach((pt) => {
    doc.setFillColor(cGold[0], cGold[1], cGold[2]);
    doc.circle(pt.cx, pt.cy, 1.4, "F");
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(0.2);
    doc.circle(pt.cx, pt.cy, 1.4, "S");

    doc.setFont("courier", "bold");
    doc.setFontSize(5.5);
    doc.setTextColor(255, 255, 255);
    doc.text(pt.val.toFixed(2), pt.cx, pt.cy - 2.5, { align: "center" });

    doc.setFont("courier", "bold");
    doc.setFontSize(5.2);
    doc.setTextColor(cLightGold[0], cLightGold[1], cLightGold[2]);
    doc.text(pt.code, pt.cx, plotBottom + 4, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(4.8);
    doc.setTextColor(140, 155, 175);
    doc.text(pt.month, pt.cx, plotBottom + 7.5, { align: "center" });
  });

  // Right Side Metrics Panel
  const panelX = chartX + 118;
  const panelW = chartW - 122;

  const renderMetricPill = (py: number, label: string, val: string, valColor: readonly [number, number, number]) => {
    doc.setFillColor(20, 30, 45);
    doc.roundedRect(panelX, py, panelW, 8.5, 0.8, 0.8, "F");
    doc.setDrawColor(cGold[0], cGold[1], cGold[2]);
    doc.setLineWidth(0.2);
    doc.roundedRect(panelX, py, panelW, 8.5, 0.8, 0.8, "S");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(5.2);
    doc.setTextColor(160, 175, 195);
    doc.text(label, panelX + 3, py + 3.2);

    doc.setFont("courier", "bold");
    doc.setFontSize(6.8);
    doc.setTextColor(valColor[0], valColor[1], valColor[2]);
    doc.text(val, panelX + 3, py + 7);
  };

  renderMetricPill(chartY + 9, "TERM SLOPE (UX6 - UX1)", "+2.55 pts (CONTANGO)", cGreen);
  renderMetricPill(chartY + 19, "FRONT ROLL YIELD DRAG", "-13.4% Annualized", cAmber);
  renderMetricPill(chartY + 29, "INVERSION TRIGGER LEVEL", "UX1 > UX2 at 21.60", cRed);

  // Takeaway Note
  doc.setFont("helvetica", "normal");
  doc.setFontSize(5.2);
  doc.setTextColor(180, 195, 215);
  const noteLines = doc.splitTextToSize("Curvature reflects persistent autumn hedging against US fiscal auctions and Middle East escalation.", panelW);
  doc.text(noteLines, panelX, chartY + 41.5);
};

export const renderSpikeCallouts = (
  doc: jsPDF,
  startX: number,
  startY: number,
  totalWidth: number
): number => {
  const spikeBoxW = (totalWidth - 6) / 2;
  const spikeBoxH = 21;

  const spikes = [
    {
      title: "SPIKE 1 // 02:30 UTC: Asia Carry Unwind",
      mag: "+1.73 pts (+9.8%)",
      catalyst: "Tokyo carry trades unwind; MoF covert dollar intervention signal triggered.",
      impact: "-0.45% ES futures dip; front-end put volumes surge."
    },
    {
      title: "SPIKE 2 // 07:15 UTC: Hormuz Kinetic Alert",
      mag: "+2.70 pts (+14.9%)",
      catalyst: "UKMTO AIS spoofing warning; Brent crude surges +$3.80/bbl to $104.20.",
      impact: "-0.85% European equity slide; OTM VIX call demand peaks."
    },
    {
      title: "SPIKE 3 // 13:30 UTC: US Core CPI Shock",
      mag: "+3.42 pts (Session Peak 21.64)",
      catalyst: "Core PCE prints +0.38% vs +0.28%; 10Y UST yields jump +9 bps to 4.54%.",
      impact: "-1.35% S&P 500 session trough; dealer short-gamma squeeze below 5,720."
    },
    {
      title: "SPIKE 4 // 15:45 UTC: 0DTE Gamma Pin",
      mag: "+1.40 pts (+7.4%)",
      catalyst: "Late-day $3.8B market-on-close sell imbalance forces mechanical hedging.",
      impact: "-0.40% late wobble; structural 5,720 strike gamma pin confirmed."
    }
  ];

  let currentY = startY;

  for (let i = 0; i < spikes.length; i += 2) {
    const s1 = spikes[i];
    const s2 = spikes[i + 1];

    [
      { s: s1, x: startX },
      { s: s2, x: startX + spikeBoxW + 6 }
    ].forEach(({ s, x }) => {
      doc.setFillColor(cPaleGold[0], cPaleGold[1], cPaleGold[2]);
      doc.roundedRect(x, currentY, spikeBoxW, spikeBoxH, 1, 1, "F");
      doc.setDrawColor(cGold[0], cGold[1], cGold[2]);
      doc.setLineWidth(0.25);
      doc.roundedRect(x, currentY, spikeBoxW, spikeBoxH, 1, 1, "S");

      // Title & Magnitude
      doc.setFont("helvetica", "bold");
      doc.setFontSize(6.5);
      doc.setTextColor(cNavy[0], cNavy[1], cNavy[2]);
      doc.text(s.title, x + 3, currentY + 4.2);

      doc.setFont("courier", "bold");
      doc.setFontSize(6.2);
      doc.setTextColor(cRed[0], cRed[1], cRed[2]);
      doc.text(s.mag, x + spikeBoxW - 3, currentY + 4.2, { align: "right" });

      // Catalyst Wrapped
      doc.setFont("helvetica", "bold");
      doc.setFontSize(5.5);
      doc.setTextColor(cNavy[0], cNavy[1], cNavy[2]);
      doc.text("CATALYST:", x + 3, currentY + 8.2);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(5.4);
      doc.setTextColor(cDarkText[0], cDarkText[1], cDarkText[2]);
      const catLines = doc.splitTextToSize(s.catalyst, spikeBoxW - 20);
      doc.text(catLines, x + 18, currentY + 8.2);

      // Impact Wrapped
      const impY = currentY + 8.2 + Math.max(1, catLines.length) * 3.0 + 1.2;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(5.5);
      doc.setTextColor(cNavy[0], cNavy[1], cNavy[2]);
      doc.text("IMPACT:", x + 3, impY);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(5.4);
      doc.setTextColor(cDarkText[0], cDarkText[1], cDarkText[2]);
      const impLines = doc.splitTextToSize(s.impact, spikeBoxW - 18);
      doc.text(impLines, x + 16, impY);
    });

    currentY += spikeBoxH + 3;
  }

  return currentY;
};
