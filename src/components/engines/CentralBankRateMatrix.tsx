import React, { useState, useMemo } from "react";
import {
  Building2,
  TrendingDown,
  TrendingUp,
  Clock,
  Activity,
  Calendar,
  Percent,
  Layers,
  ArrowUpRight,
  Shield,
  HelpCircle,
  ExternalLink,
  RefreshCw
} from "lucide-react";
import { ChartExportDropdown } from "../ChartExportDropdown";

export interface CentralBankPolicy {
  code: string;
  name: string;
  currency: string;
  currentRate: string;
  rateValue: number;
  lastDecision: string;
  lastDecisionDate: string;
  nextMeetingDate: string;
  nextMeetingDateISO: string;
  followingMeetingDate: string;
  daysToMeeting: number;
  impliedProbabilities: {
    cut50bps: number;
    cut25bps: number;
    hold: number;
    hike25bps: number;
    hike50bps: number;
  };
  pricedCuts2026: number; // in bps, e.g. -48 bps
  stance: "Dovish" | "Neutral" | "Hawkish" | "Cautious Hold";
  balanceSheetPolicy: string; // e.g. QT $60B/mo
  inflationTarget: string; // e.g. 2.0%
  currentInflation: string; // e.g. 2.6% CPI
  forwardGuidance: string;
  keyAssetImpact: string;
}

export function calculateDaysToDate(targetIsoDate: string): number {
  const now = new Date();
  const target = new Date(targetIsoDate);
  const diffMs = target.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  return Math.max(1, diffDays);
}

const RAW_CENTRAL_BANKS: Omit<CentralBankPolicy, "daysToMeeting">[] = [
  {
    code: "ECB",
    name: "European Central Bank (ECB)",
    currency: "EUR",
    currentRate: "2.75% (DFR)",
    rateValue: 2.75,
    lastDecision: "-25 bps Cut",
    lastDecisionDate: "Sep 10, 2026",
    nextMeetingDate: "Oct 29, 2026",
    nextMeetingDateISO: "2026-10-29T12:15:00Z",
    followingMeetingDate: "Dec 17, 2026",
    impliedProbabilities: {
      cut50bps: 4,
      cut25bps: 72,
      hold: 24,
      hike25bps: 0,
      hike50bps: 0
    },
    pricedCuts2026: -50,
    stance: "Dovish",
    balanceSheetPolicy: "Full reinvestment termination for APP & PEPP runoff",
    inflationTarget: "2.0% HICP",
    currentInflation: "2.1% YoY",
    forwardGuidance: "Monetary easing path sustained to support stagnant Eurozone manufacturing and industrial demand.",
    keyAssetImpact: "EUR/USD, Bund Yields, IBEX 35 Spanish Bank Margins"
  },
  {
    code: "BOJ",
    name: "Bank of Japan (BoJ)",
    currency: "JPY",
    currentRate: "0.50%",
    rateValue: 0.50,
    lastDecision: "Hold / Hawkish Guidance",
    lastDecisionDate: "Sep 19, 2026",
    nextMeetingDate: "Oct 30, 2026",
    nextMeetingDateISO: "2026-10-30T03:00:00Z",
    followingMeetingDate: "Dec 18, 2026",
    impliedProbabilities: {
      cut50bps: 0,
      cut25bps: 0,
      hold: 68,
      hike25bps: 32,
      hike50bps: 0
    },
    pricedCuts2026: +25,
    stance: "Hawkish",
    balanceSheetPolicy: "Tapering JGB monthly purchases to ¥3T/mo",
    inflationTarget: "2.0% Sustainable",
    currentInflation: "2.8% Core CPI",
    forwardGuidance: "Normalizing policy rates as virtuous wage-price spiral takes hold; monitoring USD/JPY intervention boundary.",
    keyAssetImpact: "USD/JPY Carry Trade Unwind, Nikkei 225, Global Liquidity Beta"
  },
  {
    code: "RBA",
    name: "Reserve Bank of Australia (RBA)",
    currency: "AUD",
    currentRate: "4.10%",
    rateValue: 4.10,
    lastDecision: "-25 bps Cut",
    lastDecisionDate: "Sep 22, 2026",
    nextMeetingDate: "Nov 03, 2026",
    nextMeetingDateISO: "2026-11-03T03:30:00Z",
    followingMeetingDate: "Dec 08, 2026",
    impliedProbabilities: {
      cut50bps: 0,
      cut25bps: 38,
      hold: 60,
      hike25bps: 2,
      hike50bps: 0
    },
    pricedCuts2026: -25,
    stance: "Cautious Hold",
    balanceSheetPolicy: "Passive bond portfolio runoff",
    inflationTarget: "2.0% - 3.0%",
    currentInflation: "3.1% Trimmed Mean",
    forwardGuidance: "Balancing sticky domestic services inflation against commodity demand dynamics from China.",
    keyAssetImpact: "AUD/USD, Iron Ore Futures, Asian Commodity Cycle"
  },
  {
    code: "FED",
    name: "Federal Reserve (FOMC)",
    currency: "USD",
    currentRate: "4.25% - 4.50%",
    rateValue: 4.375,
    lastDecision: "-25 bps Cut",
    lastDecisionDate: "Sep 17, 2026",
    nextMeetingDate: "Nov 05, 2026",
    nextMeetingDateISO: "2026-11-05T19:00:00Z",
    followingMeetingDate: "Dec 16, 2026",
    impliedProbabilities: {
      cut50bps: 1,
      cut25bps: 34,
      hold: 65,
      hike25bps: 0,
      hike50bps: 0
    },
    pricedCuts2026: -50,
    stance: "Cautious Hold",
    balanceSheetPolicy: "QT: Treasury $25B/mo, MBS $35B/mo",
    inflationTarget: "2.0% Core PCE",
    currentInflation: "2.6% YoY",
    forwardGuidance: "Gradual recalibration contingent on sustained disinflation progress and resilient labor dynamics.",
    keyAssetImpact: "DXY Dollar Index, US 10Y Yields, S&P 500 Equity Multiples"
  },
  {
    code: "BOE",
    name: "Bank of England (MPC)",
    currency: "GBP",
    currentRate: "4.50%",
    rateValue: 4.50,
    lastDecision: "Hold / Gradual Easing",
    lastDecisionDate: "Sep 18, 2026",
    nextMeetingDate: "Nov 05, 2026",
    nextMeetingDateISO: "2026-11-05T12:00:00Z",
    followingMeetingDate: "Dec 17, 2026",
    impliedProbabilities: {
      cut50bps: 0,
      cut25bps: 42,
      hold: 56,
      hike25bps: 2,
      hike50bps: 0
    },
    pricedCuts2026: -25,
    stance: "Neutral",
    balanceSheetPolicy: "Active Gilt sales QT £100B/yr",
    inflationTarget: "2.0% CPI",
    currentInflation: "2.8% YoY",
    forwardGuidance: "Persistent services inflation mandates careful, sequenced rate cuts rather than aggressive front-loading.",
    keyAssetImpact: "GBP/USD, UK Gilts, FTSE 100 Multinational Dividend Yields"
  },
  {
    code: "SNB",
    name: "Swiss National Bank (SNB)",
    currency: "CHF",
    currentRate: "0.50%",
    rateValue: 0.50,
    lastDecision: "-25 bps Cut",
    lastDecisionDate: "Sep 24, 2026",
    nextMeetingDate: "Dec 10, 2026",
    nextMeetingDateISO: "2026-12-10T08:30:00Z",
    followingMeetingDate: "Mar 18, 2027",
    impliedProbabilities: {
      cut50bps: 0,
      cut25bps: 35,
      hold: 65,
      hike25bps: 0,
      hike50bps: 0
    },
    pricedCuts2026: -25,
    stance: "Dovish",
    balanceSheetPolicy: "FX intervention to curb safe-haven Franc overvaluation",
    inflationTarget: "0.0% - 2.0%",
    currentInflation: "0.9% YoY",
    forwardGuidance: "Ready to intervene in FX markets or lower rates further to counter deflationary CHF appreciation.",
    keyAssetImpact: "EUR/CHF, Safe-Haven Gold Crosses, Swiss Watch Exports"
  }
];

export function getCentralBankPolicies(): CentralBankPolicy[] {
  return RAW_CENTRAL_BANKS.map(bank => ({
    ...bank,
    daysToMeeting: calculateDaysToDate(bank.nextMeetingDateISO)
  }));
}

interface CentralBankRateMatrixProps {
  onOpenTerminal?: (prompt: string) => void;
}

export const CentralBankRateMatrix: React.FC<CentralBankRateMatrixProps> = ({ onOpenTerminal }) => {
  const policies = useMemo(() => getCentralBankPolicies(), []);
  const [selectedBank, setSelectedBank] = useState<CentralBankPolicy>(policies[0]);
  const [sortBy, setSortBy] = useState<"code" | "rate" | "days" | "cuts">("days");

  const sortedBanks = useMemo(() => {
    return [...policies].sort((a, b) => {
      if (sortBy === "rate") return b.rateValue - a.rateValue;
      if (sortBy === "days") return a.daysToMeeting - b.daysToMeeting;
      if (sortBy === "cuts") return a.pricedCuts2026 - b.pricedCuts2026;
      return a.code.localeCompare(b.code);
    });
  }, [policies, sortBy]);

  return (
    <div id="central-bank-rate-matrix-card" className="bg-[#0B0F17] border border-[#B08D57]/35 rounded-xl p-4 sm:p-6 shadow-2xl space-y-6 font-mono-data text-xs relative overflow-hidden">
      {/* Top subtle brass trim */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#B08D57]/70 to-transparent pointer-events-none" />

      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#B08D57]/25">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#B08D57]/20 border border-[#B08D57]/40 flex items-center justify-center text-[#E5C794] shadow-sm">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold font-serif italic text-[#FBF8F1]" style={{ fontFamily: "Georgia, 'Newsreader', serif" }}>
              Global Central Bank Rate Matrix & Pricing Odds
            </h3>
            <p className="text-[11px] text-[#BAC7D5] font-semibold mt-0.5">
              INSTITUTIONAL POLICY RATES · OIS & FUTURES-IMPLIED PROBABILITIES · CUMULATIVE EASING PATH
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="text-[10px] text-[#8292A6] uppercase">Sort by:</span>
          <div className="flex items-center gap-1 bg-black/60 p-1 rounded-lg border border-[#253347]">
            <button
              onClick={() => setSortBy("days")}
              className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all ${
                sortBy === "days" ? "bg-[#B08D57] text-[#0A111C]" : "text-[#8292A6] hover:text-[#EDE9DE]"
              }`}
            >
              Next Meeting
            </button>
            <button
              onClick={() => setSortBy("rate")}
              className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all ${
                sortBy === "rate" ? "bg-[#B08D57] text-[#0A111C]" : "text-[#8292A6] hover:text-[#EDE9DE]"
              }`}
            >
              Policy Rate
            </button>
            <button
              onClick={() => setSortBy("cuts")}
              className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all ${
                sortBy === "cuts" ? "bg-[#B08D57] text-[#0A111C]" : "text-[#8292A6] hover:text-[#EDE9DE]"
              }`}
            >
              2026 Easing
            </button>
          </div>

          <ChartExportDropdown
            chartTitle="Global Central Bank Rate Matrix & Pricing Odds"
            chartContainerId="central-bank-rate-matrix-card"
            subtitle="FED / ECB / BOJ / BOE / SNB / RBA POLICY PROBABILITIES & EASING PATHS"
            size="xs"
            buttonLabel="Export Matrix"
            getCsvData={() => {
              const headers = [
                "Central Bank",
                "Code",
                "Currency",
                "Current Policy Rate",
                "Last Decision",
                "Last Decision Date",
                "Next Meeting Date",
                "Days to Decision",
                "Following Meeting Date",
                "50bps Cut Prob (%)",
                "25bps Cut Prob (%)",
                "Hold Prob (%)",
                "25bps Hike Prob (%)",
                "2026 Priced Cuts (bps)",
                "Stance",
                "Inflation Target",
                "Current Inflation",
                "Balance Sheet Runoff Policy",
                "Forward Guidance",
                "Key Asset Transmission",
              ];
              const rows = sortedBanks.map((b) => [
                b.name,
                b.code,
                b.currency,
                b.currentRate,
                b.lastDecision,
                b.lastDecisionDate,
                b.nextMeetingDate,
                b.daysToMeeting,
                b.followingMeetingDate,
                b.impliedProbabilities.cut50bps,
                b.impliedProbabilities.cut25bps,
                b.impliedProbabilities.hold,
                b.impliedProbabilities.hike25bps,
                b.pricedCuts2026,
                b.stance,
                b.inflationTarget,
                b.currentInflation,
                b.balanceSheetPolicy,
                b.forwardGuidance,
                b.keyAssetImpact,
              ]);
              return {
                filename: "smc-central-bank-rate-matrix-odds",
                headers,
                rows,
                metaComments: [
                  "SIN MIEDO CAPITAL // GLOBAL CENTRAL BANK RATE MATRIX & POLICY ODDS",
                  "Includes FOMC, ECB, Bank of Japan, Bank of England, Swiss National Bank, RBA",
                  "Probabilities implied via OIS, Fed Funds futures, and Euribor swaps",
                ],
              };
            }}
          />
        </div>
      </div>

      {/* Main Table: Compact Rate Matrix */}
      <div className="overflow-x-auto bg-black/50 border border-[#253347] rounded-xl">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[#253347] text-[#8292A6] text-[10px] uppercase bg-black/80">
              <th className="py-3 px-3">Central Bank</th>
              <th className="py-3">Current Rate</th>
              <th className="py-3">Next Decision</th>
              <th className="py-3 min-w-[200px]">Next Meeting Pricing Odds</th>
              <th className="py-3 text-center">2026 Easing Priced</th>
              <th className="py-3">Current Stance</th>
              <th className="py-3 text-right pr-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#253347]/40">
            {sortedBanks.map((bank) => {
              const isSelected = selectedBank.code === bank.code;
              const isHikePriced = bank.pricedCuts2026 > 0;

              return (
                <tr
                  key={bank.code}
                  onClick={() => setSelectedBank(bank)}
                  className={`hover:bg-white/5 cursor-pointer transition-colors ${
                    isSelected ? "bg-[#B08D57]/15" : ""
                  }`}
                >
                  {/* Central Bank */}
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-[#EDE9DE]">{bank.code}</span>
                      <span className="text-[10.5px] text-[#8292A6]">({bank.currency})</span>
                    </div>
                    <div className="text-[10px] text-[#BAC7D5] truncate max-w-[170px]">{bank.name}</div>
                  </td>

                  {/* Current Rate */}
                  <td className="py-3 font-bold text-[#EDE9DE] text-sm tabular-nums">
                    {bank.currentRate}
                  </td>

                  {/* Next Decision */}
                  <td className="py-3">
                    <div className="font-semibold text-[#EDE9DE]">{bank.nextMeetingDate}</div>
                    <div className="text-[10px] text-[#E5C794] flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#E5C794]" />
                      <span>in {bank.daysToMeeting} days</span>
                    </div>
                  </td>

                  {/* Implied Probabilities Bar & Breakdown */}
                  <td className="py-3">
                    <div className="space-y-1.5 pr-3">
                      <div className="flex items-center justify-between text-[10px] font-bold">
                        <span className="text-[#34D399]">
                          {bank.code === "BOJ"
                            ? `Hike 25bp: ${bank.impliedProbabilities.hike25bps}%`
                            : `Cut 25bp: ${bank.impliedProbabilities.cut25bps}%`}
                        </span>
                        <span className="text-[#BAC7D5]">
                          Hold: {bank.impliedProbabilities.hold}%
                        </span>
                      </div>
                      {/* Segmented probability bar */}
                      <div className="w-full h-2 rounded-full bg-black/60 border border-[#253347] flex overflow-hidden">
                        {bank.code === "BOJ" ? (
                          <>
                            <div
                              className="bg-[#38BDF8] h-full"
                              style={{ width: `${bank.impliedProbabilities.hike25bps}%` }}
                              title={`Hike 25bps: ${bank.impliedProbabilities.hike25bps}%`}
                            />
                            <div
                              className="bg-[#D97706]/70 h-full"
                              style={{ width: `${bank.impliedProbabilities.hold}%` }}
                              title={`Hold: ${bank.impliedProbabilities.hold}%`}
                            />
                          </>
                        ) : (
                          <>
                            <div
                              className="bg-[#059669] h-full"
                              style={{ width: `${bank.impliedProbabilities.cut25bps}%` }}
                              title={`Cut 25bps: ${bank.impliedProbabilities.cut25bps}%`}
                            />
                            <div
                              className="bg-[#D97706]/70 h-full"
                              style={{ width: `${bank.impliedProbabilities.hold}%` }}
                              title={`Hold: ${bank.impliedProbabilities.hold}%`}
                            />
                            <div
                              className="bg-[#DC2626] h-full"
                              style={{ width: `${bank.impliedProbabilities.hike25bps}%` }}
                              title={`Hike 25bps: ${bank.impliedProbabilities.hike25bps}%`}
                            />
                          </>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* 2026 Easing Priced */}
                  <td className="py-3 text-center tabular-nums">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        isHikePriced
                          ? "bg-[#0284C7]/20 text-[#38BDF8] border border-[#0284C7]/40"
                          : "bg-[#064E3B]/60 text-[#34D399] border border-[#059669]/60"
                      }`}
                    >
                      {bank.pricedCuts2026 > 0 ? `+${bank.pricedCuts2026}` : bank.pricedCuts2026} bps
                    </span>
                  </td>

                  {/* Stance */}
                  <td className="py-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        bank.stance === "Dovish"
                          ? "bg-[#064E3B]/70 text-[#34D399] border border-[#059669]/70"
                          : bank.stance === "Hawkish"
                          ? "bg-[#A6291C]/40 text-[#FF8585] border border-[#A6291C]/60"
                          : "bg-[#B08D57]/20 text-[#E5C794] border border-[#B08D57]/50"
                      }`}
                    >
                      {bank.stance}
                    </span>
                  </td>

                  {/* Inspect Button */}
                  <td className="py-3 text-right pr-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedBank(bank);
                      }}
                      className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase transition-all ${
                        isSelected
                          ? "bg-[#B08D57] text-[#0A111C]"
                          : "bg-black/50 text-[#8292A6] hover:text-[#EDE9DE] border border-[#253347]"
                      }`}
                    >
                      {isSelected ? "Active" : "Inspect"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Detailed Central Bank Inspection Card */}
      <div id="central-bank-detail-card" className="bg-black/70 border border-[#B08D57]/30 rounded-xl p-4 sm:p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#253347]">
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-[#FBF8F1]">{selectedBank.name} ({selectedBank.code})</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#B08D57]/20 text-[#E5C794] border border-[#B08D57]/40">
              Target: {selectedBank.inflationTarget}
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-black/50 text-[#BAC7D5] border border-[#253347]">
              Current CPI: {selectedBank.currentInflation}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <ChartExportDropdown
              chartTitle={`${selectedBank.code} Policy Dossier & Pricing Odds`}
              chartContainerId="central-bank-detail-card"
              subtitle={`RATE: ${selectedBank.currentRate} // NEXT: ${selectedBank.nextMeetingDate} // STANCE: ${selectedBank.stance}`}
              size="xs"
              buttonLabel={`Export ${selectedBank.code}`}
              getCsvData={() => {
                const headers = [
                  "Metric / Parameter",
                  "Value / Setting",
                  "Policy Implication / Notes",
                ];
                const rows = [
                  ["Central Bank", selectedBank.name, selectedBank.code],
                  ["Currency", selectedBank.currency, "Base FX cross"],
                  ["Policy Rate", selectedBank.currentRate, `Numeric: ${selectedBank.rateValue}%`],
                  ["Prior Decision", selectedBank.lastDecision, selectedBank.lastDecisionDate],
                  ["Next Decision Date", selectedBank.nextMeetingDate, `In ${selectedBank.daysToMeeting} days`],
                  ["Following Meeting Date", selectedBank.followingMeetingDate, "Next scheduled cycle"],
                  ["50bps Cut Implied Odds", `${selectedBank.impliedProbabilities.cut50bps}%`, "Aggressive front-loaded easing"],
                  ["25bps Cut Implied Odds", `${selectedBank.impliedProbabilities.cut25bps}%`, "Standard easing increment"],
                  ["Hold Odds", `${selectedBank.impliedProbabilities.hold}%`, "Neutral pause"],
                  ["25bps Hike Implied Odds", `${selectedBank.impliedProbabilities.hike25bps}%`, "Tightening cycle"],
                  ["Cumulative 2026 Easing Priced", `${selectedBank.pricedCuts2026} bps`, "Money market curve expectation"],
                  ["Current Policy Stance", selectedBank.stance, "Official guidance orientation"],
                  ["Inflation Target", selectedBank.inflationTarget, "Central bank headline/core target"],
                  ["Latest Inflation Metric", selectedBank.currentInflation, "Latest reported CPI/PCE print"],
                  ["Balance Sheet / QT Program", selectedBank.balanceSheetPolicy, "Securities runoff"],
                  ["Forward Guidance Directive", selectedBank.forwardGuidance, "Official statement snippet"],
                  ["Key Market Transmission Channel", selectedBank.keyAssetImpact, "Primary asset class sensitivities"],
                ];
                return {
                  filename: `smc-${selectedBank.code.toLowerCase()}-policy-dossier`,
                  headers,
                  rows,
                  metaComments: [
                    `SIN MIEDO CAPITAL // ${selectedBank.name} (${selectedBank.code}) POLICY DOSSIER`,
                    `Current Rate: ${selectedBank.currentRate} | Stance: ${selectedBank.stance}`,
                    `Next Meeting: ${selectedBank.nextMeetingDate} (${selectedBank.daysToMeeting} days)`,
                  ],
                };
              }}
            />
            {onOpenTerminal && (
              <button
                onClick={() =>
                  onOpenTerminal(
                    `Provide deep institutional macro analysis of ${selectedBank.name} (${selectedBank.code}). Next meeting on ${selectedBank.nextMeetingDate} (following: ${selectedBank.followingMeetingDate}) with current rate ${selectedBank.currentRate}. Forward guidance: "${selectedBank.forwardGuidance}". Asset impacts on ${selectedBank.keyAssetImpact}.`
                  )
                }
                className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#B08D57] hover:bg-[#C9A46D] text-[#0A111C] font-bold text-xs transition-all shadow-sm cursor-pointer"
              >
                <span>Query {selectedBank.code} Desk in Terminal</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* 2026/2027 Forward Calendar Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-[#080D15] p-3 rounded-lg border border-[#253347]/80 text-[11px]">
          <div>
            <span className="text-[9.5px] text-[#8292A6] uppercase block font-semibold">Prior Decision</span>
            <span className="text-[#EDE9DE] font-bold">{selectedBank.lastDecision}</span>
            <span className="text-[9px] text-[#8292A6] block">{selectedBank.lastDecisionDate}</span>
          </div>
          <div>
            <span className="text-[9.5px] text-[#8292A6] uppercase block font-semibold">Upcoming Decision</span>
            <span className="text-[#34D399] font-bold">{selectedBank.nextMeetingDate}</span>
            <span className="text-[9px] text-[#E5C794] block">in {selectedBank.daysToMeeting} days</span>
          </div>
          <div>
            <span className="text-[9.5px] text-[#8292A6] uppercase block font-semibold">Following 2026/27 Meeting</span>
            <span className="text-[#EDE9DE] font-bold">{selectedBank.followingMeetingDate}</span>
            <span className="text-[9px] text-[#8292A6] block">Year-End Calibrated</span>
          </div>
          <div>
            <span className="text-[9.5px] text-[#8292A6] uppercase block font-semibold">Remaining 2026 Easing</span>
            <span className={`font-bold ${selectedBank.pricedCuts2026 > 0 ? "text-[#38BDF8]" : "text-[#34D399]"}`}>
              {selectedBank.pricedCuts2026 > 0 ? `+${selectedBank.pricedCuts2026}` : selectedBank.pricedCuts2026} bps
            </span>
            <span className="text-[9px] text-[#8292A6] block">Market Implied</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Balance Sheet & QT */}
          <div className="bg-[#101726] border border-[#253347] rounded-lg p-3 space-y-1">
            <span className="text-[10px] text-[#8292A6] uppercase font-semibold block">Balance Sheet / Quantitative Tightening</span>
            <span className="text-xs font-bold text-[#EDE9DE] block">{selectedBank.balanceSheetPolicy}</span>
            <span className="text-[10px] text-[#BAC7D5] block pt-1">
              Active liquidity drain pace continuing alongside interest rate decisions.
            </span>
          </div>

          {/* Forward Guidance */}
          <div className="bg-[#101726] border border-[#253347] rounded-lg p-3 space-y-1">
            <span className="text-[10px] text-[#8292A6] uppercase font-semibold block">Forward Guidance Summary</span>
            <span className="text-xs text-[#EDE9DE] leading-relaxed block">{selectedBank.forwardGuidance}</span>
          </div>

          {/* Key Asset Impact */}
          <div className="bg-[#101726] border border-[#253347] rounded-lg p-3 space-y-1">
            <span className="text-[10px] text-[#8292A6] uppercase font-semibold block">Key Macro Transmission Channels</span>
            <span className="text-xs font-bold text-[#E5C794] block">{selectedBank.keyAssetImpact}</span>
            <span className="text-[10px] text-[#BAC7D5] block pt-1">
              Primary transmission mechanisms impacting terminal FX, yields, and equity volatility.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
