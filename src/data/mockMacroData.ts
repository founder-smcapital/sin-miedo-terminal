import { MacroDataState } from "../types";

export const initialMacroData: MacroDataState = {
  timestamp: new Date().toISOString(),
  formattedTime: new Date().toTimeString().split(' ')[0] + ' UTC',
  tickers: [
    { symbol: "USD/JPY", name: "US Dollar / Yen", price: 156.25, change: -0.32, changeUnit: "%", status: "QUIET INTERVENTION -393 PIPS", threshold: 160.50, signal: "brass", high24h: 156.95, low24h: 155.80, prevClose: 156.75 },
    { symbol: "IBEX 35", name: "Madrid General", price: 19700.10, change: +0.65, changeUnit: "%", status: "BULLISH BIAS (19,800+)", pivot: 19780, signal: "brass", high24h: 19884.40, low24h: 19680.00, prevClose: 19573.40 },
    { symbol: "BRENT", name: "Crude Oil ICE", price: 100.04, change: -2.85, changeUnit: "%", status: "TESTING $100 SUPPORT ($100.04)", signal: "brass", high24h: 103.45, low24h: 99.85, prevClose: 102.98 },
    { symbol: "XAU/USD", name: "Gold Spot /oz", price: 4321.40, change: +0.36, changeUnit: "%", status: "SAFE HAVEN $4,300+", signal: "brass", high24h: 4338.50, low24h: 4298.00, prevClose: 4306.00 },
    { symbol: "BTC/USD", name: "Bitcoin Spot", price: 84117.80, change: +0.25, changeUnit: "%", status: "LIQUIDITY EXPANSION", threshold: 85000.00, signal: "brass", high24h: 85247.40, low24h: 83348.90, prevClose: 83907.50 },
    { symbol: "S&P 500", name: "S&P 500 Index", price: 7743.41, change: +0.49, changeUnit: "%", status: "BULLISH EXPANSION", threshold: 7700.00, signal: "brass", high24h: 7804.93, low24h: 7685.20, prevClose: 7706.03 },
    { symbol: "NASDAQ 100", name: "Nasdaq 100 Tech Index", price: 30608.14, change: +0.42, changeUnit: "%", status: "MOMENTUM EXPANSION", threshold: 30500.00, signal: "brass", high24h: 30889.25, low24h: 30413.59, prevClose: 30478.86 },
    { symbol: "DOW 30", name: "Dow Jones Industrial", price: 43890.00, change: +0.12, changeUnit: "%", status: "BLUE CHIP RESILIENCE", threshold: 44000.00, signal: "brass", high24h: 44105.00, low24h: 43760.00, prevClose: 43837.00 },
    { symbol: "RUSSELL 2000", name: "US Small Cap 2000", price: 2214.50, change: -0.15, changeUnit: "%", status: "RATE SCRUTINY", threshold: 2250.00, signal: "neutral", high24h: 2235.00, low24h: 2202.00, prevClose: 2217.80 },
    { symbol: "DAX 40", name: "Frankfurt DAX Index", price: 25408.64, change: +0.56, changeUnit: "%", status: "BULLISH EXPANSION", threshold: 25500.00, signal: "brass", high24h: 25480.00, low24h: 25250.00, prevClose: 25266.53 },
    { symbol: "EURO STOXX 50", name: "Eurozone Blue Chip", price: 5082.00, change: +0.36, changeUnit: "%", status: "VALUE ACCEPTANCE", threshold: 5100.00, signal: "brass", high24h: 5096.00, low24h: 5052.00, prevClose: 5064.00 },
    { symbol: "FTSE 100", name: "London FTSE 100", price: 10695.25, change: +0.14, changeUnit: "%", status: "COMMODITY BID", threshold: 10750.00, signal: "brass", high24h: 10730.00, low24h: 10660.00, prevClose: 10679.99 },
    { symbol: "KOSPI 200", name: "Korea Composite (KOSPI 200)", price: 1126.12, change: +1.15, changeUnit: "%", status: "BULLISH BREAKOUT", threshold: 1135.00, signal: "brass", high24h: 1132.50, low24h: 1108.00, prevClose: 1113.31 },
    { symbol: "NIKKEI 225", name: "Tokyo Nikkei 225", price: 66364.20, change: +1.30, changeUnit: "%", status: "TECH ACCUMULATION", threshold: 67000.00, signal: "brass", high24h: 66850.00, low24h: 65400.00, prevClose: 65513.99 },
    { symbol: "HANG SENG", name: "Hang Seng Index", price: 24510.09, change: -1.01, changeUnit: "%", status: "PBOC WATCH", threshold: 25000.00, signal: "neutral", high24h: 24820.00, low24h: 24450.00, prevClose: 24761.10 },
    { symbol: "GPR INDEX", name: "Geopolitical Risk Index", price: 364.5, change: +18.4, changeUnit: "pts", status: "HIGH RISK >360", signal: "danger" },
    { symbol: "ME-WAR RISK", name: "ME Conflict Index", price: 88.4, change: +4.2, changeUnit: "pts", status: "DEFCON 2 (0-100)", signal: "danger" },
    { symbol: "SHADOW-AIS", name: "Dark Tanker Outflow", price: 1.62, change: +6.8, changeUnit: "%", status: "412 ACTIVE VLCC", signal: "brass" },
    { symbol: "UST 10Y", name: "US 10Y Benchmark", price: 5.277, change: +4.0, changeUnit: "bps", status: "BENCHMARK 5.277%", signal: "neutral" },
    { symbol: "UST 2Y", name: "US 2Y Fed Policy", price: 4.422, change: -12.6, changeUnit: "bps", status: "POLICY 4.422%", signal: "neutral" },
    { symbol: "UST 30Y", name: "US 30Y Long Bond", price: 5.630, change: +2.7, changeUnit: "bps", status: "LONG BOND 5.630%", signal: "neutral" },
    { symbol: "UST 5Y", name: "US 5Y Treasury Belly", price: 5.055, change: +5.0, changeUnit: "bps", status: "BELLY 5.055%", signal: "neutral" },
    { symbol: "UST 2s10s", name: "2Y/10Y Curve Spread", price: 85.5, change: +16.6, changeUnit: "bps", status: "BULL STEEPENER", signal: "brass" },
    { symbol: "DE 10Y", name: "German 10Y Bund", price: 3.455, change: -0.5, changeUnit: "bps", status: "EURO RISK-FREE 3.46%", signal: "neutral" },
    { symbol: "ES 10Y", name: "Spanish 10Y Bono", price: 4.280, change: -1.2, changeUnit: "bps", status: "BONO SPREAD +82.5bps", signal: "brass" },
    { symbol: "JP 10Y", name: "Japan 10Y JGB", price: 3.088, change: +3.8, changeUnit: "bps", status: "BOJ NORMALIZATION", signal: "neutral" },
    { symbol: "UK 10Y", name: "UK 10Y Sovereign Gilt", price: 5.333, change: -6.7, changeUnit: "bps", status: "GILT BENCHMARK", signal: "neutral" },
    { symbol: "10Y TIPS", name: "US 10Y Real Yield", price: 2.450, change: -2.6, changeUnit: "bps", status: "REAL YIELD 2.45%", signal: "brass" },
    { symbol: "US 10Y-JGB", name: "Yield Spread", price: 219, change: +0.2, changeUnit: "bps", status: "SPREAD 219bps", signal: "neutral" },
    { symbol: "EUR/USD", name: "Euro / US Dollar", price: 1.0854, change: -0.22, changeUnit: "%", status: "ECB WATCH", signal: "neutral" },
    { symbol: "GBP/USD", name: "British Pound / USD", price: 1.3120, change: +0.18, changeUnit: "%", status: "CABLE / BOE BETA", signal: "brass" },
    { symbol: "AUD/USD", name: "Australian Dollar / USD", price: 0.6685, change: +0.34, changeUnit: "%", status: "COMMODITY BETA", signal: "brass" },
    { symbol: "USD/CHF", name: "US Dollar / Swiss Franc", price: 0.8524, change: -0.15, changeUnit: "%", status: "SAFE HAVEN", signal: "neutral" },
    { symbol: "XAG/USD", name: "Silver Spot /oz", price: 64.10, change: +0.15, changeUnit: "%", status: "PRECIOUS METALS EXPANSION", signal: "brass" },
    { symbol: "VIX", name: "CBOE Volatility", price: 18.95, change: -1.20, changeUnit: "%", status: "ELEVATED", signal: "neutral" },
    { symbol: "MOVE", name: "BofA MOVE Index", price: 102.4, change: -2.35, changeUnit: "pts", status: "RATES VOLATILITY", signal: "neutral" }
  ],
  engines: {
    yenIntervention: {
      spot: 156.25,
      change: "-2.45%",
      threshold: 160.50,
      interventionOdds: 14,
      defcon: "DEFCON 4",
      defconStatus: "Quiet Action Absorbed",
      jawboningLevel: 2,
      jawboningLabel: "L2: Orderly Conditions",
      ustJgbSpread: "219 bps",
      ustJgbChange: "+0.2 bps",
      jgb10y: "3.088%",
      ust10y: "5.277%",
      deskPosition: "Take profit on 152/156 Put Straddles (+420 pips captured); scale out of downside volatility",
      deskCode: "SMC_VOL_v4.2",
      zones: [
        {
          range: "160.50 - 162.00",
          tag: "CRITICAL",
          title: "CRITICAL EXECUTION ZONE",
          desc: "MoF direct liquidity drawdown via Bank of Japan NY desk. Defended successfully during quiet intervention."
        },
        {
          range: "159.50 - 160.50",
          tag: "HIGH",
          title: "PRE-INTERVENTION HIGH ALERT",
          desc: "Zone where BoJ initiated rate checks prior to the stealth dollar-selling sweep."
        },
        {
          range: "157.00 - 159.50",
          tag: "MEDIUM",
          title: "INTERVENTION RESISTANCE BAND",
          desc: "Downside trajectory zone during the -390 pip cascade following stealth execution."
        },
        {
          range: "152.00 - 157.00",
          tag: "WATCH",
          title: "BASELINE / POST-ACTION RELIEF",
          desc: "Current trading zone. Quiet MoF intervention absorbed; odds collapsed to 14%."
        }
      ]
    },
    ibexBias: {
      level: 19742.0,
      dailyChange: "-0.28%",
      propExecutionBias: "Defensive Pivot Hold & Regional Decoupling",
      directionalScore: "-32 / 100",
      volatilityRegime: "Normal Compressed (ATR: 164 pts)",
      keyLevels: {
        r2: 20060,
        r1: 19950,
        pivot: 19780,
        s1: 19700,
        s2: 19560
      },
      deskPosition: "Scalp long on 19,700 rejection; Core swing target 20,100",
      deskCode: "SMC_PROP_v8.1",
      euCorrelations: [
        { name: "IBEX / DAX Spread", value: "+42 bps", status: "Outperforming" },
        { name: "Euro Stoxx 50 Beta", value: "1.14x", status: "High Sensitivity" },
        { name: "Santander/BBVA Weight", value: "34.2%", status: "Banking Tailwinds" },
        { name: "Inditex Momentum", value: "RSI 62", status: "Consolidating" }
      ]
    },
    middleEastWarRisk: {
      riskIndex: 88.4,
      gprIndex: 364.5,
      riskStatus: "CRITICAL WAR-RISK",
      hormuzThreatLevel: "Level 5 (Direct Transshipment Interdiction)",
      redSeaRerouteRate: "74.8% Via Cape of Good Hope",
      tankerInsuranceSurcharge: "+460 bps (War Risk Area Addition)",
      brentGeopoliticalPremium: "$18.50 / bbl",
      deskPosition: "Long Brent prompt backwardation / calendar spreads; Hedge tanker spot rates",
      deskCode: "SMC_RISK_v3.4",
      chokepoints: [
        { name: "Saudi East-West Petroline", status: "EMERGENCY HALT (0 bpd)", riskScore: 95, threat: "Precautionary shutdown due to Houthi Red Sea ballistic escalations; 5M bpd bypass lost", flow: "0.0M bpd (100% divert to Hormuz)" },
        { name: "Bab el-Mandeb (Red Sea)", status: "ACTIVE DISRUPTION", riskScore: 90, threat: "Houthi Anti-Ship Missile Vectors & Drone Swarms", flow: "Rerouting around Africa (74.8%)" },
        { name: "Strait of Hormuz", status: "SEVERELY ELEVATED", riskScore: 80, threat: "IRGC Fast Attack Craft Drills & GPS Jamming", flow: "18.2M bpd at critical risk" },
        { name: "Kharg Island Terminal", status: "HIGH SURVEILLANCE", riskScore: 75, threat: "Optic Satellite & Drone Recon Overhead", flow: "90% Iranian exports" },
        { name: "Fujairah Anchorage", status: "CONGESTION ALERT", riskScore: 65, threat: "Bunkering Delay 48hrs due to Insurer Stalls", flow: "Key Global Bunkering Hub" }
      ]
    },
    iranShadowFleet: {
      activeDarkTankers: 412,
      monitoredTotal: 640,
      illicitOutflowBpd: "1.62M bpd",
      outflowChange: "+6.8%",
      primaryDestination: "Shandong Teapots (China)",
      aisSpoofingBeacons: 184,
      stsClustersCount: 7,
      stsPrimaryHub: "Malacca / Riau Archipelago",
      sarSatellitePass: "Sentinel-1 SAR / Spire Optic Telemetry Active",
      synthesis: "Vessels originating from Kharg Island and Bandar Abbas are using automated circle-drifting transponder spoofing while physically loading South Pars condensate, transferring to Chinese-owned VLCCs in the Riau Archipelago disguised as 'Malaysian Blend'.",
      complianceStatus: "High Dark Fleet Velocity // STS Clustering in Riau",
      deskCode: "SMC_SAR_v5.0"
    }
  },
  flashAlerts: [
    { id: "al-saudi-pipe", time: "Just now", category: "ENERGY / PIPELINE", text: "SAUDI PETROLINE HALT: Saudi Aramco confirms precautionary shutdown of 5.0M bpd East-West oil pipeline following Houthi drone strikes near Yanbu; Hormuz bypass capacity is offline.", severity: "critical" },
    { id: "al-1", time: "3 min ago", category: "US-IRAN KINETIC", text: "US CENTCOM STRIKES CONFIRMED: Carrier strike group launches coordinated Tomahawk & B-2 precision strikes targeting IRGC coastal radar nodes and drone arrays along the northern Strait of Hormuz.", severity: "critical" },
    { id: "al-2", time: "2 min ago", category: "IRGC RETALIATION", text: "IRAN BALLISTIC SALVO: IRGC Aerospace Force confirms retaliatory missile barrage toward regional coalition logistics nodes; DEFCON 2 declared across Gulf security architecture.", severity: "critical" },
    { id: "al-3", time: "5 min ago", category: "HORMUZ BLOCKADE RISK", text: "UKMTO Emergency Advisory 042: Active electronic GPS jamming and secondary explosions confirmed 18nm off Fujairah; VLCC crude tankers executing emergency evasive holding maneuvers.", severity: "critical" },
    { id: "al-4", time: "9 min ago", category: "ENERGY SHOCK", text: "Brent crude spot premium trades above $102/bbl at $102.97 with +$18.50/bbl geopolitical risk adder embedded; Lloyd's JWLA war risk insurance additions surge +460 bps.", severity: "critical" },
    { id: "al-5", time: "16 min ago", category: "SHADOW FLEET", text: "SAR radar tracks 184 dark fleet tankers spoofing AIS transponders off Kharg Island, executing high-velocity STS transfers in the Riau Archipelago.", severity: "high" },
    { id: "al-6", time: "24 min ago", category: "MARITIME RISK", text: "Cape of Good Hope rerouting rate reaches 74.8% as commercial container lines bypass Bab el-Mandeb and southern Red Sea corridors.", severity: "high" },
    { id: "al-7", time: "38 min ago", category: "BOJ INTERVENTION", text: "BOJ STEALTH INTERVENTION POST-MORTEM: Quiet MoF dollar-selling execution absorbed; USD/JPY holds near 156.25 with intervention probability compressed to 14%.", severity: "normal" },
    { id: "al-8", time: "52 min ago", category: "PROP SYSTEM", text: "IBEX 35 tests 19,838 holding above 19,780 pivot with institutional buying absorbing volatility; desk maintains long targeting 20,100.", severity: "normal" }
  ]
};
