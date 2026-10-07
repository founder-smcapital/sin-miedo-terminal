import React from "react";
import {
  Newspaper,
  ShieldAlert,
  Radio,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  Tag,
  Crosshair,
  Clock,
  Sparkles,
  Flame,
  CheckCircle2,
  Maximize2,
  X
} from "lucide-react";
import {
  IranianEscalationEvent,
  iranianEscalationEvents
} from "../data/gprHistoricalData";

interface GeopoliticalContextDossierProps {
  selectedEventId: string;
  onSelectEvent: (event: IranianEscalationEvent) => void;
  onClose?: () => void;
  onJumpToChartMilestone?: (month: string) => void;
}

export const GeopoliticalContextDossier: React.FC<GeopoliticalContextDossierProps> = ({
  selectedEventId,
  onSelectEvent,
  onClose,
  onJumpToChartMilestone
}) => {
  const currentIndex = iranianEscalationEvents.findIndex(e => e.id === selectedEventId);
  const activeIndex = currentIndex >= 0 ? currentIndex : 6; // Default to War Outbreak (Feb '26)
  const activeEvent = iranianEscalationEvents[activeIndex];

  const handlePrev = () => {
    const prevIdx = activeIndex > 0 ? activeIndex - 1 : iranianEscalationEvents.length - 1;
    onSelectEvent(iranianEscalationEvents[prevIdx]);
    if (onJumpToChartMilestone) {
      onJumpToChartMilestone(iranianEscalationEvents[prevIdx].month);
    }
  };

  const handleNext = () => {
    const nextIdx = activeIndex < iranianEscalationEvents.length - 1 ? activeIndex + 1 : 0;
    onSelectEvent(iranianEscalationEvents[nextIdx]);
    if (onJumpToChartMilestone) {
      onJumpToChartMilestone(iranianEscalationEvents[nextIdx].month);
    }
  };

  const isWarEvent = activeEvent.phase !== "pre-war";

  return (
    <div
      id="geopolitical-context-dossier"
      className="mt-4 bg-gradient-to-b from-[#0B131F] via-[#080D16] to-[#05080E] border-2 border-[#A6291C]/60 rounded-xl p-3.5 sm:p-5 shadow-2xl relative overflow-hidden backdrop-blur-md transition-all animate-fadeIn"
    >
      {/* Background thematic glow */}
      <div className="absolute top-0 right-0 w-80 h-32 bg-[#FF4545]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-80 h-32 bg-[#38BDF8]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Dossier Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-3 border-b border-[#B08D57]/20 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#A6291C]/30 border border-[#FF4545]/60 flex items-center justify-center text-[#FF8585] shadow-md">
            <Newspaper className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[9.5px] font-mono-data font-bold uppercase tracking-widest text-[#FFA4A4] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#FF4545] animate-ping" />
                GEOPOLITICAL CONTEXT OVERLAY ACTIVE
              </span>
              <span className="text-[9px] font-mono-data text-[#8292A6] bg-black/60 px-2 py-0.5 rounded border border-white/10">
                11 Major Iranian Escalation Milestones
              </span>
            </div>
            <h4 className="text-sm sm:text-base font-serif font-bold text-[#FBF8F1] tracking-tight flex items-center gap-2 mt-0.5">
              <span>Iranian Escalation Wire & Intelligence Dossier</span>
            </h4>
          </div>
        </div>

        {/* Carousel Prev/Next & Close */}
        <div className="flex items-center gap-1.5">
          <button
            id="geo-prev-event"
            onClick={handlePrev}
            title="Previous Escalation Event"
            className="p-1.5 rounded bg-black/60 hover:bg-[#B08D57]/20 border border-[#B08D57]/30 text-[#EDE9DE] transition-all flex items-center gap-1 text-[10px] font-mono-data"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Prev</span>
          </button>
          <span className="text-[10px] font-mono-data text-[#8292A6] px-1">
            {activeIndex + 1} / {iranianEscalationEvents.length}
          </span>
          <button
            id="geo-next-event"
            onClick={handleNext}
            title="Next Escalation Event"
            className="p-1.5 rounded bg-black/60 hover:bg-[#B08D57]/20 border border-[#B08D57]/30 text-[#EDE9DE] transition-all flex items-center gap-1 text-[10px] font-mono-data"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          {onClose && (
            <button
              id="geo-close-overlay"
              onClick={onClose}
              title="Hide Geopolitical Context Overlay"
              className="p-1.5 ml-2 rounded bg-black/60 hover:bg-[#A6291C]/30 border border-[#A6291C]/40 text-[#FFA4A4] transition-all"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Historical Escalation Timeline Rail */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-[10px] font-mono-data text-[#8292A6] mb-1.5">
          <span className="uppercase tracking-wider flex items-center gap-1">
            <Clock className="w-3 h-3 text-[#E5A158]" />
            Select Historical Escalation Date to Inspect News Dispatch & Market Impact:
          </span>
          <span className="text-[#38BDF8] text-[9px]">
            Linked to Chart Coordinates
          </span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-[#B08D57]/30">
          {iranianEscalationEvents.map((evt, idx) => {
            const isSelected = evt.id === activeEvent.id;
            const isWar = evt.phase !== "pre-war";
            const isOutbreak = evt.month === "2026-02";

            return (
              <button
                key={evt.id}
                id={`btn-escalation-${evt.month}`}
                onClick={() => {
                  onSelectEvent(evt);
                  if (onJumpToChartMilestone) {
                    onJumpToChartMilestone(evt.month);
                  }
                }}
                className={`flex-shrink-0 px-2.5 py-1.5 rounded-lg border text-left font-mono-data transition-all text-[9.5px] ${
                  isSelected
                    ? "bg-[#A6291C] text-white border-[#FF8585] shadow-lg scale-105 ring-1 ring-[#FF8585]"
                    : isOutbreak
                    ? "bg-[#A6291C]/40 text-[#FFA4A4] border-[#FF4545]/70 hover:bg-[#A6291C]/60"
                    : isWar
                    ? "bg-black/70 text-[#FFA4A4] border-[#A6291C]/40 hover:border-[#FF4545]/60 hover:bg-[#A6291C]/20"
                    : "bg-black/60 text-[#BAC7D5] border-white/10 hover:text-white hover:border-[#B08D57]/50"
                }`}
              >
                <div className="flex items-center gap-1 font-bold">
                  <span>{evt.displayMonth}</span>
                  {isOutbreak && <span className="text-[8px] text-[#FF4545] animate-pulse">⚡</span>}
                </div>
                <div className="text-[8.5px] opacity-80 whitespace-nowrap">
                  GPR {evt.gprLevel}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main News Wire Dispatch Card */}
      <div className="bg-black/80 border border-[#B08D57]/40 rounded-xl p-3.5 sm:p-5 relative shadow-xl overflow-hidden">
        {/* Source, Timestamp & Dateline Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 mb-3 border-b border-[#B08D57]/20 text-[10px] font-mono-data">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2 py-0.5 rounded font-bold uppercase tracking-wider bg-[#38BDF8]/20 text-[#38BDF8] border border-[#38BDF8]/40 flex items-center gap-1">
              <Radio className="w-3 h-3 text-[#38BDF8] animate-pulse" />
              {activeEvent.source}
            </span>
            <span className="text-[#8292A6]">
              DATELINE: <strong className="text-[#EDE9DE]">{activeEvent.dateline}</strong>
            </span>
            <span className="text-[#8292A6]">
              • {activeEvent.exactDate} [{activeEvent.timestamp}]
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded font-bold text-[9px] uppercase tracking-wider ${
              activeEvent.severity === "CRITICAL"
                ? "bg-[#FF4545]/25 text-[#FF8585] border border-[#FF4545]/60"
                : "bg-[#EAB308]/25 text-[#FEF08A] border border-[#EAB308]/60"
            }`}>
              {activeEvent.severity} ESCALATION
            </span>

            {onJumpToChartMilestone && (
              <button
                onClick={() => onJumpToChartMilestone(activeEvent.month)}
                title="Focus this date on the GPR line chart"
                className="px-2 py-0.5 rounded text-[9px] bg-[#B08D57]/25 hover:bg-[#B08D57]/40 text-[#E5C794] border border-[#B08D57]/50 flex items-center gap-1 transition-all"
              >
                <Crosshair className="w-3 h-3 text-[#E5C794]" />
                <span>Show On Graph</span>
              </button>
            )}
          </div>
        </div>

        {/* Wire Headline */}
        <h3 className="text-sm sm:text-base md:text-lg font-serif font-bold text-[#FBF8F1] leading-snug tracking-tight mb-3">
          {activeEvent.headline}
        </h3>

        {/* News Snippet Wire Dispatch Body */}
        <div className="bg-[#0D1522]/90 border border-[#38BDF8]/20 rounded-lg p-3 sm:p-4 mb-3.5 relative shadow-inner">
          <div className="text-[10px] font-mono-data text-[#38BDF8] uppercase tracking-wider font-semibold mb-1 flex items-center gap-1">
            <Newspaper className="w-3 h-3" />
            <span>WIRE REPORT EXCERPT // DECLASSIFIED NEWS SNIPPET</span>
          </div>
          <p className="text-xs sm:text-sm text-[#EDE9DE] font-sans leading-relaxed tracking-normal">
            &ldquo;{activeEvent.newsSnippet}&rdquo;
          </p>
        </div>

        {/* Two-Column Deep Context: Strategic Significance & Market Transmission */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3 text-xs">
          {/* Strategic Significance */}
          <div className="bg-black/50 border border-[#B08D57]/25 rounded-lg p-3">
            <span className="text-[10px] font-mono-data text-[#E5C794] uppercase tracking-wider font-bold block mb-1 flex items-center gap-1">
              <ShieldAlert className="w-3 h-3 text-[#E5A158]" />
              Strategic Escalation Context
            </span>
            <p className="text-xs text-[#BAC7D5] font-sans leading-relaxed">
              {activeEvent.strategicSignificance}
            </p>
          </div>

          {/* Market & Transmission Assessment */}
          <div className="bg-black/50 border border-[#A6291C]/35 rounded-lg p-3">
            <span className="text-[10px] font-mono-data text-[#FFA4A4] uppercase tracking-wider font-bold block mb-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-[#FF8585]" />
              Asset & Insurance Transmission
            </span>
            <p className="text-xs text-[#BAC7D5] font-sans leading-relaxed">
              {activeEvent.marketImpactSummary}
            </p>
          </div>
        </div>

        {/* Quant Transmission Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 pt-3 border-t border-[#B08D57]/20 font-mono-data text-[10px]">
          <div className="bg-black/40 p-2 rounded border border-[#38BDF8]/30">
            <span className="text-[#8292A6] block text-[9px] uppercase">GPR Index Benchmark</span>
            <span className="text-[#38BDF8] text-sm font-bold">{activeEvent.gprLevel} pts</span>
            <span className="text-[8.5px] text-[#38BDF8]/80 block">{activeEvent.gprDelta}</span>
          </div>

          <div className="bg-black/40 p-2 rounded border border-[#EF4444]/30">
            <span className="text-[#8292A6] block text-[9px] uppercase">GPR Threats (GPRT)</span>
            <span className="text-[#FCA5A5] text-sm font-bold">{activeEvent.gprThreatsLevel} pts</span>
            <span className="text-[8.5px] text-[#8292A6] block">Threat Rhetoric</span>
          </div>

          <div className="bg-black/40 p-2 rounded border border-[#EAB308]/30">
            <span className="text-[#8292A6] block text-[9px] uppercase">GPR Acts (GPRA)</span>
            <span className="text-[#FEF08A] text-sm font-bold">{activeEvent.gprActsLevel} pts</span>
            <span className="text-[8.5px] text-[#8292A6] block">Realized Strikes</span>
          </div>

          <div className="bg-black/40 p-2 rounded border border-[#E5A158]/30">
            <span className="text-[#8292A6] block text-[9px] uppercase">Brent Spot Crude</span>
            <span className="text-[#E5A158] text-sm font-bold">${activeEvent.brentAtEvent.toFixed(2)}</span>
            <span className="text-[8.5px] text-[#8292A6] block">per barrel</span>
          </div>

          <div className="bg-black/40 p-2 rounded border border-[#B08D57]/30">
            <span className="text-[#8292A6] block text-[9px] uppercase">Gold Spot Safe-Haven</span>
            <span className="text-[#E5C794] text-sm font-bold">${activeEvent.goldAtEvent.toFixed(0)}</span>
            <span className="text-[8.5px] text-[#8292A6] block">per troy oz</span>
          </div>

          <div className="bg-black/40 p-2 rounded border border-[#FF4545]/30">
            <span className="text-[#8292A6] block text-[9px] uppercase">War Risk Premium</span>
            <span className="text-[#FF8585] text-sm font-bold">+${activeEvent.warRiskAdder.toFixed(2)}</span>
            <span className="text-[8.5px] text-[#8292A6] block">embedded adder</span>
          </div>
        </div>

        {/* Tags Footnote */}
        <div className="flex items-center gap-1.5 flex-wrap mt-3 pt-2 text-[9px] font-mono-data text-[#8292A6]">
          <Tag className="w-3 h-3 text-[#B08D57]" />
          <span className="text-[#8292A6] uppercase">Intelligence Taxonomy:</span>
          {activeEvent.tags.map((tag) => (
            <span
              key={tag}
              className="bg-white/5 px-2 py-0.5 rounded text-[#BAC7D5] border border-white/5"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
