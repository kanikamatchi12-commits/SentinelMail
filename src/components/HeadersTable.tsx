import React, { useState } from 'react';
import { Terminal, Copy, Check, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';

interface HeadersTableProps {
  fromAddress: string;
  fromName?: string;
  toAddress: string;
  replyTo?: string;
  returnPath?: string;
  subject: string;
  date: string;
  messageId: string;
  rawHeaders: string;
  replyToMismatch?: boolean;
  displayNameSpoof?: boolean;
}

export const HeadersTable: React.FC<HeadersTableProps> = ({
  fromAddress,
  fromName,
  toAddress,
  replyTo,
  returnPath,
  subject,
  date,
  messageId,
  rawHeaders,
  replyToMismatch,
  displayNameSpoof,
}) => {
  const [showRaw, setShowRaw] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(rawHeaders);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="headers-inspection-card" className="rounded-xl border border-white/10 bg-[#141B2D] p-5">
      <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4 text-[#00E5FF]" />
          <h3 className="font-display font-semibold text-sm text-[#E6EAF2]">
            RFC-822 Envelope & Header Metadata
          </h3>
        </div>
        <button
          onClick={() => setShowRaw(!showRaw)}
          className="flex items-center gap-1.5 rounded border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-[#8B93A7] hover:text-[#00E5FF] hover:border-[#00E5FF]/30 transition-all"
        >
          <span>{showRaw ? 'Hide Raw Headers' : 'Inspect Raw Headers'}</span>
          {showRaw ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </button>
      </div>

      {/* Primary Key-Value Grid */}
      <div className="space-y-3 font-mono text-xs">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-1 p-2 rounded bg-white/[0.02] border border-white/5">
          <span className="text-[#8B93A7] font-semibold">From:</span>
          <div className="md:col-span-3 flex flex-wrap items-center gap-2 text-[#E6EAF2] break-all">
            {fromName && <span className="font-sans font-medium text-white">{fromName}</span>}
            <span className="text-[#00E5FF]">&lt;{fromAddress}&gt;</span>
            {displayNameSpoof && (
              <span className="flex items-center gap-1 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 px-1.5 py-0.2 text-[10px]">
                <AlertTriangle className="h-3 w-3" />
                Brand Impersonation
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-1 p-2 rounded bg-white/[0.02] border border-white/5">
          <span className="text-[#8B93A7] font-semibold">To:</span>
          <span className="md:col-span-3 text-[#E6EAF2] break-all">{toAddress}</span>
        </div>

        {replyTo && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-1 p-2 rounded bg-white/[0.02] border border-white/5">
            <span className="text-[#8B93A7] font-semibold">Reply-To:</span>
            <div className="md:col-span-3 flex flex-wrap items-center gap-2 text-[#E6EAF2] break-all">
              <span className={replyToMismatch ? 'text-rose-400 font-bold' : ''}>
                {replyTo}
              </span>
              {replyToMismatch && (
                <span className="flex items-center gap-1 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 px-1.5 py-0.2 text-[10px]">
                  <AlertTriangle className="h-3 w-3" />
                  Mismatched External Destination
                </span>
              )}
            </div>
          </div>
        )}

        {returnPath && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-1 p-2 rounded bg-white/[0.02] border border-white/5">
            <span className="text-[#8B93A7] font-semibold">Return-Path:</span>
            <span className="md:col-span-3 text-[#8B93A7] break-all">{returnPath}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-1 p-2 rounded bg-white/[0.02] border border-white/5">
          <span className="text-[#8B93A7] font-semibold">Subject:</span>
          <span className="md:col-span-3 font-sans font-semibold text-[#E6EAF2]">{subject}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-1 p-2 rounded bg-white/[0.02] border border-white/5">
          <span className="text-[#8B93A7] font-semibold">Date:</span>
          <span className="md:col-span-3 text-[#8B93A7]">{date}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-1 p-2 rounded bg-white/[0.02] border border-white/5">
          <span className="text-[#8B93A7] font-semibold">Message-ID:</span>
          <span className="md:col-span-3 text-[#8B93A7] break-all">{messageId}</span>
        </div>
      </div>

      {/* Raw Headers Collapse */}
      {showRaw && (
        <div className="mt-4 border-t border-white/10 pt-3">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-[11px] text-[#8B93A7]">
              RAW HEADERS PAYLOAD ({rawHeaders.length} bytes)
            </span>
            <button
              onClick={copyToClipboard}
              className="flex items-center gap-1 rounded bg-white/5 border border-white/10 px-2 py-1 text-xs text-[#E6EAF2] hover:bg-[#00E5FF]/20 hover:text-[#00E5FF] transition-all"
            >
              {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <pre className="max-h-60 overflow-auto rounded bg-[#0B0F1A] p-3 font-mono text-[11px] text-[#8B93A7] border border-white/10 leading-relaxed">
            {rawHeaders}
          </pre>
        </div>
      )}
    </div>
  );
};
