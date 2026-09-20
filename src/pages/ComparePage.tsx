import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  GitCompare,
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Lock,
  Mail,
  ArrowLeft,
} from 'lucide-react';
import { EmailAnalysis } from '../types.ts';

export const ComparePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [analyses, setAnalyses] = useState<EmailAnalysis[]>([]);
  const [loading, setLoading] = useState(true);

  const [id1, setId1] = useState<string>(searchParams.get('id1') || searchParams.get('case1') || '');
  const [id2, setId2] = useState<string>(searchParams.get('id2') || searchParams.get('case2') || '');

  useEffect(() => {
    fetch('/api/analyses')
      .then((res) => res.json())
      .then((data: EmailAnalysis[]) => {
        if (Array.isArray(data)) {
          setAnalyses(data);
          if (!id1 && data.length > 0) setId1(data[0].id);
          if (!id2 && data.length > 1) setId2(data[1].id);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const email1 = analyses.find((a) => a.id === id1);
  const email2 = analyses.find((a) => a.id === id2);

  const handleSelect1 = (newId: string) => {
    setId1(newId);
    setSearchParams({ id1: newId, id2 });
  };

  const handleSelect2 = (newId: string) => {
    setId2(newId);
    setSearchParams({ id1, id2: newId });
  };

  // Central correlation analysis
  const correlation = useMemo(() => {
    if (!email1 || !email2) return null;

    const domain1 = email1.from_address.split('@')[1]?.toLowerCase() || '';
    const domain2 = email2.from_address.split('@')[1]?.toLowerCase() || '';
    const sameDomain = domain1 && domain1 === domain2;

    const redFlags1 = new Set(email1.red_flags || []);
    const redFlags2 = new Set(email2.red_flags || []);
    const sharedFlags = [...redFlags1].filter((x) => redFlags2.has(x));

    let campaignLikelihood = 'Low Correlated Artifacts';
    if (sameDomain && sharedFlags.length > 1) {
      campaignLikelihood = 'High Pattern Convergence';
    } else if (sameDomain || sharedFlags.length > 0) {
      campaignLikelihood = 'Moderate Pattern Resemblance';
    }

    const strongerThreat =
      email1.risk_score > email2.risk_score
        ? `Specimen A (${email1.id})`
        : email2.risk_score > email1.risk_score
        ? `Specimen B (${email2.id})`
        : 'Equivalent Risk Posture';

    return {
      sameDomain,
      sharedIndicatorsCount: sharedFlags.length,
      strongerThreat,
      campaignLikelihood,
    };
  }, [email1, email2]);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-3.75rem)] bg-[#F7F9FC] flex flex-col items-center justify-center p-4">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#165DFF] border-t-transparent mb-3" />
        <p className="text-xs font-heading font-semibold text-[#667085]">
          Loading Evidence Comparison...
        </p>
      </div>
    );
  }

  return (
    <div id="email-comparison-page" className="min-h-[calc(100vh-3.75rem)] bg-[#F7F9FC] p-4 sm:p-6 lg:p-8 space-y-6 text-[#172033]">
      <div className="max-w-7xl mx-auto space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#DDE3EC] pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link to="/cases" className="text-xs font-heading font-semibold text-[#667085] hover:text-[#123B70] flex items-center gap-1">
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Case Files Repository</span>
              </Link>
            </div>
            <h1 className="text-xl font-heading font-bold text-[#123B70]">Side-by-Side Email Comparison</h1>
            <p className="text-xs text-[#667085] mt-0.5">
              Cross-correlate envelope headers, reported authentication, and behavioral cues between two evidentiary specimens.
            </p>
          </div>

          <span className="text-xs font-mono text-[#165DFF] bg-white px-3 py-1.5 rounded-lg border border-[#DDE3EC] shadow-xs">
            Evidence Discrepancy Matrix
          </span>
        </div>

        {/* Central Correlation Strip */}
        {correlation && (
          <div className="bg-white rounded-xl border border-[#DDE3EC] p-4 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs divide-y md:divide-y-0 md:divide-x divide-[#DDE3EC]">
              <div>
                <span className="text-[10px] font-heading font-bold text-[#667085] uppercase block mb-0.5">
                  Shared Indicators
                </span>
                <span className="font-heading font-bold text-[#123B70] text-sm">
                  {correlation.sharedIndicatorsCount} Overlapping Flag(s)
                </span>
              </div>

              <div className="pt-2 md:pt-0 md:pl-4">
                <span className="text-[10px] font-heading font-bold text-[#667085] uppercase block mb-0.5">
                  Stronger Threat Signal
                </span>
                <span className="font-semibold text-[#D92D20]">{correlation.strongerThreat}</span>
              </div>

              <div className="pt-2 md:pt-0 md:pl-4">
                <span className="text-[10px] font-heading font-bold text-[#667085] uppercase block mb-0.5">
                  Campaign Correlation
                </span>
                <span className="font-semibold text-[#6C5CE7]">
                  {correlation.campaignLikelihood}
                </span>
              </div>

              <div className="pt-2 md:pt-0 md:pl-4 text-[11px] text-[#667085] italic">
                “Campaign correlation represents heuristic overlap and does not constitute guaranteed legal attribution.”
              </div>
            </div>
          </div>
        )}

        {/* Side-by-Side Specimen Comparison Split View */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT: Specimen A */}
          <div className="bg-white rounded-xl border border-[#DDE3EC] p-5 shadow-sm space-y-4">
            <div className="border-b border-[#DDE3EC] pb-3">
              <label className="text-[10px] font-heading font-bold text-[#165DFF] uppercase block mb-1">
                Specimen A (Primary Case)
              </label>
              <select
                value={id1}
                onChange={(e) => handleSelect1(e.target.value)}
                className="w-full text-xs font-heading font-bold py-1.5 px-3 rounded-lg border border-[#DDE3EC] bg-[#F7F9FC] text-[#172033] focus:outline-none cursor-pointer"
              >
                {analyses.map((a) => (
                  <option key={a.id} value={a.id}>
                    [{a.id}] {a.subject.slice(0, 45)} ({a.risk_score} pts)
                  </option>
                ))}
              </select>
            </div>

            {email1 && (
              <div className="space-y-3.5 text-xs">
                <div>
                  <span className="font-semibold text-[#667085] block">Subject:</span>
                  <span className="font-heading font-bold text-[#123B70]">{email1.subject}</span>
                </div>

                <div className="p-3 rounded-lg bg-[#F7F9FC] border border-[#DDE3EC] space-y-1 font-mono text-[11px]">
                  <div>
                    <span className="text-[#667085]">From: </span>
                    <span className="text-[#172033]">{email1.from_address}</span>
                  </div>
                  <div>
                    <span className="text-[#667085]">Reply-To: </span>
                    <span className={email1.reply_to ? 'text-amber-700 font-semibold' : 'text-gray-400'}>
                      {email1.reply_to || 'None'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#667085]">Return-Path: </span>
                    <span className="text-[#172033]">{email1.return_path || 'None'}</span>
                  </div>
                </div>

                {/* Authentication Pill Matrix */}
                <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono">
                  <div className="p-2 rounded-lg bg-[#F7F9FC] border border-[#DDE3EC]">
                    <span className="text-[#667085] block">SPF</span>
                    <span className="font-bold text-[#172033]">{email1.spf_result?.toUpperCase() || 'NONE'}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-[#F7F9FC] border border-[#DDE3EC]">
                    <span className="text-[#667085] block">DKIM</span>
                    <span className="font-bold text-[#172033]">{email1.dkim_result?.toUpperCase() || 'NONE'}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-[#F7F9FC] border border-[#DDE3EC]">
                    <span className="text-[#667085] block">DMARC</span>
                    <span className="font-bold text-[#172033]">{email1.dmarc_result?.toUpperCase() || 'NONE'}</span>
                  </div>
                </div>

                {/* Risk Score */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-[#F7F9FC] border border-[#DDE3EC]">
                  <span className="font-heading font-semibold text-[#667085]">Risk Score:</span>
                  <span className="font-mono font-bold text-sm text-[#123B70]">{email1.risk_score} / 100</span>
                </div>

                {/* Observed Red Flags */}
                <div className="space-y-1">
                  <span className="font-heading font-bold text-[10px] text-[#667085] uppercase block">
                    Observed Cues:
                  </span>
                  {(email1.red_flags || []).slice(0, 3).map((f, idx) => (
                    <div key={idx} className="p-1.5 rounded bg-[#F7F9FC] text-[11px] text-[#172033]">
                      • {f}
                    </div>
                  ))}
                </div>

                <Link
                  to={`/analysis/${email1.id}/threat`}
                  className="block text-center py-2 rounded-lg bg-[#165DFF] hover:bg-[#123B70] text-white font-heading font-semibold text-xs mt-3 transition"
                >
                  Inspect Forensic Brief A
                </Link>
              </div>
            )}
          </div>

          {/* RIGHT: Specimen B */}
          <div className="bg-white rounded-xl border border-[#DDE3EC] p-5 shadow-sm space-y-4">
            <div className="border-b border-[#DDE3EC] pb-3">
              <label className="text-[10px] font-heading font-bold text-[#6C5CE7] uppercase block mb-1">
                Specimen B (Comparison Case)
              </label>
              <select
                value={id2}
                onChange={(e) => handleSelect2(e.target.value)}
                className="w-full text-xs font-heading font-bold py-1.5 px-3 rounded-lg border border-[#DDE3EC] bg-[#F7F9FC] text-[#172033] focus:outline-none cursor-pointer"
              >
                {analyses.map((a) => (
                  <option key={a.id} value={a.id}>
                    [{a.id}] {a.subject.slice(0, 45)} ({a.risk_score} pts)
                  </option>
                ))}
              </select>
            </div>

            {email2 && (
              <div className="space-y-3.5 text-xs">
                <div>
                  <span className="font-semibold text-[#667085] block">Subject:</span>
                  <span className="font-heading font-bold text-[#123B70]">{email2.subject}</span>
                </div>

                <div className="p-3 rounded-lg bg-[#F7F9FC] border border-[#DDE3EC] space-y-1 font-mono text-[11px]">
                  <div>
                    <span className="text-[#667085]">From: </span>
                    <span className="text-[#172033]">{email2.from_address}</span>
                  </div>
                  <div>
                    <span className="text-[#667085]">Reply-To: </span>
                    <span className={email2.reply_to ? 'text-amber-700 font-semibold' : 'text-gray-400'}>
                      {email2.reply_to || 'None'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#667085]">Return-Path: </span>
                    <span className="text-[#172033]">{email2.return_path || 'None'}</span>
                  </div>
                </div>

                {/* Authentication Pill Matrix */}
                <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono">
                  <div className="p-2 rounded-lg bg-[#F7F9FC] border border-[#DDE3EC]">
                    <span className="text-[#667085] block">SPF</span>
                    <span className="font-bold text-[#172033]">{email2.spf_result?.toUpperCase() || 'NONE'}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-[#F7F9FC] border border-[#DDE3EC]">
                    <span className="text-[#667085] block">DKIM</span>
                    <span className="font-bold text-[#172033]">{email2.dkim_result?.toUpperCase() || 'NONE'}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-[#F7F9FC] border border-[#DDE3EC]">
                    <span className="text-[#667085] block">DMARC</span>
                    <span className="font-bold text-[#172033]">{email2.dmarc_result?.toUpperCase() || 'NONE'}</span>
                  </div>
                </div>

                {/* Risk Score */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-[#F7F9FC] border border-[#DDE3EC]">
                  <span className="font-heading font-semibold text-[#667085]">Risk Score:</span>
                  <span className="font-mono font-bold text-sm text-[#123B70]">{email2.risk_score} / 100</span>
                </div>

                {/* Observed Red Flags */}
                <div className="space-y-1">
                  <span className="font-heading font-bold text-[10px] text-[#667085] uppercase block">
                    Observed Cues:
                  </span>
                  {(email2.red_flags || []).slice(0, 3).map((f, idx) => (
                    <div key={idx} className="p-1.5 rounded bg-[#F7F9FC] text-[11px] text-[#172033]">
                      • {f}
                    </div>
                  ))}
                </div>

                <Link
                  to={`/analysis/${email2.id}/threat`}
                  className="block text-center py-2 rounded-lg bg-[#165DFF] hover:bg-[#123B70] text-white font-heading font-semibold text-xs mt-3 transition"
                >
                  Inspect Forensic Brief B
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
