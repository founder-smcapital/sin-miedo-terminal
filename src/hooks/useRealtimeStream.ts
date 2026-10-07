import { useState, useEffect, useRef, useCallback } from "react";
import { MacroDataState } from "../types";

export interface L2DepthTick {
  symbol: string;
  bid: number;
  ask: number;
  spread: string;
  session: string;
  orderBookDepth?: {
    bidsTotalLots: number;
    asksTotalLots: number;
    imbalance: string;
    barrierDefense: string;
  };
  timestamp: number;
}

export interface OpenMarketQuota {
  limit: number;
  remaining: number;
  used: number;
  window_seconds: number;
  daily?: {
    limit: number;
    used: number;
    remaining: number;
    reset: number;
  };
}

export interface BenchmarkComparison {
  localPrice: number;
  openMarketPrice: number;
  deltaBps: number;
  deltaPct: number;
  matchStatus: "INSTITUTIONAL_MATCH" | "TIGHT_ARBITRAGE" | "SPREAD_DRIFT";
  exchange: string;
  rawSymbol: string;
  timestamp: number;
}

export interface OpenMarketValidationData {
  status: "connected" | "unconfigured" | "rate_limited" | "error";
  tier: string;
  keyConfigured: boolean;
  quota: OpenMarketQuota | null;
  lastVerifiedAt: number | null;
  latencyMs: number;
  benchmarks: {
    btc: BenchmarkComparison | null;
    eth: BenchmarkComparison | null;
  };
  error: string | null;
}

export interface FinnhubQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePct: number;
  high: number;
  low: number;
  open: number;
  prevClose: number;
  timestamp: number;
}

export interface FinnhubValidationData {
  status: "connected" | "unconfigured" | "error";
  keyConfigured: boolean;
  lastSync: number | null;
  latencyMs: number;
  quotes: {
    spy: FinnhubQuote | null;
    qqq: FinnhubQuote | null;
    nvda: FinnhubQuote | null;
    aapl: FinnhubQuote | null;
    tsla: FinnhubQuote | null;
    msft?: FinnhubQuote | null;
    btc?: FinnhubQuote | null;
  };
  benchmarks: {
    sp500: {
      localPrice: number;
      finnhubDerived: number;
      deltaBps: number;
      matchStatus: string;
    } | null;
    nasdaq: {
      localPrice: number;
      finnhubDerived: number;
      deltaBps: number;
      matchStatus: string;
    } | null;
    btcConsensus?: {
      localPrice: number;
      finnhubBinance: number;
      deltaBps: number;
      matchStatus: string;
    } | null;
  };
  news?: Array<{
    id: number;
    headline: string;
    source: string;
    time: number;
    url: string;
  }>;
  error: string | null;
}

export interface PolygonQuote {
  ticker: string;
  close: number;
  open: number;
  high: number;
  low: number;
  volume: number;
  vwap: number;
  tradeCount: number;
  timestamp: number;
}

export interface PolygonValidationData {
  status: "connected" | "unconfigured" | "error";
  keyConfigured: boolean;
  lastSync: number | null;
  latencyMs: number;
  marketStatus: string | null;
  quotes: {
    spy: PolygonQuote | null;
    qqq: PolygonQuote | null;
    nvda: PolygonQuote | null;
    aapl: PolygonQuote | null;
    btc: PolygonQuote | null;
  };
  benchmarks: {
    spyVwapDeltaBps: number | null;
    qqqVwapDeltaBps: number | null;
  };
  error: string | null;
}

export interface StreamGatewayInfo {
  isConnected: boolean;
  protocol: string;
  gateway: string;
  latencyMs: number;
  packetsReceived: number;
  lastPacketTime: number | null;
  mode: "stream" | "polling";
  l2Tick: L2DepthTick | null;
  openMarketData: OpenMarketValidationData | null;
  isOpenMarketVerifying: boolean;
  triggerOpenMarketVerify: () => Promise<void>;
  finnhubData: FinnhubValidationData | null;
  isFinnhubVerifying: boolean;
  triggerFinnhubVerify: () => Promise<void>;
  polygonData: PolygonValidationData | null;
  isPolygonVerifying: boolean;
  triggerPolygonVerify: () => Promise<void>;
}

export function useRealtimeStream(
  onMacroUpdate?: (data: MacroDataState) => void,
  initialMode: "stream" | "polling" = "stream"
) {
  const [mode, setMode] = useState<"stream" | "polling">(initialMode);
  const [isConnected, setIsConnected] = useState(false);
  const [protocol, setProtocol] = useState("SMC-STREAM-L2");
  const [gateway, setGateway] = useState("Tokyo-London-Chicago Gateway");
  const [latencyMs, setLatencyMs] = useState(14);
  const [packetsReceived, setPacketsReceived] = useState(0);
  const [lastPacketTime, setLastPacketTime] = useState<number | null>(null);
  const [openMarketData, setOpenMarketData] = useState<OpenMarketValidationData | null>(null);
  const [isOpenMarketVerifying, setIsOpenMarketVerifying] = useState(false);
  const [finnhubData, setFinnhubData] = useState<FinnhubValidationData | null>(null);
  const [isFinnhubVerifying, setIsFinnhubVerifying] = useState(false);
  const [polygonData, setPolygonData] = useState<PolygonValidationData | null>(null);
  const [isPolygonVerifying, setIsPolygonVerifying] = useState(false);
  const [l2Tick, setL2Tick] = useState<L2DepthTick | null>({
    symbol: "USD/JPY",
    bid: 156.245,
    ask: 156.255,
    spread: "1.0 pip",
    session: "Tokyo/London Core",
    orderBookDepth: {
      bidsTotalLots: 1980,
      asksTotalLots: 2540,
      imbalance: "-22% (JPY Ask Skew)",
      barrierDefense: "160.50 (BoJ Knock-in)"
    },
    timestamp: Date.now()
  });

  // Initial fetch of OpenMarket & Finnhub status
  useEffect(() => {
    fetch("/api/openmarket/status")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setOpenMarketData(data);
      })
      .catch(() => {});

    fetch("/api/finnhub/status")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setFinnhubData(data);
      })
      .catch(() => {});

    fetch("/api/polygon/status")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setPolygonData(data);
      })
      .catch(() => {});
  }, []);

  const triggerOpenMarketVerify = useCallback(async () => {
    setIsOpenMarketVerifying(true);
    try {
      const res = await fetch("/api/openmarket/verify", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setOpenMarketData(data);
      }
    } catch (e) {
      console.warn("Manual OpenMarket verify failed:", e);
    } finally {
      setIsOpenMarketVerifying(false);
    }
  }, []);

  const triggerFinnhubVerify = useCallback(async () => {
    setIsFinnhubVerifying(true);
    try {
      const res = await fetch("/api/finnhub/verify", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setFinnhubData(data);
      }
    } catch (e) {
      console.warn("Manual Finnhub verify failed:", e);
    } finally {
      setIsFinnhubVerifying(false);
    }
  }, []);

  const triggerPolygonVerify = useCallback(async () => {
    setIsPolygonVerifying(true);
    try {
      const res = await fetch("/api/polygon/verify", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setPolygonData(data);
      }
    } catch (e) {
      console.warn("Manual Polygon verify failed:", e);
    } finally {
      setIsPolygonVerifying(false);
    }
  }, []);

  const eventSourceRef = useRef<EventSource | null>(null);
  const onMacroUpdateRef = useRef(onMacroUpdate);

  useEffect(() => {
    onMacroUpdateRef.current = onMacroUpdate;
  }, [onMacroUpdate]);

  const connectStream = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    if (mode !== "stream") {
      setIsConnected(false);
      return;
    }

    try {
      const es = new EventSource("/api/macro/stream");
      eventSourceRef.current = es;

      es.addEventListener("open", () => {
        setIsConnected(true);
      });

      es.addEventListener("handshake", (e) => {
        try {
          const data = JSON.parse(e.data);
          if (data.protocol) setProtocol(data.protocol);
          if (data.gateway) setGateway(data.gateway);
          if (data.latencyTargetMs) setLatencyMs(data.latencyTargetMs);
          setIsConnected(true);
        } catch (err) {
          // ignore parse error
        }
      });

      es.addEventListener("macro-pulse", (e) => {
        try {
          const data = JSON.parse(e.data);
          setPacketsReceived((prev) => prev + 1);
          setLastPacketTime(Date.now());
          setIsConnected(true);
          if (onMacroUpdateRef.current) {
            onMacroUpdateRef.current(data);
          }
        } catch (err) {
          // ignore
        }
      });

      es.addEventListener("l2-depth", (e) => {
        try {
          const tick = JSON.parse(e.data);
          setL2Tick(tick);
          setPacketsReceived((prev) => prev + 1);
          setLastPacketTime(Date.now());
        } catch (err) {
          // ignore
        }
      });

      es.addEventListener("openmarket-verify", (e) => {
        try {
          const data = JSON.parse(e.data);
          setOpenMarketData(data);
        } catch (err) {
          // ignore
        }
      });

      es.addEventListener("finnhub-verify", (e) => {
        try {
          const data = JSON.parse(e.data);
          setFinnhubData(data);
        } catch (err) {
          // ignore
        }
      });

      es.addEventListener("polygon-verify", (e) => {
        try {
          const data = JSON.parse(e.data);
          setPolygonData(data);
        } catch (err) {
          // ignore
        }
      });

      es.addEventListener("ping", (e) => {
        try {
          const data = JSON.parse(e.data);
          if (data.t) {
            const transit = Math.max(8, Math.min(65, Date.now() - data.t));
            setLatencyMs(transit);
          }
        } catch (err) {
          // ignore
        }
      });

      es.onerror = () => {
        setIsConnected(false);
        // Browser EventSource automatically reconnects; we keep isConnected updated
      };
    } catch (err) {
      console.warn("Direct stream gateway fallback to polling:", err);
      setIsConnected(false);
    }
  }, [mode]);

  useEffect(() => {
    connectStream();
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [connectStream]);

  const toggleMode = useCallback(() => {
    setMode((prev) => (prev === "stream" ? "polling" : "stream"));
  }, []);

  const reconnect = useCallback(() => {
    connectStream();
  }, [connectStream]);

  return {
    isConnected,
    protocol,
    gateway,
    latencyMs,
    packetsReceived,
    lastPacketTime,
    mode,
    l2Tick,
    openMarketData,
    isOpenMarketVerifying,
    triggerOpenMarketVerify,
    finnhubData,
    isFinnhubVerifying,
    triggerFinnhubVerify,
    polygonData,
    isPolygonVerifying,
    triggerPolygonVerify,
    toggleMode,
    reconnect
  };
}

