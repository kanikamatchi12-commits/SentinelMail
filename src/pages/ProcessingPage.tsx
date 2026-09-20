import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FileText,
  Globe2,
  MapPin,
  Cpu,
  Fingerprint,
  FileCheck2,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  RotateCcw,
  FlaskConical,
  LogOut,
} from 'lucide-react';
import { EmailAnalysis } from '../types.ts';
import { useDemo } from '../context/DemoContext.tsx';

const PROCESSING_STEPS = [
  { id: 1, label: 'Parsing RFC-5322 Headers', detail: 'Extracting sender tokens, Return-Path, Date, Subject, Message-ID, and MIME boundaries...', icon: FileText },
  { id: 2, label: 'Extracting Origin & Intermediate IPs', detail: 'Scanning all Received: lines from bottom origin hop to outermost perimeter gateway...', icon: Globe2 },
  { id: 3, label: 'Geolocating Network Hops', detail: 'Resolving public IPv4/IPv6 relays, ISP/AS organizations, and approximate coordinates...', icon: MapPin },
  { id: 4, label: 'Running Heuristic & AI Threat Engine', detail: 'Correlating SPF, DKIM, DMARC alignment, display impersonation, and psychological urgency...', icon: Cpu },
  { id: 5, label: 'Computing SHA-256 Chain of Custody', detail: 'Generating cryptographic tamper-evident digital forensic hash and evidence envelope...', icon: Fingerprint },
  { id: 6, label: 'Preparing Forensic Brief', detail: 'Synthesizing threat summary, indicator scores, and recommended SOC triage action...', icon: FileCheck2 },
];

export const ProcessingPage: React.FC = () => {
  const { caseId } = useParams<{ caseId: string }>();
  const navigate = useNavigate();
  const { isDemoInvestigation, exitDemoInvestigation } = useDemo();

  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [analysis, setAnalysis] = useState<EmailAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  const isDemo = Boolean(analysis?.is_demo || isDemoInvestigation);

  // Fetch analysis data
  useEffect(() => {
    if (!caseId) return;

    fetch(`/api/analysis/${caseId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Analysis record not found.');
        return res.json();
      })
      .then((data: EmailAnalysis) => {
        setAnalysis(data);
      })
      .catch((err) => {
        console.error('Failed to load analysis for processing:', err);
        setError('Case record could not be loaded for processing.');
      });
  }, [caseId]);

  // Advance smoothly through the 6 processing steps
  useEffect(() => {
    if (error) return;

    const stepInterval = setInterval(() => {
      setCurrentStepIdx((prev) => {
        if (prev < PROCESSING_STEPS.length - 1) {
          return prev + 1;
        }
        clearInterval(stepInterval);
        setIsCompleted(true);
        return prev;
      });
    }, 600);

    return () => clearInterval(stepInterval);
  }, [error]);

  const progressPercent = Math.min(
    100,
    Math.round(((currentStepIdx + (isCompleted ? 1 : 0.5)) / PROCESSING_STEPS.length) * 100)
  );

  const handleContinue = () => {
    if (caseId) {
      navigate(`/analysis/${caseId}/threat`);
    } else {
      navigate('/inbox');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#F7F9FC] text-[#172033] py-10 px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center">
      <div className="w-full max-w-3xl bg-white border border-[#DDE3EC] rounded-2xl shadow-md p-6 sm:p-8">
        {/* Demonstration Data Banner with Exit Demo */}
        {isDemo && (
          <div className="mb-5 p-3 rounded-xl bg-[#F4B400]/10 border border-[#F4B400]/40 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-[#B45309] font-heading font-bold">
              <FlaskConical className="w-4 h-4 text-[#B45309]" />
              <span>Demonstration Data Mode — SIH Security Incident Scenario</span>
            </div>
            <button
              type="button"
              onClick={() => {
                exitDemoInvestigation();
                navigate('/');
              }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-heading font-bold text-[#D92D20] bg-white hover:bg-[#D92D20]/10 border border-[#D92D20]/30 transition cursor-pointer shadow-xs"
              title="Exit Demonstration Investigation and return to Welcome"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Exit Demo</span>
            </button>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#DDE3EC] pb-4 mb-6">
          <div>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-heading font-semibold bg-[#EAF2FF] text-[#165DFF] border border-[#165DFF]/20 mb-2">
              Page 3 — Processing
            </span>
            <h1 className="text-xl sm:text-2xl font-heading font-extrabold text-[#123B70]">
              Processing Email Investigation
            </h1>
            <p className="text-xs sm:text-sm text-[#667085] mt-0.5">
              {caseId ? `Case ID: ${caseId}` : 'Executing deep forensic pipeline'}
            </p>
          </div>

          <div className="text-right">
            <div className="text-2xl sm:text-3xl font-heading font-extrabold text-[#165DFF]">
              {progressPercent}%
            </div>
            <div className="text-[11px] font-mono text-[#667085]">
              Step {currentStepIdx + 1} of {PROCESSING_STEPS.length}
            </div>
          </div>
        </div>

        {error ? (
          <div className="py-6 text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-[#D92D20]/10 flex items-center justify-center text-[#D92D20]">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-bold text-[#123B70]">Processing Interrupted</h3>
            <p className="text-xs text-[#667085]">{error}</p>
            <button
              type="button"
              onClick={() => navigate('/analyze')}
              className="px-4 py-2 rounded-lg bg-[#165DFF] text-white text-xs font-heading font-semibold inline-flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Return to Submit Email</span>
            </button>
          </div>
        ) : (
          <div>
            {/* Active Step Highlight Card */}
            <div className="mb-6 p-4 rounded-xl bg-[#EAF2FF] border border-[#165DFF]/30 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white border border-[#165DFF]/40 flex items-center justify-center text-[#165DFF] shrink-0 shadow-xs">
                  {React.createElement(PROCESSING_STEPS[currentStepIdx]?.icon || FileText, {
                    className: 'w-5 h-5',
                  })}
                </div>
                <div>
                  <div className="text-sm font-heading font-bold text-[#123B70] flex items-center gap-2">
                    {!isCompleted && <span className="w-2 h-2 rounded-full bg-[#165DFF] animate-ping" />}
                    <span>{PROCESSING_STEPS[currentStepIdx]?.label}</span>
                  </div>
                  <p className="text-xs text-[#667085] mt-0.5">
                    {PROCESSING_STEPS[currentStepIdx]?.detail}
                  </p>
                </div>
              </div>
              <span className="hidden sm:inline-block px-2.5 py-1 rounded bg-white text-[11px] font-mono font-medium text-[#165DFF] border border-[#165DFF]/20 shrink-0">
                {isCompleted ? 'COMPLETED' : 'IN-PROGRESS'}
              </span>
            </div>

            {/* Linear Progress Bar */}
            <div className="w-full bg-[#F7F9FC] h-2.5 rounded-full overflow-hidden border border-[#DDE3EC] mb-6">
              <div
                className="h-full bg-gradient-to-r from-[#165DFF] to-[#16A36A] transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* 6 Step-by-Step Progress Status Items */}
            <div className="space-y-2.5 mb-8">
              {PROCESSING_STEPS.map((step, idx) => {
                const isStepFinished = idx < currentStepIdx || isCompleted;
                const isStepActive = idx === currentStepIdx && !isCompleted;

                return (
                  <div
                    key={step.id}
                    className={`p-3 rounded-xl border text-xs flex items-center justify-between transition ${
                      isStepFinished
                        ? 'bg-white border-[#16A36A]/30 text-[#172033]'
                        : isStepActive
                        ? 'bg-white border-[#165DFF] text-[#123B70] shadow-xs ring-2 ring-[#EAF2FF]'
                        : 'bg-[#F7F9FC] border-[#DDE3EC] text-[#667085]/70'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="shrink-0">
                        {isStepFinished ? (
                          <div className="w-5 h-5 rounded-full bg-[#16A36A] text-white flex items-center justify-center">
                            <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                          </div>
                        ) : isStepActive ? (
                          <div className="w-5 h-5 rounded-full border-2 border-[#165DFF] border-t-transparent animate-spin" />
                        ) : (
                          <div className="w-5 h-5 rounded-full border border-[#DDE3EC] bg-white flex items-center justify-center text-[10px] font-mono text-[#667085]">
                            {step.id}
                          </div>
                        )}
                      </div>
                      <div>
                        <span className={`font-medium ${isStepActive ? 'font-heading font-bold text-[#165DFF]' : ''}`}>
                          {step.id}. {step.label}
                        </span>
                      </div>
                    </div>

                    <span className="text-[11px] font-mono">
                      {isStepFinished ? (
                        <span className="text-[#16A36A] font-semibold">Done</span>
                      ) : isStepActive ? (
                        <span className="text-[#165DFF] font-semibold animate-pulse">Running...</span>
                      ) : (
                        <span className="text-[#667085]/60">Pending</span>
                      )}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Action Bar */}
            <div className="pt-4 border-t border-[#DDE3EC] flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-[#667085]">
                <ShieldCheck className="w-4 h-4 text-[#16A36A]" />
                <span>Deterministic header verification + AI forensic synthesis</span>
              </div>

              <button
                type="button"
                onClick={handleContinue}
                disabled={!isCompleted}
                className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-heading font-bold transition cursor-pointer shadow-sm ${
                  isCompleted
                    ? 'bg-[#165DFF] hover:bg-[#123B70] text-white hover:shadow-md'
                    : 'bg-[#DDE3EC] text-[#667085] cursor-not-allowed'
                }`}
              >
                <span>Continue to Threat Analysis</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
