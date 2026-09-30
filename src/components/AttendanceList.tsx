import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Filter,
  Download,
  Calendar,
  Edit2,
  Trash2,
  Plus,
  X,
  CheckCircle2,
  Clock,
  MapPin,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  Printer
} from 'lucide-react';
import { AttendanceRecord, Employee, Department, Shift, AttendanceStatus, AttendanceMethod, Role } from '../types';
import { storage } from '../services/storage';
import { generateAndPrintReport } from '../utils/printReport';

interface AttendanceListProps {
  userRole: Role;
  currentUserId: string;
}

export const AttendanceList: React.FC<AttendanceListProps> = ({ userRole, currentUserId }) => {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deptFilter, setDeptFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>(''); // e.g. "YYYY-MM" or "YYYY-MM-DD"

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Manual Edit / Create Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Partial<AttendanceRecord> | null>(null);

  const refreshData = () => {
    setRecords(storage.getAttendanceRecords());
    setEmployees(storage.getEmployees());
    setDepartments(storage.getDepartments());
    setShifts(storage.getShifts());
  };

  useEffect(() => {
    refreshData();
    const unsub = storage.subscribe(refreshData);
    return unsub;
  }, []);

  // Filter records
  const filteredRecords = useMemo(() => {
    let list = records;

    // If regular employee, only show their own records
    if (userRole === 'employee') {
      list = list.filter((r) => r.employeeId === currentUserId);
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter((r) => {
        const emp = employees.find((e) => e.id === r.employeeId);
        return (
          emp?.firstName.toLowerCase().includes(q) ||
          emp?.lastName.toLowerCase().includes(q) ||
          emp?.employeeId.toLowerCase().includes(q) ||
          r.date.includes(q)
        );
      });
    }

    if (statusFilter !== 'all') {
      list = list.filter((r) => r.status === statusFilter);
    }

    if (deptFilter !== 'all') {
      list = list.filter((r) => {
        const emp = employees.find((e) => e.id === r.employeeId);
        return emp?.departmentId === deptFilter;
      });
    }

    if (dateFilter) {
      list = list.filter((r) => r.date.startsWith(dateFilter));
    }

    return list;
  }, [records, employees, userRole, currentUserId, searchTerm, statusFilter, deptFilter, dateFilter]);

  // Paginated records
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage) || 1;
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredRecords.slice(start, start + itemsPerPage);
  }, [filteredRecords, currentPage]);

  // Export to Real CSV file
  const handleExportCSV = () => {
    const headers = ['Date', 'Employee ID', 'Name', 'Department', 'Check In', 'Check Out', 'Work Hours', 'Overtime Hours', 'Status', 'Method'];
    const rows = filteredRecords.map((r) => {
      const emp = employees.find((e) => e.id === r.employeeId);
      const dept = departments.find((d) => d.id === emp?.departmentId);
      return [
        r.date,
        emp?.employeeId || '',
        `"${emp ? `${emp.firstName} ${emp.lastName}` : ''}"`,
        `"${dept?.name || ''}"`,
        r.checkIn,
        r.checkOut || '',
        r.workHours,
        r.overtimeHours,
        r.status,
        r.method
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `workpulse_attendance_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Open Edit Modal
  const openEditModal = (rec?: AttendanceRecord) => {
    if (rec) {
      setEditingRecord({ ...rec });
    } else {
      setEditingRecord({
        id: `att_${Date.now()}`,
        employeeId: employees[0]?.id || '',
        date: new Date().toISOString().split('T')[0],
        checkIn: '09:00',
        checkOut: '17:30',
        workHours: 8.5,
        overtimeHours: 0.5,
        lateMinutes: 0,
        status: 'present',
        method: 'web',
      });
    }
    setIsModalOpen(true);
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord || !editingRecord.employeeId) return;

    storage.saveAttendanceRecord(editingRecord as AttendanceRecord);
    setIsModalOpen(false);
    setEditingRecord(null);
  };

  const handleDeleteRecord = (id: string) => {
    if (confirm('Delete this attendance record entry?')) {
      storage.deleteAttendanceRecord(id);
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {userRole === 'admin' ? 'Master Attendance Logs' : 'My Attendance Logs'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Complete audit trail with check-in, check-out, geolocation distance, and verification methods.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {userRole === 'admin' && (
            <button
              onClick={() => openEditModal()}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition flex items-center space-x-2 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Manual Entry</span>
            </button>
          )}

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition flex items-center space-x-2 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => generateAndPrintReport({ records: filteredRecords })}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 transition flex items-center space-x-1.5 cursor-pointer shadow-2xs"
            title="Print attendance logs in official audit statement format"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Print Logs</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by employee name or ID..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center space-x-2">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="present">Present (On Time)</option>
            <option value="late">Late Arrival</option>
            <option value="half_day">Half Day</option>
            <option value="on_leave">On Leave</option>
            <option value="absent">Absent</option>
          </select>
        </div>

        {/* Department Filter (Admin only) */}
        {userRole === 'admin' && (
          <div className="flex items-center space-x-2">
            <select
              value={deptFilter}
              onChange={(e) => {
                setDeptFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition cursor-pointer"
            >
              <option value="all">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Date Filter */}
        <div className="flex items-center space-x-2">
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => {
              setDateFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition cursor-pointer"
          />
          {dateFilter && (
            <button
              onClick={() => setDateFilter('')}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              title="Clear date filter"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Check In</th>
                <th className="py-3 px-4">Check Out</th>
                <th className="py-3 px-4">Work Hours</th>
                <th className="py-3 px-4">Overtime</th>
                <th className="py-3 px-4">Method / Telemetry</th>
                <th className="py-3 px-4">Status</th>
                {userRole === 'admin' && <th className="py-3 px-4 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {paginatedRecords.length === 0 ? (
                <tr>
                  <td colSpan={userRole === 'admin' ? 10 : 9} className="py-12 text-center text-slate-400">
                    No attendance records match your active filters.
                  </td>
                </tr>
              ) : (
                paginatedRecords.map((r) => {
                  const emp = employees.find((e) => e.id === r.employeeId);
                  const dept = departments.find((d) => d.id === emp?.departmentId);

                  return (
                    <tr key={r.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-900 whitespace-nowrap">
                        {r.date}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-2.5">
                          <img
                            src={emp?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                            alt=""
                            className="w-7 h-7 rounded-full object-cover shrink-0"
                          />
                          <div>
                            <p className="font-bold text-slate-900 leading-tight">
                              {emp ? `${emp.firstName} ${emp.lastName}` : 'Unknown'}
                            </p>
                            <span className="text-[10px] text-slate-400 font-mono">{emp?.employeeId}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-600 font-medium">
                        {dept?.name || 'General'}
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                        {r.checkIn}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-slate-600">
                        {r.checkOut || '—'}
                      </td>

                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-900">
                        {r.workHours > 0 ? `${r.workHours} hrs` : '—'}
                      </td>

                      <td className="py-3.5 px-4 font-mono">
                        {r.overtimeHours > 0 ? (
                          <span className="text-purple-600 font-bold">+{r.overtimeHours} hrs</span>
                        ) : (
                          <span className="text-slate-400">0.0</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-1.5">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 capitalize">
                            {r.method.replace('_', ' ')}
                          </span>
                          {r.location?.distanceMeters !== undefined && (
                            <span className="text-[10px] text-slate-400 font-mono">
                              ({r.location.distanceMeters}m)
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold capitalize ${
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

                      {userRole === 'admin' && (
                        <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                          <button
                            onClick={() => openEditModal(r)}
                            className="p-1 text-slate-400 hover:text-blue-600 rounded-md hover:bg-slate-100 transition cursor-pointer"
                            title="Edit Record"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteRecord(r.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded-md hover:bg-slate-100 transition cursor-pointer"
                            title="Delete Record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
            {Math.min(currentPage * itemsPerPage, filteredRecords.length)} of {filteredRecords.length} records
          </span>

          <div className="flex items-center space-x-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-semibold text-slate-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Manual Record Add / Edit Modal */}
      {isModalOpen && editingRecord && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingRecord.id?.startsWith('att_') && records.some((r) => r.id === editingRecord.id)
                  ? 'Adjust Attendance Entry'
                  : 'Manual Punch / Entry'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Employee</label>
                <select
                  value={editingRecord.employeeId}
                  onChange={(e) => setEditingRecord({ ...editingRecord, employeeId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                  required
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName} ({emp.employeeId})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={editingRecord.date || ''}
                    onChange={(e) => setEditingRecord({ ...editingRecord, date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={editingRecord.status || 'present'}
                    onChange={(e) =>
                      setEditingRecord({ ...editingRecord, status: e.target.value as AttendanceStatus })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="present">Present (On Time)</option>
                    <option value="late">Late</option>
                    <option value="half_day">Half Day</option>
                    <option value="on_leave">On Leave</option>
                    <option value="absent">Absent</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Check In Time</label>
                  <input
                    type="time"
                    value={editingRecord.checkIn || '09:00'}
                    onChange={(e) => setEditingRecord({ ...editingRecord, checkIn: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Check Out Time</label>
                  <input
                    type="time"
                    value={editingRecord.checkOut || '17:30'}
                    onChange={(e) => setEditingRecord({ ...editingRecord, checkOut: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Total Work Hours</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editingRecord.workHours ?? 8.5}
                    onChange={(e) =>
                      setEditingRecord({ ...editingRecord, workHours: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Overtime Hours</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editingRecord.overtimeHours ?? 0}
                    onChange={(e) =>
                      setEditingRecord({ ...editingRecord, overtimeHours: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Verification Method</label>
                <select
                  value={editingRecord.method || 'web'}
                  onChange={(e) =>
                    setEditingRecord({ ...editingRecord, method: e.target.value as AttendanceMethod })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="web">Web Portal (Manual Audit)</option>
                  <option value="geofence">GPS Geofence Perimeter</option>
                  <option value="qr_code">Dynamic QR Code Scanner</option>
                  <option value="face_recognition">AI Face Recognition</option>
                  <option value="biometric">Fingerprint Hardware Sensor</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-xs cursor-pointer"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
