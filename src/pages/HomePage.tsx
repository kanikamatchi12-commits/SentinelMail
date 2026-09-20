import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Inbox,
  AlertTriangle,
  Search,
  Plus,
  RefreshCw,
  Globe2,
  Shield,
  Filter,
  ArrowRight,
  Sparkles,
  Layers,
  Clock,
  ShieldAlert,
  FileCheck,
  CheckCircle2,
  AlertCircle,
  Hash,
} from 'lucide-react';
import { EmailAnalysis, CaseStatus } from '../types.ts';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [analyses, setAnalyses] = useState<EmailAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'highest_risk' | 'lowest_risk'>('newest');

  const fetchAnalyses = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/analyses');
      if (res.ok) {
        const data: EmailAnalysis[] = await res.json();
        setAnalyses(data);
      }
    } catch (err) {
      console.error('Failed to load triage queue:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyses();
  }, []);

  // Filter counts for quick filter bar
  const counts = useMemo(() => {
    return {
      all: analyses.length,
      critical: analyses.filter((a) => a.risk_score >= 85).length,
      phishing: analyses.filter((a) => a.threat_category === 'Phishing').length,
      spoofing: analyses.filter((a) => a.threat_category === 'Spoofing').length,
      bec: analyses.filter(
        (a) => a.threat_category === 'Business Email Compromise' || a.threat_category === 'BEC'
      ).length,
      geoAnomaly: analyses.filter(
        (a) =>
          (a.routing_hops && a.routing_hops.some((h) => h.anomalous)) ||
          (a.geo_anomalies && a.geo_anomalies.length > 0)
      ).length,
      authWarning: analyses.filter(
        (a) => a.spf_result === 'fail' || a.dkim_result === 'fail' || a.dmarc_result === 'fail' || a.reply_to_mismatch
      ).length,
      safe: analyses.filter((a) => a.risk_score < 30 || a.threat_category === 'Likely Safe' || a.threat_category === 'Safe').length,
    };
  }, [analyses]);

  // Filtered list
  const filteredList = useMemo(() => {
    return analyses
      .filter((item) => {
        // Filter tabs
        if (activeFilter === 'CRITICAL' && item.risk_score < 85) return false;
        if (activeFilter === 'PHISHING' && item.threat_category !== 'Phishing') return false;
        if (activeFilter === 'SPOOFING' && item.threat_category !== 'Spoofing') return false;
        if (
          activeFilter === 'BEC' &&
          item.threat_category !== 'Business Email Compromise' &&
          item.threat_category !== 'BEC'
        )
          return false;
        if (
          activeFilter === 'GEO_ANOMALY' &&
          !item.routing_hops?.some((h) => h.anomalous) &&
          (!item.geo_anomalies || item.geo_anomalies.length === 0)
        )
          return false;
        if (
          activeFilter === 'AUTH_WARNING' &&
          item.spf_result !== 'fail' &&
          item.dkim_result !== 'fail' &&
          item.dmarc_result !== 'fail' &&
          !item.reply_to_mismatch
        )
          return false;
        if (
          activeFilter === 'SAFE' &&
          item.risk_score >= 30 &&
          item.threat_category !== 'Likely Safe' &&
          item.threat_category !== 'Safe'
        )
          return false;

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchSubject = (item.subject || '').toLowerCase().includes(q);
          const matchSender = (item.from_address || '').toLowerCase().includes(q);
          const matchName = (item.from_name || '').toLowerCase().includes(q);
          const matchId = (item.id || '').toLowerCase().includes(q);
          if (!matchSubject && !matchSender && !matchName && !matchId) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'highest_risk') return b.risk_score - a.risk_score;
        if (sortBy === 'lowest_risk') return a.risk_score - b.risk_score;
        // default: newest
        return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime();
      });
  }, [analyses, activeFilter, searchQuery, sortBy]);

  const getThreatBadge = (score: number) => {
    if (score >= 85) {
      return {
        label: 'Critical',
        className: 'bg-[#D92D20]/10 text-[#D92D20] border border-[#D92D20]/30',
      };
    }
    if (score >= 70) {
      return {
        label: 'High Risk',
        className: 'bg-[#F97316]/10 text-[#F97316] border border-[#F97316]/30',
      };
    }
    if (score >= 50) {
      return {
        label: 'Suspicious',
        className: 'bg-[#F4B400]/10 text-[#F4B400] border border-[#F4B400]/30',
      };
    }
    if (score >= 30) {
      return {
        label: 'Needs Review',
        className: 'bg-[#165DFF]/10 text-[#165DFF] border border-[#165DFF]/30',
      };
    }
    return {
      label: 'Low Risk',
      className: 'bg-[#16A36A]/10 text-[#16A36A] border border-[#16A36A]/30',
    };
  };

  return (
    <div id="triage-inbox-page" className="min-h-[calc(100vh-4rem)] bg-[#F7F9FC] text-[#172033] py-8 px-4 sm:px-6 lg:px-8 space-y-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 1. Header Toolbar */}
        <div className="bg-white rounded-2xl border border-[#DDE3EC] p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#EAF2FF] text-[#165DFF] flex items-center justify-center shadow-xs">
                <Inbox className="w-5 h-5" />
              </div>
              <h1 className="text-xl sm:text-2xl font-heading font-extrabold text-[#123B70] tracking-tight">
                Triage Inbox
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-[#EAF2FF] text-[#165DFF] border border-[#165DFF]/30">
                {filteredList.length} Active {filteredList.length === 1 ? 'Case' : 'Cases'}
              </span>
            </div>
            <p className="text-xs text-[#667085]">
              Priority queue of analyzed emails awaiting SOC review, quarantine enforcement, or incident escalation.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={fetchAnalyses}
              className="p-2.5 rounded-xl bg-[#F7F9FC] hover:bg-[#EAF2FF] border border-[#DDE3EC] text-[#667085] hover:text-[#123B70] transition cursor-pointer"
              title="Refresh queue"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#165DFF]' : ''}`} />
            </button>

            <Link
              to="/analyze"
              className="px-4 py-2.5 rounded-xl bg-[#165DFF] hover:bg-[#123B70] text-white text-xs font-heading font-bold flex items-center gap-2 shadow-sm transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Analyze New Email</span>
            </Link>
          </div>
        </div>

        {/* 2. Quick Filters Bar */}
        <div className="bg-white rounded-2xl border border-[#DDE3EC] p-4 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-xs font-heading font-semibold text-[#123B70]">
            <Filter className="w-3.5 h-3.5 text-[#165DFF]" />
            <span>Quick Filters:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'ALL', label: 'All Cases', count: counts.all },
              { id: 'CRITICAL', label: 'Critical Risk', count: counts.critical, color: 'text-[#D92D20]' },
              { id: 'PHISHING', label: 'Phishing', count: counts.phishing },
              { id: 'SPOOFING', label: 'Spoofing', count: counts.spoofing },
              { id: 'BEC', label: 'BEC', count: counts.bec },
              { id: 'GEO_ANOMALY', label: 'Geo Anomaly', count: counts.geoAnomaly, color: 'text-[#6C5CE7]' },
              { id: 'AUTH_WARNING', label: 'Auth Warning', count: counts.authWarning, color: 'text-[#F4B400]' },
              { id: 'SAFE', label: 'Safe / Low', count: counts.safe, color: 'text-[#16A36A]' },
            ].map((tab) => {
              const isActive = activeFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-heading font-medium transition cursor-pointer flex items-center gap-1.5 border ${
                    isActive
                      ? 'bg-[#EAF2FF] border-[#165DFF] text-[#165DFF] font-bold shadow-xs'
                      : 'bg-[#F7F9FC] border-[#DDE3EC] text-[#667085] hover:text-[#172033] hover:bg-white'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                      isActive
                        ? 'bg-[#165DFF] text-white'
                        : 'bg-white text-[#667085] border border-[#DDE3EC]'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Search, Sort, and Compact Email Rows Table */}
        <div className="bg-white rounded-2xl border border-[#DDE3EC] shadow-sm overflow-hidden flex flex-col">
          {/* Search & Sort Toolbar */}
          <div className="p-4 border-b border-[#DDE3EC] bg-[#F7F9FC] flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-96">
              <Search className="w-4 h-4 text-[#667085] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by subject, sender, case ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-[#DDE3EC] rounded-xl text-xs text-[#172033] placeholder-[#667085]/60 focus:outline-none focus:border-[#165DFF]"
              />
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto text-xs text-[#667085]">
              <span className="font-heading font-medium text-[#123B70]">Sort By:</span>
              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="bg-white border border-[#DDE3EC] text-xs text-[#172033] rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#165DFF] cursor-pointer"
              >
                <option value="newest">Newest Cases First</option>
                <option value="highest_risk">Highest Risk Score</option>
                <option value="lowest_risk">Lowest Risk Score</option>
              </select>
            </div>
          </div>

          {/* Compact Email Rows */}
          <div className="divide-y divide-[#DDE3EC]" id="triage-email-rows">
            {loading ? (
              <div className="p-16 text-center text-xs text-[#667085] flex flex-col items-center justify-center space-y-2">
                <div className="h-7 w-7 animate-spin rounded-full border-2 border-[#165DFF] border-t-transparent" />
                <span>Loading triage queue...</span>
              </div>
            ) : filteredList.length === 0 ? (
              <div className="p-16 text-center text-xs text-[#667085] space-y-2">
                <Inbox className="w-10 h-10 mx-auto text-[#667085]/30" />
                <div className="font-heading font-semibold text-sm text-[#123B70]">No emails match criteria</div>
                <p>Try resetting filters or analyzing a new email.</p>
              </div>
            ) : (
              filteredList.map((email) => {
                const badge = getThreatBadge(email.risk_score);
                const hasGeoAnomaly =
                  (email.routing_hops && email.routing_hops.some((h) => h.anomalous)) ||
                  (email.geo_anomalies && email.geo_anomalies.length > 0);
                const hasAuthWarning =
                  email.spf_result === 'fail' ||
                  email.dkim_result === 'fail' ||
                  email.dmarc_result === 'fail' ||
                  email.reply_to_mismatch;

                return (
                  <div
                    key={email.id}
                    onClick={() => navigate(`/analysis/${email.id}/threat`)}
                    className="p-4 transition-colors hover:bg-[#F7F9FC] cursor-pointer flex flex-col lg:flex-row lg:items-center justify-between gap-4 group"
                  >
                    {/* Left: Avatar, Sender, Subject, Case ID, Category */}
                    <div className="flex items-start gap-3.5 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-[#EAF2FF] border border-[#DDE3EC] text-[#165DFF] flex items-center justify-center font-heading font-bold text-xs shrink-0 group-hover:border-[#165DFF] transition">
                        {email.from_name ? email.from_name.slice(0, 1).toUpperCase() : email.from_address.slice(0, 1).toUpperCase()}
                      </div>

                      <div className="flex-1 min-w-0 space-y-1">
                        {/* Sender & Case ID */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-heading font-bold text-xs text-[#123B70] truncate max-w-[200px]" title={email.from_name || email.from_address}>
                            {email.from_name || email.from_address}
                          </span>
                          <span className="text-[11px] text-[#667085] font-mono truncate max-w-[220px]">
                            &lt;{email.from_address}&gt;
                          </span>
                          <span className="font-mono text-[10px] text-[#165DFF] bg-[#EAF2FF] px-2 py-0.5 rounded border border-[#165DFF]/20">
                            {email.id}
                          </span>
                          {email.is_demo && (
                            <span className="font-mono text-[9px] text-[#6C5CE7] bg-[#6C5CE7]/10 px-1.5 py-0.2 rounded border border-[#6C5CE7]/30">
                              DEMO
                            </span>
                          )}
                        </div>

                        {/* Subject */}
                        <div className="text-xs text-[#172033] font-semibold truncate group-hover:text-[#165DFF] transition" title={email.subject}>
                          {email.subject || '(No Subject)'}
                        </div>

                        {/* Status Badges Row: Threat Category, Auth Warning, Geo Anomaly, Review Status */}
                        <div className="flex items-center gap-2 flex-wrap pt-0.5 text-[10px] font-mono">
                          <span className="px-2 py-0.5 rounded bg-[#F7F9FC] border border-[#DDE3EC] text-[#667085]">
                            {email.threat_category || 'Phishing'}
                          </span>

                          {hasAuthWarning ? (
                            <span className="px-2 py-0.5 rounded bg-[#F4B400]/10 border border-[#F4B400]/30 text-[#F4B400] flex items-center gap-1 font-bold">
                              <AlertCircle className="w-3 h-3" />
                              <span>Auth Warning</span>
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-[#16A36A]/10 border border-[#16A36A]/30 text-[#16A36A] flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Auth Aligned</span>
                            </span>
                          )}

                          {hasGeoAnomaly ? (
                            <span className="px-2 py-0.5 rounded bg-[#6C5CE7]/10 border border-[#6C5CE7]/30 text-[#6C5CE7] flex items-center gap-1 font-bold">
                              <Globe2 className="w-3 h-3" />
                              <span>Geo Anomaly</span>
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-[#F7F9FC] border border-[#DDE3EC] text-[#667085]">
                              Standard Route
                            </span>
                          )}

                          <span className="px-2 py-0.5 rounded bg-white border border-[#DDE3EC] text-[#667085]">
                            Status: <strong className="text-[#123B70]">{email.status || 'New'}</strong>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Risk Score & Action */}
                    <div className="flex items-center justify-between lg:justify-end gap-4 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-[#DDE3EC]">
                      {/* Risk Score */}
                      <div className="flex items-center gap-2.5">
                        <div className="text-right">
                          <div className="text-xs font-heading font-extrabold text-[#123B70]">
                            {email.risk_score}
                            <span className="text-[10px] text-[#667085] font-normal">/100</span>
                          </div>
                          <span className={`inline-block px-1.5 py-0.2 rounded text-[9px] font-mono font-bold ${badge.className}`}>
                            {badge.label}
                          </span>
                        </div>
                      </div>

                      {/* View Analysis Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/analysis/${email.id}/threat`);
                        }}
                        className="px-3.5 py-2 rounded-xl bg-[#EAF2FF] hover:bg-[#165DFF] border border-[#165DFF]/20 hover:border-[#165DFF] text-[#165DFF] hover:text-white text-xs font-heading font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer whitespace-nowrap"
                      >
                        <span>Inspect Case</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
