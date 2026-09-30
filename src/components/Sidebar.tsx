import React from 'react';
import {
  LayoutDashboard,
  Clock,
  ClipboardList,
  Users,
  Building2,
  CalendarDays,
  CalendarCheck2,
  FileBarChart2,
  MapPin,
  Sparkles,
  ShieldCheck,
  UserCheck,
  LogOut
} from 'lucide-react';
import { Role } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userRole: Role;
  pendingLeavesCount: number;
  onLogout?: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeCount?: number;
  highlight?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  userRole,
  pendingLeavesCount,
  onLogout
}) => {
  const adminNav: NavItem[] = [
    { id: 'dashboard', label: 'Admin Dashboard', icon: LayoutDashboard },
    { id: 'terminal', label: 'Attendance Terminal', icon: Clock, badge: 'Live GPS' },
    { id: 'attendance', label: 'Attendance Records', icon: ClipboardList },
    { id: 'employees', label: 'Employees Directory', icon: Users },
    { id: 'departments', label: 'Departments', icon: Building2 },
    { id: 'shifts', label: 'Shifts & Schedules', icon: CalendarDays },
    { id: 'leaves', label: 'Leave Requests', icon: CalendarCheck2, badgeCount: pendingLeavesCount },
    { id: 'holidays', label: 'Holiday Calendar', icon: CalendarDays },
    { id: 'reports', label: 'Reports & Analytics', icon: FileBarChart2 },
  ];

  const employeeNav: NavItem[] = [
    { id: 'dashboard', label: 'My Dashboard', icon: LayoutDashboard },
    { id: 'terminal', label: 'Clock In / Out', icon: Clock, badge: 'Live GPS' },
    { id: 'attendance', label: 'My Attendance Logs', icon: ClipboardList },
    { id: 'leaves', label: 'Apply / Track Leaves', icon: CalendarCheck2 },
    { id: 'shifts', label: 'My Shift Details', icon: CalendarDays },
    { id: 'holidays', label: 'Company Holidays', icon: CalendarDays },
  ];

  const currentNav = userRole === 'admin' ? adminNav : employeeNav;

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 border-r border-slate-800 select-none">
      {/* Role Indicator Banner */}
      <div className="p-4 border-b border-slate-800/80">
        <div className={`p-3 rounded-xl flex items-center space-x-3 ${
          userRole === 'admin' ? 'bg-indigo-950/60 border border-indigo-700/50' : 'bg-slate-800/80 border border-slate-700/50'
        }`}>
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
            userRole === 'admin' ? 'bg-indigo-600 text-white' : 'bg-emerald-600 text-white'
          }`}>
            {userRole === 'admin' ? <ShieldCheck className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Current Portal</span>
            <p className="text-xs font-bold text-white truncate">
              {userRole === 'admin' ? 'Administrator / HR' : 'Employee Self-Service'}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Navigation Menu
        </div>
        {currentNav.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all group cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : item.highlight
                  ? 'text-emerald-400 hover:bg-slate-800/80 hover:text-emerald-300 font-semibold'
                  : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-3 truncate">
                <Icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                  isActive ? 'text-white' : item.highlight ? 'text-emerald-400' : 'text-slate-400'
                }`} />
                <span className="truncate">{item.label}</span>
              </div>

              {item.badgeCount !== undefined && item.badgeCount > 0 && (
                <span className="ml-2 px-1.5 py-0.5 text-[10px] font-extrabold bg-amber-500 text-slate-950 rounded-full animate-pulse">
                  {item.badgeCount}
                </span>
              )}

              {item.badge && (
                <span className="ml-2 px-1.5 py-0.5 text-[9px] font-bold bg-blue-900/80 text-blue-300 border border-blue-700/50 rounded">
                  {item.badge}
                </span>
              )}

              {item.highlight && !isActive && (
                <span className="ml-1 text-[9px] font-bold px-1.5 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-700/40 rounded">
                  Full Code
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Logout Action Button */}
      {onLogout && (
        <div className="px-3 pb-1">
          <button
            onClick={onLogout}
            className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:text-white hover:bg-rose-950/50 border border-rose-900/30 transition cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-rose-400" />
            <span>Sign Out / Log Out</span>
          </button>
        </div>
      )}

      {/* Enterprise Status Footer */}
      <div className="p-3 m-3 rounded-xl bg-slate-800/60 border border-slate-700/50 text-[11px]">
        <div className="flex items-center space-x-1.5 text-blue-400 font-bold mb-1">
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          <span>WorkPulse Enterprise</span>
        </div>
        <p className="text-slate-400 text-[10px] leading-tight mb-2">
          Automated time tracking, GPS geofencing & workforce telemetry.
        </p>
        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1.5 border-t border-slate-700/60">
          <span className="font-mono text-emerald-400">● Cloud Active</span>
          <span className="font-mono text-slate-400">v2.4.0</span>
        </div>
      </div>
    </aside>
  );
};
