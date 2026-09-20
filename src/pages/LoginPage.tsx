import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, AnalystUser } from '../context/AuthContext.tsx';
import { useDemo } from '../context/DemoContext.tsx';
import { SentinelLogo } from '../components/SentinelLogo.tsx';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Lock,
  Mail,
  Compass,
  CheckCircle2,
  Layers,
  Globe2,
} from 'lucide-react';

const ROLES: AnalystUser[] = [
  {
    id: 'evaluator-auditor',
    name: 'Evaluator / Auditor',
    role: 'SIH Evaluator & Security Auditor',
    clearance: 'Supervisory Clearance',
    badgeId: 'SIH-EVAL-2026',
    isJudgeMode: true,
  },
  {
    id: 'analyst-soc',
    name: 'Security Analyst R. Sharma',
    role: 'Security Analyst',
    clearance: 'Tier-2 Triage',
    badgeId: 'SOC-ANL-4091',
    isJudgeMode: false,
  },
  {
    id: 'lead-soc',
    name: 'SOC Lead A. Deshmukh',
    role: 'SOC Lead',
    clearance: 'Level 4 Forensics',
    badgeId: 'SOC-LEAD-1022',
    isJudgeMode: false,
  },
  {
    id: 'incident-responder',
    name: 'Incident Responder P. Verma',
    role: 'Incident Responder',
    clearance: 'Executive Incident Response',
    badgeId: 'IR-TEAM-7734',
    isJudgeMode: false,
  },
];

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const { setIsGuidedDemo } = useDemo();
  const navigate = useNavigate();

  const [selectedRoleId, setSelectedRoleId] = useState<string>(ROLES[0].id);
  const [userId, setUserId] = useState('evaluator@sentinelmail.local');
  const [password, setPassword] = useState('••••••••••••');

  const handleSignIn = (isDemo = false) => {
    const roleObj = ROLES.find((r) => r.id === selectedRoleId) || ROLES[0];
    login(roleObj);
    if (isDemo) {
      setIsGuidedDemo(true);
    }
    // Navigate directly to Analyze Email as default landing page
    navigate('/analyze');
  };

  return (
    <div
      id="sentinelmail-login-screen"
      className="min-h-screen bg-[#07111F] flex flex-col justify-center items-center p-4 sm:p-6 font-sans text-[#F8FAFC]"
    >
      <div className="w-full max-w-4xl bg-[#122338] rounded-2xl border border-[#29415D] shadow-2xl shadow-black/80 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[540px]">
        {/* Left Side: Forensic Email Envelope Visual */}
        <div className="lg:col-span-5 bg-[#0D1B2A] text-white p-8 flex flex-col justify-between relative overflow-hidden border-b lg:border-b-0 lg:border-r border-[#29415D]">
          {/* Subtle gradient light glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#3B82F6]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#8B5CF6]/10 rounded-full blur-3xl pointer-events-none" />

          {/* Top Brand */}
          <div className="relative z-10 space-y-2">
            <SentinelLogo size="lg" lightText={true} />
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#172C46] text-[#60A5FA] text-[10px] font-mono border border-[#29415D]">
              <span>Next-Gen Email Forensic Platform</span>
            </div>
          </div>

          {/* Stylized Forensic Email Illustration */}
          <div className="relative z-10 my-6 flex flex-col items-center justify-center">
            <div className="relative w-48 h-36 flex items-center justify-center">
              {/* Back Layer: Routing Nodes */}
              <div className="absolute top-2 w-40 h-20 rounded-xl bg-[#172C46]/80 border border-[#29415D] p-2 text-[9px] text-[#60A5FA] flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Globe2 className="w-3 h-3" />
                  <span>Transit Hops</span>
                </div>
                <span className="font-mono text-[#AFC2D8]">3 Public MTAs</span>
              </div>

              {/* Middle Layer: Auth Stamps */}
              <div className="absolute top-6 w-44 h-22 rounded-xl bg-[#122338]/90 backdrop-blur-sm border border-[#3B82F6]/30 p-2.5 flex flex-col justify-between shadow-lg">
                <div className="flex items-center justify-between text-[10px] text-[#AFC2D8]">
                  <span className="font-heading font-semibold">Cryptographic Proofs</span>
                  <span className="text-[#22C55E] font-mono">DMARC Aligned</span>
                </div>
                <div className="flex gap-1.5 text-[9px] font-mono">
                  <span className="px-1.5 py-0.5 rounded bg-[#3B82F6]/20 text-[#60A5FA] border border-[#3B82F6]/30">SPF</span>
                  <span className="px-1.5 py-0.5 rounded bg-[#8B5CF6]/20 text-[#8B5CF6] border border-[#8B5CF6]/30">DKIM</span>
                  <span className="px-1.5 py-0.5 rounded bg-[#22C55E]/20 text-[#22C55E] border border-[#22C55E]/30">DMARC</span>
                </div>
              </div>

              {/* Front Envelope Card */}
              <div className="relative z-10 w-44 h-24 rounded-xl bg-gradient-to-br from-[#172C46] to-[#0D1B2A] border border-[#3B82F6]/50 p-3 text-white shadow-xl shadow-black/60 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-4 h-4 text-[#60A5FA]" />
                    <span className="font-heading font-bold text-xs text-[#F8FAFC]">RFC-5322</span>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
                </div>
                <div className="text-[10px] text-[#AFC2D8] leading-tight truncate">
                  From: security@notice.com
                </div>
                <div className="flex items-center justify-between text-[9px] text-[#AFC2D8] font-mono pt-1 border-t border-[#29415D]">
                  <span>Forensic Intake</span>
                  <span className="text-[#60A5FA] font-bold">READY</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Tagline */}
          <div className="relative z-10 space-y-1">
            <p className="font-heading font-bold text-sm text-[#F8FAFC]">
              Uncover the truth behind every suspicious email.
            </p>
            <p className="text-xs text-[#AFC2D8] leading-relaxed">
              Investigative, explainable, and approachable email threat forensics for modern security analysts.
            </p>
          </div>
        </div>

        {/* Right Side: Clean Login Panel */}
        <div className="lg:col-span-7 p-8 sm:p-10 flex flex-col justify-between space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl font-heading font-bold text-[#F8FAFC]">Analyst Workspace Access</h2>
            <p className="text-xs text-[#AFC2D8]">
              Select your operational role or launch the evaluator guided demonstration.
            </p>
          </div>

          {/* Form Fields */}
          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-[11px] font-heading font-semibold text-[#AFC2D8] mb-1">
                Analyst ID / Email
              </label>
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#29415D] bg-[#0D1B2A] text-[#F8FAFC] font-mono text-xs focus:outline-none focus:ring-1 focus:ring-[#3B82F6]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-heading font-semibold text-[#AFC2D8] mb-1">
                Authorization Token / Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#29415D] bg-[#0D1B2A] text-[#F8FAFC] font-mono text-xs focus:outline-none focus:ring-1 focus:ring-[#3B82F6]"
              />
            </div>

            {/* Role Selector Dropdown */}
            <div>
              <label className="block text-[11px] font-heading font-semibold text-[#AFC2D8] mb-1">
                Operational Role
              </label>
              <select
                value={selectedRoleId}
                onChange={(e) => setSelectedRoleId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#29415D] bg-[#0D1B2A] text-[#F8FAFC] font-heading font-semibold text-xs focus:outline-none focus:ring-1 focus:ring-[#3B82F6] cursor-pointer"
              >
                {ROLES.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.role} ({r.clearance})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Action Buttons: Sign In & Enter Guided Demo */}
          <div className="space-y-2.5 pt-2">
            <button
              type="button"
              onClick={() => handleSignIn(false)}
              className="w-full py-2.5 px-4 rounded-xl bg-[#3B82F6] hover:bg-[#2563EB] text-white text-xs font-heading font-bold shadow-lg shadow-[#3B82F6]/25 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Sign In to Forensic Workstation</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => handleSignIn(true)}
              className="w-full py-2.5 px-4 rounded-xl border border-[#8B5CF6]/40 bg-[#8B5CF6]/15 hover:bg-[#8B5CF6]/25 text-[#8B5CF6] text-xs font-heading font-semibold transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Compass className="w-4 h-4" />
              <span>Enter Guided Demo (Recommended for Evaluation)</span>
            </button>
          </div>

          {/* Footer Note */}
          <div className="text-center text-[11px] text-[#AFC2D8]/60 pt-2 border-t border-[#29415D]">
            SentinelMail Email Threat Intelligence Platform
          </div>
        </div>
      </div>
    </div>
  );
};
