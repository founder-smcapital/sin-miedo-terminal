import jsPDF from "jspdf";
import {
  cDeepNavy,
  cGold,
  cLightGold,
  cNavy,
  cRed,
  cAmber,
  cGreen,
  cBlue,
  cDarkText,
  cBorder
} from "./pdfTheme";

export const renderNetLiquidityChart = (
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
  doc.text("FEDERAL RESERVE NET LIQUIDITY TRANSMISSION & BALANCE SHEET WATERFALL", chartX + 4, chartY + 7);

  doc.setFont("courier", "normal");
  doc.setFontSize(5.8);
  doc.setTextColor(160, 175, 195);
  doc.text("FORMULA: FED ASSETS - TGA - RRP // 7D NET FLOW: -$38.4B", chartX + chartW - 4, chartY + 7, { align: "right" });

  // Left Waterfall Bar Visualization
  const leftX = chartX + 4;
  const leftW = 108;

  const components = [
    { name: "FED TOTAL ASSETS (H.4.1)", val: "$6,980B", delta: "+$12.4B WoW", pct: 1.0, color: cBlue },
    { name: "TREASURY GENERAL ACCOUNT (TGA DRAIN)", val: "-$785B", delta: "+$45.0B Drain", pct: 0.112, color: cAmber },
    { name: "REVERSE REPO BUFFER (RRP EXHAUSTION)", val: "-$215B", delta: "-$6.2B Exhaustion", pct: 0.031, color: cRed },
    { name: "SYNTHETIC NET FED LIQUIDITY", val: "$5,980B", delta: "-$38.4B Net WoW", pct: 0.857, color: cGold, isHighlight: true },
  ];

  let cy = chartY + 13;
  components.forEach((c) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(5.5);
    doc.setTextColor(c.isHighlight ? cLightGold[0] : 220, c.isHighlight ? cLightGold[1] : 230, c.isHighlight ? cLightGold[2] : 245);
    doc.text(c.name, leftX, cy + 3.2);

    doc.setFont("courier", "bold");
    doc.setFontSize(6.5);
    doc.setTextColor(c.color[0], c.color[1], c.color[2]);
    doc.text(`${c.val} [${c.delta}]`, leftX + leftW, cy + 3.2, { align: "right" });

    // Track
    doc.setFillColor(30, 40, 55);
    doc.roundedRect(leftX, cy + 4.8, leftW, 3.2, 0.6, 0.6, "F");

    // Fill
    doc.setFillColor(c.color[0], c.color[1], c.color[2]);
    doc.roundedRect(leftX, cy + 4.8, leftW * c.pct, 3.2, 0.6, 0.6, "F");

    cy += 11.2;
  });

  // Right Side Transmission Beta Panel
  const rightX = chartX + 118;
  const rightW = chartW - 122;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.2);
  doc.setTextColor(cLightGold[0], cLightGold[1], cLightGold[2]);
  doc.text("LIQUIDITY TRANSMISSION BETAS", rightX, chartY + 13);

  const betas = [
    { asset: "BITCOIN (BTC/USD)", beta: "+0.89", spot: "$118,450", note: "Direct monetary debasement proxy." },
    { asset: "S&P 500 (SPX)", beta: "+0.81", spot: "7,654.8", note: "Valuation multiple anchor vs yields." },
    { asset: "COMMERCIAL RESERVES", beta: "0.85 Shock", spot: "$3,280B", note: "Direct drain upon Treasury bond auctions." }
  ];

  let by = chartY + 17;
  betas.forEach((b) => {
    doc.setFillColor(20, 30, 45);
    doc.roundedRect(rightX, by, rightW, 11, 0.8, 0.8, "F");
    doc.setDrawColor(cGold[0], cGold[1], cGold[2]);
    doc.setLineWidth(0.2);
    doc.roundedRect(rightX, by, rightW, 11, 0.8, 0.8, "S");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(5.5);
    doc.setTextColor(220, 230, 245);
    doc.text(b.asset, rightX + 2.5, by + 3.5);

    doc.setFont("courier", "bold");
    doc.setFontSize(5.8);
    doc.setTextColor(cGold[0], cGold[1], cGold[2]);
    doc.text(`BETA ${b.beta}`, rightX + rightW - 2.5, by + 3.5, { align: "right" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(4.8);
    doc.setTextColor(170, 185, 205);
    doc.text(`${b.spot} • ${b.note}`, rightX + 2.5, by + 7.5);

    by += 13.5;
  });
};

export const renderSovereignDebtChart = (
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
  doc.text("US SOVEREIGN DEBT SERVICING RADAR // INTEREST VS NATIONAL DEFENSE", chartX + 4, chartY + 7);

  doc.setFont("courier", "normal");
  doc.setFontSize(5.8);
  doc.setTextColor(160, 175, 195);
  doc.text("ANNUAL INTEREST: $1,180B // DEFENSE: $892B // EXCESS: +$288B (+32.3%)", chartX + chartW - 4, chartY + 7, { align: "right" });

  // Left Panel: Interest Expense vs Defense Spending Comparison
  const leftX = chartX + 4;
  const leftW = 86;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.2);
  doc.setTextColor(cLightGold[0], cLightGold[1], cLightGold[2]);
  doc.text("ANNUAL BUDGET ALLOCATION ($ BILLION)", leftX, chartY + 14);

  const budgetItems = [
    { label: "US NET INTEREST EXPENSE (ANNUALIZED)", val: "$1,180B", pct: 1.0, color: cRed },
    { label: "US TOTAL NATIONAL DEFENSE BUDGET", val: "$892B", pct: 0.756, color: cNavy },
  ];

  let by = chartY + 18;
  budgetItems.forEach((b) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(5.4);
    doc.setTextColor(220, 230, 245);
    doc.text(b.label, leftX, by + 3);

    doc.setFont("courier", "bold");
    doc.setFontSize(6.2);
    doc.setTextColor(b.color[0], b.color[1], b.color[2]);
    doc.text(b.val, leftX + leftW, by + 3, { align: "right" });

    doc.setFillColor(30, 40, 55);
    doc.roundedRect(leftX, by + 4.8, leftW, 3.4, 0.6, 0.6, "F");

    doc.setFillColor(b.color[0], b.color[1], b.color[2]);
    doc.roundedRect(leftX, by + 4.8, leftW * b.pct, 3.4, 0.6, 0.6, "F");

    by += 12;
  });

  // Debt Clock Pill
  doc.setFillColor(25, 20, 25);
  doc.roundedRect(leftX, by + 2, leftW, 9.5, 0.8, 0.8, "F");
  doc.setDrawColor(cRed[0], cRed[1], cRed[2]);
  doc.setLineWidth(0.2);
  doc.roundedRect(leftX, by + 2, leftW, 9.5, 0.8, 0.8, "S");

  doc.setFont("courier", "bold");
  doc.setFontSize(5.8);
  doc.setTextColor(cRed[0], cRed[1], cRed[2]);
  doc.text("US PUBLIC DEBT: $36.84 TRILLION", leftX + leftW / 2, by + 5.5, { align: "center" });

  doc.setFont("courier", "normal");
  doc.setFontSize(5.0);
  doc.setTextColor(200, 210, 225);
  doc.text("Growing at +$86,450 / sec (~$2.72T annualized expansion)", leftX + leftW / 2, by + 8.8, { align: "center" });

  // Right Panel: Global Sovereign Debt-to-GDP Benchmark
  const rightX = chartX + 96;
  const rightW = chartW - 100;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.2);
  doc.setTextColor(cLightGold[0], cLightGold[1], cLightGold[2]);
  doc.text("SOVEREIGN DEBT-TO-GDP REGIME BENCHMARKS", rightX, chartY + 14);

  const countries = [
    { name: "JAPAN (JGB / BOJ)", gdp: "261.0%", pct: 1.0, color: cRed },
    { name: "UNITED STATES (UST)", gdp: "124.8%", pct: 0.478, color: cAmber },
    { name: "SPAIN (IBEX / TESORO)", gdp: "105.4%", pct: 0.404, color: cGold },
    { name: "GERMANY (BUNDS)", gdp: "63.8%", pct: 0.244, color: cGreen },
  ];

  let gy = chartY + 18;
  countries.forEach((c) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(5.2);
    doc.setTextColor(220, 230, 245);
    doc.text(c.name, rightX, gy + 3);

    doc.setFont("courier", "bold");
    doc.setFontSize(5.6);
    doc.setTextColor(c.color[0], c.color[1], c.color[2]);
    doc.text(c.gdp, rightX + rightW, gy + 3, { align: "right" });

    doc.setFillColor(30, 40, 55);
    doc.roundedRect(rightX, gy + 4.5, rightW, 2.8, 0.6, 0.6, "F");

    doc.setFillColor(c.color[0], c.color[1], c.color[2]);
    doc.roundedRect(rightX, gy + 4.5, rightW * c.pct, 2.8, 0.6, 0.6, "F");

    gy += 9.5;
  });
};
