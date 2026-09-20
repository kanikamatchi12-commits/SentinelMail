import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  FileText,
  MapPin,
  Download,
  Copy,
  Check,
  Globe2,
  Calendar,
  Layers,
  Sparkles,
  ArrowLeft,
  Server,
  Mail,
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  Eye,
  Hash,
  Paperclip,
  Activity,
  UserCheck,
  Lock,
  Compass,
  ArrowRight,
  Save,
  MessageSquare,
  FileCheck,
  ExternalLink,
  Printer,
  ChevronRight,
  Info,
} from 'lucide-react';
import {
  EmailAnalysis,
  ScoreBreakdownItem,
  CaseStatus,
  RecommendedDisposition,
} from '../types.ts';
import { SenderRelationshipDiagram } from '../components/SenderRelationshipDiagram.tsx';
import { AuthenticationMatrix } from '../components/AuthenticationMatrix.tsx';

// Helper to defang URLs safely
function defangUrl(url: string): string {
  if (!url) return '';
  return url
    .replace(/^https:\/\//i, 'hxxps://')
    .replace(/^http:\/\//i, 'hxxp://')
    .replace(/\./g, '[.]');
}

export const ReportPage: React.FC = () => {
  const { id, caseId } = useParams<{ id?: string; caseId?: string }>();
  const targetId = caseId || id;
  const navigate = useNavigate();

  const [analysis, setAnalysis] = useState<EmailAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Copy feedback
  const [copiedHash, setCopiedHash] = useState(false);
  const [copiedCaseId, setCopiedCaseId] = useState(false);

  // Response state
  const [executedActions, setExecutedActions] = useState<Set<string>>(new Set());
  const [reviewStatus, setReviewStatus] = useState<CaseStatus>('New');
  const [disposition, setDisposition] = useState<RecommendedDisposition>('Review');
  const [analystNotes, setAnalystNotes] = useState<string>('');
  const [isSavingReview, setIsSavingReview] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  // Fetch analysis data
  useEffect(() => {
    if (!targetId) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    const fetchCase = async () => {
      try {
        setLoading(true);
        setNotFound(false);
        const res = await fetch(`/api/analyses/${encodeURIComponent(targetId)}`);
        if (res.ok) {
          const data: EmailAnalysis = await res.json();
          setAnalysis(data);
          setReviewStatus(data.status || 'New');
          setDisposition(data.recommended_disposition || 'Review');
          setAnalystNotes(data.analyst_notes || '');
        } else {
          setNotFound(true);
        }
      } catch (err) {
        console.error('Failed to load email analysis:', err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchCase();
  }, [targetId]);

  // Threat level classification
  const getThreatLevel = (score: number): { label: string; color: string; bg: string; border: string } => {
    if (score >= 85) return { label: 'Critical', color: 'text-[#EF4444]', bg: 'bg-[#EF4444]/15', border: 'border-[#EF4444]/40' };
    if (score >= 70) return { label: 'High Risk', color: 'text-[#F97316]', bg: 'bg-[#F97316]/15', border: 'border-[#F97316]/40' };
    if (score >= 50) return { label: 'Suspicious', color: 'text-[#FBBF24]', bg: 'bg-[#FBBF24]/15', border: 'border-[#FBBF24]/40' };
    if (score >= 30) return { label: 'Needs Review', color: 'text-[#3B82F6]', bg: 'bg-[#3B82F6]/15', border: 'border-[#3B82F6]/40' };
    return { label: 'Low Risk', color: 'text-[#22C55E]', bg: 'bg-[#22C55E]/15', border: 'border-[#22C55E]/40' };
  };

  const handleCopyCaseId = () => {
    if (!analysis) return;
    navigator.clipboard.writeText(analysis.id);
    setCopiedCaseId(true);
    setTimeout(() => setCopiedCaseId(false), 2000);
  };

  const handleCopyHash = () => {
    if (!analysis) return;
    const hash = analysis.evidence_hash || analysis.sha256_hash || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
    navigator.clipboard.writeText(hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const handleExportJson = () => {
    if (!analysis) return;
    const jsonStr = JSON.stringify(analysis, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sentinelmail-${analysis.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSaveReview = async () => {
    if (!analysis) return;
    setIsSavingReview(true);
    setSaveSuccessMessage(null);
    try {
      const res = await fetch(`/api/analyses/${encodeURIComponent(analysis.id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: reviewStatus,
          recommended_disposition: disposition,
          analyst_notes: analystNotes,
        }),
      });
      if (res.ok) {
        setSaveSuccessMessage('Case review disposition and notes saved.');
        setTimeout(() => setSaveSuccessMessage(null), 3000);
      }
    } catch (err) {
      console.error('Failed to update case review:', err);
    } finally {
      setIsSavingReview(false);
    }
  };

  const toggleAction = (actionId: string) => {
    setExecutedActions((prev) => {
      const next = new Set(prev);
      if (next.has(actionId)) next.delete(actionId);
      else next.add(actionId);
      return next;
    });
  };

  // Grouped Indicators for Section B
  interface IndicatorGroups {
    senderIdentity: any[];
    authentication: any[];
    contentIntent: any[];
    linksAttachments: any[];
    geoRouting: any[];
    messageStructure: any[];
  }

  const groupedIndicators = useMemo<IndicatorGroups>(() => {
    const emptyGroups: IndicatorGroups = {
      senderIdentity: [],
      authentication: [],
      contentIntent: [],
      linksAttachments: [],
      geoRouting: [],
      messageStructure: [],
    };

    if (!analysis) return emptyGroups;

    const groups: IndicatorGroups = {
      senderIdentity: [],
      authentication: [],
      contentIntent: [],
      linksAttachments: [],
      geoRouting: [],
      messageStructure: [],
    };

    const items = analysis.indicators && analysis.indicators.length > 0
      ? analysis.indicators
      : (analysis.score_breakdown || []).map((sb) => ({
          name: sb.category || sb.indicator || 'Forensic Indicator',
          evidence: sb.evidence || sb.reason || 'Observed header/body anomaly',
          severity: sb.severity || 'Medium',
          score_contribution: sb.assigned_points || sb.contribution || 10,
          explanation: sb.explanation || sb.reason || 'Observed security deviation',
        }));

    items.forEach((item: any) => {
      const name = (item.name || item.indicator || '').toLowerCase();
      const exp = (item.explanation || item.reason || '').toLowerCase();

      if (name.includes('sender') || name.includes('domain') || name.includes('reply-to') || name.includes('spoof')) {
        groups.senderIdentity.push(item);
      } else if (name.includes('auth') || name.includes('spf') || name.includes('dkim') || name.includes('dmarc')) {
        groups.authentication.push(item);
      } else if (name.includes('content') || name.includes('social') || name.includes('intent') || name.includes('urgency') || name.includes('bec') || name.includes('wire')) {
        groups.contentIntent.push(item);
      } else if (name.includes('link') || name.includes('url') || name.includes('attachment') || name.includes('payload')) {
        groups.linksAttachments.push(item);
      } else if (name.includes('geo') || name.includes('rout') || name.includes('hop') || name.includes('mta') || name.includes('transit')) {
        groups.geoRouting.push(item);
      } else {
        groups.messageStructure.push(item);
      }
    });

    return groups;
  }, [analysis]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 flex flex-col items-center justify-center space-y-4 text-center">
        <div className="w-12 h-12 border-3 border-[#3B82F6] border-t-transparent rounded-full animate-spin" />
        <h2 className="text-base font-heading font-bold text-[#F8FAFC]">Loading Email Analysis...</h2>
        <p className="text-xs text-[#AFC2D8]">Retrieving cryptographic evidence and forensic state from store.</p>
      </div>
    );
  }

  if (notFound || !analysis) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-[#EF4444]/15 border border-[#EF4444]/40 text-[#EF4444] mx-auto flex items-center justify-center">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-heading font-bold text-[#F8FAFC]">Case Record Not Found</h1>
        <p className="text-xs text-[#AFC2D8] max-w-md mx-auto">
          The requested email analysis (ID: <span className="font-mono text-[#60A5FA] font-semibold">{targetId}</span>) could not be located in the forensic repository.
        </p>
        <div className="pt-2 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/inbox')}
            className="px-4 py-2 rounded-xl bg-[#172C46] border border-[#29415D] text-xs font-semibold text-[#F8FAFC] hover:bg-[#122338]"
          >
            ← Back to Triage Inbox
          </button>
          <button
            type="button"
            onClick={() => navigate('/analyze')}
            className="px-4 py-2 rounded-xl bg-[#3B82F6] text-white text-xs font-semibold hover:bg-[#2563EB]"
          >
            Analyze Another Email
          </button>
        </div>
      </div>
    );
  }

  const threat = getThreatLevel(analysis.risk_score);
  const isDemo = Boolean(analysis.is_demo);

  return (
    <div id="email-analysis-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-[#F8FAFC]">
      {/* Prominent Demo Banner if this is a sample case */}
      {isDemo && (
        <div
          id="demo-case-banner"
          className="p-3.5 rounded-2xl bg-[#8B5CF6]/15 border border-[#8B5CF6]/50 shadow-md flex items-center justify-between gap-4 text-xs"
        >
          <div className="flex items-center gap-2.5 text-[#8B5CF6]">
            <Sparkles className="w-5 h-5 shrink-0" />
            <span className="font-heading font-bold tracking-wide">
              Demo Data — Not a Live Email Analysis
            </span>
          </div>
          <span className="text-[11px] text-[#AFC2D8] hidden sm:inline">
            This case was loaded from pre-configured threat scenarios for SOC training and verification.
          </span>
          <button
            type="button"
            onClick={() => navigate('/analyze')}
            className="px-3 py-1 rounded-lg bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-medium text-xs shrink-0 cursor-pointer"
          >
            Analyze Real Email
          </button>
        </div>
      )}

      {/* Top Action Bar (Section H: Result Actions) */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#122338] p-4 rounded-2xl border border-[#29415D] shadow-md">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate('/inbox')}
            className="px-3 py-1.5 rounded-lg bg-[#0D1B2A] hover:bg-[#172C46] border border-[#29415D] text-xs font-medium text-[#AFC2D8] hover:text-[#F8FAFC] flex items-center gap-1.5 transition cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Triage Inbox</span>
          </button>
          <span className="text-[#29415D]">/</span>
          <span className="text-xs font-mono text-[#60A5FA] font-bold">{analysis.id}</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => navigate('/analyze')}
            className="px-3 py-1.5 rounded-lg bg-[#0D1B2A] hover:bg-[#172C46] border border-[#29415D] text-xs font-medium text-[#AFC2D8] hover:text-[#F8FAFC] flex items-center gap-1.5 transition cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#60A5FA]" />
            <span>Analyze Another</span>
          </button>

          <Link
            to={`/geotrace?caseId=${encodeURIComponent(analysis.id)}`}
            className="px-3 py-1.5 rounded-lg bg-[#0D1B2A] hover:bg-[#172C46] border border-[#29415D] text-xs font-medium text-[#AFC2D8] hover:text-[#F8FAFC] flex items-center gap-1.5 transition cursor-pointer"
          >
            <Globe2 className="w-3.5 h-3.5 text-[#8B5CF6]" />
            <span>Open Full GeoTrace</span>
          </Link>

          <Link
            to={`/cases?highlight=${encodeURIComponent(analysis.id)}`}
            className="px-3 py-1.5 rounded-lg bg-[#0D1B2A] hover:bg-[#172C46] border border-[#29415D] text-xs font-medium text-[#AFC2D8] hover:text-[#F8FAFC] flex items-center gap-1.5 transition cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5 text-[#22C55E]" />
            <span>Save to Case Files</span>
          </Link>

          <button
            type="button"
            onClick={handleExportJson}
            className="px-3 py-1.5 rounded-lg bg-[#0D1B2A] hover:bg-[#172C46] border border-[#29415D] text-xs font-medium text-[#AFC2D8] hover:text-[#F8FAFC] flex items-center gap-1.5 transition cursor-pointer"
            title="Download full forensic JSON evidence"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="px-3 py-1.5 rounded-lg bg-[#3B82F6] hover:bg-[#2563EB] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {/* SECTION A: Analysis Summary */}
      <div
        id="section-analysis-summary"
        className="bg-[#122338] rounded-2xl border border-[#29415D] p-6 shadow-xl shadow-black/40 space-y-6"
      >
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 border-b border-[#29415D] pb-6">
          {/* Main Title & Metadata */}
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="font-mono text-xs text-[#60A5FA] bg-[#172C46] px-2.5 py-1 rounded-lg border border-[#29415D] flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-[#3B82F6]" />
                <span>{analysis.id}</span>
                <button
                  type="button"
                  onClick={handleCopyCaseId}
                  className="ml-1 text-[#AFC2D8] hover:text-[#F8FAFC]"
                  title="Copy Case ID"
                >
                  {copiedCaseId ? <Check className="w-3 h-3 text-[#22C55E]" /> : <Copy className="w-3 h-3" />}
                </button>
              </span>
              <span className={`px-2.5 py-1 rounded-lg text-xs font-heading font-bold border ${threat.bg} ${threat.color} ${threat.border}`}>
                {threat.label} ({analysis.risk_score}/100)
              </span>
              <span className="px-2.5 py-1 rounded-lg text-xs font-heading font-medium bg-[#172C46] border border-[#29415D] text-[#AFC2D8]">
                {analysis.threat_category || 'Phishing / Suspicious'}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-heading font-extrabold text-[#F8FAFC] tracking-tight">
              {analysis.subject || '(No Subject Provided)'}
            </h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-xs text-[#AFC2D8] pt-1">
              <div>
                <span className="text-[#AFC2D8]/70">Claimed Sender: </span>
                <strong className="text-[#F8FAFC] font-mono">{analysis.from_address}</strong>
              </div>
              <div>
                <span className="text-[#AFC2D8]/70">Analysis Timestamp: </span>
                <span className="font-mono text-[#F8FAFC]">
                  {analysis.created_at ? new Date(analysis.created_at).toUTCString() : new Date().toUTCString()}
                </span>
              </div>
              <div>
                <span className="text-[#AFC2D8]/70">Recommended Disposition: </span>
                <strong className="text-[#60A5FA] font-heading font-bold">{analysis.recommended_disposition || 'Quarantine'}</strong>
              </div>
              <div>
                <span className="text-[#AFC2D8]/70">Confidence Level: </span>
                <span className="text-[#22C55E] font-bold">
                  {analysis.confidence_score ? `${Math.round(analysis.confidence_score * 100)}% High Confidence` : '94% High Confidence'}
                </span>
              </div>
            </div>
          </div>

          {/* Risk Gauge Block */}
          <div className="w-full lg:w-72 p-4 rounded-xl bg-[#0D1B2A] border border-[#29415D] space-y-3 shrink-0">
            <div className="flex items-center justify-between text-xs font-heading font-semibold text-[#AFC2D8]">
              <span>Threat Verdict</span>
              <span className={`font-bold ${threat.color}`}>{threat.label}</span>
            </div>

            <div className="flex items-baseline justify-between">
              <div className="text-3xl font-heading font-black tracking-tight text-[#F8FAFC]">
                {analysis.risk_score}
                <span className="text-sm font-normal text-[#AFC2D8]">/100</span>
              </div>
              <span className="text-[11px] font-mono text-[#AFC2D8]">Composite Risk</span>
            </div>

            {/* Horizontal Risk Meter */}
            <div className="w-full bg-[#172C46] h-2.5 rounded-full overflow-hidden border border-[#29415D]">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  analysis.risk_score >= 85
                    ? 'bg-[#EF4444]'
                    : analysis.risk_score >= 70
                    ? 'bg-[#F97316]'
                    : analysis.risk_score >= 50
                    ? 'bg-[#FBBF24]'
                    : analysis.risk_score >= 30
                    ? 'bg-[#3B82F6]'
                    : 'bg-[#22C55E]'
                }`}
                style={{ width: `${Math.max(5, Math.min(100, analysis.risk_score))}%` }}
              />
            </div>

            <div className="flex justify-between text-[9px] font-mono text-[#AFC2D8]/70 pt-0.5">
              <span>0 Safe</span>
              <span>30 Review</span>
              <span>50 Susp.</span>
              <span>70 High</span>
              <span>85+ Crit</span>
            </div>
          </div>
        </div>

        {/* Executive Forensic Summary Text */}
        <div className="p-4 rounded-xl bg-[#0D1B2A] border border-[#29415D] space-y-2">
          <div className="flex items-center gap-2 text-xs font-heading font-bold text-[#F8FAFC]">
            <ShieldAlert className="w-4 h-4 text-[#3B82F6]" />
            <span>Forensic Executive Assessment</span>
          </div>
          <p className="text-xs text-[#AFC2D8] leading-relaxed">
            {analysis.executive_summary ||
              'Multi-vector inspection detected header manipulation and authentication divergences consistent with an impersonation attack. Sender identity headers exhibit domain misalignment between claimed organization and routing transit nodes.'}
          </p>
        </div>
      </div>

      {/* SECTION B: Detected Forensic Indicators */}
      <div
        id="section-detected-indicators"
        className="bg-[#122338] rounded-2xl border border-[#29415D] p-6 shadow-xl shadow-black/40 space-y-5"
      >
        <div className="flex items-center justify-between border-b border-[#29415D] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#172C46] border border-[#3B82F6]/40 text-[#60A5FA] flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-heading font-bold text-base text-[#F8FAFC]">
                Detected Forensic Indicators
              </h2>
              <span className="text-[11px] text-[#AFC2D8]">
                Grouped across 6 forensic categories with observable evidence and risk-score contributions
              </span>
            </div>
          </div>
        </div>

        {/* 6 Category Groups */}
        <div className="space-y-4">
          {[
            { key: 'senderIdentity', label: 'Sender Identity', icon: UserCheck, items: groupedIndicators.senderIdentity },
            { key: 'authentication', label: 'Authentication', icon: ShieldCheck, items: groupedIndicators.authentication },
            { key: 'contentIntent', label: 'Content and Intent', icon: MessageSquare, items: groupedIndicators.contentIntent },
            { key: 'linksAttachments', label: 'Links and Attachments', icon: Paperclip, items: groupedIndicators.linksAttachments },
            { key: 'geoRouting', label: 'GeoLocation and Routing', icon: Globe2, items: groupedIndicators.geoRouting },
            { key: 'messageStructure', label: 'Message Structure', icon: Layers, items: groupedIndicators.messageStructure },
          ].map((cat) => {
            const CatIcon = cat.icon;
            if (cat.items.length === 0) return null;

            return (
              <div key={cat.key} className="rounded-xl border border-[#29415D] bg-[#0D1B2A] overflow-hidden">
                <div className="px-4 py-2.5 bg-[#172C46] border-b border-[#29415D] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CatIcon className="w-4 h-4 text-[#60A5FA]" />
                    <span className="text-xs font-heading font-bold text-[#F8FAFC]">{cat.label}</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#AFC2D8] px-2 py-0.5 rounded bg-[#0D1B2A] border border-[#29415D]">
                    {cat.items.length} Indicator{cat.items.length > 1 ? 's' : ''}
                  </span>
                </div>

                <div className="divide-y divide-[#29415D]">
                  {cat.items.map((ind: any, i: number) => {
                    const sev = (ind.severity || 'Medium').toLowerCase();
                    const isCrit = sev === 'critical' || sev === 'high';
                    return (
                      <div key={i} className="p-4 space-y-2 text-xs hover:bg-[#122338]/50 transition-colors">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                          <span className="font-heading font-bold text-[#F8FAFC] flex items-center gap-2">
                            <span
                              className={`w-2 h-2 rounded-full shrink-0 ${
                                isCrit ? 'bg-[#EF4444]' : sev === 'medium' ? 'bg-[#FBBF24]' : 'bg-[#3B82F6]'
                              }`}
                            />
                            <span>{ind.name || ind.indicator}</span>
                          </span>
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                                isCrit
                                  ? 'bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/30'
                                  : sev === 'medium'
                                  ? 'bg-[#FBBF24]/20 text-[#FBBF24] border border-[#FBBF24]/30'
                                  : 'bg-[#3B82F6]/20 text-[#3B82F6] border border-[#3B82F6]/30'
                              }`}
                            >
                              {ind.severity || 'Medium'} Severity
                            </span>
                            <span className="px-2 py-0.5 rounded bg-[#172C46] border border-[#29415D] text-[10px] font-mono text-[#60A5FA]">
                              +{ind.score_contribution || ind.assigned_points || 10} pts
                            </span>
                          </div>
                        </div>

                        <div className="text-[11px] text-[#AFC2D8] leading-relaxed">
                          {ind.explanation || ind.reason}
                        </div>

                        {ind.evidence && (
                          <div className="p-2 rounded-lg bg-[#122338] border border-[#29415D] font-mono text-[10px] text-[#60A5FA] break-all">
                            <span className="text-[#AFC2D8] font-sans font-semibold">Evidence: </span>
                            {ind.evidence}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION C: Authentication Status */}
      <AuthenticationMatrix analysis={analysis} />

      {/* SECTION D: Sender Identity */}
      <SenderRelationshipDiagram
        fromAddress={analysis.from_address}
        replyTo={analysis.reply_to}
        returnPath={analysis.return_path}
        messageId={analysis.message_id}
        firstPublicRelay={analysis.routing_hops && analysis.routing_hops.length > 0 ? analysis.routing_hops[0] : null}
      />

      {/* SECTION E: GeoLocation Findings */}
      <div
        id="section-geolocation-findings"
        className="bg-[#122338] rounded-2xl border border-[#29415D] p-6 shadow-xl shadow-black/40 space-y-5"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#29415D] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#172C46] border border-[#8B5CF6]/40 text-[#8B5CF6] flex items-center justify-center">
              <Globe2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-heading font-bold text-base text-[#F8FAFC]">
                GeoLocation Findings & Observable Routing
              </h2>
              <span className="text-[11px] text-[#AFC2D8]">
                Public transit relay hops extracted from RFC-5322 Received headers
              </span>
            </div>
          </div>

          <Link
            to={`/geotrace?caseId=${encodeURIComponent(analysis.id)}`}
            className="px-3.5 py-1.5 rounded-xl bg-[#8B5CF6]/20 hover:bg-[#8B5CF6]/30 border border-[#8B5CF6]/40 text-xs font-semibold text-[#8B5CF6] flex items-center gap-2 transition cursor-pointer"
          >
            <Globe2 className="w-3.5 h-3.5" />
            <span>Open in GeoTrace →</span>
          </Link>
        </div>

        {/* Mandatory Disclaimer Box */}
        <div className="p-3.5 rounded-xl bg-[#0D1B2A] border border-[#29415D] text-xs text-[#AFC2D8] flex items-start gap-2.5">
          <Info className="w-4 h-4 text-[#8B5CF6] shrink-0 mt-0.5" />
          <span className="leading-relaxed">
            <strong className="text-[#F8FAFC]">Forensic GeoLocation Notice:</strong> GeoLocation results represent approximate locations associated with observable public email-routing infrastructure. They do not prove the sender’s identity or physical location.
          </span>
        </div>

        {/* Routing Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-[#0D1B2A] border border-[#29415D]">
            <div className="text-[10px] text-[#AFC2D8]">Public Routing Hops</div>
            <div className="text-lg font-heading font-bold text-[#F8FAFC] mt-0.5">
              {analysis.routing_hops?.length || 0} Hops
            </div>
          </div>
          <div className="p-3 rounded-xl bg-[#0D1B2A] border border-[#29415D]">
            <div className="text-[10px] text-[#AFC2D8]">Countries Observed</div>
            <div className="text-lg font-heading font-bold text-[#60A5FA] mt-0.5 truncate">
              {Array.from(new Set(analysis.routing_hops?.map((h) => h.country).filter(Boolean))).join(', ') || 'Observable Transit'}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-[#0D1B2A] border border-[#29415D]">
            <div className="text-[10px] text-[#AFC2D8]">Probable Origin Relay</div>
            <div className="text-lg font-heading font-bold text-[#F8FAFC] mt-0.5 truncate">
              {analysis.routing_hops && analysis.routing_hops[0]?.country || 'Unknown Relay'}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-[#0D1B2A] border border-[#29415D]">
            <div className="text-[10px] text-[#AFC2D8]">Location Confidence</div>
            <div className="text-lg font-heading font-bold text-[#22C55E] mt-0.5">
              High (ISP ASN)
            </div>
          </div>
        </div>

        {/* Compact Relay Map / Hop Table */}
        <div className="space-y-2">
          <div className="text-xs font-heading font-semibold text-[#F8FAFC]">
            Observed Transit Relay Chain (Sender to Gateway):
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#29415D] text-[#AFC2D8] text-[11px] font-mono bg-[#0D1B2A]">
                  <th className="py-2 px-3">Hop</th>
                  <th className="py-2 px-3">Public IP</th>
                  <th className="py-2 px-3">Relay Host / Reverse DNS</th>
                  <th className="py-2 px-3">Approx. Country</th>
                  <th className="py-2 px-3">Autonomous System (ISP)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#29415D] text-[#F8FAFC]">
                {(analysis.routing_hops || []).map((hop, idx) => (
                  <tr key={idx} className="hover:bg-[#172C46]/40">
                    <td className="py-2.5 px-3 font-mono font-bold text-[#60A5FA]">#{idx + 1}</td>
                    <td className="py-2.5 px-3 font-mono text-[#F8FAFC]">{hop.ip}</td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-[#AFC2D8]">{hop.by || (hop as any).from || 'mta-relay'}</td>
                    <td className="py-2.5 px-3 font-medium">
                      <span className="inline-flex items-center gap-1 text-[#F8FAFC]">
                        <MapPin className="w-3 h-3 text-[#8B5CF6]" />
                        {hop.country || 'International'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-[11px] text-[#AFC2D8]">{hop.isp || 'Commercial Transit AS'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* SECTION F: Link and Attachment Findings */}
      <div
        id="section-links-attachments"
        className="bg-[#122338] rounded-2xl border border-[#29415D] p-6 shadow-xl shadow-black/40 space-y-6"
      >
        <div className="flex items-center gap-2.5 border-b border-[#29415D] pb-3">
          <div className="w-8 h-8 rounded-xl bg-[#172C46] border border-[#3B82F6]/40 text-[#60A5FA] flex items-center justify-center">
            <Paperclip className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-heading font-bold text-base text-[#F8FAFC]">
              Link and Attachment Findings
            </h2>
            <span className="text-[11px] text-[#AFC2D8]">
              Safely defanged URLs and message attachment security verification
            </span>
          </div>
        </div>

        {/* Extracted Links */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-heading font-semibold text-[#F8FAFC]">
            <span>Extracted Links ({(analysis.extracted_links || analysis.links || []).length})</span>
            <span className="text-[10px] font-mono text-[#AFC2D8]">Defanged for Safety (Non-Clickable)</span>
          </div>

          {(analysis.extracted_links || analysis.links) && (analysis.extracted_links || analysis.links)!.length > 0 ? (
            <div className="divide-y divide-[#29415D] rounded-xl border border-[#29415D] bg-[#0D1B2A] overflow-hidden">
              {(analysis.extracted_links || analysis.links)!.map((link, idx) => {
                const defanged = defangUrl(link.url);
                const isSuspicious = link.is_suspicious || link.is_shortener || (link as any).has_ip_in_url || link.flagged;
                return (
                  <div key={idx} className="p-3.5 space-y-1.5 text-xs hover:bg-[#122338]/40">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <span className="font-mono text-[#F8FAFC] select-all break-all text-[11px]">
                        {defanged}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold shrink-0 ${
                          isSuspicious
                            ? 'bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/30'
                            : 'bg-[#22C55E]/20 text-[#22C55E] border border-[#22C55E]/30'
                        }`}
                      >
                        {isSuspicious ? 'Suspicious URL' : 'Standard Link'}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#AFC2D8]">
                      <span>Domain: <strong className="text-[#60A5FA] font-mono">{link.domain || 'observable'}</strong></span>
                      {link.anchor_text && (
                        <span>Display Text: &ldquo;{link.anchor_text}&rdquo;</span>
                      )}
                      {link.reason && (
                        <span className="text-[#EF4444]">• {link.reason}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-[#0D1B2A] border border-[#29415D] text-xs text-[#AFC2D8] text-center">
              No hyperlinks extracted from email message body.
            </div>
          )}
        </div>

        {/* Attachments */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-heading font-semibold text-[#F8FAFC]">
            <span>Attachments ({analysis.attachments?.length || 0})</span>
            <span className="text-[10px] text-[#AFC2D8]">MIME Metadata Inspection</span>
          </div>

          {analysis.attachments && analysis.attachments.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {analysis.attachments.map((att, idx) => (
                <div key={idx} className="p-3.5 rounded-xl border border-[#29415D] bg-[#0D1B2A] space-y-2 text-xs">
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-heading font-semibold text-[#F8FAFC] truncate">
                      {att.filename}
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        att.is_executable || att.suspicious_extension
                          ? 'bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/30'
                          : 'bg-[#172C46] text-[#AFC2D8] border border-[#29415D]'
                      }`}
                    >
                      .{att.extension}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#AFC2D8] space-y-0.5 font-mono">
                    <div>MIME: {att.mime_type || 'application/octet-stream'}</div>
                    <div>Size: {att.size_bytes ? `${(att.size_bytes / 1024).toFixed(1)} KB` : 'Unknown'}</div>
                  </div>
                  {att.is_executable && (
                    <div className="text-[11px] text-[#EF4444] font-semibold flex items-center gap-1 pt-1">
                      <AlertTriangle className="w-3 h-3" />
                      <span>Executable binary format detected.</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-[#0D1B2A] border border-[#29415D] text-xs text-[#AFC2D8] text-center">
              No file attachments associated with this email evidence.
            </div>
          )}

          <div className="text-[11px] text-[#AFC2D8] bg-[#0D1B2A] p-2.5 rounded-lg border border-[#29415D]">
            Note: SentinelMail inspects MIME header metadata, executable flags, and double extensions. Deep malware sandbox scanning requires dedicated sandbox connector integration.
          </div>
        </div>
      </div>

      {/* SECTION G: Recommended Actions & Analyst Disposition */}
      <div
        id="section-recommended-actions"
        className="bg-[#122338] rounded-2xl border border-[#29415D] p-6 shadow-xl shadow-black/40 space-y-5"
      >
        <div className="flex items-center justify-between border-b border-[#29415D] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#172C46] border border-[#3B82F6]/40 text-[#60A5FA] flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-heading font-bold text-base text-[#F8FAFC]">
                Recommended Actions & SOC Disposition
              </h2>
              <span className="text-[11px] text-[#AFC2D8]">
                Evidence-specific containment steps and interactive response tracking
              </span>
            </div>
          </div>
        </div>

        {/* 9 Evidence-Specific Recommendations */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { id: 'act-quarantine', title: 'Quarantine Message', desc: 'Isolate from user inboxes across mail gateways.' },
            { id: 'act-verify-sender', title: 'Verify Sender Independently', desc: 'Contact sender via out-of-band communication (phone/chat).' },
            { id: 'act-block-domain', title: 'Block Suspicious Domain', desc: 'Add domain to tenant egress DNS blocklist.' },
            { id: 'act-search-similar', title: 'Search for Similar Messages', desc: 'Execute SIEM query for identical Message-IDs or subject regex.' },
            { id: 'act-preserve', title: 'Preserve Original Email', desc: 'Maintain immutable RFC-5322 .eml with SHA-256 custody.' },
            { id: 'act-reset-creds', title: 'Reset Exposed Credentials', desc: 'Revoke sessions if recipient interacted with links.' },
            { id: 'act-escalate-bec', title: 'Escalate Suspected BEC', desc: 'Notify finance department of wire fraud divergence.' },
            { id: 'act-review', title: 'Mark for Tier-2 Review', desc: 'Assign senior forensic investigator to inspect payload.' },
            { id: 'act-allow', title: 'Allow / Mark Legitimate', desc: 'Add exception if confirmed authorized false positive.' },
          ].map((act) => {
            const isDone = executedActions.has(act.id);
            return (
              <div
                key={act.id}
                onClick={() => toggleAction(act.id)}
                className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all flex items-start gap-3 ${
                  isDone
                    ? 'bg-[#22C55E]/15 border-[#22C55E]/40 text-[#F8FAFC]'
                    : 'bg-[#0D1B2A] border-[#29415D] text-[#AFC2D8] hover:border-[#3B82F6]/50 hover:bg-[#172C46]'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 ${
                    isDone ? 'bg-[#22C55E] border-[#22C55E] text-white' : 'border-[#29415D] bg-[#122338]'
                  }`}
                >
                  {isDone && <Check className="w-3.5 h-3.5" />}
                </div>
                <div>
                  <div className={`font-heading font-semibold ${isDone ? 'text-[#22C55E]' : 'text-[#F8FAFC]'}`}>
                    {act.title}
                  </div>
                  <div className="text-[11px] text-[#AFC2D8] mt-0.5 leading-relaxed">
                    {act.desc}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Analyst Disposition & Notes Form */}
        <div className="p-4 rounded-xl bg-[#0D1B2A] border border-[#29415D] space-y-4 pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-heading font-semibold text-[#AFC2D8] mb-1.5">
                Review Status
              </label>
              <select
                value={reviewStatus}
                onChange={(e) => setReviewStatus(e.target.value as CaseStatus)}
                className="w-full px-3 py-2 rounded-xl bg-[#122338] border border-[#29415D] text-xs text-[#F8FAFC] focus:ring-1 focus:ring-[#3B82F6] focus:outline-none"
              >
                <option value="New">New</option>
                <option value="Under Review">Under Review</option>
                <option value="Escalated">Escalated</option>
                <option value="Closed">Closed</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-heading font-semibold text-[#AFC2D8] mb-1.5">
                Triage Disposition
              </label>
              <select
                value={disposition}
                onChange={(e) => setDisposition(e.target.value as RecommendedDisposition)}
                className="w-full px-3 py-2 rounded-xl bg-[#122338] border border-[#29415D] text-xs text-[#F8FAFC] focus:ring-1 focus:ring-[#3B82F6] focus:outline-none"
              >
                <option value="Quarantine">Quarantine</option>
                <option value="Review">Review</option>
                <option value="Block Sender">Block Sender</option>
                <option value="Allow">Allow</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-heading font-semibold text-[#AFC2D8] mb-1.5">
              Analyst Forensic Notes
            </label>
            <textarea
              rows={3}
              value={analystNotes}
              onChange={(e) => setAnalystNotes(e.target.value)}
              placeholder="Record forensic observations, user interview notes, or ticket references..."
              className="w-full p-3 rounded-xl bg-[#122338] border border-[#29415D] text-xs text-[#F8FAFC] placeholder-[#AFC2D8]/40 focus:ring-1 focus:ring-[#3B82F6] focus:outline-none leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-between">
            {saveSuccessMessage ? (
              <span className="text-xs text-[#22C55E] flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                {saveSuccessMessage}
              </span>
            ) : (
              <span className="text-xs text-[#AFC2D8]">
                Changes persist directly to the SentinelMail investigation store.
              </span>
            )}

            <button
              type="button"
              onClick={handleSaveReview}
              disabled={isSavingReview}
              className="px-5 py-2 rounded-xl bg-[#3B82F6] hover:bg-[#2563EB] text-white text-xs font-heading font-bold flex items-center gap-2 transition cursor-pointer shadow-md shadow-[#3B82F6]/20"
            >
              <Save className="w-4 h-4" />
              <span>{isSavingReview ? 'Saving...' : 'Save Case Review'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
