import React, { useState, useMemo, useRef } from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  Layers, 
  BarChart2, 
  ShieldAlert, 
  Info, 
  Grid, 
  Maximize2,
  DollarSign,
  Activity,
  Zap,
  CheckCircle2
} from "lucide-react";
import { MacroDataState, OrderBookLevel } from "../types";

export type SupportedDepthAsset = "BTC/USD" | "S&P 500" | "XAU/USD" | "IBEX 35";

interface AssetDepthConfig {
  symbol: SupportedDepthAsset;
  name: string;
  category: string;
  unit: string;
  notionalUnit: string;
  color: string;
  badgeBg: string;
  formatPrice: (p: number) => string;
  formatSize: (s: number) => string;
  formatNotional: (n: number) => string;
  baseSpread: number;
  baseSpreadBps: number;
  baseStepMultiplier: number;
  baseSizeMin: number;
  baseSizeMax: number;
  wallSizeBoost: number;
  narrative: string;
  bidWallDesc: string;
  askWallDesc: string;
}

const ASSET_CONFIGS: Record<SupportedDepthAsset, AssetDepthConfig> = {
  "BTC/USD": {
    symbol: "BTC/USD",
    name: "Bitcoin Spot",
    category: "Digital Asset Beta",
    unit: "BTC",
    notionalUnit: "USD",
    color: "#F7931A",
    badgeBg: "bg-[#F7931A]/15 text-[#F7931A] border-[#F7931A]/30",
    formatPrice: (p) => `$${p.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    formatSize: (s) => `${s.toFixed(2)} BTC`,
    formatNotional: (n) => `$${(n / 1_000_000).toFixed(2)}M`,
    baseSpread: 1.00,
    baseSpreadBps: 0.13,
    baseStepMultiplier: 1.0,
    baseSizeMin: 4.0,
    baseSizeMax: 22.0,
    wallSizeBoost: 48.0,
    narrative: "Order flow reflects institutional dip-absorption around $77,100 absorbing carry-unwind volume.",
    bidWallDesc: "Institutional Buy Block",
    askWallDesc: "Resistance Profit Block"
  },
  "S&P 500": {
    symbol: "S&P 500",
    name: "S&P 500 Index (ES Futures)",
    category: "Core US Equity",
    unit: "Contracts",
    notionalUnit: "USD",
    color: "#10B981",
    badgeBg: "bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30",
    formatPrice: (p) => `${p.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    formatSize: (s) => `${Math.round(s)} ES`,
    formatNotional: (n) => `$${(n * 50 / 1_000_000).toFixed(1)}M Notional`,
    baseSpread: 0.25,
    baseSpreadBps: 0.25,
    baseStepMultiplier: 0.8,
    baseSizeMin: 120.0,
    baseSizeMax: 650.0,
    wallSizeBoost: 1850.0,
    narrative: "Heavy institutional limit bids at 7,650 provide systematic gamma buffer against volatility shocks.",
    bidWallDesc: "Systematic Gamma Bid Block",
    askWallDesc: "Overhead Delta Hedge Wall"
  },
  "XAU/USD": {
    symbol: "XAU/USD",
    name: "Gold Spot (GC Futures)",
    category: "Safe-Haven Commodity",
    unit: "Troy Oz",
    notionalUnit: "USD",
    color: "#D4AF37",
    badgeBg: "bg-[#D4AF37]/15 text-[#E5C794] border-[#D4AF37]/30",
    formatPrice: (p) => `$${p.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/oz`,
    formatSize: (s) => `${Math.round(s).toLocaleString()} oz`,
    formatNotional: (n) => `$${(n / 1_000_000).toFixed(1)}M`,
    baseSpread: 0.40,
    baseSpreadBps: 0.08,
    baseStepMultiplier: 0.6,
    baseSizeMin: 1100.0,
    baseSizeMax: 4800.0,
    wallSizeBoost: 12400.0,
    narrative: "Sovereign central bank reserve accumulation bids anchor prices firmly above $4,380/oz.",
    bidWallDesc: "Sovereign CB Accumulation",
    askWallDesc: "Prop Derivative Strike Wall"
  },
  "IBEX 35": {
    symbol: "IBEX 35",
    name: "IBEX 35 (MEFF Index)",
    category: "European Prop Beta",
    unit: "MEFF Ctrts",
    notionalUnit: "EUR",
    color: "#60A5FA",
    badgeBg: "bg-[#60A5FA]/15 text-[#93C5FD] border-[#60A5FA]/30",
    formatPrice: (p) => `${p.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}`,
    formatSize: (s) => `${Math.round(s)} MEFF`,
    formatNotional: (n) => `€${(n * 10 / 1_000_000).toFixed(1)}M Notional`,
    baseSpread: 1.5,
    baseSpreadBps: 0.74,
    baseStepMultiplier: 1.2,
    baseSizeMin: 60.0,
    baseSizeMax: 280.0,
    wallSizeBoost: 950.0,
    narrative: "Spanish banking sector dividend delta (Santander/BBVA) forms tight limit bid clustering around 19,780.",
    bidWallDesc: "Bank Hedging Limit Block",
    askWallDesc: "Index Resistance Supply"
  }
};

interface MultiAssetOrderBookDepthProps {
  macroData: MacroDataState;
  isLiveFeedActive?: boolean;
}

export const MultiAssetOrderBookDepth: React.FC<MultiAssetOrderBookDepthProps> = ({
  macroData,
  isLiveFeedActive = true,
}) => {
  const [selectedAsset, setSelectedAsset] = useState<SupportedDepthAsset>("BTC/USD");
  const [depthZoom, setDepthZoom] = useState<"0.5" | "1.0" | "2.5">("1.0");
  const [viewMode, setViewMode] = useState<"deep-dive" | "quad-grid">("deep-dive");
  const [showLadder, setShowLadder] = useState<boolean>(true);
  const [hoveredPoint, setHoveredPoint] = useState<{
    x: number;
    y: number;
    price: number;
    size: number;
    total: number;
    type: "bid" | "ask";
    pctDist: number;
  } | null>(null);

  const svgRef = useRef<SVGSVGElement | null>(null);

  // Extract live prices from macroData.tickers with reliable fallbacks
  const livePrices = useMemo(() => {
    const btcTicker = macroData.tickers.find(t => t.symbol === "BTC/USD");
    const spTicker = macroData.tickers.find(t => t.symbol === "S&P 500" || t.symbol === "SPX" || t.symbol === "$ES");
    const goldTicker = macroData.tickers.find(t => t.symbol === "XAU/USD");
    const ibexTicker = macroData.tickers.find(t => t.symbol === "IBEX 35");

    return {
      "BTC/USD": btcTicker?.price ?? 84450.00,
      "S&P 500": spTicker?.price ?? 7704.13,
      "XAU/USD": goldTicker?.price ?? 4408.90,
      "IBEX 35": ibexTicker?.price ?? macroData.engines.ibexBias.level ?? 19838.5
    };
  }, [macroData.tickers, macroData.engines.ibexBias.level]);

  // Helper to generate realistic order book depth for any asset
  const computeBookData = (asset: SupportedDepthAsset, zoom: "0.5" | "1.0" | "2.5") => {
    const config = ASSET_CONFIGS[asset];
    const mid = livePrices[asset];
    const spreadVal = config.baseSpread;
    const bestBid = Number((mid - spreadVal / 2).toFixed(2));
    const bestAsk = Number((mid + spreadVal / 2).toFixed(2));

    const zoomPct = zoom === "0.5" ? 0.005 : zoom === "1.0" ? 0.01 : 0.025;
    const stepsCount = 24;
    const priceStep = (mid * zoomPct) / stepsCount;

    const pseudoRand = (offset: number) => {
      const x = Math.sin((mid * 7) + offset * 9301 + 49297) * 233280;
      return x - Math.floor(x);
    };

    // Generate Bids
    const bids: OrderBookLevel[] = [];
    let cumBidSize = 0;
    for (let i = 0; i < stepsCount; i++) {
      const price = Number((bestBid - i * priceStep).toFixed(2));
      let baseSize = config.baseSizeMin + pseudoRand(i + 1) * (config.baseSizeMax - config.baseSizeMin);
      
      const isMajorWall = i === 7 || i === 16;
      if (isMajorWall) {
        baseSize += config.wallSizeBoost + pseudoRand(i + 50) * (config.wallSizeBoost * 0.5);
      }
      
      baseSize = Number(baseSize.toFixed(2));
      cumBidSize = Number((cumBidSize + baseSize).toFixed(2));
      
      bids.push({
        price,
        size: baseSize,
        total: cumBidSize,
        percent: 0
      });
    }

    // Generate Asks
    const asks: OrderBookLevel[] = [];
    let cumAskSize = 0;
    for (let i = 0; i < stepsCount; i++) {
      const price = Number((bestAsk + i * priceStep).toFixed(2));
      let baseSize = config.baseSizeMin * 0.95 + pseudoRand(i + 100) * (config.baseSizeMax - config.baseSizeMin) * 0.95;
      
      const isMajorWall = i === 9 || i === 18;
      if (isMajorWall) {
        baseSize += config.wallSizeBoost * 0.9 + pseudoRand(i + 200) * (config.wallSizeBoost * 0.4);
      }

      baseSize = Number(baseSize.toFixed(2));
      cumAskSize = Number((cumAskSize + baseSize).toFixed(2));
      
      asks.push({
        price,
        size: baseSize,
        total: cumAskSize,
        percent: 0
      });
    }

    const totalBids = cumBidSize;
    const totalAsks = cumAskSize;
    const maxCum = Math.max(totalBids, totalAsks);

    bids.forEach(b => b.percent = Number(((b.total / maxCum) * 100).toFixed(1)));
    asks.forEach(a => a.percent = Number(((a.total / maxCum) * 100).toFixed(1)));

    const totalLiquidity = totalBids + totalAsks;
    const bidPressurePct = Number(((totalBids / totalLiquidity) * 100).toFixed(1));
    const askPressurePct = Number(((totalAsks / totalLiquidity) * 100).toFixed(1));
    const imbalanceRatio = Number((totalBids / totalAsks).toFixed(2));

    let imbalanceState: "BULLISH ABSORPTION" | "BALANCED" | "BEARISH OVERHANG" = "BALANCED";
    if (imbalanceRatio >= 1.08) {
      imbalanceState = "BULLISH ABSORPTION";
    } else if (imbalanceRatio <= 0.92) {
      imbalanceState = "BEARISH OVERHANG";
    }

    const sortedBidsBySize = [...bids].sort((a, b) => b.size - a.size);
    const sortedAsksBySize = [...asks].sort((a, b) => b.size - a.size);

    const bidWalls = sortedBidsBySize.slice(0, 2).map(w => ({
      price: w.price,
      size: w.size,
      desc: `${config.bidWallDesc} (${config.formatSize(w.size)})`
    }));

    const askWalls = sortedAsksBySize.slice(0, 2).map(w => ({
      price: w.price,
      size: w.size,
      desc: `${config.askWallDesc} (${config.formatSize(w.size)})`
    }));

    return {
      asset,
      config,
      mid,
      spreadVal,
      bestBid,
      bestAsk,
      bids,
      asks,
      totalBids,
      totalAsks,
      maxCum,
      bidPressurePct,
      askPressurePct,
      imbalanceRatio,
      imbalanceState,
      bidWalls,
      askWalls,
      minPrice: bids[bids.length - 1].price,
      maxPrice: asks[asks.length - 1].price
    };
  };

  // Pre-calculate data for selected asset
  const currentBook = useMemo(() => {
    return computeBookData(selectedAsset, depthZoom);
  }, [selectedAsset, depthZoom, livePrices]);

  // Pre-calculate all books for quad-grid mode
  const allBooks = useMemo(() => {
    return {
      "BTC/USD": computeBookData("BTC/USD", "1.0"),
      "S&P 500": computeBookData("S&P 500", "1.0"),
      "XAU/USD": computeBookData("XAU/USD", "1.0"),
      "IBEX 35": computeBookData("IBEX 35", "1.0"),
    };
  }, [livePrices]);

  // SVG dimensions
  const svgWidth = 840;
  const svgHeight = 175;
  const paddingX = 14;
  const midX = svgWidth / 2;
  const chartBottomY = 145;
  const chartTopY = 16;
  const chartHeight = chartBottomY - chartTopY;

  // Build SVG polygon paths for current asset
  const bidPoints = useMemo(() => {
    const pts: [number, number][] = [];
    const minPrice = currentBook.minPrice;
    const midPrice = currentBook.mid;
    const priceRangeLeft = midPrice - minPrice;

    pts.push([midX, chartBottomY]);

    currentBook.bids.forEach((b) => {
      const priceRatio = (b.price - minPrice) / (priceRangeLeft || 1);
      const x = paddingX + priceRatio * (midX - paddingX);
      const yRatio = b.total / (currentBook.maxCum || 1);
      const y = chartBottomY - yRatio * chartHeight;
      pts.push([x, y]);
    });

    pts.push([paddingX, chartBottomY]);
    return pts;
  }, [currentBook, chartBottomY, chartHeight, midX]);

  const askPoints = useMemo(() => {
    const pts: [number, number][] = [];
    const maxPrice = currentBook.maxPrice;
    const midPrice = currentBook.mid;
    const priceRangeRight = maxPrice - midPrice;

    pts.push([midX, chartBottomY]);

    currentBook.asks.forEach((a) => {
      const priceRatio = (a.price - midPrice) / (priceRangeRight || 1);
      const x = midX + priceRatio * (svgWidth - paddingX - midX);
      const yRatio = a.total / (currentBook.maxCum || 1);
      const y = chartBottomY - yRatio * chartHeight;
      pts.push([x, y]);
    });

    pts.push([svgWidth - paddingX, chartBottomY]);
    return pts;
  }, [currentBook, chartBottomY, chartHeight, midX, svgWidth]);

  const bidPathD = useMemo(() => {
    if (bidPoints.length < 3) return "";
    let d = `M ${bidPoints[0][0]} ${bidPoints[0][1]}`;
    for (let i = 1; i < bidPoints.length - 1; i++) {
      d += ` L ${bidPoints[i][0]} ${bidPoints[i][1]}`;
    }
    d += ` L ${bidPoints[bidPoints.length - 1][0]} ${chartBottomY} Z`;
    return d;
  }, [bidPoints, chartBottomY]);

  const bidStrokeD = useMemo(() => {
    if (bidPoints.length < 3) return "";
    let d = `M ${bidPoints[1][0]} ${bidPoints[1][1]}`;
    for (let i = 2; i < bidPoints.length - 1; i++) {
      d += ` L ${bidPoints[i][0]} ${bidPoints[i][1]}`;
    }
    return d;
  }, [bidPoints]);

  const askPathD = useMemo(() => {
    if (askPoints.length < 3) return "";
    let d = `M ${askPoints[0][0]} ${askPoints[0][1]}`;
    for (let i = 1; i < askPoints.length - 1; i++) {
      d += ` L ${askPoints[i][0]} ${askPoints[i][1]}`;
    }
    d += ` L ${askPoints[askPoints.length - 1][0]} ${chartBottomY} Z`;
    return d;
  }, [askPoints, chartBottomY]);

  const askStrokeD = useMemo(() => {
    if (askPoints.length < 3) return "";
    let d = `M ${askPoints[1][0]} ${askPoints[1][1]}`;
    for (let i = 2; i < askPoints.length - 1; i++) {
      d += ` L ${askPoints[i][0]} ${askPoints[i][1]}`;
    }
    return d;
  }, [askPoints]);

  const handleSvgMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const svgX = (clientX / rect.width) * svgWidth;

    if (svgX < paddingX || svgX > svgWidth - paddingX) {
      setHoveredPoint(null);
      return;
    }

    if (svgX < midX) {
      const ratio = (svgX - paddingX) / (midX - paddingX);
      const price = currentBook.minPrice + ratio * (currentBook.mid - currentBook.minPrice);
      const closest = currentBook.bids.reduce((prev, curr) => 
        Math.abs(curr.price - price) < Math.abs(prev.price - price) ? curr : prev
      );
      const yRatio = closest.total / (currentBook.maxCum || 1);
      const y = chartBottomY - yRatio * chartHeight;
      const pctDist = ((closest.price - currentBook.mid) / currentBook.mid) * 100;

      setHoveredPoint({
        x: svgX,
        y,
        price: closest.price,
        size: closest.size,
        total: closest.total,
        type: "bid",
        pctDist
      });
    } else {
      const ratio = (svgX - midX) / (svgWidth - paddingX - midX);
      const price = currentBook.mid + ratio * (currentBook.maxPrice - currentBook.mid);
      const closest = currentBook.asks.reduce((prev, curr) => 
        Math.abs(curr.price - price) < Math.abs(prev.price - price) ? curr : prev
      );
      const yRatio = closest.total / (currentBook.maxCum || 1);
      const y = chartBottomY - yRatio * chartHeight;
      const pctDist = ((closest.price - currentBook.mid) / currentBook.mid) * 100;

      setHoveredPoint({
        x: svgX,
        y,
        price: closest.price,
        size: closest.size,
        total: closest.total,
        type: "ask",
        pctDist
      });
    }
  };

  return (
    <div id="multi-asset-orderbook-depth" className="w-full bg-[#080E18] border border-[#B08D57]/35 rounded-xl text-xs font-mono-data overflow-hidden shadow-2xl space-y-3">
      {/* 1. Header Toolbar with Asset Tabs and View Mode */}
      <div className="px-4 py-3 bg-[#0B1320] border-b border-[#B08D57]/20 flex flex-wrap items-center justify-between gap-3">
        {/* Title */}
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-black/70 border border-[#B08D57]/45 text-[#E5C794] shadow-inner">
            <Layers className="w-4 h-4 text-[#B08D57]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-bold tracking-wider text-[#FBF8F1] uppercase">
                Cross-Asset Order Book Liquidity Depth Engine
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 text-[9px] px-2 py-0.5 rounded bg-[#10B981]/20 text-[#34D399] border border-[#10B981]/40 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                L2 REAL-TIME DEPTH
              </span>
            </div>
            <p className="text-[10px] text-[#8292A6]">
              Visualizing institutional bid/ask supply walls and market liquidity pressure across BTC, S&P 500, Gold, & IBEX 35
            </p>
          </div>
        </div>

        {/* View Mode & Zoom controls */}
        <div className="flex items-center gap-2">
          {/* Mode Switcher */}
          <div className="flex items-center bg-black/70 rounded-lg p-0.5 border border-[#B08D57]/30 text-[10px]">
            <button
              id="depth-view-deep-dive-btn"
              onClick={() => setViewMode("deep-dive")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded transition-colors font-semibold ${
                viewMode === "deep-dive" 
                  ? "bg-[#B08D57] text-[#0A111C]" 
                  : "text-[#BAC7D5] hover:text-[#EDE9DE]"
              }`}
            >
              <BarChart2 className="w-3 h-3" />
              <span>Deep Dive</span>
            </button>
            <button
              id="depth-view-quad-grid-btn"
              onClick={() => setViewMode("quad-grid")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded transition-colors font-semibold ${
                viewMode === "quad-grid" 
                  ? "bg-[#B08D57] text-[#0A111C]" 
                  : "text-[#BAC7D5] hover:text-[#EDE9DE]"
              }`}
            >
              <Grid className="w-3 h-3" />
              <span>4-Asset Quad Grid</span>
            </button>
          </div>

          {/* Zoom buttons (active in deep-dive) */}
          {viewMode === "deep-dive" && (
            <div className="flex items-center bg-black/70 rounded-lg p-0.5 border border-[#B08D57]/30 text-[10px]">
              <span className="text-[9px] text-[#8292A6] px-1.5 hidden md:inline">ZOOM:</span>
              {(["0.5", "1.0", "2.5"] as const).map((z) => (
                <button
                  key={z}
                  onClick={() => setDepthZoom(z)}
                  className={`px-2 py-0.5 rounded font-bold transition-colors ${
                    depthZoom === z ? "bg-[#B08D57] text-[#0A111C]" : "text-[#BAC7D5] hover:text-white"
                  }`}
                >
                  ±{z}%
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 2. Asset Selector Tabs (BTC, S&P 500, XAU, IBEX 35) */}
      <div className="px-4 grid grid-cols-2 md:grid-cols-4 gap-2.5">
        {(["BTC/USD", "S&P 500", "XAU/USD", "IBEX 35"] as const).map((sym) => {
          const cfg = ASSET_CONFIGS[sym];
          const price = livePrices[sym];
          const isSelected = selectedAsset === sym && viewMode === "deep-dive";
          const book = allBooks[sym];

          return (
            <button
              key={sym}
              id={`depth-asset-tab-${sym.replace(/[/ ]/g, '-').toLowerCase()}`}
              onClick={() => {
                setSelectedAsset(sym);
                if (viewMode === "quad-grid") setViewMode("deep-dive");
              }}
              className={`text-left p-2.5 rounded-lg border transition-all relative overflow-hidden flex flex-col justify-between ${
                isSelected 
                  ? "bg-[#0E1A2B] border-[#B08D57] shadow-[0_0_15px_rgba(176,141,87,0.25)]" 
                  : "bg-[#0B1320]/80 hover:bg-[#0E1A2B]/60 border-[#B08D57]/15 hover:border-[#B08D57]/40"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-[12px] text-[#EDE9DE] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cfg.color }} />
                  {sym}
                </span>
                <span className={`text-[8.5px] font-bold px-1.5 py-0.2 rounded border ${cfg.badgeBg}`}>
                  {cfg.category}
                </span>
              </div>

              <div className="flex items-baseline justify-between mb-1.5">
                <span className="text-[13px] font-bold text-[#FBF8F1]">
                  {cfg.formatPrice(price)}
                </span>
                <span className="text-[9px] text-[#8292A6]">
                  Spread: {cfg.baseSpread}
                </span>
              </div>

              {/* Mini Pressure Meter */}
              <div className="w-full space-y-1">
                <div className="flex justify-between text-[8px] text-[#8292A6]">
                  <span className="text-[#10B981] font-semibold">Bid {book.bidPressurePct}%</span>
                  <span className="text-[#E11D48] font-semibold">Ask {book.askPressurePct}%</span>
                </div>
                <div className="w-full h-1 rounded-full bg-black/60 overflow-hidden flex">
                  <div className="h-full bg-[#10B981]" style={{ width: `${book.bidPressurePct}%` }} />
                  <div className="h-full bg-[#E11D48]" style={{ width: `${book.askPressurePct}%` }} />
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* 3. Main Display Area: Deep Dive vs. Quad Grid */}
      {viewMode === "deep-dive" ? (
        <div className="p-4 pt-1 bg-[#060A12] flex flex-col lg:flex-row gap-4">
          {/* Main Visual Depth Curve Canvas */}
          <div className="flex-1 flex flex-col bg-[#0A111C]/90 rounded-lg p-3.5 border border-[#B08D57]/20 relative">
            {/* Top Stat Bar */}
            <div className="flex flex-wrap items-center justify-between pb-2.5 mb-2 border-b border-white/5 gap-3 text-[11px]">
              <div className="flex items-center gap-3">
                <span className="text-[#8292A6]">
                  Asset Mid: <strong className="text-[#EDE9DE]">{currentBook.config.formatPrice(currentBook.mid)}</strong>
                </span>
                <span className="text-white/20">|</span>
                <span className="text-[#8292A6]">
                  Spread: <strong className="text-[#B08D57]">{currentBook.spreadVal}</strong> ({currentBook.config.baseSpreadBps} bps)
                </span>
                <span className="text-white/20">|</span>
                <span className="text-[#8292A6]">
                  Imbalance State:{" "}
                  <span className={`font-bold ${currentBook.imbalanceRatio >= 1 ? "text-[#10B981]" : "text-[#E11D48]"}`}>
                    {currentBook.imbalanceState} ({currentBook.imbalanceRatio}x)
                  </span>
                </span>
              </div>

              {/* Institutional Wall Callouts */}
              <div className="flex items-center gap-2 text-[10px]">
                {currentBook.bidWalls[0] && (
                  <span className="px-2 py-0.5 rounded bg-[#10B981]/15 text-[#34D399] border border-[#10B981]/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                    Bid Wall: {currentBook.config.formatPrice(currentBook.bidWalls[0].price)} ({currentBook.config.formatSize(currentBook.bidWalls[0].size)})
                  </span>
                )}
                {currentBook.askWalls[0] && (
                  <span className="px-2 py-0.5 rounded bg-[#E11D48]/15 text-[#F87171] border border-[#E11D48]/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#E11D48]" />
                    Ask Wall: {currentBook.config.formatPrice(currentBook.askWalls[0].price)} ({currentBook.config.formatSize(currentBook.askWalls[0].size)})
                  </span>
                )}
              </div>
            </div>

            {/* Depth Dual Bar */}
            <div className="mb-3">
              <div className="flex items-center justify-between text-[10px] mb-1">
                <span className="text-[#10B981] font-semibold flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  CUMULATIVE BIDS: {currentBook.config.formatSize(currentBook.totalBids)} ({currentBook.bidPressurePct}%)
                </span>
                <span className="text-[#E11D48] font-semibold flex items-center gap-1">
                  CUMULATIVE ASKS: {currentBook.config.formatSize(currentBook.totalAsks)} ({currentBook.askPressurePct}%)
                  <TrendingDown className="w-3 h-3" />
                </span>
              </div>
              <div className="w-full h-2 rounded-full overflow-hidden bg-black/60 flex border border-[#B08D57]/25 p-0.5">
                <div 
                  className="h-full bg-gradient-to-r from-[#059669] to-[#10B981] rounded-l-full transition-all duration-300"
                  style={{ width: `${currentBook.bidPressurePct}%` }}
                />
                <div 
                  className="h-full bg-gradient-to-r from-[#E11D48] to-[#991B1B] rounded-r-full transition-all duration-300"
                  style={{ width: `${currentBook.askPressurePct}%` }}
                />
              </div>
            </div>

            {/* SVG Depth Chart */}
            <div className="relative w-full h-[175px] select-none">
              <svg
                ref={svgRef}
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                className="w-full h-full cursor-crosshair overflow-visible"
                preserveAspectRatio="none"
                onMouseMove={handleSvgMouseMove}
                onMouseLeave={() => setHoveredPoint(null)}
              >
                <defs>
                  <linearGradient id="multiBidGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10B981" stopOpacity="0.45" />
                    <stop offset="100%" stopColor="#059669" stopOpacity="0.04" />
                  </linearGradient>
                  <linearGradient id="multiAskGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#E11D48" stopOpacity="0.45" />
                    <stop offset="100%" stopColor="#991B1B" stopOpacity="0.04" />
                  </linearGradient>
                  <pattern id="multiDepthGrid" width="40" height="25" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(176, 141, 87, 0.05)" strokeWidth="1" />
                  </pattern>
                </defs>

                <rect width={svgWidth} height={chartBottomY} fill="url(#multiDepthGrid)" />

                {/* Horizontal reference levels */}
                {[0.25, 0.5, 0.75, 1.0].map((lvl) => {
                  const y = chartBottomY - lvl * chartHeight;
                  const vol = Math.round(currentBook.maxCum * lvl);
                  return (
                    <g key={lvl}>
                      <line
                        x1={paddingX}
                        y1={y}
                        x2={svgWidth - paddingX}
                        y2={y}
                        stroke="rgba(255, 255, 255, 0.06)"
                        strokeDasharray="3 3"
                        strokeWidth="1"
                      />
                      <text x={paddingX + 4} y={y - 3} fill="#8292A6" fontSize="8" fontFamily="monospace">
                        {vol} {currentBook.config.unit}
                      </text>
                    </g>
                  );
                })}

                {/* Depth Areas */}
                <path d={bidPathD} fill="url(#multiBidGrad)" />
                <path d={bidStrokeD} fill="none" stroke="#10B981" strokeWidth="2" strokeLinejoin="round" />

                <path d={askPathD} fill="url(#multiAskGrad)" />
                <path d={askStrokeD} fill="none" stroke="#E11D48" strokeWidth="2" strokeLinejoin="round" />

                {/* Mid price vertical line */}
                <line
                  x1={midX}
                  y1={chartTopY - 5}
                  x2={midX}
                  y2={chartBottomY}
                  stroke="#B08D57"
                  strokeWidth="1.5"
                  strokeDasharray="4 2"
                />
                <circle cx={midX} cy={chartBottomY} r="3.5" fill="#B08D57" />
                <circle cx={midX} cy={chartBottomY} r="7" fill="none" stroke="#B08D57" strokeWidth="1" opacity="0.6" />

                {/* Major Bid Wall Callout */}
                {currentBook.bidWalls[0] && (
                  <g>
                    {(() => {
                      const minP = currentBook.minPrice;
                      const midP = currentBook.mid;
                      const ratio = (currentBook.bidWalls[0].price - minP) / (midP - minP || 1);
                      const wallX = paddingX + ratio * (midX - paddingX);
                      return (
                        <>
                          <line
                            x1={wallX}
                            y1={chartTopY + 15}
                            x2={wallX}
                            y2={chartBottomY}
                            stroke="#10B981"
                            strokeDasharray="2 2"
                            strokeWidth="1"
                            opacity="0.8"
                          />
                          <polygon
                            points={`${wallX - 3},${chartTopY + 15} ${wallX + 3},${chartTopY + 15} ${wallX},${chartTopY + 20}`}
                            fill="#10B981"
                          />
                        </>
                      );
                    })()}
                  </g>
                )}

                {/* Major Ask Wall Callout */}
                {currentBook.askWalls[0] && (
                  <g>
                    {(() => {
                      const maxP = currentBook.maxPrice;
                      const midP = currentBook.mid;
                      const ratio = (currentBook.askWalls[0].price - midP) / (maxP - midP || 1);
                      const wallX = midX + ratio * (svgWidth - paddingX - midX);
                      return (
                        <>
                          <line
                            x1={wallX}
                            y1={chartTopY + 15}
                            x2={wallX}
                            y2={chartBottomY}
                            stroke="#E11D48"
                            strokeDasharray="2 2"
                            strokeWidth="1"
                            opacity="0.8"
                          />
                          <polygon
                            points={`${wallX - 3},${chartTopY + 15} ${wallX + 3},${chartTopY + 15} ${wallX},${chartTopY + 20}`}
                            fill="#E11D48"
                          />
                        </>
                      );
                    })()}
                  </g>
                )}

                {/* Crosshair on hover */}
                {hoveredPoint && (
                  <g>
                    <line
                      x1={hoveredPoint.x}
                      y1={chartTopY}
                      x2={hoveredPoint.x}
                      y2={chartBottomY}
                      stroke="#EDE9DE"
                      strokeDasharray="2 2"
                      strokeWidth="1"
                    />
                    <line
                      x1={paddingX}
                      y1={hoveredPoint.y}
                      x2={svgWidth - paddingX}
                      y2={hoveredPoint.y}
                      stroke="#EDE9DE"
                      strokeDasharray="2 2"
                      strokeWidth="0.8"
                      opacity="0.5"
                    />
                    <circle
                      cx={hoveredPoint.x}
                      cy={hoveredPoint.y}
                      r="4"
                      fill={hoveredPoint.type === "bid" ? "#10B981" : "#E11D48"}
                      stroke="#FFFFFF"
                      strokeWidth="1.5"
                    />
                  </g>
                )}

                {/* X Axis Labels */}
                <g transform={`translate(0, ${chartBottomY + 15})`} fontSize="9" fontFamily="monospace" fill="#8292A6">
                  <text x={paddingX} textAnchor="start">
                    {currentBook.config.formatPrice(currentBook.minPrice)}
                  </text>
                  <text x={midX} textAnchor="middle" fill="#B08D57" fontWeight="bold">
                    {currentBook.config.formatPrice(currentBook.mid)} (MID)
                  </text>
                  <text x={svgWidth - paddingX} textAnchor="end">
                    {currentBook.config.formatPrice(currentBook.maxPrice)}
                  </text>
                </g>
              </svg>

              {/* Tooltip on Hover */}
              {hoveredPoint && (
                <div
                  className="absolute pointer-events-none z-30 bg-[#0E1A2B] border border-[#B08D57]/50 rounded p-2 text-[10px] shadow-2xl backdrop-blur-md"
                  style={{
                    left: `${Math.min(svgWidth - 180, Math.max(10, (hoveredPoint.x / svgWidth) * 100))}%`,
                    top: "10px"
                  }}
                >
                  <div className="flex items-center gap-1.5 font-bold uppercase mb-1">
                    <span className={`w-2 h-2 rounded-full ${hoveredPoint.type === "bid" ? "bg-[#10B981]" : "bg-[#E11D48]"}`} />
                    <span className={hoveredPoint.type === "bid" ? "text-[#10B981]" : "text-[#E11D48]"}>
                      {hoveredPoint.type === "bid" ? "Buy Liquidity" : "Sell Liquidity"}
                    </span>
                    <span className="text-[#8292A6] ml-auto">
                      {hoveredPoint.pctDist >= 0 ? "+" : ""}{hoveredPoint.pctDist.toFixed(2)}%
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[#EDE9DE]">
                    <span className="text-[#8292A6]">Price:</span>
                    <span className="font-bold">{currentBook.config.formatPrice(hoveredPoint.price)}</span>
                    <span className="text-[#8292A6]">Level Volume:</span>
                    <span>{currentBook.config.formatSize(hoveredPoint.size)}</span>
                    <span className="text-[#8292A6]">Cumulative:</span>
                    <span className="font-bold text-[#E5C794]">{currentBook.config.formatSize(hoveredPoint.total)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Narrative Insight Footer */}
            <div className="mt-2.5 pt-2 border-t border-white/5 flex items-start gap-1.5 text-[9.5px] text-[#BAC7D5]">
              <ShieldAlert className="w-3.5 h-3.5 text-[#B08D57] shrink-0 mt-0.5" />
              <span>
                <strong className="text-[#EDE9DE] uppercase">{currentBook.asset} Desk Intel: </strong>
                {currentBook.config.narrative}
              </span>
            </div>
          </div>

          {/* Micro DOM Ladder */}
          <div className="w-full lg:w-80 bg-[#0A111C]/90 rounded-lg p-3.5 border border-[#B08D57]/20 flex flex-col justify-between shrink-0">
            <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-white/5">
              <span className="text-[10px] font-bold text-[#EDE9DE] uppercase tracking-wider">
                {currentBook.asset} Micro Ladder
              </span>
              <span className="text-[9px] text-[#8292A6]">Top-of-Book DOM</span>
            </div>

            {/* Top Asks */}
            <div className="flex flex-col gap-1 mb-2">
              <div className="grid grid-cols-3 text-[9px] text-[#8292A6] px-1 uppercase font-semibold">
                <span>Price</span>
                <span className="text-right">Size</span>
                <span className="text-right">Total</span>
              </div>
              {currentBook.asks.slice(0, 5).reverse().map((ask, idx) => (
                <div key={`ask-${idx}`} className="grid grid-cols-3 text-[10px] px-1.5 py-0.5 rounded relative overflow-hidden hover:bg-white/5">
                  <div 
                    className="absolute right-0 top-0 bottom-0 bg-[#E11D48]/15 pointer-events-none"
                    style={{ width: `${Math.min(100, ask.percent * 2.5)}%` }}
                  />
                  <span className="text-[#F87171] font-bold z-10">
                    {currentBook.config.formatPrice(ask.price)}
                  </span>
                  <span className="text-right text-[#EDE9DE] z-10">
                    {Math.round(ask.size)}
                  </span>
                  <span className="text-right text-[#8292A6] z-10">
                    {Math.round(ask.total)}
                  </span>
                </div>
              ))}
            </div>

            {/* Spread Indicator */}
            <div className="py-1 px-2 my-1 bg-[#B08D57]/10 border border-[#B08D57]/30 rounded flex items-center justify-between text-[10px]">
              <span className="text-[#E5C794] font-bold">
                SPREAD: {currentBook.spreadVal}
              </span>
              <span className="text-[#8292A6] text-[9px]">
                RATIO: <span className="text-[#10B981] font-bold">{currentBook.imbalanceRatio}x</span>
              </span>
            </div>

            {/* Top Bids */}
            <div className="flex flex-col gap-1">
              {currentBook.bids.slice(0, 5).map((bid, idx) => (
                <div key={`bid-${idx}`} className="grid grid-cols-3 text-[10px] px-1.5 py-0.5 rounded relative overflow-hidden hover:bg-white/5">
                  <div 
                    className="absolute right-0 top-0 bottom-0 bg-[#10B981]/15 pointer-events-none"
                    style={{ width: `${Math.min(100, bid.percent * 2.5)}%` }}
                  />
                  <span className="text-[#34D399] font-bold z-10">
                    {currentBook.config.formatPrice(bid.price)}
                  </span>
                  <span className="text-right text-[#EDE9DE] z-10">
                    {Math.round(bid.size)}
                  </span>
                  <span className="text-right text-[#8292A6] z-10">
                    {Math.round(bid.total)}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-2.5 pt-2 border-t border-white/5 text-[9px] text-[#8292A6]">
              Depth calculated across ±{depthZoom}% scope with real-time level rebalancing.
            </div>
          </div>
        </div>
      ) : (
        /* Quad-Grid View Mode: All 4 Assets Side-by-Side */
        <div className="p-4 pt-1 grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#060A12]">
          {(["BTC/USD", "S&P 500", "XAU/USD", "IBEX 35"] as const).map((sym) => {
            const book = allBooks[sym];
            const cfg = book.config;

            return (
              <div 
                key={`quad-${sym}`}
                className="bg-[#0A111C]/90 rounded-lg p-3.5 border border-[#B08D57]/20 flex flex-col justify-between space-y-3 hover:border-[#B08D57]/50 transition-colors"
              >
                {/* Header */}
                <div className="flex items-center justify-between pb-2 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cfg.color }} />
                    <span className="font-bold text-[13px] text-[#EDE9DE]">{sym}</span>
                    <span className="text-[9px] text-[#8292A6]">({cfg.category})</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-[13px] text-[#FBF8F1]">{cfg.formatPrice(book.mid)}</div>
                    <div className="text-[8.5px] text-[#8292A6]">Spread: {book.spreadVal}</div>
                  </div>
                </div>

                {/* Mini Dual Pressure Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[9px]">
                    <span className="text-[#10B981] font-semibold">Bids: {book.bidPressurePct}%</span>
                    <span className="text-[8.5px] font-bold text-[#E5C794]">{book.imbalanceState}</span>
                    <span className="text-[#E11D48] font-semibold">Asks: {book.askPressurePct}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-black/60 overflow-hidden flex border border-[#B08D57]/20">
                    <div className="h-full bg-[#10B981]" style={{ width: `${book.bidPressurePct}%` }} />
                    <div className="h-full bg-[#E11D48]" style={{ width: `${book.askPressurePct}%` }} />
                  </div>
                </div>

                {/* Wall Highlights */}
                <div className="grid grid-cols-2 gap-2 text-[9px] bg-black/40 p-2 rounded border border-white/5">
                  <div>
                    <span className="text-[#8292A6] block">Key Bid Support:</span>
                    <span className="text-[#10B981] font-bold">
                      {cfg.formatPrice(book.bidWalls[0]?.price ?? book.bestBid)}
                    </span>
                    <span className="text-[#8292A6] block text-[8px]">
                      {cfg.formatSize(book.bidWalls[0]?.size ?? 0)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[#8292A6] block">Key Ask Overhang:</span>
                    <span className="text-[#E11D48] font-bold">
                      {cfg.formatPrice(book.askWalls[0]?.price ?? book.bestAsk)}
                    </span>
                    <span className="text-[#8292A6] block text-[8px]">
                      {cfg.formatSize(book.askWalls[0]?.size ?? 0)}
                    </span>
                  </div>
                </div>

                {/* Switch to Deep Dive for this Asset */}
                <button
                  onClick={() => {
                    setSelectedAsset(sym);
                    setViewMode("deep-dive");
                  }}
                  className="w-full py-1 text-center text-[10px] text-[#B08D57] hover:text-[#EDE9DE] bg-[#B08D57]/10 hover:bg-[#B08D57]/20 rounded transition-colors font-semibold uppercase tracking-wider"
                >
                  Open {sym} Deep Dive Order Flow →
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
