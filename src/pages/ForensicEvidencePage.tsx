import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FileText,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Copy,
  Check,
  Hash,
  Paperclip,
  ExternalLink,
  Layers,
  Fingerprint,
  Lock,
  Calendar,
  UserCheck,
  FileCode,
  Bell,
} from 'lucide-react';
import { EmailAnalysis, ExtractedAttachment } from '../types.ts';
import { InvestigationProgressHeader } from '../components/InvestigationProgressHeader.tsx';

function defangUrl(url: string): string {
  if (!url) return '';
  return url
    .replace(/^https:\/\//i, 'hxxps://')
    .replace(/^http:\/\//i, 'hxxp://')
    .replace(/\./g, '[.]');
}

export const ForensicEvidencePage: React.FC = () => {
  const { caseId } = useParams<{ caseId: string }>();
  const navigate = useNavigate();

  const [analysis, setAnalysis] = useState<EmailAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rawHeadersOpen, setRawHeadersOpen] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);
  const [copiedHeaders, setCopiedHeaders] = useState(false);

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
        setError('Unable to load forensic evidence for this case.');
        setLoading(false);
      });
  }, [caseId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F9FC] flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-[#165DFF] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-heading font-medium text-[#123B70]">Loading Forensic Artifacts...</p>
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

  const auth = analysis.authentication_checks;
  const spf = auth?.spf;
  const dkim = auth?.dkim;
  const dmarc = auth?.dmarc;

  const handleCopyHash = () => {
    if (analysis.evidence_hash) {
      navigator.clipboard.writeText(analysis.evidence_hash);
      setCopiedHash(true);
      setTimeout(() => setCopiedHash(false), 2000);
    }
  };

  const handleCopyRawHeaders = () => {
    if (analysis.raw_headers) {
      navigator.clipboard.writeText(analysis.raw_headers);
      setCopiedHeaders(true);
      setTimeout(() => setCopiedHeaders(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] text-[#172033] pb-16">
      {/* 8-Step Navigation Progress Header */}
      <InvestigationProgressHeader
        currentStep={4}
        caseId={analysis.case_number || analysis.id}
        caseSubject={analysis.subject}
        riskScore={analysis.risk_score}
        threatCategory={analysis.threat_category}
        backTo={`/analysis/${analysis.id}/geolocation`}
        continueTo={`/analysis/${analysis.id}/alert`}
        continueLabel="Continue to Alert Generated"
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
                Page 6 — Forensic Evidence
              </span>
              <span className="text-xs text-[#667085]">Step 4 of Investigation Sequence</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#123B70]">
              Cryptographic & Forensic Evidence Review
            </h1>
            <p className="text-xs sm:text-sm text-[#667085] mt-1">
              Immutable chain-of-custody hashes, authentication tokens, and defanged link payloads
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setRawHeadersOpen(!rawHeadersOpen)}
              className="px-3.5 py-2 rounded-xl text-xs font-heading font-semibold bg-white text-[#123B70] border border-[#DDE3EC] hover:bg-[#F7F9FC] transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <FileCode className="w-3.5 h-3.5 text-[#165DFF]" />
              <span>{rawHeadersOpen ? 'Hide Raw RFC-5322 Headers' : 'Inspect Raw RFC-5322 Headers'}</span>
            </button>
          </div>
        </div>

        {/* Collapsible Raw RFC-5322 Headers Viewer */}
        {rawHeadersOpen && (
          <div className="bg-white rounded-2xl border border-[#DDE3EC] p-6 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-[#DDE3EC] mb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#165DFF]" />
                <h3 className="font-heading font-bold text-sm text-[#123B70]">Raw RFC-5322 Ingestion Envelope</h3>
              </div>
              <button
                type="button"
                onClick={handleCopyRawHeaders}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium text-[#165DFF] bg-[#EAF2FF] hover:bg-[#165DFF]/10 transition cursor-pointer"
              >
                {copiedHeaders ? <Check className="w-3.5 h-3.5 text-[#16A36A]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedHeaders ? 'Copied' : 'Copy Headers'}</span>
              </button>
            </div>
            <pre className="p-4 bg-[#F7F9FC] border border-[#DDE3EC] rounded-xl text-[11px] font-mono text-[#172033] max-h-80 overflow-y-auto whitespace-pre-wrap leading-relaxed">
              {analysis.raw_headers || 'No raw headers preserved.'}
            </pre>
          </div>
        )}

        {/* SPF, DKIM and DMARC Verification Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* SPF Card */}
          <div className="bg-white rounded-2xl border border-[#DDE3EC] p-5 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-heading font-bold text-xs uppercase tracking-wider text-[#667085]">
                  SPF Verification
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold uppercase ${
                  spf?.status === 'pass'
                    ? 'bg-[#16A36A]/10 text-[#16A36A] border border-[#16A36A]/30'
                    : 'bg-[#D92D20]/10 text-[#D92D20] border border-[#D92D20]/30'
                }`}>
                  {spf?.status || 'FAIL'}
                </span>
              </div>
              <div className="mt-4 space-y-1 text-xs">
                <div className="text-[#667085]">Domain Checked:</div>
                <div className="font-mono text-[#123B70] font-semibold">{spf?.domain || analysis.from_domain}</div>
              </div>
              <div className="mt-3 text-xs text-[#667085]">
                Sending IP: <span className="font-mono text-[#172033]">{spf?.ip || analysis.hops?.[0]?.ip || 'Unknown'}</span>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-[#DDE3EC] text-xs text-[#667085]">
              {spf?.details || (spf?.status === 'pass' ? 'Sending IP is authorized in SPF DNS record.' : 'Sending IP is NOT authorized in domain SPF record.')}
            </div>
          </div>

          {/* DKIM Card */}
          <div className="bg-white rounded-2xl border border-[#DDE3EC] p-5 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-heading font-bold text-xs uppercase tracking-wider text-[#667085]">
                  DKIM Digital Signature
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold uppercase ${
                  dkim?.status === 'pass'
                    ? 'bg-[#16A36A]/10 text-[#16A36A] border border-[#16A36A]/30'
                    : 'bg-[#D92D20]/10 text-[#D92D20] border border-[#D92D20]/30'
                }`}>
                  {dkim?.status || 'FAIL'}
                </span>
              </div>
              <div className="mt-4 space-y-1 text-xs">
                <div className="text-[#667085]">Signing Domain:</div>
                <div className="font-mono text-[#123B70] font-semibold">{dkim?.domain || analysis.from_domain}</div>
              </div>
              <div className="mt-3 text-xs text-[#667085]">
                Key Selector: <span className="font-mono text-[#172033]">{dkim?.selector || 's1 / default'}</span>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-[#DDE3EC] text-xs text-[#667085]">
              {dkim?.details || (dkim?.status === 'pass' ? 'Cryptographic public key signature validated successfully.' : 'Signature absent or failed cryptographic hash check.')}
            </div>
          </div>

          {/* DMARC Card */}
          <div className="bg-white rounded-2xl border border-[#DDE3EC] p-5 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-heading font-bold text-xs uppercase tracking-wider text-[#667085]">
                  DMARC Policy Alignment
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold uppercase ${
                  dmarc?.status === 'pass'
                    ? 'bg-[#16A36A]/10 text-[#16A36A] border border-[#16A36A]/30'
                    : 'bg-[#D92D20]/10 text-[#D92D20] border border-[#D92D20]/30'
                }`}>
                  {dmarc?.status || 'FAIL'}
                </span>
              </div>
              <div className="mt-4 space-y-1 text-xs">
                <div className="text-[#667085]">Enforced Policy:</div>
                <div className="font-mono text-[#123B70] font-semibold uppercase">{dmarc?.policy || 'Reject / Quarantine'}</div>
              </div>
              <div className="mt-3 text-xs text-[#667085]">
                Alignment Mode: <span className="font-mono text-[#172033]">{dmarc?.disposition || 'Relaxed'}</span>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-[#DDE3EC] text-xs text-[#667085]">
              {dmarc?.details || (dmarc?.status === 'pass' ? 'Sender header aligned with passing SPF/DKIM.' : 'Header From domain does not align with authenticated identity.')}
            </div>
          </div>
        </div>

        {/* Sender Identity Analysis: From, Return-Path, Reply-To, Alignment */}
        <div className="bg-white rounded-2xl border border-[#DDE3EC] p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#DDE3EC]">
            <div>
              <h3 className="font-heading font-bold text-base text-[#123B70]">Sender Identity & Envelope Alignment</h3>
              <p className="text-xs text-[#667085]">Correlation between visible presentation header and invisible transit return addresses</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-heading font-bold ${
              analysis.sender_alignment?.is_aligned
                ? 'bg-[#16A36A]/10 text-[#16A36A] border border-[#16A36A]/30'
                : 'bg-[#D92D20]/10 text-[#D92D20] border border-[#D92D20]/30'
            }`}>
              {analysis.sender_alignment?.is_aligned ? 'Envelope Aligned' : 'Divergent / Misaligned'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-[#F7F9FC] border border-[#DDE3EC]">
              <div className="text-[#667085] font-semibold mb-1">From: Header (Claimed Display)</div>
              <div className="font-heading font-bold text-[#123B70]">{analysis.from_name || 'Display Name'}</div>
              <div className="font-mono text-[#165DFF] mt-1 break-all">{analysis.from_address}</div>
            </div>

            <div className="p-4 rounded-xl bg-[#F7F9FC] border border-[#DDE3EC]">
              <div className="text-[#667085] font-semibold mb-1">Return-Path: (Bounce Address)</div>
              <div className="font-heading font-bold text-[#123B70]">SMTP Envelope Sender</div>
              <div className="font-mono text-[#165DFF] mt-1 break-all">{analysis.return_path || analysis.from_address}</div>
            </div>

            <div className="p-4 rounded-xl bg-[#F7F9FC] border border-[#DDE3EC]">
              <div className="text-[#667085] font-semibold mb-1">Reply-To: Header (Response Routing)</div>
              <div className="font-heading font-bold text-[#123B70]">
                {analysis.reply_to ? (analysis.reply_to !== analysis.from_address ? 'Divergent Response Target' : 'Matches From Header') : 'Default (From Header)'}
              </div>
              <div className={`font-mono mt-1 break-all ${
                analysis.reply_to && analysis.reply_to !== analysis.from_address ? 'text-[#D92D20] font-bold' : 'text-[#165DFF]'
              }`}>
                {analysis.reply_to || analysis.from_address}
              </div>
            </div>
          </div>
        </div>

        {/* Links and Attachments Table */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Defanged Links Table */}
          <div className="bg-white rounded-2xl border border-[#DDE3EC] p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#DDE3EC]">
              <h3 className="font-heading font-bold text-base text-[#123B70]">Extracted & Defanged URLs</h3>
              <span className="text-xs text-[#667085]">{analysis.links?.length || 0} links found</span>
            </div>

            <div className="space-y-2.5 max-h-72 overflow-y-auto">
              {analysis.links && analysis.links.length > 0 ? (
                analysis.links.map((link, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-[#F7F9FC] border border-[#DDE3EC] text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono font-medium text-[#123B70] truncate max-w-xs sm:max-w-md">
                        {defangUrl(link.url)}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-heading font-bold shrink-0 ${
                        link.suspicious ? 'bg-[#D92D20]/10 text-[#D92D20]' : 'bg-[#16A36A]/10 text-[#16A36A]'
                      }`}>
                        {link.suspicious ? 'Suspicious' : 'Clean'}
                      </span>
                    </div>
                    {link.details && (
                      <div className="text-[11px] text-[#667085] mt-1">{link.details}</div>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-xs text-[#667085]">No URLs identified in message body.</div>
              )}
            </div>
          </div>

          {/* Attachments Table */}
          <div className="bg-white rounded-2xl border border-[#DDE3EC] p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#DDE3EC]">
              <h3 className="font-heading font-bold text-base text-[#123B70]">Extracted Attachments & Payloads</h3>
              <span className="text-xs text-[#667085]">{analysis.attachments?.length || 0} files</span>
            </div>

            <div className="space-y-2.5 max-h-72 overflow-y-auto">
              {analysis.attachments && analysis.attachments.length > 0 ? (
                analysis.attachments.map((att: ExtractedAttachment, idx: number) => (
                  <div key={idx} className="p-3 rounded-xl bg-[#F7F9FC] border border-[#DDE3EC] text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-mono font-bold text-[#123B70]">
                        <Paperclip className="w-3.5 h-3.5 text-[#165DFF]" />
                        <span>{att.filename}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-heading font-bold ${
                        att.suspicious ? 'bg-[#D92D20]/10 text-[#D92D20]' : 'bg-[#165DFF]/10 text-[#165DFF]'
                      }`}>
                        {att.suspicious ? 'Suspicious Payload' : 'Standard File'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-[#667085]">
                      <span>Size: {att.size ? `${(att.size / 1024).toFixed(1)} KB` : 'Unknown'}</span>
                      <span>•</span>
                      <span>MIME: {att.contentType || 'application/octet-stream'}</span>
                    </div>
                    {att.sha256 && (
                      <div className="font-mono text-[10px] text-[#667085] truncate bg-white p-1 rounded border border-[#DDE3EC]">
                        SHA-256: {att.sha256}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-xs text-[#667085]">No attachments embedded in this message.</div>
              )}
            </div>
          </div>
        </div>

        {/* Digital Chain of Custody */}
        <div className="bg-white rounded-2xl border border-[#DDE3EC] p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#DDE3EC]">
            <div className="flex items-center gap-2">
              <Fingerprint className="w-5 h-5 text-[#165DFF]" />
              <h3 className="font-heading font-bold text-base text-[#123B70]">Digital Chain of Custody</h3>
            </div>
            <span className="text-xs font-mono text-[#16A36A] bg-[#EAF2FF] px-2.5 py-1 rounded-lg">
              Cryptographically Preserved
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs mb-4">
            <div className="p-3.5 rounded-xl bg-[#F7F9FC] border border-[#DDE3EC]">
              <div className="text-[#667085] mb-1">Evidence Ingest Timestamp:</div>
              <div className="font-mono font-medium text-[#123B70]">
                {analysis.created_at ? new Date(analysis.created_at).toUTCString() : new Date().toUTCString()}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#F7F9FC] border border-[#DDE3EC]">
              <div className="text-[#667085] mb-1">Preserved SHA-256 Evidence Hash:</div>
              <div className="flex items-center justify-between gap-2 font-mono text-[11px] text-[#123B70]">
                <span className="truncate">{analysis.evidence_hash || 'SHA256-PRESERVED'}</span>
                <button
                  type="button"
                  onClick={handleCopyHash}
                  className="p-1 rounded hover:bg-white text-[#165DFF] cursor-pointer"
                  title="Copy SHA-256"
                >
                  {copiedHash ? <Check className="w-3 h-3 text-[#16A36A]" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#F7F9FC] border border-[#DDE3EC]">
              <div className="text-[#667085] mb-1">Analyst Clearance & Review:</div>
              <div className="font-medium text-[#123B70]">
                {analysis.analyst_name || 'SOC Specialist'} — Status: <span className="text-[#165DFF]">{analysis.status || 'Active'}</span>
              </div>
            </div>
          </div>

          {/* Audit Trail List */}
          <div className="space-y-2">
            {analysis.chain_of_custody && analysis.chain_of_custody.length > 0 ? (
              analysis.chain_of_custody.map((entry, i) => (
                <div key={entry.id || i} className="p-2.5 rounded-lg bg-[#F7F9FC] text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#165DFF]" />
                    <span className="font-medium text-[#123B70]">{entry.action}</span>
                    <span className="text-[#667085]">• {entry.actor}</span>
                  </div>
                  <span className="font-mono text-[11px] text-[#667085]">
                    {new Date(entry.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-xs text-[#667085]">Initial forensic custody entry created upon evidence ingestion.</div>
            )}
          </div>
        </div>

        {/* Bottom Sequence Navigation Bar */}
        <div className="p-4 bg-white rounded-2xl border border-[#DDE3EC] shadow-sm flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate(`/analysis/${analysis.id}/geolocation`)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium text-[#172033] bg-[#F7F9FC] hover:bg-white border border-[#DDE3EC] transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-[#667085]" />
            <span>Back to Route Traced</span>
          </button>

          <button
            type="button"
            onClick={() => navigate(`/analysis/${analysis.id}/alert`)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-heading font-bold text-white bg-[#165DFF] hover:bg-[#123B70] shadow-sm transition cursor-pointer"
          >
            <span>Continue to Alert Generated</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </main>
    </div>
  );
};
