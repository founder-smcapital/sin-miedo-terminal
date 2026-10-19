import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { ClearanceTier } from "./types";
import {
  getAuth,
  Auth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  getIdTokenResult,
  User
} from "firebase/auth";
import {
  getFirestore,
  Firestore,
  doc,
  getDoc,
  updateDoc,
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
  addDoc,
  deleteDoc,
  serverTimestamp
} from "firebase/firestore";
import firebaseConfig from "../firebase-applet-config.json";

// Initialize Firebase App
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp({
    apiKey: firebaseConfig.apiKey,
    authDomain: firebaseConfig.authDomain,
    projectId: firebaseConfig.projectId,
    storageBucket: firebaseConfig.storageBucket,
    messagingSenderId: firebaseConfig.messagingSenderId,
    appId: firebaseConfig.appId,
  });
} else {
  app = getApp();
}

// Initialize Auth
export const auth: Auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

// Initialize Firestore with custom database ID if provisioned
export const db: Firestore = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

export interface FirestoreUserProfile {
  id: string;
  email: string;
  displayName: string;
  currency?: "USD" | "EUR";
  preferredDesk?: string;
  isCalmMode?: boolean;
}

export const TIER_DESK_ACCESS: Record<string, string[]> = {
  "Professional Allocator": [
    "Global 24H Equity & Macro Sparklines",
    "BoJ Yen FX Strategic Interventions",
    "IBEX 35 Prop Desk Execution Levels",
    "Global Futures & Live Order Book Depth",
    "Macro Pulse Live Audio Tickers",
    "CSV/TSV Historical Data Export"
  ],
  "Institutional Desk": [
    "Global 24H Equity & Macro Sparklines",
    "BoJ Yen FX Strategic Interventions",
    "IBEX 35 Prop Desk Execution Levels",
    "Global Futures & Live Order Book Depth",
    "Macro Pulse Live Audio Tickers",
    "CSV/TSV Historical Data Export",
    "Middle East War-Risk Radar & Chokepoints",
    "9x9 Cross-Asset Covariance Matrix",
    "Institutional Research PDF Export Suite",
    "SMC Strategy Desk & Real-Time Macro Playbooks"
  ],
  "Institutional Alpha": [
    "Global 24H Equity & Macro Sparklines",
    "BoJ Yen FX Strategic Interventions",
    "IBEX 35 Prop Desk Execution Levels",
    "Global Futures & Live Order Book Depth",
    "Macro Pulse Live Audio Tickers",
    "CSV/TSV Historical Data Export",
    "Middle East War-Risk Radar & Chokepoints",
    "9x9 Cross-Asset Covariance Matrix",
    "Institutional Research PDF Export Suite",
    "SMC Strategy Desk & Real-Time Macro Playbooks"
  ],
  "Sovereign Advisory": [
    "Global 24H Equity & Macro Sparklines",
    "BoJ Yen FX Strategic Interventions",
    "IBEX 35 Prop Desk Execution Levels",
    "Global Futures & Live Order Book Depth",
    "Macro Pulse Live Audio Tickers",
    "CSV/TSV Historical Data Export",
    "Middle East War-Risk Radar & Chokepoints",
    "9x9 Cross-Asset Covariance Matrix",
    "Institutional Research PDF Export Suite",
    "SMC Strategy Desk & Real-Time Macro Playbooks",
    "Sovereign Debt Servicing & Real Yields",
    "Iran Dark Fleet SAR Satellite AIS Radar",
    "Direct Low-Latency Websocket Data Feed"
  ],
  "Sovereign Desk": [
    "Global 24H Equity & Macro Sparklines",
    "BoJ Yen FX Strategic Interventions",
    "IBEX 35 Prop Desk Execution Levels",
    "Global Futures & Live Order Book Depth",
    "Macro Pulse Live Audio Tickers",
    "CSV/TSV Historical Data Export",
    "Middle East War-Risk Radar & Chokepoints",
    "9x9 Cross-Asset Covariance Matrix",
    "Institutional Research PDF Export Suite",
    "SMC Strategy Desk & Real-Time Macro Playbooks",
    "Sovereign Debt Servicing & Real Yields",
    "Iran Dark Fleet SAR Satellite AIS Radar",
    "Direct Low-Latency Websocket Data Feed"
  ],
  // Founding Member (Early Adopters / 15 Lifetime Members): Gets Sovereign-Grade All-Access under Founding Member credentials
  "Founding Member": [
    "Global 24H Equity & Macro Sparklines",
    "BoJ Yen FX Strategic Interventions",
    "IBEX 35 Prop Desk Execution Levels",
    "Global Futures & Live Order Book Depth",
    "Macro Pulse Live Audio Tickers",
    "CSV/TSV Historical Data Export",
    "Middle East War-Risk Radar & Chokepoints",
    "9x9 Cross-Asset Covariance Matrix",
    "Institutional Research PDF Export Suite",
    "SMC Strategy Desk & Real-Time Macro Playbooks",
    "Sovereign Debt Servicing & Real Yields",
    "Iran Dark Fleet SAR Satellite AIS Radar",
    "Direct Low-Latency Websocket Data Feed",
    "Lifetime Early Adopter Sovereign Clearance"
  ]
};

const CLEARANCE_TIERS: ClearanceTier[] = [
  "Founding Member",
  "Professional Allocator",
  "Institutional Desk",
  "Institutional Alpha",
  "Sovereign Advisory",
  "Sovereign Desk"
];

type UserRole = NonNullable<import("./types").UserSession["role"]>;
const USER_ROLES: UserRole[] = ["admin", "analyst", "partner", "founding_member"];

export async function getAuthorizedSession(user: User): Promise<import("./types").UserSession> {
  const { claims } = await getIdTokenResult(user, true);
  const tier = claims.tier;

  if (claims.terminalAccess !== true || typeof tier !== "string" || !CLEARANCE_TIERS.includes(tier as ClearanceTier)) {
    throw new Error("This account has not been provisioned for terminal access. Contact your administrator.");
  }

  const role = claims.role;
  return {
    isAuthenticated: true,
    uid: user.uid,
    email: user.email || "",
    name: user.displayName || user.email?.split("@")[0] || "Institutional Trader",
    tier: tier as ClearanceTier,
    role: typeof role === "string" && USER_ROLES.includes(role as UserRole) ? role as UserRole : "analyst",
    deskAccess: TIER_DESK_ACCESS[tier]
  };
}

export {
  signInWithPopup,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  doc,
  getDoc,
  updateDoc,
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
  addDoc,
  deleteDoc,
  serverTimestamp
};
