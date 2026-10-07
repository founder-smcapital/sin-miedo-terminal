import React, { useState, useEffect, useCallback, Suspense, lazy } from "react";
import { MacroDataState, UserSession, ActiveTab, Currency, ClearanceTier } from "./types";
import { initialMacroData } from "./data/mockMacroData";
import { HeaderTicker } from "./components/HeaderTicker";
import { Navbar } from "./components/Navbar";
import { DashboardGrid } from "./components/DashboardGrid";
import { LoginScreen } from "./components/LoginScreen";
import { Footer } from "./components/Footer";
import { useRealtimeStream } from "./hooks/useRealtimeStream";

// Performance code-splitting: Lazy-load secondary views and modals to keep initial bundle ultra-light
const SidebarIntelligence = lazy(() => import("./components/SidebarIntelligence").then((m) => ({ default: m.SidebarIntelligence })));
const PulseFeedView = lazy(() => import("./components/PulseFeedView").then((m) => ({ default: m.PulseFeedView })));
const IntelligenceView = lazy(() => import("./components/IntelligenceView").then((m) => ({ default: m.IntelligenceView })));
const SystemsView = lazy(() => import("./components/SystemsView").then((m) => ({ default: m.SystemsView })));
const FuturesView = lazy(() => import("./components/FuturesView").then((m) => ({ default: m.FuturesView })));
const SupportView = lazy(() => import("./components/SupportView").then((m) => ({ default: m.SupportView })));
const AuthModal = lazy(() => import("./components/AuthModal").then((m) => ({ default: m.AuthModal })));
const StreamGatewayModal = lazy(() => import("./components/StreamGatewayModal").then((m) => ({ default: m.StreamGatewayModal })));
const TierClearanceModal = lazy(() => import("./components/TierClearanceModal").then((m) => ({ default: m.TierClearanceModal })));

const ViewLoadingFallback = () => (
  <div className="flex flex-col items-center justify-center min-h-[360px] w-full p-8 text-center bg-[#0d1420]/40 border border-[#B08D57]/20 rounded-xl my-6">
    <div className="w-7 h-7 rounded-full border-2 border-[#B08D57]/30 border-t-[#B08D57] animate-spin mb-3" />
    <span className="text-[11px] font-mono-data text-[#8292A6] uppercase tracking-wider">
      Hydrating Sovereign Data Engine...
    </span>
  </div>
);
import {
  auth,
  onAuthStateChanged,
  signOut,
  db,
  doc,
  getDoc,
  updateDoc,
  syncUserProfile,
  DEFAULT_DESK_ACCESS,
  updateUserTierInFirestore
} from "./firebase";

export default function App() {
  const [macroData, setMacroData] = useState<MacroDataState>(initialMacroData);
  const [activeTab, setActiveTab] = useState<ActiveTab>("dashboards");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAutoRefreshActive, setIsAutoRefreshActive] = useState(true);
  const [isStreamModalOpen, setIsStreamModalOpen] = useState(false);
  const [isTierModalOpen, setIsTierModalOpen] = useState(false);

  // Direct Institutional Streaming Gateway (Level 2 Server-Sent Events Push Channel)
  const handleStreamData = useCallback((streamData: MacroDataState) => {
    if (streamData && streamData.engines && Array.isArray(streamData.tickers)) {
      setMacroData(streamData);
    }
  }, []);

  const streamInfo = useRealtimeStream(handleStreamData);

  // Switch Tier clearance dynamically with instant Firestore persistence
  const handleSwitchTier = async (newTier: ClearanceTier) => {
    const uid = userSession.uid || auth.currentUser?.uid || "usr-founding-persist";
    try {
      const { tier, deskCode, deskAccess } = await updateUserTierInFirestore(uid, newTier);
      const updatedSession: UserSession = {
        ...userSession,
        tier,
        passcode: deskCode,
        deskAccess
      };
      setUserSession(updatedSession);
      try {
        sessionStorage.setItem("smc_authenticated_session", JSON.stringify(updatedSession));
      } catch (err) {}
    } catch (err) {
      console.warn("Failed to switch tier:", err);
      // Fallback local update
      const updatedSession: UserSession = {
        ...userSession,
        tier: newTier
      };
      setUserSession(updatedSession);
      try {
        sessionStorage.setItem("smc_authenticated_session", JSON.stringify(updatedSession));
      } catch (e) {}
    }
  };

  // Auth State: checks sessionStorage and localStorage for seamless persistence
  const [userSession, setUserSession] = useState<UserSession>(() => {
    try {
      const saved =
        sessionStorage.getItem("smc_authenticated_session") ||
        localStorage.getItem("smc_authenticated_session");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.isAuthenticated) {
          return parsed;
        }
      }
    } catch (err) {
      // ignore
    }
    return {
      isAuthenticated: true,
      uid: "usr-founding-persist",
      email: "tradeinmotions@gmail.com",
      name: "Institutional Partner",
      tier: "Founding Member",
      role: "founding_member",
      passcode: "SMC-FOUNDING-2026",
      deskAccess: DEFAULT_DESK_ACCESS,
      loginTime: new Date().toLocaleTimeString()
    };
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Intelligence & Strategy Drawer State
  const [isIntelligenceDrawerOpen, setIsIntelligenceDrawerOpen] = useState(false);
  const [intelligenceInitialTab, setIntelligenceInitialTab] = useState<"strategy" | "summary" | "sentiment">("strategy");
  const [terminalInitialPrompt, setTerminalInitialPrompt] = useState<string | undefined>(undefined);
  const [refreshCount, setRefreshCount] = useState(0);

  // Firebase Auth State Listener & Cloud Firestore Sync
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDocRef = doc(db, "users", firebaseUser.uid);
          const snap = await getDoc(userDocRef);
          if (snap.exists()) {
            const profile = snap.data();
            const session: UserSession = {
              isAuthenticated: true,
              uid: firebaseUser.uid,
              email: profile.email || firebaseUser.email || "tradeinmotions@gmail.com",
              name: profile.displayName || firebaseUser.displayName || (profile.email ? profile.email.split("@")[0] : "Institutional Trader"),
              tier: profile.tier || "Founding Member",
              role: profile.role || "founding_member",
              passcode: profile.deskCode || "SMC-FOUNDING-2026",
              deskAccess: profile.deskAccess || DEFAULT_DESK_ACCESS,
              loginTime: new Date().toLocaleTimeString()
            };
            setUserSession(session);
            try {
              sessionStorage.setItem("smc_authenticated_session", JSON.stringify(session));
            } catch (e) {}

            if (typeof profile.isCalmMode === "boolean") {
              setIsCalmMode(profile.isCalmMode);
            }
            if (profile.currency === "USD" || profile.currency === "EUR") {
              setCurrency(profile.currency);
            }
          } else {
            const profile = await syncUserProfile(firebaseUser);
            const session: UserSession = {
              isAuthenticated: true,
              uid: firebaseUser.uid,
              email: profile.email,
              name: profile.displayName,
              tier: profile.tier,
              role: profile.role,
              passcode: profile.deskCode,
              deskAccess: profile.deskAccess,
              loginTime: new Date().toLocaleTimeString()
            };
            setUserSession(session);
            try {
              sessionStorage.setItem("smc_authenticated_session", JSON.stringify(session));
            } catch (e) {}
          }
        } catch (err) {
          console.warn("Firestore profile sync error:", err);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Accessibility: Calm Mode (Subdues motion, pings, marquee scrolling, and card transitions for sensory sensitivity)
  const [isCalmMode, setIsCalmMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("smc_calm_mode");
      if (saved !== null) return saved === "true";
    } catch (err) {}
    return false;
  });

  // Base Currency: Interchangeable Dollar ($ USD) and Euro (€ EUR)
  // Default to USD per trader requirement ("we don't trade in Euros so we want it to be interchangeable; dollar and Euros")
  const [currency, setCurrency] = useState<Currency>(() => {
    try {
      const saved = localStorage.getItem("smc_currency");
      if (saved === "USD" || saved === "EUR") return saved;
    } catch (err) {}
    return "USD";
  });

  const handleCurrencyChange = (newCurrency: Currency) => {
    setCurrency(newCurrency);
    try {
      localStorage.setItem("smc_currency", newCurrency);
    } catch (err) {}
    if (userSession.uid) {
      try {
        updateDoc(doc(db, "users", userSession.uid), { currency: newCurrency }).catch(() => {});
      } catch (e) {}
    }
  };

  const toggleCalmMode = () => {
    setIsCalmMode((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("smc_calm_mode", String(next));
      } catch (err) {}
      if (userSession.uid) {
        try {
          updateDoc(doc(db, "users", userSession.uid), { isCalmMode: next }).catch(() => {});
        } catch (e) {}
      }
      return next;
    });
  };

  // Fetch Live Macro Pulse from API (Polling Fallback)
  const fetchMacroPulse = async (isManual = false) => {
    if (isManual) {
      setIsRefreshing(true);
      setRefreshCount((c) => c + 1);
    }
    try {
      const res = await fetch("/api/macro/live-pulse");
      if (res.ok) {
        const json = await res.json();
        const nextData = json.engines ? json : (json.data || json);
        if (nextData && nextData.engines && Array.isArray(nextData.tickers)) {
          setMacroData(nextData);
          return;
        }
      }
    } catch (err) {
      console.warn("Live pulse fetch fallback:", err);
    } finally {
      if (isManual) setIsRefreshing(false);
    }

    // Client-side fallback dynamic tick if server is in offline cold start
    setMacroData((prev) => {
      const deltaYen = Number((Math.random() * 0.08 - 0.04).toFixed(2));
      const newYen = Number((prev.engines.yenIntervention.spot + deltaYen).toFixed(2));
      // Post-quiet intervention: spot has plummeted from ~160.20 down to ~156.25, so odds collapse to 12-16%
      const newOdds = newYen >= 160.0
        ? Math.min(94, Math.round(85 + (newYen - 160.0) * 20))
        : newYen >= 158.5
        ? Math.min(65, Math.round(45 + (newYen - 158.5) * 15))
        : Math.min(18, Math.max(10, Math.round(14 + (newYen - 156.25) * 5)));
      
      const deltaIbex = Number((Math.random() * 2 - 1).toFixed(1));
      const currentIbex = prev.engines.ibexBias.level || 19742.0;
      const newIbex = Number((currentIbex + deltaIbex).toFixed(1));
      const ibexPrevClose = 19798.0;
      const newIbexPct = Number(((newIbex - ibexPrevClose) / ibexPrevClose * 100).toFixed(2));

      // Dynamic War-Risk chokepoints (0-100 scale)
      const prevHormuz = prev.engines.middleEastWarRisk.chokepoints.find(c => c.name.includes("Hormuz"))?.riskScore || 80;
      const prevRedSea = prev.engines.middleEastWarRisk.chokepoints.find(c => c.name.includes("Red Sea") || c.name.includes("Bab"))?.riskScore || 90;
      const newHormuz = Math.min(96, Math.max(72, Math.round(prevHormuz + (Math.random() * 2 - 1))));
      const newRedSea = Math.min(98, Math.max(82, Math.round(prevRedSea + (Math.random() * 2 - 1))));
      const newRiskIndex = Number((newHormuz * 0.45 + newRedSea * 0.55).toFixed(1));
      const newGpr = Number((360 + (newRiskIndex - 80) * 1.8 + (Math.random() * 1.6 - 0.8)).toFixed(1));
      const newBrentAdder = Number((14.50 + (newRiskIndex - 75) * 0.40 + (Math.random() * 0.3 - 0.15)).toFixed(2));
      const newBrentAdderStr = `+$${newBrentAdder.toFixed(2)} / bbl`;

      const updatedChokepoints = prev.engines.middleEastWarRisk.chokepoints.map((cp) => {
        if (cp.name.includes("Hormuz")) {
          return {
            ...cp,
            riskScore: newHormuz,
            status: newHormuz >= 82 ? "SEVERELY ELEVATED" : "HIGH SURVEILLANCE"
          };
        }
        if (cp.name.includes("Red Sea") || cp.name.includes("Bab")) {
          return {
            ...cp,
            riskScore: newRedSea,
            status: newRedSea >= 88 ? "ACTIVE DISRUPTION" : "HIGH THREAT"
          };
        }
        return cp;
      });

      const updatedTickers = prev.tickers.map((t) => {
        if (t.symbol === "USD/JPY") {
          return {
            ...t,
            price: newYen,
            change: Number(((newYen - 156.75) / 156.75 * 100).toFixed(2)),
            status: newYen <= 157.00 ? "QUIET INTERVENTION -393 PIPS" : newYen >= 160.00 ? "CRITICAL WATCH" : "HIGH ALERT"
          };
        }
        if (t.symbol === "IBEX 35") {
          return {
            ...t,
            price: newIbex,
            change: newIbexPct,
            prevClose: ibexPrevClose,
            high24h: Math.max(t.high24h || 19884.40, newIbex),
            low24h: Math.min(t.low24h || 19680.00, newIbex),
            status: newIbexPct >= 0 ? "BULLISH BIAS (19,800+)" : "DEFENDING PIVOT"
          };
        }
        if (t.symbol === "ME-WAR RISK") {
          return {
            ...t,
            price: newRiskIndex
          };
        }
        if (t.symbol === "GPR INDEX") {
          return {
            ...t,
            price: newGpr
          };
        }
        if (t.symbol === "XAU/USD") {
          const goldVariance = Number((Math.sin(Date.now() / 15000) * 1.5).toFixed(1));
          const currentGoldPrice = Number(((t.price || 4408.90) + goldVariance).toFixed(1));
          const goldPrevClose = 4407.20;
          const currentGoldChange = Number(((currentGoldPrice - goldPrevClose) / goldPrevClose * 100).toFixed(2));
          return {
            ...t,
            price: currentGoldPrice,
            change: currentGoldChange,
            status: "SAFE HAVEN $4,400+"
          };
        }
        if (t.symbol === "XAG/USD") {
          const silverVariance = Number((Math.sin(Date.now() / 14000) * 0.06).toFixed(2));
          const currentSilverPrice = Number(((t.price || 64.10) + silverVariance).toFixed(2));
          const silverPrevClose = 64.00;
          const currentSilverChange = Number(((currentSilverPrice - silverPrevClose) / silverPrevClose * 100).toFixed(2));
          return {
            ...t,
            price: currentSilverPrice,
            change: currentSilverChange,
            status: currentSilverPrice >= 60 ? "PRECIOUS METALS EXPANSION" : "ACCUMULATION"
          };
        }
        if (t.symbol === "BRENT") {
          const brentVariance = Number((Math.cos(Date.now() / 20000) * 0.05).toFixed(2));
          const currentBrentPrice = Number(((t.price || 100.04) + brentVariance).toFixed(2));
          const brentPrevClose = 102.98;
          const currentBrentChange = Number(((currentBrentPrice - brentPrevClose) / brentPrevClose * 100).toFixed(2));
          return {
            ...t,
            price: currentBrentPrice,
            change: currentBrentChange,
            status: currentBrentPrice <= 100.5 ? `TESTING $100 SUPPORT ($${currentBrentPrice.toFixed(2)})` : `WAR RISK >$100 ($${currentBrentPrice.toFixed(2)})`
          };
        }
        if (t.symbol === "BTC/USD") {
          const btcBasePrice = t.price > 20000 ? t.price : 84450.00;
          const btcVariance = Number((Math.sin(Date.now() / 12000) * 15).toFixed(1));
          const currentBtcPrice = Number((btcBasePrice + btcVariance).toFixed(1));
          return {
            ...t,
            price: currentBtcPrice,
            status: "LIQUIDITY EXPANSION"
          };
        }
        if (t.symbol === "S&P 500") {
          const spVariance = Number((Math.cos(Date.now() / 14000) * 1.5).toFixed(2));
          const currentSpPrice = Number(((t.price || 7704.13) + spVariance).toFixed(2));
          const spPrevClose = 7706.03;
          const currentSpChange = Number(((currentSpPrice - spPrevClose) / spPrevClose * 100).toFixed(2));
          return {
            ...t,
            price: currentSpPrice,
            change: currentSpChange,
            status: "BULLISH EXPANSION"
          };
        }
        if (t.symbol === "KOSPI 200") {
          const kospiVariance = Number((Math.sin(Date.now() / 11000) * 0.25).toFixed(2));
          const currentKospi = Number(((t.price || 1112.00) + kospiVariance).toFixed(2));
          const kospiPrevClose = 1090.20;
          const currentKospiChange = Number(((currentKospi - kospiPrevClose) / kospiPrevClose * 100).toFixed(2));
          return {
            ...t,
            price: currentKospi,
            change: currentKospiChange,
            status: currentKospiChange >= 0 ? "BULLISH BREAKOUT" : "TECH CONSOLIDATION"
          };
        }
        if (t.symbol === "NIKKEI 225") {
          const nikkeiVariance = Number((Math.cos(Date.now() / 13000) * 12.0).toFixed(1));
          const currentNikkei = Number(((t.price || 66368.00) + nikkeiVariance).toFixed(1));
          const nikkeiPrevClose = 64150.00;
          const currentNikkeiChange = Number(((currentNikkei - nikkeiPrevClose) / nikkeiPrevClose * 100).toFixed(2));
          return {
            ...t,
            price: currentNikkei,
            change: currentNikkeiChange,
            status: currentNikkeiChange >= 0 ? "TECH ACCUMULATION" : "YEN UNWIND WATCH"
          };
        }
        if (t.symbol === "HANG SENG") {
          const hsiVariance = Number((Math.sin(Date.now() / 14000) * 8.0).toFixed(1));
          const currentHsi = Number(((t.price || 25054.00) + hsiVariance).toFixed(1));
          const hsiPrevClose = 24918.00;
          const currentHsiChange = Number(((currentHsi - hsiPrevClose) / hsiPrevClose * 100).toFixed(2));
          return {
            ...t,
            price: currentHsi,
            change: currentHsiChange,
            status: currentHsiChange >= 0 ? "STIMULUS EXPANSION" : "PBOC WATCH"
          };
        }
        if (t.symbol === "DAX 40") {
          const daxVariance = Number((Math.sin(Date.now() / 12500) * 3.2).toFixed(1));
          const currentDax = Number(((t.price || 19535.00) + daxVariance).toFixed(1));
          const daxPrevClose = 19602.00;
          const currentDaxChange = Number(((currentDax - daxPrevClose) / daxPrevClose * 100).toFixed(2));
          return {
            ...t,
            price: currentDax,
            change: currentDaxChange,
            status: currentDaxChange >= 0 ? "BULLISH EXPANSION" : "ENERGY DRAG (-0.34%)"
          };
        }
        if (t.symbol === "EURO STOXX 50") {
          const fesxVariance = Number((Math.cos(Date.now() / 13500) * 1.0).toFixed(1));
          const currentFesx = Number(((t.price || 5048.00) + fesxVariance).toFixed(1));
          const fesxPrevClose = 5067.50;
          const currentFesxChange = Number(((currentFesx - fesxPrevClose) / fesxPrevClose * 100).toFixed(2));
          return {
            ...t,
            price: currentFesx,
            change: currentFesxChange,
            status: currentFesxChange >= 0 ? "VALUE ACCEPTANCE" : "CYCLICAL HEADWINDS"
          };
        }
        if (t.symbol === "HANG SENG") {
          const hsiVariance = Number((Math.sin(Date.now() / 10500) * 8.5).toFixed(1));
          const currentHsi = Number(((t.price || 25054.00) + hsiVariance).toFixed(1));
          const hsiPrevClose = 24918.00;
          const currentHsiChange = Number(((currentHsi - hsiPrevClose) / hsiPrevClose * 100).toFixed(2));
          return {
            ...t,
            price: currentHsi,
            change: currentHsiChange,
            status: currentHsiChange >= 0 ? "STIMULUS EXPANSION" : "CONSOLIDATION"
          };
        }
        if (t.symbol === "NASDAQ 100") {
          const nqVariance = Number((Math.cos(Date.now() / 11500) * 4.5).toFixed(2));
          const currentNq = Number(((t.price || 30608.14) + nqVariance).toFixed(2));
          const nqPrevClose = t.prevClose || 30478.86;
          const currentNqChange = Number(((currentNq - nqPrevClose) / nqPrevClose * 100).toFixed(2));
          return {
            ...t,
            price: currentNq,
            change: currentNqChange,
            prevClose: nqPrevClose,
            high24h: Math.max(t.high24h || 30889.25, currentNq),
            low24h: Math.min(t.low24h || 30413.59, currentNq),
            status: currentNqChange >= 0 ? "MOMENTUM EXPANSION" : "AI MULTIPLE PULLBACK"
          };
        }
        if (t.symbol === "DOW 30") {
          const dowVariance = Number((Math.sin(Date.now() / 15000) * 6.0).toFixed(1));
          const currentDow = Number(((t.price || 43890.00) + dowVariance).toFixed(1));
          const dowPrevClose = 43837.00;
          const currentDowChange = Number(((currentDow - dowPrevClose) / dowPrevClose * 100).toFixed(2));
          return {
            ...t,
            price: currentDow,
            change: currentDowChange,
            status: currentDowChange >= 0 ? "BLUE CHIP RESILIENCE" : "CYCLICAL HESITATION"
          };
        }
        if (t.symbol === "RUSSELL 2000") {
          const rutVariance = Number((Math.cos(Date.now() / 12000) * 1.2).toFixed(2));
          const currentRut = Number(((t.price || 2214.50) + rutVariance).toFixed(2));
          const rutPrevClose = 2217.80;
          const currentRutChange = Number(((currentRut - rutPrevClose) / rutPrevClose * 100).toFixed(2));
          return {
            ...t,
            price: currentRut,
            change: currentRutChange,
            status: currentRutChange >= 0 ? "SMALL CAP REBOUND" : "RATE SCRUTINY"
          };
        }
        if (t.symbol === "FTSE 100") {
          const ftseVariance = Number((Math.sin(Date.now() / 14500) * 1.5).toFixed(1));
          const currentFtse = Number(((t.price || 8380.20) + ftseVariance).toFixed(1));
          const ftsePrevClose = 8340.10;
          const currentFtseChange = Number(((currentFtse - ftsePrevClose) / ftsePrevClose * 100).toFixed(2));
          return {
            ...t,
            price: currentFtse,
            change: currentFtseChange,
            status: currentFtseChange >= 0 ? "COMMODITY BID" : "DEFENDING SUPPORT"
          };
        }
        if (t.symbol === "VIX") {
          const vixVariance = Number((Math.sin(Date.now() / 7000) * 0.08).toFixed(2));
          const currentVix = Number(((t.price || 18.95) + vixVariance).toFixed(2));
          const vixPrevClose = 19.18;
          const currentVixChange = Number(((currentVix - vixPrevClose) / vixPrevClose * 100).toFixed(2));
          const vixStatus = currentVix < 15.0
            ? "COMPLACENCY / LOW VOL"
            : currentVix <= 20.0
            ? "NORMAL VOLATILITY"
            : currentVix <= 25.0
            ? "ELEVATED RISK PREMIUM"
            : "SYSTEMIC SQUEEZE";
          return {
            ...t,
            price: currentVix,
            change: currentVixChange,
            status: vixStatus,
            signal: (currentVix < 16 ? "brass" : currentVix <= 20 ? "neutral" : "danger") as "brass" | "neutral" | "danger"
          };
        }
        if (t.symbol === "MOVE") {
          const moveVariance = Number((Math.cos(Date.now() / 8500) * 0.35).toFixed(1));
          const currentMove = Number(((t.price || 102.4) + moveVariance).toFixed(1));
          return {
            ...t,
            price: currentMove,
            status: currentMove > 110 ? "RATES VOL HIGH" : "RATES STABLE"
          };
        }
        return t;
      });

      return {
        ...prev,
        formattedTime: new Date().toTimeString().split(' ')[0] + ' UTC',
        tickers: updatedTickers,
        engines: {
          ...prev.engines,
          yenIntervention: {
            ...prev.engines.yenIntervention,
            spot: newYen,
            interventionOdds: newOdds,
            change: `${(newYen - 160.18) >= 0 ? '+' : ''}${((newYen - 160.18) / 160.18 * 100).toFixed(2)}%`,
            defcon: newYen >= 160.00 ? "DEFCON 1" : newYen >= 158.50 ? "DEFCON 2" : newYen >= 157.00 ? "DEFCON 3" : "DEFCON 4",
            defconStatus: newYen >= 160.00 ? "Intervention Imminent" : newYen >= 158.50 ? "Rate Checks Active" : newYen >= 157.00 ? "Heightened Surveillance" : "Quiet Action Absorbed"
          },
          ibexBias: {
            ...prev.engines.ibexBias,
            level: newIbex,
            dailyChange: `${newIbexPct >= 0 ? '+' : ''}${newIbexPct}%`
          },
          middleEastWarRisk: {
            ...prev.engines.middleEastWarRisk,
            riskIndex: newRiskIndex,
            gprIndex: newGpr,
            brentGeopoliticalPremium: newBrentAdderStr,
            chokepoints: updatedChokepoints
          }
        }
      };
    });
  };

  // Resilient Polling Fallback (runs if direct stream is offline or user selects polling mode)
  useEffect(() => {
    fetchMacroPulse(false);
    if (!isAutoRefreshActive) return;

    const interval = setInterval(() => {
      // If streaming is actively connected and pushing, poll less aggressively as backup
      if (!streamInfo.isConnected || streamInfo.mode === "polling") {
        fetchMacroPulse(false);
      }
    }, streamInfo.isConnected ? 20000 : 8000);

    return () => clearInterval(interval);
  }, [isAutoRefreshActive, streamInfo.isConnected, streamInfo.mode]);

  const handleOpenTerminal = (customPrompt?: string) => {
    setTerminalInitialPrompt(customPrompt);
    setIntelligenceInitialTab("strategy");
    setIsIntelligenceDrawerOpen(true);
  };

  const handleOpenSummaryDrawer = () => {
    setIntelligenceInitialTab("summary");
    setIsIntelligenceDrawerOpen(true);
  };

  const handleLoginSuccess = (session: UserSession) => {
    setUserSession(session);
    try {
      sessionStorage.setItem("smc_authenticated_session", JSON.stringify(session));
      localStorage.setItem("smc_authenticated_session", JSON.stringify(session));
    } catch (err) {
      // storage disabled
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.warn("SignOut error:", err);
    }
    try {
      sessionStorage.removeItem("smc_authenticated_session");
      localStorage.removeItem("smc_authenticated_session");
    } catch (err) {
      // ignore
    }
    setUserSession({
      isAuthenticated: false,
      email: "",
      tier: "Founding Member"
    });
  };

  // If unauthenticated, display the full-screen Macro Terminal Login Screen
  if (!userSession.isAuthenticated) {
    return (
      <div id="smc-app-root" className="min-h-screen bg-[#070C14] text-[#EDE9DE] font-sans antialiased relative">
        <div className="grain-overlay" aria-hidden="true" />
        <LoginScreen onLoginSuccess={handleLoginSuccess} />
      </div>
    );
  }

  return (
    <div id="smc-app-root" className={`min-h-screen w-full max-w-full overflow-x-hidden bg-[#0A111C] text-[#EDE9DE] font-sans antialiased flex flex-col justify-between selection:bg-[#B08D57] selection:text-[#0E1A2B] relative ${isCalmMode ? "calm-mode" : ""}`}>
      {/* Subtle Tactile Film Grain Texture Overlay */}
      <div className="grain-overlay" aria-hidden="true" />

      <div className="relative z-10 w-full max-w-full overflow-x-clip">
        {/* 1. Header Ticker Strip with Real-Time Stream Status & 15s auto-refresh */}
        <HeaderTicker
          tickers={macroData.tickers}
          refreshIntervalSeconds={15}
          onManualRefresh={fetchMacroPulse}
          isAutoRefreshActive={isAutoRefreshActive}
          onToggleAutoRefresh={() => setIsAutoRefreshActive(!isAutoRefreshActive)}
          streamInfo={streamInfo}
          onOpenStreamModal={() => setIsStreamModalOpen(true)}
          isCalmMode={isCalmMode}
          onToggleCalmMode={toggleCalmMode}
        />

        {/* 2. Top Navigation Bar */}
        <Navbar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          userSession={userSession}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
          onLogout={handleLogout}
          onOpenTerminal={() => handleOpenTerminal()}
          currency={currency}
          onCurrencyChange={handleCurrencyChange}
          onOpenTierModal={() => setIsTierModalOpen(true)}
        />

        {/* 3. Main Body Container */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {activeTab === "dashboards" && (
            <DashboardGrid
              macroData={macroData}
              onOpenTerminal={() => handleOpenTerminal()}
              onOpenSummaryDrawer={handleOpenSummaryDrawer}
              onManualRefresh={fetchMacroPulse}
              refreshKey={refreshCount}
              isCalmMode={isCalmMode}
              userSession={userSession}
              currency={currency}
              onOpenTierModal={() => setIsTierModalOpen(true)}
            />
          )}

          <Suspense fallback={<ViewLoadingFallback />}>
            {activeTab === "pulse" && (
              <PulseFeedView
                macroData={macroData}
                onRefresh={fetchMacroPulse}
              />
            )}

            {activeTab === "intelligence" && (
              <IntelligenceView
                macroData={macroData}
                onOpenTerminalWithPrompt={(prompt) => handleOpenTerminal(prompt)}
                userSession={userSession}
                currency={currency}
                onNavigateToDashboard={(tab) => setActiveTab(tab as any)}
              />
            )}

            {activeTab === "systems" && (
              <SystemsView
                macroData={macroData}
                onOpenTerminal={(prompt) => handleOpenTerminal(prompt)}
                isCalmMode={isCalmMode}
                currency={currency}
                onCurrencyChange={handleCurrencyChange}
              />
            )}

            {activeTab === "futures" && (
              <FuturesView
                macroData={macroData}
                isCalmMode={isCalmMode}
                onOpenTerminal={(prompt) => handleOpenTerminal(prompt)}
              />
            )}

            {activeTab === "support" && (
              <SupportView
                userEmail={userSession.email}
                userName={userSession.name}
              />
            )}
          </Suspense>
        </main>
      </div>

      {/* 4. Global Footer */}
      <Footer />

      {/* 5. Lazy-Loaded Modals */}
      <Suspense fallback={null}>
        {isAuthModalOpen && (
          <AuthModal
            isOpen={isAuthModalOpen}
            onClose={() => setIsAuthModalOpen(false)}
            onLoginSuccess={handleLoginSuccess}
          />
        )}

        {isStreamModalOpen && (
          <StreamGatewayModal
            isOpen={isStreamModalOpen}
            onClose={() => setIsStreamModalOpen(false)}
            streamInfo={streamInfo}
            onToggleMode={streamInfo.toggleMode}
            onReconnect={streamInfo.reconnect}
          />
        )}

        {isTierModalOpen && (
          <TierClearanceModal
            isOpen={isTierModalOpen}
            onClose={() => setIsTierModalOpen(false)}
            userSession={userSession}
            onSwitchTier={handleSwitchTier}
          />
        )}
      </Suspense>

      {/* 6. Sidebar / Drawer Intelligence Terminal */}
      <Suspense fallback={null}>
        {isIntelligenceDrawerOpen && (
          <SidebarIntelligence
            isOpen={isIntelligenceDrawerOpen}
            onClose={() => {
              setIsIntelligenceDrawerOpen(false);
              setTerminalInitialPrompt(undefined);
            }}
            macroData={macroData}
            initialTab={intelligenceInitialTab}
            initialPrompt={terminalInitialPrompt}
            userSession={userSession}
            currency={currency}
          />
        )}
      </Suspense>
    </div>
  );
}
