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

export const HeaderTicker: React.FC<HeaderTickerProps> = ({
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
      className="w-full bg-black border-b border-[#B08D57]/30 py-2 px-3 sm:px-6 flex items-center justify-between text-xs font-mono-data overflow-x-auto select-none"
    >
      {/* Live status badge & Stream Inspector Button */}
      <div className="flex items-center gap-2.5 shrink-0 pr-4 border-r border-[#B08D57]/20">
        <button
          id="open-stream-inspector-btn"
          onClick={onOpenStreamModal}
          title="Inspect Real-Time Level 2 Stream Gateway"
          className="flex items-center gap-2 px-2 py-0.5 rounded hover:bg-white/5 transition-all text-left group"
        >
          <span className="flex h-2 w-2 items-center justify-center relative">
            <span
              className={`inline-flex rounded-full h-2 w-2 ${
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
                <span className="px-1 py-0.2 rounded text-[8px] font-bold bg-[#10B981]/15 text-[#34D399] border border-[#10B981]/30 tracking-tight">
                  TRIPLE-VERIFIED (OM · FINNHUB · POLYGON)
                </span>
              ) : streamInfo?.openMarketData?.keyConfigured && streamInfo?.finnhubData?.keyConfigured ? (
                <span className="px-1 py-0.2 rounded text-[8px] font-bold bg-[#10B981]/15 text-[#34D399] border border-[#10B981]/30 tracking-tight">
                  OM + FINNHUB VERIFIED
                </span>
              ) : streamInfo?.finnhubData?.keyConfigured ? (
                <span className="px-1 py-0.2 rounded text-[8px] font-bold bg-[#10B981]/15 text-[#34D399] border border-[#10B981]/30 tracking-tight">
                  FINNHUB-VERIFIED
                </span>
              ) : streamInfo?.openMarketData?.keyConfigured ? (
                <span className="px-1 py-0.2 rounded text-[8px] font-bold bg-[#10B981]/15 text-[#34D399] border border-[#10B981]/30 tracking-tight">
                  OM-VERIFIED
                </span>
              ) : null}
            </div>
            {streamInfo && (
              <span className="text-[9px] text-[#8292A6] font-normal leading-none mt-0.5">
                {isStreaming ? `${streamInfo.latencyMs}ms // L2 Direct` : "HTTP Polling"}
                {streamInfo?.openMarketData?.keyConfigured && " · OM"}
                {streamInfo?.finnhubData?.keyConfigured && " · Finnhub"}
                {streamInfo?.polygonData?.keyConfigured && " · Polygon SIP"}
              </span>
            )}
          </div>
        </button>

        {/* 15s countdown timer badge */}
        <div className="flex items-center gap-1.5 text-[10px] text-[#EDE9DE]/70 bg-black px-2 py-0.5 rounded border border-[#B08D57]/30">
          <Activity className="w-3 h-3 text-[#B08D57]" />
          <span>{isStreaming ? "Push" : `${countdown}s`}</span>
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
            className={`flex items-center gap-1.5 text-[10px] px-2.5 py-0.5 rounded border transition-colors ${
              isCalmMode
                ? "bg-[#B08D57]/25 border-[#B08D57] text-[#E5C794] font-bold shadow-[0_0_8px_rgba(176,141,87,0.2)]"
                : "bg-black/60 border-white/10 text-[#8292A6] hover:text-[#EDE9DE]"
            }`}
          >
            <Eye className="w-3 h-3 text-[#B08D57]" />
            <span>{isCalmMode ? "Calm Mode: ON" : "Calm Mode"}</span>
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
          className="shrink-0 p-1 mr-2 text-[10px] text-[#8292A6] hover:text-[#EDE9DE] bg-black/40 hover:bg-black rounded border border-[#2B3545] transition-colors"
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
              return (
                <div
                  key={idx}
                  id={`ticker-item-${idx}-${item.symbol.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}`}
                  className="flex items-center gap-2.5 shrink-0 bg-[#0E1A2B]/40 hover:bg-[#1A1D24] px-3 py-1 rounded border border-[#B08D57]/10 hover:border-[#B08D57]/30 transition-colors cursor-default"
                >
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-[#EDE9DE] flex items-center gap-1">
                      {item.symbol}
                    </span>
                    <span className="text-[9px] text-[#8292A6] leading-none whitespace-nowrap">
                      {item.name}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-1.5 whitespace-nowrap">
                    <span className="text-[12px] font-semibold text-[#EDE9DE]">
                      {typeof item.price === 'number' ? item.price.toLocaleString(undefined, { minimumFractionDigits: item.price < 10 ? 2 : 1, maximumFractionDigits: 2 }) : item.price}
                    </span>

                    <span
                      className={`text-[10px] flex items-center font-medium ${
                        item.signal === 'danger' || !isUp
                          ? 'text-[#A6291C]'
                          : 'text-[#B08D57]'
                      }`}
                    >
                      {isUp ? <TrendingUp className="w-2.5 h-2.5 mr-0.5 inline" /> : <TrendingDown className="w-2.5 h-2.5 mr-0.5 inline" />}
                      {isUp ? '+' : ''}
                      {item.change}
                      {item.changeUnit}
                    </span>
                  </div>

                  {item.status && (
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-medium uppercase tracking-tight whitespace-nowrap ${
                        item.signal === 'danger'
                          ? 'bg-[#A6291C]/20 text-[#FFA4A4] border border-[#A6291C]/40'
                          : item.signal === 'brass'
                          ? 'bg-[#B08D57]/20 text-[#E5C794] border border-[#B08D57]/40'
                          : 'bg-black/40 text-[#8292A6] border border-[#B08D57]/20'
                      }`}
                    >
                      {item.status}
                    </span>
                  )}
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
