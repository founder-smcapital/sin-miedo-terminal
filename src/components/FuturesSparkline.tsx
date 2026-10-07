import React, { useMemo } from "react";
import { PricePoint15m } from "../data/futuresData";

interface FuturesSparklineProps {
  data: PricePoint15m[];
  width?: number;
  height?: number;
  showBadge?: boolean;
  badgePosition?: "right" | "bottom";
  className?: string;
  id?: string;
}

export const FuturesSparkline: React.FC<FuturesSparklineProps> = ({
  data,
  width = 58,
  height = 20,
  showBadge = false,
  badgePosition = "right",
  className = "",
  id
}) => {
  const calculations = useMemo(() => {
    if (!data || data.length === 0) {
      return null;
    }

    const startPrice = data[0].price;
    const latestPrice = data[data.length - 1].price;
    const delta = latestPrice - startPrice;
    const pct = startPrice !== 0 ? (delta / startPrice) * 100 : 0;
    const isUp = delta >= 0;

    const prices = data.map((d) => d.price);
    let min = Math.min(...prices);
    let max = Math.max(...prices);

    if (min === max) {
      min -= 0.5;
      max += 0.5;
    }

    const range = max - min;
    const paddingY = 3;
    const paddingX = 2;
    const usableW = width - 2 * paddingX;
    const usableH = height - 2 * paddingY;

    const points = data.map((d, index) => {
      const x = paddingX + (index / (data.length - 1)) * usableW;
      const y = height - paddingY - ((d.price - min) / range) * usableH;
      return { x, y, price: d.price, minute: d.minute };
    });

    // Build SVG line path
    const pathD = points.reduce((acc, pt, idx) => {
      return idx === 0 ? `M ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}` : `${acc} L ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`;
    }, "");

    // Build area fill path
    const lastPt = points[points.length - 1];
    const firstPt = points[0];
    const areaD = `${pathD} L ${lastPt.x.toFixed(1)} ${height} L ${firstPt.x.toFixed(1)} ${height} Z`;

    const strokeColor = delta > 0 ? "#10B981" : delta < 0 ? "#F87171" : "#E5C794";
    const lastPoint = points[points.length - 1];

    return {
      startPrice,
      latestPrice,
      delta,
      pct,
      isUp,
      pathD,
      areaD,
      strokeColor,
      lastPoint,
      min,
      max
    };
  }, [data, width, height]);

  if (!calculations) {
    return (
      <div
        className={`inline-flex items-center justify-center text-[9px] font-mono-data text-[#8292A6] ${className}`}
        style={{ width, height }}
      >
        --
      </div>
    );
  }

  const {
    startPrice,
    latestPrice,
    delta,
    pct,
    isUp,
    pathD,
    areaD,
    strokeColor,
    lastPoint
  } = calculations;

  const gradId = `futures-spark-${id || Math.abs(Math.round(latestPrice * 100))}`;
  const tooltipText = `15m Momentum: ${delta >= 0 ? "+" : ""}${delta.toFixed(2)} pts (${delta >= 0 ? "+" : ""}${pct.toFixed(2)}%)\nStart (-15m): ${startPrice.toFixed(2)} → Now: ${latestPrice.toFixed(2)}`;

  const badgeElement = (
    <span
      className={`text-[8.5px] font-mono-data font-bold px-1 py-0.5 rounded leading-none border whitespace-nowrap ${
        isUp
          ? "bg-[#10B981]/15 text-[#34D399] border-[#10B981]/30"
          : "bg-[#DC2626]/15 text-[#F87171] border-[#DC2626]/30"
      }`}
      title={tooltipText}
    >
      {isUp ? "▲" : "▼"} {Math.abs(pct).toFixed(2)}%
    </span>
  );

  return (
    <div
      className={`inline-flex ${
        badgePosition === "bottom" ? "flex-col items-start gap-0.5" : "items-center gap-1.5"
      } ${className}`}
    >
      <div className="relative group cursor-crosshair">
        <svg
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          className="overflow-visible block"
        >
          <title>{tooltipText}</title>
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={strokeColor} stopOpacity="0.30" />
              <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Area fill */}
          <path d={areaD} fill={`url(#${gradId})`} />

          {/* Sparkline curve */}
          <path
            d={pathD}
            fill="none"
            stroke={strokeColor}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Latest update endpoint dot */}
          {lastPoint && (
            <circle
              cx={lastPoint.x}
              cy={lastPoint.y}
              r="2"
              fill={strokeColor}
            />
          )}
        </svg>
      </div>

      {showBadge && badgeElement}
    </div>
  );
};
