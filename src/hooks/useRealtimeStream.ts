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
  accessKeyId?: string | null;
  maskedApiKey?: string | null;
  quotes: {
    spy: PolygonQuote | null;
    qqq: PolygonQuote | null;
    nvda: PolygonQuote | null;
    aapl: PolygonQuote | null;
    btc: PolygonQuote | null;
    uso?: PolygonQuote | null;
  };
  benchmarks: {
    spyVwapDeltaBps: number | null;
    qqqVwapDeltaBps: number | null;
  };
  error: string | null;
}

export interface MarketValidationMetrics {
  totalReceived: number;
  totalValid: number;
  totalQuarantined: number;
  totalDropped: number;
  violationsByCategory: Record<string, number>;
  dlqSize: number;
}

export interface DriftMetric {
  symbol: string;
  streamingPrice: number;
  benchmarkPrice: number;
  basisPointsDrift: number;
  percentageDrift: number;
  driftRegime: "SYNCHRONIZED" | "EXPANDING_DRIFT" | "STRUCTURAL_DESYNC";
  isTightlyCorrelated: boolean;
  sampleCount: number;
  timestamp: number;
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
  configurePolygonKey: (key: string, accessKeyId?: string) => Promise<{ success: boolean; message: string; tier?: string; liveNbboEntitled?: boolean }>;
  resetPolygonKey: () => Promise<{ success: boolean; message: string }>;
  validationTelemetry: MarketValidationMetrics | null;
  driftMetrics: DriftMetric[];
  isGeneratingSynthetic: boolean;
  triggerSyntheticSim: (preset?: string) => Promise<{ success: boolean; message: string }>;
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
  const [validationTelemetry, setValidationTelemetry] = useState<MarketValidationMetrics | null>(null);
  const [driftMetrics, setDriftMetrics] = useState<DriftMetric[]>([]);
  const [isGeneratingSynthetic, setIsGeneratingSynthetic] = useState(false);
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

  // Initial fetch of OpenMarket, Finnhub, Polygon & Validation status
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

    fetch("/api/v1/validation/telemetry")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.metrics) setValidationTelemetry(data.metrics);
      })
      .catch(() => {});

    fetch("/api/v1/reconciliation/drift-metrics")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.metrics) setDriftMetrics(data.metrics);
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

  const configurePolygonKey = useCallback(async (key: string, accessKeyId?: string) => {
    setIsPolygonVerifying(true);
    try {
      const res = await fetch("/api/polygon/configure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: key, accessKeyId })
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

  const triggerSyntheticSim = useCallback(async (preset = "VOLATILE_REGIME") => {
    setIsGeneratingSynthetic(true);
    try {
      const res = await fetch("/api/v1/generator/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol: "ES", preset, barCount: 15 })
      });
      if (res.ok) {
        const data = await res.json();
        // Immediately refresh validation telemetry
        const valRes = await fetch("/api/v1/validation/telemetry");
        if (valRes.ok) {
          const valData = await valRes.json();
          if (valData.metrics) setValidationTelemetry(valData.metrics);
        }
        return { success: true, message: `Synthesized ${data.bars?.length || 15} Merton Jump Diffusion bars for ${preset}` };
      }
      return { success: false, message: "Synthetic generator returned non-200" };
    } catch (err: any) {
      return { success: false, message: err?.message || "Synthetic simulation network error" };
    } finally {
      setIsGeneratingSynthetic(false);
    }
  }, []);

  const eventSourceRef = useRef<EventSource | null>(null);
  const onMacroUpdateRef = useRef(onMacroUpdate);
  const packetCountRef = useRef(0);
  const lastPacketTimeRef = useRef<number | null>(null);
  const lastTelemetryFlushRef = useRef<number>(0);
  const lastL2TickTimeRef = useRef<number>(0);

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
          packetCountRef.current += 1;
          lastPacketTimeRef.current = Date.now();
          flushTelemetry();
          setIsConnected((prev) => (prev ? prev : true));
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
          packetCountRef.current += 1;
          lastPacketTimeRef.current = Date.now();
          const now = Date.now();
          // Throttle L2 depth state renders to at most 1 every 1500ms to keep client CPU cool
          if (now - lastL2TickTimeRef.current >= 1500) {
            lastL2TickTimeRef.current = now;
            setL2Tick(tick);
          }
          flushTelemetry();
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

      es.addEventListener("validation-telemetry", (e) => {
        try {
          const data = JSON.parse(e.data);
          setValidationTelemetry(data);
        } catch (err) {
          // ignore
        }
      });

      es.addEventListener("drift-metrics", (e) => {
        try {
          const data = JSON.parse(e.data);
          if (Array.isArray(data)) setDriftMetrics(data);
        } catch (err) {
          // ignore
        }
      });

      es.addEventListener("ping", (e) => {
        try {
          const data = JSON.parse(e.data);
          if (data.t) {
            const transit = Math.max(8, Math.min(65, Date.now() - data.t));
            // Only update latency state when elapsed to prevent micro-jitter render loops
            const now = Date.now();
            if (now - lastTelemetryFlushRef.current >= 3000) {
              setLatencyMs(transit);
            }
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
  }, [mode, flushTelemetry]);

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
      validationTelemetry,
      driftMetrics,
      isGeneratingSynthetic,
      triggerSyntheticSim,
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
      validationTelemetry,
      driftMetrics,
      isGeneratingSynthetic,
      triggerSyntheticSim,
      toggleMode,
      reconnect,
    ]
  );
}

