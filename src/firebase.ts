import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { ClearanceTier } from "./types";
import {
  getAuth,
  Auth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  signOut,
  onAuthStateChanged,
  User
} from "firebase/auth";
import {
  getFirestore,
  Firestore,
  doc,
  getDoc,
  setDoc,
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
  role: "admin" | "analyst" | "partner" | "founding_member";
  tier: ClearanceTier;
  deskCode: string;
  deskAccess: string[];
  createdAt: string;
  lastLoginAt: string;
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

export const DEFAULT_DESK_ACCESS = TIER_DESK_ACCESS["Founding Member"];

export const TIER_PASSCODES: Record<string, string> = {
  "Founding Member": "SMC-FOUNDING-2026",
  "Professional Allocator": "SMC-ALLOCATOR-2026",
  "Institutional Desk": "SMC-INSTITUTIONAL-2026",
  "Institutional Alpha": "SMC-INSTITUTIONAL-ALPHA",
  "Sovereign Advisory": "SMC-SOVEREIGN-2026",
  "Sovereign Desk": "SMC-SOVEREIGN-DESK"
};

export interface AuthorizedUserCredential {
  email: string;
  name: string;
  tier: ClearanceTier;
  passcode: string;
  password?: string;
  role: "admin" | "analyst" | "partner" | "founding_member";
}

// Authorized Institutional Accounts Whitelist
// tradeinmotions@gmail.com is configured with Founding Member clearance.
// Additional authorized institutional emails will be registered here.
export const AUTHORIZED_USERS: AuthorizedUserCredential[] = [
  {
    email: "tradeinmotions@gmail.com",
    name: "Member #01",
    tier: "Founding Member",
    passcode: "SMC-FOUNDING-2026",
    password: "SinMiedo2026!",
    role: "founding_member"
  },
  {
    email: "mrodfher@gmail.com",
    name: "Member #02",
    tier: "Founding Member",
    passcode: "SMC-FOUNDING-2026",
    password: "SinMiedo2026!",
    role: "founding_member"
  },
  {
    email: "dana.j.spears@gmail.com",
    name: "Member #03",
    tier: "Founding Member",
    passcode: "SMC-FOUNDING-2026",
    password: "SinMiedo2026!",
    role: "founding_member"
  },
  {
    email: "kingsleftgold@gmail.com",
    name: "Member #04",
    tier: "Founding Member",
    passcode: "SMC-FOUNDING-2026",
    password: "SinMiedo2026!",
    role: "founding_member"
  },
  {
    email: "eduardoharo12@gmail.com",
    name: "Member #05",
    tier: "Founding Member",
    passcode: "SMC-FOUNDING-2026",
    password: "SinMiedo2026!",
    role: "founding_member"
  },
  {
    email: "ericapp36@proton.me",
    name: "Member #06",
    tier: "Founding Member",
    passcode: "SMC-FOUNDING-2026",
    password: "SinMiedo2026!",
    role: "founding_member"
  },
  {
    email: "jjkexpansion042@gmail.com",
    name: "Member #07",
    tier: "Founding Member",
    passcode: "SMC-FOUNDING-2026",
    password: "SinMiedo2026!",
    role: "founding_member"
  }
];

export function findAuthorizedUser(email: string): AuthorizedUserCredential | undefined {
  if (!email) return undefined;
  return AUTHORIZED_USERS.find(
    (u) => u.email.toLowerCase().trim() === email.toLowerCase().trim()
  );
}

// Helper: Ensure user profile exists in Firestore and update profile data with selected tier
export async function syncUserProfile(
  user: User,
  tier: ClearanceTier = "Founding Member",
  passcode: string = "SMC-FOUNDING-2026"
): Promise<FirestoreUserProfile> {
  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);

  const resolvedAccess = TIER_DESK_ACCESS[tier] || DEFAULT_DESK_ACCESS;
  const now = new Date().toISOString();

  if (snap.exists()) {
    const existing = snap.data() as FirestoreUserProfile;
    // Update lastLoginAt AND selected tier & passcode so same email can test any tier freely!
    await updateDoc(userRef, {
      lastLoginAt: now,
      email: user.email || existing.email || "tradeinmotions@gmail.com",
      tier: tier,
      deskCode: passcode || TIER_PASSCODES[tier] || existing.deskCode,
      deskAccess: resolvedAccess
    });
    return {
      ...existing,
      id: user.uid,
      tier: tier,
      deskCode: passcode || TIER_PASSCODES[tier] || existing.deskCode,
      deskAccess: resolvedAccess,
      lastLoginAt: now
    };
  }

  // Create new profile
  const newProfile: FirestoreUserProfile = {
    id: user.uid,
    email: user.email || "tradeinmotions@gmail.com",
    displayName: user.displayName || (user.email ? user.email.split("@")[0] : "Institutional Partner"),
    role: (user.email === "tradeinmotions@gmail.com" || user.email === "founder@sinmiedocapital.com") ? "founding_member" : "analyst",
    tier,
    deskCode: passcode,
    deskAccess: resolvedAccess,
    createdAt: now,
    lastLoginAt: now,
    isCalmMode: false
  };

  await setDoc(userRef, newProfile);
  return newProfile;
}

// Helper: Switch user tier in Firestore and return updated access
export async function updateUserTierInFirestore(
  uid: string,
  tier: ClearanceTier,
  customPasscode?: string
): Promise<{ tier: ClearanceTier; deskCode: string; deskAccess: string[] }> {
  const deskCode = customPasscode || TIER_PASSCODES[tier] || "SMC-FOUNDING-2026";
  const deskAccess = TIER_DESK_ACCESS[tier] || DEFAULT_DESK_ACCESS;

  if (uid && uid !== "usr-fallback-local") {
    try {
      const userRef = doc(db, "users", uid);
      await updateDoc(userRef, {
        tier,
        deskCode,
        deskAccess,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      console.warn("Firestore tier update fallback:", err);
    }
  }

  return { tier, deskCode, deskAccess };
}

export {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  signOut,
  onAuthStateChanged,
  doc,
  getDoc,
  setDoc,
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
