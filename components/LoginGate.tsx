"use client";

import React from "react";
import { motion } from "motion/react";
import { 
  Sparkles, 
  Globe, 
  Award, 
  EyeOff, 
  Eye, 
  AlertCircle, 
  Shield 
} from "lucide-react";

interface LoginGateProps {
  currentTime: string;
  authMethod: "google" | "email";
  authEmailMode: "signin" | "signup";
  authEmail: string;
  authPassword: string;
  showPassword: boolean;
  authEmailError: string;
  loading: boolean;
  setAuthMethod: (method: "google" | "email") => void;
  setAuthEmailMode: (mode: "signin" | "signup") => void;
  setAuthEmail: (email: string) => void;
  setAuthPassword: (password: string) => void;
  setShowPassword: (show: boolean) => void;
  setAuthEmailError: (err: string) => void;
  handleLogin: () => Promise<void>;
  handleEmailAuth: (e: React.FormEvent) => Promise<void>;
}

export default function LoginGate({
  currentTime,
  authMethod,
  authEmailMode,
  authEmail,
  authPassword,
  showPassword,
  authEmailError,
  loading,
  setAuthMethod,
  setAuthEmailMode,
  setAuthEmail,
  setAuthPassword,
  setShowPassword,
  setAuthEmailError,
  handleLogin,
  handleEmailAuth
}: LoginGateProps) {
  return (
    <div id="login-container" className="min-h-screen bg-[#030712] text-slate-100 flex flex-col justify-between relative overflow-hidden">
      {/* Backdrop Orbs */}
      <div className="absolute top-[-25%] left-[-15%] w-[700px] h-[700px] rounded-full bg-amber-500/5 blur-[150px] pointer-events-none" id="backdrop-orb-top"></div>
      <div className="absolute bottom-[-15%] right-[-10%] w-[700px] h-[700px] rounded-full bg-emerald-500/5 blur-[150px] pointer-events-none" id="backdrop-orb-bottom"></div>

      {/* Global Utilities Rail */}
      <div className="w-full bg-[#080d1a] border-b border-slate-900/60 py-2.5 px-6 flex justify-between items-center text-[11px] font-mono text-slate-500" id="utilities-rail">
        <div className="flex items-center gap-3" id="network-status-indicator">
          <span>NETWORK: ACTIVE</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
        </div>
        <div id="clock-display">{currentTime || "SECURE PORTAL"}</div>
      </div>

      {/* Brand Header */}
      <header className="max-w-7xl w-full mx-auto px-6 py-6 flex justify-between items-center z-10" id="brand-header">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-900 border border-amber-500/20 rounded-xl flex items-center justify-center font-mono font-bold text-amber-400 text-lg shadow-lg shadow-amber-500/10" id="brand-logo">
            DX
          </div>
          <div className="flex flex-col">
            <span className="font-display font-bold text-lg tracking-tight bg-gradient-to-r from-amber-400 to-slate-100 bg-clip-text text-transparent" id="brand-name">
              DELOXE HR
            </span>
            <span className="text-[9px] font-mono tracking-widest text-slate-500" id="brand-tagline">PARTNER PORTAL</span>
          </div>
        </div>
      </header>

      {/* Hero Area */}
      <main className="max-w-7xl w-full mx-auto px-6 flex flex-col lg:flex-row items-center justify-center gap-16 py-12 z-10 flex-grow" id="hero-section">
        <div className="max-w-xl text-left" id="hero-info">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            id="hero-animation-wrapper"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/5 border border-amber-500/10 rounded-full text-[11px] font-mono font-medium text-amber-400 mb-6" id="incentive-badge">
              <Sparkles className="w-3.5 h-3.5" />
              Talent Incentive Hub
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-extrabold tracking-tight text-white mb-6 leading-[1.1]" id="hero-title">
              Referral Incentive Portal <br />
              <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-emerald-400 bg-clip-text text-transparent">
                Incentives on Autopilot.
              </span>
            </h1>
            <p className="text-slate-400 text-base leading-relaxed mb-8" id="hero-desc">
              Integrate directly with Deloxe’s official HR incentive infrastructure. Distribute your unique link, monitor live conversion traffic, track earned commissions, and secure reliable automated payouts.
            </p>
          </motion.div>

          {/* Structured Features bento */}
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            id="features-bento"
          >
            <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/40 backdrop-blur" id="bento-referral">
              <Globe className="w-5 h-5 text-amber-400 mb-2" />
              <h3 className="font-semibold text-slate-200 text-sm font-display">Alphanumeric Codes</h3>
              <p className="text-xs text-slate-400 mt-1">Get instant uppercase referral tags and structured tracking parameters upon sign up.</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/40 backdrop-blur" id="bento-rates">
              <Award className="w-5 h-5 text-emerald-400 mb-2" />
              <h3 className="font-semibold text-slate-200 text-sm font-display">Standardized Rate Tiers</h3>
              <p className="text-xs text-slate-400 mt-1">Earn highly structured base rewards tailored automatically: Individual (₦200) vs Corporate (₦500).</p>
            </div>
          </motion.div>
        </div>

        {/* Secure Entry Card */}
        <motion.div
          className="w-full max-w-md p-8 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl shadow-2xl relative"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          id="entry-card-container"
        >
          <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-amber-500/5 rounded-full blur-[40px] pointer-events-none" id="entry-glow-orb"></div>
          
          <h2 className="text-2xl font-bold font-display text-white mb-2" id="entry-title">Access Portal</h2>
          <p className="text-slate-400 text-sm mb-6" id="entry-desc">Sign in securely with your Google Credentials or Email to proceed to onboarding or your active workspace.</p>

          {/* Tab switch for Auth Method */}
          <div className="flex bg-[#050914] p-1 rounded-xl border border-slate-800/80 mb-6" id="auth-method-tabs">
            <button
              type="button"
              id="auth-method-google-btn"
              onClick={() => setAuthMethod("google")}
              className={`flex-1 py-2 text-xs font-mono font-bold rounded-lg transition-all cursor-pointer ${
                authMethod === "google" 
                  ? "bg-amber-500/15 text-amber-400 border border-amber-500/20" 
                  : "text-slate-400 hover:text-slate-200 border border-transparent"
              }`}
            >
              GOOGLE ACCOUNT
            </button>
            <button
              type="button"
              id="auth-method-email-btn"
              onClick={() => setAuthMethod("email")}
              className={`flex-1 py-2 text-xs font-mono font-bold rounded-lg transition-all cursor-pointer ${
                authMethod === "email" 
                  ? "bg-amber-500/15 text-amber-400 border border-amber-500/20" 
                  : "text-slate-400 hover:text-slate-200 border border-transparent"
              }`}
            >
              EMAIL & PASSWORD
            </button>
          </div>

          {authMethod === "google" ? (
            <button
              id="google-login-btn"
              onClick={handleLogin}
              className="w-full flex items-center justify-center gap-3 bg-white text-slate-950 font-sans font-bold py-3.5 px-5 rounded-xl hover:bg-slate-100 transition-all duration-200 active:scale-[0.98] shadow-lg shadow-white/5 cursor-pointer"
            >
              <svg className="w-5.5 h-5.5" viewBox="0 0 24 24" id="google-svg">
                <path
                  fill="#EA4335"
                  d="M12.24 10.285V14.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.866-3.577-7.866-8s3.536-8 7.866-8c2.46 0 4.105 1.025 5.047 1.926l3.247-3.135C18.428 1.152 15.534 0 12.24 0c-6.63 0-12 5.37-12 12s5.37 12 12 12c6.93 0 11.52-4.877 11.52-11.725 0-.788-.085-1.39-.188-1.99H12.24z"
                />
              </svg>
              Google Account Gateway
            </button>
          ) : (
            <form onSubmit={handleEmailAuth} className="space-y-4" id="email-auth-form">
              {/* Mode toggle (Sign In vs Sign Up) */}
              <div className="flex justify-end gap-4 text-xs font-mono mb-2" id="auth-mode-container">
                <button
                  type="button"
                  id="auth-mode-signin-btn"
                  onClick={() => {
                    setAuthEmailMode("signin");
                    setAuthEmailError("");
                  }}
                  className={`pb-1 border-b transition-all cursor-pointer ${
                    authEmailMode === "signin"
                      ? "border-amber-500 text-amber-400 font-bold"
                      : "border-transparent text-slate-500 hover:text-slate-300"
                  }`}
                >
                  SIGN IN
                </button>
                <button
                  type="button"
                  id="auth-mode-signup-btn"
                  onClick={() => {
                    setAuthEmailMode("signup");
                    setAuthEmailError("");
                  }}
                  className={`pb-1 border-b transition-all cursor-pointer ${
                    authEmailMode === "signup"
                      ? "border-amber-500 text-amber-400 font-bold"
                      : "border-transparent text-slate-500 hover:text-slate-300"
                  }`}
                >
                  CREATE ACCOUNT
                </button>
              </div>

              <div id="email-input-group">
                <label className="block text-slate-400 text-xs font-mono mb-1.5 uppercase tracking-wider">
                  Email Address
                </label>
                <input
                  type="email"
                  id="auth-email-input"
                  required
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full bg-[#050914] border border-slate-800 rounded-xl px-4 py-3 text-slate-100 text-sm focus:outline-none focus:border-amber-500/50 transition-colors font-sans"
                />
              </div>

              <div id="password-input-group">
                <label className="block text-slate-400 text-xs font-mono mb-1.5 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="auth-password-input"
                    required
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#050914] border border-slate-800 rounded-xl pl-4 pr-11 py-3 text-slate-100 text-sm focus:outline-none focus:border-amber-500/50 transition-colors font-mono"
                  />
                  <button
                    type="button"
                    id="toggle-auth-password-visibility-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 focus:outline-none p-1 cursor-pointer"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {authEmailError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-2.5 text-xs text-red-400 font-sans" id="auth-error-display">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{authEmailError}</span>
                </div>
              )}

              <button
                type="submit"
                id="email-auth-submit-btn"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-sans font-bold py-3.5 px-5 rounded-xl hover:from-amber-400 hover:to-amber-500 transition-all duration-200 active:scale-[0.98] shadow-lg shadow-amber-500/15 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                ) : authEmailMode === "signin" ? (
                  "Secure Account Login"
                ) : (
                  "Create Referral Incentive Account"
                )}
              </button>
            </form>
          )}

          {/* Security Notice */}
          <div className="mt-8 pt-6 border-t border-slate-800/80 flex items-start gap-3 text-slate-500 text-[11px] leading-relaxed font-mono" id="security-notice">
            <Shield className="w-4.5 h-4.5 text-amber-500/70 shrink-0 mt-0.5" />
            <span>
              Enterprise security strictly enforced. This application operates under client-restricted Firestore Rules to secure financial ledgers.
            </span>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl w-full mx-auto px-6 py-6 text-center text-slate-600 text-xs font-mono border-t border-slate-900/60 z-10" id="login-footer">
        © {new Date().getFullYear()} Deloxe Inc. All privileges protected. Unified Referral Incentive Registry.
      </footer>
    </div>
  );
}
