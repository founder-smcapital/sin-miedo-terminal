import {
  AssetClass,
  CanonicalBar,
  ReferenceBar,
  ReconciliationBreak,
  ReconciliationItemResult,
  ReconciliationReport,
  ReconciliationSeverity,
  ReconciliationStatus,
  DiscrepancyType
} from "./types";
import {
  ASSET_RECONCILIATION_THRESHOLDS,
  calculateBpsDiff,
  calculatePctDiff
} from "./thresholds";

export class MarketDataReconciliationEngine {
  private reportsHistory: ReconciliationReport[] = [];
  private readonly maxReportHistory = 100;

  /**
   * Reconciles a single canonical bar against an authoritative reference bar.
   */
  public reconcileBar(
    canonical: CanonicalBar,
    reference: ReferenceBar,
    assetClass: AssetClass = "EQUITIES"
  ): ReconciliationItemResult {
    const thresholds = ASSET_RECONCILIATION_THRESHOLDS[assetClass] || ASSET_RECONCILIATION_THRESHOLDS.GENERIC;
    const breaks: ReconciliationBreak[] = [];
    const ts = canonical.timestamp;
    const symbol = canonical.symbol;

    // 1. Timestamp Alignment Check
    const timeDeltaMs = Math.abs(canonical.timestamp - reference.timestamp);
    if (timeDeltaMs > thresholds.maxTimestampSkewMs) {
      breaks.push({
        breakId: `BRK-TIME-${symbol}-${ts}`,
        symbol,
        timestamp: ts,
        field: "timestamp",
        canonicalValue: canonical.timestamp,
        referenceValue: reference.timestamp,
        absoluteDiff: timeDeltaMs,
        bpsDiff: 0,
        discrepancyType: DiscrepancyType.TIMESTAMP_SKEW_EXCEEDED,
        severity: ReconciliationSeverity.WARNING,
        thresholdTolerance: thresholds.maxTimestampSkewMs,
        status: "OPEN",
        details: `Timestamp alignment skew of ${timeDeltaMs}ms exceeds tolerance of ${thresholds.maxTimestampSkewMs}ms`,
        remediationAction: "ALERT_ONLY"
      });
    }

    // 2. Close / Settlement Price Check
    const closeBpsDiff = calculateBpsDiff(canonical.close, reference.close);
    const maxCloseAllowed = reference.officialSettlement
      ? thresholds.maxCloseVarianceBps
      : thresholds.maxPriceVarianceBps;

    // Check for potential unadjusted corporate action (e.g. 2:1, 3:1, 4:1 splits)
    const ratio = reference.close > 0 ? canonical.close / reference.close : 1;
    const isSplitCandidate = [0.5, 2.0, 0.25, 4.0, 0.3333, 3.0, 0.2, 5.0].some(
      (r) => Math.abs(ratio - r) < 0.015
    );

    if (isSplitCandidate && closeBpsDiff > 1000) {
      breaks.push({
        breakId: `BRK-SPLIT-${symbol}-${ts}`,
        symbol,
        timestamp: ts,
        field: "close",
        canonicalValue: canonical.close,
        referenceValue: reference.close,
        absoluteDiff: Math.abs(canonical.close - reference.close),
        bpsDiff: closeBpsDiff,
        discrepancyType: DiscrepancyType.CORPORATE_ACTION_UNADJUSTED,
        severity: ReconciliationSeverity.CRITICAL,
        thresholdTolerance: maxCloseAllowed,
        status: "OPEN",
        details: `Close price ratio (${ratio.toFixed(4)}) indicates unadjusted stock split or corporate action.`,
        remediationAction: "QUARANTINE_FEED"
      });
    } else if (closeBpsDiff > maxCloseAllowed) {
      const severity = closeBpsDiff > maxCloseAllowed * 3
        ? ReconciliationSeverity.CRITICAL
        : closeBpsDiff > maxCloseAllowed * 1.5
        ? ReconciliationSeverity.ERROR
        : ReconciliationSeverity.WARNING;

      breaks.push({
        breakId: `BRK-CLOSE-${symbol}-${ts}`,
        symbol,
        timestamp: ts,
        field: "close",
        canonicalValue: canonical.close,
        referenceValue: reference.close,
        absoluteDiff: Math.abs(canonical.close - reference.close),
        bpsDiff: closeBpsDiff,
        discrepancyType: DiscrepancyType.PRICE_VARIANCE_EXCEEDED,
        severity,
        thresholdTolerance: maxCloseAllowed,
        status: "OPEN",
        details: `Close price variance of ${closeBpsDiff.toFixed(2)} bps exceeds tolerance corridor of ${maxCloseAllowed} bps`,
        remediationAction: severity === ReconciliationSeverity.CRITICAL ? "QUARANTINE_FEED" : "OVERWRITE_REFERENCE"
      });
    }

    // 3. Open, High, Low Price Variance Checks
    const openBpsDiff = calculateBpsDiff(canonical.open, reference.open);
    if (openBpsDiff > thresholds.maxPriceVarianceBps) {
      breaks.push({
        breakId: `BRK-OPEN-${symbol}-${ts}`,
        symbol,
        timestamp: ts,
        field: "open",
        canonicalValue: canonical.open,
        referenceValue: reference.open,
        absoluteDiff: Math.abs(canonical.open - reference.open),
        bpsDiff: openBpsDiff,
        discrepancyType: DiscrepancyType.PRICE_VARIANCE_EXCEEDED,
        severity: openBpsDiff > thresholds.maxPriceVarianceBps * 2 ? ReconciliationSeverity.ERROR : ReconciliationSeverity.WARNING,
        thresholdTolerance: thresholds.maxPriceVarianceBps,
        status: "OPEN",
        details: `Open price variance ${openBpsDiff.toFixed(2)} bps exceeds tolerance ${thresholds.maxPriceVarianceBps} bps`
      });
    }

    // 4. OHLC Internal Consistency Cross-Check
    if (thresholds.alertOnOhlcViolations) {
      if (canonical.high < canonical.low || canonical.high < canonical.open || canonical.high < canonical.close) {
        breaks.push({
          breakId: `BRK-OHLC-INT-${symbol}-${ts}`,
          symbol,
          timestamp: ts,
          field: "high",
          canonicalValue: `O:${canonical.open} H:${canonical.high} L:${canonical.low} C:${canonical.close}`,
          referenceValue: `O:${reference.open} H:${reference.high} L:${reference.low} C:${reference.close}`,
          absoluteDiff: 0,
          bpsDiff: 0,
          discrepancyType: DiscrepancyType.OHLC_INCONSISTENCY,
          severity: ReconciliationSeverity.CRITICAL,
          thresholdTolerance: 0,
          status: "OPEN",
          details: `Internal OHLC geometry violation in canonical feed: High must be >= Open, Low, and Close.`
        });
      }
    }

    // 5. Volume Variance Check
    if (reference.volume > 0) {
      const volDiffPct = calculatePctDiff(canonical.volume, reference.volume);
      if (volDiffPct > thresholds.maxVolumeVariancePct) {
        breaks.push({
          breakId: `BRK-VOL-${symbol}-${ts}`,
          symbol,
          timestamp: ts,
          field: "volume",
          canonicalValue: canonical.volume,
          referenceValue: reference.volume,
          absoluteDiff: Math.abs(canonical.volume - reference.volume),
          bpsDiff: volDiffPct * 100,
          discrepancyType: DiscrepancyType.VOLUME_VARIANCE_EXCEEDED,
          severity: volDiffPct > thresholds.maxVolumeVariancePct * 3 ? ReconciliationSeverity.ERROR : ReconciliationSeverity.WARNING,
          thresholdTolerance: thresholds.maxVolumeVariancePct,
          status: "OPEN",
          details: `Volume variance of ${volDiffPct.toFixed(2)}% exceeds tolerance corridor of ${thresholds.maxVolumeVariancePct}%`
        });
      }
    }

    // Determine aggregate status
    let status = ReconciliationStatus.MATCHED;
    if (breaks.some((b) => b.severity === ReconciliationSeverity.CRITICAL)) {
      status = ReconciliationStatus.BREAK_DETECTED;
    } else if (breaks.some((b) => b.severity === ReconciliationSeverity.ERROR)) {
      status = ReconciliationStatus.BREAK_DETECTED;
    } else if (breaks.length > 0) {
      status = ReconciliationStatus.MATCHED_WITH_WARNINGS;
    }

    return {
      symbol,
      timestamp: ts,
      status,
      breaks,
      varianceBps: closeBpsDiff
    };
  }

  /**
   * Reconciles two time-series datasets (canonical array vs reference array),
   * handling matching, time alignments, and detecting missing data on either side.
   */
  public reconcileSeries(
    canonicalBars: CanonicalBar[],
    referenceBars: ReferenceBar[],
    assetClass: AssetClass = "EQUITIES"
  ): ReconciliationReport {
    const startTime = Date.now();
    const reportId = `REC-${startTime}-${Math.random().toString(36).substring(2, 7)}`;
    const allBreaks: ReconciliationBreak[] = [];
    const symbolsSet = new Set<string>();

    // Build lookup maps by timestamp and symbol
    const refMap = new Map<string, ReferenceBar>();
    for (const ref of referenceBars) {
      refMap.set(`${ref.symbol}:${ref.timestamp}`, ref);
      symbolsSet.add(ref.symbol);
    }

    const canonicalMap = new Map<string, CanonicalBar>();
    for (const can of canonicalBars) {
      canonicalMap.set(`${can.symbol}:${can.timestamp}`, can);
      symbolsSet.add(can.symbol);
    }

    let matchedCount = 0;

    // Check every canonical bar against reference
    for (const can of canonicalBars) {
      const key = `${can.symbol}:${can.timestamp}`;
      const ref = refMap.get(key);

      if (!ref) {
        // Missing in reference dataset (potential phantom trade or unconfirmed bar)
        allBreaks.push({
          breakId: `BRK-MISS-REF-${can.symbol}-${can.timestamp}`,
          symbol: can.symbol,
          timestamp: can.timestamp,
          field: "record",
          canonicalValue: can.close,
          referenceValue: null,
          absoluteDiff: 0,
          bpsDiff: 0,
          discrepancyType: DiscrepancyType.MISSING_IN_REFERENCE,
          severity: ReconciliationSeverity.WARNING,
          thresholdTolerance: 0,
          status: "OPEN",
          details: `Canonical bar at ${new Date(can.timestamp).toISOString()} has no matching reference record.`,
          remediationAction: "ALERT_ONLY"
        });
        continue;
      }

      const itemResult = this.reconcileBar(can, ref, assetClass);
      if (itemResult.status === ReconciliationStatus.MATCHED) {
        matchedCount++;
      } else {
        allBreaks.push(...itemResult.breaks);
        if (itemResult.status === ReconciliationStatus.MATCHED_WITH_WARNINGS) {
          matchedCount++;
        }
      }
    }

    // Check for records that exist in reference but are completely missing in canonical
    for (const ref of referenceBars) {
      const key = `${ref.symbol}:${ref.timestamp}`;
      if (!canonicalMap.has(key)) {
        allBreaks.push({
          breakId: `BRK-MISS-CAN-${ref.symbol}-${ref.timestamp}`,
          symbol: ref.symbol,
          timestamp: ref.timestamp,
          field: "record",
          canonicalValue: null,
          referenceValue: ref.close,
          absoluteDiff: 0,
          bpsDiff: 0,
          discrepancyType: DiscrepancyType.MISSING_IN_CANONICAL,
          severity: ReconciliationSeverity.ERROR,
          thresholdTolerance: 0,
          status: "OPEN",
          details: `Authoritative reference bar at ${new Date(ref.timestamp).toISOString()} is missing from local canonical dataset.`,
          remediationAction: "BACKFILL_TRIGGERED"
        });
      }
    }

    const allUniqueKeys = new Set([...canonicalMap.keys(), ...refMap.keys()]);
    const totalBarsEvaluated = allUniqueKeys.size;
    const matchRatePct = totalBarsEvaluated > 0
      ? Number(((matchedCount / totalBarsEvaluated) * 100).toFixed(2))
      : 100;

    const report: ReconciliationReport = {
      reportId,
      timestamp: startTime,
      symbolsReconciled: Array.from(symbolsSet),
      totalBarsEvaluated,
      matchedCount,
      breaksCount: allBreaks.length,
      matchRatePct,
      breaks: allBreaks,
      durationMs: Date.now() - startTime
    };

    this.reportsHistory.unshift(report);
    if (this.reportsHistory.length > this.maxReportHistory) {
      this.reportsHistory.pop();
    }

    return report;
  }

  public getLatestReports(limit = 10): ReconciliationReport[] {
    return this.reportsHistory.slice(0, limit);
  }

  public clearHistory(): void {
    this.reportsHistory = [];
  }
}
