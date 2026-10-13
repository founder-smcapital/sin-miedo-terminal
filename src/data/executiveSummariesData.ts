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
      subtitle: "Weekly Buyback Run-Rate Scaled to $6.0B to Absorb Duration & Compress Term Premiums",
      category: "Sovereign Debt & Liquidity",
      badge: "TREASURY BUYBACK RAMP ($6B/WK)",
      urgency: "CRITICAL",
      timestamp: formattedTime,
      summary: `The US Department of the Treasury (Office of Debt Management) has expanded weekly liquidity buyback operations to $6.0 Billion ($24B/month run-rate). Primary dealer inventory absorption in off-the-run benchmarks extracts -$46.8M/bp of DV01 duration weekly, compressing term premiums by -14.2 bps and establishing a synthetic liquidity floor offsetting Fed quantitative tightening.`,
      keyMetric: "Weekly: $6.0B | Run-Rate: $312B/yr | Term Premium: -14.2 bps | Bid-to-Cover: 3.42x",
      deskTakeaway: "Desk Action: Long 5Y-10Y sovereign curve steepener vs ultra-long supply. Absorb off-the-run duration dips during Treasury operation windows; invalidate below 4.28% 10Y real yield.",
      relevantSlug: "debt_radar",
      isNew: true
    },
    {
      id: "EXEC-BOJ-FLASH",
      title: "MoF/BoJ Quiet Stealth Intervention & Carry Cascade Aftermath",
      subtitle: "Unannounced $38B Dollar Liquidity Deployment Defends 160.50 Threshold",
      category: "Yen FX & Central Banks",
      badge: yenEngine.spot <= 157.0 ? "POST-INTERVENTION DEFENSE" : "MOF WATCH REGIME",
      urgency: yenEngine.spot >= 158.5 ? "CRITICAL" : "HIGH",
      timestamp: formattedTime,
      summary: `Cross-market settlement data confirms an unannounced MoF/BoJ dollar-selling execution of approximately $35B-$42B equivalent, defending the 160.50 threshold and driving USD/JPY spot to ${yenEngine.spot} (${yenEngine.change}). Probability of additional unilateral market intervention has contracted to ${yenEngine.interventionOdds}% as speculative carry positions decompress across Tokyo and London books.`,
      keyMetric: `Spot: ${yenEngine.spot} | Intervention Odds: ${yenEngine.interventionOdds}% | Status: ${yenEngine.defconStatus || "Absorbed"}`,
      deskTakeaway: `Desk Action: Close short-dated JPY put straddles; delta-hedge long carry baskets with 157.80 trailing stop. Expect spot consolidation in 155.20-157.00 auction bracket.`,
      relevantSlug: "yen",
      isNew: true
    },
    {
      id: "EXEC-HORMUZ-FLASH",
      title: "Strait of Hormuz Kinetic Standoff & Saudi East-West Petroline Closure",
      subtitle: "Precautionary Pipeline Halt Concentrates 100% of Gulf Crude Through Maritime Bottleneck",
      category: "Geopolitics & Chokepoints",
      badge: "PIPELINE SUSPENSION",
      urgency: "CRITICAL",
      timestamp: formattedTime,
      summary: `The Middle East Geopolitical Risk Index stands at ${meEngine.riskIndex}/100 with GPR benchmark at ${meEngine.gprIndex} pts. Saudi Aramco's temporary suspension of the 5.0M bpd East-West Petroline leaves global energy logistics with zero Red Sea bypass capacity, concentrating 20.8M bpd of transit through the Strait of Hormuz. Cape of Good Hope rerouting remains at ${meEngine.redSeaRerouteRate}, maintaining an embedded geopolitical war adder of ${meEngine.brentGeopoliticalPremium} in Brent crude ($${brentTicker?.price?.toFixed(2) || "100.04"}/bbl).`,
      keyMetric: `Petroline: OFFLINE (0 bpd) | Hormuz Funnel: 20.8M bpd | War Adder: ${meEngine.brentGeopoliticalPremium}`,
      deskTakeaway: `Desk Action: Maintain long front-month Brent calendar spreads (M1-M2 backwardation). Utilize put collar overlays to hedge against diplomatic de-escalation tails.`,
      relevantSlug: "middleEast",
      isNew: true
    },
    {
      id: "EXEC-IBEX-FLASH",
      title: "IBEX 35 Bullish Pivot Expansion & Spanish Banking Margin Resilience",
      subtitle: `Positive Relative Momentum Sustained Above ${ibexEngine.keyLevels.pivot.toLocaleString()} Daily Pivot`,
      category: "European Equities",
      badge: "LONG BIAS STRUCTURE",
      urgency: "ELEVATED",
      timestamp: formattedTime,
      summary: `Spanish equities maintain relative strength at ${ibexEngine.level} (${ibexEngine.dailyChange}), auctioning above the ${ibexEngine.keyLevels.pivot} Daily Pivot. Net interest margins and capital ratios among Tier-1 Spanish banking constituents (Santander, BBVA, CaixaBank) continue to outperform broader Euro Stoxx 50 benchmarks.`,
      keyMetric: `Level: ${ibexEngine.level} | Daily Pivot: ${ibexEngine.keyLevels.pivot} | Target R2: ${ibexEngine.keyLevels.r2}`,
      deskTakeaway: `Desk Action: Hold core long exposure above ${ibexEngine.keyLevels.pivot}. Distribute partial liquidity into the ${ibexEngine.keyLevels.r1} - ${ibexEngine.keyLevels.r2} resistance band; invalidate on 1H close below ${ibexEngine.keyLevels.s1}.`,
      relevantSlug: "ibex",
      isNew: false
    },
    {
      id: "EXEC-FLEET-FLASH",
      title: "Kharg Island Dark Fleet Loading Surge & AIS Spoofing Radar Cluster",
      subtitle: "Satellite SAR Passes Confirm 412 Dark Tankers Active in Illicit Energy Corridor",
      category: "Energy & Shadow Fleet",
      badge: "SAR RADAR ACTIVE",
      urgency: "HIGH",
      timestamp: formattedTime,
      summary: `Synthetic Aperture Radar (SAR) imagery detects ${fleetEngine.activeDarkTankers} dark fleet tankers operating with disabled or spoofed AIS beacons. Total estimated illicit export pace is ${fleetEngine.illicitOutflowBpd} across ${fleetEngine.stsClustersCount} ship-to-ship transfer hubs near ${fleetEngine.stsPrimaryHub}, supplying private independent refiners in Shandong.`,
      keyMetric: `Dark Vessels: ${fleetEngine.activeDarkTankers} | Outflow: ${fleetEngine.illicitOutflowBpd} | Spoofed Beacons: ${fleetEngine.aisSpoofingBeacons}`,
      deskTakeaway: `Desk Action: Monitor secondary OFAC maritime sanctions on Singapore/Malaysian STS transfer zones; prompt physical crack spreads remain vulnerable to sudden interdictions.`,
      relevantSlug: "shadowFleet",
      isNew: true
    },
    {
      id: "EXEC-CRYPTO-FLASH",
      title: "Global Liquidity Beta & Sovereign Debasement Convergence (BTC & Gold)",
      subtitle: `Gold Holds Structural Highs ($${goldTicker?.price ? Math.floor(goldTicker.price) : 4400}+/oz) as Bitcoin Tests Resistance on Institutional Inflows`,
      category: "Liquidity & Digital Assets",
      badge: "DEBASEMENT HEDGE",
      urgency: "ELEVATED",
      timestamp: formattedTime,
      summary: `Spot Gold (${goldTicker?.change && goldTicker.change >= 0 ? '+' : ''}${goldTicker?.change ?? 0.04}% at $${goldTicker?.price?.toFixed(1) || "4408.60"}/oz) continues to reflect multi-year central bank reserve accumulation. Concurrently, Bitcoin ($${btcTicker?.price?.toLocaleString() || "79,380.00"}) trades with high positive beta to global M2 expansion, as regulated ETF allocations absorb secondary OTC liquidity.`,
      keyMetric: `Gold Spot: $${goldTicker?.price?.toFixed(1) || "4,408.60"}/oz | BTC: $${btcTicker?.price?.toLocaleString() || "79,380.00"}`,
      deskTakeaway: `Desk Action: Hold long macro monetary hedge allocations. Rebalance Bitcoin delta into 90-day spot gold call options on tests of $82,500 resistance.`,
      relevantSlug: "gold",
      isNew: false
    }
  ];
};
