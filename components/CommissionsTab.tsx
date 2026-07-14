"use client";

import React from "react";
import { motion } from "motion/react";
import { formatDate } from "@/lib/date-utils";
import { PartnerCommissionDocument } from "@/lib/db-helpers";

interface CommissionsTabProps {
  commissions: PartnerCommissionDocument[];
  dbLoading: boolean;
  currencySymbol: string;
}

export default function CommissionsTab({
  commissions,
  dbLoading,
  currencySymbol
}: CommissionsTabProps) {
  return (
    <motion.div 
      key="commissions"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="bg-slate-900/40 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl"
      id="commissions-tab"
    >
      <div className="p-5 border-b border-slate-800 bg-slate-900/20 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h3 className="font-display font-bold text-base text-slate-100">Commission Ledger</h3>
          <p className="text-xs text-slate-400 mt-1">Audit verified referral conversions and their payouts status</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs" id="commissions-table">
          <thead>
            <tr className="border-b border-slate-800 text-slate-500 uppercase tracking-widest font-mono text-[9px]">
              <th className="p-4 pl-6">Transaction ID</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Total Value</th>
              <th className="p-4">My Commission</th>
              <th className="p-4">Status</th>
              <th className="p-4 pr-6">Recorded Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {dbLoading ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-500 font-mono">Syncing database registers...</td>
              </tr>
            ) : commissions.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-12 text-center text-slate-500 leading-relaxed font-mono">
                  No conversion commissions on record.<br />
                  <span className="text-[10px] mt-1 text-slate-600 block">Commission records appear upon processing of verified conversions.</span>
                </td>
              </tr>
            ) : (
              commissions.map((comm) => (
                <tr key={comm.commissionId} className="hover:bg-slate-900/10 transition-all font-mono" id={`commission-row-${comm.commissionId}`}>
                  <td className="p-4 pl-6 text-slate-400">{comm.transactionId}</td>
                  <td className="p-4 font-sans text-slate-200">{comm.email}</td>
                  <td className="p-4 text-slate-300">{currencySymbol}{comm.amountPaid.toLocaleString()}</td>
                  <td className="p-4 text-emerald-400 font-bold">{currencySymbol}{comm.commissionAmount.toLocaleString()}</td>
                  <td className="p-4">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-semibold border uppercase tracking-wider ${
                      comm.payoutStatus === "paid" 
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                        : comm.payoutStatus === "processing"
                        ? "bg-blue-500/10 border-blue-500/20 text-blue-400"
                        : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                    }`}>
                      {comm.payoutStatus}
                    </span>
                  </td>
                  <td className="p-4 pr-6 text-slate-400">{formatDate(comm.createdAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
