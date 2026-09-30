import React, { useState, useEffect, useRef } from 'react';
import {
  FileBarChart2,
  Calendar,
  Download,
  Printer,
  TrendingUp,
  Building,
  CheckCircle2,
  Clock,
  AlertCircle,
  RotateCcw
} from 'lucide-react';
import { Chart, registerables } from 'chart.js';
import { AttendanceRecord, Employee, Department, Shift } from '../types';
import { storage } from '../services/storage';
import { generateAndPrintReport } from '../utils/printReport';

Chart.register(...registerables);

export const ReportsAnalytics: React.FC = () => {
  const [reportRange, setReportRange] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 14);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState<string>(() => new Date().toISOString().split('T')[0]);

  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  const deptChartRef = useRef<HTMLCanvasElement>(null);
  const deptChartInstance = useRef<Chart | null>(null);

  const refreshData = () => {
    setRecords(storage.getAttendanceRecords());
    setEmployees(storage.getEmployees());
    setDepartments(storage.getDepartments());
  };

  useEffect(() => {
    refreshData();
    const unsub = storage.subscribe(refreshData);
    return unsub;
  }, []);

  // Filter records by date range and department
  const filteredRecords = records.filter((r) => {
    const inRange = r.date >= startDate && r.date <= endDate;
    if (!inRange) return false;
    if (selectedDept === 'all') return true;
    const emp = employees.find((e) => e.id === r.employeeId);
    return emp?.departmentId === selectedDept;
  });

  // Calculate Metrics
  const totalEntries = filteredRecords.length;
  const presentCount = filteredRecords.filter((r) => r.status === 'present').length;
  const lateCount = filteredRecords.filter((r) => r.status === 'late').length;
  const halfDayCount = filteredRecords.filter((r) => r.status === 'half_day').length;
  const leaveCount = filteredRecords.filter((r) => r.status === 'on_leave').length;
  const absentCount = filteredRecords.filter((r) => r.status === 'absent').length;

  const totalWorkHours = filteredRecords.reduce((acc, r) => acc + (r.workHours || 0), 0);
  const totalOvertimeHours = filteredRecords.reduce((acc, r) => acc + (r.overtimeHours || 0), 0);
  const avgWorkHoursPerDay = totalEntries > 0 ? (totalWorkHours / totalEntries).toFixed(1) : '0';

  // Render Department Performance Bar Chart
  useEffect(() => {
    if (!deptChartRef.current) return;

    if (deptChartInstance.current) {
      deptChartInstance.current.destroy();
    }

    const ctx = deptChartRef.current.getContext('2d');
    if (!ctx) return;

    const deptLabels = departments.map((d) => d.name);
    const deptAttendanceRates = departments.map((dept) => {
      const deptEmployees = employees.filter((e) => e.departmentId === dept.id);
      const deptRecords = filteredRecords.filter((r) =>
        deptEmployees.some((e) => e.id === r.employeeId)
      );
      if (deptRecords.length === 0) return 90;
      const onTime = deptRecords.filter((r) => r.status === 'present').length;
      return Math.round((onTime / deptRecords.length) * 100);
    });

    deptChartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: deptLabels,
        datasets: [
          {
            label: 'On-Time Attendance %',
            data: deptAttendanceRates,
            backgroundColor: '#3B82F6',
            borderRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            ticks: {
              callback: (val) => `${val}%`,
            },
          },
        },
        plugins: {
          legend: { display: false },
        },
      },
    });

    return () => {
      if (deptChartInstance.current) {
        deptChartInstance.current.destroy();
      }
    };
  }, [departments, employees, filteredRecords]);

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      'Record ID',
      'Date',
      'Employee Code',
      'Employee Name',
      'Department',
      'Check In',
      'Check Out',
      'Work Hours',
      'Overtime Hours',
      'Late Minutes',
      'Method',
      'Status'
    ];

    const rows = filteredRecords.map((r) => {
      const emp = employees.find((e) => e.id === r.employeeId);
      const dept = departments.find((d) => d.id === emp?.departmentId);
      return [
        r.id,
        r.date,
        emp?.employeeId || '',
        `"${emp ? `${emp.firstName} ${emp.lastName}` : ''}"`,
        `"${dept?.name || ''}"`,
        r.checkIn,
        r.checkOut || '',
        r.workHours,
        r.overtimeHours,
        r.lateMinutes,
        r.method,
        r.status
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `workpulse_attendance_report_${startDate}_to_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Browser Print / PDF save (Generates exact corporate statement and triggers browser print dialog)
  const handlePrint = () => {
    generateAndPrintReport({
      startDate,
      endDate,
      departmentId: selectedDept,
      records: filteredRecords
    });
  };

  // Reset Filters / Default Report parameters
  const handleResetFilters = () => {
    const d = new Date();
    d.setDate(d.getDate() - 14);
    setStartDate(d.toISOString().split('T')[0]);
    setEndDate(new Date().toISOString().split('T')[0]);
    setSelectedDept('all');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Attendance Reports & Analytics
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Export comprehensive monthly timecard logs, OT payouts, and punctuality audit summaries.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleResetFilters}
            className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition flex items-center space-x-1.5 cursor-pointer shadow-2xs"
            title="Reset date range and department filters"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Reset Filters</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition flex items-center space-x-2 cursor-pointer shadow-2xs"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition flex items-center space-x-2 cursor-pointer"
            title="Open printable audit statement matching computer print preview"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report (PDF)</span>
          </button>
        </div>
      </div>

      {/* Date Filter & Control Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-slate-500">From:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-700"
            />
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-slate-500">To:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-700"
            />
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-slate-500">Department:</span>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700"
            >
              <option value="all">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Range Presets */}
        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => {
              const d = new Date();
              setStartDate(d.toISOString().split('T')[0]);
              setEndDate(d.toISOString().split('T')[0]);
            }}
            className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
          >
            Today
          </button>
          <button
            onClick={() => {
              const d = new Date();
              d.setDate(d.getDate() - 7);
              setStartDate(d.toISOString().split('T')[0]);
              setEndDate(new Date().toISOString().split('T')[0]);
            }}
            className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
          >
            Last 7 Days
          </button>
          <button
            onClick={() => {
              const d = new Date();
              d.setDate(d.getDate() - 30);
              setStartDate(d.toISOString().split('T')[0]);
              setEndDate(new Date().toISOString().split('T')[0]);
            }}
            className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
          >
            Last 30 Days
          </button>
        </div>
      </div>

      {/* Aggregate KPI Stats in Date Range */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Work Hours</span>
          <p className="text-xl font-black text-slate-900 mt-1 font-mono">{totalWorkHours.toFixed(1)} hrs</p>
          <span className="text-[10px] text-slate-500">Avg {avgWorkHoursPerDay} hrs / shift</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Overtime Logged</span>
          <p className="text-xl font-black text-purple-600 mt-1 font-mono">+{totalOvertimeHours.toFixed(1)} hrs</p>
          <span className="text-[10px] text-slate-500">Payable overtime</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">On-Time Arrival</span>
          <p className="text-xl font-black text-emerald-600 mt-1 font-mono">{presentCount} days</p>
          <span className="text-[10px] text-slate-500">
            {totalEntries > 0 ? ((presentCount / totalEntries) * 100).toFixed(0) : 0}% punctuality
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Late / Half Day</span>
          <p className="text-xl font-black text-amber-600 mt-1 font-mono">{lateCount + halfDayCount} days</p>
          <span className="text-[10px] text-slate-500">{lateCount} late, {halfDayCount} half day</span>
        </div>
      </div>

      {/* Chart: Department Comparison */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-bold text-slate-900">Department Punctuality Index</h3>
          <span className="text-xs text-slate-500">Target benchmark: &gt; 90%</span>
        </div>
        <p className="text-xs text-slate-500 mb-4">Comparison of on-time attendance percentage across departments.</p>
        <div className="h-60">
          <canvas ref={deptChartRef} />
        </div>
      </div>

      {/* Printable / Report Summary Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden print:border-none print:shadow-none">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">Detailed Shift Records</h3>
          <span className="text-xs text-slate-500">{filteredRecords.length} records in selected period</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-2.5 px-4">Date</th>
                <th className="py-2.5 px-4">Employee</th>
                <th className="py-2.5 px-4">Department</th>
                <th className="py-2.5 px-4">In / Out</th>
                <th className="py-2.5 px-4">Work Hours</th>
                <th className="py-2.5 px-4">Overtime</th>
                <th className="py-2.5 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredRecords.slice(0, 20).map((r) => {
                const emp = employees.find((e) => e.id === r.employeeId);
                const dept = departments.find((d) => d.id === emp?.departmentId);

                return (
                  <tr key={r.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-2.5 px-4 font-mono font-medium">{r.date}</td>
                    <td className="py-2.5 px-4 font-semibold text-slate-900">
                      {emp ? `${emp.firstName} ${emp.lastName}` : 'Employee'}
                    </td>
                    <td className="py-2.5 px-4 text-slate-600">{dept?.name || 'General'}</td>
                    <td className="py-2.5 px-4 font-mono text-slate-800">
                      {r.checkIn} &rarr; {r.checkOut || '—'}
                    </td>
                    <td className="py-2.5 px-4 font-mono font-semibold">{r.workHours}h</td>
                    <td className="py-2.5 px-4 font-mono">
                      {r.overtimeHours > 0 ? `+${r.overtimeHours}h` : '0'}
                    </td>
                    <td className="py-2.5 px-4 capitalize font-semibold">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] ${
                          r.status === 'present'
                            ? 'bg-emerald-100 text-emerald-800'
                            : r.status === 'late'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-800'
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
