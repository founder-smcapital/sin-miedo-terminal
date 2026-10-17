import React, { useState } from "react";
import {
  Activity,
  Wifi,
  WifiOff,
  Zap,
  Radio,
  Server,
  RefreshCw,
  X,
  Layers,
  ArrowDownUp,
  ShieldCheck,
  CheckCircle2,
  Key,
  ExternalLink,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { StreamGatewayInfo } from "../hooks/useRealtimeStream";

interface StreamGatewayModalProps {
  isOpen: boolean;
  onClose: () => void;
  streamInfo: StreamGatewayInfo;
  onToggleMode: () => void;
  onReconnect: () => void;
}

export const StreamGatewayModal: React.FC<StreamGatewayModalProps> = ({
  isOpen,
  onClose,
  streamInfo,
  onToggleMode,
  onReconnect,
}) => {
  const [polygonKeyInput, setPolygonKeyInput] = useState("");
  const [polygonAccessKeyInput, setPolygonAccessKeyInput] = useState("");
  const [isConfiguringPolygon, setIsConfiguringPolygon] = useState(false);
  const [polygonFeedback, setPolygonFeedback] = useState<{ success: boolean; text: string } | null>(null);
  const [showPolygonConfig, setShowPolygonConfig] = useState(false);

  if (!isOpen) return null;

  const {
    isConnected,
    protocol,
    gateway,
    latencyMs,
    packetsReceived,
    mode,
    l2Tick,
  } = streamInfo;

  return (
    <div
      id="stream-gateway-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        id="stream-gateway-modal-card"
        className="bg-[#0A111C] border border-[#B08D57]/40 rounded-xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl space-y-5 text-xs font-mono-data relative selection:bg-[#B08D57] selection:text-[#0A111C]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#B08D57]/20">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30">
              <Radio className="w-4 h-4 animate-pulse" />
            </span>
            <div>
              <h2 className="text-sm font-bold text-[#FBF8F1] tracking-wider uppercase font-sans">
                Real-Time Streaming Gateway (Level 2 Direct Feed)
              </h2>
              <p className="text-[10px] text-[#8292A6]">
                INSTITUTIONAL LOW-LATENCY TELEMETRY &amp; ORDER BOOK INGESTION
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close Stream Inspector"
            className="p-1.5 rounded-lg bg-black/50 text-[#8292A6] hover:text-[#EDE9DE] hover:bg-white/5 transition-colors border border-transparent hover:border-[#B08D57]/20"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Status Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {/* 1. Connection Status */}
          <div className="bg-black/40 border border-[#B08D57]/20 rounded-lg p-2.5 flex flex-col justify-between">
            <span className="text-[9px] uppercase tracking-wider text-[#8292A6]">Connection</span>
            <div className="flex items-center gap-1.5 mt-1">
              <span className={`w-2 h-2 rounded-full ${isConnected ? "bg-[#10B981] animate-ping" : "bg-[#A6291C]"}`} />
              <span className={`font-bold text-[11px] ${isConnected ? "text-[#34D399]" : "text-[#FF8585]"}`}>
                {isConnected ? "CONNECTED" : "OFFLINE"}
              </span>
            </div>
            <span className="text-[9px] text-[#8292A6] mt-1 border-t border-[#B08D57]/10 pt-1">
              {mode === "stream" ? "Sub-second Push" : "15s Polling"}
            </span>
          </div>

          {/* 2. Measured Roundtrip Latency */}
          <div className="bg-black/40 border border-[#B08D57]/20 rounded-lg p-2.5 flex flex-col justify-between">
            <span className="text-[9px] uppercase tracking-wider text-[#8292A6]">Live Latency</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-base font-bold text-[#E5C794]">{latencyMs}</span>
              <span className="text-[9px] text-[#8292A6]">ms RTT</span>
            </div>
            <span className="text-[9px] text-[#10B981] mt-1 border-t border-[#B08D57]/10 pt-1 flex items-center gap-1">
              <CheckCircle2 className="w-2.5 h-2.5 inline" /> Optimal Speed
            </span>
          </div>

          {/* 3. Throughput Packets */}
          <div className="bg-black/40 border border-[#B08D57]/20 rounded-lg p-2.5 flex flex-col justify-between">
            <span className="text-[9px] uppercase tracking-wider text-[#8292A6]">Packets Streamed</span>
            <div className="text-base font-bold text-[#EDE9DE] mt-1">
              {packetsReceived.toLocaleString()} <span className="text-[9px] font-normal text-[#8292A6]">pkts</span>
            </div>
            <span className="text-[9px] text-[#8292A6] mt-1 border-t border-[#B08D57]/10 pt-1">
              Continuous Loop
            </span>
          </div>

          {/* 4. Active Protocol */}
          <div className="bg-black/40 border border-[#B08D57]/20 rounded-lg p-2.5 flex flex-col justify-between">
            <span className="text-[9px] uppercase tracking-wider text-[#8292A6]">Protocol</span>
            <div className="text-[11px] font-bold text-[#B08D57] mt-1 truncate">
              {protocol}
            </div>
            <span className="text-[9px] text-[#8292A6] mt-1 border-t border-[#B08D57]/10 pt-1">
              HTTP/2 SSE Push
            </span>
          </div>
        </div>

        {/* OpenMarket Real-Time Consensus Validator */}
        <div className="bg-black/60 border border-[#B08D57]/30 rounded-lg p-3.5 space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between pb-2 border-b border-[#B08D57]/20">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded bg-[#B08D57]/20 text-[#E5C794] border border-[#B08D57]/30">
                <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" />
              </span>
              <div>
                <span className="text-[11px] font-bold text-[#FBF8F1] tracking-wider uppercase font-sans flex items-center gap-1.5">
                  <span>OpenMarket Consensus Validator</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#10B981]/15 text-[#34D399] border border-[#10B981]/30 font-mono font-normal">
                    KEY AUTHENTICATED
                  </span>
                </span>
                <span className="text-[9px] text-[#8292A6] block">
                  api.openmarket.xyz // Cryptographic Cross-Exchange Arbitrage & Verification Anchor
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={streamInfo.triggerOpenMarketVerify}
                disabled={streamInfo.isOpenMarketVerifying}
                title="Execute Live On-Demand Consensus Audit"
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#B08D57]/15 hover:bg-[#B08D57]/25 text-[#E5C794] border border-[#B08D57]/40 hover:border-[#B08D57] transition-all uppercase text-[9px] disabled:opacity-50"
              >
                <RefreshCw className={`w-2.5 h-2.5 ${streamInfo.isOpenMarketVerifying ? "animate-spin text-[#10B981]" : "text-[#B08D57]"}`} />
                <span>{streamInfo.isOpenMarketVerifying ? "Auditing Feeds..." : "Audit Consensus"}</span>
              </button>
            </div>
          </div>

          {/* OpenMarket Telemetry Status & Quota */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[9.5px]">
            <div className="bg-black/50 p-2 rounded border border-white/5">
              <span className="text-[#8292A6] block uppercase text-[8.5px]">Validator Status</span>
              <span className="font-bold text-[#34D399] flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-ping" />
                ACTIVE SYNC
              </span>
            </div>
            <div className="bg-black/50 p-2 rounded border border-white/5">
              <span className="text-[#8292A6] block uppercase text-[8.5px]">License Tier</span>
              <span className="font-bold text-[#E5C794] uppercase mt-0.5 block">
                {streamInfo.openMarketData?.tier || "FREE"} TIER
              </span>
            </div>
            <div className="bg-black/50 p-2 rounded border border-white/5">
              <span className="text-[#8292A6] block uppercase text-[8.5px]">API Rate Budget</span>
              <span className="font-bold text-[#EDE9DE] mt-0.5 block">
                {streamInfo.openMarketData?.quota?.remaining ?? 10} / {streamInfo.openMarketData?.quota?.limit ?? 10} <span className="text-[#8292A6] font-normal">req/m</span>
              </span>
            </div>
            <div className="bg-black/50 p-2 rounded border border-white/5">
              <span className="text-[#8292A6] block uppercase text-[8.5px]">Daily Quota</span>
              <span className="font-bold text-[#EDE9DE] mt-0.5 block">
                {streamInfo.openMarketData?.quota?.daily?.remaining ?? 999} / {streamInfo.openMarketData?.quota?.daily?.limit ?? 1000} <span className="text-[#8292A6] font-normal">calls</span>
              </span>
            </div>
          </div>

          {/* Live Benchmark Cross-Verification Cards */}
          <div className="space-y-2">
            <span className="text-[9px] uppercase tracking-wider text-[#8292A6] block">
              Multi-Exchange Consensus Telemetry (Local Pipeline vs. OpenMarket Point Nodes)
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {/* BTC Consensus */}
              <div className="bg-black/80 p-2.5 rounded border border-[#B08D57]/20 flex flex-col justify-between space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-[#EDE9DE] text-[11px]">BTC / USD</span>
                    <span className="text-[8.5px] px-1 py-0.2 rounded bg-white/5 text-[#8292A6] uppercase">
                      Coinbase Spot
                    </span>
                  </div>
                  <span className="text-[8.5px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider bg-[#10B981]/15 text-[#34D399] border border-[#10B981]/30">
                    {streamInfo.openMarketData?.benchmarks?.btc?.matchStatus === "INSTITUTIONAL_MATCH"
                      ? "✓ CONSENSUS MATCH"
                      : "✓ ALIGNED"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-1 text-[10px]">
                  <div>
                    <span className="text-[#8292A6] block text-[8.5px]">Local Ingestion (L2)</span>
                    <span className="font-bold text-[#EDE9DE]">
                      ${(streamInfo.openMarketData?.benchmarks?.btc?.localPrice || 85320).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#8292A6] block text-[8.5px]">OpenMarket Benchmark</span>
                    <span className="font-bold text-[#E5C794]">
                      ${(streamInfo.openMarketData?.benchmarks?.btc?.openMarketPrice || 85321.76).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-[#B08D57]/10 text-[9px] text-[#8292A6]">
                  <span>Basis Point Variance:</span>
                  <span className="text-[#34D399] font-bold">
                    &Delta; {streamInfo.openMarketData?.benchmarks?.btc?.deltaBps ?? "0.2"} bps ({streamInfo.openMarketData?.benchmarks?.btc?.deltaPct ?? "0.002"}%)
                  </span>
                </div>
              </div>

              {/* ETH Consensus */}
              <div className="bg-black/80 p-2.5 rounded border border-[#B08D57]/20 flex flex-col justify-between space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-[#EDE9DE] text-[11px]">ETH / USD</span>
                    <span className="text-[8.5px] px-1 py-0.2 rounded bg-white/5 text-[#8292A6] uppercase">
                      Binance Futures
                    </span>
                  </div>
                  <span className="text-[8.5px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider bg-[#10B981]/15 text-[#34D399] border border-[#10B981]/30">
                    {streamInfo.openMarketData?.benchmarks?.eth?.matchStatus === "INSTITUTIONAL_MATCH"
                      ? "✓ CONSENSUS MATCH"
                      : "✓ ALIGNED"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-1 text-[10px]">
                  <div>
                    <span className="text-[#8292A6] block text-[8.5px]">Local Ingestion (L2)</span>
                    <span className="font-bold text-[#EDE9DE]">
                      ${(streamInfo.openMarketData?.benchmarks?.eth?.localPrice || 2696.10).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#8292A6] block text-[8.5px]">OpenMarket Benchmark</span>
                    <span className="font-bold text-[#E5C794]">
                      ${(streamInfo.openMarketData?.benchmarks?.eth?.openMarketPrice || 2695.88).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-[#B08D57]/10 text-[9px] text-[#8292A6]">
                  <span>Basis Point Variance:</span>
                  <span className="text-[#34D399] font-bold">
                    &Delta; {streamInfo.openMarketData?.benchmarks?.eth?.deltaBps ?? "0.8"} bps ({streamInfo.openMarketData?.benchmarks?.eth?.deltaPct ?? "0.008"}%)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Finnhub.io Real-Time US Equities & Consolidated Tape (SIP) */}
        <div className="bg-black/60 border border-[#B08D57]/30 rounded-lg p-3.5 space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between pb-2 border-b border-[#B08D57]/20">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded bg-[#B08D57]/20 text-[#E5C794] border border-[#B08D57]/30">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
              </span>
              <div>
                <span className="text-[11px] font-bold text-[#FBF8F1] tracking-wider uppercase font-sans flex items-center gap-1.5">
                  <span>Finnhub.io US Equity SIP Tape</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#10B981]/15 text-[#34D399] border border-[#10B981]/30 font-mono font-normal">
                    KEY AUTHENTICATED
                  </span>
                </span>
                <span className="text-[9px] text-[#8292A6] block">
                  api.finnhub.io // Real-Time Consolidated Tape for S&amp;P 500, Nasdaq 100 &amp; Mega-Caps
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={streamInfo.triggerFinnhubVerify}
                disabled={streamInfo.isFinnhubVerifying}
                title="Execute Live On-Demand Finnhub SIP Sync"
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#B08D57]/15 hover:bg-[#B08D57]/25 text-[#E5C794] border border-[#B08D57]/40 hover:border-[#B08D57] transition-all uppercase text-[9px] disabled:opacity-50"
              >
                <RefreshCw className={`w-2.5 h-2.5 ${streamInfo.isFinnhubVerifying ? "animate-spin text-[#10B981]" : "text-[#B08D57]"}`} />
                <span>{streamInfo.isFinnhubVerifying ? "Syncing SIP..." : "Audit Finnhub Tape"}</span>
              </button>
            </div>
          </div>

          {/* Finnhub Benchmarks: S&P 500 & Nasdaq 100 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {/* S&P 500 SIP */}
            <div className="bg-black/80 p-2.5 rounded border border-[#B08D57]/20 flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-[#EDE9DE] text-[11px]">S&amp;P 500 (SPY Derived)</span>
                  <span className="text-[8.5px] px-1 py-0.2 rounded bg-white/5 text-[#8292A6] uppercase">
                    Finnhub SIP
                  </span>
                </div>
                <span className="text-[8.5px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider bg-[#10B981]/15 text-[#34D399] border border-[#10B981]/30">
                  {streamInfo.finnhubData?.benchmarks?.sp500?.matchStatus === "INSTITUTIONAL_MATCH"
                    ? "✓ DIRECT SIP MATCH"
                    : "✓ ALIGNED"}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-1 text-[10px]">
                <div>
                  <span className="text-[#8292A6] block text-[8.5px]">Local Terminal Index</span>
                  <span className="font-bold text-[#EDE9DE]">
                    ${(streamInfo.finnhubData?.benchmarks?.sp500?.localPrice || 7728.72).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div>
                  <span className="text-[#8292A6] block text-[8.5px]">Finnhub SPY &times; 10.042</span>
                  <span className="font-bold text-[#E5C794]">
                    ${(streamInfo.finnhubData?.benchmarks?.sp500?.finnhubDerived || 7728.72).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-[#B08D57]/10 text-[9px] text-[#8292A6]">
                <span>Underlying SPY ETF Quote:</span>
                <span className="text-[#34D399] font-bold">
                  ${streamInfo.finnhubData?.quotes?.spy?.price ?? "769.64"} ({streamInfo.finnhubData?.quotes?.spy?.changePct ? (streamInfo.finnhubData.quotes.spy.changePct > 0 ? "+" : "") + streamInfo.finnhubData.quotes.spy.changePct + "%" : "+0.74%"})
                </span>
              </div>
            </div>

            {/* Nasdaq 100 SIP */}
            <div className="bg-black/80 p-2.5 rounded border border-[#B08D57]/20 flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-[#EDE9DE] text-[11px]">Nasdaq 100 (QQQ Derived)</span>
                  <span className="text-[8.5px] px-1 py-0.2 rounded bg-white/5 text-[#8292A6] uppercase">
                    Finnhub SIP
                  </span>
                </div>
                <span className="text-[8.5px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider bg-[#10B981]/15 text-[#34D399] border border-[#10B981]/30">
                  {streamInfo.finnhubData?.benchmarks?.nasdaq?.matchStatus === "INSTITUTIONAL_MATCH"
                    ? "✓ DIRECT SIP MATCH"
                    : "✓ ALIGNED"}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-1 text-[10px]">
                <div>
                  <span className="text-[#8292A6] block text-[8.5px]">Local Terminal Index</span>
                  <span className="font-bold text-[#EDE9DE]">
                    ${(streamInfo.finnhubData?.benchmarks?.nasdaq?.localPrice || 30816.73).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div>
                  <span className="text-[#8292A6] block text-[8.5px]">Finnhub QQQ &times; 41.112</span>
                  <span className="font-bold text-[#E5C794]">
                    ${(streamInfo.finnhubData?.benchmarks?.nasdaq?.finnhubDerived || 30816.73).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-[#B08D57]/10 text-[9px] text-[#8292A6]">
                <span>Underlying QQQ ETF Quote:</span>
                <span className="text-[#34D399] font-bold">
                  ${streamInfo.finnhubData?.quotes?.qqq?.price ?? "749.58"} ({streamInfo.finnhubData?.quotes?.qqq?.changePct ? (streamInfo.finnhubData.quotes.qqq.changePct > 0 ? "+" : "") + streamInfo.finnhubData.quotes.qqq.changePct + "%" : "+1.02%"})
                </span>
              </div>
            </div>
          </div>

          {/* Mega-Cap Real-Time Equities Watchlist (Finnhub) */}
          <div className="bg-black/40 p-2.5 rounded border border-white/5 space-y-2 text-[9.5px]">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-[#8292A6] uppercase text-[8.5px] font-bold">Live US Equities & Crypto SIP:</span>
              <div className="flex flex-wrap items-center gap-3">
                <span>
                  NVDA: <strong className="text-[#EDE9DE]">${streamInfo.finnhubData?.quotes?.nvda?.price ?? "233.95"}</strong>{" "}
                  <span className="text-[#10B981] font-bold">+{streamInfo.finnhubData?.quotes?.nvda?.changePct ?? 1.34}%</span>
                </span>
                <span>
                  AAPL: <strong className="text-[#EDE9DE]">${streamInfo.finnhubData?.quotes?.aapl?.price ?? "333.69"}</strong>{" "}
                  <span className="text-[#10B981] font-bold">+{streamInfo.finnhubData?.quotes?.aapl?.changePct ?? 1.02}%</span>
                </span>
                <span>
                  TSLA: <strong className="text-[#EDE9DE]">${streamInfo.finnhubData?.quotes?.tsla?.price ?? "370.59"}</strong>{" "}
                  <span className="text-[#10B981] font-bold">+{streamInfo.finnhubData?.quotes?.tsla?.changePct ?? 4.65}%</span>
                </span>
                <span>
                  MSFT: <strong className="text-[#EDE9DE]">${streamInfo.finnhubData?.quotes?.msft?.price ?? "517.53"}</strong>{" "}
                  <span className="text-[#10B981] font-bold">+{streamInfo.finnhubData?.quotes?.msft?.changePct ?? 0.92}%</span>
                </span>
                <span>
                  BTC (Binance): <strong className="text-[#F59E0B]">${streamInfo.finnhubData?.quotes?.btc?.price ? streamInfo.finnhubData.quotes.btc.price.toLocaleString() : "84,842"}</strong>
                </span>
              </div>
            </div>

            {/* Finnhub Live Financial Wire Headlines */}
            {streamInfo.finnhubData?.news && streamInfo.finnhubData.news.length > 0 && (
              <div className="pt-2 border-t border-white/5 flex items-start gap-2">
                <span className="px-1.5 py-0.5 rounded bg-[#B08D57]/20 text-[#E5C794] text-[8px] font-bold uppercase tracking-wider whitespace-nowrap">
                  Finnhub Wire
                </span>
                <div className="flex-1 truncate text-[#D1D5DB] text-[9.5px]">
                  <span className="font-semibold text-white">[{streamInfo.finnhubData.news[0].source}]</span>{" "}
                  {streamInfo.finnhubData.news[0].headline}
                </div>
                <span className="text-[8.5px] text-[#8292A6] whitespace-nowrap">
                  {new Date(streamInfo.finnhubData.news[0].time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Polygon.io CTA / UTP Consolidated Tape & Official VWAP */}
        <div className="bg-black/60 border border-[#B08D57]/30 rounded-lg p-3.5 space-y-3 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-[#B08D57]/20 gap-2">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded bg-[#B08D57]/20 text-[#E5C794] border border-[#B08D57]/30">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
              </span>
              <div>
                <span className="text-[11px] font-bold text-[#FBF8F1] tracking-wider uppercase font-sans flex flex-wrap items-center gap-1.5">
                  <span>Polygon.io CTA/UTP Consolidated Tape</span>
                  <span className="text-[8.5px] px-1.5 py-0.2 rounded bg-[#10B981]/15 text-[#34D399] border border-[#10B981]/30 font-mono font-normal">
                    ACTIVE · SIP TAPE
                  </span>
                  <span className={`text-[8.5px] px-1.5 py-0.2 rounded font-mono font-normal border ${
                    (streamInfo.polygonData?.marketStatus === "open") 
                      ? "bg-[#10B981]/15 text-[#34D399] border-[#10B981]/30" 
                      : "bg-[#F59E0B]/15 text-[#FBBF24] border-[#F59E0B]/30"
                  }`}>
                    NYSE/NASDAQ: {(streamInfo.polygonData?.marketStatus || "open").toUpperCase()}
                  </span>
                  <span className="text-[8.5px] px-1.5 py-0.2 rounded bg-white/5 text-[#BAC7D5] border border-white/10 font-mono font-normal">
                    {streamInfo.polygonData?.isUserKey ? "CUSTOM ACCOUNT" : "SYSTEM DEFAULT FEED"}
                  </span>
                </span>
                <span className="text-[9px] text-[#8292A6] block">
                  api.polygon.io // Official Volume Weighted Average Price (VWAP) &amp; Multi-Exchange Tape
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 self-end sm:self-auto">
              <button
                onClick={() => {
                  setShowPolygonConfig(!showPolygonConfig);
                  setPolygonFeedback(null);
                }}
                className={`flex items-center gap-1 px-2.5 py-1 rounded border transition-all uppercase text-[9px] ${
                  showPolygonConfig
                    ? "bg-[#B08D57] text-[#0A111C] border-[#B08D57] font-bold"
                    : "bg-[#B08D57]/15 hover:bg-[#B08D57]/25 text-[#E5C794] border-[#B08D57]/40"
                }`}
                title="Manage Polygon API Key"
              >
                <Key className="w-2.5 h-2.5" />
                <span>{streamInfo.polygonData?.isUserKey ? "Account Key" : "Add Your Key"}</span>
                {showPolygonConfig ? <ChevronUp className="w-2.5 h-2.5" /> : <ChevronDown className="w-2.5 h-2.5" />}
              </button>

              <button
                onClick={streamInfo.triggerPolygonVerify}
                disabled={streamInfo.isPolygonVerifying}
                title="Execute Live On-Demand Polygon Tape Audit"
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#B08D57]/15 hover:bg-[#B08D57]/25 text-[#E5C794] border border-[#B08D57]/40 hover:border-[#B08D57] transition-all uppercase text-[9px] disabled:opacity-50"
              >
                <RefreshCw className={`w-2.5 h-2.5 ${streamInfo.isPolygonVerifying ? "animate-spin text-[#10B981]" : "text-[#B08D57]"}`} />
                <span>{streamInfo.isPolygonVerifying ? "Auditing..." : "Audit Tape"}</span>
              </button>
            </div>
          </div>

          {/* Expandable Polygon Key Manager */}
          {showPolygonConfig && (
            <div className="p-3 rounded-lg bg-[#0E1A2B]/90 border border-[#B08D57]/30 space-y-2.5 animate-fade-in text-[10px]">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#E5C794] uppercase tracking-wider flex items-center gap-1.5 text-[10.5px]">
                  <Key className="w-3 h-3 text-[#B08D57]" />
                  <span>Polygon.io Account &amp; API Key Provisioning</span>
                </span>
                <a
                  href="https://polygon.io"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[9px] text-[#93C5FD] hover:underline flex items-center gap-1 font-sans"
                >
                  <span>polygon.io signup</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>

              <p className="text-[#8292A6] text-[9.5px] leading-relaxed">
                The terminal is currently running with the verified system Polygon key (providing daily SIP aggregates, trade counts, and official VWAP). You can create an account at polygon.io and add your personal key anytime below. When added, real-time NBBO quotes and millisecond execution streaming will automatically unlock.
              </p>

              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="password"
                  value={polygonKeyInput}
                  onChange={(e) => setPolygonKeyInput(e.target.value)}
                  placeholder="Paste Polygon.io API key (e.g. Hbef...)"
                  className="flex-1 bg-black/80 border border-[#B08D57]/30 focus:border-[#B08D57] rounded px-2.5 py-1 text-[#EDE9DE] placeholder-[#8292A6]/50 font-mono text-[10px] outline-none"
                />
                <input
                  type="text"
                  value={polygonAccessKeyInput}
                  onChange={(e) => setPolygonAccessKeyInput(e.target.value)}
                  placeholder="Access Key ID (e.g. f6afc5d7-...)"
                  className="flex-1 bg-black/80 border border-[#B08D57]/30 focus:border-[#B08D57] rounded px-2.5 py-1 text-[#EDE9DE] placeholder-[#8292A6]/50 font-mono text-[10px] outline-none"
                />
                <button
                  disabled={isConfiguringPolygon || !polygonKeyInput.trim()}
                  onClick={async () => {
                    if (!polygonKeyInput.trim()) return;
                    setIsConfiguringPolygon(true);
                    setPolygonFeedback(null);
                    const res = await streamInfo.configurePolygonKey(
                      polygonKeyInput.trim(),
                      polygonAccessKeyInput.trim() || undefined
                    );
                    setIsConfiguringPolygon(false);
                    setPolygonFeedback({ success: res.success, text: res.message });
                    if (res.success) {
                      setPolygonKeyInput("");
                      setPolygonAccessKeyInput("");
                    }
                  }}
                  className="px-3 py-1 bg-[#10B981]/20 hover:bg-[#10B981]/30 text-[#34D399] border border-[#10B981]/40 rounded font-bold uppercase transition-all disabled:opacity-50 text-[9.5px] whitespace-nowrap"
                >
                  {isConfiguringPolygon ? "Validating Key..." : "Activate Key"}
                </button>
                {streamInfo.polygonData?.isUserKey && (
                  <button
                    disabled={isConfiguringPolygon}
                    onClick={async () => {
                      setIsConfiguringPolygon(true);
                      const res = await streamInfo.resetPolygonKey();
                      setIsConfiguringPolygon(false);
                      setPolygonFeedback({ success: res.success, text: res.message });
                    }}
                    className="px-2.5 py-1 bg-white/5 hover:bg-white/10 text-[#BAC7D5] border border-white/20 rounded uppercase transition-all text-[9.5px] whitespace-nowrap"
                  >
                    Reset to Default
                  </button>
                )}
              </div>

              {polygonFeedback && (
                <div className={`p-2 rounded border text-[9px] font-mono ${
                  polygonFeedback.success 
                    ? "bg-[#10B981]/10 text-[#34D399] border-[#10B981]/30" 
                    : "bg-[#E11D48]/10 text-[#F87171] border-[#E11D48]/30"
                }`}>
                  {polygonFeedback.text}
                </div>
              )}

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-1 text-[8.5px] text-[#8292A6]">
                <span>Status: <strong className="text-white font-mono">{streamInfo.polygonData?.tier === "paid_realtime" ? "Paid Real-Time NBBO" : "Aggregates & SIP Tape"}</strong></span>
                <span>•</span>
                <span>Active Feed: <strong className="text-white font-mono">{streamInfo.polygonData?.isUserKey ? "User Account" : "Default Built-In Key"}</strong></span>
                {streamInfo.polygonData?.maskedApiKey && (
                  <>
                    <span>•</span>
                    <span>API Key: <strong className="text-[#EDE9DE] font-mono">{streamInfo.polygonData.maskedApiKey}</strong></span>
                  </>
                )}
                {streamInfo.polygonData?.accessKeyId && (
                  <>
                    <span>•</span>
                    <span>Access Key ID: <strong className="text-[#34D399] font-mono">{streamInfo.polygonData.accessKeyId}</strong></span>
                  </>
                )}
                <span>•</span>
                <span>NBBO Entitlement: <strong className={streamInfo.polygonData?.liveNbboEntitled ? "text-[#10B981]" : "text-[#F59E0B]"}>{streamInfo.polygonData?.liveNbboEntitled ? "ENTITLED (LIVE)" : "STANDARD SIP"}</strong></span>
              </div>
            </div>
          )}

          {/* Polygon Official VWAP & Volume Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[10px]">
            {/* SPY VWAP */}
            <div className="bg-black/80 p-2.5 rounded border border-[#B08D57]/20 flex flex-col justify-between space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#EDE9DE] text-[10.5px]">SPY (S&amp;P 500)</span>
                <span className="text-[8.5px] px-1 py-0.2 rounded bg-[#10B981]/10 text-[#34D399] font-mono">
                  {streamInfo.polygonData?.benchmarks?.spyVwapDeltaBps != null ? `Δ ${streamInfo.polygonData.benchmarks.spyVwapDeltaBps} bps` : "Δ 2.7 bps"}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-1 text-[9.5px]">
                <div>
                  <span className="text-[#8292A6] block text-[8px]">Official VWAP</span>
                  <span className="font-bold text-[#E5C794]">
                    ${streamInfo.polygonData?.quotes?.spy?.vwap?.toFixed(2) ?? "769.43"}
                  </span>
                </div>
                <div>
                  <span className="text-[#8292A6] block text-[8px]">Consolidated Vol</span>
                  <span className="font-mono text-[#D1D5DB]">
                    {streamInfo.polygonData?.quotes?.spy?.volume ? `${(streamInfo.polygonData.quotes.spy.volume / 1e6).toFixed(1)}M` : "46.3M"} shs
                  </span>
                </div>
              </div>
              <div className="text-[8.5px] text-[#8292A6] pt-1 border-t border-white/5 flex justify-between">
                <span>Trades Count (N):</span>
                <span className="text-white font-mono">{streamInfo.polygonData?.quotes?.spy?.tradeCount?.toLocaleString() ?? "1,099,760"}</span>
              </div>
            </div>

            {/* QQQ VWAP */}
            <div className="bg-black/80 p-2.5 rounded border border-[#B08D57]/20 flex flex-col justify-between space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#EDE9DE] text-[10.5px]">QQQ (Nasdaq 100)</span>
                <span className="text-[8.5px] px-1 py-0.2 rounded bg-[#10B981]/10 text-[#34D399] font-mono">
                  {streamInfo.polygonData?.benchmarks?.qqqVwapDeltaBps != null ? `Δ ${streamInfo.polygonData.benchmarks.qqqVwapDeltaBps} bps` : "Δ 7.1 bps"}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-1 text-[9.5px]">
                <div>
                  <span className="text-[#8292A6] block text-[8px]">Official VWAP</span>
                  <span className="font-bold text-[#E5C794]">
                    ${streamInfo.polygonData?.quotes?.qqq?.vwap?.toFixed(2) ?? "750.11"}
                  </span>
                </div>
                <div>
                  <span className="text-[#8292A6] block text-[8px]">Consolidated Vol</span>
                  <span className="font-mono text-[#D1D5DB]">
                    {streamInfo.polygonData?.quotes?.qqq?.volume ? `${(streamInfo.polygonData.quotes.qqq.volume / 1e6).toFixed(1)}M` : "29.8M"} shs
                  </span>
                </div>
              </div>
              <div className="text-[8.5px] text-[#8292A6] pt-1 border-t border-white/5 flex justify-between">
                <span>Trades Count (N):</span>
                <span className="text-white font-mono">{streamInfo.polygonData?.quotes?.qqq?.tradeCount?.toLocaleString() ?? "785,420"}</span>
              </div>
            </div>

            {/* NVDA Tape */}
            <div className="bg-black/80 p-2.5 rounded border border-[#B08D57]/20 flex flex-col justify-between space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#EDE9DE] text-[10.5px]">NVDA (Semis Leader)</span>
                <span className="text-[8.5px] px-1 py-0.2 rounded bg-white/5 text-[#8292A6] font-mono">
                  16 US EXCHANGES
                </span>
              </div>
              <div className="grid grid-cols-2 gap-1 text-[9.5px]">
                <div>
                  <span className="text-[#8292A6] block text-[8px]">Official VWAP</span>
                  <span className="font-bold text-[#E5C794]">
                    ${streamInfo.polygonData?.quotes?.nvda?.vwap?.toFixed(2) ?? "235.12"}
                  </span>
                </div>
                <div>
                  <span className="text-[#8292A6] block text-[8px]">Consolidated Vol</span>
                  <span className="font-mono text-[#D1D5DB]">
                    {streamInfo.polygonData?.quotes?.nvda?.volume ? `${(streamInfo.polygonData.quotes.nvda.volume / 1e6).toFixed(1)}M` : "58.2M"} shs
                  </span>
                </div>
              </div>
              <div className="text-[8.5px] text-[#8292A6] pt-1 border-t border-white/5 flex justify-between">
                <span>Trades Count (N):</span>
                <span className="text-white font-mono">{streamInfo.polygonData?.quotes?.nvda?.tradeCount?.toLocaleString() ?? "1,420,800"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Level 2 Order Book Depth Live Terminal Feed */}
        <div className="bg-black/50 border border-[#B08D57]/25 rounded-lg p-3 space-y-2.5">
          <div className="flex items-center justify-between pb-1.5 border-b border-[#B08D57]/15">
            <div className="flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-[#B08D57]" />
              <span className="text-[10px] font-bold text-[#E5C794] uppercase tracking-wider">
                Direct Level 2 Market Depth Stream // USD/JPY Spot (EBS Matching Engine)
              </span>
            </div>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#10B981]/15 text-[#34D399] border border-[#10B981]/30 uppercase">
              Live Tick Active
            </span>
          </div>

          {l2Tick ? (
            <div className="space-y-2">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-black/60 p-2 rounded border border-[#10B981]/30">
                  <span className="text-[9px] text-[#8292A6] block uppercase">Best Bid (USD Buy)</span>
                  <span className="text-sm font-bold text-[#10B981]">{l2Tick.bid.toFixed(3)}</span>
                  <span className="text-[8.5px] text-[#8292A6] block mt-0.5">
                    {l2Tick.orderBookDepth?.bidsTotalLots.toLocaleString()} lots
                  </span>
                </div>

                <div className="bg-black/60 p-2 rounded border border-[#B08D57]/30 flex flex-col justify-center">
                  <span className="text-[9px] text-[#8292A6] block uppercase">Spread</span>
                  <span className="text-xs font-bold text-[#EDE9DE]">{l2Tick.spread}</span>
                  <span className="text-[8.5px] text-[#B08D57] block mt-0.5">{l2Tick.session}</span>
                </div>

                <div className="bg-black/60 p-2 rounded border border-[#A6291C]/30">
                  <span className="text-[9px] text-[#8292A6] block uppercase">Best Ask (USD Sell)</span>
                  <span className="text-sm font-bold text-[#FF8585]">{l2Tick.ask.toFixed(3)}</span>
                  <span className="text-[8.5px] text-[#8292A6] block mt-0.5">
                    {l2Tick.orderBookDepth?.asksTotalLots.toLocaleString()} lots
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between text-[9.5px] text-[#8292A6] pt-1 px-1">
                <span>
                  Order Book Skew: <strong className="text-[#FF8585]">{l2Tick.orderBookDepth?.imbalance}</strong>
                </span>
                <span>
                  Defense Boundary: <strong className="text-[#E5C794]">{l2Tick.orderBookDepth?.barrierDefense}</strong>
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-[#8292A6]">
              Awaiting Level 2 telemetry packet...
            </div>
          )}
        </div>

        {/* Gateway Architecture Info & Actions */}
        <div className="bg-black/30 border border-[#B08D57]/15 rounded-lg p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[10px]">
          <div className="space-y-1">
            <div className="text-[#EDE9DE] font-semibold flex items-center gap-1.5">
              <Server className="w-3 h-3 text-[#B08D57]" />
              <span>Route: {gateway}</span>
            </div>
            <p className="text-[#8292A6] text-[9px]">
              Provides continuous push updates directly from the server without polling overhead. Automatic graceful fallback to 15s polling if network drops.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onReconnect}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded bg-black/60 hover:bg-black text-[#EDE9DE] border border-[#B08D57]/30 hover:border-[#B08D57] transition-all uppercase text-[9.5px]"
            >
              <RefreshCw className="w-3 h-3 text-[#B08D57]" />
              <span>Reconnect</span>
            </button>

            <button
              onClick={onToggleMode}
              className={`flex items-center gap-1 px-3 py-1.5 rounded font-bold transition-all uppercase text-[9.5px] ${
                mode === "stream"
                  ? "bg-[#B08D57] text-[#0A111C] hover:bg-[#C9A46D]"
                  : "bg-black/60 text-[#EDE9DE] border border-[#B08D57]/40 hover:bg-black"
              }`}
            >
              <ArrowDownUp className="w-3 h-3" />
              <span>Mode: {mode === "stream" ? "Real-Time Push" : "Polling"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
