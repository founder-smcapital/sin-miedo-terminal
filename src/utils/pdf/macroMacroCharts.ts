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
  cDarkText,
  cBorder,
  cMuted
} from "./pdfTheme";

export const renderGoldSupercycleChart = (
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
  doc.setLineWidth(0.4);
  doc.roundedRect(chartX, chartY, chartW, chartH, 1.5, 1.5, "S");

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(cLightGold[0], cLightGold[1], cLightGold[2]);
  doc.text("GOLD (XAU/USD) SUPERCYCLE TRAJECTORY & CENTRAL BANK DE-DOLLARIZATION", chartX + 4, chartY + 7);

  doc.setFont("courier", "normal");
  doc.setFontSize(5.8);
  doc.setTextColor(160, 175, 195);
  doc.text("ALL-TIME HIGH $4,185.60 // SOVEREIGN BUYING FLOOR $3,200", chartX + chartW - 4, chartY + 7, { align: "right" });

  // Left Plot Area (Price Trajectory)
  const plotLeft = chartX + 16;
  const plotW = 98;
  const plotTop = chartY + 12;
  const plotBottom = chartY + chartH - 12;
  const plotH = plotBottom - plotTop;

  const minP = 1500;
  const maxP = 4500;
  const getY = (p: number) => plotBottom - ((p - minP) / (maxP - minP)) * plotH;

  // Grid Lines
  [2000, 3000, 4000].forEach((lvl) => {
    const gy = getY(lvl);
    doc.setDrawColor(45, 60, 80);
    doc.setLineWidth(0.2);
    doc.line(plotLeft, gy, plotLeft + plotW, gy);

    doc.setFont("courier", "normal");
    doc.setFontSize(5);
    doc.setTextColor(150, 165, 185);
    doc.text(`$${lvl}`, plotLeft - 2, gy + 1, { align: "right" });
  });

  // Sovereign Floor Dashed Line
  const floorY = getY(3200);
  doc.setDrawColor(cGold[0], cGold[1], cGold[2]);
  doc.setLineWidth(0.35);
  doc.setLineDashPattern([2, 1.5], 0);
  doc.line(plotLeft, floorY, plotLeft + plotW, floorY);
  doc.setLineDashPattern([], 0);
  doc.setFont("courier", "bold");
  doc.setFontSize(4.8);
  doc.setTextColor(cGold[0], cGold[1], cGold[2]);
  doc.text("SOVEREIGN PHYSICAL BUYING FLOOR ($3,200)", plotLeft + 2, floorY - 1);

  const priceHistory = [
    { label: "2022", price: 1824, note: "FX Freeze" },
    { label: "2023", price: 2062, note: "CB Pivot" },
    { label: "2024", price: 2630, note: "BRICS+" },
    { label: "2025", price: 3420, note: "$3,420 Floor" },
    { label: "Feb '26", price: 3920, note: "War Outbreak", isWar: true },
    { label: "Current", price: 4185.6, note: "ATH $4,185", isAth: true },
  ];

  const coords = priceHistory.map((pt, i) => {
    const cx = plotLeft + (i / (priceHistory.length - 1)) * plotW;
    const cy = getY(pt.price);
    return { ...pt, cx, cy };
  });

  // Area fill under gold curve
  for (let i = 0; i < coords.length - 1; i++) {
    const c1 = coords[i];
    const c2 = coords[i + 1];
    doc.setFillColor(38, 42, 35);
    doc.triangle(c1.cx, c1.cy, c2.cx, c2.cy, c1.cx, plotBottom, "F");
    doc.triangle(c2.cx, c2.cy, c2.cx, plotBottom, c1.cx, plotBottom, "F");
  }

  // Line
  doc.setDrawColor(cGold[0], cGold[1], cGold[2]);
  doc.setLineWidth(0.8);
  for (let i = 0; i < coords.length - 1; i++) {
    doc.line(coords[i].cx, coords[i].cy, coords[i + 1].cx, coords[i + 1].cy);
  }

  // Nodes & labels
  coords.forEach((pt) => {
    const isSpecial = pt.isWar || pt.isAth;
    doc.setFillColor(pt.isWar ? cRed[0] : (pt.isAth ? cGreen[0] : cGold[0]), pt.isWar ? cRed[1] : (pt.isAth ? cGreen[1] : cGold[1]), pt.isWar ? cRed[2] : (pt.isAth ? cGreen[2] : cGold[2]));
    doc.circle(pt.cx, pt.cy, isSpecial ? 1.8 : 1.2, "F");
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(0.2);
    doc.circle(pt.cx, pt.cy, isSpecial ? 1.8 : 1.2, "S");

    // Price text
    doc.setFont("courier", "bold");
    doc.setFontSize(5.4);
    doc.setTextColor(255, 255, 255);
    doc.text(`$${Math.round(pt.price)}`, pt.cx, pt.cy - 2.8, { align: "center" });

    // X-axis label
    doc.setFont("courier", "normal");
    doc.setFontSize(5.2);
    doc.setTextColor(160, 175, 195);
    doc.text(pt.label, pt.cx, plotBottom + 4, { align: "center" });

    // Note
    doc.setFont("helvetica", "bold");
    doc.setFontSize(4.6);
    doc.setTextColor(pt.isWar ? cRed[0] : (pt.isAth ? cGreen[0] : cGold[0]), pt.isWar ? cRed[1] : (pt.isAth ? cGreen[1] : cGold[1]), pt.isWar ? cRed[2] : (pt.isAth ? cGreen[2] : cGold[2]));
    doc.text(pt.note, pt.cx, plotBottom + 7.5, { align: "center" });
  });

  // Right Panel: Central Bank Net Bullion Accumulation (Bars)
  const barPanelX = chartX + 120;
  const barPanelW = chartW - 124;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.2);
  doc.setTextColor(cGold[0], cGold[1], cGold[2]);
  doc.text("CENTRAL BANK NET GOLD PURCHASES (ANNUAL TONS)", barPanelX, chartY + 14);

  const cbPurchases = [
    { country: "China (PBOC)", tons: 285, pct: 1.0 },
    { country: "Poland (NBP)", tons: 130, pct: 0.46 },
    { country: "Turkey (CBRT)", tons: 95, pct: 0.33 },
    { country: "India (RBI)", tons: 80, pct: 0.28 },
  ];

  let by = chartY + 18;
  cbPurchases.forEach((cb) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(5.4);
    doc.setTextColor(220, 230, 245);
    doc.text(cb.country, barPanelX, by + 3);

    doc.setFont("courier", "bold");
    doc.setFontSize(5.6);
    doc.setTextColor(cGold[0], cGold[1], cGold[2]);
    doc.text(`+${cb.tons}t`, barPanelX + barPanelW, by + 3, { align: "right" });

    // Bar track
    doc.setFillColor(35, 45, 60);
    doc.roundedRect(barPanelX, by + 4.5, barPanelW, 2.8, 0.6, 0.6, "F");

    // Bar fill
    doc.setFillColor(cGold[0], cGold[1], cGold[2]);
    doc.roundedRect(barPanelX, by + 4.5, barPanelW * cb.pct, 2.8, 0.6, 0.6, "F");

    by += 9.5;
  });

  // Annual Totals Callout
  doc.setFillColor(20, 30, 45);
  doc.roundedRect(barPanelX, by + 1, barPanelW, 7, 0.8, 0.8, "F");
  doc.setDrawColor(cGold[0], cGold[1], cGold[2]);
  doc.setLineWidth(0.2);
  doc.roundedRect(barPanelX, by + 1, barPanelW, 7, 0.8, 0.8, "S");

  doc.setFont("courier", "bold");
  doc.setFontSize(5.5);
  doc.setTextColor(cLightGold[0], cLightGold[1], cLightGold[2]);
  doc.text("TOTAL CB ANNUAL DEMAND: 1,037 TONS", barPanelX + barPanelW / 2, by + 4.2, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(4.8);
  doc.setTextColor(160, 175, 195);
  doc.text("32% of Global Mine Production Absorbed by Sovereigns", barPanelX + barPanelW / 2, by + 6.8, { align: "center" });
};

export const renderGprIndexChart = (
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
  doc.setLineWidth(0.4);
  doc.roundedRect(chartX, chartY, chartW, chartH, 1.5, 1.5, "S");

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(cLightGold[0], cLightGold[1], cLightGold[2]);
  doc.text("GEOPOLITICAL RISK (GPR) INDEX 24-MONTH TRAJECTORY & OIL RISK PREMIUM", chartX + 4, chartY + 7);

  doc.setFont("courier", "normal");
  doc.setFontSize(5.8);
  doc.setTextColor(160, 175, 195);
  doc.text("CURRENT GPR: 364.5 (DEFCON 2 PEAK) // BRENT PREMIUM: +$18.50/BBL", chartX + chartW - 4, chartY + 7, { align: "right" });

  const plotLeft = chartX + 16;
  const plotW = 98;
  const plotTop = chartY + 12;
  const plotBottom = chartY + chartH - 12;
  const plotH = plotBottom - plotTop;

  const minGpr = 50;
  const maxGpr = 400;
  const getY = (g: number) => plotBottom - ((g - minGpr) / (maxGpr - minGpr)) * plotH;

  // Horizontal Grid
  [100, 200, 300].forEach((lvl) => {
    const gy = getY(lvl);
    doc.setDrawColor(45, 60, 80);
    doc.setLineWidth(0.2);
    doc.line(plotLeft, gy, plotLeft + plotW, gy);

    doc.setFont("courier", "normal");
    doc.setFontSize(5);
    doc.setTextColor(150, 165, 185);
    doc.text(`${lvl} pts`, plotLeft - 2, gy + 1, { align: "right" });
  });

  // Critical Escalation Level
  const critY = getY(300);
  doc.setDrawColor(cRed[0], cRed[1], cRed[2]);
  doc.setLineWidth(0.3);
  doc.setLineDashPattern([2, 1.5], 0);
  doc.line(plotLeft, critY, plotLeft + plotW, critY);
  doc.setLineDashPattern([], 0);
  doc.setFont("courier", "bold");
  doc.setFontSize(4.8);
  doc.setTextColor(cRed[0], cRed[1], cRed[2]);
  doc.text("CRITICAL ESCALATION THRESHOLD (300 PTS)", plotLeft + 2, critY - 1);

  const gprPoints = [
    { date: "Oct '24", val: 105, brentPrem: "+$4.50" },
    { date: "Apr '25", val: 210, brentPrem: "+$8.20" },
    { date: "Oct '25", val: 260, brentPrem: "+$11.40" },
    { date: "Jan '26", val: 290, brentPrem: "+$13.80" },
    { date: "Feb '26", val: 352, brentPrem: "+$16.50", isKinetic: true },
    { date: "Current", val: 364.5, brentPrem: "+$18.50", isKinetic: true },
  ];

  const coords = gprPoints.map((pt, i) => {
    const cx = plotLeft + (i / (gprPoints.length - 1)) * plotW;
    const cy = getY(pt.val);
    return { ...pt, cx, cy };
  });

  // Area Fill
  for (let i = 0; i < coords.length - 1; i++) {
    const c1 = coords[i];
    const c2 = coords[i + 1];
    doc.setFillColor(48, 25, 28);
    doc.triangle(c1.cx, c1.cy, c2.cx, c2.cy, c1.cx, plotBottom, "F");
    doc.triangle(c2.cx, c2.cy, c2.cx, plotBottom, c1.cx, plotBottom, "F");
  }

  // Polyline
  doc.setDrawColor(cRed[0], cRed[1], cRed[2]);
  doc.setLineWidth(0.85);
  for (let i = 0; i < coords.length - 1; i++) {
    doc.line(coords[i].cx, coords[i].cy, coords[i + 1].cx, coords[i + 1].cy);
  }

  // Nodes & labels
  coords.forEach((pt) => {
    doc.setFillColor(pt.isKinetic ? cRed[0] : cAmber[0], pt.isKinetic ? cRed[1] : cAmber[1], pt.isKinetic ? cRed[2] : cAmber[2]);
    doc.circle(pt.cx, pt.cy, pt.isKinetic ? 1.8 : 1.2, "F");
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(0.2);
    doc.circle(pt.cx, pt.cy, pt.isKinetic ? 1.8 : 1.2, "S");

    doc.setFont("courier", "bold");
    doc.setFontSize(5.4);
    doc.setTextColor(255, 255, 255);
    doc.text(pt.val.toFixed(1), pt.cx, pt.cy - 2.8, { align: "center" });

    doc.setFont("courier", "normal");
    doc.setFontSize(5.2);
    doc.setTextColor(160, 175, 195);
    doc.text(pt.date, pt.cx, plotBottom + 4, { align: "center" });

    doc.setFont("courier", "bold");
    doc.setFontSize(4.6);
    doc.setTextColor(cGold[0], cGold[1], cGold[2]);
    doc.text(pt.brentPrem, pt.cx, plotBottom + 7.5, { align: "center" });
  });

  // Right Side Kinetic Breakdown
  const rightX = chartX + 120;
  const rightW = chartW - 124;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.2);
  doc.setTextColor(cRed[0], cRed[1], cRed[2]);
  doc.text("ACTIVE KINETIC INFLECTION VECTORS", rightX, chartY + 14);

  const vectors = [
    { title: "BAB EL-MANDEB INTERDICTION", desc: "Houthi missile threat forces 68% of commercial traffic around Cape of Good Hope." },
    { title: "PETROLINE PRECAUTIONARY HALT", desc: "Saudi East-West pipeline bypass shut down; zero bypass volume available." },
    { title: "HORMUZ 100% FUNNELING", desc: "20.8M bpd tanker flow concentrated through DEFCON 2 naval confrontation zone." }
  ];

  let vy = chartY + 18;
  vectors.forEach((v) => {
    doc.setFillColor(28, 20, 25);
    doc.roundedRect(rightX, vy, rightW, 11, 0.8, 0.8, "F");
    doc.setDrawColor(cRed[0], cRed[1], cRed[2]);
    doc.setLineWidth(0.2);
    doc.roundedRect(rightX, vy, rightW, 11, 0.8, 0.8, "S");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(5.2);
    doc.setTextColor(cLightGold[0], cLightGold[1], cLightGold[2]);
    doc.text(v.title, rightX + 2.5, vy + 3.2);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(4.8);
    doc.setTextColor(200, 210, 225);
    const dLines = doc.splitTextToSize(v.desc, rightW - 5);
    doc.text(dLines, rightX + 2.5, vy + 6.2);

    vy += 12.5;
  });
};
