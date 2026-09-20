import React from 'react';
import { IndicatorItem } from '../types.ts';
import { CheckCircle2, XCircle, AlertCircle, HelpCircle } from 'lucide-react';

interface IndicatorChecklistProps {
  indicators: IndicatorItem[];
}

export const IndicatorChecklist: React.FC<IndicatorChecklistProps> = ({ indicators }) => {
  return (
    <div id="suspicious-indicator-checklist-card" className="rounded-xl border border-white/10 bg-[#141B2D] p-5">
      <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
        <div>
          <h3 className="font-display font-semibold text-sm text-[#E6EAF2]">
            Forensic Indicator Checklist
          </h3>
          <p className="text-xs text-[#8B93A7]">
            Automated verification of email authentication & transmission integrity
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-[11px] text-emerald-400">
            <CheckCircle2 className="h-3 w-3" />
            {indicators.filter((i) => i.status === 'pass').length} Passed
          </span>
          <span className="flex items-center gap-1 text-[11px] text-rose-400">
            <XCircle className="h-3 w-3" />
            {indicators.filter((i) => i.status === 'fail').length} Failed
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {indicators.map((item) => {
          let StatusIcon = CheckCircle2;
          let iconColor = 'text-emerald-400';
          let borderColor = 'border-emerald-500/20 bg-emerald-500/5';

          if (item.status === 'fail') {
            StatusIcon = XCircle;
            iconColor = 'text-rose-400';
            borderColor = 'border-rose-500/20 bg-rose-500/5';
          } else if (item.status === 'warn') {
            StatusIcon = AlertCircle;
            iconColor = 'text-amber-400';
            borderColor = 'border-amber-500/20 bg-amber-500/5';
          } else if (item.status === 'neutral') {
            StatusIcon = HelpCircle;
            iconColor = 'text-[#8B93A7]';
            borderColor = 'border-white/5 bg-white/5';
          }

          let impactBadge = 'bg-white/5 text-[#8B93A7]';
          if (item.impact === 'critical') impactBadge = 'bg-rose-500/20 text-rose-300 border border-rose-500/40';
          else if (item.impact === 'high') impactBadge = 'bg-amber-500/20 text-amber-300 border border-amber-500/40';

          return (
            <div
              key={item.id}
              className={`flex items-start gap-3 rounded-lg border p-3.5 transition-all ${borderColor}`}
            >
              <StatusIcon className={`h-5 w-5 shrink-0 mt-0.5 ${iconColor}`} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-xs text-[#E6EAF2]">{item.title}</span>
                  <span className={`rounded px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider ${impactBadge}`}>
                    {item.impact}
                  </span>
                </div>
                <p className="mt-1 text-xs text-[#8B93A7] leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
