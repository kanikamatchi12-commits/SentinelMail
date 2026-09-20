import React from 'react';
import { CheckCircle2, XCircle, AlertTriangle, HelpCircle, Shield } from 'lucide-react';
import { EmailAnalysis } from '../types.ts';

interface AuthMatrixProps {
  analysis: EmailAnalysis;
  className?: string;
}

export const AuthenticationMatrix: React.FC<AuthMatrixProps> = ({ analysis, className = '' }) => {
  const spf = (analysis.spf_result || '').toLowerCase();
  const dkim = (analysis.dkim_result || '').toLowerCase();
  const dmarc = (analysis.dmarc_result || '').toLowerCase();

  const fromDomain = analysis.from_domain || (analysis.from_address?.split('@')[1] || '').toLowerCase();
  const replyToDomain = analysis.reply_to ? (analysis.reply_to.match(/@([a-zA-Z0-9.-]+)/)?.[1] || '').toLowerCase() : fromDomain;
  const returnPathDomain = analysis.return_path ? (analysis.return_path.match(/@([a-zA-Z0-9.-]+)/)?.[1] || '').toLowerCase() : fromDomain;
  const messageIdDomain = analysis.message_id ? (analysis.message_id.match(/@([a-zA-Z0-9.-]+)>/)?.[1] || analysis.message_id.match(/@([a-zA-Z0-9.-]+)/)?.[1] || '').toLowerCase() : '';

  type ResultType = 'Pass' | 'Warning' | 'Fail' | 'Unavailable';

  const getSpfResult = (): { result: ResultType; evidence: string; interpretation: string } => {
    if (!spf || spf === 'none' || spf === 'neutral' && !analysis.raw_headers?.toLowerCase().includes('spf=')) {
      return {
        result: 'Unavailable',
        evidence: 'No SPF authentication record or reported result logged in received headers',
        interpretation: 'Sender domain has not published an SPF record or receiving gateway did not log SPF verification.',
      };
    }
    if (spf === 'pass') {
      return {
        result: 'Pass',
        evidence: `Reported SPF=pass (sending relay authorized for ${fromDomain})`,
        interpretation: 'Sending MTA IP address is authorized in published SPF policy.',
      };
    }
    if (spf === 'fail') {
      return {
        result: 'Fail',
        evidence: `Reported SPF=fail (sending relay IP unauthorized for ${fromDomain})`,
        interpretation: 'Sending relay is explicitly unauthorized to emit mail on behalf of sender domain.',
      };
    }
    return {
      result: 'Warning',
      evidence: `Reported SPF=${spf}`,
      interpretation: 'Softfail or neutral status; sending IP is questionable or policy is in testing mode (~all).',
    };
  };

  const getDkimResult = (): { result: ResultType; evidence: string; interpretation: string } => {
    if (!dkim || dkim === 'none') {
      return {
        result: 'Unavailable',
        evidence: 'No DKIM signature found in headers',
        interpretation: 'Message does not carry a cryptographic DKIM signature header. Missing DKIM is not an automatic failure.',
      };
    }
    if (dkim === 'pass') {
      return {
        result: 'Pass',
        evidence: 'Reported DKIM=pass (cryptographic signature verified against DNS public key)',
        interpretation: 'Body and critical headers remained unmodified during transit.',
      };
    }
    if (dkim === 'fail') {
      return {
        result: 'Fail',
        evidence: 'Reported DKIM=fail (signature verification or body hash mismatch)',
        interpretation: 'Message body or headers were altered in transit, or signing key is invalid.',
      };
    }
    return {
      result: 'Warning',
      evidence: `Reported DKIM=${dkim}`,
      interpretation: 'DKIM signature could not be verified completely.',
    };
  };

  const getDmarcResult = (): { result: ResultType; evidence: string; interpretation: string } => {
    if (!dmarc || dmarc === 'none') {
      return {
        result: 'Unavailable',
        evidence: 'No DMARC policy evaluated or record not published',
        interpretation: 'Sender domain does not publish a DMARC policy record (_dmarc.domain). Not marked as an automatic failure.',
      };
    }
    if (dmarc === 'pass') {
      return {
        result: 'Pass',
        evidence: 'Reported DMARC=pass (From domain identifier aligned with SPF/DKIM)',
        interpretation: 'Sender identity verified and compliant with domain policy.',
      };
    }
    if (dmarc === 'fail') {
      return {
        result: 'Fail',
        evidence: 'Reported DMARC=fail (neither SPF nor DKIM passed in alignment with From header)',
        interpretation: 'Identity spoofing or relay without domain permission detected.',
      };
    }
    return {
      result: 'Warning',
      evidence: `Reported DMARC=${dmarc}`,
      interpretation: 'Domain evaluated with quarantine or neutral guidance.',
    };
  };

  const getReplyToAlignment = (): { result: ResultType; evidence: string; interpretation: string } => {
    if (!analysis.reply_to) {
      return {
        result: 'Pass',
        evidence: 'No distinct Reply-To header; defaults strictly to From address',
        interpretation: 'Replies route directly to the claimed institutional sender address.',
      };
    }
    if (analysis.reply_to_mismatch || replyToDomain !== fromDomain) {
      return {
        result: 'Fail',
        evidence: `Divergence: From "@${fromDomain}" vs Reply-To "@${replyToDomain}" (${analysis.reply_to})`,
        interpretation: 'Recipient responses will route to external third-party or attacker infrastructure.',
      };
    }
    return {
      result: 'Pass',
      evidence: `Aligned: Both From and Reply-To share domain "${fromDomain}"`,
      interpretation: 'Reply pathway matches sending institutional identity.',
    };
  };

  const getReturnPathAlignment = (): { result: ResultType; evidence: string; interpretation: string } => {
    if (!analysis.return_path) {
      return {
        result: 'Unavailable',
        evidence: 'No Return-Path header observable in submitted evidence',
        interpretation: 'Envelope sender cannot be evaluated.',
      };
    }
    if (returnPathDomain !== fromDomain) {
      return {
        result: 'Warning',
        evidence: `From "@${fromDomain}" vs Return-Path "@${returnPathDomain}"`,
        interpretation: 'Message routed via external forwarding relay or bulk-sending provider.',
      };
    }
    return {
      result: 'Pass',
      evidence: `Aligned: Both From and Return-Path share "${fromDomain}"`,
      interpretation: 'Envelope bounce path matches message From header.',
    };
  };

  const getMessageIdConsistency = (): { result: ResultType; evidence: string; interpretation: string } => {
    if (!analysis.message_id) {
      return {
        result: 'Unavailable',
        evidence: 'No Message-ID header present',
        interpretation: 'Standard tracking token absent in headers.',
      };
    }
    if (messageIdDomain && messageIdDomain !== fromDomain) {
      return {
        result: 'Warning',
        evidence: `Host: "${messageIdDomain}" vs Domain: "${fromDomain}"`,
        interpretation: 'Message created on separate infrastructure or mail service provider.',
      };
    }
    return {
      result: 'Pass',
      evidence: `Consistent: Message-ID hostname reflects sender domain "${fromDomain}"`,
      interpretation: 'RFC-5322 tracking identifier generated on institutional host.',
    };
  };

  const checks = [
    { name: 'Reported SPF Result', ...getSpfResult() },
    { name: 'Reported DKIM Result', ...getDkimResult() },
    { name: 'Reported DMARC Result', ...getDmarcResult() },
    { name: 'From / Reply-To Alignment', ...getReplyToAlignment() },
    { name: 'From / Return-Path Alignment', ...getReturnPathAlignment() },
    { name: 'Message-ID Consistency', ...getMessageIdConsistency() },
  ];

  const renderBadge = (result: ResultType) => {
    switch (result) {
      case 'Pass':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Pass
          </span>
        );
      case 'Warning':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-[#FBBF24]/15 text-[#FBBF24] border border-[#FBBF24]/30">
            <AlertTriangle className="w-3.5 h-3.5" />
            Warning
          </span>
        );
      case 'Fail':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30">
            <XCircle className="w-3.5 h-3.5" />
            Fail
          </span>
        );
      case 'Unavailable':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-[#29415D]/40 text-[#AFC2D8] border border-[#29415D]">
            <HelpCircle className="w-3.5 h-3.5" />
            Unavailable
          </span>
        );
    }
  };

  return (
    <div
      id="authentication-analysis-matrix"
      className={`rounded-2xl border border-[#29415D] bg-[#122338] p-5 shadow-lg shadow-black/40 space-y-4 text-[#F8FAFC] ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#29415D] pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#172C46] border border-[#3B82F6]/40 text-[#60A5FA] flex items-center justify-center">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-sm text-[#F8FAFC]">
              Authentication Status Matrix
            </h3>
            <span className="text-[11px] text-[#AFC2D8]">
              Reported SPF, DKIM, and DMARC results alongside header identity alignments
            </span>
          </div>
        </div>
        <span className="text-[10px] font-mono text-[#60A5FA] bg-[#172C46] px-2.5 py-1 rounded-lg border border-[#29415D]">
          RFC-8601 & RFC-7489 Alignment
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[#29415D] text-[#AFC2D8] text-[11px] font-heading font-semibold uppercase tracking-wider bg-[#0D1B2A]">
              <th className="py-2.5 px-3.5 w-1/4">Security Check</th>
              <th className="py-2.5 px-3.5 w-1/6">Reported Result</th>
              <th className="py-2.5 px-3.5 w-1/3">Observable Evidence</th>
              <th className="py-2.5 px-3.5 w-1/3">Forensic Interpretation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#29415D] text-[#F8FAFC]">
            {checks.map((row, idx) => (
              <tr key={idx} className="hover:bg-[#172C46]/50 transition-colors">
                <td className="py-3 px-3.5 font-heading font-semibold text-[#F8FAFC] whitespace-nowrap">
                  {row.name}
                </td>
                <td className="py-3 px-3.5 whitespace-nowrap">
                  {renderBadge(row.result)}
                </td>
                <td className="py-3 px-3.5 font-mono text-[11px] text-[#AFC2D8] break-all">
                  {row.evidence}
                </td>
                <td className="py-3 px-3.5 text-[11px] text-[#AFC2D8] leading-relaxed">
                  {row.interpretation}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="text-[11px] text-[#AFC2D8] bg-[#0D1B2A] p-3 rounded-xl border border-[#29415D] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <span>* Reported results reflect authentication headers logged by the receiving mail gateway. Missing authentication records are marked as Unavailable and not an automatic failure.</span>
        <span className="font-mono text-[10px] text-[#60A5FA] shrink-0">6 Verification Checks Evaluated</span>
      </div>
    </div>
  );
};
