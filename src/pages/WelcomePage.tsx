import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  Globe2,
  FileCheck2,
  ArrowRight,
  Inbox,
  Sparkles,
  Lock,
  Cpu,
  Fingerprint,
  Info,
  FlaskConical,
} from 'lucide-react';
import { SentinelLogo } from '../components/SentinelLogo.tsx';
import { useDemo } from '../context/DemoContext.tsx';

export const WelcomePage: React.FC = () => {
  const navigate = useNavigate();
  const { setDemoModalOpen } = useDemo();

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#F7F9FC] text-[#172033] flex flex-col justify-between">
      {/* Top Welcome Header with SIH Prototype Tag */}
      <div className="w-full border-b border-[#DDE3EC] bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between text-xs text-[#667085]">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-heading font-semibold bg-[#EAF2FF] text-[#165DFF] border border-[#165DFF]/20">
              Smart India Hackathon 2026 Prototype
            </span>
            <span className="hidden sm:inline text-[#DDE3EC]">|</span>
            <span className="hidden sm:inline">Official Problem Statement Implementation</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-[11px] text-[#123B70] bg-[#F7F9FC] px-2 py-0.5 rounded border border-[#DDE3EC]">
              Forensics Engine v2.4
            </span>
          </div>
        </div>
      </div>

      {/* Hero Welcome Presentation Section */}
      <section className="flex-1 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
        {/* Animated Brand Emblem */}
        <div className="mb-6">
          <SentinelLogo size="lg" lightText={false} showTagline={false} />
        </div>

        {/* Title & Official Problem Statement */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-extrabold text-[#123B70] tracking-tight max-w-3xl leading-tight">
          AI-Powered Email Threat Detection, GeoLocation and Forensic Intelligence Platform
        </h1>

        {/* Tagline */}
        <p className="mt-4 text-lg sm:text-xl font-heading font-medium text-[#165DFF] tracking-wide">
          Detect the threat. Trace the route. Preserve the evidence.
        </p>

        <p className="mt-3 text-sm sm:text-base text-[#667085] max-w-2xl leading-relaxed">
          SentinelMail equips cyber defense and SOC teams with explainable email header forensics,
          hop-by-hop public relay geolocation, cryptographic chain-of-custody verification,
          and rapid threat alert simulations.
        </p>

        {/* Primary and Secondary Call to Action Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          <button
            type="button"
            id="btn-welcome-start-analysis"
            onClick={() => navigate('/analyze')}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-heading font-bold text-white bg-[#165DFF] hover:bg-[#123B70] shadow-md shadow-[#165DFF]/20 hover:shadow-lg transition cursor-pointer transform active:scale-98"
          >
            <Sparkles className="w-4 h-4" />
            <span>Start Email Analysis</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            id="btn-welcome-try-demo"
            onClick={() => setDemoModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-heading font-bold text-[#B45309] bg-[#F4B400]/10 hover:bg-[#F4B400]/20 border border-[#F4B400]/40 shadow-xs transition cursor-pointer transform active:scale-98"
          >
            <FlaskConical className="w-4 h-4 text-[#B45309]" />
            <span>Try Demo Investigation</span>
          </button>

          <button
            type="button"
            id="btn-welcome-open-inbox"
            onClick={() => navigate('/inbox')}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-heading font-semibold text-[#123B70] bg-white hover:bg-[#EAF2FF] border border-[#DDE3EC] hover:border-[#165DFF]/40 shadow-xs transition cursor-pointer"
          >
            <Inbox className="w-4 h-4 text-[#165DFF]" />
            <span>Open Triage Inbox</span>
          </button>
        </div>

        {/* Demo Investigation Quick Banner */}
        <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-[#DDE3EC] text-xs text-[#667085] shadow-xs">
          <span className="w-2 h-2 rounded-full bg-[#16A36A]" />
          <span>Need sample emails? Explore pre-configured phishing, BEC wire, and malware scenarios via</span>
          <button
            type="button"
            onClick={() => setDemoModalOpen(true)}
            className="text-[#165DFF] hover:text-[#123B70] font-heading font-bold underline cursor-pointer"
          >
            Demo Investigation
          </button>
        </div>

        {/* Three Solution Pillars */}
        <div className="mt-14 w-full grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          {/* Pillar 1: Detect */}
          <div className="p-6 rounded-2xl bg-white border border-[#DDE3EC] shadow-sm hover:shadow-md hover:border-[#165DFF]/40 transition">
            <div className="w-12 h-12 rounded-xl bg-[#EAF2FF] text-[#165DFF] flex items-center justify-center mb-4">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="text-base font-heading font-bold text-[#123B70]">Detect</h3>
            <p className="mt-2 text-xs sm:text-sm text-[#667085] leading-relaxed">
              Identify phishing, spoofing, BEC and suspicious email behaviour through multi-vector inspection
              of SPF, DKIM, DMARC, reply-to divert and linguistic cues.
            </p>
          </div>

          {/* Pillar 2: Trace */}
          <div className="p-6 rounded-2xl bg-white border border-[#DDE3EC] shadow-sm hover:shadow-md hover:border-[#165DFF]/40 transition">
            <div className="w-12 h-12 rounded-xl bg-[#EAF2FF] text-[#165DFF] flex items-center justify-center mb-4">
              <Globe2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-heading font-bold text-[#123B70]">Trace</h3>
            <p className="mt-2 text-xs sm:text-sm text-[#667085] leading-relaxed">
              Visualize approximate public email-routing locations and geographic anomalies across
              all intermediate Received: hops with latency timing and ISP attribution.
            </p>
          </div>

          {/* Pillar 3: Investigate */}
          <div className="p-6 rounded-2xl bg-white border border-[#DDE3EC] shadow-sm hover:shadow-md hover:border-[#165DFF]/40 transition">
            <div className="w-12 h-12 rounded-xl bg-[#EAF2FF] text-[#165DFF] flex items-center justify-center mb-4">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-heading font-bold text-[#123B70]">Investigate</h3>
            <p className="mt-2 text-xs sm:text-sm text-[#667085] leading-relaxed">
              Preserve evidence with SHA-256 integrity hashes, correlate forensic indicators,
              dispatch simulated threat alerts, and generate court-ready audit reports.
            </p>
          </div>
        </div>

        {/* Project Information Section */}
        <div className="mt-12 w-full p-5 rounded-xl bg-white border border-[#DDE3EC] text-left text-xs text-[#667085] shadow-xs">
          <div className="flex items-center gap-2 mb-2 font-heading font-semibold text-[#123B70]">
            <Info className="w-4 h-4 text-[#165DFF]" />
            <span>Smart India Hackathon 2026 Prototype — Project Information</span>
          </div>
          <p className="leading-relaxed">
            This platform operates as an explainable, analyst-in-the-loop email security workstation.
            All email evidence is validated through standard RFC-5322 parsing, defensive URL defanging,
            cryptographic fingerprinting, and verifiable public routing intelligence without black-box opacity.
          </p>
        </div>
      </section>

      {/* Clean SIH Footer */}
      <footer className="w-full border-t border-[#DDE3EC] bg-white py-4 text-center text-xs text-[#667085]">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <span className="font-heading font-semibold text-[#123B70]">SentinelMail</span> — Smart India Hackathon 2026 Prototype
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>RFC-5322 MIME Forensic Standard</span>
            <span>•</span>
            <span>SHA-256 Custody Verification</span>
            <span>•</span>
            <span>Approximate Routing Intelligence</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
