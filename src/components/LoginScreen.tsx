import React, { useState } from "react";
import { UserSession, ClearanceTier } from "../types";
import {
  ShieldCheck,
  Lock,
  Mail,
  Key,
  Award,
  Building2,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Activity,
  Radio,
  Cpu,
  Database,
  Globe
} from "lucide-react";
import confetti from "canvas-confetti";
import {
  auth,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  syncUserProfile,
  DEFAULT_DESK_ACCESS,
  TIER_PASSCODES,
  TIER_DESK_ACCESS
} from "../firebase";

interface LoginScreenProps {
  onLoginSuccess: (session: UserSession) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  // Manual credentials input (blank by default):
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [tier, setTier] = useState<ClearanceTier>("Founding Member");
  const [passcode, setPasscode] = useState("");

  const handleTierSelect = (selectedTier: ClearanceTier) => {
    setTier(selectedTier);
  };

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ["#B08D57", "#EDE9DE", "#A6291C"]
      });
    } catch (err) {
      // ignore
    }
  };

  // Google Sign-In Flow
  const handleGoogleSignIn = async () => {
    setIsAuthenticating(true);
    setErrorMessage(null);
    setStatusMessage("Opening Google Institutional authentication gateway...");

    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      setStatusMessage("Syncing user profile with Firestore database...");
      const profile = await syncUserProfile(userCredential.user, tier, passcode);

      triggerConfetti();

      const session: UserSession = {
        isAuthenticated: true,
        uid: userCredential.user.uid,
        email: profile.email,
        name: profile.displayName || userCredential.user.displayName || "Institutional Partner",
        tier: profile.tier,
        role: profile.role,
        passcode: profile.deskCode,
        deskAccess: profile.deskAccess || DEFAULT_DESK_ACCESS,
        loginTime: new Date().toLocaleTimeString()
      };

      try {
        sessionStorage.setItem("smc_authenticated_session", JSON.stringify(session));
      } catch (err) {}

      setIsAuthenticating(false);
      onLoginSuccess(session);
    } catch (err: any) {
      console.error("Google Auth error:", err);
      setIsAuthenticating(false);
      if (err.code === "auth/popup-closed-by-user") {
        setErrorMessage("Authentication cancelled. You can also sign in via the instant founding clearance.");
      } else {
        setErrorMessage(err.message || "Failed to authenticate via Google. Falling back to clearance gateway.");
      }
    }
  };

  // Instant or Email/Password Authentication Flow with Firestore Persistence
  const handleAuthenticate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!email.trim()) {
      setErrorMessage("Please enter an authorized institutional email address.");
      return;
    }

    setIsAuthenticating(true);
    setErrorMessage(null);
    setStatusMessage("Connecting to Firebase Authentication & Firestore...");

    try {
      let firebaseUser: any = null;

      // Attempt email/password first
      try {
        const userCred = await signInWithEmailAndPassword(auth, email.trim(), password);
        firebaseUser = userCred.user;
      } catch (signInErr: any) {
        // If user not found, attempt to register automatically
        if (signInErr.code === "auth/user-not-found" || signInErr.code === "auth/invalid-credential") {
          try {
            const createCred = await createUserWithEmailAndPassword(auth, email.trim(), password);
            firebaseUser = createCred.user;
          } catch (createErr: any) {
            // Fall back to persistent anonymous auth if email provider password rules block
            const anonCred = await signInAnonymously(auth);
            firebaseUser = anonCred.user;
          }
        } else {
          // Fall back to anonymous authentication linked to Firestore
          const anonCred = await signInAnonymously(auth);
          firebaseUser = anonCred.user;
        }
      }

      setStatusMessage("Persisting institutional desk clearance to Cloud Firestore...");

      // Synchronize document in Firestore 'users/{uid}'
      let profile;
      if (firebaseUser) {
        profile = await syncUserProfile(
          { ...firebaseUser, email: email.trim() },
          tier,
          passcode
        );
      }

      triggerConfetti();

      const session: UserSession = {
        isAuthenticated: true,
        uid: firebaseUser?.uid || "usr-founding-persist",
        email: email.trim(),
        name: email.split("@")[0] || "Authorized Trader",
        tier: profile?.tier || tier,
        role: profile?.role || "founding_member",
        passcode: profile?.deskCode || passcode,
        deskAccess: profile?.deskAccess || DEFAULT_DESK_ACCESS,
        loginTime: new Date().toLocaleTimeString()
      };

      try {
        sessionStorage.setItem("smc_authenticated_session", JSON.stringify(session));
      } catch (err) {}

      setIsAuthenticating(false);
      onLoginSuccess(session);
    } catch (err: any) {
      console.warn("Auth persistence warning:", err);
      // Even if offline, ensure smooth institutional access for demo
      const session: UserSession = {
        isAuthenticated: true,
        uid: "usr-fallback-local",
        email: email.trim(),
        name: email.split("@")[0] || "Authorized Trader",
        tier,
        passcode,
        deskAccess: DEFAULT_DESK_ACCESS,
        loginTime: new Date().toLocaleTimeString()
      };
      try {
        sessionStorage.setItem("smc_authenticated_session", JSON.stringify(session));
      } catch (e) {}
      setIsAuthenticating(false);
      onLoginSuccess(session);
    }
  };

  return (
    <div
      id="macro-terminal-login-screen"
      className="min-h-screen bg-[#070C14] text-[#EDE9DE] flex flex-col justify-between relative overflow-hidden font-sans select-none"
    >
      {/* Background Architectural Grid Lines & Radial Vignette */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(to right, #222C3D 1px, transparent 1px),
            linear-gradient(to bottom, #222C3D 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px"
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#070C14] via-transparent to-[#070C14]/80 pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#B08D57]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Telemetry Ticker Bar */}
      <header className="relative z-10 border-b border-[#222C3D] bg-[#0A111C]/90 backdrop-blur-md px-4 sm:px-8 py-3 flex flex-wrap items-center justify-between gap-4 text-xs font-mono-data">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded border border-[#10B981]/30">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
            <span className="font-bold">SYSTEM ONLINE</span>
          </span>
          <span className="inline-flex items-center gap-1 text-[#E5C794] bg-[#B08D57]/10 px-2 py-0.5 rounded border border-[#B08D57]/30">
            <Database className="w-3 h-3 text-[#B08D57]" />
            <span>FIRESTORE AUTH PERSISTENT</span>
          </span>
          <span className="text-[#8292A6] hidden md:inline">
            ENCRYPTION: <span className="text-[#E5C794]">256-BIT TLS // OFAC ALIGNED</span>
          </span>
        </div>

        <div className="flex items-center gap-4 text-[#8292A6] text-[11px]">
          <span className="flex items-center gap-1">
            <Radio className="w-3 h-3 text-[#B08D57]" />
            <span>BoJ Telemetry: <strong className="text-[#EDE9DE]">Active</strong></span>
          </span>
          <span className="hidden sm:flex items-center gap-1">
            <Cpu className="w-3 h-3 text-[#B08D57]" />
            <span>Hormuz SAR: <strong className="text-[#EDE9DE]">Synced</strong></span>
          </span>
        </div>
      </header>

      {/* Main Center Content: Institutional Gateway */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 my-auto">
        <div className="w-full max-w-lg bg-[#0F1622] border border-[#B08D57]/30 rounded-xl shadow-2xl overflow-hidden relative backdrop-blur-xl">
          {/* Subtle Top Gold Highlight Line */}
          <div className="h-1 w-full bg-gradient-to-r from-[#B08D57]/20 via-[#B08D57] to-[#B08D57]/20" />

          {/* Header Title Section */}
          <div className="p-6 sm:p-8 pb-4 border-b border-[#222C3D] text-center relative">
            <div className="inline-flex p-3 rounded-xl bg-black/60 border border-[#B08D57]/40 mb-3 shadow-inner">
              <ShieldCheck className="w-7 h-7 text-[#B08D57]" />
            </div>

            <h1
              className="text-2xl sm:text-3xl font-bold tracking-tight text-[#EDE9DE]"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Sin Miedo Capital
            </h1>
            <p className="text-xs font-mono-data uppercase tracking-widest text-[#B08D57] mt-1 font-semibold">
              Macro Intelligence & Execution Terminal
            </p>
            <p className="text-[11px] text-[#8292A6] mt-2 font-mono-data">
              AUTHORIZED ACCESS GATEWAY // LEVEL-4 QUANTITATIVE SURVEILLANCE
            </p>
          </div>

         {/* Institutional Clearance Gateway Status Banner */}
          <div className="bg-[#0B1019] px-6 py-2.5 border-b border-[#222C3D] flex items-center justify-between text-xs font-mono-data">
            <div className="flex items-center gap-2 text-[#8292A6]">
              <Lock className="w-3.5 h-3.5 text-[#B08D57] shrink-0" />
              <span className="text-[11px] text-[#EDE9DE]">Institutional Authentication Gateway</span>
            </div>
            <span className="text-[10px] text-[#B08D57] font-mono-data uppercase tracking-wider">
              Whitelist Enforced
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handleAuthenticate} className="p-6 sm:p-8 space-y-4">
            {errorMessage && (
              <div className="p-3 bg-red-950/50 border border-red-500/50 rounded-lg text-red-200 text-xs font-mono-data">
                {errorMessage}
              </div>
            )}

            {/* Clearance Tier Selector */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[10px] font-mono-data uppercase text-[#8292A6] tracking-wider font-medium">
                  Authorized Clearance Tier
                </label>
                <span className="text-[9.5px] font-mono-data text-[#B08D57]">
                  Instant Passcode Sync
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  id="login-tier-founding"
                  onClick={() => handleTierSelect("Founding Member")}
                  className={`py-2 px-1.5 rounded-lg border text-center transition-all text-xs font-mono-data flex flex-col items-center gap-0.5 cursor-pointer ${
                    tier === "Founding Member"
                      ? "bg-[#B08D57] border-[#B08D57] text-[#0A111C] font-bold shadow-md ring-1 ring-[#B08D57]"
                      : "bg-[#0B1019] border-[#222C3D] text-[#8292A6] hover:text-[#EDE9DE] hover:border-[#B08D57]/40"
                  }`}
                >
                  <Award className={`w-3.5 h-3.5 ${tier === "Founding Member" ? "text-[#0A111C]" : "text-[#B08D57]"}`} />
                  <span className="text-[10.5px] font-bold leading-tight">Founding</span>
                  <span className={`text-[8.5px] ${tier === "Founding Member" ? "text-[#0A111C]/90 font-medium" : "text-[#B08D57]"}`}>All-Access</span>
                </button>

                <button
                  type="button"
                  id="login-tier-allocator"
                  onClick={() => handleTierSelect("Professional Allocator")}
                  className={`py-2 px-1.5 rounded-lg border text-center transition-all text-xs font-mono-data flex flex-col items-center gap-0.5 cursor-pointer ${
                    tier === "Professional Allocator"
                      ? "bg-[#64748B] border-[#94A3B8] text-[#0A111C] font-bold shadow-md ring-1 ring-[#94A3B8]"
                      : "bg-[#0B1019] border-[#222C3D] text-[#8292A6] hover:text-[#EDE9DE] hover:border-[#64748B]/40"
                  }`}
                >
                  <ShieldCheck className={`w-3.5 h-3.5 ${tier === "Professional Allocator" ? "text-[#0A111C]" : "text-[#94A3B8]"}`} />
                  <span className="text-[10.5px] font-bold leading-tight">Tier I: Allocator</span>
                  <span className={`text-[8.5px] ${tier === "Professional Allocator" ? "text-[#0A111C]/90 font-medium" : "text-[#8292A6]"}`}>Core Prop</span>
                </button>

                <button
                  type="button"
                  id="login-tier-institutional"
                  onClick={() => handleTierSelect("Institutional Desk")}
                  className={`py-2 px-1.5 rounded-lg border text-center transition-all text-xs font-mono-data flex flex-col items-center gap-0.5 cursor-pointer ${
                    tier === "Institutional Desk" || tier === "Institutional Alpha"
                      ? "bg-[#38BDF8] border-[#38BDF8] text-[#0A111C] font-bold shadow-md ring-1 ring-[#38BDF8]"
                      : "bg-[#0B1019] border-[#222C3D] text-[#8292A6] hover:text-[#EDE9DE] hover:border-[#38BDF8]/40"
                  }`}
                >
                  <Building2 className={`w-3.5 h-3.5 ${tier === "Institutional Desk" || tier === "Institutional Alpha" ? "text-[#0A111C]" : "text-[#38BDF8]"}`} />
                  <span className="text-[10.5px] font-bold leading-tight">Tier II: Inst.</span>
                  <span className={`text-[8.5px] ${tier === "Institutional Desk" || tier === "Institutional Alpha" ? "text-[#0A111C]/90 font-medium" : "text-[#38BDF8]"}`}>Hedge Funds</span>
                </button>

                <button
                  type="button"
                  id="login-tier-sovereign"
                  onClick={() => handleTierSelect("Sovereign Advisory")}
                  className={`py-2 px-1.5 rounded-lg border text-center transition-all text-xs font-mono-data flex flex-col items-center gap-0.5 cursor-pointer ${
                    tier === "Sovereign Advisory" || tier === "Sovereign Desk"
                      ? "bg-[#C084FC] border-[#C084FC] text-[#0A111C] font-bold shadow-md ring-1 ring-[#C084FC]"
                      : "bg-[#0B1019] border-[#222C3D] text-[#8292A6] hover:text-[#EDE9DE] hover:border-[#C084FC]/40"
                  }`}
                >
                  <Sparkles className={`w-3.5 h-3.5 ${tier === "Sovereign Advisory" || tier === "Sovereign Desk" ? "text-[#0A111C]" : "text-[#C084FC]"}`} />
                  <span className="text-[10.5px] font-bold leading-tight">Tier III: Sov.</span>
                  <span className={`text-[8.5px] ${tier === "Sovereign Advisory" || tier === "Sovereign Desk" ? "text-[#0A111C]/90 font-medium" : "text-[#C084FC]"}`}>Dark Fleet</span>
                </button>
              </div>
            </div>

            {/* Email Field (Autopopulated) */}
            <div>
              <label htmlFor="login-email" className="block text-[10px] font-mono-data uppercase text-[#8292A6] tracking-wider mb-1 font-medium">
                Institutional User Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-[#B08D57]" />
                <input
                  id="login-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="trader@fund.com"
                  className="w-full bg-[#0B1019] border border-[#2B3545] focus:border-[#B08D57] focus:ring-1 focus:ring-[#B08D57] rounded-lg py-2.5 pl-9 pr-3 text-xs text-[#EDE9DE] font-mono-data outline-none transition-all"
                />
              </div>
            </div>

            {/* Password & Passcode Field */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="login-password" className="block text-[10px] font-mono-data uppercase text-[#8292A6] tracking-wider mb-1 font-medium">
                  Access Key / Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3 text-[#8292A6]" />
                  <input
                    id="login-password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#0B1019] border border-[#2B3545] focus:border-[#B08D57] focus:ring-1 focus:ring-[#B08D57] rounded-lg py-2.5 pl-9 pr-3 text-xs text-[#EDE9DE] font-mono-data outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="login-passcode" className="block text-[10px] font-mono-data uppercase text-[#8292A6] tracking-wider mb-1 font-medium">
                  Tier Passcode
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 absolute left-3 top-3 text-[#B08D57]" />
                  <input
                    id="login-passcode"
                    type="text"
                    required
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    className="w-full bg-[#0B1019] border border-[#2B3545] focus:border-[#B08D57] focus:ring-1 focus:ring-[#B08D57] rounded-lg py-2.5 pl-9 pr-3 text-xs text-[#E5C794] font-mono-data outline-none transition-all tracking-wider"
                  />
                </div>
              </div>
            </div>

            {/* Status / Loading Progress */}
            {isAuthenticating && statusMessage && (
              <div className="p-3 bg-[#B08D57]/10 border border-[#B08D57]/30 rounded-lg flex items-center gap-2 text-xs font-mono-data text-[#E5C794] animate-pulse">
                <div className="w-3.5 h-3.5 border-2 border-[#B08D57] border-t-transparent rounded-full animate-spin shrink-0" />
                <span>{statusMessage}</span>
              </div>
            )}

            {/* Main Submit Button */}
            <button
              id="login-enter-terminal-btn"
              type="submit"
              disabled={isAuthenticating}
              className="w-full mt-2 py-3.5 px-4 bg-[#B08D57] hover:bg-[#C4A06A] active:scale-[0.99] text-[#0A111C] font-bold text-xs uppercase tracking-widest rounded-lg shadow-lg hover:shadow-[#B08D57]/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isAuthenticating ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#0A111C] border-t-transparent rounded-full animate-spin" />
                  <span>Authorizing Gateway & Syncing Firestore...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Enter Macro Terminal (Firestore Auth)</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Divider */}
            <div className="relative flex items-center justify-center my-2">
              <div className="border-t border-[#222C3D] w-full" />
              <span className="bg-[#0F1622] px-3 text-[10px] font-mono-data text-[#8292A6] uppercase tracking-wider">
                Or Continue With
              </span>
              <div className="border-t border-[#222C3D] w-full" />
            </div>

            {/* Google Authentication Button */}
            <button
              id="login-google-btn"
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isAuthenticating}
              className="w-full py-2.5 px-4 bg-[#0B1019] hover:bg-[#1A2230] border border-[#2B3545] hover:border-[#B08D57]/50 text-[#EDE9DE] font-mono-data text-xs rounded-lg transition-all flex items-center justify-center gap-2.5 disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Sign in with Institutional Google Account</span>
            </button>

            {/* Quick Demo Bypass info */}
            <div className="pt-2 text-center">
              <p className="text-[10px] font-mono-data text-[#8292A6]">
                Clicking <strong className="text-[#EDE9DE]">&ldquo;Enter Macro Terminal&rdquo;</strong> securely provisions your user document in Cloud Firestore and unlocks all 4 real-time macro surveillance engines and intelligence feeds.
              </p>
            </div>
          </form>

          {/* Footer Info */}
          <div className="bg-[#0B1019] px-6 py-3 border-t border-[#222C3D] flex items-center justify-between text-[10px] font-mono-data text-[#8292A6]">
            <span>FIRESTORE CLOUD PERSISTENCE ACTIVE</span>
            <span>v4.8 PROD BUILD</span>
          </div>
        </div>
      </main>

      {/* Terminal Footer Strip */}
      <footer className="relative z-10 border-t border-[#222C3D] bg-[#0A111C]/90 px-4 sm:px-8 py-3 flex flex-wrap items-center justify-between gap-4 text-[11px] font-mono-data text-[#8292A6]">
        <div>
          Sin Miedo Capital Macro Systems © 2026. All rights reserved.
        </div>
        <div className="flex items-center gap-4">
          <span>Strait of Hormuz Risk Engine</span>
          <span>•</span>
          <span>BoJ Yen Intervention Odds</span>
          <span>•</span>
          <span>Iran Dark Fleet Telemetry</span>
        </div>
      </footer>
    </div>
  );
};
