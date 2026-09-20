import React from 'react';

interface SentinelLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  lightText?: boolean;
}

export const SentinelLogo: React.FC<SentinelLogoProps> = ({
  size = 'md',
  showTagline = false,
  lightText = false,
}) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-2xl',
  };

  return (
    <div className="flex items-center gap-2.5 select-none" id="sentinelmail-brand-logo">
      {/* Original Icon: Envelope + Scanning Pulse / Fingerprint Line + Small Protective Shield */}
      <div
        className={`relative ${iconSizes[size]} flex items-center justify-center rounded-xl bg-gradient-to-br from-[#165DFF] to-[#6C5CE7] text-white shadow-sm shadow-[#165DFF]/20 shrink-0`}
      >
        <svg
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-5/6 h-5/6"
        >
          {/* Main Envelope Body */}
          <rect
            x="4"
            y="9"
            width="28"
            height="18"
            rx="3"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          {/* Envelope Flap lines */}
          <path
            d="M4 11L18 20L32 11"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Scanning pulse / fingerprint wave across the envelope */}
          <path
            d="M9 19C11 17 14 17 16 19C18 21 21 21 23 19"
            stroke="#EAF2FF"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
          {/* Small protective shield in bottom right corner */}
          <path
            d="M24 18V21.5C24 23.5 26.5 25.5 27 26C27.5 25.5 30 23.5 30 21.5V18L27 16.8L24 18Z"
            fill={lightText ? '#123B70' : '#FFFFFF'}
            stroke="#165DFF"
            strokeWidth="1.2"
          />
          <path
            d="M26 21.5L27 22.5L28.5 20"
            stroke="#16A36A"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span
            className={`font-heading font-extrabold tracking-tight leading-none ${
              textSizes[size]
            } ${lightText ? 'text-white' : 'text-[#123B70]'}`}
          >
            Sentinel<span className={lightText ? 'text-[#60A5FA]' : 'text-[#165DFF]'}>Mail</span>
          </span>
        </div>
        {showTagline && (
          <span
            className={`text-[11px] leading-tight mt-0.5 ${
              lightText ? 'text-[#AFC2D8]' : 'text-[#667085]'
            }`}
          >
            Detect the threat. Trace the route. Preserve the evidence.
          </span>
        )}
      </div>
    </div>
  );
};
