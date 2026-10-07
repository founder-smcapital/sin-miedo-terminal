import { InstitutionalBrief } from "../types";

export const institutionalBriefs: InstitutionalBrief[] = [
  {
    id: "DOC-UST-BUYBACK-2026",
    title: "US Treasury Sovereign Debt Buybacks: $6.0B Weekly Escalation, Yield Curve Stability & Primary Dealer Absorption",
    subtitle: "Macro Comparative Analysis with BoJ FX Intervention Mechanics: Liquidity Injections During Bond Market Fragility",
    institution: "US Department of the Treasury (Office of Debt Management) & Federal Reserve Bank of New York",
    institutionAcronym: "US Treasury / NY Fed",
    institutionCategory: "Central Banks & Regulators",
    relevantDashboard: "Net Liquidity Drivers & Debt Buyback Telemetry",
    dashboardSlug: "debt_radar",
    publishDate: "Sept 2026",
    lastUpdated: "Live Telemetry Synced • $6.0B/Wk Operational Expansion",
    documentType: "Sovereign Debt Market Surveillance Report",
    securityClassification: "POLICY SURVEILLANCE // TREASURY BORROWING ADVISORY COMMITTEE (TBAC)",
    reportRefNumber: "UST-ODM-2026-BB600",
    authorDesk: "Office of Debt Management & Market Operations Desk",
    readingTimeMinutes: 7,
    pagesCount: 20,
    pdfFileName: "UST_Treasury_Bond_Buyback_Expansion_6B_Weekly_2026.pdf",
    downloadCount: 2480,
    executiveSummary: `SURVEILLANCE DOSSIER & MACRO COMPARATIVE ASSESSMENT:
The US Department of the Treasury's Office of Debt Management has escalated its secondary market bond buyback operations from $2.5B-$3.0B to $6.0 Billion per week—a 100% to 200% acceleration establishing a $24 Billion monthly ($312 Billion annualized) gross liquidity backstop. 

Much like the Japanese Ministry of Finance and Bank of Japan stepping in with unilateral dollar sales when USD/JPY tested 160.00 to crush speculative carry exhaustion and restore orderly market function, the US Treasury is utilizing secondary debt buybacks as an active sovereign stabilization valve. With US federal debt exceeding $35.4 Trillion and primary dealer inventories congested with off-the-run benchmark paper amidst high yield volatility and delicate 10Y/30Y Treasury auctions, the Treasury's $6.0B weekly program acts as a surgical liquidity injection.

Key transmission channels include:
1. Extraction of -$46.8M/bp of weekly DV01 duration from primary dealer balance sheets, freeing regulatory headroom under Basel III leverage constraints.
2. Direct compression of the 10-year term premium by -14.2 bps, muting tail spikes in the MOVE bond volatility index.
3. Creation of an off-the-run liquidity floor across five core maturity buckets: 2Y-5Y Notes ($1.80B), 5Y-10Y Benchmarks ($2.10B), 10Y-30Y Long Bonds ($1.10B), TIPS ($0.50B), and Cash Management bills ($0.50B).
4. Providing a synthetic counter-cyclical offset to ongoing Federal Reserve Quantitative Tightening (QT), effectively anchoring sovereign debt clearing mechanics.`,
    keyFindings: [
      "Weekly Ramp Doubled to $6.0B: Secondary market liquidity support expanded to $6.0B per week, providing $24B/mo in structural market velocity.",
      "Parallels with FX Intervention: Operates identically to sovereign FX intervention by providing a firm backstop when dealer positioning reaches stress thresholds.",
      "Primary Dealer Relief: Absorption of seasoned off-the-run CUSIPs with >18 months maturity clears balance sheet inventory with a 3.42x bid-to-cover ratio.",
      "Term Premium Suppression: Quantitative modeling gauges a -14.2 bps reduction in benchmark 10Y sovereign risk premiums, curbing yield curve steepening tail risks.",
      "Synthetic QT Neutralizer: While the Federal Reserve continues sovereign asset roll-off, Treasury buybacks cushion intermediate and long-end curve liquidity."
    ],
    deskImplications: "Maintain long off-the-run vs on-the-run Treasury basis trades. Overweight duration-sensitive risk assets as the Treasury's buyback backstop caps catastrophic auction tail risks and stabilizes primary dealer balance sheets.",
    metrics: [
      { label: "Weekly Buyback Pacing", value: "$6.00 Billion", change: "+100%", note: "Doubled last week" },
      { label: "Annualized Run-Rate", value: "$312.0 Billion", note: "Gross Liquidity" },
      { label: "Duration Extracted (DV01)", value: "-$46.8M / bp", note: "Dealer Headroom" },
      { label: "10Y Term Premium Impact", value: "-14.2 bps", note: "Yield Compression" }
    ]
  },
  {
    id: "DOC-BOJ-2026-Q3",
    title: "Unilateral FX Intervention Thresholds & JPY Carry Trade Unwind Vulnerabilities",
    subtitle: "Evaluation of Ministry of Finance FX Reserve Liquidity Drawdown Mechanics at USD/JPY 160.00+",
    institution: "Bank of Japan (Monetary Affairs Bureau) & MoF International Affairs",
    institutionAcronym: "BOJ / MoF",
    institutionCategory: "Central Banks & Regulators",
    relevantDashboard: "BoJ Yen Intervention",
    dashboardSlug: "boj",
    publishDate: "Sept 01, 2026",
    lastUpdated: "Sept 03, 2026 • Post-Intervention Flash Update",
    documentType: "Executive Policy & Surveillance Brief",
    securityClassification: "INSTITUTIONAL CLIENT ALPHA // LEVEL 4 SURVEILLANCE",
    reportRefNumber: "BOJ-MON-2026-FX992",
    authorDesk: "Tokyo Macro Surveillance & Cross-Border Dealing Desk",
    readingTimeMinutes: 6,
    pagesCount: 16,
    pdfFileName: "BOJ_MoF_USDJPY_Intervention_Framework_Q3_2026.pdf",
    downloadCount: 1420,
    executiveSummary: `POST-INTERVENTION TELEMETRY UPDATE: Dealing desks confirm a quiet, unannounced MoF/BoJ dollar-selling execution of approximately $35B-$42B equivalent, successfully defending the 160.50 threshold and sending USD/JPY plummeting from 160.22 to ~156.25 (-390 pips). Immediate intervention probability has collapsed to ~14% as speculative froth decompresses.

Prior analysis: The Japanese Ministry of Finance (MoF) and the Bank of Japan had initiated formal rate checks across dealer desks as USD/JPY tested 160.22. Discrepancies between 10-year US Treasury and JGB spreads (+362 bps) incentivized carry trade rollovers, setting up extreme tail vulnerability that triggered the liquidation cascade upon official dollar sales.`,
    keyFindings: [
      "Stealth Execution Confirmed: MoF utilized quiet window during NY turnover to absorb dollar liquidity without press announcement, driving USD/JPY down -390+ pips.",
      "Intervention Probability Collapse: Probability of follow-up intervention collapsed from 78% to 14% with spot far below 160.50.",
      "Liquidity Reservoir: MoF holds $155.4B in immediate overnight Fed cash repos, of which ~$38B was deployed in this session.",
      "Carry Trade Asymmetry: Leveraged retail and systematic CTA longs suffered immediate margin liquidation as spot dropped below 158.00.",
      "Cross-Border Contagion: Yen appreciation velocity exceeded 2.4% on the day, sparking rapid unwinds across MXN/JPY and EUR/JPY carry legs."
    ],
    deskImplications: "Take profit on 1M 152/156 Put Straddles (+420 pips captured); scale out of downside volatility protection as spot settles in the 155.50-157.00 consolidation zone.",
    metrics: [
      { label: "Critical Execution Line", value: "USD/JPY 160.50", note: "MoF Redline" },
      { label: "Immediate Fed Cash Liquidity", value: "$155.4 Billion", note: "T+0 Available" },
      { label: "Projected 1st Wave Drawdown", value: "$45B - $60B", note: "Spot Intervention" },
      { label: "US 10Y - JGB 10Y Spread", value: "+362 bps", note: "Carry Incentive" }
    ]
  },
  {
    id: "DOC-GS-FX-160",
    title: "Global FX Strategy: Asymmetric Payoffs in JPY Volatility & Carry Unwinds",
    subtitle: "Quantifying Central Bank Intervention Impact on Global Carry Strategies and Cross-Asset Liquidity",
    institution: "Goldman Sachs Global Investment Research",
    institutionAcronym: "GS GIR",
    institutionCategory: "Tier-1 Investment Banks",
    relevantDashboard: "BoJ Yen Intervention",
    dashboardSlug: "boj",
    publishDate: "Aug 28, 2026",
    lastUpdated: "Sept 03, 2026 • 07:15 UTC",
    documentType: "Global Macro Research Report",
    securityClassification: "INSTITUTIONAL RESEARCH // CONFIDENTIAL",
    reportRefNumber: "GS-GIR-FX-8841",
    authorDesk: "Global Macro Rates & FX Synthetic Structuring Desk",
    readingTimeMinutes: 8,
    pagesCount: 22,
    pdfFileName: "GoldmanSachs_JPY_Carry_Unwind_Dynamics_2026.pdf",
    downloadCount: 2890,
    executiveSummary: `Goldman Sachs Global Macro Research assesses the risk/reward ratio of holding USD/JPY longs above 159.50 as severely negative on a 30-day horizon. While fundamental rate differentials still favor the US Dollar in the near term, the structural convexity of potential Ministry of Finance intervention creates an asymmetric -4.8R downside risk profile for unhedged carry portfolios.

Our econometric models simulate a three-stage market response to MoF market entry: (1) Immediate 250-pip spot decline within 180 seconds, (2) Systematic CTA stop-loss triggers across Tokyo and London morning trading windows, and (3) Global carry liquidation in high-beta FX crosses (BRL/JPY, ZAR/JPY, MXN/JPY).

We recommend institutional asset managers replace linear long USD/JPY exposure with topside digital calls financed by deep out-of-the-money downside put spreads to harvest yield while truncating intervention tail risk.`,
    keyFindings: [
      "Convexity Inversion: Following the quiet MoF dollar-selling intervention, spot collapsed from 160.22 to ~156.25, validating model predictions of steep asymmetric downside tail risk.",
      "Intervention Odds Plummeted: Post-execution probability of immediate intervention collapsed from 78.4% down to ~14% as speculative excess was flushed out.",
      "CTA Systematic Positioning: Trend algorithms experienced rapid cascade stop triggers below 158.00, accelerating spot toward the 156 handle.",
      "Fed-BoJ Coordination Status: US Treasury Department reaffirmed 'orderly market' language, absorbing Japanese authorities' stealth dollar liquidity intervention."
    ],
    deskImplications: "Structured recommendation: Harvest profits on 3M USD/JPY Put spreads (+390 pips captured). Target spot consolidation around 155.50-157.00.",
    metrics: [
      { label: "Model Intervention Odds", value: "14.2%", note: "Plummeted (Pre: 78.4%)" },
      { label: "1M Implied Volatility", value: "11.85 vols", change: "+1.40", note: "Accelerating" },
      { label: "Estimated CTA Stop Volume", value: "$18.2 Billion", note: "Clustered <158.00" },
      { label: "Asymmetric Skew", value: "-3.4x", note: "Downside / Upside" }
    ]
  },
  {
    id: "DOC-OIES-HORMUZ-92",
    title: "Persian Gulf Chokepoints: Evaluating Physical Blockade Mechanics in the Strait of Hormuz",
    subtitle: "Comprehensive Risk Assessment of 20.5M bpd Crude Transit, Lloyd's War Risk Surges & Red Sea Spillover",
    institution: "Oxford Institute for Energy Studies (OIES)",
    institutionAcronym: "OIES",
    institutionCategory: "Energy & Geopolitical Institutes",
    relevantDashboard: "Middle East War-Risk",
    dashboardSlug: "hormuz",
    publishDate: "Aug 30, 2026",
    lastUpdated: "Sept 03, 2026 • 08:45 UTC (Naval Telemetry Synced)",
    documentType: "Geopolitical Energy Analysis",
    securityClassification: "EXECUTIVE STRATEGIC REPORT // JWLA-030 ALIGNED",
    reportRefNumber: "OIES-ME-ENERGY-703",
    authorDesk: "Middle East Energy Security & Maritime Logistics Division",
    readingTimeMinutes: 9,
    pagesCount: 28,
    pdfFileName: "OIES_Strait_of_Hormuz_Maritime_Blockade_Analysis.pdf",
    downloadCount: 3120,
    executiveSummary: `The Strait of Hormuz remains the single most critical global energy arterial, processing 20.5 million barrels per day of crude, condensate, and petroleum liquids (representing approximately 21% of total world petroleum consumption) alongside 20% of global liquefied natural gas (LNG), predominantly from Qatar and the UAE.

With the regional geopolitical risk index surging above 88.4/100 and DEFCON 2 maritime postures declared across regional naval hubs, the probability of asymmetric disruption (including underwater mining, fast-attack boat interdictions, and electronic spoofing) has reached its highest level since the 1980s Tanker War.

Insurance syndicates under the Lloyd's Market Association Joint War Committee (JWLA-030) have ratcheted Hull & Machinery (H&M) war-risk surcharges to 1.15% of insured vessel value for seven-day transit windows. This adds approximately $1.3 million to the operational expenditure of a single standard VLCC voyage, compounding the +$12.40/bbl geopolitical risk adder embedded in ICE Brent futures.`,
    keyFindings: [
      "Physical Bypass Capacity: Global pipeline bypass capacity (Saudi East-West Petroline & UAE Habshan-Fujairah) is capped at 6.8M bpd, leaving >13.7M bpd completely captive to the Strait.",
      "Red Sea Diversion Exhaustion: 74.8% of westbound tanker traffic is already diverting around the Cape of Good Hope, adding 12-16 transit days and absorbing 6.2% of global tanker capacity.",
      "Freight Rate Hyper-Escalation: Ras Tanura to Singapore VLCC day rates have surged to Worldscale 142 ($68,500/day equivalent).",
      "Refinery Strategic Stockpile Drawdowns: Asian refiners (Japan, South Korea, India) hold 90-110 days of forward crude cover; an interruption exceeding 3 weeks would force mandatory strategic reserve releases."
    ],
    deskImplications: "Long ICE Brent Nov/Dec calendar spreads (+0.85 backwardation target). Overweight tanker equities with high scrubbed VLCC spot exposure (Frontline, Scorpio Tankers).",
    metrics: [
      { label: "Hormuz Daily Petroleum Flow", value: "20.5M bpd", note: "21% Global Supply" },
      { label: "JWLA-030 Hull Surcharge", value: "1.15% of Vessel", change: "+420 bps", note: "Record High" },
      { label: "Cape of Good Hope Diversion", value: "74.8%", note: "Westbound Fleets" },
      { label: "Brent Geopolitical Premium", value: "+$12.40 / bbl", note: "Embedded Risk" }
    ]
  },
  {
    id: "DOC-CSIS-SHADOW-412",
    title: "SAR Satellite Interception of Iranian Dark Fleet Logistics & Malaysian Transshipment Hubs",
    subtitle: "Tracking 412 Unflagged VLCCs, Circle-Drift AIS Transponder Spoofing & Teapot Refinery Supply Chains",
    institution: "Center for Strategic and International Studies (CSIS) & Spire Maritime",
    institutionAcronym: "CSIS / Spire",
    institutionCategory: "Maritime Security & Analytics",
    relevantDashboard: "Iran Shadow Fleet",
    dashboardSlug: "shadow",
    publishDate: "Aug 29, 2026",
    lastUpdated: "Sept 03, 2026 • 08:30 UTC (Sentinel-1 SAR Radar Pass)",
    documentType: "Geospatial Maritime Intelligence Dossier",
    securityClassification: "SANCTIONS RADAR // OFAC MARITIME PROTOCOL",
    reportRefNumber: "CSIS-SAR-MAR-0412",
    authorDesk: "Aerospace Geospatial & Sanctions Tracking Laboratory",
    readingTimeMinutes: 7,
    pagesCount: 18,
    pdfFileName: "CSIS_Spire_Iranian_Shadow_Fleet_SAR_Telemetry_2026.pdf",
    downloadCount: 1980,
    executiveSummary: `Synthetic Aperture Radar (SAR) telemetry from the European Space Agency Sentinel-1 satellite constellation, cross-referenced with RF radio-frequency emissions and civilian AIS transponder feeds, isolates 412 active dark tankers engaged in illicit Iranian crude exports averaging 1.62 million barrels per day.

The dominant logistics pattern involves heavy crude loading at Kharg Island and Sirri Island terminals, followed by trans-Indian Ocean navigation under AIS dark protocol. Upon reaching international waters east of Singapore and the Riau Archipelago (Indonesia), vessels execute automated circular-drift spoofing to broadcast false coordinates while physically conducting Ship-to-Ship (STS) transfers with Chinese-flagged and Panamanian-flagged VLCCs.

Crude volumes are subsequently relabeled with false Certificates of Origin as 'Malaysian Blend' or 'Bitumen Mixture' and offloaded at secondary port facilities in Qingdao and Dongying for processing by independent teapot refineries in Shandong Province.`,
    keyFindings: [
      "Active Vessel Count: 412 confirmed VLCCs and Suezmax tankers operating with disabled or spoofed AIS transponders, an increase of 6.8% quarter-over-quarter.",
      "STS Transfer Epicenter: 7 distinct high-density transfer clusters identified 12–24 nautical miles off Pulau Karimun and Lingga Archipelago.",
      "Discount Differential: Iranian Light/Heavy grades trade at a $4.80 to $6.20/bbl discount to ICE Brent FOB Kharg Island to offset maritime seizure and insurance risks.",
      "Settlement Infrastructure: Over 82% of transactions bypass SWIFT and USD clearing, settling directly in offshore Renminbi (CNH) via the Cross-Border Interbank Payment System (CIPS)."
    ],
    deskImplications: "Monitor Chinese private refiner run-rates and CIPS settlement liquidity. Dark crude resilience acts as an unhedged 1.6M bpd physical supply cushion capping extreme Brent upside spikes.",
    metrics: [
      { label: "Active Monitored Dark VLCCs", value: "412 Vessels", change: "+14 MoM", note: "High Velocity" },
      { label: "Illicit Daily Export Volume", value: "1.62M bpd", note: "Kharg Island Origin" },
      { label: "Primary STS Cluster Zone", value: "Riau Archipelago", note: "Malacca Approach" },
      { label: "Settlement Currency", value: "82% CNH / CIPS", note: "De-Dollarized" }
    ]
  },
  {
    id: "DOC-BDE-IBEX-2026",
    title: "Spanish Banking Sector Resilience & Net Interest Margin (NIM) Sensitivity under ECB Normalization",
    subtitle: "IBEX 35 Structural Outperformance Drivers: Retail Loan Repricing, Tier-1 Capital Ratios & 20,050 Pivot",
    institution: "Banco de España (Directorate General Economics & Statistics)",
    institutionAcronym: "BDE / ECB",
    institutionCategory: "Central Banks & Regulators",
    relevantDashboard: "IBEX 35 Prop Desk",
    dashboardSlug: "ibex",
    publishDate: "Aug 27, 2026",
    lastUpdated: "Sept 03, 2026 • 06:40 UTC",
    documentType: "Macroeconomic & Banking Stability Review",
    securityClassification: "CENTRAL BANK ECONOMIC PAPERS // PUBLIC INSTITUTIONAL",
    reportRefNumber: "BDE-RES-IBEX-2026-NIM",
    authorDesk: "Financial Stability & European Market Integration Desk",
    readingTimeMinutes: 7,
    pagesCount: 20,
    pdfFileName: "BancoDeEspana_IBEX35_Banking_NIM_Resilience_2026.pdf",
    downloadCount: 1650,
    executiveSummary: `The Spanish equity benchmark (IBEX 35, trading above 20,180) exhibits continued structural outperformance relative to core European peers (IBEX/DAX spread +42 bps, Euro Stoxx 50 beta 1.14x). This resilience is underpinned by the heavy index weighting (~34.2%) of Tier-1 Spanish banking institutions, including Banco Santander, BBVA, and CaixaBank.

Despite anticipations of European Central Bank (ECB) interest rate recalibrations, Spanish banks maintain structural Net Interest Margin (NIM) advantages due to a predominantly floating-rate retail mortgage book (EURIBOR indexed) combined with a disciplined, low-cost domestic deposit beta (18% vs. 34% Eurozone average).

Asset quality indicators remain robust, with Non-Performing Loan (NPL) ratios stabilizing at 3.12% and Common Equity Tier 1 (CET1) fully loaded capital ratios averaging 13.1%. The daily macroeconomic central pivot at 20,050 represents key institutional accumulation support.`,
    keyFindings: [
      "Deposit Beta Advantage: Spanish retail deposit pass-through rate remains constrained at 18.2%, preserving robust bank net interest margins.",
      "Earnings Yield Spread: IBEX 35 12-month forward earnings yield stands at 8.4% (P/E 11.9x), offering an attractive 510 bps equity risk premium over Spanish 10Y Bonos.",
      "Inditex Retail Momentum: Inditex (ITX) maintains double-digit global sales growth with RSI holding healthy expansion territory (RSI 62).",
      "Prop Technical Pivot: 20,050 serves as institutional buying floor; overhead distribution resistance targeted between 20,280 and 20,450."
    ],
    deskImplications: "Execute long swing trades on IBEX 35 pullbacks to 19,920–20,050 with 1.0R allocation. Target expansion into 20,450 / 20,600 with 3.4:1 profit factor.",
    metrics: [
      { label: "IBEX Banking Weight", value: "34.2%", note: "Santander, BBVA, Caixa" },
      { label: "Spanish Bank Avg CET1", value: "13.1%", note: "Tier-1 Capital" },
      { label: "IBEX / DAX Spread", value: "+42 bps", note: "Outperformance" },
      { label: "Confirmed Pivot Floor", value: "20,050 pts", note: "Institutional Support" }
    ]
  },
  {
    id: "DOC-WGC-GOLD-4180",
    title: "Central Bank Sovereign Gold Reserves & De-Dollarization Capital Flows",
    subtitle: "Structural Drivers of XAU/USD Equilibrium at $4,180+/oz: Geopolitical Hedging & Reserve Diversification",
    institution: "World Gold Council (WGC) & Bank of America Global Commodities",
    institutionAcronym: "WGC / BofA",
    institutionCategory: "Energy & Geopolitical Institutes",
    relevantDashboard: "Macro Commodities & Gold",
    dashboardSlug: "gold",
    publishDate: "Aug 31, 2026",
    lastUpdated: "Sept 03, 2026 • 08:10 UTC",
    documentType: "Sovereign Reserve & Commodity Strategy",
    securityClassification: "COMMODITY ALPHA BRIEF // GOLD RESERVES",
    reportRefNumber: "WGC-GLD-2026-Q3",
    authorDesk: "Official Monetary Institutions & Precious Metals Research Desk",
    readingTimeMinutes: 6,
    pagesCount: 14,
    pdfFileName: "WorldGoldCouncil_Central_Bank_Gold_Demand_2026.pdf",
    downloadCount: 2310,
    executiveSummary: `Gold spot prices (XAU/USD trading at $4,185.60 – $4,198.80/oz) reflect an unprecedented structural repricing driven by record non-Western central bank reserve accumulation, systemic sovereign debt monetization concerns, and heightened geopolitical fragmentation.

The People's Bank of China (PBOC), Reserve Bank of India (RBI), Central Bank of Turkey, and Middle Eastern sovereign wealth funds have collectively purchased over 1,280 metric tonnes of physical gold annually over consecutive cycles, accelerating the diversification of sovereign reserves away from bilateral G10 fiat assets in response to sanctions risks and frozen reserve precedents.

Combined with real negative yield adjustments and Middle East conflict risk insurance premiums, institutional gold demand establishes a durable price floor at $4,050/oz with medium-term upside trajectory targeting $4,350–$4,500/oz.`,
    keyFindings: [
      "Central Bank Net Inflows: Sovereign official sector buying accounts for 32% of total annual gold demand, maintaining historic elevated levels above $4,000/oz.",
      "De-Dollarization Velocity: Foreign exchange reserve composition allocated to USD has declined to under 56% globally, with physical gold absorbing over 48% of redirected central bank surplus flows.",
      "Physical Vault Accumulation: LBMA and COMEX commercial vault inventories indicate persistent physical delivery premiums over paper futures at record highs.",
      "Correlations with Geopolitical Risk: 30-day rolling correlation between XAU/USD and the Global Geopolitical Risk Index (GPR) stands at +0.82."
    ],
    deskImplications: "Maintain strategic overweight long gold spot / ETF allocations as core structural hedge against Middle East escalation, currency debasement, and sovereign debt risks. Institutional base support established at $4,050/oz.",
    metrics: [
      { label: "Gold Spot Price (XAU/USD)", value: "$4,185.60 / oz", change: "+1.28%", note: "Accurate Live Spot" },
      { label: "Annual Central Bank Purchases", value: "1,280 Tonnes", note: "Record Inflows" },
      { label: "Support Floor Target", value: "$4,050.00 / oz", note: "Institutional Base" },
      { label: "GPR Correlation", value: "+0.82", note: "Safe Haven Link" }
    ]
  },
  {
    id: "DOC-IEA-REDSEA-2026",
    title: "Global Maritime Freight & Bunker Fuel Surcharges: Cape of Good Hope Logistics Shift",
    subtitle: "Economic Consequences of 74.8% Red Sea Bypass on European Refining Margins and Middle East Supply Lines",
    institution: "International Energy Agency (IEA) & S&P Global Commodity Insights",
    institutionAcronym: "IEA / S&P",
    institutionCategory: "Energy & Geopolitical Institutes",
    relevantDashboard: "Middle East War-Risk",
    dashboardSlug: "hormuz",
    publishDate: "Aug 26, 2026",
    lastUpdated: "Sept 02, 2026 • 16:30 UTC (Prior Session)",
    documentType: "Global Energy Logistics Report",
    securityClassification: "MARITIME ADVISORY // ENERGY FLOWS",
    reportRefNumber: "IEA-MAR-REDSEA-940",
    authorDesk: "Oil Markets & Industry Division",
    readingTimeMinutes: 7,
    pagesCount: 19,
    pdfFileName: "IEA_SP_Global_Red_Sea_Freight_Impact_2026.pdf",
    downloadCount: 1840,
    executiveSummary: `The protracted disruption of maritime transit through the Bab el-Mandeb strait and Southern Red Sea has cemented the Cape of Good Hope as the primary route for European and transatlantic containerized and wet freight. Over 74.8% of commercial tanker tonnage originating from the Persian Gulf and Indian subcontinent is now circumnavigating Africa.

This rerouting adds between 3,500 and 4,000 nautical miles per voyage, requiring 10 to 14 additional sailing days. The cumulative impact absorbs roughly 6.2% of global tanker capacity and adds approximately $850,000 in bunker fuel expenditures per standard Suezmax voyage.

European refiners are facing elevated distillate feedstock costs and extended delivery lag times, causing middle distillate (diesel and jet fuel) crack spreads to trade at a persistent $4.50/bbl premium above 5-year seasonal medians.`,
    keyFindings: [
      "Transit Delay Multiplier: Average voyage duration from Ras Tanura to Rotterdam increased from 19 days (via Suez) to 33 days (via Cape of Good Hope).",
      "Additional Bunker Fuel Burn: Global fleet rerouting consumes an additional 380,000 bpd of marine bunker fuel oil, tightening high-sulfur and VLSFO supplies in bunkering hubs like Durban and Las Palmas.",
      "Insurance Rate Disparity: Red Sea transit war-risk coverage quoted at 0.75%–1.0% of vessel hull value vs. baseline 0.05% for open Atlantic transit.",
      "LNG Flow Restructuring: Qatari LNG deliveries to European terminals are routing entirely around Africa, with incremental spot shipments increasingly sourced from US Gulf Coast export facilities."
    ],
    deskImplications: "Long European Gasoil crack spreads; Long global bunkering logistics operators and marine fuel suppliers (Las Palmas, Fujairah, Singapore).",
    metrics: [
      { label: "Africa Transit Diversion", value: "74.8%", note: "Westbound Fleets" },
      { label: "Voyage Cost Differential", value: "+$850,000", note: "Per Suezmax Voyage" },
      { label: "Additional Sailing Days", value: "+10 to +14 Days", note: "Europe Transit" },
      { label: "Bunker Burn Acceleration", value: "+380,000 bpd", note: "Marine Fuel Tightening" }
    ]
  },
  {
    id: "DOC-OFAC-SANCTIONS-2026",
    title: "US Treasury OFAC Enforcement Advisory: Maritime Sanctions Evasion & CIPS Financial Architecture",
    subtitle: "Analysis of De-Dollarized Crude Laundering Networks, AIS Manipulation & Secondary Sanctions Risks",
    institution: "US Department of the Treasury (OFAC) & Financial Crimes Enforcement Network (FinCEN)",
    institutionAcronym: "OFAC / FinCEN",
    institutionCategory: "Central Banks & Regulators",
    relevantDashboard: "Iran Shadow Fleet",
    dashboardSlug: "shadow",
    publishDate: "Aug 25, 2026",
    lastUpdated: "Aug 31, 2026 • 14:00 UTC",
    documentType: "Regulatory & Compliance Advisory",
    securityClassification: "REGULATORY DIRECTIVE // ADVISORY NOTICE",
    reportRefNumber: "OFAC-ADV-MAR-2026-08",
    authorDesk: "Office of Global Sanctions Investigation & Asset Control",
    readingTimeMinutes: 8,
    pagesCount: 24,
    pdfFileName: "OFAC_FinCEN_Maritime_Sanctions_Evasion_Advisory_2026.pdf",
    downloadCount: 2540,
    executiveSummary: `The US Department of the Treasury's Office of Foreign Assets Control (OFAC) issues this comprehensive advisory to global maritime insurers, classification societies, vessel operators, and commodity trading desks regarding deceptive shipping practices used to export sanctioned crude petroleum.

Identified tactics include flag hopping, deliberate manipulation and spoofing of Automatic Identification System (AIS) transponders, falsification of cargo documentation (bills of lading and certificates of origin), and complex high-seas Ship-to-Ship (STS) transfers conducted during night hours in non-jurisdictional waters.

Furthermore, illicit oil export revenues are increasingly processed outside the Western financial system through non-SWIFT cross-border clearing channels, utilizing local currency clearing and digital settlement tokens to supply independent refining clusters in Asia.`,
    keyFindings: [
      "AIS Spoofing Signatures: Treasury has cataloged 184 distinct GPS transponder spoofing beacons used to project false coordinates in the South China Sea while vessels berth at Kharg Island.",
      "Corporate Obfuscation: Over 60% of monitored dark tankers are registered to shell companies incorporated in zero-transparency jurisdictions with single-asset ownership structures.",
      "Secondary Sanctions Warning: Marine insurers and bunkering service providers risk secondary sanctions designation for providing technical or fueling services to vessels listed on the SDN List.",
      "Cross-Border Settlement Channels: Expanded surveillance initiated on third-party commercial bank clearing nodes in Southeast Asia and Middle Eastern free zones."
    ],
    deskImplications: "Enforce automated SAR radar verification and IMO ownership audits across all commodity clearing contracts. Exclude non-verified vessel nominations to avoid regulatory freezes.",
    metrics: [
      { label: "Identified Spoofing Beacons", value: "184 Active", note: "GPS Circle Drift" },
      { label: "Monitored Vessel Fleet", value: "640 Total Monitored", note: "Dark & Gray Fleets" },
      { label: "Sanctioned Flow Volume", value: "1.62M bpd", note: "Target of Advisory" },
      { label: "OFAC Scrutiny Level", value: "CRITICAL HIGH", note: "Secondary Sanctions Active" }
    ]
  },
  {
    id: "DOC-FID-BTC-MACRO-2026",
    title: "Digital Gold & Global Liquidity Beta: Bitcoin Cross-Asset Transmission in Geopolitical Regimes",
    subtitle: "Quantitative Analysis of BTC/USD Elasticity vs. Physical Gold ($4,180+), Global M2 Supply Expansion, and Geopolitical Risk Escalations",
    institution: "Fidelity Digital Assets & Sin Miedo Capital Quantitative Research",
    institutionAcronym: "FIDELITY / SMC",
    institutionCategory: "Tier-1 Investment Banks",
    relevantDashboard: "BTC & Digital Liquidity",
    dashboardSlug: "crypto",
    publishDate: "Sept 02, 2026",
    lastUpdated: "Sept 03, 2026 • 09:30 UTC (Live Surveillance Active)",
    documentType: "Quantitative Macro Strategy Report",
    securityClassification: "INSTITUTIONAL CLIENT ALPHA // DIGITAL ASSET DESK",
    reportRefNumber: "FID-SMC-BTC-2026-Q3",
    authorDesk: "SMC Quantitative Multi-Strategy & Digital Asset Execution Desk",
    readingTimeMinutes: 7,
    pagesCount: 18,
    pdfFileName: "Fidelity_SMC_Bitcoin_Macro_Liquidity_Transmission_2026.pdf",
    downloadCount: 1980,
    executiveSummary: `As sovereign debt monetization escalates across G7 economies and geopolitical friction drives physical gold beyond historic records ($4,180+/oz), Bitcoin (BTC/USD consolidating above $79k after testing highs beyond $82,000 yesterday) has cemented its role as a high-beta institutional monetary liquidity barometer. 

Econometric regression indicates that over a 30-day rolling window, Bitcoin exhibits an expanding positive correlation with Gold (r = +0.56) and a 1.42x beta to global M2 money supply growth. However, desk risk models emphasize a crucial divergence during acute kinetic geopolitical shocks: unlike physical sovereign reserves which receive an instantaneous safe-haven bid, Bitcoin frequently absorbs an initial 1-to-3 hour liquidation impulse driven by algorithmic margin unwinds in leveraged perpetual contracts, before rebounding strongly as non-sovereign, unseizable settlement collateral.

Furthermore, our correlation models capture heightened transmission from the Bank of Japan's yen intervention threshold (USD/JPY 160.50). Sudden rapid yen appreciation induces systematic de-risking across cross-currency carry trades, temporarily pressuring crypto perpetual funding rates and creating high-probability structural accumulation zones for institutional long spot books.`,
    keyFindings: [
      "Monetary Debasement Barometer: BTC maintains a +0.56 correlation with Gold Spot and +0.68 beta to global aggregate central bank balance sheet expansion.",
      "Asymmetric Kinetic Reaction: Acute Middle East conflict spikes trigger immediate 2–4% leverage flushes via automated liquidation engines, followed by rapid multi-session institutional accumulation.",
      "Yen Carry Trade Vulnerability: Abrupt USD/JPY drops toward 155.50 generate temporary mechanical margin drag across crypto perpetuals, offering high-conviction spot entry zones in the $77,500–$78,500 band.",
      "Institutional Supply Absorption: US spot ETF net inflows continue to absorb 2.8x daily newly minted supply, establishing a firm programmatic accumulation floor in the $78,000–$79,000 bracket."
    ],
    deskImplications: "Maintain core long spot allocation following the test above $82,000. Utilize 1-month $85,000 out-of-the-money call sales to finance $75,000 downside delta puts. Systematically execute scale-in spot orders on any carry-unwind drawdowns below $78,500.",
    metrics: [
      { label: "Gold Correlation (30D)", value: "r = +0.56", note: "Monetary Co-movement" },
      { label: "M2 Liquidity Beta", value: "1.42x", note: "Money Supply Sensitivity" },
      { label: "ETF Daily Absorption", value: "2.8x Mint Rate", note: "Structural Inflows" },
      { label: "Primary Accumulation Zone", value: "$74,500 - $76,500", note: "Institutional Floor" }
    ]
  }
];
