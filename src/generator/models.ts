/**
 * Quantitative Financial Pricing Physics & Microstructure Models
 * Implements Geometric Brownian Motion (GBM), Merton Jump-Diffusion,
 * realistic bid-ask spread microstructure, and OHLC bar synthesis.
 */

import { SeededPRNG } from "./prng";
import { SymbolParameters } from "./types";

export interface StepDiffusionResult {
  nextPrice: number;
  returnPct: number;
  isJump: boolean;
}

export class FinancialPricingModel {
  private prng: SeededPRNG;

  constructor(prng: SeededPRNG) {
    this.prng = prng;
  }

  /**
   * Calculates time step dt as fraction of an annualized year
   * 252 trading days * 6.5 hours for Equities, 365.25 * 24h for Crypto/FX
   */
  public getYearFraction(intervalMs: number, assetClass: string): number {
    const isCrypto = assetClass === "CRYPTO";
    const totalTradingMsPerYear = isCrypto
      ? 365.25 * 24 * 3600 * 1000       // ~31.557e9 ms
      : 252 * 6.5 * 3600 * 1000;         // ~5.896e9 ms
    return intervalMs / totalTradingMsPerYear;
  }

  /**
   * Advances price by dt using Geometric Brownian Motion with Merton Jump Diffusion
   */
  public stepPrice(
    currentPrice: number,
    params: SymbolParameters,
    intervalMs: number,
    options?: { jumpIntensity?: number; jumpMean?: number; jumpVol?: number }
  ): StepDiffusionResult {
    const dt = this.getYearFraction(intervalMs, params.assetClass);
    const mu = params.annualDrift ?? 0.05;
    const sigma = params.annualVolatility;

    // Standard Wiener process increment: dW = sqrt(dt) * Z
    const z = this.prng.nextGaussian(0, 1);
    const drift = (mu - 0.5 * sigma * sigma) * dt;
    const diffusion = sigma * Math.sqrt(dt) * z;

    let jumpFactor = 1.0;
    let isJump = false;

    // Optional Merton jump diffusion
    const lambda = options?.jumpIntensity ?? 0; // Jumps only if explicitly requested
    if (lambda > 0 && this.prng.nextBoolean(lambda)) {
      isJump = true;
      const jumpMean = options?.jumpMean ?? 0;
      const jumpVol = options?.jumpVol ?? (sigma * 0.5);
      const jumpZ = this.prng.nextGaussian(jumpMean, jumpVol);
      jumpFactor = Math.exp(jumpZ);
    }

    const nextUnrounded = currentPrice * Math.exp(drift + diffusion) * jumpFactor;
    const nextPrice = this.roundToTickSize(Math.max(params.tickSize, nextUnrounded), params.tickSize);
    const returnPct = Number((((nextPrice - currentPrice) / currentPrice) * 100).toFixed(4));

    return {
      nextPrice,
      returnPct,
      isJump
    };
  }

  /**
   * Simulates full intra-bar micro-walk to produce structurally sound OHLC bars
   * Guarantees all financial bar invariants:
   * High >= Open, High >= Close, Low <= Open, Low <= Close, High >= Low, Volume >= 0, VWAP in [Low, High]
   */
  public generateBarIntraPath(
    openPrice: number,
    params: SymbolParameters,
    intervalMs: number,
    subTickCount = 12
  ): {
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    vwap: number;
    subPrices: number[];
  } {
    const dtSub = intervalMs / subTickCount;
    const subPrices: number[] = [openPrice];
    let runningPrice = openPrice;

    let weightedSum = 0;
    let totalVolume = 0;

    for (let i = 0; i < subTickCount; i++) {
      const step = this.stepPrice(runningPrice, params, dtSub);
      runningPrice = step.nextPrice;
      subPrices.push(runningPrice);

      // Volume for sub-tick with log-normal fluctuation
      const subVol = Math.round(
        (params.averageTradeVolume ?? 100) *
        this.prng.nextLogNormal(0, 0.4)
      );
      const safeVol = Math.max(1, subVol);
      totalVolume += safeVol;
      weightedSum += runningPrice * safeVol;
    }

    const open = this.roundToTickSize(openPrice, params.tickSize);
    const close = this.roundToTickSize(runningPrice, params.tickSize);
    const high = this.roundToTickSize(Math.max(...subPrices, open, close), params.tickSize);
    const low = this.roundToTickSize(Math.min(...subPrices, open, close), params.tickSize);

    // Guaranteed VWAP within [Low, High]
    let vwap = totalVolume > 0
      ? Number((weightedSum / totalVolume).toFixed(this.getDecimalPlaces(params.tickSize)))
      : close;

    if (vwap < low) vwap = low;
    if (vwap > high) vwap = high;

    return {
      open,
      high,
      low,
      close,
      volume: totalVolume,
      vwap,
      subPrices
    };
  }

  /**
   * Generates realistic bid, ask, and executed trade for a tick
   */
  public generateQuoteAndTrade(
    midPrice: number,
    params: SymbolParameters
  ): {
    bid: number;
    ask: number;
    tradePrice: number;
    tradeVolume: number;
    spreadBps: number;
  } {
    const spreadBps = Math.max(0.5, (params.averageSpreadBps ?? 2.0) * this.prng.nextLogNormal(0, 0.2));
    const halfSpread = (midPrice * (spreadBps / 10000)) / 2;

    const rawBid = midPrice - halfSpread;
    const rawAsk = midPrice + halfSpread;

    let bid = this.roundToTickSize(rawBid, params.tickSize);
    let ask = this.roundToTickSize(rawAsk, params.tickSize);

    // Enforce ask > bid by at least 1 tickSize
    if (ask <= bid) {
      ask = this.roundToTickSize(bid + params.tickSize, params.tickSize);
    }

    // Trade execution distribution: 45% at Ask (buyer-initiated), 45% at Bid (seller-initiated), 10% inside spread
    const tradeRoll = this.prng.nextFloat();
    let tradePrice = midPrice;
    if (tradeRoll < 0.45) {
      tradePrice = ask;
    } else if (tradeRoll < 0.90) {
      tradePrice = bid;
    } else {
      tradePrice = this.roundToTickSize(midPrice, params.tickSize);
    }

    // Generate trade volume
    const baseLot = params.averageTradeVolume ?? 100;
    const tradeVolume = Math.max(1, Math.round(baseLot * this.prng.nextLogNormal(0, 0.5)));

    const effectiveSpreadBps = Number((((ask - bid) / midPrice) * 10000).toFixed(2));

    return {
      bid,
      ask,
      tradePrice,
      tradeVolume,
      spreadBps: effectiveSpreadBps
    };
  }

  /**
   * Quantizes price to exact tickSize increment
   */
  public roundToTickSize(price: number, tickSize: number): number {
    const decimals = this.getDecimalPlaces(tickSize);
    const ticks = Math.round(price / tickSize);
    const quantized = ticks * tickSize;
    return Number(quantized.toFixed(decimals));
  }

  /**
   * Derives number of decimal places from tickSize
   */
  public getDecimalPlaces(tickSize: number): number {
    const str = tickSize.toString();
    if (str.includes(".")) {
      return str.split(".")[1].length;
    }
    return 0;
  }
}
