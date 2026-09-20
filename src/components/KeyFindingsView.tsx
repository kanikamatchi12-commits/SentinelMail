import React from 'react';
import { KeyFinding } from '../types.ts';
import { AlertCircle, ShieldAlert, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';

interface Props {
  findings?: KeyFinding[];
}

export const KeyFindingsView: React.FC<Props> = ({ findings }) => {
  if (!findings || findings.length === 0) return null;

  const getSeverityBadge = (severity: 'low' | 'medium' | 'high' | 'critical') => {
    switch (severity) {
      case 'critical':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-rose-500/20 text-rose-400 border border-rose-500/40">
            Critical Severity
          </span>
        );
      case 'high':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-orange-500/20 text-orange-400 border border-orange-500/40">
            High Severity
          </span>
        );
      case 'medium':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase bg-amber-500/20 text-amber-400 border border-amber-500/40">
            Medium Severity
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
            Low / Baseline
          </span>
        );
    }
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-[#141B2D] p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-[#00E5FF]" />
          <h3 className="text-sm font-semibold text-white font-mono uppercase tracking-wider">
            Ranked Key Threat Findings ({findings.length})
          </h3>
        </div>
        <span className="text-[11px] font-mono text-slate-400">
          Prioritized Evidence Analysis
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {findings.map((f, idx) => (
          <div
            key={f.id || idx}
            className={`p-4 rounded-lg border flex flex-col justify-between space-y-3 ${
              f.severity === 'critical'
                ? 'border-rose-500/30 bg-rose-950/20'
                : f.severity === 'high'
                ? 'border-orange-500/30 bg-orange-950/20'
                : f.severity === 'medium'
                ? 'border-amber-500/30 bg-amber-950/20'
                : 'border-emerald-500/30 bg-emerald-950/20'
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-bold text-white font-mono">
                  #{idx + 1}. {f.title}
                </span>
                {getSeverityBadge(f.severity)}
              </div>

              {/* Observed Evidence */}
              <div className="space-y-1.5 text-xs">
                <div>
                  <span className="text-slate-400 font-mono text-[10px] uppercase block">
                    Observed Evidence:
                  </span>
                  <p className="text-slate-200 font-mono text-[11px] bg-[#0B0F1A]/80 p-2 rounded border border-slate-800 break-words">
                    {f.evidence}
                  </p>
                </div>

                <div>
                  <span className="text-slate-400 font-mono text-[10px] uppercase block">
                    Why It Matters:
                  </span>
                  <p className="text-slate-300 text-xs leading-relaxed">{f.why_it_matters}</p>
                </div>
              </div>
            </div>

            {/* Recommended Response */}
            <div className="pt-2 border-t border-slate-800/80 text-xs">
              <span className="text-[#00E5FF] font-mono text-[10px] uppercase block font-semibold">
                Recommended Response:
              </span>
              <p className="text-slate-200 text-xs mt-0.5 leading-relaxed">{f.recommended_response}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
