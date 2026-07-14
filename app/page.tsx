"use client";

import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Grid, 
  DollarSign, 
  CreditCard, 
  Bell, 
  Settings, 
  LogOut 
} from "lucide-react";

import { usePartner } from "@/hooks/usePartner";
import LoadingScreen from "@/components/LoadingScreen";
import LoginGate from "@/components/LoginGate";
import OnboardingWizard from "@/components/OnboardingWizard";
import DashboardTab from "@/components/DashboardTab";
import CommissionsTab from "@/components/CommissionsTab";
import PayoutsTab from "@/components/PayoutsTab";
import NotificationsTab from "@/components/NotificationsTab";
import SettingsTab from "@/components/SettingsTab";

export default function Home() {
  const {
    user,
    partner,
    stats,
    commissions,
    payouts,
    notifications,
    loading,
    authChecking,
    dbLoading,
    onboardingStep,
    onboardingError,
    existingAccountError,
    submittingOnboarding,
    isCopied,
    authEmail,
    authPassword,
    authMethod,
    authEmailMode,
    authEmailError,
    showPassword,
    currentTime,
    activeTab,
    obForm,
    editForm,
    editLoading,
    editError,
    editSuccess,
    currencySymbol,
    setAuthMethod,
    setAuthEmailMode,
    setAuthEmail,
    setAuthPassword,
    setShowPassword,
    setAuthEmailError,
    setObForm,
    setEditForm,
    setOnboardingStep,
    setOnboardingError,
    setActiveTab,
    handleLogin,
    handleEmailAuth,
    handleLogout,
    handleOnboardingSubmit,
    handleProfileUpdate,
    handleToggleRead,
    handleCopy
  } = usePartner();

  // Loading indicator for authentication layer checkup
  if (authChecking || loading) {
    return <LoadingScreen />;
  }

  // Pre-authentication Welcome Screen & Secure Gate
  if (!user) {
    return (
      <LoginGate
        currentTime={currentTime}
        authMethod={authMethod}
        authEmailMode={authEmailMode}
        authEmail={authEmail}
        authPassword={authPassword}
        showPassword={showPassword}
        authEmailError={authEmailError}
        loading={loading}
        setAuthMethod={setAuthMethod}
        setAuthEmailMode={setAuthEmailMode}
        setAuthEmail={setAuthEmail}
        setAuthPassword={setAuthPassword}
        setShowPassword={setShowPassword}
        setAuthEmailError={setAuthEmailError}
        handleLogin={handleLogin}
        handleEmailAuth={handleEmailAuth}
      />
    );
  }

  // Partner Multi-step Onboarding (triggers if no profile is in database)
  if (!partner) {
    return (
      <OnboardingWizard
        onboardingStep={onboardingStep}
        onboardingError={onboardingError}
        existingAccountError={existingAccountError}
        submittingOnboarding={submittingOnboarding}
        obForm={obForm}
        currentTime={currentTime}
        setObForm={setObForm}
        setOnboardingStep={setOnboardingStep}
        setOnboardingError={setOnboardingError}
        handleLogout={handleLogout}
        handleOnboardingSubmit={handleOnboardingSubmit}
      />
    );
  }

  // Active Partner Dashboard Interface
  return (
    <div id="dashboard-root" className="min-h-screen bg-[#030712] text-slate-100 flex flex-col justify-between font-sans selection:bg-amber-500/20 selection:text-amber-300">
      
      {/* Real-time System Rail */}
      <div className="w-full bg-[#080d1a] border-b border-slate-900/60 py-2.5 px-6 flex justify-between items-center text-[10px] font-mono text-slate-500 z-10" id="live-system-rail">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>DELOXE STATE: SYNCHRONIZED</span>
          </div>
          <span className="text-slate-700">|</span>
          <div>REFERRAL INCENTIVE ID: <span className="text-slate-400 font-bold">{partner.partnerDisplayId || ("DELXp" + partner.partnerId.slice(0, 4).toUpperCase())}</span></div>
          <span className="text-slate-700">|</span>
          <div className="hidden sm:inline">REWARD_RATE: <span className="text-amber-500 font-bold">{currencySymbol}{partner.rewardRate.toLocaleString()} / milestone</span></div>
        </div>
        
        {/* Dynamic ticking clock */}
        <div className="flex items-center gap-2">
          <span>{currentTime || "UTC CLOCK"}</span>
        </div>
      </div>

      {/* Header Panel */}
      <header className="bg-slate-900/40 border-b border-slate-800/80 sticky top-0 z-30 backdrop-blur-xl" id="portal-header">
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
          
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-slate-950 border border-amber-500/20 rounded-lg flex items-center justify-center overflow-hidden shadow-lg shadow-amber-500/5">
              <img src="https://i.ibb.co/pjxqNW0p/favicon.png" alt="Deloxe HR Logo" className="w-7 h-7 object-contain" referrerPolicy="no-referrer" />
            </div>
            <div className="flex flex-col">
              <span className="font-display font-extrabold text-base tracking-tight text-white leading-none">
                DELOXE HR
              </span>
              <span className="text-[9px] font-mono tracking-widest text-slate-500 mt-1">REFERRAL INCENTIVE HUB v1.2</span>
            </div>
          </div>

          {/* Nav / View Toggle */}
          <nav className="hidden md:flex items-center gap-1 bg-[#080d1a] border border-slate-800/80 rounded-xl p-1" id="desktop-nav">
            {[
              { id: "dashboard", label: "Overview", icon: Grid },
              { id: "commissions", label: "Commissions", icon: DollarSign },
              { id: "payouts", label: "Payouts Ledger", icon: CreditCard },
              { id: "notifications", label: "Alerts", icon: Bell, count: notifications.filter(n => !n.read).length },
              { id: "settings", label: "Settings", icon: Settings }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                    activeTab === tab.id
                      ? "bg-slate-900 text-amber-400 border border-slate-800/80 shadow-md"
                      : "text-slate-400 hover:text-slate-100"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* User Widget */}
          <div className="flex items-center gap-4" id="header-user-widget">
            <div className="flex items-center gap-3 pl-3 border-l border-slate-800/60">
              <div className="flex flex-col items-end text-right hidden sm:flex">
                <span className="text-xs font-bold text-slate-100 leading-none">{partner.fullName}</span>
                <span className="text-[9px] font-mono text-slate-500 mt-1 uppercase tracking-wider">
                  {partner.partnerType === "corporate" ? "Corporate Entity" : "Individual Referral"}
                </span>
              </div>
              <div className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center text-xs font-mono font-bold text-slate-400 uppercase">
                {partner.fullName[0]}
              </div>
              <button
                id="logout-btn"
                onClick={handleLogout}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-900 transition-all cursor-pointer"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav Rail */}
        <div className="md:hidden w-full bg-[#080d1a] border-t border-slate-800/60 p-1 px-4 flex justify-between" id="mobile-nav-rail">
          {[
            { id: "dashboard", label: "Overview", icon: Grid },
            { id: "commissions", label: "Commissions", icon: DollarSign },
            { id: "payouts", label: "Payouts", icon: CreditCard },
            { id: "notifications", label: "Alerts", icon: Bell },
            { id: "settings", label: "Settings", icon: Settings }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-3 text-[10px] font-semibold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                  activeTab === tab.id ? "text-amber-400 font-bold" : "text-slate-500"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Dashboard Container */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 flex-grow" id="main-content">
        
        {/* Dashboard Title & Quick Status */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8" id="title-status-section">
          <div>
            <h1 className="text-2xl font-display font-extrabold text-white tracking-tight">
              {activeTab === "dashboard" && "Workspace Hub"}
              {activeTab === "commissions" && "Conversion Records"}
              {activeTab === "payouts" && "Historic Distribution Ledgers"}
              {activeTab === "notifications" && "Operational Alerts"}
              {activeTab === "settings" && "Profile Configuration"}
            </h1>
            <p className="text-slate-400 text-xs mt-1 font-mono">
              STATUS: <span className="text-emerald-400 font-bold uppercase">{partner.status}</span>
              <span className="mx-2 text-slate-700">|</span>
              CODE: <span className="text-amber-400 font-bold">{partner.referralCode}</span>
            </p>
          </div>
        </div>

        {/* Dynamic Views Rendering with Animation Transitions */}
        <AnimatePresence mode="wait">
          {activeTab === "dashboard" && (
            <DashboardTab
              partner={partner}
              stats={stats}
              commissions={commissions}
              dbLoading={dbLoading}
              currencySymbol={currencySymbol}
              isCopied={isCopied}
              handleCopy={handleCopy}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === "commissions" && (
            <CommissionsTab
              commissions={commissions}
              dbLoading={dbLoading}
              currencySymbol={currencySymbol}
            />
          )}

          {activeTab === "payouts" && (
            <PayoutsTab
              payouts={payouts}
              dbLoading={dbLoading}
              currencySymbol={currencySymbol}
            />
          )}

          {activeTab === "notifications" && (
            <NotificationsTab
              notifications={notifications}
              dbLoading={dbLoading}
              handleToggleRead={handleToggleRead}
            />
          )}

          {activeTab === "settings" && (
            <SettingsTab
              partner={partner}
              editForm={editForm}
              setEditForm={setEditForm}
              editLoading={editLoading}
              editError={editError}
              editSuccess={editSuccess}
              currencySymbol={currencySymbol}
              handleProfileUpdate={handleProfileUpdate}
            />
          )}
        </AnimatePresence>

      </main>

      {/* FOOTER */}
      <footer className="bg-slate-950 text-slate-600 py-6 text-center text-xs font-mono border-t border-slate-900/60 mt-16 z-10" id="portal-footer">
        <div className="max-w-7xl w-full mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <span>© {new Date().getFullYear()} Deloxe Inc. Unified Referral Incentive Security Registry.</span>
          <span>Secured via Deloxe Private Ledger & Cryptographic Protocol.</span>
        </div>
      </footer>
    </div>
  );
}
