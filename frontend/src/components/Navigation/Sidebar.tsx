import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  GitMerge,
  Sparkles,
  FileSpreadsheet,
  CheckSquare,
  ShieldCheck,
  FileText,
  BarChart3,
  Settings,
  User,
  Zap,
  X
} from 'lucide-react';

interface SidebarProps {
  pendingApprovalsCount?: number;
  pendingTasksCount?: number;
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  pendingApprovalsCount = 1,
  pendingTasksCount = 2,
  isOpen = false,
  onClose
}) => {
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'AI Workflows', path: '/workflows', icon: GitMerge },
    { name: 'AI Builder', path: '/workflows/new', icon: Sparkles, badge: 'AI' },
    { name: 'Templates', path: '/templates', icon: FileSpreadsheet },
    { name: 'Tasks Board', path: '/tasks', icon: CheckSquare, count: pendingTasksCount },
    { name: 'Approvals Hub', path: '/approvals', icon: ShieldCheck, count: pendingApprovalsCount, highlight: true },
    { name: 'Document Vault', path: '/documents', icon: FileText },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Org Settings', path: '/settings', icon: Settings },
    { name: 'Profile & Audits', path: '/profile', icon: User },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-40 lg:hidden animate-in fade-in"
        />
      )}

      {/* Sidebar: Fixed on Desktop (lg:sticky lg:top-0 lg:shrink-0), Drawer on Mobile */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 h-screen w-64 bg-[#0b0f19] border-r border-slate-800 flex flex-col select-none transition-transform duration-300 ease-in-out lg:sticky lg:top-0 lg:shrink-0 lg:translate-x-0 ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg text-white tracking-tight">Nexus</span>
                <span className="text-xs px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 font-semibold border border-indigo-500/30">AI</span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Smart Automation Platform</p>
            </div>
          </div>

          {/* Close button for Mobile */}
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
            Core Workspaces
          </div>

          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                  isActive
                    ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <item.icon className="h-4 w-4 transition-transform group-hover:scale-110" />
                <span>{item.name}</span>
              </div>

              {item.badge && (
                <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-sm">
                  {item.badge}
                </span>
              )}

              {typeof item.count === 'number' && item.count > 0 && (
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    item.highlight
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {item.count}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer / Model indicator */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-900/40">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="font-mono text-[11px] text-slate-300">Gemini 2.5 Flash</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">v1.0.0</span>
          </div>
        </div>
      </aside>
    </>
  );
};
