import React from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Terminal,
  Cpu,
  Layers,
  Award,
  Globe2,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Building2,
  Users,
  Database,
  Lock,
  ArrowRight,
  FileCheck,
  Search,
  Sparkles,
  Info,
} from 'lucide-react';

export const ProjectIntelligencePage: React.FC = () => {
  return (
    <div
      id="methodology-page"
      className="min-h-[calc(100vh-4rem)] bg-[#F7F9FC] text-[#172033] p-4 sm:p-6 lg:p-8 space-y-8"
    >
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header Title */}
        <div className="border-b border-[#DDE3EC] pb-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EAF2FF] text-[#165DFF] text-xs font-heading font-semibold mb-2 border border-[#165DFF]/20">
            <Sparkles className="w-3.5 h-3.5 text-[#165DFF]" />
            <span>Architecture & Forensic Methodology</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#123B70]">
            How SentinelMail Works
          </h1>
          <p className="text-sm text-[#667085] mt-1.5 leading-relaxed">
            A comprehensive overview of SentinelMail’s multi-protocol forensic extraction engine, explainable threat scoring model, and evaluation framework for Smart India Hackathon 2026.
          </p>
        </div>

        {/* Section 1: The Email Threat Problem */}
        <section className="bg-white rounded-2xl border border-[#DDE3EC] p-6 shadow-sm space-y-3">
          <h2 className="text-base font-heading font-bold text-[#123B70] flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[#F97316]" />
            <span>1. The Email Threat Problem</span>
          </h2>
          <p className="text-xs text-[#172033] leading-relaxed">
            Email protocols originally designed in the early ARPANET era (RFC-822) prioritized open transit over sender verification. While modern protocols like SPF (RFC-7208), DKIM (RFC-6376), and DMARC (RFC-7489) provide cryptographic safeguards, attackers consistently exploit display name spoofing, Reply-To header decoupling, cousin-domain homoglyphs, and intermediate relay misconfigurations.
          </p>
          <p className="text-xs text-[#667085] leading-relaxed">
            For front-line security analysts and enterprise employees, commercial spam filters often produce binary "pass/fail" results without explainable forensic context, making manual verification tedious and prone to false negatives in targeted Business Email Compromise (BEC) campaigns.
          </p>
        </section>

        {/* Section 2: Evidence Analyzed */}
        <section className="bg-white rounded-2xl border border-[#DDE3EC] p-6 shadow-sm space-y-3">
          <h2 className="text-base font-heading font-bold text-[#123B70] flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#165DFF]" />
            <span>2. Evidence Analyzed</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-[#F7F9FC] border border-[#DDE3EC] space-y-1">
              <span className="font-heading font-bold text-[#123B70] block">RFC-5322 Envelope Headers</span>
              <p className="text-[#667085] text-[11px]">
                From, Return-Path (envelope sender), Reply-To, Message-ID, Date, and Subject syntax verification.
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-[#F7F9FC] border border-[#DDE3EC] space-y-1">
              <span className="font-heading font-bold text-[#123B70] block">Cryptographic Authentication</span>
              <p className="text-[#667085] text-[11px]">
                Reported SPF validation strings, DKIM signature tags (d=, s=, b=), and DMARC policy alignments.
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-[#F7F9FC] border border-[#DDE3EC] space-y-1">
              <span className="font-heading font-bold text-[#123B70] block">Multi-Hop MTA Relay Logs</span>
              <p className="text-[#667085] text-[11px]">
                Chronological traversal through `Received:` headers to map intermediate mail transfer agents and transit latency.
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-[#F7F9FC] border border-[#DDE3EC] space-y-1">
              <span className="font-heading font-bold text-[#123B70] block">Payload URLs & MIME Body</span>
              <p className="text-[#667085] text-[11px]">
                Extracted hyperlinks, defanged domain indicators, and behavioral urgency cues.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3: Illustrated Email-Analysis Pipeline */}
        <section className="bg-white rounded-2xl border border-[#DDE3EC] p-6 shadow-sm space-y-4">
          <h2 className="text-base font-heading font-bold text-[#123B70] flex items-center gap-2">
            <Cpu className="w-4 h-4 text-[#6C5CE7]" />
            <span>3. Illustrated Email-Analysis Pipeline</span>
          </h2>

          <div className="p-4 rounded-xl bg-[#F7F9FC] border border-[#DDE3EC] space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-heading font-semibold">
              <div className="px-2.5 py-1 rounded bg-[#EAF2FF] text-[#165DFF]">1. Email Evidence</div>
              <ArrowRight className="w-3.5 h-3.5 text-[#667085]" />
              <div className="px-2.5 py-1 rounded bg-[#EAF2FF] text-[#165DFF]">2. Structure Parsing</div>
              <ArrowRight className="w-3.5 h-3.5 text-[#667085]" />
              <div className="px-2.5 py-1 rounded bg-[#EAF2FF] text-[#165DFF]">3. Auth & Identity</div>
              <ArrowRight className="w-3.5 h-3.5 text-[#667085]" />
              <div className="px-2.5 py-1 rounded bg-[#EAF2FF] text-[#165DFF]">4. Content & Links</div>
              <ArrowRight className="w-3.5 h-3.5 text-[#667085]" />
              <div className="px-2.5 py-1 rounded bg-[#EAF2FF] text-[#165DFF]">5. Relay Hop Analysis</div>
              <ArrowRight className="w-3.5 h-3.5 text-[#667085]" />
              <div className="px-2.5 py-1 rounded bg-[#16A36A]/15 text-[#16A36A]">6. Correlation</div>
              <ArrowRight className="w-3.5 h-3.5 text-[#667085]" />
              <div className="px-2.5 py-1 rounded bg-[#6C5CE7]/15 text-[#6C5CE7]">7. Forensic Brief</div>
            </div>
            <p className="text-[11px] text-[#667085] leading-relaxed pt-2 border-t border-[#DDE3EC]">
              Each stage produces deterministic telemetry metrics that feed into the heuristic correlation layer, culminating in an actionable, human-readable forensic brief.
            </p>
          </div>
        </section>

        {/* Section 4: Explainable Risk Model */}
        <section className="bg-white rounded-2xl border border-[#DDE3EC] p-6 shadow-sm space-y-3">
          <h2 className="text-base font-heading font-bold text-[#123B70] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#16A36A]" />
            <span>4. Explainable Risk Model</span>
          </h2>
          <p className="text-xs text-[#172033] leading-relaxed">
            Rather than relying exclusively on opaque "black-box" machine learning predictions, SentinelMail computes a calibrated score (0–100) through transparent additive weights:
          </p>
          <div className="space-y-2 text-xs text-[#172033]">
            <div className="flex justify-between p-2.5 rounded-lg bg-[#F7F9FC] border border-[#DDE3EC]">
              <span>Authentication Failures (SPF/DMARC hardfail)</span>
              <span className="font-mono font-bold text-[#D92D20]">+30 to +40 pts</span>
            </div>
            <div className="flex justify-between p-2.5 rounded-lg bg-[#F7F9FC] border border-[#DDE3EC]">
              <span>Reply-To / Return-Path Domain Divergence</span>
              <span className="font-mono font-bold text-[#D92D20]">+25 to +35 pts</span>
            </div>
            <div className="flex justify-between p-2.5 rounded-lg bg-[#F7F9FC] border border-[#DDE3EC]">
              <span>Deceptive Hyperlink Targets & Homoglyphs</span>
              <span className="font-mono font-bold text-[#F97316]">+15 to +25 pts</span>
            </div>
            <div className="flex justify-between p-2.5 rounded-lg bg-[#F7F9FC] border border-[#DDE3EC]">
              <span>High-Urgency Financial Coercion Cues</span>
              <span className="font-mono font-bold text-[#F97316]">+10 to +20 pts</span>
            </div>
          </div>
        </section>

        {/* Section 5: Innovation & USP */}
        <section className="bg-white rounded-2xl border border-[#DDE3EC] p-6 shadow-sm space-y-3">
          <h2 className="text-base font-heading font-bold text-[#123B70] flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            <span>5. Innovation</span>
          </h2>
          <ul className="text-xs text-[#172033] space-y-2 list-disc list-inside leading-relaxed">
            <li>
              <strong>Sender Relationship Diagram:</strong> Visualizes the multi-step divergence between Display From, Reply-To, and Return-Path to expose BEC tactics instantly.
            </li>
            <li>
              <strong>Explainable "Why This Was Flagged" Cards:</strong> Directly attributes risk points to concrete observations rather than vague threat probabilities.
            </li>
            <li>
              <strong>Dual Interpretation Modes:</strong> Allows instant toggling between deep technical RFC evidence and Plain-Language "Simplified Explanations" for non-technical recipients.
            </li>
          </ul>
        </section>

        {/* Section 6: Technical Architecture */}
        <section className="bg-white rounded-2xl border border-[#DDE3EC] p-6 shadow-sm space-y-3">
          <h2 className="text-base font-heading font-bold text-[#123B70] flex items-center gap-2">
            <Terminal className="w-4 h-4 text-[#165DFF]" />
            <span>6. Technical Architecture</span>
          </h2>
          <p className="text-xs text-[#172033] leading-relaxed">
            Built using a high-throughput, containerized full-stack architecture:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs text-center font-heading font-semibold">
            <div className="p-3 rounded-xl bg-[#F7F9FC] border border-[#DDE3EC]">
              <span className="text-[#165DFF] block">React 18 + Vite</span>
              <span className="text-[10px] text-[#667085]">UI Framework</span>
            </div>
            <div className="p-3 rounded-xl bg-[#F7F9FC] border border-[#DDE3EC]">
              <span className="text-[#165DFF] block">Tailwind CSS</span>
              <span className="text-[10px] text-[#667085]">Design System</span>
            </div>
            <div className="p-3 rounded-xl bg-[#F7F9FC] border border-[#DDE3EC]">
              <span className="text-[#165DFF] block">Node / Express</span>
              <span className="text-[10px] text-[#667085]">Forensic Backend</span>
            </div>
            <div className="p-3 rounded-xl bg-[#F7F9FC] border border-[#DDE3EC]">
              <span className="text-[#165DFF] block">Gemini API</span>
              <span className="text-[10px] text-[#667085]">Reasoning Core</span>
            </div>
          </div>
        </section>

        {/* Section 7: Validation Plan */}
        <section className="bg-white rounded-2xl border border-[#DDE3EC] p-6 shadow-sm space-y-3">
          <h2 className="text-base font-heading font-bold text-[#123B70] flex items-center gap-2">
            <Database className="w-4 h-4 text-[#16A36A]" />
            <span>7. Validation Plan</span>
          </h2>
          <p className="text-xs text-[#172033] leading-relaxed">
            Evaluation is benchmarked against curated email corpora (SpamAssassin corpus, benign enterprise baseline set, and real-world phishing specimens), verifying detection recall across diverse MIME encodings and DKIM canonicalization variants.
          </p>
        </section>

        {/* Section 8: Limitations */}
        <section className="bg-white rounded-2xl border border-[#DDE3EC] p-6 shadow-sm space-y-3">
          <h2 className="text-base font-heading font-bold text-[#123B70] flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#D92D20]" />
            <span>8. Limitations</span>
          </h2>
          <ul className="text-xs text-[#667085] space-y-1.5 list-disc list-inside leading-relaxed">
            <li>Relies on reported authentication headers; receiving gateways that strip `Authentication-Results` limit verifiable claims.</li>
            <li>Geographic relay mapping identifies MTA transit infrastructure, not necessarily the physical residence of the threat actor.</li>
            <li>Encrypted attachments with unknown passwords cannot be inspected without analyst-provided decryption keys.</li>
          </ul>
        </section>

        {/* Section 9: Responsible Use & Ethics */}
        <section className="bg-white rounded-2xl border border-[#DDE3EC] p-6 shadow-sm space-y-3">
          <h2 className="text-base font-heading font-bold text-[#123B70] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#16A36A]" />
            <span>9. Responsible Use & Ethics</span>
          </h2>
          <p className="text-xs text-[#172033] leading-relaxed">
            SentinelMail operates under a human-in-the-loop triage philosophy. Threat classifications are recommendations designed to empower security professionals and end-users, ensuring that automated actions do not inadvertently block mission-critical communications without an audit trail.
          </p>
        </section>

        {/* Section 10: SIH Project Details */}
        <section className="bg-white rounded-2xl border border-[#DDE3EC] p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#DDE3EC] pb-3">
            <h2 className="text-base font-heading font-bold text-[#123B70] flex items-center gap-2">
              <Award className="w-4 h-4 text-[#165DFF]" />
              <span>10. Smart India Hackathon 2026 Details</span>
            </h2>
            <span className="text-[10px] font-mono text-[#165DFF] bg-[#EAF2FF] px-2.5 py-1 rounded-lg border border-[#165DFF]/20">
              Evaluation Dossier
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-[#F7F9FC] border border-[#DDE3EC]">
              <span className="text-[10px] font-heading font-semibold text-[#667085] uppercase block">
                Problem Statement Title
              </span>
              <span className="font-heading font-bold text-[#123B70] block mt-0.5">
                AI-Powered Email Threat Detection, GeoLocation and Forensic Intelligence Platform
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#F7F9FC] border border-[#DDE3EC]">
              <span className="text-[10px] font-heading font-semibold text-[#667085] uppercase block">
                Problem Statement ID
              </span>
              <span className="font-mono font-bold text-[#165DFF] block mt-0.5">
                SIH-2026-CYBER-049
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#F7F9FC] border border-[#DDE3EC]">
              <span className="text-[10px] font-heading font-semibold text-[#667085] uppercase block">
                Category
              </span>
              <span className="font-medium text-[#172033] block mt-0.5">
                Software • Cybersecurity & Digital Forensics
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#F7F9FC] border border-[#DDE3EC]">
              <span className="text-[10px] font-heading font-semibold text-[#667085] uppercase block">
                Department / Ministry
              </span>
              <span className="font-medium text-[#172033] block mt-0.5">
                Ministry of Electronics & Information Technology (MeitY) / CERT-In
              </span>
            </div>
          </div>
        </section>

        {/* Section 11: Team */}
        <section className="bg-white rounded-2xl border border-[#DDE3EC] p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#DDE3EC] pb-3">
            <h2 className="text-base font-heading font-bold text-[#123B70] flex items-center gap-2">
              <Users className="w-4 h-4 text-[#6C5CE7]" />
              <span>11. Team & Mentorship</span>
            </h2>
            <span className="text-[10px] font-mono text-[#667085]">SIH 2026 Team Roster</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-[#F7F9FC] border border-[#DDE3EC]">
              <span className="text-[10px] font-heading font-semibold text-[#667085] uppercase block">
                Team Name
              </span>
              <span className="font-heading font-bold text-[#123B70] block mt-0.5">
                Team Sentinel Forensics
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#F7F9FC] border border-[#DDE3EC]">
              <span className="text-[10px] font-heading font-semibold text-[#667085] uppercase block">
                Institute / University
              </span>
              <span className="font-medium text-[#172033] block mt-0.5">
                National Institute of Technology
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#F7F9FC] border border-[#DDE3EC] sm:col-span-2">
              <span className="text-[10px] font-heading font-semibold text-[#667085] uppercase block">
                Team Roles
              </span>
              <span className="font-medium text-[#172033] block mt-0.5">
                Lead Analyst & Full-Stack Developer • Forensic Engine Developer • Threat Intelligence Specialist • Frontend UX Engineer
              </span>
            </div>
          </div>
        </section>

        {/* Footer Disclaimer */}
        <div className="p-4 rounded-xl bg-[#F7F9FC] border border-[#DDE3EC] text-center text-xs text-[#667085] space-y-1">
          <p className="font-medium text-[#123B70]">
            Smart India Hackathon 2026 Prototype
          </p>
          <p className="text-[11px]">
            SentinelMail provides explainable email threat triage and multi-hop forensic intelligence.
          </p>
        </div>
      </div>
    </div>
  );
};
