import React, { useState, useMemo } from "react";
import { MacroDataState, FlashAlert } from "../types";
import { apiFetch } from "../api";
import { WarRiskVolatilityChart } from "./WarRiskVolatilityChart";
import { 
  Radio, 
  AlertTriangle, 
  Activity, 
  Bell, 
  RefreshCw, 
  Zap, 
  ShieldAlert, 
  Cpu, 
  Filter, 
  Search, 
  Flame, 
  Anchor, 
  ExternalLink,
  CheckCircle2,
  Clock
} from "lucide-react";

interface PulseFeedViewProps {
  macroData: MacroDataState;
  onRefresh: () => void;
}

export const PulseFeedView: React.FC<PulseFeedViewProps> = ({
  macroData,
  onRefresh,
}) => {
  const [filterSeverity, setFilterSeverity] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isInjecting, setIsInjecting] = useState<boolean>(false);
  const [injectedNotification, setInjectedNotification] = useState<string | null>(null);
  const [, setTick] = useState<number>(0);

  // Periodic heartbeat tick to update relative elapsed times ('Just now', '1m ago') every 10 seconds
  React.useEffect(() => {
    const timer = setInterval(() => {
      setTick((t) => t + 1);
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  const rawAlerts = macroData.flashAlerts || [];

  // Filter alerts by severity, category, and search query
  const filteredAlerts = useMemo(() => {
    return rawAlerts.filter((alert) => {
      const matchSeverity = filterSeverity === "all" || alert.severity === filterSeverity;
      
      let matchCategory = true;
      if (filterCategory !== "all") {
        const cat = alert.category.toUpperCase();
        if (filterCategory === "kinetic") {
          matchCategory = cat.includes("KINETIC") || cat.includes("IRGC") || cat.includes("US-IRAN");
        } else if (filterCategory === "maritime") {
          matchCategory = cat.includes("HORMUZ") || cat.includes("MARITIME") || cat.includes("REROUTE") || cat.includes("CHOKEPOINT");
        } else if (filterCategory === "energy") {
          matchCategory = cat.includes("ENERGY") || cat.includes("BRENT") || cat.includes("OIL") || cat.includes("PIPELINE") || cat.includes("PETROLINE");
        } else if (filterCategory === "shadow") {
          matchCategory = cat.includes("SHADOW") || cat.includes("FLEET") || cat.includes("SAR");
        } else if (filterCategory === "macro") {
          matchCategory = cat.includes("BOJ") || cat.includes("PROP") || cat.includes("SYSTEM") || cat.includes("FX");
        }
      }

      let matchSearch = true;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        matchSearch = 
          alert.text.toLowerCase().includes(q) || 
          alert.category.toLowerCase().includes(q) || 
          alert.time.toLowerCase().includes(q);
      }

      return matchSeverity && matchCategory && matchSearch;
    });
  }, [rawAlerts, filterSeverity, filterCategory, searchQuery]);

  // Quick Ingest Breaking Intel button (simulates immediate breaking bulletin into live server)
  const handleSimulateBreakingStrikeAlert = async () => {
    try {
      setIsInjecting(true);
      const res = await apiFetch("/api/macro/pulse/inject-alert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: "US-IRAN KINETIC",
          text: "US 5th Fleet Tactical Update: Guided-missile destroyers intercept second swarm of Iranian fast-attack naval drones 12nm west of Musandam Peninsula; Strait of Hormuz advisory remains at Critical Red.",
          severity: "critical"
        })
      });
      if (res.ok) {
        setInjectedNotification("Breaking Strike bulletin ingested into live SSE stream!");
        setTimeout(() => setInjectedNotification(null), 4000);
        onRefresh();
      }
    } catch (err) {
      console.error("Failed to inject breaking alert:", err);
    } finally {
      setIsInjecting(false);
    }
  };

  const handleSimulatePipelineShutdownAlert = async () => {
    try {
      setIsInjecting(true);
      const res = await apiFetch("/api/macro/pulse/inject-alert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: "ENERGY / PIPELINE",
          text: "CRITICAL ALERT: Saudi Aramco confirms operational shutdown of 5.0M bpd East-West Petroline following Yemeni-Houthi drone swarm interdictions near Yanbu. Red Sea Hormuz bypass capacity is officially suspended.",
          severity: "critical"
        })
      });
      if (res.ok) {
        setInjectedNotification("Saudi East-West Petroline shutdown alert ingested!");
        setTimeout(() => setInjectedNotification(null), 4000);
        onRefresh();
      }
    } catch (err) {
      console.error("Failed to inject pipeline alert:", err);
    } finally {
      setIsInjecting(false);
    }
  };

  const chokepoints = macroData.engines.middleEastWarRisk.chokepoints || [];
  const hormuzChoke = chokepoints.find(c => c.name.toLowerCase().includes("hormuz"));
  const hormuzRisk = hormuzChoke ? hormuzChoke.riskScore : 88;

  return (
    <div id="pulse-feed-view-container" className="space-y-5 animate-in fade-in">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#1E293B]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-sm bg-[#0E1624] border border-[#1E293B] flex items-center justify-center relative">
            <Radio className="w-4 h-4 text-[#FF8585]" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#FF4545] rounded-none border border-black/50" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-swiss-display text-2xl sm:text-3xl font-bold text-[#FBF8F1] tracking-tight">
                SMC Macro Pulse &amp; Flash Signals
              </h1>
              <span className="text-[9px] font-mono-data font-bold bg-[#A6291C] text-[#EDE9DE] px-2 py-0.5 rounded-sm uppercase tracking-wider flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-none bg-white" />
                Live Sub-Second Stream
              </span>
              <span className="text-[9px] font-mono-data font-bold bg-emerald-950/70 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded-sm flex items-center gap-1" title="Zero week-old news • Strict 24h TTL gate active">
                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                Strict 24h Freshness Gate
              </span>
            </div>
            <p className="text-[10px] font-mono-data text-[#8292A6] mt-0.5">
              ACTIVE GEOPOLITICAL KINETIC STRIKES, CHOKEPOINT INTERDICTIONS &amp; INSTITUTIONAL FLOWS
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleSimulatePipelineShutdownAlert}
            disabled={isInjecting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-[#220707] text-[#FCA5A5] hover:bg-[#350A0A] border border-[#EF4444]/50 text-xs font-mono-data font-semibold transition-all cursor-pointer active:scale-95"
            title="Inject Saudi Petroline shutdown alert"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-[#EF4444]" />
            {isInjecting ? "Broadcasting..." : "Simulate Pipeline Shutdown"}
          </button>

          <button
            onClick={handleSimulateBreakingStrikeAlert}
            disabled={isInjecting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-[#220707] text-[#FFA4A4] hover:bg-[#350A0A] border border-[#A6291C]/50 text-xs font-mono-data font-semibold transition-all cursor-pointer active:scale-95"
            title="Inject simulated breaking maritime strike telemetry"
          >
            <Flame className="w-3.5 h-3.5 text-[#FF8585]" />
            {isInjecting ? "Broadcasting..." : "Simulate Strike"}
          </button>

          <button
            onClick={onRefresh}
            className="p-1.5 rounded-sm bg-[#0E1624] text-[#EDE9DE] hover:text-[#B08D57] border border-[#1E293B] hover:border-[#B08D57] transition-colors cursor-pointer"
            title="Force Instant Telemetry Resync"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {injectedNotification && (
        <div className="bg-[#10B981]/20 border border-[#10B981]/50 text-[#10B981] px-4 py-2 rounded-lg text-xs font-mono-data flex items-center justify-between animate-in fade-in slide-in-from-top-1">
          <span className="flex items-center gap-2 font-bold">
            <CheckCircle2 className="w-4 h-4" />
            {injectedNotification}
          </span>
          <span className="text-[10px] text-[#8292A6]">Live stream propagated</span>
        </div>
      )}

      {/* CRITICAL INCIDENT BANNER: US & IRAN STRIKES IN STRAIT OF HORMUZ */}
      <div className="bg-gradient-to-r from-[#200A0A] via-[#150A0A] to-[#0E131C] border border-[#A6291C]/60 rounded-xl p-4 sm:p-5 relative shadow-[0_0_30px_rgba(166,41,28,0.25)] overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#A6291C]/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative">
          <div className="space-y-1.5 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono-data font-bold">
              <span className="flex items-center gap-1.5 bg-[#A6291C] text-[#EDE9DE] px-2 py-0.5 rounded uppercase tracking-wider">
                <ShieldAlert className="w-3.5 h-3.5" />
                CRITICAL KINETIC FLASH // DEFCON 2
              </span>
              <span className="bg-black/50 text-[#FF8585] px-2 py-0.5 rounded border border-[#A6291C]/40">
                US & IRAN ESCALATION IN STRAIT OF HORMUZ
              </span>
              <span className="text-[#8292A6] flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Active Engagement Corridor
              </span>
            </div>

            <h2 className="text-base sm:text-lg font-bold text-[#FBF8F1] leading-snug">
              US Carrier Strike Group & CENTCOM Conduct Precision Standoff Strikes on IRGC Coastal Launch Arrays
            </h2>
            
            <p className="text-xs text-[#BAC7D5] leading-relaxed">
              Following retaliatory ballistic missile salvos and active electronic GPS spoofing across the Strait of Hormuz, maritime risk authorities have declared Critical Level 4. Over 18.2M bpd crude transit flows face emergency evasive holding patterns with Brent embedded war risk expanding to +$12.40/bbl.
            </p>
          </div>

          {/* Key Metrics Quick Pill Matrix */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-2 shrink-0 lg:w-60 font-mono-data text-xs">
            <div className="bg-black/60 p-2 rounded border border-[#A6291C]/40 flex items-center justify-between">
              <span className="text-[10px] text-[#8292A6]">Hormuz Risk:</span>
              <span className="font-bold text-[#FF8585]">{hormuzRisk}/100 [Defcon 2]</span>
            </div>
            <div className="bg-black/60 p-2 rounded border border-[#B08D57]/40 flex items-center justify-between">
              <span className="text-[10px] text-[#8292A6]">Brent War Adder:</span>
              <span className="font-bold text-[#E5C794]">+$12.40 / bbl</span>
            </div>
            <div className="bg-black/60 p-2 rounded border border-[#A6291C]/40 flex items-center justify-between col-span-2 sm:col-span-1">
              <span className="text-[10px] text-[#8292A6]">JWLA Surcharge:</span>
              <span className="font-bold text-[#FFA4A4]">+420 bps</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top 3 Live Radar Callouts (Dynamic Congruent Data) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Radar 1: US-Iran Kinetic Strikes & Hormuz */}
        <div className="bg-[#141923] border border-[#A6291C]/50 rounded-xl p-4 shadow-xl flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#A6291C]/10 rounded-full blur-2xl pointer-events-none" />
          <div>
            <div className="flex items-center justify-between text-xs font-mono-data text-[#FFA4A4] pb-2 border-b border-[#A6291C]/30 mb-2.5">
              <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider">
                <Flame className="w-3.5 h-3.5 text-[#FF4545] animate-pulse" />
                US-IRAN KINETIC RADAR
              </span>
              <span className="bg-[#A6291C]/30 px-1.5 py-0.5 rounded border border-[#A6291C]/50 text-[10px] font-bold">
                DEFCON 2
              </span>
            </div>
            <p className="text-xs text-[#EDE9DE]/95 leading-relaxed font-sans">
              CENTCOM Tomahawk & B-2 strikes target IRGC coastal anti-ship missile sites. Tehran confirms swift retaliatory ballistic salvos toward forward radar nodes; Hormuz exclusion zone drills active.
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-[#A6291C]/20 flex items-center justify-between text-[10px] font-mono-data text-[#8292A6]">
            <span>Chokepoint Status:</span>
            <span className="font-bold text-[#FFA4A4]">{macroData.engines.middleEastWarRisk.hormuzThreatLevel}</span>
          </div>
        </div>

        {/* Radar 2: Chokepoint Disruption & Energy Transmission */}
        <div className="bg-[#141923] border border-[#B08D57]/40 rounded-xl p-4 shadow-xl flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#B08D57]/10 rounded-full blur-2xl pointer-events-none" />
          <div>
            <div className="flex items-center justify-between text-xs font-mono-data text-[#E5C794] pb-2 border-b border-[#B08D57]/25 mb-2.5">
              <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider">
                <Anchor className="w-3.5 h-3.5 text-[#B08D57]" />
                CHOKEPOINT & CRUDE FLOWS
              </span>
              <span className="bg-[#B08D57]/20 px-1.5 py-0.5 rounded border border-[#B08D57]/40 text-[10px] font-bold">
                18.2M bpd At Risk
              </span>
            </div>
            <p className="text-xs text-[#EDE9DE]/95 leading-relaxed font-sans">
              UKMTO Emergency Advisory 042 detects active electronic GPS spoofing and secondary explosions 18nm off Fujairah. Commercial crude tankers executing emergency evasive diversions; Cape reroute holds at 74.8%.
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-[#B08D57]/20 flex items-center justify-between text-[10px] font-mono-data text-[#8292A6]">
            <span>War Risk Adder:</span>
            <span className="font-bold text-[#10B981]">{macroData.engines.middleEastWarRisk.brentGeopoliticalPremium} // +420 bps</span>
          </div>
        </div>

        {/* Radar 3: BoJ & Prop Desk Cross-Asset Spillover */}
        <div className="bg-[#141923] border border-[#B08D57]/25 rounded-xl p-4 shadow-xl flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#B08D57]/5 rounded-full blur-2xl pointer-events-none" />
          <div>
            <div className="flex items-center justify-between text-xs font-mono-data text-[#BAC7D5] pb-2 border-b border-[#B08D57]/20 mb-2.5">
              <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[#EDE9DE]">
                <Zap className="w-3.5 h-3.5 text-[#B08D57]" />
                MACRO DESK CROSS-ASSET
              </span>
              <span className="bg-black/50 px-1.5 py-0.5 rounded border border-white/10 text-[10px] font-mono-data">
                USD/JPY {macroData.engines.yenIntervention.spot}
              </span>
            </div>
            <p className="text-xs text-[#EDE9DE]/95 leading-relaxed font-sans">
              Quiet MoF dollar-selling execution absorbed post-intervention; safe-haven bids flow into Gold (+$42.50/oz haven bid) and oil calendar spreads. IBEX 35 defends 20,050 Pivot amid flight-to-quality.
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-[#B08D57]/15 flex items-center justify-between text-[10px] font-mono-data text-[#8292A6]">
            <span>MoF Intervention Odds:</span>
            <span className="font-bold text-[#E5C794]">{macroData.engines.yenIntervention.interventionOdds}% [Odds Collapsed]</span>
          </div>
        </div>
      </div>

      {/* 24-Hour Historical Volatility Chart for Middle East War-Risk Index */}
      <WarRiskVolatilityChart macroData={macroData} />

      {/* Stream of Live Flash Alerts */}
      <div className="bg-[#101520] border border-[#B08D57]/25 rounded-xl p-4 sm:p-6 shadow-2xl space-y-4">
        {/* Stream Header & Filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[#B08D57]/20">
          <div>
            <h3 className="font-serif italic text-xl font-semibold text-[#EDE9DE]" style={{ fontFamily: "Georgia, serif" }}>
              Live Institutional Telemetry Stream
            </h3>
            <span className="text-[10px] font-mono-data text-[#8292A6]">
              Real-time chronological events • {filteredAlerts.length} Active Bulletins
            </span>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative flex items-center">
              <Search className="w-3.5 h-3.5 text-[#8292A6] absolute left-2.5 pointer-events-none" />
              <input
                type="text"
                placeholder="Search alerts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-black/60 border border-[#B08D57]/25 rounded-lg pl-8 pr-2.5 py-1 text-xs font-mono-data text-[#EDE9DE] placeholder-[#8292A6] focus:outline-none focus:border-[#B08D57] w-36 sm:w-44"
              />
            </div>

            {/* Severity Filter */}
            <div className="flex items-center bg-black/50 p-0.5 rounded-lg border border-[#B08D57]/20 text-[11px] font-mono-data">
              {(["all", "critical", "high", "normal"] as const).map((sev) => (
                <button
                  key={sev}
                  onClick={() => setFilterSeverity(sev)}
                  className={`px-2 py-0.5 rounded capitalize transition-all ${
                    filterSeverity === sev
                      ? sev === "critical"
                        ? "bg-[#A6291C] text-[#EDE9DE] font-bold"
                        : "bg-[#B08D57] text-[#0E1A2B] font-bold"
                      : "text-[#8292A6] hover:text-[#EDE9DE]"
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>

            {/* Category Filter Pills */}
            <div className="hidden lg:flex items-center bg-black/50 p-0.5 rounded-lg border border-[#B08D57]/20 text-[10.5px] font-mono-data">
              {[
                { id: "all", label: "All Topics" },
                { id: "kinetic", label: "US-Iran Kinetic" },
                { id: "maritime", label: "Hormuz / Chokepoint" },
                { id: "energy", label: "Energy" },
                { id: "macro", label: "BoJ / FX" }
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setFilterCategory(cat.id)}
                  className={`px-2 py-0.5 rounded transition-all ${
                    filterCategory === cat.id
                      ? "bg-[#B08D57]/25 text-[#E5C794] font-bold border border-[#B08D57]/40"
                      : "text-[#8292A6] hover:text-[#EDE9DE]"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 24/7 Automated Ingestion Heartbeat Status Banner */}
        <div className="bg-black/40 border border-[#B08D57]/20 rounded-lg p-2.5 flex flex-wrap items-center justify-between gap-3 text-[10px] font-mono-data">
          <div className="flex items-center gap-2 text-[#EDE9DE]">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
            <span className="text-[#10B981] font-bold">24/7 AUTOMATED TELEMETRY ACTIVE</span>
            <span className="text-[#8292A6]">|</span>
            <span className="text-[#8292A6]">Autonomous 60s generation loop with zero-stale time recalibration</span>
          </div>
          <div className="flex items-center gap-3 text-[#8292A6]">
            <span>Channel: <strong className="text-[#EDE9DE]">SSE Sub-Second</strong></span>
            <span>Protocol: <strong className="text-[#B08D57]">SMC-STREAM-L2</strong></span>
            <span className="hidden sm:inline">Rolling Cache: <strong className="text-[#EDE9DE]">Active</strong></span>
          </div>
        </div>

        {/* Alert Cards List */}
        <div className="space-y-2.5">
          {filteredAlerts.length === 0 ? (
            <div className="text-center py-10 text-xs font-mono-data text-[#8292A6] border border-dashed border-[#B08D57]/20 rounded-lg">
              No telemetry events match your selected filters.
            </div>
          ) : (
            filteredAlerts.map((alert) => {
              const isCritical = alert.severity === "critical";
              const isHigh = alert.severity === "high";

              return (
                <div
                  key={alert.id}
                  className={`p-3.5 sm:p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 min-w-0 ${
                    isCritical
                      ? "bg-gradient-to-r from-[#200A0A]/90 to-[#120808]/90 border-[#A6291C]/60 shadow-[0_0_15px_rgba(166,41,28,0.12)]"
                      : isHigh
                      ? "bg-[#141923]/90 border-[#B08D57]/35"
                      : "bg-[#0D121B]/90 border-[#B08D57]/15"
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <span
                      className={`mt-0.5 p-1.5 rounded shrink-0 ${
                        isCritical
                          ? "bg-[#A6291C] text-[#EDE9DE] shadow-[0_0_8px_rgba(166,41,28,0.4)]"
                          : isHigh
                          ? "bg-[#B08D57]/20 text-[#B08D57] border border-[#B08D57]/30"
                          : "bg-black/50 text-[#8292A6] border border-white/5"
                      }`}
                    >
                      {isCritical ? (
                        <Flame className="w-3.5 h-3.5 text-[#FF8585] animate-pulse" />
                      ) : isHigh ? (
                        <AlertTriangle className="w-3.5 h-3.5 text-[#E5C794]" />
                      ) : (
                        <Bell className="w-3.5 h-3.5" />
                      )}
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono-data">
                        <span
                          className={`font-bold uppercase tracking-wider ${
                            isCritical
                              ? "text-[#FFA4A4]"
                              : isHigh
                              ? "text-[#E5C794]"
                              : "text-[#8292A6]"
                          }`}
                        >
                          [{alert.category}]
                        </span>
                        <span className="text-[#8292A6] flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          {alert.time}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-[#EDE9DE] mt-1 font-sans leading-relaxed break-words">
                        {alert.text}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-[9px] font-mono-data uppercase px-2.5 py-0.5 rounded self-start sm:self-center font-bold tracking-wider shrink-0 ${
                      isCritical
                        ? "bg-[#A6291C] text-[#EDE9DE] border border-[#FF4545]/40"
                        : isHigh
                        ? "bg-[#B08D57] text-[#0E1A2B]"
                        : "bg-black/60 text-[#8292A6] border border-[#B08D57]/20"
                    }`}
                  >
                    {alert.severity}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
