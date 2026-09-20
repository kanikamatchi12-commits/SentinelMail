import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Globe2,
  MapPin,
  AlertTriangle,
  Clock,
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
  Info,
  Server,
  Network,
  RotateCw,
  ChevronDown,
  Layers,
  FileText,
  AlertCircle,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { EmailAnalysis, RoutingHop, GeoAnomaly, GeoConfidence } from '../types.ts';
import { GeoTraceMap } from '../components/GeoTraceMap.tsx';

export const GeoTracePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const caseIdParam = searchParams.get('caseId');

  const [analyses, setAnalyses] = useState<EmailAnalysis[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [selectedHopIndex, setSelectedHopIndex] = useState<number | null>(null);
  const [hopOrder, setHopOrder] = useState<'chronological' | 'raw_header'>('chronological');

  // Load all analyses
  useEffect(() => {
    async function loadCases() {
      try {
        setLoading(true);
        const res = await fetch('/api/analyses');
        if (res.ok) {
          const data: EmailAnalysis[] = await res.json();
          setAnalyses(data);
          if (data.length > 0) {
            if (caseIdParam && data.some((d) => d.id === caseIdParam)) {
              setSelectedCaseId(caseIdParam);
            } else {
              setSelectedCaseId(data[0].id);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load cases for GeoTrace:', err);
      } finally {
        setLoading(false);
      }
    }
    loadCases();
  }, [caseIdParam]);

  const activeCase = useMemo(() => {
    return analyses.find((a) => a.id === selectedCaseId) || analyses[0] || null;
  }, [analyses, selectedCaseId]);

  const handleCaseChange = (newId: string) => {
    setSelectedCaseId(newId);
    setSearchParams({ caseId: newId });
    setSelectedHopIndex(null);
  };

  const allHops = useMemo(() => {
    if (!activeCase || !activeCase.routing_hops) return [];
    return activeCase.routing_hops;
  }, [activeCase]);

  const publicHops = useMemo(() => {
    return allHops.filter((h) => !h.is_private);
  }, [allHops]);

  const orderedHops = useMemo(() => {
    if (hopOrder === 'chronological') {
      return [...allHops].sort((a, b) => a.hop_index - b.hop_index);
    }
    return [...allHops].sort((a, b) => b.hop_index - a.hop_index);
  }, [allHops, hopOrder]);

  const distinctCountries = useMemo(() => {
    const set = new Set<string>();
    allHops.forEach((h) => {
      if (h.country && h.country !== 'Unknown') set.add(h.country);
    });
    return Array.from(set);
  }, [allHops]);

  const anomalyCount = useMemo(() => {
    return allHops.filter((h) => h.anomalous).length;
  }, [allHops]);

  const probableOrigin = useMemo(() => {
    const originHop = allHops.find((h) => h.hop_index === 1);
    if (originHop && originHop.country) return originHop;
    return publicHops[0] || null;
  }, [allHops, publicHops]);

  const geoAnomalies: GeoAnomaly[] = useMemo(() => {
    if (activeCase?.geo_anomalies && activeCase.geo_anomalies.length > 0) {
      return activeCase.geo_anomalies;
    }
    const derived: GeoAnomaly[] = [];
    allHops.forEach((h) => {
      if (h.anomalous && h.anomaly_reason) {
        derived.push({
          type: 'UNEXPECTED_TRANSIT_JURISDICTION',
          hop_index: h.hop_index,
          observation: `Hop ${h.hop_index} (${h.ip}) flagged: ${h.anomaly_reason}`,
          explanation: `Relay infrastructure at ${h.country || 'Unknown location'} (${h.isp || 'Commercial AS'}) deviated from expected sender transit path.`,
          confidence: 'Moderate',
          required_action: 'Verify IP against known autonomous system threat intelligence feeds.',
        });
      }
    });
    return derived;
  }, [activeCase, allHops]);

  if (loading && analyses.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 flex flex-col items-center justify-center space-y-3 text-center">
        <div className="w-10 h-10 border-3 border-[#165DFF] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-[#667085] font-medium">Initializing GeoTrace Intelligence Matrix...</p>
      </div>
    );
  }

  return (
    <div id="geotrace-page" className="min-h-[calc(100vh-4rem)] bg-[#F7F9FC] text-[#172033] py-8 px-4 sm:px-6 lg:px-8 space-y-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 1. Header & Case Selector */}
        <div className="bg-white rounded-2xl border border-[#DDE3EC] p-6 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#EAF2FF] text-[#165DFF] flex items-center justify-center shadow-xs">
                  <Globe2 className="w-5 h-5" />
                </div>
                <h1 className="text-xl sm:text-2xl font-heading font-extrabold text-[#123B70] tracking-tight">
                  GeoTrace Geolocation Intelligence
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-[#6C5CE7]/10 text-[#6C5CE7] border border-[#6C5CE7]/30">
                  MTA Routing Analysis
                </span>
              </div>
              <p className="text-xs text-[#667085]">
                Multi-hop autonomous routing trace, relay geolocation and transit infrastructure anomaly correlation.
              </p>
            </div>

            {/* Case Selector Dropdown & Link to Analysis */}
            <div className="flex items-center gap-2.5">
              <label htmlFor="case-select" className="text-xs font-heading font-semibold text-[#123B70] flex items-center gap-1.5 shrink-0">
                <Layers className="w-3.5 h-3.5 text-[#165DFF]" />
                <span>Case:</span>
              </label>
              <div className="relative min-w-[200px] sm:min-w-[280px]">
                <select
                  id="case-select"
                  value={selectedCaseId}
                  onChange={(e) => handleCaseChange(e.target.value)}
                  className="w-full appearance-none bg-[#F7F9FC] border border-[#DDE3EC] text-[#172033] text-xs rounded-xl px-3.5 py-2.5 pr-8 font-medium focus:outline-none focus:border-[#165DFF] cursor-pointer truncate"
                >
                  {analyses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.id} — {c.subject ? c.subject.slice(0, 32) : 'Untitled'} ({c.threat_category})
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-[#667085] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {activeCase && (
                <Link
                  to={`/analysis/${activeCase.id}/geolocation`}
                  className="px-3.5 py-2.5 rounded-xl bg-[#165DFF] hover:bg-[#123B70] text-white text-xs font-heading font-bold flex items-center gap-1.5 shrink-0 transition cursor-pointer shadow-sm"
                  title="View full Email Analysis"
                >
                  <span>Step 5 Geo View →</span>
                </Link>
              )}
            </div>
          </div>

          {/* Case Meta Summary Bar */}
          {activeCase && (
            <div className="pt-3 border-t border-[#DDE3EC] grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
              <div className="col-span-2 sm:col-span-3 lg:col-span-2 bg-[#F7F9FC] rounded-xl p-3 border border-[#DDE3EC]">
                <div className="text-[10px] text-[#667085] uppercase font-semibold">Subject</div>
                <div className="font-heading font-bold text-[#123B70] truncate mt-0.5" title={activeCase.subject}>
                  {activeCase.subject}
                </div>
              </div>

              <div className="bg-[#F7F9FC] rounded-xl p-3 border border-[#DDE3EC]">
                <div className="text-[10px] text-[#667085] uppercase font-semibold">Transit Hops</div>
                <div className="font-heading font-bold text-[#165DFF] mt-0.5 font-mono">
                  {allHops.length} ({publicHops.length} Public)
                </div>
              </div>

              <div className="bg-[#F7F9FC] rounded-xl p-3 border border-[#DDE3EC]">
                <div className="text-[10px] text-[#667085] uppercase font-semibold">Jurisdictions</div>
                <div className="font-heading font-bold text-[#172033] mt-0.5 truncate">
                  {distinctCountries.length > 0 ? distinctCountries.join(', ') : 'Domestic Relay'}
                </div>
              </div>

              <div className="bg-[#F7F9FC] rounded-xl p-3 border border-[#DDE3EC]">
                <div className="text-[10px] text-[#667085] uppercase font-semibold">Probable Origin</div>
                <div className="font-heading font-bold text-[#172033] mt-0.5 truncate">
                  {probableOrigin?.country || (publicHops[0] ? publicHops[0].country : 'Unknown')}
                </div>
              </div>

              <div className="bg-[#F7F9FC] rounded-xl p-3 border border-[#DDE3EC]">
                <div className="text-[10px] text-[#667085] uppercase font-semibold">Anomalies</div>
                <div className={`font-heading font-bold mt-0.5 ${anomalyCount > 0 ? 'text-[#D92D20]' : 'text-[#16A36A]'}`}>
                  {anomalyCount > 0 ? `${anomalyCount} Flagged` : '0 Clean Path'}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Mandatory Disclaimer Box */}
        <div className="p-4 rounded-xl bg-white border border-[#DDE3EC] text-xs text-[#667085] flex items-start gap-3 shadow-sm">
          <Info className="w-5 h-5 text-[#6C5CE7] shrink-0 mt-0.5" />
          <span className="leading-relaxed">
            <strong className="text-[#123B70]">Forensic Disclaimer:</strong> GeoLocation results represent approximate locations associated with observable public email-routing infrastructure. They do not prove the sender’s identity or physical location. Never describe a routing location as the attacker’s exact location.
          </span>
        </div>

        {/* 2. Interactive Map Section */}
        <div className="bg-white rounded-2xl border border-[#DDE3EC] p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#165DFF]" />
              <h2 className="font-heading font-bold text-sm text-[#123B70]">
                Autonomous System & Relay Geolocation Map
              </h2>
            </div>
            <span className="text-[10px] font-mono text-[#667085]">
              Interactive Vector Route Plot
            </span>
          </div>

          <GeoTraceMap
            hops={allHops}
            selectedHopIndex={selectedHopIndex}
            onSelectHop={(idx) => setSelectedHopIndex(idx)}
          />
        </div>

        {/* 3. Routing Timeline and Hop Detail Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Hop Timeline (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-[#DDE3EC] p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#DDE3EC] pb-3">
              <div className="flex items-center gap-2">
                <Network className="w-4 h-4 text-[#165DFF]" />
                <h3 className="font-heading font-bold text-sm text-[#123B70]">
                  MTA Relay Transit Chain ({orderedHops.length} Hops)
                </h3>
              </div>

              <div className="flex items-center gap-1 text-[11px] font-mono">
                <button
                  type="button"
                  onClick={() => setHopOrder('chronological')}
                  className={`px-2 py-1 rounded-lg transition cursor-pointer ${
                    hopOrder === 'chronological'
                      ? 'bg-[#EAF2FF] text-[#165DFF] border border-[#165DFF]/40 font-bold'
                      : 'text-[#667085] hover:text-[#172033]'
                  }`}
                >
                  Origin → Recipient
                </button>
                <span className="text-[#DDE3EC]">|</span>
                <button
                  type="button"
                  onClick={() => setHopOrder('raw_header')}
                  className={`px-2 py-1 rounded-lg transition cursor-pointer ${
                    hopOrder === 'raw_header'
                      ? 'bg-[#EAF2FF] text-[#165DFF] border border-[#165DFF]/40 font-bold'
                      : 'text-[#667085] hover:text-[#172033]'
                  }`}
                >
                  Header Order
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {orderedHops.map((hop) => {
                const isSelected = selectedHopIndex === hop.hop_index;
                const isOrigin = hop.hop_index === 1;
                const isDest = hop.hop_index === allHops.length;

                return (
                  <div
                    key={hop.hop_index}
                    onClick={() => setSelectedHopIndex(hop.hop_index)}
                    className={`p-4 rounded-xl border text-xs cursor-pointer transition-all space-y-2 ${
                      isSelected
                        ? 'bg-[#EAF2FF] border-[#165DFF] shadow-xs'
                        : hop.anomalous
                        ? 'bg-[#D92D20]/5 border-[#D92D20]/40 hover:border-[#D92D20]'
                        : 'bg-[#F7F9FC] border-[#DDE3EC] hover:border-[#165DFF]/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center font-mono font-bold text-[11px] ${
                            hop.anomalous
                              ? 'bg-[#D92D20] text-white'
                              : isOrigin
                              ? 'bg-[#6C5CE7] text-white'
                              : isDest
                              ? 'bg-[#16A36A] text-white'
                              : 'bg-[#EAF2FF] text-[#165DFF] border border-[#165DFF]/20'
                          }`}
                        >
                          {hop.hop_index}
                        </span>
                        <span className="font-mono font-bold text-[#172033]">{hop.ip}</span>
                        {hop.is_private && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-white text-[#667085] border border-[#DDE3EC]">
                            RFC-1918 Private LAN
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        {isOrigin && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#6C5CE7]/10 text-[#6C5CE7] border border-[#6C5CE7]/30">
                            Candidate Origin
                          </span>
                        )}
                        {hop.anomalous && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#D92D20]/10 text-[#D92D20] border border-[#D92D20]/30 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            <span>Anomaly</span>
                          </span>
                        )}
                        <span className="text-[11px] text-[#667085]">
                          {hop.country || 'Undetermined'}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-[#667085] font-mono pt-1">
                      <div>
                        <span className="text-[#667085] font-sans">MTA Host: </span>
                        <span className="text-[#172033]">{hop.host || (hop as any).from || 'relay'}</span>
                      </div>
                      <div>
                        <span className="text-[#667085] font-sans">ISP/ASN: </span>
                        <span className="text-[#172033]">{hop.isp || 'Commercial Transit AS'}</span>
                      </div>
                    </div>

                    {hop.anomalous && hop.anomaly_reason && (
                      <div className="p-2.5 rounded-lg bg-[#D92D20]/10 border border-[#D92D20]/30 text-[11px] text-[#D92D20] font-medium">
                        Forensic Anomaly: {hop.anomaly_reason}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Geo Anomaly Intelligence & Analysis Shortcut (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Geo Anomalies Card */}
            <div className="bg-white rounded-2xl border border-[#DDE3EC] p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-[#DDE3EC] pb-3">
                <ShieldAlert className="w-4 h-4 text-[#D92D20]" />
                <h3 className="font-heading font-bold text-sm text-[#123B70]">
                  Detected Geographic Routing Anomalies ({geoAnomalies.length})
                </h3>
              </div>

              {geoAnomalies.length > 0 ? (
                <div className="space-y-3">
                  {geoAnomalies.map((anom, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl border border-[#D92D20]/30 bg-[#D92D20]/5 space-y-2 text-xs">
                      <div className="font-heading font-bold text-[#D92D20] flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{anom.observation}</span>
                      </div>
                      <p className="text-[11px] text-[#667085] leading-relaxed">
                        {anom.explanation}
                      </p>
                      <div className="pt-1.5 border-t border-[#DDE3EC] text-[10px] text-[#165DFF]">
                        <strong>Action:</strong> {anom.required_action}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 rounded-xl bg-[#F7F9FC] border border-[#DDE3EC] text-xs text-[#16A36A] text-center space-y-1">
                  <CheckCircle2 className="w-6 h-6 mx-auto text-[#16A36A]" />
                  <div className="font-heading font-bold">Clean Geographic Transit Path</div>
                  <p className="text-[11px] text-[#667085]">
                    No intercontinental routing deviations or anomalous transit hops detected.
                  </p>
                </div>
              )}
            </div>

            {/* Quick Analysis Jump Card */}
            {activeCase && (
              <div className="bg-white rounded-2xl border border-[#DDE3EC] p-5 shadow-sm space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#165DFF]" />
                  <h4 className="font-heading font-bold text-xs text-[#123B70]">
                    Ready to review entire forensic findings?
                  </h4>
                </div>
                <p className="text-xs text-[#667085] leading-relaxed">
                  Examine full authentication results, sender identity relationships, and defanged link evidence for this case.
                </p>
                <Link
                  to={`/analysis/${activeCase.id}/threat`}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#EAF2FF] hover:bg-[#165DFF] border border-[#165DFF]/20 hover:border-[#165DFF] text-[#165DFF] hover:text-white font-heading font-bold text-xs flex items-center justify-center gap-2 transition shadow-xs cursor-pointer"
                >
                  <span>Open Full Investigation</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
