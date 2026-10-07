import React from "react";
import { ActiveTab, UserSession, Currency } from "../types";
import {
  Compass,
  FileText,
  Cpu,
  Activity,
  Radio,
  LifeBuoy,
  User,
  ShieldCheck,
  Crosshair,
  LogOut,
  Sparkles,
  ChevronDown
} from "lucide-react";

interface NavbarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  userSession: UserSession;
  onOpenAuthModal: () => void;
  onLogout: () => void;
  onOpenTerminal: () => void;
  currency?: Currency;
  onCurrencyChange?: (currency: Currency) => void;
  onOpenTierModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  userSession,
  onOpenAuthModal,
  onLogout,
  onOpenTerminal,
  currency = "USD",
  onCurrencyChange,
  onOpenTierModal
}) => {
  const currentTier = userSession.tier || "Founding Member";
  const isFounding = currentTier.includes("Founding");
  const isSovereign = currentTier.includes("Sovereign") || isFounding;
  const isInstitutional = currentTier.includes("Institutional") || isSovereign;

  const tierBadgeConfig = isFounding
    ? {
        border: "border-[#B08D57]/90 hover:border-[#B08D57]",
        bg: "bg-[#1E1911]/90",
        iconText: "text-[#B08D57]",
        label: "Founding Member",
        dot: "bg-[#B08D57]"
      }
    : isSovereign
    ? {
        border: "border-[#C084FC]/70 hover:border-[#C084FC]",
        bg: "bg-[#251833]/80",
        iconText: "text-[#C084FC]",
        label: "Tier III: Sovereign",
        dot: "bg-[#C084FC]"
      }
    : isInstitutional
    ? {
        border: "border-[#38BDF8]/70 hover:border-[#38BDF8]",
        bg: "bg-[#0E2033]/80",
        iconText: "text-[#38BDF8]",
        label: "Tier II: Institutional",
        dot: "bg-[#38BDF8]"
      }
    : {
        border: "border-[#64748B]/70 hover:border-[#94A3B8]",
        bg: "bg-[#111827]/90",
        iconText: "text-[#94A3B8]",
        label: "Tier I: Allocator",
        dot: "bg-[#94A3B8]"
      };
  return (
    <nav
      id="main-navigation-bar"
      className="w-full max-w-full bg-[#0E1A2B] border-b border-[#B08D57]/20 sticky top-0 z-40 px-4 sm:px-6 lg:px-8 py-2 sm:py-2.5 transition-all"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 sm:gap-4">
        {/* Left: Sin Miedo Capital Logo & Monogram */}
        <div
          id="smc-logo-container"
          onClick={() => onTabChange("dashboards")}
          className="flex items-center gap-2 sm:gap-2.5 lg:gap-3 cursor-pointer group select-none shrink-0"
        >
          {/* Circular Monogram Crest */}
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-[#B08D57] flex items-center justify-center text-xs sm:text-sm italic font-serif text-[#B08D57] bg-[#1A1D24] shadow-md group-hover:border-[#C9A46D] transition-colors shrink-0">
            S
          </div>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-base sm:text-lg lg:text-xl font-serif tracking-tight text-[#EDE9DE] group-hover:text-white transition-colors whitespace-nowrap" style={{ fontFamily: "Georgia, serif" }}>
                SIN MIEDO CAPITAL
              </span>
              <span className="hidden 2xl:inline-block text-[8.5px] font-mono-data uppercase bg-black text-[#B08D57] px-1.5 py-0.5 rounded border border-[#B08D57]/30">
                PORTAL v4.2
              </span>
            </div>
            <span className="text-[8px] 2xl:text-[9px] uppercase font-mono-data tracking-[0.1em] 2xl:tracking-[0.16em] text-[#8292A6] hidden 2xl:block truncate">
              MACRO FINANCE &amp; GEOPOLITICAL INTELLIGENCE
            </span>
          </div>
        </div>

        {/* Center: Primary Navigation Links (Displayed in top row on xl+ screens with proportional spacing) */}
        <div id="primary-nav-links" className="hidden xl:flex items-center gap-0.5 2xl:gap-1 bg-black/50 p-0.5 2xl:p-1 rounded-lg border border-[#B08D57]/20 shrink-0">
          <button
            id="nav-dashboards-btn"
            onClick={() => onTabChange("dashboards")}
            className={`px-2 2xl:px-2.5 py-1.5 rounded text-[10px] 2xl:text-[11px] uppercase tracking-[0.06em] 2xl:tracking-[0.1em] font-medium transition-all flex items-center gap-1 2xl:gap-1.5 whitespace-nowrap ${
              activeTab === "dashboards"
                ? "bg-[#B08D57] text-[#0E1A2B] font-bold shadow-sm"
                : "text-[#EDE9DE]/70 hover:text-[#B08D57] hover:bg-[#1A1D24]"
            }`}
          >
            <Compass className="w-3.5 h-3.5 shrink-0" />
            <span>Dashboards</span>
          </button>

          <button
            id="nav-intelligence-btn"
            onClick={() => onTabChange("intelligence")}
            className={`px-2 2xl:px-2.5 py-1.5 rounded text-[10px] 2xl:text-[11px] uppercase tracking-[0.06em] 2xl:tracking-[0.1em] font-medium transition-all flex items-center gap-1 2xl:gap-1.5 whitespace-nowrap ${
              activeTab === "intelligence"
                ? "bg-[#B08D57] text-[#0E1A2B] font-bold shadow-sm"
                : "text-[#EDE9DE]/70 hover:text-[#B08D57] hover:bg-[#1A1D24]"
            }`}
          >
            <FileText className="w-3.5 h-3.5 shrink-0" />
            <span>Intelligence</span>
          </button>

          {/* Pulse Live Tab with subtle signal dot */}
          <button
            id="nav-pulse-btn"
            onClick={() => onTabChange("pulse")}
            className={`px-2 2xl:px-2.5 py-1.5 rounded text-[10px] 2xl:text-[11px] uppercase tracking-[0.06em] 2xl:tracking-[0.1em] font-medium transition-all flex items-center gap-1 2xl:gap-1.5 whitespace-nowrap relative ${
              activeTab === "pulse"
                ? "bg-[#A6291C] text-[#EDE9DE] font-bold shadow-sm"
                : "text-[#EDE9DE]/70 hover:text-[#B08D57] hover:bg-[#1A1D24]"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF8585] shrink-0 animate-pulse" />
            <Radio className="w-3.5 h-3.5 shrink-0" />
            <span>Pulse</span>
          </button>

          <button
            id="nav-futures-btn"
            onClick={() => onTabChange("futures")}
            className={`px-2 2xl:px-2.5 py-1.5 rounded text-[10px] 2xl:text-[11px] uppercase tracking-[0.06em] 2xl:tracking-[0.1em] font-medium transition-all flex items-center gap-1 2xl:gap-1.5 whitespace-nowrap ${
              activeTab === "futures"
                ? "bg-[#B08D57] text-[#0E1A2B] font-bold shadow-sm"
                : "text-[#EDE9DE]/70 hover:text-[#B08D57] hover:bg-[#1A1D24]"
            }`}
          >
            <Activity className="w-3.5 h-3.5 shrink-0" />
            <span>Futures</span>
          </button>

          <button
            id="nav-systems-btn"
            onClick={() => onTabChange("systems")}
            className={`px-2 2xl:px-2.5 py-1.5 rounded text-[10px] 2xl:text-[11px] uppercase tracking-[0.06em] 2xl:tracking-[0.1em] font-medium transition-all flex items-center gap-1 2xl:gap-1.5 whitespace-nowrap ${
              activeTab === "systems"
                ? "bg-[#B08D57] text-[#0E1A2B] font-bold shadow-sm"
                : "text-[#EDE9DE]/70 hover:text-[#B08D57] hover:bg-[#1A1D24]"
            }`}
          >
            <Cpu className="w-3.5 h-3.5 shrink-0" />
            <span>Systems</span>
          </button>

          <button
            id="nav-support-btn"
            onClick={() => onTabChange("support")}
            className={`px-2 2xl:px-2.5 py-1.5 rounded text-[10px] 2xl:text-[11px] uppercase tracking-[0.06em] 2xl:tracking-[0.1em] font-medium transition-all flex items-center gap-1 2xl:gap-1.5 whitespace-nowrap ${
              activeTab === "support"
                ? "bg-[#B08D57] text-[#0E1A2B] font-bold shadow-sm"
                : "text-[#EDE9DE]/70 hover:text-[#B08D57] hover:bg-[#1A1D24]"
            }`}
          >
            <LifeBuoy className="w-3.5 h-3.5 shrink-0" />
            <span>Support</span>
          </button>
        </div>

        {/* Right Actions: Currency Toggle, AI Terminal Trigger & Client Login / Account */}
        <div className="flex items-center gap-1.5 sm:gap-2 xl:gap-2.5 shrink-0 ml-auto xl:ml-0">
          {/* Interchangeable Currency Toggle Pill: $ USD / € EUR */}
          {onCurrencyChange && (
            <div
              id="navbar-currency-toggle"
              className="flex items-center bg-black/60 rounded-lg p-0.5 border border-[#B08D57]/30 font-mono-data text-[10px] shrink-0"
              title="Interchangeable Currency: Switch between US Dollar ($) and Euro (€)"
            >
              <button
                id="currency-toggle-usd-btn"
                onClick={() => onCurrencyChange("USD")}
                className={`px-2 py-0.5 sm:py-1 rounded font-bold transition-all flex items-center gap-0.5 sm:gap-1 ${
                  currency === "USD"
                    ? "bg-[#B08D57] text-[#0A111C] shadow-sm"
                    : "text-[#8292A6] hover:text-[#EDE9DE]"
                }`}
              >
                <span>$</span>
                <span className="hidden 2xl:inline text-[9.5px]">USD</span>
              </button>
              <button
                id="currency-toggle-eur-btn"
                onClick={() => onCurrencyChange("EUR")}
                className={`px-2 py-0.5 sm:py-1 rounded font-bold transition-all flex items-center gap-0.5 sm:gap-1 ${
                  currency === "EUR"
                    ? "bg-[#B08D57] text-[#0A111C] shadow-sm"
                    : "text-[#8292A6] hover:text-[#EDE9DE]"
                }`}
              >
                <span>€</span>
                <span className="hidden 2xl:inline text-[9.5px]">EUR</span>
              </button>
            </div>
          )}

          {/* SMC Strategy Desk & Takeaways Button */}
          <button
            id="open-terminal-header-btn"
            onClick={onOpenTerminal}
            className="hidden sm:flex items-center gap-1.5 text-[10px] uppercase tracking-wider bg-[#1A1D24] hover:bg-[#2A2E38] text-[#B08D57] px-2 sm:px-2.5 2xl:px-3 py-1 sm:py-1.5 rounded-lg border border-[#B08D57]/30 hover:border-[#B08D57] transition-all group font-mono-data shrink-0"
            title="Open SMC Strategy Desk & Macro Takeaways"
          >
            <Crosshair className="w-3.5 h-3.5 text-[#B08D57] group-hover:scale-110 transition-transform shrink-0" />
            <span className="hidden 2xl:inline">SMC Strategy</span>
            <span className="2xl:hidden">Strategy</span>
            <span className="text-[8.5px] bg-[#B08D57]/20 text-[#B08D57] px-1 py-0.2 rounded font-bold">
              DESK
            </span>
          </button>

          {/* Client Authentication Button / Authenticated Pill */}
          {userSession.isAuthenticated ? (
            <div id="authenticated-user-badge" className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {/* Interactive Tier Pill & Switcher Trigger */}
              <button
                id="tier-switcher-header-btn"
                onClick={onOpenTierModal}
                title="Switch Clearance Tier (Test Mode)"
                className={`flex items-center gap-1.5 sm:gap-2 ${tierBadgeConfig.bg} border ${tierBadgeConfig.border} px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg text-xs shadow-sm shrink-0 transition-all hover:brightness-125 cursor-pointer text-left group`}
              >
                <ShieldCheck className={`w-3.5 h-3.5 ${tierBadgeConfig.iconText} shrink-0 group-hover:scale-110 transition-transform`} />
                <div className="flex flex-col text-left min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] sm:text-[11px] font-bold text-[#EDE9DE] leading-tight font-serif italic whitespace-nowrap truncate">
                      {tierBadgeConfig.label}
                    </span>
                    <ChevronDown className="w-2.5 h-2.5 text-[#BAC7D5] opacity-70 group-hover:opacity-100" />
                  </div>
                  <span className="text-[8.5px] sm:text-[9px] text-[#8292A6] font-mono-data leading-none max-w-[80px] sm:max-w-[120px] truncate">
                    {userSession.email?.split('@')[0] || "member"} • <span className="text-[#E5C794] underline">switch</span>
                  </span>
                </div>
              </button>

              {/* Sign Out Button - Always visible, high contrast, shrink-proof */}
              <button
                id="user-logout-btn"
                onClick={onLogout}
                title={`Sign Out (${userSession.email})`}
                aria-label="Sign Out"
                className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg text-[#8292A6] hover:text-[#FF6B6B] hover:bg-[#A6291C]/20 border border-[#B08D57]/40 hover:border-[#FF6B6B]/70 transition-all shrink-0 flex items-center justify-center bg-[#131722] shadow-sm active:scale-95 group cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 group-hover:scale-110 transition-transform" />
              </button>
            </div>
          ) : (
            <button
              id="client-login-btn"
              onClick={onOpenAuthModal}
              className="flex items-center gap-1.5 bg-[#B08D57] hover:brightness-110 text-[#0E1A2B] font-bold text-[10px] sm:text-[11px] px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-lg uppercase tracking-wider transition-all active:scale-95 shadow-md shrink-0 whitespace-nowrap"
            >
              <User className="w-3.5 h-3.5 shrink-0" />
              <span>Client Login</span>
            </button>
          )}
        </div>
      </div>

      {/* Secondary navigation bar (displayed on screens below xl, giving both top row and navigation ample room) */}
      <div className="flex xl:hidden items-center justify-between sm:justify-center gap-1 sm:gap-2 mt-2 pt-2 border-t border-[#B08D57]/20 overflow-x-auto scrollbar-none text-xs">
        <button
          onClick={() => onTabChange("dashboards")}
          className={`px-2.5 py-1.5 rounded text-[10px] sm:text-[10.5px] uppercase tracking-wider shrink-0 font-medium flex items-center gap-1.5 transition-all ${
            activeTab === "dashboards" ? "bg-[#B08D57] text-[#0E1A2B] font-bold shadow-sm" : "text-[#8292A6] hover:text-[#EDE9DE] hover:bg-[#1A1D24]"
          }`}
        >
          <Compass className="w-3.5 h-3.5 shrink-0" />
          <span>Dashboards</span>
        </button>
        <button
          onClick={() => onTabChange("intelligence")}
          className={`px-2.5 py-1.5 rounded text-[10px] sm:text-[10.5px] uppercase tracking-wider shrink-0 font-medium flex items-center gap-1.5 transition-all ${
            activeTab === "intelligence" ? "bg-[#B08D57] text-[#0E1A2B] font-bold shadow-sm" : "text-[#8292A6] hover:text-[#EDE9DE] hover:bg-[#1A1D24]"
          }`}
        >
          <FileText className="w-3.5 h-3.5 shrink-0" />
          <span>Intelligence</span>
        </button>
        <button
          onClick={() => onTabChange("pulse")}
          className={`px-2.5 py-1.5 rounded text-[10px] sm:text-[10.5px] uppercase tracking-wider shrink-0 font-medium flex items-center gap-1.5 transition-all ${
            activeTab === "pulse" ? "bg-[#A6291C] text-[#EDE9DE] font-bold shadow-sm" : "text-[#8292A6] hover:text-[#EDE9DE] hover:bg-[#1A1D24]"
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#FF8585] shrink-0 animate-pulse" />
          <Radio className="w-3.5 h-3.5 shrink-0" />
          <span>Pulse</span>
        </button>
        <button
          onClick={() => onTabChange("futures")}
          className={`px-2.5 py-1.5 rounded text-[10px] sm:text-[10.5px] uppercase tracking-wider shrink-0 font-medium flex items-center gap-1.5 transition-all ${
            activeTab === "futures" ? "bg-[#B08D57] text-[#0E1A2B] font-bold shadow-sm" : "text-[#8292A6] hover:text-[#EDE9DE] hover:bg-[#1A1D24]"
          }`}
        >
          <Activity className="w-3.5 h-3.5 shrink-0" />
          <span>Futures</span>
        </button>
        <button
          onClick={() => onTabChange("systems")}
          className={`px-2.5 py-1.5 rounded text-[10px] sm:text-[10.5px] uppercase tracking-wider shrink-0 font-medium flex items-center gap-1.5 transition-all ${
            activeTab === "systems" ? "bg-[#B08D57] text-[#0E1A2B] font-bold shadow-sm" : "text-[#8292A6] hover:text-[#EDE9DE] hover:bg-[#1A1D24]"
          }`}
        >
          <Cpu className="w-3.5 h-3.5 shrink-0" />
          <span>Systems</span>
        </button>
        <button
          onClick={() => onTabChange("support")}
          className={`px-2.5 py-1.5 rounded text-[10px] sm:text-[10.5px] uppercase tracking-wider shrink-0 font-medium flex items-center gap-1.5 transition-all ${
            activeTab === "support" ? "bg-[#B08D57] text-[#0E1A2B] font-bold shadow-sm" : "text-[#8292A6] hover:text-[#EDE9DE] hover:bg-[#1A1D24]"
          }`}
        >
          <LifeBuoy className="w-3.5 h-3.5 shrink-0" />
          <span>Support</span>
        </button>
      </div>
    </nav>
  );
};
