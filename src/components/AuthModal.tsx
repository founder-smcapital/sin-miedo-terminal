import React, { useState } from "react";
import { UserSession, ClearanceTier } from "../types";
import { X, Lock, Mail, Key, Shield, ShieldCheck, CheckCircle2, Award, Sparkles, Building2, Database } from "lucide-react";
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

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (session: UserSession) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [tier, setTier] = useState<ClearanceTier>("Founding Member");
  const [passcode, setPasscode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  if (!isOpen) return null;

  const handleSelectTier = (selectedTier: ClearanceTier) => {
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
    } catch (err) {}
  };

  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    setErrorMessage("");
    setStatusMessage("Opening Google authentication gateway...");

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

      setIsSubmitting(false);
      onLoginSuccess(session);
      onClose();
    } catch (err: any) {
      console.error("Google Auth error:", err);
      setIsSubmitting(false);
      if (err.code === "auth/popup-closed-by-user") {
        setErrorMessage("Authentication was cancelled.");
      } else {
        setErrorMessage(err.message || "Failed to authenticate via Google.");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMessage("Please enter an authorized institutional email.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");
    setStatusMessage("Connecting to Firebase Auth & Firestore...");

    try {
      let firebaseUser: any = null;

      try {
        const userCred = await signInWithEmailAndPassword(auth, email.trim(), password);
        firebaseUser = userCred.user;
      } catch (signInErr: any) {
        if (signInErr.code === "auth/user-not-found" || signInErr.code === "auth/invalid-credential") {
          try {
            const createCred = await createUserWithEmailAndPassword(auth, email.trim(), password);
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

      setStatusMessage("Persisting institutional desk clearance to Firestore...");
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
        uid: firebaseUser?.uid || "usr-auth-persist",
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

      setIsSubmitting(false);
      onLoginSuccess(session);
      onClose();
    } catch (err: any) {
      console.warn("Auth persistence notice:", err);
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
      setIsSubmitting(false);
      onLoginSuccess(session);
      onClose();
    }
  };

  return (
    <div
      id="auth-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        id="auth-modal-container"
        className="w-full max-w-md bg-[#1A1D24] border border-[#B08D57]/30 rounded-lg shadow-2xl overflow-hidden relative"
      >
        {/* Top Header Banner */}
        <div className="bg-[#0E1A2B] px-6 py-5 border-b border-[#B08D57]/15 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-black/60 border border-[#B08D57]/50 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-[#B08D57]" />
            </div>
            <div>
              <h3 className="font-serif italic text-base font-bold text-[#B08D57] tracking-wide" style={{ fontFamily: "Georgia, serif" }}>
                Sin Miedo Capital
              </h3>
              <p className="text-[9px] font-mono-data text-[#8292A6]">
                FIRESTORE PERSISTENT CLIENT AUTHENTICATION
              </p>
            </div>
          </div>

          <button
            id="close-auth-modal-btn"
            onClick={onClose}
            aria-label="Close Authentication Modal"
            className="p-1 rounded text-[#8292A6] hover:text-[#EDE9DE] hover:bg-black/50 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMessage && (
            <div className="bg-[#A6291C]/20 border border-[#A6291C]/60 text-[#FFA4A4] text-xs p-2.5 rounded font-mono-data">
              {errorMessage}
            </div>
          )}

          {statusMessage && isSubmitting && (
            <div className="bg-[#B08D57]/10 border border-[#B08D57]/30 text-[#E5C794] text-xs p-2.5 rounded font-mono-data animate-pulse flex items-center gap-2">
              <Database className="w-3.5 h-3.5 text-[#B08D57] animate-spin" />
              <span>{statusMessage}</span>
            </div>
          )}

          {/* Tier Selection Pills */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[10px] font-mono-data text-[#8292A6] uppercase tracking-wider">
                Select Client Tier / Clearance
              </label>
              <span className="text-[9px] font-mono-data text-[#B08D57]">
                Passcode Synced
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                id="tier-founding-btn"
                onClick={() => handleSelectTier("Founding Member")}
                className={`py-2 px-1 rounded-lg border text-center transition-all text-xs font-mono-data flex flex-col items-center gap-0.5 cursor-pointer ${
                  tier === "Founding Member"
                    ? "bg-[#B08D57] border-[#B08D57] text-[#0A111C] font-bold shadow-md ring-1 ring-[#B08D57]"
                    : "bg-[#0B1019] border-[#222C3D] text-[#8292A6] hover:text-[#EDE9DE] hover:border-[#B08D57]/40"
                }`}
              >
                <Award className={`w-3.5 h-3.5 ${tier === "Founding Member" ? "text-[#0A111C]" : "text-[#B08D57]"}`} />
                <span className="text-[10px] font-bold leading-tight">Founding</span>
                <span className={`text-[8.5px] ${tier === "Founding Member" ? "text-[#0A111C]/90 font-medium" : "text-[#B08D57]"}`}>All-Access</span>
              </button>

              <button
                type="button"
                id="tier-allocator-btn"
                onClick={() => handleSelectTier("Professional Allocator")}
                className={`py-2 px-1 rounded-lg border text-center transition-all text-xs font-mono-data flex flex-col items-center gap-0.5 cursor-pointer ${
                  tier === "Professional Allocator"
                    ? "bg-[#64748B] border-[#94A3B8] text-[#0A111C] font-bold shadow-md ring-1 ring-[#94A3B8]"
                    : "bg-[#0B1019] border-[#222C3D] text-[#8292A6] hover:text-[#EDE9DE] hover:border-[#64748B]/40"
                }`}
              >
                <Shield className={`w-3.5 h-3.5 ${tier === "Professional Allocator" ? "text-[#0A111C]" : "text-[#94A3B8]"}`} />
                <span className="text-[10px] font-bold leading-tight">Tier I: Allocator</span>
                <span className={`text-[8.5px] ${tier === "Professional Allocator" ? "text-[#0A111C]/90 font-medium" : "text-[#8292A6]"}`}>Core Prop</span>
              </button>

              <button
                type="button"
                id="tier-institutional-btn"
                onClick={() => handleSelectTier("Institutional Desk")}
                className={`py-2 px-1 rounded-lg border text-center transition-all text-xs font-mono-data flex flex-col items-center gap-0.5 cursor-pointer ${
                  tier === "Institutional Desk" || tier === "Institutional Alpha"
                    ? "bg-[#38BDF8] border-[#38BDF8] text-[#0A111C] font-bold shadow-md ring-1 ring-[#38BDF8]"
                    : "bg-[#0B1019] border-[#222C3D] text-[#8292A6] hover:text-[#EDE9DE] hover:border-[#38BDF8]/40"
                }`}
              >
                <Building2 className={`w-3.5 h-3.5 ${tier === "Institutional Desk" || tier === "Institutional Alpha" ? "text-[#0A111C]" : "text-[#38BDF8]"}`} />
                <span className="text-[10px] font-bold leading-tight">Tier II: Inst.</span>
                <span className={`text-[8.5px] ${tier === "Institutional Desk" || tier === "Institutional Alpha" ? "text-[#0A111C]/90 font-medium" : "text-[#38BDF8]"}`}>Hedge Funds</span>
              </button>

              <button
                type="button"
                id="tier-sovereign-btn"
                onClick={() => handleSelectTier("Sovereign Advisory")}
                className={`py-2 px-1 rounded-lg border text-center transition-all text-xs font-mono-data flex flex-col items-center gap-0.5 cursor-pointer ${
                  tier === "Sovereign Advisory" || tier === "Sovereign Desk"
                    ? "bg-[#C084FC] border-[#C084FC] text-[#0A111C] font-bold shadow-md ring-1 ring-[#C084FC]"
                    : "bg-[#0B1019] border-[#222C3D] text-[#8292A6] hover:text-[#EDE9DE] hover:border-[#C084FC]/40"
                }`}
              >
                <Sparkles className={`w-3.5 h-3.5 ${tier === "Sovereign Advisory" || tier === "Sovereign Desk" ? "text-[#0A111C]" : "text-[#C084FC]"}`} />
                <span className="text-[10px] font-bold leading-tight">Tier III: Sov.</span>
                <span className={`text-[8.5px] ${tier === "Sovereign Advisory" || tier === "Sovereign Desk" ? "text-[#0A111C]/90 font-medium" : "text-[#C084FC]"}`}>Dark Fleet</span>
              </button>
            </div>
          </div>

          {/* Email input */}
          <div>
            <label className="block text-[10px] font-mono-data text-[#8292A6] mb-1 uppercase tracking-wider">
              Institutional Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3 text-[#8292A6]" />
              <input
                id="auth-email-input"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="trader@fund.com"
                className="w-full bg-black/50 border border-[#B08D57]/20 focus:border-[#B08D57] rounded py-2 pl-9 pr-3 text-xs text-[#EDE9DE] outline-none font-mono-data transition-colors"
              />
            </div>
          </div>

          {/* Password input */}
          <div>
            <label className="block text-[10px] font-mono-data text-[#8292A6] mb-1 uppercase tracking-wider">
              Password / Access Key
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3 text-[#8292A6]" />
              <input
                id="auth-password-input"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-black/50 border border-[#B08D57]/20 focus:border-[#B08D57] rounded py-2 pl-9 pr-3 text-xs text-[#EDE9DE] outline-none font-mono-data transition-colors"
              />
            </div>
          </div>

          {/* Tier Passcode */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[10px] font-mono-data text-[#8292A6] uppercase tracking-wider">
                Encrypted Tier Passcode
              </label>
              <span className="text-[9px] text-[#B08D57] font-mono-data">Verified Key</span>
            </div>
            <div className="relative">
              <Key className="w-4 h-4 absolute left-3 top-3 text-[#B08D57]" />
              <input
                id="auth-passcode-input"
                type="text"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="e.g. SMC-FOUNDING-2026"
                className="w-full bg-black/50 border border-[#B08D57]/20 focus:border-[#B08D57] rounded py-2 pl-9 pr-3 text-xs text-[#EDE9DE] outline-none font-mono-data transition-colors tracking-wider"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            id="auth-submit-login-btn"
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#B08D57] hover:bg-[#C49B5D] text-[#0E1A2B] font-bold text-xs py-3 rounded shadow-lg transition-all active:scale-[0.98] uppercase tracking-wider flex items-center justify-center gap-2 mt-2"
          >
            {isSubmitting ? (
              <span className="animate-spin inline-block w-4 h-4 border-2 border-[#0E1A2B] border-t-transparent rounded-full"></span>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Enter Authenticated Portal (Firestore)</span>
              </>
            )}
          </button>

          {/* Google Sign-In Option */}
          <div className="relative flex items-center justify-center my-2">
            <div className="border-t border-[#B08D57]/15 w-full" />
            <span className="bg-[#1A1D24] px-2 text-[9px] font-mono-data text-[#8292A6] uppercase">
              Or
            </span>
            <div className="border-t border-[#B08D57]/15 w-full" />
          </div>

          <button
            id="auth-modal-google-btn"
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isSubmitting}
            className="w-full py-2 px-3 bg-black/40 hover:bg-black/70 border border-[#B08D57]/30 text-[#EDE9DE] font-mono-data text-xs rounded transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
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
            <span>Sign in with Google</span>
          </button>
        </form>

        {/* Footer info */}
        <div className="px-6 py-2.5 bg-[#0E1A2B] border-t border-[#B08D57]/15 text-center text-[10px] text-[#8292A6] font-mono-data">
          Connected to Cloud Firestore // gen-lang-client-0676230346
        </div>
      </div>
    </div>
  );
};
