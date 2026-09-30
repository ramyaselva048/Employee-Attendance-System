import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { AuthScreen } from './components/AuthScreen';
import { AdminDashboard } from './components/AdminDashboard';
import { EmployeeDashboard } from './components/EmployeeDashboard';
import { CheckInTerminal } from './components/CheckInTerminal';
import { AttendanceList } from './components/AttendanceList';
import { EmployeeManagement } from './components/EmployeeManagement';
import { DepartmentManagement } from './components/DepartmentManagement';
import { ShiftManagement } from './components/ShiftManagement';
import { LeaveManagement } from './components/LeaveManagement';
import { HolidayManagement } from './components/HolidayManagement';
import { ReportsAnalytics } from './components/ReportsAnalytics';
import { Employee } from './types';
import { storage } from './services/storage';

export default function App() {
  const [currentUser, setCurrentUser] = useState<Employee | null>(storage.getCurrentUser());
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [pendingLeavesCount, setPendingLeavesCount] = useState<number>(0);

  const refreshState = () => {
    setCurrentUser(storage.getCurrentUser());
    const leaves = storage.getLeaves();
    setPendingLeavesCount(leaves.filter((l) => l.status === 'pending').length);
  };

  useEffect(() => {
    refreshState();
    const unsub = storage.subscribe(refreshState);
    return unsub;
  }, []);

  const handleSelectUser = (user: Employee) => {
    setCurrentUser(user);
    storage.setCurrentUser(user);
  };

  const handleLogout = () => {
    storage.logout();
    setCurrentUser(null);
  };

  // If not logged in, show enterprise Sign In / Sign Up screen
  if (!currentUser) {
    return (
      <AuthScreen
        onAuthSuccess={(user) => {
          setCurrentUser(user);
          setActiveTab('dashboard');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans antialiased text-slate-800">
      {/* Top Navbar */}
      <Navbar
        currentUser={currentUser}
        onSelectUser={handleSelectUser}
        onLogout={handleLogout}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          userRole={currentUser.role}
          pendingLeavesCount={pendingLeavesCount}
          onLogout={handleLogout}
        />

        {/* Dynamic Content View Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'dashboard' && (
              currentUser.role === 'admin' ? (
                <AdminDashboard onNavigateTab={(tab) => setActiveTab(tab)} />
              ) : (
                <EmployeeDashboard currentUser={currentUser} onNavigateTab={(tab) => setActiveTab(tab)} />
              )
            )}

            {activeTab === 'terminal' && (
              <CheckInTerminal
                currentUser={currentUser}
                onRecordUpdated={() => {}}
              />
            )}

            {activeTab === 'attendance' && (
              <AttendanceList
                userRole={currentUser.role}
                currentUserId={currentUser.id}
              />
            )}

            {activeTab === 'employees' && (
              <EmployeeManagement />
            )}

            {activeTab === 'departments' && (
              <DepartmentManagement />
            )}

            {activeTab === 'shifts' && (
              <ShiftManagement />
            )}

            {activeTab === 'leaves' && (
              <LeaveManagement
                userRole={currentUser.role}
                currentUser={currentUser}
              />
            )}

            {activeTab === 'holidays' && (
              <HolidayManagement userRole={currentUser.role} />
            )}

            {activeTab === 'reports' && (
              <ReportsAnalytics />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
