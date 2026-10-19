import { useState, useEffect, useRef, useSyncExternalStore } from "react";
import { apiFetch } from "../api";
import { GeopoliticalHeadline, SentimentGaugeData } from "../types";
import {
  initialGeopoliticalHeadlines,
  computeSentimentMetrics,
  parseHeadlineLocalNLP,
  deduplicateHeadlines,
  normalizeHeadlineKey,
} from "../data/geopoliticalSentimentData";

interface GeopoliticalStoreState {
  headlines: GeopoliticalHeadline[];
  isAutoStreaming: boolean;
  selectedCategory: string;
  maxAgeHours: number; // 6, 12, 24
  inputHeadline: string;
  isAnalyzing: boolean;
  isSyncingFeed: boolean;
  lastSyncTime: string;
  flashNewId: string | null;
}

let storeState: GeopoliticalStoreState = {
  headlines: initialGeopoliticalHeadlines,
  isAutoStreaming: true,
  selectedCategory: "All",
  maxAgeHours: 24,
  inputHeadline: "",
  isAnalyzing: false,
  isSyncingFeed: false,
  lastSyncTime: (() => {
    const now = new Date();
    return `Synchronized ${now.toLocaleDateString("en-US", { month: "short", day: "2-digit" })} at ${now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} UTC`;
  })(),
  flashNewId: null,
};

const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

function updateState(updater: (prev: GeopoliticalStoreState) => Partial<GeopoliticalStoreState>) {
  const updates = updater(storeState);
  storeState = { ...storeState, ...updates };
  notify();
}

// Timer and Polling controllers (singletons)
let isInitialized = false;
let pollTimer: NodeJS.Timeout | null = null;
let flashTimer: NodeJS.Timeout | null = null;

export async function fetchVerifiedFeed(force = false) {
  updateState(() => ({ isSyncingFeed: true }));
  try {
    const url = `/api/intelligence/geopolitical-feed?refresh=${force ? "true" : "false"}&maxAgeHours=${storeState.maxAgeHours}`;
    const res = await apiFetch(url);
    if (res.ok) {
      const json = await res.json();
      if (json.data && Array.isArray(json.data) && json.data.length > 0) {
        const now = new Date();
        const timeStr = `${now.toLocaleDateString("en-US", { month: "short", day: "2-digit" })} at ${now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })} UTC`;
        
        // Preserve any custom user-analyzed or simulated breaking alerts if present and fresh
        const activeSimulations = storeState.headlines.filter(
          (h) => h.id.startsWith("sim-") || h.id.startsWith("local-")
        );

        const merged = deduplicateHeadlines(
          [...activeSimulations, ...json.data],
          storeState.maxAgeHours
        );

        updateState(() => ({
          headlines: merged.slice(0, 18),
          lastSyncTime: `Verified at ${timeStr}`,
        }));
      }
    }
  } catch (err) {
    console.warn("Could not sync remote feed, maintaining calibrated local intelligence:", err);
  } finally {
    updateState(() => ({ isSyncingFeed: false }));
  }
}

function initBackgroundFeedSync() {
  if (isInitialized) return;
  isInitialized = true;

  // Initial fetch on mount
  fetchVerifiedFeed(true);

  // Poll real-time news wire from server every 35 seconds
  pollTimer = setInterval(() => {
    if (storeState.isAutoStreaming) {
      fetchVerifiedFeed(false);
    }
  }, 35000);
}

export function useGeopoliticalFeed() {
  const state = useSyncExternalStore(
    (onStoreChange) => {
      listeners.add(onStoreChange);
      initBackgroundFeedSync();
      return () => {
        listeners.delete(onStoreChange);
      };
    },
    () => storeState
  );

  const metrics: SentimentGaugeData = computeSentimentMetrics(state.headlines);

  const now = Date.now();
  const maxAgeMs = state.maxAgeHours * 3600 * 1000;

  const filteredHeadlines = state.headlines.filter((h) => {
    // 1. Freshness filter: discard items older than selected maxAgeHours
    if (h.rawTimestamp && (now - h.rawTimestamp) > maxAgeMs) {
      return false;
    }

    // 2. Category filter
    if (state.selectedCategory === "All") return true;
    return h.category === state.selectedCategory;
  });

  const setSelectedCategory = (category: string) => {
    updateState(() => ({ selectedCategory: category }));
  };

  const setMaxAgeHours = (hours: number) => {
    updateState(() => ({ maxAgeHours: hours }));
    fetchVerifiedFeed(false);
  };

  const setInputHeadline = (text: string) => {
    updateState(() => ({ inputHeadline: text }));
  };

  const toggleAutoStream = () => {
    updateState((prev) => ({ isAutoStreaming: !prev.isAutoStreaming }));
  };

  // Immediate manual sync trigger
  const triggerNextLiveHeadline = () => {
    fetchVerifiedFeed(true);
  };

  const handleSimulateUSIranStrikesScenario = () => {
    const now = new Date();
    const strikeTimeStr = `${now.toLocaleDateString("en-US", { month: "short", day: "2-digit" })} • ${now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })} UTC`;
    const retalDate = new Date(now.getTime() - 120000);
    const retalTimeStr = `${retalDate.toLocaleDateString("en-US", { month: "short", day: "2-digit" })} • ${retalDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })} UTC`;

    const strikeHeadline: GeopoliticalHeadline = {
      id: `sim-strike-${Date.now()}`,
      timestamp: `${strikeTimeStr} (Live Simulation)`,
      rawTimestamp: now.getTime(),
      source: "Pentagon Operations Center / Reuters",
      headline: "BREAKING: US forces launch precision strikes on IRGC command bunkers in response to missile salvos",
      summary: "Carrier air wings and Tomahawk missile destroyers engage Iranian coastal radar stations and missile launch pads. Defenses placed on maximum readiness.",
      category: "US-Iran Kinetic",
      sentiment: "Escalatory Kinetic",
      impactScore: 98,
      confidenceScore: 98,
      affectedAssets: {
        brentImpact: "+$5.80/bbl instant shock",
        goldImpact: "+$46.00/oz surge",
        tankerRateImpact: "+280 bps insurance jump",
      },
      isLiveNew: true,
    };

    const retaliationHeadline: GeopoliticalHeadline = {
      id: `sim-retaliate-${Date.now()}`,
      timestamp: `${retalTimeStr} (2m prior)`,
      rawTimestamp: retalDate.getTime(),
      source: "IRGC Aerospace HQ / Tehran",
      headline: "IRGC confirms swift retaliatory ballistic barrage targeting regional US radar facilities and coalition fuel depots",
      summary: "Over 35 medium-range ballistic missiles launched across the Persian Gulf theater. Emergency sirens active across Gulf maritime corridors.",
      category: "US-Iran Kinetic",
      sentiment: "Severe Retaliation",
      impactScore: 97,
      confidenceScore: 96,
      affectedAssets: {
        brentImpact: "+$6.20/bbl risk adder",
        goldImpact: "+$52.00/oz flight to safety",
        tankerRateImpact: "+350 bps maritime freeze",
      },
      isLiveNew: true,
    };

    const filtered = storeState.headlines.filter((h) => {
      if (h.id.startsWith("sim-")) return false;
      const norm = normalizeHeadlineKey(h.headline);
      if (
        norm.includes("irgcconfirmswiftretaliatory") ||
        norm.includes("usforceslaunchprecision")
      ) {
        return false;
      }
      return true;
    });

    if (flashTimer) clearTimeout(flashTimer);
    flashTimer = setTimeout(() => updateState(() => ({ flashNewId: null })), 4000);

    updateState(() => ({
      headlines: deduplicateHeadlines([strikeHeadline, retaliationHeadline, ...filtered], storeState.maxAgeHours).slice(0, 18),
      flashNewId: strikeHeadline.id,
    }));
  };

  const handleAnalyzeCustomHeadline = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!state.inputHeadline.trim() || state.isAnalyzing) return;

    updateState(() => ({ isAnalyzing: true }));
    const textToAnalyze = state.inputHeadline.trim();

    try {
      const res = await apiFetch("/api/intelligence/analyze-headline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ headline: textToAnalyze }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json && json.headlineRecord) {
          const record: GeopoliticalHeadline = {
            ...json.headlineRecord,
            rawTimestamp: Date.now()
          };

          if (flashTimer) clearTimeout(flashTimer);
          flashTimer = setTimeout(() => updateState(() => ({ flashNewId: null })), 4000);

          updateState((prev) => ({
            headlines: deduplicateHeadlines([record, ...prev.headlines], storeState.maxAgeHours).slice(0, 18),
            flashNewId: record.id,
            inputHeadline: "",
            isAnalyzing: false,
          }));
          return;
        }
      }
      throw new Error("Fallback to local NLP");
    } catch {
      const localRecord: GeopoliticalHeadline = {
        ...parseHeadlineLocalNLP(textToAnalyze),
        rawTimestamp: Date.now()
      };
      if (flashTimer) clearTimeout(flashTimer);
      flashTimer = setTimeout(() => updateState(() => ({ flashNewId: null })), 4000);

      updateState((prev) => ({
        headlines: deduplicateHeadlines([localRecord, ...prev.headlines], storeState.maxAgeHours).slice(0, 18),
        flashNewId: localRecord.id,
        inputHeadline: "",
        isAnalyzing: false,
      }));
    }
  };

  return {
    ...state,
    metrics,
    filteredHeadlines,
    setSelectedCategory,
    setMaxAgeHours,
    setInputHeadline,
    toggleAutoStream,
    triggerNextLiveHeadline,
    handleSimulateUSIranStrikesScenario,
    handleAnalyzeCustomHeadline,
    fetchVerifiedFeed: () => fetchVerifiedFeed(true),
  };
}
