import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Check,
  ArrowLeft,
  ArrowRight,
  Save,
  AlertTriangle,
  Bell,
  Mail,
  ShieldAlert,
  Globe2,
  FileSearch,
  FileCheck2,
  FlaskConical,
  LogOut,
} from 'lucide-react';
import { useDemo } from '../context/DemoContext.tsx';

export interface InvestigationProgressHeaderProps {
  currentStep: 1 | 2 | 3 | 4 | 5 | 6;
  caseId?: string;
  caseSubject?: string;
  riskScore?: number;
  threatCategory?: string;
  backTo?: string;
  onBack?: () => void;
  continueTo?: string;
  onContinue?: () => void;
  backLabel?: string;
  continueLabel?: string;
  isContinueDisabled?: boolean;
  showSaveAndExit?: boolean;
  onSaveAndExit?: () => void;
  showGenerateAlert?: boolean;
  isAlertGenerated?: boolean;
  isDemo?: boolean;
  onExitDemo?: () => void;
}

const STEPS = [
  { step: 1, label: 'Email Submitted', shortLabel: 'Submitted', path: (id?: string) => '/analyze', icon: Mail },
  { step: 2, label: 'Threat Detected', shortLabel: 'Threat', path: (id?: string) => id ? `/analysis/${id}/threat` : '/analyze', icon: ShieldAlert },
  { step: 3, label: 'Route Traced', shortLabel: 'Route', path: (id?: string) => id ? `/analysis/${id}/geolocation` : '/analyze', icon: Globe2 },
  { step: 4, label: 'Evidence Reviewed', shortLabel: 'Evidence', path: (id?: string) => id ? `/analysis/${id}/forensics` : '/analyze', icon: FileSearch },
  { step: 5, label: 'Alert Generated', shortLabel: 'Alert', path: (id?: string) => id ? `/analysis/${id}/alert` : '/analyze', icon: Bell },
  { step: 6, label: 'Report Completed', shortLabel: 'Report', path: (id?: string) => id ? `/analysis/${id}/report` : '/analyze', icon: FileCheck2 },
];

export const InvestigationProgressHeader: React.FC<InvestigationProgressHeaderProps> = ({
  currentStep,
  caseId,
  caseSubject,
  riskScore,
  threatCategory,
  backTo,
  onBack,
  continueTo,
  onContinue,
  backLabel = 'Back',
  continueLabel = 'Continue',
  isContinueDisabled = false,
  showSaveAndExit = true,
  onSaveAndExit,
  showGenerateAlert = true,
  isAlertGenerated = false,
  isDemo = false,
  onExitDemo,
}) => {
  const navigate = useNavigate();
  const { isDemoInvestigation, exitDemoInvestigation } = useDemo();

  const isDemoMode = Boolean(isDemo || isDemoInvestigation);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (backTo) {
      navigate(backTo);
    } else {
      // Default fallback back behavior based on currentStep
      if (currentStep === 2) navigate('/analyze');
      else if (currentStep === 3) navigate(`/analysis/${caseId}/threat`);
      else if (currentStep === 4) navigate(`/analysis/${caseId}/geolocation`);
      else if (currentStep === 5) navigate(`/analysis/${caseId}/forensics`);
      else if (currentStep === 6) navigate(`/analysis/${caseId}/alert`);
    }
  };

  const handleContinue = () => {
    if (onContinue) {
      onContinue();
    } else if (continueTo) {
      navigate(continueTo);
    } else {
      if (currentStep === 1 && caseId) navigate(`/analysis/${caseId}/threat`);
      else if (currentStep === 2 && caseId) navigate(`/analysis/${caseId}/geolocation`);
      else if (currentStep === 3 && caseId) navigate(`/analysis/${caseId}/forensics`);
      else if (currentStep === 4 && caseId) navigate(`/analysis/${caseId}/alert`);
      else if (currentStep === 5 && caseId) navigate(`/analysis/${caseId}/report`);
    }
  };

  const handleSaveAndExit = () => {
    if (onSaveAndExit) {
      onSaveAndExit();
    } else {
      navigate('/cases');
    }
  };

  const handleGenerateAlert = () => {
    if (!caseId) return;
    if (riskScore !== undefined && riskScore < 30) {
      const confirmed = window.confirm(
        'This email is currently classified as low risk. Do you still want to create an alert?'
      );
      if (!confirmed) return;
    }
    navigate(`/analysis/${caseId}/alert`);
  };

  const isCritical = (riskScore ?? 0) >= 85;
  const isHigh = (riskScore ?? 0) >= 70;

  return (
    <div className="w-full bg-white border-b border-[#DDE3EC] shadow-sm sticky top-16 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        {/* Top Sub-Bar: Case Context & Navigation Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5 min-w-0 flex-wrap">
            <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-heading font-semibold bg-[#EAF2FF] text-[#165DFF] border border-[#165DFF]/20">
              Step {currentStep} of 6
            </span>
            {isDemoMode && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-heading font-bold uppercase tracking-wider bg-[#F4B400]/15 text-[#B45309] border border-[#F4B400]/40 shadow-xs animate-fadeIn">
                <FlaskConical className="w-3.5 h-3.5 text-[#B45309]" />
                <span>Demonstration Data</span>
              </span>
            )}
            {caseId && (
              <span className="text-xs font-mono font-medium text-[#123B70] bg-[#F7F9FC] px-2 py-0.5 rounded border border-[#DDE3EC]">
                {caseId}
              </span>
            )}
            {caseSubject && (
              <span className="text-xs text-[#667085] truncate max-w-xs sm:max-w-md hidden md:inline">
                {caseSubject}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Exit Demo Button */}
            {isDemoMode && (
              <button
                type="button"
                onClick={() => {
                  if (onExitDemo) {
                    onExitDemo();
                  } else {
                    exitDemoInvestigation();
                    navigate('/');
                  }
                }}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-heading font-bold text-[#D92D20] bg-[#D92D20]/10 hover:bg-[#D92D20]/20 border border-[#D92D20]/30 transition cursor-pointer shadow-xs"
                title="Exit Demonstration Investigation and return to Welcome"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Exit Demo</span>
              </button>
            )}

            {/* Save and Exit */}
            {showSaveAndExit && currentStep > 1 && (
              <button
                type="button"
                onClick={handleSaveAndExit}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#667085] bg-white hover:bg-[#F7F9FC] border border-[#DDE3EC] transition cursor-pointer"
                title="Save progress and return to case files"
              >
                <Save className="w-3.5 h-3.5 text-[#667085]" />
                <span className="hidden sm:inline">Save & Exit</span>
              </button>
            )}

            {/* Prominent Generate Threat Alert button */}
            {showGenerateAlert && caseId && currentStep !== 5 && (
              <button
                type="button"
                onClick={handleGenerateAlert}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-heading font-semibold transition cursor-pointer shadow-sm ${
                  isCritical
                    ? 'bg-[#D92D20] hover:bg-[#B42318] text-white animate-pulse'
                    : isHigh
                    ? 'bg-[#F97316] hover:bg-[#EA580C] text-white'
                    : 'bg-[#165DFF] hover:bg-[#123B70] text-white'
                }`}
                title={isCritical ? 'Immediate Threat Alert Recommended' : 'Generate Threat Alert'}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>
                  {isCritical
                    ? 'Immediate Alert Recommended'
                    : isAlertGenerated
                    ? 'View Threat Alert'
                    : 'Generate Threat Alert'}
                </span>
              </button>
            )}

            {/* Back Button */}
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handleBack}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#172033] bg-white hover:bg-[#F7F9FC] border border-[#DDE3EC] transition cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-[#667085]" />
                <span>{backLabel}</span>
              </button>
            )}

            {/* Continue Button */}
            {currentStep < 6 && (
              <button
                type="button"
                onClick={handleContinue}
                disabled={isContinueDisabled}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-heading font-semibold transition cursor-pointer shadow-sm ${
                  isContinueDisabled
                    ? 'bg-[#DDE3EC] text-[#667085] cursor-not-allowed'
                    : 'bg-[#165DFF] hover:bg-[#123B70] text-white'
                }`}
              >
                <span>{continueLabel}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* The Exact Progress Header:
            Email Submitted → Threat Detected → Route Traced → Evidence Reviewed → Alert Generated → Report Completed */}
        <div className="pt-2 border-t border-[#DDE3EC]/70">
          <nav aria-label="Investigation Progress" className="overflow-x-auto no-scrollbar">
            <ol className="flex items-center min-w-max sm:w-full justify-between gap-1 sm:gap-2">
              {STEPS.map((item, index) => {
                const isCompleted = item.step < currentStep;
                const isCurrent = item.step === currentStep;
                const canNavigate = caseId ? item.step <= currentStep : item.step === 1;

                return (
                  <li key={item.step} className="flex items-center flex-1 last:flex-none">
                    <button
                      type="button"
                      disabled={!canNavigate}
                      onClick={() => {
                        if (canNavigate && caseId) {
                          navigate(item.path(caseId));
                        }
                      }}
                      className={`group flex items-center gap-2 py-1 px-2 rounded-lg text-left transition ${
                        canNavigate ? 'cursor-pointer hover:bg-[#F7F9FC]' : 'cursor-default opacity-60'
                      }`}
                    >
                      {/* Step Badge / Checkmark Indicator */}
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-heading font-bold shrink-0 transition ${
                          isCompleted
                            ? 'bg-[#16A36A] text-white shadow-xs'
                            : isCurrent
                            ? 'bg-[#165DFF] text-white shadow-sm ring-4 ring-[#EAF2FF]'
                            : 'bg-[#DDE3EC] text-[#667085]'
                        }`}
                      >
                        {isCompleted ? <Check className="w-3.5 h-3.5 stroke-[2.5]" /> : item.step}
                      </span>

                      {/* Step Title */}
                      <span
                        className={`text-xs whitespace-nowrap transition ${
                          isCurrent
                            ? 'font-heading font-bold text-[#165DFF]'
                            : isCompleted
                            ? 'font-medium text-[#172033]'
                            : 'text-[#667085]'
                        }`}
                      >
                        <span className="hidden lg:inline">{item.label}</span>
                        <span className="lg:hidden">{item.shortLabel}</span>
                      </span>
                    </button>

                    {/* Step Connector Arrow */}
                    {index < STEPS.length - 1 && (
                      <div className="flex-1 mx-1 sm:mx-2 hidden sm:flex items-center">
                        <div
                          className={`h-0.5 w-full rounded transition ${
                            isCompleted ? 'bg-[#16A36A]' : 'bg-[#DDE3EC]'
                          }`}
                        />
                        <span
                          className={`text-xs ml-0.5 ${
                            isCompleted ? 'text-[#16A36A]' : 'text-[#DDE3EC]'
                          }`}
                        >
                          →
                        </span>
                      </div>
                    )}
                  </li>
                );
              })}
            </ol>
          </nav>
        </div>
      </div>
    </div>
  );
};
