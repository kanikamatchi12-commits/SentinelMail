import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  FolderLock,
  Search,
  Filter,
  ArrowUpDown,
  RotateCcw,
  ExternalLink,
  Trash2,
  GitCompare,
  Plus,
  Clock,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Mail,
  CheckCircle2,
  Globe2,
  Download,
  CheckSquare,
  Square,
  Fingerprint,
  Layers,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { EmailAnalysis, ThreatCategory, CaseStatus } from '../types.ts';

export const HistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [analyses, setAnalyses] = useState<EmailAnalysis[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [riskFilter, setRiskFilter] = useState<string>('ALL');
  const [geoAnomalyOnly, setGeoAnomalyOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest_risk' | 'lowest_risk'>('newest');

  // Multi-select state for bulk actions
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkStatus, setBulkStatus] = useState<CaseStatus>('Under Review');
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);

  const fetchCases = () => {
    setLoading(true);
    fetch('/api/analyses')
      .then((res) => res.json())
      .then((data: EmailAnalysis[]) => {
        if (Array.isArray(data)) setAnalyses(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCases();
  }, []);

  const handleResetDemo = async () => {
    if (!window.confirm('Reset all sample cases back to clean demo baseline?')) return;
    try {
      const res = await fetch('/api/demo/reset', { method: 'POST' });
      if (res.ok) {
        fetchCases();
        setSelectedIds(new Set());
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleStatusChange = async (caseId: string, newStatus: CaseStatus) => {
    try {
      const res = await fetch(`/api/analyses/${caseId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setAnalyses((prev) =>
          prev.map((c) => (c.id === caseId ? { ...c, status: newStatus } : c))
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Bulk status update
  const handleApplyBulkStatus = async () => {
    if (selectedIds.size === 0) return;
    setIsBulkUpdating(true);
    try {
      await Promise.all(
        Array.from(selectedIds).map((id) =>
          fetch(`/api/analyses/${id}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: bulkStatus }),
          })
        )
      );
      setAnalyses((prev) =>
        prev.map((c) => (selectedIds.has(c.id) ? { ...c, status: bulkStatus } : c))
      );
      setSelectedIds(new Set());
    } catch (e) {
      console.error(e);
    } finally {
      setIsBulkUpdating(false);
    }
  };

  // Checkbox toggle helpers
  const handleToggleSelectAll = () => {
    if (selectedIds.size === filteredCases.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredCases.map((c) => c.id)));
    }
  };

  const handleToggleSelectRow = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  // Export CSV
  const handleExportSelectedCSV = () => {
    const targetCases =
      selectedIds.size > 0
        ? analyses.filter((c) => selectedIds.has(c.id))
        : filteredCases;

    if (targetCases.length === 0) return;

    const headers = [
      'Case ID',
      'Subject',
      'Sender',
      'Sender Domain',
      'Threat Category',
      'Risk Score',
      'Status',
      'Origin Country',
      'SPF',
      'DKIM',
      'DMARC',
      'Created At',
    ];

    const rows = targetCases.map((c) => [
      `"${c.id}"`,
      `"${(c.subject || '').replace(/"/g, '""')}"`,
      `"${c.from_address}"`,
      `"${c.from_domain}"`,
      `"${c.threat_category}"`,
      c.risk_score,
      `"${c.status || 'New'}"`,
      `"${c.originating_country || ''}"`,
      `"${c.spf_result}"`,
      `"${c.dkim_result}"`,
      `"${c.dmarc_result}"`,
      `"${c.created_at || c.date}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `sentinelmail-cases-${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter & Sort Logic
  const filteredCases = useMemo(() => {
    return analyses
      .filter((c) => {
        // Search
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchSubject = (c.subject || '').toLowerCase().includes(q);
          const matchSender = (c.from_address || '').toLowerCase().includes(q);
          const matchDomain = (c.from_domain || '').toLowerCase().includes(q);
          const matchId = (c.id || '').toLowerCase().includes(q);
          const matchHash = (c.sha256_hash || '').toLowerCase().includes(q);
          if (!matchSubject && !matchSender && !matchDomain && !matchId && !matchHash) {
            return false;
          }
        }

        // Category Filter
        if (categoryFilter !== 'ALL') {
          if (categoryFilter === 'Phishing' && c.threat_category !== 'Phishing') return false;
          if (categoryFilter === 'BEC' && c.threat_category !== 'Business Email Compromise' && c.threat_category !== 'BEC') return false;
          if (categoryFilter === 'Spoofing' && c.threat_category !== 'Spoofing') return false;
          if (categoryFilter === 'Safe' && c.threat_category !== 'Likely Safe' && c.threat_category !== 'Safe') return false;
        }

        // Status Filter
        if (statusFilter !== 'ALL') {
          if ((c.status || 'New') !== statusFilter) return false;
        }

        // Risk Filter
        if (riskFilter !== 'ALL') {
          if (riskFilter === 'CRITICAL' && c.risk_score < 85) return false;
          if (riskFilter === 'HIGH' && (c.risk_score < 70 || c.risk_score >= 85)) return false;
          if (riskFilter === 'SUSPICIOUS' && (c.risk_score < 50 || c.risk_score >= 70)) return false;
          if (riskFilter === 'SAFE' && c.risk_score >= 50) return false;
        }

        // Geo Anomaly Filter
        if (geoAnomalyOnly) {
          const hasGeoAnomaly =
            c.routing_hops?.some((h) => h.anomalous) ||
            (c.geo_anomalies && c.geo_anomalies.length > 0);
          if (!hasGeoAnomaly) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'highest_risk') return b.risk_score - a.risk_score;
        if (sortBy === 'lowest_risk') return a.risk_score - b.risk_score;
        if (sortBy === 'oldest') {
          return new Date(a.created_at || a.date).getTime() - new Date(b.created_at || b.date).getTime();
        }
        return new Date(b.created_at || b.date).getTime() - new Date(a.created_at || a.date).getTime();
      });
  }, [analyses, searchQuery, categoryFilter, statusFilter, riskFilter, geoAnomalyOnly, sortBy]);

  const threatBadgeStyle = (category: string) => {
    switch (category) {
      case 'Phishing':
        return 'bg-[#D92D20]/10 text-[#D92D20] border-[#D92D20]/30';
      case 'Business Email Compromise':
      case 'BEC':
        return 'bg-[#F97316]/10 text-[#F97316] border-[#F97316]/30';
      case 'Spoofing':
        return 'bg-[#F4B400]/10 text-[#F4B400] border-[#F4B400]/30';
      case 'Likely Safe':
      case 'Safe':
        return 'bg-[#16A36A]/10 text-[#16A36A] border-[#16A36A]/30';
      default:
        return 'bg-[#165DFF]/10 text-[#165DFF] border-[#165DFF]/30';
    }
  };

  return (
    <div id="cases-management-page" className="min-h-[calc(100vh-4rem)] bg-[#F7F9FC] text-[#172033] py-8 px-4 sm:px-6 lg:px-8 space-y-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Bar */}
        <div className="bg-white rounded-2xl border border-[#DDE3EC] p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#EAF2FF] text-[#165DFF] flex items-center justify-center shadow-xs">
                <FolderLock className="w-5 h-5" />
              </div>
              <h1 className="text-xl sm:text-2xl font-heading font-extrabold text-[#123B70] tracking-tight">
                Case Files & Forensics Repository
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-[#EAF2FF] text-[#165DFF] border border-[#165DFF]/30">
                {filteredCases.length} Dossiers
              </span>
            </div>
            <p className="text-xs text-[#667085]">
              Comprehensive repository of analyzed email evidence dossiers, hash proofs, routing traces, and triage outcomes.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              to="/analyze"
              className="px-4 py-2.5 rounded-xl bg-[#165DFF] hover:bg-[#123B70] text-white text-xs font-heading font-bold flex items-center gap-2 shadow-sm transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Analyze New Email</span>
            </Link>

            <button
              type="button"
              onClick={handleResetDemo}
              className="px-3.5 py-2.5 rounded-xl bg-[#F7F9FC] border border-[#DDE3EC] hover:bg-[#EAF2FF] text-xs font-heading font-semibold text-[#667085] hover:text-[#123B70] transition flex items-center gap-1.5 cursor-pointer"
              title="Reset sample cases"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Demo</span>
            </button>
          </div>
        </div>

        {/* Filter & Search Toolbar */}
        <div className="bg-white rounded-2xl border border-[#DDE3EC] p-5 shadow-sm space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
            {/* Search Box */}
            <div className="lg:col-span-5 relative">
              <Search className="w-4 h-4 text-[#667085] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Subject, Sender, Domain, Case ID, or SHA-256..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#DDE3EC] text-xs bg-white text-[#172033] placeholder-[#667085]/60 focus:outline-none focus:border-[#165DFF]"
              />
            </div>

            {/* Threat Category */}
            <div className="lg:col-span-2">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#DDE3EC] bg-white text-xs text-[#172033] focus:outline-none focus:border-[#165DFF] cursor-pointer"
              >
                <option value="ALL">All Categories</option>
                <option value="Phishing">Phishing</option>
                <option value="BEC">BEC / Impersonation</option>
                <option value="Spoofing">Domain Spoofing</option>
                <option value="Safe">Legitimate / Safe</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="lg:col-span-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#DDE3EC] bg-white text-xs text-[#172033] focus:outline-none focus:border-[#165DFF] cursor-pointer"
              >
                <option value="ALL">All Statuses</option>
                <option value="New">New / Unreviewed</option>
                <option value="Under Review">Under Review</option>
                <option value="Escalated">Escalated</option>
                <option value="False Positive">False Positive</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>

            {/* Risk Level Filter */}
            <div className="lg:col-span-2">
              <select
                value={riskFilter}
                onChange={(e) => setRiskFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#DDE3EC] bg-white text-xs text-[#172033] focus:outline-none focus:border-[#165DFF] cursor-pointer"
              >
                <option value="ALL">All Risk Levels</option>
                <option value="CRITICAL">Critical (85+)</option>
                <option value="HIGH">High (70–84)</option>
                <option value="SUSPICIOUS">Suspicious (50–69)</option>
                <option value="SAFE">Safe (&lt;50)</option>
              </select>
            </div>

            {/* Sort By */}
            <div className="lg:col-span-1">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-2 py-2 rounded-xl border border-[#DDE3EC] bg-white text-xs text-[#172033] focus:outline-none focus:border-[#165DFF] cursor-pointer"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="highest_risk">High Risk</option>
                <option value="lowest_risk">Low Risk</option>
              </select>
            </div>
          </div>

          {/* Second Toolbar Row: Geo Anomaly Toggle & Bulk Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#DDE3EC] text-xs">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setGeoAnomalyOnly(!geoAnomalyOnly)}
                className={`px-3 py-1.5 rounded-xl font-heading font-semibold transition flex items-center gap-1.5 cursor-pointer border ${
                  geoAnomalyOnly
                    ? 'bg-[#6C5CE7]/10 text-[#6C5CE7] border-[#6C5CE7]/30'
                    : 'bg-[#F7F9FC] text-[#667085] border-[#DDE3EC] hover:text-[#172033]'
                }`}
              >
                <Globe2 className="w-3.5 h-3.5 text-[#6C5CE7]" />
                <span>Geo Anomaly Only</span>
              </button>

              {selectedIds.size > 0 && (
                <span className="font-mono text-xs text-[#165DFF] font-semibold">
                  {selectedIds.size} Selected
                </span>
              )}
            </div>

            {/* Bulk Action Controls */}
            <div className="flex items-center gap-2">
              {selectedIds.size === 2 && (
                <button
                  type="button"
                  onClick={() => {
                    const arr = Array.from(selectedIds);
                    navigate(`/compare?case1=${arr[0]}&case2=${arr[1]}`);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-[#6C5CE7] text-white text-xs font-heading font-bold hover:bg-[#5848c2] transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <GitCompare className="w-3.5 h-3.5" />
                  <span>Compare 2 Cases</span>
                </button>
              )}

              {selectedIds.size > 0 && (
                <div className="flex items-center gap-1.5 bg-[#F7F9FC] p-1 rounded-xl border border-[#DDE3EC]">
                  <span className="text-[11px] text-[#667085] px-1">Set Status:</span>
                  <select
                    value={bulkStatus}
                    onChange={(e) => setBulkStatus(e.target.value as CaseStatus)}
                    className="px-2 py-1 rounded-lg border border-[#DDE3EC] bg-white text-xs text-[#172033] focus:outline-none cursor-pointer"
                  >
                    <option value="Under Review">Under Review</option>
                    <option value="Escalated">Escalated</option>
                    <option value="False Positive">False Positive</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                  <button
                    type="button"
                    onClick={handleApplyBulkStatus}
                    disabled={isBulkUpdating}
                    className="px-2.5 py-1 rounded-lg bg-[#165DFF] text-white text-[11px] font-heading font-semibold hover:bg-[#123B70] transition cursor-pointer"
                  >
                    {isBulkUpdating ? 'Updating...' : 'Apply'}
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={handleExportSelectedCSV}
                className="px-3.5 py-1.5 rounded-xl bg-[#F7F9FC] border border-[#DDE3EC] hover:bg-[#EAF2FF] text-xs font-heading font-semibold text-[#172033] transition flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-[#165DFF]" />
                <span>Export {selectedIds.size > 0 ? `(${selectedIds.size})` : 'All'} CSV</span>
              </button>
            </div>
          </div>
        </div>

        {/* Case Table */}
        <div className="bg-white rounded-2xl border border-[#DDE3EC] shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-16 text-center text-xs text-[#667085] flex flex-col items-center justify-center space-y-2">
              <div className="h-7 w-7 animate-spin rounded-full border-2 border-[#165DFF] border-t-transparent" />
              <span>Loading Case Files Repository...</span>
            </div>
          ) : filteredCases.length === 0 ? (
            <div className="p-16 text-center text-xs text-[#667085] space-y-2">
              <FolderLock className="w-10 h-10 text-[#667085]/30 mx-auto" />
              <h3 className="font-heading font-bold text-sm text-[#123B70]">No Case Files Match Filter</h3>
              <p className="max-w-md mx-auto">
                Try broadening search criteria, clearing filters, or analyzing a new email submission.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#DDE3EC] bg-[#F7F9FC] text-[#667085] font-heading font-semibold text-[11px] uppercase tracking-wider">
                    <th className="py-3.5 px-3.5 w-10 text-center">
                      <button
                        type="button"
                        onClick={handleToggleSelectAll}
                        className="cursor-pointer text-[#667085] hover:text-[#172033]"
                      >
                        {selectedIds.size === filteredCases.length && filteredCases.length > 0 ? (
                          <CheckSquare className="w-4 h-4 text-[#165DFF]" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                    </th>
                    <th className="py-3.5 px-3">Case ID</th>
                    <th className="py-3.5 px-3">Subject / Ingestion Title</th>
                    <th className="py-3.5 px-3">Sender & Domain</th>
                    <th className="py-3.5 px-3">Category</th>
                    <th className="py-3.5 px-3">Risk Score</th>
                    <th className="py-3.5 px-3">Transit Origin</th>
                    <th className="py-3.5 px-3 text-center">Geo Anomaly</th>
                    <th className="py-3.5 px-3">Status</th>
                    <th className="py-3.5 px-3">Date</th>
                    <th className="py-3.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DDE3EC]">
                  {filteredCases.map((item) => {
                    const isSelected = selectedIds.has(item.id);
                    const firstHop = item.routing_hops && item.routing_hops.length > 0 ? item.routing_hops[0] : null;
                    const hasGeoAnomaly = item.routing_hops?.some((h) => h.anomalous);

                    return (
                      <tr
                        key={item.id}
                        onClick={() => navigate(`/analysis/${item.id}/threat`)}
                        className={`hover:bg-[#F7F9FC] transition cursor-pointer select-none ${
                          isSelected ? 'bg-[#EAF2FF]/60' : ''
                        }`}
                      >
                        {/* Checkbox */}
                        <td className="py-3 px-3.5 text-center">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleSelectRow(item.id);
                            }}
                            className="cursor-pointer text-[#667085] hover:text-[#172033]"
                          >
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-[#165DFF]" />
                            ) : (
                              <Square className="w-4 h-4" />
                            )}
                          </button>
                        </td>

                        {/* Case ID */}
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1.5">
                            <Link
                              to={`/analysis/${item.id}/threat`}
                              onClick={(e) => e.stopPropagation()}
                              className="font-mono font-bold text-[#165DFF] hover:underline"
                            >
                              {item.id}
                            </Link>
                            {item.is_demo && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-heading font-bold uppercase tracking-wider bg-[#F4B400]/15 text-[#B45309] border border-[#F4B400]/40">
                                Demo
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Subject */}
                        <td className="py-3 px-3 font-medium text-[#172033] max-w-[200px] truncate" title={item.subject}>
                          <Link
                            to={`/analysis/${item.id}/threat`}
                            onClick={(e) => e.stopPropagation()}
                            className="hover:text-[#165DFF] transition"
                          >
                            {item.subject || '(No Subject)'}
                          </Link>
                        </td>

                        {/* Claimed Sender */}
                        <td className="py-3 px-3 max-w-[170px] truncate">
                          <div className="font-heading font-semibold text-[#123B70] truncate" title={item.from_address}>
                            {item.from_address}
                          </div>
                          <div className="font-mono text-[10px] text-[#667085] truncate">
                            {item.from_domain}
                          </div>
                        </td>

                        {/* Threat Category */}
                        <td className="py-3 px-3">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-heading font-bold uppercase tracking-wider border ${threatBadgeStyle(
                              item.threat_category
                            )}`}
                          >
                            {item.threat_category}
                          </span>
                        </td>

                        {/* Risk Score */}
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <div className="w-12 h-2 rounded-full bg-[#F7F9FC] border border-[#DDE3EC] overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  item.risk_score >= 85
                                    ? 'bg-[#D92D20]'
                                    : item.risk_score >= 70
                                    ? 'bg-[#F97316]'
                                    : item.risk_score >= 50
                                    ? 'bg-[#F4B400]'
                                    : 'bg-[#16A36A]'
                                }`}
                                style={{ width: `${item.risk_score}%` }}
                              />
                            </div>
                            <span className="font-mono font-bold text-xs text-[#123B70]">
                              {item.risk_score}
                            </span>
                          </div>
                        </td>

                        {/* Route / First Public IP */}
                        <td className="py-3 px-3 font-mono text-[11px] text-[#667085]">
                          <div className="font-semibold text-[#123B70]">
                            {firstHop?.ip || item.originating_ip || 'Local/Internal'}
                          </div>
                          <div className="text-[10px] text-[#667085]">
                            {firstHop?.country || item.originating_country || 'United States'}
                          </div>
                        </td>

                        {/* Geo Anomaly Indicator */}
                        <td className="py-3 px-3 text-center">
                          {hasGeoAnomaly ? (
                            <span
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#6C5CE7]/10 text-[#6C5CE7] border border-[#6C5CE7]/30 text-[10px] font-heading font-semibold"
                              title="Transit exhibits anomalous routing / proxy hops"
                            >
                              <AlertTriangle className="w-3 h-3 text-[#6C5CE7]" />
                              <span>Anomaly</span>
                            </span>
                          ) : (
                            <span className="text-[11px] text-[#667085]/40 font-mono">—</span>
                          )}
                        </td>

                        {/* Status Selector */}
                        <td className="py-3 px-3" onClick={(e) => e.stopPropagation()}>
                          <select
                            value={item.status || 'New'}
                            onChange={(e) => handleStatusChange(item.id, e.target.value as CaseStatus)}
                            className="px-2 py-1 rounded-lg border border-[#DDE3EC] bg-white text-[11px] font-heading font-semibold text-[#172033] focus:outline-none cursor-pointer"
                          >
                            <option value="New">New</option>
                            <option value="Under Review">Under Review</option>
                            <option value="Escalated">Escalated</option>
                            <option value="False Positive">False Positive</option>
                            <option value="Resolved">Resolved</option>
                          </select>
                        </td>

                        {/* Date */}
                        <td className="py-3 px-3 text-[11px] font-mono text-[#667085] whitespace-nowrap">
                          {new Date(item.created_at || item.date).toLocaleDateString()}
                        </td>

                        {/* Action: View Analysis */}
                        <td className="py-3 px-3 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => navigate(`/analysis/${item.id}/threat`)}
                            className="px-3 py-1.5 rounded-xl bg-[#EAF2FF] hover:bg-[#165DFF] border border-[#165DFF]/20 hover:border-[#165DFF] text-[#165DFF] hover:text-white font-heading font-bold text-xs transition inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                          >
                            <span>Inspect</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
