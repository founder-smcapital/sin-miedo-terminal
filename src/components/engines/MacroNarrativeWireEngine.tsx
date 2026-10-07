import React, { useState, useEffect, useMemo } from "react";
import { MacroNarrativeItem } from "../../types";
import { initialMacroNarrativeWire } from "../../data/macroNarrativeData";
import {
  Building2,
  Landmark,
  FileSpreadsheet,
  LineChart,
  Flame,
  Radio,
  RefreshCw,
  Search,
  ExternalLink,
  Crosshair,
  ShieldCheck,
  Clock,
  Layers,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  TrendingDown,
  Minus,
  Anchor,
  Activity
} from "lucide-react";

interface MacroNarrativeWireEngineProps {
  onOpenTerminalWithPrompt: (prompt: string) => void;
}

export const MacroNarrativeWireEngine: React.FC<MacroNarrativeWireEngineProps> = ({
  onOpenTerminalWithPrompt
}) => {
  const [items, setItems] = useState<MacroNarrativeItem[]>(initialMacroNarrativeWire);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>("Just now");

  const syncWire = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch("/api/intelligence/macro-narrative-wire");
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json.liveCentralBankItems) && json.liveCentralBankItems.length > 0) {
          // Merge live central bank RSS items with curated baseline dispatches
          const merged = [...json.liveCentralBankItems, ...initialMacroNarrativeWire];
          // Deduplicate by headline
          const seen = new Set<string>();
          const deduped: MacroNarrativeItem[] = [];
          for (const it of merged) {
            const k = it.headline.toLowerCase().slice(0, 45);
            if (!seen.has(k)) {
              seen.add(k);
              deduped.push(it);
            }
          }
          setItems(deduped);
          setLastSyncTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }) + " UTC");
        }
      }
    } catch (err) {
      console.warn("Could not sync live macro narrative wire:", err);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    syncWire();
    const interval = setInterval(syncWire, 60000);
    return () => clearInterval(interval);
  }, []);

  const categories = [
    { id: "all", label: "All Narrative Feeds", icon: Radio, count: items.length },
    { id: "central_banks", label: "Central Banks (Fed · BoJ · ECB · BoE · PBoC · BIS)", icon: Building2, count: items.filter(i => i.category === "central_banks").length },
    { id: "sovereign_debt", label: "Sovereign Debt & IMF (Treasury QRA · GFSR · OFR)", icon: Landmark, count: items.filter(i => i.category === "sovereign_debt").length },
    { id: "sanctions_chokepoints", label: "Sanctions & Maritime Chokepoints (OFAC · UKMTO · CENTCOM)", icon: Anchor, count: items.filter(i => i.category === "sanctions_chokepoints").length },
    { id: "positioning_flows", label: "Positioning & Spec Flows (CFTC COT · CTAs)", icon: Activity, count: items.filter(i => i.category === "positioning_flows").length },
    { id: "geopolitics_energy", label: "Energy & Physical Commodities (EIA · OPEC+ · IEA)", icon: Flame, count: items.filter(i => i.category === "geopolitics_energy").length },
    { id: "primary_macro", label: "Primary Prints (BLS CPI · Payrolls · SEC)", icon: FileSpreadsheet, count: items.filter(i => i.category === "primary_macro").length },
    { id: "wall_street_strats", label: "Wall Street Desks (GS · JPM · Bridgewater)", icon: LineChart, count: items.filter(i => i.category === "wall_street_strats").length }
  ];

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchCat = selectedCategory === "all" || item.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        q === "" ||
        item.headline.toLowerCase().includes(q) ||
        item.source.toLowerCase().includes(q) ||
        item.sourceAcronym.toLowerCase().includes(q) ||
        item.summary.toLowerCase().includes(q) ||
        item.affectedAssets.some(a => a.ticker.toLowerCase().includes(q));
      return matchCat && matchSearch;
    });
  }, [items, selectedCategory, searchQuery]);

  return (
    <div className="space-y-5 animate-in fade-in">
      {/* Header Panel */}
      <div className="bg-[#141923] border border-[#B08D57]/25 rounded-xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#B08D57]/15">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="p-1 rounded bg-[#B08D57]/20 text-[#E5C794] border border-[#B08D57]/30">
                <Radio className="w-3.5 h-3.5 text-[#10B981] animate-pulse" />
              </span>
              <span className="text-[10px] font-mono font-bold text-[#E5C794] tracking-widest uppercase">
                PRIMARY MACRO NARRATIVE &amp; INSTITUTIONAL DESK WIRE
              </span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#10B981]/15 text-[#34D399] border border-[#10B981]/30 font-mono">
                14 DIRECT INSTITUTIONAL PIPES
              </span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-950/40 text-blue-300 border border-blue-500/30 font-mono">
                50-USER CONCURRENCY SHIELD ACTIVE
              </span>
            </div>
            <h3 className="font-serif italic text-xl font-bold text-[#EDE9DE]" style={{ fontFamily: "Georgia, serif" }}>
              Global Central Bank Communiqués, Sovereign Debt, Sanctions &amp; Tier-1 Strategy Dispatches
            </h3>
            <p className="text-xs text-[#8292A6] mt-1 max-w-4xl">
              Real-time synthesis of direct regulatory, central bank, and primary intelligence pipes outside of mainstream media: Federal Reserve Board SOMA runoff, Bank of Japan Rinban operations, ECB Governing Council accounts, US Treasury QRA buybacks, IMF Global Financial Stability surveillance, Bank for International Settlements (BIS) FX swap tracking, US Treasury OFAC sanctions on shadow tanker fleets, UKMTO maritime incident telemetry, and CFTC Commitments of Traders (COT) institutional speculative positioning.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={syncWire}
              disabled={isSyncing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#B08D57]/15 hover:bg-[#B08D57]/25 text-[#E5C794] border border-[#B08D57]/40 hover:border-[#B08D57] transition-all text-xs font-mono font-bold uppercase disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin text-[#10B981]" : "text-[#B08D57]"}`} />
              <span>{isSyncing ? "Syncing Direct Wires..." : "Sync Macro Wire"}</span>
            </button>
          </div>
        </div>

        {/* Source Provider Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2 text-[9px] font-mono">
          <div className="bg-black/50 p-2 rounded border border-white/5 flex items-center justify-between">
            <span className="text-[#8292A6]">Federal Reserve</span>
            <span className="text-[#10B981] font-bold">✓ DIRECT SOMA</span>
          </div>
          <div className="bg-black/50 p-2 rounded border border-white/5 flex items-center justify-between">
            <span className="text-[#8292A6]">Bank of Japan</span>
            <span className="text-[#10B981] font-bold">✓ RINBAN OPS</span>
          </div>
          <div className="bg-black/50 p-2 rounded border border-white/5 flex items-center justify-between">
            <span className="text-[#8292A6]">European Central Bank</span>
            <span className="text-[#10B981] font-bold">✓ GOV COUNCIL</span>
          </div>
          <div className="bg-black/50 p-2 rounded border border-white/5 flex items-center justify-between">
            <span className="text-[#8292A6]">Bank of England</span>
            <span className="text-[#10B981] font-bold">✓ FPC / MPC</span>
          </div>
          <div className="bg-black/50 p-2 rounded border border-white/5 flex items-center justify-between">
            <span className="text-[#8292A6]">US EIA Energy</span>
            <span className="text-[#F59E0B] font-bold">✓ PRIMARY PETRO</span>
          </div>
          <div className="bg-black/50 p-2 rounded border border-white/5 flex items-center justify-between">
            <span className="text-[#8292A6]">IMF Surveillance</span>
            <span className="text-[#38BDF8] font-bold">✓ GFSR / EFF</span>
          </div>
          <div className="bg-black/50 p-2 rounded border border-white/5 flex items-center justify-between">
            <span className="text-[#8292A6]">BIS Basel Desk</span>
            <span className="text-[#A78BFA] font-bold">✓ FX SWAP BASIS</span>
          </div>
          <div className="bg-black/50 p-2 rounded border border-white/5 flex items-center justify-between">
            <span className="text-[#8292A6]">Treasury OFAC</span>
            <span className="text-red-400 font-bold">✓ SANCTIONS WIRE</span>
          </div>
          <div className="bg-black/50 p-2 rounded border border-white/5 flex items-center justify-between">
            <span className="text-[#8292A6]">UKMTO Maritime</span>
            <span className="text-rose-400 font-bold">✓ CHOKEPOINT NET</span>
          </div>
          <div className="bg-black/50 p-2 rounded border border-white/5 flex items-center justify-between">
            <span className="text-[#8292A6]">OPEC+ Vienna</span>
            <span className="text-[#10B981] font-bold">✓ JMMC QUOTAS</span>
          </div>
          <div className="bg-black/50 p-2 rounded border border-white/5 flex items-center justify-between">
            <span className="text-[#8292A6]">CFTC Spec Reports</span>
            <span className="text-[#34D399] font-bold">✓ COT POSITIONING</span>
          </div>
          <div className="bg-black/50 p-2 rounded border border-white/5 flex items-center justify-between">
            <span className="text-[#8292A6]">PBoC Operations</span>
            <span className="text-[#E5C794] font-bold">✓ MLF / RRR INJ</span>
          </div>
        </div>

        {/* Search & Category Filter Navigation */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 text-[#8292A6] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search narrative wire (e.g., BoJ, OFAC, IMF, COT, Buybacks, CPI, Hormuz)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/60 border border-[#B08D57]/30 rounded-lg pl-9 pr-3 py-1.5 text-xs text-[#EDE9DE] placeholder-[#8292A6]/60 focus:outline-none focus:border-[#B08D57] transition-colors"
            />
          </div>

          <div className="text-[10px] font-mono text-[#8292A6] self-center">
            Showing <strong className="text-[#EDE9DE]">{filteredItems.length}</strong> dispatches · Last synced: {lastSyncTime}
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {categories.map((c) => {
            const Icon = c.icon;
            const isSelected = selectedCategory === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                  isSelected
                    ? "bg-[#B08D57] text-[#0E1A2B] font-bold shadow-md shadow-[#B08D57]/20"
                    : "bg-black/40 text-[#8292A6] hover:text-[#EDE9DE] hover:bg-white/5 border border-white/5"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? "text-[#0E1A2B]" : "text-[#B08D57]"}`} />
                <span>{c.label}</span>
                <span className={`text-[9px] px-1.5 py-0.2 rounded font-normal ${isSelected ? "bg-black/30 text-white" : "bg-white/5 text-[#8292A6]"}`}>
                  {c.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dispatches Stream List */}
      <div className="space-y-3">
        {filteredItems.map((item) => {
          const isCritical = item.impactLevel === "CRITICAL";
          const isHigh = item.impactLevel === "HIGH";

          return (
            <div
              key={item.id}
              className={`bg-[#141923] border rounded-xl p-4 transition-all hover:border-[#B08D57]/60 space-y-3 shadow-lg ${
                isCritical
                  ? "border-red-500/30 bg-red-950/5"
                  : isHigh
                  ? "border-[#B08D57]/35 bg-black/40"
                  : "border-white/10 bg-black/30"
              }`}
            >
              {/* Item Top Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-[#B08D57]/20 text-[#E5C794] border border-[#B08D57]/40 text-[9px] font-mono font-bold uppercase tracking-wider">
                    {item.sourceAcronym}
                  </span>

                  <span className="text-[10px] text-[#8292A6] font-mono flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#8292A6]" />
                    {item.timestamp}
                  </span>

                  {item.isLiveDirect && (
                    <span className="px-1.5 py-0.2 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-500/30 text-[8.5px] font-mono font-bold uppercase flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      LIVE FEED DIRECT
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-[8.5px] px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider ${
                      isCritical
                        ? "bg-red-500/20 text-red-300 border border-red-500/40"
                        : isHigh
                        ? "bg-[#B08D57]/20 text-[#E5C794] border border-[#B08D57]/40"
                        : "bg-white/5 text-[#BAC7D5] border border-white/10"
                    }`}
                  >
                    {item.impactLevel} IMPACT
                  </span>

                  <span className="text-[8.5px] px-2 py-0.5 rounded bg-black/60 text-[#8292A6] border border-white/5 font-mono">
                    {item.wireType}
                  </span>
                </div>
              </div>

              {/* Headline */}
              <h4 className="text-sm font-semibold text-[#EDE9DE] tracking-tight leading-snug">
                {item.headline}
              </h4>

              {/* Summary */}
              <p className="text-xs text-[#BAC7D5] leading-relaxed font-sans bg-black/30 p-2.5 rounded border border-white/5">
                {item.summary}
              </p>

              {/* Affected Assets & Action Buttons */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-white/5">
                {/* Affected Assets Badges */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[9px] font-mono text-[#8292A6] uppercase mr-1">Asset Transmission:</span>
                  {item.affectedAssets.map((asset) => {
                    const isBull = asset.bias === "bullish";
                    const isBear = asset.bias === "bearish";
                    const Icon = isBull ? TrendingUp : isBear ? TrendingDown : Minus;

                    return (
                      <span
                        key={asset.ticker}
                        title={asset.rationale}
                        className={`inline-flex items-center gap-1 text-[9px] font-mono px-2 py-0.5 rounded border ${
                          isBull
                            ? "bg-emerald-950/50 text-emerald-300 border-emerald-500/30"
                            : isBear
                            ? "bg-red-950/50 text-red-300 border-red-500/30"
                            : "bg-black/50 text-[#BAC7D5] border-white/10"
                        }`}
                      >
                        <span className="font-bold">{asset.ticker}</span>
                        <Icon className="w-2.5 h-2.5" />
                        <span className="text-[8px] opacity-80 uppercase">{asset.bias}</span>
                      </span>
                    );
                  })}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                  {item.url && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[10px] font-mono text-[#8292A6] hover:text-[#EDE9DE] bg-black/40 hover:bg-black px-2 py-1 rounded border border-white/5 transition-colors"
                    >
                      <ExternalLink className="w-3 h-3 text-[#B08D57]" />
                      <span>Source Docs</span>
                    </a>
                  )}

                  <button
                    onClick={() =>
                      onOpenTerminalWithPrompt(
                        `Synthesize macro implications of this institutional dispatch: "${item.headline}". Affected assets: ${item.affectedAssets.map(a => `${a.ticker} (${a.bias})`).join(", ")}. Provide desk trading actions.`
                      )
                    }
                    className="inline-flex items-center gap-1 text-[10px] font-mono text-[#E5C794] hover:text-white bg-[#B08D57]/20 hover:bg-[#B08D57]/30 px-2.5 py-1 rounded border border-[#B08D57]/40 transition-colors"
                    title="Analyze Macro Strategy in Desk"
                  >
                    <Crosshair className="w-3 h-3 text-[#B08D57]" />
                    <span>Analyze Strategy</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredItems.length === 0 && (
          <div className="text-center py-12 bg-black/40 border border-white/5 rounded-xl space-y-2">
            <Radio className="w-8 h-8 text-[#8292A6]/40 mx-auto" />
            <p className="text-xs text-[#8292A6]">No narrative dispatches match the selected filter or search query.</p>
            <button
              onClick={() => {
                setSelectedCategory("all");
                setSearchQuery("");
              }}
              className="text-xs text-[#B08D57] hover:underline font-mono"
            >
              Reset filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
