import {
  ReconciliationBreak,
  ReconciliationDLQEntry,
  ReconciliationSeverity,
  DiscrepancyType
} from "./types";

export interface DLQEnqueueInput {
  breakId: string;
  symbol: string;
  timestamp: number;
  discrepancyType: DiscrepancyType;
  severity: ReconciliationSeverity;
  canonicalPayload: unknown;
  referencePayload: unknown;
  diagnostics: string;
  maxRetries?: number;
}

export class ReconciliationDLQManager {
  private queue: Map<string, ReconciliationDLQEntry> = new Map();
  private readonly maxBufferSize: number;

  constructor(maxBufferSize = 2000) {
    this.maxBufferSize = maxBufferSize;
  }

  /**
   * Enqueues an unresolvable reconciliation break or corrupted record into the DLQ.
   */
  public enqueue(input: DLQEnqueueInput): ReconciliationDLQEntry {
    const dlqId = `DLQ-REC-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const entry: ReconciliationDLQEntry = {
      dlqId,
      enqueuedAt: Date.now(),
      breakId: input.breakId,
      symbol: input.symbol,
      timestamp: input.timestamp,
      discrepancyType: input.discrepancyType,
      severity: input.severity,
      canonicalPayload: input.canonicalPayload,
      referencePayload: input.referencePayload,
      diagnostics: input.diagnostics,
      retryCount: 0,
      maxRetries: input.maxRetries ?? 3,
      status: "QUARANTINED"
    };

    if (this.queue.size >= this.maxBufferSize) {
      const oldestKey = this.queue.keys().next().value;
      if (oldestKey) this.queue.delete(oldestKey);
    }

    this.queue.set(dlqId, entry);
    return entry;
  }

  /**
   * Enqueues an entire break from the reconciliation engine.
   */
  public enqueueBreak(
    reconciliationBreak: ReconciliationBreak,
    canonicalPayload: unknown,
    referencePayload: unknown
  ): ReconciliationDLQEntry {
    return this.enqueue({
      breakId: reconciliationBreak.breakId,
      symbol: reconciliationBreak.symbol,
      timestamp: reconciliationBreak.timestamp,
      discrepancyType: reconciliationBreak.discrepancyType,
      severity: reconciliationBreak.severity,
      canonicalPayload,
      referencePayload,
      diagnostics: reconciliationBreak.details
    });
  }

  /**
   * Attempts to replay a DLQ record using a provided reprocessor.
   */
  public async replayEntry(
    dlqId: string,
    reprocessor: (entry: ReconciliationDLQEntry) => Promise<boolean> | boolean
  ): Promise<{ success: boolean; entry: ReconciliationDLQEntry }> {
    const entry = this.queue.get(dlqId);
    if (!entry) {
      throw new Error(`DLQ record not found: ${dlqId}`);
    }

    if (entry.status === "RESOLVED") {
      return { success: true, entry };
    }

    entry.retryCount++;
    entry.status = "RETRYING";

    try {
      const success = await reprocessor(entry);
      if (success) {
        entry.status = "RESOLVED";
        entry.resolutionNotes = `Successfully reconciled upon replay attempt #${entry.retryCount}`;
        return { success: true, entry };
      } else {
        if (entry.retryCount >= entry.maxRetries) {
          entry.status = "QUARANTINED";
          entry.resolutionNotes = `Exhausted maximum replay retries (${entry.maxRetries}). Marked as permanent break.`;
        } else {
          entry.status = "QUARANTINED";
        }
        return { success: false, entry };
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      entry.status = "QUARANTINED";
      entry.resolutionNotes = `Replay error on attempt #${entry.retryCount}: ${errMsg}`;
      return { success: false, entry };
    }
  }

  /**
   * Batch replays all quarantined records for a given symbol.
   */
  public async replayBySymbol(
    symbol: string,
    reprocessor: (entry: ReconciliationDLQEntry) => Promise<boolean> | boolean
  ): Promise<{ total: number; resolved: number }> {
    const targetEntries = Array.from(this.queue.values()).filter(
      (e) => e.symbol.toUpperCase() === symbol.toUpperCase() && e.status !== "RESOLVED"
    );

    let resolved = 0;
    for (const entry of targetEntries) {
      const res = await this.replayEntry(entry.dlqId, reprocessor);
      if (res.success) resolved++;
    }

    return { total: targetEntries.length, resolved };
  }

  public getEntry(dlqId: string): ReconciliationDLQEntry | undefined {
    return this.queue.get(dlqId);
  }

  public getEntries(limit = 50, filterStatus?: ReconciliationDLQEntry["status"]): ReconciliationDLQEntry[] {
    let list = Array.from(this.queue.values()).reverse();
    if (filterStatus) {
      list = list.filter((e) => e.status === filterStatus);
    }
    return list.slice(0, limit);
  }

  public discard(dlqId: string, reason: string): boolean {
    const entry = this.queue.get(dlqId);
    if (!entry) return false;
    entry.status = "DISCARDED";
    entry.resolutionNotes = `Discarded manually: ${reason}`;
    return true;
  }

  public clear(): void {
    this.queue.clear();
  }

  public count(): number {
    return this.queue.size;
  }
}
