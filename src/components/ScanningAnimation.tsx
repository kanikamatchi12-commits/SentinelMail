import React, { useEffect, useState } from 'react';
import {
  Mail,
  ShieldCheck,
  CheckCircle2,
  Activity,
  AlertCircle,
  RotateCcw,
  Globe2,
  Lock,
  Layers,
  Sparkles,
} from 'lucide-react';

export interface ScanningAnimationProps {
  onComplete?: () => void;
  error?: string | null;
  onRetry?: () => void;
}

export const SCAN_STAGES = [
  { id: 1, label: 'Validating email evidence', detail: 'Verifying MIME boundary structure, integrity, and safe RFC-5322 encoding...' },
  { id: 2, label: 'Parsing message headers', detail: 'Extracting From, Return-Path, Reply-To, Date, Subject, and Message-ID tokens...' },
  { id: 3, label: 'Examining sender relationships', detail: 'Evaluating domain namespaces, display-name spoofing, and Reply-To divergence...' },
  { id: 4, label: 'Checking reported SPF, DKIM and DMARC results', detail: 'Inspecting reported Authentication-Results headers and cryptographic signatures...' },
  { id: 5, label: 'Inspecting links and message content', detail: 'Scanning defanged URLs, psychological urgency cues, and attachment payloads...' },
  { id: 6, label: 'Extracting public routing IPs', detail: 'Isolating observable Received Mail Transfer Agent (MTA) transit hops...' },
  { id: 7, label: 'Geolocating observable relay hops', detail: 'Correlating IP hops with country, autonomous system, and geographic coordinates...' },
  { id: 8, label: 'Correlating forensic indicators', detail: 'Fusing deterministic forensic rules with AI-assisted behavioral models...' },
  { id: 9, label: 'Calculating the risk score', detail: 'Weighting domain, authentication, content, link, and routing contributions (0–100)...' },
  { id: 10, label: 'Generating the analysis report', detail: 'Compiling executive assessment, sender diagram, and recommended disposition...' },
];

export const ScanningAnimation: React.FC<ScanningAnimationProps> = ({
  onComplete,
  error,
  onRetry,
}) => {
  const [currentStageIdx, setCurrentStageIdx] = useState(0);

  useEffect(() => {
    if (error) return;

    // Advance smoothly across 10 stages over ~4 seconds (~400ms per stage)
    const interval = setInterval(() => {
      setCurrentStageIdx((prev) => {
        if (prev < SCAN_STAGES.length - 1) {
          return prev + 1;
        }
        clearInterval(interval);
        if (onComplete) {
          onComplete();
        }
        return prev;
      });
    }, 420);

    return () => clearInterval(interval);
  }, [onComplete, error]);

  const progressPercent = Math.min(
    100,
    Math.round(((currentStageIdx + 1) / SCAN_STAGES.length) * 100)
  );

  return (
    <div
      id="scanning-progress-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#123B70]/40 backdrop-blur-sm p-4"
    >
      <div className="relative w-full max-w-2xl rounded-2xl border border-[#DDE3EC] bg-white p-6 sm:p-8 shadow-xl overflow-hidden text-[#172033]">
        {/* Top Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-[#165DFF]" />

        {error ? (
          /* Error State: Preserves input, offers Retry, never navigates to empty screen */
          <div className="py-4 text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-[#D92D20]/10 border border-[#D92D20]/30 flex items-center justify-center text-[#D92D20]">
              <AlertCircle className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-heading font-bold text-[#123B70]">Analysis Processing Interrupted</h3>
              <p className="text-sm text-[#667085] mt-1.5 max-w-md mx-auto leading-relaxed">
                {error}
              </p>
            </div>
            <div className="pt-3 flex items-center justify-center gap-3">
              {onRetry && (
                <button
                  type="button"
                  onClick={onRetry}
                  className="px-5 py-2.5 rounded-xl bg-[#165DFF] hover:bg-[#123B70] text-white font-heading font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm transition cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Retry Analysis</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div>
            {/* Header with Title and Progress */}
            <div className="flex items-center justify-between border-b border-[#DDE3EC] pb-4 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#EAF2FF] flex items-center justify-center text-[#165DFF] shadow-xs">
                  <Activity className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-base sm:text-lg text-[#123B70]">
                    Forensic Engine Ingest & Scan
                  </h3>
                  <p className="text-xs text-[#667085]">
                    Executing multi-layered inspection across 10 security stages
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xl font-heading font-extrabold text-[#165DFF]">
                  {progressPercent}%
                </span>
                <div className="text-[10px] font-mono text-[#667085]">
                  Stage {currentStageIdx + 1} of {SCAN_STAGES.length}
                </div>
              </div>
            </div>

            {/* Visual Unfolding / Scanning Indicator */}
            <div className="mb-5 p-4 rounded-xl bg-[#F7F9FC] border border-[#DDE3EC] flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-[#EAF2FF] border border-[#165DFF]/30 flex items-center justify-center text-[#165DFF] shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-heading font-semibold text-[#123B70] flex items-center gap-2 truncate">
                    <span className="w-2 h-2 rounded-full bg-[#165DFF] animate-ping shrink-0" />
                    <span className="truncate">{SCAN_STAGES[currentStageIdx]?.label}</span>
                  </div>
                  <p className="text-[11px] text-[#667085] mt-0.5 truncate">
                    {SCAN_STAGES[currentStageIdx]?.detail}
                  </p>
                </div>
              </div>
              <div className="shrink-0 text-right hidden sm:block">
                <span className="px-2.5 py-1 rounded-md bg-white border border-[#DDE3EC] text-[10px] font-mono text-[#165DFF]">
                  RFC-5322 ACTIVE
                </span>
              </div>
            </div>

            {/* Overall Progress Bar */}
            <div className="w-full bg-[#EAF2FF] h-2 rounded-full overflow-hidden border border-[#DDE3EC] mb-6">
              <div
                className="h-full bg-[#165DFF] transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* 10 Progress Stages List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
              {SCAN_STAGES.map((stage, idx) => {
                const isCompleted = idx < currentStageIdx;
                const isActive = idx === currentStageIdx;

                return (
                  <div
                    key={stage.id}
                    className={`px-3 py-2 rounded-lg border text-xs flex items-center gap-2.5 transition-all ${
                      isCompleted
                        ? 'bg-[#16A36A]/5 border-[#16A36A]/30 text-[#16A36A]'
                        : isActive
                        ? 'bg-[#EAF2FF] border-[#165DFF] text-[#165DFF] font-semibold'
                        : 'bg-[#F7F9FC] border-[#DDE3EC] text-[#667085]'
                    }`}
                  >
                    <div className="shrink-0">
                      {isCompleted ? (
                        <CheckCircle2 className="w-4 h-4 text-[#16A36A]" />
                      ) : isActive ? (
                        <div className="w-4 h-4 rounded-full border-2 border-[#165DFF] border-t-transparent animate-spin" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-[#DDE3EC] flex items-center justify-center text-[9px] font-mono text-[#667085]">
                          {stage.id}
                        </div>
                      )}
                    </div>
                    <span className="truncate">{stage.label}</span>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="mt-5 pt-3 border-t border-[#DDE3EC] flex items-center justify-between text-[11px] text-[#667085]">
              <span className="font-mono text-[10px]">SentinelMail Forensics Core v2.4</span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#16A36A]" />
                <span>Deterministic Rules + Multi-Vector Verification</span>
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
