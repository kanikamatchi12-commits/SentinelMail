import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Bell,
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  Send,
  ArrowRight,
  ArrowLeft,
  Copy,
  Check,
  Globe2,
  Users,
  ShieldCheck,
  Clock,
  Radio,
  Share2,
} from 'lucide-react';
import { EmailAnalysis, ThreatAlert } from '../types.ts';
import { InvestigationProgressHeader } from '../components/InvestigationProgressHeader.tsx';
import { useAuth } from '../context/AuthContext.tsx';

export const ThreatAlertPage: React.FC = () => {
  const { caseId } = useParams<{ caseId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [analysis, setAnalysis] = useState<EmailAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Alert configuration state
  const [alertId, setAlertId] = useState('');
  const [severity, setSeverity] = useState<'Informational' | 'Low' | 'Medium' | 'High' | 'Critical'>('High');
  const [recommendedAction, setRecommendedAction] = useState<
    'Quarantine mailbox' | 'Block sending IP / domain' | 'Reset compromised user credentials' | 'Notify incident response team'
  >('Quarantine mailbox');
  const [recipients, setRecipients] = useState<string[]>([
    'Security Operations Centre (SOC)',
    'Incident Response Team',
    'Organization Administrator',
  ]);
  const [analystNotes, setAnalystNotes] = useState('');
  const [isDispatching, setIsDispatching] = useState(false);
  const [dispatchedAlert, setDispatchedAlert] = useState<ThreatAlert | null>(null);
  const [copiedAlertText, setCopiedAlertText] = useState(false);

  useEffect(() => {
    if (!caseId) return;

    fetch(`/api/analysis/${caseId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Analysis record not found.');
        return res.json();
      })
      .then((data: EmailAnalysis) => {
        setAnalysis(data);

        // Determine default severity based on risk score
        const score = data.risk_score || 0;
        let defaultSev: 'Critical' | 'High' | 'Medium' | 'Low' = 'High';
        if (score >= 85) defaultSev = 'Critical';
        else if (score >= 70) defaultSev = 'High';
        else if (score >= 35) defaultSev = 'Medium';
        else defaultSev = 'Low';

        setSeverity(defaultSev);

        if (defaultSev === 'Critical') {
          setRecommendedAction('Quarantine mailbox');
        } else if (data.threat_category === 'Business Email Compromise') {
          setRecommendedAction('Reset compromised user credentials');
        } else if (data.threat_category === 'Malware Delivery') {
          setRecommendedAction('Block sending IP / domain');
        }

        // Check if alert was already dispatched previously
        if (data.alert_details) {
          setDispatchedAlert(data.alert_details);
          setAlertId(data.alert_details.id);
          setSeverity(data.alert_details.severity);
          if (data.alert_details.recipients) {
            setRecipients(data.alert_details.recipients);
          }
          if (data.alert_details.recommended_action) {
            setRecommendedAction(data.alert_details.recommended_action as any);
          }
        } else {
          // Generate new alert ID
          const rnd = Math.floor(1000 + Math.random() * 9000);
          setAlertId(`ALT-2026-${rnd}`);
        }

        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError('Unable to load case for threat alert creation.');
        setLoading(false);
      });
  }, [caseId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F9FC] flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-[#165DFF] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-heading font-medium text-[#123B70]">Preparing Threat Alert Generator...</p>
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

  const toggleRecipient = (recipient: string) => {
    if (recipients.includes(recipient)) {
      if (recipients.length > 1) {
        setRecipients(recipients.filter((r) => r !== recipient));
      }
    } else {
      setRecipients([...recipients, recipient]);
    }
  };

  const handleDispatchAlert = async () => {
    setIsDispatching(true);

    const alertPayload: ThreatAlert = {
      id: alertId || `ALT-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      case_id: analysis.id,
      title: `${severity.toUpperCase()} ALERT: ${analysis.threat_category || 'Email Security Threat'} (${analysis.case_number || analysis.id})`,
      severity,
      threat_category: analysis.threat_category || 'Suspicious Email',
      claimed_sender: `${analysis.from_name || ''} <${analysis.from_address}>`,
      sender_domain: analysis.from_domain || (analysis.from_address.split('@')[1] || 'unknown'),
      subject: analysis.subject,
      risk_score: analysis.risk_score,
      probable_origin: analysis.probable_origin_indicator?.country || analysis.hops?.[0]?.country || analysis.routing_hops?.[0]?.country || 'Unknown Jurisdiction',
      auth_failures: [
        analysis.spf_result !== 'pass' ? `SPF (${analysis.spf_result?.toUpperCase() || 'FAIL'})` : '',
        analysis.dkim_result !== 'pass' ? `DKIM (${analysis.dkim_result?.toUpperCase() || 'FAIL'})` : '',
        analysis.dmarc_result !== 'pass' ? `DMARC (${analysis.dmarc_result?.toUpperCase() || 'FAIL'})` : '',
      ].filter(Boolean),
      primary_indicators: analysis.indicators?.slice(0, 4).map((i) => i.title) || [],
      recommended_action: recommendedAction,
      analyst_notes: analystNotes || 'Automated high-fidelity threat alert compiled from multi-vector forensic indicators.',
      recipients,
      created_at: new Date().toISOString(),
      status: 'Simulated',
      analyst_name: user?.name || 'SOC Analyst',
    };

    try {
      const res = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(alertPayload),
      });

      if (res.ok) {
        const savedAlert = await res.json();
        setDispatchedAlert(savedAlert);
        analysis.alert_generated = true;
        analysis.alert_id = savedAlert.id;
        analysis.alert_details = savedAlert;
      }
    } catch (e) {
      console.error(e);
      // Fallback local simulation state
      setDispatchedAlert(alertPayload);
    } finally {
      setIsDispatching(false);
    }
  };

  const alertSeverityStyles: Record<string, string> = {
    Critical: 'bg-[#D92D20]/10 text-[#D92D20] border-[#D92D20]/30',
    High: 'bg-[#F97316]/10 text-[#F97316] border-[#F97316]/30',
    Medium: 'bg-[#F4B400]/10 text-[#F4B400] border-[#F4B400]/30',
    Low: 'bg-[#165DFF]/10 text-[#165DFF] border-[#165DFF]/30',
    Informational: 'bg-[#16A36A]/10 text-[#16A36A] border-[#16A36A]/30',
  };

  const copyAlertBrief = () => {
    const text = `[SECURITY INCIDENT THREAT ALERT]
Alert ID: ${alertId}
Case Reference: ${analysis.case_number || analysis.id}
Severity: ${severity.toUpperCase()}
Category: ${analysis.threat_category}
Sender: ${analysis.from_name} <${analysis.from_address}>
Subject: ${analysis.subject}
Origin: ${analysis.probable_origin_indicator?.country || analysis.hops?.[0]?.country || analysis.routing_hops?.[0]?.country || 'Unknown'}
Risk Score: ${analysis.risk_score}/100
Recommended Action: ${recommendedAction}
Notice: Prototype Alert Simulation Completed.`;
    navigator.clipboard.writeText(text);
    setCopiedAlertText(true);
    setTimeout(() => setCopiedAlertText(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] text-[#172033] pb-16">
      {/* 8-Step Navigation Progress Header */}
      <InvestigationProgressHeader
        currentStep={5}
        caseId={analysis.case_number || analysis.id}
        caseSubject={analysis.subject}
        riskScore={analysis.risk_score}
        threatCategory={analysis.threat_category}
        backTo={`/analysis/${analysis.id}/forensics`}
        continueTo={`/analysis/${analysis.id}/report`}
        continueLabel="Continue to Report Completed"
        showGenerateAlert={false}
        isAlertGenerated={true}
        isDemo={analysis.is_demo}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Page Title & Context */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-[#165DFF] bg-[#EAF2FF] px-2 py-0.5 rounded border border-[#165DFF]/20">
                Page 7 — Threat Alert
              </span>
              <span className="text-xs text-[#667085]">Step 5 of Investigation Sequence</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#123B70]">
              Threat Alert Generator & Dispatch Simulation
            </h1>
            <p className="text-xs sm:text-sm text-[#667085] mt-1">
              Simulate incident broadcast to SOC triage teams, mailbox owners, and perimeter firewalls
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={copyAlertBrief}
              className="px-3 py-2 rounded-xl bg-white border border-[#DDE3EC] text-xs font-medium text-[#123B70] hover:bg-[#F7F9FC] transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              {copiedAlertText ? <Check className="w-3.5 h-3.5 text-[#16A36A]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedAlertText ? 'Copied Alert Brief' : 'Copy Alert Brief'}</span>
            </button>
          </div>
        </div>

        {/* Dispatched Notification Banner if already simulated */}
        {dispatchedAlert && (
          <div className="p-4 rounded-2xl bg-[#16A36A]/10 border border-[#16A36A]/30 flex items-center justify-between gap-4 animate-fadeIn">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#16A36A] text-white flex items-center justify-center shrink-0 shadow-xs">
                <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div>
                <div className="text-sm font-heading font-bold text-[#16A36A]">
                  Threat Alert {dispatchedAlert.id} Dispatched Successfully
                </div>
                <div className="text-xs text-[#667085] mt-0.5 flex items-center gap-3">
                  <span>Timestamp: {new Date(dispatchedAlert.created_at).toLocaleTimeString()}</span>
                  <span>•</span>
                  <span>Status: <strong className="text-[#16A36A]">Active / Dispatched</strong></span>
                  <span>•</span>
                  <span>Recipients: {dispatchedAlert.recipients?.join(', ')}</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate(`/analysis/${analysis.id}/report`)}
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-heading font-bold text-white bg-[#165DFF] hover:bg-[#123B70] transition shadow-xs"
            >
              <span>Continue to Final Report</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Alert Preview Banner Card */}
        <div className="bg-white rounded-2xl border border-[#DDE3EC] p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#DDE3EC]">
            <div className="flex items-center gap-3">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                severity === 'Critical' ? 'bg-[#D92D20]/10 text-[#D92D20]' : 'bg-[#F97316]/10 text-[#F97316]'
              }`}>
                <Bell className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-[#123B70]">{alertId}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-heading font-bold border ${alertSeverityStyles[severity]}`}>
                    {severity} Severity
                  </span>
                  <span className="text-xs text-[#667085] font-mono">Case: {analysis.case_number || analysis.id}</span>
                </div>
                <h3 className="text-base font-heading font-bold text-[#123B70] mt-1">
                  {analysis.subject}
                </h3>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs text-[#667085]">Threat Category</span>
              <div className="font-heading font-bold text-[#123B70]">{analysis.threat_category}</div>
            </div>
          </div>

          {/* Key Preview Attributes */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3 rounded-xl bg-[#F7F9FC] border border-[#DDE3EC]">
              <span className="text-[#667085]">Claimed Sender:</span>
              <div className="font-mono text-[#123B70] font-semibold mt-0.5 truncate">
                {analysis.from_name ? `${analysis.from_name} <${analysis.from_address}>` : analysis.from_address}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#F7F9FC] border border-[#DDE3EC]">
              <span className="text-[#667085]">Probable Origin Country:</span>
              <div className="font-heading font-bold text-[#123B70] mt-0.5 flex items-center gap-1.5">
                <Globe2 className="w-3.5 h-3.5 text-[#165DFF]" />
                <span>{analysis.probable_origin_indicator?.country || analysis.hops?.[0]?.country || analysis.routing_hops?.[0]?.country || 'Unknown'}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#F7F9FC] border border-[#DDE3EC]">
              <span className="text-[#667085]">Evaluated Risk Score:</span>
              <div className={`text-base font-heading font-extrabold mt-0.5 ${
                severity === 'Critical' ? 'text-[#D92D20]' : severity === 'High' ? 'text-[#F97316]' : 'text-[#165DFF]'
              }`}>
                {analysis.risk_score} / 100
              </div>
            </div>
          </div>
        </div>

        {/* Generated Alert Message & SOC Parameters */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1 & 2: Generated Alert Message Card */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-[#DDE3EC] p-6 shadow-sm space-y-5">
            <div>
              <h3 className="font-heading font-bold text-base text-[#123B70]">Generated Alert Message</h3>
              <p className="text-xs text-[#667085]">Official incident notification payload formatted for security teams</p>
            </div>

            {/* Threat Summary */}
            <div className="p-4 rounded-xl bg-[#F7F9FC] border border-[#DDE3EC] text-xs space-y-1">
              <span className="font-heading font-bold text-[#123B70] uppercase tracking-wider text-[11px]">
                Threat Summary
              </span>
              <p className="text-[#172033] leading-relaxed">
                {analysis.executive_summary || 'Suspicious email detected exhibiting indicators of identity impersonation, unverified sending relays, and coercive phrasing.'}
              </p>
            </div>

            {/* Authentication Failure Details */}
            <div className="p-4 rounded-xl bg-[#F7F9FC] border border-[#DDE3EC] text-xs space-y-2">
              <span className="font-heading font-bold text-[#123B70] uppercase tracking-wider text-[11px]">
                Authentication Failure Details
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="p-2 bg-white rounded-lg border border-[#DDE3EC]">
                  <span className="text-[#667085]">SPF Check:</span>
                  <span className={`ml-2 font-mono font-bold ${
                    analysis.spf_result === 'pass' ? 'text-[#16A36A]' : 'text-[#D92D20]'
                  }`}>
                    {analysis.spf_result?.toUpperCase() || 'FAIL'}
                  </span>
                </div>
                <div className="p-2 bg-white rounded-lg border border-[#DDE3EC]">
                  <span className="text-[#667085]">DKIM Check:</span>
                  <span className={`ml-2 font-mono font-bold ${
                    analysis.dkim_result === 'pass' ? 'text-[#16A36A]' : 'text-[#D92D20]'
                  }`}>
                    {analysis.dkim_result?.toUpperCase() || 'FAIL'}
                  </span>
                </div>
                <div className="p-2 bg-white rounded-lg border border-[#DDE3EC]">
                  <span className="text-[#667085]">DMARC Policy:</span>
                  <span className={`ml-2 font-mono font-bold ${
                    analysis.dmarc_result === 'pass' ? 'text-[#16A36A]' : 'text-[#D92D20]'
                  }`}>
                    {analysis.dmarc_result?.toUpperCase() || 'FAIL'}
                  </span>
                </div>
              </div>
            </div>

            {/* Malicious Indicators List */}
            <div className="p-4 rounded-xl bg-[#F7F9FC] border border-[#DDE3EC] text-xs space-y-2">
              <span className="font-heading font-bold text-[#123B70] uppercase tracking-wider text-[11px]">
                Correlated Malicious Indicators
              </span>
              <ul className="space-y-1.5 list-disc list-inside text-[#172033]">
                {analysis.indicators && analysis.indicators.length > 0 ? (
                  analysis.indicators.slice(0, 4).map((ind, i) => (
                    <li key={i} className="leading-snug">
                      <strong className="text-[#123B70]">{ind.title}:</strong> {ind.description}
                    </li>
                  ))
                ) : (
                  <li>No explicit indicator anomalies detected.</li>
                )}
              </ul>
            </div>

            {/* Immediate Recommended SOC Action */}
            <div className="p-4 rounded-xl bg-[#EAF2FF] border border-[#165DFF]/30 text-xs">
              <span className="font-heading font-bold text-[#123B70] uppercase tracking-wider text-[11px]">
                Immediate Recommended SOC Action
              </span>
              <div className="mt-2 text-sm font-heading font-bold text-[#165DFF] flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-[#D92D20]" />
                <span>{recommendedAction}</span>
              </div>
              <p className="mt-1 text-[11px] text-[#667085]">
                Target action scheduled for automated SOC boundary firewall and email gateway enforcement.
              </p>
            </div>
          </div>

          {/* Column 3: Dispatch Parameters & Actions */}
          <div className="bg-white rounded-2xl border border-[#DDE3EC] p-6 shadow-sm space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div>
                <h3 className="font-heading font-bold text-base text-[#123B70]">Dispatch Settings</h3>
                <p className="text-xs text-[#667085]">Configure severity and target security recipients</p>
              </div>

              {/* Severity Selector */}
              <div>
                <label className="block text-xs font-heading font-semibold text-[#123B70] mb-1.5">
                  Alert Severity:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['Critical', 'High', 'Medium', 'Low'] as const).map((sev) => (
                    <button
                      key={sev}
                      type="button"
                      onClick={() => setSeverity(sev)}
                      className={`py-2 px-2.5 rounded-xl text-xs font-heading font-bold border transition cursor-pointer ${
                        severity === sev
                          ? alertSeverityStyles[sev] + ' shadow-xs ring-2 ring-current/20'
                          : 'bg-[#F7F9FC] border-[#DDE3EC] text-[#667085] hover:bg-white'
                      }`}
                    >
                      {sev}
                    </button>
                  ))}
                </div>
              </div>

              {/* Recommended Action Selector */}
              <div>
                <label className="block text-xs font-heading font-semibold text-[#123B70] mb-1.5">
                  Action to Mandate:
                </label>
                <select
                  value={recommendedAction}
                  onChange={(e: any) => setRecommendedAction(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl bg-[#F7F9FC] border border-[#DDE3EC] text-[#172033] focus:outline-none focus:border-[#165DFF]"
                >
                  <option value="Quarantine mailbox">Quarantine mailbox</option>
                  <option value="Block sending IP / domain">Block sending IP / domain</option>
                  <option value="Reset compromised user credentials">Reset compromised user credentials</option>
                  <option value="Notify incident response team">Notify incident response team</option>
                </select>
              </div>

              {/* Alert Distribution Options (Simulation) */}
              <div>
                <label className="block text-xs font-heading font-semibold text-[#123B70] mb-1.5">
                  Alert Distribution (Simulation):
                </label>
                <div className="space-y-2">
                  {[
                    'Security Operations Centre (SOC)',
                    'Incident Response Team',
                    'Mailbox User',
                    'Organization Administrator',
                  ].map((target) => {
                    const isChecked = recipients.includes(target);
                    return (
                      <label
                        key={target}
                        className="flex items-center gap-2.5 text-xs text-[#172033] p-2 rounded-lg bg-[#F7F9FC] border border-[#DDE3EC] cursor-pointer hover:bg-white transition"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleRecipient(target)}
                          className="rounded text-[#165DFF] focus:ring-[#165DFF]"
                        />
                        <span>{target}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Primary Dispatch Action */}
            <div className="pt-4 border-t border-[#DDE3EC] space-y-2">
              <button
                type="button"
                onClick={handleDispatchAlert}
                disabled={isDispatching}
                className="w-full py-3 px-4 rounded-xl text-xs font-heading font-bold text-white bg-[#D92D20] hover:bg-[#B42318] shadow-md shadow-[#D92D20]/20 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className={`w-4 h-4 ${isDispatching ? 'animate-spin' : ''}`} />
                <span>{isDispatching ? 'Broadcasting Alert Simulation...' : 'Dispatch Threat Alert (Simulation)'}</span>
              </button>

              <p className="text-[10px] text-center text-[#667085]">
                Prototype Alert Simulation: Records incident audit notice without external network transmission.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Sequence Navigation Bar */}
        <div className="p-4 bg-white rounded-2xl border border-[#DDE3EC] shadow-sm flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate(`/analysis/${analysis.id}/forensics`)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium text-[#172033] bg-[#F7F9FC] hover:bg-white border border-[#DDE3EC] transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-[#667085]" />
            <span>Back to Evidence Reviewed</span>
          </button>

          <button
            type="button"
            onClick={() => navigate(`/analysis/${analysis.id}/report`)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-heading font-bold text-white bg-[#165DFF] hover:bg-[#123B70] shadow-sm transition cursor-pointer"
          >
            <span>Continue to Final Report</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </main>
    </div>
  );
};
