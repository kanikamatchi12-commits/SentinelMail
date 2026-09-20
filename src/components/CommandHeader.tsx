import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Plus, Sparkles, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

interface CommandHeaderProps {
  title?: string;
  subtitle?: string;
  badge?: string;
}

export const CommandHeader: React.FC<CommandHeaderProps> = ({
  title = 'SOC Command Center',
  subtitle = 'Automated RFC-822 Forensic Parsing & AI Threat Intelligence',
  badge,
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <header
      id="command-header"
      className="h-16 px-6 bg-[#0B0F1A]/90 backdrop-blur border-b border-slate-800/80 flex items-center justify-between z-10 sticky top-0"
    >
      <div className="flex items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-semibold text-white tracking-tight font-mono">{title}</h1>
            {badge && (
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-[#00E5FF]/15 text-[#00E5FF] border border-[#00E5FF]/30">
                {badge}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 hidden sm:block">{subtitle}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Live Forensic Engine Indicators */}
        <div className="hidden lg:flex items-center gap-3 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px] font-mono">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>GEMINI 3.8 FLASH</span>
          </div>
          <span className="text-slate-600">|</span>
          <div className="flex items-center gap-1.5 text-cyan-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>GEO-HOP GIS</span>
          </div>
        </div>

        {/* Demo Mode Badge */}
        {user?.isJudgeMode && (
          <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono">
            <AlertCircle className="w-3 h-3" />
            <span>JUDGE DEMO MODE</span>
          </div>
        )}

        {/* New Investigation CTA */}
        <button
          id="btn-header-new-investigation"
          onClick={() => navigate('/investigate/new')}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#00E5FF] hover:bg-[#00c4dc] text-slate-950 font-semibold text-xs transition cursor-pointer shadow-[0_0_12px_rgba(0,229,255,0.25)]"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>New Investigation</span>
        </button>
      </div>
    </header>
  );
};
