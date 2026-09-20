import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Bell,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Send,
  ArrowRight,
  Search,
  Filter,
  Globe2,
  Clock,
  Layers,
  FileCheck2,
  ExternalLink,
} from 'lucide-react';
import { ThreatAlert } from '../types.ts';

export const AlertsPage: React.FC = () => {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState<ThreatAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('All');
  const [selectedAlert, setSelectedAlert] = useState<ThreatAlert | null>(null);

  useEffect(() => {
    fetch('/api/alerts')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setAlerts(data);
          if (data.length > 0) {
            setSelectedAlert(data[0]);
          }
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load alerts:', err);
        setLoading(false);
      });
  }, []);

  const filteredAlerts = alerts.filter((alert) => {
    const matchesSearch =
      alert.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.threat_category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.claimed_sender.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSeverity =
      severityFilter === 'All' || alert.severity.toLowerCase() === severityFilter.toLowerCase();

    return matchesSearch && matchesSeverity;
  });

  const severityBadge = (sev: string) => {
    if (sev === 'Critical') return 'bg-[#D92D20]/10 text-[#D92D20] border-[#D92D20]/30';
    if (sev === 'High') return 'bg-[#F97316]/10 text-[#F97316] border-[#F97316]/30';
    if (sev === 'Medium') return 'bg-[#F4B400]/10 text-[#F4B400] border-[#F4B400]/30';
    return 'bg-[#165DFF]/10 text-[#165DFF] border-[#165DFF]/30';
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#F7F9FC] text-[#172033] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-[#165DFF] bg-[#EAF2FF] px-2 py-0.5 rounded border border-[#165DFF]/20">
                Threat Intelligence
              </span>
              <span className="text-xs text-[#667085]">Incident Broadcast Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#123B70]">
              Threat Alerts & Simulated Broadcasts
            </h1>
            <p className="text-xs sm:text-sm text-[#667085] mt-1">
              Real-time security alert logs generated during email investigations
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/analyze')}
              className="px-4 py-2.5 rounded-xl bg-[#165DFF] text-white text-xs font-heading font-bold hover:bg-[#123B70] transition shadow-sm cursor-pointer"
            >
              Analyze New Email
            </button>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="bg-white rounded-2xl border border-[#DDE3EC] p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-[#667085] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search alerts by ID, subject, sender..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#F7F9FC] border border-[#DDE3EC] text-xs text-[#172033] focus:outline-none focus:border-[#165DFF]"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
            <span className="text-xs text-[#667085] flex items-center gap-1 shrink-0">
              <Filter className="w-3.5 h-3.5" />
              <span>Severity:</span>
            </span>
            {['All', 'Critical', 'High', 'Medium', 'Low'].map((sev) => (
              <button
                key={sev}
                type="button"
                onClick={() => setSeverityFilter(sev)}
                className={`px-3 py-1.5 rounded-xl text-xs font-heading font-semibold transition cursor-pointer shrink-0 ${
                  severityFilter === sev
                    ? 'bg-[#165DFF] text-white shadow-xs'
                    : 'bg-[#F7F9FC] text-[#667085] hover:bg-[#EAF2FF] border border-[#DDE3EC]'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Layout: Alert List on Left, Selected Alert Details on Right */}
        {loading ? (
          <div className="text-center py-16">
            <div className="w-8 h-8 border-3 border-[#165DFF] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs text-[#667085]">Loading threat alerts...</p>
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#DDE3EC] p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#EAF2FF] text-[#165DFF] flex items-center justify-center mx-auto">
              <Bell className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-bold text-base text-[#123B70]">No Threat Alerts Found</h3>
            <p className="text-xs text-[#667085] max-w-sm mx-auto">
              No alert logs match your current search filters. You can generate alerts from any case file.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Alerts List */}
            <div className="space-y-3 lg:col-span-1 max-h-[680px] overflow-y-auto pr-1">
              {filteredAlerts.map((alert) => {
                const isSelected = selectedAlert?.id === alert.id;
                return (
                  <div
                    key={alert.id}
                    onClick={() => setSelectedAlert(alert)}
                    className={`p-4 rounded-2xl border text-xs cursor-pointer transition ${
                      isSelected
                        ? 'bg-white border-[#165DFF] shadow-md ring-2 ring-[#EAF2FF]'
                        : 'bg-white border-[#DDE3EC] hover:border-[#165DFF]/40 shadow-xs'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="font-mono font-bold text-[#123B70]">{alert.id}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-heading font-bold border ${severityBadge(alert.severity)}`}>
                        {alert.severity}
                      </span>
                    </div>

                    <h4 className="font-heading font-bold text-sm text-[#123B70] line-clamp-1">
                      {alert.subject}
                    </h4>

                    <div className="mt-1 text-[#667085] truncate">
                      {alert.claimed_sender}
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-[#DDE3EC] flex items-center justify-between text-[11px] text-[#667085]">
                      <span>{alert.threat_category}</span>
                      <span className="font-mono text-[10px]">{new Date(alert.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selected Alert Detailed View */}
            <div className="lg:col-span-2">
              {selectedAlert ? (
                <div className="bg-white rounded-2xl border border-[#DDE3EC] p-6 shadow-sm space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-[#DDE3EC]">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-base font-bold text-[#123B70]">{selectedAlert.id}</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-heading font-bold border ${severityBadge(selectedAlert.severity)}`}>
                          {selectedAlert.severity} Priority
                        </span>
                        <span className="text-xs text-[#16A36A] font-medium bg-[#16A36A]/10 px-2 py-0.5 rounded">
                          {selectedAlert.status}
                        </span>
                      </div>
                      <h3 className="text-lg font-heading font-bold text-[#123B70] mt-1.5">
                        {selectedAlert.title}
                      </h3>
                    </div>

                    <Link
                      to={`/analysis/${selectedAlert.case_id}/report`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-heading font-semibold bg-[#EAF2FF] text-[#165DFF] hover:bg-[#165DFF]/10 transition"
                    >
                      <span>Open Case Report</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  {/* Attributes Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="p-3.5 rounded-xl bg-[#F7F9FC] border border-[#DDE3EC]">
                      <span className="text-[#667085]">Claimed Sender:</span>
                      <div className="font-mono font-bold text-[#123B70] mt-0.5 truncate">
                        {selectedAlert.claimed_sender}
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#F7F9FC] border border-[#DDE3EC]">
                      <span className="text-[#667085]">Probable Origin:</span>
                      <div className="font-heading font-bold text-[#123B70] mt-0.5 flex items-center gap-1.5">
                        <Globe2 className="w-3.5 h-3.5 text-[#165DFF]" />
                        <span>{selectedAlert.probable_origin}</span>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#F7F9FC] border border-[#DDE3EC]">
                      <span className="text-[#667085]">Risk Score:</span>
                      <div className="text-lg font-heading font-extrabold text-[#D92D20] mt-0.5">
                        {selectedAlert.risk_score} / 100
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#F7F9FC] border border-[#DDE3EC]">
                      <span className="text-[#667085]">Mandated Action:</span>
                      <div className="font-heading font-bold text-[#165DFF] mt-0.5">
                        {selectedAlert.recommended_action}
                      </div>
                    </div>
                  </div>

                  {/* Primary Threat Indicators */}
                  <div>
                    <h4 className="font-heading font-bold text-sm text-[#123B70] mb-2">Correlated Threat Indicators</h4>
                    <div className="space-y-1.5">
                      {selectedAlert.primary_indicators && selectedAlert.primary_indicators.length > 0 ? (
                        selectedAlert.primary_indicators.map((ind, i) => (
                          <div key={i} className="p-2.5 rounded-lg bg-[#F7F9FC] border border-[#DDE3EC] text-xs flex items-center gap-2">
                            <AlertTriangle className="w-3.5 h-3.5 text-[#D92D20] shrink-0" />
                            <span className="text-[#172033] font-medium">{ind}</span>
                          </div>
                        ))
                      ) : (
                        <div className="text-xs text-[#667085]">No specific indicators logged.</div>
                      )}
                    </div>
                  </div>

                  {/* Recipients */}
                  <div>
                    <h4 className="font-heading font-bold text-sm text-[#123B70] mb-2">Broadcast Distribution Recipients</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedAlert.recipients?.map((rec, i) => (
                        <span key={i} className="px-3 py-1 rounded-full text-xs font-medium bg-[#EAF2FF] text-[#165DFF] border border-[#165DFF]/20">
                          {rec}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Analyst Notes */}
                  {selectedAlert.analyst_notes && (
                    <div className="p-4 rounded-xl bg-[#F7F9FC] border border-[#DDE3EC] text-xs">
                      <span className="font-heading font-bold text-[#123B70] block mb-1">Analyst Triage Notes:</span>
                      <p className="text-[#667085] leading-relaxed">{selectedAlert.analyst_notes}</p>
                    </div>
                  )}

                  {/* Quick Action to Navigate to Threat Alert Page or Report */}
                  <div className="pt-4 border-t border-[#DDE3EC] flex items-center justify-between">
                    <Link
                      to={`/analysis/${selectedAlert.case_id}/alert`}
                      className="text-xs font-heading font-bold text-[#165DFF] hover:underline"
                    >
                      Reconfigure Alert Dispatch →
                    </Link>

                    <Link
                      to={`/analysis/${selectedAlert.case_id}/report`}
                      className="px-4 py-2 rounded-xl text-xs font-heading font-bold text-white bg-[#165DFF] hover:bg-[#123B70] transition"
                    >
                      View Investigation Brief
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-[#DDE3EC] p-8 text-center text-xs text-[#667085]">
                  Select an alert on the left to inspect detailed telemetry.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
