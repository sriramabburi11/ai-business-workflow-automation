import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Search, Bell, Building, LogOut, ChevronDown, Sparkles, User as UserIcon, Menu, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

interface NavbarProps {
  onMenuClick?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onMenuClick }) => {
  const { user, organization, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  return (
    <header className="h-16 border-b border-slate-800 bg-[#090d16]/95 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between gap-3">
      {/* Left: Mobile Menu Trigger & Brand logo on mobile */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
          aria-label="Toggle Menu"
        >
          <Menu className="h-5 w-5 text-indigo-400" />
        </button>

        <Link to="/dashboard" className="lg:hidden flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-md">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <span className="font-extrabold text-sm text-white tracking-tight">Nexus<span className="text-indigo-400">AI</span></span>
        </Link>

        {/* Search Input for tablet & desktop */}
        <div className="relative hidden sm:block w-48 sm:w-64 md:w-80 lg:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search workflows, tasks..."
            className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-all"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Active Organization Badge for Desktop */}
        <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 font-medium">
          <Building className="h-3.5 w-3.5 text-indigo-400" />
          <span className="truncate max-w-[150px]">{organization?.name || 'Smart Automation Enterprise'}</span>
        </div>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-all relative"
            title="Notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-xs font-bold text-white flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-indigo-400" /> Notifications
                </span>
                <span className="text-[10px] bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded font-semibold">2 New</span>
              </div>
              <div className="space-y-3 mt-3">
                <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/50 text-xs">
                  <div className="font-semibold text-slate-200">Pending Approval Required</div>
                  <div className="text-slate-400 text-[11px] mt-0.5">Cloud Infrastructure Invoice #INV-2026-8942 ($4,590.00)</div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/50 text-xs">
                  <div className="font-semibold text-slate-200">Workflow Execution Complete</div>
                  <div className="text-slate-400 text-[11px] mt-0.5">AI Employee Onboarding finished all 4 steps</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="flex items-center gap-2 p-1 sm:pr-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-all"
          >
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-xs shadow-md">
              {user?.name ? user.name.split(' ').map(n => n[0]).join('') : 'U'}
            </div>
            <div className="text-left hidden md:block">
              <div className="text-xs font-semibold text-slate-200">{user?.name || 'Sarah Connor'}</div>
              <div className="text-[10px] text-indigo-400 font-mono font-medium">{user?.role || 'ADMIN'}</div>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400 hidden md:block" />
          </button>

          {showUserDropdown && (
            <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-2 z-50">
              <div className="px-4 py-2 border-b border-slate-800">
                <p className="text-xs font-bold text-white">{user?.name}</p>
                <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
              </div>

              <Link
                to="/profile"
                onClick={() => setShowUserDropdown(false)}
                className="flex items-center gap-2 px-4 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
              >
                <UserIcon className="h-4 w-4 text-indigo-400" /> Profile & Audit Logs
              </Link>
              <Link
                to="/settings"
                onClick={() => setShowUserDropdown(false)}
                className="flex items-center gap-2 px-4 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
              >
                <Building className="h-4 w-4 text-purple-400" /> Organization Settings
              </Link>

              <div className="border-t border-slate-800 mt-1 pt-1">
                <button
                  onClick={() => {
                    setShowUserDropdown(false);
                    logout();
                  }}
                  className="flex items-center gap-2 w-full text-left px-4 py-2 text-xs text-rose-400 hover:bg-rose-500/10 transition-colors"
                >
                  <LogOut className="h-4 w-4" /> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
