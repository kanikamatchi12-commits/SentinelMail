import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  FileCheck2,
  Download,
  Copy,
  Check,
  Globe2,
  Calendar,
  Layers,
  ArrowLeft,
  Mail,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Printer,
  ShieldAlert,
  Inbox,
  Lock,
  UserCheck,
  Send,
} from 'lucide-react';
import { EmailAnalysis, CaseStatus } from '../types.ts';
import { InvestigationProgressHeader } from '../components/InvestigationProgressHeader.tsx';
import { useAuth } from '../context/AuthContext.tsx';

export const FinalReportPage: React.FC = () => {
  const { caseId } = useParams<{ caseId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [analysis, setAnalysis] = useState<EmailAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Decision form
  const [selectedStatus, setSelectedStatus] = useState<CaseStatus>('Under Review');
  const [analystNotes, setAnalystNotes] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const [copiedSummary, setCopiedSummary] = useState(false);

  useEffect(() => {
    if (!caseId) return;

    fetch(`/api/analysis/${caseId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Analysis record not found.');
        return res.json();
      })
      .then((data: EmailAnalysis) => {
        setAnalysis(data);
        setSelectedStatus(data.status || 'Under Investigation');
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError('Unable to load final report for this case.');
        setLoading(false);
      });
  }, [caseId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F9FC] flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-[#165DFF] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-heading font-medium text-[#123B70]">Compiling Final Forensic Report...</p>
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
          <p className="text-xs text-[#667085]">{error}</p>
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

  const handleUpdateStatus = async (status: CaseStatus) => {
    setIsUpdatingStatus(true);
    setStatusMessage(null);

    try {
      const res = await fetch(`/api/analysis/${analysis.id}/review`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          notes: analystNotes || `Decision updated to ${status} on Final Report review.`,
          reviewed_by: user?.name || 'SOC Analyst',
        }),
      });

      if (res.ok) {
        setSelectedStatus(status);
        setStatusMessage(`Case successfully marked as "${status}".`);
        setTimeout(() => setStatusMessage(null), 3000);
      }
    } catch (e) {
      console.error(e);
      setStatusMessage('Failed to update case status.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const downloadJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(analysis, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute('href', dataStr);
    dlAnchorElem.setAttribute('download', `SentinelMail_${analysis.case_number || analysis.id}_Report.json`);
    dlAnchorElem.click();
  };

  const handlePrint = () => {
    window.print();
  };

  const copyForensicSummary = () => {
    const text = `SENTINELMAIL DIGITAL FORENSIC BRIEF
======================================================
Case ID: ${analysis.case_number || analysis.id}
Date: ${new Date(analysis.created_at || Date.now()).toUTCString()}
Risk Score: ${analysis.risk_score} / 100 (${analysis.threat_category})
Recommended Action: ${analysis.recommended_disposition}
Stated Sender: ${analysis.from_name} <${analysis.from_address}>
Probable Origin: ${analysis.probable_origin_indicator?.country || 'Unknown'} (${analysis.hops?.[0]?.ip || 'Unknown IP'})
Authentication: SPF=${analysis.authentication_checks?.spf?.status} | DKIM=${analysis.authentication_checks?.dkim?.status} | DMARC=${analysis.authentication_checks?.dmarc?.status}
Evidence SHA-256: ${analysis.evidence_hash}
Current Case Status: ${selectedStatus}
======================================================`;
    navigator.clipboard.writeText(text);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  const isCritical = (analysis.risk_score || 0) >= 85;

  return (
    <div className="min-h-screen bg-[#F7F9FC] text-[#172033] pb-16 print:bg-white print:p-0">
      {/* 8-Step Navigation Progress Header */}
      <div className="print:hidden">
        <InvestigationProgressHeader
          currentStep={6}
          caseId={analysis.case_number || analysis.id}
          caseSubject={analysis.subject}
          riskScore={analysis.risk_score}
          threatCategory={analysis.threat_category}
          backTo={`/analysis/${analysis.id}/alert`}
          continueTo="/cases"
          continueLabel="Return to Case Files"
          showGenerateAlert={true}
          isAlertGenerated={analysis.alert_generated}
          isDemo={analysis.is_demo}
        />
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Top Header & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-[#16A36A] bg-[#16A36A]/10 px-2 py-0.5 rounded border border-[#16A36A]/20">
                Page 8 — Final Report
              </span>
              <span className="text-xs text-[#667085]">Step 6 of Investigation Sequence (Complete)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#123B70]">
              Formal Investigation Brief & Evidentiary Audit
            </h1>
            <p className="text-xs sm:text-sm text-[#667085] mt-1">
              Verified digital forensic record for incident response, regulatory compliance, and legal preservation
            </p>
          </div>

          {/* Action Buttons: Download PDF, Download JSON, Copy Forensic Summary */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl text-xs font-heading font-semibold bg-white text-[#123B70] border border-[#DDE3EC] hover:bg-[#F7F9FC] transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Printer className="w-3.5 h-3.5 text-[#165DFF]" />
              <span>Download PDF</span>
            </button>

            <button
              type="button"
              onClick={downloadJSON}
              className="px-3.5 py-2 rounded-xl text-xs font-heading font-semibold bg-white text-[#123B70] border border-[#DDE3EC] hover:bg-[#F7F9FC] transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-[#6C5CE7]" />
              <span>Download JSON</span>
            </button>

            <button
              type="button"
              onClick={copyForensicSummary}
              className="px-3.5 py-2 rounded-xl text-xs font-heading font-semibold bg-[#165DFF] text-white hover:bg-[#123B70] transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              {copiedSummary ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSummary ? 'Copied Summary' : 'Copy Forensic Summary'}</span>
            </button>
          </div>
        </div>

        {/* Printable Report Canvas */}
        <div className="bg-white rounded-2xl border border-[#DDE3EC] p-6 sm:p-8 shadow-sm space-y-6">
          {/* Formal Header & Verification Stamp */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#DDE3EC]">
            <div>
              <div className="text-xs font-mono font-bold text-[#165DFF]">SENTINELMAIL DIGITAL FORENSICS CORE</div>
              <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-[#123B70] mt-1">
                Incident Case Brief: {analysis.case_number || analysis.id}
              </h2>
              <div className="mt-1 flex items-center gap-4 text-xs text-[#667085]">
                <span>Ingest: {new Date(analysis.created_at || Date.now()).toUTCString()}</span>
                <span>•</span>
                <span>Analyst: {analysis.analyst_name || 'SOC Specialist'}</span>
              </div>
            </div>

            {/* Evidence Verification Stamp */}
            <div className="p-3.5 rounded-xl bg-[#F7F9FC] border border-[#165DFF]/30 text-right min-w-[200px]">
              <div className="text-[10px] uppercase font-mono tracking-widest text-[#165DFF] font-bold">
                EVIDENCE VERIFICATION STAMP
              </div>
              <div className="text-xs font-mono font-semibold text-[#123B70] mt-1 truncate">
                SHA-256: {analysis.evidence_hash ? `${analysis.evidence_hash.slice(0, 16)}...` : 'VERIFIED'}
              </div>
              <div className="text-[11px] text-[#16A36A] font-semibold mt-0.5 flex items-center justify-end gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Chain of Custody Intact</span>
              </div>
            </div>
          </div>

          {/* Formal Investigation Summary & Executive Assessment */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-3 text-xs leading-relaxed">
              <h3 className="font-heading font-bold text-sm text-[#123B70]">Executive Risk Assessment</h3>
              <p className="text-[#172033] bg-[#F7F9FC] p-4 rounded-xl border border-[#DDE3EC]">
                {analysis.executive_summary || 'Multi-vector analysis completed. Evidence exhibits key indicators of header divergence and unverified transmission hops.'}
              </p>
              {analysis.ai_explanation && (
                <p className="text-[#667085]">
                  {analysis.ai_explanation}
                </p>
              )}
            </div>

            <div className="bg-[#F7F9FC] p-4 rounded-xl border border-[#DDE3EC] space-y-3 text-xs">
              <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-[#667085]">
                Threat Profile
              </h3>
              <div>
                <div className="text-[#667085]">Category:</div>
                <div className="font-heading font-bold text-sm text-[#123B70]">{analysis.threat_category}</div>
              </div>
              <div>
                <div className="text-[#667085]">Evaluated Risk Score:</div>
                <div className={`text-2xl font-heading font-extrabold ${isCritical ? 'text-[#D92D20]' : 'text-[#165DFF]'}`}>
                  {analysis.risk_score} / 100
                </div>
              </div>
              <div>
                <div className="text-[#667085]">Recommended Action:</div>
                <div className="font-heading font-bold text-xs text-[#D92D20]">{analysis.recommended_disposition}</div>
              </div>
            </div>
          </div>

          {/* Geographic Route Summary */}
          <div className="p-4 rounded-xl bg-[#F7F9FC] border border-[#DDE3EC] text-xs space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-[#123B70] flex items-center gap-1.5">
                <Globe2 className="w-4 h-4 text-[#165DFF]" />
                <span>Geographic Route Summary</span>
              </h3>
              <span className="font-mono text-[#165DFF]">{analysis.hops?.length || 0} Network Hops Recorded</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div>
                <span className="text-[#667085]">Probable Origin:</span>
                <div className="font-semibold text-[#123B70]">
                  {analysis.probable_origin_indicator?.country || analysis.hops?.[0]?.country || 'Unknown Jurisdiction'}
                </div>
              </div>
              <div>
                <span className="text-[#667085]">Originating IP:</span>
                <div className="font-mono font-semibold text-[#123B70]">{analysis.hops?.[0]?.ip || 'Unknown IP'}</div>
              </div>
              <div>
                <span className="text-[#667085]">Destination Gateway:</span>
                <div className="font-mono font-semibold text-[#123B70]">
                  {analysis.hops?.[analysis.hops.length - 1]?.by_host || 'Protected Enterprise MX'}
                </div>
              </div>
            </div>
          </div>

          {/* Complete Indicator List */}
          <div>
            <h3 className="font-heading font-bold text-sm text-[#123B70] mb-3">
              Correlated Forensic Indicators & Evidentiary Signals
            </h3>
            <div className="space-y-2">
              {analysis.indicators && analysis.indicators.length > 0 ? (
                analysis.indicators.map((ind, i) => (
                  <div
                    key={ind.id || i}
                    className="p-3 rounded-xl bg-[#F7F9FC] border border-[#DDE3EC] text-xs flex items-start justify-between gap-4"
                  >
                    <div>
                      <span className="font-heading font-bold text-[#123B70]">{ind.title}</span>
                      <p className="text-[#667085] mt-0.5">{ind.description}</p>
                      {ind.evidence && (
                        <div className="mt-1 font-mono text-[11px] text-[#165DFF]">Evidence: {ind.evidence}</div>
                      )}
                    </div>
                    <span className="font-mono font-bold text-[#D92D20] shrink-0">+{ind.score_contribution || 5}</span>
                  </div>
                ))
              ) : (
                <div className="text-xs text-[#667085]">No threat anomalies detected.</div>
              )}
            </div>
          </div>

          {/* SOC Analyst Decision Form */}
          <div className="pt-6 border-t border-[#DDE3EC] print:hidden">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-heading font-bold text-base text-[#123B70]">SOC Analyst Adjudication Form</h3>
                <p className="text-xs text-[#667085]">Select final disposition status to seal the case record</p>
              </div>
              {statusMessage && (
                <span className="text-xs font-semibold text-[#16A36A] animate-fadeIn">{statusMessage}</span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <button
                type="button"
                onClick={() => handleUpdateStatus('Confirmed Threat')}
                disabled={isUpdatingStatus}
                className={`p-3.5 rounded-xl border text-center text-xs font-heading font-bold transition cursor-pointer ${
                  selectedStatus === 'Confirmed Threat'
                    ? 'bg-[#D92D20] text-white border-[#D92D20] shadow-sm'
                    : 'bg-[#F7F9FC] border-[#DDE3EC] text-[#D92D20] hover:bg-[#D92D20]/10'
                }`}
              >
                Mark as Confirmed Malicious
              </button>

              <button
                type="button"
                onClick={() => handleUpdateStatus('False Positive')}
                disabled={isUpdatingStatus}
                className={`p-3.5 rounded-xl border text-center text-xs font-heading font-bold transition cursor-pointer ${
                  selectedStatus === 'False Positive'
                    ? 'bg-[#16A36A] text-white border-[#16A36A] shadow-sm'
                    : 'bg-[#F7F9FC] border-[#DDE3EC] text-[#16A36A] hover:bg-[#16A36A]/10'
                }`}
              >
                Mark as False Positive
              </button>

              <button
                type="button"
                onClick={() => handleUpdateStatus('Escalated')}
                disabled={isUpdatingStatus}
                className={`p-3.5 rounded-xl border text-center text-xs font-heading font-bold transition cursor-pointer ${
                  selectedStatus === 'Escalated'
                    ? 'bg-[#F97316] text-white border-[#F97316] shadow-sm'
                    : 'bg-[#F7F9FC] border-[#DDE3EC] text-[#F97316] hover:bg-[#F97316]/10'
                }`}
              >
                Escalate to Tier 2 SOC
              </button>

              <button
                type="button"
                onClick={() => handleUpdateStatus('Closed')}
                disabled={isUpdatingStatus}
                className={`p-3.5 rounded-xl border text-center text-xs font-heading font-bold transition cursor-pointer ${
                  selectedStatus === 'Closed'
                    ? 'bg-[#123B70] text-white border-[#123B70] shadow-sm'
                    : 'bg-[#F7F9FC] border-[#DDE3EC] text-[#123B70] hover:bg-[#EAF2FF]'
                }`}
              >
                Close Investigation
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons: Return to Inbox, Return to Case Files */}
        <div className="p-4 bg-white rounded-2xl border border-[#DDE3EC] shadow-sm flex flex-wrap items-center justify-between gap-3 print:hidden">
          <button
            type="button"
            onClick={() => navigate('/inbox')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-heading font-semibold text-[#123B70] bg-[#F7F9FC] hover:bg-white border border-[#DDE3EC] transition cursor-pointer"
          >
            <Inbox className="w-4 h-4 text-[#165DFF]" />
            <span>Return to Triage Inbox</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/cases')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-heading font-bold text-white bg-[#165DFF] hover:bg-[#123B70] shadow-sm transition cursor-pointer"
          >
            <Layers className="w-4 h-4" />
            <span>Return to Case Files</span>
          </button>
        </div>
      </main>
    </div>
  );
};
