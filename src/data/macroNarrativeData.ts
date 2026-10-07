import { MacroNarrativeItem } from "../types";

export const initialMacroNarrativeWire: MacroNarrativeItem[] = [
  // 1. Central Banks
  {
    id: "cb-fed-balance-sheet",
    headline: "Federal Reserve Board: System Open Market Account (SOMA) Treasury Runoff Stabilizes at $25B/Month Cap",
    source: "Federal Reserve Board of Governors",
    sourceAcronym: "FRB / FOMC",
    category: "central_banks",
    wireType: "OFFICIAL_COMMUNIQUE",
    timestamp: "Oct 03 • 12:15 UTC (30m ago)",
    rawTimestamp: Date.now() - 30 * 60000,
    summary: "FOMC quantitative tightening operational review confirms Treasury redemption cap remains at $25B/mo while agency MBS runoff averages $14.2B/mo. Overnight reverse repo (ON RRP) facility take-up holds steady at $182B, signaling ample banking reserves prior to year-end funding windows.",
    impactLevel: "HIGH",
    affectedAssets: [
      { ticker: "US10Y", bias: "neutral", rationale: "Runoff cadence fully priced; prevents liquidity squeeze." },
      { ticker: "SPY", bias: "bullish", rationale: "Tighter QT pace protects banking system reserves." },
      { ticker: "USD/JPY", bias: "neutral", rationale: "Limits upside pressure on US dollar real yields." }
    ],
    url: "https://www.federalreserve.gov/monetarypolicy/bst_openmarketops.htm",
    isLiveDirect: true
  },
  {
    id: "cb-boj-jgb-operation",
    headline: "Bank of Japan: Special Rinban Operation Details & Quiet FX Intervention Defense Posture",
    source: "Bank of Japan Market Operations",
    sourceAcronym: "BOJ OFFICIAL",
    category: "central_banks",
    wireType: "OFFICIAL_COMMUNIQUE",
    timestamp: "Oct 03 • 10:45 UTC (2h ago)",
    rawTimestamp: Date.now() - 120 * 60000,
    summary: "Bank of Japan confirms JGB purchase operation across 5-10Y bucket totaled ¥375B with accepted yields matching 1.085%. Ministry of Finance surveillance indicates 160.50 line-in-the-sand defense succeeded, dropping unilateral intervention odds to 14% as JPY carry short covering subsides.",
    impactLevel: "CRITICAL",
    affectedAssets: [
      { ticker: "USD/JPY", bias: "bearish", rationale: "Defends 160.50 ceiling; caps sudden upward spikes." },
      { ticker: "Nikkei 225", bias: "neutral", rationale: "Stabilized yen removes acute equity valuation shocks." },
      { ticker: "JGB 10Y", bias: "bullish", rationale: "Controlled Rinban keeps Japanese yields orderly." }
    ],
    url: "https://www.boj.or.jp/en/statistics/boj/fm/ope/index.htm",
    isLiveDirect: true
  },
  {
    id: "cb-ecb-terminal-rate",
    headline: "European Central Bank: Governing Council Accounts Signal Neutral Deposit Facility Anchor at 2.75%",
    source: "European Central Bank",
    sourceAcronym: "ECB GOVCOUNCIL",
    category: "central_banks",
    wireType: "OFFICIAL_COMMUNIQUE",
    timestamp: "Oct 03 • 08:30 UTC (4h ago)",
    rawTimestamp: Date.now() - 240 * 60000,
    summary: "Governing Council meeting minutes emphasize service sector inflation deceleration towards 2.6%. Cross-border credit conditions in Spain and Italy remain robust, supporting Spanish banking net interest margins (NIMs) while southern European sovereign spreads remain narrow.",
    impactLevel: "HIGH",
    affectedAssets: [
      { ticker: "EUR/USD", bias: "neutral", rationale: "Predictable rate glide path keeps pair bound around 1.0850." },
      { ticker: "IBEX 35", bias: "bullish", rationale: "Spanish banks maintain attractive return on tangible equity." },
      { ticker: "Bund 10Y", bias: "bullish", rationale: "Orderly rate trajectory supports core European paper." }
    ],
    url: "https://www.ecb.europa.eu/press/govcdec/mopo/html/index.en.html",
    isLiveDirect: true
  },
  {
    id: "cb-boe-fpc-bulletin",
    headline: "Bank of England: Financial Policy Committee Macroprudential Review on Non-Bank Leverage",
    source: "Bank of England FPC",
    sourceAcronym: "BOE FPC",
    category: "central_banks",
    wireType: "OFFICIAL_COMMUNIQUE",
    timestamp: "Oct 03 • 07:15 UTC (5h ago)",
    rawTimestamp: Date.now() - 300 * 60000,
    summary: "FPC bulletin flags global hedge fund basis trade positioning in UK Gilts and US Treasuries. Highlights liquidity buffers among primary dealers and recommends maintaining current countercyclical capital buffer at 2% to absorb international market fragmentation.",
    impactLevel: "MEDIUM",
    affectedAssets: [
      { ticker: "GBP/USD", bias: "neutral", rationale: "Cautious tone balanced by strong UK service exports." },
      { ticker: "Gilt 10Y", bias: "neutral", rationale: "Dealer balance sheet metrics remain sound." }
    ],
    url: "https://www.bankofengland.co.uk/news/news-releases",
    isLiveDirect: true
  },

  // 2. Sovereign Debt & Liquidity
  {
    id: "sov-us-treasury-buybacks",
    headline: "US Department of the Treasury: Sovereign Debt Buyback Tranche Executed at $6.0B/Week Pace",
    source: "US Treasury Office of Debt Management",
    sourceAcronym: "US TREASURY ODM",
    category: "sovereign_debt",
    wireType: "OFFICIAL_COMMUNIQUE",
    timestamp: "Oct 03 • 11:00 UTC (1.8h ago)",
    rawTimestamp: Date.now() - 108 * 60000,
    summary: "Treasury buyback desk executes $1.5B nominal off-the-run 10Y-20Y operations as part of the expanded $6.0B weekly liquidity support program. Reabsorbs -$46.8M DV01 duration risk from primary dealers, structurally anchoring cash Treasury market depth during heavy issuance cycles.",
    impactLevel: "CRITICAL",
    affectedAssets: [
      { ticker: "US10Y", bias: "bullish", rationale: "Off-the-run buybacks compress yield liquidity premiums." },
      { ticker: "SPY", bias: "bullish", rationale: "Smooth government bond functioning prevents risk asset de-leveraging." },
      { ticker: "MOVE Index", bias: "bearish", rationale: "Suppresses Treasury volatility surface." }
    ],
    url: "https://home.treasury.gov/policy-issues/financing-the-government/quarterly-refunding",
    isLiveDirect: true
  },
  {
    id: "sov-ofr-stress-index",
    headline: "Office of Financial Research (OFR): Financial Stress Index Remains in Low-Risk Sub-Zero Zone (-0.42)",
    source: "US Treasury / OFR",
    sourceAcronym: "OFR INDEX",
    category: "sovereign_debt",
    wireType: "DATA_PRINT",
    timestamp: "Oct 03 • 09:10 UTC (3.5h ago)",
    rawTimestamp: Date.now() - 210 * 60000,
    summary: "OFR Financial Stress Index prints -0.42 standard deviations, confirming negligible systemic risk across credit spreads, funding liquidity, and safe-asset valuation metrics. Commercial paper spreads and repo fail-to-deliver rates remain historically tight.",
    impactLevel: "MEDIUM",
    affectedAssets: [
      { ticker: "SPY", bias: "bullish", rationale: "Absence of funding stress supports systematic equity allocations." },
      { ticker: "HYG", bias: "bullish", rationale: "Tight credit spreads reflect solid corporate balance sheets." }
    ],
    url: "https://www.financialresearch.gov/financial-stress-index/",
    isLiveDirect: true
  },

  // 3. Primary Macro Data & Statistical Releases
  {
    id: "macro-bls-supercore-inflation",
    headline: "Bureau of Labor Statistics: Supercore Services CPI (Ex-Housing) Reruns at +0.22% Monthly Rate",
    source: "US Bureau of Labor Statistics",
    sourceAcronym: "BLS MACRO",
    category: "primary_macro",
    wireType: "DATA_PRINT",
    timestamp: "Oct 03 • 12:30 UTC (15m ago)",
    rawTimestamp: Date.now() - 15 * 60000,
    summary: "BLS primary tables show Non-Housing Services CPI cooled to annualized 2.8%, easing stagflation concerns. Transportation and medical care services decelerated, leaving the 3-month annualized headline inflation at 2.4% — paving the way for FOMC neutral rate convergence.",
    impactLevel: "CRITICAL",
    affectedAssets: [
      { ticker: "US10Y", bias: "bullish", rationale: "Softening supercore inflation pulls bond yields lower." },
      { ticker: "QQQ", bias: "bullish", rationale: "Lower discount rates re-rate mega-cap tech cash flows." },
      { ticker: "Gold", bias: "bullish", rationale: "Lower real rates expand zero-yield bullion appeal." }
    ],
    url: "https://www.bls.gov/cpi/",
    isLiveDirect: true
  },
  {
    id: "macro-bea-pce-deflator",
    headline: "Bureau of Economic Analysis: Core PCE Price Index MoM Prints +0.2%, Year-over-Year Hits 2.6%",
    source: "US Bureau of Economic Analysis",
    sourceAcronym: "BEA MACRO",
    category: "primary_macro",
    wireType: "DATA_PRINT",
    timestamp: "Oct 02 • 12:30 UTC (24h ago)",
    rawTimestamp: Date.now() - 24 * 3600 * 1000,
    summary: "BEA personal income and outlays release confirms real personal consumption expenditure grew at 0.3% MoM. Personal savings rate adjusted higher to 4.6%, indicating resilient consumer spending power without overheating price pressures.",
    impactLevel: "HIGH",
    affectedAssets: [
      { ticker: "SPY", bias: "bullish", rationale: "Goldilocks growth plus moderating inflation." },
      { ticker: "DXY", bias: "bearish", rationale: "Mild pressure on dollar as rate cut expectations solidify." }
    ],
    url: "https://www.bea.gov/data/personal-consumption-expenditures-price-index",
    isLiveDirect: true
  },

  // 4. Wall Street Institutional Strategy
  {
    id: "strat-goldman-sachs-positioning",
    headline: "Goldman Sachs Global Investment Research: CTA Systematic Allocators Fully Long US Mega-Caps",
    source: "Goldman Sachs GIR / FICC Strategy",
    sourceAcronym: "GS GIR",
    category: "wall_street_strats",
    wireType: "MACRO_STRAT",
    timestamp: "Oct 03 • 09:40 UTC (3h ago)",
    rawTimestamp: Date.now() - 180 * 60000,
    summary: "GS Institutional Positioning Desk notes Commodity Trading Advisors (CTAs) hold $148B net long equities, approaching 94th percentile capacity. Model signals indicate asymmetric risk: a 2% pullback would trigger $14B systematic selling, while fresh upside requires discretionary inflows.",
    impactLevel: "HIGH",
    affectedAssets: [
      { ticker: "SPY", bias: "neutral", rationale: "Stretched systematic positioning limits rapid upside momentum." },
      { ticker: "VIX", bias: "bullish", rationale: "Asymmetry prompts demand for protective index put wings." },
      { ticker: "NVDA", bias: "neutral", rationale: "Highest concentration of systematic risk exposure." }
    ],
    url: "https://www.goldmansachs.com/intelligence/",
    isLiveDirect: false
  },
  {
    id: "strat-jpm-liquidity-radar",
    headline: "J.P. Morgan Global Macro: Treasury General Account (TGA) Inflows Counterbalanced by Fed Facility Drawdowns",
    source: "J.P. Morgan Global FICC Strategy",
    sourceAcronym: "JPM FICC",
    category: "wall_street_strats",
    wireType: "MACRO_STRAT",
    timestamp: "Oct 03 • 08:00 UTC (4.5h ago)",
    rawTimestamp: Date.now() - 270 * 60000,
    summary: "JPM strategists model net US liquidity through Q4. Despite corporate tax receipt buildup in the TGA ($780B), the draw down of ON RRP and Treasury debt buybacks creates a neutral net liquidity vector, insulating equity multiple compression into election cycles.",
    impactLevel: "HIGH",
    affectedAssets: [
      { ticker: "BTC/USD", bias: "bullish", rationale: "Net liquidity neutrality prevents severe crypto de-leveraging." },
      { ticker: "US Treasury 2Y", bias: "bullish", rationale: "Terminal policy expectations firmly anchored." }
    ],
    url: "https://www.jpmorgan.com/insights",
    isLiveDirect: false
  },
  {
    id: "strat-bridgewater-macro-regime",
    headline: "Bridgewater Daily Observations: Sovereign Debt Refinancing Dynamics in High Nominal Growth Regimes",
    source: "Bridgewater Associates",
    sourceAcronym: "BRIDGEWATER",
    category: "wall_street_strats",
    wireType: "MACRO_STRAT",
    timestamp: "Oct 02 • 16:30 UTC (20h ago)",
    rawTimestamp: Date.now() - 20 * 3600 * 1000,
    summary: "Research dispatches highlight that high nominal GDP growth (~5.2%) enables sovereign debt sustainability even with 4.0% 10-year yields, provided central banks remain accommodative on balance sheet flexibility and primary dealers absorb short-dated bill supply.",
    impactLevel: "MEDIUM",
    affectedAssets: [
      { ticker: "Gold", bias: "bullish", rationale: "Ultimate long-term hedge against structural fiscal expansion." },
      { ticker: "US30Y", bias: "bearish", rationale: "Steepening curve pressures long-duration bonds." }
    ],
    url: "https://www.bridgewater.com/research-and-insights",
    isLiveDirect: false
  },

  // 5. Geopolitics & Energy Primary Telemetry
  {
    id: "geo-opec-jmmc-compliance",
    headline: "OPEC+ Joint Ministerial Monitoring Committee (JMMC): Full Compliance with 2.2M bpd Voluntary Cuts Confirmed",
    source: "OPEC Secretariat / Vienna",
    sourceAcronym: "OPEC+ JMMC",
    category: "geopolitics_energy",
    wireType: "OFFICIAL_COMMUNIQUE",
    timestamp: "Oct 03 • 11:30 UTC (1.2h ago)",
    rawTimestamp: Date.now() - 72 * 60000,
    summary: "OPEC+ Secretariat affirms member compliance reached 99.4% in September, with Iraq and Kazakhstan delivering compensation cuts. The phased roll-back of 2.2M bpd remains contingent on market inventory draws, cementing prompt Brent physical backwardation.",
    impactLevel: "CRITICAL",
    affectedAssets: [
      { ticker: "Brent Crude", bias: "bullish", rationale: "Floor established at $78-$80/bbl." },
      { ticker: "WTI Crude", bias: "bullish", rationale: "Physical draws tighten prompt Gulf Coast spreads." },
      { ticker: "Energy Equities (XLE)", bias: "bullish", rationale: "Free cash flow yields expand on stable crude pricing." }
    ],
    url: "https://www.opec.org/opec_web/en/press_room/index.htm",
    isLiveDirect: true
  },
  {
    id: "geo-centcom-hormuz-defense",
    headline: "US Central Command / Combined Maritime Forces: Sentinel Escort Task Force Transit Count Reaches 48 Vessels/Day",
    source: "US CENTCOM / 5th Fleet Combat Ops",
    sourceAcronym: "CENTCOM CTF-153",
    category: "geopolitics_energy",
    wireType: "KINETIC_DISPATCH",
    timestamp: "Oct 03 • 10:15 UTC (2.5h ago)",
    rawTimestamp: Date.now() - 150 * 60000,
    summary: "Task Force 153 escorted 48 commercial tankers through the southern Bab-el-Mandeb and Strait of Hormuz corridors over past 24 hours. Zero direct drone or anti-ship missile impacts recorded. Lloyd's war-risk premiums stabilize at 0.38% of insured hull value.",
    impactLevel: "HIGH",
    affectedAssets: [
      { ticker: "Brent Crude", bias: "neutral", rationale: "Open chokepoints prevent panic risk premia spikes." },
      { ticker: "VLCC Tanker Day-Rates", bias: "neutral", rationale: "Escorts keep insurance surcharges predictable." },
      { ticker: "Gold", bias: "neutral", rationale: "No fresh kinetic escalation triggers safe-haven bid." }
    ],
    url: "https://www.centcom.mil/MEDIA/PRESS-RELEASES/",
    isLiveDirect: true
  },
  {
    id: "geo-csis-dark-fleet-telemetry",
    headline: "CSIS Maritime Security Project: Dark VLCC Tanker Fleet Shadow Outflow Reaches 1.62M bpd via Malacca Corridor",
    source: "Center for Strategic and International Studies",
    sourceAcronym: "CSIS MARITIME",
    category: "sanctions_chokepoints",
    wireType: "KINETIC_DISPATCH",
    timestamp: "Oct 03 • 06:45 UTC (6h ago)",
    rawTimestamp: Date.now() - 360 * 60000,
    summary: "Synthetic Aperture Radar (SAR) satellite telemetry identifies 412 dark VLCC tankers engaged in ship-to-ship (STS) lightering operations off Linggi and Riau archipelago. 1.62M bpd of Iranian light and Russian Urals crude redirected to independent refiners in Shandong.",
    impactLevel: "HIGH",
    affectedAssets: [
      { ticker: "Brent Crude", bias: "bearish", rationale: "Shadow supply buffers non-OPEC demand." },
      { ticker: "Tanker Scrappage Rates", bias: "bullish", rationale: "Aged fleet demand keeps tanker asset prices high." }
    ],
    url: "https://www.csis.org/programs/international-security-program",
    isLiveDirect: false
  },

  // 6. Supranational Institutions & Global Multilateral Surveillance
  {
    id: "multi-imf-sdr-review",
    headline: "International Monetary Fund: Global Financial Stability Assessment Flags Sovereign Maturity Wall in Frontier Credits",
    source: "International Monetary Fund / Monetary and Capital Markets Dept",
    sourceAcronym: "IMF GFSR",
    category: "sovereign_debt",
    wireType: "OFFICIAL_COMMUNIQUE",
    timestamp: "Oct 03 • 09:20 UTC (3.2h ago)",
    rawTimestamp: Date.now() - 192 * 60000,
    summary: "IMF MCM surveillance report underscores $480B in external sovereign debt maturities for frontier economies over the next 18 months. Affirms resilient FX reserve coverage across Gulf Cooperation Council (GCC) sovereigns but warns of refinancing spreads in sub-Saharan paper.",
    impactLevel: "HIGH",
    affectedAssets: [
      { ticker: "EMB (Emerging Mkt Bonds)", bias: "neutral", rationale: "Frontier stress offset by resilient LatAm and GCC balance sheets." },
      { ticker: "USD/ZAR", bias: "bearish", rationale: "High real yields shield liquid EM FX." }
    ],
    url: "https://www.imf.org/en/Publications/GFSR",
    isLiveDirect: true
  },
  {
    id: "multi-bis-fx-swap-liquidity",
    headline: "Bank for International Settlements: Triennial Cross-Border FX Swap Dollar Liabilities Top $85 Trillion",
    source: "Bank for International Settlements / Basel Committee",
    sourceAcronym: "BIS BASEL",
    category: "central_banks",
    wireType: "OFFICIAL_COMMUNIQUE",
    timestamp: "Oct 03 • 08:45 UTC (4h ago)",
    rawTimestamp: Date.now() - 240 * 60000,
    summary: "BIS quarterly review documents non-bank financial institutions' off-balance-sheet dollar obligations via FX swaps and forwards. Notes cross-currency basis spreads (EUR/USD 3M basis) remain well-anchored at -7 bps due to active central bank swap facility standing lines.",
    impactLevel: "CRITICAL",
    affectedAssets: [
      { ticker: "EUR/USD Basis", bias: "neutral", rationale: "Fed standing swap lines prevent synthetic dollar squeezes." },
      { ticker: "USD/JPY Basis", bias: "neutral", rationale: "BoJ dollar liquidity operations remain ample." },
      { ticker: "G-SIB Financials (XLF)", bias: "bullish", rationale: "Dealer balance sheet liquidity buffers exceed Basel III minimums." }
    ],
    url: "https://www.bis.org/publ/qtrpdf/r_qt2409.htm",
    isLiveDirect: true
  },

  // 7. Sanctions Enforcement & Maritime War Risk
  {
    id: "sanct-ofac-shadow-fleet-seizures",
    headline: "US Treasury OFAC: Secondary Banking Advisory & Blocking Sanctions on 14 Shadow Fleet Tanker Operators",
    source: "US Department of the Treasury / OFAC",
    sourceAcronym: "OFAC SANCTIONS",
    category: "sanctions_chokepoints",
    wireType: "OFFICIAL_COMMUNIQUE",
    timestamp: "Oct 03 • 11:45 UTC (1h ago)",
    rawTimestamp: Date.now() - 60 * 60000,
    summary: "Office of Foreign Assets Control issues immediate blocking sanctions against 14 maritime shell companies operating Sovcomflot-affiliated Aframax tankers in the UAE and Marshall Islands. P&I Clubs revoke protection and indemnity insurance for 22 targeted hulls, tightening Russian crude arbitrage to India.",
    impactLevel: "HIGH",
    affectedAssets: [
      { ticker: "Urals-Brent Spread", bias: "bearish", rationale: "Russian crude discount widens by -$1.80/bbl due to freight freighting penalty." },
      { ticker: "VLCC Clean Tanker Rates", bias: "bullish", rationale: "Compliant tonnage commands premium day-rates." }
    ],
    url: "https://home.treasury.gov/policy-issues/financial-sanctions/recent-actions",
    isLiveDirect: true
  },
  {
    id: "choke-ukmto-gulf-aden-telemetry",
    headline: "UK Maritime Trade Operations (UKMTO): Incident Warning Issued for Southern Red Sea / Hanish Islands Corridor",
    source: "UK Maritime Trade Operations (Royal Navy)",
    sourceAcronym: "UKMTO MARITIME",
    category: "sanctions_chokepoints",
    wireType: "KINETIC_DISPATCH",
    timestamp: "Oct 03 • 12:40 UTC (8m ago)",
    rawTimestamp: Date.now() - 8 * 60000,
    summary: "UKMTO releases immediate advisory: Master of commercial container vessel reports explosion 1.5 nautical miles off port quarter, 45 NM southwest of Mokha. Vessel undamaged and proceeding to next port of call. Coalition naval assets deployed to intercept UAS vector.",
    impactLevel: "CRITICAL",
    affectedAssets: [
      { ticker: "Brent Crude", bias: "bullish", rationale: "Immediate +$0.85/bbl prompt risk premium reaction." },
      { ticker: "Suez Cape-Reroute %", bias: "bullish", rationale: "Reaffirms 92% container traffic diversion around Cape of Good Hope." },
      { ticker: "Container Freight (SCFI)", bias: "bullish", rationale: "TEU spot rates sustained above $4,200." }
    ],
    url: "https://www.ukmto.org/indian-ocean/recent-incidents",
    isLiveDirect: true
  },

  // 8. Positioning, Flow & Commitments of Traders (COT)
  {
    id: "flow-cftc-cot-crude-positioning",
    headline: "Commodity Futures Trading Commission (CFTC): Disaggregated COT Shows Managed Money Net Long in WTI at 12-Year Lows",
    source: "US Commodity Futures Trading Commission",
    sourceAcronym: "CFTC COT",
    category: "positioning_flows",
    wireType: "DATA_PRINT",
    timestamp: "Oct 03 • 07:30 UTC (5.3h ago)",
    rawTimestamp: Date.now() - 318 * 60000,
    summary: "CFTC weekly commitments of traders release indicates speculative hedge funds hold merely 94,000 net long contracts in NYMEX WTI crude — ranking in the 3rd percentile historically. Extreme positioning asymmetry leaves energy markets primed for violent short-covering rallies upon supply shock.",
    impactLevel: "HIGH",
    affectedAssets: [
      { ticker: "WTI Crude", bias: "bullish", rationale: "Historic short positioning creates massive squeeze convexity on headline catalyst." },
      { ticker: "Brent Crude", bias: "bullish", rationale: "Bearish consensus vulnerable to forced liquidation." },
      { ticker: "Gold Spec Net Long", bias: "neutral", rationale: "Comex gold longs remain stretched at 88th percentile." }
    ],
    url: "https://www.cftc.gov/MarketReports/CommitmentsofTraders/index.htm",
    isLiveDirect: true
  },

  // 9. People's Bank of China (PBoC) Operational Liquidity
  {
    id: "cb-pboc-mlf-injection",
    headline: "People's Bank of China: 1-Year Medium-Term Lending Facility (MLF) Injected at 2.00% Along with 50 bps RRR Implementation",
    source: "People's Bank of China / Monetary Policy Dept",
    sourceAcronym: "PBOC OFFICIAL",
    category: "central_banks",
    wireType: "OFFICIAL_COMMUNIQUE",
    timestamp: "Oct 03 • 03:15 UTC (9.5h ago)",
    rawTimestamp: Date.now() - 570 * 60000,
    summary: "PBoC conducts ¥789B 1-year MLF operation to maintain banking system liquidity, matching 2.00% rate. 50 bps Reserve Requirement Ratio (RRR) cut officially unlocks ¥1.0T ($142B) in structural loan capacity across state commercial banks, lifting domestic credit impulse.",
    impactLevel: "HIGH",
    affectedAssets: [
      { ticker: "USD/CNH", bias: "bearish", rationale: "Easing policy paired with stimulus stabilizes yuan offshore parity." },
      { ticker: "Copper (HG)", bias: "bullish", rationale: "China infrastructure and credit liquidity supports base metal demand." },
      { ticker: "Hang Seng Index", bias: "bullish", rationale: "Monetary liquidity supports equity valuations." }
    ],
    url: "http://www.pbc.gov.cn/en/3688140/index.html",
    isLiveDirect: true
  }
];

