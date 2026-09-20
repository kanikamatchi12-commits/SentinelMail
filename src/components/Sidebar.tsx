import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';
import {
  ShieldAlert,
  LayoutDashboard,
  SearchCode,
  FileArchive,
  BarChart3,
  GitCompare,
  Award,
  LogOut,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  Radio,
} from 'lucide-react';

interface SidebarProps {
  onResetDemo?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onResetDemo }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleSignOut = () => {
    logout();
    navigate('/login');
  };

  const handleReset = async () => {
    if (!window.confirm('Reset all sample investigations to clean demonstration baseline?')) return;
    setIsResetting(true);
    try {
      const res = await fetch('/api/demo/reset', { method: 'POST' });
      if (res.ok) {
        if (onResetDemo) onResetDemo();
        // Trigger window reload or navigate to refresh data
        window.location.href = '/dashboard';
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsResetting(false);
    }
  };

  const navItems = [
    { to: '/dashboard', label: 'Command Center', icon: LayoutDashboard, id: 'nav-dashboard' },
    { to: '/investigate/new', label: 'New Investigation', icon: SearchCode, id: 'nav-investigate' },
    { to: '/investigations', label: 'Investigation Records', icon: FileArchive, id: 'nav-investigations' },
    { to: '/analytics', label: 'Threat Analytics', icon: BarChart3, id: 'nav-analytics' },
    { to: '/compare', label: 'Compare Evidence', icon: GitCompare, id: 'nav-compare' },
    { to: '/project', label: 'Project Intelligence', icon: Award, id: 'nav-project' },
  ];

  return (
    <aside
      id="soc-sidebar"
      className={`relative z-20 flex flex-col justify-between bg-[#0E1424] border-r border-slate-800/80 transition-all duration-300 ${
        collapsed ? 'w-18' : 'w-64'
      }`}
    >
      {/* Top Header Branding */}
      <div>
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800/80">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="p-2 rounded-lg bg-[#141B2D] border border-[#00E5FF]/40 text-[#00E5FF] shrink-0 shadow-[0_0_12px_rgba(0,229,255,0.25)]">
              <ShieldAlert className="w-5 h-5" />
            </div>
            {!collapsed && (
              <div className="leading-tight">
                <div className="text-sm font-bold tracking-tight text-white font-mono flex items-center gap-1.5">
                  SENTINEL<span className="text-[#00E5FF]">MAIL</span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono tracking-wider">
                  SIH 2024 SOC SUITE
                </div>
              </div>
            )}
          </div>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800/60 transition cursor-pointer"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Live operational node badge */}
        {!collapsed && (
          <div className="px-4 py-2.5 bg-[#0B0F1A]/80 border-b border-slate-800/50 flex items-center justify-between text-[11px] font-mono">
            <div className="flex items-center gap-2 text-emerald-400">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>NODE: ACTIVE</span>
            </div>
            <span className="text-slate-400 text-[10px]">v2.4-SIH</span>
          </div>
        )}

        {/* Navigation items */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                id={item.id}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                    isActive
                      ? 'bg-[#00E5FF]/15 text-[#00E5FF] border border-[#00E5FF]/30 font-semibold shadow-[0_0_10px_rgba(0,229,255,0.1)]'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
                  }`
                }
                title={collapsed ? item.label : undefined}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom Profile & Actions */}
      <div className="p-3 border-t border-slate-800/80 space-y-2 bg-[#0B0F1A]/50">
        {/* Reset Demo Data Quick Action */}
        <button
          id="btn-sidebar-reset-demo"
          onClick={handleReset}
          disabled={isResetting}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition border border-amber-500/20 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 cursor-pointer ${
            collapsed ? 'justify-center' : ''
          }`}
          title="Reset demonstration data to default 5 cases"
        >
          <RotateCcw className={`w-3.5 h-3.5 shrink-0 ${isResetting ? 'animate-spin' : ''}`} />
          {!collapsed && <span>Reset Demo Cases</span>}
        </button>

        {/* User Card */}
        {user && (
          <div
            className={`p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center gap-2.5 ${
              collapsed ? 'justify-center' : ''
            }`}
          >
            <div className="w-7 h-7 rounded-full bg-[#00E5FF]/20 border border-[#00E5FF]/40 text-[#00E5FF] flex items-center justify-center shrink-0">
              <UserCheck className="w-4 h-4" />
            </div>
            {!collapsed && (
              <div className="overflow-hidden flex-1">
                <div className="text-xs font-medium text-white truncate">{user.name}</div>
                <div className="text-[10px] text-slate-400 font-mono truncate">{user.role}</div>
              </div>
            )}
          </div>
        )}

        {/* Sign Out Button */}
        <button
          id="btn-sidebar-sign-out"
          onClick={handleSignOut}
          className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer ${
            collapsed ? 'justify-center' : ''
          }`}
          title="Sign out to Secure Entry screen"
        >
          <LogOut className="w-3.5 h-3.5 shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
};
