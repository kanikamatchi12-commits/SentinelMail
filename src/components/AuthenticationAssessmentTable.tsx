import React from 'react';
import { AuthenticationAssessmentRow } from '../types.ts';
import { CheckCircle2, AlertTriangle, XCircle, HelpCircle, ShieldCheck } from 'lucide-react';

interface Props {
  rows?: AuthenticationAssessmentRow[];
  spfResult?: string;
  dkimResult?: string;
  dmarcResult?: string;
  fromDomain?: string;
}

export const AuthenticationAssessmentTable: React.FC<Props> = ({ rows }) => {
  if (!rows || rows.length === 0) {
    return null;
  }

  const getResultBadge = (result: 'Pass' | 'Warning' | 'Fail' | 'Unavailable') => {
    switch (result) {
      case 'Pass':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Pass
          </span>
        );
      case 'Warning':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <AlertTriangle className="w-3.5 h-3.5" />
            Warning
          </span>
        );
      case 'Fail':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
            <XCircle className="w-3.5 h-3.5" />
            Fail
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-slate-800 text-slate-400 border border-slate-700">
            <HelpCircle className="w-3.5 h-3.5" />
            Unavailable
          </span>
        );
    }
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-[#141B2D] p-5 space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#00E5FF]" />
          <h3 className="text-sm font-semibold text-white font-mono uppercase tracking-wider">
            Technical Authentication Assessment
          </h3>
        </div>
        <span className="text-[11px] font-mono text-slate-400">
          Reported RFC Envelope & Identity Alignment Matrix
        </span>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-800/80">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#0B0F1A] text-slate-400 font-mono uppercase text-[11px] border-b border-slate-800">
            <tr>
              <th className="px-4 py-2.5">Security Control</th>
              <th className="px-4 py-2.5">Observed Status</th>
              <th className="px-4 py-2.5">Envelope Evidence</th>
              <th className="px-4 py-2.5">Forensic Interpretation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-sans">
            {rows.map((row, idx) => (
              <tr key={idx} className="hover:bg-slate-800/30 transition">
                <td className="px-4 py-3 font-semibold text-white whitespace-nowrap">
                  {row.control}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">{getResultBadge(row.result)}</td>
                <td className="px-4 py-3 font-mono text-[11px] text-cyan-300 max-w-xs break-all">
                  {row.evidence}
                </td>
                <td className="px-4 py-3 text-slate-300 leading-relaxed max-w-md">
                  {row.interpretation}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="text-[11px] text-slate-400 font-mono pt-1">
        Notice: Authentication checks are extracted from reported inbound Authentication-Results headers and SPF/DKIM envelope records.
      </div>
    </div>
  );
};
