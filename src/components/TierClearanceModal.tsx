import React, { useState } from "react";
import {
  X,
  Award,
  Building2,
  Sparkles,
  Check,
  Shield,
  ArrowRight,
  RefreshCw,
  Zap,
  Globe,
  Lock,
  Layers,
  FileDown
} from "lucide-react";
import { ClearanceTier, UserSession } from "../types";
import { TIER_PASSCODES } from "../firebase";

interface TierClearanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  userSession: UserSession;
  onSwitchTier: (tier: ClearanceTier) => Promise<void>;
}

export const TierClearanceModal: React.FC<TierClearanceModalProps> = ({
  isOpen,
  onClose,
  userSession,
  onSwitchTier,
}) => {
  const [switchingTo, setSwitchingTo] = useState<ClearanceTier | null>(null);

  if (!isOpen) return null;

  const currentTier = userSession.tier || "Founding Member";

  const handleSelect = async (tier: ClearanceTier) => {
    if (tier === currentTier) return;
    setSwitchingTo(tier);
    try {
      await onSwitchTier(tier);
    } finally {
      setSwitchingTo(null);
    }
  };

  const tiersConfig = [
    {
      id: "Founding Member" as ClearanceTier,
      badge: "LIFETIME ALL-ACCESS // EARLY ADOPTER",
      title: "Founding Member",
      subtitle: "15 Early Adopters & Lifetime Members",
      entitlementSummary: "Full Sovereign Advisory access under Founding credentials",
      color: "border-[#B08D57]/60 bg-[#B08D57]/10 text-[#E5C794]",
      accentColor: "#B08D57",
      btnClass: "bg-[#B08D57] hover:bg-[#C9A46D] text-[#0A111C]",
      icon: Award,
      features: [
        { text: "Full Sovereign Advisory (Tier III) all-access clearance", highlight: true },
        { text: "Engine 1: US-Yen BoJ Intervention Matrix & DEFCON triggers", highlight: false },
        { text: "Engine 2: Global Equities (IBEX 35, S&P 500, DAX 40, Nikkei 225) Prop Bias & Systems", highlight: false },
        { text: "Engine 3: Middle East War-Risk Radar & Maritime GIS", highlight: true },
        { text: "Engine 4: Iranian Oil Dark Fleet SAR Satellite AIS Radar", highlight: true },
        { text: "Sovereign Fiscal Fragility & Debt Servicing Velocity Radar", highlight: true },
        { text: "9×9 Cross-Asset Covariance & Volatility Surface", highlight: false },
        { text: "Institutional Research PDF Export Suite & Unlimited SMC AI", highlight: false }
      ]
    },
    {
      id: "Professional Allocator" as ClearanceTier,
      badge: "TIER I // PROFESSIONAL ALLOCATOR",
      title: "Professional Allocator",
      subtitle: "Prop Desks & Quantitative Allocators",
      entitlementSummary: "24H Global Equities, BoJ Yen Matrix & Global Index Prop Systems",
      color: "border-[#64748B]/60 bg-[#64748B]/10 text-[#CBD5E1]",
      accentColor: "#94A3B8",
      btnClass: "bg-[#64748B] hover:bg-[#94A3B8] text-[#0A111C]",
      icon: Shield,
      features: [
        { text: "24-Hour Macro Sparklines & Global Equities (KOSPI, Nikkei, DAX, S&P 500)", highlight: true },
        { text: "Engine 1: US-Yen BoJ Intervention Matrix & DEFCON triggers", highlight: false },
        { text: "Engine 2: Global Equities (IBEX 35, S&P 500, DAX 40, Nikkei 225) Prop Bias & Systems", highlight: false },
        { text: "Institutional Futures Overview & Live Order Book Depth (VWAP, Bid/Ask Walls)", highlight: false },
        { text: "Real-Time Macro Pulse Feed & Audio Alert Tickers", highlight: false },
        { text: "CSV / TSV Historical Market & OHLC Data Export", highlight: false },
        { text: "Middle East War-Risk Radar (Preview only)", highlight: false, locked: true },
        { text: "Dark Fleet AIS & Sovereign Fragility Deep Radars (Locked)", highlight: false, locked: true }
      ]
    },
    {
      id: "Institutional Desk" as ClearanceTier,
      badge: "TIER II // INSTITUTIONAL DESK",
      title: "Institutional Desk",
      subtitle: "Macro Hedge Funds & Energy CTAs",
      entitlementSummary: "War-Risk Maritime GIS, 9x9 Covariance & PDF Research Suite",
      color: "border-[#38BDF8]/60 bg-[#38BDF8]/10 text-[#7DD3FC]",
      accentColor: "#38BDF8",
      btnClass: "bg-[#38BDF8] hover:bg-[#7DD3FC] text-[#0A111C]",
      icon: Building2,
      popular: true,
      features: [
        { text: "Everything in Tier I (Professional Allocator)", highlight: true },
        { text: "Engine 3: Middle East War-Risk Radar & GPR 24M Index (Full GIS)", highlight: true },
        { text: "Strait of Hormuz & Red Sea Commercial Maritime Reroute metrics", highlight: true },
        { text: "Systems: 9×9 Cross-Asset Covariance & Volatility Surface", highlight: true },
        { text: "Intelligence: 1-Page Institutional Research PDF Export Suite", highlight: false },
        { text: "Full SMC Strategy Desk & Real-Time Macro Playbooks", highlight: false },
        { text: "Dark Fleet SAR Satellite Telemetry (Summary preview)", highlight: false, locked: true }
      ]
    },
    {
      id: "Sovereign Advisory" as ClearanceTier,
      badge: "TIER III // SOVEREIGN ADVISORY",
      title: "Sovereign Advisory",
      subtitle: "Central Banks, SWFs & Global Defense Desks",
      entitlementSummary: "Dark Fleet Satellite AIS, STS Hubs & Fiscal Fragility",
      color: "border-[#C084FC]/60 bg-[#C084FC]/10 text-[#E9D5FF]",
      accentColor: "#C084FC",
      btnClass: "bg-[#C084FC] hover:bg-[#D8B4FE] text-[#0A111C]",
      icon: Sparkles,
      features: [
        { text: "Everything in Tier I & Tier II (Allocator & Institutional)", highlight: true },
        { text: "Engine 4: Iranian Oil Dark Fleet SAR Satellite AIS Radar", highlight: true },
        { text: "Riau / Malacca STS Transshipment Tracking & Shadow Outflows", highlight: true },
        { text: "Sovereign Fiscal Fragility & Debt Servicing Velocity Radar", highlight: true },
        { text: "Central Bank Sovereign Intervention War-Room & Spread Signals", highlight: true },
        { text: "Direct Low-Latency WebSocket API Telemetry Feed", highlight: false },
        { text: "Dedicated Institutional Desk Support & SLA", highlight: false }
      ]
    }
  ];

  const isCurrent = (tierId: ClearanceTier) => {
    if (currentTier === tierId) return true;
    if (tierId === "Institutional Desk" && currentTier === "Institutional Alpha") return true;
    if (tierId === "Sovereign Advisory" && currentTier === "Sovereign Desk") return true;
    return false;
  };

  return (
    <div
      id="tier-clearance-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#070C14]/90 backdrop-blur-md animate-in fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="tier-clearance-modal-container"
        className="w-full max-w-7xl bg-[#0D131E] border border-[#B08D57]/40 rounded-2xl shadow-[0_0_60px_rgba(0,0,0,0.85)] p-5 sm:p-7 max-h-[94vh] overflow-y-auto relative"
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 mb-6 border-b border-[#B08D57]/25">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#B08D57]" />
              <span className="text-[10px] font-mono-data font-bold tracking-[0.2em] text-[#E5C794] uppercase">
                Terminal Access Tiering &amp; Internal Test Gateway
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif italic font-bold text-[#FBF8F1] tracking-tight">
              Institutional Clearance Tiers
            </h2>
            <p className="text-xs text-[#BAC7D5] font-mono-data">
              Currently testing as:{" "}
              <span className="text-[#EDE9DE] font-bold">{userSession.email || "tradeinmotions@gmail.com"}</span>
              {" — "}
              Switch between tiers to immediately inspect visual gating, engine telemetry, and reports.
            </p>
          </div>

          <button
            id="close-tier-clearance-modal-btn"
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 rounded-lg bg-black/40 text-[#8292A6] hover:text-[#EDE9DE] hover:bg-white/10 border border-[#B08D57]/30 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 4 Tier Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {tiersConfig.map((t) => {
            const Icon = t.icon;
            const active = isCurrent(t.id);
            const isSwitching = switchingTo === t.id;

            return (
              <div
                key={t.id}
                id={`tier-card-${t.id.toLowerCase().replace(/\s+/g, "-")}`}
                className={`rounded-xl border p-4 sm:p-5 flex flex-col justify-between transition-all relative ${
                  active
                    ? "bg-[#141C2B] border-[#B08D57] shadow-[0_0_25px_rgba(176,141,87,0.2)] ring-1 ring-[#B08D57]"
                    : "bg-[#0A101A] border-[#222C3D] hover:border-[#B08D57]/50"
                }`}
              >
                {/* Popular or Active Badge */}
                {active ? (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#B08D57] text-[#0A111C] font-mono-data font-bold text-[8.5px] uppercase px-3 py-0.5 rounded-full shadow-md tracking-wider flex items-center gap-1 whitespace-nowrap">
                    <Check className="w-3 h-3" />
                    <span>CURRENT ACTIVE CLEARANCE</span>
                  </div>
                ) : t.popular ? (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#38BDF8] text-[#0A111C] font-mono-data font-bold text-[8.5px] uppercase px-3 py-0.5 rounded-full shadow-md tracking-wider whitespace-nowrap">
                    RECOMMENDED DESK TIER
                  </div>
                ) : null}

                <div>
                  {/* Top Pill */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className={`text-[9px] font-mono-data font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${t.color}`}>
                      {t.badge}
                    </span>
                    <Icon className="w-4 h-4 text-[#BAC7D5] shrink-0" />
                  </div>

                  {/* Title & Subtitle */}
                  <h3 className="text-base sm:text-lg font-serif italic font-bold text-[#FBF8F1] leading-snug">
                    {t.title}
                  </h3>
                  <p className="text-[10.5px] text-[#8292A6] font-mono-data mt-0.5 min-h-[30px]">
                    {t.subtitle}
                  </p>

                  {/* Entitlement Scope Banner (No Pricing) */}
                  <div className="my-3 py-2 px-2.5 rounded-lg bg-[#070C14] border border-[#222C3D] flex flex-col gap-0.5">
                    <span className="text-[8.5px] uppercase font-mono-data text-[#8292A6] tracking-wider">Scope Clearance:</span>
                    <span className="text-[10.5px] font-mono-data text-[#EDE9DE] font-medium leading-relaxed">
                      {t.entitlementSummary}
                    </span>
                  </div>

                  {/* Feature Checklist */}
                  <div className="space-y-1.5 mt-3 pt-3 border-t border-[#222C3D]/60 text-xs">
                    <span className="text-[9.5px] uppercase font-mono-data tracking-wider text-[#8292A6]">
                      Tier Entitlements:
                    </span>
                    <ul className="space-y-2 mt-1.5">
                      {t.features.map((f, i) => (
                        <li key={i} className="flex items-start gap-1.5 leading-relaxed">
                          {f.locked ? (
                            <Lock className="w-3.5 h-3.5 text-[#5A687C] shrink-0 mt-0.5" />
                          ) : (
                            <Check className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${f.highlight ? "text-[#B08D57]" : "text-[#10B981]"}`} />
                          )}
                          <span
                            className={`text-[10.5px] font-mono-data ${
                              f.locked
                                ? "text-[#5A687C] line-through decoration-[#5A687C]/60"
                                : f.highlight
                                ? "text-[#EDE9DE] font-medium"
                                : "text-[#BAC7D5]"
                            }`}
                          >
                            {f.text}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Switch Action Button */}
                <div className="mt-5 pt-3.5 border-t border-[#222C3D]">
                  <button
                    id={`switch-to-tier-${t.id.toLowerCase().replace(/\s+/g, "-")}-btn`}
                    onClick={() => handleSelect(t.id)}
                    disabled={active || isSwitching}
                    className={`w-full py-2.5 px-3 rounded-lg font-mono-data text-xs uppercase font-bold tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 disabled:opacity-60 disabled:cursor-default ${
                      active
                        ? "bg-[#111724] border border-[#B08D57]/60 text-[#E5C794]"
                        : t.btnClass
                    }`}
                  >
                    {isSwitching ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Applying...</span>
                      </>
                    ) : active ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Active Clearance</span>
                      </>
                    ) : (
                      <>
                        <span className="truncate">Switch to {t.title}</span>
                        <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                      </>
                    )}
                  </button>
                  <p className="text-[9px] text-[#5A687C] font-mono-data text-center mt-1.5">
                    Passcode: {TIER_PASSCODES[t.id] || "SMC-FOUNDING-2026"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info strip */}
        <div className="mt-6 pt-4 border-t border-[#B08D57]/20 flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono-data text-[#8292A6]">
          <div className="flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-[#B08D57]" />
            <span>
              Real-time Firestore synchronization enabled. Switches persist across browser tabs and live reloads.
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-[#E5C794] hover:underline uppercase text-[10px] tracking-wider"
          >
            Return to Terminal
          </button>
        </div>
      </div>
    </div>
  );
};
