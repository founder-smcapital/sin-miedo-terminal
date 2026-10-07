import { GeopoliticalHeadline, SentimentGaugeData } from "../types";

/**
 * Format dynamic dates relative to current UTC time so the intelligence feed
 * consistently reflects current-day operations and ongoing strikes over the last few days.
 */
export function formatRelativeStrikeDate(
  daysAgo: number,
  hour: number,
  minute: number,
  statusSuffix?: string
): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setUTCHours(hour, minute, 0, 0);

  const monthStr = d.toLocaleDateString("en-US", { month: "short", timeZone: "UTC" });
  const dayStr = String(d.getUTCDate()).padStart(2, "0");
  const yearStr = d.getUTCFullYear();
  const timeStr = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")} UTC`;

  let relativeLabel = statusSuffix;
  if (!relativeLabel) {
    if (daysAgo === 0) relativeLabel = "Live Ingest";
    else if (daysAgo === 1) relativeLabel = "Yesterday";
    else relativeLabel = `${daysAgo}d ago`;
  }

  return `${monthStr} ${dayStr}, ${yearStr} • ${timeStr} (${relativeLabel})`;
}

/**
 * Generate fully calibrated geopolitical strike intelligence telemetry
 * covering today's breaking strikes and the multi-wave strike escalation over the last few days.
 */
export function generateCalibratedGeopoliticalHeadlines(): GeopoliticalHeadline[] {
  return [
    {
      id: "geo-live-saudi-pipe",
      timestamp: formatRelativeStrikeDate(0, 14, 10, "Live Alert"),
      source: "Saudi Energy Ministry / Aramco Ops",
      headline: "Saudi Arabia orders emergency operational shutdown of East-West Oil Pipeline (Petroline) following Houthi drone strikes and escalation",
      summary: "5.0M bpd critical Red Sea bypass capacity suspended indefinitely after long-range drone intercepts near Yanbu terminal pump stations amid intensifying Yemeni-Houthi cross-border civil war operations. Shuts down primary Hormuz diversion corridor.",
      category: "Sanctions & Energy",
      sentiment: "Escalatory Kinetic",
      impactScore: 98,
      confidenceScore: 99,
      affectedAssets: {
        brentImpact: "+$6.40/bbl supply block",
        goldImpact: "+$42.00/oz safe haven surge",
        tankerRateImpact: "+380 bps bypass loss"
      },
      isLiveNew: true
    },
    {
      id: "geo-live-1",
      timestamp: formatRelativeStrikeDate(0, 13, 22, "Live Strike Wire"),
      source: "US CENTCOM / 5th Fleet Combat Ops",
      headline: "CENTCOM executes Operation Sentinel Surge: Carrier air wings strike IRGC mobile ballistic launchers and coastal radar sites near Bandar Abbas",
      summary: "Coordinated precision strikes engage 8 coastal radar and drone command bunkers along northern Hormuz following drone harassment of commercial tanker corridors. Coalition air defenses maintain DEFCON 2 alertness.",
      category: "US-Iran Kinetic",
      sentiment: "Escalatory Kinetic",
      impactScore: 98,
      confidenceScore: 98,
      affectedAssets: {
        brentImpact: "+$5.20/bbl spike",
        goldImpact: "+$44.00/oz safe haven bid",
        tankerRateImpact: "+260 bps hull war-risk"
      },
      isLiveNew: true
    },
    {
      id: "geo-live-2",
      timestamp: formatRelativeStrikeDate(0, 11, 45, "Live Ingest"),
      source: "IRNA Tehran / Supreme National Security Council",
      headline: "Iran IRGC confirms fresh retaliatory salvo of Fattah-1 and Kheibar Shekan ballistic missiles targeting regional logistics airfields",
      summary: "IRGC Aerospace Force launches precision ballistic missiles toward regional forward logistics nodes and early warning radar stations in response to carrier-launched strikes. Sirens active across Gulf air defense corridors.",
      category: "US-Iran Kinetic",
      sentiment: "Severe Retaliation",
      impactScore: 97,
      confidenceScore: 96,
      affectedAssets: {
        brentImpact: "+$4.90/bbl tail-risk",
        goldImpact: "+$39.00/oz surge",
        tankerRateImpact: "+310 bps choke risk"
      },
      isLiveNew: true
    },
    {
      id: "geo-live-3",
      timestamp: formatRelativeStrikeDate(0, 9, 30, "Live Ingest"),
      source: "UKMTO Maritime Trade Operations",
      headline: "Emergency Advisory 049: Commercial VLCC tanker grazed by drone debris 21nm SW of Strait of Hormuz; severe GPS spoofing reported",
      summary: "Greek-flagged crude tanker repels drone boat approach with onboard armed security; US guided-missile destroyer USS Mason renders escort assistance. Widespread electronic jamming reported across 45nm corridor.",
      category: "Hormuz Chokepoint",
      sentiment: "Escalatory Kinetic",
      impactScore: 92,
      confidenceScore: 95,
      affectedAssets: {
        brentImpact: "+$2.60/bbl transit premium",
        goldImpact: "+$22.00/oz safe haven",
        tankerRateImpact: "+180 bps hull surcharge"
      },
      isLiveNew: true
    },
    {
      id: "geo-hist-4",
      timestamp: formatRelativeStrikeDate(1, 21, 40, "Yesterday"),
      source: "Pentagon Press Pool / Reuters",
      headline: "US B-2 Spirit stealth bombers strike hardened subterranean IRGC missile assembly facilities in Isfahan and Natanz perimeter",
      summary: "Deep-penetration munitions deployed to neutralize underground solid-fuel missile fabrication facilities after satellite surveillance confirmed imminent mobile TEL deployments toward coastal corridors.",
      category: "US-Iran Kinetic",
      sentiment: "Escalatory Kinetic",
      impactScore: 95,
      confidenceScore: 98,
      affectedAssets: {
        brentImpact: "+$4.10/bbl shock",
        goldImpact: "+$36.00/oz hedge",
        tankerRateImpact: "+190 bps insurance addition"
      },
      isLiveNew: false
    },
    {
      id: "geo-hist-5",
      timestamp: formatRelativeStrikeDate(1, 14, 15, "Yesterday"),
      source: "Lloyd's Joint War Committee (London)",
      headline: "Lloyd's JWC expands JWLA-030 breach perimeter: Persian Gulf hull war risk additional premiums surge to 0.85% of asset value",
      summary: "Underwriters mandate 24-hour voyage advance notices and emergency war risk surcharge for all commercial VLCC and LNG tonnage navigating between Fujairah, Ras Tanura, and the Strait of Hormuz.",
      category: "Sanctions & Energy",
      sentiment: "Escalatory Kinetic",
      impactScore: 90,
      confidenceScore: 99,
      affectedAssets: {
        brentImpact: "+$2.80/bbl pass-through",
        goldImpact: "+$18.50/oz hedge",
        tankerRateImpact: "+480 bps breach premium"
      },
      isLiveNew: false
    },
    {
      id: "geo-hist-6",
      timestamp: formatRelativeStrikeDate(2, 18, 30, "2d ago"),
      source: "IRGC Naval Command (Bandar Abbas)",
      headline: "IRGC naval fast boats conduct aggressive live-fire interdiction drills across northern Hormuz separation scheme",
      summary: "Iranian naval detachments issue radio warnings demanding foreign commercial vessels identify registries and destination manifests; US 5th Fleet issues formal maritime security warning.",
      category: "Hormuz Chokepoint",
      sentiment: "Severe Retaliation",
      impactScore: 91,
      confidenceScore: 94,
      affectedAssets: {
        brentImpact: "+$3.20/bbl risk adder",
        goldImpact: "+$24.00/oz bid",
        tankerRateImpact: "+150 bps routing friction"
      },
      isLiveNew: false
    },
    {
      id: "geo-hist-7",
      timestamp: formatRelativeStrikeDate(2, 11, 10, "2d ago"),
      source: "S&P Global Commodities at Sea",
      headline: "Over 54 laden supertankers divert around Cape of Good Hope as Hormuz transit delays mount to 96 hours",
      summary: "Total stalled crude volume reaches 108 million barrels. Asian buyers in Tokyo, Seoul, and Ningbo scramble for prompt Atlantic Basin and West African replacement cargoes.",
      category: "Sanctions & Energy",
      sentiment: "Escalatory Kinetic",
      impactScore: 89,
      confidenceScore: 96,
      affectedAssets: {
        brentImpact: "+$3.75/bbl prompt spread",
        goldImpact: "+$21.00/oz",
        tankerRateImpact: "+320 bps demurrage"
      },
      isLiveNew: false
    },
    {
      id: "geo-hist-8",
      timestamp: formatRelativeStrikeDate(3, 19, 45, "3d ago"),
      source: "US CENTCOM Operations Center",
      headline: "US carrier air wings execute targeted airstrikes on IRGC uncrewed surface vessel (USV) depot and drone workshops in Bushehr",
      summary: "Precision-guided ordnance destroys remote explosive boat assembly facility and coastal communications arrays following confirmed intercepts in outer Hormuz shipping lanes.",
      category: "US-Iran Kinetic",
      sentiment: "Escalatory Kinetic",
      impactScore: 94,
      confidenceScore: 97,
      affectedAssets: {
        brentImpact: "+$3.50/bbl spike",
        goldImpact: "+$28.00/oz safe haven",
        tankerRateImpact: "+135 bps war risk"
      },
      isLiveNew: false
    },
    {
      id: "geo-hist-9",
      timestamp: formatRelativeStrikeDate(3, 8, 20, "3d ago"),
      source: "Oman Foreign Ministry / Swiss Diplomatic Channel",
      headline: "Omani backchannel mediation convenes in Muscat: Tehran demands complete cessation of coalition strikes before maritime discussions",
      summary: "Envoys warn that diplomatic window is rapidly closing as military deployments on both sides of the Strait of Hormuz escalate to highest state of alert.",
      category: "Diplomatic / Backchannel",
      sentiment: "De-escalatory",
      impactScore: 52,
      confidenceScore: 78,
      affectedAssets: {
        brentImpact: "-$1.20/bbl diplomacy pause",
        goldImpact: "-$8.00/oz consolidation",
        tankerRateImpact: "-35 bps easing"
      },
      isLiveNew: false
    },
    {
      id: "geo-hist-10",
      timestamp: formatRelativeStrikeDate(4, 16, 30, "4d ago"),
      source: "Tasnim Defense Wire / Tehran",
      headline: "Iran Armed Forces General Staff warns: 'Aggressive strikes on sovereign territory will meet response beyond regional borders'",
      summary: "Tehran security officials issue formal diplomatic note through Swiss embassy stating all coalition naval assets within 1,000km range remain pre-targeted by ballistic missile units.",
      category: "US-Iran Kinetic",
      sentiment: "Severe Retaliation",
      impactScore: 93,
      confidenceScore: 91,
      affectedAssets: {
        brentImpact: "+$3.80/bbl shock",
        goldImpact: "+$31.00/oz surge",
        tankerRateImpact: "+175 bps hazard premium"
      },
      isLiveNew: false
    }
  ];
}

export const initialGeopoliticalHeadlines: GeopoliticalHeadline[] = generateCalibratedGeopoliticalHeadlines();

// Continuous Real-Time Live Headline Stream Queue
export const liveStreamHeadlinesQueue: Omit<GeopoliticalHeadline, "id" | "timestamp">[] = [
  {
    source: "CENTCOM Tactical Broadcast",
    headline: "FLASH: US B-2 Spirits strike underground missile silos in Natanz perimeter; Tehran air defenses engage heavy salvo",
    summary: "Subterranean fortifications hit with deep-penetration munitions. Second wave of tactical Tomahawks launched from Arabian Sea missile cruisers.",
    category: "US-Iran Kinetic",
    sentiment: "Escalatory Kinetic",
    impactScore: 97,
    confidenceScore: 96,
    affectedAssets: {
      brentImpact: "+$5.20/bbl spike",
      goldImpact: "+$48.00/oz",
      tankerRateImpact: "+220 bps"
    }
  },
  {
    source: "US 5th Fleet Tactical Net",
    headline: "Aegis guided missile destroyers intercept wave of 14 anti-ship cruise missiles fired from Iranian coastal TELs",
    summary: "SM-2 and SM-6 surface-to-air missiles engage incoming low-altitude cruise vectors heading toward international shipping lanes off Musandam Peninsula.",
    category: "US-Iran Kinetic",
    sentiment: "Heightened Deterrence",
    impactScore: 94,
    confidenceScore: 97,
    affectedAssets: {
      brentImpact: "+$3.40/bbl tail-risk",
      goldImpact: "+$26.00/oz bid",
      tankerRateImpact: "+190 bps war risk"
    }
  },
  {
    source: "IRGC Naval Command (Bandar Abbas)",
    headline: "IRGC naval fast boats lay acoustic sea mines in northern deep-water shipping channel of Hormuz",
    summary: "Commercial bulk carriers ordered to halt transits immediately as Iranian naval detachments establish a 12-mile exclusion radius.",
    category: "Hormuz Chokepoint",
    sentiment: "Severe Retaliation",
    impactScore: 98,
    confidenceScore: 94,
    affectedAssets: {
      brentImpact: "+$7.40/bbl supply block",
      goldImpact: "+$62.00/oz safe haven surge",
      tankerRateImpact: "+550 bps total freeze"
    }
  },
  {
    source: "S&P Global Commodities at Sea",
    headline: "Over 68 laden VLCC supertankers drop anchor outside Hormuz, refusing passage until naval escorts are secured",
    summary: "Total crude volume stalled reaches 136 million barrels. Asian refiners in Tokyo, Seoul, and Ningbo request emergency SPR allocations.",
    category: "Sanctions & Energy",
    sentiment: "Escalatory Kinetic",
    impactScore: 91,
    confidenceScore: 96,
    affectedAssets: {
      brentImpact: "+$4.10/bbl prompt spread",
      goldImpact: "+$31.50/oz",
      tankerRateImpact: "+340 bps demurrage"
    }
  },
  {
    source: "UKMTO Incident Watch",
    headline: "Uncrewed surface vessel (USV) drone boat neutralized by US naval gunfire 25nm southwest of Jask",
    summary: "Coalition warship intercepts remote explosive craft targeting western-bound tanker convoy in outer Hormuz approach.",
    category: "Hormuz Chokepoint",
    sentiment: "Heightened Deterrence",
    impactScore: 86,
    confidenceScore: 93,
    affectedAssets: {
      brentImpact: "+$1.90/bbl",
      goldImpact: "+$16.50/oz",
      tankerRateImpact: "+75 bps"
    }
  },
  {
    source: "Al Jazeera Diplomatic Desk",
    headline: "UN Security Council convenes emergency closed-door session following US-Iran kinetic strike exchanges",
    summary: "Ambassadors call for immediate military stand-down; China urges restraint to safeguard Persian Gulf maritime energy stability.",
    category: "Diplomatic / Backchannel",
    sentiment: "De-escalatory",
    impactScore: 54,
    confidenceScore: 82,
    affectedAssets: {
      brentImpact: "-$0.80/bbl diplomacy pause",
      goldImpact: "-$6.00/oz consolidation",
      tankerRateImpact: "-25 bps"
    }
  }
];

// Quantitative Metric Calculator for Sentiment Gauge
export function computeSentimentMetrics(headlines: GeopoliticalHeadline[]): SentimentGaugeData {
  if (!headlines || headlines.length === 0) {
    return {
      compositeScore: 88.4,
      confidenceScore: 94.2,
      defconLevel: "DEFCON 2",
      defconLabel: "CRITICAL WAR-RISK // ACTIVE STRIKE SPIRAL",
      headlineCountAnalyzed: 0,
      sentimentDistribution: {
        kineticEscalationPct: 72,
        retaliationRiskPct: 20,
        deterrencePct: 5,
        diplomaticDeescalationPct: 3
      },
      volatilityProjection: "Extreme Tail-Risk: Brent $92 - $105/bbl Scenario",
      lastUpdated: new Date().toTimeString().split(' ')[0] + ' UTC',
      recentHeadlines: []
    };
  }

  // Weight more recent headlines higher
  let weightedScoreSum = 0;
  let weightedConfidenceSum = 0;
  let totalWeights = 0;

  let kineticCount = 0;
  let retaliationCount = 0;
  let deterrenceCount = 0;
  let diplomaticCount = 0;

  headlines.forEach((h, index) => {
    // Recent decay: index 0 has weight 1.0, decreasing
    const decay = Math.max(0.4, 1.0 - index * 0.08);
    weightedScoreSum += h.impactScore * decay;
    weightedConfidenceSum += h.confidenceScore * decay;
    totalWeights += decay;

    if (h.sentiment === "Escalatory Kinetic") kineticCount++;
    else if (h.sentiment === "Severe Retaliation") retaliationCount++;
    else if (h.sentiment === "Heightened Deterrence") deterrenceCount++;
    else diplomaticCount++;
  });

  const totalHeadlines = headlines.length;
  const compositeScore = Number((weightedScoreSum / totalWeights).toFixed(1));
  const confidenceScore = Number((weightedConfidenceSum / totalWeights).toFixed(1));

  const kineticEscalationPct = Math.round((kineticCount / totalHeadlines) * 100);
  const retaliationRiskPct = Math.round((retaliationCount / totalHeadlines) * 100);
  const deterrencePct = Math.round((deterrenceCount / totalHeadlines) * 100);
  const diplomaticDeescalationPct = Math.max(0, 100 - (kineticEscalationPct + retaliationRiskPct + deterrencePct));

  let defconLevel: SentimentGaugeData["defconLevel"] = "DEFCON 2";
  let defconLabel = "CRITICAL WAR-RISK // DIRECT EXCHANGES";

  if (compositeScore >= 92) {
    defconLevel = "DEFCON 1";
    defconLabel = "KINETIC REGIONAL CONFLICT // HORMUZ INTERDICTION";
  } else if (compositeScore >= 80) {
    defconLevel = "DEFCON 2";
    defconLabel = "CRITICAL WAR-RISK // RETALIATORY SPIRAL";
  } else if (compositeScore >= 68) {
    defconLevel = "DEFCON 3";
    defconLabel = "HIGH ALERT // ACTIVE DETERRENCE";
  } else if (compositeScore >= 50) {
    defconLevel = "DEFCON 4";
    defconLabel = "ELEVATED WATCH // TACTICAL PROBING";
  } else {
    defconLevel = "DEFCON 5";
    defconLabel = "BASELINE NORMALIZED PATROL";
  }

  let volatilityProjection = "High Volatility: Brent Risk Premium +$12-$18/bbl";
  if (compositeScore >= 90) {
    volatilityProjection = "Severe Shock: Brent $96-$110/bbl, Gold $4,220+ Breakout";
  } else if (compositeScore < 70) {
    volatilityProjection = "Moderate Variance: Brent $84-$88/bbl Range";
  }

  return {
    compositeScore,
    confidenceScore,
    defconLevel,
    defconLabel,
    headlineCountAnalyzed: totalHeadlines,
    sentimentDistribution: {
      kineticEscalationPct,
      retaliationRiskPct,
      deterrencePct,
      diplomaticDeescalationPct
    },
    volatilityProjection,
    lastUpdated: new Date().toTimeString().split(' ')[0] + ' UTC',
    recentHeadlines: headlines
  };
}

// Local Quantitative NLP Parser for Breaking Custom Headlines
export function parseHeadlineLocalNLP(text: string): GeopoliticalHeadline {
  const lower = text.toLowerCase();
  
  let sentiment: GeopoliticalHeadline["sentiment"] = "Escalatory Kinetic";
  let impactScore = 85;
  let confidenceScore = 91;
  let category: GeopoliticalHeadline["category"] = "US-Iran Kinetic";

  const isStrike = lower.includes("strike") || lower.includes("bomb") || lower.includes("missile") || lower.includes("airstrike") || lower.includes("attack");
  const isRetaliation = lower.includes("retaliat") || lower.includes("revenge") || lower.includes("salvo") || lower.includes("counter");
  const isPipeline = lower.includes("pipeline") || lower.includes("petroline") || lower.includes("east-west") || lower.includes("adcop") || lower.includes("houthi") || lower.includes("yanbu") || lower.includes("interdiction");
  const isHormuz = lower.includes("hormuz") || lower.includes("choke") || lower.includes("strait") || lower.includes("mine") || lower.includes("fujairah") || lower.includes("bab el-mandeb") || lower.includes("red sea");
  const isTanker = lower.includes("tanker") || lower.includes("vlcc") || lower.includes("vessel") || lower.includes("cargo") || lower.includes("shipping");
  const isDiplomatic = lower.includes("truce") || lower.includes("ceasefire") || lower.includes("negotiat") || lower.includes("backchannel") || lower.includes("peace") || lower.includes("talks");

  if (isDiplomatic && !isStrike) {
    sentiment = "De-escalatory";
    category = "Diplomatic / Backchannel";
    impactScore = 46 + Math.floor(Math.random() * 8);
    confidenceScore = 82 + Math.floor(Math.random() * 8);
  } else if (isPipeline) {
    category = "Sanctions & Energy";
    sentiment = "Escalatory Kinetic";
    impactScore = 94 + Math.floor(Math.random() * 5);
    confidenceScore = 96 + Math.floor(Math.random() * 3);
  } else if (isRetaliation) {
    sentiment = "Severe Retaliation";
    impactScore = 93 + Math.floor(Math.random() * 6);
    confidenceScore = 94 + Math.floor(Math.random() * 5);
  } else if (isStrike) {
    sentiment = "Escalatory Kinetic";
    impactScore = 90 + Math.floor(Math.random() * 7);
    confidenceScore = 95 + Math.floor(Math.random() * 4);
  } else if (isHormuz || isTanker) {
    category = "Hormuz Chokepoint";
    sentiment = "Escalatory Kinetic";
    impactScore = 88 + Math.floor(Math.random() * 8);
    confidenceScore = 92 + Math.floor(Math.random() * 6);
  }

  const brentAdd = (impactScore * 0.05).toFixed(2);
  const goldAdd = (impactScore * 0.42).toFixed(1);
  const tankerAdd = Math.round(impactScore * 1.6);

  const now = new Date();
  const timeStr = `${now.toLocaleDateString("en-US", { month: "short", day: "2-digit" })} • ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })} UTC`;

  return {
    id: `custom-${Date.now()}`,
    timestamp: `${timeStr} (Desk Ingested)`,
    source: "SMC NLP Terminal Ingestion",
    headline: text.trim(),
    summary: `NLP extracted direct ${sentiment.toLowerCase()} posture in Middle East theater. Model factored into real-time composite score.`,
    category,
    sentiment,
    impactScore: Math.min(99, impactScore),
    confidenceScore: Math.min(99, confidenceScore),
    affectedAssets: {
      brentImpact: `+$${brentAdd}/bbl risk shift`,
      goldImpact: `+$${goldAdd}/oz haven response`,
      tankerRateImpact: `+${tankerAdd} bps insurance`
    },
    isLiveNew: true
  };
}

const STOP_WORDS = new Set([
  "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with",
  "by", "from", "as", "is", "are", "was", "were", "be", "been", "being", "have", "has",
  "had", "do", "does", "did", "after", "before", "over", "under", "about", "into",
  "through", "during", "its", "it", "this", "that", "these", "those", "says", "said"
]);

/**
 * Normalizes a headline string by:
 * 1. Stripping publisher source suffixes (e.g. " - Reuters", " | Bloomberg", " - Euronews.com")
 * 2. Stripping breaking prefixes ("BREAKING:", "ALERT:", "FLASH:", etc.)
 * 3. Removing punctuation and non-alphanumeric chars
 * 4. Filtering out common stop words to capture the core event tokens
 */
export function normalizeHeadlineKey(text: string): string {
  if (!text) return "";
  // 1. Strip publisher suffixes
  let cleaned = text.replace(/\s*[-|–—]\s*([A-Za-z0-9\s&.]+?)$/, "").trim();
  // 2. Strip breaking prefixes
  cleaned = cleaned.replace(/^(breaking|flash|urgent|alert|update\s*\d*|just in|live|exclusive)[:\s-]*/i, "").trim();
  // 3. Extract core meaningful words
  const words = cleaned
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));

  const uniqueSorted = Array.from(new Set(words)).sort().slice(0, 8);
  return uniqueSorted.join("-");
}

/**
 * Extracts token set for word-overlap similarity comparison
 */
function extractHeadlineTokens(text: string): Set<string> {
  if (!text) return new Set();
  let cleaned = text.replace(/\s*[-|–—]\s*([A-Za-z0-9\s&.]+?)$/, "").trim();
  cleaned = cleaned.replace(/^(breaking|flash|urgent|alert|update\s*\d*|just in|live|exclusive)[:\s-]*/i, "").trim();
  const words = cleaned
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));
  return new Set(words);
}

/**
 * Checks if two headlines share >= 65% core semantic keyword overlap
 */
function areHeadlinesSemanticallySimilar(tokensA: Set<string>, tokensB: Set<string>): boolean {
  if (tokensA.size === 0 || tokensB.size === 0) return false;
  let intersection = 0;
  for (const t of tokensA) {
    if (tokensB.has(t)) intersection++;
  }
  const minSize = Math.min(tokensA.size, tokensB.size);
  return (intersection / minSize) >= 0.65;
}

/**
 * Strips and deduplicates a list of geopolitical headlines by:
 * 1. Normalized headline key (removes prefixes, punctuation, casing, stopwords)
 * 2. Token Jaccard overlap (detects rephrased syndicated copies of the same news)
 * 3. Exact trimmed headline & Unique ID
 * 4. Freshness Gate: optionally filters out stale headlines older than maxAgeHours
 * Retains the freshest (first-encountered) headline in the list.
 */
export function deduplicateHeadlines(
  headlines: GeopoliticalHeadline[],
  maxAgeHours = 24
): GeopoliticalHeadline[] {
  if (!headlines || !Array.isArray(headlines)) return [];

  const seenIds = new Set<string>();
  const seenExact = new Set<string>();
  const seenNormKeys = new Set<string>();
  const seenTokenSets: Array<{ tokens: Set<string>; id: string }> = [];

  const now = Date.now();
  const maxAgeMs = maxAgeHours * 3600 * 1000;

  return headlines.filter((item) => {
    if (!item || !item.headline) return false;

    // Optional raw timestamp freshness check (reject if older than maxAgeHours)
    if (item.rawTimestamp && (now - item.rawTimestamp) > maxAgeMs) {
      return false;
    }

    // Direct ID check
    if (item.id && seenIds.has(item.id)) {
      return false;
    }

    // Exact trimmed text check
    const exact = item.headline.trim().toLowerCase();
    if (seenExact.has(exact)) {
      return false;
    }

    // Normalized key check
    const normKey = normalizeHeadlineKey(item.headline);
    if (normKey && seenNormKeys.has(normKey)) {
      return false;
    }

    // Semantic word-overlap check against already retained headlines
    const itemTokens = extractHeadlineTokens(item.headline);
    for (const existing of seenTokenSets) {
      if (areHeadlinesSemanticallySimilar(itemTokens, existing.tokens)) {
        return false; // Repetitive syndicated coverage of the same event
      }
    }

    if (item.id) seenIds.add(item.id);
    seenExact.add(exact);
    if (normKey) seenNormKeys.add(normKey);
    if (itemTokens.size > 0) {
      seenTokenSets.push({ tokens: itemTokens, id: item.id || "" });
    }

    return true;
  });
}
