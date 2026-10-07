import React, { useState, useMemo, useEffect } from "react";
import {
  Cpu,
  Terminal,
  Sliders,
  Shield,
  Zap,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  BarChart3,
  AlertTriangle,
  Play,
  Pause,
  RefreshCw,
  Power,
  Filter,
  Lock,
  Unlock,
  Search,
  ArrowUpRight,
  Gauge,
  Layers,
  Info,
  History,
  Activity,
  Radio,
  SlidersHorizontal,
  CheckCircle2,
  FileText,
  Clock,
  Sparkles,
  Server,
  Crosshair,
  Wallet,
  Coins,
  Scale,
  Calculator
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell
} from "recharts";
import { MacroDataState, Currency } from "../types";

interface SystemsViewProps {
  macroData?: MacroDataState;
  onOpenTerminal?: (prompt?: string) => void;
  isCalmMode?: boolean;
  currency?: Currency;
  onCurrencyChange?: (currency: Currency) => void;
}

type SystemSubTab = "ENGINES" | "SIGNALS" | "RISK" | "NLP_LAB" | "PERFORMANCE";
type StrategyStatus = "ACTIVE" | "SIMULATING" | "PAUSED";

interface ExecutionSignal {
  id: string;
  time: string;
  engineCode: string;
  engineName: string;
  action: "BUY_LIMIT" | "SELL_LIMIT" | "VOL_STRADDLE" | "SHORT_HEDGE" | "PROFIT_TAKE" | "REBALANCE";
  asset: string;
  size: string;
  price: string;
  latencyMs: number;
  status: "FILLED" | "RESTING" | "TRIGGERED" | "HALTED";
  pnl?: string;
  pnlUsd?: number;
}

export const SystemsView: React.FC<SystemsViewProps> = ({
  macroData,
  onOpenTerminal,
  isCalmMode = false,
  currency: currencyProp,
  onCurrencyChange
}) => {
  const [activeTab, setActiveTab] = useState<SystemSubTab>("ENGINES");
  const [isMasterKillSwitchArmed, setIsMasterKillSwitchArmed] = useState<boolean>(false);
  const [executionMode, setExecutionMode] = useState<"LIVE" | "PAPER">("LIVE");
  const [engineFilter, setEngineFilter] = useState<string>("ALL");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Interchangeable Currency State ($ USD vs € EUR)
  const [internalCurrency, setInternalCurrency] = useState<Currency>(() => {
    if (currencyProp) return currencyProp;
    try {
      const saved = localStorage.getItem("smc_currency");
      if (saved === "USD" || saved === "EUR") return saved;
    } catch (e) {}
    return "USD";
  });

  useEffect(() => {
    if (currencyProp && currencyProp !== internalCurrency) {
      setInternalCurrency(currencyProp);
    }
  }, [currencyProp]);

  const currency = currencyProp || internalCurrency;
  const curSym = currency === "USD" ? "$" : "€";
  const eurUsdRate = macroData?.tickers?.find((t) => t.symbol === "EUR/USD")?.price || 1.0854;
  const spxPrice = macroData?.tickers?.find((t) => t.symbol === "S&P 500")?.price || 5885.2;
  const daxPrice = macroData?.tickers?.find((t) => t.symbol === "DAX 40")?.price || 19450.0;
  const nikkeiPrice = macroData?.tickers?.find((t) => t.symbol === "NIKKEI 225")?.price || 38920.0;
  const kospiPrice = macroData?.tickers?.find((t) => t.symbol === "KOSPI 200")?.price || 364.5;
  const hsiPrice = macroData?.tickers?.find((t) => t.symbol === "HANG SENG")?.price || 20680.0;
  const btcPrice = macroData?.tickers?.find((t) => t.symbol === "BTC/USD")?.price || 67840.0;

  const formatSignalPnl = (sig: ExecutionSignal) => {
    if (sig.pnlUsd !== undefined) {
      if (currency === "USD") {
        return `+$${sig.pnlUsd.toLocaleString()}`;
      } else {
        const eurVal = Math.round(sig.pnlUsd / eurUsdRate);
        return `+€${eurVal.toLocaleString()}`;
      }
    }
    return sig.pnl || "—";
  };

  const handleSetCurrency = (newCur: Currency) => {
    setInternalCurrency(newCur);
    if (onCurrencyChange) {
      onCurrencyChange(newCur);
    } else {
      try {
        localStorage.setItem("smc_currency", newCur);
      } catch (e) {}
    }
  };

  // Strategy Execution States (10 Core Multi-Asset Desks)
  const [strategyStates, setStrategyStates] = useState<Record<string, StrategyStatus>>({
    SMC_VOL_v42: "ACTIVE",
    SMC_PROP_v81: "ACTIVE",
    SMC_RISK_v34: "ACTIVE",
    SMC_LIQ_v19: "ACTIVE",
    SMC_SPX_v54: "ACTIVE",
    SMC_DAX_v62: "ACTIVE",
    SMC_N225_v38: "ACTIVE",
    SMC_SEMIS_v25: "ACTIVE",
    SMC_HSI_v40: "ACTIVE",
    SMC_CRYPTO_v91: "ACTIVE"
  });

  // Risk Parameters State
  const [accountCapital, setAccountCapital] = useState<number>(500000);
  const [maxDrawdownPct, setMaxDrawdownPct] = useState<number>(2.0);
  const [maxLeverage, setMaxLeverage] = useState<number>(2.5);
  const [slippageLimitPips, setSlippageLimitPips] = useState<number>(1.2);
  const [volatilityHaltSigma, setVolatilityHaltSigma] = useState<number>(3.0);

  // NLP Sentiment Lab State
  const [nlpInputText, setNlpInputText] = useState<string>(
    "BoJ Governor Ueda: Watching foreign exchange rate fluctuations with the highest sense of urgency; will not rule out any resolute steps to counter excessive speculation."
  );

  // Real-Time Signal Audit Stream
  const [signals, setSignals] = useState<ExecutionSignal[]>([
    {
      id: "SIG-9842",
      time: "11:18:04 UTC",
      engineCode: "SMC_VOL_v4.2",
      engineName: "Yen FX Volatility",
      action: "PROFIT_TAKE",
      asset: "USD/JPY 152/156 Put Straddle",
      size: "40 Lots",
      price: "156.25 spot (+420 pips)",
      latencyMs: 9.4,
      status: "FILLED",
      pnlUsd: 42800,
      pnl: "+$42,800"
    },
    {
      id: "SIG-9841",
      time: "11:14:28 UTC",
      engineCode: "SMC_PROP_v8.1",
      engineName: "IBEX 35 Prop",
      action: "BUY_LIMIT",
      asset: "IBEX 35 Futures (MEFF)",
      size: "15 Contracts",
      price: "20,110.0 pts (Pivot Rebound)",
      latencyMs: 6.2,
      status: "FILLED",
      pnlUsd: 16118,
      pnl: "+€14,850"
    },
    {
      id: "SIG-9840",
      time: "11:08:12 UTC",
      engineCode: "SMC_RISK_v3.4",
      engineName: "Geopolitical Hedger",
      action: "SHORT_HEDGE",
      asset: "Brent Oil 1M/3M Spread",
      size: "75,000 bbl",
      price: "$105.25 prompt / $101.40 fwd",
      latencyMs: 14.1,
      status: "FILLED",
      pnlUsd: 31200,
      pnl: "+$31,200"
    },
    {
      id: "SIG-9839",
      time: "10:52:45 UTC",
      engineCode: "SMC_LIQ_v1.9",
      engineName: "Net Liquidity Arb",
      action: "REBALANCE",
      asset: "NQ Mini vs RSP Long",
      size: "20 Pairs",
      price: "TGA +$46.8B Absorption Drain",
      latencyMs: 11.5,
      status: "FILLED",
      pnlUsd: 18400,
      pnl: "+$18,400"
    },
    {
      id: "SIG-9838",
      time: "10:30:19 UTC",
      engineCode: "SMC_VOL_v4.2",
      engineName: "Yen FX Volatility",
      action: "VOL_STRADDLE",
      asset: "USD/JPY 159.50 Straddle",
      size: "25 Lots",
      price: "Delta Neutral @ 159.45",
      latencyMs: 8.8,
      status: "FILLED",
      pnlUsd: 16200,
      pnl: "+$16,200"
    }
  ]);

  // Flash notification helper
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3800);
  };

  // Toggle individual strategy
  const handleToggleStrategy = (key: string) => {
    if (isMasterKillSwitchArmed) {
      triggerToast("CANNOT RESTART STRATEGY: Master Kill Switch is actively engaged.");
      return;
    }

    setStrategyStates((prev) => {
      const current = prev[key];
      const next: StrategyStatus =
        current === "ACTIVE" ? "SIMULATING" : current === "SIMULATING" ? "PAUSED" : "ACTIVE";
      triggerToast(`Engine ${key.replace("_", " ")} switched to ${next} mode`);
      return { ...prev, [key]: next };
    });
  };

  // Toggle Master Kill Switch dynamically across all active engines
  const handleMasterKillSwitch = () => {
    if (!isMasterKillSwitchArmed) {
      setIsMasterKillSwitchArmed(true);
      // Halt all strategies
      setStrategyStates((prev) => {
        const next: Record<string, StrategyStatus> = {};
        Object.keys(prev).forEach((k) => {
          next[k] = "PAUSED";
        });
        return next;
      });
      // Add kill switch event to signal audit log
      const killSignal: ExecutionSignal = {
        id: `KILL-${Date.now().toString().slice(-4)}`,
        time: new Date().toTimeString().split(" ")[0] + " UTC",
        engineCode: "SYSTEM_RISK",
        engineName: "Master Risk Officer",
        action: "REBALANCE",
        asset: "ALL DERIVATIVE CONTRACTS",
        size: "100% UNWIND",
        price: "CIRCUIT BREAKER ENGAGED",
        latencyMs: 1.1,
        status: "HALTED",
        pnl: "STOPPED"
      };
      setSignals((prev) => [killSignal, ...prev]);
      triggerToast("EMERGENCY KILL SWITCH ENGAGED: All 10 automated systems halted immediately.");
    } else {
      setIsMasterKillSwitchArmed(false);
      setStrategyStates((prev) => {
        const next: Record<string, StrategyStatus> = {};
        Object.keys(prev).forEach((k) => {
          next[k] = "ACTIVE";
        });
        return next;
      });
      triggerToast("KILL SWITCH DISARMED: All 10 algorithmic models re-synchronized to live quote streams.");
    }
  };

  // Simulate Trigger Event on an Engine with realistic asset-specific sizing
  const handleSimulateTrigger = (engineCode: string, engineName: string, asset: string, action: ExecutionSignal["action"]) => {
    if (isMasterKillSwitchArmed) {
      triggerToast("TRIGGER BLOCKED: Master Kill Switch is currently engaged.");
      return;
    }

    // Dynamic Sizing based on Account Capital (Retail Micro/Mini vs Institutional Full Tier)
    const isRetail = accountCapital < 50000;
    const isMid = accountCapital >= 50000 && accountCapital < 250000;
    let scaledSize = "";

    if (asset.includes("IBEX")) {
      scaledSize = isRetail
        ? `${Math.max(1, Math.round((accountCapital / 10000) * 1.5))} Mini Contracts (MEFF ${currency === "EUR" ? "€1/pt" : "$1.08/pt"})`
        : isMid
        ? `${Math.max(1, Math.round((accountCapital / 100000) * 3))} Standard Contracts (MEFF ${currency === "EUR" ? "€10/pt" : "$10.85/pt"})`
        : `${Math.max(1, Math.round((accountCapital / 500000) * 15))} Contracts (MEFF ${currency === "EUR" ? "€10/pt" : "$10.85/pt"})`;
    } else if (asset.includes("USD/JPY")) {
      scaledSize = isRetail
        ? `${(Math.max(0.1, (accountCapital / 10000) * 0.25)).toFixed(2)} Mini Lots (FX)`
        : isMid
        ? `${Math.max(1, Math.round((accountCapital / 100000) * 5))} Standard Lots (FX)`
        : `${Math.max(1, Math.round((accountCapital / 500000) * 35))} Standard Lots (FX)`;
    } else if (asset.includes("Brent")) {
      scaledSize = isRetail
        ? `${Math.max(1, Math.round((accountCapital / 10000) * 2))} Micro Contracts (100 bbl)`
        : isMid
        ? `${Math.max(1, Math.round((accountCapital / 100000) * 12))} Standard Brent Contracts`
        : `${Math.max(5000, Math.round((accountCapital / 500000) * 75000)).toLocaleString()} bbl`;
    } else if (asset.includes("ES") || asset.includes("S&P") || asset.includes("SPX")) {
      scaledSize = isRetail
        ? `${Math.max(1, Math.round((accountCapital / 10000) * 1.5))} Micro E-mini (MES $5/pt)`
        : isMid
        ? `${Math.max(1, Math.round((accountCapital / 100000) * 3))} E-mini (ES $50/pt)`
        : `${Math.max(5, Math.round((accountCapital / 500000) * 14))} E-mini Contracts (CME)`;
    } else if (asset.includes("DAX")) {
      scaledSize = isRetail
        ? `${Math.max(1, Math.round((accountCapital / 10000) * 1))} Micro DAX (${currency === "EUR" ? "€1/pt" : "$1.08/pt"})`
        : isMid
        ? `${Math.max(1, Math.round((accountCapital / 100000) * 2))} Standard FDAX (${currency === "EUR" ? "€25/pt" : "$27.10/pt"})`
        : `${Math.max(4, Math.round((accountCapital / 500000) * 10))} Standard FDAX Contracts`;
    } else if (asset.includes("Nikkei") || asset.includes("N225")) {
      scaledSize = isRetail
        ? `${Math.max(1, Math.round((accountCapital / 10000) * 2))} Mini NK225 (¥100/pt)`
        : isMid
        ? `${Math.max(1, Math.round((accountCapital / 100000) * 5))} Large NK225 (¥1,000/pt)`
        : `${Math.max(5, Math.round((accountCapital / 500000) * 25))} Standard Contracts (OSE)`;
    } else if (asset.includes("KOSPI")) {
      scaledSize = isRetail
        ? `${Math.max(1, Math.round((accountCapital / 10000) * 1))} Mini KOSPI`
        : isMid
        ? `${Math.max(1, Math.round((accountCapital / 100000) * 4))} Standard KOSPI 200`
        : `${Math.max(5, Math.round((accountCapital / 500000) * 18))} Contracts (KRX)`;
    } else if (asset.includes("Hang Seng") || asset.includes("HSI")) {
      scaledSize = isRetail
        ? `${Math.max(1, Math.round((accountCapital / 10000) * 1))} Mini HSI (HK$10/pt)`
        : isMid
        ? `${Math.max(1, Math.round((accountCapital / 100000) * 3))} Standard HSI (HK$50/pt)`
        : `${Math.max(5, Math.round((accountCapital / 500000) * 14))} Contracts (HKEX)`;
    } else if (asset.includes("BTC") || asset.includes("Bitcoin")) {
      scaledSize = isRetail
        ? `${Math.max(1, Math.round((accountCapital / 10000) * 2))} Micro BTC (0.1 BTC)`
        : isMid
        ? `${(Math.max(0.5, (accountCapital / 100000) * 1.5)).toFixed(1)} BTC Spot / Futures`
        : `${Math.max(2, Math.round((accountCapital / 500000) * 6))} Standard CME BTC (5 BTC/contract)`;
    } else {
      scaledSize = isRetail
        ? `${Math.max(1, Math.round((accountCapital / 10000) * 1.5))} Micro Pairs (MNQ/RSP)`
        : isMid
        ? `${Math.max(1, Math.round((accountCapital / 100000) * 4))} E-mini Pairs`
        : `${Math.max(1, Math.round((accountCapital / 500000) * 20))} E-mini Pairs`;
    }

    // Realistic Simulated PnL (~0.9% - 2.4% account gain, representing typical 1R-2R win)
    const simulatedProfit = Math.round(accountCapital * (0.009 + Math.random() * 0.015));
    const pnlUsdEquivalent = currency === "USD" ? simulatedProfit : Math.round(simulatedProfit * eurUsdRate);
    const pnlFormatted = `+${curSym}${simulatedProfit.toLocaleString()}`;

    const newSignal: ExecutionSignal = {
      id: `SIM-${Math.floor(1000 + Math.random() * 9000)}`,
      time: new Date().toTimeString().split(" ")[0] + " UTC",
      engineCode,
      engineName,
      action,
      asset,
      size: scaledSize,
      price: `Simulated Fill @ Market (${(Math.random() * 0.4 + 0.1).toFixed(2)}% slippage)`,
      latencyMs: +(Math.random() * 6 + 4).toFixed(1),
      status: "FILLED",
      pnl: pnlFormatted,
      pnlUsd: pnlUsdEquivalent
    };

    setSignals((prev) => [newSignal, ...prev]);
    triggerToast(`Model setup generated for ${engineName}: Sized to ${curSym}${accountCapital.toLocaleString()} ${currency} capital.`);
  };

  // NLP Sentiment Analysis Parser Logic
  const nlpAnalysis = useMemo(() => {
    const text = nlpInputText.toLowerCase();
    if (text.includes("boj") || text.includes("yen") || text.includes("ueda") || text.includes("kanda") || text.includes("foreign exchange")) {
      const isUrgent = text.includes("resolute") || text.includes("highest urgency") || text.includes("not rule out") || text.includes("appropriate action");
      return {
        category: "BANK OF JAPAN / FX JAWBONING",
        targetAsset: "USD/JPY & EUR/JPY",
        urgencyLevel: isUrgent ? 4 : 2,
        urgencyLabel: isUrgent ? "Level 4: High Alert (Pre-Intervention Rate Check)" : "Level 2: Monitoring Orderly Conditions",
        probabilityPct: isUrgent ? 78 : 35,
        targetEngine: "SMC_VOL_v4.2 (Yen FX Volatility Engine)",
        engineId: "SMC_VOL_v42",
        actionRecommend: isUrgent
          ? "Deploy delta-neutral 1M 152/156 Put Straddles; arm short USD/JPY gamma trap above 159.50."
          : "Maintain baseline watch; sell elevated implied volatility on spot spikes >158.00.",
        riskVector: "MoF currency desk stealth execution using Federal Reserve NY repo liquidity facility."
      };
    }

    if (text.includes("houthi") || text.includes("hormuz") || text.includes("tanker") || text.includes("missile") || text.includes("red sea") || text.includes("iran") || text.includes("drone")) {
      return {
        category: "MARITIME WAR RISK & CHOKEPOINT INTERDICTION",
        targetAsset: "Brent Crude Oil & Global Shipping Freight",
        urgencyLevel: 5,
        urgencyLabel: "Level 5: Kinetic Chokepoint Disruption",
        probabilityPct: 92,
        targetEngine: "SMC_RISK_v3.4 (Geopolitical War Risk Engine)",
        engineId: "SMC_RISK_v34",
        actionRecommend: "Scale long prompt Brent prompt backwardation spreads; add gold safe-haven overlay vs freight equities.",
        riskVector: "Bab el-Mandeb AIS reroutes approaching 75% Cape of Good Hope detour; $18.50/bbl war risk premium."
      };
    }

    if (text.includes("treasury") || text.includes("tga") || text.includes("refunding") || text.includes("reverse repo") || text.includes("rrp") || text.includes("liquidity")) {
      return {
        category: "US FISCAL / FED BALANCE SHEET LIQUIDITY",
        targetAsset: "S&P 500 High-Beta vs Equal-Weight (RSP)",
        urgencyLevel: 3,
        urgencyLabel: "Level 3: Direct Balance Sheet Liquidity Drain",
        probabilityPct: 65,
        targetEngine: "SMC_LIQ_v1.9 (Net Liquidity Arbitrage)",
        engineId: "SMC_LIQ_v19",
        actionRecommend: "Short high-multiple technology equities; position long SOFR-IORB spread as reserve cushion wanes.",
        riskVector: "RRP buffer exhausted below $250B; new Treasury debt issuance drains private commercial bank reserves 1:1."
      };
    }

    if (text.includes("0dte") || text.includes("gamma") || text.includes("spx") || text.includes("s&p") || text.includes("cpi") || text.includes("fomc")) {
      return {
        category: "US INSTITUTIONAL DERIVATIVES / 0DTE VOLATILITY",
        targetAsset: "S&P 500 E-mini (CME ES) & SPX Options",
        urgencyLevel: 4,
        urgencyLabel: "Level 4: Dealer GEX Flip & Bracket Expansion",
        probabilityPct: 84,
        targetEngine: "SMC_SPX_v5.4 (S&P 500 0DTE Vol Engine)",
        engineId: "SMC_SPX_v54",
        actionRecommend: "Deploy opening bracket straddle; scalp mean reversion to zero-gamma flip strikes upon initial 15M sweep.",
        riskVector: "Dealer short gamma acceleration magnifying intraday moves; strict 1.0R maximum risk hard stop."
      };
    }

    if (text.includes("dax") || text.includes("bund") || text.includes("frankfurt") || text.includes("ecb") || text.includes("german")) {
      return {
        category: "EUROPEAN INDUSTRIAL CORE / BUND ARBITRAGE",
        targetAsset: "DAX 40 Futures (Eurex FDAX) & 10Y Bunds",
        urgencyLevel: 3,
        urgencyLabel: "Level 3: Sovereign Yield & Export Momentum Divergence",
        probabilityPct: 71,
        targetEngine: "SMC_DAX_v6.2 (DAX European Core Engine)",
        engineId: "SMC_DAX_v62",
        actionRecommend: "Execute long DAX / short Bund spread; exploit export margin recovery against EUR/USD weakness.",
        riskVector: "Eurozone manufacturing PMI contraction versus corporate cash flow resilience."
      };
    }

    if (text.includes("nikkei") || text.includes("n225") || text.includes("tokyo") || text.includes("carry trade")) {
      return {
        category: "JAPANESE EQUITY BETA & CARRY REPRICING",
        targetAsset: "Nikkei 225 Futures (OSE/CME)",
        urgencyLevel: 4,
        urgencyLabel: "Level 4: Tokyo Cash Open & FX Beta Realignment",
        probabilityPct: 79,
        targetEngine: "SMC_N225_v3.8 (Nikkei Tokyo Open Engine)",
        engineId: "SMC_N225_v38",
        actionRecommend: "Front-run Tokyo 09:00 cash open momentum; scalp exporter beta as USD/JPY crosses key intervention bands.",
        riskVector: "Unwinding of Yen carry trade inducing rapid cross-asset liquidation cascades."
      };
    }

    if (text.includes("samsung") || text.includes("sk hynix") || text.includes("kospi") || text.includes("semiconductor") || text.includes("dram") || text.includes("hbm")) {
      return {
        category: "GLOBAL AI HARDWARE & SEMICONDUCTOR SUPPLY CHAIN",
        targetAsset: "KOSPI 200 Index Futures (KRX)",
        urgencyLevel: 4,
        urgencyLabel: "Level 4: High-Bandwidth Memory (HBM) Flow Surge",
        probabilityPct: 82,
        targetEngine: "SMC_SEMIS_v2.5 (KOSPI Global Semis Bellwether)",
        engineId: "SMC_SEMIS_v25",
        actionRecommend: "Track foreign net capital buying in Samsung/Hynix; take long bias into US SOX cash session lead-in.",
        riskVector: "Cyclical memory pricing inflection and export restrictions in East Asian shipping corridors."
      };
    }

    if (text.includes("hang seng") || text.includes("hsi") || text.includes("pboc") || text.includes("china") || text.includes("stock connect")) {
      return {
        category: "GREATER CHINA TECH & PBOC POLICY IMPULSE",
        targetAsset: "Hang Seng Index Futures (HKEX)",
        urgencyLevel: 4,
        urgencyLabel: "Level 4: Southbound Liquidity Pulse",
        probabilityPct: 75,
        targetEngine: "SMC_HSI_v4.0 (Hang Seng Tech & Liquidity)",
        engineId: "SMC_HSI_v40",
        actionRecommend: "Scalp cash open gap fills with Southbound institutional net flow; set trailing brackets on tech leaders.",
        riskVector: "Offshore Yuan (USD/CNH) volatility and property sector restructuring headwinds."
      };
    }

    if (text.includes("btc") || text.includes("bitcoin") || text.includes("crypto") || text.includes("cme basis")) {
      return {
        category: "DIGITAL MACRO LIQUIDITY & CME BASIS ARB",
        targetAsset: "Bitcoin CME Futures & Spot",
        urgencyLevel: 4,
        urgencyLabel: "Level 4: Weekend Basis Spread & M2 Expansion",
        probabilityPct: 88,
        targetEngine: "SMC_CRYPTO_v9.1 (Bitcoin Macro Liquidity Engine)",
        engineId: "SMC_CRYPTO_v91",
        actionRecommend: "Execute cash-and-carry basis arb; capture CME premium dislocation over weekend retail order flow.",
        riskVector: "Perpetual funding rate spikes and high-beta correlation to global aggregate M2 money supply."
      };
    }

    // Default Spanish IBEX / ECB peripheral
    return {
      category: "EUROPEAN PERIPHERAL / IBEX PROP DRIFT",
      targetAsset: "IBEX 35 Index Futures (MEFF)",
      urgencyLevel: 2,
      urgencyLabel: "Level 2: Intraday Volume Profile Mean Reversion",
      probabilityPct: 54,
      targetEngine: "SMC_PROP_v8.1 (IBEX 35 Prop Execution)",
      engineId: "SMC_PROP_v81",
      actionRecommend: "Monitor Value Area Low (VAL) at 20,010 pts; scalp mean reversion back to daily VWAP pivot (20,110).",
      riskVector: "Santander/BBVA banking beta outperforming Euro Stoxx 50; 1.0R maximum session risk limit."
    };
  }, [nlpInputText]);

  // Performance Chart Data (Audited Alpha & Sharpe Comparison across all 10 Systems)
  const performanceData = [
    { name: "SMC_VOL (Yen FX)", sharpe: 2.84, returnYTD: 24.5, winRate: 74, maxDd: -3.8, color: "#10B981" },
    { name: "SMC_PROP (IBEX 35)", sharpe: 2.12, returnYTD: 18.2, winRate: 68, maxDd: -4.1, color: "#B08D57" },
    { name: "SMC_RISK (Chokepoint)", sharpe: 3.15, returnYTD: 31.8, winRate: 71, maxDd: -2.9, color: "#E05A47" },
    { name: "SMC_LIQ (Net Liq)", sharpe: 2.45, returnYTD: 16.4, winRate: 65, maxDd: -3.4, color: "#0284C7" },
    { name: "SMC_SPX (S&P 500)", sharpe: 2.76, returnYTD: 22.8, winRate: 72, maxDd: -3.2, color: "#6366F1" },
    { name: "SMC_DAX (DAX 40)", sharpe: 2.38, returnYTD: 19.6, winRate: 69, maxDd: -3.9, color: "#F59E0B" },
    { name: "SMC_N225 (Nikkei)", sharpe: 2.51, returnYTD: 21.4, winRate: 71, maxDd: -3.6, color: "#EC4899" },
    { name: "SMC_SEMIS (KOSPI)", sharpe: 2.42, returnYTD: 25.1, winRate: 67, maxDd: -4.5, color: "#14B8A6" },
    { name: "SMC_HSI (Hang Seng)", sharpe: 2.18, returnYTD: 17.5, winRate: 66, maxDd: -4.8, color: "#8B5CF6" },
    { name: "SMC_CRYPTO (BTC)", sharpe: 2.92, returnYTD: 36.4, winRate: 73, maxDd: -4.2, color: "#F97316" }
  ];

  return (
    <div id="systems-view-container" className="space-y-6 animate-in fade-in">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#0A111C] border border-[#B08D57] text-[#EDE9DE] px-4 py-2.5 rounded-lg shadow-2xl font-mono-data text-xs flex items-center gap-2.5 animate-in slide-in-from-top duration-200">
          <Sparkles className="w-4 h-4 text-[#B08D57]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Master Top Header & Command Deck */}
      <div className="bg-[#141923] border border-[#222C3D] rounded-xl p-5 shadow-xl relative overflow-hidden">
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 pointer-events-none opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(to right, #B08D57 1px, transparent 1px),
              linear-gradient(to bottom, #B08D57 1px, transparent 1px)
            `,
            backgroundSize: "32px 32px"
          }}
        />

        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#222C3D]">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-black/60 border border-[#B08D57]/40 flex items-center justify-center text-[#B08D57] shadow-inner">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-[#EDE9DE]">
                    Quantitative Decision Playbook &amp; Model Systems
                  </h1>
                  <span className="text-[10px] font-mono-data bg-[#B08D57]/20 text-[#B08D57] px-2 py-0.5 rounded border border-[#B08D57]/40 uppercase font-semibold">
                    Core v8.4
                  </span>
                </div>
                <p className="text-xs font-mono-data text-[#8292A6] mt-0.5">
                  SYSTEMATIC TRADING PLAYBOOKS • MODEL PERFORMANCE MIRRORS • PRE-TRADE RISK SIZING &amp; NLP REGIME SIGNALS
                </p>
              </div>
            </div>
          </div>

          {/* Master Control Toggles: Currency Toggle, Mode & Emergency Kill Switch */}
          <div className="flex flex-wrap items-center gap-2.5 text-xs font-mono-data">
            {/* Interchangeable Currency Toggle ($ USD / € EUR) */}
            <div className="flex items-center bg-black/60 p-1 rounded-lg border border-[#B08D57]/30">
              <button
                onClick={() => {
                  handleSetCurrency("USD");
                  triggerToast("Systems base currency set to US Dollar ($ USD)");
                }}
                className={`px-2.5 py-1.5 rounded text-[10px] font-bold transition-all flex items-center gap-1 ${
                  currency === "USD"
                    ? "bg-[#B08D57] text-[#0A111C] shadow"
                    : "text-[#8292A6] hover:text-[#EDE9DE]"
                }`}
                title="Switch base currency to US Dollar ($)"
              >
                <span>$</span>
                <span>USD</span>
              </button>
              <button
                onClick={() => {
                  handleSetCurrency("EUR");
                  triggerToast("Systems base currency set to Euro (€ EUR)");
                }}
                className={`px-2.5 py-1.5 rounded text-[10px] font-bold transition-all flex items-center gap-1 ${
                  currency === "EUR"
                    ? "bg-[#B08D57] text-[#0A111C] shadow"
                    : "text-[#8292A6] hover:text-[#EDE9DE]"
                }`}
                title="Switch base currency to Euro (€)"
              >
                <span>€</span>
                <span>EUR</span>
              </button>
            </div>

            {/* Active Signals vs Scenario Sim Mode Toggle */}
            <div className="flex items-center bg-black/60 p-1 rounded-lg border border-[#2B3545]">
              <button
                onClick={() => {
                  setExecutionMode("LIVE");
                  triggerToast("Display Mode set to ACTIVE DESK SIGNALS");
                }}
                className={`px-3 py-1.5 rounded text-[10px] font-bold transition-all flex items-center gap-1.5 ${
                  executionMode === "LIVE"
                    ? "bg-[#10B981] text-[#0A111C] shadow"
                    : "text-[#8292A6] hover:text-[#EDE9DE]"
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#0A111C] animate-pulse" />
                <span>ACTIVE DESK SIGNALS</span>
              </button>
              <button
                onClick={() => {
                  setExecutionMode("PAPER");
                  triggerToast("Display Mode set to SCENARIO SIMULATION");
                }}
                className={`px-3 py-1.5 rounded text-[10px] font-bold transition-all flex items-center gap-1.5 ${
                  executionMode === "PAPER"
                    ? "bg-[#B08D57] text-[#0A111C] shadow"
                    : "text-[#8292A6] hover:text-[#EDE9DE]"
                }`}
              >
                <span>SCENARIO SIM</span>
              </button>
            </div>

            {/* Emergency Master Kill Switch */}
            <button
              onClick={handleMasterKillSwitch}
              className={`px-3.5 py-1.5 rounded-lg border text-[11px] font-bold transition-all flex items-center gap-2 shadow-lg ${
                isMasterKillSwitchArmed
                  ? "bg-rose-600 text-white border-rose-400 animate-pulse"
                  : "bg-black/60 border-rose-500/50 text-rose-400 hover:bg-rose-500/20"
              }`}
              title="Immediately halts all active algorithmic order submission"
            >
              <Power className="w-4 h-4" />
              <span>{isMasterKillSwitchArmed ? "KILL SWITCH ENGAGED [HALTED]" : "MASTER KILL SWITCH"}</span>
            </button>
          </div>
        </div>

        {/* Real-Time Telemetry Strip: Gateways, Latency, Risk Utilization */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 text-xs font-mono-data">
          <div className="p-2.5 rounded-lg bg-black/40 border border-[#1E2738] flex items-center justify-between">
            <div>
              <span className="text-[10px] text-[#8292A6] block uppercase">Signal Latency</span>
              <span className="text-[#EDE9DE] font-bold text-sm">8.4 ms // Market Feed</span>
            </div>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>

          <div className="p-2.5 rounded-lg bg-black/40 border border-[#1E2738] flex items-center justify-between">
            <div>
              <span className="text-[10px] text-[#8292A6] block uppercase">Tick Ingestion</span>
              <span className="text-[#EDE9DE] font-bold text-sm">3,120 ticks/sec</span>
            </div>
            <Server className="w-4 h-4 text-[#B08D57]" />
          </div>

          <div className="p-2.5 rounded-lg bg-black/40 border border-[#1E2738] flex items-center justify-between">
            <div>
              <span className="text-[10px] text-[#8292A6] block uppercase">Risk Margin Utilized ({currency})</span>
              <span className="text-[#E5C794] font-bold text-sm">
                {curSym}{Math.round(accountCapital * 0.342).toLocaleString()} / {curSym}{accountCapital.toLocaleString()} (34.2%)
              </span>
            </div>
            <Gauge className="w-4 h-4 text-[#E5C794]" />
          </div>

          <div className="p-2.5 rounded-lg bg-black/40 border border-[#1E2738] flex items-center justify-between">
            <div>
              <span className="text-[10px] text-[#8292A6] block uppercase">Active Strategies</span>
              <span className="text-emerald-400 font-bold text-sm">
                {Object.values(strategyStates).filter((s) => s === "ACTIVE").length} of {Object.keys(strategyStates).length} Models Online
              </span>
            </div>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
        </div>
      </div>

      {/* Sub-navigation Tabs: Transform the Systems view into a true institutional workspace */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#222C3D] pb-2">
        <div className="flex flex-wrap items-center gap-1.5 font-mono-data text-xs">
          <button
            onClick={() => setActiveTab("ENGINES")}
            className={`px-3.5 py-2 rounded-t-lg transition-all flex items-center gap-2 font-medium ${
              activeTab === "ENGINES"
                ? "bg-[#141923] text-[#EDE9DE] font-bold border-t-2 border-[#B08D57] border-x border-[#222C3D]"
                : "text-[#8292A6] hover:text-[#EDE9DE] hover:bg-[#141923]/40"
            }`}
          >
            <Cpu className="w-3.5 h-3.5 text-[#B08D57]" />
            <span>Decision Playbooks ({Object.keys(strategyStates).length})</span>
          </button>

          <button
            onClick={() => setActiveTab("SIGNALS")}
            className={`px-3.5 py-2 rounded-t-lg transition-all flex items-center gap-2 font-medium ${
              activeTab === "SIGNALS"
                ? "bg-[#141923] text-[#EDE9DE] font-bold border-t-2 border-[#B08D57] border-x border-[#222C3D]"
                : "text-[#8292A6] hover:text-[#EDE9DE] hover:bg-[#141923]/40"
            }`}
          >
            <History className="w-3.5 h-3.5 text-sky-400" />
            <span>Signal Stream &amp; Setups</span>
            <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#10B981]/20 text-emerald-400 font-bold">
              {signals.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("RISK")}
            className={`px-3.5 py-2 rounded-t-lg transition-all flex items-center gap-2 font-medium ${
              activeTab === "RISK"
                ? "bg-[#141923] text-[#EDE9DE] font-bold border-t-2 border-[#B08D57] border-x border-[#222C3D]"
                : "text-[#8292A6] hover:text-[#EDE9DE] hover:bg-[#141923]/40"
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#E5C794]" />
            <span>Parametric Risk Limits</span>
          </button>

          <button
            onClick={() => setActiveTab("NLP_LAB")}
            className={`px-3.5 py-2 rounded-t-lg transition-all flex items-center gap-2 font-medium ${
              activeTab === "NLP_LAB"
                ? "bg-[#141923] text-[#EDE9DE] font-bold border-t-2 border-[#B08D57] border-x border-[#222C3D]"
                : "text-[#8292A6] hover:text-[#EDE9DE] hover:bg-[#141923]/40"
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-rose-400" />
            <span>NLP Sentiment Wire Lab</span>
          </button>

          <button
            onClick={() => setActiveTab("PERFORMANCE")}
            className={`px-3.5 py-2 rounded-t-lg transition-all flex items-center gap-2 font-medium ${
              activeTab === "PERFORMANCE"
                ? "bg-[#141923] text-[#EDE9DE] font-bold border-t-2 border-[#B08D57] border-x border-[#222C3D]"
                : "text-[#8292A6] hover:text-[#EDE9DE] hover:bg-[#141923]/40"
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Alpha &amp; Sharpe Analytics</span>
          </button>
        </div>

        {/* Quick Trigger Terminal Prompt */}
        {onOpenTerminal && (
          <button
            onClick={() =>
              onOpenTerminal(
                "Inspect status of all 10 active quantitative execution systems across global equities, FX, energy, and digital macro desks."
              )
            }
            className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded bg-[#B08D57]/15 hover:bg-[#B08D57]/25 text-[#E5C794] border border-[#B08D57]/30 text-xs font-mono-data transition-colors"
          >
            <Terminal className="w-3.5 h-3.5 text-[#B08D57]" />
            <span>Open System Shell</span>
          </button>
        )}
      </div>

      {/* ========================================================================= */}
      {/* SUB-VIEW 1: ENGINES (10 Core Multi-Asset Quantitative Strategies)         */}
      {/* ========================================================================= */}
      {activeTab === "ENGINES" && (
        <div className="space-y-6">
          {/* Strategy Filter Chips */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono-data">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[#8292A6] text-[11px] mr-1">Filter Desk:</span>
              {[
                { id: "ALL", label: "ALL DESKS" },
                { id: "US_EQUITIES", label: "US EQUITIES" },
                { id: "EUROPEAN_CORE", label: "EUROPEAN CORE" },
                { id: "ASIA_TECH", label: "ASIA TECH & CARRY" },
                { id: "FX_VOLATILITY", label: "FX VOLATILITY" },
                { id: "GEOPOLITICAL", label: "WAR RISK & AIS" },
                { id: "NET_LIQUIDITY", label: "NET LIQUIDITY" },
                { id: "CRYPTO_MACRO", label: "CRYPTO MACRO" }
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setEngineFilter(f.id)}
                  className={`px-2.5 py-1 rounded text-[10px] uppercase font-semibold transition-all ${
                    engineFilter === f.id
                      ? "bg-[#B08D57] text-[#0A111C] font-bold shadow"
                      : "bg-[#141923] text-[#8292A6] hover:text-[#EDE9DE] border border-[#222C3D]"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="text-[11px] text-[#8292A6]">
              Quantitative decision-support models configured for institutional macro execution &amp; risk sizing
            </div>
          </div>

          {/* The 4 Engine Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 1. SMC_VOL_v4.2 // Yen FX Volatility Engine */}
            {(engineFilter === "ALL" || engineFilter === "FX_VOLATILITY") && (
              <div className="bg-[#141923] border border-[#222C3D] rounded-xl p-5 shadow-xl flex flex-col justify-between hover:border-[#B08D57]/40 transition-colors">
                <div>
                  {/* Top Header & State Toggle */}
                  <div className="flex items-start justify-between pb-3 border-b border-[#222C3D] gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-[#10B981]/15 border border-[#10B981]/40 flex items-center justify-center text-emerald-400">
                        <Cpu className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-editorial text-lg font-bold text-[#EDE9DE]">
                            SMC_VOL_v4.2
                          </h3>
                          <span className="text-[9px] font-mono-data text-[#8292A6] bg-black/60 px-1.5 py-0.5 rounded border border-[#2B3545]">
                            USD/JPY &amp; EUR/JPY
                          </span>
                        </div>
                        <span className="text-[10px] font-mono-data text-[#8292A6]">
                          BOJ STEALTH INTERVENTION &amp; OPTIONS STRADDLE HARVESTER
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleStrategy("SMC_VOL_v42")}
                      className={`px-2.5 py-1 rounded text-[10px] font-mono-data font-bold uppercase transition-all flex items-center gap-1.5 ${
                        strategyStates.SMC_VOL_v42 === "ACTIVE"
                          ? "bg-[#10B981]/20 text-emerald-300 border border-[#10B981]/40"
                          : strategyStates.SMC_VOL_v42 === "SIMULATING"
                          ? "bg-[#B08D57]/20 text-[#E5C794] border border-[#B08D57]/40"
                          : "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                      }`}
                    >
                      {strategyStates.SMC_VOL_v42 === "ACTIVE" ? (
                        <Play className="w-2.5 h-2.5 fill-current" />
                      ) : strategyStates.SMC_VOL_v42 === "SIMULATING" ? (
                        <Radio className="w-2.5 h-2.5" />
                      ) : (
                        <Pause className="w-2.5 h-2.5 fill-current" />
                      )}
                      <span>{strategyStates.SMC_VOL_v42}</span>
                    </button>
                  </div>

                  {/* Quantitative Parameters & Live Metric */}
                  <div className="grid grid-cols-2 gap-2 my-3 p-2.5 bg-black/45 rounded-lg border border-[#1E2738] text-xs font-mono-data">
                    <div>
                      <span className="text-[#8292A6] text-[10px] block">Live Underlying</span>
                      <span className="text-[#EDE9DE] font-bold text-sm">
                        USD/JPY {macroData?.engines.yenIntervention.spot ? macroData.engines.yenIntervention.spot.toFixed(2) : "156.25"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#8292A6] text-[10px] block">Execution Threshold</span>
                      <span className="text-[#B08D57] font-bold text-sm">
                        Spot &ge; 160.50 (DEFCON 4)
                      </span>
                    </div>
                    <div>
                      <span className="text-[#8292A6] text-[10px] block">Current Delta / Vega</span>
                      <span className="text-emerald-400 font-semibold">+0.04 &Delta; / +{currency === "USD" ? "$18,400" : `€${Math.round(18400 / eurUsdRate).toLocaleString()}`} &nu;</span>
                    </div>
                    <div>
                      <span className="text-[#8292A6] text-[10px] block">MoF Sentiment Level</span>
                      <span className="text-sky-300 font-semibold">
                        {macroData?.engines.yenIntervention.jawboningLabel || "Level 2: Orderly"}
                      </span>
                    </div>
                  </div>

                  {/* Execution Logic & Transmission */}
                  <div className="space-y-1.5 text-xs font-mono-data text-[#BAC7D5] mb-4">
                    <p className="text-[11px] leading-relaxed text-[#8292A6]">
                      <strong>Execution Logic:</strong> Monitors Japanese MoF verbal jawboning severity and USD/JPY spot distance to 160.50. When verbal alert Level 3+ aligns with 1M implied volatility compression, automatically places delta-neutral 1M 152/156 Put Straddles and sets trailing bracket stops.
                    </p>
                    <div className="flex items-center justify-between text-[10px] pt-1 text-[#8292A6] border-t border-[#1E2738]">
                      <span>Historical Sharpe: 2.84</span>
                      <span>Win Rate: 74% (Last 24 Mos)</span>
                      <span className="text-emerald-400 font-bold">Captured: +420 pips</span>
                    </div>
                  </div>
                </div>

                {/* Card Action Controls */}
                <div className="pt-3 border-t border-[#222C3D] flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono-data text-[#8292A6]">
                    Execution Gateway: EBS / Currenex Feed
                  </span>
                  <button
                    onClick={() =>
                      handleSimulateTrigger(
                        "SMC_VOL_v4.2",
                        "Yen FX Volatility",
                        "USD/JPY 152/156 Put Straddle",
                        "VOL_STRADDLE"
                      )
                    }
                    className="px-2.5 py-1.5 rounded bg-[#10B981]/15 hover:bg-[#10B981]/25 text-emerald-300 border border-[#10B981]/35 font-mono-data text-xs font-bold transition-all flex items-center gap-1.5"
                  >
                    <Crosshair className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Simulate Trade Setup</span>
                  </button>
                </div>
              </div>
            )}

            {/* 2. SMC_PROP_v8.1 // IBEX 35 Prop Execution Engine */}
            {(engineFilter === "ALL" || engineFilter === "EUROPEAN_CORE" || engineFilter === "INDEX_PROP") && (
              <div className="bg-[#141923] border border-[#222C3D] rounded-xl p-5 shadow-xl flex flex-col justify-between hover:border-[#B08D57]/40 transition-colors">
                <div>
                  {/* Top Header & State Toggle */}
                  <div className="flex items-start justify-between pb-3 border-b border-[#222C3D] gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-[#B08D57]/15 border border-[#B08D57]/40 flex items-center justify-center text-[#B08D57]">
                        <BarChart3 className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-editorial text-lg font-bold text-[#EDE9DE]">
                            SMC_PROP_v8.1
                          </h3>
                          <span className="text-[9px] font-mono-data text-[#8292A6] bg-black/60 px-1.5 py-0.5 rounded border border-[#2B3545]">
                            IBEX 35 (MEFF Madrid)
                          </span>
                        </div>
                        <span className="text-[10px] font-mono-data text-[#8292A6]">
                          INTRADAY LIQUIDITY SWEEPS &amp; DAILY PIVOT DRIFT
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleStrategy("SMC_PROP_v81")}
                      className={`px-2.5 py-1 rounded text-[10px] font-mono-data font-bold uppercase transition-all flex items-center gap-1.5 ${
                        strategyStates.SMC_PROP_v81 === "ACTIVE"
                          ? "bg-[#10B981]/20 text-emerald-300 border border-[#10B981]/40"
                          : strategyStates.SMC_PROP_v81 === "SIMULATING"
                          ? "bg-[#B08D57]/20 text-[#E5C794] border border-[#B08D57]/40"
                          : "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                      }`}
                    >
                      {strategyStates.SMC_PROP_v81 === "ACTIVE" ? (
                        <Play className="w-2.5 h-2.5 fill-current" />
                      ) : strategyStates.SMC_PROP_v81 === "SIMULATING" ? (
                        <Radio className="w-2.5 h-2.5" />
                      ) : (
                        <Pause className="w-2.5 h-2.5 fill-current" />
                      )}
                      <span>{strategyStates.SMC_PROP_v81}</span>
                    </button>
                  </div>

                  {/* Quantitative Parameters & Live Metric */}
                  <div className="grid grid-cols-2 gap-2 my-3 p-2.5 bg-black/45 rounded-lg border border-[#1E2738] text-xs font-mono-data">
                    <div>
                      <span className="text-[#8292A6] text-[10px] block">Live Underlying</span>
                      <span className="text-[#EDE9DE] font-bold text-sm">
                        IBEX {macroData?.engines.ibexBias.level ? macroData.engines.ibexBias.level.toFixed(1) : "20,184.4"} pts
                      </span>
                    </div>
                    <div>
                      <span className="text-[#8292A6] text-[10px] block">Key Session Pivot</span>
                      <span className="text-[#B08D57] font-bold text-sm">
                        20,050 (R1: 20,280 / S1: 19,920)
                      </span>
                    </div>
                    <div>
                      <span className="text-[#8292A6] text-[10px] block">Today's PnL / Gain</span>
                      <span className="text-emerald-400 font-semibold">+1.42R (+{currency === "USD" ? `$${Math.round(14850 * eurUsdRate).toLocaleString()}` : "€14,850"})</span>
                    </div>
                    <div>
                      <span className="text-[#8292A6] text-[10px] block">Volatility Regime</span>
                      <span className="text-[#BAC7D5] font-semibold">{macroData?.engines.ibexBias.volatilityRegime || "Normal Compressed (ATR: 164 pts)"}</span>
                    </div>
                  </div>

                  {/* Execution Logic & Transmission */}
                  <div className="space-y-1.5 text-xs font-mono-data text-[#BAC7D5] mb-4">
                    <p className="text-[11px] leading-relaxed text-[#8292A6]">
                      <strong>Execution Logic:</strong> Calculates dynamic Volume-Weighted Average Price (VWAP) and Value Area bounds (VAH/VAL) off Madrid market open. Sweeps of S1 (19,920) with delta order book divergence trigger limit buy entries targeting 20,280 with strict 1.0R maximum risk.
                    </p>
                    <div className="flex items-center justify-between text-[10px] pt-1 text-[#8292A6] border-t border-[#1E2738]">
                      <span>Historical Sharpe: 2.12</span>
                      <span>Win Rate: 68.4%</span>
                      <span className="text-emerald-400 font-bold">Max Drawdown: -4.1%</span>
                    </div>
                  </div>
                </div>

                {/* Card Action Controls */}
                <div className="pt-3 border-t border-[#222C3D] flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono-data text-[#8292A6]">
                    Execution Gateway: BME / MEFF Feed
                  </span>
                  <button
                    onClick={() =>
                      handleSimulateTrigger(
                        "SMC_PROP_v8.1",
                        "IBEX 35 Prop Execution",
                        "IBEX 35 Futures (MEFF)",
                        "BUY_LIMIT"
                      )
                    }
                    className="px-2.5 py-1.5 rounded bg-[#B08D57]/15 hover:bg-[#B08D57]/25 text-[#E5C794] border border-[#B08D57]/35 font-mono-data text-xs font-bold transition-all flex items-center gap-1.5"
                  >
                    <Crosshair className="w-3.5 h-3.5 text-[#B08D57]" />
                    <span>Simulate VAL Rebound Setup</span>
                  </button>
                </div>
              </div>
            )}

            {/* 3. SMC_RISK_v3.4 // Maritime War Risk & Chokepoint Disruption Hedger */}
            {(engineFilter === "ALL" || engineFilter === "GEOPOLITICAL") && (
              <div className="bg-[#141923] border border-[#222C3D] rounded-xl p-5 shadow-xl flex flex-col justify-between hover:border-[#B08D57]/40 transition-colors">
                <div>
                  {/* Top Header & State Toggle */}
                  <div className="flex items-start justify-between pb-3 border-b border-[#222C3D] gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-rose-500/15 border border-rose-500/40 flex items-center justify-center text-rose-400">
                        <Shield className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-editorial text-lg font-bold text-[#EDE9DE]">
                            SMC_RISK_v3.4
                          </h3>
                          <span className="text-[9px] font-mono-data text-[#8292A6] bg-black/60 px-1.5 py-0.5 rounded border border-[#2B3545]">
                            Brent ICE &amp; Dark Fleet AIS
                          </span>
                        </div>
                        <span className="text-[10px] font-mono-data text-[#8292A6]">
                          GEOPOLITICAL WAR RISK &amp; CHOKEPOINT DISRUPTION HEDGER
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleStrategy("SMC_RISK_v34")}
                      className={`px-2.5 py-1 rounded text-[10px] font-mono-data font-bold uppercase transition-all flex items-center gap-1.5 ${
                        strategyStates.SMC_RISK_v34 === "ACTIVE"
                          ? "bg-[#10B981]/20 text-emerald-300 border border-[#10B981]/40"
                          : strategyStates.SMC_RISK_v34 === "SIMULATING"
                          ? "bg-[#B08D57]/20 text-[#E5C794] border border-[#B08D57]/40"
                          : "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                      }`}
                    >
                      {strategyStates.SMC_RISK_v34 === "ACTIVE" ? (
                        <Play className="w-2.5 h-2.5 fill-current" />
                      ) : strategyStates.SMC_RISK_v34 === "SIMULATING" ? (
                        <Radio className="w-2.5 h-2.5" />
                      ) : (
                        <Pause className="w-2.5 h-2.5 fill-current" />
                      )}
                      <span>{strategyStates.SMC_RISK_v34}</span>
                    </button>
                  </div>

                  {/* Quantitative Parameters & Live Metric */}
                  <div className="grid grid-cols-2 gap-2 my-3 p-2.5 bg-black/45 rounded-lg border border-[#1E2738] text-xs font-mono-data">
                    <div>
                      <span className="text-[#8292A6] text-[10px] block">Live Benchmark</span>
                      <span className="text-[#EDE9DE] font-bold text-sm">Brent $105.25 / bbl</span>
                    </div>
                    <div>
                      <span className="text-[#8292A6] text-[10px] block">Geopolitical Premium</span>
                      <span className="text-rose-400 font-bold text-sm">
                        {macroData?.engines.middleEastWarRisk.brentGeopoliticalPremium || "$18.50 / bbl"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#8292A6] text-[10px] block">Bab el-Mandeb Risk</span>
                      <span className="text-rose-400 font-semibold">90/100 (74.8% Rerouted)</span>
                    </div>
                    <div>
                      <span className="text-[#8292A6] text-[10px] block">Dark Fleet Outflow</span>
                      <span className="text-amber-300 font-semibold">1.62M bpd (412 Tankers)</span>
                    </div>
                  </div>

                  {/* Execution Logic & Transmission */}
                  <div className="space-y-1.5 text-xs font-mono-data text-[#BAC7D5] mb-4">
                    <p className="text-[11px] leading-relaxed text-[#8292A6]">
                      <strong>Execution Logic:</strong> Synthesizes real-time AIS spoofing beacons, satellite SAR imagery around Kharg Island, and Houthi kinetic anti-ship drone strikes. Implements tactical long prompt Brent backwardation calendar spreads with beta-hedged safe-haven gold exposure.
                    </p>
                    <div className="flex items-center justify-between text-[10px] pt-1 text-[#8292A6] border-t border-[#1E2738]">
                      <span>Historical Sharpe: 3.15</span>
                      <span>Win Rate: 71.0%</span>
                      <span className="text-emerald-400 font-bold">Max Drawdown: -2.9%</span>
                    </div>
                  </div>
                </div>

                {/* Card Action Controls */}
                <div className="pt-3 border-t border-[#222C3D] flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono-data text-[#8292A6]">
                    Execution Gateway: ICE Futures Europe Feed
                  </span>
                  <button
                    onClick={() =>
                      handleSimulateTrigger(
                        "SMC_RISK_v3.4",
                        "Geopolitical Hedger",
                        "Brent Prompt Backwardation Spreads",
                        "SHORT_HEDGE"
                      )
                    }
                    className="px-2.5 py-1.5 rounded bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/35 font-mono-data text-xs font-bold transition-all flex items-center gap-1.5"
                  >
                    <Crosshair className="w-3.5 h-3.5 text-rose-400" />
                    <span>Simulate War Risk Setup</span>
                  </button>
                </div>
              </div>
            )}

            {/* 4. SMC_LIQ_v1.9 // Fed Net Liquidity & Treasury Refill Arbitrage */}
            {(engineFilter === "ALL" || engineFilter === "NET_LIQUIDITY") && (
              <div className="bg-[#141923] border border-[#222C3D] rounded-xl p-5 shadow-xl flex flex-col justify-between hover:border-[#B08D57]/40 transition-colors">
                <div>
                  {/* Top Header & State Toggle */}
                  <div className="flex items-start justify-between pb-3 border-b border-[#222C3D] gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-sky-500/15 border border-sky-500/40 flex items-center justify-center text-sky-400">
                        <Activity className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-editorial text-lg font-bold text-[#EDE9DE]">
                            SMC_LIQ_v1.9
                          </h3>
                          <span className="text-[9px] font-mono-data text-[#8292A6] bg-black/60 px-1.5 py-0.5 rounded border border-[#2B3545]">
                            Fed Assets • TGA • RRP
                          </span>
                        </div>
                        <span className="text-[10px] font-mono-data text-[#8292A6]">
                          US BALANCE SHEET NET LIQUIDITY &amp; TGA REFILL DRAIN ARBITRAGE
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleStrategy("SMC_LIQ_v19")}
                      className={`px-2.5 py-1 rounded text-[10px] font-mono-data font-bold uppercase transition-all flex items-center gap-1.5 ${
                        strategyStates.SMC_LIQ_v19 === "ACTIVE"
                          ? "bg-[#10B981]/20 text-emerald-300 border border-[#10B981]/40"
                          : strategyStates.SMC_LIQ_v19 === "SIMULATING"
                          ? "bg-[#B08D57]/20 text-[#E5C794] border border-[#B08D57]/40"
                          : "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                      }`}
                    >
                      {strategyStates.SMC_LIQ_v19 === "ACTIVE" ? (
                        <Play className="w-2.5 h-2.5 fill-current" />
                      ) : strategyStates.SMC_LIQ_v19 === "SIMULATING" ? (
                        <Radio className="w-2.5 h-2.5" />
                      ) : (
                        <Pause className="w-2.5 h-2.5 fill-current" />
                      )}
                      <span>{strategyStates.SMC_LIQ_v19}</span>
                    </button>
                  </div>

                  {/* Quantitative Parameters & Live Metric */}
                  <div className="grid grid-cols-2 gap-2 my-3 p-2.5 bg-black/45 rounded-lg border border-[#1E2738] text-xs font-mono-data">
                    <div>
                      <span className="text-[#8292A6] text-[10px] block">Net Fed Liquidity</span>
                      <span className="text-[#EDE9DE] font-bold text-sm">$5,980 Billion</span>
                    </div>
                    <div>
                      <span className="text-[#8292A6] text-[10px] block">Treasury Cash (TGA)</span>
                      <span className="text-sky-400 font-bold text-sm">$785B (+46.8B WoW)</span>
                    </div>
                    <div>
                      <span className="text-[#8292A6] text-[10px] block">RRP Buffer Remaining</span>
                      <span className="text-rose-400 font-semibold">$215B (8.4% Buffer)</span>
                    </div>
                    <div>
                      <span className="text-[#8292A6] text-[10px] block">Bank Reserves</span>
                      <span className="text-emerald-400 font-semibold">$3,280B (Ample Floor $3.0T)</span>
                    </div>
                  </div>

                  {/* Execution Logic & Transmission */}
                  <div className="space-y-1.5 text-xs font-mono-data text-[#BAC7D5] mb-4">
                    <p className="text-[11px] leading-relaxed text-[#8292A6]">
                      <strong>Execution Logic:</strong> Systematic arbitrage exploiting the 1:1 mechanical drain of private bank deposits when the US Treasury refills its checking account (TGA) while the Reverse Repo Facility (RRP) is depleted. Initiates short bias on tech beta against equal-weight indices.
                    </p>
                    <div className="flex items-center justify-between text-[10px] pt-1 text-[#8292A6] border-t border-[#1E2738]">
                      <span>Historical Sharpe: 2.45</span>
                      <span>Win Rate: 65.0%</span>
                      <span className="text-emerald-400 font-bold">Correlation SPX: +0.88</span>
                    </div>
                  </div>
                </div>

                {/* Card Action Controls */}
                <div className="pt-3 border-t border-[#222C3D] flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono-data text-[#8292A6]">
                    Execution Gateway: CME E-mini Feed
                  </span>
                  <button
                    onClick={() =>
                      handleSimulateTrigger(
                        "SMC_LIQ_v1.9",
                        "Net Liquidity Arb",
                        "NQ Mini vs RSP Long Rebalance",
                        "REBALANCE"
                      )
                    }
                    className="px-2.5 py-1.5 rounded bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 border border-sky-500/35 font-mono-data text-xs font-bold transition-all flex items-center gap-1.5"
                  >
                    <Crosshair className="w-3.5 h-3.5 text-sky-400" />
                    <span>Simulate TGA Drain Setup</span>
                  </button>
                </div>
              </div>
            )}

            {/* 5. SMC_SPX_v5.4 // S&P 500 Auction & 0DTE Volatility Surface Engine */}
            {(engineFilter === "ALL" || engineFilter === "US_EQUITIES" || engineFilter === "INDEX_PROP") && (
              <div className="bg-[#141923] border border-[#222C3D] rounded-xl p-5 shadow-xl flex flex-col justify-between hover:border-[#6366F1]/40 transition-colors">
                <div>
                  {/* Top Header & State Toggle */}
                  <div className="flex items-start justify-between pb-3 border-b border-[#222C3D] gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-[#6366F1]/15 border border-[#6366F1]/40 flex items-center justify-center text-indigo-400">
                        <TrendingUp className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-editorial text-lg font-bold text-[#EDE9DE]">
                            SMC_SPX_v5.4
                          </h3>
                          <span className="text-[9px] font-mono-data text-[#8292A6] bg-black/60 px-1.5 py-0.5 rounded border border-[#2B3545]">
                            CME E-mini ES &amp; SPX 0DTE
                          </span>
                        </div>
                        <span className="text-[10px] font-mono-data text-[#8292A6]">
                          09:30 EST CASH OPEN BRACKET &amp; DEALER GAMMA SURFACE (GEX)
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleStrategy("SMC_SPX_v54")}
                      className={`px-2.5 py-1 rounded text-[10px] font-mono-data font-bold uppercase transition-all flex items-center gap-1.5 ${
                        strategyStates.SMC_SPX_v54 === "ACTIVE"
                          ? "bg-[#10B981]/20 text-emerald-300 border border-[#10B981]/40"
                          : strategyStates.SMC_SPX_v54 === "SIMULATING"
                          ? "bg-[#B08D57]/20 text-[#E5C794] border border-[#B08D57]/40"
                          : "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                      }`}
                    >
                      {strategyStates.SMC_SPX_v54 === "ACTIVE" ? (
                        <Play className="w-2.5 h-2.5 fill-current" />
                      ) : strategyStates.SMC_SPX_v54 === "SIMULATING" ? (
                        <Radio className="w-2.5 h-2.5" />
                      ) : (
                        <Pause className="w-2.5 h-2.5 fill-current" />
                      )}
                      <span>{strategyStates.SMC_SPX_v54}</span>
                    </button>
                  </div>

                  {/* Quantitative Parameters & Live Metric */}
                  <div className="grid grid-cols-2 gap-2 my-3 p-2.5 bg-black/45 rounded-lg border border-[#1E2738] text-xs font-mono-data">
                    <div>
                      <span className="text-[#8292A6] text-[10px] block">Live Underlying</span>
                      <span className="text-[#EDE9DE] font-bold text-sm">
                        S&amp;P 500 {spxPrice.toFixed(1)} pts
                      </span>
                    </div>
                    <div>
                      <span className="text-[#8292A6] text-[10px] block">Zero Gamma Flip</span>
                      <span className="text-indigo-400 font-bold text-sm">
                        5,850 Strike (+1.35x Call Skew)
                      </span>
                    </div>
                    <div>
                      <span className="text-[#8292A6] text-[10px] block">0DTE Vol Imbalance</span>
                      <span className="text-emerald-400 font-semibold">+18,400 &Delta; (Bullish Skew)</span>
                    </div>
                    <div>
                      <span className="text-[#8292A6] text-[10px] block">Execution Threshold</span>
                      <span className="text-sky-300 font-semibold">VWAP &plusmn;1.8&sigma; Bracket</span>
                    </div>
                  </div>

                  {/* Execution Logic & Transmission */}
                  <div className="space-y-1.5 text-xs font-mono-data text-[#BAC7D5] mb-4">
                    <p className="text-[11px] leading-relaxed text-[#8292A6]">
                      <strong>Execution Logic:</strong> Monitors opening 15-minute Initial Balance (IB) range expansions against institutional dealer gamma exposure (GEX) inflection levels. Automatically executes mean-reversion brackets back toward the volume profile VWAP anchor upon liquidity sweep rejections.
                    </p>
                    <div className="flex items-center justify-between text-[10px] pt-1 text-[#8292A6] border-t border-[#1E2738]">
                      <span>Historical Sharpe: 2.76</span>
                      <span>Win Rate: 72.5%</span>
                      <span className="text-emerald-400 font-bold">Max Drawdown: -3.2%</span>
                    </div>
                  </div>
                </div>

                {/* Card Action Controls */}
                <div className="pt-3 border-t border-[#222C3D] flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono-data text-[#8292A6]">
                    Execution Gateway: CME Globex Direct DMA
                  </span>
                  <button
                    onClick={() =>
                      handleSimulateTrigger(
                        "SMC_SPX_v5.4",
                        "S&P 500 0DTE Volatility",
                        "S&P 500 E-mini (ES Futures)",
                        "BUY_LIMIT"
                      )
                    }
                    className="px-2.5 py-1.5 rounded bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/35 font-mono-data text-xs font-bold transition-all flex items-center gap-1.5"
                  >
                    <Crosshair className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Simulate 0DTE GEX Setup</span>
                  </button>
                </div>
              </div>
            )}

            {/* 6. SMC_DAX_v6.2 // DAX 40 European Core & Sovereign Yield Spread Engine */}
            {(engineFilter === "ALL" || engineFilter === "EUROPEAN_CORE" || engineFilter === "INDEX_PROP") && (
              <div className="bg-[#141923] border border-[#222C3D] rounded-xl p-5 shadow-xl flex flex-col justify-between hover:border-[#F59E0B]/40 transition-colors">
                <div>
                  {/* Top Header & State Toggle */}
                  <div className="flex items-start justify-between pb-3 border-b border-[#222C3D] gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-[#F59E0B]/15 border border-[#F59E0B]/40 flex items-center justify-center text-amber-400">
                        <BarChart3 className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-editorial text-lg font-bold text-[#EDE9DE]">
                            SMC_DAX_v6.2
                          </h3>
                          <span className="text-[9px] font-mono-data text-[#8292A6] bg-black/60 px-1.5 py-0.5 rounded border border-[#2B3545]">
                            Eurex Frankfurt (FDAX)
                          </span>
                        </div>
                        <span className="text-[10px] font-mono-data text-[#8292A6]">
                          PAN-EUROPEAN INDUSTRIAL CORE &amp; 10Y BUND SPREAD MOMENTUM
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleStrategy("SMC_DAX_v62")}
                      className={`px-2.5 py-1 rounded text-[10px] font-mono-data font-bold uppercase transition-all flex items-center gap-1.5 ${
                        strategyStates.SMC_DAX_v62 === "ACTIVE"
                          ? "bg-[#10B981]/20 text-emerald-300 border border-[#10B981]/40"
                          : strategyStates.SMC_DAX_v62 === "SIMULATING"
                          ? "bg-[#B08D57]/20 text-[#E5C794] border border-[#B08D57]/40"
                          : "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                      }`}
                    >
                      {strategyStates.SMC_DAX_v62 === "ACTIVE" ? (
                        <Play className="w-2.5 h-2.5 fill-current" />
                      ) : strategyStates.SMC_DAX_v62 === "SIMULATING" ? (
                        <Radio className="w-2.5 h-2.5" />
                      ) : (
                        <Pause className="w-2.5 h-2.5 fill-current" />
                      )}
                      <span>{strategyStates.SMC_DAX_v62}</span>
                    </button>
                  </div>

                  {/* Quantitative Parameters & Live Metric */}
                  <div className="grid grid-cols-2 gap-2 my-3 p-2.5 bg-black/45 rounded-lg border border-[#1E2738] text-xs font-mono-data">
                    <div>
                      <span className="text-[#8292A6] text-[10px] block">Live Underlying</span>
                      <span className="text-[#EDE9DE] font-bold text-sm">
                        DAX 40 {daxPrice.toFixed(1)} pts
                      </span>
                    </div>
                    <div>
                      <span className="text-[#8292A6] text-[10px] block">German 10Y Bund Anchor</span>
                      <span className="text-amber-400 font-bold text-sm">
                        2.268% (Spread: +3.4 bps)
                      </span>
                    </div>
                    <div>
                      <span className="text-[#8292A6] text-[10px] block">EUR/USD Export Beta</span>
                      <span className="text-emerald-400 font-semibold">{eurUsdRate.toFixed(4)} (Tailwind)</span>
                    </div>
                    <div>
                      <span className="text-[#8292A6] text-[10px] block">VDAX-NEW Metric</span>
                      <span className="text-sky-300 font-semibold">14.8% (Normal Compressed)</span>
                    </div>
                  </div>

                  {/* Execution Logic & Transmission */}
                  <div className="space-y-1.5 text-xs font-mono-data text-[#BAC7D5] mb-4">
                    <p className="text-[11px] leading-relaxed text-[#8292A6]">
                      <strong>Execution Logic:</strong> Exploits tactical yield spread divergence between German Bunds and German industrial equities. Triggers long momentum breakouts during Frankfurt cash open when DAX/IBEX and DAX/CAC cross-market divergence crosses +42 bps.
                    </p>
                    <div className="flex items-center justify-between text-[10px] pt-1 text-[#8292A6] border-t border-[#1E2738]">
                      <span>Historical Sharpe: 2.38</span>
                      <span>Win Rate: 69.1%</span>
                      <span className="text-emerald-400 font-bold">Max Drawdown: -3.9%</span>
                    </div>
                  </div>
                </div>

                {/* Card Action Controls */}
                <div className="pt-3 border-t border-[#222C3D] flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono-data text-[#8292A6]">
                    Execution Gateway: Eurex Frankfurt T7
                  </span>
                  <button
                    onClick={() =>
                      handleSimulateTrigger(
                        "SMC_DAX_v6.2",
                        "DAX European Core",
                        "DAX 40 Futures (FDAX)",
                        "BUY_LIMIT"
                      )
                    }
                    className="px-2.5 py-1.5 rounded bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/35 font-mono-data text-xs font-bold transition-all flex items-center gap-1.5"
                  >
                    <Crosshair className="w-3.5 h-3.5 text-amber-400" />
                    <span>Simulate Bund Spread Setup</span>
                  </button>
                </div>
              </div>
            )}

            {/* 7. SMC_N225_v3.8 // Nikkei 225 Tokyo Open & Carry Trade Co-Integration Engine */}
            {(engineFilter === "ALL" || engineFilter === "ASIA_TECH" || engineFilter === "INDEX_PROP") && (
              <div className="bg-[#141923] border border-[#222C3D] rounded-xl p-5 shadow-xl flex flex-col justify-between hover:border-[#EC4899]/40 transition-colors">
                <div>
                  {/* Top Header & State Toggle */}
                  <div className="flex items-start justify-between pb-3 border-b border-[#222C3D] gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-[#EC4899]/15 border border-[#EC4899]/40 flex items-center justify-center text-pink-400">
                        <Zap className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-editorial text-lg font-bold text-[#EDE9DE]">
                            SMC_N225_v3.8
                          </h3>
                          <span className="text-[9px] font-mono-data text-[#8292A6] bg-black/60 px-1.5 py-0.5 rounded border border-[#2B3545]">
                            Osaka OSE &amp; CME Nikkei
                          </span>
                        </div>
                        <span className="text-[10px] font-mono-data text-[#8292A6]">
                          TOKYO CASH OPEN &amp; YEN CARRY TRADE LIQUIDITY CASCADE
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleStrategy("SMC_N225_v38")}
                      className={`px-2.5 py-1 rounded text-[10px] font-mono-data font-bold uppercase transition-all flex items-center gap-1.5 ${
                        strategyStates.SMC_N225_v38 === "ACTIVE"
                          ? "bg-[#10B981]/20 text-emerald-300 border border-[#10B981]/40"
                          : strategyStates.SMC_N225_v38 === "SIMULATING"
                          ? "bg-[#B08D57]/20 text-[#E5C794] border border-[#B08D57]/40"
                          : "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                      }`}
                    >
                      {strategyStates.SMC_N225_v38 === "ACTIVE" ? (
                        <Play className="w-2.5 h-2.5 fill-current" />
                      ) : strategyStates.SMC_N225_v38 === "SIMULATING" ? (
                        <Radio className="w-2.5 h-2.5" />
                      ) : (
                        <Pause className="w-2.5 h-2.5 fill-current" />
                      )}
                      <span>{strategyStates.SMC_N225_v38}</span>
                    </button>
                  </div>

                  {/* Quantitative Parameters & Live Metric */}
                  <div className="grid grid-cols-2 gap-2 my-3 p-2.5 bg-black/45 rounded-lg border border-[#1E2738] text-xs font-mono-data">
                    <div>
                      <span className="text-[#8292A6] text-[10px] block">Live Underlying</span>
                      <span className="text-[#EDE9DE] font-bold text-sm">
                        Nikkei 225 {nikkeiPrice.toFixed(1)} pts
                      </span>
                    </div>
                    <div>
                      <span className="text-[#8292A6] text-[10px] block">USD/JPY Beta Sensitivity</span>
                      <span className="text-pink-400 font-bold text-sm">
                        1.42x (Carry Dynamic)
                      </span>
                    </div>
                    <div>
                      <span className="text-[#8292A6] text-[10px] block">Tokyo 15M Range</span>
                      <span className="text-emerald-400 font-semibold">280 pts (IB Expansion)</span>
                    </div>
                    <div>
                      <span className="text-[#8292A6] text-[10px] block">Foreign Flow Track</span>
                      <span className="text-sky-300 font-semibold">+&yen;340B Net Inflow</span>
                    </div>
                  </div>

                  {/* Execution Logic & Transmission */}
                  <div className="space-y-1.5 text-xs font-mono-data text-[#BAC7D5] mb-4">
                    <p className="text-[11px] leading-relaxed text-[#8292A6]">
                      <strong>Execution Logic:</strong> Captures rapid liquidity cascades during the 09:00 JST Tokyo cash open. Co-integrates overnight US equity closes with USD/JPY spot velocity to establish long exporter positions during yen pullbacks and fade excessive morning opening gaps.
                    </p>
                    <div className="flex items-center justify-between text-[10px] pt-1 text-[#8292A6] border-t border-[#1E2738]">
                      <span>Historical Sharpe: 2.51</span>
                      <span>Win Rate: 70.8%</span>
                      <span className="text-emerald-400 font-bold">Captured: +620 pts / mo</span>
                    </div>
                  </div>
                </div>

                {/* Card Action Controls */}
                <div className="pt-3 border-t border-[#222C3D] flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono-data text-[#8292A6]">
                    Execution Gateway: OSE / CME Nikkei DMA
                  </span>
                  <button
                    onClick={() =>
                      handleSimulateTrigger(
                        "SMC_N225_v3.8",
                        "Nikkei Tokyo Open",
                        "Nikkei 225 Futures (OSE)",
                        "BUY_LIMIT"
                      )
                    }
                    className="px-2.5 py-1.5 rounded bg-pink-500/15 hover:bg-pink-500/25 text-pink-300 border border-pink-500/35 font-mono-data text-xs font-bold transition-all flex items-center gap-1.5"
                  >
                    <Crosshair className="w-3.5 h-3.5 text-pink-400" />
                    <span>Simulate Tokyo Open Setup</span>
                  </button>
                </div>
              </div>
            )}

            {/* 8. SMC_SEMIS_v2.5 // KOSPI 200 Global AI & Memory Bellwether Engine */}
            {(engineFilter === "ALL" || engineFilter === "ASIA_TECH" || engineFilter === "INDEX_PROP") && (
              <div className="bg-[#141923] border border-[#222C3D] rounded-xl p-5 shadow-xl flex flex-col justify-between hover:border-[#14B8A6]/40 transition-colors">
                <div>
                  {/* Top Header & State Toggle */}
                  <div className="flex items-start justify-between pb-3 border-b border-[#222C3D] gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-[#14B8A6]/15 border border-[#14B8A6]/40 flex items-center justify-center text-teal-400">
                        <Cpu className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-editorial text-lg font-bold text-[#EDE9DE]">
                            SMC_SEMIS_v2.5
                          </h3>
                          <span className="text-[9px] font-mono-data text-[#8292A6] bg-black/60 px-1.5 py-0.5 rounded border border-[#2B3545]">
                            KRX Seoul (KOSPI 200)
                          </span>
                        </div>
                        <span className="text-[10px] font-mono-data text-[#8292A6]">
                          GLOBAL AI HARDWARE &amp; HBM MEMORY SEMICONDUCTOR BELLWETHER
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleStrategy("SMC_SEMIS_v25")}
                      className={`px-2.5 py-1 rounded text-[10px] font-mono-data font-bold uppercase transition-all flex items-center gap-1.5 ${
                        strategyStates.SMC_SEMIS_v25 === "ACTIVE"
                          ? "bg-[#10B981]/20 text-emerald-300 border border-[#10B981]/40"
                          : strategyStates.SMC_SEMIS_v25 === "SIMULATING"
                          ? "bg-[#B08D57]/20 text-[#E5C794] border border-[#B08D57]/40"
                          : "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                      }`}
                    >
                      {strategyStates.SMC_SEMIS_v25 === "ACTIVE" ? (
                        <Play className="w-2.5 h-2.5 fill-current" />
                      ) : strategyStates.SMC_SEMIS_v25 === "SIMULATING" ? (
                        <Radio className="w-2.5 h-2.5" />
                      ) : (
                        <Pause className="w-2.5 h-2.5 fill-current" />
                      )}
                      <span>{strategyStates.SMC_SEMIS_v25}</span>
                    </button>
                  </div>

                  {/* Quantitative Parameters & Live Metric */}
                  <div className="grid grid-cols-2 gap-2 my-3 p-2.5 bg-black/45 rounded-lg border border-[#1E2738] text-xs font-mono-data">
                    <div>
                      <span className="text-[#8292A6] text-[10px] block">Live Underlying</span>
                      <span className="text-[#EDE9DE] font-bold text-sm">
                        KOSPI 200 {kospiPrice.toFixed(2)} pts
                      </span>
                    </div>
                    <div>
                      <span className="text-[#8292A6] text-[10px] block">Samsung/Hynix Weight</span>
                      <span className="text-teal-400 font-bold text-sm">
                        41.2% High-Beta Core
                      </span>
                    </div>
                    <div>
                      <span className="text-[#8292A6] text-[10px] block">HBM Pricing Spread</span>
                      <span className="text-emerald-400 font-semibold">+8.4% Premium Lead</span>
                    </div>
                    <div>
                      <span className="text-[#8292A6] text-[10px] block">Foreign Seoul Flow</span>
                      <span className="text-sky-300 font-semibold">+&#8361;420B Net Institutional</span>
                    </div>
                  </div>

                  {/* Execution Logic & Transmission */}
                  <div className="space-y-1.5 text-xs font-mono-data text-[#BAC7D5] mb-4">
                    <p className="text-[11px] leading-relaxed text-[#8292A6]">
                      <strong>Execution Logic:</strong> Tracks institutional net order flow in Samsung Electronics and SK Hynix during the Seoul morning auction. Front-runs leading semiconductor cyclical indicators to position in global hardware beta before US market open (SOX / Nvidia / AMD).
                    </p>
                    <div className="flex items-center justify-between text-[10px] pt-1 text-[#8292A6] border-t border-[#1E2738]">
                      <span>Historical Sharpe: 2.42</span>
                      <span>Win Rate: 67.5%</span>
                      <span className="text-emerald-400 font-bold">SOX Lead: +0.84 Corr</span>
                    </div>
                  </div>
                </div>

                {/* Card Action Controls */}
                <div className="pt-3 border-t border-[#222C3D] flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono-data text-[#8292A6]">
                    Execution Gateway: KRX Derivatives Direct Feed
                  </span>
                  <button
                    onClick={() =>
                      handleSimulateTrigger(
                        "SMC_SEMIS_v2.5",
                        "KOSPI Semis Bellwether",
                        "KOSPI 200 Futures (KRX)",
                        "BUY_LIMIT"
                      )
                    }
                    className="px-2.5 py-1.5 rounded bg-teal-500/15 hover:bg-teal-500/25 text-teal-300 border border-teal-500/35 font-mono-data text-xs font-bold transition-all flex items-center gap-1.5"
                  >
                    <Crosshair className="w-3.5 h-3.5 text-teal-400" />
                    <span>Simulate Semis Flow Setup</span>
                  </button>
                </div>
              </div>
            )}

            {/* 9. SMC_HSI_v4.0 // Hang Seng Greater China Tech & PBOC Liquidity Engine */}
            {(engineFilter === "ALL" || engineFilter === "ASIA_TECH" || engineFilter === "INDEX_PROP") && (
              <div className="bg-[#141923] border border-[#222C3D] rounded-xl p-5 shadow-xl flex flex-col justify-between hover:border-[#8B5CF6]/40 transition-colors">
                <div>
                  {/* Top Header & State Toggle */}
                  <div className="flex items-start justify-between pb-3 border-b border-[#222C3D] gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-[#8B5CF6]/15 border border-[#8B5CF6]/40 flex items-center justify-center text-purple-400">
                        <ArrowUpRight className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-editorial text-lg font-bold text-[#EDE9DE]">
                            SMC_HSI_v4.0
                          </h3>
                          <span className="text-[9px] font-mono-data text-[#8292A6] bg-black/60 px-1.5 py-0.5 rounded border border-[#2B3545]">
                            HKEX Hong Kong (HSI)
                          </span>
                        </div>
                        <span className="text-[10px] font-mono-data text-[#8292A6]">
                          GREATER CHINA TECH &amp; SOUTHBOUND STOCK CONNECT LIQUIDITY
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleStrategy("SMC_HSI_v40")}
                      className={`px-2.5 py-1 rounded text-[10px] font-mono-data font-bold uppercase transition-all flex items-center gap-1.5 ${
                        strategyStates.SMC_HSI_v40 === "ACTIVE"
                          ? "bg-[#10B981]/20 text-emerald-300 border border-[#10B981]/40"
                          : strategyStates.SMC_HSI_v40 === "SIMULATING"
                          ? "bg-[#B08D57]/20 text-[#E5C794] border border-[#B08D57]/40"
                          : "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                      }`}
                    >
                      {strategyStates.SMC_HSI_v40 === "ACTIVE" ? (
                        <Play className="w-2.5 h-2.5 fill-current" />
                      ) : strategyStates.SMC_HSI_v40 === "SIMULATING" ? (
                        <Radio className="w-2.5 h-2.5" />
                      ) : (
                        <Pause className="w-2.5 h-2.5 fill-current" />
                      )}
                      <span>{strategyStates.SMC_HSI_v40}</span>
                    </button>
                  </div>

                  {/* Quantitative Parameters & Live Metric */}
                  <div className="grid grid-cols-2 gap-2 my-3 p-2.5 bg-black/45 rounded-lg border border-[#1E2738] text-xs font-mono-data">
                    <div>
                      <span className="text-[#8292A6] text-[10px] block">Live Underlying</span>
                      <span className="text-[#EDE9DE] font-bold text-sm">
                        Hang Seng {hsiPrice.toFixed(1)} pts
                      </span>
                    </div>
                    <div>
                      <span className="text-[#8292A6] text-[10px] block">Southbound Capital Inflow</span>
                      <span className="text-purple-400 font-bold text-sm">
                        +HK$4.2B Daily Quota
                      </span>
                    </div>
                    <div>
                      <span className="text-[#8292A6] text-[10px] block">PBOC 7D Reverse Repo</span>
                      <span className="text-emerald-400 font-semibold">1.50% Injections</span>
                    </div>
                    <div>
                      <span className="text-[#8292A6] text-[10px] block">Offshore CNH Spread</span>
                      <span className="text-sky-300 font-semibold">7.1240 USD/CNH Level</span>
                    </div>
                  </div>

                  {/* Execution Logic & Transmission */}
                  <div className="space-y-1.5 text-xs font-mono-data text-[#BAC7D5] mb-4">
                    <p className="text-[11px] leading-relaxed text-[#8292A6]">
                      <strong>Execution Logic:</strong> Monitors Southbound Stock Connect liquidity velocity and daily PBOC open market operations (OMO). Exploits intraday high-beta mean reversion on technology heavyweights (Tencent, Alibaba, Meituan) across Hong Kong cash sessions.
                    </p>
                    <div className="flex items-center justify-between text-[10px] pt-1 text-[#8292A6] border-t border-[#1E2738]">
                      <span>Historical Sharpe: 2.18</span>
                      <span>Win Rate: 66.2%</span>
                      <span className="text-emerald-400 font-bold">Captured: +880 pts / mo</span>
                    </div>
                  </div>
                </div>

                {/* Card Action Controls */}
                <div className="pt-3 border-t border-[#222C3D] flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono-data text-[#8292A6]">
                    Execution Gateway: HKEX OMD-D Market Feed
                  </span>
                  <button
                    onClick={() =>
                      handleSimulateTrigger(
                        "SMC_HSI_v4.0",
                        "Hang Seng Tech Liquidity",
                        "Hang Seng Index Futures (HKEX)",
                        "BUY_LIMIT"
                      )
                    }
                    className="px-2.5 py-1.5 rounded bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/35 font-mono-data text-xs font-bold transition-all flex items-center gap-1.5"
                  >
                    <Crosshair className="w-3.5 h-3.5 text-purple-400" />
                    <span>Simulate HK Cash Open Setup</span>
                  </button>
                </div>
              </div>
            )}

            {/* 10. SMC_CRYPTO_v9.1 // Bitcoin Macro Liquidity Sponge & CME Basis Arb Engine */}
            {(engineFilter === "ALL" || engineFilter === "CRYPTO_MACRO") && (
              <div className="bg-[#141923] border border-[#222C3D] rounded-xl p-5 shadow-xl flex flex-col justify-between hover:border-[#F97316]/40 transition-colors">
                <div>
                  {/* Top Header & State Toggle */}
                  <div className="flex items-start justify-between pb-3 border-b border-[#222C3D] gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-[#F97316]/15 border border-[#F97316]/40 flex items-center justify-center text-orange-400">
                        <Coins className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-editorial text-lg font-bold text-[#EDE9DE]">
                            SMC_CRYPTO_v9.1
                          </h3>
                          <span className="text-[9px] font-mono-data text-[#8292A6] bg-black/60 px-1.5 py-0.5 rounded border border-[#2B3545]">
                            CME Futures &amp; Spot BTC
                          </span>
                        </div>
                        <span className="text-[10px] font-mono-data text-[#8292A6]">
                          24/7 GLOBAL MACRO LIQUIDITY SPONGE &amp; CME BASIS CARRY ARB
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleStrategy("SMC_CRYPTO_v91")}
                      className={`px-2.5 py-1 rounded text-[10px] font-mono-data font-bold uppercase transition-all flex items-center gap-1.5 ${
                        strategyStates.SMC_CRYPTO_v91 === "ACTIVE"
                          ? "bg-[#10B981]/20 text-emerald-300 border border-[#10B981]/40"
                          : strategyStates.SMC_CRYPTO_v91 === "SIMULATING"
                          ? "bg-[#B08D57]/20 text-[#E5C794] border border-[#B08D57]/40"
                          : "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                      }`}
                    >
                      {strategyStates.SMC_CRYPTO_v91 === "ACTIVE" ? (
                        <Play className="w-2.5 h-2.5 fill-current" />
                      ) : strategyStates.SMC_CRYPTO_v91 === "SIMULATING" ? (
                        <Radio className="w-2.5 h-2.5" />
                      ) : (
                        <Pause className="w-2.5 h-2.5 fill-current" />
                      )}
                      <span>{strategyStates.SMC_CRYPTO_v91}</span>
                    </button>
                  </div>

                  {/* Quantitative Parameters & Live Metric */}
                  <div className="grid grid-cols-2 gap-2 my-3 p-2.5 bg-black/45 rounded-lg border border-[#1E2738] text-xs font-mono-data">
                    <div>
                      <span className="text-[#8292A6] text-[10px] block">Live Underlying</span>
                      <span className="text-[#EDE9DE] font-bold text-sm">
                        BTC ${Math.round(btcPrice).toLocaleString()} Spot
                      </span>
                    </div>
                    <div>
                      <span className="text-[#8292A6] text-[10px] block">CME Annualized Basis</span>
                      <span className="text-orange-400 font-bold text-sm">
                        +7.8% Cash &amp; Carry
                      </span>
                    </div>
                    <div>
                      <span className="text-[#8292A6] text-[10px] block">Global M2 Expansion</span>
                      <span className="text-emerald-400 font-semibold">+$280B 30-Day Delta</span>
                    </div>
                    <div>
                      <span className="text-[#8292A6] text-[10px] block">Perpetual Funding Rate</span>
                      <span className="text-sky-300 font-semibold">+0.012% (Neutral)</span>
                    </div>
                  </div>

                  {/* Execution Logic & Transmission */}
                  <div className="space-y-1.5 text-xs font-mono-data text-[#BAC7D5] mb-4">
                    <p className="text-[11px] leading-relaxed text-[#8292A6]">
                      <strong>Execution Logic:</strong> Executes systematic cash-and-carry basis arbitrage between CME Bitcoin futures and physical spot liquidity. Fades extreme retail weekend extensions and re-establishes delta-neutral institutional hedges ahead of Sunday 18:00 EST CME reopening.
                    </p>
                    <div className="flex items-center justify-between text-[10px] pt-1 text-[#8292A6] border-t border-[#1E2738]">
                      <span>Historical Sharpe: 2.92</span>
                      <span>Win Rate: 73.4%</span>
                      <span className="text-emerald-400 font-bold">Delta Neutral (&Delta; 0.0)</span>
                    </div>
                  </div>
                </div>

                {/* Card Action Controls */}
                <div className="pt-3 border-t border-[#222C3D] flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono-data text-[#8292A6]">
                    Execution Gateway: CME BTC Futures / OTC Spot
                  </span>
                  <button
                    onClick={() =>
                      handleSimulateTrigger(
                        "SMC_CRYPTO_v9.1",
                        "Bitcoin Macro Liquidity",
                        "CME Bitcoin Futures (BTC)",
                        "VOL_STRADDLE"
                      )
                    }
                    className="px-2.5 py-1.5 rounded bg-orange-500/15 hover:bg-orange-500/25 text-orange-300 border border-orange-500/35 font-mono-data text-xs font-bold transition-all flex items-center gap-1.5"
                  >
                    <Crosshair className="w-3.5 h-3.5 text-orange-400" />
                    <span>Simulate CME Basis Setup</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-VIEW 2: SIGNAL AUDIT STREAM (Real-time Order Execution Log)           */}
      {/* ========================================================================= */}
      {activeTab === "SIGNALS" && (
        <div className="bg-[#141923] border border-[#222C3D] rounded-xl p-5 shadow-xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#222C3D]">
            <div>
              <h3 className="font-editorial text-lg font-bold text-[#EDE9DE]">
                Systematic Signal Feed &amp; Model Performance Log
              </h3>
              <p className="text-xs font-mono-data text-[#8292A6]">
                TIMESTAMPED AUDIT LOG OF MODEL TRIGGERS, BRACKET LEVELS &amp; HISTORICAL ACTION SIGNALS
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  handleSimulateTrigger(
                    "SMC_PROP_v8.1",
                    "IBEX 35 Prop",
                    "IBEX 35 Mini MEFF",
                    "BUY_LIMIT"
                  )
                }
                className="px-3 py-1.5 rounded bg-[#B08D57] text-[#0A111C] font-mono-data text-xs font-bold hover:bg-[#C9A46D] transition-colors flex items-center gap-1.5 shadow"
              >
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>Generate Model Setup</span>
              </button>

              <button
                onClick={() => {
                  setSignals([]);
                  triggerToast("Signal log cleared.");
                }}
                className="px-2.5 py-1.5 rounded bg-black/50 text-[#8292A6] hover:text-[#EDE9DE] border border-[#2B3545] font-mono-data text-xs transition-colors"
              >
                Clear Log
              </button>
            </div>
          </div>

          {/* Audit Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono-data text-xs">
              <thead>
                <tr className="border-b border-[#222C3D] text-[#8292A6] text-[10px] uppercase">
                  <th className="pb-2">Timestamp</th>
                  <th className="pb-2">Engine Code</th>
                  <th className="pb-2">Action</th>
                  <th className="pb-2">Contract / Asset</th>
                  <th className="pb-2">Size</th>
                  <th className="pb-2">Execution Benchmark</th>
                  <th className="pb-2">Latency</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2 text-right">Session PnL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E2738]">
                {signals.map((sig) => (
                  <tr key={sig.id} className="hover:bg-black/30 transition-colors">
                    <td className="py-2.5 text-[#8292A6] text-[11px]">{sig.time}</td>
                    <td className="py-2.5 font-bold text-[#EDE9DE]">
                      <span className="px-1.5 py-0.5 rounded bg-black/60 border border-[#2B3545] text-[#BAC7D5]">
                        {sig.engineCode}
                      </span>
                    </td>
                    <td className="py-2.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          sig.action === "BUY_LIMIT"
                            ? "bg-emerald-500/20 text-emerald-300"
                            : sig.action === "SHORT_HEDGE"
                            ? "bg-rose-500/20 text-rose-300"
                            : sig.action === "PROFIT_TAKE"
                            ? "bg-sky-500/20 text-sky-300"
                            : "bg-[#B08D57]/20 text-[#E5C794]"
                        }`}
                      >
                        {sig.action}
                      </span>
                    </td>
                    <td className="py-2.5 text-[#EDE9DE] font-medium">{sig.asset}</td>
                    <td className="py-2.5 text-[#BAC7D5]">{sig.size}</td>
                    <td className="py-2.5 text-[#8292A6]">{sig.price}</td>
                    <td className="py-2.5 text-[#8292A6]">{sig.latencyMs}ms</td>
                    <td className="py-2.5">
                      <span
                        className={`text-[10px] font-bold ${
                          sig.status === "FILLED"
                            ? "text-emerald-400"
                            : sig.status === "HALTED"
                            ? "text-rose-400"
                            : "text-[#B08D57]"
                        }`}
                      >
                        {sig.status}
                      </span>
                    </td>
                    <td className="py-2.5 text-right font-bold text-emerald-400">
                      {formatSignalPnl(sig)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-VIEW 3: PARAMETRIC RISK CONTROLLER (Firm Hard Limits & Guardrails)    */}
      {/* ========================================================================= */}
      {activeTab === "RISK" && (
        <div className="bg-[#141923] border border-[#222C3D] rounded-xl p-5 shadow-xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#222C3D]">
            <div>
              <h3 className="font-editorial text-lg font-bold text-[#EDE9DE]">
                Parametric Risk Limits &amp; Portfolio Sizing Controls
              </h3>
              <p className="text-xs font-mono-data text-[#8292A6]">
                INTERCHANGEABLE BASE CURRENCY ({currency === "USD" ? "USD / $" : "EUR / €"}), PRE-TRADE HARD STOPS &amp; INSTRUMENT SIZING SPECIFICATIONS
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono-data px-2.5 py-1 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5 font-bold">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>RISK CHARTER: COMPLIANT</span>
              </span>
            </div>
          </div>

          {/* Master Account Capital Calibration Card */}
          <div className="p-4 rounded-xl bg-black/45 border border-[#B08D57]/40 space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded bg-[#B08D57]/20 border border-[#B08D57]/40 flex items-center justify-center text-[#B08D57]">
                  <Wallet className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-editorial text-base font-bold text-[#EDE9DE]">
                    Account Capital Base (NAV)
                  </h4>
                  <p className="text-[11px] font-mono-data text-[#8292A6]">
                    Adjustable capital base for retail accounts, prop challenges, or institutional desks.
                  </p>
                </div>
              </div>

              {/* Currency Interchangeable Switcher, FX Anchor & Active Capital Badge */}
              <div className="flex flex-wrap items-center gap-2.5 font-mono-data">
                <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-black/60 border border-[#2B3545] text-[10px] text-[#8292A6]">
                  <span>FX Anchor:</span>
                  <span className="text-[#EDE9DE] font-semibold">1 EUR = {eurUsdRate.toFixed(4)} USD</span>
                </div>

                <div className="flex items-center bg-black/60 p-1 rounded-lg border border-[#B08D57]/40">
                  <span className="text-[10px] text-[#8292A6] uppercase px-1.5 hidden sm:inline">Base:</span>
                  <button
                    onClick={() => {
                      handleSetCurrency("USD");
                      triggerToast("Base currency set to US Dollar ($ USD)");
                    }}
                    className={`px-2.5 py-1 rounded text-xs font-bold transition-all flex items-center gap-1 ${
                      currency === "USD"
                        ? "bg-[#B08D57] text-[#0A111C] shadow"
                        : "text-[#8292A6] hover:text-[#EDE9DE]"
                    }`}
                  >
                    <span>$</span>
                    <span>USD</span>
                  </button>
                  <button
                    onClick={() => {
                      handleSetCurrency("EUR");
                      triggerToast("Base currency set to Euro (€ EUR)");
                    }}
                    className={`px-2.5 py-1 rounded text-xs font-bold transition-all flex items-center gap-1 ${
                      currency === "EUR"
                        ? "bg-[#B08D57] text-[#0A111C] shadow"
                        : "text-[#8292A6] hover:text-[#EDE9DE]"
                    }`}
                  >
                    <span>€</span>
                    <span>EUR</span>
                  </button>
                </div>

                {/* Instant Live Conversion Action */}
                <button
                  onClick={() => {
                    const targetCur = currency === "USD" ? "EUR" : "USD";
                    const converted = currency === "USD"
                      ? Math.round(accountCapital / eurUsdRate)
                      : Math.round(accountCapital * eurUsdRate);
                    handleSetCurrency(targetCur);
                    setAccountCapital(converted);
                    triggerToast(`Converted NAV to ${targetCur === "USD" ? "$" : "€"}${converted.toLocaleString()} ${targetCur} at ${eurUsdRate.toFixed(4)} spot`);
                  }}
                  className="px-2 py-1 rounded bg-[#B08D57]/15 hover:bg-[#B08D57]/25 text-[#E5C794] border border-[#B08D57]/30 text-[10px] font-bold transition-colors hidden sm:flex items-center gap-1"
                  title="Convert capital base using live EUR/USD FX rate"
                >
                  <RefreshCw className="w-3 h-3 text-[#B08D57]" />
                  <span>Convert ({currency === "USD" ? `→ €${Math.round(accountCapital / eurUsdRate).toLocaleString()}` : `→ $${Math.round(accountCapital * eurUsdRate).toLocaleString()}`})</span>
                </button>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-[#8292A6] uppercase hidden sm:inline">Active NAV:</span>
                  <span className="text-lg font-bold text-[#E5C794] bg-[#B08D57]/15 px-3 py-1 rounded-lg border border-[#B08D57]/40">
                    {curSym}{accountCapital.toLocaleString()} {currency}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Capital Presets */}
            <div className="space-y-1.5 font-mono-data">
              <span className="text-[10px] text-[#8292A6] block uppercase font-medium">
                Quick Allocation Presets:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: `${curSym}5K`, sub: "Retail Micro", val: 5000 },
                  { label: `${curSym}10K`, sub: "Retail Starter", val: 10000 },
                  { label: `${curSym}25K`, sub: "Prop Challenge", val: 25000 },
                  { label: `${curSym}50K`, sub: "Funded Trader", val: 50000 },
                  { label: `${curSym}100K`, sub: "HNW Semi-Pro", val: 100000 },
                  { label: `${curSym}250K`, sub: "Family Office", val: 250000 },
                  { label: `${curSym}500K`, sub: "Institutional Desk", val: 500000 },
                  { label: `${curSym}1.0M`, sub: "Prime Book", val: 1000000 }
                ].map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => {
                      setAccountCapital(preset.val);
                      triggerToast(`Account capital calibrated to ${curSym}${preset.val.toLocaleString()} ${currency} (${preset.sub})`);
                    }}
                    className={`px-2.5 py-1 rounded border text-[11px] transition-all text-left ${
                      accountCapital === preset.val
                        ? "bg-[#B08D57] text-[#0A111C] border-[#B08D57] font-bold shadow"
                        : "bg-black/60 text-[#8292A6] border-[#222C3D] hover:text-[#EDE9DE] hover:border-[#B08D57]/40"
                    }`}
                  >
                    <span className="font-bold mr-1">{preset.label}</span>
                    <span className="text-[9px] opacity-75 hidden sm:inline">({preset.sub})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Interactive Number Input + Range Slider + Quick Steppers */}
            <div className="space-y-2 pt-1">
              <div className="flex flex-wrap items-center justify-between gap-2 font-mono-data text-xs">
                <label className="text-[#8292A6] text-[11px]">
                  Direct Capital Input / Fine-Tuning:
                </label>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setAccountCapital((prev) => Math.max(2000, prev - 5000))}
                    className="px-2 py-0.5 rounded bg-black/60 border border-[#2B3545] text-[#BAC7D5] hover:text-[#EDE9DE] text-[11px]"
                  >
                    -{curSym}5K
                  </button>
                  <button
                    onClick={() => setAccountCapital((prev) => prev + 5000)}
                    className="px-2 py-0.5 rounded bg-black/60 border border-[#2B3545] text-[#BAC7D5] hover:text-[#EDE9DE] text-[11px]"
                  >
                    +{curSym}5K
                  </button>
                  <button
                    onClick={() => setAccountCapital((prev) => prev + 25000)}
                    className="px-2 py-0.5 rounded bg-black/60 border border-[#2B3545] text-[#BAC7D5] hover:text-[#EDE9DE] text-[11px]"
                  >
                    +{curSym}25K
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8292A6] font-mono-data text-xs font-bold">
                    {curSym}
                  </span>
                  <input
                    type="number"
                    min="2000"
                    max="5000000"
                    step="1000"
                    value={accountCapital}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (!isNaN(val) && val >= 0) {
                        setAccountCapital(val);
                      }
                    }}
                    className="w-full bg-[#0A111C] border border-[#2B3545] rounded-lg pl-7 pr-3 py-1.5 text-xs font-mono-data text-[#EDE9DE] focus:border-[#B08D57] focus:outline-none transition-colors"
                  />
                </div>
                <div className="flex-[2] hidden sm:block">
                  <input
                    type="range"
                    min="5000"
                    max="1000000"
                    step="5000"
                    value={Math.min(1000000, accountCapital)}
                    onChange={(e) => setAccountCapital(parseInt(e.target.value, 10))}
                    className="w-full accent-[#B08D57] cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] font-mono-data text-[#8292A6]">
                    <span>{curSym}5K</span>
                    <span>{curSym}100K</span>
                    <span>{curSym}250K</span>
                    <span>{curSym}500K</span>
                    <span>{curSym}1.0M</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Dynamic Real-Dollar Calculated Metrics Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 pt-2 border-t border-[#1E2738] font-mono-data text-xs">
              <div className="p-2.5 rounded-lg bg-black/50 border border-[#1E2738]">
                <div className="flex items-center justify-between text-[10px] text-[#8292A6]">
                  <span>1.0R RISK UNIT</span>
                  <span className="text-emerald-400 font-bold">1.0%</span>
                </div>
                <span className="text-sm font-bold text-emerald-300 block mt-0.5">
                  {curSym}{Math.round(accountCapital * 0.01).toLocaleString()}
                </span>
                <span className="text-[9px] text-[#8292A6] block mt-0.5">
                  Standard trade risk budget
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-black/50 border border-[#1E2738]">
                <div className="flex items-center justify-between text-[10px] text-[#8292A6]">
                  <span>MAX SESSION STOP</span>
                  <span className="text-rose-400 font-bold">-{maxDrawdownPct.toFixed(1)}%</span>
                </div>
                <span className="text-sm font-bold text-rose-300 block mt-0.5">
                  -{curSym}{Math.round(accountCapital * (maxDrawdownPct / 100)).toLocaleString()}
                </span>
                <span className="text-[9px] text-[#8292A6] block mt-0.5">
                  Automated circuit breaker
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-black/50 border border-[#1E2738]">
                <div className="flex items-center justify-between text-[10px] text-[#8292A6]">
                  <span>MAX GROSS NOTIONAL</span>
                  <span className="text-[#E5C794] font-bold">{maxLeverage.toFixed(1)}x</span>
                </div>
                <span className="text-sm font-bold text-[#E5C794] block mt-0.5">
                  {curSym}{Math.round(accountCapital * maxLeverage).toLocaleString()}
                </span>
                <span className="text-[9px] text-[#8292A6] block mt-0.5">
                  Gross portfolio exposure cap
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-black/50 border border-[#1E2738]">
                <div className="flex items-center justify-between text-[10px] text-[#8292A6]">
                  <span>EST. MARGIN UTILIZED</span>
                  <span className="text-sky-400 font-bold">34.2%</span>
                </div>
                <span className="text-sm font-bold text-sky-300 block mt-0.5">
                  {curSym}{Math.round(accountCapital * 0.342).toLocaleString()}
                </span>
                <span className="text-[9px] text-[#8292A6] block mt-0.5">
                  Baseline across 10 global desks
                </span>
              </div>
            </div>
          </div>

          {/* Instrument Sizing Matrix (Retail Micro/Mini vs Institutional) */}
          <div className="p-4 rounded-xl bg-black/45 border border-[#1E2738] space-y-3 font-mono-data text-xs">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#1E2738]">
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-[#B08D57]" />
                <span className="text-sm font-bold text-[#EDE9DE]">
                  Instrument Sizing Matrix (Calibrated for {curSym}{accountCapital.toLocaleString()} {currency} Account)
                </span>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase border ${
                accountCapital < 50000
                  ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                  : accountCapital < 250000
                  ? "bg-sky-500/15 text-sky-300 border-sky-500/30"
                  : "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
              }`}>
                {accountCapital < 50000 ? "Retail Micro/Mini Tier" : accountCapital < 250000 ? "Prop / Mid Tier" : "Institutional Full Tier"}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-[11px]">
              {/* USD/JPY */}
              <div className="p-3 rounded-lg bg-black/60 border border-[#222C3D] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#EDE9DE]">SMC_VOL (USD/JPY)</span>
                  <span className="text-[9px] text-emerald-400 bg-emerald-500/10 px-1 rounded">FX</span>
                </div>
                <div className="text-[#8292A6] text-[10px]">Recommended Size:</div>
                <div className="font-bold text-[#E5C794]">
                  {accountCapital < 50000
                    ? `${(Math.max(0.1, (accountCapital / 10000) * 0.25)).toFixed(2)} Mini Lots`
                    : accountCapital < 250000
                    ? `${Math.max(1, Math.round((accountCapital / 100000) * 5))} Std Lots`
                    : `${Math.max(10, Math.round((accountCapital / 500000) * 35))} Std Lots`}
                </div>
                <div className="text-[10px] text-[#8292A6]">
                  {accountCapital < 50000 ? "Retail FX Spot / Micro 10K units" : "Currenex / EBS Standard 100K"}
                </div>
                <div className="text-[10px] text-emerald-400 pt-1 border-t border-[#1E2738]">
                  1.0R Risk: ~{curSym}{Math.round(accountCapital * 0.008).toLocaleString()}
                </div>
              </div>

              {/* IBEX 35 */}
              <div className="p-3 rounded-lg bg-black/60 border border-[#222C3D] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#EDE9DE]">SMC_PROP (IBEX 35)</span>
                  <span className="text-[9px] text-[#B08D57] bg-[#B08D57]/10 px-1 rounded">MEFF</span>
                </div>
                <div className="text-[#8292A6] text-[10px]">Recommended Size:</div>
                <div className="font-bold text-[#E5C794]">
                  {accountCapital < 50000
                    ? `${Math.max(1, Math.round((accountCapital / 10000) * 1.5))} Mini Contracts`
                    : accountCapital < 250000
                    ? `${Math.max(1, Math.round((accountCapital / 100000) * 3))} Standard Contracts`
                    : `${Math.max(5, Math.round((accountCapital / 500000) * 15))} Contracts`}
                </div>
                <div className="text-[10px] text-[#8292A6]">
                  {accountCapital < 50000
                    ? `MEFF Mini (${currency === "EUR" ? "€1/pt" : "$1.08/pt"} multiplier)`
                    : `MEFF Standard (${currency === "EUR" ? "€10/pt" : "$10.85/pt"} multiplier)`}
                </div>
                <div className="text-[10px] text-emerald-400 pt-1 border-t border-[#1E2738]">
                  1.0R Risk: ~{curSym}{Math.round(accountCapital * 0.01).toLocaleString()}
                </div>
              </div>

              {/* Brent War Risk */}
              <div className="p-3 rounded-lg bg-black/60 border border-[#222C3D] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#EDE9DE]">SMC_RISK (Brent Oil)</span>
                  <span className="text-[9px] text-rose-400 bg-rose-500/10 px-1 rounded">ICE</span>
                </div>
                <div className="text-[#8292A6] text-[10px]">Recommended Size:</div>
                <div className="font-bold text-[#E5C794]">
                  {accountCapital < 50000
                    ? `${Math.max(1, Math.round((accountCapital / 10000) * 2))} Micro Contracts`
                    : accountCapital < 250000
                    ? `${Math.max(1, Math.round((accountCapital / 100000) * 10))} Standard Contracts`
                    : `${Math.max(5000, Math.round((accountCapital / 500000) * 75000)).toLocaleString()} bbl`}
                </div>
                <div className="text-[10px] text-[#8292A6]">
                  {accountCapital < 50000 ? "ICE Micro Brent (100 bbl)" : "ICE Standard Brent (1,000 bbl)"}
                </div>
                <div className="text-[10px] text-emerald-400 pt-1 border-t border-[#1E2738]">
                  1.0R Risk: ~{curSym}{Math.round(accountCapital * 0.012).toLocaleString()}
                </div>
              </div>

              {/* Net Liquidity Arb */}
              <div className="p-3 rounded-lg bg-black/60 border border-[#222C3D] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#EDE9DE]">SMC_LIQ (Net Liq Arb)</span>
                  <span className="text-[9px] text-sky-400 bg-sky-500/10 px-1 rounded">CME</span>
                </div>
                <div className="text-[#8292A6] text-[10px]">Recommended Size:</div>
                <div className="font-bold text-[#E5C794]">
                  {accountCapital < 50000
                    ? `${Math.max(1, Math.round((accountCapital / 10000) * 1.5))} Micro Pairs`
                    : accountCapital < 250000
                    ? `${Math.max(1, Math.round((accountCapital / 100000) * 4))} E-mini Pairs`
                    : `${Math.max(5, Math.round((accountCapital / 500000) * 20))} E-mini Pairs`}
                </div>
                <div className="text-[10px] text-[#8292A6]">
                  {accountCapital < 50000 ? "Micro E-mini MNQ / MES ($2/pt)" : "E-mini NQ / ES ($20/pt)"}
                </div>
                <div className="text-[10px] text-emerald-400 pt-1 border-t border-[#1E2738]">
                  1.0R Risk: ~{curSym}{Math.round(accountCapital * 0.01).toLocaleString()}
                </div>
              </div>

              {/* S&P 500 0DTE Volatility Surface */}
              <div className="p-3 rounded-lg bg-black/60 border border-[#222C3D] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#EDE9DE]">SMC_SPX (S&amp;P 500)</span>
                  <span className="text-[9px] text-indigo-400 bg-indigo-500/10 px-1 rounded">CME</span>
                </div>
                <div className="text-[#8292A6] text-[10px]">Recommended Size:</div>
                <div className="font-bold text-[#E5C794]">
                  {accountCapital < 50000
                    ? `${Math.max(1, Math.round((accountCapital / 10000) * 1.5))} Micro MES`
                    : accountCapital < 250000
                    ? `${Math.max(1, Math.round((accountCapital / 100000) * 3))} Standard ES`
                    : `${Math.max(5, Math.round((accountCapital / 500000) * 14))} Standard ES`}
                </div>
                <div className="text-[10px] text-[#8292A6]">
                  {accountCapital < 50000 ? "Micro E-mini MES ($5/pt)" : "Standard E-mini ES ($50/pt)"}
                </div>
                <div className="text-[10px] text-emerald-400 pt-1 border-t border-[#1E2738]">
                  1.0R Risk: ~{curSym}{Math.round(accountCapital * 0.009).toLocaleString()}
                </div>
              </div>

              {/* DAX 40 European Core */}
              <div className="p-3 rounded-lg bg-black/60 border border-[#222C3D] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#EDE9DE]">SMC_DAX (DAX 40)</span>
                  <span className="text-[9px] text-amber-400 bg-amber-500/10 px-1 rounded">Eurex</span>
                </div>
                <div className="text-[#8292A6] text-[10px]">Recommended Size:</div>
                <div className="font-bold text-[#E5C794]">
                  {accountCapital < 50000
                    ? `${Math.max(1, Math.round((accountCapital / 10000) * 1))} Micro DAX`
                    : accountCapital < 250000
                    ? `${Math.max(1, Math.round((accountCapital / 100000) * 2))} Standard FDAX`
                    : `${Math.max(3, Math.round((accountCapital / 500000) * 10))} Standard FDAX`}
                </div>
                <div className="text-[10px] text-[#8292A6]">
                  {accountCapital < 50000 ? `Micro DAX (${currency === "EUR" ? "€1/pt" : "$1.08/pt"})` : `FDAX (${currency === "EUR" ? "€25/pt" : "$27.10/pt"})`}
                </div>
                <div className="text-[10px] text-emerald-400 pt-1 border-t border-[#1E2738]">
                  1.0R Risk: ~{curSym}{Math.round(accountCapital * 0.011).toLocaleString()}
                </div>
              </div>

              {/* Nikkei 225 Tokyo Open */}
              <div className="p-3 rounded-lg bg-black/60 border border-[#222C3D] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#EDE9DE]">SMC_N225 (Nikkei 225)</span>
                  <span className="text-[9px] text-pink-400 bg-pink-500/10 px-1 rounded">OSE</span>
                </div>
                <div className="text-[#8292A6] text-[10px]">Recommended Size:</div>
                <div className="font-bold text-[#E5C794]">
                  {accountCapital < 50000
                    ? `${Math.max(1, Math.round((accountCapital / 10000) * 2))} Mini NK225`
                    : accountCapital < 250000
                    ? `${Math.max(1, Math.round((accountCapital / 100000) * 5))} Large NK225`
                    : `${Math.max(5, Math.round((accountCapital / 500000) * 25))} Standard OSE`}
                </div>
                <div className="text-[10px] text-[#8292A6]">
                  {accountCapital < 50000 ? "Mini NK225 (¥100/pt)" : "Standard NK225 (¥1,000/pt)"}
                </div>
                <div className="text-[10px] text-emerald-400 pt-1 border-t border-[#1E2738]">
                  1.0R Risk: ~{curSym}{Math.round(accountCapital * 0.01).toLocaleString()}
                </div>
              </div>

              {/* Bitcoin Macro CME */}
              <div className="p-3 rounded-lg bg-black/60 border border-[#222C3D] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#EDE9DE]">SMC_CRYPTO (BTC)</span>
                  <span className="text-[9px] text-orange-400 bg-orange-500/10 px-1 rounded">CME</span>
                </div>
                <div className="text-[#8292A6] text-[10px]">Recommended Size:</div>
                <div className="font-bold text-[#E5C794]">
                  {accountCapital < 50000
                    ? `${Math.max(1, Math.round((accountCapital / 10000) * 2))} Micro BTC`
                    : accountCapital < 250000
                    ? `${(Math.max(0.5, (accountCapital / 100000) * 1.5)).toFixed(1)} Spot / Futures`
                    : `${Math.max(2, Math.round((accountCapital / 500000) * 6))} Standard CME`}
                </div>
                <div className="text-[10px] text-[#8292A6]">
                  {accountCapital < 50000 ? "Micro Bitcoin (0.1 BTC)" : "Standard CME (5 BTC/contract)"}
                </div>
                <div className="text-[10px] text-emerald-400 pt-1 border-t border-[#1E2738]">
                  1.0R Risk: ~{curSym}{Math.round(accountCapital * 0.012).toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Sliders Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono-data text-xs">
            {/* Limit 1: Max Session Drawdown */}
            <div className="p-4 rounded-xl bg-black/45 border border-[#1E2738] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[#EDE9DE] font-bold text-sm block">
                    Max Session Drawdown Limit
                  </span>
                  <span className="text-[10px] text-[#8292A6]">
                    Firm-wide hard stop tripping algorithmic liquidation
                  </span>
                </div>
                <span className="text-base font-bold text-rose-400 bg-rose-500/15 px-2.5 py-0.5 rounded border border-rose-500/30">
                  -{maxDrawdownPct.toFixed(1)}% (-{curSym}{Math.round(accountCapital * (maxDrawdownPct / 100)).toLocaleString()})
                </span>
              </div>
              <input
                type="range"
                min="0.5"
                max="5.0"
                step="0.1"
                value={maxDrawdownPct}
                onChange={(e) => setMaxDrawdownPct(parseFloat(e.target.value))}
                className="w-full accent-rose-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#8292A6]">
                <span>Conservative (-0.5%)</span>
                <span>Mandate Target (-2.0%)</span>
                <span>Aggressive (-5.0%)</span>
              </div>
            </div>

            {/* Limit 2: Max Gross Leverage */}
            <div className="p-4 rounded-xl bg-black/45 border border-[#1E2738] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[#EDE9DE] font-bold text-sm block">
                    Max Gross Portfolio Leverage
                  </span>
                  <span className="text-[10px] text-[#8292A6]">
                    Aggregate notional exposure across all active desks
                  </span>
                </div>
                <span className="text-base font-bold text-[#E5C794] bg-[#B08D57]/15 px-2.5 py-0.5 rounded border border-[#B08D57]/30">
                  {maxLeverage.toFixed(1)}x (Max {curSym}{Math.round(accountCapital * maxLeverage).toLocaleString()})
                </span>
              </div>
              <input
                type="range"
                min="1.0"
                max="5.0"
                step="0.1"
                value={maxLeverage}
                onChange={(e) => setMaxLeverage(parseFloat(e.target.value))}
                className="w-full accent-[#B08D57] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#8292A6]">
                <span>Unlevered (1.0x)</span>
                <span>Standard (2.5x)</span>
                <span>Ceiling (5.0x)</span>
              </div>
            </div>

            {/* Limit 3: Slippage Tolerance */}
            <div className="p-4 rounded-xl bg-black/45 border border-[#1E2738] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[#EDE9DE] font-bold text-sm block">
                    Execution Slippage Cap
                  </span>
                  <span className="text-[10px] text-[#8292A6]">
                    Rejects order if spread widening exceeds threshold
                  </span>
                </div>
                <span className="text-base font-bold text-sky-400 bg-sky-500/15 px-2.5 py-0.5 rounded border border-sky-500/30">
                  {slippageLimitPips.toFixed(1)} pips
                </span>
              </div>
              <input
                type="range"
                min="0.4"
                max="3.0"
                step="0.1"
                value={slippageLimitPips}
                onChange={(e) => setSlippageLimitPips(parseFloat(e.target.value))}
                className="w-full accent-sky-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#8292A6]">
                <span>Ultra-Tight (0.4 pips)</span>
                <span>Liquid Session (1.2 pips)</span>
                <span>Volatile (3.0 pips)</span>
              </div>
            </div>

            {/* Limit 4: Volatility Circuit Breaker */}
            <div className="p-4 rounded-xl bg-black/45 border border-[#1E2738] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[#EDE9DE] font-bold text-sm block">
                    Statistical Outlier Circuit Breaker
                  </span>
                  <span className="text-[10px] text-[#8292A6]">
                    Auto-pauses strategy on rapid multi-sigma jumps
                  </span>
                </div>
                <span className="text-base font-bold text-emerald-400 bg-emerald-500/15 px-2.5 py-0.5 rounded border border-emerald-500/30">
                  {volatilityHaltSigma.toFixed(1)} &sigma;
                </span>
              </div>
              <input
                type="range"
                min="1.5"
                max="5.0"
                step="0.1"
                value={volatilityHaltSigma}
                onChange={(e) => setVolatilityHaltSigma(parseFloat(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#8292A6]">
                <span>Sensitive (1.5 &sigma;)</span>
                <span>Standard (3.0 &sigma;)</span>
                <span>High Tolerance (5.0 &sigma;)</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[#222C3D] flex items-center justify-between text-[11px] font-mono-data text-[#8292A6]">
            <span>Quantitative risk rules scale continuously with Account Capital base.</span>
            <button
              onClick={() => triggerToast(`Risk parameters committed: Account Capital ${curSym}${accountCapital.toLocaleString()} ${currency} / Max Drawdown -${curSym}${Math.round(accountCapital * (maxDrawdownPct / 100)).toLocaleString()}`)}
              className="px-4 py-1.5 rounded bg-[#B08D57] text-[#0A111C] font-bold hover:bg-[#C9A46D] transition-colors"
            >
              Commit Risk Parameters ({curSym}{accountCapital.toLocaleString()} {currency})
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-VIEW 4: NLP WIRE & HEADLINE LAB (Why systems trigger on real events)   */}
      {/* ========================================================================= */}
      {activeTab === "NLP_LAB" && (
        <div className="bg-[#141923] border border-[#222C3D] rounded-xl p-5 shadow-xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#222C3D]">
            <div>
              <h3 className="font-editorial text-lg font-bold text-[#EDE9DE]">
                Central Bank &amp; Geopolitical Wire NLP Classifier
              </h3>
              <p className="text-xs font-mono-data text-[#8292A6]">
                DISSECT BREAKING HEADLINES &amp; VIEW HOW SYSTEMIC ALGORITHMS MAP WORDS INTO QUANTITATIVE EXECUTION
              </p>
            </div>
            <span className="text-[10px] font-mono-data px-2 py-0.5 rounded bg-[#B08D57]/20 text-[#B08D57] border border-[#B08D57]/40 uppercase">
              NLP Transformer Model v4.1
            </span>
          </div>

          {/* Preset Buttons */}
          <div className="space-y-2">
            <span className="text-xs font-mono-data text-[#8292A6]">
              Test With Institutional Wire Presets:
            </span>
            <div className="flex flex-wrap gap-2">
              {[
                {
                  label: "BoJ MoF Jawboning Level 4",
                  text: "BoJ Governor Ueda: Watching foreign exchange rate fluctuations with the highest sense of urgency; will not rule out any resolute steps to counter excessive speculation."
                },
                {
                  label: "Bab el-Mandeb Drone Strike",
                  text: "Breaking: Houthi kinetic anti-ship missile attack strikes commercial tanker corridor in southern Red Sea; dark fleet AIS reroutes accelerate."
                },
                {
                  label: "Treasury TGA Cash Refill",
                  text: "US Treasury Department announces $125B quarterly debt issuance refunding, accelerating cash absorption into Treasury General Account (TGA)."
                },
                {
                  label: "Madrid IBEX VWAP Deviation",
                  text: "Spanish banking sector faces margin compression as 10Y Bono spread widens; IBEX 35 sweeps Value Area Low at 19,920 pts."
                },
                {
                  label: "S&P 500 0DTE Gamma Flip",
                  text: "Wall Street dealer gamma flips negative below 5,850 strike as 0DTE put volume surges 1.4x following hot morning CPI prints; ES sweeps morning range floor."
                },
                {
                  label: "Frankfurt Bund Spread Shift",
                  text: "German 10Y Bund yields spike 4.8 bps on ECB inflation expectations; DAX 40 diverges from Eurozone peers as export manufacturing orders rebound."
                },
                {
                  label: "Tokyo Yen Carry Liquidity Cascade",
                  text: "Tokyo cash session open: USD/JPY falls 180 pips on suspected stealth BoJ rate check; Nikkei 225 drops 650 pts as foreign carry trade unwinds."
                },
                {
                  label: "Seoul AI HBM Semiconductor Demand",
                  text: "South Korea technology ministry reports record foreign institutional net buying in Samsung and SK Hynix; KOSPI 200 semiconductor momentum extends."
                },
                {
                  label: "HKEX PBOC Liquidity Impulse",
                  text: "PBOC executes massive 7-day reverse repo net cash injection into mainland banking system; Southbound Stock Connect flows into Hang Seng technology giants accelerate."
                },
                {
                  label: "Bitcoin CME Weekend Basis Carry",
                  text: "CME Bitcoin futures basis premium widens to +8.2% annualized over spot liquidity ahead of weekend trading; global M2 money supply aggregates accelerate."
                }
              ].map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => setNlpInputText(preset.text)}
                  className="px-2.5 py-1 rounded bg-black/50 hover:bg-[#1E2738] text-[#EDE9DE] border border-[#2B3545] text-[11px] font-mono-data transition-colors"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Text Input */}
          <div className="space-y-2">
            <label className="text-xs font-mono-data text-[#BAC7D5] block">
              Wire Headline / Official Statement Text:
            </label>
            <textarea
              rows={3}
              value={nlpInputText}
              onChange={(e) => setNlpInputText(e.target.value)}
              className="w-full bg-[#0A111C] border border-[#2B3545] rounded-lg p-3 text-xs font-mono-data text-[#EDE9DE] focus:border-[#B08D57] focus:outline-none transition-colors"
              placeholder="Paste any central bank speech, geopolitical wire, or Treasury refunding headline..."
            />
          </div>

          {/* NLP Output & Quantitative Mapping */}
          <div className="p-4 rounded-xl bg-black/50 border border-[#B08D57]/35 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1E2738]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#B08D57]" />
                <span className="text-xs font-mono-data font-bold text-[#EDE9DE] uppercase">
                  Quantitative Sentiment Decomposition
                </span>
              </div>
              <span className="text-[10px] font-mono-data px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                Confidence: {nlpAnalysis.probabilityPct}%
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono-data">
              <div className="p-2.5 rounded bg-[#141923] border border-[#1E2738]">
                <span className="text-[#8292A6] text-[10px] block">Target Domain</span>
                <span className="text-[#EDE9DE] font-bold">{nlpAnalysis.category}</span>
              </div>
              <div className="p-2.5 rounded bg-[#141923] border border-[#1E2738]">
                <span className="text-[#8292A6] text-[10px] block">Severity / Urgency</span>
                <span className="text-rose-400 font-bold">{nlpAnalysis.urgencyLabel}</span>
              </div>
              <div className="p-2.5 rounded bg-[#141923] border border-[#1E2738]">
                <span className="text-[#8292A6] text-[10px] block">Target Engine</span>
                <span className="text-[#E5C794] font-bold">{nlpAnalysis.targetEngine}</span>
              </div>
            </div>

            <div className="space-y-1.5 text-xs font-mono-data">
              <span className="text-[#8292A6] text-[10px] block uppercase">
                Algorithmic Action Vector:
              </span>
              <p className="text-[#EDE9DE] font-semibold bg-[#0A111C] p-2.5 rounded border border-[#1E2738]">
                {nlpAnalysis.actionRecommend}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#1E2738] text-[11px] font-mono-data text-[#8292A6]">
              <span>Risk Vector: {nlpAnalysis.riskVector}</span>
              <button
                onClick={() => {
                  handleSimulateTrigger(
                    nlpAnalysis.engineId,
                    nlpAnalysis.targetEngine,
                    nlpAnalysis.targetAsset,
                    "BUY_LIMIT"
                  );
                  setActiveTab("SIGNALS");
                }}
                className="px-3 py-1 rounded bg-[#B08D57] text-[#0A111C] font-bold hover:bg-[#C9A46D] transition-colors"
              >
                Execute NLP Action &amp; View in Signal Log
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-VIEW 5: ALPHA & SHARPE PERFORMANCE ATTRIBUTION                        */}
      {/* ========================================================================= */}
      {activeTab === "PERFORMANCE" && (
        <div className="bg-[#141923] border border-[#222C3D] rounded-xl p-5 shadow-xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#222C3D]">
            <div>
              <h3 className="font-editorial text-lg font-bold text-[#EDE9DE]">
                Quantitative Alpha &amp; Sharpe Ratio Attribution
              </h3>
              <p className="text-xs font-mono-data text-[#8292A6]">
                AUDITED INCEPTION METRICS, RISK-ADJUSTED EXCESS RETURNS &amp; DRAWDOWN DURABILITY
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono-data">
              <span className="text-[#8292A6]">Benchmark:</span>
              <span className="px-2 py-0.5 rounded bg-black/60 border border-[#2B3545] text-[#EDE9DE]">
                S&amp;P 500 / BCOM Index
              </span>
            </div>
          </div>

          {/* Top KPI Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono-data">
            <div className="p-3 bg-black/40 rounded-lg border border-[#1E2738]">
              <span className="text-[10px] text-[#8292A6] block uppercase">Aggregate Sharpe</span>
              <span className="text-xl font-bold text-emerald-400">2.64</span>
              <span className="text-[9px] text-[#8292A6] block mt-0.5">Risk-free anchor: SOFR</span>
            </div>
            <div className="p-3 bg-black/40 rounded-lg border border-[#1E2738]">
              <span className="text-[10px] text-[#8292A6] block uppercase">Sortino Ratio</span>
              <span className="text-xl font-bold text-[#E5C794]">3.28</span>
              <span className="text-[9px] text-[#8292A6] block mt-0.5">Downside deviation only</span>
            </div>
            <div className="p-3 bg-black/40 rounded-lg border border-[#1E2738]">
              <span className="text-[10px] text-[#8292A6] block uppercase">YTD Alpha</span>
              <span className="text-xl font-bold text-emerald-400">+22.7%</span>
              <span className="text-[9px] text-[#8292A6] block mt-0.5">Excess over SPX</span>
            </div>
            <div className="p-3 bg-black/40 rounded-lg border border-[#1E2738]">
              <span className="text-[10px] text-[#8292A6] block uppercase">Max Drawdown</span>
              <span className="text-xl font-bold text-rose-400">-4.1%</span>
              <span className="text-[9px] text-[#8292A6] block mt-0.5">Recovered in 14 days</span>
            </div>
          </div>

          {/* Recharts Bar Chart: Return YTD & Sharpe Ratio per Engine */}
          <div className="p-4 bg-black/50 border border-[#1E2738] rounded-xl space-y-3">
            <div className="flex items-center justify-between text-xs font-mono-data">
              <span className="text-[#EDE9DE] font-bold uppercase">
                Return YTD (%) &amp; Sharpe Ratio by System
              </span>
              <div className="flex items-center gap-3 text-[10px] text-[#8292A6]">
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#B08D57]" />
                  <span>Return YTD (%)</span>
                </div>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={performanceData}
                  margin={{ top: 15, right: 20, left: 10, bottom: 20 }}
                  barCategoryGap="25%"
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E2738" vertical={false} />
                  <XAxis
                    dataKey="name"
                    stroke="#8292A6"
                    tick={{ fill: "#BAC7D5", fontSize: 11, fontFamily: "monospace" }}
                    axisLine={{ stroke: "#2B3545" }}
                    tickLine={{ stroke: "#2B3545" }}
                  />
                  <YAxis
                    stroke="#8292A6"
                    tick={{ fill: "#8292A6", fontSize: 10, fontFamily: "monospace" }}
                    axisLine={{ stroke: "#2B3545" }}
                    tickLine={{ stroke: "#2B3545" }}
                    tickFormatter={(val) => `${val}%`}
                  />
                  <Tooltip
                    content={({ active, payload }: any) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="bg-[#0A111C] border border-[#B08D57]/50 rounded p-2.5 font-mono-data text-xs shadow-2xl">
                            <div className="font-bold text-[#EDE9DE] mb-1">{d.name}</div>
                            <div className="text-emerald-400">YTD Return: +{d.returnYTD}%</div>
                            <div className="text-[#E5C794]">Sharpe Ratio: {d.sharpe}</div>
                            <div className="text-sky-300">Win Rate: {d.winRate}%</div>
                            <div className="text-rose-400">Max DD: {d.maxDd}%</div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="returnYTD" radius={[4, 4, 0, 0]}>
                    {performanceData.map((entry, index) => (
                      <Cell key={`cell-perf-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemsView;
