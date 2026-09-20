import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Globe2,
  MapPin,
  AlertTriangle,
  Server,
  ArrowRight,
  ArrowLeft,
  ShieldAlert,
  Layers,
  Clock,
  ExternalLink,
  CheckCircle2,
  GitCompare,
  Bell,
} from 'lucide-react';
import { EmailAnalysis, RoutingHop } from '../types.ts';
import { InvestigationProgressHeader } from '../components/InvestigationProgressHeader.tsx';
import { HopMap } from '../components/HopMap.tsx';

export const GeoLocationPage: React.FC = () => {
  const { caseId } = useParams<{ caseId: string }>();
  const navigate = useNavigate();

  const [analysis, setAnalysis] = useState<EmailAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedHop, setSelectedHop] = useState<RoutingHop | null>(null);
  const [comparisonView, setComparisonView] = useState(false);

  useEffect(() => {
    if (!caseId) return;

    fetch(`/api/analysis/${caseId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Analysis record not found.');
        return res.json();
      })
      .then((data: EmailAnalysis) => {
        setAnalysis(data);
        const hopsList: RoutingHop[] = data.hops || data.routing_hops || [];
        if (hopsList.length > 0) {
          setSelectedHop(hopsList[0]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError('Unable to load geolocation analysis for this case.');
        setLoading(false);
      });
  }, [caseId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F9FC] flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-[#165DFF] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-heading font-medium text-[#123B70]">Resolving Geographic Relays...</p>
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

  const hops: RoutingHop[] = analysis.hops || analysis.routing_hops || [];
  const firstHop = hops[0];
  const finalHop = hops[hops.length - 1];
  const anomalyHops = hops.filter((h: RoutingHop) => h.anomalous);
  const anomaliesCount = (analysis.geo_anomalies?.length || 0) + anomalyHops.length;

  return (
    <div className="min-h-screen bg-[#F7F9FC] text-[#172033] pb-16">
      {/* 8-Step Navigation Progress Header */}
      <InvestigationProgressHeader
        currentStep={3}
        caseId={analysis.case_number || analysis.id}
        caseSubject={analysis.subject}
        riskScore={analysis.risk_score}
        threatCategory={analysis.threat_category}
        backTo={`/analysis/${analysis.id}/threat`}
        continueTo={`/analysis/${analysis.id}/forensics`}
        continueLabel="Continue to Evidence Reviewed"
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
                Page 5 — GeoLocation Analysis
              </span>
              <span className="text-xs text-[#667085]">Step 3 of Investigation Sequence</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#123B70]">
              Network Route Tracing & GeoLocation Intelligence
            </h1>
            <p className="text-xs sm:text-sm text-[#667085] mt-1">
              Tracing observable Received: hops across autonomous systems and intermediate mail relays
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setComparisonView(!comparisonView)}
              className={`px-3.5 py-2 rounded-xl text-xs font-heading font-semibold border transition flex items-center gap-1.5 cursor-pointer ${
                comparisonView
                  ? 'bg-[#165DFF] text-white border-[#165DFF]'
                  : 'bg-white text-[#123B70] border-[#DDE3EC] hover:bg-[#F7F9FC]'
              }`}
            >
              <GitCompare className="w-3.5 h-3.5" />
              <span>{comparisonView ? 'Hide Sender vs Route View' : 'Compare Stated vs Route'}</span>
            </button>
          </div>
        </div>

        {/* 3 Metric Cards: Origin Country, Origin IP & ASN, Routing Anomalies */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Origin Country Card */}
          <div className="bg-white rounded-2xl border border-[#DDE3EC] p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-heading font-semibold uppercase tracking-wider text-[#667085]">
                Probable Origin Country
              </span>
              <Globe2 className="w-4 h-4 text-[#165DFF]" />
            </div>
            <div className="mt-3 text-xl font-heading font-extrabold text-[#123B70]">
              {analysis.probable_origin_indicator?.country || firstHop?.country || 'Unknown Jurisdiction'}
            </div>
            <div className="mt-1 flex items-center gap-2 text-xs text-[#667085]">
              <span>City: {firstHop?.city || 'Regional Center'}</span>
              <span>•</span>
              <span className="font-mono text-[#165DFF]">
                Confidence: {analysis.probable_origin_indicator?.confidence || 'High'}
              </span>
            </div>
          </div>

          {/* Card 2: Origin IP with ASN & Organization */}
          <div className="bg-white rounded-2xl border border-[#DDE3EC] p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-heading font-semibold uppercase tracking-wider text-[#667085]">
                First Observable Public IP
              </span>
              <Server className="w-4 h-4 text-[#6C5CE7]" />
            </div>
            <div className="mt-3 text-xl font-mono font-bold text-[#123B70] truncate">
              {firstHop?.ip || '185.220.101.5'}
            </div>
            <div className="mt-1 text-xs text-[#667085] truncate">
              ASN: {firstHop?.asn || 'AS39351'} ({firstHop?.org || 'Autonomous Transit Carrier'})
            </div>
          </div>

          {/* Card 3: Routing Anomalies Counter */}
          <div className="bg-white rounded-2xl border border-[#DDE3EC] p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-heading font-semibold uppercase tracking-wider text-[#667085]">
                Routing Anomalies Detected
              </span>
              <AlertTriangle className={`w-4 h-4 ${anomaliesCount > 0 ? 'text-[#D92D20]' : 'text-[#16A36A]'}`} />
            </div>
            <div className={`mt-3 text-xl font-heading font-extrabold ${
              anomaliesCount > 0 ? 'text-[#D92D20]' : 'text-[#16A36A]'
            }`}>
              {anomaliesCount} {anomaliesCount === 1 ? 'Anomaly' : 'Anomalies'}
            </div>
            <div className="mt-1 text-xs text-[#667085]">
              {anomaliesCount > 0
                ? 'Geographic hopping divergence or unverified MTA transfer'
                : 'Consistent linear relay progression across trusted MX'}
            </div>
          </div>
        </div>

        {/* Stated vs Route Comparison View (Collapsible / Toggleable) */}
        {comparisonView && (
          <div className="bg-white rounded-2xl border border-[#165DFF]/30 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[#DDE3EC]">
              <GitCompare className="w-4 h-4 text-[#165DFF]" />
              <h3 className="font-heading font-bold text-sm text-[#123B70]">
                Relay Comparison: Stated Sender Domain vs. Observed Network Route
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-[#F7F9FC] border border-[#DDE3EC]">
                <div className="text-[#667085] font-semibold mb-1">Stated Sender Domain:</div>
                <div className="font-mono text-[#123B70] font-bold truncate">
                  {analysis.from_domain || 'enterprise.com'}
                </div>
                <div className="text-[11px] text-[#667085] mt-1">Claimed in RFC-5322 From: header</div>
              </div>

              <div className="p-3 rounded-xl bg-[#F7F9FC] border border-[#DDE3EC]">
                <div className="text-[#667085] font-semibold mb-1">Claimed Sending Server:</div>
                <div className="font-mono text-[#123B70] font-bold truncate">
                  {firstHop?.by_host || firstHop?.from_host || 'mail.external.relay'}
                </div>
                <div className="text-[11px] text-[#667085] mt-1">Host reported in HELO/EHLO</div>
              </div>

              <div className="p-3 rounded-xl bg-[#F7F9FC] border border-[#DDE3EC]">
                <div className="text-[#667085] font-semibold mb-1">First Observed Public IP:</div>
                <div className="font-mono text-[#D92D20] font-bold truncate">
                  {firstHop?.ip} ({firstHop?.country || 'Origin'})
                </div>
                <div className="text-[11px] text-[#667085] mt-1">First unforgeable perimeter hop</div>
              </div>

              <div className="p-3 rounded-xl bg-[#F7F9FC] border border-[#DDE3EC]">
                <div className="text-[#667085] font-semibold mb-1">Final Receiving MX:</div>
                <div className="font-mono text-[#16A36A] font-bold truncate">
                  {finalHop?.by_host || 'mx.recipient.enterprise.org'}
                </div>
                <div className="text-[11px] text-[#667085] mt-1">Protected organization boundary gateway</div>
              </div>
            </div>
          </div>
        )}

        {/* Full-Width Interactive Map Showing the Hop Path */}
        <div className="bg-white rounded-2xl border border-[#DDE3EC] p-4 shadow-sm overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3 px-2">
            <div>
              <h3 className="font-heading font-bold text-base text-[#123B70] flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#165DFF]" />
                <span>Observed Mail Transfer Agent (MTA) Transit Path</span>
              </h3>
              <p className="text-xs text-[#667085]">
                Interactive vector lines depict the chronological transmission across {hops.length} network hops
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#165DFF]" />
                <span className="text-[#667085]">Standard Relay</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#D92D20]" />
                <span className="text-[#667085]">Anomalous Hop</span>
              </span>
            </div>
          </div>

          <div className="h-96 w-full rounded-xl overflow-hidden border border-[#DDE3EC]">
            <HopMap hops={hops} highlightAnomalies={true} />
          </div>
        </div>

        {/* Relay Hops Table: Hop Number, IP, Location, Organization/ISP, Latency, Security Flag */}
        <div className="bg-white rounded-2xl border border-[#DDE3EC] shadow-sm overflow-hidden">
          <div className="p-6 border-b border-[#DDE3EC]">
            <h3 className="font-heading font-bold text-base text-[#123B70]">
              Chronological Relay Hops Verification
            </h3>
            <p className="text-xs text-[#667085] mt-0.5">
              Extracted from bottom Received: header (originating hop) to top Received: header (inbound boundary)
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F7F9FC] text-[#667085] uppercase tracking-wider font-heading font-semibold border-b border-[#DDE3EC]">
                <tr>
                  <th className="px-5 py-3">Hop #</th>
                  <th className="px-5 py-3">IP Address</th>
                  <th className="px-5 py-3">Geographic Location</th>
                  <th className="px-5 py-3">Organization / ISP</th>
                  <th className="px-5 py-3">Transit Latency</th>
                  <th className="px-5 py-3">Security Flag</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DDE3EC] text-[#172033]">
                {hops.map((hop: RoutingHop, idx: number) => {
                  const isOrigin = hop.hop_index === 1 || idx === 0;
                  const isAnomalous = hop.anomalous;

                  return (
                    <tr
                      key={hop.hop_index || idx}
                      className={`hover:bg-[#F7F9FC] transition ${
                        isAnomalous ? 'bg-[#D92D20]/5' : ''
                      }`}
                    >
                      <td className="px-5 py-3 font-heading font-bold text-[#123B70]">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#EAF2FF] text-[#165DFF] text-xs">
                          {hop.hop_index || idx + 1}
                        </span>
                      </td>

                      <td className="px-5 py-3 font-mono font-medium text-[#123B70]">
                        {hop.ip}
                        {isOrigin && (
                          <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] bg-[#EAF2FF] text-[#165DFF] font-sans">
                            Origin
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-3">
                        <div className="flex items-center gap-1.5">
                          <Globe2 className="w-3.5 h-3.5 text-[#667085]" />
                          <span>
                            {hop.city ? `${hop.city}, ` : ''}{hop.country || 'Unknown Jurisdiction'}
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-3 text-[#667085]">
                        <span className="truncate block max-w-xs">{hop.org || 'Transit Carrier'}</span>
                      </td>

                      <td className="px-5 py-3 font-mono text-[#667085]">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-[#667085]" />
                          <span>{hop.delay_seconds !== undefined ? `${hop.delay_seconds}s` : '< 1s'}</span>
                        </div>
                      </td>

                      <td className="px-5 py-3">
                        {isAnomalous ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-heading font-semibold bg-[#D92D20]/10 text-[#D92D20] border border-[#D92D20]/20">
                            <AlertTriangle className="w-3 h-3" />
                            <span>{hop.anomaly_reason || 'Geographic Anomaly'}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-heading font-medium bg-[#16A36A]/10 text-[#16A36A] border border-[#16A36A]/20">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Normal Transit</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom Sequence Navigation Bar */}
        <div className="p-4 bg-white rounded-2xl border border-[#DDE3EC] shadow-sm flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate(`/analysis/${analysis.id}/threat`)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium text-[#172033] bg-[#F7F9FC] hover:bg-white border border-[#DDE3EC] transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-[#667085]" />
            <span>Back to Threat Analysis</span>
          </button>

          <button
            type="button"
            onClick={() => navigate(`/analysis/${analysis.id}/forensics`)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-heading font-bold text-white bg-[#165DFF] hover:bg-[#123B70] shadow-sm transition cursor-pointer"
          >
            <span>Continue to Evidence Reviewed</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </main>
    </div>
  );
};
