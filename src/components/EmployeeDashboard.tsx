import React, { useState, useEffect } from 'react';
import {
  Clock,
  CheckCircle2,
  CalendarCheck2,
  Award,
  Calendar,
  AlertCircle,
  TrendingUp,
  MapPin,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { Employee, AttendanceRecord, Shift } from '../types';
import { storage } from '../services/storage';

interface EmployeeDashboardProps {
  currentUser: Employee;
  onNavigateTab: (tab: string) => void;
}

export const EmployeeDashboard: React.FC<EmployeeDashboardProps> = ({
  currentUser,
  onNavigateTab
}) => {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [shifts, setShifts] = useState<Shift[]>(storage.getShifts());

  const refreshData = () => {
    const all = storage.getAttendanceRecords();
    setRecords(all.filter((r) => r.employeeId === currentUser.id));
    setShifts(storage.getShifts());
  };

  useEffect(() => {
    refreshData();
    const unsub = storage.subscribe(refreshData);
    return unsub;
  }, [currentUser.id]);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayRecord = records.find((r) => r.date === todayStr);

  const currentShift = shifts.find((s) => s.id === currentUser.shiftId) || shifts[0];

  // Calculate Personal Stats for the last 30 days
  const presentDays = records.filter((r) => r.status === 'present').length;
  const lateDays = records.filter((r) => r.status === 'late').length;
  const totalWorkedHours = records.reduce((acc, r) => acc + (r.workHours || 0), 0).toFixed(1);
  const totalOvertime = records.reduce((acc, r) => acc + (r.overtimeHours || 0), 0).toFixed(1);

  const totalLogs = records.length;
  const punctualityScore = totalLogs > 0 ? Math.round((presentDays / totalLogs) * 100) : 100;

  const recentRecords = records.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Welcome Hero Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <img
              src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'}
              alt={currentUser.firstName}
              className="w-16 h-16 rounded-2xl object-cover ring-4 ring-white/20 shadow-md"
            />
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                  Welcome back, {currentUser.firstName}!
                </h1>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-white/20 backdrop-blur-xs text-white">
                  {currentUser.employeeId}
                </span>
              </div>
              <p className="text-xs text-blue-200 mt-1">
                {currentUser.designation} • Shift: {currentShift.name} ({currentShift.startTime} - {currentShift.endTime})
              </p>
            </div>
          </div>

          {/* Quick Terminal Action */}
          <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/15">
            <div className="px-3 text-right">
              <span className="text-[10px] text-blue-200 font-bold uppercase block">Today's State</span>
              <span className="text-xs font-extrabold text-white">
                {todayRecord && todayRecord.checkIn && todayRecord.checkIn !== '-'
                  ? todayRecord.checkOut
                    ? 'Shift Finished'
                    : `Clocked in at ${todayRecord.checkIn}`
                  : 'Pending Clock In'}
              </span>
            </div>

            <button
              onClick={() => onNavigateTab('terminal')}
              className="px-4 py-2.5 bg-white text-blue-800 hover:bg-blue-50 rounded-xl text-xs font-extrabold shadow-sm transition flex items-center space-x-1.5 cursor-pointer"
            >
              <Clock className="w-3.5 h-3.5 text-blue-700" />
              <span>
                {todayRecord && todayRecord.checkIn && todayRecord.checkIn !== '-' && !todayRecord.checkOut
                  ? 'Open Terminal (Clock Out)'
                  : 'Clock In Now'}
              </span>
            </button>
          </div>
        </div>

        {/* Background Ambient Circles */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* 4 Personal Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Punctuality Score</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900">{punctualityScore}%</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              High Tier
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">{presentDays} on-time days, {lateDays} late</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Work Hours</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900">{totalWorkedHours}</span>
            <span className="text-xs font-mono text-slate-500">hours</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Logged past 30 days</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Overtime Hours</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-purple-600">+{totalOvertime}</span>
            <span className="text-xs font-mono text-purple-400">hours</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Approved for compensation</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Available Leaves</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900">
              {currentUser.casualLeaveBalance + currentUser.sickLeaveBalance + currentUser.annualLeaveBalance}
            </span>
            <span className="text-xs text-slate-500">days left</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {currentUser.casualLeaveBalance} Casual • {currentUser.sickLeaveBalance} Sick • {currentUser.annualLeaveBalance} Annual
          </p>
        </div>
      </div>

      {/* Main Grid: Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Attendance Logs */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">My Recent Attendance Records</h3>
              <p className="text-xs text-slate-500 mt-0.5">Logs recorded with method, timestamp, and duration.</p>
            </div>
            <button
              onClick={() => onNavigateTab('attendance')}
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
            >
              View Full History &rarr;
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Check In</th>
                  <th className="py-3 px-4">Check Out</th>
                  <th className="py-3 px-4">Hours</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {recentRecords.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-slate-400">
                      No attendance records found yet.
                    </td>
                  </tr>
                ) : (
                  recentRecords.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4 font-mono font-medium text-slate-900">{r.date}</td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-800">{r.checkIn}</td>
                      <td className="py-3 px-4 font-mono text-slate-600">{r.checkOut || '—'}</td>
                      <td className="py-3 px-4 font-mono font-semibold text-slate-800">{r.workHours}h</td>
                      <td className="py-3 px-4 capitalize text-slate-600">{r.method.replace('_', ' ')}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                            r.status === 'present'
                              ? 'bg-emerald-100 text-emerald-800'
                              : r.status === 'late'
                              ? 'bg-amber-100 text-amber-800'
                              : r.status === 'half_day'
                              ? 'bg-purple-100 text-purple-800'
                              : r.status === 'on_leave'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {r.status.replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Quick Widgets */}
        <div className="lg:col-span-4 space-y-4">
          {/* Quick Apply Leave */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-2">
              Time Off & Leaves
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Need leave for travel or medical reasons? Submit an application for HR manager approval.
            </p>
            <button
              onClick={() => onNavigateTab('leaves')}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition flex items-center justify-center space-x-2 cursor-pointer shadow-sm"
            >
              <CalendarCheck2 className="w-4 h-4" />
              <span>Apply for Leave</span>
            </button>
          </div>

          {/* Quick Shift Schedule Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                Assigned Shift
              </h3>
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Shift Name:</span>
                <span className="font-bold text-slate-800">{currentShift.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Standard Timings:</span>
                <span className="font-bold text-slate-800">{currentShift.startTime} — {currentShift.endTime}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Grace Allowed:</span>
                <span className="font-semibold text-emerald-600">{currentShift.gracePeriodMinutes} mins</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
