import React, { useEffect, useState } from "react";
import { TickerItem } from "../types";
import { Activity, RefreshCw, Pause, Play, AlertCircle, TrendingUp, TrendingDown, Radio, Zap, Eye } from "lucide-react";
import { StreamGatewayInfo } from "../hooks/useRealtimeStream";

interface HeaderTickerProps {
  tickers: TickerItem[];
  refreshIntervalSeconds?: number;
  onManualRefresh?: () => void;
  isAutoRefreshActive?: boolean;
  onToggleAutoRefresh?: () => void;
  streamInfo?: StreamGatewayInfo;
  onOpenStreamModal?: () => void;
  isCalmMode?: boolean;
  onToggleCalmMode?: () => void;
}

const HeaderTickerComponent: React.FC<HeaderTickerProps> = ({
  tickers,
  refreshIntervalSeconds = 15,
  onManualRefresh,
  isAutoRefreshActive = true,
  onToggleAutoRefresh,
  streamInfo,
  onOpenStreamModal,
  isCalmMode = false,
  onToggleCalmMode,
}) => {
  const [countdown, setCountdown] = useState(refreshIntervalSeconds);
  const [justTicked, setJustTicked] = useState(false);
  const [isMarqueePaused, setIsMarqueePaused] = useState(false);
  const onManualRefreshRef = React.useRef(onManualRefresh);

  useEffect(() => {
    onManualRefreshRef.current = onManualRefresh;
  }, [onManualRefresh]);

  useEffect(() => {
    if (!isAutoRefreshActive) return;

    let currentCountdown = refreshIntervalSeconds;

    const interval = setInterval(() => {
      currentCountdown -= 1;
      if (currentCountdown <= 0) {
        currentCountdown = refreshIntervalSeconds;
        setCountdown(refreshIntervalSeconds);
        setJustTicked(true);
        setTimeout(() => setJustTicked(false), 800);
        if (onManualRefreshRef.current) {
          onManualRefreshRef.current();
        }
      } else {
        setCountdown(currentCountdown);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isAutoRefreshActive, refreshIntervalSeconds]);

  const handleManualClick = () => {
    setJustTicked(true);
    setTimeout(() => setJustTicked(false), 800);
    setCountdown(refreshIntervalSeconds);
    if (onManualRefreshRef.current) {
      onManualRefreshRef.current();
    }
  };

  const isStreaming = streamInfo?.isConnected && streamInfo.mode === "stream";

  return (
    <div
      id="header-ticker-strip"
      className="w-full bg-[#080E18] border-b border-[#1E293B] py-1.5 px-3 sm:px-6 flex items-center justify-between text-xs font-mono-data overflow-x-auto select-none"
    >
      {/* Live status badge & Stream Inspector Button */}
      <div className="flex items-center gap-2.5 shrink-0 pr-4 border-r border-[#1E293B]">
        <button
          id="open-stream-inspector-btn"
          onClick={onOpenStreamModal}
          title="Inspect Real-Time Level 2 Stream Gateway"
          className="flex items-center gap-2 px-1.5 py-0.5 rounded-sm hover:bg-white/5 transition-all text-left group"
        >
          <span className="flex h-2 w-2 items-center justify-center relative">
            <span
              className={`inline-flex rounded-full h-1.5 w-1.5 ${
                isStreaming
                  ? "bg-[#10B981]"
                  : isAutoRefreshActive
                  ? "bg-[#A6291C]"
                  : "bg-gray-500"
              }`}
            />
          </span>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-[#B08D57] font-semibold tracking-wider text-[11px] uppercase group-hover:text-[#E5C794] transition-colors flex items-center gap-1">
                <span>{isStreaming ? "STREAM: LIVE" : "LIVE MACRO FEED"}</span>
                {isStreaming && <Zap className="w-2.5 h-2.5 text-[#10B981]" />}
              </span>
              {streamInfo?.openMarketData?.keyConfigured && streamInfo?.finnhubData?.keyConfigured && streamInfo?.polygonData?.keyConfigured ? (
                <span className="px-1 py-0.2 rounded-sm text-[8px] font-bold bg-[#10B981]/15 text-[#34D399] border border-[#10B981]/30 tracking-tight">
                  TRIPLE-VERIFIED (OM · FINNHUB · POLYGON)
                </span>
              ) : streamInfo?.openMarketData?.keyConfigured && streamInfo?.finnhubData?.keyConfigured ? (
                <span className="px-1 py-0.2 rounded-sm text-[8px] font-bold bg-[#10B981]/15 text-[#34D399] border border-[#10B981]/30 tracking-tight">
                  OM + FINNHUB VERIFIED
                </span>
              ) : streamInfo?.finnhubData?.keyConfigured ? (
                <span className="px-1 py-0.2 rounded-sm text-[8px] font-bold bg-[#10B981]/15 text-[#34D399] border border-[#10B981]/30 tracking-tight">
                  FINNHUB-VERIFIED
                </span>
              ) : streamInfo?.openMarketData?.keyConfigured ? (
                <span className="px-1 py-0.2 rounded-sm text-[8px] font-bold bg-[#10B981]/15 text-[#34D399] border border-[#10B981]/30 tracking-tight">
                  OM-VERIFIED
                </span>
              ) : null}
            </div>
            {streamInfo && (
              <span className="text-[9px] text-[#8292A6] font-normal leading-none mt-0.5">
                {isStreaming ? `${streamInfo.latencyMs}ms · L2 Direct` : "HTTP Polling"}
                {streamInfo?.openMarketData?.keyConfigured && " · OM"}
                {streamInfo?.finnhubData?.keyConfigured && " · Finnhub"}
                {streamInfo?.polygonData?.keyConfigured && " · Polygon SIP"}
              </span>
            )}
          </div>
        </button>

        {/* 15s countdown timer badge */}
        <div className="flex items-center gap-1.5 text-[10px] text-[#EDE9DE]/70 bg-[#0B1019] px-2 py-0.5 rounded-sm border border-[#1E293B]">
          <Activity className="w-3 h-3 text-[#B08D57]" />
          <span className="font-mono-data tabular-nums">{isStreaming ? "Push" : `${countdown}s`}</span>
          <button
            id="toggle-autorefresh-btn"
            onClick={onToggleAutoRefresh}
            title={isAutoRefreshActive ? "Pause Auto-Refresh" : "Resume Auto-Refresh"}
            aria-label={isAutoRefreshActive ? "Pause Auto-Refresh" : "Resume Auto-Refresh"}
            className="hover:text-[#EDE9DE] transition-colors ml-0.5"
          >
            {isAutoRefreshActive ? <Pause className="w-2.5 h-2.5" /> : <Play className="w-2.5 h-2.5 text-[#B08D57]" />}
          </button>
          <button
            id="manual-refresh-ticker-btn"
            onClick={handleManualClick}
            title="Sync Live Prices"
            aria-label="Sync Live Prices"
            className="hover:text-[#B08D57] transition-colors ml-1"
          >
            <RefreshCw className={`w-2.5 h-2.5 ${justTicked && !isCalmMode ? 'animate-spin text-[#B08D57]' : ''}`} />
          </button>
        </div>

        {/* Calm Mode Sensory Accessibility Toggle */}
        {onToggleCalmMode && (
          <button
            id="toggle-calm-mode-btn"
            onClick={onToggleCalmMode}
            title={isCalmMode ? "Calm Mode: Active (Sensory-friendly, animations subdued)" : "Enable Calm Mode (Sensory-friendly, subdues animations)"}
            aria-label="Toggle Calm Mode"
            aria-pressed={isCalmMode}
            className={`flex items-center gap-1.5 text-[10px] px-2.5 py-0.5 rounded-sm border transition-colors ${
              isCalmMode
                ? "bg-[#B08D57]/20 border-[#B08D57] text-[#E5C794] font-semibold"
                : "bg-[#0E1624] border-[#1E293B] text-[#8292A6] hover:text-[#EDE9DE]"
            }`}
          >
            <Eye className="w-3 h-3 text-[#B08D57]" />
            <span>{isCalmMode ? "Calm: ON" : "Calm Mode"}</span>
          </button>
        )}
      </div>

      {/* Scrolling Carousel Ticker items */}
      <div className="flex-1 overflow-hidden relative mx-2 flex items-center">
        {/* Quick Marquee Flow Toggle Button */}
        <button
          onClick={() => setIsMarqueePaused(!isMarqueePaused)}
          title={isMarqueePaused ? "Resume Marquee Flow" : "Pause Marquee Flow"}
          aria-label={isMarqueePaused ? "Resume Marquee Flow" : "Pause Marquee Flow"}
          className="shrink-0 p-1 mr-2 text-[10px] text-[#8292A6] hover:text-[#EDE9DE] bg-[#0E1624] hover:bg-[#111A28] rounded-sm border border-[#1E293B] transition-colors"
        >
          {isMarqueePaused ? <Play className="w-2.5 h-2.5 text-[#B08D57]" /> : <Pause className="w-2.5 h-2.5" />}
        </button>

        <div className="overflow-hidden flex-1 relative">
          <div
            className={`animate-ticker-carousel flex items-center gap-6 ${
              isMarqueePaused ? "is-paused" : ""
            }`}
          >
            {/* Exactly two identical halves (4 sets) so translateX(-50%) creates an infinite, seamless loop on all resolutions */}
            {[
              ...(tickers.length > 0 ? tickers : []),
              ...(tickers.length > 0 ? tickers : []),
              ...(tickers.length > 0 ? tickers : []),
              ...(tickers.length > 0 ? tickers : [])
            ].map((item, idx) => {
              const isUp = item.change >= 0;
              const symUpper = item.symbol.toUpperCase();
              let prov = "L2 TAPE";
              if (symUpper.includes("BTC") || symUpper.includes("ETH") || symUpper.includes("SOL")) prov = "HYPERLIQUID L2";
              else if (symUpper.includes("JPY") || symUpper.includes("EUR") || symUpper.includes("GBP")) prov = "KRAKEN L2";
              else if (symUpper.includes("XAU") || symUpper.includes("GOLD")) prov = "PAXG LBMA";
              else if (symUpper.includes("XAG") || symUpper.includes("SILVER")) prov = "FINNHUB SLV";
              else if (symUpper.includes("BRENT") || symUpper.includes("CRUDE") || symUpper.includes("WTI")) prov = "FINNHUB BNO";
              else if (symUpper.includes("S&P") || symUpper.includes("SPX") || symUpper.includes("NASDAQ") || symUpper.includes("DOW")) prov = "FINNHUB SIP";
              else if (symUpper.includes("IBEX") || symUpper.includes("DAX") || symUpper.includes("NIKKEI") || symUpper.includes("KOSPI")) prov = "FINNHUB PROXY";
              else if (symUpper.includes("UST") || symUpper.includes("10Y") || symUpper.includes("2Y") || symUpper.includes("30Y")) prov = "US TREASURY";
              else if (symUpper.includes("VIX")) prov = "CBOE VIXY";

              return (
                <div
                  key={idx}
                  id={`ticker-item-${idx}-${item.symbol.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}`}
                  className="flex items-center gap-2.5 shrink-0 bg-[#0E1624] hover:bg-[#141E2F] px-2.5 py-1 rounded-[2px] border border-[#1E293B] hover:border-[#B08D57]/40 transition-colors cursor-default"
                >
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-[#EDE9DE] flex items-center gap-1 font-mono-data tracking-tight">
                      {item.symbol}
                    </span>
                    <span className="text-[9px] text-[#8292A6] leading-none whitespace-nowrap">
                      {item.name}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-1.5 whitespace-nowrap font-mono-data">
                    <span className="text-[12px] font-semibold text-[#EDE9DE] tabular-nums">
                      {typeof item.price === 'number' ? item.price.toLocaleString(undefined, { minimumFractionDigits: item.price < 10 ? 3 : 2, maximumFractionDigits: item.price < 10 ? 3 : 2 }) : item.price}
                    </span>

                    <span
                      className={`text-[10px] flex items-center font-semibold tabular-nums ${
                        !isUp ? 'text-[#EF4444]' : 'text-[#10B981]'
                      }`}
                    >
                      {isUp ? <TrendingUp className="w-2.5 h-2.5 mr-0.5 inline" /> : <TrendingDown className="w-2.5 h-2.5 mr-0.5 inline" />}
                      {isUp ? '+' : ''}
                      {item.change}
                      {item.changeUnit}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <span className="text-[8.5px] px-1 py-0.5 rounded-[2px] font-mono-data font-semibold uppercase tracking-wider text-[#94A3B8] bg-[#0A101D] border border-[#26334D]">
                      {prov}
                    </span>
                    {item.status && (
                      <span
                        className={`text-[8.5px] px-1 py-0.5 rounded-[2px] font-mono-data font-medium uppercase tracking-tight whitespace-nowrap ${
                          item.signal === 'danger'
                            ? 'bg-[#A6291C]/20 text-[#FFA4A4] border border-[#A6291C]/40'
                            : item.signal === 'brass'
                            ? 'bg-[#B08D57]/20 text-[#E5C794] border border-[#B08D57]/40'
                            : 'bg-black/40 text-[#8292A6] border border-[#1E293B]'
                        }`}
                      >
                        {item.status}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right timestamp & active desk badge */}
      <div className="hidden lg:flex items-center gap-3 text-[11px] text-[#8292A6] shrink-0 pl-4 border-l border-[#B08D57]/20">
        <div className="flex items-center gap-1">
          <span className="text-[#B08D57] font-medium">SMC DESK:</span>
          <span>LONDON / TOKYO CROSS</span>
        </div>
      </div>
    </div>
  );
};

export const HeaderTicker = React.memo(HeaderTickerComponent);
