import React, { useEffect, useRef, useState } from 'react';
import {
  Users,
  CheckCircle2,
  Clock,
  CalendarCheck,
  AlertTriangle,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Download,
  Building,
  Sparkles,
  User,
  KeyRound,
  ShieldCheck,
  Printer
} from 'lucide-react';
import { Chart, registerables } from 'chart.js';
import { Employee, AttendanceRecord, Department } from '../types';
import { storage } from '../services/storage';
import { ProfileModal } from './ProfileModal';
import { generateAndPrintReport } from '../utils/printReport';

Chart.register(...registerables);

interface AdminDashboardProps {
  onNavigateTab: (tab: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigateTab }) => {
  const [currentUser, setCurrentUser] = useState<Employee | null>(storage.getCurrentUser());
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileModalTab, setProfileModalTab] = useState<'profile' | 'password'>('profile');

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  const donutChartRef = useRef<HTMLCanvasElement>(null);
  const weeklyChartRef = useRef<HTMLCanvasElement>(null);
  const donutChartInstance = useRef<Chart | null>(null);
  const weeklyChartInstance = useRef<Chart | null>(null);

  const refreshData = () => {
    setCurrentUser(storage.getCurrentUser());
    setEmployees(storage.getEmployees());
    setAttendance(storage.getAttendanceRecords());
    setDepartments(storage.getDepartments());
  };

  useEffect(() => {
    refreshData();
    const unsub = storage.subscribe(refreshData);
    return unsub;
  }, []);

  // Compute Today's Stats
  const todayStr = new Date().toISOString().split('T')[0];
  const todayRecords = attendance.filter((r) => r.date === todayStr);

  const totalEmployees = employees.length;
  const presentCount = todayRecords.filter((r) => r.status === 'present').length;
  const lateCount = todayRecords.filter((r) => r.status === 'late').length;
  const halfDayCount = todayRecords.filter((r) => r.status === 'half_day').length;
  const onLeaveCount = todayRecords.filter((r) => r.status === 'on_leave').length;
  const absentCount = Math.max(0, totalEmployees - (presentCount + lateCount + halfDayCount + onLeaveCount));

  const totalActivePresent = presentCount + lateCount + halfDayCount;
  const attendanceRate = totalEmployees > 0 ? Math.round((totalActivePresent / totalEmployees) * 100) : 0;

  // Render Chart.js Donut Chart
  useEffect(() => {
    if (!donutChartRef.current) return;

    if (donutChartInstance.current) {
      donutChartInstance.current.destroy();
    }

    const ctx = donutChartRef.current.getContext('2d');
    if (!ctx) return;

    donutChartInstance.current = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['On Time (Present)', 'Late Arrival', 'Half Day', 'On Leave', 'Unmarked / Absent'],
        datasets: [
          {
            data: [presentCount, lateCount, halfDayCount, onLeaveCount, absentCount],
            backgroundColor: [
              '#10B981', // emerald
              '#F59E0B', // amber
              '#8B5CF6', // purple
              '#3B82F6', // blue
              '#EF4444', // rose
            ],
            borderWidth: 2,
            borderColor: '#FFFFFF',
            hoverOffset: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              boxWidth: 12,
              padding: 14,
              font: {
                family: "'Plus Jakarta Sans', sans-serif",
                size: 11,
              },
            },
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.label || '';
                const val = context.raw as number;
                const pct = totalEmployees > 0 ? ((val / totalEmployees) * 100).toFixed(0) : '0';
                return ` ${label}: ${val} staff (${pct}%)`;
              },
            },
          },
        },
        cutout: '70%',
      },
    });

    return () => {
      if (donutChartInstance.current) {
        donutChartInstance.current.destroy();
      }
    };
  }, [presentCount, lateCount, halfDayCount, onLeaveCount, absentCount, totalEmployees]);

  // Render Weekly Attendance Trend Bar / Line
  useEffect(() => {
    if (!weeklyChartRef.current) return;

    if (weeklyChartInstance.current) {
      weeklyChartInstance.current.destroy();
    }

    const ctx = weeklyChartRef.current.getContext('2d');
    if (!ctx) return;

    // Get last 7 days labels
    const days: string[] = [];
    const presentData: number[] = [];
    const lateData: number[] = [];

    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dStr = d.toISOString().split('T')[0];
      const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' });
      days.push(dayLabel);

      const dayRecords = attendance.filter((r) => r.date === dStr);
      presentData.push(dayRecords.filter((r) => r.status === 'present').length);
      lateData.push(dayRecords.filter((r) => r.status === 'late').length);
    }

    weeklyChartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: days,
        datasets: [
          {
            label: 'Present On-Time',
            data: presentData,
            backgroundColor: '#3B82F6',
            borderRadius: 6,
          },
          {
            label: 'Late Arrivals',
            data: lateData,
            backgroundColor: '#F59E0B',
            borderRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            stacked: true,
            grid: { display: false },
            ticks: { font: { size: 11, family: "'Plus Jakarta Sans', sans-serif" } },
          },
          y: {
            stacked: true,
            beginAtZero: true,
            grid: { color: '#F1F5F9' },
            ticks: { stepSize: 2, font: { size: 10 } },
          },
        },
        plugins: {
          legend: {
            position: 'top',
            align: 'end',
            labels: {
              boxWidth: 10,
              font: { size: 11, family: "'Plus Jakarta Sans', sans-serif" },
            },
          },
        },
      },
    });

    return () => {
      if (weeklyChartInstance.current) {
        weeklyChartInstance.current.destroy();
      }
    };
  }, [attendance]);

  // Recent 5 clock-in events
  const recentClockIns = todayRecords.slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Welcome & Overview Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Workforce Attendance Overview
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time biometric, GPS, and QR attendance telemetry across all enterprise departments.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {currentUser && (
            <>
              <button
                onClick={() => {
                  setProfileModalTab('profile');
                  setIsProfileModalOpen(true);
                }}
                className="px-3 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-200 text-slate-700 transition flex items-center space-x-1.5 cursor-pointer shadow-2xs"
                title="Edit Admin Profile details"
              >
                <User className="w-3.5 h-3.5 text-purple-600" />
                <span>Edit Profile</span>
              </button>

              <button
                onClick={() => {
                  setProfileModalTab('password');
                  setIsProfileModalOpen(true);
                }}
                className="px-3 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 hover:bg-amber-50 hover:text-amber-750 hover:border-amber-200 text-slate-700 transition flex items-center space-x-1.5 cursor-pointer shadow-2xs"
                title="Reset or change administrator password"
              >
                <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                <span>Reset Password</span>
              </button>
            </>
          )}

          <button
            onClick={() => onNavigateTab('terminal')}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition flex items-center space-x-2 shadow-sm cursor-pointer"
          >
            <Clock className="w-4 h-4" />
            <span>Attendance Terminal</span>
          </button>

          <button
            onClick={() => generateAndPrintReport()}
            className="px-3 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 transition flex items-center space-x-1.5 cursor-pointer shadow-2xs"
            title="Open printable audit statement matching computer print preview"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span>Print Report</span>
          </button>

          <button
            onClick={() => onNavigateTab('reports')}
            className="px-3 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 transition flex items-center space-x-2 cursor-pointer shadow-2xs"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Reports</span>
          </button>
        </div>
      </div>

      {/* 4 Primary KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Employees */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Headcount</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900 tracking-tight">{totalEmployees}</span>
            <span className="text-[11px] font-semibold text-emerald-600 flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> 100% active
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Across 6 specialized departments</p>
        </div>

        {/* Present Today */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Present Today</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900 tracking-tight">{totalActivePresent}</span>
            <span className="text-[11px] font-bold text-blue-600 px-2 py-0.5 rounded-full bg-blue-50 border border-blue-100">
              {attendanceRate}% rate
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">{presentCount} on-time, {lateCount} delayed</p>
        </div>

        {/* Late Today */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Late Arrivals</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900 tracking-tight">{lateCount}</span>
            <span className="text-[11px] font-semibold text-amber-600">
              Avg. 24 mins late
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Grace threshold: 15 minutes</p>
        </div>

        {/* On Leave / Excused */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Approved Leave</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CalendarCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900 tracking-tight">{onLeaveCount}</span>
            <span className="text-[11px] font-semibold text-slate-500">
              {absentCount} unexcused
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">HR verified requests</p>
        </div>
      </div>

      {/* Analytics Charts Grid (Chart.js) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Today's Breakdown Donut Chart */}
        <div className="lg:col-span-5 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-slate-900">Today's Attendance Status</h3>
              <span className="text-[10px] font-semibold text-slate-400 font-mono">{todayStr}</span>
            </div>
            <p className="text-xs text-slate-500">Live proportion of staff attendance distribution.</p>
          </div>

          <div className="h-64 relative my-3 flex items-center justify-center">
            <canvas ref={donutChartRef} />
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
              <span className="text-3xl font-black text-slate-900">{attendanceRate}%</span>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Present</span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>Logged Check-ins: <strong>{todayRecords.length}</strong></span>
            <button
              onClick={() => onNavigateTab('attendance')}
              className="text-blue-600 hover:text-blue-700 font-semibold cursor-pointer"
            >
              View detailed logs &rarr;
            </button>
          </div>
        </div>

        {/* 7-Day Trend Chart */}
        <div className="lg:col-span-7 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-bold text-slate-900">7-Day Attendance Trend</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                  Consistent
                </span>
              </div>
              <span className="text-xs text-slate-400">Weekly Punctuality</span>
            </div>
            <p className="text-xs text-slate-500">Tracking daily on-time arrival versus late arrivals.</p>
          </div>

          <div className="h-64 my-3">
            <canvas ref={weeklyChartRef} />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>High punctuality observed in Software Engineering & Design.</span>
            <span className="font-semibold text-slate-700">Company Target: 95%</span>
          </div>
        </div>
      </div>

      {/* Live Recent Clock-in Events Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Today's Live Attendance Feed</h3>
            <p className="text-xs text-slate-500 mt-0.5">Most recent employee check-ins and clock-out verifications.</p>
          </div>
          <button
            onClick={() => onNavigateTab('attendance')}
            className="text-xs text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
          >
            Open All Master Records &rarr;
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Check In</th>
                <th className="py-3 px-4">Check Out</th>
                <th className="py-3 px-4">Total Hours</th>
                <th className="py-3 px-4">Verification</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {recentClockIns.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No check-in events recorded today yet.
                  </td>
                </tr>
              ) : (
                recentClockIns.map((rec) => {
                  const emp = employees.find((e) => e.id === rec.employeeId);
                  const dept = departments.find((d) => d.id === emp?.departmentId);

                  return (
                    <tr key={rec.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2.5">
                          <img
                            src={emp?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                            alt=""
                            className="w-7 h-7 rounded-full object-cover shrink-0"
                          />
                          <div>
                            <p className="font-bold text-slate-900">{emp ? `${emp.firstName} ${emp.lastName}` : 'Employee'}</p>
                            <span className="text-[10px] text-slate-400 font-mono">{emp?.employeeId}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-medium text-slate-600">{dept?.name || 'Engineering'}</span>
                      </td>

                      <td className="py-3 px-4 font-mono font-bold text-slate-800">
                        {rec.checkIn}
                      </td>

                      <td className="py-3 px-4 font-mono text-slate-600">
                        {rec.checkOut || '—'}
                      </td>

                      <td className="py-3 px-4 font-mono">
                        {rec.workHours > 0 ? (
                          <span className="font-semibold text-slate-800">{rec.workHours} hrs</span>
                        ) : (
                          <span className="text-slate-400">In Progress</span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 capitalize">
                          {rec.method.replace('_', ' ')}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold capitalize ${
                            rec.status === 'present'
                              ? 'bg-emerald-100 text-emerald-800'
                              : rec.status === 'late'
                              ? 'bg-amber-100 text-amber-800'
                              : rec.status === 'half_day'
                              ? 'bg-purple-100 text-purple-800'
                              : rec.status === 'on_leave'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {rec.status.replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* Edit Profile & Reset Password Modal */}
      {currentUser && (
        <ProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => {
            setIsProfileModalOpen(false);
            refreshData();
          }}
          currentUser={currentUser}
          initialTab={profileModalTab}
        />
      )}
    </div>
  );
};
