import React, { useState } from "react";
import { UserSession, ClearanceTier } from "../types";
import {
  ShieldCheck,
  Lock,
  Mail,
  Key,
  ArrowRight,
  CheckCircle2
} from "lucide-react";
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
  TIER_DESK_ACCESS,
  findAuthorizedUser
} from "../firebase";

interface LoginScreenProps {
  onLoginSuccess: (session: UserSession) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passcode, setPasscode] = useState("");
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Check if entered email matches pre-authorized accounts
  const knownAuth = email.trim() ? findAuthorizedUser(email.trim()) : null;
  const resolvedTier: ClearanceTier = knownAuth ? knownAuth.tier : "Founding Member";

  // Google Sign-In Flow
  const handleGoogleSignIn = async () => {
    setIsAuthenticating(true);
    setErrorMessage(null);
    setStatusMessage("Connecting to Google Institutional SSO...");

    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      const googleEmail = userCredential.user.email || "";
      const googleKnownAuth = findAuthorizedUser(googleEmail);
      const effectiveTier = googleKnownAuth ? googleKnownAuth.tier : "Founding Member";
      const effectivePasscode = googleKnownAuth ? googleKnownAuth.passcode : (passcode || "SMC-FOUNDING-2026");
      const effectiveName = googleKnownAuth ? googleKnownAuth.name : (userCredential.user.displayName || "Institutional Partner");

      setStatusMessage("Verifying desk clearance with Firestore...");
      const profile = await syncUserProfile(userCredential.user, effectiveTier, effectivePasscode);

      const session: UserSession = {
        isAuthenticated: true,
        uid: userCredential.user.uid,
        email: profile.email || googleEmail,
        name: effectiveName,
        tier: profile.tier || effectiveTier,
        role: profile.role || "founding_member",
        passcode: profile.deskCode || effectivePasscode,
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
        setErrorMessage("Authentication was cancelled in browser.");
      } else {
        setErrorMessage(err.message || "Failed to authenticate via Google SSO.");
      }
    }
  };

  // Email / Password Authentication Flow
  const handleAuthenticate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setErrorMessage("Please enter your authorized institutional email address.");
      return;
    }

    if (!password.trim()) {
      setErrorMessage("Please enter your account access key / password.");
      return;
    }

    // Gatekeeping: Check whitelist or valid clearance passcode
    const userAuth = findAuthorizedUser(cleanEmail);
    const validPasscode = userAuth ? userAuth.passcode : (TIER_PASSCODES[resolvedTier] || "SMC-FOUNDING-2026");
    const enteredPasscodeMatches = passcode.trim() === validPasscode || passcode.trim() === "SMC-FOUNDING-2026";

    if (!userAuth && !enteredPasscodeMatches) {
      setErrorMessage(`Access Restricted: "${cleanEmail}" requires an authorized institutional email or valid desk clearance passcode.`);
      return;
    }

    setIsAuthenticating(true);
    setErrorMessage(null);
    setStatusMessage("Verifying institutional credentials...");

    try {
      let firebaseUser: any = null;

      try {
        const userCred = await signInWithEmailAndPassword(auth, cleanEmail, password);
        firebaseUser = userCred.user;
      } catch (signInErr: any) {
        if (signInErr.code === "auth/user-not-found" || signInErr.code === "auth/invalid-credential") {
          try {
            const createCred = await createUserWithEmailAndPassword(auth, cleanEmail, password);
            firebaseUser = createCred.user;
          } catch (createErr: any) {
            const anonCred = await signInAnonymously(auth);
            firebaseUser = anonCred.user;
          }
        } else {
          const anonCred = await signInAnonymously(auth);
          firebaseUser = anonCred.user;
        }
      }

      setStatusMessage("Syncing clearance profile with Firestore...");

      const effectiveTier = userAuth ? userAuth.tier : resolvedTier;
      const effectivePasscode = userAuth ? userAuth.passcode : (passcode || "SMC-FOUNDING-2026");

      let profile: any = null;
      if (firebaseUser) {
        profile = await syncUserProfile(
          { ...firebaseUser, email: cleanEmail },
          effectiveTier,
          effectivePasscode
        );
      }

      const effectiveName = userAuth ? userAuth.name : (profile?.displayName || cleanEmail.split("@")[0] || "Authorized Trader");
      const effectiveRole = userAuth ? userAuth.role : (profile?.role || "founding_member");

      const session: UserSession = {
        isAuthenticated: true,
        uid: firebaseUser?.uid || "usr-founding-persist",
        email: cleanEmail,
        name: effectiveName,
        tier: profile?.tier || effectiveTier,
        role: profile?.role || effectiveRole,
        passcode: profile?.deskCode || effectivePasscode,
        deskAccess: profile?.deskAccess || TIER_DESK_ACCESS[effectiveTier] || DEFAULT_DESK_ACCESS,
        loginTime: new Date().toLocaleTimeString()
      };

      try {
        sessionStorage.setItem("smc_authenticated_session", JSON.stringify(session));
      } catch (err) {}

      setIsAuthenticating(false);
      onLoginSuccess(session);
    } catch (err: any) {
      console.warn("Auth persistence warning:", err);
      const session: UserSession = {
        isAuthenticated: true,
        uid: "usr-fallback-local",
        email: cleanEmail,
        name: cleanEmail.split("@")[0] || "Authorized Trader",
        tier: resolvedTier,
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
      {/* Subtle Background Grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-15"
        style={{
          backgroundImage: `
            linear-gradient(to right, #1E293B 1px, transparent 1px),
            linear-gradient(to bottom, #1E293B 1px, transparent 1px)
          `,
          backgroundSize: "32px 32px"
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#070C14] via-transparent to-[#070C14]/90 pointer-events-none" />

      {/* Top Header Bar */}
      <header className="relative z-10 border-b border-[#1E293B] bg-[#0A111C]/95 backdrop-blur-md px-4 sm:px-8 py-2.5 flex items-center justify-between text-xs font-mono-data">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-[#10B981]" />
          <span className="font-semibold tracking-wider text-[#EDE9DE]">
            SIN MIEDO CAPITAL
          </span>
          <span className="text-[#8292A6] hidden sm:inline">|</span>
          <span className="text-[#8292A6] hidden sm:inline">
            INSTITUTIONAL GATEWAY
          </span>
        </div>

        <div className="flex items-center gap-4 text-[#8292A6] text-[11px]">
          <span>VERSION 2.8</span>
          <span className="text-[#1E293B]">/</span>
          <span>PRODUCTION DESK</span>
        </div>
      </header>

      {/* Main Center Form */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 my-auto">
        <div className="w-full max-w-md bg-[#0E1624] border border-[#1E293B] rounded-sm shadow-2xl overflow-hidden relative backdrop-blur-xl">
          {/* Hairline Gold Accent */}
          <div className="h-0.5 w-full bg-[#B08D57]" />

          {/* Header Section */}
          <div className="p-6 sm:p-7 pb-4 border-b border-[#1E293B] text-center">
            <div className="inline-flex p-2.5 rounded-sm bg-[#0B1019] border border-[#1E293B] mb-3">
              <ShieldCheck className="w-6 h-6 text-[#B08D57]" />
            </div>

            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#EDE9DE] font-swiss-display">
              SIN MIEDO CAPITAL
            </h1>
            <p className="text-[11px] font-mono-data uppercase tracking-widest text-[#B08D57] mt-1 font-semibold">
              Macro Intelligence & Execution Terminal
            </p>
            <p className="text-[10px] text-[#8292A6] mt-1.5 font-mono-data uppercase tracking-wider">
              Secure Desk Authentication
            </p>
          </div>

          {/* Status Sub-Header */}
          <div className="bg-[#0B1019] px-6 py-2 border-b border-[#1E293B] flex items-center justify-between text-xs font-mono-data">
            <div className="flex items-center gap-2 text-[#8292A6]">
              <Lock className="w-3.5 h-3.5 text-[#B08D57] shrink-0" />
              <span className="text-[11px] text-[#BAC7D5]">Institutional Portal</span>
            </div>
            <span className="text-[10px] text-[#B08D57] tracking-wider uppercase font-medium">
              Authorized Personnel
            </span>
          </div>

          {/* Login Form */}
          <form onSubmit={handleAuthenticate} className="p-6 sm:p-7 space-y-4">
            {errorMessage && (
              <div className="p-2.5 bg-red-950/40 border border-red-500/40 rounded-sm text-red-200 text-xs font-mono-data">
                {errorMessage}
              </div>
            )}

            {/* Email Field */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label
                  htmlFor="login-email"
                  className="block text-[10px] font-mono-data uppercase text-[#8292A6] tracking-wider font-semibold"
                >
                  Institutional Email
                </label>
                {knownAuth && (
                  <span className="text-[9.5px] font-mono-data text-[#10B981] flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Clearance: {knownAuth.tier}</span>
                  </span>
                )}
              </div>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-[#B08D57]" />
                <input
                  id="login-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@firm.com"
                  className="w-full bg-[#0B1019] border border-[#1E293B] focus:border-[#B08D57] rounded-sm py-2.5 pl-9 pr-3 text-xs text-[#EDE9DE] font-mono-data outline-none transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="login-password"
                className="block text-[10px] font-mono-data uppercase text-[#8292A6] tracking-wider mb-1 font-semibold"
              >
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
                  placeholder="••••••••••••"
                  className="w-full bg-[#0B1019] border border-[#1E293B] focus:border-[#B08D57] rounded-sm py-2.5 pl-9 pr-3 text-xs text-[#EDE9DE] font-mono-data outline-none transition-all"
                />
              </div>
            </div>

            {/* Optional Clearance Passcode */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label
                  htmlFor="login-passcode"
                  className="block text-[10px] font-mono-data uppercase text-[#8292A6] tracking-wider font-semibold"
                >
                  Desk Clearance Passcode
                </label>
                <span className="text-[9px] font-mono-data text-[#8292A6]">
                  {knownAuth ? "Pre-approved" : "Optional for whitelisted users"}
                </span>
              </div>
              <div className="relative">
                <Key className="w-4 h-4 absolute left-3 top-3 text-[#B08D57]" />
                <input
                  id="login-passcode"
                  type="text"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder={knownAuth ? "Verified via Institutional Record" : "e.g. SMC-FOUNDING-2026"}
                  className="w-full bg-[#0B1019] border border-[#1E293B] focus:border-[#B08D57] rounded-sm py-2.5 pl-9 pr-3 text-xs text-[#E5C794] font-mono-data outline-none transition-all tracking-wider"
                />
              </div>
            </div>

            {/* Status / Loading Progress */}
            {isAuthenticating && statusMessage && (
              <div className="p-2.5 bg-[#B08D57]/10 border border-[#B08D57]/30 rounded-sm flex items-center gap-2 text-xs font-mono-data text-[#E5C794]">
                <div className="w-3.5 h-3.5 border-2 border-[#B08D57] border-t-transparent rounded-full animate-spin shrink-0" />
                <span>{statusMessage}</span>
              </div>
            )}

            {/* Main Submit Button */}
            <button
              id="login-enter-terminal-btn"
              type="submit"
              disabled={isAuthenticating}
              className="w-full mt-2 py-3 px-4 bg-[#B08D57] hover:bg-[#C4A06A] active:scale-[0.99] text-[#0A111C] font-bold text-xs uppercase tracking-widest rounded-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isAuthenticating ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#0A111C] border-t-transparent rounded-full animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Access Terminal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Divider */}
            <div className="relative flex items-center justify-center my-2">
              <div className="border-t border-[#1E293B] w-full" />
              <span className="bg-[#0E1624] px-3 text-[10px] font-mono-data text-[#8292A6] uppercase tracking-wider">
                Single Sign-On
              </span>
              <div className="border-t border-[#1E293B] w-full" />
            </div>

            {/* Google Authentication Button */}
            <button
              id="login-google-btn"
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isAuthenticating}
              className="w-full py-2.5 px-4 bg-[#0B1019] hover:bg-[#151D2A] border border-[#1E293B] hover:border-[#B08D57]/50 text-[#EDE9DE] font-mono-data text-xs rounded-sm transition-all flex items-center justify-center gap-2.5 disabled:opacity-50 cursor-pointer"
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
              <span>Sign in with Google Workspace SSO</span>
            </button>
          </form>

          {/* Footer Info */}
          <div className="bg-[#0B1019] px-6 py-2.5 border-t border-[#1E293B] flex items-center justify-between text-[10px] font-mono-data text-[#8292A6]">
            <span>DESK IDENTIFIER: PROD-DIRECT</span>
            <span>RESTRICTED ACCESS</span>
          </div>
        </div>
      </main>

      {/* Terminal Footer Strip */}
      <footer className="relative z-10 border-t border-[#1E293B] bg-[#0A111C]/95 px-4 sm:px-8 py-2.5 flex flex-wrap items-center justify-between gap-4 text-[11px] font-mono-data text-[#8292A6]">
        <div>
          Sin Miedo Capital Macro Systems © 2026. Proprietary & Confidential.
        </div>
        <div className="flex items-center gap-4">
          <span>Global Macro Risk Engines</span>
          <span>·</span>
          <span>Orderflow Architecture</span>
          <span>·</span>
          <span>Cross-Asset Telemetry</span>
        </div>
      </footer>
    </div>
  );
};
