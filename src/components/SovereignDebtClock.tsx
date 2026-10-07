import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Clock,
  Landmark,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  Globe,
  Maximize2,
  Minimize2,
  DollarSign,
  Activity,
  Info,
  ShieldAlert,
  Percent,
  Coins,
  Scale
} from "lucide-react";

interface SovereignDebtClockProps {
  isCalmMode?: boolean;
}

interface SovereignCountryData {
  id: "us" | "jp" | "es" | "ir";
  name: string;
  code: string;
  currencySymbol: string;
  currencyCode: string;
  flag: string;
  baseDebtNative: number; // Base as of reference epoch
  growthPerSecondNative: number; // Native currency increase per second
  usdExchangeRate: number; // Native to USD (1 unit of native = X USD)
  debtToGdp: number; // %
  debtToGdpTrend: "+0.8%" | "+1.2%" | "-0.4%" | "+3.5%";
  population: number;
  interestCostPerDayUsd: number;
  sovereignRating: string;
  centralBank: string;
  keyDeskRisk: string;
  transmissionToSmc: string;
  colorAccent: string;
  badgeTone: string;
}

// Reference anchor point: beginning of current calendar quarter (approx. Q3 2026 anchor)
const REFERENCE_EPOCH = 1788500000000; // Reference timestamp

const SOVEREIGN_PROFILES: Record<"us" | "jp" | "es" | "ir", SovereignCountryData> = {
  us: {
    id: "us",
    name: "United States",
    code: "USA",
    currencySymbol: "$",
    currencyCode: "USD",
    flag: "🇺🇸",
    baseDebtNative: 36842500000000, // $36.84T
    growthPerSecondNative: 86450, // ~$86,450 per second (~$2.72T annualized deficit + interest)
    usdExchangeRate: 1.0,
    debtToGdp: 124.8,
    debtToGdpTrend: "+1.2%",
    population: 341000000,
    interestCostPerDayUsd: 3150000000, // ~$3.15B per day in net interest
    sovereignRating: "AA+ (S&P / Fitch)",
    centralBank: "Federal Reserve",
    keyDeskRisk: "Treasury auction tail risk, 10Y UST supply saturation & net interest exceeding defense budget",
    transmissionToSmc: "Pressures global risk-free discount rate, fuels Gold XAU/USD supercycle debasement hedge",
    colorAccent: "#3B82F6",
    badgeTone: "border-blue-500/30 text-blue-300 bg-blue-500/10"
  },
  jp: {
    id: "jp",
    name: "Japan",
    code: "JPN",
    currencySymbol: "¥",
    currencyCode: "JPY",
    flag: "🇯🇵",
    baseDebtNative: 1316500000000000, // ¥1,316.5 Trillion
    growthPerSecondNative: 1485000, // ~¥1.485M per second (~$9,900 USD/sec)
    usdExchangeRate: 1 / 150.0, // ~150 JPY per USD
    debtToGdp: 261.4,
    debtToGdpTrend: "+0.8%",
    population: 124000000,
    interestCostPerDayUsd: 188000000, // ~$188M per day, surging with JGB yield curve unpegging
    sovereignRating: "A+ (S&P) / A1 (Moody's)",
    centralBank: "Bank of Japan (BoJ)",
    keyDeskRisk: "BoJ policy trap: Each 100 bps rate hike adds ¥3.6T in annual debt servicing, compounding Yen carry unwinds",
    transmissionToSmc: "Direct feed to BoJ Yen Intervention Engine; triggers 160.00 MoF currency defense threshold",
    colorAccent: "#E11D48",
    badgeTone: "border-red-500/30 text-red-300 bg-red-500/10"
  },
  es: {
    id: "es",
    name: "Spain (Reino de España)",
    code: "ESP",
    currencySymbol: "€",
    currencyCode: "EUR",
    flag: "🇪🇸",
    baseDebtNative: 1642800000000, // €1.642 Trillion
    growthPerSecondNative: 2180, // ~€2,180 per second (~$2,350 USD/sec)
    usdExchangeRate: 1.08, // ~1.08 USD per EUR
    debtToGdp: 105.2,
    debtToGdpTrend: "-0.4%",
    population: 48600000,
    interestCostPerDayUsd: 128000000, // ~$128M per day in Bonos coupon payments
    sovereignRating: "A (S&P) / A- (Fitch)",
    centralBank: "Banco de España / ECB",
    keyDeskRisk: "Spanish 10Y Bono spread sensitivity vs German Bunds; sovereign debt holdings on Spanish bank balance sheets",
    transmissionToSmc: "Feeds directly to IBEX 35 Intraday Prop Engine; banks (Santander, BBVA, Caixa) carry 28% sovereign exposure",
    colorAccent: "#F59E0B",
    badgeTone: "border-amber-500/30 text-amber-300 bg-amber-500/10"
  },
  ir: {
    id: "ir",
    name: "Islamic Republic of Iran",
    code: "IRN",
    currencySymbol: "IRR",
    currencyCode: "IRR",
    flag: "🇮🇷",
    baseDebtNative: 65420000000000000, // ~65,420 Trillion Rials (Domestic + Central Bank overdrafts)
    growthPerSecondNative: 84500000, // ~84.5 Million IRR per second (hyperinflationary money supply M2 +41.5% YoY)
    usdExchangeRate: 1 / 905000, // Open market Bonbast street rate ~905,000 IRR/USD
    debtToGdp: 34.2, // Official public external debt low due to sanctions, but domestic banking quasi-debt is catastrophic
    debtToGdpTrend: "+3.5%",
    population: 89200000,
    interestCostPerDayUsd: 80500000, // Domestic energy subsidies bleed & Central Bank debt monetization
    sovereignRating: "Unrated / SDN / FATF Blacklist",
    centralBank: "Central Bank of Iran (CBI)",
    keyDeskRisk: "Accelerating fiscal deficit monetization; Rial freefall necessitating shadow fleet oil exports through Hormuz",
    transmissionToSmc: "Directly drives Iran Shadow Fleet Engine and Strait of Hormuz chokepoint war-risk escalation",
    colorAccent: "#10B981",
    badgeTone: "border-emerald-500/30 text-emerald-300 bg-emerald-500/10"
  }
};

export const SovereignDebtClock: React.FC<SovereignDebtClockProps> = ({ isCalmMode = false }) => {
  const [selectedCountry, setSelectedCountry] = useState<"ALL" | "us" | "jp" | "es" | "ir">("ALL");
  const [currencyMode, setCurrencyMode] = useState<"USD" | "NATIVE">("USD");
  const [currentTimeMs, setCurrentTimeMs] = useState<number>(() => Date.now());
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [timeHorizon, setTimeHorizon] = useState<"LIVE" | "1HOUR" | "24HOURS" | "1YEAR">("LIVE");

  // Dynamic ticking counter: 60ms in normal mode, 1500ms in Calm Mode
  useEffect(() => {
    const updateInterval = isCalmMode ? 1500 : 60;
    const interval = setInterval(() => {
      setCurrentTimeMs(Date.now());
    }, updateInterval);

    return () => clearInterval(interval);
  }, [isCalmMode]);

  // Compute live amounts for each nation
  const debtCalculations = useMemo(() => {
    const elapsedSeconds = Math.max(0, (currentTimeMs - REFERENCE_EPOCH) / 1000);

    const horizonMultiplier = {
      LIVE: 0,
      "1HOUR": 3600,
      "24HOURS": 86400,
      "1YEAR": 31536000
    }[timeHorizon];

    const results: Record<string, {
      nativeAmount: number;
      usdAmount: number;
      ratePerSecondNative: number;
      ratePerSecondUsd: number;
      perCapitaUsd: number;
      perCapitaNative: number;
      interestCostTodayUsd: number;
    }> = {};

    (Object.keys(SOVEREIGN_PROFILES) as Array<"us" | "jp" | "es" | "ir">).forEach((key) => {
      const profile = SOVEREIGN_PROFILES[key];
      const additionalTime = elapsedSeconds + horizonMultiplier;
      const nativeAmount = profile.baseDebtNative + (additionalTime * profile.growthPerSecondNative);
      const usdAmount = nativeAmount * profile.usdExchangeRate;
      const ratePerSecondUsd = profile.growthPerSecondNative * profile.usdExchangeRate;
      const perCapitaUsd = usdAmount / profile.population;
      const perCapitaNative = nativeAmount / profile.population;

      results[key] = {
        nativeAmount,
        usdAmount,
        ratePerSecondNative: profile.growthPerSecondNative,
        ratePerSecondUsd,
        perCapitaUsd,
        perCapitaNative,
        interestCostTodayUsd: profile.interestCostPerDayUsd
      };
    });

    return results;
  }, [currentTimeMs, timeHorizon]);

  // Total Combined Sovereign Debt in USD
  const totalCombinedUsd = useMemo(() => {
    return Object.values(debtCalculations).reduce((acc, curr) => acc + curr.usdAmount, 0);
  }, [debtCalculations]);

  const totalCombinedPerSecondUsd = useMemo(() => {
    return Object.values(debtCalculations).reduce((acc, curr) => acc + curr.ratePerSecondUsd, 0);
  }, [debtCalculations]);

  // Formatters
  const formatWholeCurrency = (amount: number, symbol: string, digits: number = 0) => {
    return `${symbol}${amount.toLocaleString("en-US", {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits
    })}`;
  };

  const formatCompact = (amount: number, symbol: string) => {
    if (amount >= 1e15) return `${symbol}${(amount / 1e15).toFixed(2)}Q`;
    if (amount >= 1e12) return `${symbol}${(amount / 1e12).toFixed(2)}T`;
    if (amount >= 1e9) return `${symbol}${(amount / 1e9).toFixed(2)}B`;
    if (amount >= 1e6) return `${symbol}${(amount / 1e6).toFixed(2)}M`;
    return `${symbol}${amount.toLocaleString()}`;
  };

  return (
    <div
      id="sovereign-debt-realtime-clock"
      className={`bg-[#0F1622] border border-[#B08D57]/35 rounded-xl shadow-xl overflow-hidden transition-all relative ${
        isFullScreen ? "fixed inset-3 sm:inset-6 z-50 overflow-y-auto max-h-[96vh] bg-[#0A111C]/98 p-4 sm:p-6" : "p-4 sm:p-5"
      }`}
    >
      {/* Background Subtle Gradient Grid */}
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

      {/* Header Bar */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pb-3 mb-4 border-b border-[#B08D57]/20">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-black/60 border border-[#B08D57]/40 flex items-center justify-center shadow-inner">
            <Landmark className="w-4 h-4 text-[#B08D57]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-bold tracking-tight text-[#EDE9DE] uppercase font-sans">
                Sovereign Debt Real-Time Clock
              </span>
              <span className="inline-flex items-center gap-1 text-[9px] font-mono-data px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                <Clock className="w-2.5 h-2.5 animate-pulse" />
                <span>DYNAMIC ACCUMULATOR</span>
              </span>
            </div>
            <p className="text-[10px] font-mono-data text-[#8292A6]">
              US // JAPAN // SPAIN // IRAN FISCAL LIABILITIES & CENTRAL BANK DEBASEMENT
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono-data">
          {/* Time Horizon Selector */}
          <div className="flex items-center bg-black/60 p-0.5 rounded border border-[#2B3545]">
            {(["LIVE", "1HOUR", "24HOURS", "1YEAR"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setTimeHorizon(mode)}
                className={`px-2 py-1 rounded text-[10px] uppercase font-mono-data transition-all ${
                  timeHorizon === mode
                    ? "bg-[#B08D57] text-[#0A111C] font-bold shadow-sm"
                    : "text-[#8292A6] hover:text-[#EDE9DE]"
                }`}
              >
                {mode === "LIVE" ? "Live Clock" : mode === "1HOUR" ? "+1h" : mode === "24HOURS" ? "+24h" : "+1y"}
              </button>
            ))}
          </div>

          {/* Currency Normalization Switch */}
          <div className="flex items-center bg-black/60 p-0.5 rounded border border-[#2B3545]">
            <button
              onClick={() => setCurrencyMode("USD")}
              className={`px-2 py-1 rounded text-[10px] font-mono-data transition-all flex items-center gap-1 ${
                currencyMode === "USD"
                  ? "bg-[#B08D57] text-[#0A111C] font-bold"
                  : "text-[#8292A6] hover:text-[#EDE9DE]"
              }`}
              title="Normalize all sovereign debt figures in USD for cross-border comparison"
            >
              <DollarSign className="w-3 h-3" />
              <span>USD ($)</span>
            </button>
            <button
              onClick={() => setCurrencyMode("NATIVE")}
              className={`px-2 py-1 rounded text-[10px] font-mono-data transition-all flex items-center gap-1 ${
                currencyMode === "NATIVE"
                  ? "bg-[#B08D57] text-[#0A111C] font-bold"
                  : "text-[#8292A6] hover:text-[#EDE9DE]"
              }`}
              title="Show in native national currencies ($, ¥, €, IRR)"
            >
              <Coins className="w-3 h-3" />
              <span>Native</span>
            </button>
          </div>

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullScreen(!isFullScreen)}
            className="p-1.5 rounded bg-black/60 border border-[#2B3545] text-[#8292A6] hover:text-[#EDE9DE] hover:border-[#B08D57]/40 transition-colors"
            title={isFullScreen ? "Exit Fullscreen" : "Expand Sovereign Debt Clock"}
          >
            {isFullScreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Aggregate Global Summary Banner */}
      <div className="relative z-10 bg-black/40 border border-[#222C3D] rounded-lg p-3 sm:p-4 mb-4 flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono-data uppercase tracking-wider text-[#8292A6]">
              Combined 4-Sovereign Debt Load (USD Normalized)
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-ping" />
          </div>
          <div className="text-xl sm:text-2xl lg:text-3xl font-bold font-mono-data text-[#EDE9DE] tracking-tight flex items-baseline gap-2">
            <span className="text-[#B08D57]">$</span>
            <span>{totalCombinedUsd.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-xs font-mono-data">
          <div className="border-l border-[#2B3545] pl-3">
            <span className="text-[10px] text-[#8292A6] uppercase block">Aggregate Tick Speed</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1 text-sm">
              <TrendingUp className="w-3.5 h-3.5" />
              +${Math.round(totalCombinedPerSecondUsd).toLocaleString()}/sec
            </span>
          </div>

          <div className="border-l border-[#2B3545] pl-3">
            <span className="text-[10px] text-[#8292A6] uppercase block">Annual Acceleration Pace</span>
            <span className="text-[#E5C794] font-bold text-sm">
              +${(totalCombinedPerSecondUsd * 31536000 / 1e12).toFixed(2)} Trillion/yr
            </span>
          </div>

          <div className="border-l border-[#2B3545] pl-3 hidden md:block">
            <span className="text-[10px] text-[#8292A6] uppercase block">Global Sovereign Pressure</span>
            <span className="text-rose-400 font-bold text-sm">CRITICAL TIGHTENING</span>
          </div>
        </div>
      </div>

      {/* Country Filter Navigation Tabs */}
      <div className="relative z-10 flex items-center gap-1.5 overflow-x-auto pb-2 mb-4 scrollbar-thin text-xs font-mono-data">
        <button
          onClick={() => setSelectedCountry("ALL")}
          className={`px-3 py-1.5 rounded-lg border transition-all whitespace-nowrap flex items-center gap-1.5 ${
            selectedCountry === "ALL"
              ? "bg-[#B08D57] text-[#0A111C] border-[#B08D57] font-bold shadow-md"
              : "bg-black/40 border-[#2B3545] text-[#8292A6] hover:text-[#EDE9DE]"
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>All 4 Sovereigns</span>
        </button>

        {(Object.keys(SOVEREIGN_PROFILES) as Array<"us" | "jp" | "es" | "ir">).map((key) => {
          const profile = SOVEREIGN_PROFILES[key];
          const isSelected = selectedCountry === key;
          return (
            <button
              key={key}
              onClick={() => setSelectedCountry(key)}
              className={`px-3 py-1.5 rounded-lg border transition-all whitespace-nowrap flex items-center gap-2 ${
                isSelected
                  ? "bg-[#B08D57] text-[#0A111C] border-[#B08D57] font-bold shadow-md"
                  : "bg-black/40 border-[#2B3545] text-[#8292A6] hover:text-[#EDE9DE]"
              }`}
            >
              <span>{profile.flag}</span>
              <span>{profile.code}</span>
              <span className={`text-[9px] px-1 rounded ${isSelected ? "bg-black/20 text-[#0A111C]" : "bg-black/50 text-[#BAC7D5]"}`}>
                {profile.debtToGdp}% GDP
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Grid: Cards for each country */}
      <div className={`relative z-10 grid gap-4 ${
        selectedCountry === "ALL"
          ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-4"
          : "grid-cols-1"
      }`}>
        {(Object.keys(SOVEREIGN_PROFILES) as Array<"us" | "jp" | "es" | "ir">)
          .filter((key) => selectedCountry === "ALL" || selectedCountry === key)
          .map((key) => {
            const profile = SOVEREIGN_PROFILES[key];
            const data = debtCalculations[key];
            const isSingleFocus = selectedCountry !== "ALL";

            const displayAmount = currencyMode === "USD" ? data.usdAmount : data.nativeAmount;
            const displaySymbol = currencyMode === "USD" ? "$" : profile.currencySymbol;
            const displayPerSec = currencyMode === "USD" ? data.ratePerSecondUsd : data.ratePerSecondNative;
            const displayPerCapita = currencyMode === "USD" ? data.perCapitaUsd : data.perCapitaNative;

            return (
              <div
                key={key}
                className="bg-[#0B1019] border border-[#222C3D] hover:border-[#B08D57]/40 rounded-xl p-4 transition-all relative flex flex-col justify-between group shadow-md"
              >
                {/* Top Country Identity */}
                <div>
                  <div className="flex items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-[#1E2738]">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{profile.flag}</span>
                      <div>
                        <h4 className="text-xs font-bold text-[#EDE9DE] uppercase tracking-wider flex items-center gap-1.5 font-sans">
                          <span>{profile.name}</span>
                          <span className="text-[10px] text-[#8292A6] font-mono-data">({profile.code})</span>
                        </h4>
                        <span className="text-[9px] font-mono-data text-[#8292A6]">
                          {profile.centralBank}
                        </span>
                      </div>
                    </div>

                    <span className={`text-[10px] font-mono-data px-1.5 py-0.5 rounded border ${profile.badgeTone}`}>
                      {profile.debtToGdp}% GDP
                    </span>
                  </div>

                  {/* Primary Dynamic Real-Time Ticking Counter */}
                  <div className="my-2 p-3 bg-black/60 rounded-lg border border-[#1E2738]">
                    <span className="text-[9px] font-mono-data uppercase tracking-wider text-[#8292A6] block mb-0.5">
                      {currencyMode === "USD" ? "Current National Debt (USD Equivalent)" : `National Debt (${profile.currencyCode})`}
                    </span>
                    <div className="font-mono-data font-bold text-[#EDE9DE] tracking-tight text-lg sm:text-xl xl:text-lg 2xl:text-xl truncate text-amber-200/90">
                      <span>{displaySymbol}</span>
                      <span>
                        {Math.floor(displayAmount).toLocaleString("en-US")}
                      </span>
                    </div>

                    {/* Live Accumulation Velocity Strip */}
                    <div className="flex items-center justify-between text-[10px] font-mono-data mt-2 pt-2 border-t border-[#1E2738]/80 text-[#8292A6]">
                      <span>Tick Speed:</span>
                      <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                        <TrendingUp className="w-2.5 h-2.5" />
                        +{displaySymbol}{Math.round(displayPerSec).toLocaleString()}/sec
                      </span>
                    </div>
                  </div>

                  {/* Key Sovereign Ratios & Pressure Indicators */}
                  <div className="space-y-2 text-xs font-mono-data my-3">
                    {/* Debt to GDP Bar */}
                    <div>
                      <div className="flex justify-between text-[10px] text-[#8292A6] mb-1">
                        <span>Debt-to-GDP Ratio</span>
                        <span className="text-[#EDE9DE] font-semibold">{profile.debtToGdp}% ({profile.debtToGdpTrend})</span>
                      </div>
                      <div className="w-full h-1.5 bg-[#1A2230] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${Math.min(100, (profile.debtToGdp / 260) * 100)}%`,
                            backgroundColor: profile.debtToGdp > 120 ? "#EF4444" : profile.debtToGdp > 80 ? "#F59E0B" : "#10B981"
                          }}
                        />
                      </div>
                    </div>

                    {/* Per Capita & Daily Interest */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div className="p-2 bg-black/40 rounded border border-[#1E2738]">
                        <span className="text-[9px] text-[#8292A6] uppercase block">Per Citizen</span>
                        <span className="text-xs font-bold text-[#EDE9DE]">
                          {displaySymbol}{Math.round(displayPerCapita).toLocaleString()}
                        </span>
                      </div>

                      <div className="p-2 bg-black/40 rounded border border-[#1E2738]">
                        <span className="text-[9px] text-[#8292A6] uppercase block">Interest Cost/Day</span>
                        <span className="text-xs font-bold text-rose-300">
                          ${(profile.interestCostPerDayUsd / 1e6).toFixed(0)}M/day
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] py-1 px-2 bg-black/30 rounded border border-[#1E2738]">
                      <span className="text-[#8292A6]">Sovereign Credit Rating:</span>
                      <span className="font-bold text-[#EDE9DE]">{profile.sovereignRating}</span>
                    </div>
                  </div>
                </div>

                {/* Desk Transmission / Takeaway Footnote */}
                <div className="pt-2 border-t border-[#1E2738] mt-2">
                  <div className="text-[10px] font-mono-data text-[#8292A6] space-y-1">
                    <div>
                      <span className="text-[#B08D57] font-semibold uppercase">Desk Risk: </span>
                      <span className="text-[#BAC7D5]">{profile.keyDeskRisk}</span>
                    </div>
                    {isSingleFocus && (
                      <div className="mt-2 p-2 bg-[#B08D57]/5 border border-[#B08D57]/20 rounded text-[10px]">
                        <span className="text-[#E5C794] font-semibold uppercase">SMC Transmission Vector: </span>
                        <span className="text-[#EDE9DE]">{profile.transmissionToSmc}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
      </div>

      {/* Expanded Drilldown Context Panel when a specific nation is selected */}
      {selectedCountry !== "ALL" && (
        <div className="relative z-10 mt-4 p-4 bg-[#0B1019] border border-[#B08D57]/30 rounded-xl space-y-3">
          <div className="flex items-center justify-between border-b border-[#222C3D] pb-2">
            <span className="text-xs font-mono-data font-bold uppercase text-[#E5C794] flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-[#B08D57]" />
              Deep-Dive Fiscal Mechanics: {SOVEREIGN_PROFILES[selectedCountry].name}
            </span>
            <button
              onClick={() => setSelectedCountry("ALL")}
              className="text-[10px] font-mono-data text-[#8292A6] hover:text-[#EDE9DE] underline"
            >
              Return to All 4 Sovereigns
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono-data">
            <div className="p-3 bg-black/50 rounded-lg border border-[#1E2738]">
              <span className="text-[10px] text-[#8292A6] uppercase block mb-1">Fiscal Transmission to Sin Miedo Portfolios</span>
              <p className="text-[#BAC7D5] text-[11px] leading-relaxed">
                {SOVEREIGN_PROFILES[selectedCountry].transmissionToSmc}
              </p>
            </div>

            <div className="p-3 bg-black/50 rounded-lg border border-[#1E2738]">
              <span className="text-[10px] text-[#8292A6] uppercase block mb-1">Monetary Policy Solvency Barrier</span>
              <p className="text-[#BAC7D5] text-[11px] leading-relaxed">
                {SOVEREIGN_PROFILES[selectedCountry].keyDeskRisk}
              </p>
            </div>

            <div className="p-3 bg-black/50 rounded-lg border border-[#1E2738]">
              <span className="text-[10px] text-[#8292A6] uppercase block mb-1">Debt Growth Sensitivity Simulator</span>
              <div className="space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-[#8292A6]">+1 Hour:</span>
                  <span className="text-emerald-400 font-bold">+${(debtCalculations[selectedCountry].ratePerSecondUsd * 3600).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8292A6]">+24 Hours:</span>
                  <span className="text-emerald-400 font-bold">+${(debtCalculations[selectedCountry].ratePerSecondUsd * 86400 / 1e6).toFixed(1)} Million</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8292A6]">+1 Year:</span>
                  <span className="text-[#E5C794] font-bold">+${(debtCalculations[selectedCountry].ratePerSecondUsd * 31536000 / 1e9).toFixed(1)} Billion</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer Status Bar */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 pt-3 mt-4 border-t border-[#1E2738] text-[10px] font-mono-data text-[#8292A6]">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>CALCULATION ENGINE: ACTIVE</span>
          </span>
          <span>•</span>
          <span>REF EPOCH: Q3 2026 BENCHMARK</span>
          <span>•</span>
          <span>IMF / MOF / US TREASURY / CBI REPORTED BASIS</span>
        </div>

        <div className="flex items-center gap-2 text-[#BAC7D5]">
          <span>Calm Mode: <strong className="text-[#EDE9DE]">{isCalmMode ? "Low-Sensory (1.5s)" : "High-Precision (60ms)"}</strong></span>
        </div>
      </div>
    </div>
  );
};
