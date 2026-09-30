import React, { useState } from 'react';
import {
  Clock,
  Lock,
  Mail,
  User,
  Shield,
  ShieldCheck,
  UserCheck,
  Building,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  LogIn,
  KeyRound,
  ShieldAlert,
  Info
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Employee } from '../types';
import { storage } from '../services/storage';

interface AuthScreenProps {
  onAuthSuccess: (user: Employee) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthSuccess }) => {
  // Tabs: 'admin' for Admin Sign In, 'employee' for Employee Sign In
  const [authRole, setAuthRole] = useState<'admin' | 'employee'>('admin');

  // Form State
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Switch tabs
  const handleTabChange = (role: 'admin' | 'employee') => {
    setAuthRole(role);
    setErrorMessage(null);
    setIdentifier('');
    setPassword('');
  };

  // Submit Handler
  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanId = identifier.trim();
    if (!cleanId) {
      setErrorMessage(
        authRole === 'admin'
          ? 'Please enter your Admin Email or Admin ID.'
          : 'Please enter your Employee Work Email or Employee ID.'
      );
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const res = storage.login(cleanId, password);
      setIsLoading(false);

      if (res.success && res.user) {
        // Enforce role consistency
        if (authRole === 'admin' && res.user.role !== 'admin') {
          setErrorMessage(
            `Notice: Account "${res.user.firstName} ${res.user.lastName}" has Staff Employee privileges. Please switch to the "Employee Sign In" tab to log in.`
          );
          return;
        }

        if (authRole === 'employee' && res.user.role === 'admin') {
          // Admin can also log in under employee view or switch, but notify them
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.6 }
          });
          onAuthSuccess(res.user);
          return;
        }

        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 }
        });
        onAuthSuccess(res.user);
      } else {
        setErrorMessage(
          res.message ||
            (authRole === 'admin'
              ? 'Access Denied: Invalid Admin credentials.'
              : 'Access Denied: Only employees registered and authorized by the Administrator can log in.')
        );
      }
    }, 350);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Background Ambient Glow Accents */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Main Card */}
      <div className="w-full max-w-xl bg-slate-950/95 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white shadow-xl shadow-blue-500/20 mb-3 ring-4 ring-blue-500/20">
            <Clock className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center justify-center space-x-2">
            <span>WorkPulse</span>
            <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-blue-900/80 text-blue-300 border border-blue-700/60">
              Enterprise
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto leading-relaxed">
            Corporate Workforce Attendance & HR Management Platform
          </p>
        </div>

        {/* PRIMARY ROLE TABS: ADMIN SIGN IN vs EMPLOYEE SIGN IN */}
        <div className="grid grid-cols-2 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800/90 mb-6">
          {/* Admin Sign In Tab */}
          <button
            type="button"
            onClick={() => handleTabChange('admin')}
            className={`py-3 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 cursor-pointer ${
              authRole === 'admin'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30 ring-1 ring-purple-400/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Admin Sign In</span>
          </button>

          {/* Employee Sign In Tab */}
          <button
            type="button"
            onClick={() => handleTabChange('employee')}
            className={`py-3 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 cursor-pointer ${
              authRole === 'employee'
                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-600/30 ring-1 ring-blue-400/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Employee Sign In</span>
          </button>
        </div>

        {/* Role Banner / Context Description */}
        <div
          className={`mb-5 p-3.5 rounded-2xl border flex items-start space-x-3 text-xs ${
            authRole === 'admin'
              ? 'bg-purple-950/30 border-purple-800/40 text-purple-200'
              : 'bg-blue-950/30 border-blue-800/40 text-blue-200'
          }`}
        >
          {authRole === 'admin' ? (
            <Shield className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
          ) : (
            <ShieldAlert className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          )}
          <div className="leading-relaxed">
            <strong className="block font-bold">
              {authRole === 'admin'
                ? 'Administrator & HR Portal Access'
                : 'Employee Self-Service Access'}
            </strong>
            <span className="text-[11px] opacity-90 block mt-0.5">
              {authRole === 'admin'
                ? 'Authorized access for HR directors, team leads, and department heads to manage staff records, shift scheduling, and leave approvals.'
                : 'Clock in/out terminal access, GPS geofence verification, personal timecards, and leave applications. Only employees registered by the Admin can log in.'}
            </span>
          </div>
        </div>

        {/* SIGN IN FORM */}
        <form onSubmit={handleSignIn} className="space-y-4">
          {errorMessage && (
            <div className="p-3 bg-rose-500/15 border border-rose-500/40 rounded-xl text-xs text-rose-200 flex items-start space-x-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span className="leading-relaxed font-medium">{errorMessage}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {authRole === 'admin'
                ? 'Admin Email or Admin ID'
                : 'Employee Work Email or Employee ID (Registered by Admin)'}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
              <input
                type="text"
                required
                placeholder={
                  authRole === 'admin'
                    ? 'e.g. admin@workpulse.com or ADM-001'
                    : 'e.g. priya.s@workpulse.com or EMP-101'
                }
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent transition font-medium"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Password
              </label>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent transition font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 text-white rounded-xl text-xs font-bold transition shadow-lg flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 ${
              authRole === 'admin'
                ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-600/30'
                : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/30'
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>
              {isLoading
                ? 'Verifying Credentials...'
                : authRole === 'admin'
                ? 'Sign In as Administrator'
                : 'Sign In as Employee'}
            </span>
          </button>
        </form>

        {/* Footer Info */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center space-x-1.5 text-emerald-400 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Cloud Status: Operational</span>
          </div>
          <span className="font-mono text-[10px] text-slate-400">WorkPulse Enterprise v2.4</span>
        </div>
      </div>
    </div>
  );
};
