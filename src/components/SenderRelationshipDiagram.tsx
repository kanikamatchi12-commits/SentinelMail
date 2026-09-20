import React from 'react';
import { AlertTriangle, CheckCircle2, Mail, Globe2 } from 'lucide-react';

interface SenderRelationshipProps {
  claimedDisplayName?: string | null;
  fromAddress: string;
  replyTo?: string | null;
  returnPath?: string | null;
  messageId?: string | null;
  firstPublicRelay?: { ip: string; country?: string; isp?: string } | null;
  className?: string;
}

function extractDomain(addr?: string | null): string {
  if (!addr) return 'none';
  const match = addr.match(/@([a-zA-Z0-9.-]+)/);
  if (match && match[1]) {
    return match[1].toLowerCase().replace(/[>\];]/g, '');
  }
  const idMatch = addr.match(/<.+@([a-zA-Z0-9.-]+)>/);
  if (idMatch && idMatch[1]) return idMatch[1].toLowerCase();
  return addr.trim().toLowerCase();
}

export const SenderRelationshipDiagram: React.FC<SenderRelationshipProps> = ({
  claimedDisplayName,
  fromAddress,
  replyTo,
  returnPath,
  messageId,
  firstPublicRelay,
  className = '',
}) => {
  const fromDomain = extractDomain(fromAddress);
  const replyToDomain = replyTo ? extractDomain(replyTo) : fromDomain;
  const returnPathDomain = returnPath ? extractDomain(returnPath) : fromDomain;
  const messageIdDomain = messageId ? extractDomain(messageId) : fromDomain;

  // Consistency checks
  const isReplyToMismatch = Boolean(replyTo && replyToDomain !== fromDomain && replyToDomain !== 'none');
  const isReturnPathMismatch = Boolean(returnPath && returnPathDomain !== fromDomain && returnPathDomain !== 'none');
  const isMessageIdMismatch = Boolean(messageIdDomain && messageIdDomain !== fromDomain && messageIdDomain !== 'none');

  // Mismatch list for explanations
  const mismatches: { title: string; desc: string; severity: 'critical' | 'warning' }[] = [];

  if (isReplyToMismatch) {
    mismatches.push({
      title: 'Reply-To Address Divergence',
      desc: `From address specifies domain "${fromDomain}", but replies are directed to "${replyToDomain}" (${replyTo}). Any user response routes to external recipient infrastructure.`,
      severity: 'critical',
    });
  }

  if (isReturnPathMismatch) {
    mismatches.push({
      title: 'Return-Path (Envelope Sender) Divergence',
      desc: `Envelope Return-Path domain "${returnPathDomain}" differs from From header "${fromDomain}". Indicates message transmission through an unverified relay or third-party drop account.`,
      severity: 'warning',
    });
  }

  if (isMessageIdMismatch) {
    mismatches.push({
      title: 'Message-ID Domain Divergence',
      desc: `Message-ID generation host "${messageIdDomain}" does not match claimed sender domain "${fromDomain}". Common in automated bulk-mailers and malicious relay servers.`,
      severity: 'warning',
    });
  }

  return (
    <div
      id="sender-relationship-diagram"
      className={`rounded-2xl border border-[#29415D] bg-[#122338] p-5 shadow-lg shadow-black/40 space-y-4 text-[#F8FAFC] ${className}`}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#29415D] pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#172C46] border border-[#3B82F6]/40 text-[#60A5FA] flex items-center justify-center">
            <Mail className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-sm text-[#F8FAFC]">
              Sender Identity Cross-Header Relationship
            </h3>
            <span className="text-[11px] text-[#AFC2D8]">
              From → Reply-To → Return-Path → Message-ID Domain
            </span>
          </div>
        </div>

        <div>
          {mismatches.length > 0 ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/40 text-xs font-heading font-semibold">
              <AlertTriangle className="w-3.5 h-3.5 text-[#EF4444]" />
              <span>{mismatches.length} Identity Divergence{mismatches.length > 1 ? 's' : ''} Detected</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/40 text-xs font-heading font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#22C55E]" />
              <span>All Sender Identifiers Consistent</span>
            </span>
          )}
        </div>
      </div>

      {/* 4 Primary Cards: From, Reply-To, Return-Path, Message-ID Domain */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-stretch">
        {/* Step 1: From */}
        <div className="p-3.5 rounded-xl border border-[#3B82F6]/40 bg-[#0D1B2A] flex flex-col justify-between space-y-2 text-xs shadow-sm">
          <div>
            <div className="flex items-center justify-between text-[10px] text-[#60A5FA] uppercase font-mono font-bold mb-1">
              <span>1. From Address</span>
              <span className="bg-[#3B82F6]/20 px-1.5 py-0.2 rounded text-[9px]">CLAIMED</span>
            </div>
            <div className="font-heading font-bold text-[#F8FAFC] truncate" title={fromAddress}>
              {fromAddress}
            </div>
          </div>
          <div className="text-[10px] text-[#AFC2D8] pt-1.5 border-t border-[#29415D] flex items-center justify-between font-mono">
            <span>Domain:</span>
            <span className="font-bold text-[#60A5FA]">{fromDomain}</span>
          </div>
        </div>

        {/* Step 2: Reply-To */}
        <div
          className={`p-3.5 rounded-xl border flex flex-col justify-between space-y-2 text-xs transition-all ${
            isReplyToMismatch
              ? 'border-[#EF4444] bg-[#EF4444]/10 shadow-sm shadow-[#EF4444]/10'
              : 'border-[#22C55E]/40 bg-[#0D1B2A]'
          }`}
        >
          <div>
            <div className="flex items-center justify-between text-[10px] uppercase font-mono font-bold mb-1">
              <span className={isReplyToMismatch ? 'text-[#EF4444]' : 'text-[#22C55E]'}>
                2. Reply-To
              </span>
              <span
                className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                  isReplyToMismatch ? 'bg-[#EF4444]/25 text-[#EF4444]' : 'bg-[#22C55E]/20 text-[#22C55E]'
                }`}
              >
                {isReplyToMismatch ? 'MISMATCH (RED)' : 'ALIGNED (GREEN)'}
              </span>
            </div>
            <div className={`font-heading font-bold truncate ${isReplyToMismatch ? 'text-[#EF4444]' : 'text-[#F8FAFC]'}`}>
              {replyTo || '(Matches From)'}
            </div>
          </div>
          <div className="text-[10px] text-[#AFC2D8] pt-1.5 border-t border-[#29415D] flex items-center justify-between font-mono">
            <span>Destination:</span>
            <span className={`font-bold ${isReplyToMismatch ? 'text-[#EF4444]' : 'text-[#22C55E]'}`}>
              {replyToDomain}
            </span>
          </div>
        </div>

        {/* Step 3: Return-Path */}
        <div
          className={`p-3.5 rounded-xl border flex flex-col justify-between space-y-2 text-xs transition-all ${
            isReturnPathMismatch
              ? 'border-[#F97316] bg-[#F97316]/10 shadow-sm shadow-[#F97316]/10'
              : 'border-[#22C55E]/40 bg-[#0D1B2A]'
          }`}
        >
          <div>
            <div className="flex items-center justify-between text-[10px] uppercase font-mono font-bold mb-1">
              <span className={isReturnPathMismatch ? 'text-[#F97316]' : 'text-[#22C55E]'}>
                3. Return-Path
              </span>
              <span
                className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                  isReturnPathMismatch ? 'bg-[#F97316]/25 text-[#F97316]' : 'bg-[#22C55E]/20 text-[#22C55E]'
                }`}
              >
                {isReturnPathMismatch ? 'DIVERGENCE (ORANGE)' : 'ALIGNED (GREEN)'}
              </span>
            </div>
            <div className={`font-heading font-bold truncate ${isReturnPathMismatch ? 'text-[#F97316]' : 'text-[#F8FAFC]'}`}>
              {returnPath || '(Not specified)'}
            </div>
          </div>
          <div className="text-[10px] text-[#AFC2D8] pt-1.5 border-t border-[#29415D] flex items-center justify-between font-mono">
            <span>Bounce Domain:</span>
            <span className={`font-bold ${isReturnPathMismatch ? 'text-[#F97316]' : 'text-[#22C55E]'}`}>
              {returnPathDomain}
            </span>
          </div>
        </div>

        {/* Step 4: Message-ID Domain */}
        <div
          className={`p-3.5 rounded-xl border flex flex-col justify-between space-y-2 text-xs transition-all ${
            isMessageIdMismatch
              ? 'border-[#F97316] bg-[#F97316]/10 shadow-sm shadow-[#F97316]/10'
              : 'border-[#22C55E]/40 bg-[#0D1B2A]'
          }`}
        >
          <div>
            <div className="flex items-center justify-between text-[10px] uppercase font-mono font-bold mb-1">
              <span className={isMessageIdMismatch ? 'text-[#F97316]' : 'text-[#22C55E]'}>
                4. Message-ID Host
              </span>
              <span
                className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                  isMessageIdMismatch ? 'bg-[#F97316]/25 text-[#F97316]' : 'bg-[#22C55E]/20 text-[#22C55E]'
                }`}
              >
                {isMessageIdMismatch ? 'EXTERNAL HOST' : 'ALIGNED (GREEN)'}
              </span>
            </div>
            <div className={`font-mono text-[11px] truncate ${isMessageIdMismatch ? 'text-[#F97316]' : 'text-[#F8FAFC]'}`} title={messageId || 'None'}>
              {messageIdDomain || 'Unavailable'}
            </div>
          </div>
          <div className="text-[10px] text-[#AFC2D8] pt-1.5 border-t border-[#29415D] flex items-center justify-between font-mono">
            <span>Generating Host:</span>
            <span className={`font-bold ${isMessageIdMismatch ? 'text-[#F97316]' : 'text-[#22C55E]'}`}>
              {messageIdDomain}
            </span>
          </div>
        </div>
      </div>

      {/* Explanations for Detected Divergences */}
      {mismatches.length > 0 ? (
        <div className="space-y-2 pt-2">
          <div className="text-xs font-heading font-bold text-[#F8FAFC] flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-[#F97316]" />
            <span>Forensic Explanations for Detected Divergences:</span>
          </div>
          {mismatches.map((m, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-xl border text-xs leading-relaxed ${
                m.severity === 'critical'
                  ? 'bg-[#EF4444]/10 border-[#EF4444]/30 text-[#F8FAFC]'
                  : 'bg-[#F97316]/10 border-[#F97316]/30 text-[#F8FAFC]'
              }`}
            >
              <span className="font-heading font-bold mr-1.5 text-[#F8FAFC]">• {m.title}:</span>
              <span className="text-[#AFC2D8]">{m.desc}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-3 rounded-xl bg-[#22C55E]/10 border border-[#22C55E]/30 text-xs text-[#22C55E] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>No cross-header address divergences detected. Sender identity headers are completely aligned.</span>
        </div>
      )}
    </div>
  );
};
