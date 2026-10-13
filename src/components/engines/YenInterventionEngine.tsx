import React, { useState } from "react";
import { MacroDataState } from "../../types";
import { Maximize2, Minimize2, AlertTriangle, TrendingUp, Zap, Sliders, BarChart3, Clock, HelpCircle } from "lucide-react";

interface YenInterventionEngineProps {
  data: MacroDataState["engines"]["yenIntervention"];
  onExpandToggle?: () => void;
  isExpanded?: boolean;
}

export const YenInterventionEngine: React.FC<YenInterventionEngineProps> = ({
  data,
  onExpandToggle,
  isExpanded = false,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<"Trigger Zones" | "Order Book Depth" | "Probability" | "Yield Spread" | "Past Logs">("Trigger Zones");
  const [simSpot, setSimSpot] = useState(data.spot);

  // Dynamic calculation based on simulated spot
  const calcOdds = (spot: number) => {
    if (spot >= 161.0) return 96;
    if (spot >= 160.5) return 88;
    if (spot >= 159.5) return 78;
    if (spot >= 157.5) return 45;
    return 15;
  };

  const currentOdds = calcOdds(simSpot);

  const fxOrderBook = [
    { price: "160.50", ask: "$1.85B", bid: "-", tag: "BoJ Barrier Defense", type: "ask" },
    { price: "160.20", ask: "$940M", bid: "-", tag: "Exporter Offers", type: "ask" },
    { price: "160.00", ask: "$1.42B", bid: "-", tag: "Psychological Barrier", type: "ask" },
    { price: "159.85", ask: "$220M", bid: "-", tag: "Best Ask", type: "bbo" },
    { price: "159.84", ask: "-", bid: "$310M", tag: "Best Bid", type: "bbo" },
    { price: "159.50", ask: "-", bid: "$820M", tag: "Leveraged Bids", type: "bid" },
    { price: "159.20", ask: "-", bid: "$1.15B", tag: "CTA Stop Cluster", type: "bid" },
    { price: "158.80", ask: "-", bid: "$680M", tag: "Life Insurer Demand", type: "bid" }
  ];

  return (
    <div
      id="yen-intervention-engine-card"
      className={
        isExpanded
          ? "space-y-6 text-[#EDE9DE]"
          : "bg-[#0E1624] border border-[#1E293B] hover:border-[#B08D57]/40 rounded-sm p-3.5 sm:p-5 transition-all shadow-none flex flex-col justify-between relative group"
      }
    >
      {/* Subtle top brass highlight */}
      {!isExpanded && (
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#B08D57]/40 to-transparent pointer-events-none" />
      )}

      {/* Top Header & Sub-Tabs */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#1E293B]">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <h3 className="font-serif italic text-xl sm:text-2xl font-bold tracking-tight text-[#FBF8F1]" style={{ fontFamily: "Georgia, 'Newsreader', serif" }}>
              US-Yen Intervention Dynamics
            </h3>
            <span className={`text-[9px] font-mono-data font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm border shrink-0 whitespace-nowrap ${
              currentOdds >= 70
                ? "bg-[#A6291C]/20 text-[#FFA4A4] border-[#A6291C]/50"
                : currentOdds >= 40
                ? "bg-[#B08D57]/20 text-[#E5C794] border-[#B08D57]/40"
                : "bg-[#10B981]/20 text-[#34D399] border-[#10B981]/40"
            }`}>
              {data.defcon}
            </span>
          </div>

          {/* Sub Tab Switcher & Fullscreen Button */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-[#080E18] p-0.5 rounded-sm border border-[#1E293B] text-[10px] font-mono-data overflow-x-auto no-scrollbar max-w-full">
              {(["Trigger Zones", "Order Book Depth", "Probability", "Yield Spread", "Past Logs"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveSubTab(tab)}
                  className={`px-2.5 py-1 rounded-sm transition-all uppercase font-medium shrink-0 whitespace-nowrap ${
                    activeSubTab === tab
                      ? "bg-[#B08D57] text-[#0A111C] font-bold"
                      : "text-[#BAC7D5] hover:text-[#FBF8F1] hover:bg-white/5"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {onExpandToggle && (
              <button
                onClick={onExpandToggle}
                title={isExpanded ? "Collapse View" : "Expand Fullscreen"}
                aria-label={isExpanded ? "Collapse View" : "Expand Fullscreen"}
                className="p-1.5 rounded-lg bg-black/70 border border-[#B08D57]/30 text-[#BAC7D5] hover:text-[#E5C794] transition-colors shrink-0"
              >
                {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>
        </div>

        {/* Subtitle */}
        <p className="text-[10px] font-mono-data tracking-widest text-[#BAC7D5] mt-2 mb-4 uppercase font-semibold">
          USD/JPY SPOT & BOJ ESCALATION MATRIX
        </p>

        {/* 4 Stat Cards Row */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-2.5 sm:gap-3 mb-5">
          {/* 1. USD/JPY Spot */}
          <div className="bg-black/40 border border-[#B08D57]/15 rounded-lg p-2.5 sm:p-3 relative flex flex-col justify-between min-w-0 overflow-hidden">
            <div className="flex items-center justify-between text-[10px] font-mono-data text-[#8292A6] gap-1">
              <span className="uppercase tracking-wider font-medium truncate">USD/JPY Spot</span>
              {/* Mini Sparkline SVG */}
              <svg className="w-7 h-3 text-[#B08D57] shrink-0" viewBox="0 0 50 20" fill="none">
                <path d="M2 14 Q 15 2, 28 12 T 48 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <div className="mt-1.5">
              <div className="text-lg sm:text-xl font-bold font-mono-data text-[#EDE9DE] leading-tight truncate">
                {simSpot.toFixed(2)}
              </div>
              <div className="flex items-center justify-between text-[10px] font-mono-data mt-1 gap-1">
                <span className="text-[#B08D57] font-semibold truncate">{data.change}</span>
                <span className="text-[#8292A6] truncate">Spot Feed</span>
              </div>
            </div>
            <div className="text-[9px] font-mono-data text-[#8292A6] mt-1.5 border-t border-[#B08D57]/10 pt-1 truncate">
              Threshold: <span className="text-[#EDE9DE] font-semibold">{data.threshold.toFixed(2)}</span>
            </div>
          </div>

          {/* 2. Intervention Odds */}
          <div className={`bg-black/50 border rounded-lg p-2.5 sm:p-3 relative flex flex-col justify-between min-w-0 overflow-hidden ${
            currentOdds >= 70
              ? "border-[#A6291C]/60 shadow-[0_0_15px_rgba(166,41,28,0.15)]"
              : currentOdds >= 40
              ? "border-[#B08D57]/50 shadow-[0_0_15px_rgba(176,141,87,0.12)]"
              : "border-[#10B981]/40 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
          }`}>
            <div className={`text-[10px] font-mono-data flex items-center justify-between uppercase tracking-wider gap-1 ${
              currentOdds >= 70 ? "text-[#FF8585]" : currentOdds >= 40 ? "text-[#E5C794]" : "text-[#34D399]"
            }`}>
              <span className="font-medium truncate">Intervention Odds</span>
              <span className={`h-2 w-2 rounded-full shrink-0 ${
                currentOdds >= 70 ? "bg-[#A6291C]" : currentOdds >= 40 ? "bg-[#B08D57]" : "bg-[#10B981]"
              }`} />
            </div>
            <div className="mt-1.5">
              <div className={`text-lg sm:text-xl font-bold font-mono-data leading-tight truncate ${
                currentOdds >= 70 ? "text-[#A6291C]" : currentOdds >= 40 ? "text-[#E5C794]" : "text-[#34D399]"
              }`}>
                {currentOdds}%
              </div>
              <div className="flex items-center justify-between text-[10px] font-mono-data mt-1 gap-1">
                <span className={`font-semibold uppercase truncate ${
                  currentOdds >= 70 ? "text-[#FFA4A4]" : currentOdds >= 40 ? "text-[#B08D57]" : "text-[#10B981]"
                }`}>{data.defcon}</span>
                <span className="text-[#8292A6] truncate">Probability</span>
              </div>
            </div>
            <div className="text-[9px] font-mono-data text-[#8292A6] mt-1.5 border-t border-[#B08D57]/15 pt-1 truncate">
              Status: <span className={`font-semibold ${
                currentOdds >= 70 ? "text-[#FFA4A4]" : currentOdds >= 40 ? "text-[#E5C794]" : "text-[#10B981]"
              }`}>
                {currentOdds <= 25 ? "Stealth Absorbed" : data.defconStatus}
              </span>
            </div>
          </div>

          {/* 3. Jawboning Level */}
          <div className="bg-black/40 border border-[#B08D57]/15 rounded-lg p-2.5 sm:p-3 flex flex-col justify-between min-w-0 overflow-hidden">
            <div className="text-[10px] font-mono-data text-[#8292A6] uppercase tracking-wider font-medium truncate">
              Jawboning Level
            </div>
            <div className="mt-1.5">
              {/* 5-segment bar */}
              <div className="flex items-center gap-1 my-1.5">
                {[1, 2, 3, 4, 5].map((lvl) => (
                  <div
                    key={lvl}
                    className={`h-2 flex-1 rounded-xs transition-all ${
                      lvl <= data.jawboningLevel
                        ? "bg-[#A6291C]"
                        : "bg-[#253347]"
                    }`}
                  />
                ))}
              </div>
              <div className="flex items-center justify-between text-[10px] font-mono-data mt-0.5 gap-1">
                <span className="text-[#B08D57] font-semibold truncate">Stage {data.jawboningLevel}/5</span>
                <span className="text-[#8292A6] truncate">MoF Rating</span>
              </div>
            </div>
            <div className="text-[9px] font-mono-data text-[#8292A6] mt-1.5 border-t border-[#B08D57]/10 pt-1 truncate">
              MoF Stance: <span className="text-[#EDE9DE] font-semibold">
                {data.jawboningLevel <= 2 ? "L2: Orderly" : data.jawboningLevel === 3 ? "L3: Disorderly" : data.jawboningLevel === 4 ? "L4: Urgent" : "L5: Action"}
              </span>
            </div>
          </div>

          {/* 4. 10Y UST-JGB */}
          <div className="bg-black/40 border border-[#B08D57]/15 rounded-lg p-2.5 sm:p-3 flex flex-col justify-between min-w-0 overflow-hidden">
            <div className="flex items-center justify-between text-[10px] font-mono-data text-[#8292A6] gap-1">
              <span className="uppercase tracking-wider font-medium truncate">10Y UST-JGB</span>
              {/* Mini Sparkline SVG upward */}
              <svg className="w-7 h-3 text-[#B08D57] shrink-0" viewBox="0 0 50 20" fill="none">
                <path d="M2 16 L 18 12 L 32 8 L 48 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <div className="mt-1.5">
              <div className="text-lg sm:text-xl font-bold font-mono-data text-[#EDE9DE] leading-tight truncate">
                {data.ustJgbSpread}
              </div>
              <div className="flex items-center justify-between text-[10px] font-mono-data mt-1 gap-1">
                <span className="text-[#B08D57] font-semibold truncate">{data.ustJgbChange}</span>
                <span className="text-[#8292A6] truncate">Spread</span>
              </div>
            </div>
            <div className="text-[9px] font-mono-data text-[#8292A6] mt-1.5 border-t border-[#B08D57]/10 pt-1 truncate">
              JGB 10Y Yield: <span className="text-[#EDE9DE] font-semibold">{data.jgb10y.split(' ')[0]}</span>
            </div>
          </div>
        </div>

        {/* Tab Content 1: TRIGGER ZONES (Default from reference) */}
        {activeSubTab === "Trigger Zones" && (
          <div className="space-y-2">
            <div className="text-[10px] font-mono-data uppercase tracking-wider text-[#B08D57] font-semibold mb-2">
              MINISTRY OF FINANCE & BOJ ESCALATION ZONES
            </div>
            <div className="space-y-2">
              {data.zones.map((zone, idx) => {
                const isCritical = zone.tag === "CRITICAL";
                const isHigh = zone.tag === "HIGH";
                const isMedium = zone.tag === "MEDIUM";

                return (
                  <div
                    key={idx}
                    className={`rounded p-3 border transition-all ${
                      isCritical
                        ? "bg-black/50 border-[#A6291C]/60 hover:border-[#A6291C]"
                        : isHigh
                        ? "bg-black/40 border-[#B08D57]/30 hover:border-[#B08D57]"
                        : "bg-black/30 border-[#B08D57]/10 hover:border-[#B08D57]/30"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono-data font-bold text-sm text-[#EDE9DE]">
                          {zone.range}
                        </span>
                        <span className="text-[10px] font-mono-data uppercase font-semibold text-[#8292A6]">
                          {zone.title}
                        </span>
                      </div>

                      <span
                        className={`text-[9px] font-mono-data font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                          isCritical
                            ? "bg-[#A6291C] text-[#EDE9DE]"
                            : isHigh
                            ? "bg-[#B08D57] text-[#0E1A2B]"
                            : isMedium
                            ? "bg-black/60 text-[#EDE9DE] border border-[#B08D57]/20"
                            : "bg-black/40 text-[#8292A6]"
                        }`}
                      >
                        {zone.tag}
                      </span>
                    </div>
                    <p className="text-xs text-[#8292A6] mt-1 leading-relaxed">
                      {zone.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab Content: ORDER BOOK DEPTH */}
        {activeSubTab === "Order Book Depth" && (
          <div className="bg-black/40 border border-[#B08D57]/15 rounded p-3 space-y-3 font-mono-data text-xs overflow-x-auto pb-2">
            <div className="flex justify-between items-center text-[10px] text-[#8292A6] uppercase tracking-wider pb-1.5 border-b border-[#B08D57]/15">
              <span>EBS / Reuters Matching Depth</span>
              <span className="text-[#B08D57] font-semibold">Tokyo / London Session</span>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[9px] text-[#8292A6] px-1 pb-1">
                <span>JPY Bids (USD Buy)</span>
                <span className="font-bold text-[#EDE9DE]">Spot Level</span>
                <span>JPY Offers (USD Sell)</span>
              </div>
              {fxOrderBook.map((row, idx) => (
                <div
                  key={idx}
                  className={`flex items-center justify-between text-[9.5px] py-1 px-2 rounded ${
                    row.type === "bbo"
                      ? "bg-[#B08D57]/20 border border-[#B08D57]/40 text-[#EDE9DE]"
                      : row.type === "ask"
                      ? "bg-black/30 text-[#8292A6]"
                      : "bg-black/20 text-[#8292A6]"
                  }`}
                >
                  <div className="w-20 text-left text-[#10B981] font-bold">{row.bid}</div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-[#EDE9DE]">{row.price}</span>
                    <span className="text-[7.5px] px-1 py-0.2 rounded bg-black/50 text-[#8292A6] border border-[#B08D57]/20 uppercase">
                      {row.tag}
                    </span>
                  </div>
                  <div className="w-20 text-right text-[#FF8585] font-bold">{row.ask}</div>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-[#B08D57]/10 flex justify-between text-[9px] text-[#8292A6]">
              <span>Barrier Defense: 160.50 (BoJ Knock-in)</span>
              <span className="text-[#FF8585] font-bold">Net Skew: 62% JPY Ask Heavy</span>
            </div>
          </div>
        )}

        {/* Tab Content 2: PROBABILITY & SIMULATOR */}
        {activeSubTab === "Probability" && (
          <div className="bg-black/40 border border-[#B08D57]/15 rounded p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-mono-data font-bold text-[#EDE9DE] uppercase">
                  BoJ Econometric Intervention Model
                </span>
                <p className="text-[10px] text-[#8292A6]">
                  Calibrated against 1998, 2022 & 2024 Ministry of Finance operations
                </p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-mono-data font-bold text-[#A6291C]">
                  {currentOdds}%
                </span>
                <span className="block text-[9px] font-mono-data text-[#8292A6]">
                  Probability Metric
                </span>
              </div>
            </div>

            {/* Interactive Spot Slider */}
            <div className="bg-black/50 p-3 rounded border border-[#B08D57]/15">
              <div className="flex items-center justify-between text-xs font-mono-data mb-1.5">
                <span className="text-[#8292A6]">Stress Test USD/JPY Spot:</span>
                <span className="text-[#B08D57] font-bold">{simSpot.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="152.0"
                max="163.0"
                step="0.05"
                value={simSpot}
                onChange={(e) => setSimSpot(parseFloat(e.target.value))}
                className="w-full accent-[#B08D57] cursor-pointer"
              />
              <div className="flex justify-between text-[9px] font-mono-data text-[#8292A6] mt-1">
                <span>152.00 (Quiet)</span>
                <span>157.00 (Jawbone)</span>
                <span>160.50 (BoJ Trigger)</span>
                <span>163.00 (Direct FX Buy)</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono-data">
              <div className="bg-black/40 p-2.5 rounded border border-[#B08D57]/15">
                <span className="text-[#8292A6] block text-[9px]">Estimated Yen Outlay:</span>
                <span className="text-[#EDE9DE] font-semibold text-sm">¥5.5 - ¥9.2 Trillion</span>
              </div>
              <div className="bg-black/40 p-2.5 rounded border border-[#B08D57]/15">
                <span className="text-[#8292A6] block text-[9px]">Historical 24h Move:</span>
                <span className="text-[#A6291C] font-semibold text-sm">-450 to -650 pips drop</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content 3: YIELD SPREAD */}
        {activeSubTab === "Yield Spread" && (
          <div className="bg-black/40 border border-[#B08D57]/15 rounded p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono-data font-bold text-[#EDE9DE] uppercase">
                US 10Y UST vs Japan 10Y JGB Spread Mechanics
              </span>
              <span className="text-xs font-mono-data text-[#B08D57]">{data.ustJgbSpread || "219 bps"}</span>
            </div>
            <p className="text-xs text-[#8292A6] leading-relaxed">
              The fundamental driver of Yen depreciation remains the wide sovereign yield differential. Carry trades generate positive roll yield, forcing BoJ to use liquidity interventions rather than rate hikes to stem speculation.
            </p>
            <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono-data pt-2">
              <div className="bg-black/50 p-2 rounded border border-[#B08D57]/15">
                <span className="text-[9px] text-[#8292A6] block">US 10-Year Yield</span>
                <span className="text-[#EDE9DE] font-bold">{data.ust10y || "5.277%"}</span>
              </div>
              <div className="bg-black/50 p-2 rounded border border-[#B08D57]/15">
                <span className="text-[9px] text-[#8292A6] block">Japan 10-Year JGB</span>
                <span className="text-[#EDE9DE] font-bold">{data.jgb10y || "3.088%"}</span>
              </div>
              <div className="bg-black/50 p-2 rounded border border-[#B08D57]/15">
                <span className="text-[9px] text-[#8292A6] block">Net Spread Carry</span>
                <span className="text-[#B08D57] font-bold">+{data.ustJgbSpread || "219 bps"}</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content 4: PAST LOGS */}
        {activeSubTab === "Past Logs" && (
          <div className="bg-black/40 border border-[#B08D57]/15 rounded p-4 space-y-2 text-xs font-mono-data">
            <div className="text-[10px] font-bold text-[#B08D57] uppercase mb-1">
              Historical MoF Intervention Precedents
            </div>
            <div className="space-y-1.5 text-[#8292A6]">
              <div className="flex justify-between border-b border-[#B08D57]/15 pb-1">
                <span className="text-[#EDE9DE]">2024 July 11:</span>
                <span>USD/JPY 161.80 → Dropped to 157.40 (¥5.6T spent)</span>
              </div>
              <div className="flex justify-between border-b border-[#B08D57]/15 pb-1">
                <span className="text-[#EDE9DE]">2024 April 29:</span>
                <span>USD/JPY 160.24 → Dropped to 154.50 (¥9.8T spent)</span>
              </div>
              <div className="flex justify-between border-b border-[#B08D57]/15 pb-1">
                <span className="text-[#EDE9DE]">2022 October 21:</span>
                <span>USD/JPY 151.94 → Dropped to 146.20 (¥5.6T spent)</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Desk Action Footer from Reference */}
      <div className="mt-5 pt-3 border-t border-[#B08D57]/15 flex flex-wrap items-center justify-between text-xs font-mono-data gap-2 text-[#8292A6]">
        <div className="flex items-center gap-2 text-[#EDE9DE]">
          <Zap className="w-3.5 h-3.5 text-[#B08D57]" />
          <span>
            <strong className="text-[#B08D57]">DESK:</strong> {data.deskPosition}
          </span>
        </div>
        <span className="text-[9px] text-[#8292A6]">{data.deskCode}</span>
      </div>
    </div>
  );
};
