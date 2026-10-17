import {
  ErrorCategory,
  ValidationSeverity,
  ValidationRuleViolation,
  DeadLetterRecord,
  PipelineMetrics
} from "./types";

export interface AlertChannel {
  send(record: DeadLetterRecord): Promise<void> | void;
}

/**
 * Institutional Logging and Alerting Manager
 * Implements token-bucket rate limiting to prevent alert storms during upstream vendor outages.
 */
export class MarketDataAlertManager {
  private dlq: DeadLetterRecord[] = [];
  private readonly maxDlqSize: number;
  private metrics: PipelineMetrics = {
    totalReceived: 0,
    totalValid: 0,
    totalQuarantined: 0,
    totalDropped: 0,
    violationsByCategory: {
      [ErrorCategory.MALFORMED_PAYLOAD]: 0,
      [ErrorCategory.SCHEMA_DRIFT]: 0,
      [ErrorCategory.MISSING_FIELD]: 0,
      [ErrorCategory.INVALID_TIMESTAMP]: 0,
      [ErrorCategory.NON_MONOTONIC_SEQUENCE]: 0,
      [ErrorCategory.DUPLICATE_MESSAGE]: 0,
      [ErrorCategory.OUT_OF_RANGE]: 0,
      [ErrorCategory.PRICE_SPIKE_ANOMALY]: 0,
      [ErrorCategory.STALE_PRICE]: 0
    },
    violationsBySeverity: {
      [ValidationSeverity.INFO]: 0,
      [ValidationSeverity.WARNING]: 0,
      [ValidationSeverity.ERROR]: 0,
      [ValidationSeverity.CRITICAL]: 0
    }
  };

  // Rate Limiting per (symbol + category) to suppress alert storms
  private alertThrottles = new Map<string, number>();
  private readonly throttleIntervalMs: number;
  private alertListeners: Array<(record: DeadLetterRecord) => void> = [];

  constructor(maxDlqSize: number = 1000, throttleIntervalMs: number = 30_000) {
    this.maxDlqSize = maxDlqSize;
    this.throttleIntervalMs = throttleIntervalMs;
  }

  public recordSuccess(): void {
    this.metrics.totalReceived += 1;
    this.metrics.totalValid += 1;
  }

  public recordViolation(
    source: string,
    symbol: string,
    violations: ValidationRuleViolation[],
    rawPayload: unknown,
    shouldDrop: boolean,
    isQuarantined: boolean
  ): DeadLetterRecord {
    this.metrics.totalReceived += 1;
    if (shouldDrop) {
      this.metrics.totalDropped += 1;
    } else if (isQuarantined) {
      this.metrics.totalQuarantined += 1;
    } else {
      this.metrics.totalValid += 1;
    }

    const primaryViolation = violations[0];
    const category = primaryViolation?.category || ErrorCategory.MALFORMED_PAYLOAD;
    const severity = primaryViolation?.severity || ValidationSeverity.ERROR;

    for (const v of violations) {
      this.metrics.violationsByCategory[v.category] = (this.metrics.violationsByCategory[v.category] || 0) + 1;
      this.metrics.violationsBySeverity[v.severity] = (this.metrics.violationsBySeverity[v.severity] || 0) + 1;
    }

    this.metrics.lastViolationAt = new Date().toISOString();

    const record: DeadLetterRecord = {
      dlqId: `dlq_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      receivedAt: new Date().toISOString(),
      source,
      symbol: symbol || "UNKNOWN",
      category,
      severity,
      violations,
      rawPayload: this.sanitizePayload(rawPayload)
    };

    // Store in Circular DLQ buffer
    if (this.dlq.length >= this.maxDlqSize) {
      this.dlq.shift();
    }
    this.dlq.push(record);

    // Emit Alert if not throttled
    this.dispatchAlertWithThrottling(record);

    // Structured JSON log output for institutional ingestion (e.g., Datadog, CloudWatch, Splunk)
    this.logStructured(record);

    return record;
  }

  public onAlert(listener: (record: DeadLetterRecord) => void): () => void {
    this.alertListeners.push(listener);
    return () => {
      this.alertListeners = this.alertListeners.filter((l) => l !== listener);
    };
  }

  public getDlqRecords(limit: number = 50): DeadLetterRecord[] {
    return this.dlq.slice(-limit).reverse();
  }

  public getMetrics(): PipelineMetrics {
    return { ...this.metrics };
  }

  public clear(): void {
    this.dlq = [];
    this.alertThrottles.clear();
  }

  private dispatchAlertWithThrottling(record: DeadLetterRecord): void {
    // Only alert on ERROR and CRITICAL
    if (record.severity !== ValidationSeverity.ERROR && record.severity !== ValidationSeverity.CRITICAL) {
      return;
    }

    const throttleKey = `${record.source}:${record.symbol}:${record.category}`;
    const now = Date.now();
    const lastAlert = this.alertThrottles.get(throttleKey) || 0;

    if (now - lastAlert >= this.throttleIntervalMs) {
      this.alertThrottles.set(throttleKey, now);
      for (const listener of this.alertListeners) {
        try {
          listener(record);
        } catch (e) {
          console.error("Error in alert listener:", e);
        }
      }
    }
  }

  private logStructured(record: DeadLetterRecord): void {
    const logEntry = {
      logLevel: record.severity === ValidationSeverity.CRITICAL ? "FATAL" : record.severity,
      logger: "market.data.validation",
      dlqId: record.dlqId,
      source: record.source,
      symbol: record.symbol,
      errorCategory: record.category,
      violationCount: record.violations.length,
      violations: record.violations.map((v) => ({
        rule: v.ruleName,
        message: v.message,
        observed: v.observedValue
      })),
      timestamp: record.receivedAt
    };

    if (record.severity === ValidationSeverity.CRITICAL || record.severity === ValidationSeverity.ERROR) {
      console.error(JSON.stringify(logEntry));
    } else {
      console.warn(JSON.stringify(logEntry));
    }
  }

  private sanitizePayload(raw: unknown): unknown {
    if (typeof raw !== "object" || raw === null) return raw;
    try {
      const serialized = JSON.stringify(raw);
      if (serialized.length > 2048) {
        return {
          truncated: true,
          preview: serialized.substring(0, 1024) + "... [TRUNCATED_EXCEEDED_2KB]"
        };
      }
      return JSON.parse(serialized);
    } catch {
      return "[UNSERIALIZABLE_PAYLOAD]";
    }
  }
}
