import React from 'react';
import { ExtractedLink } from '../types.ts';
import { Link2, AlertTriangle, ShieldCheck, ExternalLink } from 'lucide-react';

interface LinksTableProps {
  links: ExtractedLink[];
}

export const LinksTable: React.FC<LinksTableProps> = ({ links }) => {
  if (!links || links.length === 0) {
    return (
      <div className="rounded-xl border border-white/10 bg-[#141B2D] p-5">
        <div className="flex items-center gap-2 border-b border-white/10 pb-3 mb-3">
          <Link2 className="h-4 w-4 text-[#00E5FF]" />
          <h3 className="font-display font-semibold text-sm text-[#E6EAF2]">
            Extracted Links & Destinations
          </h3>
        </div>
        <p className="text-xs text-[#8B93A7] py-2">
          No external hyperlinks or URIs were detected in the email body.
        </p>
      </div>
    );
  }

  // Defang URL for display safety (e.g. hxxps:// or [.]domain)
  const defang = (url: string) => {
    return url.replace(/^https?:\/\//i, 'hxxp://').replace(/\./g, '[.]');
  };

  return (
    <div id="extracted-links-card" className="rounded-xl border border-white/10 bg-[#141B2D] p-5">
      <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <Link2 className="h-4 w-4 text-[#00E5FF]" />
          <h3 className="font-display font-semibold text-sm text-[#E6EAF2]">
            Extracted Hyperlinks & Domain Payloads ({links.length})
          </h3>
        </div>
        <span className="text-[11px] font-mono text-[#8B93A7]">
          DEFANGED FOR SECURITY
        </span>
      </div>

      <div className="space-y-2.5 max-h-72 overflow-y-auto">
        {links.map((item, idx) => (
          <div
            key={idx}
            className={`rounded-lg border p-3 transition-all ${
              item.flagged
                ? 'border-rose-500/30 bg-rose-500/5'
                : 'border-white/5 bg-white/[0.02]'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1 font-mono text-xs">
                <div className="flex items-center gap-2">
                  <span className={`font-semibold ${item.flagged ? 'text-rose-400' : 'text-[#00E5FF]'}`}>
                    {item.domain}
                  </span>
                  {item.flagged ? (
                    <span className="flex items-center gap-1 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 px-1.5 py-0.5 text-[10px] font-medium">
                      <AlertTriangle className="h-3 w-3" />
                      SUSPICIOUS DESTINATION
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.5 text-[10px]">
                      <ShieldCheck className="h-3 w-3" />
                      CLEAN
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[#8B93A7] truncate mt-1">
                  {defang(item.url)}
                </p>
                {item.reason && (
                  <p className="mt-1.5 text-xs text-rose-300 font-sans font-medium flex items-center gap-1">
                    <span>⚠️ Forensic Flag:</span> {item.reason}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
