import React, { useState } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface ChokepointRiskSparklineProps {
  data: number[];
  chokepointName?: string;
  variant?: "detailed" | "compact";
  height?: number;
  threatLevel?: "CRITICAL RED" | "HIGH ELEVATED" | "MEDIUM WATCH" | "STABLE FLOW";
}

export const ChokepointRiskSparkline: React.FC<ChokepointRiskSparklineProps> = ({
  data,
  chokepointName,
  variant = "detailed",
  height = 54,
  threatLevel,
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Safety fallback if data is empty or invalid
  const points = data && data.length >= 2 ? data : [50, 52, 53, 54, 55, 56, 57];
  const startVal = points[0];
  const currentVal = points[points.length - 1];
  const delta = currentVal - startVal;
  const isEscalating = delta > 0;
  const isEasing = delta < 0;

  // Determine stroke color based on current risk score and threat level
  const getStrokeColor = (val: number) => {
    if (val >= 85) return "#EF4444"; // Red
    if (val >= 70) return "#F97316"; // Amber-Orange
    if (val >= 50) return "#EAB308"; // Yellow-Gold
    return "#10B981"; // Emerald Green
  };

  const strokeColor = getStrokeColor(currentVal);
  const startColor = getStrokeColor(startVal);

  // Min and max with bounds padding so flat or tight ranges still render elegantly
  const minVal = Math.min(...points);
  const maxVal = Math.max(...points);
  const paddingY = Math.max(4, (maxVal - minVal) * 0.25);
  const plotMin = Math.max(0, minVal - paddingY);
  const plotMax = Math.min(100, maxVal + paddingY);
  const rangeY = plotMax - plotMin || 1;

  // Coordinate mapping for SVG
  const width = variant === "detailed" ? 300 : 76;
  const h = variant === "detailed" ? height : 20;
  const padX = variant === "detailed" ? 8 : 4;
  const padTop = variant === "detailed" ? 6 : 3;
  const padBottom = variant === "detailed" ? 6 : 3;
  const usableHeight = h - padTop - padBottom;
  const usableWidth = width - padX * 2;

  const coords = points.map((val, i) => {
    const x = padX + (i / (points.length - 1)) * usableWidth;
    const y = padTop + usableHeight - ((val - plotMin) / rangeY) * usableHeight;
    return { x, y, val };
  });

  // SVG path generation
  const linePath = coords.reduce((acc, pt, i) => {
    return i === 0 ? `M ${pt.x},${pt.y}` : `${acc} L ${pt.x},${pt.y}`;
  }, "");

  const areaPath = `${linePath} L ${coords[coords.length - 1].x},${h} L ${coords[0].x},${h} Z`;

  // Unique ID for SVG gradients to prevent clash
  const gradId = `spark-grad-${chokepointName ? chokepointName.replace(/\s+/g, "-").toLowerCase() : "cp"}-${variant}`;

  // Day labels for 7-day progression
  const dayLabels = ["T-6", "T-5", "T-4", "T-3", "T-2", "T-1", "Today"];

  if (variant === "compact") {
    return (
      <div className="flex items-center justify-between gap-1.5 w-full">
        {/* Mini SVG Sparkline */}
        <div className="relative flex-1" style={{ height: `${h}px` }}>
          <svg
            viewBox={`0 0 ${width} ${h}`}
            className="w-full h-full overflow-visible"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={strokeColor} stopOpacity={0.4} />
                <stop offset="100%" stopColor={strokeColor} stopOpacity={0.0} />
              </linearGradient>
            </defs>
            {/* Area Fill */}
            <path d={areaPath} fill={`url(#${gradId})`} />
            {/* Line */}
            <path
              d={linePath}
              fill="none"
              stroke={strokeColor}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Current Day Point */}
            <circle
              cx={coords[coords.length - 1].x}
              cy={coords[coords.length - 1].y}
              r="2.2"
              fill={strokeColor}
              className="animate-pulse"
            />
          </svg>
        </div>

        {/* 7D Delta pill */}
        <div
          className={`flex items-center text-[8px] font-bold font-mono-data px-1 py-0.5 rounded leading-none shrink-0 ${
            isEscalating
              ? "bg-[#EF4444]/20 text-[#F87171] border border-[#EF4444]/40"
              : isEasing
              ? "bg-[#10B981]/20 text-[#34D399] border border-[#10B981]/40"
              : "bg-[#B08D57]/20 text-[#E5C794] border border-[#B08D57]/40"
          }`}
          title={`7-Day Trajectory: ${startVal} → ${currentVal} (${delta >= 0 ? "+" : ""}${delta} pts)`}
        >
          {isEscalating ? (
            <TrendingUp className="w-2.5 h-2.5 mr-0.5" />
          ) : isEasing ? (
            <TrendingDown className="w-2.5 h-2.5 mr-0.5" />
          ) : (
            <Minus className="w-2.5 h-2.5 mr-0.5" />
          )}
          <span>
            {delta > 0 ? `+${delta}` : delta}
          </span>
        </div>
      </div>
    );
  }

  // Detailed Variant (for the Selected Chokepoint Dossier Card)
  return (
    <div className="bg-black/50 p-2.5 rounded-lg border border-[#B08D57]/20 space-y-2">
      {/* Header with trajectory badge & metric delta */}
      <div className="flex items-center justify-between text-[10px]">
        <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[#EDE9DE]">
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: strokeColor }} />
          <span>7-Day Threat Trajectory</span>
        </div>

        {/* Trajectory Badge */}
        <div className="flex items-center gap-2">
          <div className="text-[9px] text-[#8292A6]">
            <span>{startVal}</span>
            <span className="mx-1">→</span>
            <span className="font-bold text-[#EDE9DE]">{currentVal}</span>
          </div>

          <div
            className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded font-mono-data font-bold text-[9px] ${
              isEscalating
                ? "bg-[#EF4444]/20 text-[#F87171] border border-[#EF4444]/40"
                : isEasing
                ? "bg-[#10B981]/20 text-[#34D399] border border-[#10B981]/40"
                : "bg-[#B08D57]/20 text-[#E5C794] border border-[#B08D57]/40"
            }`}
          >
            {isEscalating ? (
              <>
                <TrendingUp className="w-3 h-3" />
                <span>+{delta} pts Escalating</span>
              </>
            ) : isEasing ? (
              <>
                <TrendingDown className="w-3 h-3" />
                <span>{delta} pts Easing</span>
              </>
            ) : (
              <>
                <Minus className="w-3 h-3" />
                <span>0 pts Stable</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* SVG Canvas Area */}
      <div
        className="relative w-full bg-[#080E18] rounded border border-white/5 px-2 pt-1 pb-1"
        style={{ height: `${height}px` }}
      >
        <svg
          viewBox={`0 0 ${width} ${h}`}
          className="w-full h-full overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={strokeColor} stopOpacity={0.45} />
              <stop offset="60%" stopColor={strokeColor} stopOpacity={0.12} />
              <stop offset="100%" stopColor={strokeColor} stopOpacity={0.0} />
            </linearGradient>
            <filter id={`glow-${gradId}`} x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="1.5" floodColor={strokeColor} floodOpacity="0.6" />
            </filter>
          </defs>

          {/* Reference Horizontal Lines (Min/Max subtle dashes) */}
          <line
            x1={padX}
            y1={padTop}
            x2={width - padX}
            y2={padTop}
            stroke="#2A384C"
            strokeDasharray="2 3"
            strokeWidth="0.8"
          />
          <line
            x1={padX}
            y1={h - padBottom}
            x2={width - padX}
            y2={h - padBottom}
            stroke="#2A384C"
            strokeDasharray="2 3"
            strokeWidth="0.8"
          />

          {/* Area Fill */}
          <path d={areaPath} fill={`url(#${gradId})`} />

          {/* Line Path */}
          <path
            d={linePath}
            fill="none"
            stroke={strokeColor}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter={`url(#glow-${gradId})`}
          />

          {/* Data Points on Line */}
          {coords.map((pt, i) => {
            const isLast = i === coords.length - 1;
            const isHovered = hoveredIdx === i;
            return (
              <g key={i} className="cursor-pointer" onMouseEnter={() => setHoveredIdx(i)} onMouseLeave={() => setHoveredIdx(null)}>
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isLast ? 3.5 : isHovered ? 3.5 : 2}
                  fill={isLast ? strokeColor : isHovered ? "#EDE9DE" : strokeColor}
                  stroke="#080E18"
                  strokeWidth="1.2"
                  className={isLast ? "animate-pulse" : ""}
                />
                {/* Hit target for hover */}
                <circle cx={pt.x} cy={pt.y} r="8" fill="transparent" />
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip or Min/Max overlay */}
        {hoveredIdx !== null ? (
          <div
            className="absolute top-1 transform -translate-x-1/2 bg-[#0D1522] border border-[#B08D57] px-2 py-0.5 rounded text-[9px] text-[#EDE9DE] font-bold shadow-xl pointer-events-none z-10 whitespace-nowrap"
            style={{
              left: `${(coords[hoveredIdx].x / width) * 100}%`,
            }}
          >
            {dayLabels[hoveredIdx]}: <span style={{ color: strokeColor }}>{coords[hoveredIdx].val} pts</span>
          </div>
        ) : null}
      </div>

      {/* 7-Day Horizontal Axis Labels & Progression Details */}
      <div className="flex items-center justify-between text-[8px] text-[#8292A6] px-1 font-mono-data">
        {dayLabels.map((lbl, i) => {
          const isToday = i === dayLabels.length - 1;
          const isHovered = hoveredIdx === i;
          return (
            <button
              key={lbl}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
              className={`text-center transition-colors ${
                isHovered
                  ? "text-[#EDE9DE] font-bold"
                  : isToday
                  ? "text-[#E5C794] font-bold"
                  : "text-[#627284]"
              }`}
            >
              <div>{lbl}</div>
              <div className="font-bold text-[8px]" style={{ color: isToday ? strokeColor : undefined }}>
                {points[i]}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
