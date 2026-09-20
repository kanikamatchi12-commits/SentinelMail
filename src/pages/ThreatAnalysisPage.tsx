import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Info,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  ArrowLeft,
  Bell,
  Mail,
  Lock,
  Layers,
  Sparkles,
} from 'lucide-react';
import { EmailAnalysis, RecommendedDisposition } from '../types.ts';
import { InvestigationProgressHeader } from '../components/InvestigationProgressHeader.tsx';

export const ThreatAnalysisPage: React.FC = () => {
  const { caseId } = useParams<{ caseId: string }>();
  const navigate = useNavigate();

  const [analysis, setAnalysis] = useState<EmailAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!caseId) return;

    fetch(`/api/analysis/${caseId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Analysis record not found.');
        return res.json();
      })
      .then((data: EmailAnalysis) => {
        setAnalysis(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError('Unable to load threat analysis for this case.');
        setLoading(false);
      });
  }, [caseId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F9FC] flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-[#165DFF] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-heading font-medium text-[#123B70]">Loading Threat Analysis...</p>
        </div>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="min-h-screen bg-[#F7F9FC] flex items-center justify-center p-6">
        <div className="bg-white p-6 rounded-2xl border border-[#DDE3EC] shadow-sm max-w-md text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-[#D92D20]/10 text-[#D92D20] flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-heading font-bold text-[#123B70]">Case Not Found</h2>
          <p className="text-xs text-[#667085]">{error || 'The requested forensic case could not be located.'}</p>
          <button
            type="button"
            onClick={() => navigate('/cases')}
            className="px-4 py-2 bg-[#165DFF] text-white rounded-xl text-xs font-heading font-semibold"
          >
            Return to Case Files
          </button>
        </div>
      </div>
    );
  }

  const riskScore = analysis.risk_score || 0;
  const isCritical = riskScore >= 85;
  const isHigh = riskScore >= 70 && riskScore < 85;
  const isMedium = riskScore >= 35 && riskScore < 70;
  const isLow = riskScore < 35;

  const severityColor = isCritical
    ? 'text-[#D92D20] bg-[#D92D20]/10 border-[#D92D20]/30'
    : isHigh
    ? 'text-[#F97316] bg-[#F97316]/10 border-[#F97316]/30'
    : isMedium
    ? 'text-[#F4B400] bg-[#F4B400]/10 border-[#F4B400]/30'
    : 'text-[#16A36A] bg-[#16A36A]/10 border-[#16A36A]/30';

  const severityLabel = isCritical
    ? 'Critical Threat'
    : isHigh
    ? 'High Risk'
    : isMedium
    ? 'Medium Risk'
    : 'Safe / Low Risk';

  // Extract 5-score breakdown
  const breakdownMap = {
    domain: analysis.score_breakdown?.find((b) => b.category.toLowerCase().includes('domain'))?.score || 0,
    auth: analysis.score_breakdown?.find((b) => b.category.toLowerCase().includes('auth'))?.score || 0,
    content: analysis.score_breakdown?.find((b) => b.category.toLowerCase().includes('content') || b.category.toLowerCase().includes('urgency'))?.score || 0,
    links: analysis.score_breakdown?.find((b) => b.category.toLowerCase().includes('link') || b.category.toLowerCase().includes('attachment'))?.score || 0,
    routing: analysis.score_breakdown?.find((b) => b.category.toLowerCase().includes('rout') || b.category.toLowerCase().includes('geo'))?.score || 0,
  };

  const handleGenerateAlert = () => {
    if (riskScore < 30) {
      const ok = window.confirm('This email is currently classified as low risk. Do you still want to create an alert?');
      if (!ok) return;
    }
    navigate(`/analysis/${analysis.id}/alert`);
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] text-[#172033] pb-16">
      {/* 8-Step Navigation Progress Header */}
      <InvestigationProgressHeader
        currentStep={2}
        caseId={analysis.case_number || analysis.id}
        caseSubject={analysis.subject}
        riskScore={analysis.risk_score}
        threatCategory={analysis.threat_category}
        backTo="/analyze"
        continueTo={`/analysis/${analysis.id}/geolocation`}
        continueLabel="Continue to Route Traced"
        showGenerateAlert={true}
        isAlertGenerated={analysis.alert_generated}
        isDemo={analysis.is_demo}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Page Title & Context */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-[#165DFF] bg-[#EAF2FF] px-2 py-0.5 rounded border border-[#165DFF]/20">
                Page 4 — Threat Analysis
              </span>
              <span className="text-xs text-[#667085]">Step 2 of Investigation Sequence</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#123B70]">
              Threat Analysis & Risk Decomposition
            </h1>
            <p className="text-xs sm:text-sm text-[#667085] mt-1">
              Deterministic heuristic correlation and AI behavioral classification for {analysis.case_number || analysis.id}
            </p>
          </div>

          {/* Quick Generate Threat Alert Callout */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleGenerateAlert}
              className={`px-4 py-2.5 rounded-xl text-xs font-heading font-bold transition flex items-center gap-2 shadow-sm cursor-pointer ${
                isCritical
                  ? 'bg-[#D92D20] text-white hover:bg-[#B42318] ring-4 ring-[#D92D20]/15 animate-pulse'
                  : isHigh
                  ? 'bg-[#F97316] text-white hover:bg-[#EA580C]'
                  : 'bg-[#165DFF] text-white hover:bg-[#123B70]'
              }`}
            >
              <Bell className="w-4 h-4" />
              <span>{isCritical ? 'Immediate Alert Recommended' : 'Generate Threat Alert'}</span>
            </button>
          </div>
        </div>

        {/* Top Assessment Grid: Risk Score Gauge + Executive Threat Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Card 1: Score & Severity */}
          <div className="bg-white rounded-2xl border border-[#DDE3EC] p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-heading font-bold uppercase tracking-wider text-[#667085]">
                  Composite Risk Score
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-heading font-bold border ${severityColor}`}>
                  {severityLabel}
                </span>
              </div>

              {/* Large Score Indicator */}
              <div className="mt-6 flex items-baseline gap-2">
                <span className={`text-6xl font-heading font-extrabold tracking-tight ${
                  isCritical ? 'text-[#D92D20]' : isHigh ? 'text-[#F97316]' : isMedium ? 'text-[#F4B400]' : 'text-[#16A36A]'
                }`}>
                  {riskScore}
                </span>
                <span className="text-sm font-semibold text-[#667085]">/ 100</span>
              </div>

              {/* Threat Category Pill */}
              <div className="mt-4 pt-4 border-t border-[#DDE3EC]">
                <div className="text-xs text-[#667085]">Detected Threat Classification</div>
                <div className="text-base font-heading font-bold text-[#123B70] mt-0.5">
                  {analysis.threat_category || 'Suspicious Email Ingestion'}
                </div>
              </div>
            </div>

            <div className="mt-6 p-3 rounded-xl bg-[#F7F9FC] border border-[#DDE3EC] text-xs space-y-1">
              <div className="flex justify-between text-[#667085]">
                <span>Claimed Sender:</span>
                <span className="font-mono text-[#172033] font-medium truncate max-w-[180px]">
                  {analysis.from_address || 'unknown'}
                </span>
              </div>
              <div className="flex justify-between text-[#667085]">
                <span>Reported SPF:</span>
                <span className={`font-mono font-medium ${
                  analysis.spf_result === 'pass' ? 'text-[#16A36A]' : 'text-[#D92D20]'
                }`}>
                  {analysis.spf_result?.toUpperCase() || 'NONE'}
                </span>
              </div>
              <div className="flex justify-between text-[#667085]">
                <span>DMARC Status:</span>
                <span className={`font-mono font-medium ${
                  analysis.dmarc_result === 'pass' ? 'text-[#16A36A]' : 'text-[#D92D20]'
                }`}>
                  {analysis.dmarc_result?.toUpperCase() || 'NONE'}
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Executive Threat Summary & Recommended Action */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-[#DDE3EC] p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[#DDE3EC]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#EAF2FF] text-[#165DFF] flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-sm text-[#123B70]">Executive Threat Summary</h3>
                    <span className="text-[11px] text-[#667085]">Plain language risk synthesis</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-[#667085]">Disposition:</span>
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-heading font-bold uppercase tracking-wider ${
                    analysis.recommended_disposition === 'Quarantine' || analysis.recommended_disposition === 'Block'
                      ? 'bg-[#D92D20] text-white'
                      : analysis.recommended_disposition === 'Investigate' || analysis.recommended_disposition === 'Monitor'
                      ? 'bg-[#F97316] text-white'
                      : 'bg-[#16A36A] text-white'
                  }`}>
                    {analysis.recommended_disposition || 'Quarantine'}
                  </span>
                </div>
              </div>

              <div className="mt-4 text-xs sm:text-sm text-[#172033] leading-relaxed space-y-2">
                <p className="font-medium text-[#123B70]">
                  {analysis.executive_summary || 'Multi-vector analysis identified anomalous transmission and header divergence.'}
                </p>
                {analysis.ai_explanation && (
                  <p className="text-[#667085] text-xs">
                    {analysis.ai_explanation}
                  </p>
                )}
              </div>
            </div>

            {/* Recommended Action Selector / Status */}
            <div className="mt-6 pt-4 border-t border-[#DDE3EC]">
              <div className="text-xs font-heading font-semibold text-[#123B70] mb-2">
                Recommended Operational Action:
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(['Quarantine', 'Block', 'Monitor', 'Allow'] as RecommendedDisposition[]).map((action) => {
                  const isSelected = analysis.recommended_disposition === action;
                  return (
                    <div
                      key={action}
                      className={`p-2.5 rounded-xl border text-center text-xs font-heading font-bold transition ${
                        isSelected
                          ? action === 'Quarantine' || action === 'Block'
                            ? 'bg-[#D92D20]/10 border-[#D92D20] text-[#D92D20] shadow-xs'
                            : action === 'Monitor'
                            ? 'bg-[#F4B400]/10 border-[#F4B400] text-[#F4B400]'
                            : 'bg-[#16A36A]/10 border-[#16A36A] text-[#16A36A]'
                          : 'bg-[#F7F9FC] border-[#DDE3EC] text-[#667085]'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-1.5">
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                        <span>{action}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* 5-Score Breakdown: Domain Risk, Authentication Risk, Content & Urgency, Link & Attachment, Routing Anomaly */}
        <div className="bg-white rounded-2xl border border-[#DDE3EC] p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#DDE3EC]">
            <div>
              <h3 className="font-heading font-bold text-base text-[#123B70]">5-Score Risk Decomposition</h3>
              <p className="text-xs text-[#667085]">Granular component weights contributing to total risk score</p>
            </div>
            <span className="text-xs font-mono font-medium text-[#165DFF] bg-[#EAF2FF] px-2.5 py-1 rounded-lg">
              Weights Normalized
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* 1. Domain Risk */}
            <div className="p-4 rounded-xl bg-[#F7F9FC] border border-[#DDE3EC]">
              <div className="flex justify-between items-center text-xs font-heading font-semibold text-[#123B70] mb-1">
                <span>Domain Risk</span>
                <span className="font-mono text-[#165DFF]">{breakdownMap.domain} / 25</span>
              </div>
              <div className="w-full bg-[#DDE3EC] h-2 rounded-full overflow-hidden my-2">
                <div
                  className="h-full bg-[#165DFF] rounded-full"
                  style={{ width: `${Math.min(100, (breakdownMap.domain / 25) * 100)}%` }}
                />
              </div>
              <p className="text-[11px] text-[#667085] mt-2">
                Domain age, lookalike squatted domains, and MX consistency.
              </p>
            </div>

            {/* 2. Authentication Risk */}
            <div className="p-4 rounded-xl bg-[#F7F9FC] border border-[#DDE3EC]">
              <div className="flex justify-between items-center text-xs font-heading font-semibold text-[#123B70] mb-1">
                <span>Authentication Risk</span>
                <span className="font-mono text-[#165DFF]">{breakdownMap.auth} / 25</span>
              </div>
              <div className="w-full bg-[#DDE3EC] h-2 rounded-full overflow-hidden my-2">
                <div
                  className="h-full bg-[#D92D20] rounded-full"
                  style={{ width: `${Math.min(100, (breakdownMap.auth / 25) * 100)}%` }}
                />
              </div>
              <p className="text-[11px] text-[#667085] mt-2">
                SPF validation, DKIM digital signatures, and DMARC alignment.
              </p>
            </div>

            {/* 3. Content & Urgency */}
            <div className="p-4 rounded-xl bg-[#F7F9FC] border border-[#DDE3EC]">
              <div className="flex justify-between items-center text-xs font-heading font-semibold text-[#123B70] mb-1">
                <span>Content & Urgency</span>
                <span className="font-mono text-[#165DFF]">{breakdownMap.content} / 20</span>
              </div>
              <div className="w-full bg-[#DDE3EC] h-2 rounded-full overflow-hidden my-2">
                <div
                  className="h-full bg-[#F97316] rounded-full"
                  style={{ width: `${Math.min(100, (breakdownMap.content / 20) * 100)}%` }}
                />
              </div>
              <p className="text-[11px] text-[#667085] mt-2">
                Coercive language, urgent wire/credential prompts, executive impersonation.
              </p>
            </div>

            {/* 4. Link & Attachment Risk */}
            <div className="p-4 rounded-xl bg-[#F7F9FC] border border-[#DDE3EC]">
              <div className="flex justify-between items-center text-xs font-heading font-semibold text-[#123B70] mb-1">
                <span>Link & Attachment</span>
                <span className="font-mono text-[#165DFF]">{breakdownMap.links} / 15</span>
              </div>
              <div className="w-full bg-[#DDE3EC] h-2 rounded-full overflow-hidden my-2">
                <div
                  className="h-full bg-[#6C5CE7] rounded-full"
                  style={{ width: `${Math.min(100, (breakdownMap.links / 15) * 100)}%` }}
                />
              </div>
              <p className="text-[11px] text-[#667085] mt-2">
                Defanged URLs, redirect chains, macro payloads, suspicious extensions.
              </p>
            </div>

            {/* 5. Routing Anomaly */}
            <div className="p-4 rounded-xl bg-[#F7F9FC] border border-[#DDE3EC]">
              <div className="flex justify-between items-center text-xs font-heading font-semibold text-[#123B70] mb-1">
                <span>Routing Anomaly</span>
                <span className="font-mono text-[#165DFF]">{breakdownMap.routing} / 15</span>
              </div>
              <div className="w-full bg-[#DDE3EC] h-2 rounded-full overflow-hidden my-2">
                <div
                  className="h-full bg-[#F4B400] rounded-full"
                  style={{ width: `${Math.min(100, (breakdownMap.routing / 15) * 100)}%` }}
                />
              </div>
              <p className="text-[11px] text-[#667085] mt-2">
                Geographic discrepancies between claimed sender location and first hop.
              </p>
            </div>
          </div>
        </div>

        {/* Key Threat Indicators List */}
        <div className="bg-white rounded-2xl border border-[#DDE3EC] p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#DDE3EC]">
            <div>
              <h3 className="font-heading font-bold text-base text-[#123B70]">Key Threat Indicators</h3>
              <p className="text-xs text-[#667085]">
                {analysis.indicators?.length || 0} discrete forensic signals correlated
              </p>
            </div>
            <span className="text-xs text-[#667085]">Observable Findings</span>
          </div>

          <div className="space-y-3">
            {analysis.indicators && analysis.indicators.length > 0 ? (
              analysis.indicators.map((indicator, idx) => (
                <div
                  key={indicator.id || idx}
                  className="p-3.5 rounded-xl bg-[#F7F9FC] border border-[#DDE3EC] flex items-start justify-between gap-4"
                >
                  <div className="flex items-start gap-3">
                    {(() => {
                      const sev = indicator.severity || indicator.impact || 'medium';
                      return (
                        <>
                          <div className={`mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                            sev === 'high' || sev === 'critical'
                              ? 'bg-[#D92D20]/10 text-[#D92D20]'
                              : sev === 'medium'
                              ? 'bg-[#F97316]/10 text-[#F97316]'
                              : 'bg-[#165DFF]/10 text-[#165DFF]'
                          }`}>
                            <AlertTriangle className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <div className="text-xs font-heading font-bold text-[#123B70] flex items-center gap-2">
                              <span>{indicator.title}</span>
                              <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-mono ${
                                sev === 'high' || sev === 'critical'
                                  ? 'bg-[#D92D20]/15 text-[#D92D20]'
                                  : sev === 'medium'
                                  ? 'bg-[#F97316]/15 text-[#F97316]'
                                  : 'bg-[#165DFF]/15 text-[#165DFF]'
                              }`}>
                                {sev}
                              </span>
                            </div>
                            <p className="text-xs text-[#667085] mt-1 leading-relaxed">
                              {indicator.description}
                            </p>
                            {indicator.evidence && (
                              <div className="mt-2 font-mono text-[11px] text-[#123B70] bg-white px-2.5 py-1 rounded border border-[#DDE3EC]">
                                Evidence: {indicator.evidence}
                              </div>
                            )}
                          </div>
                        </>
                      );
                    })()}
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-mono font-bold text-[#D92D20]">
                      +{indicator.score_contribution || 5} pts
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-xs text-[#667085]">
                No malicious threat indicators detected. All authentication checks passed cleanly.
              </div>
            )}
          </div>
        </div>

        {/* Bottom Sequence Navigation Bar */}
        <div className="p-4 bg-white rounded-2xl border border-[#DDE3EC] shadow-sm flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('/analyze')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium text-[#172033] bg-[#F7F9FC] hover:bg-white border border-[#DDE3EC] transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-[#667085]" />
            <span>Back to Submit Email</span>
          </button>

          <button
            type="button"
            onClick={() => navigate(`/analysis/${analysis.id}/geolocation`)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-heading font-bold text-white bg-[#165DFF] hover:bg-[#123B70] shadow-sm transition cursor-pointer"
          >
            <span>Continue to Route Traced</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </main>
    </div>
  );
};
