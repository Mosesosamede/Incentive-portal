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
    <div id="login-container" className="min-h-screen bg-[#1A2421] text-[#DAF0DD] flex flex-col justify-between relative overflow-hidden">
      {/* Backdrop Orbs */}
      <div className="absolute top-[-25%] left-[-15%] w-[700px] h-[700px] rounded-full bg-[#00CC88]/5 blur-[150px] pointer-events-none" id="backdrop-orb-top"></div>
      <div className="absolute bottom-[-15%] right-[-10%] w-[700px] h-[700px] rounded-full bg-[#F7F167]/5 blur-[150px] pointer-events-none" id="backdrop-orb-bottom"></div>

      {/* Global Utilities Rail */}
      <div className="w-full bg-[#131b19] border-b border-[#DAF0DD]/10 py-2.5 px-6 flex justify-between items-center text-[11px] font-mono text-[#DAF0DD]/60" id="utilities-rail">
        <div className="flex items-center gap-3" id="network-status-indicator">
          <span>NETWORK: ACTIVE</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#00CC88] animate-pulse"></span>
        </div>
        <div id="clock-display">{currentTime || "SECURE PORTAL"}</div>
      </div>

      {/* Brand Header */}
      <header className="max-w-7xl w-full mx-auto px-6 py-6 flex justify-between items-center z-10" id="brand-header">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#23312C] border border-[#DAF0DD]/20 rounded-xl flex items-center justify-center overflow-hidden shadow-lg shadow-[#00CC88]/5" id="brand-logo">
            <img src="https://i.ibb.co/pjxqNW0p/favicon.png" alt="Deloxe HR Logo" className="w-8 h-8 object-contain" referrerPolicy="no-referrer" />
          </div>
          <div className="flex flex-col">
            <span className="font-display font-bold text-lg tracking-tight bg-gradient-to-r from-[#00CC88] via-white to-[#F7F167] bg-clip-text text-transparent" id="brand-name">
              DELOXE HR
            </span>
            <span className="text-[9px] font-mono tracking-widest text-[#DAF0DD]/60" id="brand-tagline">PARTNER PORTAL</span>
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
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#00CC88]/5 border border-[#00CC88]/15 rounded-full text-[11px] font-mono font-medium text-[#00CC88] mb-6" id="incentive-badge">
              <Sparkles className="w-3.5 h-3.5" />
              Talent Incentive Hub
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-extrabold tracking-tight text-white mb-6 leading-[1.1]" id="hero-title">
              Referral Incentive Portal <br />
              <span className="bg-gradient-to-r from-[#00CC88] via-white to-[#F7F167] bg-clip-text text-transparent">
                Incentives on Autopilot.
              </span>
            </h1>
            <p className="text-[#DAF0DD]/80 text-base leading-relaxed mb-8" id="hero-desc">
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
            <div className="p-4 rounded-xl bg-[#23312C]/40 border border-[#DAF0DD]/10 backdrop-blur" id="bento-referral">
              <Globe className="w-5 h-5 text-[#F7F167] mb-2" />
              <h3 className="font-semibold text-[#DAF0DD] text-sm font-display">Alphanumeric Codes</h3>
              <p className="text-xs text-[#DAF0DD]/70 mt-1">Get instant uppercase referral tags and structured tracking parameters upon sign up.</p>
            </div>
            <div className="p-4 rounded-xl bg-[#23312C]/40 border border-[#DAF0DD]/10 backdrop-blur" id="bento-rates">
              <Award className="w-5 h-5 text-[#00CC88] mb-2" />
              <h3 className="font-semibold text-[#DAF0DD] text-sm font-display">Standardized Rate Tiers</h3>
              <p className="text-xs text-[#DAF0DD]/70 mt-1">Earn highly structured base rewards tailored automatically based on your selected partner tier.</p>
            </div>
          </motion.div>
        </div>

        {/* Secure Entry Card */}
        <motion.div
          className="w-full max-w-md p-8 rounded-2xl bg-[#23312C]/60 border border-[#DAF0DD]/15 backdrop-blur-xl shadow-2xl relative"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          id="entry-card-container"
        >
          <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-[#00CC88]/5 rounded-full blur-[40px] pointer-events-none" id="entry-glow-orb"></div>
          
          <h2 className="text-2xl font-bold font-display text-white mb-2" id="entry-title">Access Portal</h2>
          <p className="text-[#DAF0DD]/80 text-sm mb-6" id="entry-desc">Sign in securely with your Google Credentials or Email to proceed to onboarding or your active workspace.</p>

          {/* Tab switch for Auth Method */}
          <div className="flex bg-[#131b19] p-1 rounded-xl border border-[#DAF0DD]/10 mb-6" id="auth-method-tabs">
            <button
              type="button"
              id="auth-method-google-btn"
              onClick={() => setAuthMethod("google")}
              className={`flex-1 py-2 text-xs font-mono font-bold rounded-lg transition-all cursor-pointer ${
                authMethod === "google" 
                  ? "bg-[#00CC88]/15 text-[#00CC88] border border-[#00CC88]/20" 
                  : "text-[#DAF0DD]/60 hover:text-[#DAF0DD] border border-transparent"
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
                  ? "bg-[#00CC88]/15 text-[#00CC88] border border-[#00CC88]/20" 
                  : "text-[#DAF0DD]/60 hover:text-[#DAF0DD] border border-transparent"
              }`}
            >
              EMAIL & PASSWORD
            </button>
          </div>

          {authMethod === "google" ? (
            <button
              id="google-login-btn"
              onClick={handleLogin}
              className="w-full flex items-center justify-center gap-3 bg-white text-[#1A2421] font-sans font-bold py-3.5 px-5 rounded-xl hover:bg-[#DAF0DD] transition-all duration-200 active:scale-[0.98] shadow-lg shadow-white/5 cursor-pointer"
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
                      ? "border-[#00CC88] text-[#00CC88] font-bold"
                      : "border-transparent text-[#DAF0DD]/50 hover:text-[#DAF0DD]/80"
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
                      ? "border-[#00CC88] text-[#00CC88] font-bold"
                      : "border-transparent text-[#DAF0DD]/50 hover:text-[#DAF0DD]/80"
                  }`}
                >
                  CREATE ACCOUNT
                </button>
              </div>

              <div id="email-input-group">
                <label className="block text-[#DAF0DD]/70 text-xs font-mono mb-1.5 uppercase tracking-wider">
                  Email Address
                </label>
                <input
                  type="email"
                  id="auth-email-input"
                  required
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full bg-[#131b19] border border-[#DAF0DD]/20 rounded-xl px-4 py-3 text-[#DAF0DD] text-sm focus:outline-none focus:border-[#00CC88]/50 transition-colors font-sans"
                />
              </div>

              <div id="password-input-group">
                <label className="block text-[#DAF0DD]/70 text-xs font-mono mb-1.5 uppercase tracking-wider">
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
                    className="w-full bg-[#131b19] border border-[#DAF0DD]/20 rounded-xl pl-4 pr-11 py-3 text-[#DAF0DD] text-sm focus:outline-none focus:border-[#00CC88]/50 transition-colors font-mono"
                  />
                  <button
                    type="button"
                    id="toggle-auth-password-visibility-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#DAF0DD]/60 hover:text-[#DAF0DD] focus:outline-none p-1 cursor-pointer"
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
                className="w-full flex items-center justify-center gap-2 bg-[#00CC88] hover:bg-[#00CC88]/90 text-[#1A2421] font-sans font-bold py-3.5 px-5 rounded-xl transition-all duration-200 active:scale-[0.98] shadow-lg shadow-[#00CC88]/15 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-[#1A2421] border-t-transparent rounded-full animate-spin"></span>
                ) : authEmailMode === "signin" ? (
                  "Secure Account Login"
                ) : (
                  "Create Referral Incentive Account"
                )}
              </button>
            </form>
          )}

          {/* Security Notice */}
          <div className="mt-8 pt-6 border-t border-[#DAF0DD]/10 flex items-start gap-3 text-[#DAF0DD]/50 text-[11px] leading-relaxed font-mono" id="security-notice">
            <Shield className="w-4.5 h-4.5 text-[#F7F167]/80 shrink-0 mt-0.5" />
            <span>
              Enterprise security strictly enforced. This application operates under client-restricted Firestore Rules to secure financial ledgers.
            </span>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl w-full mx-auto px-6 py-6 text-center text-[#DAF0DD]/40 text-xs font-mono border-t border-slate-900/60 z-10" id="login-footer">
        © {new Date().getFullYear()} Deloxe Inc. All privileges protected. Unified Referral Incentive Registry.
      </footer>
    </div>
  );
}
