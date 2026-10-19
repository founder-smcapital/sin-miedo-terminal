export interface TickerItem {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changeUnit: "%" | "bps" | "pts";
  status: string;
  threshold?: number;
  pivot?: number;
  signal: "danger" | "brass" | "neutral" | "emerald";
  high24h?: number;
  low24h?: number;
  prevClose?: number;
  history24h?: Array<{ hour: string; price: number; formatted: string }>;
}

export interface EscalationZone {
  range: string;
  tag: "CRITICAL" | "HIGH" | "MEDIUM" | "WATCH";
  title: string;
  desc: string;
}

export interface Chokepoint {
  name: string;
  status: string;
  riskScore: number; // 0-100 scale (0 = no conflict, 100 = extreme conflict)
  threat: string;
  flow: string;
}

export interface EuCorrelation {
  name: string;
  value: string;
  status: string;
}

export interface FlashAlert {
  id: string;
  time: string;
  category: string;
  text: string;
  severity: "critical" | "high" | "normal" | "low";
}

export interface MacroDataState {
  timestamp: string;
  formattedTime: string;
  tickers: TickerItem[];
  engines: {
    yenIntervention: {
      spot: number;
      change: string;
      threshold: number;
      interventionOdds: number;
      defcon: string;
      defconStatus: string;
      jawboningLevel: number;
      jawboningLabel: string;
      ustJgbSpread: string;
      ustJgbChange: string;
      jgb10y: string;
      ust10y?: string;
      deskPosition: string;
      deskCode: string;
      zones: EscalationZone[];
    };
    ibexBias: {
      level: number;
      dailyChange: string;
      propExecutionBias: string;
      directionalScore: string;
      volatilityRegime: string;
      keyLevels: {
        r2: number;
        r1: number;
        pivot: number;
        s1: number;
        s2: number;
      };
      deskPosition: string;
      deskCode: string;
      euCorrelations: EuCorrelation[];
    };
    middleEastWarRisk: {
      riskIndex: number; // 0-100 regional conflict index
      gprIndex: number; // Global Geopolitical Risk Index benchmark (sitting above 360)
      riskStatus: string;
      hormuzThreatLevel: string;
      redSeaRerouteRate: string;
      tankerInsuranceSurcharge: string;
      brentGeopoliticalPremium: string;
      deskPosition: string;
      deskCode: string;
      chokepoints: Chokepoint[];
    };
    iranShadowFleet: {
      activeDarkTankers: number;
      monitoredTotal: number;
      illicitOutflowBpd: string;
      outflowChange: string;
      primaryDestination: string;
      aisSpoofingBeacons: number;
      stsClustersCount: number;
      stsPrimaryHub: string;
      sarSatellitePass: string;
      synthesis: string;
      complianceStatus: string;
      deskCode: string;
    };
  };
  flashAlerts: FlashAlert[];
}

export type ActiveTab = "dashboards" | "intelligence" | "systems" | "futures" | "pulse" | "support";

export interface ResearchMetric {
  label: string;
  value: string;
  change?: string;
  note?: string;
}

export interface InstitutionalBrief {
  id: string;
  title: string;
  subtitle: string;
  institution: string;
  institutionAcronym: string;
  institutionCategory: "Central Banks & Regulators" | "Tier-1 Investment Banks" | "Energy & Geopolitical Institutes" | "Maritime Security & Analytics";
  relevantDashboard: "BoJ Yen Intervention" | "IBEX 35 Prop Desk" | "Middle East War-Risk" | "Iran Shadow Fleet" | "Macro Commodities & Gold" | "BTC & Digital Liquidity" | "Net Liquidity Drivers & Debt Buyback Telemetry";
  dashboardSlug: "boj" | "ibex" | "hormuz" | "shadow" | "gold" | "crypto" | "debt_radar";
  publishDate: string;
  lastUpdated: string;
  documentType: string;
  securityClassification: string;
  reportRefNumber: string;
  executiveSummary: string;
  keyFindings: string[];
  deskImplications: string;
  metrics: ResearchMetric[];
  authorDesk: string;
  downloadCount?: number;
  pdfFileName: string;
  readingTimeMinutes: number;
  pagesCount: number;
}

export interface MacroNarrativeItem {
  id: string;
  headline: string;
  source: string;
  sourceAcronym: string;
  category: "central_banks" | "sovereign_debt" | "primary_macro" | "wall_street_strats" | "geopolitics_energy" | "sanctions_chokepoints" | "positioning_flows";
  timestamp: string;
  rawTimestamp: number;
  summary: string;
  impactLevel: "CRITICAL" | "HIGH" | "ELEVATED" | "MEDIUM" | "NEUTRAL";
  affectedAssets: Array<{
    ticker: string;
    bias: "bullish" | "bearish" | "neutral";
    rationale: string;
  }>;
  url?: string;
  isLiveDirect: boolean;
  wireType: "OFFICIAL_COMMUNIQUE" | "MACRO_STRAT" | "DATA_PRINT" | "KINETIC_DISPATCH";
}

export type Currency = "USD" | "EUR";

export type ClearanceTier =
  | "Founding Member"
  | "Professional Allocator"
  | "Institutional Desk"
  | "Sovereign Advisory"
  | "Institutional Alpha"
  | "Sovereign Desk"
  | "Guest";

export interface UserSession {
  isAuthenticated: boolean;
  uid?: string;
  email?: string;
  name?: string;
  role?: "admin" | "analyst" | "partner" | "founding_member";
  tier?: ClearanceTier;
  deskAccess?: string[];
  loginTime?: string;
  currency?: Currency;
}

export interface ThoughtStep {
  title: string;
  detail: string;
  status: "completed" | "processing" | "queued";
  timeMs?: number;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "smc-agent";
  text: string;
  timestamp: string;
  source?: string;
  thoughtProcess?: {
    durationSeconds: number;
    steps: ThoughtStep[];
  };
}

export interface GeopoliticalHeadline {
  id: string;
  timestamp: string;
  source: string;
  headline: string;
  summary: string;
  category: "US-Iran Kinetic" | "Hormuz Chokepoint" | "Proxy & Red Sea" | "Diplomatic / Backchannel" | "Sanctions & Energy";
  sentiment: "Escalatory Kinetic" | "Severe Retaliation" | "Heightened Deterrence" | "Neutral / Monitored" | "De-escalatory";
  impactScore: number; // 0-100 war-risk severity
  confidenceScore: number; // 0-100% confidence rating
  affectedAssets: {
    brentImpact: string;
    goldImpact: string;
    tankerRateImpact: string;
    btcImpact?: string;
  };
  isLiveNew?: boolean;
  rawTimestamp?: number;
  link?: string;
  pubDate?: string;
  relativeAge?: string;
}

export interface OrderBookLevel {
  price: number;
  size: number;
  total: number;
  percent: number;
}

export interface BtcOrderBookDepth {
  midPrice: number;
  spread: number;
  spreadBps: number;
  bestBid: number;
  bestAsk: number;
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
  totalBidDepthBtc: number;
  totalAskDepthBtc: number;
  totalBidDepthUsd: number;
  totalAskDepthUsd: number;
  bidPressurePct: number;
  askPressurePct: number;
  imbalanceRatio: number;
  imbalanceState: "BULLISH ABSORPTION" | "BALANCED" | "BEARISH OVERHANG";
  bidWalls: { price: number; size: number; desc: string }[];
  askWalls: { price: number; size: number; desc: string }[];
}

export interface SentimentGaugeData {
  compositeScore: number;
  confidenceScore: number;
  defconLevel: "DEFCON 1" | "DEFCON 2" | "DEFCON 3" | "DEFCON 4" | "DEFCON 5";
  defconLabel: string;
  headlineCountAnalyzed: number;
  sentimentDistribution: {
    kineticEscalationPct: number;
    retaliationRiskPct: number;
    deterrencePct: number;
    diplomaticDeescalationPct: number;
  };
  volatilityProjection: string;
  lastUpdated: string;
  recentHeadlines: GeopoliticalHeadline[];
}

export interface RelevantExecutiveSummary {
  id: string;
  title: string;
  subtitle?: string;
  category: "Yen FX & Central Banks" | "Geopolitics & Chokepoints" | "European Equities" | "Energy & Shadow Fleet" | "Liquidity & Digital Assets" | "Sovereign Debt & Liquidity";
  badge: string;
  urgency: "CRITICAL" | "HIGH" | "ELEVATED" | "STABLE";
  timestamp: string;
  summary: string;
  keyMetric: string;
  deskTakeaway: string;
  relevantSlug: "yen" | "ibex" | "middleEast" | "shadowFleet" | "gold" | "debt_radar";
  isNew?: boolean;
}
