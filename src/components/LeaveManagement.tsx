import React, { useState, useEffect, useMemo } from 'react';
import {
  CalendarCheck2,
  Plus,
  Check,
  X,
  Clock,
  AlertCircle,
  CheckCircle2,
  Calendar,
  FileText,
  User
} from 'lucide-react';
import { LeaveRequest, Employee, Role, LeaveType, LeaveStatus } from '../types';
import { storage } from '../services/storage';

interface LeaveManagementProps {
  userRole: Role;
  currentUser: Employee;
}

export const LeaveManagement: React.FC<LeaveManagementProps> = ({ userRole, currentUser }) => {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Apply Modal
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [newLeaveType, setNewLeaveType] = useState<LeaveType>('casual');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');

  // Review Modal (Admin)
  const [reviewingLeave, setReviewingLeave] = useState<LeaveRequest | null>(null);
  const [reviewComment, setReviewComment] = useState('');

  const refreshData = () => {
    setLeaves(storage.getLeaves());
    setEmployees(storage.getEmployees());
  };

  useEffect(() => {
    refreshData();
    const unsub = storage.subscribe(refreshData);
    return unsub;
  }, []);

  const filteredLeaves = useMemo(() => {
    let list = leaves;
    if (userRole === 'employee') {
      list = list.filter((l) => l.employeeId === currentUser.id);
    }
    if (statusFilter !== 'all') {
      list = list.filter((l) => l.status === statusFilter);
    }
    return list;
  }, [leaves, userRole, currentUser.id, statusFilter]);

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate || !reason.trim()) {
      alert('Please fill out all required fields.');
      return;
    }

    storage.applyLeave(currentUser.id, newLeaveType, startDate, endDate, reason);
    setIsApplyModalOpen(false);
    setReason('');
    setStartDate('');
    setEndDate('');
  };

  const handleReviewAction = (action: 'approved' | 'rejected') => {
    if (!reviewingLeave) return;
    storage.reviewLeave(reviewingLeave.id, action, reviewComment);
    setReviewingLeave(null);
    setReviewComment('');
  };

  const pendingCount = leaves.filter((l) => l.status === 'pending').length;

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Leave & Time-Off Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Review staff vacation, medical leave, and personal absence requests with balance audit.
          </p>
        </div>

        <button
          onClick={() => setIsApplyModalOpen(true)}
          className="px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition flex items-center space-x-2 cursor-pointer shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Apply for Leave</span>
        </button>
      </div>

      {/* Balance Summary (Employee View or HR Quick Stats) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Casual Leaves</span>
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900">{currentUser.casualLeaveBalance}</span>
            <span className="text-xs text-slate-500">days available</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Short notice personal leaves</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sick Leaves</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900">{currentUser.sickLeaveBalance}</span>
            <span className="text-xs text-slate-500">days available</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Medical recovery & doctor checkups</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Annual Vacation</span>
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900">{currentUser.annualLeaveBalance}</span>
            <span className="text-xs text-slate-500">days available</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Paid corporate annual entitlement</p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-slate-700">Filter By Status:</span>
          <div className="flex items-center space-x-1.5">
            {(['all', 'pending', 'approved', 'rejected'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition cursor-pointer ${
                  statusFilter === st
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st}
                {st === 'pending' && pendingCount > 0 && userRole === 'admin' && (
                  <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 text-[10px]">
                    {pendingCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Date Range</th>
                <th className="py-3 px-4">Total Days</th>
                <th className="py-3 px-4">Reason</th>
                <th className="py-3 px-4">Applied On</th>
                <th className="py-3 px-4">Status</th>
                {userRole === 'admin' && <th className="py-3 px-4 text-right">Review Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredLeaves.length === 0 ? (
                <tr>
                  <td colSpan={userRole === 'admin' ? 8 : 7} className="py-10 text-center text-slate-400">
                    No leave requests found for this filter.
                  </td>
                </tr>
              ) : (
                filteredLeaves.map((l) => {
                  const emp = employees.find((e) => e.id === l.employeeId);

                  return (
                    <tr key={l.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2.5">
                          <img
                            src={emp?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                            alt=""
                            className="w-7 h-7 rounded-full object-cover shrink-0"
                          />
                          <div>
                            <p className="font-bold text-slate-900">{emp ? `${emp.firstName} ${emp.lastName}` : 'Staff'}</p>
                            <span className="text-[10px] text-slate-400 font-mono">{emp?.employeeId}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="capitalize font-semibold text-slate-800 px-2 py-0.5 rounded bg-slate-100">
                          {l.leaveType}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono font-medium text-slate-800 whitespace-nowrap">
                        {l.startDate} &rarr; {l.endDate}
                      </td>

                      <td className="py-3 px-4 font-bold text-slate-900">
                        {l.totalDays} day(s)
                      </td>

                      <td className="py-3 px-4 max-w-xs">
                        <p className="line-clamp-2 text-slate-600 leading-snug">{l.reason}</p>
                        {l.reviewComment && (
                          <span className="text-[10px] text-blue-600 font-medium block mt-0.5">
                            Note: {l.reviewComment}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 font-mono text-slate-500 whitespace-nowrap">
                        {l.appliedOn}
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold capitalize ${
                            l.status === 'approved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : l.status === 'rejected'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {l.status}
                        </span>
                      </td>

                      {userRole === 'admin' && (
                        <td className="py-3 px-4 text-right">
                          {l.status === 'pending' ? (
                            <button
                              onClick={() => {
                                setReviewingLeave(l);
                                setReviewComment('');
                              }}
                              className="px-2.5 py-1 text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-lg cursor-pointer"
                            >
                              Review &rarr;
                            </button>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-mono">
                              By {l.reviewedBy || 'Admin'}
                            </span>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Apply Leave Modal */}
      {isApplyModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Submit Leave Application</h3>
              <button
                onClick={() => setIsApplyModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleApply} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Leave Category</label>
                <select
                  value={newLeaveType}
                  onChange={(e) => setNewLeaveType(e.target.value as LeaveType)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="casual">Casual Leave (Short duration)</option>
                  <option value="sick">Sick / Medical Leave</option>
                  <option value="annual">Annual Paid Vacation</option>
                  <option value="unpaid">Unpaid Leave</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">End Date *</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Reason for Leave *</label>
                <textarea
                  rows={3}
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  placeholder="Explain reason for absence and team handover status..."
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsApplyModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold cursor-pointer"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review Modal (Admin) */}
      {reviewingLeave && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Review Leave Request</h3>
              <button
                onClick={() => setReviewingLeave(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Applicant:</span>
                  <span className="font-bold text-slate-900">
                    {employees.find((e) => e.id === reviewingLeave.employeeId)?.firstName}{' '}
                    {employees.find((e) => e.id === reviewingLeave.employeeId)?.lastName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Category:</span>
                  <span className="font-semibold capitalize text-blue-600">{reviewingLeave.leaveType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Period:</span>
                  <span className="font-mono text-slate-800">
                    {reviewingLeave.startDate} to {reviewingLeave.endDate} ({reviewingLeave.totalDays} days)
                  </span>
                </div>
                <div className="pt-1 text-slate-700">
                  <span className="text-slate-400 block mb-0.5">Reason:</span>
                  <p className="italic bg-white p-2 rounded border border-slate-200">{reviewingLeave.reason}</p>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">HR Review Remarks</label>
                <input
                  type="text"
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                  placeholder="Optional review message to employee"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => handleReviewAction('rejected')}
                  className="px-4 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-xl font-bold cursor-pointer"
                >
                  Reject Request
                </button>
                <button
                  type="button"
                  onClick={() => handleReviewAction('approved')}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold cursor-pointer"
                >
                  Approve & Deduct Balance
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
