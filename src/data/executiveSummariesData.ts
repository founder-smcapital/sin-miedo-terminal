import { MacroDataState, RelevantExecutiveSummary } from "../types";

export const generateRelevantExecutiveSummaries = (
  macroData: MacroDataState
): RelevantExecutiveSummary[] => {
  const yenEngine = macroData.engines.yenIntervention;
  const ibexEngine = macroData.engines.ibexBias;
  const meEngine = macroData.engines.middleEastWarRisk;
  const fleetEngine = macroData.engines.iranShadowFleet;

  const btcTicker = macroData.tickers.find((t) => t.symbol === "BTC/USD");
  const goldTicker = macroData.tickers.find((t) => t.symbol === "XAU/USD");
  const brentTicker = macroData.tickers.find((t) => t.symbol === "BRENT");

  const formattedTime = macroData.formattedTime || new Date().toISOString().slice(11, 19) + " UTC";

  return [
    {
      id: "EXEC-UST-BUYBACK-FLASH",
      title: "US Treasury $6B Weekly Bond Buyback Expansion & Yield Curve Backstop",
      subtitle: "Tripling/Doubling Buyback Run-Rate to $6.0B Injects Stealth Liquidity as Bond Market Trades on Edge",
      category: "Sovereign Debt & Liquidity",
      badge: "TREASURY BUYBACK RAMP ($6B/WK)",
      urgency: "CRITICAL",
      timestamp: formattedTime,
      summary: `Similar to the Bank of Japan's unilateral FX interventions at USD/JPY 160, the US Department of the Treasury (Office of Debt Management) has dramatically escalated sovereign bond buybacks, doubling/tripling weekly operations to $6.0 Billion ($24B/month run-rate). With primary dealers under severe balance sheet strain and the 10Y/30Y yield curve on edge, this targeted operation extracts -$46.8M/bp of DV01 duration weekly, compressing term premiums by -14.2 bps and providing structural liquidity support to off-the-run Treasuries.`,
      keyMetric: "Weekly: $6.0B (Doubled) | Run-Rate: $312B/yr | Term Premium: -14.2 bps | Bid-to-Cover: 3.42x",
      deskTakeaway: "Stealth Operation Twist acts as a synthetic liquidity floor offsetting Fed QT. Front-run dealer inventory absorption in off-the-run 5Y-10Y benchmarks; fade sovereign duration spikes.",
      relevantSlug: "debt_radar",
      isNew: true
    },
    {
      id: "EXEC-BOJ-FLASH",
      title: "MoF/BoJ Quiet Stealth Intervention & Carry Cascade Aftermath",
      subtitle: "Unannounced $38B Dollar Liquidity Deployment Defends 160.50 Threshold",
      category: "Yen FX & Central Banks",
      badge: yenEngine.spot <= 157.0 ? "POST-INTERVENTION DEFENSE" : "HIGH DEFCON SURVEILLANCE",
      urgency: yenEngine.spot >= 158.5 ? "CRITICAL" : "HIGH",
      timestamp: formattedTime,
      summary: `Post-execution market telemetry confirms a quiet, unannounced MoF/BoJ dollar-selling execution of approximately $35B-$42B equivalent, successfully defending the 160.50 redline and sending USD/JPY spot to ${yenEngine.spot} (${yenEngine.change}). Unilateral intervention probability has collapsed to ${yenEngine.interventionOdds}% as speculative carry froth decompresses across Tokyo and London turnover.`,
      keyMetric: `Spot: ${yenEngine.spot} | Odds: ${yenEngine.interventionOdds}% | ${yenEngine.defcon}`,
      deskTakeaway: `Take profit on short-dated put straddles; model intervention probability decompressing to baseline as spot consolidates in the 155.50-157.00 zone.`,
      relevantSlug: "yen",
      isNew: true
    },
    {
      id: "EXEC-HORMUZ-FLASH",
      title: "Strait of Hormuz Kinetic Standoff & Saudi East-West Petroline Closure",
      subtitle: "Saudi Aramco Suspends 5.0M bpd Red Sea Bypass Artery Amid Houthi Drone Interdictions",
      category: "Geopolitics & Chokepoints",
      badge: "CRITICAL PIPELINE HALT",
      urgency: "CRITICAL",
      timestamp: formattedTime,
      summary: `The Middle East Geopolitical Risk Index registers at ${meEngine.riskIndex}/100 with GPR Index at ${meEngine.gprIndex} pts. Saudi Aramco's precautionary shutdown of the 5.0M bpd East-West Petroline following Yemeni-Houthi drone swarm interdictions has eliminated the Kingdom's primary Red Sea bypass, forcing 100% of Persian Gulf crude transit through the Strait of Hormuz. With Bab el-Mandeb interdictions sustaining a ${meEngine.redSeaRerouteRate} Cape diversion, embedded war premium of ${meEngine.brentGeopoliticalPremium} anchors Brent as spot dips to test the $100 psychological support floor ($${brentTicker?.price?.toFixed(2) || "100.04"}/bbl).`,
      keyMetric: `Petroline: OFFLINE (0 bpd) | Hormuz Risk: ${meEngine.riskIndex}/100 | War Adder: ${meEngine.brentGeopoliticalPremium}`,
      deskTakeaway: `Aggressively maintain long front-month Brent calendar spreads and call collars; pipeline shutdown leaves global oil logistics with zero surplus Gulf bypass capacity.`,
      relevantSlug: "middleEast",
      isNew: true
    },
    {
      id: "EXEC-IBEX-FLASH",
      title: "IBEX 35 Bullish Pivot Expansion & Spanish Banking Margin Resilience",
      subtitle: `Positive Cross-European Divergence Sustained Above ${ibexEngine.keyLevels.pivot.toLocaleString()} Daily Pivot`,
      category: "European Equities",
      badge: "PROPRIETARY LONG BIAS",
      urgency: "ELEVATED",
      timestamp: formattedTime,
      summary: `Spanish equities maintain positive relative momentum at ${ibexEngine.level} (${ibexEngine.dailyChange}), trading securely above the ${ibexEngine.keyLevels.pivot} Daily Pivot. Favorable domestic credit demand and resilient net interest margins among Tier-1 Spanish banking constituents provide structural support against broader Euro Stoxx drag.`,
      keyMetric: `Level: ${ibexEngine.level} | Pivot: ${ibexEngine.keyLevels.pivot} | Target: ${ibexEngine.keyLevels.r2}`,
      deskTakeaway: `Hold core long bias above ${ibexEngine.keyLevels.pivot} with tactical profit distribution scheduled into the ${ibexEngine.keyLevels.r1} - ${ibexEngine.keyLevels.r2} resistance corridor.`,
      relevantSlug: "ibex",
      isNew: false
    },
    {
      id: "EXEC-FLEET-FLASH",
      title: "Kharg Island Dark Fleet Loading Surge & AIS Spoofing Radar Cluster",
      subtitle: "Sentinel-1 SAR Satellite Pass Verifies 412 Dark Tankers Active in Illicit Energy Corridor",
      category: "Energy & Shadow Fleet",
      badge: "SHADOW RADAR LIVE",
      urgency: "HIGH",
      timestamp: formattedTime,
      summary: `Synthetic Aperture Radar (SAR) imagery detects ${fleetEngine.activeDarkTankers} active dark fleet tankers operating with disabled AIS transponders. Total illicit crude export pace is gauged at ${fleetEngine.illicitOutflowBpd} with ${fleetEngine.stsClustersCount} primary ship-to-ship (STS) transfer clusters anchored off ${fleetEngine.stsPrimaryHub}, buffering private Chinese teapot refinery operations.`,
      keyMetric: `Dark Vessels: ${fleetEngine.activeDarkTankers} | Flow: ${fleetEngine.illicitOutflowBpd} | AIS Spoofed: ${fleetEngine.aisSpoofingBeacons}`,
      deskTakeaway: `Illicit shadow supply dampens physical Brent prompt tightness; watch for secondary US Treasury OFAC sanctions targeting South China Sea STS logistics hubs.`,
      relevantSlug: "shadowFleet",
      isNew: true
    },
    {
      id: "EXEC-CRYPTO-FLASH",
      title: "Global Liquidity Beta & Sovereign Debasement Convergence (BTC & Gold)",
      subtitle: `Spot Gold Consolidates at $${goldTicker?.price ? Math.floor(goldTicker.price) : 4400}+/oz While Bitcoin Tests Resistance on ETF Inflows`,
      category: "Liquidity & Digital Assets",
      badge: "MACRO LIQUIDITY EXPANSION",
      urgency: "ELEVATED",
      timestamp: formattedTime,
      summary: `Gold (${goldTicker?.change && goldTicker.change >= 0 ? '+' : ''}${goldTicker?.change ?? 0.04}% at $${goldTicker?.price?.toFixed(1) || "4408.60"}/oz) continues its multi-year monetary supercycle on central bank reserve diversification. Concurrently, Bitcoin ($${btcTicker?.price?.toLocaleString() || "79,380.00"}, having tested above $82,000 recently) displays high beta to global money supply expansion. Institutional ETF inflows absorb OTC secondary liquidity.`,
      keyMetric: `Gold: $${goldTicker?.price?.toFixed(1) || "4,408.60"}/oz | BTC: $${btcTicker?.price?.toLocaleString() || "79,380.00"}`,
      deskTakeaway: `Maintain long spot asset allocation with digital gold call collar overlays; macro correlation matrix indicates tight co-movement during periods of geopolitical dollar stress.`,
      relevantSlug: "gold",
      isNew: false
    }
  ];
};
