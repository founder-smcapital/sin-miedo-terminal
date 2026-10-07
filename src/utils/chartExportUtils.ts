import jsPDF from "jspdf";
import { toPng } from "html-to-image";
import {
  cNavy,
  cDeepNavy,
  cGold,
  cLightGold,
  cPaleGold,
  cRed,
  cGreen,
  cAmber,
  cBlue,
  cDarkText,
  cBorder,
  cMuted,
  pageWidth,
  pageHeight,
  leftMargin,
  contentWidth,
  bottomMargin,
  drawSectionHeading,
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

/**
 * Institutional CSV Downloader
 */
export const downloadCsvFile = (
  filename: string,
  headers: string[],
  rows: (string | number | null | undefined)[][],
  metaComments?: string[]
): void => {
  const sanitize = (val: string | number | null | undefined) => {
    if (val === null || val === undefined) return "";
    const s = String(val);
    if (s.includes(",") || s.includes('"') || s.includes("\n") || s.includes("\r")) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };

  const lines: string[] = [];

  if (metaComments && metaComments.length > 0) {
    metaComments.forEach((c) => lines.push(`# ${c}`));
    lines.push(`# Generated: ${new Date().toISOString()}`);
    lines.push("# -------------------------------------------------------------");
  }

  lines.push(headers.map(sanitize).join(","));
  rows.forEach((r) => {
    lines.push(r.map(sanitize).join(","));
  });

  const csvContent = lines.join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename.endsWith(".csv") ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

/**
 * Copy data to Clipboard (TSV format compatible with Excel and Google Sheets)
 */
export const copyCsvToClipboard = async (
  headers: string[],
  rows: (string | number | null | undefined)[][]
): Promise<boolean> => {
  try {
    const sanitize = (val: string | number | null | undefined) => {
      if (val === null || val === undefined) return "";
      return String(val).replace(/\t/g, " ").replace(/\n/g, " ");
    };

    const tsvContent = [
      headers.map(sanitize).join("\t"),
      ...rows.map((r) => r.map(sanitize).join("\t")),
    ].join("\n");

    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(tsvContent);
      return true;
    }
    return false;
  } catch (err) {
    console.warn("Clipboard write failed:", err);
    return false;
  }
};

/**
 * Helper to draw rounded rectangle on HTML5 Canvas
 */
function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

/**
 * Institutional High-Res 9x9 Macro Correlation Matrix PNG Generator
 * Renders an executive publication-grade 2x Retina PNG with exact cell colors,
 * asset taxonomy, color scale spectrum, and transmission channel takeaways.
 */
export const exportMatrix9x9Png = async (
  matrixData: Record<string, Record<string, number>>,
  activeTimeframe: string = "30D",
  customFilename?: string
): Promise<boolean> => {
  try {
    const ASSETS_9X9 = [
      { id: "xau", ticker: "XAU/USD", name: "Gold Spot", cat: "Precious Metals", color: "#E5C794" },
      { id: "btc", ticker: "BTC/USD", name: "Bitcoin Spot", cat: "Digital Assets", color: "#F7931A" },
      { id: "brent", ticker: "BRENT", name: "Crude Oil", cat: "Energy", color: "#FF8585" },
      { id: "usdjpy", ticker: "USD/JPY", name: "Dollar / Yen", cat: "FX", color: "#93C5FD" },
      { id: "eurusd", ticker: "EUR/USD", name: "Euro / Dollar", cat: "FX", color: "#93C5FD" },
      { id: "ibex", ticker: "IBEX 35", name: "Spanish Equities", cat: "Equities", color: "#34D399" },
      { id: "gpr", ticker: "GPR IDX", name: "Geopolitical Risk", cat: "Geopolitics", color: "#FFA4A4" },
      { id: "ustjgb", ticker: "UST-JGB", name: "10Y Yield Spread", cat: "Rates", color: "#FCD34D" },
      { id: "shadow", ticker: "SHADOW", name: "Dark Fleet Flow", cat: "Energy Supply", color: "#F87171" },
    ];

    const scale = 2;
    const totalW = 1480;
    const totalH = 1040;

    const canvas = document.createElement("canvas");
    canvas.width = totalW * scale;
    canvas.height = totalH * scale;
    const ctx = canvas.getContext("2d");
    if (!ctx) return false;

    ctx.scale(scale, scale);

    // 1. Deep institutional background
    ctx.fillStyle = "#070D18";
    ctx.fillRect(0, 0, totalW, totalH);

    // Subtle ambient glow in top corner
    const bgRadial = ctx.createRadialGradient(totalW - 100, 100, 10, totalW - 100, 100, 500);
    bgRadial.addColorStop(0, "rgba(176, 141, 87, 0.08)");
    bgRadial.addColorStop(1, "rgba(7, 13, 24, 0)");
    ctx.fillStyle = bgRadial;
    ctx.fillRect(0, 0, totalW, totalH);

    // Top gold accent band
    const topGrad = ctx.createLinearGradient(0, 0, totalW, 0);
    topGrad.addColorStop(0, "rgba(176, 141, 87, 0.2)");
    topGrad.addColorStop(0.5, "rgba(229, 199, 148, 1)");
    topGrad.addColorStop(1, "rgba(176, 141, 87, 0.2)");
    ctx.fillStyle = topGrad;
    ctx.fillRect(0, 0, totalW, 4);

    // Outer border
    ctx.strokeStyle = "rgba(176, 141, 87, 0.35)";
    ctx.lineWidth = 1;
    ctx.strokeRect(16, 16, totalW - 32, totalH - 32);

    // 2. Header Section
    // Badge Monogram Icon
    drawRoundedRect(ctx, 36, 36, 44, 44, 8);
    ctx.fillStyle = "rgba(176, 141, 87, 0.15)";
    ctx.fill();
    ctx.strokeStyle = "#B08D57";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.font = "bold 16px ui-monospace, monospace";
    ctx.fillStyle = "#E5C794";
    ctx.textAlign = "center";
    ctx.fillText("9×9", 58, 63);

    // Header Titles
    ctx.textAlign = "left";
    ctx.font = "bold 10px ui-monospace, monospace";
    ctx.fillStyle = "#B08D57";
    ctx.fillText("SIN MIEDO CAPITAL // QUANTITATIVE MACRO & TRANSMISSION DESK", 92, 48);

    ctx.font = "bold 22px 'Newsreader', Georgia, serif";
    ctx.fillStyle = "#FBF8F1";
    ctx.fillText("Cross-Asset Macro Correlation & Covariance Matrix", 92, 73);

    // Top Right Telemetry & Badges
    const rightX = totalW - 40;
    ctx.textAlign = "right";

    // Regime pill
    drawRoundedRect(ctx, rightX - 280, 36, 280, 24, 6);
    ctx.fillStyle = "rgba(176, 141, 87, 0.12)";
    ctx.fill();
    ctx.strokeStyle = "rgba(176, 141, 87, 0.4)";
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.font = "bold 10px ui-monospace, monospace";
    ctx.fillStyle = "#E5C794";
    ctx.fillText(`REGIME: ${activeTimeframe} ROLLING • DEFCON 2 CALIBRATED`, rightX - 10, 52);

    // Reference Line
    const timeStr = new Date().toISOString().replace("T", " ").slice(0, 19) + " UTC";
    ctx.font = "9px ui-monospace, monospace";
    ctx.fillStyle = "#8292A6";
    ctx.fillText(`REF: SMC-MAT-${activeTimeframe} // TIMESTAMP: ${timeStr}`, rightX, 74);

    // 3. Matrix Coordinates & Layout
    const startX = 230;
    const startY = 145;
    const cellW = 130;
    const cellH = 48;
    const gap = 6;

    // Column Headers
    ASSETS_9X9.forEach((colAsset, colIdx) => {
      const cx = startX + colIdx * (cellW + gap);
      const cy = startY - 38;

      drawRoundedRect(ctx, cx, cy, cellW, 32, 4);
      ctx.fillStyle = "rgba(26, 38, 57, 0.6)";
      ctx.fill();
      ctx.strokeStyle = "rgba(176, 141, 87, 0.25)";
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.textAlign = "center";
      ctx.font = "bold 11px ui-monospace, monospace";
      ctx.fillStyle = colAsset.color;
      ctx.fillText(colAsset.ticker, cx + cellW / 2, cy + 15);

      ctx.font = "8.5px ui-monospace, monospace";
      ctx.fillStyle = "#8292A6";
      ctx.fillText(colAsset.cat, cx + cellW / 2, cy + 26);
    });

    // Row Headers & Matrix Cells
    ASSETS_9X9.forEach((rowAsset, rowIdx) => {
      const ry = startY + rowIdx * (cellH + gap);

      // Row Header Card
      drawRoundedRect(ctx, 36, ry, startX - 44, cellH, 6);
      ctx.fillStyle = "rgba(20, 30, 46, 0.7)";
      ctx.fill();
      ctx.strokeStyle = "rgba(176, 141, 87, 0.3)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Row Ticker & Name
      ctx.textAlign = "left";
      ctx.font = "bold 11.5px ui-monospace, monospace";
      ctx.fillStyle = rowAsset.color;
      ctx.fillText(rowAsset.ticker, 48, ry + 20);

      ctx.font = "9px ui-monospace, monospace";
      ctx.fillStyle = "#BAC7D5";
      ctx.fillText(rowAsset.name, 48, ry + 34);

      ctx.textAlign = "right";
      ctx.font = "8.5px ui-monospace, monospace";
      ctx.fillStyle = "#8292A6";
      ctx.fillText(rowAsset.cat, startX - 16, ry + 20);

      // 9 Cells across this row
      ASSETS_9X9.forEach((colAsset, colIdx) => {
        const cx = startX + colIdx * (cellW + gap);
        const isDiag = rowIdx === colIdx;
        const val = isDiag
          ? 1.0
          : matrixData[rowAsset.id]?.[colAsset.id] ?? 0.0;

        let cellBg = "#121A26";
        let cellBorder = "rgba(176, 141, 87, 0.2)";
        let textColor = "#8292A6";
        let subLabel = "Decoupled";

        if (isDiag) {
          cellBg = "rgba(27, 37, 53, 0.95)";
          cellBorder = "rgba(176, 141, 87, 0.75)";
          textColor = "#FFFFFF";
          subLabel = "Identity";
        } else if (val >= 0.7) {
          cellBg = "rgba(115, 82, 26, 0.85)";
          cellBorder = "rgba(229, 199, 148, 0.7)";
          textColor = "#FFF8EA";
          subLabel = "Safe-Haven";
        } else if (val >= 0.3) {
          cellBg = "rgba(65, 48, 20, 0.75)";
          cellBorder = "rgba(176, 141, 87, 0.4)";
          textColor = "#E5C794";
          subLabel = "Positive";
        } else if (val <= -0.7) {
          cellBg = "rgba(130, 26, 20, 0.85)";
          cellBorder = "rgba(252, 165, 165, 0.7)";
          textColor = "#FEE2E2";
          subLabel = "High Inverse";
        } else if (val <= -0.3) {
          cellBg = "rgba(75, 25, 22, 0.75)";
          cellBorder = "rgba(239, 68, 68, 0.4)";
          textColor = "#FCA5A5";
          subLabel = "Inverse";
        }

        drawRoundedRect(ctx, cx, ry, cellW, cellH, 5);
        ctx.fillStyle = cellBg;
        ctx.fill();
        ctx.strokeStyle = cellBorder;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Cell number
        ctx.textAlign = "center";
        ctx.font = "bold 13.5px ui-monospace, monospace";
        ctx.fillStyle = textColor;
        const formattedVal = isDiag
          ? "1.00"
          : val >= 0
          ? `+${val.toFixed(2)}`
          : val.toFixed(2);
        ctx.fillText(formattedVal, cx + cellW / 2, ry + 24);

        // Sublabel
        ctx.font = "8px ui-monospace, monospace";
        ctx.fillStyle = isDiag ? "#B08D57" : textColor;
        ctx.fillText(subLabel, cx + cellW / 2, ry + 38);
      });
    });

    // 4. Bottom Section: Color Scale Bar + Key Findings
    const bottomY = startY + 9 * (cellH + gap) + 16;

    // A. Left: Color Scale Bar
    drawRoundedRect(ctx, 36, bottomY, 520, 140, 8);
    ctx.fillStyle = "rgba(15, 23, 36, 0.75)";
    ctx.fill();
    ctx.strokeStyle = "rgba(176, 141, 87, 0.25)";
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.textAlign = "left";
    ctx.font = "bold 10px ui-monospace, monospace";
    ctx.fillStyle = "#E5C794";
    ctx.fillText("CORRELATION TRANSMISSION SPECTRUM", 50, bottomY + 24);

    // Gradient bar
    const barX = 50;
    const barY = bottomY + 38;
    const barW = 490;
    const barH = 14;

    const barGrad = ctx.createLinearGradient(barX, 0, barX + barW, 0);
    barGrad.addColorStop(0, "#821A14");
    barGrad.addColorStop(0.25, "#4B1916");
    barGrad.addColorStop(0.5, "#121A26");
    barGrad.addColorStop(0.75, "#413014");
    barGrad.addColorStop(1, "#73521A");

    drawRoundedRect(ctx, barX, barY, barW, barH, 4);
    ctx.fillStyle = barGrad;
    ctx.fill();
    ctx.strokeStyle = "rgba(176, 141, 87, 0.4)";
    ctx.lineWidth = 1;
    ctx.stroke();

    // Scale Ticks & Labels
    ctx.font = "8.5px ui-monospace, monospace";
    ctx.fillStyle = "#FCA5A5";
    ctx.fillText("-1.00 (Strong Inverse)", barX, barY + 30);

    ctx.textAlign = "center";
    ctx.fillStyle = "#8292A6";
    ctx.fillText("0.00 (Decoupled)", barX + barW / 2, barY + 30);

    ctx.textAlign = "right";
    ctx.fillStyle = "#E5C794";
    ctx.fillText("+1.00 (Safe-Haven)", barX + barW, barY + 30);

    ctx.textAlign = "left";
    ctx.font = "8px ui-monospace, monospace";
    ctx.fillStyle = "#8292A6";
    ctx.fillText("Covariance calibrated across 81 pairwise timeseries channels", 50, bottomY + 115);

    // B. Right: Executive Transmission Findings Card
    const cardX = 575;
    const cardW = totalW - cardX - 36;
    drawRoundedRect(ctx, cardX, bottomY, cardW, 140, 8);
    ctx.fillStyle = "rgba(15, 23, 36, 0.75)";
    ctx.fill();
    ctx.strokeStyle = "rgba(176, 141, 87, 0.35)";
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.font = "bold 10px ui-monospace, monospace";
    ctx.fillStyle = "#E5C794";
    ctx.fillText("EXECUTIVE TRANSMISSION CHANNELS & DESK IMPLICATIONS", cardX + 16, bottomY + 24);

    const findings = [
      "• XAU/USD ↔ GPR IDX (+0.82): Premier sovereign safe-haven proxy against Middle East DEFCON 2 war risk",
      "• BRENT ↔ GPR IDX (+0.79): War-risk premium embedded via Strait of Hormuz conflict vectors",
      "• USD/JPY ↔ UST-JGB (+0.76): Primary macro yield differential vector; MoF intervention dynamics",
      "• IBEX 35 ↔ GPR IDX (-0.64): European equities show pronounced downside sensitivity to energy supply shocks",
    ];

    ctx.font = "9px ui-monospace, monospace";
    ctx.fillStyle = "#BAC7D5";
    findings.forEach((f, i) => {
      ctx.fillText(f, cardX + 16, bottomY + 48 + i * 20);
    });

    // 5. Footer Bar
    ctx.textAlign = "left";
    ctx.font = "8.5px ui-monospace, monospace";
    ctx.fillStyle = "#8292A6";
    ctx.fillText(
      "SIN MIEDO CAPITAL // INSTITUTIONAL TELEMETRY & QUANTITATIVE MACRO RESEARCH DESK",
      36,
      totalH - 24
    );

    ctx.textAlign = "right";
    ctx.fillText("STRICTLY CONFIDENTIAL // PROPRIETARY RISK MODEL", totalW - 36, totalH - 24);

    // 6. Trigger Download
    const filename = customFilename || `smc-macro-correlation-matrix-9x9-${activeTimeframe.toLowerCase()}`;
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) {
          const link = document.createElement("a");
          const cleanName = filename.endsWith(".png") ? filename : `${filename}.png`;
          link.download = cleanName;
          link.href = URL.createObjectURL(blob);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          setTimeout(() => URL.revokeObjectURL(link.href), 1000);
          resolve(true);
        } else {
          resolve(false);
        }
      }, "image/png");
    });
  } catch (err) {
    console.error("Failed to export 9x9 matrix as PNG:", err);
    return false;
  }
};

/**
 * Universal High-Resolution PNG Exporter
 * Uses html-to-image to capture any chart card or DOM container with 2x Retina sharpness,
 * filters out interactive UI controls (dropdowns, fullscreen buttons), ensures rich dark
 * institutional background, and provides graceful fallback to SVG/Canvas rasterization.
 */
export const exportChartElementAsPng = async (
  target: HTMLElement | SVGElement | string,
  filename: string,
  title: string,
  subtitle?: string
): Promise<boolean> => {
  try {
    let containerEl: HTMLElement | null = null;

    if (typeof target === "string") {
      containerEl = document.getElementById(target);
    } else if (target instanceof HTMLElement) {
      containerEl = target;
    } else if (target instanceof SVGElement) {
      containerEl = target.closest<HTMLElement>("div") || target.parentElement;
    }

    if (!containerEl) {
      console.warn("Chart container element not found for PNG export");
      return false;
    }

    // Filter out UI interactive controls that shouldn't appear in the exported snapshot
    const filter = (node: Node) => {
      if (node instanceof HTMLElement) {
        if (node.getAttribute("data-export-ignore") === "true") return false;
        if (node.closest?.("[data-export-ignore='true']")) return false;
        if (node.classList?.contains("chart-export-dropdown-container")) return false;
        if (node.classList?.contains("chart-export-menu")) return false;
        if (node.tagName === "BUTTON") {
          const id = (node.id || "").toLowerCase();
          const btnTitle = (node.getAttribute("title") || "").toLowerCase();
          const ariaLabel = (node.getAttribute("aria-label") || "").toLowerCase();
          if (
            id.includes("export") ||
            id.includes("fullscreen") ||
            id.includes("close") ||
            btnTitle.includes("export") ||
            btnTitle.includes("fullscreen") ||
            btnTitle.includes("full screen") ||
            ariaLabel.includes("export")
          ) {
            return false;
          }
        }
      }
      return true;
    };

    // Primary: High-fidelity DOM capture via html-to-image
    try {
      const dataUrl = await toPng(containerEl, {
        pixelRatio: 2,
        backgroundColor: "#0A111C",
        cacheBust: true,
        filter,
        skipFonts: true, // Prevents CORS issues with external web fonts in iframe environments
      });

      if (dataUrl && dataUrl.length > 200) {
        const link = document.createElement("a");
        const cleanName = filename.endsWith(".png") ? filename : `${filename}.png`;
        link.download = cleanName;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return true;
      }
    } catch (domErr) {
      console.warn("html-to-image capture fallback triggered:", domErr);
    }

    // Fallback: If SVG exists inside container, serialize and draw to canvas with institutional framing
    const svgElement = containerEl.querySelector("svg");
    if (!svgElement) {
      console.warn("No SVG element found for secondary fallback export");
      return false;
    }

    const bbox = svgElement.getBoundingClientRect();
    const width = Math.max(bbox.width || 800, 750);
    const height = Math.max(bbox.height || 420, 380);

    const clonedSvg = svgElement.cloneNode(true) as SVGElement;
    clonedSvg.setAttribute("width", String(width));
    clonedSvg.setAttribute("height", String(height));
    clonedSvg.setAttribute("xmlns", "http://www.w3.org/2000/svg");

    const textNodes = clonedSvg.querySelectorAll("text, tspan");
    textNodes.forEach((t) => {
      if (!t.getAttribute("font-family")) {
        t.setAttribute("font-family", "ui-monospace, monospace, sans-serif");
      }
    });

    const svgData = new XMLSerializer().serializeToString(clonedSvg);
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const blobURL = URL.createObjectURL(svgBlob);

    const img = new Image();
    return new Promise((resolve) => {
      img.onload = () => {
        const scale = 2;
        const headerH = 68;
        const footerH = 36;
        const totalW = width;
        const totalH = height + headerH + footerH;

        const canvas = document.createElement("canvas");
        canvas.width = totalW * scale;
        canvas.height = totalH * scale;
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          URL.revokeObjectURL(blobURL);
          resolve(false);
          return;
        }

        ctx.scale(scale, scale);

        // Background: Deep institutional navy
        ctx.fillStyle = "#0A111C";
        ctx.fillRect(0, 0, totalW, totalH);

        // Top Accent Stripe (Brass Gold)
        const grad = ctx.createLinearGradient(0, 0, totalW, 0);
        grad.addColorStop(0, "rgba(176, 141, 87, 0.2)");
        grad.addColorStop(0.5, "rgba(176, 141, 87, 1)");
        grad.addColorStop(1, "rgba(176, 141, 87, 0.2)");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, totalW, 3);

        // Header Title
        ctx.font = "bold 15px 'Newsreader', Georgia, serif";
        ctx.fillStyle = "#FBF8F1";
        ctx.fillText(title, 22, 28);

        // Subtitle / Telemetry
        ctx.font = "10px ui-monospace, SFMono-Regular, Menlo, Monaco, monospace";
        ctx.fillStyle = "#B08D57";
        const metaLine = subtitle || `SMC INSTITUTIONAL MACRO DESK // ${new Date().toISOString().replace("T", " ").slice(0, 19)} UTC`;
        ctx.fillText(metaLine, 22, 48);

        // Border around chart plot
        ctx.strokeStyle = "rgba(176, 141, 87, 0.35)";
        ctx.lineWidth = 1;
        ctx.strokeRect(18, headerH - 8, totalW - 36, height + 16);

        // Draw the chart SVG
        ctx.drawImage(img, 0, headerH, totalW, height);

        // Footer
        ctx.font = "9px ui-monospace, SFMono-Regular, Menlo, Monaco, monospace";
        ctx.fillStyle = "#8292A6";
        ctx.fillText(
          "SIN MIEDO CAPITAL // INSTITUTIONAL TELEMETRY & QUANTITATIVE INTELLIGENCE",
          22,
          totalH - 14
        );
        ctx.textAlign = "right";
        ctx.fillText("STRICTLY CONFIDENTIAL", totalW - 22, totalH - 14);

        URL.revokeObjectURL(blobURL);

        canvas.toBlob((blob) => {
          if (blob) {
            const link = document.createElement("a");
            const cleanName = filename.endsWith(".png") ? filename : `${filename}.png`;
            link.download = cleanName;
            link.href = URL.createObjectURL(blob);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setTimeout(() => URL.revokeObjectURL(link.href), 1000);
            resolve(true);
          } else {
            resolve(false);
          }
        }, "image/png");
      };

      img.onerror = (e) => {
        console.error("Image loading failed for SVG to PNG:", e);
        URL.revokeObjectURL(blobURL);
        resolve(false);
      };

      img.src = blobURL;
    });
  } catch (err) {
    console.error("Failed to export chart as PNG:", err);
    return false;
  }
};

/**
 * Backward compatibility alias
 */
export const exportSvgOrElementAsPng = exportChartElementAsPng;

/**
 * Generate 1-Page Dedicated Institutional Briefing PDF for CBOE VIX
 */
export const exportVixChartPdf = (
  spotVix: number = 19.85,
  timeframe: string = "1D",
  pulseCount: number = 124
): void => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);
  const timeUtcStr = now.toISOString().slice(11, 19) + " UTC";
  const refCode = `SMC-VIX-${dateStr.replace(/-/g, "")}-${now.getUTCHours().toString().padStart(2, "0")}${now.getUTCMinutes().toString().padStart(2, "0")}`;

  let y = 14;

  // Header Banner
  doc.setFillColor(cNavy[0], cNavy[1], cNavy[2]);
  doc.roundedRect(leftMargin, y, contentWidth, 22, 1.5, 1.5, "F");
  doc.setDrawColor(cGold[0], cGold[1], cGold[2]);
  doc.setLineWidth(0.4);
  doc.roundedRect(leftMargin, y, contentWidth, 22, 1.5, 1.5, "S");

  // Gold Badge
  doc.setFillColor(cGold[0], cGold[1], cGold[2]);
  doc.circle(leftMargin + 9, y + 11, 5.5, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.5);
  doc.setTextColor(cNavy[0], cNavy[1], cNavy[2]);
  doc.text("VIX", leftMargin + 9, y + 13, { align: "center" });

  // Main Header Text
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(cLightGold[0], cLightGold[1], cLightGold[2]);
  doc.text("CBOE VIX VOLATILITY RADAR & OPTION GAMMA TELEMETRY", leftMargin + 18, y + 8);

  doc.setFont("courier", "bold");
  doc.setFontSize(6.5);
  doc.setTextColor(190, 205, 225);
  doc.text(
    `TIMEFRAME: ${timeframe} // SPOT: ${spotVix.toFixed(2)} // 0DTE DEALER GAMMA & TAIL RISK RADAR`,
    leftMargin + 18,
    y + 14
  );

  doc.setFont("courier", "normal");
  doc.setFontSize(5.8);
  doc.setTextColor(cGold[0], cGold[1], cGold[2]);
  doc.text(`REF: ${refCode} | ${timeUtcStr}`, leftMargin + contentWidth - 4, y + 14, { align: "right" });

  y += 26;

  // 1. VIX Surface Chart
  renderVixSurfaceChart(doc, leftMargin, y, contentWidth, 68);
  y += 73;

  // 2. VIX Term Curve Chart
  renderVixTermCurveChart(doc, leftMargin, y, contentWidth, 54);
  y += 59;

  // 3. Intraday Spikes Callout Section
  y = drawSectionHeading(doc, y, "INTRADAY VOLATILITY SPIKE ANATOMY & SPX SENSITIVITY", "CATALYST REVIEWS");
  y = renderSpikeCallouts(doc, leftMargin, y, contentWidth);

  // Footer Disclaimers
  doc.setFont("courier", "normal");
  doc.setFontSize(5.5);
  doc.setTextColor(cMuted[0], cMuted[1], cMuted[2]);
  doc.text(
    "SIN MIEDO CAPITAL // STRICTLY CONFIDENTIAL // PROPRIETARY VOLATILITY SENSITIVITY MODEL",
    leftMargin,
    pageHeight - 8
  );
  doc.text(`DISPATCH: ${refCode}`, leftMargin + contentWidth, pageHeight - 8, { align: "right" });

  doc.save(`${refCode}.pdf`);
};

/**
 * Generate 1-Page Dedicated Institutional Briefing PDF for Gold Supercycle & GPR Index
 */
export const exportGoldGprChartPdf = (
  spotPrice: number = 4185.6,
  gprIndex: number = 364.5
): void => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);
  const timeUtcStr = now.toISOString().slice(11, 19) + " UTC";
  const refCode = `SMC-GOLD-GPR-${dateStr.replace(/-/g, "")}-${now.getUTCHours().toString().padStart(2, "0")}${now.getUTCMinutes().toString().padStart(2, "0")}`;

  let y = 14;

  // Header Banner
  doc.setFillColor(cNavy[0], cNavy[1], cNavy[2]);
  doc.roundedRect(leftMargin, y, contentWidth, 22, 1.5, 1.5, "F");
  doc.setDrawColor(cGold[0], cGold[1], cGold[2]);
  doc.setLineWidth(0.4);
  doc.roundedRect(leftMargin, y, contentWidth, 22, 1.5, 1.5, "S");

  // Gold Badge
  doc.setFillColor(cGold[0], cGold[1], cGold[2]);
  doc.circle(leftMargin + 9, y + 11, 5.5, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.5);
  doc.setTextColor(cNavy[0], cNavy[1], cNavy[2]);
  doc.text("XAU", leftMargin + 9, y + 13, { align: "center" });

  // Main Header Text
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(cLightGold[0], cLightGold[1], cLightGold[2]);
  doc.text("GOLD SUPERCYCLE & GEOPOLITICAL RISK (GPR) DUAL TELEMETRY", leftMargin + 18, y + 8);

  doc.setFont("courier", "bold");
  doc.setFontSize(6.5);
  doc.setTextColor(190, 205, 225);
  doc.text(
    `XAU/USD: $${spotPrice.toLocaleString("en-US", { minimumFractionDigits: 2 })} // GPR: ${gprIndex} (DEFCON 2) // +0.82 CORRELATION`,
    leftMargin + 18,
    y + 14
  );

  doc.setFont("courier", "normal");
  doc.setFontSize(5.8);
  doc.setTextColor(cGold[0], cGold[1], cGold[2]);
  doc.text(`REF: ${refCode} | ${timeUtcStr}`, leftMargin + contentWidth - 4, y + 14, { align: "right" });

  y += 26;

  // 1. Gold Supercycle Chart
  renderGoldSupercycleChart(doc, leftMargin, y, contentWidth, 68);
  y += 73;

  // 2. GPR 24-Month Kinetic Index Chart
  renderGprIndexChart(doc, leftMargin, y, contentWidth, 64);
  y += 69;

  // 3. Macro Transmission Takeaways Box
  doc.setFillColor(cPaleGold[0], cPaleGold[1], cPaleGold[2]);
  doc.roundedRect(leftMargin, y, contentWidth, 38, 1.5, 1.5, "F");
  doc.setDrawColor(cGold[0], cGold[1], cGold[2]);
  doc.setLineWidth(0.3);
  doc.roundedRect(leftMargin, y, contentWidth, 38, 1.5, 1.5, "S");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(cNavy[0], cNavy[1], cNavy[2]);
  doc.text("MACRO STRATEGIC COVARIANCE // GOLD & GPR TRANSMISSION MECHANISMS", leftMargin + 4, y + 6);

  const notes = [
    "• Safe-Haven Delta Hedge: 30-day rolling correlation between XAU/USD and Caldara-Iacoviello GPR stands at +0.82.",
    "• Sovereign De-Dollarization Floor: Central bank accumulation of 1,080 tonnes annually establishes structural floor at $3,200.",
    "• Kinetic War Shock: GPR Acts surged +107 pts following kinetic strikes on Iranian energy facilities, propelling crude risk premium to +$18.50/bbl.",
    "• Chokepoints Vulnerability: 82% Cape diversion rate around Bab el-Mandeb sustains supply-side stagflationary pressures globally."
  ];

  doc.setFont("courier", "normal");
  doc.setFontSize(6.2);
  doc.setTextColor(cDarkText[0], cDarkText[1], cDarkText[2]);
  let noteY = y + 12;
  notes.forEach((n) => {
    doc.text(n, leftMargin + 4, noteY);
    noteY += 6;
  });

  // Footer
  doc.setFont("courier", "normal");
  doc.setFontSize(5.5);
  doc.setTextColor(cMuted[0], cMuted[1], cMuted[2]);
  doc.text(
    "SIN MIEDO CAPITAL // GEOPOLITICAL RISK DESK // QUANTITATIVE MACRO RESEARCH",
    leftMargin,
    pageHeight - 8
  );
  doc.text(`DISPATCH: ${refCode}`, leftMargin + contentWidth, pageHeight - 8, { align: "right" });

  doc.save(`${refCode}.pdf`);
};

/**
 * Generate 1-Page Dedicated Institutional Briefing PDF for the Complete 9x9 Cross-Asset Matrix
 */
export const exportMatrix9x9Pdf = (
  matrixData: Record<string, Record<string, number>>,
  activeTimeframe: string = "30D"
): void => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);
  const timeUtcStr = now.toISOString().slice(11, 19) + " UTC";
  const refCode = `SMC-MATRIX9X9-${dateStr.replace(/-/g, "")}-${now.getUTCHours().toString().padStart(2, "0")}${now.getUTCMinutes().toString().padStart(2, "0")}`;

  let y = 14;

  // Header Banner
  doc.setFillColor(cNavy[0], cNavy[1], cNavy[2]);
  doc.roundedRect(leftMargin, y, contentWidth, 22, 1.5, 1.5, "F");
  doc.setDrawColor(cGold[0], cGold[1], cGold[2]);
  doc.setLineWidth(0.4);
  doc.roundedRect(leftMargin, y, contentWidth, 22, 1.5, 1.5, "S");

  // Seal / Icon
  doc.setFillColor(cGold[0], cGold[1], cGold[2]);
  doc.circle(leftMargin + 9, y + 11, 5.5, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6);
  doc.setTextColor(cNavy[0], cNavy[1], cNavy[2]);
  doc.text("9×9", leftMargin + 9, y + 13, { align: "center" });

  // Main Header Text
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(cLightGold[0], cLightGold[1], cLightGold[2]);
  doc.text("9×9 CROSS-ASSET MACRO CORRELATION & COVARIANCE MATRIX", leftMargin + 18, y + 8);

  doc.setFont("courier", "bold");
  doc.setFontSize(6.5);
  doc.setTextColor(190, 205, 225);
  doc.text(
    `REGIME: ${activeTimeframe} ROLLING // PEARSON TRANSMISSION COEFFICIENTS ACROSS 9 CORE MACRO ANCHORS`,
    leftMargin + 18,
    y + 14
  );

  doc.setFont("courier", "normal");
  doc.setFontSize(5.8);
  doc.setTextColor(cGold[0], cGold[1], cGold[2]);
  doc.text(`REF: ${refCode} | ${timeUtcStr}`, leftMargin + contentWidth - 4, y + 14, { align: "right" });

  y += 28;

  // Asset definitions
  const assets = [
    { id: "xau", ticker: "XAU/USD", name: "Gold Spot", cat: "Metals" },
    { id: "btc", ticker: "BTC/USD", name: "Bitcoin Spot", cat: "Crypto" },
    { id: "brent", ticker: "BRENT", name: "Crude Oil", cat: "Energy" },
    { id: "usdjpy", ticker: "USD/JPY", name: "Dollar/Yen", cat: "FX" },
    { id: "eurusd", ticker: "EUR/USD", name: "Euro/Dollar", cat: "FX" },
    { id: "ibex", ticker: "IBEX 35", name: "Spain Beta", cat: "Equity" },
    { id: "gpr", ticker: "GPR IDX", name: "Geopolitics", cat: "Risk" },
    { id: "ustjgb", ticker: "UST-JGB", name: "10Y Spread", cat: "Rates" },
    { id: "shadow", ticker: "SHADOW", name: "Dark Fleet", cat: "Supply" },
  ];

  const colLabelW = 29;
  const numCols = 9;
  const cellW = (contentWidth - colLabelW) / numCols; // 17mm each
  const cellH = 9.2;

  // Table Container Background
  const tableH = (numCols + 1) * cellH;
  doc.setFillColor(cDeepNavy[0], cDeepNavy[1], cDeepNavy[2]);
  doc.roundedRect(leftMargin, y, contentWidth, tableH + 4, 1.5, 1.5, "F");
  doc.setDrawColor(cGold[0], cGold[1], cGold[2]);
  doc.setLineWidth(0.4);
  doc.roundedRect(leftMargin, y, contentWidth, tableH + 4, 1.5, 1.5, "S");

  // Header Row
  doc.setFont("courier", "bold");
  doc.setFontSize(6.2);
  doc.setTextColor(cLightGold[0], cLightGold[1], cLightGold[2]);
  doc.text("ASSET / ANCHOR", leftMargin + 3, y + 6);

  assets.forEach((colAsset, j) => {
    const cx = leftMargin + colLabelW + j * cellW;
    doc.text(colAsset.ticker, cx + cellW / 2, y + 6, { align: "center" });
  });

  doc.setDrawColor(cGold[0], cGold[1], cGold[2]);
  doc.setLineWidth(0.25);
  doc.line(leftMargin, y + cellH, leftMargin + contentWidth, y + cellH);

  // Rows
  assets.forEach((rowAsset, i) => {
    const ry = y + (i + 1) * cellH;

    // Row label
    doc.setFont("courier", "bold");
    doc.setFontSize(6.2);
    doc.setTextColor(190, 205, 225);
    doc.text(rowAsset.ticker, leftMargin + 3, ry + 5.5);

    doc.setFont("courier", "normal");
    doc.setFontSize(4.8);
    doc.setTextColor(cGold[0], cGold[1], cGold[2]);
    doc.text(rowAsset.cat, leftMargin + 20, ry + 5.5);

    // Cells
    assets.forEach((colAsset, j) => {
      const cx = leftMargin + colLabelW + j * cellW;
      const isDiagonal = rowAsset.id === colAsset.id;
      const r = matrixData[rowAsset.id]?.[colAsset.id] ?? (isDiagonal ? 1.0 : 0.0);

      // Cell background fill
      if (isDiagonal) {
        doc.setFillColor(30, 42, 60);
      } else if (r >= 0.70) {
        doc.setFillColor(120, 92, 40); // gold
      } else if (r >= 0.30) {
        doc.setFillColor(65, 52, 28);
      } else if (r <= -0.70) {
        doc.setFillColor(130, 30, 20); // deep red
      } else if (r <= -0.30) {
        doc.setFillColor(75, 25, 22);
      } else {
        doc.setFillColor(18, 25, 36);
      }

      doc.rect(cx + 0.5, ry + 0.8, cellW - 1, cellH - 1.6, "F");

      // Cell text
      doc.setFont("courier", "bold");
      doc.setFontSize(5.8);

      if (isDiagonal) {
        doc.setTextColor(240, 240, 240);
        doc.text("1.00", cx + cellW / 2, ry + 5.5, { align: "center" });
      } else {
        if (r >= 0.70) {
          doc.setTextColor(255, 240, 200);
        } else if (r >= 0.30) {
          doc.setTextColor(cLightGold[0], cLightGold[1], cLightGold[2]);
        } else if (r <= -0.70) {
          doc.setTextColor(255, 200, 200);
        } else if (r <= -0.30) {
          doc.setTextColor(255, 150, 150);
        } else {
          doc.setTextColor(140, 155, 175);
        }
        const valStr = r >= 0 ? `+${r.toFixed(2)}` : r.toFixed(2);
        doc.text(valStr, cx + cellW / 2, ry + 5.5, { align: "center" });
      }
    });

    // Horizontal row divider
    doc.setDrawColor(35, 48, 68);
    doc.setLineWidth(0.15);
    doc.line(leftMargin, ry + cellH, leftMargin + contentWidth, ry + cellH);
  });

  y += tableH + 12;

  // Key Pairwise Highlights Box
  doc.setFillColor(cPaleGold[0], cPaleGold[1], cPaleGold[2]);
  doc.roundedRect(leftMargin, y, contentWidth, 38, 1.5, 1.5, "F");
  doc.setDrawColor(cGold[0], cGold[1], cGold[2]);
  doc.setLineWidth(0.3);
  doc.roundedRect(leftMargin, y, contentWidth, 38, 1.5, 1.5, "S");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(cNavy[0], cNavy[1], cNavy[2]);
  doc.text("EXECUTIVE CROSS-ASSET TRANSMISSION FINDINGS", leftMargin + 4, y + 6);

  const findings = [
    "• XAU/USD ↔ GPR IDX (+0.82): Gold functions as the premier sovereign safe-haven proxy against DEFCON 2 Middle East war risk.",
    "• BRENT ↔ GPR IDX (+0.79): Embedded war-risk premium exceeds +$18.50/bbl due to Strait of Hormuz closure probabilities.",
    "• USD/JPY ↔ UST-JGB (+0.76): Yield spread remains primary directional vector; MoF covert interventions enforce sharp counter-trend squeezes.",
    "• IBEX 35 ↔ GPR IDX (-0.64): European equities exhibit high downside vulnerability to sovereign bond fragmentation and energy shock inflation."
  ];

  doc.setFont("courier", "normal");
  doc.setFontSize(6.2);
  doc.setTextColor(cDarkText[0], cDarkText[1], cDarkText[2]);
  let fy = y + 12;
  findings.forEach((f) => {
    doc.text(f, leftMargin + 4, fy);
    fy += 6;
  });

  // Footer
  doc.setFont("courier", "normal");
  doc.setFontSize(5.5);
  doc.setTextColor(cMuted[0], cMuted[1], cMuted[2]);
  doc.text(
    "SIN MIEDO CAPITAL // QUANTITATIVE MACRO STRATEGY // 9X9 COVARIANCE DESK",
    leftMargin,
    pageHeight - 8
  );
  doc.text(`DISPATCH: ${refCode}`, leftMargin + contentWidth, pageHeight - 8, { align: "right" });

  doc.save(`${refCode}.pdf`);
};

/**
 * Generate 1-Page Dedicated Institutional Briefing PDF for Iranian Shadow-Fleet
 */
export const exportShadowFleetPdf = (
  fleetData: {
    activeDarkTankers: number;
    illicitOutflowBpd: string;
    outflowChange: string;
    aisSpoofingBeacons: number;
    stsClustersCount: number;
    monitoredTotal: number;
    sarSatellitePass?: string;
    complianceStatus?: string;
    deskCode?: string;
    synthesis?: string;
  },
  brentPrice: number = 100.04
): void => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);
  const timeUtcStr = now.toISOString().slice(11, 19) + " UTC";
  const refCode = `SMC-FLEET-${dateStr.replace(/-/g, "")}-${now.getUTCHours().toString().padStart(2, "0")}${now.getUTCMinutes().toString().padStart(2, "0")}`;

  let y = 14;

  // Header Banner
  doc.setFillColor(cNavy[0], cNavy[1], cNavy[2]);
  doc.roundedRect(leftMargin, y, contentWidth, 22, 1.5, 1.5, "F");
  doc.setDrawColor(cGold[0], cGold[1], cGold[2]);
  doc.setLineWidth(0.4);
  doc.roundedRect(leftMargin, y, contentWidth, 22, 1.5, 1.5, "S");

  // Gold Badge
  doc.setFillColor(cGold[0], cGold[1], cGold[2]);
  doc.circle(leftMargin + 9, y + 11, 5.5, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.0);
  doc.setTextColor(cNavy[0], cNavy[1], cNavy[2]);
  doc.text("FLEET", leftMargin + 9, y + 13, { align: "center" });

  // Main Header Text
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.0);
  doc.setTextColor(cLightGold[0], cLightGold[1], cLightGold[2]);
  doc.text("GLOBAL SHADOW-FLEET TELEMETRY: IRAN & RUSSIA (88% INDIA CRUDE)", leftMargin + 18, y + 8);

  doc.setFont("courier", "bold");
  doc.setFontSize(6.2);
  doc.setTextColor(190, 205, 225);
  doc.text(
    `BRENT: $${brentPrice.toFixed(2)}/BBL // TOTAL DARK HULLS: ${fleetData.activeDarkTankers} // COMBINED REVENUE: $139.4B`,
    leftMargin + 18,
    y + 14
  );

  doc.setFont("courier", "normal");
  doc.setFontSize(5.5);
  doc.setTextColor(cGold[0], cGold[1], cGold[2]);
  doc.text(`REF: ${refCode} | ${timeUtcStr}`, leftMargin + contentWidth - 4, y + 14, { align: "right" });

  y += 26;

  // 1. Operational KPI Metric Cards Grid
  const cardW = (contentWidth - 6) / 4;
  const cardH = 20;

  const kpis = [
    { label: "ACTIVE DARK TANKERS", val: `${fleetData.activeDarkTankers}`, sub: "412 Iran / 685 Russia", color: cGold },
    { label: "RUSSIA→INDIA DARK", val: "88.0%", sub: "1.65M bpd shadow transit", color: cGreen },
    { label: "COMBINED 24M INTAKE", val: "$139.4B", sub: "Iran $77B / Russia $62.4B", color: cLightGold },
    { label: "RUSSIAN URALS FOB", val: `$${(brentPrice - 7.20).toFixed(2)}`, sub: "-$7.20 vs Brent ($104.25 CIF)", color: cGreen },
  ];

  kpis.forEach((kpi, idx) => {
    const kx = leftMargin + idx * (cardW + 2);
    doc.setFillColor(cPaleGold[0], cPaleGold[1], cPaleGold[2]);
    doc.roundedRect(kx, y, cardW, cardH, 1, 1, "F");
    doc.setDrawColor(cBorder[0], cBorder[1], cBorder[2]);
    doc.setLineWidth(0.25);
    doc.roundedRect(kx, y, cardW, cardH, 1, 1, "S");

    doc.setFont("courier", "bold");
    doc.setFontSize(5.0);
    doc.setTextColor(cDarkText[0], cDarkText[1], cDarkText[2]);
    doc.text(kpi.label, kx + 3, y + 4.5);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(kpi.color[0], kpi.color[1], kpi.color[2]);
    doc.text(kpi.val, kx + 3, y + 11.5);

    doc.setFont("courier", "normal");
    doc.setFontSize(5.0);
    doc.setTextColor(cDarkText[0], cDarkText[1], cDarkText[2]);
    doc.text(kpi.sub, kx + 3, y + 17);
  });

  y += cardH + 7;

  // 2. Pricing Matrix & Netback Realization Table
  y = drawSectionHeading(doc, y, "SANCTIONS PRICING MATRIX & NETBACK (FOB TERMINAL vs CIF DISCHARGE)", "CRUDE DISCOUNTS");

  const tableHeaders = ["CRUDE GRADE / THEATER", "LOADING TERMINAL", "FOB NETBACK", "BRENT DELTA", "GHOST FREIGHT", "DELIVERED CIF"];
  const colWidths = [45, 38, 25, 25, 25, 26];

  // Table header row
  doc.setFillColor(cNavy[0], cNavy[1], cNavy[2]);
  doc.rect(leftMargin, y, contentWidth, 5.5, "F");
  doc.setFont("courier", "bold");
  doc.setFontSize(5.5);
  doc.setTextColor(cGold[0], cGold[1], cGold[2]);

  let hx = leftMargin + 2;
  tableHeaders.forEach((th, i) => {
    doc.text(th, hx, y + 3.8);
    hx += colWidths[i];
  });
  y += 5.5;

  const rows = [
    { grade: "Russian Urals (India 88%)", loc: "Primorsk / Novorossiysk", fob: `$${(brentPrice - 7.20).toFixed(2)}`, delta: "-$7.20/bbl", sts: "+$6.20/bbl", cif: `$${(brentPrice - 7.20 + 6.20).toFixed(2)}` },
    { grade: "Russian ESPO (China)", loc: "Kozmino (Pacific)", fob: `$${(brentPrice - 3.80).toFixed(2)}`, delta: "-$3.80/bbl", sts: "+$3.65/bbl", cif: `$${(brentPrice - 3.80 + 3.65).toFixed(2)}` },
    { grade: "Iranian Light (NIOC)", loc: "Kharg Island FOB", fob: `$${(brentPrice - 7.90).toFixed(2)}`, delta: "-$7.90/bbl", sts: "+$4.85/bbl", cif: `$${(brentPrice - 7.90 + 4.85).toFixed(2)}` },
    { grade: "Iranian Heavy (NIOC)", loc: "Kharg Island FOB", fob: `$${(brentPrice - 12.02).toFixed(2)}`, delta: "-$12.02/bbl", sts: "+$4.85/bbl", cif: `$${(brentPrice - 12.02 + 4.85).toFixed(2)}` },
    { grade: "South Pars Condensate", loc: "Bandar Assaluyeh", fob: `$${(brentPrice - 9.62).toFixed(2)}`, delta: "-$9.62/bbl", sts: "+$5.10/bbl", cif: `$${(brentPrice - 9.62 + 5.10).toFixed(2)}` },
  ];

  rows.forEach((r, rIdx) => {
    if (rIdx % 2 === 0) {
      doc.setFillColor(248, 246, 240);
      doc.rect(leftMargin, y, contentWidth, 5.2, "F");
    }
    doc.setFont("courier", "normal");
    doc.setFontSize(5.5);
    doc.setTextColor(cDarkText[0], cDarkText[1], cDarkText[2]);

    let rx = leftMargin + 2;
    doc.text(r.grade, rx, y + 3.6);
    rx += colWidths[0];
    doc.text(r.loc, rx, y + 3.6);
    rx += colWidths[1];

    doc.setFont("courier", "bold");
    doc.setTextColor(cGreen[0], cGreen[1], cGreen[2]);
    doc.text(r.fob, rx, y + 3.6);
    rx += colWidths[2];

    doc.setTextColor(cRed[0], cRed[1], cRed[2]);
    doc.text(r.delta, rx, y + 3.6);
    rx += colWidths[3];

    doc.setTextColor(cGold[0], cGold[1], cGold[2]);
    doc.text(r.sts, rx, y + 3.6);
    rx += colWidths[4];

    doc.setTextColor(cDarkText[0], cDarkText[1], cDarkText[2]);
    doc.text(r.cif, rx, y + 3.6);

    y += 5.2;
  });

  y += 7;

  // 3. Settlement Channels Breakdown
  y = drawSectionHeading(doc, y, "DE-DOLLARIZED REVENUE CLEARING CHANNELS ($139.4B 24M TOTAL)", "CAPITAL FLOWS");

  const channels = [
    { title: "UAE Dirhams (AED) & INR Vostro", pct: "40.3% ($56.2B)", desc: "88% India-Russia shadow trade via Dubai DMCC & Indian public bank accounts." },
    { title: "CIPS / RMB Escrow (Kunlun Bank)", pct: "41.9% ($58.4B)", desc: "Direct bilateral escrow accounts for Chinese independent teapot refiners." },
    { title: "Physical Gold & Barter Swaps", pct: "17.8% ($24.8B)", desc: "Physical bullion transfers, machine tooling, and heavy Venezuelan condensate swaps." },
  ];

  const chW = (contentWidth - 4) / 3;
  channels.forEach((ch, idx) => {
    const cx = leftMargin + idx * (chW + 2);
    doc.setFillColor(cPaleGold[0], cPaleGold[1], cPaleGold[2]);
    doc.roundedRect(cx, y, chW, 18, 1, 1, "F");
    doc.setDrawColor(cBorder[0], cBorder[1], cBorder[2]);
    doc.setLineWidth(0.25);
    doc.roundedRect(cx, y, chW, 18, 1, 1, "S");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.2);
    doc.setTextColor(cNavy[0], cNavy[1], cNavy[2]);
    doc.text(ch.title, cx + 2.5, y + 4.5);

    doc.setFont("courier", "bold");
    doc.setFontSize(8.0);
    doc.setTextColor(cGold[0], cGold[1], cGold[2]);
    doc.text(ch.pct, cx + 2.5, y + 9.5);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(5.0);
    doc.setTextColor(cDarkText[0], cDarkText[1], cDarkText[2]);
    doc.text(doc.splitTextToSize(ch.desc, chW - 5), cx + 2.5, y + 13.5);
  });

  y += 24;

  // 4. STS Transshipment Corridors & Radar
  y = drawSectionHeading(doc, y, "PRIMARY SHIP-TO-SHIP (STS) CORRIDORS & SAR SATELLITE PASS", "MARITIME SURVEILLANCE");

  const stsHubs = [
    "• Riau Archipelago / Karimun (DEFCON 1): 4 active VLCC pairs transferring; crude rebranded as 'Malaysian Blend'.",
    "• East Tanjung Sedili: 2 heavy fuel/crude clusters; Aframax-to-VLCC consolidation zone off Johor coast.",
    "• Lingga Anchorage: Floating storage buffering South Pars condensate during peak refinery cycles.",
    "• Fujairah Outer Anchorage: Night-time dark fuel bunkering outside UAE territorial waters.",
  ];

  doc.setFont("courier", "normal");
  doc.setFontSize(6.0);
  doc.setTextColor(cDarkText[0], cDarkText[1], cDarkText[2]);
  stsHubs.forEach((hub) => {
    doc.text(hub, leftMargin + 2, y + 3);
    y += 4.5;
  });

  y += 4;

  // 5. Synthesis Box
  doc.setFillColor(cNavy[0], cNavy[1], cNavy[2]);
  doc.roundedRect(leftMargin, y, contentWidth, 20, 1.5, 1.5, "F");
  doc.setDrawColor(cGold[0], cGold[1], cGold[2]);
  doc.setLineWidth(0.3);
  doc.roundedRect(leftMargin, y, contentWidth, 20, 1.5, 1.5, "S");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.5);
  doc.setTextColor(cGold[0], cGold[1], cGold[2]);
  doc.text("SMC SATELLITE INTELLIGENCE SYNTHESIS & AIS SPOOFING RADAR", leftMargin + 3, y + 5);

  const synthText = fleetData.synthesis || "Kharg Island loadings maintain 1.62M bpd run-rate with electronic circle-drift AIS spoofing concealing 84% of dark tanker transfers before discharging at Shandong independent teapot terminals.";
  doc.setFont("times", "italic");
  doc.setFontSize(6.5);
  doc.setTextColor(240, 245, 255);
  doc.text(doc.splitTextToSize(`"${synthText}"`, contentWidth - 6), leftMargin + 3, y + 10);

  // Footer
  doc.setFont("courier", "normal");
  doc.setFontSize(5.5);
  doc.setTextColor(cMuted[0], cMuted[1], cMuted[2]);
  doc.text(
    `SIN MIEDO CAPITAL // MARITIME TELEMETRY & SANCTIONS DESK // COMPLIANCE: ${fleetData.complianceStatus || "OFAC NON-COMPLIANT (INTERDICTED)"}`,
    leftMargin,
    pageHeight - 8
  );
  doc.text(`DESK: ${fleetData.deskCode || "SMC-SAR-DESK-4"}`, leftMargin + contentWidth, pageHeight - 8, { align: "right" });

  doc.save(`${refCode}.pdf`);
};
