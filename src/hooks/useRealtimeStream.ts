import { useState, useEffect, useRef, useCallback, useMemo } from "react";
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
  isUserKey?: boolean;
  tier?: "free_aggregates" | "paid_realtime";
  liveNbboEntitled?: boolean;
  lastSync: number | null;
  latencyMs: number;
  marketStatus: string | null;
  serverTime?: string | null;
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
  configurePolygonKey: (key: string) => Promise<{ success: boolean; message: string; tier?: string; liveNbboEntitled?: boolean }>;
  resetPolygonKey: () => Promise<{ success: boolean; message: string }>;
}

function buildDefaultWsUrl() {
  try {
    // Prefer explicit env (via Vite) if set, otherwise try same-origin websocket, otherwise localhost:8001
    // Vite exposes env vars as import.meta.env.VITE_WS_URL
    // @ts-ignore
    const fromEnv = import.meta?.env?.VITE_WS_URL as string | undefined;
    if (fromEnv) return fromEnv;
  } catch (e) {}

  try {
    const loc = window.location;
    const proto = loc.protocol === "https:" ? "wss" : "ws";
    // If frontend and backend are same host and proxied, use relative host
    if (loc.port) {
      return `${proto}://${loc.hostname}:8001/ws/live`;
    }
    return `${proto}://${loc.hostname}/ws/live`;
  } catch (e) {
    return `ws://localhost:8001/ws/live`;
  }
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

  const configurePolygonKey = useCallback(async (key: string) => {
    setIsPolygonVerifying(true);
    try {
      const res = await fetch("/api/polygon/configure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: key })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        // Refresh polygon status
        const statRes = await fetch("/api/polygon/status");
        if (statRes.ok) {
          const statData = await statRes.json();
          setPolygonData(statData);
        }
        return {
          success: true,
          message: data.message,
          tier: data.tier,
          liveNbboEntitled: data.liveNbboEntitled
        };
      } else {
        return { success: false, message: data.message || "Failed to configure Polygon key" };
      }
    } catch (err: any) {
      return { success: false, message: err?.message || "Network error while validating key" };
    } finally {
      setIsPolygonVerifying(false);
    }
  }, []);

  const resetPolygonKey = useCallback(async () => {
    setIsPolygonVerifying(true);
    try {
      const res = await fetch("/api/polygon/reset-key", { method: "POST" });
      const data = await res.json();
      const statRes = await fetch("/api/polygon/status");
      if (statRes.ok) {
        const statData = await statRes.json();
        setPolygonData(statData);
      }
      return { success: true, message: data.message || "Reverted to default Polygon feed" };
    } catch (err: any) {
      return { success: false, message: err?.message || "Failed to reset Polygon key" };
    } finally {
      setIsPolygonVerifying(false);
    }
  }, []);

  const wsRef = useRef<WebSocket | null>(null);
  const onMacroUpdateRef = useRef(onMacroUpdate);
  const packetCountRef = useRef(0);
  const lastPacketTimeRef = useRef<number | null>(null);
  const lastTelemetryFlushRef = useRef<number>(0);
  const lastL2TickTimeRef = useRef<number>(0);
  const reconnectAttemptsRef = useRef(0);
  const wsUrl = useMemo(() => buildDefaultWsUrl(), []);

  useEffect(() => {
    onMacroUpdateRef.current = onMacroUpdate;
  }, [onMacroUpdate]);

  const flushTelemetry = useCallback(() => {
    const now = Date.now();
    if (now - lastTelemetryFlushRef.current >= 3000) {
      lastTelemetryFlushRef.current = now;
      setPacketsReceived(packetCountRef.current);
      if (lastPacketTimeRef.current) {
        setLastPacketTime(lastPacketTimeRef.current);
      }
    }
  }, []);

  const createWebSocket = useCallback(() => {
    try {
      if (wsRef.current) {
        try {
          wsRef.current.close();
        } catch (e) {}
        wsRef.current = null;
      }

      if (mode !== "stream") {
        setIsConnected(false);
        return;
      }

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        reconnectAttemptsRef.current = 0;
        setIsConnected(true);
        setProtocol("SMC-STREAM-L2");
      };

      ws.onmessage = (evt: MessageEvent) => {
        try {
          const data = JSON.parse(evt.data);
          packetCountRef.current += 1;
          lastPacketTimeRef.current = Date.now();

          // Handle different message shapes for backward compatibility
          const eventType = (data.event || data.type || "tick").toLowerCase();

          if (eventType === "tick" || eventType === "macro-pulse") {
            // macro update payload
            flushTelemetry();
            setIsConnected((prev) => (prev ? prev : true));
            if (onMacroUpdateRef.current) onMacroUpdateRef.current(data as MacroDataState);
          } else if (eventType === "l2-depth") {
            const now = Date.now();
            if (now - lastL2TickTimeRef.current >= 1500) {
              lastL2TickTimeRef.current = now;
              setL2Tick(data as L2DepthTick);
            }
            flushTelemetry();
          } else if (eventType === "ping" && data.t) {
            const transit = Math.max(8, Math.min(3000, Date.now() - data.t));
            const now = Date.now();
            if (now - lastTelemetryFlushRef.current >= 3000) {
              setLatencyMs(transit);
            }
          } else {
            // Generic object: attempt to treat as macro update
            if (onMacroUpdateRef.current && data) onMacroUpdateRef.current(data as MacroDataState);
          }
        } catch (err) {
          // ignore parse errors
        }
      };

      ws.onerror = () => {
        setIsConnected(false);
      };

      ws.onclose = () => {
        setIsConnected(false);
        // reconnect with backoff
        reconnectAttemptsRef.current += 1;
        const backoff = Math.min(30_000, 500 * Math.pow(2, Math.min(6, reconnectAttemptsRef.current)));
        setTimeout(() => {
          if (mode === "stream") createWebSocket();
        }, backoff);
      };

    } catch (err) {
      console.warn("Realtime websocket failed, fallback will be used:", err);
      setIsConnected(false);
    }
  }, [mode, wsUrl, flushTelemetry]);

  useEffect(() => {
    if (mode === "stream") createWebSocket();
    return () => {
      try {
        if (wsRef.current) {
          wsRef.current.close();
          wsRef.current = null;
        }
      } catch (e) {}
    };
  }, [createWebSocket, mode]);

  const toggleMode = useCallback(() => {
    setMode((prev) => (prev === "stream" ? "polling" : "stream"));
  }, []);

  const reconnect = useCallback(() => {
    if (mode === "stream") createWebSocket();
  }, [createWebSocket, mode]);

  return useMemo(
    () => ({
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
      configurePolygonKey,
      resetPolygonKey,
      toggleMode,
      reconnect,
    }),
    [
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
      configurePolygonKey,
      resetPolygonKey,
      toggleMode,
      reconnect,
    ]
  );
}
