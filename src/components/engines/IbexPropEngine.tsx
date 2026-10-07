import React, { useState, useEffect, useMemo } from "react";
import { MacroDataState } from "../../types";
import {
  Maximize2,
  Minimize2,
  TrendingUp,
  Zap,
  Target,
  Layers,
  ArrowUpRight,
  BarChart2,
  Activity,
  ArrowDownRight,
  ShieldCheck,
  Radio,
  Globe,
  CheckCircle2,
  SlidersHorizontal,
  Crosshair
} from "lucide-react";
import { PropAssetChart } from "./PropAssetChart";
import { EquityCorrelationMatrix } from "./EquityCorrelationMatrix";

export type EquityIndexKey = "ibex" | "sp500" | "dax" | "nikkei" | "kospi" | "hangseng" | "btc";

interface GlobalEquityConfig {
  id: EquityIndexKey;
  symbol: string;
  name: string;
  country: string;
  flag: string;
  exchange: string;
  feedName: string;
  spot: number;
  dailyChange: string;
  isPositive: boolean;
  sessionOpen: number;
  bias: string;
  biasScore: string;
  biasBadgeClass: string;
  subtitle: string;
  // Order flow
  volumeDeltaLots: string;
  buyerPercent: number;
  sellerPercent: number;
  buyerLots: string;
  sellerLots: string;
  orderFlowRegime: string;
  cvdStatus: string;
  insideSpread: string;
  imbalanceText: string;
  // Pivots
  pivotDist: string;
  pivotDistLabel: string;
  centralPivot: number;
  r2: number;
  r1: number;
  s1: number;
  s2: number;
  // Volatility
  atrPts: string;
  spreadComparison: string;
  volRegime: string;
  // DOM ladder tick size & labels
  domTick: number;
  domLabels: {
    r1Label: string;
    bboAskLabel: string;
    bboBidLabel: string;
    bidAbsorption1: string;
    bidAbsorption2: string;
  };
  // Bellwether constituents for live tape
  constituents: {
    sym: string;
    name: string;
    weight: string;
  }[];
  // Session levels
  vah: number;
  vpoc: number;
  val: number;
  unfinishedAuction: string;
  vpocText: string;
  // Execution bias
  invalidation: string;
  rrRatio: string;
  executionRules: string;
  // Systems log
  systemLogs: string[];
  // Desk
  deskPosition: string;
  deskCode: string;
  correlations: { name: string; value: string; status: string }[];
}

interface IbexPropEngineProps {
  data?: MacroDataState["engines"]["ibexBias"];
  macroData?: MacroDataState;
  onExpandToggle?: () => void;
  isExpanded?: boolean;
  onOpenTerminal?: (customPrompt?: string) => void;
}

interface BlockTrade {
  id: string;
  time: string;
  sym: string;
  size: string;
  price: string;
  type: "BUY" | "SELL";
  tag: string;
  color: string;
}

export const IbexPropEngine: React.FC<IbexPropEngineProps> = ({
  data,
  macroData,
  onExpandToggle,
  isExpanded = false,
  onOpenTerminal,
}) => {
  const [selectedEquityKey, setSelectedEquityKey] = useState<EquityIndexKey>("ibex");
  const [activeSubTab, setActiveSubTab] = useState<"24H Chart" | "Correlation Matrix" | "Order Flow" | "Pivot Matrix" | "Execution Bias" | "Session Levels" | "Systems Log">("24H Chart");

  // Extract live prices from macroData tickers if available
  const getTickerPrice = (sym: string, defaultPrice: number): number => {
    if (!macroData?.tickers) return defaultPrice;
    const found = macroData.tickers.find(t => t.symbol.toUpperCase().includes(sym.toUpperCase()));
    return found ? found.price : defaultPrice;
  };

  const getTickerChange = (sym: string, defaultChange: string): string => {
    if (!macroData?.tickers) return defaultChange;
    const found = macroData.tickers.find(t => t.symbol.toUpperCase().includes(sym.toUpperCase()));
    if (!found) return defaultChange;
    const prefix = found.change >= 0 ? "+" : "";
    return `${prefix}${found.change.toFixed(2)}${found.changeUnit || "%"}`;
  };

  const ibexSpot = data?.level || getTickerPrice("IBEX", 19742.0);
  const sp500Spot = getTickerPrice("S&P 500", 7704.13);
  const daxSpot = getTickerPrice("DAX 40", 19535.0);
  const nikkeiSpot = getTickerPrice("NIKKEI", 66368.0);
  const kospiSpot = getTickerPrice("KOSPI", 1112.00);
  const hangsengSpot = getTickerPrice("HANG SENG", 25054.0);
  const btcSpot = getTickerPrice("BTC", 84450.0);

  // Dynamic level generators to keep levels congruent with live spot
  const isModernNikkei = nikkeiSpot > 50000;
  const nkPivot = isModernNikkei ? Math.round(nikkeiSpot * 0.9937 / 10) * 10 : 39000.0;
  const nkOpen = isModernNikkei ? Math.round(nikkeiSpot * 0.9665 / 10) * 10 : 38920.0;
  const nkR1 = isModernNikkei ? Math.round((nkPivot + 730) / 10) * 10 : 39420.0;
  const nkR2 = isModernNikkei ? Math.round((nkPivot + 1170) / 10) * 10 : 39600.0;
  const nkS1 = isModernNikkei ? Math.round((nkPivot - 530) / 10) * 10 : 38780.0;
  const nkS2 = isModernNikkei ? Math.round((nkPivot - 1100) / 10) * 10 : 38550.0;
  const nkVah = isModernNikkei ? Math.round((nikkeiSpot + 180) / 10) * 10 : 39360.0;
  const nkVpoc = isModernNikkei ? Math.round((nikkeiSpot - 90) / 10) * 10 : 39210.0;
  const nkVal = isModernNikkei ? Math.round((nikkeiSpot - 520) / 10) * 10 : 39050.0;

  const isModernKospi = kospiSpot > 700;
  const kpPivot = isModernKospi ? Number((kospiSpot * 0.9878).toFixed(2)) : 386.10;
  const kpOpen = isModernKospi ? Number((kospiSpot * 0.9804).toFixed(2)) : 385.40;
  const kpR1 = isModernKospi ? Number((kpPivot + 25.5).toFixed(2)) : 390.20;
  const kpR2 = isModernKospi ? Number((kpPivot + 39.5).toFixed(2)) : 392.50;
  const kpS1 = isModernKospi ? Number((kpPivot - 13.5).toFixed(2)) : 384.80;
  const kpS2 = isModernKospi ? Number((kpPivot - 26.5).toFixed(2)) : 382.40;
  const kpVah = isModernKospi ? Number((kospiSpot + 8.0).toFixed(2)) : 389.80;
  const kpVpoc = isModernKospi ? Number((kospiSpot - 3.5).toFixed(2)) : 388.20;
  const kpVal = isModernKospi ? Number((kospiSpot - 17.0).toFixed(2)) : 386.90;

  const isModernHsi = hangsengSpot > 22000;
  const hsPivot = isModernHsi ? Math.round(hangsengSpot * 0.9930 / 10) * 10 : 20650.0;
  const hsOpen = isModernHsi ? Math.round(hangsengSpot * 0.9945 / 10) * 10 : 20560.0;
  const hsR1 = isModernHsi ? Math.round((hsPivot + 400) / 10) * 10 : 21100.0;
  const hsR2 = isModernHsi ? Math.round((hsPivot + 770) / 10) * 10 : 21450.0;
  const hsS1 = isModernHsi ? Math.round((hsPivot - 230) / 10) * 10 : 20450.0;
  const hsS2 = isModernHsi ? Math.round((hsPivot - 500) / 10) * 10 : 20180.0;
  const hsVah = isModernHsi ? Math.round((hangsengSpot + 130) / 10) * 10 : 21080.0;
  const hsVpoc = isModernHsi ? Math.round((hangsengSpot - 70) / 10) * 10 : 20820.0;
  const hsVal = isModernHsi ? Math.round((hangsengSpot - 300) / 10) * 10 : 20580.0;

  // Dynamic tick engine to ensure volume delta, volatility ATR, and order flow fluctuate continuously
  const [tickCount, setTickCount] = useState<number>(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTickCount((prev) => (prev + 1) % 10000);
    }, 2400);
    return () => clearInterval(timer);
  }, []);

  const formatLogTime = (minutesAgo: number): string => {
    const d = new Date(Date.now() - minutesAgo * 60000);
    const h = d.getUTCHours().toString().padStart(2, "0");
    const m = d.getUTCMinutes().toString().padStart(2, "0");
    return `${h}:${m} GMT`;
  };

  // Dynamic order flow & volatility calculations across all 7 global benchmarks
  const equitiesConfig: Record<EquityIndexKey, GlobalEquityConfig> = useMemo(() => {
    // 1. IBEX 35 Telemetry
    const ibexBuyerPct = Number((68.4 + Math.sin(tickCount * 0.45) * 1.8).toFixed(1));
    const ibexSellerPct = Number((100 - ibexBuyerPct).toFixed(1));
    const ibexDeltaLots = 14280 + Math.round(Math.sin(tickCount * 0.4) * 220 + Math.cos(tickCount * 0.2) * 90);
    const ibexBuyerLots = `${(124.8 + (tickCount % 50) * 0.06 + Math.sin(tickCount * 0.3) * 0.4).toFixed(1)}k lots`;
    const ibexSellerLots = `${(58.4 + (tickCount % 50) * 0.03 + Math.cos(tickCount * 0.25) * 0.2).toFixed(1)}k lots`;
    const ibexAtrVal = Number((164.0 + Math.sin(tickCount * 0.35) * 3.8 + Math.cos(tickCount * 0.2) * 1.5).toFixed(1));
    const ibexVolRegime = ibexAtrVal >= 167 ? "Active Vol Expansion" : ibexAtrVal <= 162 ? "Normal Compressed" : "Steady Vol Trend";
    const daxChangeNum = parseFloat(getTickerChange("DAX 40", "+0.54%")) || 0.54;
    const ibexChangeNum = parseFloat(data?.dailyChange || getTickerChange("IBEX", "+0.91%")) || 0.91;
    const ibexSpreadBps = Math.round((ibexChangeNum - daxChangeNum) * 100);
    const ibexScoreVal = Math.min(95, Math.max(35, Math.round(68 + (ibexSpot > 19494 ? 6 : -6) + (ibexBuyerPct - 50) * 0.25 + Math.sin(tickCount * 0.3) * 2)));

    // 2. S&P 500 Telemetry
    const spBuyerPct = Number((71.2 + Math.cos(tickCount * 0.4) * 1.5).toFixed(1));
    const spSellerPct = Number((100 - spBuyerPct).toFixed(1));
    const spDeltaLots = 84550 + Math.round(Math.cos(tickCount * 0.4) * 640 + Math.sin(tickCount * 0.25) * 280);
    const spBuyerLots = `${(412.5 + (tickCount % 60) * 0.12 + Math.sin(tickCount * 0.3) * 0.8).toFixed(1)}k lots`;
    const spSellerLots = `${(166.8 + (tickCount % 60) * 0.05 + Math.cos(tickCount * 0.25) * 0.4).toFixed(1)}k lots`;
    const spAtrVal = Number((42.5 + Math.sin(tickCount * 0.35) * 1.2 + Math.cos(tickCount * 0.15) * 0.5).toFixed(1));
    const spVolRegime = spAtrVal >= 44 ? "Gamma Expansion" : "Low Vol Trend";
    const vixTickerPrice = getTickerPrice("VIX", 18.95);
    const spScoreVal = Math.min(96, Math.max(40, Math.round(78 + (sp500Spot > 7635.8 ? 5 : -5) + (spBuyerPct - 50) * 0.3)));

    // 3. DAX 40 Telemetry
    const daxBuyerPct = Number((64.5 + Math.sin(tickCount * 0.4) * 1.6).toFixed(1));
    const daxSellerPct = Number((100 - daxBuyerPct).toFixed(1));
    const daxDeltaLots = 22140 + Math.round(Math.sin(tickCount * 0.35) * 260 + Math.cos(tickCount * 0.5) * 120);
    const daxBuyerLots = `${(89.2 + (tickCount % 40) * 0.05 + Math.sin(tickCount * 0.3) * 0.4).toFixed(1)}k lots`;
    const daxSellerLots = `${(49.1 + (tickCount % 40) * 0.03 + Math.cos(tickCount * 0.25) * 0.2).toFixed(1)}k lots`;
    const daxAtrVal = Number((148.0 + Math.sin(tickCount * 0.4) * 3.4).toFixed(1));
    const fesxChangeNum = parseFloat(getTickerChange("EURO STOXX 50", "+0.38%")) || 0.38;
    const daxSpreadSx5e = Math.round((daxChangeNum - fesxChangeNum) * 100);
    const daxScoreVal = Math.min(92, Math.max(35, Math.round(64 + (daxSpot > 19550 ? 5 : -5) + (daxBuyerPct - 50) * 0.25)));
    const daxVolRegime = daxAtrVal >= 151 ? "Active Vol Expansion" : "Tight Consolidation";

    // 4. Nikkei 225 Telemetry
    const nkBuyerPct = Number((66.8 + Math.cos(tickCount * 0.35) * 1.8).toFixed(1));
    const nkSellerPct = Number((100 - nkBuyerPct).toFixed(1));
    const nkDeltaLots = 36800 + Math.round(Math.cos(tickCount * 0.45) * 420 + Math.sin(tickCount * 0.3) * 180);
    const nkBuyerLots = `${(148.6 + (tickCount % 50) * 0.08 + Math.sin(tickCount * 0.3) * 0.5).toFixed(1)}k lots`;
    const nkSellerLots = `${(73.9 + (tickCount % 50) * 0.04 + Math.cos(tickCount * 0.25) * 0.3).toFixed(1)}k lots`;
    const nkAtrBase = isModernNikkei ? 850 : 420;
    const nkAtrVal = Number((nkAtrBase + Math.cos(tickCount * 0.35) * 18.0).toFixed(0));
    const nkScoreVal = Math.min(95, Math.max(40, Math.round(72 + (nikkeiSpot > nkPivot ? 6 : -6) + (nkBuyerPct - 50) * 0.3)));
    const nkVolRegime = nkAtrVal > nkAtrBase ? "Expansion Breakout" : "Orderly Trend";

    // 5. KOSPI 200 Telemetry
    const kpBuyerPct = Number((62.1 + Math.sin(tickCount * 0.4) * 1.5).toFixed(1));
    const kpSellerPct = Number((100 - kpBuyerPct).toFixed(1));
    const kpDeltaLots = 18400 + Math.round(Math.sin(tickCount * 0.4) * 230 + Math.cos(tickCount * 0.3) * 90);
    const kpBuyerLots = `${(64.2 + (tickCount % 40) * 0.04 + Math.sin(tickCount * 0.3) * 0.3).toFixed(1)}k lots`;
    const kpSellerLots = `${(39.2 + (tickCount % 40) * 0.02 + Math.cos(tickCount * 0.25) * 0.2).toFixed(1)}k lots`;
    const kpAtrBase = isModernKospi ? 14.5 : 4.6;
    const kpAtrVal = Number((kpAtrBase + Math.sin(tickCount * 0.3) * 0.6).toFixed(1));
    const kpScoreVal = Math.min(94, Math.max(35, Math.round(70 + (kospiSpot > kpPivot ? 6 : -6) + (kpBuyerPct - 50) * 0.3)));

    // 6. Hang Seng Telemetry
    const hsBuyerPct = Number((68.4 + Math.cos(tickCount * 0.5) * 1.7).toFixed(1));
    const hsSellerPct = Number((100 - hsBuyerPct).toFixed(1));
    const hsDeltaLots = 8920 + Math.round(Math.cos(tickCount * 0.45) * 150 + Math.sin(tickCount * 0.2) * 70);
    const hsBuyerLots = `${(28.5 + (tickCount % 40) * 0.03 + Math.sin(tickCount * 0.3) * 0.2).toFixed(1)}k Lots`;
    const hsSellerLots = `${(13.2 + (tickCount % 40) * 0.02 + Math.cos(tickCount * 0.25) * 0.1).toFixed(1)}k Lots`;
    const hsAtrBase = isModernHsi ? 520 : 420;
    const hsAtrVal = Number((hsAtrBase + Math.sin(tickCount * 0.45) * 12.0).toFixed(0));
    const hsScoreVal = Math.min(95, Math.max(40, Math.round(78 + (hangsengSpot > hsPivot ? 6 : -6) + (hsBuyerPct - 50) * 0.35)));

    // 7. $BTC Spot & CME Telemetry
    const btcBuyerPct = Number((71.2 + Math.sin(tickCount * 0.45) * 1.6).toFixed(1));
    const btcSellerPct = Number((100 - btcBuyerPct).toFixed(1));
    const btcDeltaLots = 4850 + Math.round(Math.sin(tickCount * 0.5) * 52 + Math.cos(tickCount * 0.35) * 24);
    const btcBuyerLots = `${(17.4 + (tickCount % 40) * 0.03 + Math.sin(tickCount * 0.3) * 0.2).toFixed(1)}k BTC`;
    const btcSellerLots = `${(7.1 + (tickCount % 40) * 0.01 + Math.cos(tickCount * 0.25) * 0.1).toFixed(1)}k BTC`;
    const btcAtrVal = Math.round(2850 + Math.sin(tickCount * 0.4) * 85);
    const btcScoreVal = Math.min(98, Math.max(45, Math.round(86 + (btcSpot > 78800 ? 6 : -6) + (btcBuyerPct - 50) * 0.35)));

    return {
      ibex: {
        id: "ibex",
        symbol: "IBEX 35",
        name: "IBEX 35 Benchmark",
        country: "Spain",
        flag: "🇪🇸",
        exchange: "BME MEFF Madrid",
        feedName: "MEFF / BME Madrid Institutional Feed",
        spot: ibexSpot,
        dailyChange: data?.dailyChange || getTickerChange("IBEX", "+0.91%"),
        isPositive: true,
        sessionOpen: 20088.0,
        bias: "BULLISH BIAS",
        biasScore: `+${ibexScoreVal} / 100`,
        biasBadgeClass: "bg-[#10B981]/25 text-[#34D399] border-[#10B981]/50",
        subtitle: "COREFUNDED PROP EXECUTION BIAS & BME MEFF ORDER FLOW",
        volumeDeltaLots: `+${ibexDeltaLots.toLocaleString()} lots`,
        buyerPercent: ibexBuyerPct,
        sellerPercent: ibexSellerPct,
        buyerLots: ibexBuyerLots,
        sellerLots: ibexSellerLots,
        orderFlowRegime: ibexBuyerPct >= 70 ? "Gamma Squeeze" : "Absorption",
        cvdStatus: ibexBuyerPct >= 68 ? "CVD Long Expansion" : "CVD Long",
        insideSpread: `${(1.0 + (Math.sin(tickCount * 0.6) > 0.4 ? 0.5 : 0)).toFixed(1)} pt`,
        imbalanceText: `+${Math.round((ibexBuyerPct - 50) * 2)}% Bid Delta`,
        pivotDist: (ibexSpot - 19494).toFixed(1),
        pivotDistLabel: "Above Pivot",
        centralPivot: 19494.0,
        r2: 20060.0,
        r1: 19950.0,
        s1: 19700.0,
        s2: 19560.0,
        atrPts: `${ibexAtrVal} pts ATR`,
        spreadComparison: `IBEX / DAX ${ibexSpreadBps >= 0 ? '+' : ''}${ibexSpreadBps} bps`,
        volRegime: ibexVolRegime,
        domTick: 5.0,
        domLabels: {
          r1Label: "R1 Supply Wall",
          bboAskLabel: "Best Ask",
          bboBidLabel: "Best Bid",
          bidAbsorption1: "Santander Bid Absorption",
          bidAbsorption2: "BBVA Iceberg Cluster"
        },
        constituents: [
          { sym: "IBEX", name: "IBEX 35 Future", weight: "Index" },
          { sym: "SAN", name: "Banco Santander", weight: "18.4%" },
          { sym: "BBVA", name: "Banco Bilbao Vizcaya", weight: "15.8%" },
          { sym: "ITX", name: "Inditex", weight: "14.2%" },
          { sym: "TEF", name: "Telefónica", weight: "5.1%" },
          { sym: "REP", name: "Repsol", weight: "4.8%" }
        ],
        vah: 20240.0,
        vpoc: 20120.0,
        val: 20010.0,
        unfinishedAuction: "20,280 (Supply Magnet)",
        vpocText: `20,120 (${(48.2 + (tickCount % 20) * 0.1).toFixed(1)}k lots)`,
        invalidation: "19,880 (Close Below S1)",
        rrRatio: "3.4:1 into 20,600",
        executionRules: "System is currently holding a high-conviction long alignment following European open auction liquidity sweeps at 20,088. Santander and BBVA order flows indicate aggressive institutional accumulation.",
        systemLogs: [
          `${formatLogTime(18)}: System booted with European Pre-Market Volatility Filter: GREEN`,
          `${formatLogTime(11)}: Long scalp filled @ ${(ibexSpot - 18).toFixed(1)}, Stop loss moved to breakeven`,
          `${formatLogTime(5)}: BBVA volume delta +14.2%, confirming continuation long`,
          `${formatLogTime(1)}: Institutional iceberg detected in SAN at ${(ibexSpot + 4.5).toFixed(1)}`
        ],
        deskPosition: "Scalp long on 19,700 rejection; Core swing target 20,100",
        deskCode: "SMC_PROP_v8.1",
        correlations: [
          { name: "IBEX / DAX Spread", value: `${ibexSpreadBps >= 0 ? '+' : ''}${ibexSpreadBps} bps`, status: ibexSpreadBps >= 0 ? "Outperforming" : "Underperforming" },
          { name: "Euro Stoxx 50 Beta", value: "1.14x", status: "High Sensitivity" },
          { name: "Santander/BBVA Weight", value: "34.2%", status: "Banking Tailwinds" },
          { name: "Inditex Momentum", value: "RSI 62", status: "Consolidating" }
        ]
      },
      sp500: {
        id: "sp500",
        symbol: "S&P 500",
        name: "S&P 500 Large-Cap",
        country: "United States",
        flag: "🇺🇸",
        exchange: "CME Globex Chicago",
        feedName: "CME Globex E-mini ES Direct Depth",
        spot: sp500Spot,
        dailyChange: getTickerChange("S&P 500", "+0.42%"),
        isPositive: true,
        sessionOpen: 7634.6,
        bias: "BULLISH EXPANSION",
        biasScore: `+${spScoreVal} / 100`,
        biasBadgeClass: "bg-[#10B981]/25 text-[#34D399] border-[#10B981]/50",
        subtitle: "CME E-MINI PROP EXECUTION BIAS & INSTITUTIONAL GAMMA PROFILES",
        volumeDeltaLots: `+${spDeltaLots.toLocaleString()} contracts`,
        buyerPercent: spBuyerPct,
        sellerPercent: spSellerPct,
        buyerLots: spBuyerLots,
        sellerLots: spSellerLots,
        orderFlowRegime: spBuyerPct >= 72 ? "Gamma Squeeze" : "Institutional Bid Flow",
        cvdStatus: "CVD Long Expansion",
        insideSpread: `${(0.25 + (Math.cos(tickCount * 0.5) > 0.6 ? 0.25 : 0)).toFixed(2)} pt`,
        imbalanceText: `+${Math.round((spBuyerPct - 50) * 2)}% Buy Imbalance`,
        pivotDist: (sp500Spot - 7635.8).toFixed(1),
        pivotDistLabel: "Above Pivot",
        centralPivot: 7635.8,
        r2: 7710.0,
        r1: 7680.0,
        s1: 7615.0,
        s2: 7580.0,
        atrPts: `${spAtrVal} pts ATR`,
        spreadComparison: `SPX Implied Move ${(vixTickerPrice * 0.036).toFixed(2)}%`,
        volRegime: spVolRegime,
        domTick: 2.5,
        domLabels: {
          r1Label: "Gamma Wall 7680",
          bboAskLabel: "Best Ask",
          bboBidLabel: "Best Bid",
          bidAbsorption1: "JPMorgan JEPQ Put Wall",
          bidAbsorption2: "Citadel CTA Bid Shelf"
        },
        constituents: [
          { sym: "ES", name: "E-mini S&P 500", weight: "Benchmark" },
          { sym: "NVDA", name: "NVIDIA Corp", weight: "7.8%" },
          { sym: "AAPL", name: "Apple Inc", weight: "6.9%" },
          { sym: "MSFT", name: "Microsoft Corp", weight: "6.4%" },
          { sym: "AMZN", name: "Amazon.com", weight: "4.1%" },
          { sym: "META", name: "Meta Platforms", weight: "2.9%" }
        ],
        vah: 7678.0,
        vpoc: 7652.0,
        val: 7624.0,
        unfinishedAuction: "7,692 (Overnight High Magnet)",
        vpocText: `7,652 (${(312 + (tickCount % 20) * 0.5).toFixed(0)}k contracts)`,
        invalidation: "7,610 (Break Below Overnight Low)",
        rrRatio: "4.1:1 into 7,720",
        executionRules: "System holding high-probability expansion posture. Mega-cap tech breadth holding above +2.8 standard deviations. Systematic CTAs actively bidding any test of the 7,635 VWAP shelf.",
        systemLogs: [
          `${formatLogTime(19)}: US Cash Open rotation shows aggressive buy sweeps on E-mini ES`,
          `${formatLogTime(13)}: Systematic CTA trigger hit at ${(sp500Spot - 8).toFixed(1)}, mechanical bid acceleration`,
          `${formatLogTime(6)}: Zero-DTE gamma flip level established at 7,650 strike`,
          `${formatLogTime(1)}: Large block prints detected in NVDA (+120k shares @ market)`
        ],
        deskPosition: "Long E-mini ES; Buy pullbacks toward 7,635 VWAP shelf; Target 7,710",
        deskCode: "SMC_SPX_v9.2",
        correlations: [
          { name: "Nasdaq 100 Correlation", value: "+0.94", status: "High Coherence" },
          { name: "VIX Term Structure", value: `Contango (${vixTickerPrice.toFixed(2)})`, status: "Risk-On Bias" },
          { name: "Mega-Cap Tech Breadth", value: "+74% Advancing", status: "Broad Liquidity" },
          { name: "Treasury 10Y Yield Beta", value: "-0.41", status: "Rates Support" }
        ]
      },
      dax: {
        id: "dax",
        symbol: "DAX 40",
        name: "Frankfurt DAX Index",
        country: "Germany",
        flag: "🇩🇪",
        exchange: "Eurex Frankfurt",
        feedName: "Eurex FDAX Level 2 Depth Order Book",
        spot: daxSpot,
        dailyChange: getTickerChange("DAX 40", "+0.54%"),
        isPositive: true,
        sessionOpen: 19520.0,
        bias: "MOMENTUM LONG",
        biasScore: `+${daxScoreVal} / 100`,
        biasBadgeClass: "bg-[#10B981]/25 text-[#34D399] border-[#10B981]/50",
        subtitle: "EUREX INSTITUTIONAL ORDER FLOW & VOLATILITY CONVERGENCE",
        volumeDeltaLots: `+${daxDeltaLots.toLocaleString()} contracts`,
        buyerPercent: daxBuyerPct,
        sellerPercent: daxSellerPct,
        buyerLots: daxBuyerLots,
        sellerLots: daxSellerLots,
        orderFlowRegime: "Institutional Accumulation",
        cvdStatus: "CVD Delta Divergence",
        insideSpread: `${(0.5 + (Math.sin(tickCount * 0.5) > 0.5 ? 0.5 : 0)).toFixed(1)} pt`,
        imbalanceText: `+${Math.round((daxBuyerPct - 50) * 2)}% Bid Delta`,
        pivotDist: (daxSpot - 19550).toFixed(1),
        pivotDistLabel: "Above Pivot",
        centralPivot: 19550.0,
        r2: 19780.0,
        r1: 19690.0,
        s1: 19480.0,
        s2: 19390.0,
        atrPts: `${daxAtrVal} pts ATR`,
        spreadComparison: `DAX / SX5E ${daxSpreadSx5e >= 0 ? '+' : ''}${daxSpreadSx5e} bps`,
        volRegime: daxVolRegime,
        domTick: 5.0,
        domLabels: {
          r1Label: "R1 Supply Wall",
          bboAskLabel: "Best Ask",
          bboBidLabel: "Best Bid",
          bidAbsorption1: "SAP Institutional Bid Wall",
          bidAbsorption2: "Siemens Eurex Iceberg"
        },
        constituents: [
          { sym: "FDAX", name: "DAX 40 Future", weight: "Index" },
          { sym: "SAP", name: "SAP SE", weight: "14.8%" },
          { sym: "SIE", name: "Siemens AG", weight: "10.4%" },
          { sym: "ALV", name: "Allianz SE", weight: "7.9%" },
          { sym: "DTE", name: "Deutsche Telekom", weight: "6.2%" },
          { sym: "BMW", name: "BMW AG", weight: "3.4%" }
        ],
        vah: 19660.0,
        vpoc: 19610.0,
        val: 19540.0,
        unfinishedAuction: "19,715 (Single Prints Magnet)",
        vpocText: `19,610 (${(62 + (tickCount % 20) * 0.2).toFixed(0)}k contracts)`,
        invalidation: "19,460 (Loss of Value Area Low)",
        rrRatio: "3.2:1 into 19,850",
        executionRules: "System holding European session trend alignment. Industrial export proxies reacting favorably to weaker EUR/USD. Eurex order flow shows steady institutional accumulation above the 19,550 pivot.",
        systemLogs: [
          `${formatLogTime(20)}: Eurex opening cross prints 14,200 contracts with positive delta`,
          `${formatLogTime(14)}: SAP breaks out past 52-week high; tech weighting carries DAX`,
          `${formatLogTime(7)}: German Bund 10Y yield softening, equity multiple relief`,
          `${formatLogTime(1)}: Institutional buy iceberg confirmed in SIE at ${(daxSpot - 12).toFixed(1)}`
        ],
        deskPosition: "Long FDAX; Value area acceptance above 19,600; Target 19,780",
        deskCode: "SMC_DAX_v6.4",
        correlations: [
          { name: "Euro Stoxx 50 Spread", value: `${daxSpreadSx5e >= 0 ? '+' : ''}${daxSpreadSx5e} bps`, status: "Leading Europe" },
          { name: "EUR/USD Inverse Beta", value: "-0.62", status: "Export Tailwind" },
          { name: "Bund 10Y Yield Spread", value: "+3.2 bps", status: "Stable Margin" },
          { name: "Automotive Basket RSI", value: "54.2", status: "Neutral Accumulation" }
        ]
      },
      nikkei: {
        id: "nikkei",
        symbol: "Nikkei 225",
        name: "Tokyo Nikkei 225",
        country: "Japan",
        flag: "🇯🇵",
        exchange: "JPX / OSE Osaka",
        feedName: "JPX / Osaka Exchange NK225 Direct Feed",
        spot: nikkeiSpot,
        dailyChange: getTickerChange("NIKKEI", "+3.47%"),
        isPositive: true,
        sessionOpen: nkOpen,
        bias: "ROTATION LONG",
        biasScore: `+${nkScoreVal} / 100`,
        biasBadgeClass: "bg-[#10B981]/25 text-[#34D399] border-[#10B981]/50",
        subtitle: "JPX NIKKEI PROP EXECUTION & BOJ YEN SENSITIVITY DYNAMICS",
        volumeDeltaLots: `+${nkDeltaLots.toLocaleString()} contracts`,
        buyerPercent: nkBuyerPct,
        sellerPercent: nkSellerPct,
        buyerLots: nkBuyerLots,
        sellerLots: nkSellerLots,
        orderFlowRegime: "Foreign Inflow",
        cvdStatus: "Carry Unwind Cushion",
        insideSpread: isModernNikkei ? `${15 + (Math.sin(tickCount) > 0.3 ? 5 : 0)} pts` : "10 pts",
        imbalanceText: `+${Math.round((nkBuyerPct - 50) * 2)}% Bid Delta`,
        pivotDist: Math.abs(nikkeiSpot - nkPivot).toFixed(0),
        pivotDistLabel: nikkeiSpot >= nkPivot ? "Above Pivot" : "Below Pivot",
        centralPivot: nkPivot,
        r2: nkR2,
        r1: nkR1,
        s1: nkS1,
        s2: nkS2,
        atrPts: `${nkAtrVal} pts ATR`,
        spreadComparison: `Nikkei Realized Vol ${(18.2 + Math.sin(tickCount * 0.25) * 0.6).toFixed(1)}%`,
        volRegime: nkVolRegime,
        domTick: isModernNikkei ? 50.0 : 20.0,
        domLabels: {
          r1Label: "Fast Retailing Supply Wall",
          bboAskLabel: "Best Ask",
          bboBidLabel: "Best Bid",
          bidAbsorption1: "GPIF Pension Bid Anchor",
          bidAbsorption2: "BoJ Carry Buyer Shelf"
        },
        constituents: [
          { sym: "NK225", name: "Nikkei 225 Future", weight: "Index" },
          { sym: "9983", name: "Fast Retailing", weight: "10.8%" },
          { sym: "8035", name: "Tokyo Electron", weight: "7.9%" },
          { sym: "6758", name: "Sony Group", weight: "4.8%" },
          { sym: "7203", name: "Toyota Motor", weight: "4.2%" },
          { sym: "9984", name: "SoftBank Group", weight: "3.9%" }
        ],
        vah: nkVah,
        vpoc: nkVpoc,
        val: nkVal,
        unfinishedAuction: isModernNikkei ? "66,850 (Gap Fill Magnet)" : "39,480 (Gap Fill Magnet)",
        vpocText: `${nkVpoc.toLocaleString()} (94k contracts)`,
        invalidation: isModernNikkei ? "65,200 (Failure at BoJ Pivot)" : "38,720 (Failure at BoJ Pivot)",
        rrRatio: "3.8:1 into Target",
        executionRules: "System tracking heavy foreign capital inflows into Japanese export equities and semi-conductor supply chain giants. Yen stabilizing post-BoJ jawboning provides optimal equity multiple expansion.",
        systemLogs: [
          `${formatLogTime(22)}: Tokyo Cash Open prints 28k lot gap up on Nikkei 225 mini`,
          `${formatLogTime(15)}: Tokyo Electron and Advantest surge on global AI capex demand`,
          `${formatLogTime(8)}: BoJ quiet window triggers automated CTA carry bids`,
          `${formatLogTime(2)}: Afternoon auction closes at session highs with strong MOC buy orders`
        ],
        deskPosition: isModernNikkei ? "Long Nikkei 225 futures; Fade yen spike dips above 65,800; Target 67,120" : "Long Nikkei 225 futures; Fade yen spike dips above 38,900; Target 39,500",
        deskCode: "SMC_NKX_v5.1",
        correlations: [
          { name: "USD/JPY Inverse Elasticity", value: "-0.71", status: "Stabilizing" },
          { name: "Semiconductor Sub-Index", value: "+2.4%", status: "Sector Leader" },
          { name: "JGB 10Y Yield", value: "0.985%", status: "BoJ Monitored" },
          { name: "Foreign Net Inflows", value: "+¥320B (WTD)", status: "Strong Inflow" }
        ]
      },
      kospi: {
        id: "kospi",
        symbol: "KOSPI 200",
        name: "Korea Composite 200",
        country: "South Korea",
        flag: "🇰🇷",
        exchange: "KRX Seoul",
        feedName: "KRX KOSPI 200 Institutional Telemetry",
        spot: kospiSpot,
        dailyChange: getTickerChange("KOSPI", "+2.00%"),
        isPositive: true,
        sessionOpen: kpOpen,
        bias: "BULLISH BREAKOUT",
        biasScore: `+${kpScoreVal} / 100`,
        biasBadgeClass: "bg-[#10B981]/25 text-[#34D399] border-[#10B981]/50",
        subtitle: "KRX HIGH-BETA TECH ALLOCATION & FOREIGN FLOW DYNAMICS",
        volumeDeltaLots: `+${kpDeltaLots.toLocaleString()} contracts`,
        buyerPercent: kpBuyerPct,
        sellerPercent: kpSellerPct,
        buyerLots: kpBuyerLots,
        sellerLots: kpSellerLots,
        orderFlowRegime: "Tech Squeeze",
        cvdStatus: "Foreign Net Buy",
        insideSpread: isModernKospi ? `${(0.15 + (Math.cos(tickCount) > 0.4 ? 0.05 : 0)).toFixed(2)} pt` : "0.05 pt",
        imbalanceText: `+${Math.round((kpBuyerPct - 50) * 2)}% Bid Delta`,
        pivotDist: Math.abs(kospiSpot - kpPivot).toFixed(2),
        pivotDistLabel: kospiSpot >= kpPivot ? "Above Pivot" : "Below Pivot",
        centralPivot: kpPivot,
        r2: kpR2,
        r1: kpR1,
        s1: kpS1,
        s2: kpS2,
        atrPts: `${kpAtrVal} pts ATR`,
        spreadComparison: `KOSPI Vol ${(15.8 + Math.cos(tickCount * 0.3) * 0.5).toFixed(1)}%`,
        volRegime: "Steady Flow",
        domTick: isModernKospi ? 0.50 : 0.25,
        domLabels: {
          r1Label: "High Supply Wall",
          bboAskLabel: "Best Ask",
          bboBidLabel: "Best Bid",
          bidAbsorption1: "Samsung Electronics Buy Wall",
          bidAbsorption2: "SK Hynix Memory Iceberg"
        },
        constituents: [
          { sym: "K200", name: "KOSPI 200 Future", weight: "Index" },
          { sym: "005930", name: "Samsung Electronics", weight: "21.4%" },
          { sym: "000660", name: "SK Hynix", weight: "9.8%" },
          { sym: "005380", name: "Hyundai Motor", weight: "4.1%" },
          { sym: "035420", name: "NAVER Corp", weight: "2.8%" }
        ],
        vah: kpVah,
        vpoc: kpVpoc,
        val: kpVal,
        unfinishedAuction: isModernKospi ? "1,128.00 (High Magnet)" : "391.50 (High Magnet)",
        vpocText: `${kpVpoc.toFixed(2)} (45k contracts)`,
        invalidation: isModernKospi ? "1,080.00 (Close Below S1)" : "384.20 (Close Below S1)",
        rrRatio: "3.1:1 into Target",
        executionRules: "System targeting Korean HBM memory semiconductor super-cycle. Foreign algorithmic accounts net buyers for 4 consecutive sessions, absorbing all local pension rebalancing offers.",
        systemLogs: [
          `${formatLogTime(25)}: Seoul Cash Open gap up driven by memory supply contracts`,
          `${formatLogTime(18)}: SK Hynix cross-order block execution (+450k shares)`,
          `${formatLogTime(10)}: Won/USD stabilization triggers quantitative CTA baskets`,
          `${formatLogTime(3)}: KRX closing auction marks highest daily volume in 3 weeks`
        ],
        deskPosition: isModernKospi ? "Long KOSPI 200 semiconductor beta; Target 1,138.00" : "Long KOSPI 200 semiconductor beta; Target 392.50",
        deskCode: "SMC_K200_v4.0",
        correlations: [
          { name: "HBM Memory Index", value: "+3.8%", status: "Strong Catalyst" },
          { name: "KRW/USD Currency Delta", value: "-0.35%", status: "Won Resilient" },
          { name: "Taiwan TAIEX Beta", value: "0.89x", status: "Regional Semi Rally" },
          { name: "Foreign Net Buying", value: "+₩480B", status: "Accumulation" }
        ]
      },
      hangseng: {
        id: "hangseng",
        symbol: "Hang Seng",
        name: "Hang Seng Index",
        country: "Hong Kong",
        flag: "🇭🇰",
        exchange: "HKEX Hong Kong",
        feedName: "HKEX Hang Seng Direct Telemetry",
        spot: hangsengSpot,
        dailyChange: getTickerChange("HANG SENG", "+0.55%"),
        isPositive: true,
        sessionOpen: hsOpen,
        bias: "STIMULUS EXPANSION",
        biasScore: `+${hsScoreVal} / 100`,
        biasBadgeClass: "bg-[#10B981]/20 text-[#34D399] border-[#10B981]/40",
        subtitle: "HKEX HANG SENG PROP BIAS & PBOC STIMULUS LIQUIDITY EXPANSION",
        volumeDeltaLots: `+${hsDeltaLots.toLocaleString()} Lots`,
        buyerPercent: hsBuyerPct,
        sellerPercent: hsSellerPct,
        buyerLots: hsBuyerLots,
        sellerLots: hsSellerLots,
        orderFlowRegime: "Stimulus Inflow",
        cvdStatus: "Strong Bullish Cumulative Delta",
        insideSpread: isModernHsi ? `${(5.0 + (Math.sin(tickCount) > 0.5 ? 2.5 : 0)).toFixed(1)} pts` : "2.0 pts",
        imbalanceText: `+${Math.round((hsBuyerPct - 50) * 2)}% Bid Delta`,
        pivotDist: Math.abs(hangsengSpot - hsPivot).toFixed(0),
        pivotDistLabel: hangsengSpot >= hsPivot ? "Above Pivot" : "Below Pivot",
        centralPivot: hsPivot,
        r2: hsR2,
        r1: hsR1,
        s1: hsS1,
        s2: hsS2,
        atrPts: `${hsAtrVal} pts ATR`,
        spreadComparison: `HSI Volatility ${(21.4 + Math.sin(tickCount * 0.35) * 0.8).toFixed(1)}%`,
        volRegime: "Expansion Breakout",
        domTick: isModernHsi ? 10.0 : 5.0,
        domLabels: {
          r1Label: "HKEX Supply Wall",
          bboAskLabel: "Best Ask",
          bboBidLabel: "Best Bid",
          bidAbsorption1: "Southbound Stock Connect Bid Shelf",
          bidAbsorption2: "Institutional Cash Open Floor"
        },
        constituents: [
          { sym: "TENCENT", name: "Tencent Holdings", weight: "8.4%" },
          { sym: "ALIBABA", name: "Alibaba Group", weight: "7.8%" },
          { sym: "MEITUAN", name: "Meituan Tech", weight: "6.2%" },
          { sym: "CCB", name: "China Construction Bank", weight: "5.5%" },
          { sym: "AIA", name: "AIA Group", weight: "5.1%" },
          { sym: "BYD", name: "BYD Company", weight: "3.9%" }
        ],
        vah: hsVah,
        vpoc: hsVpoc,
        val: hsVal,
        unfinishedAuction: isModernHsi ? "25,350 (Liquidity Pool Magnet)" : "21,240 (Liquidity Pool Magnet)",
        vpocText: `${hsVpoc.toLocaleString()} (68k HSI contracts)`,
        invalidation: isModernHsi ? "24,500 (Loss of Central Pivot Shelf)" : "20,380 (Loss of Central Pivot Shelf)",
        rrRatio: "3.4:1 into Target",
        executionRules: "System detecting strong Southbound Stock Connect net capital inflows (+$1.2B HKD equivalent), aggressive bid replenishment at the pivot shelf, and platform tech momentum breakouts. Cross-regional divergence vs European equities is acute as Asian stimulus buffers geopolitical energy transmission.",
        systemLogs: [
          `${formatLogTime(26)}: PBOC medium-term lending facility injection boosts liquidity`,
          `${formatLogTime(19)}: Southbound Stock Connect registers +$480M HKD in first 45 minutes`,
          `${formatLogTime(11)}: Tech platform constituents advance +2.8% on automated buy programs`,
          `${formatLogTime(3)}: Closing auction secures high volume print above resistance`
        ],
        deskPosition: isModernHsi ? "Long Hang Seng futures; Defend 24,800 shelf; Target 25,650" : "Long Hang Seng futures; Defend 20,600 shelf; Target 21,350",
        deskCode: "SMC_HSI_v5.4",
        correlations: [
          { name: "Southbound Flow", value: "+$1.2B HKD", status: "Strong Inflow" },
          { name: "KOSPI Beta", value: "0.78x", status: "High Coherence" },
          { name: "USD/CNH Delta", value: "-0.28%", status: "Yuan Resilient" },
          { name: "European Spread (DAX)", value: "+170 bps", status: "Regional Outperformance" }
        ]
      },
      btc: {
        id: "btc",
        symbol: "$BTC",
        name: "Bitcoin Spot & CME",
        country: "Digital Gold",
        flag: "₿",
        exchange: "CME Globex / Coinbase Prime",
        feedName: "CME Globex / Deribit Institutional Telemetry",
        spot: btcSpot,
        dailyChange: getTickerChange("BTC", "+2.48%"),
        isPositive: true,
        sessionOpen: 77500.0,
        bias: "BULLISH BREAKOUT",
        biasScore: `+${btcScoreVal} / 100`,
        biasBadgeClass: "bg-[#F7931A]/20 text-[#F7931A] border-[#F7931A]/40",
        subtitle: "CME GLOBEX BITCOIN PROP BIAS & SPOT ETF INFLOW DYNAMICS",
        volumeDeltaLots: `+${btcDeltaLots.toLocaleString()} BTC`,
        buyerPercent: btcBuyerPct,
        sellerPercent: btcSellerPct,
        buyerLots: btcBuyerLots,
        sellerLots: btcSellerLots,
        orderFlowRegime: "Spot ETF Inflow",
        cvdStatus: "CVD Momentum Expansion",
        insideSpread: `$${(5.00 + (Math.cos(tickCount) > 0.3 ? 2.50 : 0)).toFixed(2)}`,
        imbalanceText: `+${Math.round((btcBuyerPct - 50) * 2)}% Bid Delta`,
        pivotDist: (btcSpot - 78800).toFixed(0),
        pivotDistLabel: "Above Pivot",
        centralPivot: 78800.0,
        r2: 83500.0,
        r1: 81200.0,
        s1: 76900.0,
        s2: 74500.0,
        atrPts: `$${btcAtrVal.toLocaleString()} ATR`,
        spreadComparison: `BTC / Gold ${(btcSpot / getTickerPrice("XAU", 4408)).toFixed(1)}x Ratio`,
        volRegime: "Expansion Breakout",
        domTick: 100.0,
        domLabels: {
          r1Label: "Deribit $82k Gamma Call Wall",
          bboAskLabel: "Best Ask",
          bboBidLabel: "Best Bid",
          bidAbsorption1: "BlackRock IBIT Inflow Shelf",
          bidAbsorption2: "CME Basis Institutional Floor"
        },
        constituents: [
          { sym: "BTC-PERP", name: "Binance/Deribit Perp", weight: "Derivatives" },
          { sym: "CME-BTC", name: "CME Bitcoin Future", weight: "Institutional" },
          { sym: "IBIT", name: "iShares Bitcoin Trust", weight: "Spot ETF" },
          { sym: "FBTC", name: "Fidelity Wise Origin", weight: "Spot ETF" },
          { sym: "MSTR", name: "MicroStrategy Treasury", weight: "Corp Proxy" },
          { sym: "COIN", name: "Coinbase Global Prime", weight: "Custody" }
        ],
        vah: 81150.0,
        vpoc: 79250.0,
        val: 77800.0,
        unfinishedAuction: "$82,400 (Liquidity Pool Magnet)",
        vpocText: `79,250 (${(32.4 + (tickCount % 20) * 0.1).toFixed(1)}k BTC contracts)`,
        invalidation: "$76,500 (Loss of ETF Inflow Floor)",
        rrRatio: "4.2:1 into $85,000",
        executionRules: "System tracking steady spot ETF capital inflows (+$418M daily pace), widening CME futures basis premium (+8.6% annualized), and aggressive market order absorption above the $78,800 central pivot. Funding rates remain moderate, indicating sustained spot-driven accumulation rather than excessive leverage.",
        systemLogs: [
          `${formatLogTime(28)}: London cross prints +640 BTC net taker buy flow on Deribit`,
          `${formatLogTime(17)}: US Spot ETF opening session registers $320M net inflow pace`,
          `${formatLogTime(9)}: Institutional iceberg buy order filled at ${(btcSpot - 150).toFixed(0)} on Coinbase Prime`,
          `${formatLogTime(2)}: CME basis premium widens to +450 pts over spot; momentum buy triggered`
        ],
        deskPosition: "Long $BTC / CME Bitcoin; Trail stop below $76,900; Target $83,500",
        deskCode: "SMC_BTC_v9.2",
        correlations: [
          { name: "Spot ETF Net Flow", value: "+$418M / Day", status: "Institutional Accumulation" },
          { name: "CME Basis Premium", value: "+8.6% Ann.", status: "Bullish Carry" },
          { name: "Perp Funding Rate", value: "+0.012% / 8h", status: "Healthy Leverage" },
          { name: "Gold / BTC Ratio Beta", value: "+0.64", status: "Digital Gold Leading" }
        ]
      }
    };
  }, [ibexSpot, sp500Spot, daxSpot, nikkeiSpot, kospiSpot, hangsengSpot, btcSpot, data, tickCount, macroData]);

  const currentEquity = equitiesConfig[selectedEquityKey] || equitiesConfig.ibex;
  const currentLevel = currentEquity.spot;

  // Build dynamic DOM Ladder centered on current live level with flickering institutional depth
  const domLadder = useMemo(() => {
    const tick = currentEquity.domTick;
    const isSingleDecimal = currentLevel < 1000;
    const formatPrice = (val: number) => isSingleDecimal ? val.toFixed(2) : (currentLevel >= 10000 ? val.toFixed(0) : val.toFixed(1));

    const osc1 = Math.round(Math.sin(tickCount + 1) * 85);
    const osc2 = Math.round(Math.cos(tickCount + 2) * 95);
    const osc3 = Math.round(Math.sin(tickCount + 3) * 60);
    const osc4 = Math.round(Math.cos(tickCount + 4) * 40);
    const osc5 = Math.round(Math.sin(tickCount + 5) * 80);
    const osc6 = Math.round(Math.cos(tickCount + 6) * 120);
    const osc7 = Math.round(Math.sin(tickCount + 7) * 140);
    const osc8 = Math.round(Math.cos(tickCount + 8) * 75);

    return [
      { price: Number(formatPrice(currentLevel + tick * 3)), askSize: Math.max(120, 1420 + osc1), bidSize: 0, type: "ask", label: currentEquity.domLabels.r1Label },
      { price: Number(formatPrice(currentLevel + tick * 2)), askSize: Math.max(90, 980 + osc2), bidSize: 0, type: "ask", label: "" },
      { price: Number(formatPrice(currentLevel + tick * 1)), askSize: Math.max(80, 640 + osc3), bidSize: 0, type: "ask", label: "" },
      { price: Number(formatPrice(currentLevel + tick * 0.2)), askSize: Math.max(40, 320 + osc4), bidSize: 0, type: "ask-bbo", label: currentEquity.domLabels.bboAskLabel },
      { price: Number(formatPrice(currentLevel - tick * 0.2)), askSize: 0, bidSize: Math.max(60, 840 + osc5), type: "bid-bbo", label: currentEquity.domLabels.bboBidLabel },
      { price: Number(formatPrice(currentLevel - tick * 1)), askSize: 0, bidSize: Math.max(110, 1890 + osc6), type: "bid", label: currentEquity.domLabels.bidAbsorption1 },
      { price: Number(formatPrice(currentLevel - tick * 2)), askSize: 0, bidSize: Math.max(150, 2450 + osc7), type: "bid", label: currentEquity.domLabels.bidAbsorption2 },
      { price: Number(formatPrice(currentLevel - tick * 3)), askSize: 0, bidSize: Math.max(90, 1120 + osc8), type: "bid", label: "" }
    ];
  }, [currentEquity, currentLevel, tickCount]);

  // Initial simulated block trades
  const [trades, setTrades] = useState<BlockTrade[]>([]);

  // Reset and seed trades whenever selected equity changes
  useEffect(() => {
    const constituents = currentEquity.constituents;
    const now = new Date();
    const timeBase = now.toTimeString().split(" ")[0];
    const sec1 = new Date(now.getTime() - 25000).toTimeString().split(" ")[0];
    const sec2 = new Date(now.getTime() - 65000).toTimeString().split(" ")[0];
    const sec3 = new Date(now.getTime() - 110000).toTimeString().split(" ")[0];

    const lotUnit = currentEquity.id === "btc" ? "BTC" : (currentEquity.id === "sp500" || currentEquity.id === "dax" ? "contracts" : "lots");

    const initialTrades: BlockTrade[] = [
      {
        id: "t1",
        time: timeBase,
        sym: constituents[0]?.sym || currentEquity.symbol,
        size: currentEquity.id === "btc" ? "+45 BTC" : "+450 " + lotUnit,
        price: currentEquity.spot.toLocaleString(),
        type: "BUY",
        tag: "Aggressive Sweep",
        color: "text-[#10B981]"
      },
      {
        id: "t2",
        time: sec1,
        sym: constituents[1]?.sym || "BELL1",
        size: currentEquity.id === "btc" ? "+28 BTC" : "+320 " + lotUnit,
        price: (currentEquity.spot - currentEquity.domTick).toLocaleString(),
        type: "BUY",
        tag: "Iceberg Fill",
        color: "text-[#10B981]"
      },
      {
        id: "t3",
        time: sec2,
        sym: constituents[2]?.sym || "BELL2",
        size: currentEquity.id === "btc" ? "-14 BTC" : "-140 " + lotUnit,
        price: (currentEquity.spot + currentEquity.domTick * 0.5).toLocaleString(),
        type: "SELL",
        tag: "Pullback Ask",
        color: "text-[#FF8585]"
      },
      {
        id: "t4",
        time: sec3,
        sym: constituents[3]?.sym || "BELL3",
        size: currentEquity.id === "btc" ? "+62 BTC" : "+580 " + lotUnit,
        price: (currentEquity.spot - currentEquity.domTick * 1.5).toLocaleString(),
        type: "BUY",
        tag: "Institutional Bid",
        color: "text-[#10B981]"
      }
    ];

    setTrades(initialTrades);
  }, [selectedEquityKey, currentEquity]);

  // Dynamic live tape simulation
  useEffect(() => {
    const constituents = currentEquity.constituents.map(c => c.sym);
    const tags = [
      { tag: "Aggressive Sweep", type: "BUY" as const, color: "text-[#10B981]" },
      { tag: "Iceberg Fill", type: "BUY" as const, color: "text-[#10B981]" },
      { tag: "Institutional Bid", type: "BUY" as const, color: "text-[#10B981]" },
      { tag: "Pullback Ask", type: "SELL" as const, color: "text-[#FF8585]" },
      { tag: "Offer Hit", type: "SELL" as const, color: "text-[#FF8585]" }
    ];

    const interval = setInterval(() => {
      const now = new Date();
      const timeStr = now.toTimeString().split(" ")[0];
      const randomSym = constituents[Math.floor(Math.random() * constituents.length)] || currentEquity.symbol;
      const randomTag = tags[Math.floor(Math.random() * tags.length)];
      const sizeMultiplier = Math.floor(Math.random() * 6) + 1;
      const lotUnit = currentEquity.id === "btc" ? "BTC" : (currentEquity.id === "sp500" || currentEquity.id === "dax" ? "contracts" : "lots");
      const lotSize = `${randomTag.type === "BUY" ? "+" : "-"}${currentEquity.id === "btc" ? (Math.floor(Math.random() * 35) + 5) : (sizeMultiplier * 80 + Math.floor(Math.random() * 50))} ${lotUnit}`;
      const tickOffset = (Math.random() * 2 - 1) * currentEquity.domTick;
      const randomPrice = (currentLevel + tickOffset).toLocaleString();

      const newTrade: BlockTrade = {
        id: Date.now().toString(),
        time: timeStr,
        sym: randomSym,
        size: lotSize,
        price: randomPrice,
        type: randomTag.type,
        tag: randomTag.tag,
        color: randomTag.color
      };

      setTrades(prev => [newTrade, ...prev.slice(0, 4)]);
    }, 3200);

    return () => clearInterval(interval);
  }, [selectedEquityKey, currentEquity, currentLevel]);

  // Equity list for selector tabs (including Hang Seng & $BTC)
  const equityList: EquityIndexKey[] = ["ibex", "sp500", "dax", "nikkei", "kospi", "hangseng", "btc"];

  return (
    <div
      id="global-equities-prop-engine-card"
      className={
        isExpanded
          ? "space-y-6 text-[#EDE9DE]"
          : "bg-[#101622] border border-[#B08D57]/35 hover:border-[#B08D57]/55 rounded-xl p-4 sm:p-6 transition-all shadow-2xl flex flex-col justify-between relative group overflow-hidden"
      }
    >
      {/* Subtle top brass highlight */}
      {!isExpanded && (
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#B08D57]/60 to-transparent pointer-events-none" />
      )}

      <div>
        {/* GLOBAL EQUITIES & CRYPTO SELECTOR STRIP */}
        <div className="mb-4 pb-3 border-b border-[#B08D57]/20">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono-data uppercase tracking-wider text-[#8292A6] flex items-center gap-1.5 font-bold">
                <Globe className="w-3.5 h-3.5 text-[#B08D57]" />
                <span>GLOBAL BENCHMARKS & $BTC PROP EXECUTION SYSTEMS</span>
              </span>
              <span className="text-[9px] font-mono-data text-[#B08D57] hidden sm:inline">
                24H BENCHMARK SYNC
              </span>
            </div>

            {onExpandToggle && (
              <button
                id="ibex-engine-fullscreen-btn"
                onClick={onExpandToggle}
                title={isExpanded ? "Collapse View" : "Expand Fullscreen"}
                aria-label={isExpanded ? "Collapse View" : "Expand Fullscreen"}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/70 border border-[#B08D57]/35 hover:border-[#B08D57] text-[#BAC7D5] hover:text-[#E5C794] transition-all shrink-0 cursor-pointer shadow-sm active:scale-95"
              >
                {isExpanded ? (
                  <>
                    <Minimize2 className="w-3.5 h-3.5 text-[#E5C794]" />
                    <span className="text-[9px] font-mono-data uppercase font-semibold">Exit Fullscreen</span>
                  </>
                ) : (
                  <>
                    <Maximize2 className="w-3.5 h-3.5 text-[#B08D57]" />
                    <span className="text-[9px] font-mono-data uppercase font-semibold">Fullscreen</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Quick-Select Equity & $BTC Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-1.5 sm:gap-2">
            {equityList.map((eqKey) => {
              const eq = equitiesConfig[eqKey];
              const isSelected = selectedEquityKey === eqKey;
              return (
                <button
                  key={eqKey}
                  id={`equity-select-${eqKey}`}
                  onClick={() => setSelectedEquityKey(eqKey)}
                  className={`p-2 rounded-lg border text-left transition-all flex flex-col justify-between font-mono-data cursor-pointer ${
                    isSelected
                      ? "bg-[#1B2233] border-[#B08D57] text-[#FBF8F1] shadow-[0_0_15px_rgba(176,141,87,0.25)] ring-1 ring-[#B08D57]"
                      : "bg-black/40 border-[#222C3D] text-[#8292A6] hover:text-[#EDE9DE] hover:border-[#B08D57]/40 hover:bg-black/60"
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] gap-1">
                    <span className="font-bold flex items-center gap-1 truncate text-[#EDE9DE]">
                      <span>{eq.flag}</span>
                      <span>{eq.symbol}</span>
                    </span>
                    <span className="text-[8.5px] uppercase text-[#8292A6] shrink-0 truncate">
                      {eq.country.slice(0, 3).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between mt-1 gap-1">
                    <span className="text-xs font-bold text-[#EDE9DE] truncate">
                      {eq.spot.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                    </span>
                    <span className={`text-[9.5px] font-semibold ${eq.isPositive ? "text-[#10B981]" : "text-[#FF8585]"}`}>
                      {eq.dailyChange}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tri-Regional Divergence Pulse Banner */}
        <div className="mb-3 p-2 sm:p-2.5 rounded-lg bg-black/60 border border-[#B08D57]/30 flex flex-wrap items-center justify-between gap-2 text-xs font-mono-data shadow-sm">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="flex items-center gap-1 text-[#E5C794] font-bold text-[10.5px]">
              <Zap className="w-3.5 h-3.5 text-[#B08D57]" />
              <span>TRI-REGIONAL DIVERGENCE ACTIVE:</span>
            </span>
            <span className="text-emerald-400 font-bold text-[10.5px] flex items-center gap-1">
              <span>ASIA GREEN 🟢</span>
              <span className="text-[9.5px] text-[#A7F3D0]">(KOSPI +0.83%, NIKKEI +0.74%, HSI +1.36%)</span>
            </span>
            <span className="text-[#38BDF8] font-bold text-[10.5px] flex items-center gap-1">
              <span>US RESILIENT 🔷</span>
              <span className="text-[9.5px] text-[#BAE6FD]">(S&P +0.18%, NQ +0.42%, DOW +0.12%)</span>
            </span>
            <span className="text-[#8292A6] text-[10px]">vs</span>
            <span className="text-rose-400 font-bold text-[10.5px] flex items-center gap-1">
              <span>EU DOWN 🔴</span>
              <span className="text-[9.5px] text-[#FECDD3]">(DAX -0.34%, IBEX -0.28%, STOXX -0.38%)</span>
            </span>
          </div>
          <button
            onClick={() => setActiveSubTab("Correlation Matrix")}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#B08D57]/20 hover:bg-[#B08D57]/35 text-[#E5C794] border border-[#B08D57]/45 text-[10px] font-bold transition-all cursor-pointer shadow-sm active:scale-95 ml-auto"
          >
            <span>Open Tri-Regional Matrix</span>
            <ArrowUpRight className="w-3 h-3 text-[#B08D57]" />
          </button>
        </div>

        {/* Top Header & Sub-Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#B08D57]/30">
          <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
            <h3
              className="font-serif italic text-xl sm:text-2xl font-bold tracking-tight text-[#FBF8F1]"
              style={{ fontFamily: "Georgia, 'Newsreader', serif" }}
            >
              {currentEquity.symbol} Market Bias & Systems
            </h3>
            <span
              className={`text-[9px] font-mono-data font-bold uppercase tracking-wider px-2.5 py-0.5 rounded shadow-sm border ${currentEquity.biasBadgeClass}`}
            >
              {currentEquity.bias}
            </span>
            <span className="text-[9.5px] font-mono-data text-[#8292A6] bg-black/60 px-2 py-0.5 rounded border border-[#B08D57]/20 hidden md:inline">
              {currentEquity.exchange}
            </span>
            {onOpenTerminal && (
              <button
                onClick={() => onOpenTerminal(`Report detailed execution plan for ${currentEquity.symbol}: order type, entry criteria, key levels, invalidation, and position sizing`)}
                className="flex items-center gap-1 text-[9px] font-mono-data bg-[#B08D57]/20 hover:bg-[#B08D57]/35 text-[#E5C794] border border-[#B08D57]/40 px-2 py-0.5 rounded transition-all hover:scale-102 cursor-pointer shadow-sm"
                title={`View SMC Strategy Playbook for ${currentEquity.symbol}`}
              >
                <Crosshair className="w-3 h-3 text-[#B08D57]" />
                <span className="hidden sm:inline">Strategy Playbook</span>
                <span className="sm:hidden">Strategy</span>
              </button>
            )}
          </div>

          {/* Sub Tab Switcher */}
          <div className="flex items-center bg-black/70 p-1 rounded-lg border border-[#B08D57]/30 text-[10px] font-mono-data shadow-inner overflow-x-auto no-scrollbar max-w-full">
            {(["24H Chart", "Correlation Matrix", "Order Flow", "Pivot Matrix", "Execution Bias", "Session Levels", "Systems Log"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveSubTab(tab)}
                className={`px-2.5 py-1 rounded transition-all uppercase font-medium shrink-0 whitespace-nowrap ${
                  activeSubTab === tab
                    ? "bg-[#B08D57] text-[#0A111C] font-bold shadow-md scale-105"
                    : tab === "Correlation Matrix"
                    ? "text-[#E5C794] border border-[#B08D57]/40 hover:bg-[#B08D57]/15 font-semibold"
                    : "text-[#BAC7D5] hover:text-[#FBF8F1] hover:bg-white/5"
                }`}
              >
                {tab === "Correlation Matrix" ? "⚡ Correlation Matrix" : tab}
              </button>
            ))}
          </div>
        </div>

        {/* Subtitle */}
        <p className="text-[10px] font-mono-data tracking-widest text-[#BAC7D5] mt-2 mb-4 uppercase font-semibold">
          {currentEquity.subtitle}
        </p>

        {/* 4 Stat Cards Row */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-2.5 sm:gap-3 mb-5">
          {/* 1. Spot Level */}
          <div className="bg-black/40 border border-[#B08D57]/15 rounded-lg p-2.5 sm:p-3 flex flex-col justify-between min-w-0 overflow-hidden">
            <div className="flex items-center justify-between text-[10px] font-mono-data text-[#8292A6] gap-1">
              <span className="uppercase tracking-wider font-medium truncate">{currentEquity.symbol} Spot</span>
              <svg className="w-7 h-3 text-[#B08D57] shrink-0" viewBox="0 0 50 20" fill="none">
                <path d="M2 16 L 14 14 L 28 8 L 38 10 L 48 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <div className="mt-1.5">
              <div className="text-lg sm:text-xl font-bold font-mono-data text-[#EDE9DE] leading-tight truncate">
                {currentEquity.spot.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
              </div>
              <div className="flex items-center justify-between text-[10px] font-mono-data mt-1 gap-1">
                <span className="text-[#B08D57] font-semibold truncate">{currentEquity.dailyChange}</span>
                <span className="text-[#8292A6] truncate">{currentEquity.country}</span>
              </div>
            </div>
            <div className="text-[9px] font-mono-data text-[#8292A6] mt-1.5 border-t border-[#B08D57]/10 pt-1 truncate">
              Session Open: <span className="text-[#EDE9DE] font-semibold">{currentEquity.sessionOpen.toLocaleString()}</span>
            </div>
          </div>

          {/* 2. Order Flow Delta (CVD) */}
          <div className="bg-black/50 border border-[#10B981]/40 rounded-lg p-2.5 sm:p-3 relative shadow-[0_0_15px_rgba(16,185,129,0.12)] flex flex-col justify-between min-w-0 overflow-hidden">
            <div className="text-[10px] font-mono-data text-[#10B981] flex items-center justify-between uppercase tracking-wider gap-1">
              <span className="font-medium truncate">Volume Delta</span>
              <Activity className="w-3 h-3 text-[#10B981] shrink-0" />
            </div>
            <div className="mt-1.5">
              <div className="text-lg sm:text-xl font-bold font-mono-data text-[#10B981] leading-tight flex items-baseline gap-1 truncate">
                <span>{currentEquity.volumeDeltaLots}</span>
              </div>
              <div className="flex items-center justify-between text-[9.5px] font-mono-data mt-1 gap-1">
                <span className="text-[#EDE9DE] truncate">{currentEquity.buyerPercent}% Buyers</span>
                <span className="text-[#10B981] font-semibold truncate">{currentEquity.cvdStatus}</span>
              </div>
            </div>
            <div className="text-[9px] font-mono-data text-[#8292A6] mt-1.5 border-t border-[#10B981]/20 pt-1 truncate">
              Order Flow: <span className="text-[#10B981] font-semibold">{currentEquity.orderFlowRegime}</span>
            </div>
          </div>

          {/* 3. Pivot Delta */}
          <div className="bg-black/40 border border-[#B08D57]/15 rounded-lg p-2.5 sm:p-3 flex flex-col justify-between min-w-0 overflow-hidden">
            <div className="text-[10px] font-mono-data text-[#8292A6] uppercase tracking-wider font-medium truncate">
              Pivot Delta
            </div>
            <div className="mt-1.5">
              <div className="text-lg sm:text-xl font-bold font-mono-data text-[#B08D57] leading-tight flex items-baseline gap-1 truncate">
                <span>+{currentEquity.pivotDist}</span>
                <span className="text-[10px] text-[#8292A6] font-normal">pts</span>
              </div>
              <div className="flex items-center justify-between text-[9.5px] font-mono-data mt-1 gap-1">
                <span className="text-[#10B981] font-semibold truncate">{currentEquity.pivotDistLabel}</span>
                <span className="text-[#8292A6] truncate">{currentEquity.bias}</span>
              </div>
            </div>
            <div className="text-[9px] font-mono-data text-[#8292A6] mt-1.5 border-t border-[#B08D57]/10 pt-1 truncate">
              Central Pivot: <span className="text-[#EDE9DE] font-semibold">{currentEquity.centralPivot.toLocaleString()}</span>
            </div>
          </div>

          {/* 4. Volatility ATR */}
          <div className="bg-black/40 border border-[#B08D57]/15 rounded-lg p-2.5 sm:p-3 flex flex-col justify-between min-w-0 overflow-hidden">
            <div className="text-[10px] font-mono-data text-[#8292A6] uppercase tracking-wider font-medium truncate">
              Volatility ATR
            </div>
            <div className="mt-1.5">
              <div className="text-lg sm:text-xl font-bold font-mono-data text-[#EDE9DE] leading-tight flex items-baseline gap-1 truncate">
                <span>{currentEquity.atrPts}</span>
              </div>
              <div className="flex items-center justify-between text-[9.5px] font-mono-data mt-1 gap-1">
                <span className="text-[#8292A6] truncate">{currentEquity.spreadComparison}</span>
                <span className="text-[#B08D57] font-semibold truncate">{currentEquity.biasScore}</span>
              </div>
            </div>
            <div className="text-[9px] font-mono-data text-[#8292A6] mt-1.5 border-t border-[#B08D57]/10 pt-1 truncate">
              Regime: <span className="text-[#EDE9DE] font-semibold">{currentEquity.volRegime}</span>
            </div>
          </div>
        </div>

        {/* Tab Content: 24H INTERACTIVE CHART */}
        {activeSubTab === "24H Chart" && (
          <div className="space-y-4">
            <PropAssetChart
              symbol={currentEquity.symbol}
              name={currentEquity.name}
              flag={currentEquity.flag}
              exchange={currentEquity.exchange}
              spot={currentEquity.spot}
              dailyChange={currentEquity.dailyChange}
              isPositive={currentEquity.isPositive}
              centralPivot={currentEquity.centralPivot}
              r1={currentEquity.r1}
              r2={currentEquity.r2}
              s1={currentEquity.s1}
              s2={currentEquity.s2}
              vah={currentEquity.vah}
              vpoc={currentEquity.vpoc}
              val={currentEquity.val}
              unfinishedAuction={currentEquity.unfinishedAuction}
              assetKey={selectedEquityKey}
              macroData={macroData}
              isExpanded={isExpanded}
              atrPts={currentEquity.atrPts}
              volumeDeltaLots={currentEquity.volumeDeltaLots}
            />
          </div>
        )}

        {/* Tab Content: CORRELATION MATRIX (EU VS ASIA DIVERGENCE) */}
        {activeSubTab === "Correlation Matrix" && (
          <div className="space-y-4">
            <EquityCorrelationMatrix
              macroData={macroData}
              onOpenTerminal={onOpenTerminal}
            />
          </div>
        )}

        {/* Tab Content 1: ORDER FLOW */}
        {activeSubTab === "Order Flow" && (
          <div className="space-y-4">
            {/* Top Order Flow Stats Bar */}
            <div className="bg-black/60 border border-[#B08D57]/20 rounded p-3 text-xs font-mono-data space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#B08D57]/10">
                <div className="flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5 text-[#10B981]" />
                  <span className="font-bold text-[#EDE9DE] uppercase text-[11px]">
                    {currentEquity.symbol} INSTITUTIONAL ORDER FLOW & DEPTH OF MARKET (DOM)
                  </span>
                </div>
                <span className="text-[9px] text-[#8292A6]">{currentEquity.feedName}</span>
              </div>

              {/* Volume Delta Bar (Buyers vs Sellers) */}
              <div className="space-y-1">
                <div className="flex justify-between text-[9px]">
                  <span className="text-[#10B981] font-bold">
                    Aggressive Buyers: {currentEquity.buyerPercent}% ({currentEquity.buyerLots})
                  </span>
                  <span className="text-[#FF8585] font-bold">
                    Aggressive Sellers: {currentEquity.sellerPercent}% ({currentEquity.sellerLots})
                  </span>
                </div>
                <div className="h-2 w-full bg-black/80 rounded-full overflow-hidden flex border border-[#B08D57]/20">
                  <div className="bg-[#10B981] h-full" style={{ width: `${currentEquity.buyerPercent}%` }} />
                  <div className="bg-[#FF8585] h-full" style={{ width: `${currentEquity.sellerPercent}%` }} />
                </div>
              </div>
            </div>

            {/* Grid with Level 2 DOM Ladder + Live Institutional Block Prints */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
              {/* Level 2 DOM Ladder */}
              <div className="bg-black/40 border border-[#B08D57]/15 rounded p-3 space-y-2 font-mono-data text-xs overflow-hidden">
                <div className="flex justify-between items-center text-[10px] text-[#8292A6] uppercase tracking-wider pb-1 border-b border-[#B08D57]/15">
                  <span>Bid Size</span>
                  <span className="font-bold text-[#EDE9DE]">Price Ladder ({currentEquity.symbol})</span>
                  <span>Ask Size</span>
                </div>

                <div className="space-y-1">
                  {domLadder.map((row, idx) => {
                    const isBBO = row.type.includes("bbo");
                    const maxDepth = 2500;
                    const bidPercent = Math.min(100, (row.bidSize / maxDepth) * 100);
                    const askPercent = Math.min(100, (row.askSize / maxDepth) * 100);

                    return (
                      <div
                        key={idx}
                        className={`flex items-center justify-between text-[10px] py-0.5 px-2 rounded relative overflow-hidden ${
                          isBBO ? "bg-[#B08D57]/15 border border-[#B08D57]/30" : "bg-black/20"
                        }`}
                      >
                        {/* Bid Depth background bar */}
                        {row.bidSize > 0 && (
                          <div
                            className="absolute left-0 top-0 bottom-0 bg-[#10B981]/15 pointer-events-none"
                            style={{ width: `${bidPercent}%` }}
                          />
                        )}
                        {/* Ask Depth background bar */}
                        {row.askSize > 0 && (
                          <div
                            className="absolute right-0 top-0 bottom-0 bg-[#FF8585]/15 pointer-events-none"
                            style={{ width: `${askPercent}%` }}
                          />
                        )}

                        {/* Bid Size Text */}
                        <div className="w-16 text-left text-[#10B981] font-bold z-10">
                          {row.bidSize > 0 ? row.bidSize.toLocaleString() : "-"}
                        </div>

                        {/* Center Price */}
                        <div className="flex items-center gap-1.5 z-10">
                          <span
                            className={`font-bold ${
                              isBBO
                                ? "text-[#E5C794]"
                                : row.type.includes("ask")
                                ? "text-[#EDE9DE]"
                                : "text-[#EDE9DE]"
                            }`}
                          >
                            {row.price.toLocaleString()}
                          </span>
                          {row.label && (
                            <span className="text-[7.5px] px-1 py-0.2 rounded bg-black/70 text-[#8292A6] border border-[#B08D57]/20 uppercase">
                              {row.label}
                            </span>
                          )}
                        </div>

                        {/* Ask Size Text */}
                        <div className="w-16 text-right text-[#FF8585] font-bold z-10">
                          {row.askSize > 0 ? row.askSize.toLocaleString() : "-"}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-between text-[9px] text-[#8292A6] pt-1.5 border-t border-[#B08D57]/10">
                  <span>Inside Spread: {currentEquity.insideSpread}</span>
                  <span className="text-[#10B981] font-bold">Imbalance: {currentEquity.imbalanceText}</span>
                </div>
              </div>

              {/* Institutional Block Prints & Footprint */}
              <div className="bg-black/40 border border-[#B08D57]/15 rounded p-3 space-y-2 font-mono-data text-xs flex flex-col justify-between overflow-hidden">
                <div>
                  <div className="flex items-center justify-between pb-1.5 border-b border-[#B08D57]/20">
                    <div className="flex items-center gap-1.5">
                      <Radio className="w-3 h-3 text-[#10B981]" />
                      <span className="text-[10px] text-[#EDE9DE] uppercase tracking-wider font-bold">
                        {currentEquity.symbol} Institutional Block Tape
                      </span>
                    </div>
                    <span className="text-[8.5px] text-[#10B981] bg-[#10B981]/15 px-1.5 py-0.5 rounded border border-[#10B981]/30">
                      STREAMING TICKS
                    </span>
                  </div>

                  {/* Grid Column Headers */}
                  <div className="grid grid-cols-12 gap-1 text-[8.5px] text-[#8292A6] uppercase tracking-wider py-1 border-b border-[#B08D57]/10 font-bold">
                    <span className="col-span-3">Time</span>
                    <span className="col-span-2">Sym</span>
                    <span className="col-span-4">Block Execution</span>
                    <span className="col-span-3 text-right">Signature</span>
                  </div>

                  {/* Trade Rows */}
                  <div className="space-y-1.5 mt-1.5">
                    {trades.map((trade) => (
                      <div
                        key={trade.id}
                        className="grid grid-cols-12 gap-1 items-center text-[9.5px] py-1 px-1.5 rounded bg-black/50 border border-[#B08D57]/10 transition-all hover:border-[#B08D57]/30 animate-in fade-in duration-300"
                      >
                        <span className="col-span-3 text-[#8292A6] text-[9px] truncate">{trade.time}</span>
                        <span className="col-span-2 font-bold text-[#EDE9DE]">{trade.sym}</span>
                        <div className="col-span-4 flex items-center gap-1 min-w-0">
                          <span className={`font-bold ${trade.color} shrink-0`}>{trade.size}</span>
                          <span className="text-[#8292A6] text-[8.5px] truncate">@{trade.price}</span>
                        </div>
                        <div className="col-span-3 flex justify-end">
                          <span
                            className={`text-[7.5px] font-bold px-1.5 py-0.5 rounded uppercase tracking-tight truncate ${
                              trade.type === "BUY"
                                ? "bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30"
                                : "bg-[#FF8585]/20 text-[#FF8585] border border-[#FF8585]/30"
                            }`}
                            title={trade.tag}
                          >
                            {trade.tag}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Key Profile Markers */}
                <div className="pt-2 border-t border-[#B08D57]/10 grid grid-cols-2 gap-2 text-[9px]">
                  <div>
                    <span className="text-[#8292A6] block">VPOC (Heavy Volume):</span>
                    <span className="text-[#B08D57] font-bold">{currentEquity.vpocText}</span>
                  </div>
                  <div>
                    <span className="text-[#8292A6] block">Unfinished Auction:</span>
                    <span className="text-[#EDE9DE] font-bold">{currentEquity.unfinishedAuction}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content 1: PIVOT MATRIX */}
        {activeSubTab === "Pivot Matrix" && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[10px] font-mono-data mb-2">
              <span className="uppercase tracking-wider text-[#B08D57] font-semibold">
                {currentEquity.symbol} QUANTITATIVE PIVOT & LIQUIDITY MATRIX
              </span>
              <span className="text-[#8292A6]">
                Spot: <strong className="text-[#EDE9DE]">{currentEquity.spot.toLocaleString()}</strong> ({currentEquity.dailyChange})
              </span>
            </div>
            <div className="space-y-2">
              {/* R2 */}
              {(() => {
                const dist = currentEquity.r2 - currentEquity.spot;
                return (
                  <div className="rounded p-2.5 bg-black/40 border border-[#B08D57]/15 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="font-mono-data font-bold text-sm text-[#FF8585]">
                        {currentEquity.r2.toLocaleString()}
                      </span>
                      <span className="text-[10px] font-mono-data text-[#8292A6]">
                        R2 RESISTANCE // Volatility Expansion Target ({dist > 0 ? `+${dist.toFixed(1)} pts away` : `TESTED (+${Math.abs(dist).toFixed(1)} pts)`})
                      </span>
                    </div>
                    <span className="text-[9px] font-mono-data bg-black/60 text-[#FF8585] border border-[#FF8585]/30 px-2 py-0.5 rounded font-bold">
                      {dist <= 0 ? "TARGET REACHED" : "TAKE PROFIT"}
                    </span>
                  </div>
                );
              })()}

              {/* R1 */}
              {(() => {
                const dist = currentEquity.r1 - currentEquity.spot;
                return (
                  <div className="rounded p-2.5 bg-black/40 border border-[#B08D57]/15 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="font-mono-data font-bold text-sm text-[#E5C794]">
                        {currentEquity.r1.toLocaleString()}
                      </span>
                      <span className="text-[10px] font-mono-data text-[#8292A6]">
                        R1 RESISTANCE // Primary Value Area Distribution ({dist > 0 ? `+${dist.toFixed(1)} pts away` : `EXPANDED (+${Math.abs(dist).toFixed(1)} pts)`})
                      </span>
                    </div>
                    <span className="text-[9px] font-mono-data bg-[#B08D57]/20 text-[#B08D57] px-2 py-0.5 rounded font-bold">
                      {dist <= 0 ? "DISTRIBUTION ACTIVE" : "SWING TARGET"}
                    </span>
                  </div>
                );
              })()}

              {/* Central Pivot - Current zone */}
              {(() => {
                const dist = currentEquity.spot - currentEquity.centralPivot;
                return (
                  <div className="rounded p-3 bg-black/60 border border-[#B08D57] flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-3">
                      <span className="font-mono-data font-bold text-sm text-[#EDE9DE]">
                        {currentEquity.centralPivot.toLocaleString()}
                      </span>
                      <span className="text-[10px] font-mono-data text-[#B08D57] font-semibold">
                        DAILY CENTRAL PIVOT ({dist >= 0 ? `HOLDING +${dist.toFixed(1)} PTS ABOVE` : `DEFENDING ${dist.toFixed(1)} PTS BELOW`})
                      </span>
                    </div>
                    <span className="text-[9px] font-mono-data bg-[#B08D57] text-[#0E1A2B] font-bold px-2 py-0.5 rounded">
                      ACTIVE FLOOR
                    </span>
                  </div>
                );
              })()}

              {/* S1 */}
              {(() => {
                const dist = currentEquity.spot - currentEquity.s1;
                return (
                  <div className="rounded p-2.5 bg-black/40 border border-[#B08D57]/15 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="font-mono-data font-bold text-sm text-[#EDE9DE]">
                        {currentEquity.s1.toLocaleString()}
                      </span>
                      <span className="text-[10px] font-mono-data text-[#8292A6]">
                        S1 DEMAND // Value Area Low Institutional Rejection (+{dist.toFixed(1)} pts buffer)
                      </span>
                    </div>
                    <span className="text-[9px] font-mono-data bg-black/60 text-[#10B981] border border-[#10B981]/30 px-2 py-0.5 rounded font-bold">
                      SCALP ENTRY
                    </span>
                  </div>
                );
              })()}

              {/* S2 */}
              {(() => {
                const dist = currentEquity.spot - currentEquity.s2;
                return (
                  <div className="rounded p-2.5 bg-black/40 border border-[#B08D57]/15 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="font-mono-data font-bold text-sm text-[#8292A6]">
                        {currentEquity.s2.toLocaleString()}
                      </span>
                      <span className="text-[10px] font-mono-data text-[#8292A6]">
                        S2 KEY STRUCTURAL SUPPORT // Macro Liquidity Floor (+{dist.toFixed(1)} pts buffer)
                      </span>
                    </div>
                    <span className="text-[9px] font-mono-data bg-black/60 text-[#8292A6] px-2 py-0.5 rounded">
                      DEEP REBATE
                    </span>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* Tab Content 2: EXECUTION BIAS */}
        {activeSubTab === "Execution Bias" && (
          <div className="bg-black/40 border border-[#B08D57]/15 rounded p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono-data font-bold text-[#EDE9DE] uppercase">
                {currentEquity.symbol} Prop Model Sizing & Trigger Rules
              </span>
              <span className="text-xs font-mono-data text-[#B08D57]">Risk: 1.0R per Setup</span>
            </div>
            <p className="text-xs text-[#8292A6] leading-relaxed">
              {currentEquity.executionRules}
            </p>
            <div className="grid grid-cols-2 gap-3 text-xs font-mono-data pt-2">
              <div className="bg-black/50 p-2.5 rounded border border-[#B08D57]/15">
                <span className="text-[9px] text-[#8292A6] block">Invalidation Level:</span>
                <span className="text-[#FF8585] font-bold">{currentEquity.invalidation}</span>
              </div>
              <div className="bg-black/50 p-2.5 rounded border border-[#B08D57]/15">
                <span className="text-[9px] text-[#8292A6] block">Reward / Risk Ratio:</span>
                <span className="text-[#B08D57] font-bold">{currentEquity.rrRatio}</span>
              </div>
            </div>

            {/* Constituents Snapshot */}
            <div className="pt-2 border-t border-[#B08D57]/10">
              <span className="text-[9.5px] font-mono-data uppercase text-[#8292A6] block mb-1.5 font-bold">
                Key Index Weightings & Drivers:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {currentEquity.constituents.map((c, i) => (
                  <div key={i} className="bg-black/60 px-2 py-1 rounded border border-[#222C3D] flex items-center justify-between text-[9.5px] font-mono-data">
                    <span className="font-bold text-[#EDE9DE]">{c.sym}</span>
                    <span className="text-[#8292A6] truncate">{c.name}</span>
                    <span className="text-[#B08D57]">{c.weight}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* SMC Position Strategy Action Banner */}
            {onOpenTerminal && (
              <div className="pt-2">
                <button
                  onClick={() => onOpenTerminal(`Report detailed execution plan for ${currentEquity.symbol} (${currentEquity.name}): order type, entry criteria, key levels, invalidation, and position sizing`)}
                  className="w-full flex items-center justify-center gap-2 bg-[#B08D57]/20 hover:bg-[#B08D57]/35 text-[#E5C794] border border-[#B08D57]/40 py-2 px-3 rounded-lg text-xs font-mono-data font-bold transition-all hover:scale-[1.01] cursor-pointer shadow-sm"
                >
                  <Crosshair className="w-4 h-4 text-[#B08D57]" />
                  <span>SMC Position Strategy Playbook: Key Levels, Value Area &amp; Position Sizing</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#B08D57]" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab Content 3: SESSION LEVELS */}
        {activeSubTab === "Session Levels" && (
          <div className="bg-black/40 border border-[#B08D57]/15 rounded p-4 space-y-3 text-xs font-mono-data">
            <div className="text-[10px] font-bold text-[#B08D57] uppercase">
              {currentEquity.symbol} Intraday Volume Profile & Value Area (VA)
            </div>
            <div className="space-y-1.5 text-[#8292A6]">
              <div className="flex justify-between border-b border-[#B08D57]/15 pb-1">
                <span>Value Area High (VAH):</span>
                <span className="text-[#EDE9DE] font-semibold">{currentEquity.vah.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-b border-[#B08D57]/15 pb-1">
                <span>Point of Control (VPOC):</span>
                <span className="text-[#B08D57] font-semibold">{currentEquity.vpoc.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-b border-[#B08D57]/15 pb-1">
                <span>Value Area Low (VAL):</span>
                <span className="text-[#EDE9DE] font-semibold">{currentEquity.val.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-b border-[#B08D57]/15 pb-1">
                <span>Unfinished Auction Magnet:</span>
                <span className="text-[#10B981] font-semibold">{currentEquity.unfinishedAuction}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-black/50 border border-[#B08D57]/20 text-[10px] mt-1">
                <span className="text-[#8292A6]">Auction State:</span>
                <span className="font-bold text-[#E5C794]">
                  {currentEquity.spot > currentEquity.vah
                    ? `TRADING ABOVE VAH (+${(currentEquity.spot - currentEquity.vah).toFixed(1)} pts) // AUCTION EXPANSION`
                    : currentEquity.spot < currentEquity.val
                    ? `TRADING BELOW VAL (${(currentEquity.spot - currentEquity.val).toFixed(1)} pts) // DISCOUNT REJECTION`
                    : `ACCEPTANCE INSIDE VALUE AREA (${currentEquity.val.toLocaleString()} – ${currentEquity.vah.toLocaleString()})`}
                </span>
              </div>
            </div>

            {/* Macro Cross Correlations */}
            <div className="pt-2">
              <span className="text-[9.5px] font-mono-data uppercase text-[#8292A6] block mb-1.5 font-bold">
                Macro Drivers & Cross-Market Spreads:
              </span>
              <div className="grid grid-cols-2 gap-2">
                {currentEquity.correlations.map((cr, idx) => (
                  <div key={idx} className="bg-black/60 p-2 rounded border border-[#222C3D] flex justify-between items-center text-[9.5px]">
                    <span className="text-[#8292A6]">{cr.name}</span>
                    <span className="text-[#E5C794] font-bold">{cr.value}</span>
                  </div>
                ))}
              </div>

              {/* Regional Matrix Quick Link */}
              <div className="mt-2.5 pt-2 border-t border-[#B08D57]/20 flex flex-wrap items-center justify-between gap-1.5">
                <span className="text-[10px] text-[#BAC7D5]">
                  Regional Decoupling: Asia (KOSPI, Nikkei, HSI) Green vs Europe Down
                </span>
                <button
                  onClick={() => setActiveSubTab("Correlation Matrix")}
                  className="px-2 py-0.5 rounded bg-[#B08D57]/20 hover:bg-[#B08D57]/35 text-[#E5C794] border border-[#B08D57]/40 text-[9.5px] font-bold transition-all cursor-pointer flex items-center gap-1"
                >
                  <span>Open EU vs Asia Correlation Matrix</span>
                  <ArrowUpRight className="w-3 h-3 text-[#B08D57]" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content 4: SYSTEMS LOG */}
        {activeSubTab === "Systems Log" && (
          <div className="bg-black/40 border border-[#B08D57]/15 rounded p-4 space-y-2 text-xs font-mono-data">
            <div className="text-[10px] font-bold text-[#B08D57] uppercase mb-1">
              {currentEquity.symbol} Prop Engine Execution Telemetry
            </div>
            <div className="space-y-1 text-[#8292A6]">
              {currentEquity.systemLogs.map((log, idx) => (
                <p key={idx}>• {log}</p>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Desk Action Footer */}
      <div className="mt-5 pt-3 border-t border-[#B08D57]/15 flex flex-wrap items-center justify-between text-xs font-mono-data gap-2 text-[#8292A6]">
        <div className="flex items-center gap-2 text-[#EDE9DE]">
          <Zap className="w-3.5 h-3.5 text-[#B08D57]" />
          <span>
            <strong className="text-[#B08D57]">DESK:</strong> {currentEquity.deskPosition}
          </span>
        </div>
        <span className="text-[9px] text-[#8292A6]">{currentEquity.deskCode}</span>
      </div>
    </div>
  );
};

export const GlobalEquitiesPropEngine = IbexPropEngine;
