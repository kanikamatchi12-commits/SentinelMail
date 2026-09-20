import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Inbox,
  Search,
  FolderLock,
  Globe2,
  BarChart3,
  GitCompare,
  Bell,
  Sparkles,
  Menu,
  X,
  Home,
} from 'lucide-react';
import { SentinelLogo } from './SentinelLogo.tsx';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { path: '/', label: 'Welcome', icon: Home, exact: true },
    { path: '/inbox', label: 'Triage Inbox', icon: Inbox },
    { path: '/analyze', label: 'Analyze Email', icon: Search },
    { path: '/cases', label: 'Case Files', icon: FolderLock },
    { path: '/geotrace', label: 'GeoTrace', icon: Globe2 },
    { path: '/insights', label: 'Threat Insights', icon: BarChart3 },
    { path: '/compare', label: 'Compare', icon: GitCompare },
    { path: '/alerts', label: 'Threat Alerts', icon: Bell },
  ];

  const isItemActive = (item: typeof navItems[0]) => {
    if (item.exact) {
      return location.pathname === '/';
    }
    // Handle aliases like /history -> /cases, /analytics -> /insights
    if (item.path === '/cases') {
      return location.pathname.startsWith('/cases') || location.pathname.startsWith('/history');
    }
    if (item.path === '/insights') {
      return location.pathname.startsWith('/insights') || location.pathname.startsWith('/analytics');
    }
    return location.pathname.startsWith(item.path);
  };

  return (
    <header
      id="main-navbar"
      className="sticky top-0 z-50 w-full border-b border-[#DDE3EC] bg-white/95 backdrop-blur-md transition-colors"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group" id="navbar-brand-link">
          <SentinelLogo size="sm" lightText={false} showTagline={false} />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-heading font-extrabold text-base sm:text-lg tracking-tight text-[#123B70]">
                Sentinel<span className="text-[#165DFF]">Mail</span>
              </span>
              <span className="rounded-full border border-[#165DFF]/20 bg-[#EAF2FF] px-2 py-0.5 font-mono text-[9px] font-bold text-[#165DFF]">
                SIH 2026
              </span>
            </div>
            <p className="text-[10px] text-[#667085] hidden lg:block font-medium">
              Forensic Intelligence Platform
            </p>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden xl:flex items-center gap-1" id="desktop-navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isItemActive(item);

            return (
              <Link
                key={item.path}
                to={item.path}
                id={`nav-link-${item.path.replace('/', '') || 'welcome'}`}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-heading font-semibold transition-all ${
                  active
                    ? 'bg-[#EAF2FF] text-[#165DFF] border border-[#165DFF]/30 shadow-xs'
                    : 'text-[#667085] hover:bg-[#F7F9FC] hover:text-[#123B70]'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Compact desktop nav for md to lg screens */}
        <nav className="hidden md:flex xl:hidden items-center gap-1">
          {navItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const active = isItemActive(item);

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-heading font-semibold transition-all ${
                  active
                    ? 'bg-[#EAF2FF] text-[#165DFF] border border-[#165DFF]/30'
                    : 'text-[#667085] hover:bg-[#F7F9FC] hover:text-[#123B70]'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right CTA & Mobile Toggle */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            to="/analyze"
            id="navbar-cta-analyze"
            className="flex items-center gap-1.5 rounded-xl bg-[#165DFF] hover:bg-[#123B70] px-3.5 py-2 text-xs font-heading font-bold text-white shadow-sm transition active:scale-95 cursor-pointer"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Analyze Email</span>
          </Link>

          {/* Mobile hamburger button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-[#667085] hover:text-[#123B70] hover:bg-[#F7F9FC] transition"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer / Expanded Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#DDE3EC] bg-white px-4 py-3 space-y-1 shadow-lg">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isItemActive(item);

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-heading font-semibold transition ${
                  active
                    ? 'bg-[#EAF2FF] text-[#165DFF]'
                    : 'text-[#667085] hover:bg-[#F7F9FC] hover:text-[#123B70]'
                }`}
              >
                <Icon className="h-4 w-4 text-[#165DFF]" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      )}

      {/* Secondary Horizontal Scrollable Sub-bar on Tablet/Mobile */}
      <div className="hidden sm:flex md:hidden overflow-x-auto border-t border-[#DDE3EC] px-3 py-1.5 bg-[#F7F9FC] gap-1 no-scrollbar">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isItemActive(item);

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-heading font-medium ${
                active
                  ? 'bg-[#EAF2FF] text-[#165DFF] font-semibold'
                  : 'text-[#667085]'
              }`}
            >
              <Icon className="h-3 w-3" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </header>
  );
};
