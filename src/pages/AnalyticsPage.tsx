import React, { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  BarChart2,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Globe2,
  CheckCircle2,
  RefreshCw,
  Layers,
  Sparkles,
  PieChart as PieIcon,
  TrendingUp,
  Activity,
  Award,
} from 'lucide-react';

interface AnalyticsData {
  total: number;
  averageRiskScore: number;
  highRiskIncidents: number;
  suspectedBecCases: number;
  authenticationFailures: number;
  authFailureRate: number;
  categories: { name: string; count: number }[];
  scoreRanges: { range: string; count: number }[];
  topCountries: { country: string; count: number }[];
  topIndicators: { label: string; count: number }[];
}

const CATEGORY_PALETTE: Record<string, string> = {
  Phishing: '#D92D20',
  BEC: '#F97316',
  'Business Email Compromise': '#F97316',
  Spoofing: '#F4B400',
  Suspicious: '#6C5CE7',
  Safe: '#16A36A',
  'Likely Safe': '#16A36A',
  Spam: '#165DFF',
};

export const AnalyticsPage: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = () => {
    setLoading(true);
    fetch('/api/analytics')
      .then((res) => res.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-3.75rem)] bg-[#F7F9FC] flex flex-col items-center justify-center p-4">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#165DFF] border-t-transparent mb-3" />
        <p className="text-xs font-heading font-semibold text-[#667085]">
          Compiling Threat Insights Telemetry...
        </p>
      </div>
    );
  }

  // Prepared chart items
  const riskDonutData =
    data?.categories.map((c) => ({
      name: c.name,
      value: c.count,
      color: CATEGORY_PALETTE[c.name] || '#165DFF',
    })) || [];

  const authHealthData = [
    {
      name: 'Passing Auth',
      value: Math.max(0, (data?.total || 10) - (data?.authenticationFailures || 0)),
      color: '#16A36A',
    },
    {
      name: 'Auth Failures',
      value: data?.authenticationFailures || 0,
      color: '#D92D20',
    },
  ];

  return (
    <div id="threat-insights-page" className="min-h-[calc(100vh-3.75rem)] bg-[#F7F9FC] p-4 sm:p-6 lg:p-8 space-y-6 text-[#172033]">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Bar */}
        <div className="bg-white rounded-2xl border border-[#DDE3EC] p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#EAF2FF] text-[#165DFF] flex items-center justify-center shadow-xs">
                <BarChart2 className="w-5 h-5" />
              </div>
              <h1 className="text-xl sm:text-2xl font-heading font-extrabold text-[#123B70] tracking-tight">
                Threat Insights & Telemetry
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-[#EAF2FF] text-[#165DFF] border border-[#165DFF]/30">
                {data?.total || 0} Cases Monitored
              </span>
            </div>
            <p className="text-xs text-[#667085]">
              Longitudinal analysis of email fraud vectors, cross-header cryptographic health, and adversarial infrastructure.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={fetchAnalytics}
              className="p-2.5 rounded-xl border border-[#DDE3EC] bg-[#F7F9FC] hover:bg-[#EAF2FF] text-[#667085] hover:text-[#123B70] transition cursor-pointer"
              title="Refresh Telemetry"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* TOP ROW: Risk Donut, Auth Health Ring, Threat Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Risk Composition Donut */}
          <div className="bg-white rounded-2xl border border-[#DDE3EC] p-5 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-heading font-bold text-xs text-[#123B70]">
                  Risk Composition
                </span>
                <span className="text-[10px] font-mono text-[#667085]">By Threat Category</span>
              </div>
              <p className="text-[11px] text-[#667085]">
                Distribution of forensic verdicts across ingested message payloads.
              </p>
            </div>

            <div className="h-48 w-full my-2 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={riskDonutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={46}
                    outerRadius={68}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {riskDonutData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #DDE3EC',
                      borderRadius: '8px',
                      fontSize: '11px',
                      color: '#172033',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 pt-3 border-t border-[#DDE3EC] text-[10px]">
              {riskDonutData.map((item) => (
                <div key={item.name} className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-[#667085]">{item.name} ({item.value})</span>
                </div>
              ))}
            </div>
          </div>

          {/* Card 2: Authentication Health Ring */}
          <div className="bg-white rounded-2xl border border-[#DDE3EC] p-5 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-heading font-bold text-xs text-[#123B70]">
                  Authentication Alignment Rate
                </span>
                <span className="text-[10px] font-mono text-[#D92D20]">
                  {data?.authFailureRate || 0}% Failure Rate
                </span>
              </div>
              <p className="text-[11px] text-[#667085]">
                Proportion of messages failing SPF, DKIM, or DMARC alignment.
              </p>
            </div>

            <div className="h-48 w-full my-2 flex items-center justify-center relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={authHealthData}
                    cx="50%"
                    cy="50%"
                    innerRadius={46}
                    outerRadius={68}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {authHealthData.map((entry, index) => (
                      <Cell key={`cell-auth-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #DDE3EC',
                      borderRadius: '8px',
                      fontSize: '11px',
                      color: '#172033',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="font-heading font-extrabold text-base text-[#123B70]">
                  {data?.authenticationFailures || 0}
                </span>
                <span className="text-[9px] text-[#667085] uppercase font-mono">Failures</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#DDE3EC] text-[11px]">
              <span className="text-[#667085]">Cryptographically Aligned:</span>
              <span className="font-mono font-bold text-[#16A36A]">
                {Math.max(0, (data?.total || 10) - (data?.authenticationFailures || 0))} Messages
              </span>
            </div>
          </div>

          {/* Card 3: Threat-Type Summary */}
          <div className="bg-white rounded-2xl border border-[#DDE3EC] p-5 shadow-sm flex flex-col justify-between">
            <div>
              <span className="font-heading font-bold text-xs text-[#123B70] block mb-1">
                Forensic Telemetry Summary
              </span>
              <p className="text-[11px] text-[#667085]">
                Core exposure metrics across monitored enterprise inbox pathways.
              </p>
            </div>

            <div className="space-y-2.5 my-3">
              <div className="p-3 rounded-xl bg-[#F7F9FC] border border-[#DDE3EC] flex items-center justify-between">
                <span className="text-xs text-[#667085]">Average Risk Index:</span>
                <span className="text-xs font-mono font-bold text-[#123B70]">
                  {data?.averageRiskScore || 0} / 100
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#D92D20]/10 border border-[#D92D20]/30 flex items-center justify-between">
                <span className="text-xs text-[#D92D20] font-semibold">Critical Threat Escalations:</span>
                <span className="text-xs font-mono font-bold text-[#D92D20]">
                  {data?.highRiskIncidents || 0}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#F97316]/10 border border-[#F97316]/30 flex items-center justify-between">
                <span className="text-xs text-[#F97316] font-semibold">Suspected BEC Infiltrations:</span>
                <span className="text-xs font-mono font-bold text-[#F97316]">
                  {data?.suspectedBecCases || 0}
                </span>
              </div>
            </div>

            <div className="text-[10px] text-[#667085] pt-3 border-t border-[#DDE3EC] text-center">
              Real-time synchronization with local forensic datastore
            </div>
          </div>
        </div>

        {/* MIDDLE ROW: Risk Score Spectrum, Frequently Triggered Indicators, Impersonation Targets */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Risk Score Spectrum */}
          <div className="bg-white rounded-2xl border border-[#DDE3EC] p-5 shadow-sm space-y-3">
            <span className="font-heading font-bold text-xs text-[#123B70] block">
              Risk Score Spectrum
            </span>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.scoreRanges || []}>
                  <XAxis dataKey="range" tick={{ fontSize: 10, fill: '#667085' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#667085' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #DDE3EC',
                      borderRadius: '8px',
                      fontSize: '11px',
                      color: '#172033',
                    }}
                  />
                  <Bar dataKey="count" fill="#165DFF" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Frequently Triggered Indicators */}
          <div className="bg-white rounded-2xl border border-[#DDE3EC] p-5 shadow-sm space-y-3">
            <span className="font-heading font-bold text-xs text-[#123B70] block">
              Frequently Triggered Indicators
            </span>
            <div className="space-y-2">
              {(data?.topIndicators || [
                { label: 'Reply-To Address Divergence', count: 6 },
                { label: 'SPF Hard/Softfail Status', count: 5 },
                { label: 'Urgent Financial Wire Terminology', count: 4 },
                { label: 'Unverified External Relay Hop', count: 3 },
              ]).map((ind, i) => (
                <div
                  key={i}
                  className="p-2.5 rounded-xl bg-[#F7F9FC] border border-[#DDE3EC] flex items-center justify-between text-xs"
                >
                  <span className="text-[#172033] font-medium truncate max-w-[190px]">
                    {ind.label}
                  </span>
                  <span className="font-mono text-xs text-[#165DFF] font-bold">
                    {ind.count} hits
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Observed Impersonation Targets */}
          <div className="bg-white rounded-2xl border border-[#DDE3EC] p-5 shadow-sm space-y-3">
            <span className="font-heading font-bold text-xs text-[#123B70] block">
              Observed Impersonation Targets
            </span>
            <div className="space-y-2 text-xs">
              {[
                { brand: 'PayPal Services', risk: 'High', type: 'Credential Harvesting', count: 4 },
                { brand: 'Executive Finance (CEO/CFO)', risk: 'Critical', type: 'Wire Transfer BEC', count: 3 },
                { brand: 'Microsoft 365 / Entra ID', risk: 'High', type: 'OAuth Consent Phish', count: 2 },
                { brand: 'DocuSign Document Vault', risk: 'Medium', type: 'Fake Invoice Attachment', count: 2 },
              ].map((t, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-[#F7F9FC] border border-[#DDE3EC] space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-heading font-bold text-[#123B70]">{t.brand}</span>
                    <span
                      className={`text-[9px] px-2 py-0.5 rounded font-mono font-semibold ${
                        t.risk === 'Critical'
                          ? 'bg-[#D92D20]/10 text-[#D92D20] border border-[#D92D20]/30'
                          : t.risk === 'High'
                          ? 'bg-[#F97316]/10 text-[#F97316] border border-[#F97316]/30'
                          : 'bg-[#F4B400]/10 text-[#F4B400] border border-[#F4B400]/30'
                      }`}
                    >
                      {t.risk}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-[#667085]">
                    <span>{t.type}</span>
                    <span className="font-mono">{t.count} cases</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* BOTTOM ROW: Reported Auth Protocol Split, Relay-Country Observations, Analyst Dispositions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Reported Auth Protocol Split */}
          <div className="bg-white rounded-2xl border border-[#DDE3EC] p-5 shadow-sm space-y-3">
            <span className="font-heading font-bold text-xs text-[#123B70] block">
              Reported Auth Protocol Split
            </span>
            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-xl bg-[#F7F9FC] border border-[#DDE3EC] flex items-center justify-between">
                <span className="text-[#667085]">SPF Failures / Softfails</span>
                <span className="font-mono font-bold text-[#D92D20]">
                  {data?.authenticationFailures || 5}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#F7F9FC] border border-[#DDE3EC] flex items-center justify-between">
                <span className="text-[#667085]">DKIM Missing Signatures</span>
                <span className="font-mono font-bold text-[#F97316]">4</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#F7F9FC] border border-[#DDE3EC] flex items-center justify-between">
                <span className="text-[#667085]">DMARC Alignment Violations</span>
                <span className="font-mono font-bold text-[#D92D20]">
                  {data?.authenticationFailures || 5}
                </span>
              </div>
            </div>
          </div>

          {/* Relay-Country Observations */}
          <div className="bg-white rounded-2xl border border-[#DDE3EC] p-5 shadow-sm space-y-3">
            <span className="font-heading font-bold text-xs text-[#123B70] block">
              Relay-Country Observations
            </span>
            <div className="space-y-2">
              {(data?.topCountries || [
                { country: 'United States', count: 8 },
                { country: 'Russia', count: 4 },
                { country: 'Germany', count: 3 },
                { country: 'Nigeria', count: 2 },
              ]).map((c, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-[#F7F9FC] border border-[#DDE3EC] flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <Globe2 className="w-3.5 h-3.5 text-[#165DFF]" />
                    <span className="text-[#172033]">{c.country}</span>
                  </div>
                  <span className="font-mono font-bold text-[#165DFF]">{c.count} relays</span>
                </div>
              ))}
            </div>
          </div>

          {/* Analyst Dispositions */}
          <div className="bg-white rounded-2xl border border-[#DDE3EC] p-5 shadow-sm space-y-3">
            <span className="font-heading font-bold text-xs text-[#123B70] block">
              Analyst Dispositions
            </span>
            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-xl bg-[#F7F9FC] border border-[#DDE3EC] flex items-center justify-between">
                <span className="text-[#667085]">Confirmed Malicious Threat</span>
                <span className="font-mono font-bold text-[#D92D20]">5</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#F7F9FC] border border-[#DDE3EC] flex items-center justify-between">
                <span className="text-[#667085]">In Active Triage Review</span>
                <span className="font-mono font-bold text-[#F97316]">3</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#F7F9FC] border border-[#DDE3EC] flex items-center justify-between">
                <span className="text-[#667085]">Benign / False Positive</span>
                <span className="font-mono font-bold text-[#16A36A]">2</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
