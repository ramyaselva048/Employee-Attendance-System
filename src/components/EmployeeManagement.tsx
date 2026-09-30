import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Search,
  Plus,
  Edit2,
  Trash2,
  X,
  Mail,
  Phone,
  Calendar,
  Building,
  Clock,
  Shield,
  QrCode,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Employee, Department, Shift, Role } from '../types';
import { storage } from '../services/storage';

export const EmployeeManagement: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmp, setEditingEmp] = useState<Partial<Employee> | null>(null);

  // View Profile Modal
  const [viewingEmp, setViewingEmp] = useState<Employee | null>(null);

  const refreshData = () => {
    setEmployees(storage.getEmployees());
    setDepartments(storage.getDepartments());
    setShifts(storage.getShifts());
  };

  useEffect(() => {
    refreshData();
    const unsub = storage.subscribe(refreshData);
    return unsub;
  }, []);

  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const matchSearch =
        searchTerm.trim() === '' ||
        emp.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.designation.toLowerCase().includes(searchTerm.toLowerCase());

      const matchDept = deptFilter === 'all' || emp.departmentId === deptFilter;
      const matchRole = roleFilter === 'all' || emp.role === roleFilter;

      return matchSearch && matchDept && matchRole;
    });
  }, [employees, searchTerm, deptFilter, roleFilter]);

  const openCreateModal = () => {
    setEditingEmp({
      firstName: '',
      lastName: '',
      email: '',
      employeeId: `EMP-${employees.length + 101}`,
      role: 'employee',
      departmentId: departments[0]?.id || '',
      shiftId: shifts[0]?.id || '',
      designation: 'Software Engineer',
      phone: '+1 (555) 000-0000',
      dateOfJoining: new Date().toISOString().split('T')[0],
      status: 'active',
      password: 'password123',
      hourlyRate: 45,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
      annualLeaveBalance: 15,
      sickLeaveBalance: 10,
      casualLeaveBalance: 8,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (emp: Employee) => {
    setEditingEmp({ ...emp });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmp) return;
    if (!editingEmp.firstName || !editingEmp.email) {
      alert('First Name and Email are mandatory.');
      return;
    }

    storage.saveEmployee(editingEmp);
    setIsModalOpen(false);
    setEditingEmp(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to remove this employee from the directory?')) {
      storage.deleteEmployee(id);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Employee Directory & Roster
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage corporate staff profiles, assigned shift schedules, roles, and leave allocations.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition flex items-center space-x-2 cursor-pointer shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Employee</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search employees by name, email, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
          />
        </div>

        <select
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:ring-2 focus:ring-blue-500 cursor-pointer"
        >
          <option value="all">All Departments</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:ring-2 focus:ring-blue-500 cursor-pointer"
        >
          <option value="all">All Roles</option>
          <option value="admin">Administrator / HR</option>
          <option value="employee">Standard Staff</option>
        </select>
      </div>

      {/* Employees Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEmployees.length === 0 ? (
          <div className="col-span-full bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-400 text-xs">
            No employees match your search criteria.
          </div>
        ) : (
          filteredEmployees.map((emp) => {
            const dept = departments.find((d) => d.id === emp.departmentId);
            const shift = shifts.find((s) => s.id === emp.shiftId);

            return (
              <div
                key={emp.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-blue-300 hover:shadow-md transition flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <img
                        src={emp.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'}
                        alt={emp.firstName}
                        className="w-12 h-12 rounded-xl object-cover ring-2 ring-slate-100 shrink-0"
                      />
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm leading-snug">
                          {emp.firstName} {emp.lastName}
                        </h4>
                        <p className="text-[11px] text-slate-500">{emp.designation}</p>
                        <span className="font-mono text-[10px] text-blue-600 font-bold block mt-0.5">
                          {emp.employeeId}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        emp.role === 'admin'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {emp.role}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center space-x-2">
                      <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{dept?.name || 'Engineering'}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate text-slate-700 font-medium">
                        {shift?.name} ({shift?.startTime} - {shift?.endTime})
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate font-mono text-[11px]">{emp.email}</span>
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => setViewingEmp(emp)}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 cursor-pointer"
                  >
                    View Profile &rarr;
                  </button>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => openEditModal(emp)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                      title="Edit Employee"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    {emp.id !== 'emp_admin' && (
                      <button
                        onClick={() => handleDelete(emp.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                        title="Delete Employee"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Employee Modal */}
      {isModalOpen && editingEmp && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingEmp.id ? 'Edit Employee Details' : 'Add New Staff Member'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    value={editingEmp.firstName || ''}
                    onChange={(e) => setEditingEmp({ ...editingEmp, firstName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={editingEmp.lastName || ''}
                    onChange={(e) => setEditingEmp({ ...editingEmp, lastName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Corporate Email *</label>
                  <input
                    type="email"
                    required
                    value={editingEmp.email || ''}
                    onChange={(e) => setEditingEmp({ ...editingEmp, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Employee Code</label>
                  <input
                    type="text"
                    value={editingEmp.employeeId || ''}
                    onChange={(e) => setEditingEmp({ ...editingEmp, employeeId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Department</label>
                  <select
                    value={editingEmp.departmentId}
                    onChange={(e) => setEditingEmp({ ...editingEmp, departmentId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Shift Schedule</label>
                  <select
                    value={editingEmp.shiftId}
                    onChange={(e) => setEditingEmp({ ...editingEmp, shiftId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    {shifts.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.startTime} - {s.endTime})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Role / Permissions</label>
                  <select
                    value={editingEmp.role || 'employee'}
                    onChange={(e) => setEditingEmp({ ...editingEmp, role: e.target.value as Role })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="employee">Standard Staff (Employee)</option>
                    <option value="admin">Administrator / HR Director</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Login Password *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. employeePass123"
                    value={editingEmp.password || ''}
                    onChange={(e) => setEditingEmp({ ...editingEmp, password: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                  <span className="text-[10px] text-slate-400">Credentials for employee sign in</span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Designation</label>
                <input
                  type="text"
                  value={editingEmp.designation || ''}
                  onChange={(e) => setEditingEmp({ ...editingEmp, designation: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Casual Leave</label>
                  <input
                    type="number"
                    value={editingEmp.casualLeaveBalance ?? 8}
                    onChange={(e) =>
                      setEditingEmp({ ...editingEmp, casualLeaveBalance: parseInt(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Sick Leave</label>
                  <input
                    type="number"
                    value={editingEmp.sickLeaveBalance ?? 10}
                    onChange={(e) =>
                      setEditingEmp({ ...editingEmp, sickLeaveBalance: parseInt(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Annual Leave</label>
                  <input
                    type="number"
                    value={editingEmp.annualLeaveBalance ?? 15}
                    onChange={(e) =>
                      setEditingEmp({ ...editingEmp, annualLeaveBalance: parseInt(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
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
                  Save Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Profile Drawer / Modal */}
      {viewingEmp && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Staff Profile</span>
              <button
                onClick={() => setViewingEmp(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 flex items-center space-x-4">
              <img
                src={viewingEmp.avatarUrl}
                alt=""
                className="w-16 h-16 rounded-2xl object-cover ring-2 ring-blue-100"
              />
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {viewingEmp.firstName} {viewingEmp.lastName}
                </h3>
                <p className="text-xs text-slate-500">{viewingEmp.designation}</p>
                <span className="text-xs font-mono font-bold text-blue-600">{viewingEmp.employeeId}</span>
              </div>
            </div>

            <div className="mt-5 space-y-2.5 text-xs text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="flex justify-between">
                <span className="text-slate-400">Email:</span>
                <span className="font-mono font-medium text-slate-800">{viewingEmp.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Department:</span>
                <span className="font-semibold text-slate-800">
                  {departments.find((d) => d.id === viewingEmp.departmentId)?.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Shift Schedule:</span>
                <span className="font-semibold text-slate-800">
                  {shifts.find((s) => s.id === viewingEmp.shiftId)?.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">QR Badge Token:</span>
                <span className="font-mono text-emerald-600 font-bold">{viewingEmp.qrCodeToken}</span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl">
                <span className="text-[10px] text-blue-500 font-bold block">Casual Leave</span>
                <span className="text-base font-extrabold text-blue-900">{viewingEmp.casualLeaveBalance}d</span>
              </div>
              <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
                <span className="text-[10px] text-emerald-500 font-bold block">Sick Leave</span>
                <span className="text-base font-extrabold text-emerald-900">{viewingEmp.sickLeaveBalance}d</span>
              </div>
              <div className="p-3 bg-purple-50 border border-purple-100 rounded-xl">
                <span className="text-[10px] text-purple-500 font-bold block">Annual Leave</span>
                <span className="text-base font-extrabold text-purple-900">{viewingEmp.annualLeaveBalance}d</span>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 text-right">
              <button
                onClick={() => setViewingEmp(null)}
                className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-semibold hover:bg-slate-900"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
