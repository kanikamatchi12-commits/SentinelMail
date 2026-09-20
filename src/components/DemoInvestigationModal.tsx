import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FlaskConical,
  X,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Info,
  Loader2,
  FileCode,
} from 'lucide-react';
import { useDemo } from '../context/DemoContext.tsx';
import { SampleEmailFixture } from '../types.ts';

export const DemoInvestigationModal: React.FC = () => {
  const navigate = useNavigate();
  const { demoModalOpen, setDemoModalOpen, startDemoInvestigation } = useDemo();
  const [samples, setSamples] = useState<SampleEmailFixture[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSample, setSelectedSample] = useState<SampleEmailFixture | null>(null);
  const [launchingId, setLaunchingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!demoModalOpen) return;
    setLoading(true);
    setError(null);
    fetch('/api/samples')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load demonstration samples');
        return res.json();
      })
      .then((data: SampleEmailFixture[]) => {
        if (Array.isArray(data)) {
          setSamples(data);
          if (data.length > 0 && !selectedSample) {
            setSelectedSample(data[0]);
          }
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error loading samples:', err);
        setError('Could not retrieve demonstration email scenarios.');
        setLoading(false);
      });
  }, [demoModalOpen]);

  if (!demoModalOpen) return null;

  const handleLaunch = async (sample: SampleEmailFixture) => {
    setLaunchingId(sample.id);
    setError(null);
    try {
      const caseId = await startDemoInvestigation(sample);
      // Follow normal workflow: Demo Email -> Processing -> Threat Analysis -> GeoLocation -> Forensic Evidence -> Threat Alert -> Final Report
      // Begin with Page 3: Processing (or /processing/:caseId)
      navigate(`/processing/${caseId}`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to start demo investigation.');
      setLaunchingId(null);
    }
  };

  const getRiskBadgeColor = (score: number) => {
    if (score >= 85) return 'bg-[#D92D20]/10 text-[#D92D20] border-[#D92D20]/30';
    if (score >= 60) return 'bg-[#F97316]/10 text-[#F97316] border-[#F97316]/30';
    if (score >= 30) return 'bg-[#F4B400]/10 text-[#B45309] border-[#F4B400]/30';
    return 'bg-[#16A36A]/10 text-[#16A36A] border-[#16A36A]/30';
  };

  return (
    <div
      id="demo-investigation-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#123B70]/40 backdrop-blur-xs animate-fadeIn"
      onClick={() => setDemoModalOpen(false)}
    >
      <div
        className="relative w-full max-w-4xl bg-white border border-[#DDE3EC] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="px-6 py-5 border-b border-[#DDE3EC] bg-gradient-to-r from-[#F7F9FC] to-white flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#EAF2FF] text-[#165DFF] flex items-center justify-center shadow-xs">
                <FlaskConical className="w-5 h-5 text-[#165DFF]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-heading font-extrabold text-[#123B70]">
                    Select Demo Investigation
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-heading font-bold uppercase tracking-wider bg-[#F4B400]/15 text-[#B45309] border border-[#F4B400]/40">
                    Demonstration Data
                  </span>
                </div>
                <p className="text-xs text-[#667085] mt-0.5">
                  Choose a verified security scenario to test the full 7-step digital forensic pipeline.
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setDemoModalOpen(false)}
            className="p-2 rounded-xl text-[#667085] hover:text-[#172033] hover:bg-[#F7F9FC] transition cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Informational Guidance Banner */}
        <div className="px-6 py-2.5 bg-[#EAF2FF]/60 border-b border-[#165DFF]/20 flex items-center justify-between text-xs text-[#123B70]">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-[#165DFF] shrink-0" />
            <span>
              <strong>Full Investigation Sequence:</strong> Demo Email → Processing → Threat Analysis → GeoLocation → Forensic Evidence → Threat Alert → Final Report.
            </span>
          </div>
          <span className="text-[11px] font-mono text-[#165DFF] font-semibold hidden md:inline">
            Manual Step-by-Step
          </span>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-[#D92D20]/10 border border-[#D92D20]/30 text-[#D92D20] text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {loading ? (
            <div className="py-16 text-center text-xs text-[#667085] space-y-3">
              <Loader2 className="w-8 h-8 text-[#165DFF] animate-spin mx-auto" />
              <p>Loading curated demonstration threat scenarios...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {samples.map((sample) => {
                const isSelected = selectedSample?.id === sample.id;
                const isLaunching = launchingId === sample.id;

                return (
                  <div
                    key={sample.id}
                    onClick={() => setSelectedSample(sample)}
                    className={`relative p-4 rounded-xl border text-xs cursor-pointer transition-all flex flex-col justify-between gap-3 ${
                      isSelected
                        ? 'bg-[#EAF2FF]/40 border-[#165DFF] shadow-sm ring-2 ring-[#165DFF]/20'
                        : 'bg-white border-[#DDE3EC] hover:border-[#165DFF]/50 hover:bg-[#F7F9FC]'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-heading font-bold text-xs sm:text-sm text-[#123B70] line-clamp-2">
                          {sample.title}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold shrink-0 border ${getRiskBadgeColor(
                            sample.risk_score
                          )}`}
                        >
                          {sample.risk_score}/100 Risk
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-[10px] font-mono">
                        <span className="px-2 py-0.5 rounded bg-white border border-[#DDE3EC] text-[#667085] font-semibold">
                          {sample.badge || sample.type}
                        </span>
                        <span className="text-[#667085] truncate">
                          {sample.filename}
                        </span>
                      </div>

                      <p className="text-xs text-[#667085] leading-relaxed line-clamp-3">
                        {sample.summary}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-[#DDE3EC] flex items-center justify-between">
                      <span className="text-[11px] font-heading font-medium text-[#165DFF]">
                        {isSelected ? '✓ Selected Scenario' : 'Click to select'}
                      </span>

                      <button
                        type="button"
                        disabled={launchingId !== null}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLaunch(sample);
                        }}
                        className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-heading font-bold text-white transition cursor-pointer shadow-xs ${
                          isLaunching
                            ? 'bg-[#123B70] cursor-wait'
                            : isSelected
                            ? 'bg-[#165DFF] hover:bg-[#123B70]'
                            : 'bg-[#123B70] hover:bg-[#165DFF]'
                        }`}
                      >
                        {isLaunching ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Starting...</span>
                          </>
                        ) : (
                          <>
                            <span>Investigate</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#F7F9FC] border-t border-[#DDE3EC] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#667085]">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#16A36A]" />
            <span>
              All demo cases include pre-parsed cryptographic headers, simulated MTA hops & synthetic SOC alerts.
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={() => setDemoModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-[#DDE3EC] bg-white text-xs font-heading font-semibold text-[#667085] hover:text-[#172033] hover:bg-[#F7F9FC] transition cursor-pointer"
            >
              Cancel
            </button>
            {selectedSample && (
              <button
                type="button"
                disabled={launchingId !== null}
                onClick={() => handleLaunch(selectedSample)}
                className="px-5 py-2 rounded-xl bg-[#165DFF] hover:bg-[#123B70] text-white text-xs font-heading font-bold inline-flex items-center gap-2 transition cursor-pointer shadow-sm"
              >
                {launchingId ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Launching Investigation...</span>
                  </>
                ) : (
                  <>
                    <FlaskConical className="w-3.5 h-3.5" />
                    <span>Launch Demo Investigation</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
