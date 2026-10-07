import React, { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Globe,
  SlidersHorizontal,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Info,
  Layers,
  Sparkles,
  Maximize2,
  RefreshCw,
  BarChart3,
  LayoutGrid
} from "lucide-react";
import { MacroDataState } from "../../types";
import { ChartExportDropdown } from "../ChartExportDropdown";
import { exportChartElementAsPng } from "../../utils/chartExportUtils";

export interface EquityIndexItem {
  key: string;
  symbol: string;
  name: string;
  region: "Asia" | "Europe" | "US";
  flag: string;
  exchange: string;
  spot: number;
  change24h: number;
  currency: string;
  status: string;
  catalyst: string;
}

interface EquityCorrelationMatrixProps {
  macroData?: MacroDataState;
  onOpenTerminal?: (customPrompt?: string) => void;
}

export type TimeframeOption = "24H" | "30D" | "1Y";
export type MatrixScope = "tri-regional" | "global-all" | "us-focus" | "eu-vs-asia";
export type MatrixViewMode = "dual" | "cards" | "chart";

// Custom Tooltip for the Divergence & Beta Transmission Chart
const CustomDivergenceTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const isPos = data.change24h >= 0;
    return (
      <div className="bg-[#0A111C]/95 border border-[#B08D57]/50 rounded-lg p-2.5 shadow-2xl font-mono-data text-xs max-w-xs backdrop-blur-md">
        <div className="flex items-center justify-between gap-2 border-b border-[#B08D57]/20 pb-1.5 mb-1.5">
          <div className="flex items-center gap-1.5">
            <span className="text-sm">{data.flag}</span>
            <span className="font-bold text-[#EDE9DE]">{data.fullName}</span>
          </div>
          <span
            className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
              data.region === "Asia"
                ? "bg-emerald-950/80 text-emerald-300 border border-emerald-500/30"
                : data.region === "US"
                ? "bg-sky-950/80 text-sky-300 border border-sky-500/30"
                : "bg-amber-950/80 text-amber-300 border border-amber-500/30"
            }`}
          >
            {data.region}
          </span>
        </div>
        <div className="space-y-1 text-[11px]">
          <div className="flex items-center justify-between">
            <span className="text-[#8292A6]">Spot Level:</span>
            <span className="text-[#EDE9DE] font-bold">
              {data.spot > 1000 ? data.spot.toLocaleString() : data.spot.toFixed(2)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#8292A6]">Session Return:</span>
            <span className={`font-bold ${isPos ? "text-emerald-400" : "text-rose-400"}`}>
              {isPos ? "+" : ""}{data.change24h}%
            </span>
          </div>
          <div className="pt-1.5 mt-1.5 border-t border-[#B08D57]/15 text-[9.5px] text-[#8292A6] leading-tight">
            <span className="text-[#E5C794] font-semibold">Macro Driver: </span>
            {data.catalyst}
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export const EquityCorrelationMatrix: React.FC<EquityCorrelationMatrixProps> = ({
  macroData,
  onOpenTerminal
}) => {
  const [timeframe, setTimeframe] = useState<TimeframeOption>("24H");
  const [scope, setScope] = useState<MatrixScope>("tri-regional");
  const [viewMode, setViewMode] = useState<MatrixViewMode>("dual");
  const [selectedPair, setSelectedPair] = useState<[string, string]>(["nasdaq", "dax"]);

  // Helper to safely extract live ticker values
  const getTicker = (sym: string, defaultPrice: number, defaultChange: number, defaultStatus: string) => {
    if (!macroData?.tickers) {
      return { price: defaultPrice, change: defaultChange, status: defaultStatus };
    }
    const found = macroData.tickers.find(t => t.symbol.toUpperCase().includes(sym.toUpperCase()));
    return {
      price: found ? found.price : defaultPrice,
      change: found ? found.change : defaultChange,
      status: found?.status || defaultStatus
    };
  };

  // Live equity index telemetry across Asia, Europe, and US
  const equitiesData: Record<string, EquityIndexItem> = useMemo(() => {
    const kospi = getTicker("KOSPI", 1112.00, 2.00, "BULLISH BREAKOUT");
    const nikkei = getTicker("NIKKEI", 66368.0, 3.47, "TECH ACCUMULATION");
    const hsi = getTicker("HANG SENG", 25054.0, 0.55, "STIMULUS EXPANSION");
    const dax = getTicker("DAX 40", 19535.0, -0.34, "INDUSTRIAL HEADWINDS");
    const ibex = getTicker("IBEX 35", 19742.0, -0.28, "ENERGY DRAG");
    const fesx = getTicker("EURO STOXX 50", 5048.0, -0.38, "DEFENSIVE ROTATION");
    const ftse = getTicker("FTSE 100", 8365.4, -0.16, "COMMODITY BID");
    const sp500 = getTicker("S&P 500", 7704.13, -0.02, "TECH CARRY");
    const nasdaq = getTicker("NASDAQ 100", 30935.00, 0.55, "AI EXPANSION");
    const dow = getTicker("DOW 30", 43890.0, 0.12, "BLUE CHIP RESILIENCE");
    const russell = getTicker("RUSSELL 2000", 2214.50, -0.15, "RATE SCRUTINY");

    return {
      // --- ASIA PACIFIC ---
      kospi: {
        key: "kospi",
        symbol: "KOSPI 200",
        name: "Korea Composite 200",
        region: "Asia",
        flag: "🇰🇷",
        exchange: "KRX Seoul",
        spot: kospi.price,
        change24h: kospi.change,
        currency: "KRW",
        status: kospi.status,
        catalyst: "HBM3e / AI Memory foundry demand (Samsung & SK Hynix) and stable won"
      },
      nikkei: {
        key: "nikkei",
        symbol: "Nikkei 225",
        name: "Tokyo Nikkei 225",
        region: "Asia",
        flag: "🇯🇵",
        exchange: "JPX Osaka",
        spot: nikkei.price,
        change24h: nikkei.change,
        currency: "JPY",
        status: nikkei.status,
        catalyst: "Exporters gaining on orderly yen carry unwind & semiconductor equipment capex"
      },
      hangseng: {
        key: "hangseng",
        symbol: "Hang Seng",
        name: "Hong Kong Hang Seng Index",
        region: "Asia",
        flag: "🇭🇰",
        exchange: "HKEX",
        spot: hsi.price,
        change24h: hsi.change,
        currency: "HKD",
        status: hsi.status,
        catalyst: "PBOC liquidity injections and tech platform share buyback authorizations"
      },

      // --- EUROPE ---
      dax: {
        key: "dax",
        symbol: "DAX 40",
        name: "Frankfurt DAX 40",
        region: "Europe",
        flag: "🇩🇪",
        exchange: "Eurex Frankfurt",
        spot: dax.price,
        change24h: dax.change,
        currency: "EUR",
        status: dax.status,
        catalyst: "Brent >$100 energy input cost shock & supply chain rerouting around Cape"
      },
      ibex: {
        key: "ibex",
        symbol: "IBEX 35",
        name: "Madrid IBEX 35",
        region: "Europe",
        flag: "🇪🇸",
        exchange: "BME Madrid",
        spot: ibex.price,
        change24h: ibex.change,
        currency: "EUR",
        status: ibex.status,
        catalyst: "Banking margin pressure & sovereign debt servicing scrutiny under ECB vigilance"
      },
      fesx: {
        key: "fesx",
        symbol: "Euro Stoxx 50",
        name: "Eurozone Blue Chip",
        region: "Europe",
        flag: "🇪🇺",
        exchange: "Eurex",
        spot: fesx.price,
        change24h: fesx.change,
        currency: "EUR",
        status: fesx.status,
        catalyst: "Broad European cyclical softening & chokepoint freight cost inflation"
      },
      ftse: {
        key: "ftse",
        symbol: "FTSE 100",
        name: "London FTSE 100",
        region: "Europe",
        flag: "🇬🇧",
        exchange: "LSE London",
        spot: ftse.price,
        change24h: ftse.change,
        currency: "GBP",
        status: ftse.status,
        catalyst: "Defensive oil/mining majors offset by domestic retail & industrial margin squeeze"
      },

      // --- UNITED STATES ---
      sp500: {
        key: "sp500",
        symbol: "S&P 500",
        name: "US S&P 500 Large Cap",
        region: "US",
        flag: "🇺🇸",
        exchange: "CME Globex",
        spot: sp500.price,
        change24h: sp500.change,
        currency: "USD",
        status: sp500.status,
        catalyst: "Mega-cap balance sheet cash insulation balancing higher Treasury term premium"
      },
      nasdaq: {
        key: "nasdaq",
        symbol: "Nasdaq 100",
        name: "US Nasdaq 100 Tech",
        region: "US",
        flag: "🇺🇸",
        exchange: "CME / Nasdaq",
        spot: nasdaq.price,
        change24h: nasdaq.change,
        currency: "USD",
        status: nasdaq.status,
        catalyst: "Hyperscaler AI infrastructure spending, custom silicon & cloud workload demand"
      },
      dow: {
        key: "dow",
        symbol: "Dow Jones 30",
        name: "Dow Jones Industrial",
        region: "US",
        flag: "🇺🇸",
        exchange: "CBOT / NYSE",
        spot: dow.price,
        change24h: dow.change,
        currency: "USD",
        status: dow.status,
        catalyst: "Industrial resilience, aerospace backlogs and defensive healthcare dividends"
      },
      russell: {
        key: "russell",
        symbol: "Russell 2000",
        name: "US Small-Cap 2000",
        region: "US",
        flag: "🇺🇸",
        exchange: "CME / ICE",
        spot: russell.price,
        change24h: russell.change,
        currency: "USD",
        status: russell.status,
        catalyst: "High floating-rate debt refinancing sensitivity to higher-for-longer Fed policy"
      }
    };
  }, [macroData]);

  // Keys active based on selected scope
  const activeKeys = useMemo(() => {
    switch (scope) {
      case "tri-regional":
        // 10 Core Benchmarks: Asia 3 + Europe 3 + US 4
        return ["kospi", "nikkei", "hangseng", "dax", "ibex", "fesx", "sp500", "nasdaq", "dow", "russell"];
      case "global-all":
        // All 11 Benchmarks including FTSE 100
        return ["kospi", "nikkei", "hangseng", "dax", "ibex", "fesx", "ftse", "sp500", "nasdaq", "dow", "russell"];
      case "us-focus":
        // US Indices first, followed by Asia and Europe
        return ["sp500", "nasdaq", "dow", "russell", "kospi", "nikkei", "hangseng", "dax", "ibex", "fesx"];
      case "eu-vs-asia":
        // Original 6x6 Core
        return ["kospi", "nikkei", "hangseng", "dax", "ibex", "fesx"];
      default:
        return ["kospi", "nikkei", "hangseng", "dax", "ibex", "fesx", "sp500", "nasdaq", "dow", "russell"];
    }
  }, [scope]);

  // Correlation Matrices across time horizons (24H Live, 30D Conflict, 1Y Peacetime Baseline)
  // All 11 indices symmetrically computed across Asia, Europe, and US
  const correlationData: Record<TimeframeOption, Record<string, Record<string, number>>> = useMemo(() => ({
    "24H": {
      kospi:    { kospi: 1.00, nikkei: 0.84, hangseng: 0.78, dax: -0.16, ibex: -0.12, fesx: -0.19, ftse: -0.05, sp500: 0.48, nasdaq: 0.54, dow: 0.36, russell: 0.32 },
      nikkei:   { kospi: 0.84, nikkei: 1.00, hangseng: 0.72, dax: -0.22, ibex: -0.18, fesx: -0.25, ftse: -0.08, sp500: 0.52, nasdaq: 0.58, dow: 0.42, russell: 0.35 },
      hangseng: { kospi: 0.78, nikkei: 0.72, hangseng: 1.00, dax: -0.09, ibex: -0.04, fesx: -0.11, ftse: 0.02,  sp500: 0.38, nasdaq: 0.44, dow: 0.28, russell: 0.22 },
      dax:      { kospi: -0.16, nikkei: -0.22, hangseng: -0.09, dax: 1.00, ibex: 0.88, fesx: 0.93, ftse: 0.79, sp500: 0.28, nasdaq: 0.24, dow: 0.38, russell: 0.21 },
      ibex:     { kospi: -0.12, nikkei: -0.18, hangseng: -0.04, dax: 0.88, ibex: 1.00, fesx: 0.86, ftse: 0.72, sp500: 0.22, nasdaq: 0.18, dow: 0.32, russell: 0.16 },
      fesx:     { kospi: -0.19, nikkei: -0.25, hangseng: -0.11, dax: 0.93, ibex: 0.86, fesx: 1.00, ftse: 0.81, sp500: 0.26, nasdaq: 0.22, dow: 0.34, russell: 0.19 },
      ftse:     { kospi: -0.05, nikkei: -0.08, hangseng: 0.02,  dax: 0.79, ibex: 0.72, fesx: 0.81, ftse: 1.00, sp500: 0.42, nasdaq: 0.36, dow: 0.48, russell: 0.28 },
      sp500:    { kospi: 0.48, nikkei: 0.52, hangseng: 0.38, dax: 0.28, ibex: 0.22, fesx: 0.26, ftse: 0.42, sp500: 1.00, nasdaq: 0.93, dow: 0.84, russell: 0.72 },
      nasdaq:   { kospi: 0.54, nikkei: 0.58, hangseng: 0.44, dax: 0.24, ibex: 0.18, fesx: 0.22, ftse: 0.36, sp500: 0.93, nasdaq: 1.00, dow: 0.76, russell: 0.68 },
      dow:      { kospi: 0.36, nikkei: 0.42, hangseng: 0.28, dax: 0.38, ibex: 0.32, fesx: 0.34, ftse: 0.48, sp500: 0.84, nasdaq: 0.76, dow: 1.00, russell: 0.74 },
      russell:  { kospi: 0.32, nikkei: 0.35, hangseng: 0.22, dax: 0.21, ibex: 0.16, fesx: 0.19, ftse: 0.28, sp500: 0.72, nasdaq: 0.68, dow: 0.74, russell: 1.00 }
    },
    "30D": {
      kospi:    { kospi: 1.00, nikkei: 0.81, hangseng: 0.74, dax: 0.12, ibex: 0.15, fesx: 0.09, ftse: 0.21, sp500: 0.56, nasdaq: 0.62, dow: 0.48, russell: 0.42 },
      nikkei:   { kospi: 0.81, nikkei: 1.00, hangseng: 0.69, dax: 0.08, ibex: 0.11, fesx: 0.05, ftse: 0.18, sp500: 0.59, nasdaq: 0.64, dow: 0.51, russell: 0.45 },
      hangseng: { kospi: 0.74, nikkei: 0.69, hangseng: 1.00, dax: 0.16, ibex: 0.20, fesx: 0.14, ftse: 0.24, sp500: 0.44, nasdaq: 0.49, dow: 0.38, russell: 0.33 },
      dax:      { kospi: 0.12, nikkei: 0.08, hangseng: 0.16, dax: 1.00, ibex: 0.86, fesx: 0.91, ftse: 0.82, sp500: 0.41, nasdaq: 0.36, dow: 0.46, russell: 0.32 },
      ibex:     { kospi: 0.15, nikkei: 0.11, hangseng: 0.20, dax: 0.86, ibex: 1.00, fesx: 0.84, ftse: 0.76, sp500: 0.36, nasdaq: 0.31, dow: 0.41, russell: 0.28 },
      fesx:     { kospi: 0.09, nikkei: 0.05, hangseng: 0.14, dax: 0.91, ibex: 0.84, fesx: 1.00, ftse: 0.84, sp500: 0.38, nasdaq: 0.33, dow: 0.43, russell: 0.30 },
      ftse:     { kospi: 0.21, nikkei: 0.18, hangseng: 0.24, dax: 0.82, ibex: 0.76, fesx: 0.84, ftse: 1.00, sp500: 0.51, nasdaq: 0.44, dow: 0.54, russell: 0.39 },
      sp500:    { kospi: 0.56, nikkei: 0.59, hangseng: 0.44, dax: 0.41, ibex: 0.36, fesx: 0.38, ftse: 0.51, sp500: 1.00, nasdaq: 0.94, dow: 0.87, russell: 0.76 },
      nasdaq:   { kospi: 0.62, nikkei: 0.64, hangseng: 0.49, dax: 0.36, ibex: 0.31, fesx: 0.33, ftse: 0.44, sp500: 0.94, nasdaq: 1.00, dow: 0.79, russell: 0.71 },
      dow:      { kospi: 0.48, nikkei: 0.51, hangseng: 0.38, dax: 0.46, ibex: 0.41, fesx: 0.43, ftse: 0.54, sp500: 0.87, nasdaq: 0.79, dow: 1.00, russell: 0.76 },
      russell:  { kospi: 0.42, nikkei: 0.45, hangseng: 0.33, dax: 0.32, ibex: 0.28, fesx: 0.30, ftse: 0.39, sp500: 0.76, nasdaq: 0.71, dow: 0.76, russell: 1.00 }
    },
    "1Y": {
      kospi:    { kospi: 1.00, nikkei: 0.76, hangseng: 0.68, dax: 0.62, ibex: 0.58, fesx: 0.64, ftse: 0.55, sp500: 0.71, nasdaq: 0.75, dow: 0.64, russell: 0.58 },
      nikkei:   { kospi: 0.76, nikkei: 1.00, hangseng: 0.62, dax: 0.59, ibex: 0.54, fesx: 0.61, ftse: 0.52, sp500: 0.74, nasdaq: 0.77, dow: 0.67, russell: 0.61 },
      hangseng: { kospi: 0.68, nikkei: 0.62, hangseng: 1.00, dax: 0.52, ibex: 0.49, fesx: 0.54, ftse: 0.48, sp500: 0.58, nasdaq: 0.62, dow: 0.52, russell: 0.46 },
      dax:      { kospi: 0.62, nikkei: 0.59, hangseng: 0.52, dax: 1.00, ibex: 0.84, fesx: 0.89, ftse: 0.78, sp500: 0.68, nasdaq: 0.65, dow: 0.72, russell: 0.59 },
      ibex:     { kospi: 0.58, nikkei: 0.54, hangseng: 0.49, dax: 0.84, ibex: 1.00, fesx: 0.82, ftse: 0.71, sp500: 0.61, nasdaq: 0.58, dow: 0.66, russell: 0.54 },
      fesx:     { kospi: 0.64, nikkei: 0.61, hangseng: 0.54, dax: 0.89, ibex: 0.82, fesx: 1.00, ftse: 0.80, sp500: 0.67, nasdaq: 0.63, dow: 0.71, russell: 0.58 },
      ftse:     { kospi: 0.55, nikkei: 0.52, hangseng: 0.48, dax: 0.78, ibex: 0.71, fesx: 0.80, ftse: 1.00, sp500: 0.65, nasdaq: 0.60, dow: 0.74, russell: 0.56 },
      sp500:    { kospi: 0.71, nikkei: 0.74, hangseng: 0.58, dax: 0.68, ibex: 0.61, fesx: 0.67, ftse: 0.65, sp500: 1.00, nasdaq: 0.95, dow: 0.89, russell: 0.82 },
      nasdaq:   { kospi: 0.75, nikkei: 0.77, hangseng: 0.62, dax: 0.65, ibex: 0.58, fesx: 0.63, ftse: 0.60, sp500: 0.95, nasdaq: 1.00, dow: 0.81, russell: 0.78 },
      dow:      { kospi: 0.64, nikkei: 0.67, hangseng: 0.52, dax: 0.72, ibex: 0.66, fesx: 0.71, ftse: 0.74, sp500: 0.89, nasdaq: 0.81, dow: 1.00, russell: 0.80 },
      russell:  { kospi: 0.58, nikkei: 0.61, hangseng: 0.46, dax: 0.59, ibex: 0.54, fesx: 0.58, ftse: 0.56, sp500: 0.82, nasdaq: 0.78, dow: 0.80, russell: 1.00 }
    }
  }), []);

  // Compute composite regional returns & inter-regional spreads
  const regionalMetrics = useMemo(() => {
    const asiaKeys = ["kospi", "nikkei", "hangseng"];
    const euKeys = ["dax", "ibex", "fesx"];
    const usKeys = ["sp500", "nasdaq", "dow", "russell"];

    const asiaAvg = Number(
      (asiaKeys.reduce((acc, k) => acc + (equitiesData[k]?.change24h || 0), 0) / asiaKeys.length).toFixed(2)
    );
    const euAvg = Number(
      (euKeys.reduce((acc, k) => acc + (equitiesData[k]?.change24h || 0), 0) / euKeys.length).toFixed(2)
    );
    const usAvg = Number(
      (usKeys.reduce((acc, k) => acc + (equitiesData[k]?.change24h || 0), 0) / usKeys.length).toFixed(2)
    );

    const spreadAsiaEuBps = Math.round((asiaAvg - euAvg) * 100);
    const spreadUsEuBps = Math.round((usAvg - euAvg) * 100);
    const spreadAsiaUsBps = Math.round((asiaAvg - usAvg) * 100);

    // Cross-regional average correlation in current timeframe
    const currentMat = correlationData[timeframe];
    let crossCorrSum = 0;
    let crossCorrCount = 0;
    asiaKeys.forEach(ak => {
      euKeys.forEach(ek => {
        crossCorrSum += currentMat[ak]?.[ek] ?? 0;
        crossCorrCount++;
      });
    });
    const avgAsiaEuCorr = Number((crossCorrSum / crossCorrCount).toFixed(2));

    // US vs EU cross correlation
    let usEuSum = 0;
    let usEuCount = 0;
    usKeys.forEach(uk => {
      euKeys.forEach(ek => {
        usEuSum += currentMat[uk]?.[ek] ?? 0;
        usEuCount++;
      });
    });
    const avgUsEuCorr = Number((usEuSum / usEuCount).toFixed(2));

    // US vs Asia cross correlation
    let usAsiaSum = 0;
    let usAsiaCount = 0;
    usKeys.forEach(uk => {
      asiaKeys.forEach(ak => {
        usAsiaSum += currentMat[uk]?.[ak] ?? 0;
        usAsiaCount++;
      });
    });
    const avgUsAsiaCorr = Number((usAsiaSum / usAsiaCount).toFixed(2));

    return {
      asiaAvg,
      euAvg,
      usAvg,
      spreadAsiaEuBps,
      spreadUsEuBps,
      spreadAsiaUsBps,
      avgAsiaEuCorr,
      avgUsEuCorr,
      avgUsAsiaCorr,
      asiaGreenCount: asiaKeys.filter(k => (equitiesData[k]?.change24h || 0) > 0).length,
      euRedCount: euKeys.filter(k => (equitiesData[k]?.change24h || 0) < 0).length,
      euGreenCount: euKeys.filter(k => (equitiesData[k]?.change24h || 0) >= 0).length,
      usGreenCount: usKeys.filter(k => (equitiesData[k]?.change24h || 0) > 0).length
    };
  }, [equitiesData, correlationData, timeframe]);

  // Data for the Tri-Regional Divergence & Beta Transmission Chart
  const chartData = useMemo(() => {
    return activeKeys.map(k => {
      const item = equitiesData[k];
      const isAsia = item.region === "Asia";
      const isUS = item.region === "US";
      const isEU = item.region === "Europe";
      const isPos = item.change24h >= 0;

      let barColor = "#38BDF8";
      if (isAsia) {
        barColor = isPos ? "#10B981" : "#F43F5E";
      } else if (isEU) {
        if (regionalMetrics.euAvg < 0 || !isPos) {
          barColor = "#F43F5E";
        } else if (regionalMetrics.euAvg < regionalMetrics.asiaAvg) {
          barColor = "#F59E0B"; // Amber for relative energy drag / lagging growth
        } else {
          barColor = "#10B981";
        }
      } else if (isUS) {
        barColor = isPos ? "#38BDF8" : "#F43F5E";
      }

      return {
        key: k,
        symbol: item.symbol.replace(" Index", "").replace(" 40", "").replace(" 35", "").replace(" 200", "").replace(" 225", "").replace(" 100", "").replace(" 30", "").replace(" 50", "").replace(" 500", ""),
        fullName: item.name,
        flag: item.flag,
        region: item.region,
        change24h: Number(item.change24h.toFixed(2)),
        spot: item.spot,
        barColor,
        catalyst: item.catalyst
      };
    });
  }, [activeKeys, equitiesData, regionalMetrics]);

  // Color styling for correlation cells
  const getCellVisuals = (val: number, isCrossRegional: boolean) => {
    if (val === 1.0) {
      return {
        bg: "bg-[#B08D57]/25",
        border: "border-[#B08D57]/50",
        text: "text-[#E5C794] font-bold"
      };
    }
    // Cross-regional decoupling highlighted
    if (isCrossRegional && val <= 0) {
      return {
        bg: "bg-[#EF4444]/20",
        border: "border-[#EF4444]/40",
        text: "text-[#F87171] font-bold"
      };
    }
    if (val >= 0.70) {
      return {
        bg: "bg-[#10B981]/20",
        border: "border-[#10B981]/40",
        text: "text-[#34D399] font-bold"
      };
    }
    if (val >= 0.40) {
      return {
        bg: "bg-[#06B6D4]/15",
        border: "border-[#06B6D4]/30",
        text: "text-[#22D3EE] font-medium"
      };
    }
    if (val >= 0.10) {
      return {
        bg: "bg-[#38BDF8]/10",
        border: "border-[#38BDF8]/20",
        text: "text-[#7DD3FC]"
      };
    }
    if (val >= -0.10) {
      return {
        bg: "bg-white/5",
        border: "border-white/10",
        text: "text-[#94A3B8]"
      };
    }
    return {
      bg: "bg-[#F43F5E]/15",
      border: "border-[#F43F5E]/30",
      text: "text-[#FB7185] font-semibold"
    };
  };

  // Active inspected pair details
  const inspectedPairDetail = useMemo(() => {
    const [rowKey, colKey] = selectedPair;
    const rowAsset = equitiesData[rowKey] || equitiesData.nasdaq;
    const colAsset = equitiesData[colKey] || equitiesData.dax;
    const currentCorr = correlationData[timeframe]?.[rowKey]?.[colKey] ?? 0;
    const normCorr = correlationData["1Y"]?.[rowKey]?.[colKey] ?? 0.6;
    const delta = Number((currentCorr - normCorr).toFixed(2));
    const isCross = rowAsset.region !== colAsset.region;
    const spread = Number((rowAsset.change24h - colAsset.change24h).toFixed(2));

    let regime = "Intra-Regional Co-Movement";
    let explanation = "Asset indices trade within standard macro risk beta transmission.";
    let tradeStrategy = "Maintain balanced delta-neutral hedge across identical regional basket.";

    if (isCross) {
      // US vs Europe
      if ((rowAsset.region === "US" && colAsset.region === "Europe") || (rowAsset.region === "Europe" && colAsset.region === "US")) {
        regime = "Transatlantic Energy & Beta Asymmetry";
        explanation = `US indices benefit from domestic net energy independence and massive hyperscaler cash flows, partially shielding Wall Street from the severe €100+ crude and Cape-rerouted freight shocks squeezing Frankfurt, Madrid, and Paris.`;
        tradeStrategy = `Transatlantic Spread: Long ${rowAsset.region === "US" ? rowAsset.symbol : colAsset.symbol} (US Tech/Quality) / Short ${rowAsset.region === "Europe" ? rowAsset.symbol : colAsset.symbol} (European Cyclical Beta) with a 0.85 beta-adjusted weight.`;
      }
      // US vs Asia
      else if ((rowAsset.region === "US" && colAsset.region === "Asia") || (rowAsset.region === "Asia" && colAsset.region === "US")) {
        regime = "Global Tech Hardware & AI Semiconductor Transmission";
        explanation = `US mega-caps (Nvidia, Apple, Microsoft) maintain a robust supply chain transmission link with Korean memory foundries (Samsung, SK Hynix) and Japanese lithography leaders (Tokyo Electron). PBOC stimulus further cushions Asia.`;
        tradeStrategy = `Cross-Pacific Momentum Arb: Overweight high-beta semiconductor hardware (${rowAsset.region === "Asia" ? rowAsset.symbol : colAsset.symbol}) during Asian morning cash hours, rotating delta into US tech (${rowAsset.region === "US" ? rowAsset.symbol : colAsset.symbol}) pre-market.`;
      }
      // Asia vs Europe
      else {
        if (currentCorr <= 0.1) {
          regime = "Acute Regional Decoupling / Divergence";
          explanation = `${rowAsset.symbol} (${rowAsset.region}) is sharply decoupled from ${colAsset.symbol} (${colAsset.region}). Asian markets are supported by PBOC liquidity injections and AI chip order backlogs, while European indices absorb the immediate drag of Brent crude above $100/bbl and shipping surcharges.`;
          tradeStrategy = `Cross-Regional Pairs Trade: Long ${rowAsset.region === "Asia" ? rowAsset.symbol : colAsset.symbol} / Short ${rowAsset.region === "Europe" ? rowAsset.symbol : colAsset.symbol} to capture the +${Math.abs(spread)}% relative performance divergence while neutralizing systemic market beta.`;
        } else {
          regime = "Moderate Inter-Market Decoupling";
          explanation = `Correlation has softened from normalized ${normCorr.toFixed(2)} to ${currentCorr.toFixed(2)}, reflecting divergent regional macro sensitivity to crude energy supply shocks.`;
          tradeStrategy = `Alpha Spread: Overweight Asia technology benchmark vs European cyclical basket.`;
        }
      }
    } else {
      if (rowAsset.region === "US") {
        regime = "US Factor Rotation (Growth vs Value/Size)";
        explanation = `High intra-US alignment (${currentCorr.toFixed(2)}). Divergences primarily reflect the rate-sensitive valuation spread between Nasdaq 100 mega-caps and Russell 2000 small-cap floating debt.`;
        tradeStrategy = `US Style Spread: Long Nasdaq 100 / Short Russell 2000 during elevated yield spikes; reverse on Treasury curve bull-steepening.`;
      } else {
        regime = `Synchronized ${rowAsset.region} Regional Trend`;
        explanation = `Both assets exhibit high intra-regional coherence (${currentCorr.toFixed(2)}), moving in tandem under regional currency dynamics and central bank policy alignment.`;
        tradeStrategy = `Intra-Regional Basket: Use ${rowAsset.symbol} as the high-beta vehicle and ${colAsset.symbol} for capital preservation.`;
      }
    }

    return {
      rowAsset,
      colAsset,
      currentCorr,
      normCorr,
      delta,
      isCross,
      spread,
      regime,
      explanation,
      tradeStrategy
    };
  }, [selectedPair, equitiesData, correlationData, timeframe]);

  return (
    <div
      id="equity-correlation-matrix-card"
      className="bg-[#101622] border border-[#B08D57]/35 hover:border-[#B08D57]/55 rounded-xl p-4 sm:p-5 transition-all shadow-2xl relative overflow-hidden space-y-4"
    >
      {/* Top Highlight Accent */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#B08D57]/60 to-transparent pointer-events-none" />

      {/* Header & Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#B08D57]/20">
        <div>
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-[#B08D57]" />
            <h3 className="text-xs sm:text-sm font-mono-data font-bold uppercase tracking-wider text-[#EDE9DE]">
              Global Equity Correlation & Tri-Regional Divergence Matrix
            </h3>
            <span className="px-2 py-0.5 rounded text-[9px] font-mono-data font-semibold bg-[#B08D57]/15 text-[#E5C794] border border-[#B08D57]/30">
              ASIA • EUROPE • US GLOBAL
            </span>
          </div>
          <p className="text-[10.5px] font-mono-data text-[#8292A6] mt-0.5">
            TRI-REGIONAL BETA TRANSMISSION: ASIA TECH ADVANCE (KOSPI, NIKKEI, HSI) • US TECH RESILIENCE (S&P 500, NASDAQ, DOW, RUSSELL) • EUROPE ENERGY DRAG (DAX, IBEX, STOXX 50)
          </p>
        </div>

        {/* Action Controls & Export Dropdown */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Scope Selector: Tri-Regional vs US-Focus vs Global-All vs EU-vs-Asia */}
          <div className="flex items-center bg-black/60 p-0.5 rounded-lg border border-[#B08D57]/20 text-[10px] font-mono-data overflow-x-auto no-scrollbar">
            <button
              onClick={() => setScope("tri-regional")}
              className={`px-2.5 py-1 rounded transition-all cursor-pointer whitespace-nowrap ${
                scope === "tri-regional"
                  ? "bg-[#B08D57] text-[#0A111C] font-bold shadow-sm"
                  : "text-[#8292A6] hover:text-[#EDE9DE]"
              }`}
            >
              Tri-Regional Core (10×10)
            </button>
            <button
              onClick={() => setScope("us-focus")}
              className={`px-2.5 py-1 rounded transition-all cursor-pointer whitespace-nowrap ${
                scope === "us-focus"
                  ? "bg-[#38BDF8] text-[#0A111C] font-bold shadow-sm"
                  : "text-[#8292A6] hover:text-[#EDE9DE]"
              }`}
            >
              US vs Global
            </button>
            <button
              onClick={() => setScope("global-all")}
              className={`px-2.5 py-1 rounded transition-all cursor-pointer whitespace-nowrap ${
                scope === "global-all"
                  ? "bg-[#B08D57] text-[#0A111C] font-bold shadow-sm"
                  : "text-[#8292A6] hover:text-[#EDE9DE]"
              }`}
            >
              Global All 11×11 (+FTSE)
            </button>
            <button
              onClick={() => setScope("eu-vs-asia")}
              className={`px-2.5 py-1 rounded transition-all cursor-pointer whitespace-nowrap ${
                scope === "eu-vs-asia"
                  ? "bg-[#B08D57] text-[#0A111C] font-bold shadow-sm"
                  : "text-[#8292A6] hover:text-[#EDE9DE]"
              }`}
            >
              EU vs Asia (6×6)
            </button>
          </div>

          {/* View Mode Switcher: Dual / Cards / Chart */}
          <div className="flex items-center bg-black/60 p-0.5 rounded-lg border border-[#B08D57]/20 text-[10px] font-mono-data">
            <button
              onClick={() => setViewMode("dual")}
              title="Show both Regional HUD Telemetry and Divergence Transmission Chart"
              className={`px-2 py-1 rounded transition-all cursor-pointer flex items-center gap-1 ${
                viewMode === "dual"
                  ? "bg-[#B08D57] text-[#0A111C] font-bold shadow-sm"
                  : "text-[#8292A6] hover:text-[#EDE9DE]"
              }`}
            >
              <Layers className="w-3 h-3" />
              <span className="hidden sm:inline">Dual View</span>
              <span className="sm:hidden">Dual</span>
            </button>
            <button
              onClick={() => setViewMode("cards")}
              title="Show Regional HUD Telemetry Cards"
              className={`px-2 py-1 rounded transition-all cursor-pointer flex items-center gap-1 ${
                viewMode === "cards"
                  ? "bg-[#B08D57] text-[#0A111C] font-bold shadow-sm"
                  : "text-[#8292A6] hover:text-[#EDE9DE]"
              }`}
            >
              <LayoutGrid className="w-3 h-3" />
              <span className="hidden sm:inline">HUD Cards</span>
              <span className="sm:hidden">Cards</span>
            </button>
            <button
              onClick={() => setViewMode("chart")}
              title="Show Tri-Regional Divergence & Beta Transmission Chart"
              className={`px-2 py-1 rounded transition-all cursor-pointer flex items-center gap-1 ${
                viewMode === "chart"
                  ? "bg-[#38BDF8] text-[#0A111C] font-bold shadow-sm"
                  : "text-[#8292A6] hover:text-[#EDE9DE]"
              }`}
            >
              <BarChart3 className="w-3 h-3" />
              <span className="hidden sm:inline">Divergence Chart</span>
              <span className="sm:hidden">Chart</span>
            </button>
          </div>

          {/* Timeframe Toggles */}
          <div className="flex items-center bg-black/60 p-0.5 rounded-lg border border-[#B08D57]/20 text-[10px] font-mono-data">
            {(["24H", "30D", "1Y"] as const).map(tf => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-2 py-1 rounded transition-all cursor-pointer ${
                  timeframe === tf
                    ? "bg-[#38BDF8] text-[#0A111C] font-bold shadow-sm"
                    : "text-[#8292A6] hover:text-[#EDE9DE]"
                }`}
              >
                {tf === "24H" ? "24H Live Session" : tf === "30D" ? "30D Conflict" : "1Y Baseline"}
              </button>
            ))}
          </div>

          {/* Institutional Export Dropdown */}
          <ChartExportDropdown
            chartTitle="Global Equity Correlation & Tri-Regional Divergence Matrix"
            chartContainerId="equity-correlation-matrix-card"
            subtitle={`ASIA AVG: +${regionalMetrics.asiaAvg}% // US AVG: +${regionalMetrics.usAvg}% // EU AVG: ${regionalMetrics.euAvg >= 0 ? "+" : ""}${regionalMetrics.euAvg}% // SPREAD ASIA-EU: ${regionalMetrics.spreadAsiaEuBps >= 0 ? "+" : ""}${regionalMetrics.spreadAsiaEuBps} BPS`}
            customPngOptions={[
              {
                id: "equity-divergence-chart-png",
                label: "Tri-Regional Divergence Chart",
                sublabel: "Bar chart of cross-regional session returns & reference transmission baselines",
                iconColor: "#10B981",
                onExport: async () => {
                  await exportChartElementAsPng(
                    "equity-divergence-chart-container",
                    `smc-tri-regional-divergence-chart-${scope}-${timeframe.toLowerCase()}`,
                    "Tri-Regional Divergence & Beta Transmission Chart",
                    `ASIA: +${regionalMetrics.asiaAvg}% // US: +${regionalMetrics.usAvg}% // EU: ${regionalMetrics.euAvg >= 0 ? "+" : ""}${regionalMetrics.euAvg}% // TIMEFRAME: ${timeframe}`
                  );
                }
              },
              {
                id: "equity-matrix-photo-png",
                label: "Photo: Equity Correlation Matrix Grid",
                sublabel: "Heatmap grid with US, Asia and Europe correlation values",
                iconColor: "#B08D57",
                onExport: async () => {
                  await exportChartElementAsPng(
                    "equity-matrix-table-container",
                    `smc-equity-correlation-matrix-${scope}-${timeframe.toLowerCase()}`,
                    "Global Equity Correlation & Tri-Regional Divergence Matrix",
                    `ASIA AVG: +${regionalMetrics.asiaAvg}% // US AVG: +${regionalMetrics.usAvg}% // EU AVG: ${regionalMetrics.euAvg >= 0 ? "+" : ""}${regionalMetrics.euAvg}% // TIMEFRAME: ${timeframe}`
                  );
                }
              },
              {
                id: "equity-full-dashboard-png",
                label: "Full Equity Divergence Intelligence Card",
                sublabel: "Matrix grid, regional HUD telemetry & pairs trade breakdown",
                iconColor: "#38BDF8",
                onExport: async () => {
                  await exportChartElementAsPng(
                    "equity-correlation-matrix-card",
                    `smc-equity-divergence-full-card-${scope}-${timeframe.toLowerCase()}`,
                    "Global Equity Correlation & Tri-Regional Divergence Dashboard",
                    `ASIA: +${regionalMetrics.asiaAvg}% // US: +${regionalMetrics.usAvg}% // EU: ${regionalMetrics.euAvg >= 0 ? "+" : ""}${regionalMetrics.euAvg}% // TIME: ${timeframe}`
                  );
                }
              }
            ]}
            getCsvData={() => {
              const headers = [
                "Symbol",
                "Index Name",
                "Region",
                "Exchange",
                "Spot Price",
                "24H Change %",
                "Status",
                ...activeKeys.map(k => `${equitiesData[k].symbol} Corr (${timeframe})`)
              ];
              const rows = activeKeys.map(rowKey => {
                const item = equitiesData[rowKey];
                return [
                  item.symbol,
                  item.name,
                  item.region,
                  item.exchange,
                  item.spot.toFixed(2),
                  `${item.change24h >= 0 ? "+" : ""}${item.change24h.toFixed(2)}%`,
                  item.status,
                  ...activeKeys.map(colKey => {
                    const cVal = correlationData[timeframe][rowKey]?.[colKey] ?? 0;
                    return cVal.toFixed(2);
                  })
                ];
              });
              return {
                filename: `smc-equity-correlation-divergence-${scope}-${timeframe.toLowerCase()}`,
                headers,
                rows,
                metaComments: [
                  "SIN MIEDO CAPITAL // GLOBAL EQUITIES TRI-REGIONAL CORRELATION MATRIX",
                  `Timeframe: ${timeframe} Horizon // Scope: ${scope}`,
                  `Asia Average Return: +${regionalMetrics.asiaAvg}% (${regionalMetrics.asiaGreenCount}/3 Advancing)`,
                  `US Average Return: +${regionalMetrics.usAvg}% (Tech & Balance Sheet Carry)`,
                  `Europe Average Return: ${regionalMetrics.euAvg >= 0 ? "+" : ""}${regionalMetrics.euAvg}% (${regionalMetrics.euGreenCount}/3 Advancing)`,
                  `Spread Asia vs EU: ${regionalMetrics.spreadAsiaEuBps >= 0 ? "+" : ""}${regionalMetrics.spreadAsiaEuBps} bps`,
                  `Spread US vs EU: ${regionalMetrics.spreadUsEuBps >= 0 ? "+" : ""}${regionalMetrics.spreadUsEuBps} bps`,
                  `Cross-Regional Correlation Asia-EU: r = ${regionalMetrics.avgAsiaEuCorr}`,
                  `Cross-Regional Correlation US-EU: r = ${regionalMetrics.avgUsEuCorr}`,
                  `Cross-Regional Correlation US-Asia: r = ${regionalMetrics.avgUsAsiaCorr}`
                ]
              };
            }}
          />
        </div>
      </div>

      {/* Tri-Regional Divergence & Beta Transmission Chart */}
      {(viewMode === "dual" || viewMode === "chart") && (
        <div
          id="equity-divergence-chart-container"
          className="bg-black/60 border border-[#B08D57]/30 rounded-xl p-3 sm:p-4 space-y-3"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#38BDF8]" />
              <span className="text-xs font-mono-data font-bold uppercase tracking-wider text-[#EDE9DE]">
                Tri-Regional Divergence & Beta Transmission Curve ({timeframe})
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-black/60 text-[#E5C794] border border-[#B08D57]/30 font-mono-data">
                Congruent Live Tickers
              </span>
            </div>
            <div className="flex items-center gap-3 text-[10px] font-mono-data flex-wrap">
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="w-2 h-2 rounded bg-[#10B981]" /> Asia Avg: +{regionalMetrics.asiaAvg}%
              </span>
              <span className="flex items-center gap-1 text-[#38BDF8]">
                <span className="w-2 h-2 rounded bg-[#38BDF8]" /> US Avg: +{regionalMetrics.usAvg}%
              </span>
              <span className={`flex items-center gap-1 ${regionalMetrics.euAvg >= 0 ? "text-amber-300" : "text-rose-400"}`}>
                <span className={`w-2 h-2 rounded ${regionalMetrics.euAvg >= 0 ? "bg-[#F59E0B]" : "bg-[#F43F5E]"}`} /> EU Avg: {regionalMetrics.euAvg >= 0 ? "+" : ""}{regionalMetrics.euAvg}%
              </span>
            </div>
          </div>

          <div className="h-44 sm:h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 15, right: 10, left: -15, bottom: 5 }}>
                <XAxis
                  dataKey="symbol"
                  stroke="#8292A6"
                  tick={{ fill: "#8292A6", fontSize: 10, fontFamily: "monospace" }}
                  tickLine={{ stroke: "#B08D57", strokeWidth: 0.5 }}
                  axisLine={{ stroke: "#B08D57", strokeWidth: 0.5 }}
                />
                <YAxis
                  stroke="#8292A6"
                  tick={{ fill: "#8292A6", fontSize: 9, fontFamily: "monospace" }}
                  tickFormatter={(v) => `${v > 0 ? "+" : ""}${v}%`}
                  axisLine={{ stroke: "#B08D57", strokeWidth: 0.5 }}
                  tickLine={{ stroke: "#B08D57", strokeWidth: 0.5 }}
                />
                <Tooltip content={<CustomDivergenceTooltip />} />
                <ReferenceLine y={0} stroke="#475569" strokeWidth={1} />
                <ReferenceLine
                  y={regionalMetrics.asiaAvg}
                  stroke="#10B981"
                  strokeDasharray="3 3"
                  label={{ value: `Asia +${regionalMetrics.asiaAvg}%`, fill: "#10B981", fontSize: 9, position: "top" }}
                />
                <ReferenceLine
                  y={regionalMetrics.euAvg}
                  stroke={regionalMetrics.euAvg >= 0 ? "#F59E0B" : "#F43F5E"}
                  strokeDasharray="3 3"
                  label={{
                    value: `EU ${regionalMetrics.euAvg >= 0 ? "+" : ""}${regionalMetrics.euAvg}%`,
                    fill: regionalMetrics.euAvg >= 0 ? "#F59E0B" : "#F43F5E",
                    fontSize: 9,
                    position: regionalMetrics.euAvg >= 0 ? "top" : "bottom"
                  }}
                />
                <ReferenceLine
                  y={regionalMetrics.usAvg}
                  stroke="#38BDF8"
                  strokeDasharray="3 3"
                  label={{ value: `US +${regionalMetrics.usAvg}%`, fill: "#38BDF8", fontSize: 9, position: "top" }}
                />
                <Bar dataKey="change24h" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry) => (
                    <Cell key={`cell-${entry.key}`} fill={entry.barColor} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Live Transmission Stats Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-[#B08D57]/20 text-[10px] font-mono-data">
            <div className="flex items-center justify-between p-2 rounded bg-black/40 border border-[#B08D57]/15">
              <span className="text-[#8292A6]">Asia vs EU Spread:</span>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-[#E5C794]">
                  {regionalMetrics.spreadAsiaEuBps >= 0 ? "+" : ""}{regionalMetrics.spreadAsiaEuBps} bps
                </span>
                <span className={`text-[9px] ${regionalMetrics.avgAsiaEuCorr <= 0 ? "text-rose-400" : "text-emerald-400"}`}>
                  (r = {regionalMetrics.avgAsiaEuCorr >= 0 ? "+" : ""}{regionalMetrics.avgAsiaEuCorr})
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-black/40 border border-[#B08D57]/15">
              <span className="text-[#8292A6]">US vs EU Spread:</span>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-[#38BDF8]">
                  {regionalMetrics.spreadUsEuBps >= 0 ? "+" : ""}{regionalMetrics.spreadUsEuBps} bps
                </span>
                <span className={`text-[9px] ${regionalMetrics.avgUsEuCorr <= 0 ? "text-rose-400" : "text-sky-300"}`}>
                  (r = {regionalMetrics.avgUsEuCorr >= 0 ? "+" : ""}{regionalMetrics.avgUsEuCorr})
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-black/40 border border-[#B08D57]/15">
              <span className="text-[#8292A6]">US ↔ Asia Tech Beta:</span>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-emerald-400">r = +{regionalMetrics.avgUsAsiaCorr}</span>
                <span className="text-[9px] text-[#8292A6]">({regionalMetrics.avgUsAsiaCorr >= 0.3 ? "Coupled" : "Decoupled"})</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Regional Divergence HUD Banner: 4-Pod Responsive Grid */}
      {(viewMode === "dual" || viewMode === "cards") && (() => {
        const allAsiaGreen = regionalMetrics.asiaGreenCount === 3;
        const allEuDown = regionalMetrics.euRedCount === 3;
        const allEuGreen = regionalMetrics.euGreenCount === 3;
        const isEuLagging = regionalMetrics.euAvg < regionalMetrics.asiaAvg;

        const euTitle = allEuDown
          ? "EUROPEAN BENCHMARKS (ALL DOWN 🔴)"
          : allEuGreen && isEuLagging
          ? "EUROPEAN BENCHMARKS (RELATIVE LAG / ENERGY DRAG 🟡)"
          : allEuGreen
          ? "EUROPEAN BENCHMARKS (EXPANSION 🟢)"
          : "EUROPEAN BENCHMARKS (MIXED / ENERGY DRAG 🟡)";

        const euBorderClass = allEuDown
          ? "border-rose-500/30"
          : allEuGreen && isEuLagging
          ? "border-amber-500/30"
          : allEuGreen
          ? "border-emerald-500/30"
          : "border-amber-500/30";

        const euDotClass = allEuDown
          ? "bg-rose-400"
          : allEuGreen && isEuLagging
          ? "bg-amber-400"
          : allEuGreen
          ? "bg-emerald-400"
          : "bg-amber-400";

        const euTextClass = allEuDown
          ? "text-rose-400"
          : allEuGreen && isEuLagging
          ? "text-amber-300"
          : allEuGreen
          ? "text-emerald-400"
          : "text-amber-300";

        const euBadgeClass = allEuDown
          ? "bg-rose-950/80 text-rose-300 border border-rose-500/30"
          : allEuGreen && isEuLagging
          ? "bg-amber-950/80 text-amber-300 border border-amber-500/30"
          : allEuGreen
          ? "bg-emerald-950/80 text-emerald-300 border border-emerald-500/30"
          : "bg-amber-950/80 text-amber-300 border border-amber-500/30";

        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-mono-data text-xs">
            {/* Asia Pacific Pod */}
            <div className="bg-black/50 border border-emerald-500/30 rounded-lg p-3 relative overflow-hidden flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    ASIA-PACIFIC CORE ({allAsiaGreen ? "ALL GREEN 🟢" : "MOMENTUM 🟢"})
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-300 font-bold border border-emerald-500/30">
                    +{regionalMetrics.asiaAvg}% AVG
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1.5 mt-2 pt-2 border-t border-emerald-500/20 text-[11px]">
                  <div>
                    <div className="text-[9px] text-[#8292A6]">🇰🇷 KOSPI</div>
                    <div className="font-bold text-[#EDE9DE]">{equitiesData.kospi.spot.toFixed(2)}</div>
                    <div className={`${equitiesData.kospi.change24h >= 0 ? "text-emerald-400" : "text-rose-400"} text-[9.5px] font-bold`}>
                      {equitiesData.kospi.change24h >= 0 ? "+" : ""}{equitiesData.kospi.change24h.toFixed(2)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-[9px] text-[#8292A6]">🇯🇵 Nikkei</div>
                    <div className="font-bold text-[#EDE9DE]">{equitiesData.nikkei.spot.toLocaleString()}</div>
                    <div className={`${equitiesData.nikkei.change24h >= 0 ? "text-emerald-400" : "text-rose-400"} text-[9.5px] font-bold`}>
                      {equitiesData.nikkei.change24h >= 0 ? "+" : ""}{equitiesData.nikkei.change24h.toFixed(2)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-[9px] text-[#8292A6]">🇭🇰 Hang Seng</div>
                    <div className="font-bold text-[#EDE9DE]">{equitiesData.hangseng.spot.toLocaleString()}</div>
                    <div className={`${equitiesData.hangseng.change24h >= 0 ? "text-emerald-400" : "text-rose-400"} text-[9.5px] font-bold`}>
                      {equitiesData.hangseng.change24h >= 0 ? "+" : ""}{equitiesData.hangseng.change24h.toFixed(2)}%
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-[9px] text-[#8292A6] mt-2 pt-1 border-t border-emerald-500/10">
                Drivers: AI memory chip capex, Tokyo export margin recovery, and PBOC liquidity injections.
              </p>
            </div>

            {/* United States Pod */}
            <div className="bg-black/50 border border-sky-500/30 rounded-lg p-3 relative overflow-hidden flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] text-sky-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-sky-400" />
                    US BENCHMARKS (TECH CARRY 🔷)
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-950/80 text-sky-300 font-bold border border-sky-500/30">
                    +{regionalMetrics.usAvg}% AVG
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1 mt-2 pt-2 border-t border-sky-500/20 text-[11px]">
                  <div>
                    <div className="text-[9px] text-[#8292A6]">🇺🇸 S&P</div>
                    <div className="font-bold text-[#EDE9DE]">{equitiesData.sp500.spot.toFixed(0)}</div>
                    <div className={`${equitiesData.sp500.change24h >= 0 ? "text-sky-400" : "text-rose-400"} text-[9.5px] font-bold`}>
                      {equitiesData.sp500.change24h >= 0 ? "+" : ""}{equitiesData.sp500.change24h.toFixed(2)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-[9px] text-[#8292A6]">🇺🇸 Nasdaq</div>
                    <div className="font-bold text-[#EDE9DE]">{equitiesData.nasdaq.spot.toFixed(0)}</div>
                    <div className={`${equitiesData.nasdaq.change24h >= 0 ? "text-sky-400" : "text-rose-400"} text-[9.5px] font-bold`}>
                      {equitiesData.nasdaq.change24h >= 0 ? "+" : ""}{equitiesData.nasdaq.change24h.toFixed(2)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-[9px] text-[#8292A6]">🇺🇸 Dow</div>
                    <div className="font-bold text-[#EDE9DE]">{equitiesData.dow.spot.toFixed(0)}</div>
                    <div className={`${equitiesData.dow.change24h >= 0 ? "text-sky-400" : "text-rose-400"} text-[9.5px] font-bold`}>
                      {equitiesData.dow.change24h >= 0 ? "+" : ""}{equitiesData.dow.change24h.toFixed(2)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-[9px] text-[#8292A6]">🇺🇸 Russell</div>
                    <div className="font-bold text-[#EDE9DE]">{equitiesData.russell.spot.toFixed(0)}</div>
                    <div className={`${equitiesData.russell.change24h >= 0 ? "text-sky-400" : "text-rose-400"} text-[9.5px] font-bold`}>
                      {equitiesData.russell.change24h >= 0 ? "+" : ""}{equitiesData.russell.change24h.toFixed(2)}%
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-[9px] text-[#8292A6] mt-2 pt-1 border-t border-sky-500/10">
                Drivers: Generative AI infrastructure capex and corporate cash balances offset higher-for-longer yields.
              </p>
            </div>

            {/* European Benchmarks Pod (Congruent Live Tickers) */}
            <div className={`bg-black/50 border ${euBorderClass} rounded-lg p-3 relative overflow-hidden flex flex-col justify-between`}>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-[10px] ${euTextClass} font-bold uppercase tracking-wider flex items-center gap-1.5`}>
                    <span className={`w-2 h-2 rounded-full ${euDotClass}`} />
                    {euTitle}
                  </span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${euBadgeClass}`}>
                    {regionalMetrics.euAvg >= 0 ? "+" : ""}{regionalMetrics.euAvg}% AVG
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1.5 mt-2 pt-2 border-t border-amber-500/20 text-[11px]">
                  <div>
                    <div className="text-[9px] text-[#8292A6]">🇩🇪 DAX 40</div>
                    <div className="font-bold text-[#EDE9DE]">{equitiesData.dax.spot.toLocaleString()}</div>
                    <div className={`${equitiesData.dax.change24h >= 0 ? "text-emerald-400" : "text-rose-400"} text-[9.5px] font-bold`}>
                      {equitiesData.dax.change24h >= 0 ? "+" : ""}{equitiesData.dax.change24h.toFixed(2)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-[9px] text-[#8292A6]">🇪🇸 IBEX 35</div>
                    <div className="font-bold text-[#EDE9DE]">{equitiesData.ibex.spot.toLocaleString()}</div>
                    <div className={`${equitiesData.ibex.change24h >= 0 ? "text-emerald-400" : "text-rose-400"} text-[9.5px] font-bold`}>
                      {equitiesData.ibex.change24h >= 0 ? "+" : ""}{equitiesData.ibex.change24h.toFixed(2)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-[9px] text-[#8292A6]">🇪🇺 Stoxx 50</div>
                    <div className="font-bold text-[#EDE9DE]">{equitiesData.fesx.spot.toLocaleString()}</div>
                    <div className={`${equitiesData.fesx.change24h >= 0 ? "text-emerald-400" : "text-rose-400"} text-[9.5px] font-bold`}>
                      {equitiesData.fesx.change24h >= 0 ? "+" : ""}{equitiesData.fesx.change24h.toFixed(2)}%
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-[9px] text-[#8292A6] mt-2 pt-1 border-t border-amber-500/10">
                Drivers: Brent crude {`>$100`}/bbl, Red Sea shipping surcharges, and energy import drag relative to Asia/US.
              </p>
            </div>

            {/* Inter-Regional Divergence & Beta Spread Pod */}
            <div className="bg-black/50 border border-[#B08D57]/30 rounded-lg p-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-[#E5C794] font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-[#B08D57]" />
                    REGIONAL SPREADS & TRANSMISSION
                  </span>
                  <span className="text-[9px] text-[#8292A6]">ASYMMETRIC BETA</span>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <div>
                    <div className="text-[9px] text-[#8292A6]">Asia vs Europe:</div>
                    <span className="text-sm font-bold font-mono-data text-[#E5C794]">
                      {regionalMetrics.spreadAsiaEuBps >= 0 ? "+" : ""}{regionalMetrics.spreadAsiaEuBps} bps
                    </span>
                    <div className={`text-[9px] ${regionalMetrics.avgAsiaEuCorr <= 0 ? "text-rose-400" : "text-emerald-400"}`}>
                      Corr: r = {regionalMetrics.avgAsiaEuCorr >= 0 ? "+" : ""}{regionalMetrics.avgAsiaEuCorr}
                    </div>
                  </div>
                  <div>
                    <div className="text-[9px] text-[#8292A6]">US vs Europe:</div>
                    <span className="text-sm font-bold font-mono-data text-sky-400">
                      {regionalMetrics.spreadUsEuBps >= 0 ? "+" : ""}{regionalMetrics.spreadUsEuBps} bps
                    </span>
                    <div className="text-[9px] text-sky-300">
                      Corr: r = {regionalMetrics.avgUsEuCorr >= 0 ? "+" : ""}{regionalMetrics.avgUsEuCorr}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-2 pt-1.5 border-t border-[#B08D57]/15 flex items-center justify-between text-[9.5px] text-[#8292A6]">
                <span>US ↔ Asia Tech Beta:</span>
                <span className="text-emerald-400 font-semibold font-mono-data">
                  r = +{regionalMetrics.avgUsAsiaCorr} ({regionalMetrics.avgUsAsiaCorr >= 0.3 ? "Coupled" : "Decoupled"})
                </span>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Main Interactive Matrix Area */}
      <div id="equity-matrix-table-container" className="space-y-3">
        <div className="flex items-center justify-between text-[11px] font-mono-data px-1 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-[#B08D57]" />
            <span className="text-[#EDE9DE] font-bold uppercase">
              Pairwise Pearson Correlation Grid ({activeKeys.length}×{activeKeys.length})
            </span>
            <span className="text-[#8292A6] text-[10px] hidden sm:inline">
              • Click any cell to inspect inter-market driver & desk spread strategy
            </span>
          </div>
          <div className="flex items-center gap-2.5 text-[10px] text-[#8292A6] flex-wrap">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-[#10B981]/40 border border-[#10B981]" /> High Positive (≥0.70)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-[#06B6D4]/30 border border-[#06B6D4]" /> Moderate (0.40–0.69)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-white/10 border border-white/20" /> Decoupled (-0.10–0.10)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-[#EF4444]/40 border border-[#EF4444]" /> Divergent (&lt;0)
            </span>
          </div>
        </div>

        {/* Matrix Grid Container */}
        <div className="overflow-x-auto rounded-lg border border-[#B08D57]/20 bg-black/60 p-2 sm:p-3">
          <table className="w-full text-xs font-mono-data border-collapse">
            <thead>
              <tr>
                <th className="p-2 text-left text-[10px] text-[#8292A6] uppercase border-b border-[#B08D57]/20 min-w-[130px]">
                  Index // Region
                </th>
                {activeKeys.map(k => {
                  const item = equitiesData[k];
                  const isAsia = item.region === "Asia";
                  const isUS = item.region === "US";
                  const isEU = item.region === "Europe";
                  const headerColor = isAsia
                    ? "text-emerald-400"
                    : isUS
                    ? "text-[#38BDF8]"
                    : regionalMetrics.euRedCount === 3
                    ? "text-rose-400"
                    : regionalMetrics.euAvg < regionalMetrics.asiaAvg
                    ? "text-amber-300"
                    : "text-emerald-400";

                  return (
                    <th
                      key={k}
                      className={`p-2 text-center text-[10.5px] font-bold border-b border-[#B08D57]/20 min-w-[66px] ${headerColor}`}
                    >
                      <div className="flex items-center justify-center gap-1">
                        <span>{item.flag}</span>
                        <span>{item.symbol.replace(" Index", "").replace(" 40", "").replace(" 35", "").replace(" 200", "").replace(" 225", "").replace(" 100", "").replace(" 30", "").replace(" 50", "").replace(" 500", "")}</span>
                      </div>
                      <div className={`text-[9px] font-normal ${item.change24h >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                        {item.change24h >= 0 ? "+" : ""}{item.change24h.toFixed(2)}%
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {activeKeys.map(rowKey => {
                const rowItem = equitiesData[rowKey];
                const rowRegionBadgeClass = rowItem.region === "Asia"
                  ? "bg-emerald-950/60 text-emerald-300"
                  : rowItem.region === "US"
                  ? "bg-sky-950/60 text-sky-300"
                  : regionalMetrics.euRedCount === 3
                  ? "bg-rose-950/60 text-rose-300"
                  : regionalMetrics.euAvg < regionalMetrics.asiaAvg
                  ? "bg-amber-950/60 text-amber-300"
                  : "bg-emerald-950/60 text-emerald-300";

                return (
                  <tr key={rowKey} className="hover:bg-white/[0.02] transition-colors border-b border-[#B08D57]/10">
                    <td className="p-2 text-[11px] font-semibold text-[#EDE9DE]">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span>{rowItem.flag}</span>
                          <span className="font-bold">{rowItem.symbol}</span>
                          <span className={`text-[8.5px] px-1 py-0.2 rounded font-normal ${rowRegionBadgeClass}`}>
                            {rowItem.region}
                          </span>
                        </div>
                        <span
                          className={`text-[9.5px] font-bold px-1.5 py-0.2 rounded ${
                            rowItem.change24h >= 0 ? "bg-emerald-950/60 text-emerald-400" : "bg-rose-950/60 text-rose-400"
                          }`}
                        >
                          {rowItem.change24h >= 0 ? "+" : ""}{rowItem.change24h.toFixed(2)}%
                        </span>
                      </div>
                    </td>

                    {activeKeys.map(colKey => {
                      const colItem = equitiesData[colKey];
                      const isCross = rowItem.region !== colItem.region;
                      const val = correlationData[timeframe][rowKey]?.[colKey] ?? 0;
                      const isSelected =
                        (selectedPair[0] === rowKey && selectedPair[1] === colKey) ||
                        (selectedPair[0] === colKey && selectedPair[1] === rowKey);
                      const visual = getCellVisuals(val, isCross);

                      return (
                        <td key={colKey} className="p-1 text-center">
                          <button
                            onClick={() => setSelectedPair([rowKey, colKey])}
                            title={`${rowItem.symbol} (${rowItem.region}) vs ${colItem.symbol} (${colItem.region}) [${timeframe}]: ${val.toFixed(2)}`}
                            className={`w-full py-1.5 px-0.5 rounded transition-all text-[10.5px] font-mono-data border cursor-pointer ${
                              visual.bg
                            } ${visual.border} ${visual.text} ${
                              isSelected
                                ? "ring-2 ring-[#E5C794] scale-105 z-10 shadow-lg"
                                : "hover:scale-105 hover:border-[#E5C794]/60"
                            } ${isCross && val <= 0 ? "ring-1 ring-rose-500/40" : ""}`}
                          >
                            {val === 1 ? "1.00" : val > 0 ? `+${val.toFixed(2)}` : val.toFixed(2)}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspected Pair Intelligence Dossier */}
      <div className="bg-black/70 border border-[#B08D57]/30 rounded-lg p-3.5 space-y-3 font-mono-data text-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#B08D57]/20">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-base">{inspectedPairDetail.rowAsset.flag}</span>
            <span className="font-bold text-[#EDE9DE] text-sm">{inspectedPairDetail.rowAsset.symbol}</span>
            <span className={`text-[10px] px-1 py-0.5 rounded ${
              inspectedPairDetail.rowAsset.region === "Asia" ? "bg-emerald-950/60 text-emerald-300" :
              inspectedPairDetail.rowAsset.region === "US" ? "bg-sky-950/60 text-sky-300" : "bg-rose-950/60 text-rose-300"
            }`}>
              {inspectedPairDetail.rowAsset.region}
            </span>
            <span className={`font-bold text-xs ${inspectedPairDetail.rowAsset.change24h >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
              ({inspectedPairDetail.rowAsset.change24h >= 0 ? "+" : ""}{inspectedPairDetail.rowAsset.change24h.toFixed(2)}%)
            </span>
            <span className="text-[#8292A6] text-xs">vs</span>
            <span className="text-base">{inspectedPairDetail.colAsset.flag}</span>
            <span className="font-bold text-[#EDE9DE] text-sm">{inspectedPairDetail.colAsset.symbol}</span>
            <span className={`text-[10px] px-1 py-0.5 rounded ${
              inspectedPairDetail.colAsset.region === "Asia" ? "bg-emerald-950/60 text-emerald-300" :
              inspectedPairDetail.colAsset.region === "US" ? "bg-sky-950/60 text-sky-300" : "bg-rose-950/60 text-rose-300"
            }`}>
              {inspectedPairDetail.colAsset.region}
            </span>
            <span className={`font-bold text-xs ${inspectedPairDetail.colAsset.change24h >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
              ({inspectedPairDetail.colAsset.change24h >= 0 ? "+" : ""}{inspectedPairDetail.colAsset.change24h.toFixed(2)}%)
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] text-[#8292A6]">
              {timeframe} Correlation:
            </span>
            <span
              className={`px-2 py-0.5 rounded text-xs font-bold border ${
                inspectedPairDetail.currentCorr <= 0
                  ? "bg-rose-950/70 border-rose-500/40 text-rose-300"
                  : inspectedPairDetail.currentCorr >= 0.7
                  ? "bg-emerald-950/70 border-emerald-500/40 text-emerald-300"
                  : "bg-[#B08D57]/20 border-[#B08D57]/40 text-[#E5C794]"
              }`}
            >
              {inspectedPairDetail.currentCorr > 0 ? "+" : ""}
              {inspectedPairDetail.currentCorr.toFixed(2)}
            </span>
            <span className="text-[10px] text-[#8292A6]">
              (1Y Baseline: {inspectedPairDetail.normCorr > 0 ? "+" : ""}{inspectedPairDetail.normCorr.toFixed(2)} // Delta:{" "}
              <span className={inspectedPairDetail.delta < 0 ? "text-rose-400 font-bold" : "text-emerald-400 font-bold"}>
                {inspectedPairDetail.delta > 0 ? "+" : ""}{inspectedPairDetail.delta.toFixed(2)}
              </span>
              )
            </span>
          </div>
        </div>

        {/* Macro Transmission & Desk Strategy */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 text-[11px]">
          <div className="space-y-1.5 bg-black/40 p-2.5 rounded border border-[#222C3D]">
            <div className="flex items-center gap-1.5 text-[#E5C794] font-bold text-[10.5px]">
              <Info className="w-3.5 h-3.5 text-[#B08D57]" />
              <span>REGIME: {inspectedPairDetail.regime.toUpperCase()}</span>
            </div>
            <p className="text-[#BAC7D5] leading-relaxed">
              {inspectedPairDetail.explanation}
            </p>
          </div>

          <div className="space-y-1.5 bg-black/40 p-2.5 rounded border border-[#222C3D]">
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[10.5px]">
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              <span>PROP DESK QUANT EXECUTION STRATEGY:</span>
            </div>
            <p className="text-[#EDE9DE] leading-relaxed">
              {inspectedPairDetail.tradeStrategy}
            </p>
          </div>
        </div>

        {/* Direct Terminal Execution Trigger */}
        {onOpenTerminal && (
          <div className="pt-1">
            <button
              onClick={() =>
                onOpenTerminal(
                  `Analyze the inter-market correlation between ${inspectedPairDetail.rowAsset.symbol} (${inspectedPairDetail.rowAsset.region}, ${inspectedPairDetail.rowAsset.change24h > 0 ? '+' : ''}${inspectedPairDetail.rowAsset.change24h.toFixed(2)}%) and ${inspectedPairDetail.colAsset.symbol} (${inspectedPairDetail.colAsset.region}, ${inspectedPairDetail.colAsset.change24h > 0 ? '+' : ''}${inspectedPairDetail.colAsset.change24h.toFixed(2)}%). Correlation is currently ${inspectedPairDetail.currentCorr.toFixed(2)} vs 1Y baseline ${inspectedPairDetail.normCorr.toFixed(2)}. Detail quantitative pairs trading entry parameters, beta hedging weight, and invalidation stop levels.`
                )
              }
              className="w-full flex items-center justify-center gap-2 bg-[#B08D57]/20 hover:bg-[#B08D57]/30 text-[#E5C794] border border-[#B08D57]/40 py-1.5 px-3 rounded-lg text-xs font-mono-data font-bold transition-all cursor-pointer shadow-sm active:scale-[0.99]"
            >
              <span>Execute Tri-Regional Correlation Analysis & Pairs Trade in SMC Terminal</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-[#B08D57]" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
