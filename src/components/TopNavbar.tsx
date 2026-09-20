import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Inbox,
  Sparkles,
  Layers,
  BarChart2,
  FileCheck,
  Search,
  Bell,
  LogOut,
  RotateCcw,
  Menu,
  X,
  Compass,
  Check,
  GitCompare,
  Globe2,
  ShieldAlert,
  FlaskConical,
} from 'lucide-react';
import { SentinelLogo } from './SentinelLogo.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { useDemo } from '../context/DemoContext.tsx';

export const TopNavbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { isDemoInvestigation, exitDemoInvestigation, setDemoModalOpen } = useDemo();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleSignOut = () => {
    logout();
    navigate('/login');
  };

  const handleResetDemoData = async () => {
    if (!window.confirm('Reset all demonstration sample cases to clean baseline?')) return;
    setIsResetting(true);
    try {
      const res = await fetch('/api/demo/reset', { method: 'POST' });
      if (res.ok) {
        window.location.reload();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsResetting(false);
      setUserDropdownOpen(false);
    }
  };

  // Navigation Links
  const navItems = [
    { to: '/analyze', label: 'Analyze Email', icon: Sparkles, id: 'nav-analyze' },
    { to: '/inbox', label: 'Triage Inbox', icon: Inbox, id: 'nav-inbox' },
    { to: '/geotrace', label: 'GeoTrace', icon: Globe2, id: 'nav-geotrace' },
    { to: '/cases', label: 'Case Files', icon: Layers, id: 'nav-cases' },
    { to: '/insights', label: 'Threat Insights', icon: BarChart2, id: 'nav-insights' },
    { to: '/alerts', label: 'Alerts', icon: ShieldAlert, id: 'nav-alerts' },
    { to: '/compare', label: 'Compare', icon: GitCompare, id: 'nav-compare' },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/cases?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <header
      id="sentinelmail-top-nav"
      className="sticky top-0 z-40 w-full bg-white text-[#172033] border-b border-[#DDE3EC] shadow-xs"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-6">
          <NavLink to="/" className="cursor-pointer">
            <SentinelLogo size="md" lightText={false} />
          </NavLink>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center gap-1" id="primary-navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                location.pathname === item.to ||
                (item.to === '/analyze' && (location.pathname.startsWith('/analysis') || location.pathname.startsWith('/processing'))) ||
                (item.to === '/geotrace' && location.pathname.startsWith('/geotrace')) ||
                (item.to === '/cases' && (location.pathname.startsWith('/cases') || location.pathname.startsWith('/investigations'))) ||
                (item.to === '/insights' && (location.pathname === '/insights' || location.pathname === '/analytics')) ||
                (item.to === '/alerts' && location.pathname === '/alerts');

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  id={item.id}
                  className={`relative px-3 py-1.5 rounded-lg text-xs font-heading font-medium transition-all flex items-center gap-1.5 border ${
                    isActive
                      ? 'bg-[#EAF2FF] text-[#165DFF] border-[#165DFF]/30 font-semibold shadow-xs'
                      : 'border-transparent text-[#667085] hover:text-[#172033] hover:bg-[#F7F9FC]'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#165DFF]' : 'text-[#667085]'}`} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Medium Screen Navigation (Compressed) */}
        <nav className="hidden md:flex xl:hidden items-center gap-1">
          {navItems.slice(0, 4).map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.to);
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 border ${
                  isActive
                    ? 'bg-[#EAF2FF] text-[#165DFF] border-[#165DFF]/30'
                    : 'border-transparent text-[#667085] hover:bg-[#F7F9FC]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Right Utility Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Active Demo Investigation Badge with Exit Demo */}
          {isDemoInvestigation && (
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#F4B400]/15 text-[#B45309] border border-[#F4B400]/40 text-[11px] font-heading font-bold shadow-xs">
              <FlaskConical className="w-3.5 h-3.5 text-[#B45309]" />
              <span className="hidden sm:inline">Demonstration Data</span>
              <button
                type="button"
                onClick={() => {
                  exitDemoInvestigation();
                  navigate('/');
                }}
                className="ml-1 text-[10px] uppercase font-bold text-[#D92D20] bg-white px-2 py-0.5 rounded border border-[#D92D20]/30 hover:bg-[#D92D20]/10 transition cursor-pointer"
                title="Exit Demonstration Investigation and return to Welcome"
              >
                Exit Demo
              </button>
            </div>
          )}

          {/* Search Trigger */}
          <div className="relative">
            {searchOpen ? (
              <form onSubmit={handleSearchSubmit} className="flex items-center">
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search subject, sender, case ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="w-48 sm:w-64 px-3 py-1.5 text-xs rounded-lg bg-white border border-[#165DFF] text-[#172033] placeholder-[#667085]/60 focus:outline-none focus:ring-1 focus:ring-[#165DFF] shadow-xs"
                />
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="ml-1 p-1 text-[#667085] hover:text-[#172033]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="p-1.5 rounded-lg text-[#667085] hover:text-[#172033] hover:bg-[#F7F9FC] transition cursor-pointer border border-[#DDE3EC]"
                title="Search cases"
              >
                <Search className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Notifications Trigger */}
          <div className="relative" ref={notifRef}>
            <button
              type="button"
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="p-1.5 rounded-lg text-[#667085] hover:text-[#172033] hover:bg-[#F7F9FC] transition relative cursor-pointer border border-[#DDE3EC]"
              title="Notifications & Triage Feeds"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#165DFF]" />
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-[#DDE3EC] rounded-xl shadow-lg p-3.5 z-50 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-[#DDE3EC] font-heading font-semibold text-[#123B70]">
                  <span>Active Threat Feeds</span>
                  <span className="text-[10px] text-[#16A36A] font-mono bg-[#EAF2FF] px-1.5 py-0.5 rounded">Real-time</span>
                </div>
                <div className="py-2 space-y-2 text-[#667085]">
                  <div className="p-2.5 rounded-lg bg-[#F7F9FC] border border-[#DDE3EC]">
                    <div className="font-semibold text-[#D92D20] flex items-center gap-1">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>Executive Wire BEC Flagged</span>
                    </div>
                    <div className="text-[11px] text-[#172033] mt-0.5">SM-2026-8813 Wire transfer divergence detected.</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#F7F9FC] border border-[#DDE3EC]">
                    <div className="font-semibold text-[#F97316]">SPF & DKIM Mismatch</div>
                    <div className="text-[11px] text-[#172033] mt-0.5">PayPal spoofing sample reported SPF policy fail.</div>
                  </div>
                </div>
                <NavLink
                  to="/alerts"
                  onClick={() => setNotificationsOpen(false)}
                  className="block text-center pt-2 text-[11px] font-heading font-semibold text-[#165DFF] hover:underline border-t border-[#DDE3EC]"
                >
                  View All Generated Alerts →
                </NavLink>
              </div>
            )}
          </div>

          {/* User Avatar Menu */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-2 p-1 rounded-lg hover:bg-[#F7F9FC] transition cursor-pointer border border-transparent hover:border-[#DDE3EC]"
              id="user-avatar-menu-trigger"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#165DFF] to-[#6C5CE7] flex items-center justify-center text-white text-xs font-heading font-bold shadow-xs">
                {user?.name ? user.name.slice(0, 1) : 'S'}
              </div>
              <span className="hidden lg:inline text-xs font-medium text-[#172033]">
                {user?.name?.split(' ')[0] || 'Analyst'}
              </span>
            </button>

            {userDropdownOpen && (
              <div
                id="user-avatar-dropdown"
                className="absolute right-0 mt-2 w-64 bg-white border border-[#DDE3EC] rounded-xl shadow-xl p-3 z-50 text-xs space-y-3"
              >
                <div className="border-b border-[#DDE3EC] pb-2.5">
                  <div className="font-heading font-bold text-[#123B70]">{user?.name || 'Security Analyst'}</div>
                  <div className="text-[11px] text-[#165DFF] font-medium">{user?.role || 'SOC Triage Specialist'}</div>
                  <div className="text-[10px] text-[#667085] font-mono mt-0.5">Clearance: {user?.clearance || 'Level 4 Forensics'}</div>
                </div>

                <div className="space-y-1">
                  <NavLink
                    to="/compare"
                    onClick={() => setUserDropdownOpen(false)}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-[#F7F9FC] text-[#172033] flex items-center gap-2 cursor-pointer transition"
                  >
                    <GitCompare className="w-3.5 h-3.5 text-[#165DFF]" />
                    <span>Email Comparison Tool</span>
                  </NavLink>

                  <NavLink
                    to="/methodology"
                    onClick={() => setUserDropdownOpen(false)}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-[#F7F9FC] text-[#172033] flex items-center gap-2 cursor-pointer transition"
                  >
                    <FileCheck className="w-3.5 h-3.5 text-[#6C5CE7]" />
                    <span>Forensic Methodology</span>
                  </NavLink>

                  <button
                    type="button"
                    onClick={() => {
                      setDemoModalOpen(true);
                      setUserDropdownOpen(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-[#F7F9FC] text-[#172033] flex items-center gap-2 cursor-pointer transition"
                  >
                    <FlaskConical className="w-3.5 h-3.5 text-[#B45309]" />
                    <span>Try Demo Investigation</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleResetDemoData}
                    disabled={isResetting}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-[#F7F9FC] text-[#F97316] flex items-center gap-2 cursor-pointer transition"
                  >
                    <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
                    <span>{isResetting ? 'Resetting Store...' : 'Reset Demo Records'}</span>
                  </button>
                </div>

                <div className="border-t border-[#DDE3EC] pt-2">
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-[#D92D20]/10 text-[#D92D20] flex items-center gap-2 cursor-pointer transition"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Trigger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 rounded-lg text-[#667085] hover:text-[#172033] hover:bg-[#F7F9FC] border border-[#DDE3EC]"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-[#DDE3EC] px-4 py-3 space-y-1 shadow-lg">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-heading font-medium border ${
                  isActive
                    ? 'bg-[#EAF2FF] text-[#165DFF] border-[#165DFF]/30'
                    : 'border-transparent text-[#667085] hover:bg-[#F7F9FC]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}

          <div className="border-t border-[#DDE3EC] pt-2 mt-2 space-y-1">
            <NavLink
              to="/compare"
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-[#667085] hover:bg-[#F7F9FC]"
            >
              <GitCompare className="w-4 h-4 text-[#165DFF]" />
              <span>Email Comparison</span>
            </NavLink>
            <NavLink
              to="/methodology"
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-[#667085] hover:bg-[#F7F9FC]"
            >
              <FileCheck className="w-4 h-4 text-[#6C5CE7]" />
              <span>Forensic Methodology</span>
            </NavLink>
          </div>
        </div>
      )}
    </header>
  );
};
