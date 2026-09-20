import React, { useEffect, useState } from 'react';
import { ThreatCategory } from '../types.ts';
import { ShieldCheck, ShieldAlert, AlertTriangle, Flame, ShieldX } from 'lucide-react';

interface RiskGaugeProps {
  score: number;
  category: ThreatCategory;
  size?: 'sm' | 'md' | 'lg';
}

export const RiskGauge: React.FC<RiskGaugeProps> = ({ score, category, size = 'lg' }) => {
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    let current = 0;
    const step = Math.max(1, Math.ceil(score / 30));
    const interval = setInterval(() => {
      current += step;
      if (current >= score) {
        setDisplayScore(score);
        clearInterval(interval);
      } else {
        setDisplayScore(current);
      }
    }, 20);
    return () => clearInterval(interval);
  }, [score]);

  // Color selection
  let strokeColor = '#2ECC71';
  let glowColor = 'rgba(46, 204, 113, 0.3)';
  let bgGradient = 'from-emerald-500/10 to-transparent';
  let badgeBg = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
  let verdictText = 'LOW THREAT / VERIFIED';
  let VerdictIcon = ShieldCheck;

  if (score >= 70) {
    strokeColor = '#FF3B5C';
    glowColor = 'rgba(255, 59, 92, 0.4)';
    bgGradient = 'from-rose-500/15 to-transparent';
    badgeBg = 'bg-rose-500/20 text-rose-300 border-rose-500/40';
    verdictText = 'CRITICAL THREAT / HIGH RISK';
    VerdictIcon = ShieldAlert;
  } else if (score >= 40) {
    strokeColor = '#FFB020';
    glowColor = 'rgba(255, 176, 32, 0.35)';
    bgGradient = 'from-amber-500/15 to-transparent';
    badgeBg = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    verdictText = 'SUSPICIOUS / ELEVATED RISK';
    VerdictIcon = AlertTriangle;
  }

  // Circular gauge math
  const radius = size === 'lg' ? 68 : size === 'md' ? 52 : 36;
  const strokeWidth = size === 'lg' ? 10 : size === 'md' ? 8 : 6;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (displayScore / 100) * circumference;

  const dimension = (radius + strokeWidth) * 2;

  return (
    <div
      id="risk-score-gauge-container"
      className={`relative flex flex-col items-center justify-center p-6 rounded-xl border border-white/10 bg-[#141B2D] bg-gradient-to-b ${bgGradient} backdrop-blur-sm`}
    >
      <div className="relative flex items-center justify-center" style={{ width: dimension, height: dimension }}>
        <svg
          className="transform -rotate-90"
          width={dimension}
          height={dimension}
        >
          {/* Background track */}
          <circle
            cx={dimension / 2}
            cy={dimension / 2}
            r={radius}
            stroke="#1E293B"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Animated score arc */}
          <circle
            cx={dimension / 2}
            cy={dimension / 2}
            r={radius}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            style={{
              transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
              filter: `drop-shadow(0 0 8px ${glowColor})`,
            }}
          />
        </svg>

        {/* Center score readout */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="font-mono text-4xl font-extrabold tracking-tight text-[#E6EAF2]" id="risk-score-number">
            {displayScore}
          </span>
          <span className="text-[11px] font-medium tracking-widest text-[#8B93A7] uppercase">
            / 100 RISK
          </span>
        </div>
      </div>

      {/* Verdict & Threat Category */}
      <div className="mt-4 flex flex-col items-center text-center gap-1.5">
        <div className="flex items-center gap-1.5">
          <VerdictIcon className="h-4 w-4" style={{ color: strokeColor }} />
          <span className="font-mono text-xs font-semibold tracking-wide" style={{ color: strokeColor }}>
            {verdictText}
          </span>
        </div>

        <div className="flex items-center gap-2 mt-1">
          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full border text-xs font-semibold uppercase tracking-wider ${badgeBg}`}>
            {category === 'Phishing' && <Flame className="h-3.5 w-3.5 text-rose-400" />}
            {category === 'BEC' && <ShieldX className="h-3.5 w-3.5 text-rose-400" />}
            {category === 'Safe' && <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />}
            <span>{category}</span>
          </span>
        </div>
      </div>
    </div>
  );
};
