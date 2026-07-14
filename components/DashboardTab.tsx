"use client";

import React from "react";
import { motion } from "motion/react";
import { 
  Globe, 
  Copy, 
  Check, 
  Info, 
  UserCheck, 
  Award, 
  DollarSign, 
  Calendar, 
  Activity, 
  ChevronRight 
} from "lucide-react";
import ClockIcon from "./ClockIcon";
import { formatDate } from "@/lib/date-utils";
import { 
  PartnerDocument, 
  PartnerStatsDocument, 
  PartnerCommissionDocument 
} from "@/lib/db-helpers";

interface DashboardTabProps {
  partner: PartnerDocument;
  stats: PartnerStatsDocument | null;
  commissions: PartnerCommissionDocument[];
  dbLoading: boolean;
  currencySymbol: string;
  isCopied: boolean;
  handleCopy: () => void;
  setActiveTab: (tab: "dashboard" | "commissions" | "payouts" | "notifications" | "settings") => void;
}

export default function DashboardTab({
  partner,
  stats,
  commissions,
  dbLoading,
  currencySymbol,
  isCopied,
  handleCopy,
  setActiveTab
}: DashboardTabProps) {
  return (
    <motion.div 
      key="dashboard"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex flex-col gap-8"
      id="dashboard-tab"
    >
      {/* Top Bento Layout: Referral URL Panel (Left) & QR Code (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="bento-top-row">
        {/* Referral Link Manager */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 backdrop-blur shadow-xl relative overflow-hidden flex flex-col justify-between" id="referral-link-manager">
          <div className="absolute top-[-30%] right-[-10%] w-[200px] h-[200px] bg-amber-500/5 rounded-full blur-[50px] pointer-events-none"></div>
          
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                <Globe className="w-4.5 h-4.5" />
              </div>
              <h3 className="font-display font-bold text-base text-white">Unique Referral Slug</h3>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed mb-6">
              Distribute this link. Any talent applying through this structured URL is automatically linked to your partner account, initializing the commission tracking process.
            </p>
          </div>

          <div>
            {/* URL Input Box */}
            <div className="flex items-center gap-2 bg-[#050914] border border-slate-800 rounded-xl p-2.5 mb-3 font-mono text-xs text-slate-300">
              <input
                type="text"
                readOnly
                value={`https://ecosystem.deloxehr.com/?ref=${partner.referralCode}`}
                className="bg-transparent flex-grow focus:outline-none select-all font-mono"
              />
              <button
                onClick={handleCopy}
                className={`p-2 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  isCopied 
                    ? "bg-emerald-500 text-slate-950 font-bold" 
                    : "bg-slate-900 hover:bg-slate-800 text-slate-300"
                }`}
              >
                {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span className="text-[10px] font-bold">{isCopied ? "COPIED" : "COPY"}</span>
              </button>
            </div>

            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono">
              <Info className="w-3.5 h-3.5 text-amber-500/70" />
              <span>Tracking Slug matches: /?ref={partner.referralCode}</span>
            </div>
          </div>
        </div>

        {/* QR Code Card */}
        <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 backdrop-blur shadow-xl relative overflow-hidden flex flex-col justify-between items-center text-center" id="qr-code-card">
          <div className="absolute top-0 left-0 w-[100px] h-[100px] bg-emerald-500/5 rounded-full blur-[45px] pointer-events-none"></div>
          
          <div className="w-full">
            <h3 className="font-display font-bold text-sm text-slate-100">Scan & Refer</h3>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">Direct visual link scan</p>
          </div>

          {/* Dynamic clean QR Code via api.qrserver.com */}
          <div className="w-32 h-32 bg-[#050914] rounded-xl border border-slate-800/80 flex items-center justify-center p-2 relative my-4">
            <img 
              src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&color=f59e0b&bgcolor=050914&data=${encodeURIComponent(
                `https://ecosystem.deloxehr.com/?ref=${partner.referralCode}`
              )}`}
              alt="Referral QR Code" 
              className="w-full h-full rounded"
              referrerPolicy="no-referrer"
            />
          </div>

          <span className="text-[10px] font-mono text-amber-400/80 font-bold tracking-widest">{partner.referralCode}</span>
        </div>
      </div>

      {/* Bento Grid Analytics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4" id="analytics-grid">
        {[
          { label: "Total Clicks", value: stats?.totalClicks ?? 0, icon: Globe, color: "text-blue-400" },
          { label: "Verified Purchases", value: stats?.totalPurchases ?? 0, icon: UserCheck, color: "text-amber-400" },
          { label: "Total Earned", value: stats ? `${currencySymbol}${stats.totalCommission.toLocaleString()}` : `${currencySymbol}0`, icon: Award, color: "text-emerald-400" },
          { label: "Available Balance", value: stats ? `${currencySymbol}${stats.balance.toLocaleString()}` : `${currencySymbol}0`, icon: DollarSign, color: "text-teal-400 font-extrabold" },
          { label: "Payout Frequency", value: partner.payoutFrequency, icon: Calendar, color: "text-purple-400 uppercase text-xs" },
          { label: "Next Payout Date", value: stats?.nextPayout ? formatDate(stats.nextPayout) : "TBD", icon: ClockIcon, color: "text-pink-400" }
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 backdrop-blur shadow-sm flex flex-col justify-between" id={`analytic-card-${idx}`}>
              <div className="flex justify-between items-start mb-2">
                <span className="text-slate-500 text-[10px] font-mono tracking-wider uppercase leading-tight">{item.label}</span>
                <Icon className={`w-4 h-4 ${item.color}`} />
              </div>
              <div className={`text-xl font-display font-extrabold ${item.color} tracking-tight mt-2 truncate`}>
                {item.value}
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Commissions Overview Snippet */}
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl" id="recent-activity-container">
        <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-900/20">
          <h3 className="font-display font-bold text-sm text-slate-100 flex items-center gap-2">
            <Activity className="w-4 h-4 text-amber-500" />
            <span>Recent Activity Stream</span>
          </h3>
          <button 
            onClick={() => setActiveTab("commissions")}
            className="text-xs text-amber-400 hover:underline flex items-center gap-1.5 cursor-pointer font-mono"
          >
            <span>Full Ledger</span> <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
        
        <div className="divide-y divide-slate-800/80">
          {dbLoading ? (
            <div className="p-8 text-center text-slate-500 font-mono text-xs">Accessing datastore...</div>
          ) : commissions.length === 0 ? (
            <div className="p-10 text-center text-slate-500 text-xs leading-relaxed">
              No active commission metrics recorded yet.<br />
              <span className="text-[10px] mt-1 text-slate-600 block">Once applications progress under your code, logs will appear.</span>
            </div>
          ) : (
            commissions.slice(0, 2).map((comm) => (
              <div key={comm.commissionId} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-900/10 transition-all">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-mono text-slate-500">{comm.transactionId}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono border ${
                      comm.payoutStatus === "paid" 
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                        : comm.payoutStatus === "processing"
                        ? "bg-blue-500/10 border-blue-500/20 text-blue-400"
                        : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                    }`}>
                      {comm.payoutStatus}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-slate-200">{comm.email}</span>
                  <span className="text-[10px] font-mono text-slate-500">Milestone Completed At: {formatDate(comm.createdAt)}</span>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-slate-500 text-[10px] font-mono block">COMMISSION</span>
                  <span className="text-base font-mono font-bold text-emerald-400">{currencySymbol}{comm.commissionAmount.toLocaleString()}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </motion.div>
  );
}
