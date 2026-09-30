import React, { useState, useEffect, useRef } from 'react';
import {
  Bell,
  Clock,
  ShieldCheck,
  User,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  Calendar,
  LogOut,
  MapPin,
  Laptop,
  KeyRound,
  Settings,
  Printer,
  RotateCcw
} from 'lucide-react';
import { Employee, NotificationItem } from '../types';
import { storage } from '../services/storage';
import { ProfileModal } from './ProfileModal';
import { generateAndPrintReport } from '../utils/printReport';

interface NavbarProps {
  currentUser: Employee;
  onSelectUser: (user: Employee) => void;
  onLogout: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onSelectUser,
  onLogout,
  setActiveTab
}) => {
  const [time, setTime] = useState(new Date());
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [allEmployees, setAllEmployees] = useState<Employee[]>([]);

  // Profile Modal State
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileModalTab, setProfileModalTab] = useState<'profile' | 'password'>('profile');

  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const refreshData = () => {
    setNotifications(storage.getNotifications());
    setAllEmployees(storage.getEmployees());
  };

  useEffect(() => {
    refreshData();
    const unsub = storage.subscribe(refreshData);
    return unsub;
  }, []);

  // Click outside listener for dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const userNotifications = notifications.filter(
    (n) => n.userId === 'all' || n.userId === currentUser.id || (currentUser.role === 'admin' && n.userId === 'emp_admin')
  );

  const unreadCount = userNotifications.filter((n) => !n.read).length;

  const handleMarkAllRead = () => {
    storage.markAllNotificationsAsRead();
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 sm:px-6 py-2.5 flex items-center justify-between shadow-xs">
      {/* Brand & Context */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 ring-2 ring-blue-100">
            <Clock className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-slate-900 tracking-tight text-lg">WorkPulse</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/80">
                Enterprise
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-500 hidden sm:block">
              Enterprise Attendance & HR Management Platform
            </p>
          </div>
        </div>
      </div>

      {/* Center Live Clock */}
      <div className="hidden lg:flex items-center space-x-3 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-600">
        <div className="flex items-center space-x-1.5 text-blue-600">
          <Calendar className="w-3.5 h-3.5" />
          <span>
            {time.toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}
          </span>
        </div>
        <span className="text-slate-300">|</span>
        <div className="flex items-center space-x-1.5 font-mono text-slate-800">
          <Clock className="w-3.5 h-3.5 text-emerald-500" />
          <span>
            {time.toLocaleTimeString('en-US', {
              hour12: true,
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            })}
          </span>
        </div>
      </div>

      {/* Right Actions: Clock In/Out Terminal, Print, Notifications, User Menu */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Global Print Statement / Audit Report Button */}
        <button
          onClick={() => generateAndPrintReport()}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 transition-all cursor-pointer shadow-2xs"
          title="Print official workforce attendance statement (PDF / Printer)"
        >
          <Printer className="w-3.5 h-3.5 text-slate-600" />
          <span className="hidden sm:inline">Print Report</span>
        </button>

        {/* Quick Terminal Shortcut */}
        <button
          onClick={() => setActiveTab('terminal')}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-all cursor-pointer shadow-xs"
        >
          <MapPin className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Clock In/Out</span>
        </button>

        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white animate-bounce">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 py-2 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-sm text-slate-800">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 font-bold">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
                  >
                    Mark all as read
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                {userNotifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">
                    No notifications right now.
                  </div>
                ) : (
                  userNotifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => storage.markNotificationAsRead(notif.id)}
                      className={`p-3.5 hover:bg-slate-50 transition cursor-pointer flex items-start space-x-3 ${
                        !notif.read ? 'bg-blue-50/40' : ''
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">
                        {notif.type === 'attendance' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                        {notif.type === 'leave' && <AlertCircle className="w-4 h-4 text-amber-600" />}
                        {notif.type === 'warning' && <AlertCircle className="w-4 h-4 text-rose-600" />}
                        {notif.type === 'info' && <Bell className="w-4 h-4 text-blue-600" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold text-slate-800 truncate">{notif.title}</p>
                          <span className="text-[10px] text-slate-400 shrink-0">{notif.timestamp}</span>
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5 line-clamp-2 leading-relaxed">
                          {notif.message}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile & Role Switcher */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center space-x-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition cursor-pointer"
          >
            <img
              src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
              alt={currentUser.firstName}
              className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-300"
            />
            <div className="text-left hidden md:block">
              <div className="text-xs font-bold text-slate-800 flex items-center space-x-1">
                <span>{currentUser.firstName} {currentUser.lastName}</span>
                {currentUser.role === 'admin' ? (
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-purple-100 text-purple-700">Admin</span>
                ) : (
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-slate-100 text-slate-700">Employee</span>
                )}
              </div>
              <div className="text-[10px] text-slate-500 truncate max-w-[120px]">{currentUser.designation}</div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-xs font-semibold text-slate-800">{currentUser.firstName} {currentUser.lastName}</p>
                <p className="text-xs text-slate-500 font-mono mt-0.5">{currentUser.email}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">ID: {currentUser.employeeId}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    currentUser.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {currentUser.role.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Profile & Account Actions */}
              <div className="px-2 py-1.5 border-b border-slate-100 space-y-1">
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    setProfileModalTab('profile');
                    setIsProfileModalOpen(true);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-purple-50 hover:text-purple-700 flex items-center space-x-2.5 transition cursor-pointer"
                >
                  <User className="w-4 h-4 text-purple-600" />
                  <span>Edit Profile</span>
                </button>

                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    setProfileModalTab('password');
                    setIsProfileModalOpen(true);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-amber-50 hover:text-amber-800 flex items-center space-x-2.5 transition cursor-pointer"
                >
                  <KeyRound className="w-4 h-4 text-amber-600" />
                  <span>Reset / Change Password</span>
                </button>

                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    generateAndPrintReport();
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex items-center space-x-2.5 transition cursor-pointer"
                  title="Generate and print official audit statement"
                >
                  <Printer className="w-4 h-4 text-blue-600" />
                  <span>Print Audit Statement</span>
                </button>
              </div>

              {/* Reset Data Option */}
              <div className="px-2 py-1 border-b border-slate-100">
                <button
                  onClick={() => {
                    if (confirm('Reset attendance & employee records back to clean initial data?')) {
                      storage.resetToFactory();
                      window.location.reload();
                    }
                  }}
                  className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-slate-500 hover:bg-slate-100 flex items-center space-x-2 transition cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                  <span>Reset Data to Initial</span>
                </button>
              </div>

              {/* Sign Out / Logout */}
              <div className="px-2 pt-1.5 pb-0.5">
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    onLogout();
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center space-x-2.5 transition cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out / Log Out</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Quick Direct Logout Icon */}
        <button
          onClick={onLogout}
          className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
          title="Sign Out / Logout"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>

      {/* Edit Profile & Reset Password Modal */}
      {isProfileModalOpen && (
        <ProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          currentUser={currentUser}
          initialTab={profileModalTab}
        />
      )}
    </header>
  );
};
