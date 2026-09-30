import React, { useState, useEffect } from 'react';
import { Clock, Plus, Edit2, Trash2, X, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Shift, Employee } from '../types';
import { storage } from '../services/storage';

export const ShiftManagement: React.FC = () => {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingShift, setEditingShift] = useState<Partial<Shift> | null>(null);

  const refreshData = () => {
    setShifts(storage.getShifts());
    setEmployees(storage.getEmployees());
  };

  useEffect(() => {
    refreshData();
    const unsub = storage.subscribe(refreshData);
    return unsub;
  }, []);

  const openCreateModal = () => {
    setEditingShift({
      name: '',
      startTime: '09:00',
      endTime: '17:30',
      gracePeriodMinutes: 15,
      halfDayHours: 4,
      fullDayHours: 8,
      color: '#3B82F6',
      description: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (shift: Shift) => {
    setEditingShift({ ...shift });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingShift || !editingShift.name) return;

    storage.saveShift(editingShift);
    setIsModalOpen(false);
    setEditingShift(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this shift profile?')) {
      storage.deleteShift(id);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Shift Schedules & Policies
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure shift timings, arrival grace period tolerances, and half-day thresholds.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition flex items-center space-x-2 cursor-pointer shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>New Shift Profile</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {shifts.map((shift) => {
          const assignedCount = employees.filter((e) => e.shiftId === shift.id).length;

          return (
            <div
              key={shift.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-blue-300 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: shift.color }}
                    >
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{shift.name}</h3>
                      <p className="text-xs font-mono font-semibold text-slate-700 mt-0.5">
                        {shift.startTime} &mdash; {shift.endTime}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => openEditModal(shift)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100 transition"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {shifts.length > 1 && (
                      <button
                        onClick={() => handleDelete(shift.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                  {shift.description || 'Standard corporate operational working hours.'}
                </p>

                {/* Metrics */}
                <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Grace Limit</span>
                    <span className="font-bold text-emerald-600">+{shift.gracePeriodMinutes} mins</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Half-Day</span>
                    <span className="font-bold text-amber-600">&lt; {shift.halfDayHours} hrs</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Full Shift</span>
                    <span className="font-bold text-blue-600">{shift.fullDayHours} hrs</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>
                  Assigned Staff: <strong className="text-slate-800">{assignedCount} employees</strong>
                </span>
                <span className="inline-flex items-center space-x-1 text-emerald-600 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Active Roster</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {isModalOpen && editingShift && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingShift.id ? 'Edit Shift Policy' : 'Create New Shift'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Shift Name *</label>
                <input
                  type="text"
                  required
                  value={editingShift.name || ''}
                  onChange={(e) => setEditingShift({ ...editingShift, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  placeholder="e.g. Night Support Shift"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Start Time *</label>
                  <input
                    type="time"
                    required
                    value={editingShift.startTime || '09:00'}
                    onChange={(e) => setEditingShift({ ...editingShift, startTime: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">End Time *</label>
                  <input
                    type="time"
                    required
                    value={editingShift.endTime || '17:30'}
                    onChange={(e) => setEditingShift({ ...editingShift, endTime: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Grace (mins)</label>
                  <input
                    type="number"
                    value={editingShift.gracePeriodMinutes ?? 15}
                    onChange={(e) =>
                      setEditingShift({ ...editingShift, gracePeriodMinutes: parseInt(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Half-Day (hrs)</label>
                  <input
                    type="number"
                    value={editingShift.halfDayHours ?? 4}
                    onChange={(e) =>
                      setEditingShift({ ...editingShift, halfDayHours: parseInt(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Full-Day (hrs)</label>
                  <input
                    type="number"
                    value={editingShift.fullDayHours ?? 8}
                    onChange={(e) =>
                      setEditingShift({ ...editingShift, fullDayHours: parseInt(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={editingShift.description || ''}
                  onChange={(e) => setEditingShift({ ...editingShift, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  placeholder="Notes about break policies and departments using this shift"
                />
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
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold cursor-pointer"
                >
                  Save Shift
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
