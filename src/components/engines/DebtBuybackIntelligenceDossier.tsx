import React, { useState, useEffect, useCallback } from "react";
import { apiFetch } from "../../api";
import {
  Landmark,
  TrendingDown,
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  Scale,
  Activity,
  Layers,
  Sparkles,
  ArrowRight,
  ExternalLink,
  Crosshair,
  FileText,
  DollarSign,
  ChevronRight,
  CheckCircle2,
  Calendar,
  Clock,
  Sliders,
  BarChart3,
  Percent,
  RefreshCw,
  Check
} from "lucide-react";
import { MacroDataState } from "../../types";

interface DebtBuybackIntelligenceDossierProps {
  macroData: MacroDataState;
  onOpenTerminalWithPrompt: (prompt: string) => void;
  onNavigateToDashboard?: (tab: string) => void;
}

export const DebtBuybackIntelligenceDossier: React.FC<DebtBuybackIntelligenceDossierProps> = ({
  macroData,
  onOpenTerminalWithPrompt,
  onNavigateToDashboard,
}) => {
  const [activeTab, setActiveTab] = useState<"comparison" | "buckets" | "transmission" | "tbac">("comparison");
  const [interactivePaceB, setInteractivePaceB] = useState<number>(6.0);
  const [apiData, setApiData] = useState<any>(null);
  const [lastSyncTime, setLastSyncTime] = useState<string>("");
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [decisionMessage, setDecisionMessage] = useState<string | null>(null);

  // Load and auto-poll /api/liquidity/debt-buyback
  const loadData = useCallback(async (isBackground = false) => {
    if (!isBackground) setIsSyncing(true);
    try {
      const res = await apiFetch("/api/liquidity/debt-buyback");
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setApiData(data);
          if (typeof data.weeklyPaceB === "number" && !isBackground) {
            setInteractivePaceB(data.weeklyPaceB);
          }
          setLastSyncTime(new Date().toTimeString().split(" ")[0] + " UTC");
        }
      }
    } catch {
      // Fallback
    } finally {
      if (!isBackground) setIsSyncing(false);
    }
  }, []);

  useEffect(() => {
    loadData(false);
    const interval = setInterval(() => {
      loadData(true);
    }, 15000);
    return () => clearInterval(interval);
  }, [loadData]);

  // Apply future decision to backend
  const handleApplyDecision = async (paceB: number, title?: string, note?: string) => {
    setIsSyncing(true);
    try {
      const res = await apiFetch("/api/liquidity/debt-buyback/decision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weeklyPaceB: paceB, title, note })
      });
      if (res.ok) {
        const result = await res.json();
        if (result.success && result.data) {
          setApiData(result.data);
          setInteractivePaceB(result.data.weeklyPaceB);
          setLastSyncTime(new Date().toTimeString().split(" ")[0] + " UTC");
          setDecisionMessage(`Broadcasted to Dashboard: $${paceB.toFixed(1)}B/wk active`);
          setTimeout(() => setDecisionMessage(null), 3500);
        }
      }
    } catch {
      setInteractivePaceB(paceB);
      setDecisionMessage(`Simulated locally: $${paceB.toFixed(1)}B/wk`);
      setTimeout(() => setDecisionMessage(null), 3000);
    } finally {
      setIsSyncing(false);
    }
  };

  // Dynamic calculations based on weekly pace
  const monthlyLiquidityB = Number((interactivePaceB * 4.333).toFixed(1));
  const annualizedPaceB = Number((interactivePaceB * 52).toFixed(1));
  const dv01ExtractedM = Number((interactivePaceB * 7.8).toFixed(1));
  const termPremiumBps = Number((-(interactivePaceB * 2.37)).toFixed(1));
  const qtOffsetPct = Math.min(100, Number(((monthlyLiquidityB / 60) * 100).toFixed(0)));

  const handleJumpToDashboard = () => {
    if (onNavigateToDashboard) {
      onNavigateToDashboard("dashboards");
      setTimeout(() => {
        const el = document.getElementById("us-liquidity-driver-telemetry-dashboard");
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        }
      }, 150);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* 1. Executive Intelligence Dossier Header */}
      <div className="bg-[#111722] border border-[#B08D57]/40 rounded-xl p-6 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#B08D57]/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-4xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-[#B08D57] text-[#0E1A2B] text-[10px] font-mono-data font-bold px-2 py-0.5 rounded tracking-widest uppercase flex items-center gap-1.5">
                <Landmark className="w-3 h-3" />
                SOVEREIGN INTERVENTION DOSSIER
              </span>
              <span className="bg-red-500/20 text-red-300 border border-red-500/30 text-[10px] font-mono-data px-2 py-0.5 rounded font-bold flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-red-400" />
                TREASURY EXPANDED TO $6.0B / WEEK (DOUBLED)
              </span>
              <span className="text-[10px] font-mono-data text-[#8292A6] flex items-center gap-1 bg-black/40 px-2 py-0.5 rounded border border-[#B08D57]/20">
                <Clock className="w-3 h-3 text-[#B08D57]" />
                LIVE SURVEILLANCE
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-serif italic font-bold text-[#FBF8F1] tracking-tight">
              US Treasury Bond Buybacks ($6.0B/wk) vs Sovereign FX Intervention
            </h2>
            <p className="text-xs sm:text-sm text-[#BAC7D5] leading-relaxed">
              Institutional intelligence assessment of the US Department of the Treasury’s sovereign debt buyback ramp. Why tracking this $24B/month liquidity transmission valve is just as vital as monitoring Bank of Japan yen defenses when the sovereign bond market trades on edge.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={handleJumpToDashboard}
              className="flex items-center gap-2 bg-[#B08D57] hover:bg-[#C49B5D] text-[#0E1A2B] font-bold text-xs px-4 py-2.5 rounded-lg shadow-lg hover:shadow-[#B08D57]/20 transition-all font-sans uppercase tracking-wider"
            >
              <BarChart3 className="w-4 h-4" />
              <span>Open Dashboard Telemetry</span>
            </button>
            <button
              onClick={() => onOpenTerminalWithPrompt("Synthesize the sovereign macro parallels between the US Treasury's $6B weekly bond buybacks and the Bank of Japan's JPY 160 intervention")}
              className="flex items-center gap-2 bg-black/60 hover:bg-black/90 text-[#EDE9DE] border border-[#B08D57]/40 font-semibold text-xs px-3.5 py-2.5 rounded-lg transition-all"
              title="Open SMC Strategy Desk & Playbook"
            >
              <Crosshair className="w-4 h-4 text-[#B08D57]" />
              <span>Strategy Desk</span>
            </button>
          </div>
        </div>

        {/* Metric Ribbons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-[#B08D57]/20 text-xs font-mono-data">
          <div className="bg-black/40 p-2.5 rounded border border-[#B08D57]/15">
            <span className="text-[9px] text-[#8292A6] block uppercase">Current Buyback Pace</span>
            <span className="text-[#10B981] font-bold text-sm">$6.00B / week</span>
            <span className="text-[9.5px] text-[#BAC7D5] block">+100% from $3.0B baseline</span>
          </div>
          <div className="bg-black/40 p-2.5 rounded border border-[#B08D57]/15">
            <span className="text-[9px] text-[#8292A6] block uppercase">Monthly Run-Rate</span>
            <span className="text-[#B08D57] font-bold text-sm">$24.0B / month</span>
            <span className="text-[9.5px] text-[#BAC7D5] block">$312B annualized velocity</span>
          </div>
          <div className="bg-black/40 p-2.5 rounded border border-[#B08D57]/15">
            <span className="text-[9px] text-[#8292A6] block uppercase">Duration Extracted (DV01)</span>
            <span className="text-[#38BDF8] font-bold text-sm">-$46.8M / bp</span>
            <span className="text-[9.5px] text-[#BAC7D5] block">Absorbed from primary dealers</span>
          </div>
          <div className="bg-black/40 p-2.5 rounded border border-[#B08D57]/15">
            <span className="text-[9px] text-[#8292A6] block uppercase">10Y Term Premium Impact</span>
            <span className="text-[#F59E0B] font-bold text-sm">-14.2 bps</span>
            <span className="text-[9.5px] text-[#BAC7D5] block">MOVE index suppressed to 96</span>
          </div>
        </div>
      </div>

      {/* 2. Dossier Sub-Navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#B08D57]/30 pb-3">
        <button
          onClick={() => setActiveTab("comparison")}
          className={`px-4 py-2 rounded-lg text-xs font-mono-data font-bold transition-all flex items-center gap-2 ${
            activeTab === "comparison"
              ? "bg-[#B08D57] text-[#0E1A2B] shadow-md"
              : "bg-black/40 text-[#8292A6] hover:text-[#EDE9DE] hover:bg-white/5 border border-[#B08D57]/20"
          }`}
        >
          <Scale className="w-3.5 h-3.5" />
          <span>Sovereign Defense Comparison (US vs BoJ)</span>
        </button>

        <button
          onClick={() => setActiveTab("buckets")}
          className={`px-4 py-2 rounded-lg text-xs font-mono-data font-bold transition-all flex items-center gap-2 ${
            activeTab === "buckets"
              ? "bg-[#B08D57] text-[#0E1A2B] shadow-md"
              : "bg-black/40 text-[#8292A6] hover:text-[#EDE9DE] hover:bg-white/5 border border-[#B08D57]/20"
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>5 Operational Maturity Buckets</span>
        </button>

        <button
          onClick={() => setActiveTab("transmission")}
          className={`px-4 py-2 rounded-lg text-xs font-mono-data font-bold transition-all flex items-center gap-2 ${
            activeTab === "transmission"
              ? "bg-[#B08D57] text-[#0E1A2B] shadow-md"
              : "bg-black/40 text-[#8292A6] hover:text-[#EDE9DE] hover:bg-white/5 border border-[#B08D57]/20"
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Fed QT vs Treasury Easing Tension</span>
        </button>

        <button
          onClick={() => setActiveTab("tbac")}
          className={`px-4 py-2 rounded-lg text-xs font-mono-data font-bold transition-all flex items-center gap-2 ${
            activeTab === "tbac"
              ? "bg-[#B08D57] text-[#0E1A2B] shadow-md"
              : "bg-black/40 text-[#8292A6] hover:text-[#EDE9DE] hover:bg-white/5 border border-[#B08D57]/20"
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Interactive Pacing Simulator</span>
        </button>
      </div>

      {/* 3. Tab Contents */}

      {/* TAB 1: COMPARISON MATRIX */}
      {activeTab === "comparison" && (
        <div className="space-y-6">
          <div className="bg-[#141923] border border-[#B08D57]/30 rounded-xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#FBF8F1] flex items-center gap-2">
                  <Scale className="w-4 h-4 text-[#B08D57]" />
                  <span>Cross-Asset Sovereign Intervention Matrix</span>
                </h3>
                <p className="text-xs text-[#8292A6] mt-0.5">
                  Direct structural comparison between Japan Ministry of Finance FX Intervention and US Treasury Secondary Bond Buybacks
                </p>
              </div>
              <span className="text-[10px] font-mono-data text-[#B08D57] bg-black/40 px-2 py-1 rounded border border-[#B08D57]/20">
                MACRO DUAL TRANSMISSION
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono-data">
                <thead>
                  <tr className="border-b border-[#B08D57]/30 bg-black/50 text-[#8292A6] uppercase text-[10px]">
                    <th className="py-3 px-4">Analytical Dimension</th>
                    <th className="py-3 px-4 text-[#FFA4A4]">Bank of Japan / MoF FX Intervention</th>
                    <th className="py-3 px-4 text-[#10B981]">US Treasury Bond Buyback Program</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#B08D57]/15">
                  <tr className="hover:bg-white/5">
                    <td className="py-3 px-4 font-bold text-[#EDE9DE]">Executive Authority</td>
                    <td className="py-3 px-4 text-[#FFA4A4]">Ministry of Finance (MoF International Affairs)</td>
                    <td className="py-3 px-4 text-[#10B981]">US Department of the Treasury (Office of Debt Management / TBAC)</td>
                  </tr>
                  <tr className="hover:bg-white/5">
                    <td className="py-3 px-4 font-bold text-[#EDE9DE]">Target Asset & Market</td>
                    <td className="py-3 px-4 text-[#FFA4A4]">USD/JPY Spot Foreign Exchange Market</td>
                    <td className="py-3 px-4 text-[#10B981]">Off-the-run US Treasuries (Nominal Notes, Bonds, TIPS)</td>
                  </tr>
                  <tr className="hover:bg-white/5">
                    <td className="py-3 px-4 font-bold text-[#EDE9DE]">Operational Pacing</td>
                    <td className="py-3 px-4 text-[#FFA4A4]">Discrete Shock Waves (~$38B in 1 session when redlines hit)</td>
                    <td className="py-3 px-4 text-[#10B981]">Continuous Programmatic Injection ($6.0B weekly, $24B monthly)</td>
                  </tr>
                  <tr className="hover:bg-white/5">
                    <td className="py-3 px-4 font-bold text-[#EDE9DE]">Primary Catalyst / Trigger</td>
                    <td className="py-3 px-4 text-[#FFA4A4]">USD/JPY crossing 160.00; runaway carry speculation & Yen debasement</td>
                    <td className="py-3 px-4 text-[#10B981]">Primary dealer balance sheet clogging, 10Y/30Y yield spikes & auction tails</td>
                  </tr>
                  <tr className="hover:bg-white/5">
                    <td className="py-3 px-4 font-bold text-[#EDE9DE]">Funding & Source of Cash</td>
                    <td className="py-3 px-4 text-[#FFA4A4]">MoF US Dollar Foreign Reserves ($155.4B repo/cash at Federal Reserve)</td>
                    <td className="py-3 px-4 text-[#10B981]">Treasury General Account (TGA) cash financed via short-term T-bill issuance</td>
                  </tr>
                  <tr className="hover:bg-white/5">
                    <td className="py-3 px-4 font-bold text-[#EDE9DE]">Dealer Balance Sheet Impact</td>
                    <td className="py-3 px-4 text-[#FFA4A4]">Absorbs USD liquidity from global FX banks; triggers CTA stop-loss cascades</td>
                    <td className="py-3 px-4 text-[#10B981]">Frees -$46.8M/bp DV01 duration from primary dealers, relieving Basel III leverage caps</td>
                  </tr>
                  <tr className="hover:bg-white/5">
                    <td className="py-3 px-4 font-bold text-[#EDE9DE]">Quantitative Output</td>
                    <td className="py-3 px-4 text-[#FFA4A4]">USD/JPY crashed from 160.22 to ~156.25 (-390 pips); odds dropped from 78% to 14%</td>
                    <td className="py-3 px-4 text-[#10B981]">Term premium compressed -14.2 bps; MOVE index reduced from 118 to 96 pts</td>
                  </tr>
                  <tr className="hover:bg-white/5">
                    <td className="py-3 px-4 font-bold text-[#EDE9DE]">Central Bank Coordination</td>
                    <td className="py-3 px-4 text-[#FFA4A4]">MoF acts as BoJ proxy; US Treasury provides polite "orderly market" acquiescence</td>
                    <td className="py-3 px-4 text-[#10B981]">Treasury buybacks directly offset ~40% of the Federal Reserve's Quantitative Tightening (QT)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Deep Institutional Commentary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-[#141923] border border-red-500/30 rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-red-400 font-bold font-mono-data">
                <AlertTriangle className="w-4 h-4" />
                <span>The Yen Defense Anatomy (BoJ / MoF)</span>
              </div>
              <p className="text-[#BAC7D5] leading-relaxed">
                When Japanese authorities entered the market unannounced to sell ~$38 Billion in dollar reserves at USD/JPY 160.22, they were fighting an asymmetric battle against wide yield differentials (+362 bps between US 10Y and JGBs). The intervention was a <em>liquidity blunt weapon</em>: it succeeded in punishing momentum algorithms, compressing carry froth, and lowering intervention probability from 78% to 14%, but requires constant vigilance at the 158.00 line.
              </p>
              <div className="pt-2 border-t border-red-500/20 text-[11px] text-[#FFA4A4]">
                <strong>Core Risk:</strong> FX interventions burn sovereign foreign reserves and can only buy time unless underlying yield differentials narrow.
              </div>
            </div>

            <div className="bg-[#141923] border border-[#10B981]/30 rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-[#10B981] font-bold font-mono-data">
                <CheckCircle2 className="w-4 h-4" />
                <span>The US Debt Buyback Anatomy (Treasury ODM)</span>
              </div>
              <p className="text-[#BAC7D5] leading-relaxed">
                By doubling buybacks to $6.0 Billion weekly, the US Treasury is executing a <em>stealth sovereign operation twist</em>. Rather than burning foreign currency, Treasury issues ultra-liquid short-term Treasury bills (which money market funds eagerly absorb via Reverse Repo cash) and uses the proceeds to retire illiquid, off-the-run 5Y-30Y paper from primary dealers. This clears balance sheet logjams and creates a structural bid under Treasuries exactly when the bond market is most anxious.
              </p>
              <div className="pt-2 border-t border-[#10B981]/20 text-[11px] text-[#A7F3D0]">
                <strong>Core Advantage:</strong> Programmatic, perpetual capacity that lowers sovereign refinancing costs while acting as synthetic quantitative easing.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: 5 OPERATIONAL BUCKETS */}
      {activeTab === "buckets" && (
        <div className="space-y-4">
          <div className="bg-[#141923] border border-[#B08D57]/30 rounded-xl p-5 shadow-xl space-y-3">
            <h3 className="text-base font-bold text-[#FBF8F1] flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#B08D57]" />
              <span>US Treasury ${interactivePaceB.toFixed(1)}B Weekly Buyback Allocation Architecture</span>
            </h3>
            <p className="text-xs text-[#8292A6]">
              How the Office of Debt Management distributes the ${interactivePaceB.toFixed(1)} Billion weekly capital allocation across curve tenors to maximize liquidity support and dealer relief:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-2">
              <div className="bg-black/50 border border-[#B08D57]/30 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono-data">
                  <span className="text-[#E5C794] font-bold">2Y – 5Y Notes</span>
                  <span className="text-[#10B981] font-bold">30.0%</span>
                </div>
                <div className="text-lg font-bold text-[#FBF8F1] font-mono-data">${(interactivePaceB * 0.30).toFixed(2)}B / wk</div>
                <p className="text-[10px] text-[#BAC7D5] leading-normal">
                  Off-the-run coupon notes with &gt;18M maturity. Absorbs heavy dealer inventory overhang.
                </p>
                <div className="text-[9px] font-mono-data text-[#8292A6] pt-1 border-t border-[#B08D57]/20">
                  Target: 62 Eligible CUSIPs
                </div>
              </div>

              <div className="bg-black/50 border border-[#B08D57]/40 rounded-lg p-3 space-y-2 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-2 h-full bg-[#B08D57]" />
                <div className="flex items-center justify-between text-[11px] font-mono-data">
                  <span className="text-[#E5C794] font-bold">5Y – 10Y Benchmark</span>
                  <span className="text-[#B08D57] font-bold">35.0%</span>
                </div>
                <div className="text-lg font-bold text-[#FBF8F1] font-mono-data">${(interactivePaceB * 0.35).toFixed(2)}B / wk</div>
                <p className="text-[10px] text-[#BAC7D5] leading-normal">
                  Yield curve belly stabilization. Directly suppresses 10Y term premium (-14.2 bps).
                </p>
                <div className="text-[9px] font-mono-data text-[#8292A6] pt-1 border-t border-[#B08D57]/20">
                  Target: 48 Eligible CUSIPs
                </div>
              </div>

              <div className="bg-black/50 border border-[#B08D57]/30 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono-data">
                  <span className="text-[#E5C794] font-bold">10Y – 30Y Long</span>
                  <span className="text-[#38BDF8] font-bold">18.3%</span>
                </div>
                <div className="text-lg font-bold text-[#FBF8F1] font-mono-data">${(interactivePaceB * 0.183).toFixed(2)}B / wk</div>
                <p className="text-[10px] text-[#BAC7D5] leading-normal">
                  Duration extraction. Absorbs high-DV01 long bond risk during jittery 30Y auction cycles.
                </p>
                <div className="text-[9px] font-mono-data text-[#8292A6] pt-1 border-t border-[#B08D57]/20">
                  Target: 34 Eligible CUSIPs
                </div>
              </div>

              <div className="bg-black/50 border border-[#B08D57]/30 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono-data">
                  <span className="text-[#E5C794] font-bold">TIPS Real Yields</span>
                  <span className="text-[#F59E0B] font-bold">8.3%</span>
                </div>
                <div className="text-lg font-bold text-[#FBF8F1] font-mono-data">${(interactivePaceB * 0.0835).toFixed(2)}B / wk</div>
                <p className="text-[10px] text-[#BAC7D5] leading-normal">
                  Inflation breakeven market integrity. Prevents liquidity dislocations in index-linked paper.
                </p>
                <div className="text-[9px] font-mono-data text-[#8292A6] pt-1 border-t border-[#B08D57]/20">
                  Target: 19 Eligible CUSIPs
                </div>
              </div>

              <div className="bg-black/50 border border-[#B08D57]/30 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono-data">
                  <span className="text-[#E5C794] font-bold">Cash Management</span>
                  <span className="text-[#A855F7] font-bold">8.3%</span>
                </div>
                <div className="text-lg font-bold text-[#FBF8F1] font-mono-data">${(interactivePaceB * 0.0835).toFixed(2)}B / wk</div>
                <p className="text-[10px] text-[#BAC7D5] leading-normal">
                  Short-dated bills/notes (&lt;1Y). Optimizes Treasury General Account cash balancing.
                </p>
                <div className="text-[9px] font-mono-data text-[#8292A6] pt-1 border-t border-[#B08D57]/20">
                  Target: Dynamic Weekly
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: TRANSMISSION & QT INTERACTION */}
      {activeTab === "transmission" && (
        <div className="space-y-4">
          <div className="bg-[#141923] border border-[#B08D57]/30 rounded-xl p-5 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-[#FBF8F1] flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#B08D57]" />
              <span>Macro Transmission: Treasury Buybacks vs Federal Reserve QT</span>
            </h3>
            <p className="text-xs text-[#8292A6]">
              How the Treasury's $24 Billion monthly liquidity injection directly counter-balances the Federal Reserve's balance sheet runoff:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="bg-black/50 border border-red-500/30 rounded-lg p-4 space-y-2">
                <div className="text-xs font-mono-data font-bold text-red-400 uppercase">
                  Fed Quantitative Tightening (QT)
                </div>
                <div className="text-2xl font-bold text-red-300 font-mono-data">-$60.0B / mo</div>
                <p className="text-xs text-[#BAC7D5] leading-relaxed">
                  The Fed allows up to $25B in Treasuries and $35B in MBS to roll off its balance sheet monthly without reinvestment, extracting base money from the banking system.
                </p>
                <div className="text-[10px] font-mono-data text-red-400 bg-red-950/40 p-1.5 rounded">
                  DRAINING RESERVES &amp; EXPANDING TERM PREMIUM
                </div>
              </div>

              <div className="bg-black/50 border border-[#10B981]/30 rounded-lg p-4 space-y-2">
                <div className="text-xs font-mono-data font-bold text-[#10B981] uppercase">
                  Treasury Buyback Injection
                </div>
                <div className="text-2xl font-bold text-[#10B981] font-mono-data">+$24.0B / mo</div>
                <p className="text-xs text-[#BAC7D5] leading-relaxed">
                  At $6.0B per week, Treasury injects $24B in cash liquidity monthly directly into primary dealer accounts, buying back duration and off-the-run coupons.
                </p>
                <div className="text-[10px] font-mono-data text-[#10B981] bg-emerald-950/40 p-1.5 rounded">
                  INJECTING LIQUIDITY &amp; COMPRESSING TERM PREMIUM
                </div>
              </div>

              <div className="bg-black/50 border border-[#B08D57]/40 rounded-lg p-4 space-y-2">
                <div className="text-xs font-mono-data font-bold text-[#E5C794] uppercase">
                  Net Balance Sheet Drag
                </div>
                <div className="text-2xl font-bold text-[#E5C794] font-mono-data">-$36.0B / mo</div>
                <p className="text-xs text-[#BAC7D5] leading-relaxed">
                  The buyback program effectively neutralizes <strong>40.0%</strong> of the Fed's monetary contraction, mitigating what would otherwise be acute bond market indigestion.
                </p>
                <div className="text-[10px] font-mono-data text-[#E5C794] bg-[#B08D57]/15 p-1.5 rounded">
                  STEALTH FISCAL OFFSET TO MONETARY TIGHTENING
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: INTERACTIVE PACING SIMULATOR */}
      {activeTab === "tbac" && (
        <div className="space-y-4">
          <div className="bg-[#141923] border border-[#B08D57]/30 rounded-xl p-5 shadow-xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-[#FBF8F1] flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-[#B08D57]" />
                  <span>Treasury Buyback Pacing Stress Simulator</span>
                </h3>
                <p className="text-xs text-[#8292A6]">
                  Simulate the macro consequences if Treasury expands or contracts weekly buyback pacing ($2.0B to $12.0B/week)
                </p>
              </div>

              <div className="flex items-center gap-2 font-mono-data text-xs">
                <button
                  onClick={() => setInteractivePaceB(3.0)}
                  className={`px-2.5 py-1 rounded text-xs ${interactivePaceB === 3.0 ? "bg-[#B08D57] text-[#0E1A2B] font-bold" : "bg-black/40 text-[#8292A6] hover:text-[#EDE9DE]"}`}
                >
                  Baseline ($3B)
                </button>
                <button
                  onClick={() => setInteractivePaceB(6.0)}
                  className={`px-2.5 py-1 rounded text-xs ${interactivePaceB === 6.0 ? "bg-[#B08D57] text-[#0E1A2B] font-bold" : "bg-black/40 text-[#8292A6] hover:text-[#EDE9DE]"}`}
                >
                  Current Doubled ($6B)
                </button>
                <button
                  onClick={() => setInteractivePaceB(9.0)}
                  className={`px-2.5 py-1 rounded text-xs ${interactivePaceB === 9.0 ? "bg-[#B08D57] text-[#0E1A2B] font-bold" : "bg-black/40 text-[#8292A6] hover:text-[#EDE9DE]"}`}
                >
                  Crisis Ramp ($9B)
                </button>
              </div>
            </div>

            {/* Slider */}
            <div className="bg-black/40 p-4 rounded-lg border border-[#B08D57]/20 space-y-2">
              <div className="flex justify-between items-center text-xs font-mono-data">
                <span className="text-[#8292A6]">Weekly Operational Buyback Volume:</span>
                <span className="text-[#10B981] font-bold text-base">${interactivePaceB.toFixed(1)} Billion / week</span>
              </div>
              <input
                type="range"
                min="2.0"
                max="12.0"
                step="0.5"
                value={interactivePaceB}
                onChange={(e) => setInteractivePaceB(parseFloat(e.target.value))}
                className="w-full accent-[#B08D57] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#8292A6] font-mono-data">
                <span>$2.0B (Minimum)</span>
                <span>$6.0B (Current Doubled Level)</span>
                <span>$12.0B (Full Crisis Facility)</span>
              </div>
            </div>

            {/* Simulated Outputs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono-data">
              <div className="bg-black/50 p-3 rounded border border-[#B08D57]/20">
                <span className="text-[10px] text-[#8292A6] block uppercase">Monthly Injected Cash</span>
                <span className="text-[#10B981] font-bold text-base">${monthlyLiquidityB}B / mo</span>
                <span className="text-[9.5px] text-[#BAC7D5] block">${annualizedPaceB}B annualized</span>
              </div>

              <div className="bg-black/50 p-3 rounded border border-[#B08D57]/20">
                <span className="text-[10px] text-[#8292A6] block uppercase">Duration Extracted</span>
                <span className="text-[#38BDF8] font-bold text-base">-${dv01ExtractedM}M / bp</span>
                <span className="text-[9.5px] text-[#BAC7D5] block">Weekly dealer balance relief</span>
              </div>

              <div className="bg-black/50 p-3 rounded border border-[#B08D57]/20">
                <span className="text-[10px] text-[#8292A6] block uppercase">Term Premium Suppression</span>
                <span className="text-[#F59E0B] font-bold text-base">{termPremiumBps} bps</span>
                <span className="text-[9.5px] text-[#BAC7D5] block">Simulated 10Y yield drag</span>
              </div>

              <div className="bg-black/50 p-3 rounded border border-[#B08D57]/20">
                <span className="text-[10px] text-[#E5C794] font-bold text-base">{qtOffsetPct}%</span>
                <span className="text-[10px] text-[#8292A6] block uppercase">Fed QT Offset Rate</span>
                <span className="text-[9.5px] text-[#BAC7D5] block">Of Fed's $60B/mo runoff</span>
              </div>
            </div>

            {/* Broadcast & Future Decision Controls */}
            <div className="pt-3 border-t border-[#B08D57]/20 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleApplyDecision(interactivePaceB, `Treasury Pacing Shift to $${interactivePaceB.toFixed(1)}B/wk`, `Desk analyst model applied $${interactivePaceB.toFixed(1)}B weekly pacing.`)}
                  disabled={isSyncing}
                  className="px-3.5 py-2 rounded-lg bg-[#B08D57] hover:bg-[#C49B5D] text-[#0E1A2B] font-bold text-xs font-mono-data uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Landmark className="w-3.5 h-3.5" />
                  <span>Broadcast ${interactivePaceB.toFixed(1)}B/wk Decision to Dashboard</span>
                </button>
                <button
                  onClick={() => handleApplyDecision(6.0, "Reset to Official Doubled Baseline", "Restored to official $6.0B weekly baseline.")}
                  disabled={isSyncing || interactivePaceB === 6.0}
                  className="px-3 py-2 rounded-lg bg-black/50 hover:bg-black/80 text-[#8292A6] hover:text-[#EDE9DE] border border-[#2B3545] text-xs font-mono-data transition-all cursor-pointer"
                >
                  Reset Official ($6.0B)
                </button>
              </div>

              {decisionMessage && (
                <div className="text-xs font-mono-data text-emerald-400 font-bold flex items-center gap-1.5 bg-emerald-950/40 px-2.5 py-1 rounded border border-emerald-500/30">
                  <Check className="w-3.5 h-3.5" />
                  <span>{decisionMessage}</span>
                </div>
              )}

              <div className="text-[10px] font-mono-data text-[#8292A6] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>SYNCED: {lastSyncTime || "15:42 UTC"}</span>
              </div>
            </div>

            {/* Decisions History Log */}
            {apiData?.decisionsHistory && apiData.decisionsHistory.length > 0 && (
              <div className="pt-3 border-t border-[#B08D57]/15">
                <span className="text-[10px] font-mono-data text-[#8292A6] uppercase block mb-1.5">
                  Official Decision Milestones &amp; Scheduled Upgrades:
                </span>
                <div className="space-y-1.5">
                  {apiData.decisionsHistory.slice(0, 3).map((dec: any) => (
                    <div
                      key={dec.id}
                      className="p-2 rounded bg-black/40 border border-[#1E2738] flex items-center justify-between gap-3 text-[10px] font-mono-data"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-[#E5C794] font-bold">{dec.date}:</span>
                        <span className="text-[#EDE9DE] font-semibold">{dec.title}</span>
                        <span className="text-[#8292A6] hidden md:inline">• {dec.description}</span>
                      </div>
                      <span className="text-emerald-400 font-bold shrink-0 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-500/20">
                        {dec.pacing}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. SMC Strategy Playbook Directives */}
      <div className="bg-[#111722] border border-[#B08D57]/30 rounded-xl p-5 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono-data font-bold text-[#E5C794] uppercase">
            <Crosshair className="w-4 h-4 text-[#B08D57]" />
            <span>Interactive Strategy Directives for Sovereign Debt Intelligence</span>
          </div>
          <span className="text-[10px] font-mono-data text-[#8292A6]">CLICK TO VIEW PLAYBOOK</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            onClick={() => onOpenTerminalWithPrompt("Provide a detailed institutional breakdown of why the US Treasury doubled bond buybacks to $6B weekly and how it parallels the Bank of Japan's USD/JPY 160 defense")}
            className="p-3 bg-black/40 hover:bg-black/70 border border-[#B08D57]/20 hover:border-[#B08D57]/60 rounded-lg text-left transition-all group"
          >
            <div className="text-xs font-bold text-[#FBF8F1] group-hover:text-[#E5C794] flex items-center justify-between">
              <span>US Buybacks vs BoJ FX Defense</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#B08D57] opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-[10.5px] text-[#8292A6] mt-1 line-clamp-2">
              Deep dive on sovereign intervention mechanisms, yield curve limits, and foreign exchange defense.
            </p>
          </button>

          <button
            onClick={() => onOpenTerminalWithPrompt("Explain how primary dealer balance sheet capacity and Basel III SLR limits make US Treasury buybacks essential during 10Y and 30Y auctions")}
            className="p-3 bg-black/40 hover:bg-black/70 border border-[#B08D57]/20 hover:border-[#B08D57]/60 rounded-lg text-left transition-all group"
          >
            <div className="text-xs font-bold text-[#FBF8F1] group-hover:text-[#E5C794] flex items-center justify-between">
              <span>Primary Dealer Headroom & SLR</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#B08D57] opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-[10.5px] text-[#8292A6] mt-1 line-clamp-2">
              Why off-the-run Treasury inventory clogs dealer balance sheets and how buybacks extract DV01 duration.
            </p>
          </button>

          <button
            onClick={() => onOpenTerminalWithPrompt("Quantify the net market liquidity impact of $24B monthly Treasury buybacks against the Federal Reserve's ongoing Quantitative Tightening (QT)")}
            className="p-3 bg-black/40 hover:bg-black/70 border border-[#B08D57]/20 hover:border-[#B08D57]/60 rounded-lg text-left transition-all group"
          >
            <div className="text-xs font-bold text-[#FBF8F1] group-hover:text-[#E5C794] flex items-center justify-between">
              <span>Net Liquidity: Treasury vs Fed QT</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#B08D57] opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-[10.5px] text-[#8292A6] mt-1 line-clamp-2">
              Calculate the synthetic easing effect on risk assets and term premium compression.
            </p>
          </button>
        </div>
      </div>
    </div>
  );
};
