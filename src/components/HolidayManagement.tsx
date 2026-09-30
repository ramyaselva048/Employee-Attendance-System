import React, { useState, useEffect } from 'react';
import { CalendarDays, Plus, Trash2, X, Sparkles, Calendar } from 'lucide-react';
import { Holiday, Role } from '../types';
import { storage } from '../services/storage';

interface HolidayManagementProps {
  userRole: Role;
}

export const HolidayManagement: React.FC<HolidayManagementProps> = ({ userRole }) => {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState<Partial<Holiday> | null>(null);

  const refreshData = () => {
    setHolidays(storage.getHolidays());
  };

  useEffect(() => {
    refreshData();
    const unsub = storage.subscribe(refreshData);
    return unsub;
  }, []);

  const openCreateModal = () => {
    setEditingHoliday({
      title: '',
      date: new Date().toISOString().split('T')[0],
      type: 'company',
      isRecurring: true,
      description: '',
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingHoliday || !editingHoliday.title) return;

    storage.saveHoliday(editingHoliday);
    setIsModalOpen(false);
    setEditingHoliday(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this holiday from the corporate calendar?')) {
      storage.deleteHoliday(id);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Corporate Holiday Calendar
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Official company observances, national holidays, and designated non-working days.
          </p>
        </div>

        {userRole === 'admin' && (
          <button
            onClick={openCreateModal}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition flex items-center space-x-2 cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Holiday</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {holidays.map((h) => {
          const holidayDate = new Date(h.date);
          const monthName = holidayDate.toLocaleDateString('en-US', { month: 'short' });
          const dayNum = holidayDate.getDate() + 1; // display date
          const weekday = holidayDate.toLocaleDateString('en-US', { weekday: 'long' });

          return (
            <div
              key={h.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-blue-300 transition flex items-start space-x-4"
            >
              {/* Date Block */}
              <div className="w-14 h-16 rounded-xl bg-blue-50 border border-blue-100 flex flex-col items-center justify-center shrink-0">
                <span className="text-[10px] uppercase font-bold text-blue-600">{monthName}</span>
                <span className="text-xl font-black text-slate-900 leading-none mt-0.5">{dayNum}</span>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <h3 className="font-bold text-slate-900 text-sm truncate">{h.title}</h3>
                  {userRole === 'admin' && (
                    <button
                      onClick={() => handleDelete(h.id)}
                      className="p-1 text-slate-300 hover:text-rose-600 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-[10px] font-semibold text-slate-400 font-mono">{h.date}</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 capitalize">
                    {h.type}
                  </span>
                </div>

                <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                  {h.description || 'Official company paid holiday.'}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {isModalOpen && editingHoliday && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Add Holiday Entry</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Holiday Title *</label>
                <input
                  type="text"
                  required
                  value={editingHoliday.title || ''}
                  onChange={(e) => setEditingHoliday({ ...editingHoliday, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  placeholder="e.g. Labor Day"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={editingHoliday.date || ''}
                    onChange={(e) => setEditingHoliday({ ...editingHoliday, date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={editingHoliday.type || 'company'}
                    onChange={(e) =>
                      setEditingHoliday({
                        ...editingHoliday,
                        type: e.target.value as Holiday['type'],
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="national">National Holiday</option>
                    <option value="company">Company Special</option>
                    <option value="festival">Festival Observance</option>
                    <option value="optional">Optional / Floating</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={editingHoliday.description || ''}
                  onChange={(e) => setEditingHoliday({ ...editingHoliday, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  placeholder="Short note about the holiday celebration"
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
                  Save Holiday
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
