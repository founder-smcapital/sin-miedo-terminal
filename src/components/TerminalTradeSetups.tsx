import React, { useState } from "react";
import { MacroDataState } from "../types";
import {
  TrendingUp,
  Crosshair,
  Shield,
  ArrowUpRight,
  Zap,
  CheckCircle2,
  ChevronRight,
  Sliders,
  DollarSign,
  AlertTriangle,
  Target,
  Layers,
  Clock,
  Activity,
  Award
} from "lucide-react";

export interface TradeSetupItem {
  id: string;
  asset: string;
  ticker: string;
  bias: "LONG" | "SHORT" | "RANGE_LONG" | "VOL_SPIKE";
  biasLabel: string;
  conviction: number; // e.g. 8.9 / 10
  livePrice: string;
  entryZone: string;
  invalidation: string;
  target1: string;
  target2: string;
  riskReward: string;
  catalyst: string;
  orderType: string;
  // Deep Institutional Strategy Fields
  strategyThesis: string;
  propFirmRule: string;
  keyLevels: {
    vwap: string;
    poc: string;
    vah: string;
    val: string;
    stopTicks: string;
  };
  executionChecklist: string[];
}

interface TerminalTradeSetupsProps {
  macroData: MacroDataState;
  onSelectSetup?: (setup: TradeSetupItem) => void;
  onSelectOverview?: () => void;
  defaultSelectedId?: string;
}

export const TerminalTradeSetups: React.FC<TerminalTradeSetupsProps> = ({
  macroData,
  onSelectSetup,
  onSelectOverview,
  defaultSelectedId = "mes"
}) => {
  const [selectedId, setSelectedId] = useState<string>(defaultSelectedId);
  const [activeDetailView, setActiveDetailView] = useState<"strategy" | "levels" | "prop_sizing">("strategy");

  // Derive dynamic live prices from macro telemetry
  const btcTicker = macroData.tickers?.find(t => t.symbol === "BTC/USD");
  const btcPrice = btcTicker ? `$${btcTicker.price.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : "$79,380";
  const brentTicker = macroData.tickers?.find(t => t.symbol === "BRENT");
  const brentPrice = brentTicker ? `$${brentTicker.price.toFixed(2)}` : "$100.04";
  const goldTicker = macroData.tickers?.find(t => t.symbol === "XAU/USD");
  const goldPrice = goldTicker ? `$${goldTicker.price.toLocaleString()}` : "$4,408";
  const usdjpySpot = macroData.engines?.yenIntervention?.spot || 156.25;
  const ibexLevel = macroData.engines?.ibexBias?.level || 19554.1;

  const setups: TradeSetupItem[] = [
    {
      id: "mes",
      asset: "Micro S&P 500",
      ticker: "MES",
      bias: "LONG",
      biasLabel: "Trend Continuation Long",
      conviction: 8.9,
      livePrice: "5,744.25",
      entryZone: "5,735.00 – 5,742.00 (Pullback to Intraday VWAP)",
      invalidation: "5,720.50 (Overnight Low / Structure Shelf)",
      target1: "5,775.00 (R1 Daily Pivot)",
      target2: "5,810.00 (All-Time Liquidity Pool)",
      riskReward: "3.4 : 1",
      catalyst: "DXY softening under 102.20 cap; Treasury $24B/mo buyback program absorbs dealer duration; positive earnings revision breadth.",
      orderType: "Limit Bracket with OCO Stop-Loss via Tradovate / TradingView",
      strategyThesis:
        "The S&P 500 index continues to be anchored by robust mega-cap balance sheets and steady corporate cash flows. With the Dollar Index (DXY) facing repeated rejection at 102.20, USD-denominated corporate revenue translation headwinds are subdued. We favor taking scaled bids on shallow morning pullbacks into the developing Value Area High (VAH) or VWAP rather than chasing breakouts above overnight highs.",
      propFirmRule:
        "MyFundedFutures (MFFU) Trailing Drawdown Rule: On a $50k account with a $2,000 trailing drawdown buffer, limit exposure to 2-3 MES contracts maximum. A 20-point stop on 2 MES equals -$200 loss (10% of total trailing buffer), preserving trading room and preventing drawdown blowouts.",
      keyLevels: {
        vwap: "5,738.50",
        poc: "5,741.00",
        vah: "5,752.25",
        val: "5,728.50",
        stopTicks: "80 ticks (20.00 pts = $100/contract)"
      },
      executionChecklist: [
        "Wait for US cash open (9:30 AM ET) initial 15-minute price discovery range to establish.",
        "Verify DXY is trading below 102.20 and not accelerating upward.",
        "Place limit bids inside 5,735.00 – 5,742.00 with hard stop at 5,720.50.",
        "Scale 50% at Target 1 (5,775.00) and trail stop-loss to breakeven + 2 ticks."
      ]
    },
    {
      id: "mnq",
      asset: "Micro Nasdaq-100",
      ticker: "MNQ",
      bias: "LONG",
      biasLabel: "High-Beta Tech Expansion",
      conviction: 8.6,
      livePrice: "20,418.00",
      entryZone: "20,360.00 – 20,400.00 (Prior Session VPOC)",
      invalidation: "20,270.00 (Swing Low & 5-Day VWAP Shelf)",
      target1: "20,620.00 (Weekly Extension)",
      target2: "20,850.00 (Psychological Barrier)",
      riskReward: "3.6 : 1",
      catalyst: "AI enterprise capex deployment cycle; semiconductor lead times firming; 10-year Treasury yield stability easing tech duration discounting.",
      orderType: "Iceberg Limit at US Cash Session Open",
      strategyThesis:
        "High-duration tech equities display strong relative strength versus the broader market. When US 10-year yields trade sideways to lower, Nasdaq components expand multiples rapidly. We target entries at the lower boundary of the overnight Value Area with strict bracket stops.",
      propFirmRule:
        "Prop Volatility Sizing: Nasdaq beta is ~1.5x S&P 500. For MFFU accounts, size down to 1-2 MNQ contracts. Each point in MNQ is $2.00; a 70-point stop equals $140 per contract. Never trade more than 2 MNQ simultaneously during high-volatility opens.",
      keyLevels: {
        vwap: "20,395.00",
        poc: "20,410.00",
        vah: "20,480.00",
        val: "20,340.00",
        stopTicks: "360 ticks (90.00 pts = $180/contract)"
      },
      executionChecklist: [
        "Cross-reference with $MES: ensure both indices are co-trending.",
        "Check 10Y Benchmark (^TNX) — avoid entering if yields are spiking intraday.",
        "Enter in two tranches of 1 MNQ each to achieve favorable average entry.",
        "Lock in first target at 20,620.00 (+220 pts) and ride runner."
      ]
    },
    {
      id: "btc",
      asset: "Bitcoin",
      ticker: "BTC/USD",
      bias: "LONG",
      biasLabel: "Bullish Breakout",
      conviction: 8.8,
      livePrice: btcPrice,
      entryZone: "$78,200 – $79,400",
      invalidation: "$76,500 (ETF Liquidity Shelf)",
      target1: "$82,500 (Session High Re-test)",
      target2: "$85,000+ (Psychological Expansion)",
      riskReward: "3.8 : 1",
      catalyst: "Spot ETF net inflows (+$380M/day) & sovereign debt debasement hedging.",
      orderType: "Scaled Limit Bids / TWAP on US Open",
      strategyThesis:
        "Bitcoin continues its macro debasement supercycle, co-trending with physical Gold as institutional treasuries reallocate reserves away from negative-yielding sovereign debt duration. Spot ETF inflows absorb secondary market supply on all tests of prior resistance turned support.",
      propFirmRule:
        "For Micro Bitcoin ($MBT) futures: Tick value is $0.50 per 0.1 BTC ($5 per point). A 1,000-point stop is $100 per MBT contract. Size conservatively at 1-2 contracts.",
      keyLevels: {
        vwap: "$79,150",
        poc: "$79,300",
        vah: "$81,200",
        val: "$77,800",
        stopTicks: "1,700 pts ($170/MBT contract)"
      },
      executionChecklist: [
        "Monitor US spot ETF daily flow prints around 8:00 PM ET.",
        "Confirm CME Bitcoin basis remains positive (> 7% annualized).",
        "Scale entries at $78,800 and $78,200 with hard invalidation at $76,500."
      ]
    },
    {
      id: "usdjpy",
      asset: "USD/JPY",
      ticker: "USD/JPY Spot",
      bias: "RANGE_LONG",
      biasLabel: "Post-Stealth Rebound",
      conviction: 8.2,
      livePrice: `${usdjpySpot}`,
      entryZone: "155.20 – 155.80",
      invalidation: "154.40 (Tokyo Liquidity Shelf)",
      target1: "157.20",
      target2: "158.40",
      riskReward: "3.2 : 1",
      catalyst: `Quiet MoF intervention defended 160.50; odds collapsed to ${macroData.engines.yenIntervention.interventionOdds}% (${macroData.engines.yenIntervention.defcon})`,
      orderType: "Staggered Bilateral Limit Bids",
      strategyThesis:
        "Following the unannounced stealth intervention that pushed USD/JPY down from 160.22, the bilateral carry trade yield differential remains intensely wide (+219 bps 10Y UST-JGB spread). Retail short positions accumulate on fears of further MoF intervention, but fundamentally, institutional carry flows step in near Tokyo shelf support.",
      propFirmRule:
        "FX Micro Futures (6J / M6J): Volatility can expand rapidly around Bank of Japan rate check headlines. Always keep hard stops in place.",
      keyLevels: {
        vwap: "155.95",
        poc: "156.10",
        vah: "157.10",
        val: "154.80",
        stopTicks: "80 pips"
      },
      executionChecklist: [
        "Verify MoF verbal intervention score is below Level 4 (Severe).",
        "Enter long position on pullbacks into 155.20-155.80 zone.",
        "Target initial mean-reversion move to 157.20."
      ]
    },
    {
      id: "ibex",
      asset: "IBEX 35",
      ticker: "IBEX 35 Index",
      bias: "LONG",
      biasLabel: "Banking Momentum",
      conviction: 8.5,
      livePrice: `${ibexLevel}`,
      entryZone: "19,450 – 19,550",
      invalidation: "19,250 (Daily Swing Low)",
      target1: `${macroData.engines.ibexBias.keyLevels.r1 || "19,850"}`,
      target2: `${macroData.engines.ibexBias.keyLevels.r2 || "20,200"}`,
      riskReward: "3.5 : 1",
      catalyst: "Spanish banking Net Interest Margins expanding; 10Y Bonos spread tight.",
      orderType: "VWAP Algo on BME Madrid Session",
      strategyThesis:
        "The IBEX 35 index is heavily weighted toward high-quality Spanish commercial lenders (Santander, BBVA, CaixaBank) which are capturing record net interest margins. The Spanish sovereign risk premium is subdued, driving international institutional capital into Madrid equities.",
      propFirmRule:
        "European indices trade during London/Madrid hours (8:00 AM - 4:30 PM CET). Avoid holding through high-impact ECB rate statements.",
      keyLevels: {
        vwap: "19,510",
        poc: "19,540",
        vah: "19,720",
        val: "19,380",
        stopTicks: "200 pts"
      },
      executionChecklist: [
        "Check 10Y Bonos-Bund spread (sub-75 bps confirms healthy banking climate).",
        "Place bids around daily pivot (19,450-19,550).",
        "Target R1 pivot at 19,850."
      ]
    },
    {
      id: "brent",
      asset: "Micro WTI / Brent",
      ticker: "MCL / BRENT",
      bias: "VOL_SPIKE",
      biasLabel: "Hormuz War Premium",
      conviction: 8.7,
      livePrice: brentPrice,
      entryZone: "$99.80 – $100.50 (Support Shelf)",
      invalidation: "$98.60 (Psychological Invalidation)",
      target1: "$103.45 (Session High)",
      target2: "$108.50 (Supply Shock Extension)",
      riskReward: "4.3 : 1",
      catalyst: `${macroData.engines.middleEastWarRisk.redSeaRerouteRate} Cape rerouting & Strait of Hormuz naval standoff. Note: DXY strength above 102.20 provides strict resistance ceiling on crude.`,
      orderType: "Bull Call Spread or Micro Crude (MCL) Limit Bids",
      strategyThesis:
        "Crude oil prices carry an embedded geopolitical risk premium of $4.20/bbl due to persistent maritime shipping disruptions and the Iranian shadow fleet surveillance. However, pre-market US Dollar strength caps crude rallies, making the $99.80-$100.50 level a strict tactical pivot.",
      propFirmRule:
        "Micro WTI Crude (MCL): 1 contract = 100 barrels ($1.00 move = $100). A $1.20 stop equals $120 risk, making it an ideal sizing vehicle for prop firm accounts.",
      keyLevels: {
        vwap: "$100.25",
        poc: "$100.40",
        vah: "$102.80",
        val: "$99.40",
        stopTicks: "120 ticks ($1.20 = $120/MCL contract)"
      },
      executionChecklist: [
        "Monitor DXY: do not initiate longs if DXY is breaking above 102.35.",
        "Verify Strait of Hormuz tanker routing index.",
        "Buy MCL support shelf around $100.00 with tight $98.60 stop."
      ]
    },
    {
      id: "gold",
      asset: "Gold Spot / Micro Gold",
      ticker: "MGC / XAU",
      bias: "LONG",
      biasLabel: "Debasement Supercycle",
      conviction: 9.1,
      livePrice: goldPrice,
      entryZone: "$4,380 – $4,410",
      invalidation: "$4,290 (Prior Breakout Shelf)",
      target1: "$4,550",
      target2: "$4,700",
      riskReward: "3.6 : 1",
      catalyst: "US sovereign debt servicing exceeding $1.2T/yr; sovereign central bank gold accumulation.",
      orderType: "Algorithmic Limit Accumulation",
      strategyThesis:
        "Central banks across the global South continue to diversify reserves away from US dollar assets and Treasury paper into physical bullion. Gold exhibits asymmetric upside on any flight to safety or fiscal debt servicing escalation.",
      propFirmRule:
        "Micro Gold (MGC): 1 contract = 10 troy oz ($1.00 move = $10). A $20 stop equals $200 risk per contract.",
      keyLevels: {
        vwap: "$4,402",
        poc: "$4,408",
        vah: "$4,460",
        val: "$4,350",
        stopTicks: "200 ticks ($20.00/oz = $200/MGC contract)"
      },
      executionChecklist: [
        "Confirm US 10-year real yields (TIPS) are contained.",
        "Accumulate on tests of $4,380-$4,410 consolidation range.",
        "Target $4,550 with trailing stop."
      ]
    }
  ];

  const activeSetup = setups.find(s => s.id === selectedId) || setups[0];

  const handleSelect = (setup: TradeSetupItem) => {
    setSelectedId(setup.id);
    if (onSelectSetup) onSelectSetup(setup);
  };

  return (
    <div id="terminal-trade-setups-panel" className="bg-[#0A111C] border-b border-[#B08D57]/20 p-3 space-y-3">
      {/* Top Header Bar: Overview Trigger & Mode Info */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <Crosshair className="w-3.5 h-3.5 text-[#B08D57]" />
          <span className="text-[11px] font-mono-data font-bold uppercase tracking-wider text-[#EDE9DE]">
            SMC Tactical Trade Setups &amp; Strategy Playbook
          </span>
          <span className="text-[9px] font-mono-data bg-[#B08D57]/20 text-[#B08D57] px-1.5 py-0.2 rounded border border-[#B08D57]/30">
            {setups.length} Active Positions
          </span>
        </div>

        {onSelectOverview && (
          <button
            id="trigger-market-overview-btn"
            onClick={onSelectOverview}
            className="flex items-center gap-1 text-[10px] font-mono-data bg-[#B08D57]/15 hover:bg-[#B08D57]/25 text-[#E5C794] border border-[#B08D57]/40 px-2 py-1 rounded transition-all hover:scale-102"
          >
            <Zap className="w-3 h-3 text-[#B08D57]" />
            <span>Full Market Overview</span>
          </button>
        )}
      </div>

      {/* Setup Asset Picker Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {setups.map((setup) => {
          const isSelected = setup.id === selectedId;
          return (
            <button
              key={setup.id}
              onClick={() => handleSelect(setup)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-mono-data whitespace-nowrap transition-all border ${
                isSelected
                  ? "bg-[#B08D57] text-[#0A111C] font-bold border-[#B08D57] shadow-sm"
                  : "bg-black/40 text-[#BAC7D5] hover:text-[#EDE9DE] border-white/10 hover:border-[#B08D57]/30"
              }`}
            >
              <span>{setup.asset}</span>
              <span className={`text-[8.5px] px-1 rounded ${
                isSelected ? "bg-black/30 text-[#0A111C]" : "bg-[#B08D57]/20 text-[#B08D57]"
              }`}>
                {setup.conviction}
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected Setup Highlight Card */}
      <div className="bg-[#141B26] border border-[#B08D57]/30 rounded-lg p-3 space-y-2.5">
        {/* Setup Title, Bias & Spot */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-serif font-bold text-[#EDE9DE]">
                {activeSetup.asset}
              </span>
              <span className="text-[10px] font-mono-data text-[#8292A6]">
                [{activeSetup.ticker}]
              </span>
              <span className="text-[9px] font-mono-data uppercase px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-500/30 font-semibold">
                {activeSetup.biasLabel}
              </span>
            </div>
            <p className="text-[10.5px] text-[#BAC7D5] leading-snug mt-1">
              <strong>Macro Catalyst:</strong> {activeSetup.catalyst}
            </p>
          </div>

          <div className="text-right shrink-0">
            <span className="text-[9px] font-mono-data text-[#8292A6] block uppercase">Live Spot</span>
            <span className="text-sm font-mono-data font-bold text-[#B08D57]">
              {activeSetup.livePrice}
            </span>
          </div>
        </div>

        {/* Quant Key Levels Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 bg-black/40 border border-white/5 rounded p-2.5 text-[10px] font-mono-data">
          <div>
            <span className="text-[#8292A6] text-[8.5px] uppercase block">Entry Zone</span>
            <span className="text-emerald-400 font-bold">{activeSetup.entryZone}</span>
          </div>
          <div>
            <span className="text-[#8292A6] text-[8.5px] uppercase block">Invalidation (Stop)</span>
            <span className="text-rose-400 font-bold">{activeSetup.invalidation}</span>
          </div>
          <div>
            <span className="text-[#8292A6] text-[8.5px] uppercase block">Targets (R1 / R2)</span>
            <span className="text-[#EDE9DE] font-bold">{activeSetup.target1} / {activeSetup.target2}</span>
          </div>
          <div>
            <span className="text-[#8292A6] text-[8.5px] uppercase block">Risk / Reward</span>
            <span className="text-[#B08D57] font-bold">{activeSetup.riskReward}</span>
          </div>
        </div>

        {/* Detail View Mode Switcher: Strategy Thesis vs Key Levels vs Prop Sizing */}
        <div className="flex items-center gap-1 pt-1 border-t border-white/5">
          <button
            onClick={() => setActiveDetailView("strategy")}
            className={`px-2.5 py-1 rounded text-[10px] font-mono-data transition-all flex items-center gap-1 ${
              activeDetailView === "strategy"
                ? "bg-[#B08D57]/25 text-[#E5C794] border border-[#B08D57]/50 font-bold"
                : "text-[#8292A6] hover:text-[#EDE9DE]"
            }`}
          >
            <Target className="w-3 h-3 text-[#B08D57]" />
            <span>Strategy Behind Position</span>
          </button>

          <button
            onClick={() => setActiveDetailView("levels")}
            className={`px-2.5 py-1 rounded text-[10px] font-mono-data transition-all flex items-center gap-1 ${
              activeDetailView === "levels"
                ? "bg-[#B08D57]/25 text-[#E5C794] border border-[#B08D57]/50 font-bold"
                : "text-[#8292A6] hover:text-[#EDE9DE]"
            }`}
          >
            <Sliders className="w-3 h-3 text-[#B08D57]" />
            <span>Value Area &amp; Key Levels</span>
          </button>

          <button
            onClick={() => setActiveDetailView("prop_sizing")}
            className={`px-2.5 py-1 rounded text-[10px] font-mono-data transition-all flex items-center gap-1 ${
              activeDetailView === "prop_sizing"
                ? "bg-[#B08D57]/25 text-[#E5C794] border border-[#B08D57]/50 font-bold"
                : "text-[#8292A6] hover:text-[#EDE9DE]"
            }`}
          >
            <Shield className="w-3 h-3 text-[#B08D57]" />
            <span>Prop Firm Sizing (MFFU)</span>
          </button>
        </div>

        {/* Detail Content Section */}
        {activeDetailView === "strategy" && (
          <div className="bg-black/30 border border-white/5 rounded p-2.5 space-y-2 text-xs">
            <p className="text-[#EDE9DE]/90 leading-relaxed font-sans text-[11.5px]">
              {activeSetup.strategyThesis}
            </p>
            <div className="text-[10px] font-mono-data text-[#8292A6] pt-1 border-t border-white/5 flex items-center gap-1">
              <Clock className="w-3 h-3 text-[#B08D57]" />
              <span>Execution Protocol: <strong>{activeSetup.orderType}</strong></span>
            </div>
          </div>
        )}

        {activeDetailView === "levels" && (
          <div className="bg-black/30 border border-white/5 rounded p-2.5 space-y-2 text-xs font-mono-data">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="bg-white/5 p-1.5 rounded">
                <span className="text-[9px] text-[#8292A6] block uppercase">Intraday VWAP</span>
                <span className="text-[#EDE9DE] font-bold">{activeSetup.keyLevels.vwap}</span>
              </div>
              <div className="bg-white/5 p-1.5 rounded">
                <span className="text-[9px] text-[#8292A6] block uppercase">Session VPOC</span>
                <span className="text-[#B08D57] font-bold">{activeSetup.keyLevels.poc}</span>
              </div>
              <div className="bg-white/5 p-1.5 rounded">
                <span className="text-[9px] text-[#8292A6] block uppercase">Value Area High</span>
                <span className="text-emerald-400 font-bold">{activeSetup.keyLevels.vah}</span>
              </div>
              <div className="bg-white/5 p-1.5 rounded">
                <span className="text-[9px] text-[#8292A6] block uppercase">Stop Distance</span>
                <span className="text-rose-400 font-bold">{activeSetup.keyLevels.stopTicks}</span>
              </div>
            </div>

            <div className="pt-1.5 space-y-1">
              <span className="text-[9px] uppercase text-[#8292A6] font-bold block">Execution Checklist:</span>
              {activeSetup.executionChecklist.map((step, idx) => (
                <div key={idx} className="flex items-start gap-1.5 text-[10.5px] text-[#BAC7D5]">
                  <CheckCircle2 className="w-3 h-3 text-[#B08D57] shrink-0 mt-0.5" />
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeDetailView === "prop_sizing" && (
          <div className="bg-black/30 border border-white/5 rounded p-2.5 space-y-2 text-xs">
            <div className="flex items-center gap-1.5 text-[#E5C794] font-mono-data text-[11px] font-bold">
              <Shield className="w-3.5 h-3.5 text-[#B08D57]" />
              <span>Prop Firm Account Protection Blueprint (Tradovate / TradingView)</span>
            </div>
            <p className="text-[#EDE9DE]/90 leading-relaxed font-sans text-[11.5px]">
              {activeSetup.propFirmRule}
            </p>
            <div className="bg-amber-950/30 border border-amber-600/30 rounded p-2 text-[10px] font-mono-data text-amber-200/90 leading-snug">
              <strong>Bracket Stop Rule:</strong> In Tradovate/TradingView, configure an auto-bracket of <strong>OCO (Order Cancels Order)</strong> immediately upon entry. Never allow an unbracketed position into high-impact releases.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
