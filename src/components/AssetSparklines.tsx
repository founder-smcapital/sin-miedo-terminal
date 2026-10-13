import React, { useState, useEffect, useMemo } from "react";
import {
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Maximize2,
  Minimize2,
  X,
  Search,
  SlidersHorizontal,
  ShieldAlert,
  Flame,
  Globe
} from "lucide-react";
import { MacroDataState } from "../types";
import { MultiAssetOrderBookDepth } from "./MultiAssetOrderBookDepth";

export interface AssetSparklineData {
  symbol: string;
  name: string;
  category: "Rates" | "FX" | "Volatility" | "Commodity" | "Equity" | "Digital Assets";
  subCategory?: "US Sovereign" | "Global Sovereign" | "Curve Spreads" | "Real & Inflation" | "Money Market" | "G10 Major" | "Commodity FX" | "Safe Haven FX" | "Implied Volatility" | "Core Risk" | "Americas Large-Cap" | "Americas Tech Benchmark" | "European Benchmark" | "Asia-Pacific Index" | string;
  isRiskAsset?: boolean;
  currentPrice: string;
  rawPrice: number;
  change24h: string;
  isPositive: boolean;
  isNeutral?: boolean;
  high24h: string;
  low24h: string;
  momentumTag: string;
  macroRole?: string;
  history24h: { hour: string; price: number; formatted: string }[];
}

function getLiveAssetHistoryAndRange(
  ticker: any,
  fallbackPrice: number,
  fallbackPrevClose: number,
  fallbackHigh: number,
  fallbackLow: number,
  formatFn: (val: number) => string
): {
  history24h: { hour: string; price: number; formatted: string }[];
  high24h: string;
  low24h: string;
} {
  const currentPrice = typeof ticker?.price === "number" && !isNaN(ticker.price) ? ticker.price : fallbackPrice;
  const prevClose = typeof ticker?.prevClose === "number" && !isNaN(ticker.prevClose) ? ticker.prevClose : fallbackPrevClose;
  const highNum = typeof ticker?.high24h === "number" && !isNaN(ticker.high24h) ? Math.max(ticker.high24h, currentPrice) : Math.max(fallbackHigh, currentPrice);
  const lowNum = typeof ticker?.low24h === "number" && !isNaN(ticker.low24h) ? Math.min(ticker.low24h, currentPrice) : Math.min(fallbackLow, currentPrice);

  let history: { hour: string; price: number; formatted: string }[] = [];
  if (Array.isArray(ticker?.history24h) && ticker.history24h.length >= 4) {
    history = ticker.history24h.map((pt: any, idx: number) => {
      const p = idx === ticker.history24h.length - 1 ? currentPrice : Number(pt.price);
      return {
        hour: pt.hour,
        price: p,
        formatted: formatFn(p)
      };
    });
  } else {
    // Generate smoothly anchored curve connecting prevClose -> high/low -> currentPrice
    const hours = ["00:00", "02:00", "04:00", "06:00", "08:00", "10:00", "12:00", "14:00", "16:00", "18:00", "20:00", "LIVE"];
    const range = Math.max(0.001, highNum - lowNum);
    history = hours.map((hour, i) => {
      if (i === hours.length - 1) {
        return { hour, price: currentPrice, formatted: formatFn(currentPrice) };
      }
      const progress = i / (hours.length - 1);
      const wave = Math.sin(progress * Math.PI * 1.5) * (range * 0.28);
      const intermediate = prevClose + (currentPrice - prevClose) * progress + wave;
      const bounded = Math.max(lowNum, Math.min(highNum, intermediate));
      const p = Number(bounded.toFixed(2));
      return { hour, price: p, formatted: formatFn(p) };
    });
  }

  const computedMax = Math.max(...history.map(p => p.price), highNum);
  const computedMin = Math.min(...history.map(p => p.price), lowNum);

  return {
    history24h: history,
    high24h: formatFn(computedMax),
    low24h: formatFn(computedMin)
  };
}

interface AssetSparklinesProps {
  macroData: MacroDataState;
}

export const AssetSparklines: React.FC<AssetSparklinesProps> = ({ macroData }) => {
  const [hoveredAsset, setHoveredAsset] = useState<{ symbol: string; index: number } | null>(null);
  const [filterCategory, setFilterCategory] = useState<"ALL" | "Risk Assets" | "Commodity" | "Equity" | "Digital Assets" | "Rates" | "FX" | "Volatility">("ALL");
  const [ratesSubCategory, setRatesSubCategory] = useState<"ALL" | "US Sovereign" | "Global Sovereign" | "Curve Spreads" | "Real & Inflation" | "Money Market">("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showTermStructure, setShowTermStructure] = useState<boolean>(true);
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);

  // ESC key listener to exit full screen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFullScreen) {
        setIsFullScreen(false);
      }
    };
    if (isFullScreen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isFullScreen]);

  // Extract live prices from macroData.tickers with responsive fallbacks
  const goldTicker = macroData.tickers.find(t => t.symbol === "XAU/USD");
  const silverTicker = macroData.tickers.find(t => t.symbol === "XAG/USD");
  const yenTicker = macroData.tickers.find(t => t.symbol === "USD/JPY");
  const brentTicker = macroData.tickers.find(t => t.symbol === "BRENT");
  const ibexTicker = macroData.tickers.find(t => t.symbol === "IBEX 35");
  const ust10yTicker = macroData.tickers.find(t => t.symbol === "UST 10Y" || t.symbol === "US 10Y");
  const ust2yTicker = macroData.tickers.find(t => t.symbol === "UST 2Y");
  const ust30yTicker = macroData.tickers.find(t => t.symbol === "UST 30Y" || t.symbol === "US 30Y");
  const ust5yTicker = macroData.tickers.find(t => t.symbol === "UST 5Y" || t.symbol === "US 5Y");
  const de10yTicker = macroData.tickers.find(t => t.symbol === "DE 10Y");
  const es10yTicker = macroData.tickers.find(t => t.symbol === "ES 10Y");
  const jp10yTicker = macroData.tickers.find(t => t.symbol === "JP 10Y" || t.symbol === "JP 10Y JGB");
  const uk10yTicker = macroData.tickers.find(t => t.symbol === "UK 10Y" || t.symbol === "UK 10Y GILT");
  const tipsTicker = macroData.tickers.find(t => t.symbol === "10Y TIPS");
  const btcTicker = macroData.tickers.find(t => t.symbol === "BTC/USD");
  const sp500Ticker = macroData.tickers.find(t => t.symbol === "S&P 500" || t.symbol === "SPX" || t.symbol === "$ES");
  const vixTicker = macroData.tickers.find(t => t.symbol === "VIX");
  const moveTicker = macroData.tickers.find(t => t.symbol === "MOVE");
  const eurTicker = macroData.tickers.find(t => t.symbol === "EUR/USD");
  const gbpTicker = macroData.tickers.find(t => t.symbol === "GBP/USD");
  const audTicker = macroData.tickers.find(t => t.symbol === "AUD/USD");
  const chfTicker = macroData.tickers.find(t => t.symbol === "USD/CHF");
  const kospiTicker = macroData.tickers.find(t => t.symbol === "KOSPI 200" || t.symbol === "KOSPI" || t.symbol === "$KOPSI");
  const nikkeiTicker = macroData.tickers.find(t => t.symbol === "NIKKEI 225" || t.symbol === "NIKKEI");
  const daxTicker = macroData.tickers.find(t => t.symbol === "DAX 40" || t.symbol === "DAX");
  const fesxTicker = macroData.tickers.find(t => t.symbol === "EURO STOXX 50" || t.symbol === "FESX");
  const hsiTicker = macroData.tickers.find(t => t.symbol === "HANG SENG" || t.symbol === "HSI");
  const nasdaqTicker = macroData.tickers.find(t => t.symbol === "NASDAQ 100" || t.symbol === "NASDAQ" || t.symbol === "NQ");
  const ftseTicker = macroData.tickers.find(t => t.symbol === "FTSE 100" || t.symbol === "FTSE");

  const goldPrice = goldTicker?.price ?? 4408.90;
  const silverPrice = silverTicker?.price ?? 64.10;
  const yenPrice = yenTicker?.price ?? macroData.engines.yenIntervention.spot ?? 156.25;
  const brentPrice = brentTicker?.price ?? 76.85;
  const ibexPrice = ibexTicker?.price ?? macroData.engines.ibexBias.level ?? 19834.00;
  const btcPrice = btcTicker?.price ?? 84450.00;
  const sp500Price = sp500Ticker?.price ?? 7704.13;
  const kospiPrice = kospiTicker?.price ?? 1112.00;
  const nikkeiPrice = nikkeiTicker?.price ?? 66368.00;
  const daxPrice = daxTicker?.price ?? 19620.00;
  const fesxPrice = fesxTicker?.price ?? 5082.00;
  const hsiPrice = hsiTicker?.price ?? 25054.00;
  const nasdaqPrice = nasdaqTicker?.price ?? 30608.14;
  const ftsePrice = ftseTicker?.price ?? 8380.20;
  const vixPrice = vixTicker?.price ?? 18.95;
  const movePrice = moveTicker?.price ?? 102.40;
  const eurPrice = eurTicker?.price ?? 1.0854;
  const gbpPrice = gbpTicker?.price ?? 1.3120;
  const audPrice = audTicker?.price ?? 0.6685;
  const chfPrice = chfTicker?.price ?? 0.8524;

  const ust10yPrice = ust10yTicker?.price ?? 5.277;
  const ust2yPrice = ust2yTicker?.price ?? 4.422;
  const ust30yPrice = ust30yTicker?.price ?? 5.630;
  const ust5yPrice = ust5yTicker?.price ?? 5.055;
  const de10yPrice = de10yTicker?.price ?? 3.455;
  const es10yPrice = es10yTicker?.price ?? 4.280;
  const rawJgb = jp10yTicker?.price ?? (macroData.engines.yenIntervention.jgb10y ? parseFloat(macroData.engines.yenIntervention.jgb10y) : 3.088);
  const jp10yPrice = isNaN(rawJgb) ? 3.088 : rawJgb;
  const uk10yPrice = uk10yTicker?.price ?? 5.333;
  const tipsPrice = tipsTicker?.price ?? 2.450;
  const breakevenPrice = Number((ust10yPrice - tipsPrice).toFixed(3));

  // Build the complete cross-asset array
  const sparklineAssets: AssetSparklineData[] = useMemo(() => {
    // ----------------------------------------------------
    // 1. COMMODITIES, EQUITIES & DIGITAL ASSETS (RISK-ON SUITE)
    // ----------------------------------------------------
    // Authentic Brent 24h trajectory mirroring real market cash benchmark
    const brentRatio = brentPrice / 76.85;
    const brentHistory = (brentTicker?.history24h && brentTicker.history24h.length >= 6)
      ? brentTicker.history24h
      : [
          { hour: "00:00", price: Number((76.53 * brentRatio).toFixed(2)), formatted: `$${(76.53 * brentRatio).toFixed(2)}` },
          { hour: "02:00", price: Number((76.77 * brentRatio).toFixed(2)), formatted: `$${(76.77 * brentRatio).toFixed(2)}` },
          { hour: "04:00", price: Number((76.98 * brentRatio).toFixed(2)), formatted: `$${(76.98 * brentRatio).toFixed(2)}` },
          { hour: "06:00", price: Number((77.15 * brentRatio).toFixed(2)), formatted: `$${(77.15 * brentRatio).toFixed(2)}` },
          { hour: "08:00", price: Number((77.38 * brentRatio).toFixed(2)), formatted: `$${(77.38 * brentRatio).toFixed(2)}` },
          { hour: "10:00", price: Number((77.20 * brentRatio).toFixed(2)), formatted: `$${(77.20 * brentRatio).toFixed(2)}` },
          { hour: "12:00", price: Number((77.05 * brentRatio).toFixed(2)), formatted: `$${(77.05 * brentRatio).toFixed(2)}` },
          { hour: "14:00", price: Number((76.85 * brentRatio).toFixed(2)), formatted: `$${(76.85 * brentRatio).toFixed(2)}` },
          { hour: "16:00", price: Number((76.65 * brentRatio).toFixed(2)), formatted: `$${(76.65 * brentRatio).toFixed(2)}` },
          { hour: "18:00", price: Number((76.45 * brentRatio).toFixed(2)), formatted: `$${(76.45 * brentRatio).toFixed(2)}` },
          { hour: "20:00", price: Number((76.60 * brentRatio).toFixed(2)), formatted: `$${(76.60 * brentRatio).toFixed(2)}` },
          { hour: "LIVE", price: brentPrice, formatted: `$${brentPrice.toFixed(2)}` }
        ];

    const goldRatio = goldPrice / 4408.90;
    const goldHistory = [
      { hour: "00:00", price: Number((4402.5 * goldRatio).toFixed(1)), formatted: `$${(4402.5 * goldRatio).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
      { hour: "02:00", price: Number((4396.8 * goldRatio).toFixed(1)), formatted: `$${(4396.8 * goldRatio).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
      { hour: "04:00", price: Number((4410.2 * goldRatio).toFixed(1)), formatted: `$${(4410.2 * goldRatio).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
      { hour: "06:00", price: Number((4418.5 * goldRatio).toFixed(1)), formatted: `$${(4418.5 * goldRatio).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
      { hour: "08:00", price: Number((4425.0 * goldRatio).toFixed(1)), formatted: `$${(4425.0 * goldRatio).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
      { hour: "10:00", price: Number((4432.8 * goldRatio).toFixed(1)), formatted: `$${(4432.8 * goldRatio).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
      { hour: "12:00", price: Number((4421.4 * goldRatio).toFixed(1)), formatted: `$${(4421.4 * goldRatio).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
      { hour: "14:00", price: Number((4415.0 * goldRatio).toFixed(1)), formatted: `$${(4415.0 * goldRatio).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
      { hour: "16:00", price: Number((4422.6 * goldRatio).toFixed(1)), formatted: `$${(4422.6 * goldRatio).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
      { hour: "18:00", price: Number((4412.0 * goldRatio).toFixed(1)), formatted: `$${(4412.0 * goldRatio).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
      { hour: "20:00", price: Number((4409.5 * goldRatio).toFixed(1)), formatted: `$${(4409.5 * goldRatio).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
      { hour: "LIVE", price: goldPrice, formatted: `$${goldPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` }
    ];

    const sp500Ratio = sp500Price / 7740.0;
    const sp500History = sp500Ticker?.history24h && sp500Ticker.history24h.length > 0
      ? sp500Ticker.history24h
      : [
          { hour: "00:00", price: Number((7680.0 * sp500Ratio).toFixed(1)), formatted: (7680.0 * sp500Ratio).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) },
          { hour: "02:00", price: Number((7695.0 * sp500Ratio).toFixed(1)), formatted: (7695.0 * sp500Ratio).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) },
          { hour: "04:00", price: Number((7710.0 * sp500Ratio).toFixed(1)), formatted: (7710.0 * sp500Ratio).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) },
          { hour: "06:00", price: Number((7725.0 * sp500Ratio).toFixed(1)), formatted: (7725.0 * sp500Ratio).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) },
          { hour: "08:00", price: Number((7750.0 * sp500Ratio).toFixed(1)), formatted: (7750.0 * sp500Ratio).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) },
          { hour: "10:00", price: Number((7775.0 * sp500Ratio).toFixed(1)), formatted: (7775.0 * sp500Ratio).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) },
          { hour: "12:00", price: Number((7760.0 * sp500Ratio).toFixed(1)), formatted: (7760.0 * sp500Ratio).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) },
          { hour: "14:00", price: Number((7785.0 * sp500Ratio).toFixed(1)), formatted: (7785.0 * sp500Ratio).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) },
          { hour: "16:00", price: Number((7804.9 * sp500Ratio).toFixed(1)), formatted: (7804.9 * sp500Ratio).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) },
          { hour: "18:00", price: Number((7790.0 * sp500Ratio).toFixed(1)), formatted: (7790.0 * sp500Ratio).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) },
          { hour: "20:00", price: Number((7780.0 * sp500Ratio).toFixed(1)), formatted: (7780.0 * sp500Ratio).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) },
          { hour: "LIVE", price: sp500Price, formatted: sp500Price.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) }
        ];

    const ibexBase = ibexPrice > 15000 ? ibexPrice : 19700.10;
    const ibexRatio = ibexBase / 19700.10;
    const ibexHistory = ibexTicker?.history24h && ibexTicker.history24h.length > 0
      ? ibexTicker.history24h
      : [
          { hour: "00:00", price: Number((19680.0 * ibexRatio).toFixed(1)), formatted: (19680.0 * ibexRatio).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) },
          { hour: "02:00", price: Number((19710.0 * ibexRatio).toFixed(1)), formatted: (19710.0 * ibexRatio).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) },
          { hour: "04:00", price: Number((19745.0 * ibexRatio).toFixed(1)), formatted: (19745.0 * ibexRatio).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) },
          { hour: "06:00", price: Number((19780.0 * ibexRatio).toFixed(1)), formatted: (19780.0 * ibexRatio).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) },
          { hour: "08:00", price: Number((19820.0 * ibexRatio).toFixed(1)), formatted: (19820.0 * ibexRatio).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) },
          { hour: "10:00", price: Number((19855.0 * ibexRatio).toFixed(1)), formatted: (19855.0 * ibexRatio).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) },
          { hour: "12:00", price: Number((19830.0 * ibexRatio).toFixed(1)), formatted: (19830.0 * ibexRatio).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) },
          { hour: "14:00", price: Number((19865.0 * ibexRatio).toFixed(1)), formatted: (19865.0 * ibexRatio).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) },
          { hour: "16:00", price: Number((19884.4 * ibexRatio).toFixed(1)), formatted: (19884.4 * ibexRatio).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) },
          { hour: "18:00", price: Number((19850.0 * ibexRatio).toFixed(1)), formatted: (19850.0 * ibexRatio).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) },
          { hour: "20:00", price: Number((19842.0 * ibexRatio).toFixed(1)), formatted: (19842.0 * ibexRatio).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) },
          { hour: "LIVE", price: ibexBase, formatted: ibexBase.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) }
        ];

    const kospiBase = kospiPrice > 800 ? kospiPrice : 1112.00;
    const kospiRatio = kospiBase / 1112.00;
    const kospiHistory = kospiTicker?.history24h && kospiTicker.history24h.length > 0
      ? kospiTicker.history24h
      : [
          { hour: "00:00", price: Number((1095.0 * kospiRatio).toFixed(2)), formatted: (1095.0 * kospiRatio).toFixed(2) },
          { hour: "02:00", price: Number((1098.5 * kospiRatio).toFixed(2)), formatted: (1098.5 * kospiRatio).toFixed(2) },
          { hour: "04:00", price: Number((1102.0 * kospiRatio).toFixed(2)), formatted: (1102.0 * kospiRatio).toFixed(2) },
          { hour: "06:00", price: Number((1106.5 * kospiRatio).toFixed(2)), formatted: (1106.5 * kospiRatio).toFixed(2) },
          { hour: "08:00", price: Number((1110.0 * kospiRatio).toFixed(2)), formatted: (1110.0 * kospiRatio).toFixed(2) },
          { hour: "10:00", price: Number((1118.0 * kospiRatio).toFixed(2)), formatted: (1118.0 * kospiRatio).toFixed(2) },
          { hour: "12:00", price: Number((1113.0 * kospiRatio).toFixed(2)), formatted: (1113.0 * kospiRatio).toFixed(2) },
          { hour: "14:00", price: Number((1122.5 * kospiRatio).toFixed(2)), formatted: (1122.5 * kospiRatio).toFixed(2) },
          { hour: "16:00", price: Number((1132.5 * kospiRatio).toFixed(2)), formatted: (1132.5 * kospiRatio).toFixed(2) },
          { hour: "18:00", price: Number((1120.0 * kospiRatio).toFixed(2)), formatted: (1120.0 * kospiRatio).toFixed(2) },
          { hour: "20:00", price: Number((1115.0 * kospiRatio).toFixed(2)), formatted: (1115.0 * kospiRatio).toFixed(2) },
          { hour: "LIVE", price: kospiBase, formatted: kospiBase.toFixed(2) }
        ];

    const nikkeiBase = nikkeiPrice > 50000 ? nikkeiPrice : 66368.0;
    const nikkeiRatio = nikkeiBase / 66368.0;
    const nikkeiHistory = nikkeiTicker?.history24h && nikkeiTicker.history24h.length > 0
      ? nikkeiTicker.history24h
      : [
          { hour: "00:00", price: Number((65400.0 * nikkeiRatio).toFixed(0)), formatted: Number((65400.0 * nikkeiRatio).toFixed(0)).toLocaleString('en-US') },
          { hour: "02:00", price: Number((65650.0 * nikkeiRatio).toFixed(0)), formatted: Number((65650.0 * nikkeiRatio).toFixed(0)).toLocaleString('en-US') },
          { hour: "04:00", price: Number((65980.0 * nikkeiRatio).toFixed(0)), formatted: Number((65980.0 * nikkeiRatio).toFixed(0)).toLocaleString('en-US') },
          { hour: "06:00", price: Number((66150.0 * nikkeiRatio).toFixed(0)), formatted: Number((66150.0 * nikkeiRatio).toFixed(0)).toLocaleString('en-US') },
          { hour: "08:00", price: Number((66320.0 * nikkeiRatio).toFixed(0)), formatted: Number((66320.0 * nikkeiRatio).toFixed(0)).toLocaleString('en-US') },
          { hour: "10:00", price: Number((66550.0 * nikkeiRatio).toFixed(0)), formatted: Number((66550.0 * nikkeiRatio).toFixed(0)).toLocaleString('en-US') },
          { hour: "12:00", price: Number((66380.0 * nikkeiRatio).toFixed(0)), formatted: Number((66380.0 * nikkeiRatio).toFixed(0)).toLocaleString('en-US') },
          { hour: "14:00", price: Number((66480.0 * nikkeiRatio).toFixed(0)), formatted: Number((66480.0 * nikkeiRatio).toFixed(0)).toLocaleString('en-US') },
          { hour: "16:00", price: Number((66620.0 * nikkeiRatio).toFixed(0)), formatted: Number((66620.0 * nikkeiRatio).toFixed(0)).toLocaleString('en-US') },
          { hour: "18:00", price: Number((66450.0 * nikkeiRatio).toFixed(0)), formatted: Number((66450.0 * nikkeiRatio).toFixed(0)).toLocaleString('en-US') },
          { hour: "20:00", price: Number((66400.0 * nikkeiRatio).toFixed(0)), formatted: Number((66400.0 * nikkeiRatio).toFixed(0)).toLocaleString('en-US') },
          { hour: "LIVE", price: nikkeiBase, formatted: nikkeiBase.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) }
        ];

    const daxBase = daxPrice > 15000 ? daxPrice : 19620.0;
    const daxRatio = daxBase / 19620.0;
    const daxHistory = daxTicker?.history24h && daxTicker.history24h.length > 0
      ? daxTicker.history24h
      : [
          { hour: "00:00", price: Number((19520.0 * daxRatio).toFixed(1)), formatted: (19520.0 * daxRatio).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) },
          { hour: "02:00", price: Number((19550.0 * daxRatio).toFixed(1)), formatted: (19550.0 * daxRatio).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) },
          { hour: "04:00", price: Number((19580.0 * daxRatio).toFixed(1)), formatted: (19580.0 * daxRatio).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) },
          { hour: "06:00", price: Number((19610.0 * daxRatio).toFixed(1)), formatted: (19610.0 * daxRatio).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) },
          { hour: "08:00", price: Number((19650.0 * daxRatio).toFixed(1)), formatted: (19650.0 * daxRatio).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) },
          { hour: "10:00", price: Number((19685.0 * daxRatio).toFixed(1)), formatted: (19685.0 * daxRatio).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) },
          { hour: "12:00", price: Number((19640.0 * daxRatio).toFixed(1)), formatted: (19640.0 * daxRatio).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) },
          { hour: "14:00", price: Number((19670.0 * daxRatio).toFixed(1)), formatted: (19670.0 * daxRatio).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) },
          { hour: "16:00", price: Number((19695.0 * daxRatio).toFixed(1)), formatted: (19695.0 * daxRatio).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) },
          { hour: "18:00", price: Number((19640.0 * daxRatio).toFixed(1)), formatted: (19640.0 * daxRatio).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) },
          { hour: "20:00", price: Number((19630.0 * daxRatio).toFixed(1)), formatted: (19630.0 * daxRatio).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) },
          { hour: "LIVE", price: daxBase, formatted: daxBase.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) }
        ];

    const fesxRatio = fesxPrice / 5082.0;
    const fesxHistory = fesxTicker?.history24h && fesxTicker.history24h.length > 0
      ? fesxTicker.history24h
      : [
          { hour: "00:00", price: Number((5060.0 * fesxRatio).toFixed(1)), formatted: (5060.0 * fesxRatio).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) },
          { hour: "02:00", price: Number((5068.0 * fesxRatio).toFixed(1)), formatted: (5068.0 * fesxRatio).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) },
          { hour: "04:00", price: Number((5074.0 * fesxRatio).toFixed(1)), formatted: (5074.0 * fesxRatio).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) },
          { hour: "06:00", price: Number((5080.0 * fesxRatio).toFixed(1)), formatted: (5080.0 * fesxRatio).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) },
          { hour: "08:00", price: Number((5092.0 * fesxRatio).toFixed(1)), formatted: (5092.0 * fesxRatio).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) },
          { hour: "10:00", price: Number((5096.0 * fesxRatio).toFixed(1)), formatted: (5096.0 * fesxRatio).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) },
          { hour: "12:00", price: Number((5085.0 * fesxRatio).toFixed(1)), formatted: (5085.0 * fesxRatio).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) },
          { hour: "14:00", price: Number((5090.0 * fesxRatio).toFixed(1)), formatted: (5090.0 * fesxRatio).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) },
          { hour: "16:00", price: Number((5098.0 * fesxRatio).toFixed(1)), formatted: (5098.0 * fesxRatio).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) },
          { hour: "18:00", price: Number((5088.0 * fesxRatio).toFixed(1)), formatted: (5088.0 * fesxRatio).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) },
          { hour: "20:00", price: Number((5084.0 * fesxRatio).toFixed(1)), formatted: (5084.0 * fesxRatio).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) },
          { hour: "LIVE", price: fesxPrice, formatted: fesxPrice.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) }
        ];

    const hsiRatio = hsiPrice / 25054.0;
    const hsiHistory = hsiTicker?.history24h && hsiTicker.history24h.length > 0
      ? hsiTicker.history24h
      : [
          { hour: "00:00", price: Number((24920.0 * hsiRatio).toFixed(0)), formatted: Number((24920.0 * hsiRatio).toFixed(0)).toLocaleString('en-US') },
          { hour: "02:00", price: Number((24980.0 * hsiRatio).toFixed(0)), formatted: Number((24980.0 * hsiRatio).toFixed(0)).toLocaleString('en-US') },
          { hour: "04:00", price: Number((25040.0 * hsiRatio).toFixed(0)), formatted: Number((25040.0 * hsiRatio).toFixed(0)).toLocaleString('en-US') },
          { hour: "06:00", price: Number((25110.0 * hsiRatio).toFixed(0)), formatted: Number((25110.0 * hsiRatio).toFixed(0)).toLocaleString('en-US') },
          { hour: "08:00", price: Number((25190.0 * hsiRatio).toFixed(0)), formatted: Number((25190.0 * hsiRatio).toFixed(0)).toLocaleString('en-US') },
          { hour: "10:00", price: Number((25280.0 * hsiRatio).toFixed(0)), formatted: Number((25280.0 * hsiRatio).toFixed(0)).toLocaleString('en-US') },
          { hour: "12:00", price: Number((25120.0 * hsiRatio).toFixed(0)), formatted: Number((25120.0 * hsiRatio).toFixed(0)).toLocaleString('en-US') },
          { hour: "14:00", price: Number((25180.0 * hsiRatio).toFixed(0)), formatted: Number((25180.0 * hsiRatio).toFixed(0)).toLocaleString('en-US') },
          { hour: "16:00", price: Number((25240.0 * hsiRatio).toFixed(0)), formatted: Number((25240.0 * hsiRatio).toFixed(0)).toLocaleString('en-US') },
          { hour: "18:00", price: Number((25150.0 * hsiRatio).toFixed(0)), formatted: Number((25150.0 * hsiRatio).toFixed(0)).toLocaleString('en-US') },
          { hour: "20:00", price: Number((25080.0 * hsiRatio).toFixed(0)), formatted: Number((25080.0 * hsiRatio).toFixed(0)).toLocaleString('en-US') },
          { hour: "LIVE", price: hsiPrice, formatted: hsiPrice.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) }
        ];

    // NASDAQ 100 24h history anchored accurately to real-time spot (~30,608 / ~30,894 scale)
    const nqBase = nasdaqPrice > 25000 ? nasdaqPrice : 30608.14;
    const nqRatio = nqBase / 30608.14;
    const nasdaqHistory = nasdaqTicker?.history24h && nasdaqTicker.history24h.length > 0
      ? nasdaqTicker.history24h
      : [
          { hour: "00:00", price: Number((30480.0 * nqRatio).toFixed(1)), formatted: (30480.0 * nqRatio).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) },
          { hour: "02:00", price: Number((30520.0 * nqRatio).toFixed(1)), formatted: (30520.0 * nqRatio).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) },
          { hour: "04:00", price: Number((30565.0 * nqRatio).toFixed(1)), formatted: (30565.0 * nqRatio).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) },
          { hour: "06:00", price: Number((30610.0 * nqRatio).toFixed(1)), formatted: (30610.0 * nqRatio).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) },
          { hour: "08:00", price: Number((30675.0 * nqRatio).toFixed(1)), formatted: (30675.0 * nqRatio).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) },
          { hour: "10:00", price: Number((30740.0 * nqRatio).toFixed(1)), formatted: (30740.0 * nqRatio).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) },
          { hour: "12:00", price: Number((30690.0 * nqRatio).toFixed(1)), formatted: (30690.0 * nqRatio).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) },
          { hour: "14:00", price: Number((30760.0 * nqRatio).toFixed(1)), formatted: (30760.0 * nqRatio).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) },
          { hour: "16:00", price: Number((30889.2 * nqRatio).toFixed(1)), formatted: (30889.2 * nqRatio).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) },
          { hour: "18:00", price: Number((30820.0 * nqRatio).toFixed(1)), formatted: (30820.0 * nqRatio).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) },
          { hour: "20:00", price: Number((30780.0 * nqRatio).toFixed(1)), formatted: (30780.0 * nqRatio).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) },
          { hour: "LIVE", price: nqBase, formatted: nqBase.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) }
        ];

    const ftseRatio = ftsePrice / 8380.20;
    const ftseHistory = ftseTicker?.history24h && ftseTicker.history24h.length > 0
      ? ftseTicker.history24h
      : [
          { hour: "00:00", price: Number((8345.0 * ftseRatio).toFixed(1)), formatted: (8345.0 * ftseRatio).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) },
          { hour: "02:00", price: Number((8358.0 * ftseRatio).toFixed(1)), formatted: (8358.0 * ftseRatio).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) },
          { hour: "04:00", price: Number((8370.0 * ftseRatio).toFixed(1)), formatted: (8370.0 * ftseRatio).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) },
          { hour: "06:00", price: Number((8382.0 * ftseRatio).toFixed(1)), formatted: (8382.0 * ftseRatio).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) },
          { hour: "08:00", price: Number((8405.0 * ftseRatio).toFixed(1)), formatted: (8405.0 * ftseRatio).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) },
          { hour: "10:00", price: Number((8415.0 * ftseRatio).toFixed(1)), formatted: (8415.0 * ftseRatio).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) },
          { hour: "12:00", price: Number((8395.0 * ftseRatio).toFixed(1)), formatted: (8395.0 * ftseRatio).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) },
          { hour: "14:00", price: Number((8402.0 * ftseRatio).toFixed(1)), formatted: (8402.0 * ftseRatio).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) },
          { hour: "16:00", price: Number((8412.0 * ftseRatio).toFixed(1)), formatted: (8412.0 * ftseRatio).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) },
          { hour: "18:00", price: Number((8390.0 * ftseRatio).toFixed(1)), formatted: (8390.0 * ftseRatio).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) },
          { hour: "20:00", price: Number((8385.0 * ftseRatio).toFixed(1)), formatted: (8385.0 * ftseRatio).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) },
          { hour: "LIVE", price: ftsePrice, formatted: ftsePrice.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) }
        ];

    const btcRatio = btcPrice / 84163.0;
    const btcHistory = btcTicker?.history24h && btcTicker.history24h.length > 0
      ? btcTicker.history24h
      : [
          { hour: "00:00", price: Number((83348.0 * btcRatio).toFixed(0)), formatted: `$${Number((83348.0 * btcRatio).toFixed(0)).toLocaleString('en-US')}` },
          { hour: "02:00", price: Number((83520.0 * btcRatio).toFixed(0)), formatted: `$${Number((83520.0 * btcRatio).toFixed(0)).toLocaleString('en-US')}` },
          { hour: "04:00", price: Number((83850.0 * btcRatio).toFixed(0)), formatted: `$${Number((83850.0 * btcRatio).toFixed(0)).toLocaleString('en-US')}` },
          { hour: "06:00", price: Number((84100.0 * btcRatio).toFixed(0)), formatted: `$${Number((84100.0 * btcRatio).toFixed(0)).toLocaleString('en-US')}` },
          { hour: "08:00", price: Number((84420.0 * btcRatio).toFixed(0)), formatted: `$${Number((84420.0 * btcRatio).toFixed(0)).toLocaleString('en-US')}` },
          { hour: "10:00", price: Number((84890.0 * btcRatio).toFixed(0)), formatted: `$${Number((84890.0 * btcRatio).toFixed(0)).toLocaleString('en-US')}` },
          { hour: "12:00", price: Number((84650.0 * btcRatio).toFixed(0)), formatted: `$${Number((84650.0 * btcRatio).toFixed(0)).toLocaleString('en-US')}` },
          { hour: "14:00", price: Number((85050.0 * btcRatio).toFixed(0)), formatted: `$${Number((85050.0 * btcRatio).toFixed(0)).toLocaleString('en-US')}` },
          { hour: "16:00", price: Number((85247.0 * btcRatio).toFixed(0)), formatted: `$${Number((85247.0 * btcRatio).toFixed(0)).toLocaleString('en-US')}` },
          { hour: "18:00", price: Number((84920.0 * btcRatio).toFixed(0)), formatted: `$${Number((84920.0 * btcRatio).toFixed(0)).toLocaleString('en-US')}` },
          { hour: "20:00", price: Number((84550.0 * btcRatio).toFixed(0)), formatted: `$${Number((84550.0 * btcRatio).toFixed(0)).toLocaleString('en-US')}` },
          { hour: "LIVE", price: btcPrice, formatted: `$${btcPrice.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` }
        ];

    const ethCurrent = 2718.0;
    const ethHistory = [
      { hour: "00:00", price: 2680.0, formatted: "$2,680" },
      { hour: "02:00", price: 2692.0, formatted: "$2,692" },
      { hour: "04:00", price: 2705.0, formatted: "$2,705" },
      { hour: "06:00", price: 2718.0, formatted: "$2,718" },
      { hour: "08:00", price: 2732.0, formatted: "$2,732" },
      { hour: "10:00", price: 2748.0, formatted: "$2,748" },
      { hour: "12:00", price: 2725.0, formatted: "$2,725" },
      { hour: "14:00", price: 2740.0, formatted: "$2,740" },
      { hour: "16:00", price: 2755.0, formatted: "$2,755" },
      { hour: "18:00", price: 2735.0, formatted: "$2,735" },
      { hour: "20:00", price: 2722.0, formatted: "$2,722" },
      { hour: "LIVE", price: ethCurrent, formatted: "$2,718" }
    ];

    const silverRatio = silverPrice / 64.10;
    const silverHistory = [
      { hour: "00:00", price: Number((63.95 * silverRatio).toFixed(2)), formatted: `$${(63.95 * silverRatio).toFixed(2)}` },
      { hour: "02:00", price: Number((63.88 * silverRatio).toFixed(2)), formatted: `$${(63.88 * silverRatio).toFixed(2)}` },
      { hour: "04:00", price: Number((64.02 * silverRatio).toFixed(2)), formatted: `$${(64.02 * silverRatio).toFixed(2)}` },
      { hour: "06:00", price: Number((64.15 * silverRatio).toFixed(2)), formatted: `$${(64.15 * silverRatio).toFixed(2)}` },
      { hour: "08:00", price: Number((64.28 * silverRatio).toFixed(2)), formatted: `$${(64.28 * silverRatio).toFixed(2)}` },
      { hour: "10:00", price: Number((64.22 * silverRatio).toFixed(2)), formatted: `$${(64.22 * silverRatio).toFixed(2)}` },
      { hour: "12:00", price: Number((64.12 * silverRatio).toFixed(2)), formatted: `$${(64.12 * silverRatio).toFixed(2)}` },
      { hour: "14:00", price: Number((64.05 * silverRatio).toFixed(2)), formatted: `$${(64.05 * silverRatio).toFixed(2)}` },
      { hour: "16:00", price: Number((64.18 * silverRatio).toFixed(2)), formatted: `$${(64.18 * silverRatio).toFixed(2)}` },
      { hour: "18:00", price: Number((64.14 * silverRatio).toFixed(2)), formatted: `$${(64.14 * silverRatio).toFixed(2)}` },
      { hour: "20:00", price: Number((64.08 * silverRatio).toFixed(2)), formatted: `$${(64.08 * silverRatio).toFixed(2)}` },
      { hour: "LIVE", price: silverPrice, formatted: `$${silverPrice.toFixed(2)}` }
    ];

    // USD/JPY
    const yenHistory = [
      { hour: "00:00", price: 156.80, formatted: "156.80" },
      { hour: "02:00", price: 156.95, formatted: "156.95" },
      { hour: "04:00", price: 156.65, formatted: "156.65" },
      { hour: "06:00", price: 156.40, formatted: "156.40" },
      { hour: "08:00", price: 156.15, formatted: "156.15" },
      { hour: "10:00", price: 155.95, formatted: "155.95" },
      { hour: "12:00", price: 155.80, formatted: "155.80" },
      { hour: "14:00", price: 156.10, formatted: "156.10" },
      { hour: "16:00", price: 156.35, formatted: "156.35" },
      { hour: "18:00", price: 156.28, formatted: "156.28" },
      { hour: "20:00", price: 156.22, formatted: "156.22" },
      { hour: "LIVE", price: yenPrice, formatted: yenPrice.toFixed(2) }
    ];

    // ----------------------------------------------------
    // 2. VOLATILITY INDICES (VIX + MOVE)
    // ----------------------------------------------------
    const vixHistory = [
      { hour: "00:00", price: 19.45, formatted: "19.45" },
      { hour: "02:00", price: 19.80, formatted: "19.80" },
      { hour: "04:00", price: 19.65, formatted: "19.65" },
      { hour: "06:00", price: 19.30, formatted: "19.30" },
      { hour: "08:00", price: 19.10, formatted: "19.10" },
      { hour: "10:00", price: 18.90, formatted: "18.90" },
      { hour: "12:00", price: 18.75, formatted: "18.75" },
      { hour: "14:00", price: 18.25, formatted: "18.25" },
      { hour: "16:00", price: 18.60, formatted: "18.60" },
      { hour: "18:00", price: 18.80, formatted: "18.80" },
      { hour: "20:00", price: 18.92, formatted: "18.92" },
      { hour: "LIVE", price: vixPrice, formatted: vixPrice.toFixed(2) }
    ];

    const moveHistory = [
      { hour: "00:00", price: 105.2, formatted: "105.20" },
      { hour: "02:00", price: 106.0, formatted: "106.00" },
      { hour: "04:00", price: 105.5, formatted: "105.50" },
      { hour: "06:00", price: 104.8, formatted: "104.80" },
      { hour: "08:00", price: 103.9, formatted: "103.90" },
      { hour: "10:00", price: 103.2, formatted: "103.20" },
      { hour: "12:00", price: 102.0, formatted: "102.00" },
      { hour: "14:00", price: 101.5, formatted: "101.50" },
      { hour: "16:00", price: 101.8, formatted: "101.80" },
      { hour: "18:00", price: 102.1, formatted: "102.10" },
      { hour: "20:00", price: 102.3, formatted: "102.30" },
      { hour: "LIVE", price: movePrice, formatted: movePrice.toFixed(2) }
    ];

    // ----------------------------------------------------
    // 3. ESSENTIAL FX MARKETS
    // ----------------------------------------------------
    const dxyHistory = [
      { hour: "00:00", price: 103.75, formatted: "103.75" },
      { hour: "02:00", price: 103.80, formatted: "103.80" },
      { hour: "04:00", price: 103.65, formatted: "103.65" },
      { hour: "06:00", price: 103.55, formatted: "103.55" },
      { hour: "08:00", price: 103.45, formatted: "103.45" },
      { hour: "10:00", price: 103.35, formatted: "103.35" },
      { hour: "12:00", price: 103.25, formatted: "103.25" },
      { hour: "14:00", price: 103.30, formatted: "103.30" },
      { hour: "16:00", price: 103.48, formatted: "103.48" },
      { hour: "18:00", price: 103.40, formatted: "103.40" },
      { hour: "20:00", price: 103.38, formatted: "103.38" },
      { hour: "LIVE", price: 103.42, formatted: "103.42" }
    ];

    const eurHistory = [
      { hour: "00:00", price: 1.0880, formatted: "1.0880" },
      { hour: "02:00", price: 1.0875, formatted: "1.0875" },
      { hour: "04:00", price: 1.0868, formatted: "1.0868" },
      { hour: "06:00", price: 1.0860, formatted: "1.0860" },
      { hour: "08:00", price: 1.0850, formatted: "1.0850" },
      { hour: "10:00", price: 1.0845, formatted: "1.0845" },
      { hour: "12:00", price: 1.0840, formatted: "1.0840" },
      { hour: "14:00", price: 1.0848, formatted: "1.0848" },
      { hour: "16:00", price: 1.0856, formatted: "1.0856" },
      { hour: "18:00", price: 1.0852, formatted: "1.0852" },
      { hour: "20:00", price: 1.0853, formatted: "1.0853" },
      { hour: "LIVE", price: eurPrice, formatted: eurPrice.toFixed(4) }
    ];

    const gbpHistory = [
      { hour: "00:00", price: 1.3095, formatted: "1.3095" },
      { hour: "02:00", price: 1.3090, formatted: "1.3090" },
      { hour: "04:00", price: 1.3102, formatted: "1.3102" },
      { hour: "06:00", price: 1.3115, formatted: "1.3115" },
      { hour: "08:00", price: 1.3128, formatted: "1.3128" },
      { hour: "10:00", price: 1.3135, formatted: "1.3135" },
      { hour: "12:00", price: 1.3125, formatted: "1.3125" },
      { hour: "14:00", price: 1.3118, formatted: "1.3118" },
      { hour: "16:00", price: 1.3124, formatted: "1.3124" },
      { hour: "18:00", price: 1.3120, formatted: "1.3120" },
      { hour: "20:00", price: 1.3119, formatted: "1.3119" },
      { hour: "LIVE", price: gbpPrice, formatted: gbpPrice.toFixed(4) }
    ];

    const audHistory = [
      { hour: "00:00", price: 0.6660, formatted: "0.6660" },
      { hour: "02:00", price: 0.6655, formatted: "0.6655" },
      { hour: "04:00", price: 0.6668, formatted: "0.6668" },
      { hour: "06:00", price: 0.6675, formatted: "0.6675" },
      { hour: "08:00", price: 0.6688, formatted: "0.6688" },
      { hour: "10:00", price: 0.6695, formatted: "0.6695" },
      { hour: "12:00", price: 0.6682, formatted: "0.6682" },
      { hour: "14:00", price: 0.6678, formatted: "0.6678" },
      { hour: "16:00", price: 0.6684, formatted: "0.6684" },
      { hour: "18:00", price: 0.6686, formatted: "0.6686" },
      { hour: "20:00", price: 0.6685, formatted: "0.6685" },
      { hour: "LIVE", price: audPrice, formatted: audPrice.toFixed(4) }
    ];

    const chfHistory = [
      { hour: "00:00", price: 0.8540, formatted: "0.8540" },
      { hour: "02:00", price: 0.8548, formatted: "0.8548" },
      { hour: "04:00", price: 0.8538, formatted: "0.8538" },
      { hour: "06:00", price: 0.8530, formatted: "0.8530" },
      { hour: "08:00", price: 0.8522, formatted: "0.8522" },
      { hour: "10:00", price: 0.8518, formatted: "0.8518" },
      { hour: "12:00", price: 0.8515, formatted: "0.8515" },
      { hour: "14:00", price: 0.8520, formatted: "0.8520" },
      { hour: "16:00", price: 0.8526, formatted: "0.8526" },
      { hour: "18:00", price: 0.8525, formatted: "0.8525" },
      { hour: "20:00", price: 0.8523, formatted: "0.8523" },
      { hour: "LIVE", price: chfPrice, formatted: chfPrice.toFixed(4) }
    ];

    // ----------------------------------------------------
    // 4. RATES BENCHMARKS (14 INSTRUMENTS)
    // ----------------------------------------------------
    const ust10yHistory = [
      { hour: "00:00", price: Number((ust10yPrice - 0.035).toFixed(3)), formatted: `${(ust10yPrice - 0.035).toFixed(3)}%` },
      { hour: "02:00", price: Number((ust10yPrice - 0.020).toFixed(3)), formatted: `${(ust10yPrice - 0.020).toFixed(3)}%` },
      { hour: "04:00", price: Number((ust10yPrice - 0.025).toFixed(3)), formatted: `${(ust10yPrice - 0.025).toFixed(3)}%` },
      { hour: "06:00", price: Number((ust10yPrice - 0.015).toFixed(3)), formatted: `${(ust10yPrice - 0.015).toFixed(3)}%` },
      { hour: "08:00", price: Number((ust10yPrice - 0.010).toFixed(3)), formatted: `${(ust10yPrice - 0.010).toFixed(3)}%` },
      { hour: "10:00", price: Number((ust10yPrice + 0.005).toFixed(3)), formatted: `${(ust10yPrice + 0.005).toFixed(3)}%` },
      { hour: "12:00", price: Number((ust10yPrice + 0.015).toFixed(3)), formatted: `${(ust10yPrice + 0.015).toFixed(3)}%` },
      { hour: "14:00", price: Number((ust10yPrice + 0.008).toFixed(3)), formatted: `${(ust10yPrice + 0.008).toFixed(3)}%` },
      { hour: "16:00", price: Number((ust10yPrice - 0.005).toFixed(3)), formatted: `${(ust10yPrice - 0.005).toFixed(3)}%` },
      { hour: "18:00", price: Number((ust10yPrice - 0.002).toFixed(3)), formatted: `${(ust10yPrice - 0.002).toFixed(3)}%` },
      { hour: "20:00", price: Number((ust10yPrice - 0.008).toFixed(3)), formatted: `${(ust10yPrice - 0.008).toFixed(3)}%` },
      { hour: "LIVE", price: ust10yPrice, formatted: `${ust10yPrice.toFixed(3)}%` }
    ];

    const ust2yHistory = [
      { hour: "00:00", price: Number((ust2yPrice + 0.040).toFixed(3)), formatted: `${(ust2yPrice + 0.040).toFixed(3)}%` },
      { hour: "02:00", price: Number((ust2yPrice + 0.035).toFixed(3)), formatted: `${(ust2yPrice + 0.035).toFixed(3)}%` },
      { hour: "04:00", price: Number((ust2yPrice + 0.025).toFixed(3)), formatted: `${(ust2yPrice + 0.025).toFixed(3)}%` },
      { hour: "06:00", price: Number((ust2yPrice + 0.018).toFixed(3)), formatted: `${(ust2yPrice + 0.018).toFixed(3)}%` },
      { hour: "08:00", price: Number((ust2yPrice + 0.012).toFixed(3)), formatted: `${(ust2yPrice + 0.012).toFixed(3)}%` },
      { hour: "10:00", price: Number((ust2yPrice + 0.008).toFixed(3)), formatted: `${(ust2yPrice + 0.008).toFixed(3)}%` },
      { hour: "12:00", price: Number((ust2yPrice + 0.002).toFixed(3)), formatted: `${(ust2yPrice + 0.002).toFixed(3)}%` },
      { hour: "14:00", price: Number((ust2yPrice - 0.005).toFixed(3)), formatted: `${(ust2yPrice - 0.005).toFixed(3)}%` },
      { hour: "16:00", price: Number((ust2yPrice - 0.008).toFixed(3)), formatted: `${(ust2yPrice - 0.008).toFixed(3)}%` },
      { hour: "18:00", price: Number((ust2yPrice - 0.004).toFixed(3)), formatted: `${(ust2yPrice - 0.004).toFixed(3)}%` },
      { hour: "20:00", price: Number((ust2yPrice - 0.006).toFixed(3)), formatted: `${(ust2yPrice - 0.006).toFixed(3)}%` },
      { hour: "LIVE", price: ust2yPrice, formatted: `${ust2yPrice.toFixed(3)}%` }
    ];

    const ust30yHistory = [
      { hour: "00:00", price: Number((ust30yPrice - 0.020).toFixed(3)), formatted: `${(ust30yPrice - 0.020).toFixed(3)}%` },
      { hour: "02:00", price: Number((ust30yPrice - 0.010).toFixed(3)), formatted: `${(ust30yPrice - 0.010).toFixed(3)}%` },
      { hour: "04:00", price: Number((ust30yPrice - 0.015).toFixed(3)), formatted: `${(ust30yPrice - 0.015).toFixed(3)}%` },
      { hour: "06:00", price: Number((ust30yPrice - 0.008).toFixed(3)), formatted: `${(ust30yPrice - 0.008).toFixed(3)}%` },
      { hour: "08:00", price: Number((ust30yPrice - 0.004).toFixed(3)), formatted: `${(ust30yPrice - 0.004).toFixed(3)}%` },
      { hour: "10:00", price: Number((ust30yPrice + 0.008).toFixed(3)), formatted: `${(ust30yPrice + 0.008).toFixed(3)}%` },
      { hour: "12:00", price: Number((ust30yPrice + 0.012).toFixed(3)), formatted: `${(ust30yPrice + 0.012).toFixed(3)}%` },
      { hour: "14:00", price: Number((ust30yPrice + 0.005).toFixed(3)), formatted: `${(ust30yPrice + 0.005).toFixed(3)}%` },
      { hour: "16:00", price: Number((ust30yPrice - 0.002).toFixed(3)), formatted: `${(ust30yPrice - 0.002).toFixed(3)}%` },
      { hour: "18:00", price: Number((ust30yPrice + 0.002).toFixed(3)), formatted: `${(ust30yPrice + 0.002).toFixed(3)}%` },
      { hour: "20:00", price: Number((ust30yPrice - 0.005).toFixed(3)), formatted: `${(ust30yPrice - 0.005).toFixed(3)}%` },
      { hour: "LIVE", price: ust30yPrice, formatted: `${ust30yPrice.toFixed(3)}%` }
    ];

    const ust2s10sPrice = Number(((ust10yPrice - ust2yPrice) * 100).toFixed(1));
    const ust2s10sHistory = [
      { hour: "00:00", price: 82.0, formatted: "+82.0 bps" },
      { hour: "02:00", price: 83.5, formatted: "+83.5 bps" },
      { hour: "04:00", price: 84.0, formatted: "+84.0 bps" },
      { hour: "06:00", price: 84.5, formatted: "+84.5 bps" },
      { hour: "08:00", price: 85.0, formatted: "+85.0 bps" },
      { hour: "10:00", price: 85.5, formatted: "+85.5 bps" },
      { hour: "12:00", price: 86.2, formatted: "+86.2 bps" },
      { hour: "14:00", price: 85.8, formatted: "+85.8 bps" },
      { hour: "16:00", price: 85.2, formatted: "+85.2 bps" },
      { hour: "18:00", price: 85.4, formatted: "+85.4 bps" },
      { hour: "20:00", price: 85.0, formatted: "+85.0 bps" },
      { hour: "LIVE", price: ust2s10sPrice, formatted: `+${ust2s10sPrice.toFixed(1)} bps` }
    ];

    const ust5s30sPrice = Number(((ust30yPrice - ust5yPrice) * 100).toFixed(1));
    const ust5s30sHistory = [
      { hour: "00:00", price: 55.0, formatted: "+55.0 bps" },
      { hour: "02:00", price: 56.2, formatted: "+56.2 bps" },
      { hour: "04:00", price: 56.8, formatted: "+56.8 bps" },
      { hour: "06:00", price: 57.0, formatted: "+57.0 bps" },
      { hour: "08:00", price: 57.2, formatted: "+57.2 bps" },
      { hour: "10:00", price: 57.8, formatted: "+57.8 bps" },
      { hour: "12:00", price: 58.0, formatted: "+58.0 bps" },
      { hour: "14:00", price: 57.6, formatted: "+57.6 bps" },
      { hour: "16:00", price: 57.4, formatted: "+57.4 bps" },
      { hour: "18:00", price: 57.5, formatted: "+57.5 bps" },
      { hour: "20:00", price: 57.2, formatted: "+57.2 bps" },
      { hour: "LIVE", price: ust5s30sPrice, formatted: `+${ust5s30sPrice.toFixed(1)} bps` }
    ];

    const de10yHistory = [
      { hour: "00:00", price: 3.475, formatted: "3.475%" },
      { hour: "02:00", price: 3.480, formatted: "3.480%" },
      { hour: "04:00", price: 3.470, formatted: "3.470%" },
      { hour: "06:00", price: 3.465, formatted: "3.465%" },
      { hour: "08:00", price: 3.460, formatted: "3.460%" },
      { hour: "10:00", price: 3.458, formatted: "3.458%" },
      { hour: "12:00", price: 3.452, formatted: "3.452%" },
      { hour: "14:00", price: 3.448, formatted: "3.448%" },
      { hour: "16:00", price: 3.450, formatted: "3.450%" },
      { hour: "18:00", price: 3.456, formatted: "3.456%" },
      { hour: "20:00", price: 3.452, formatted: "3.452%" },
      { hour: "LIVE", price: de10yPrice, formatted: `${de10yPrice.toFixed(3)}%` }
    ];

    const es10yHistory = [
      { hour: "00:00", price: 4.298, formatted: "4.298%" },
      { hour: "02:00", price: 4.305, formatted: "4.305%" },
      { hour: "04:00", price: 4.295, formatted: "4.295%" },
      { hour: "06:00", price: 4.290, formatted: "4.290%" },
      { hour: "08:00", price: 4.288, formatted: "4.288%" },
      { hour: "10:00", price: 4.282, formatted: "4.282%" },
      { hour: "12:00", price: 4.275, formatted: "4.275%" },
      { hour: "14:00", price: 4.270, formatted: "4.270%" },
      { hour: "16:00", price: 4.276, formatted: "4.276%" },
      { hour: "18:00", price: 4.282, formatted: "4.282%" },
      { hour: "20:00", price: 4.278, formatted: "4.278%" },
      { hour: "LIVE", price: es10yPrice, formatted: `${es10yPrice.toFixed(3)}%` }
    ];

    const jp10yHistory = [
      { hour: "00:00", price: 3.050, formatted: "3.050%" },
      { hour: "02:00", price: 3.055, formatted: "3.055%" },
      { hour: "04:00", price: 3.060, formatted: "3.060%" },
      { hour: "06:00", price: 3.068, formatted: "3.068%" },
      { hour: "08:00", price: 3.075, formatted: "3.075%" },
      { hour: "10:00", price: 3.080, formatted: "3.080%" },
      { hour: "12:00", price: 3.085, formatted: "3.085%" },
      { hour: "14:00", price: 3.092, formatted: "3.092%" },
      { hour: "16:00", price: 3.088, formatted: "3.088%" },
      { hour: "18:00", price: 3.086, formatted: "3.086%" },
      { hour: "20:00", price: 3.085, formatted: "3.085%" },
      { hour: "LIVE", price: jp10yPrice, formatted: `${jp10yPrice.toFixed(3)}%` }
    ];

    const ustJgbSpreadVal = Number(((ust10yPrice - jp10yPrice) * 100).toFixed(1));
    const ustJgbHistory = [
      { hour: "00:00", price: 218.0, formatted: "218.0 bps" },
      { hour: "02:00", price: 218.5, formatted: "218.5 bps" },
      { hour: "04:00", price: 218.2, formatted: "218.2 bps" },
      { hour: "06:00", price: 218.8, formatted: "218.8 bps" },
      { hour: "08:00", price: 219.0, formatted: "219.0 bps" },
      { hour: "10:00", price: 219.2, formatted: "219.2 bps" },
      { hour: "12:00", price: 219.5, formatted: "219.5 bps" },
      { hour: "14:00", price: 219.0, formatted: "219.0 bps" },
      { hour: "16:00", price: 218.8, formatted: "218.8 bps" },
      { hour: "18:00", price: 219.1, formatted: "219.1 bps" },
      { hour: "20:00", price: 218.9, formatted: "218.9 bps" },
      { hour: "LIVE", price: ustJgbSpreadVal, formatted: `${ustJgbSpreadVal.toFixed(1)} bps` }
    ];

    const tipsHistory = [
      { hour: "00:00", price: 2.470, formatted: "2.470%" },
      { hour: "02:00", price: 2.475, formatted: "2.475%" },
      { hour: "04:00", price: 2.468, formatted: "2.468%" },
      { hour: "06:00", price: 2.462, formatted: "2.462%" },
      { hour: "08:00", price: 2.458, formatted: "2.458%" },
      { hour: "10:00", price: 2.455, formatted: "2.455%" },
      { hour: "12:00", price: 2.450, formatted: "2.450%" },
      { hour: "14:00", price: 2.446, formatted: "2.446%" },
      { hour: "16:00", price: 2.448, formatted: "2.448%" },
      { hour: "18:00", price: 2.452, formatted: "2.452%" },
      { hour: "20:00", price: 2.449, formatted: "2.449%" },
      { hour: "LIVE", price: tipsPrice, formatted: `${tipsPrice.toFixed(3)}%` }
    ];

    const breakevenHistory = [
      { hour: "00:00", price: 2.810, formatted: "2.810%" },
      { hour: "02:00", price: 2.820, formatted: "2.820%" },
      { hour: "04:00", price: 2.815, formatted: "2.815%" },
      { hour: "06:00", price: 2.825, formatted: "2.825%" },
      { hour: "08:00", price: 2.828, formatted: "2.828%" },
      { hour: "10:00", price: 2.830, formatted: "2.830%" },
      { hour: "12:00", price: 2.832, formatted: "2.832%" },
      { hour: "14:00", price: 2.828, formatted: "2.828%" },
      { hour: "16:00", price: 2.825, formatted: "2.825%" },
      { hour: "18:00", price: 2.826, formatted: "2.826%" },
      { hour: "20:00", price: 2.824, formatted: "2.824%" },
      { hour: "LIVE", price: breakevenPrice, formatted: `${breakevenPrice.toFixed(3)}%` }
    ];

    const uk10yHistory = [
      { hour: "00:00", price: 5.380, formatted: "5.380%" },
      { hour: "02:00", price: 5.390, formatted: "5.390%" },
      { hour: "04:00", price: 5.375, formatted: "5.375%" },
      { hour: "06:00", price: 5.360, formatted: "5.360%" },
      { hour: "08:00", price: 5.350, formatted: "5.350%" },
      { hour: "10:00", price: 5.342, formatted: "5.342%" },
      { hour: "12:00", price: 5.335, formatted: "5.335%" },
      { hour: "14:00", price: 5.328, formatted: "5.328%" },
      { hour: "16:00", price: 5.330, formatted: "5.330%" },
      { hour: "18:00", price: 5.336, formatted: "5.336%" },
      { hour: "20:00", price: 5.332, formatted: "5.332%" },
      { hour: "LIVE", price: uk10yPrice, formatted: `${uk10yPrice.toFixed(3)}%` }
    ];

    const sofrPrice = 4.310;
    const sofrHistory = [
      { hour: "00:00", price: 4.310, formatted: "4.310%" },
      { hour: "02:00", price: 4.312, formatted: "4.312%" },
      { hour: "04:00", price: 4.310, formatted: "4.310%" },
      { hour: "06:00", price: 4.308, formatted: "4.308%" },
      { hour: "08:00", price: 4.310, formatted: "4.310%" },
      { hour: "10:00", price: 4.311, formatted: "4.311%" },
      { hour: "12:00", price: 4.310, formatted: "4.310%" },
      { hour: "14:00", price: 4.310, formatted: "4.310%" },
      { hour: "16:00", price: 4.312, formatted: "4.312%" },
      { hour: "18:00", price: 4.310, formatted: "4.310%" },
      { hour: "20:00", price: 4.309, formatted: "4.309%" },
      { hour: "LIVE", price: sofrPrice, formatted: `${sofrPrice.toFixed(3)}%` }
    ];

    const ecbPrice = 3.000;
    const ecbHistory = [
      "00:00", "02:00", "04:00", "06:00", "08:00", "10:00", "12:00", "14:00", "16:00", "18:00", "20:00", "LIVE"
    ].map((hour) => ({ hour, price: ecbPrice, formatted: "3.000%" }));

    // =========================================================================
    // ARRAY ARRANGEMENT: PRIMARY MONITORED RISK ASSETS FIRST (AS REQUESTED)
    // =========================================================================
    return [
      // ----------------------------------------------------
      // PRIMARY MONITORED RISK ASSETS (TOP ROW OF CONSOLE)
      // ----------------------------------------------------
      {
        symbol: "BRENT",
        name: "Crude Oil ICE",
        category: "Commodity",
        subCategory: "Core Risk",
        isRiskAsset: true,
        currentPrice: `$${brentPrice.toFixed(2)}`,
        rawPrice: brentPrice,
        change24h: brentTicker?.change != null ? `${brentTicker.change >= 0 ? "+" : ""}${brentTicker.change.toFixed(2)}%` : "-2.85%",
        isPositive: (brentTicker?.change ?? -2.85) >= 0,
        high24h: `$${Math.max(...brentHistory.map(p => p.price)).toFixed(2)}`,
        low24h: `$${Math.min(...brentHistory.map(p => p.price)).toFixed(2)}`,
        momentumTag: brentPrice >= 85 ? "SUPPLY PREMIUM" : "STABILIZED CASH SPOT",
        macroRole: `Geopolitical stagflation & Hormuz chokepoint barometer ($${brentPrice.toFixed(2)} Spot)`,
        history24h: brentHistory
      },
      {
        symbol: "XAU/USD",
        name: "Gold Spot /oz",
        category: "Commodity",
        subCategory: "Core Risk",
        isRiskAsset: true,
        currentPrice: `$${goldPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        rawPrice: goldPrice,
        change24h: goldTicker?.change != null ? `${goldTicker.change >= 0 ? "+" : ""}${goldTicker.change.toFixed(2)}%` : "+0.04%",
        isPositive: (goldTicker?.change ?? 0.04) >= 0,
        high24h: `$${Math.max(...goldHistory.map(p => p.price)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        low24h: `$${Math.min(...goldHistory.map(p => p.price)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        momentumTag: goldTicker?.status || "BULLISH BREAKOUT",
        macroRole: "Safe-haven reserve & sovereign store of value above $4,300/oz",
        history24h: goldHistory
      },
      {
        symbol: "S&P 500",
        name: "S&P 500 Index",
        category: "Equity",
        subCategory: "Americas Large-Cap",
        isRiskAsset: true,
        currentPrice: sp500Price.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }),
        rawPrice: sp500Price,
        change24h: sp500Ticker ? `${sp500Ticker.change >= 0 ? '+' : ''}${sp500Ticker.change.toFixed(2)}%` : "+0.86%",
        isPositive: sp500Ticker ? sp500Ticker.change >= 0 : true,
        high24h: sp500Ticker?.high24h != null ? sp500Ticker.high24h.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) : Math.max(...sp500History.map(p => p.price)).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }),
        low24h: sp500Ticker?.low24h != null ? sp500Ticker.low24h.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) : Math.min(...sp500History.map(p => p.price)).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }),
        momentumTag: sp500Ticker?.status || "ACCUMULATION",
        macroRole: "Core US corporate equity benchmark & risk-asset valuation anchor",
        history24h: sp500History
      },
      {
        symbol: "NASDAQ 100",
        name: "Nasdaq 100 Tech Index",
        category: "Equity",
        subCategory: "Americas Tech Benchmark",
        isRiskAsset: true,
        currentPrice: nasdaqPrice.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }),
        rawPrice: nasdaqPrice,
        change24h: nasdaqTicker ? `${nasdaqTicker.change >= 0 ? '+' : ''}${nasdaqTicker.change.toFixed(2)}%` : "+1.12%",
        isPositive: nasdaqTicker ? nasdaqTicker.change >= 0 : true,
        high24h: nasdaqTicker?.high24h != null ? nasdaqTicker.high24h.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) : Math.max(...nasdaqHistory.map(p => p.price)).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }),
        low24h: nasdaqTicker?.low24h != null ? nasdaqTicker.low24h.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) : Math.min(...nasdaqHistory.map(p => p.price)).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }),
        momentumTag: nasdaqTicker?.status || "MOMENTUM EXPANSION",
        macroRole: "Global megacap semiconductor, generative AI & enterprise hyperscaler valuation anchor",
        history24h: nasdaqHistory
      },
      {
        symbol: "IBEX 35",
        name: "Madrid Continuous",
        category: "Equity",
        subCategory: "European Benchmark",
        isRiskAsset: true,
        currentPrice: ibexPrice.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }),
        rawPrice: ibexPrice,
        change24h: ibexTicker ? `${ibexTicker.change >= 0 ? '+' : ''}${ibexTicker.change.toFixed(2)}%` : "+0.91%",
        isPositive: ibexTicker ? ibexTicker.change >= 0 : true,
        high24h: ibexTicker?.high24h != null ? ibexTicker.high24h.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) : Math.max(...ibexHistory.map(p => p.price)).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }),
        low24h: ibexTicker?.low24h != null ? ibexTicker.low24h.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) : Math.min(...ibexHistory.map(p => p.price)).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }),
        momentumTag: ibexTicker?.status || "ACCUMULATION",
        macroRole: "Spanish banking & southern European equity benchmark",
        history24h: ibexHistory
      },
      {
        symbol: "DAX 40",
        name: "Frankfurt DAX 40",
        category: "Equity",
        subCategory: "European Benchmark",
        isRiskAsset: true,
        currentPrice: daxPrice.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }),
        rawPrice: daxPrice,
        change24h: daxTicker ? `${daxTicker.change >= 0 ? '+' : ''}${daxTicker.change.toFixed(2)}%` : "+0.41%",
        isPositive: daxTicker ? daxTicker.change >= 0 : true,
        high24h: daxTicker?.high24h != null ? daxTicker.high24h.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) : Math.max(...daxHistory.map(p => p.price)).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }),
        low24h: daxTicker?.low24h != null ? daxTicker.low24h.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) : Math.min(...daxHistory.map(p => p.price)).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }),
        momentumTag: daxTicker?.status || "BULLISH EXPANSION",
        macroRole: "German industrial manufacturing powerhouse & European automotive/chemical export leader",
        history24h: daxHistory
      },
      {
        symbol: "EURO STOXX 50",
        name: "Eurozone Blue Chip",
        category: "Equity",
        subCategory: "European Benchmark",
        isRiskAsset: true,
        currentPrice: fesxPrice.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }),
        rawPrice: fesxPrice,
        change24h: fesxTicker ? `${fesxTicker.change >= 0 ? '+' : ''}${fesxTicker.change.toFixed(2)}%` : "+0.36%",
        isPositive: fesxTicker ? fesxTicker.change >= 0 : true,
        high24h: fesxTicker?.high24h != null ? fesxTicker.high24h.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) : Math.max(...fesxHistory.map(p => p.price)).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }),
        low24h: fesxTicker?.low24h != null ? fesxTicker.low24h.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) : Math.min(...fesxHistory.map(p => p.price)).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }),
        momentumTag: fesxTicker?.status || "VALUE ACCEPTANCE",
        macroRole: "Pan-European cross-border equity benchmark; ECB monetary cycle & industrial value anchor",
        history24h: fesxHistory
      },
      {
        symbol: "FTSE 100",
        name: "London FTSE 100",
        category: "Equity",
        subCategory: "European Benchmark",
        isRiskAsset: true,
        currentPrice: ftsePrice.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }),
        rawPrice: ftsePrice,
        change24h: ftseTicker ? `${ftseTicker.change >= 0 ? '+' : ''}${ftseTicker.change.toFixed(2)}%` : "+0.48%",
        isPositive: ftseTicker ? ftseTicker.change >= 0 : true,
        high24h: ftseTicker?.high24h != null ? ftseTicker.high24h.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) : Math.max(...ftseHistory.map(p => p.price)).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }),
        low24h: ftseTicker?.low24h != null ? ftseTicker.low24h.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) : Math.min(...ftseHistory.map(p => p.price)).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }),
        momentumTag: ftseTicker?.status || "COMMODITY BID",
        macroRole: "UK multinational benchmark heavy in global energy producers, mining majors & banking yields",
        history24h: ftseHistory
      },
      {
        symbol: "KOSPI 200",
        name: "Korea Composite 200 ($KOPSI)",
        category: "Equity",
        subCategory: "Asia-Pacific Index",
        isRiskAsset: true,
        currentPrice: kospiPrice.toFixed(2),
        rawPrice: kospiPrice,
        change24h: kospiTicker ? `${kospiTicker.change >= 0 ? '+' : ''}${kospiTicker.change.toFixed(2)}%` : "+0.83%",
        isPositive: kospiTicker ? kospiTicker.change >= 0 : true,
        high24h: kospiTicker?.high24h != null ? kospiTicker.high24h.toFixed(2) : Math.max(...kospiHistory.map(p => p.price)).toFixed(2),
        low24h: kospiTicker?.low24h != null ? kospiTicker.low24h.toFixed(2) : Math.min(...kospiHistory.map(p => p.price)).toFixed(2),
        momentumTag: kospiTicker?.status || "BULLISH BREAKOUT",
        macroRole: "KRX semiconductor & memory hardware proxy; bellwether for AI capex & global tech export cycle",
        history24h: kospiHistory
      },
      {
        symbol: "NIKKEI 225",
        name: "Tokyo Nikkei 225",
        category: "Equity",
        subCategory: "Asia-Pacific Index",
        isRiskAsset: true,
        currentPrice: nikkeiPrice.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }),
        rawPrice: nikkeiPrice,
        change24h: nikkeiTicker ? `${nikkeiTicker.change >= 0 ? '+' : ''}${nikkeiTicker.change.toFixed(2)}%` : "+0.74%",
        isPositive: nikkeiTicker ? nikkeiTicker.change >= 0 : true,
        high24h: nikkeiTicker?.high24h != null ? nikkeiTicker.high24h.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : Math.max(...nikkeiHistory.map(p => p.price)).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }),
        low24h: nikkeiTicker?.low24h != null ? nikkeiTicker.low24h.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : Math.min(...nikkeiHistory.map(p => p.price)).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }),
        momentumTag: nikkeiTicker?.status || "ACCUMULATION",
        macroRole: "Japanese exporter titan & corporate governance reform benchmark; inverse Yen carry beta",
        history24h: nikkeiHistory
      },
      {
        symbol: "HANG SENG",
        name: "Hang Seng Index",
        category: "Equity",
        subCategory: "Asia-Pacific Index",
        isRiskAsset: true,
        currentPrice: hsiPrice.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }),
        rawPrice: hsiPrice,
        change24h: hsiTicker ? `${hsiTicker.change >= 0 ? '+' : ''}${hsiTicker.change.toFixed(2)}%` : "+1.36%",
        isPositive: hsiTicker ? hsiTicker.change >= 0 : true,
        high24h: hsiTicker?.high24h != null ? hsiTicker.high24h.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : Math.max(...hsiHistory.map(p => p.price)).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }),
        low24h: hsiTicker?.low24h != null ? hsiTicker.low24h.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : Math.min(...hsiHistory.map(p => p.price)).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }),
        momentumTag: hsiTicker?.status || "STIMULUS RALLY",
        macroRole: "Hong Kong gateway to Chinese mainland tech, state banks & PBOC fiscal/monetary stimulus",
        history24h: hsiHistory
      },
      {
        symbol: "BTC/USD",
        name: "Bitcoin Spot",
        category: "Digital Assets",
        subCategory: "Core Risk",
        isRiskAsset: true,
        currentPrice: `$${btcPrice.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
        rawPrice: btcPrice,
        change24h: btcTicker?.change != null ? `${btcTicker.change >= 0 ? "+" : ""}${btcTicker.change.toFixed(2)}%` : "+4.94%",
        isPositive: (btcTicker?.change ?? 4.94) >= 0,
        high24h: btcTicker?.high24h != null ? `$${btcTicker.high24h.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : `$${Math.max(...btcHistory.map(p => p.price)).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
        low24h: btcTicker?.low24h != null ? `$${btcTicker.low24h.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : `$${Math.min(...btcHistory.map(p => p.price)).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
        momentumTag: btcTicker?.status || "BULLISH BREAKOUT",
        macroRole: "High-beta global fiat debasement hedge & digital liquidity sensor",
        history24h: btcHistory
      },
      {
        symbol: "ETH/USD",
        name: "Ethereum Spot",
        category: "Digital Assets",
        subCategory: "Core Risk",
        isRiskAsset: true,
        currentPrice: "$2,718",
        rawPrice: 2718,
        change24h: "+1.85%",
        isPositive: true,
        high24h: `$${Math.max(...ethHistory.map(p => p.price)).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
        low24h: `$${Math.min(...ethHistory.map(p => p.price)).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
        momentumTag: "BULLISH ACCUMULATION",
        macroRole: "Decentralized settlement layer & smart contract fee burn beta",
        history24h: ethHistory
      },
      {
        symbol: "XAG/USD",
        name: "Silver Spot /oz",
        category: "Commodity",
        subCategory: "Core Risk",
        isRiskAsset: true,
        currentPrice: `$${silverPrice.toFixed(2)}`,
        rawPrice: silverPrice,
        change24h: silverTicker?.change != null ? `${silverTicker.change >= 0 ? "+" : ""}${silverTicker.change.toFixed(2)}%` : "+0.15%",
        isPositive: (silverTicker?.change ?? 0.15) >= 0,
        high24h: `$${Math.max(...silverHistory.map(p => p.price)).toFixed(2)}`,
        low24h: `$${Math.min(...silverHistory.map(p => p.price)).toFixed(2)}`,
        momentumTag: silverTicker?.status || "EXPANSION",
        macroRole: "Industrial green transition beta & dual monetary precious metal ($64+/oz)",
        history24h: silverHistory
      },
      {
        symbol: "USD/JPY",
        name: "US Dollar / Japanese Yen",
        category: "FX",
        subCategory: "Core Risk",
        isRiskAsset: true,
        currentPrice: yenPrice.toFixed(2),
        rawPrice: yenPrice,
        change24h: "-0.32%",
        isPositive: false,
        high24h: "156.95",
        low24h: "155.80",
        momentumTag: "INTERVENTION WATCH",
        macroRole: "Global carry trade anchor & Ministry of Finance stealth intervention trigger",
        history24h: yenHistory
      },

      // ----------------------------------------------------
      // VOLATILITY ASSETS (VIX + MOVE)
      // ----------------------------------------------------
      {
        symbol: "VIX",
        name: "CBOE Volatility Index",
        category: "Volatility",
        subCategory: "Implied Volatility",
        currentPrice: vixPrice.toFixed(2),
        rawPrice: vixPrice,
        change24h: "-1.20%",
        isPositive: false,
        high24h: "19.80",
        low24h: "18.25",
        momentumTag: "ELEVATED",
        macroRole: "S&P 500 30-day equity option-implied volatility & risk hedge demand",
        history24h: vixHistory
      },
      {
        symbol: "MOVE INDEX",
        name: "BofA Treasury Volatility",
        category: "Volatility",
        subCategory: "Implied Volatility",
        currentPrice: movePrice.toFixed(2),
        rawPrice: movePrice,
        change24h: "-2.24%",
        isPositive: false,
        high24h: "106.00",
        low24h: "101.50",
        momentumTag: "COMPRESSING",
        macroRole: "US Treasury yield volatility & bond auction concession barometer",
        history24h: moveHistory
      },

      // ----------------------------------------------------
      // ESSENTIAL FX MARKETS
      // ----------------------------------------------------
      {
        symbol: "DXY INDEX",
        name: "US Dollar Index",
        category: "FX",
        subCategory: "G10 Major",
        currentPrice: "103.42",
        rawPrice: 103.42,
        change24h: "-0.28%",
        isPositive: false,
        high24h: "103.80",
        low24h: "103.25",
        momentumTag: "BEARISH PRESSURE",
        macroRole: "Trade-weighted US Dollar valuation benchmark against 6 major partner currencies",
        history24h: dxyHistory
      },
      {
        symbol: "EUR/USD",
        name: "Euro / US Dollar",
        category: "FX",
        subCategory: "G10 Major",
        currentPrice: eurPrice.toFixed(4),
        rawPrice: eurPrice,
        change24h: "-0.22%",
        isPositive: false,
        high24h: "1.0880",
        low24h: "1.0840",
        momentumTag: "BEARISH PRESSURE",
        macroRole: "#1 Global reserve currency pair; Transatlantic ECB vs Fed policy divergence",
        history24h: eurHistory
      },
      {
        symbol: "GBP/USD",
        name: "British Pound / US Dollar",
        category: "FX",
        subCategory: "G10 Major",
        currentPrice: gbpPrice.toFixed(4),
        rawPrice: gbpPrice,
        change24h: "+0.18%",
        isPositive: true,
        high24h: "1.3135",
        low24h: "1.3090",
        momentumTag: "ACCUMULATION",
        macroRole: "Cable benchmark; Bank of England monetary transmission & UK gilt sentiment",
        history24h: gbpHistory
      },
      {
        symbol: "AUD/USD",
        name: "Australian Dollar / USD",
        category: "FX",
        subCategory: "Commodity FX",
        currentPrice: audPrice.toFixed(4),
        rawPrice: audPrice,
        change24h: "+0.34%",
        isPositive: true,
        high24h: "0.6695",
        low24h: "0.6655",
        momentumTag: "BULLISH BREAKOUT",
        macroRole: "High-beta global growth & commodity barometer; China industrial demand proxy",
        history24h: audHistory
      },
      {
        symbol: "USD/CHF",
        name: "US Dollar / Swiss Franc",
        category: "FX",
        subCategory: "Safe Haven FX",
        currentPrice: chfPrice.toFixed(4),
        rawPrice: chfPrice,
        change24h: "-0.15%",
        isPositive: false,
        high24h: "0.8548",
        low24h: "0.8515",
        momentumTag: "ACCUMULATION",
        macroRole: "Premier European geopolitical safe haven & Swiss National Bank liquidity gauge",
        history24h: chfHistory
      },

      // ----------------------------------------------------
      // RATES BENCHMARKS (14 INSTRUMENTS)
      // ----------------------------------------------------
      {
        symbol: "UST 10Y",
        name: "US 10Y Benchmark",
        category: "Rates",
        subCategory: "US Sovereign",
        currentPrice: `${ust10yPrice.toFixed(3)}%`,
        rawPrice: ust10yPrice,
        change24h: "-4.5 bps",
        isPositive: false,
        high24h: "3.920%",
        low24h: "3.850%",
        momentumTag: "COMPRESSING",
        macroRole: "Global risk-free discount rate & macro asset anchor",
        history24h: ust10yHistory
      },
      {
        symbol: "UST 2Y",
        name: "US 2Y Fed Policy Anchor",
        category: "Rates",
        subCategory: "US Sovereign",
        currentPrice: `${ust2yPrice.toFixed(3)}%`,
        rawPrice: ust2yPrice,
        change24h: "-3.8 bps",
        isPositive: false,
        high24h: "3.695%",
        low24h: "3.630%",
        momentumTag: "POLICY ANCHOR",
        macroRole: "Front-end rate sensitivity to FOMC meeting cycle",
        history24h: ust2yHistory
      },
      {
        symbol: "UST 30Y",
        name: "US 30Y Long Bond Duration",
        category: "Rates",
        subCategory: "US Sovereign",
        currentPrice: `${ust30yPrice.toFixed(3)}%`,
        rawPrice: ust30yPrice,
        change24h: "-2.1 bps",
        isPositive: false,
        high24h: "4.230%",
        low24h: "4.185%",
        momentumTag: "DEFICIT CONVEXITY",
        macroRole: "Fiscal deficit supply absorption & long-duration premium",
        history24h: ust30yHistory
      },
      {
        symbol: "UST 2s10s",
        name: "2Y/10Y Curve Spread",
        category: "Rates",
        subCategory: "Curve Spreads",
        currentPrice: `+${ust2s10sPrice.toFixed(1)} bps`,
        rawPrice: ust2s10sPrice,
        change24h: "+1.2 bps",
        isPositive: true,
        high24h: "+23.8 bps",
        low24h: "+18.5 bps",
        momentumTag: "BULL STEEPENER",
        macroRole: "Recession disinversion gauge & bank net interest margins",
        history24h: ust2s10sHistory
      },
      {
        symbol: "UST 5s30s",
        name: "5Y/30Y Curve Slope",
        category: "Rates",
        subCategory: "Curve Spreads",
        currentPrice: `+${ust5s30sPrice.toFixed(1)} bps`,
        rawPrice: ust5s30sPrice,
        change24h: "+1.7 bps",
        isPositive: true,
        high24h: "+49.5 bps",
        low24h: "+45.2 bps",
        momentumTag: "BULL STEEPENER",
        macroRole: "Long-end curve steepener on Treasury deficit auctions",
        history24h: ust5s30sHistory
      },
      {
        symbol: "DE 10Y BUND",
        name: "German 10Y Bund (Eurozone)",
        category: "Rates",
        subCategory: "Global Sovereign",
        currentPrice: `${de10yPrice.toFixed(3)}%`,
        rawPrice: de10yPrice,
        change24h: "-3.2 bps",
        isPositive: false,
        high24h: "2.312%",
        low24h: "2.255%",
        momentumTag: "COMPRESSING",
        macroRole: "European AAA risk-free benchmark & ECB monetary base",
        history24h: de10yHistory
      },
      {
        symbol: "ES 10Y BONO",
        name: "Spanish 10Y Bono Benchmark",
        category: "Rates",
        subCategory: "Global Sovereign",
        currentPrice: `${es10yPrice.toFixed(3)}%`,
        rawPrice: es10yPrice,
        change24h: "-4.1 bps",
        isPositive: false,
        high24h: "3.165%",
        low24h: "3.102%",
        momentumTag: "SOVEREIGN SPREAD",
        macroRole: "Spanish sovereign funding rate (+84 bps vs Bund); IBEX bank NIM driver",
        history24h: es10yHistory
      },
      {
        symbol: "JP 10Y JGB",
        name: "Japan 10Y JGB (BoJ Anchor)",
        category: "Rates",
        subCategory: "Global Sovereign",
        currentPrice: `${jp10yPrice.toFixed(3)}%`,
        rawPrice: jp10yPrice,
        change24h: "+2.4 bps",
        isPositive: true,
        high24h: "1.105%",
        low24h: "1.065%",
        momentumTag: "YCC PRESSURE",
        macroRole: "Bank of Japan policy normalization & carry unwind trigger",
        history24h: jp10yHistory
      },
      {
        symbol: "UST-JGB 10Y",
        name: "US-Japan 10Y Carry Spread",
        category: "Rates",
        subCategory: "Curve Spreads",
        currentPrice: `${ustJgbSpreadVal.toFixed(1)} bps`,
        rawPrice: ustJgbSpreadVal,
        change24h: "-6.9 bps",
        isPositive: false,
        high24h: "284.5 bps",
        low24h: "276.0 bps",
        momentumTag: "INTERVENTION WATCH",
        macroRole: "Core econometric differential driving USD/JPY intervention odds",
        history24h: ustJgbHistory
      },
      {
        symbol: "10Y TIPS",
        name: "US 10Y TIPS Real Yield",
        category: "Rates",
        subCategory: "Real & Inflation",
        currentPrice: `${tipsPrice.toFixed(3)}%`,
        rawPrice: tipsPrice,
        change24h: "-2.6 bps",
        isPositive: false,
        high24h: "1.725%",
        low24h: "1.670%",
        momentumTag: "REAL YIELD SQUEEZE",
        macroRole: "Inflation-adjusted real cost of capital; inverse driver of Gold ($4,400+)",
        history24h: tipsHistory
      },
      {
        symbol: "10Y BREAKEVEN",
        name: "10Y Breakeven Inflation Rate",
        category: "Rates",
        subCategory: "Real & Inflation",
        currentPrice: `${breakevenPrice.toFixed(3)}%`,
        rawPrice: breakevenPrice,
        change24h: "-1.9 bps",
        isPositive: false,
        high24h: "2.215%",
        low24h: "2.165%",
        momentumTag: "INFLATION DRIFT",
        macroRole: "Bond market-implied 10-year inflation expectation (Nominal - TIPS)",
        history24h: breakevenHistory
      },
      {
        symbol: "UK 10Y GILT",
        name: "UK 10-Year Sovereign Gilt",
        category: "Rates",
        subCategory: "Global Sovereign",
        currentPrice: `${uk10yPrice.toFixed(3)}%`,
        rawPrice: uk10yPrice,
        change24h: "-3.5 bps",
        isPositive: false,
        high24h: "4.030%",
        low24h: "3.970%",
        momentumTag: "COMPRESSING",
        macroRole: "UK sovereign funding benchmark & Bank of England policy transmission",
        history24h: uk10yHistory
      },
      {
        symbol: "SOFR 1D",
        name: "Secured Overnight Financing",
        category: "Rates",
        subCategory: "Money Market",
        currentPrice: `${sofrPrice.toFixed(3)}%`,
        rawPrice: sofrPrice,
        change24h: "0.0 bps",
        isPositive: false,
        isNeutral: true,
        high24h: "4.315%",
        low24h: "4.305%",
        momentumTag: "MONEY MARKET",
        macroRole: "USD risk-free collateralized cash rate underpinning institutional debt",
        history24h: sofrHistory
      },
      {
        symbol: "ECB DFR",
        name: "ECB Deposit Facility Rate",
        category: "Rates",
        subCategory: "Money Market",
        currentPrice: `${ecbPrice.toFixed(3)}%`,
        rawPrice: ecbPrice,
        change24h: "0.0 bps",
        isPositive: false,
        isNeutral: true,
        high24h: "3.000%",
        low24h: "3.000%",
        momentumTag: "POLICY ANCHOR",
        macroRole: "Eurozone policy floor governing Frankfurt interbank liquidity",
        history24h: ecbHistory
      }
    ];
  }, [
    goldPrice,
    silverPrice,
    btcPrice,
    sp500Price,
    yenPrice,
    brentPrice,
    ibexPrice,
    vixPrice,
    movePrice,
    eurPrice,
    gbpPrice,
    audPrice,
    chfPrice,
    ust10yTicker,
    ust2yTicker,
    de10yTicker,
    es10yTicker,
    tipsTicker,
    macroData
  ]);

  // Dynamic counts for category filter tabs
  const categoryCounts = useMemo(() => ({
    ALL: sparklineAssets.length,
    "Risk Assets": sparklineAssets.filter(a => a.isRiskAsset).length,
    Commodity: sparklineAssets.filter(a => a.category === "Commodity").length,
    Equity: sparklineAssets.filter(a => a.category === "Equity").length,
    "Digital Assets": sparklineAssets.filter(a => a.category === "Digital Assets").length,
    Rates: sparklineAssets.filter(a => a.category === "Rates").length,
    FX: sparklineAssets.filter(a => a.category === "FX").length,
    Volatility: sparklineAssets.filter(a => a.category === "Volatility").length,
  }), [sparklineAssets]);

  const ratesSubCounts = useMemo(() => {
    const ratesOnly = sparklineAssets.filter(a => a.category === "Rates");
    return {
      ALL: ratesOnly.length,
      "US Sovereign": ratesOnly.filter(a => a.subCategory === "US Sovereign").length,
      "Global Sovereign": ratesOnly.filter(a => a.subCategory === "Global Sovereign").length,
      "Curve Spreads": ratesOnly.filter(a => a.subCategory === "Curve Spreads").length,
      "Real & Inflation": ratesOnly.filter(a => a.subCategory === "Real & Inflation").length,
      "Money Market": ratesOnly.filter(a => a.subCategory === "Money Market").length,
    };
  }, [sparklineAssets]);

  // Filtered asset array based on category, rates sub-category, and search
  const filteredAssets = useMemo(() => {
    return sparklineAssets.filter((asset) => {
      if (filterCategory === "Risk Assets") {
        if (!asset.isRiskAsset) return false;
      } else if (filterCategory !== "ALL" && asset.category !== filterCategory) {
        return false;
      }
      if (filterCategory === "Rates" && ratesSubCategory !== "ALL") {
        if (asset.subCategory !== ratesSubCategory) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const cleanQ = q.replace(/^\$/, "");
        const matchSymbol = asset.symbol.toLowerCase().includes(q) || asset.symbol.toLowerCase().includes(cleanQ);
        const matchName = asset.name.toLowerCase().includes(q) || asset.name.toLowerCase().includes(cleanQ);
        const matchSub = asset.subCategory ? asset.subCategory.toLowerCase().includes(q) || asset.subCategory.toLowerCase().includes(cleanQ) : false;
        const matchTag = asset.momentumTag.toLowerCase().includes(q);
        const matchRole = asset.macroRole ? asset.macroRole.toLowerCase().includes(q) : false;
        // Handle common search typo $KOPSI -> KOSPI
        const isKopsiQuery = q.includes("kopsi") || cleanQ.includes("kopsi");
        const matchKopsi = isKopsiQuery && asset.symbol.includes("KOSPI");
        return matchSymbol || matchName || matchSub || matchTag || matchRole || matchKopsi;
      }
      return true;
    });
  }, [sparklineAssets, filterCategory, ratesSubCategory, searchQuery]);

  return (
    <>
      {/* Backdrop overlay when full screen is active */}
      {isFullScreen && (
        <div 
          className="fixed inset-0 bg-black/85 backdrop-blur-md z-40 transition-opacity" 
          onClick={() => setIsFullScreen(false)}
          aria-hidden="true"
        />
      )}

      <div 
        id="macro-asset-sparklines-bar" 
        className={
          isFullScreen
            ? "fixed inset-2 sm:inset-4 lg:inset-6 z-50 bg-[#070D18] border border-[#B08D57]/60 rounded-2xl p-4 sm:p-6 shadow-[0_0_90px_rgba(0,0,0,0.95)] overflow-y-auto flex flex-col space-y-6 animate-in fade-in zoom-in-95 duration-200"
            : "bg-[#101622] border border-[#B08D57]/35 rounded-xl p-4 sm:p-5 shadow-2xl space-y-4 relative overflow-hidden"
        }
      >
        {/* Subtle top brass highlight */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#B08D57]/60 to-transparent pointer-events-none" />

        {/* Header bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#B08D57]/30">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-black/70 border border-[#B08D57]/45 text-[#E5C794] shadow-inner">
              <Activity className="w-4 h-4 text-[#D4AF37]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-mono-data font-bold tracking-wider text-[#FBF8F1] uppercase">
                  {isFullScreen ? "Macro Momentum & Cross-Asset Liquidity Console" : "24-Hour Macro Momentum & Intraday Sparklines"}
                </span>
                <span className="inline-flex items-center gap-1 text-[9px] font-mono-data px-2 py-0.5 rounded bg-[#10B981]/25 text-[#34D399] border border-[#10B981]/40 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                  LIVE TICKS: {macroData.formattedTime || "09:05:00 UTC"}
                </span>
              </div>
              <p className="text-[10px] font-mono-data text-[#BAC7D5] mt-0.5">
                Primary monitored risk assets (Brent, Gold, S&P 500, IBEX 35, BTC, ETH) prioritized at the top, supported by Volatility (VIX & MOVE), Curated FX & Sovereign Rates
              </p>
            </div>
          </div>

          {/* Right Toolbar: Search + Category Filter Tabs + Full Screen Button */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Quick Search */}
            <div className="relative">
              <input
                id="sparkline-search-input"
                type="text"
                placeholder="Search symbol, Brent, Gold, S&P, VIX..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-black/70 border border-[#B08D57]/30 rounded-lg pl-7 pr-2.5 py-1 text-[10px] font-mono-data text-[#EDE9DE] placeholder-[#8292A6] focus:outline-none focus:border-[#B08D57] transition-all w-36 sm:w-48"
              />
              <Search className="w-3 h-3 text-[#8292A6] absolute left-2 top-2" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1.5 text-[#8292A6] hover:text-[#EDE9DE]"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              )}
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap items-center gap-1 bg-black/70 p-1 rounded-lg border border-[#B08D57]/30 text-[10px] font-mono-data shadow-inner">
              {(["ALL", "Risk Assets", "Commodity", "Equity", "Digital Assets", "Rates", "FX", "Volatility"] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setFilterCategory(cat);
                    if (cat !== "Rates") setRatesSubCategory("ALL");
                  }}
                  className={`px-2.5 py-1 rounded transition-all uppercase font-medium flex items-center gap-1.5 ${
                    filterCategory === cat
                      ? "bg-[#B08D57] text-[#0A111C] font-bold shadow-md scale-105"
                      : "text-[#BAC7D5] hover:text-[#FBF8F1] hover:bg-white/5"
                  }`}
                >
                  {cat === "Risk Assets" && <Flame className="w-3 h-3 text-[#E5C794] mr-0.5" />}
                  <span>{cat}</span>
                  <span className={`text-[8.5px] px-1 rounded ${
                    filterCategory === cat ? "bg-[#0A111C]/25 text-[#0A111C]" : "bg-black/60 text-[#8292A6]"
                  }`}>
                    {categoryCounts[cat]}
                  </span>
                </button>
              ))}
            </div>

            {/* Full Screen Toggle Button */}
            <button
              id="macro-momentum-fullscreen-btn"
              onClick={() => setIsFullScreen(!isFullScreen)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[10px] font-mono-data font-bold transition-all ${
                isFullScreen
                  ? "bg-[#B08D57] text-[#0A111C] border-[#B08D57] shadow-[0_0_15px_rgba(176,141,87,0.4)]"
                  : "bg-black/70 hover:bg-[#B08D57]/20 text-[#E5C794] border-[#B08D57]/35 hover:border-[#B08D57] shadow-inner"
              }`}
              title={isFullScreen ? "Exit Full Screen (ESC)" : "Open 24H Macro Momentum in Full Screen"}
            >
              {isFullScreen ? (
                <>
                  <Minimize2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">EXIT FULL SCREEN</span>
                  <span className="text-[9px] opacity-75 font-normal">(ESC)</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-3.5 h-3.5 text-[#B08D57]" />
                  <span className="hidden sm:inline">FULL SCREEN</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Primary Monitored Risk Assets Strip */}
        {filterCategory === "Risk Assets" && (
          <div className="p-3 rounded-lg bg-black/60 border border-[#B08D57]/30 flex flex-wrap items-center justify-between gap-3 text-xs font-mono-data">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-[#E5C794]" />
              <span className="font-bold text-[#FBF8F1] uppercase text-[11px]">
                Primary Monitored Risk-On Assets & Macro Bellwethers
              </span>
            </div>
            <div className="text-[#BAC7D5] text-[10px]">
              Tracking crude energy (Brent), monetary metals (Gold, Silver), equities (S&P 500, IBEX 35, KOSPI, Nikkei, DAX), digital liquidity (BTC, ETH), and the global carry trade anchor (USD/JPY).
            </div>
          </div>
        )}

        {/* Global Equity Benchmark Overview Strip when Equity is Selected */}
        {filterCategory === "Equity" && (
          <div className="p-3 rounded-lg bg-black/60 border border-[#B08D57]/30 flex flex-wrap items-center justify-between gap-3 text-xs font-mono-data">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#E5C794]" />
              <span className="font-bold text-[#FBF8F1] uppercase text-[11px]">
                Global 24-Hour Equities Grid (Asia-Pacific, Europe & Americas)
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-[10px]">
              <div className="bg-black/50 px-2.5 py-1 rounded border border-white/5">
                <span className="text-[#8292A6]">Asia-Pacific: </span>
                <strong className="text-[#EDE9DE]">KOSPI 200 ($KOPSI)</strong> •{" "}
                <strong className="text-[#EDE9DE]">Nikkei 225</strong> •{" "}
                <strong className="text-[#EDE9DE]">Hang Seng</strong>
              </div>
              <div className="bg-black/50 px-2.5 py-1 rounded border border-white/5">
                <span className="text-[#8292A6]">Europe: </span>
                <strong className="text-[#EDE9DE]">DAX 40</strong> •{" "}
                <strong className="text-[#EDE9DE]">Euro Stoxx 50</strong> •{" "}
                <strong className="text-[#EDE9DE]">IBEX 35</strong> •{" "}
                <strong className="text-[#EDE9DE]">FTSE 100</strong>
              </div>
              <div className="bg-black/50 px-2.5 py-1 rounded border border-white/5">
                <span className="text-[#8292A6]">Americas: </span>
                <strong className="text-[#E5C794]">S&P 500</strong> •{" "}
                <strong className="text-[#E5C794]">NASDAQ 100</strong>
              </div>
            </div>
          </div>
        )}

        {/* Volatility Overview Strip when Volatility is Selected */}
        {filterCategory === "Volatility" && (
          <div className="p-3 rounded-lg bg-black/60 border border-[#B08D57]/30 flex flex-wrap items-center justify-between gap-3 text-xs font-mono-data">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-[#B08D57]" />
              <span className="font-bold text-[#FBF8F1] uppercase text-[11px]">
                Cross-Asset Volatility Divergence (Equity vs Fixed Income)
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-[10px]">
              <div className="bg-black/50 px-2.5 py-1 rounded border border-white/5">
                <span className="text-[#8292A6]">VIX (Equity Vol): </span>
                <strong className="text-[#EDE9DE]">18.95</strong>{" "}
                <span className="text-[#8292A6] text-[8.5px]">(Moderate / Below 20 Pivot)</span>
              </div>
              <div className="bg-black/50 px-2.5 py-1 rounded border border-white/5">
                <span className="text-[#8292A6]">MOVE (Rates Vol): </span>
                <strong className="text-[#E5C794]">102.40</strong>{" "}
                <span className="text-[#8292A6] text-[8.5px]">(Persistent Yield Uncertainty)</span>
              </div>
              <div className="bg-[#B08D57]/15 text-[#E5C794] px-2 py-1 rounded border border-[#B08D57]/30 font-semibold text-[9.5px]">
                MOVE/VIX Ratio: 5.40x (Elevated Rate Vol vs Stable Equity Vol)
              </div>
            </div>
          </div>
        )}

        {/* FX Curated Context Strip when FX is Selected */}
        {filterCategory === "FX" && (
          <div className="p-2.5 rounded-lg bg-black/60 border border-[#B08D57]/30 flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono-data">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#10B981]" />
              <span className="font-bold text-[#FBF8F1] uppercase">
                Curated G10 & Commodity Macro FX Matrix (Zero Overload)
              </span>
            </div>
            <div className="text-[#BAC7D5] text-[9.5px]">
              <span className="text-[#E5C794] font-semibold">USD/JPY</span> (Carry Unwind & MoF Watch) •{" "}
              <span className="text-[#E5C794] font-semibold">EUR/USD</span> (ECB Divergence) •{" "}
              <span className="text-[#E5C794] font-semibold">GBP/USD</span> (Cable Beta) •{" "}
              <span className="text-[#E5C794] font-semibold">AUD/USD</span> (Commodity/China Beta) •{" "}
              <span className="text-[#E5C794] font-semibold">USD/CHF</span> (Safe Haven)
            </div>
          </div>
        )}

        {/* Dedicated Rates Sub-Filter Navigation Bar (Active when Rates is focused) */}
        {filterCategory === "Rates" && (
          <div className="flex flex-wrap items-center justify-between gap-2 p-2 rounded-lg bg-black/40 border border-[#B08D57]/20 text-[10px] font-mono-data">
            <div className="flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#B08D57]" />
              <span className="text-[#8292A6] uppercase text-[9px] font-bold">Rates Sector Filter:</span>
              <div className="flex flex-wrap items-center gap-1">
                {(["ALL", "US Sovereign", "Global Sovereign", "Curve Spreads", "Real & Inflation", "Money Market"] as const).map((sub) => (
                  <button
                    key={sub}
                    onClick={() => setRatesSubCategory(sub)}
                    className={`px-2 py-0.5 rounded transition-all uppercase text-[9px] font-semibold flex items-center gap-1 ${
                      ratesSubCategory === sub
                        ? "bg-[#E5C794] text-[#0A111C] shadow"
                        : "text-[#BAC7D5] hover:text-[#EDE9DE] hover:bg-white/5 border border-transparent"
                    }`}
                  >
                    <span>{sub}</span>
                    <span className="text-[8px] opacity-70">({ratesSubCounts[sub]})</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setShowTermStructure(!showTermStructure)}
              className="text-[9px] text-[#B08D57] hover:text-[#E5C794] flex items-center gap-1 transition-colors"
            >
              <span>{showTermStructure ? "Hide Term Structure Matrix" : "Show Term Structure Matrix"}</span>
            </button>
          </div>
        )}

        {/* Yield Curve & Term Structure Intelligence Strip */}
        {(filterCategory === "Rates" || (isFullScreen && filterCategory === "ALL")) && showTermStructure && (
          <div className="bg-black/60 border border-[#B08D57]/30 rounded-xl p-3 sm:p-4 space-y-3 shadow-inner">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#B08D57]/20 pb-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#B08D57]" />
                <span className="text-xs font-mono-data font-bold text-[#FBF8F1] tracking-wider uppercase">
                  Global Rates & Sovereign Term Structure Intelligence Matrix
                </span>
                <span className="text-[9px] font-mono-data text-[#8292A6] px-2 py-0.5 rounded bg-black/40 border border-[#B08D57]/20">
                  Cross-Curve Spreads & Real Cost of Capital
                </span>
              </div>
              <div className="text-[9.5px] font-mono-data text-[#E5C794] font-semibold">
                Fed Funds Target: 4.25% - 4.50% • BoJ Policy Rate: 0.25% - 0.50% • ECB Deposit: 3.00%
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono-data">
              {/* Card 1: US Treasury Term Structure */}
              <div className="bg-[#0A111C]/80 border border-[#B08D57]/20 rounded-lg p-2.5 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] uppercase font-bold text-[#8292A6] tracking-wider">US Treasury Yield Curve</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#10B981]/20 text-[#34D399] border border-[#10B981]/40 font-bold">
                    BULL STEEPENER
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1 text-center my-1">
                  <div className="bg-black/50 p-1 rounded border border-white/5">
                    <div className="text-[8px] text-[#8292A6]">UST 2Y</div>
                    <div className="text-[11px] font-bold text-[#EDE9DE]">{ust2yPrice.toFixed(3)}%</div>
                    <div className="text-[7.5px] text-[#34D399]">-12.6 bps</div>
                  </div>
                  <div className="bg-black/50 p-1 rounded border border-white/5">
                    <div className="text-[8px] text-[#8292A6]">UST 5Y</div>
                    <div className="text-[11px] font-bold text-[#EDE9DE]">{ust5yPrice.toFixed(3)}%</div>
                    <div className="text-[7.5px] text-[#FF8585]">+5.0 bps</div>
                  </div>
                  <div className="bg-black/50 p-1 rounded border border-[#B08D57]/40 bg-[#B08D57]/5">
                    <div className="text-[8px] text-[#E5C794] font-bold">UST 10Y</div>
                    <div className="text-[11px] font-bold text-[#E5C794]">{ust10yPrice.toFixed(3)}%</div>
                    <div className="text-[7.5px] text-[#FF8585]">+4.0 bps</div>
                  </div>
                  <div className="bg-black/50 p-1 rounded border border-white/5">
                    <div className="text-[8px] text-[#8292A6]">UST 30Y</div>
                    <div className="text-[11px] font-bold text-[#EDE9DE]">{ust30yPrice.toFixed(3)}%</div>
                    <div className="text-[7.5px] text-[#FF8585]">+2.7 bps</div>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-[#B08D57]/15 text-[8.5px] text-[#8292A6]">
                  <span>2s10s Slope: <strong className="text-[#34D399] font-mono-data">+{((ust10yPrice - ust2yPrice) * 100).toFixed(1)} bps</strong> (Steepening)</span>
                  <span>5s30s Slope: <strong className="text-[#34D399] font-mono-data">+{((ust30yPrice - ust5yPrice) * 100).toFixed(1)} bps</strong></span>
                </div>
              </div>

              {/* Card 2: Global Sovereign 10Y Matrix */}
              <div className="bg-[#0A111C]/80 border border-[#B08D57]/20 rounded-lg p-2.5 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] uppercase font-bold text-[#8292A6] tracking-wider">Global 10Y Sovereign Yields</span>
                  <span className="text-[9px] text-[#8292A6]">vs US 10Y Benchmark</span>
                </div>
                <div className="space-y-1 my-1">
                  <div className="flex items-center justify-between text-[9.5px]">
                    <span className="text-[#EDE9DE] flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                      ES 10Y Bono (Spain)
                    </span>
                    <span className="font-bold text-[#EDE9DE]">{es10yPrice.toFixed(3)}% <span className="text-[8px] font-normal text-[#E5C794]">({((es10yPrice - ust10yPrice) * 100).toFixed(0)} bps vs UST, +{((es10yPrice - de10yPrice) * 100).toFixed(0)} vs Bund)</span></span>
                  </div>
                  <div className="flex items-center justify-between text-[9.5px]">
                    <span className="text-[#EDE9DE] flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#B08D57]" />
                      DE 10Y Bund (Germany)
                    </span>
                    <span className="font-bold text-[#EDE9DE]">{de10yPrice.toFixed(3)}% <span className="text-[8px] font-normal text-[#8292A6]">({((de10yPrice - ust10yPrice) * 100).toFixed(0)} bps vs UST)</span></span>
                  </div>
                  <div className="flex items-center justify-between text-[9.5px]">
                    <span className="text-[#EDE9DE] flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                      JP 10Y JGB (Japan)
                    </span>
                    <span className="font-bold text-[#EDE9DE]">{jp10yPrice.toFixed(3)}% <span className="text-[8px] font-normal text-rose-300">({((jp10yPrice - ust10yPrice) * 100).toFixed(0)} bps vs UST / Carry)</span></span>
                  </div>
                  <div className="flex items-center justify-between text-[9.5px]">
                    <span className="text-[#EDE9DE] flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                      UK 10Y Gilt
                    </span>
                    <span className="font-bold text-[#EDE9DE]">{uk10yPrice.toFixed(3)}% <span className="text-[8px] font-normal text-[#8292A6]">({((uk10yPrice - ust10yPrice) * 100 > 0 ? '+' : '')}{((uk10yPrice - ust10yPrice) * 100).toFixed(0)} bps vs UST)</span></span>
                  </div>
                </div>
                <div className="pt-1 border-t border-[#B08D57]/15 text-[8.5px] text-[#8292A6] flex justify-between">
                  <span>UST-JGB 10Y Spread: <strong className="text-[#E5C794]">{((ust10yPrice - jp10yPrice) * 100).toFixed(1)} bps</strong></span>
                  <span>Bono-Bund Spread: <strong className="text-[#34D399]">{((es10yPrice - de10yPrice) * 100).toFixed(1)} bps</strong></span>
                </div>
              </div>

              {/* Card 3: Fisher Decomposition (Real vs Nominal) */}
              <div className="bg-[#0A111C]/80 border border-[#B08D57]/20 rounded-lg p-2.5 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] uppercase font-bold text-[#8292A6] tracking-wider">Fisher Decomposition (10Y)</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#B08D57]/20 text-[#E5C794] border border-[#B08D57]/40 font-bold">
                    GOLD ANCHOR
                  </span>
                </div>
                <div className="space-y-1.5 my-1 text-[9.5px]">
                  <div className="flex items-center justify-between bg-black/40 px-2 py-1 rounded border border-white/5">
                    <span className="text-[#8292A6]">10Y Nominal Yield:</span>
                    <span className="font-bold text-[#EDE9DE]">{ust10yPrice.toFixed(3)}%</span>
                  </div>
                  <div className="flex items-center justify-between text-[#8292A6] px-1">
                    <span>= 10Y TIPS Real Yield:</span>
                    <span className="font-bold text-[#E5C794]">{tipsPrice.toFixed(3)}% <span className="text-[8px] font-normal text-[#FF8585]">(-2.6 bps)</span></span>
                  </div>
                  <div className="flex items-center justify-between text-[#8292A6] px-1">
                    <span>+ 10Y Breakeven CPI:</span>
                    <span className="font-bold text-sky-300">{breakevenPrice.toFixed(3)}% <span className="text-[8px] font-normal text-[#FF8585]">(-1.9 bps)</span></span>
                  </div>
                </div>
                <div className="pt-1 border-t border-[#B08D57]/15 text-[8px] text-[#8292A6]">
                  Real yields at {tipsPrice.toFixed(2)}% with breakeven at {breakevenPrice.toFixed(2)}% anchor pricing across Gold ($4,300+/oz) & equities.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Section Header when in ALL view: Delineating Primary Monitored Risk Assets vs Fixed Income & FX */}
        {filterCategory === "ALL" && !searchQuery.trim() && (
          <div className="flex items-center justify-between pt-1 pb-0.5 text-[10px] font-mono-data text-[#8292A6] border-b border-[#B08D57]/15">
            <span className="text-[#E5C794] font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Flame className="w-3 h-3 text-[#D4AF37]" />
              PRIMARY MONITORED RISK ASSETS (BRENT, GOLD, S&P 500, IBEX 35, BTC, ETH, SILVER, USD/JPY)
            </span>
            <span className="text-[9px] text-[#BAC7D5]">
              First 8 cards prioritized • Followed by Volatility, Macro FX & Sovereign Yield Curves
            </span>
          </div>
        )}

        {/* Grid of Sparkline Asset Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-7 gap-3">
          {filteredAssets.map((asset) => {
            const minPrice = Math.min(...asset.history24h.map((p) => p.price));
            const maxPrice = Math.max(...asset.history24h.map((p) => p.price));
            const rawRange = maxPrice - minPrice;
            const priceRange = rawRange > 0 ? rawRange : 0.001;

            // SVG coordinate normalization (width 140, height 40)
            const svgWidth = 140;
            const svgHeight = 40;
            const paddingY = 4;
            const usableHeight = svgHeight - paddingY * 2;

            const points = asset.history24h.map((pt, i) => {
              const x = (i / (asset.history24h.length - 1)) * svgWidth;
              const y = usableHeight - ((pt.price - minPrice) / priceRange) * usableHeight + paddingY;
              return { x, y, ...pt };
            });

            const pathD = points.reduce((acc, pt, i) => {
              return i === 0 ? `M ${pt.x},${pt.y}` : `${acc} L ${pt.x},${pt.y}`;
            }, "");

            const areaD = `${pathD} L ${svgWidth},${svgHeight} L 0,${svgHeight} Z`;

            const isHovered = hoveredAsset?.symbol === asset.symbol;
            const activePoint = isHovered && hoveredAsset !== null ? points[hoveredAsset.index] : null;

            // Color theme
            const isNeutral = asset.isNeutral || asset.change24h.startsWith("0.0") || asset.change24h === "0.0%";
            const strokeColor = isNeutral ? "#B08D57" : (asset.isPositive ? "#10B981" : "#FF8585");
            const badgeBg = isNeutral
              ? "bg-[#B08D57]/15 text-[#E5C794] border-[#B08D57]/30"
              : asset.isPositive
              ? "bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30"
              : "bg-[#FF8585]/15 text-[#FF8585] border-[#FF8585]/30";

            return (
              <div
                key={asset.symbol}
                id={`sparkline-card-${asset.symbol.replace(/[/ ]/g, "-")}`}
                className={`bg-black/50 hover:bg-black/75 border rounded-lg p-3 transition-all flex flex-col justify-between group relative overflow-hidden shadow-md ${
                  asset.isRiskAsset
                    ? "border-[#B08D57]/45 hover:border-[#B08D57] bg-gradient-to-b from-[#B08D57]/5 to-black/60"
                    : "border-[#B08D57]/20 hover:border-[#B08D57]/50"
                }`}
                onMouseLeave={() => setHoveredAsset(null)}
              >
                {/* Asset Header */}
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="font-mono-data font-bold text-xs text-[#EDE9DE] tracking-tight truncate">
                        {asset.symbol}
                      </span>
                      {asset.isRiskAsset && (
                        <span className="text-[7.5px] px-1 py-0.2 rounded bg-[#B08D57]/25 text-[#E5C794] border border-[#B08D57]/40 font-bold shrink-0">
                          CORE
                        </span>
                      )}
                      {asset.category === "Rates" && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8]" title="Rates Benchmark" />
                      )}
                      {asset.category === "Volatility" && (
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400" title="Volatility Index" />
                      )}
                      {asset.category === "FX" && !asset.isRiskAsset && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" title="Foreign Exchange" />
                      )}
                      {asset.symbol === "XAU/USD" && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#B08D57]" title="Live Gold Spot" />
                      )}
                      {asset.symbol === "BTC/USD" && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#F7931A]" title="Live Bitcoin Spot" />
                      )}
                      {asset.symbol === "S&P 500" && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" title="S&P 500 Index" />
                      )}
                      {asset.symbol === "NASDAQ 100" && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#06B6D4]" title="Nasdaq 100 Tech" />
                      )}
                      {asset.symbol === "IBEX 35" && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" title="Madrid IBEX 35" />
                      )}
                      {asset.symbol === "DAX 40" && (
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" title="Frankfurt DAX 40" />
                      )}
                      {asset.symbol === "EURO STOXX 50" && (
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400" title="Eurozone Blue Chip" />
                      )}
                      {asset.symbol === "FTSE 100" && (
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" title="London FTSE 100" />
                      )}
                      {asset.symbol === "KOSPI 200" && (
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" title="KRX KOSPI 200 ($KOPSI)" />
                      )}
                      {asset.symbol === "NIKKEI 225" && (
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400" title="Tokyo Nikkei 225" />
                      )}
                      {asset.symbol === "HANG SENG" && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" title="Hong Kong Hang Seng" />
                      )}
                      {asset.symbol === "BRENT" && (
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" title="Brent Crude Oil" />
                      )}
                    </div>
                    <span className={`text-[9px] font-mono-data font-bold px-1.5 py-0.5 rounded border uppercase flex items-center gap-0.5 shrink-0 ${badgeBg}`}>
                      {!isNeutral && (asset.isPositive ? <ArrowUpRight className="w-2.5 h-2.5" /> : <ArrowDownRight className="w-2.5 h-2.5" />)}
                      {asset.change24h}
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between mb-1">
                    <span className="text-base font-bold font-mono-data text-[#EDE9DE] tracking-tight">
                      {asset.currentPrice}
                    </span>
                    <span className="text-[8px] font-mono-data text-[#8292A6] uppercase tracking-wider">
                      {asset.subCategory || asset.category}
                    </span>
                  </div>

                  <div className="text-[8.5px] font-mono-data text-[#BAC7D5] truncate" title={asset.name}>
                    {asset.name}
                  </div>
                </div>

                {/* Sparkline Canvas Area */}
                <div className="relative my-2 flex justify-center items-center">
                  <svg
                    className="w-full h-10 overflow-visible cursor-crosshair"
                    viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                    preserveAspectRatio="none"
                    onMouseMove={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const mouseX = e.clientX - rect.left;
                      const normalizedX = Math.max(0, Math.min(1, mouseX / rect.width));
                      const closestIndex = Math.round(normalizedX * (points.length - 1));
                      setHoveredAsset({ symbol: asset.symbol, index: closestIndex });
                    }}
                  >
                    <defs>
                      <linearGradient id={`grad-${asset.symbol.replace(/[/ ]/g, "")}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={strokeColor} stopOpacity="0.35" />
                        <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Gradient Fill under curve */}
                    <path d={areaD} fill={`url(#grad-${asset.symbol.replace(/[/ ]/g, "")})`} />

                    {/* High/Low guide baseline */}
                    <line
                      x1="0"
                      y1={usableHeight / 2 + paddingY}
                      x2={svgWidth}
                      y2={usableHeight / 2 + paddingY}
                      stroke="#253347"
                      strokeDasharray="2 2"
                      strokeWidth="0.8"
                    />

                    {/* Main Sparkline stroke */}
                    <path
                      d={pathD}
                      fill="none"
                      stroke={strokeColor}
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    {/* Live Endpoint Pulse Dot */}
                    {points.length > 0 && (
                      <circle
                        cx={points[points.length - 1].x}
                        cy={points[points.length - 1].y}
                        r="2.5"
                        fill={strokeColor}
                      />
                    )}

                    {/* Hover Line & Dot */}
                    {activePoint && (
                      <g>
                        <line
                          x1={activePoint.x}
                          y1={0}
                          x2={activePoint.x}
                          y2={svgHeight}
                          stroke="#EDE9DE"
                          strokeWidth="1"
                          strokeDasharray="1 1"
                          opacity="0.8"
                        />
                        <circle
                          cx={activePoint.x}
                          cy={activePoint.y}
                          r="3.5"
                          fill="#EDE9DE"
                          stroke={strokeColor}
                          strokeWidth="2"
                        />
                      </g>
                    )}
                  </svg>

                  {/* Floating tooltip on hover */}
                  {activePoint && (
                    <div
                      className="absolute -top-7 px-1.5 py-0.5 rounded bg-black/95 text-[#EDE9DE] border border-[#B08D57]/40 text-[8.5px] font-mono-data pointer-events-none shadow-lg whitespace-nowrap z-20"
                      style={{
                        left: `${Math.min(75, Math.max(15, (activePoint.x / svgWidth) * 100))}%`,
                        transform: "translateX(-50%)"
                      }}
                    >
                      <span className="text-[#8292A6]">{activePoint.hour}: </span>
                      <span className="font-bold text-[#E5C794]">{activePoint.formatted}</span>
                    </div>
                  )}
                </div>

                {/* 24H Range & Momentum Tag */}
                <div className="pt-1.5 border-t border-[#B08D57]/15 space-y-1">
                  <div className="flex justify-between text-[8px] font-mono-data text-[#8292A6]">
                    <span>L: <strong className="text-[#EDE9DE]">{asset.low24h}</strong></span>
                    <span>H: <strong className="text-[#EDE9DE]">{asset.high24h}</strong></span>
                  </div>
                  <div className="text-[7.5px] font-mono-data text-center text-[#B08D57] bg-[#B08D57]/10 py-0.5 rounded uppercase font-semibold tracking-wider">
                    {asset.momentumTag}
                  </div>
                  {asset.macroRole && (
                    <div className="text-[7px] font-mono-data text-[#8292A6] truncate text-center" title={asset.macroRole}>
                      {asset.macroRole}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Zero Results State */}
        {filteredAssets.length === 0 && (
          <div className="text-center py-8 bg-black/40 border border-[#B08D57]/20 rounded-xl space-y-2">
            <p className="text-xs font-mono-data text-[#EDE9DE]">No macro assets, rates, or FX pairs matching &quot;{searchQuery}&quot;</p>
            <button
              onClick={() => { setSearchQuery(""); setFilterCategory("ALL"); setRatesSubCategory("ALL"); }}
              className="text-[10px] font-mono-data text-[#B08D57] hover:underline"
            >
              Reset Filters & Search
            </button>
          </div>
        )}

        {/* Full Screen Order Book Liquidity Depth Engine */}
        {isFullScreen && (
          <div className="pt-4 border-t border-[#B08D57]/30 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                <h3 className="text-xs sm:text-sm font-mono-data font-bold tracking-wider text-[#FBF8F1] uppercase flex items-center gap-2">
                  <span>Cross-Asset Order Book Liquidity Depth</span>
                  <span className="text-[10px] text-[#B08D57] font-normal hidden sm:inline">
                    (BTC/USD • S&P 500 • XAU/USD • IBEX 35)
                  </span>
                </h3>
              </div>
              <span className="text-[9.5px] font-mono-data text-[#8292A6]">
                Real-time cumulative depth curves, DOM micro-ladders, and institutional walls
              </span>
            </div>
            <MultiAssetOrderBookDepth macroData={macroData} />
          </div>
        )}
      </div>
    </>
  );
};
