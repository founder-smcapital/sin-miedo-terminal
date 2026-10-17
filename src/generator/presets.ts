/**
 * Institutional Asset Presets and Market Timeframe Definitions
 * Provides calibrated historical baseline volatilities, tick sizes,
 * venue mappings, and timeframe conversions across Equities, FX, Crypto, and Commodities.
 */

import { SymbolParameters, MarketTimeframe } from "./types";

export const TIMEFRAME_MS: Record<MarketTimeframe, number> = {
  tick: 250,            // Average tick inter-arrival time (250ms)
  "1s": 1_000,
  "5s": 5_000,
  "1m": 60_000,
  "5m": 300_000,
  "15m": 900_000,
  "30m": 1_800_000,
  "1h": 3_600_000,
  "4h": 14_400_000,
  "1d": 86_400_000
};

export const PRESET_SYMBOLS: Record<string, SymbolParameters> = {
  // US Equities & ETFs
  SPY: {
    symbol: "SPY",
    assetClass: "EQUITIES",
    startPrice: 582.50,
    annualVolatility: 0.16,
    annualDrift: 0.08,
    tickSize: 0.01,
    venue: "XNYS",
    currency: "USD",
    averageSpreadBps: 1.0,
    averageTradeVolume: 200
  },
  AAPL: {
    symbol: "AAPL",
    assetClass: "EQUITIES",
    startPrice: 231.25,
    annualVolatility: 0.22,
    annualDrift: 0.10,
    tickSize: 0.01,
    venue: "XNAS",
    currency: "USD",
    averageSpreadBps: 1.5,
    averageTradeVolume: 100
  },
  NVDA: {
    symbol: "NVDA",
    assetClass: "EQUITIES",
    startPrice: 135.00,
    annualVolatility: 0.45,
    annualDrift: 0.18,
    tickSize: 0.01,
    venue: "XNAS",
    currency: "USD",
    averageSpreadBps: 2.0,
    averageTradeVolume: 150
  },
  MSFT: {
    symbol: "MSFT",
    assetClass: "EQUITIES",
    startPrice: 420.00,
    annualVolatility: 0.20,
    annualDrift: 0.09,
    tickSize: 0.01,
    venue: "XNAS",
    currency: "USD",
    averageSpreadBps: 1.5,
    averageTradeVolume: 100
  },
  TSLA: {
    symbol: "TSLA",
    assetClass: "EQUITIES",
    startPrice: 220.00,
    annualVolatility: 0.55,
    annualDrift: 0.12,
    tickSize: 0.01,
    venue: "XNAS",
    currency: "USD",
    averageSpreadBps: 3.0,
    averageTradeVolume: 100
  },

  // Foreign Exchange (FX)
  "EUR/USD": {
    symbol: "EUR/USD",
    assetClass: "FX",
    startPrice: 1.0850,
    annualVolatility: 0.07,
    annualDrift: 0.0,
    tickSize: 0.0001,
    venue: "FX",
    currency: "USD",
    averageSpreadBps: 0.8,
    averageTradeVolume: 1000000
  },
  "GBP/USD": {
    symbol: "GBP/USD",
    assetClass: "FX",
    startPrice: 1.3020,
    annualVolatility: 0.09,
    annualDrift: 0.0,
    tickSize: 0.0001,
    venue: "FX",
    currency: "USD",
    averageSpreadBps: 1.2,
    averageTradeVolume: 1000000
  },
  "USD/JPY": {
    symbol: "USD/JPY",
    assetClass: "FX",
    startPrice: 149.50,
    annualVolatility: 0.11,
    annualDrift: 0.0,
    tickSize: 0.01,
    venue: "FX",
    currency: "JPY",
    averageSpreadBps: 1.0,
    averageTradeVolume: 1000000
  },

  // Crypto Assets
  "BTC/USD": {
    symbol: "BTC/USD",
    assetClass: "CRYPTO",
    startPrice: 65400.00,
    annualVolatility: 0.58,
    annualDrift: 0.25,
    tickSize: 0.50,
    venue: "CRYPTO",
    currency: "USD",
    averageSpreadBps: 2.0,
    averageTradeVolume: 0.25
  },
  "ETH/USD": {
    symbol: "ETH/USD",
    assetClass: "CRYPTO",
    startPrice: 2620.00,
    annualVolatility: 0.68,
    annualDrift: 0.20,
    tickSize: 0.10,
    venue: "CRYPTO",
    currency: "USD",
    averageSpreadBps: 3.5,
    averageTradeVolume: 2.5
  },
  "SOL/USD": {
    symbol: "SOL/USD",
    assetClass: "CRYPTO",
    startPrice: 154.00,
    annualVolatility: 0.82,
    annualDrift: 0.30,
    tickSize: 0.02,
    venue: "CRYPTO",
    currency: "USD",
    averageSpreadBps: 4.5,
    averageTradeVolume: 15
  },

  // Commodities & Futures
  ES_F: {
    symbol: "ES_F",
    assetClass: "COMMODITIES",
    startPrice: 5850.25,
    annualVolatility: 0.17,
    annualDrift: 0.07,
    tickSize: 0.25,
    venue: "XCME",
    currency: "USD",
    averageSpreadBps: 1.0,
    averageTradeVolume: 5
  },
  CL_F: {
    symbol: "CL_F",
    assetClass: "COMMODITIES",
    startPrice: 70.80,
    annualVolatility: 0.35,
    annualDrift: 0.02,
    tickSize: 0.01,
    venue: "XNYM",
    currency: "USD",
    averageSpreadBps: 2.5,
    averageTradeVolume: 10
  },
  GC_F: {
    symbol: "GC_F",
    assetClass: "COMMODITIES",
    startPrice: 2680.50,
    annualVolatility: 0.15,
    annualDrift: 0.05,
    tickSize: 0.10,
    venue: "XCEC",
    currency: "USD",
    averageSpreadBps: 1.5,
    averageTradeVolume: 5
  }
};

export const PRESET_GROUPS: Record<string, string[]> = {
  equities: ["SPY", "AAPL", "NVDA", "MSFT", "TSLA"],
  fx: ["EUR/USD", "GBP/USD", "USD/JPY"],
  crypto: ["BTC/USD", "ETH/USD", "SOL/USD"],
  futures: ["ES_F", "CL_F", "GC_F"],
  all: ["SPY", "AAPL", "EUR/USD", "BTC/USD", "ES_F"]
};

/**
 * Resolves symbol parameters from string or partial definition
 */
export function resolveSymbolParameters(input: string | Partial<SymbolParameters>): SymbolParameters {
  if (typeof input === "string") {
    const uppercase = input.trim().toUpperCase();
    if (PRESET_SYMBOLS[uppercase]) {
      return { ...PRESET_SYMBOLS[uppercase] };
    }

    // Auto-detect asset class if unknown symbol
    let detectedClass: SymbolParameters["assetClass"] = "EQUITIES";
    let tickSize = 0.01;
    let startPrice = 100.0;
    let venue = "XNAS";

    if (uppercase.includes("/") || uppercase.endsWith("=X")) {
      detectedClass = "FX";
      tickSize = 0.0001;
      startPrice = 1.1000;
      venue = "FX";
    } else if (uppercase.includes("-USD") || uppercase.includes("/USD") || uppercase.startsWith("BTC") || uppercase.startsWith("ETH")) {
      detectedClass = "CRYPTO";
      tickSize = 0.50;
      startPrice = 1000.0;
      venue = "CRYPTO";
    } else if (uppercase.endsWith("_F") || uppercase.endsWith("=F")) {
      detectedClass = "COMMODITIES";
      tickSize = 0.25;
      startPrice = 5000.0;
      venue = "XCME";
    }

    return {
      symbol: uppercase,
      assetClass: detectedClass,
      startPrice,
      annualVolatility: 0.25,
      annualDrift: 0.05,
      tickSize,
      venue,
      currency: "USD",
      averageSpreadBps: 2.0,
      averageTradeVolume: 100
    };
  }

  // Merging provided partial parameters with defaults
  const symbol = (input.symbol || "GENERIC").toUpperCase();
  const base = PRESET_SYMBOLS[symbol] || {
    symbol,
    assetClass: input.assetClass || "EQUITIES",
    startPrice: 100.0,
    annualVolatility: 0.25,
    annualDrift: 0.05,
    tickSize: 0.01,
    venue: "XNAS",
    currency: "USD",
    averageSpreadBps: 2.0,
    averageTradeVolume: 100
  };

  return {
    ...base,
    ...input,
    symbol
  };
}

/**
 * Converts a timeframe string into milliseconds
 */
export function parseTimeframeToMs(timeframe?: MarketTimeframe): number {
  if (!timeframe) return TIMEFRAME_MS["1m"];
  return TIMEFRAME_MS[timeframe] || TIMEFRAME_MS["1m"];
}
