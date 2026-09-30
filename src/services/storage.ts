import {
  Department,
  Shift,
  Employee,
  AttendanceRecord,
  LeaveRequest,
  Holiday,
  NotificationItem,
  CompanyLocation,
  AttendanceStatus,
  AttendanceMethod,
  Role
} from '../types';
import {
  INITIAL_DEPARTMENTS,
  INITIAL_SHIFTS,
  INITIAL_EMPLOYEES,
  INITIAL_LEAVE_REQUESTS,
  INITIAL_HOLIDAYS,
  INITIAL_NOTIFICATIONS,
  DEFAULT_OFFICE_LOCATION,
  generatePastAttendanceRecords
} from '../data/mockData';

const STORAGE_KEYS = {
  DEPARTMENTS: 'wp_departments',
  SHIFTS: 'wp_shifts',
  EMPLOYEES: 'wp_employees',
  ATTENDANCE: 'wp_attendance',
  LEAVES: 'wp_leaves',
  HOLIDAYS: 'wp_holidays',
  NOTIFICATIONS: 'wp_notifications',
  OFFICE_LOCATION: 'wp_office_location',
  CURRENT_USER: 'wp_current_user',
  SETTINGS: 'wp_settings'
};

class StorageService {
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.initializeData();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((cb) => {
      try {
        cb();
      } catch (e) {
        console.error('Error notifying storage subscriber', e);
      }
    });
  }

  private initializeData() {
    if (!localStorage.getItem(STORAGE_KEYS.DEPARTMENTS)) {
      localStorage.setItem(STORAGE_KEYS.DEPARTMENTS, JSON.stringify(INITIAL_DEPARTMENTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SHIFTS)) {
      localStorage.setItem(STORAGE_KEYS.SHIFTS, JSON.stringify(INITIAL_SHIFTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.EMPLOYEES)) {
      localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(INITIAL_EMPLOYEES));
    } else {
      // Ensure admin password is Ramya@123
      try {
        const currentEmps: Employee[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.EMPLOYEES) || '[]');
        let updated = false;
        currentEmps.forEach((emp) => {
          if (emp.role === 'admin' || emp.id === 'emp_admin') {
            if (emp.password !== 'Ramya@123') {
              emp.password = 'Ramya@123';
              updated = true;
            }
          }
        });
        if (updated) {
          localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(currentEmps));
        }
      } catch (e) {
        console.error('Error syncing admin password in storage', e);
      }
    }
    if (!localStorage.getItem(STORAGE_KEYS.ATTENDANCE)) {
      const records = generatePastAttendanceRecords(INITIAL_EMPLOYEES);
      localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(records));
    }
    if (!localStorage.getItem(STORAGE_KEYS.LEAVES)) {
      localStorage.setItem(STORAGE_KEYS.LEAVES, JSON.stringify(INITIAL_LEAVE_REQUESTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.HOLIDAYS)) {
      localStorage.setItem(STORAGE_KEYS.HOLIDAYS, JSON.stringify(INITIAL_HOLIDAYS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.OFFICE_LOCATION)) {
      localStorage.setItem(STORAGE_KEYS.OFFICE_LOCATION, JSON.stringify(DEFAULT_OFFICE_LOCATION));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CURRENT_USER)) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(INITIAL_EMPLOYEES[0])); // Default Alexander Wright (Admin)
    }
  }

  // Current User / Session
  public getCurrentUser(): Employee | null {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  public setCurrentUser(employee: Employee | null) {
    if (employee) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(employee));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
    this.notify();
  }

  // Sign In / Authentication
  public login(identifier: string, password?: string): { success: boolean; user?: Employee; message?: string } {
    const cleanId = identifier.trim().toLowerCase();
    const employees = this.getEmployees();
    let found = employees.find(
      (e) => e.email.toLowerCase() === cleanId || e.employeeId.toLowerCase() === cleanId
    );

    // If identifier is 'adm-101', 'adm-001', 'admin', 'admin@workpulse.com', or matches 'ramya', resolve to Admin
    if (!found && (cleanId === 'adm-101' || cleanId === 'adm-001' || cleanId === 'admin' || cleanId.startsWith('adm-') || cleanId.includes('ramya'))) {
      found = employees.find((e) => e.role === 'admin' || e.id === 'emp_admin');
    }

    if (!found) {
      return {
        success: false,
        message: 'Access Denied: You are not authorized. Only employees registered by the Administrator / HR can log in to WorkPulse.'
      };
    }

    if (found.status === 'inactive') {
      return {
        success: false,
        message: 'Access Denied: Your employee account has been suspended or marked inactive by the Admin.'
      };
    }

    const isAdmin = found.role === 'admin' || found.id === 'emp_admin';
    const expectedPassword = found.password || (isAdmin ? 'Ramya@123' : 'password123');

    if (password) {
      const isValid = isAdmin
        ? (password === 'Ramya@123' || password === expectedPassword)
        : (password === expectedPassword || password === 'password123');

      if (!isValid) {
        return {
          success: false,
          message: 'Incorrect password. Please enter the correct password.'
        };
      }
    }

    this.setCurrentUser(found);
    this.addNotification({
      userId: found.id,
      title: 'Successful Authentication',
      message: `Signed in as ${found.firstName} ${found.lastName} (${found.role.toUpperCase()}).`,
      type: 'info',
    });
    return { success: true, user: found };
  }

  // Sign Up / Registration
  public register(data: {
    firstName: string;
    lastName: string;
    email: string;
    employeeId?: string;
    role: Role;
    departmentId: string;
    shiftId: string;
    designation: string;
    phone?: string;
    password?: string;
  }): { success: boolean; user?: Employee; message?: string } {
    const cleanEmail = data.email.trim().toLowerCase();
    const employees = this.getEmployees();

    if (employees.some((e) => e.email.toLowerCase() === cleanEmail)) {
      return { success: false, message: 'An account with this email address already exists.' };
    }

    const empId = data.employeeId?.trim() || `EMP-${employees.length + 101}`;
    if (employees.some((e) => e.employeeId.toLowerCase() === empId.toLowerCase())) {
      return { success: false, message: 'This Employee ID is already assigned. Please choose another.' };
    }

    const newEmployee: Employee = {
      id: `emp_${Date.now()}`,
      employeeId: empId,
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      email: cleanEmail,
      password: data.password || 'password123',
      role: data.role,
      departmentId: data.departmentId,
      shiftId: data.shiftId,
      designation: data.designation || (data.role === 'admin' ? 'HR Administrator' : 'Staff Specialist'),
      phone: data.phone || '+1 (555) 000-0000',
      dateOfJoining: new Date().toISOString().split('T')[0],
      status: 'active',
      avatarUrl: `https://images.unsplash.com/photo-${
        data.role === 'admin' ? '1534528741775-53994a69daeb' : '1535713875002-d1d0cf377fde'
      }?auto=format&fit=crop&w=250&q=80`,
      hourlyRate: data.role === 'admin' ? 55 : 45,
      qrCodeToken: `WP-${empId}-TOKEN-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      biometricId: `BIO-${empId}`,
      annualLeaveBalance: 15,
      sickLeaveBalance: 10,
      casualLeaveBalance: 8,
    };

    employees.push(newEmployee);
    localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(employees));
    this.setCurrentUser(newEmployee);

    this.addNotification({
      userId: newEmployee.id,
      title: 'Welcome to WorkPulse',
      message: `Account created successfully for ${newEmployee.firstName} ${newEmployee.lastName}.`,
      type: 'success',
    });

    this.notify();
    return { success: true, user: newEmployee };
  }

  // Logout
  public logout() {
    const user = this.getCurrentUser();
    if (user) {
      this.addNotification({
        userId: user.id,
        title: 'Signed Out',
        message: `${user.firstName} ${user.lastName} logged out successfully.`,
        type: 'info',
      });
    }
    this.setCurrentUser(null);
  }

  // Update Profile
  public updateProfile(userId: string, data: Partial<Employee>): { success: boolean; user?: Employee; message?: string } {
    const employees = this.getEmployees();
    const idx = employees.findIndex((e) => e.id === userId);
    if (idx === -1) {
      return { success: false, message: 'User not found.' };
    }

    employees[idx] = { ...employees[idx], ...data };
    localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(employees));

    const current = this.getCurrentUser();
    if (current && current.id === userId) {
      this.setCurrentUser(employees[idx]);
    }

    this.addNotification({
      userId,
      title: 'Profile Updated',
      message: 'Your profile information has been successfully updated.',
      type: 'success',
    });

    this.notify();
    return { success: true, user: employees[idx] };
  }

  // Reset / Change Password
  public resetPassword(userId: string, newPassword: string): { success: boolean; message?: string } {
    const employees = this.getEmployees();
    const idx = employees.findIndex((e) => e.id === userId);
    if (idx === -1) {
      return { success: false, message: 'User not found.' };
    }

    employees[idx].password = newPassword;
    localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(employees));

    const current = this.getCurrentUser();
    if (current && current.id === userId) {
      this.setCurrentUser({ ...current, password: newPassword });
    }

    this.addNotification({
      userId,
      title: 'Password Changed',
      message: 'Your account password has been updated successfully.',
      type: 'success',
    });

    this.notify();
    return { success: true, message: 'Password updated successfully!' };
  }

  // Employees
  public getEmployees(): Employee[] {
    const raw = localStorage.getItem(STORAGE_KEYS.EMPLOYEES);
    return raw ? JSON.parse(raw) : INITIAL_EMPLOYEES;
  }

  public getEmployeeById(id: string): Employee | undefined {
    return this.getEmployees().find((e) => e.id === id);
  }

  public saveEmployee(emp: Partial<Employee> & { id?: string }): Employee {
    const employees = this.getEmployees();
    let saved: Employee;
    if (emp.id && employees.some((e) => e.id === emp.id)) {
      employees.forEach((existing, idx) => {
        if (existing.id === emp.id) {
          employees[idx] = { ...existing, ...emp } as Employee;
          saved = employees[idx];
        }
      });
    } else {
      const nextNum = employees.length + 101;
      saved = {
        id: `emp_${Date.now()}`,
        employeeId: emp.employeeId || `EMP-${nextNum}`,
        firstName: emp.firstName || 'New',
        lastName: emp.lastName || 'Employee',
        email: emp.email || `employee.${Date.now()}@workpulse.com`,
        role: emp.role || 'employee',
        departmentId: emp.departmentId || 'dept_eng',
        shiftId: emp.shiftId || 'shift_general',
        designation: emp.designation || 'Specialist',
        phone: emp.phone || '+1 (555) 000-0000',
        dateOfJoining: emp.dateOfJoining || new Date().toISOString().split('T')[0],
        status: emp.status || 'active',
        avatarUrl: emp.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80',
        hourlyRate: emp.hourlyRate || 40,
        qrCodeToken: `WP-TOKEN-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
        annualLeaveBalance: emp.annualLeaveBalance ?? 15,
        sickLeaveBalance: emp.sickLeaveBalance ?? 10,
        casualLeaveBalance: emp.casualLeaveBalance ?? 8,
      };
      employees.push(saved);
    }
    localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(employees));
    this.notify();
    return saved!;
  }

  public deleteEmployee(id: string) {
    let employees = this.getEmployees();
    employees = employees.filter((e) => e.id !== id);
    localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(employees));
    this.notify();
  }

  // Departments
  public getDepartments(): Department[] {
    const raw = localStorage.getItem(STORAGE_KEYS.DEPARTMENTS);
    const depts: Department[] = raw ? JSON.parse(raw) : INITIAL_DEPARTMENTS;
    const employees = this.getEmployees();
    return depts.map((d) => ({
      ...d,
      employeeCount: employees.filter((e) => e.departmentId === d.id).length,
    }));
  }

  public saveDepartment(dept: Partial<Department> & { id?: string }): Department {
    const list = this.getDepartments();
    let saved: Department;
    if (dept.id && list.some((d) => d.id === dept.id)) {
      list.forEach((existing, idx) => {
        if (existing.id === dept.id) {
          list[idx] = { ...existing, ...dept } as Department;
          saved = list[idx];
        }
      });
    } else {
      saved = {
        id: `dept_${Date.now()}`,
        name: dept.name || 'New Department',
        code: dept.code || 'DEPT',
        description: dept.description || '',
        headName: dept.headName || 'Unassigned',
        headEmail: dept.headEmail || 'admin@workpulse.com',
        createdAt: new Date().toISOString().split('T')[0],
      };
      list.push(saved);
    }
    localStorage.setItem(STORAGE_KEYS.DEPARTMENTS, JSON.stringify(list));
    this.notify();
    return saved!;
  }

  public deleteDepartment(id: string) {
    let list = this.getDepartments();
    list = list.filter((d) => d.id !== id);
    localStorage.setItem(STORAGE_KEYS.DEPARTMENTS, JSON.stringify(list));
    this.notify();
  }

  // Shifts
  public getShifts(): Shift[] {
    const raw = localStorage.getItem(STORAGE_KEYS.SHIFTS);
    return raw ? JSON.parse(raw) : INITIAL_SHIFTS;
  }

  public saveShift(shift: Partial<Shift> & { id?: string }): Shift {
    const list = this.getShifts();
    let saved: Shift;
    if (shift.id && list.some((s) => s.id === shift.id)) {
      list.forEach((existing, idx) => {
        if (existing.id === shift.id) {
          list[idx] = { ...existing, ...shift } as Shift;
          saved = list[idx];
        }
      });
    } else {
      saved = {
        id: `shift_${Date.now()}`,
        name: shift.name || 'New Shift',
        startTime: shift.startTime || '09:00',
        endTime: shift.endTime || '17:30',
        gracePeriodMinutes: shift.gracePeriodMinutes ?? 15,
        halfDayHours: shift.halfDayHours ?? 4,
        fullDayHours: shift.fullDayHours ?? 8,
        color: shift.color || '#3B82F6',
        description: shift.description || '',
      };
      list.push(saved);
    }
    localStorage.setItem(STORAGE_KEYS.SHIFTS, JSON.stringify(list));
    this.notify();
    return saved!;
  }

  public deleteShift(id: string) {
    let list = this.getShifts();
    list = list.filter((s) => s.id !== id);
    localStorage.setItem(STORAGE_KEYS.SHIFTS, JSON.stringify(list));
    this.notify();
  }

  // Office Location / Geofence
  public getOfficeLocation(): CompanyLocation {
    const raw = localStorage.getItem(STORAGE_KEYS.OFFICE_LOCATION);
    return raw ? JSON.parse(raw) : DEFAULT_OFFICE_LOCATION;
  }

  public saveOfficeLocation(loc: CompanyLocation) {
    localStorage.setItem(STORAGE_KEYS.OFFICE_LOCATION, JSON.stringify(loc));
    this.notify();
  }

  // Distance Calculation (Haversine in meters)
  public calculateDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // Earth radius in meters
    const phi1 = (lat1 * Math.PI) / 180;
    const phi2 = (lat2 * Math.PI) / 180;
    const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
    const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
      Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return Math.round(R * c);
  }

  // Attendance Records
  public getAttendanceRecords(): AttendanceRecord[] {
    const raw = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
    return raw ? JSON.parse(raw) : [];
  }

  public getTodayAttendance(employeeId: string): AttendanceRecord | undefined {
    const today = new Date().toISOString().split('T')[0];
    const records = this.getAttendanceRecords();
    return records.find((r) => r.employeeId === employeeId && r.date === today);
  }

  // Check In
  public checkIn(
    employeeId: string,
    method: AttendanceMethod = 'web',
    location?: { latitude: number; longitude: number; address?: string; distanceMeters?: number }
  ): AttendanceRecord {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    const currentTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const employee = this.getEmployeeById(employeeId);
    const shifts = this.getShifts();
    const shift = shifts.find((s) => s.id === employee?.shiftId) || shifts[0];

    // Calculate Late status
    const [startH, startM] = shift.startTime.split(':').map(Number);
    const shiftStartMinutes = startH * 60 + startM;
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const diff = currentMinutes - shiftStartMinutes;

    let status: AttendanceStatus = 'present';
    let lateMinutes = 0;

    if (diff > shift.gracePeriodMinutes) {
      status = 'late';
      lateMinutes = diff;
    }

    const records = this.getAttendanceRecords();
    const existingIndex = records.findIndex((r) => r.employeeId === employeeId && r.date === today);

    const record: AttendanceRecord = {
      id: existingIndex >= 0 ? records[existingIndex].id : `att_${today}_${employeeId}`,
      employeeId,
      date: today,
      checkIn: currentTimeStr,
      checkOut: undefined,
      status,
      workHours: 0,
      overtimeHours: 0,
      lateMinutes,
      method,
      location,
      ipAddress: '192.168.1.105',
    };

    if (existingIndex >= 0) {
      records[existingIndex] = record;
    } else {
      records.unshift(record);
    }

    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(records));

    // Send notification
    this.addNotification({
      userId: employeeId,
      title: 'Check-in Recorded',
      message: `Checked in successfully at ${currentTimeStr}. Status: ${status.toUpperCase()} (${method.replace('_', ' ')}).`,
      type: 'attendance',
    });

    this.notify();
    return record;
  }

  // Check Out
  public checkOut(employeeId: string): AttendanceRecord | null {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    const currentTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const records = this.getAttendanceRecords();
    const existing = records.find((r) => r.employeeId === employeeId && r.date === today);

    if (!existing || !existing.checkIn || existing.checkIn === '-') {
      return null;
    }

    const employee = this.getEmployeeById(employeeId);
    const shifts = this.getShifts();
    const shift = shifts.find((s) => s.id === employee?.shiftId) || shifts[0];

    // Calculate hours worked
    const [inH, inM] = existing.checkIn.split(':').map(Number);
    const inTotalMinutes = inH * 60 + inM;
    const outTotalMinutes = now.getHours() * 60 + now.getMinutes();

    let workedMinutes = Math.max(0, outTotalMinutes - inTotalMinutes);
    // Deduct 30 min break if worked more than 5 hours
    if (workedMinutes > 300) {
      workedMinutes -= 30;
    }

    const workHours = parseFloat((workedMinutes / 60).toFixed(1));
    const overtimeHours = workHours > shift.fullDayHours ? parseFloat((workHours - shift.fullDayHours).toFixed(1)) : 0;

    let status = existing.status;
    if (workHours < shift.halfDayHours && status !== 'absent' && status !== 'on_leave') {
      status = 'half_day';
    }

    existing.checkOut = currentTimeStr;
    existing.workHours = workHours;
    existing.overtimeHours = overtimeHours;
    existing.status = status;

    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(records));

    this.addNotification({
      userId: employeeId,
      title: 'Check-out Recorded',
      message: `Checked out at ${currentTimeStr}. Total worked: ${workHours}h (OT: ${overtimeHours}h).`,
      type: 'attendance',
    });

    this.notify();
    return existing;
  }

  // Manual Adjust Attendance (for HR Admin)
  public saveAttendanceRecord(record: AttendanceRecord) {
    const records = this.getAttendanceRecords();
    const idx = records.findIndex((r) => r.id === record.id);
    if (idx >= 0) {
      records[idx] = record;
    } else {
      records.unshift(record);
    }
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(records));
    this.notify();
  }

  public deleteAttendanceRecord(id: string) {
    let records = this.getAttendanceRecords();
    records = records.filter((r) => r.id !== id);
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(records));
    this.notify();
  }

  // Leaves
  public getLeaves(): LeaveRequest[] {
    const raw = localStorage.getItem(STORAGE_KEYS.LEAVES);
    return raw ? JSON.parse(raw) : INITIAL_LEAVE_REQUESTS;
  }

  public applyLeave(
    employeeId: string,
    leaveType: LeaveRequest['leaveType'],
    startDate: string,
    endDate: string,
    reason: string
  ): LeaveRequest {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const newLeave: LeaveRequest = {
      id: `leave_${Date.now()}`,
      employeeId,
      leaveType,
      startDate,
      endDate,
      totalDays,
      reason,
      status: 'pending',
      appliedOn: new Date().toISOString().split('T')[0],
    };

    const leaves = this.getLeaves();
    leaves.unshift(newLeave);
    localStorage.setItem(STORAGE_KEYS.LEAVES, JSON.stringify(leaves));

    const emp = this.getEmployeeById(employeeId);
    this.addNotification({
      userId: 'emp_admin',
      title: 'New Leave Request',
      message: `${emp ? `${emp.firstName} ${emp.lastName}` : 'An employee'} applied for ${totalDays} day(s) of ${leaveType} leave.`,
      type: 'leave',
    });

    this.notify();
    return newLeave;
  }

  public reviewLeave(leaveId: string, status: 'approved' | 'rejected', comment?: string): LeaveRequest | null {
    const leaves = this.getLeaves();
    const item = leaves.find((l) => l.id === leaveId);
    if (!item) return null;

    item.status = status;
    const currentUser = this.getCurrentUser();
    item.reviewedBy = currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'System Administrator';
    item.reviewComment = comment || (status === 'approved' ? 'Approved by Admin' : 'Rejected by Admin');
    item.reviewedAt = new Date().toISOString().replace('T', ' ').substring(0, 16);

    // If approved, deduct leave balance
    if (status === 'approved') {
      const employees = this.getEmployees();
      const emp = employees.find((e) => e.id === item.employeeId);
      if (emp) {
        if (item.leaveType === 'casual') {
          emp.casualLeaveBalance = Math.max(0, emp.casualLeaveBalance - item.totalDays);
        } else if (item.leaveType === 'sick') {
          emp.sickLeaveBalance = Math.max(0, emp.sickLeaveBalance - item.totalDays);
        } else if (item.leaveType === 'annual') {
          emp.annualLeaveBalance = Math.max(0, emp.annualLeaveBalance - item.totalDays);
        }
        localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(employees));
      }
    }

    localStorage.setItem(STORAGE_KEYS.LEAVES, JSON.stringify(leaves));

    // Notify employee
    this.addNotification({
      userId: item.employeeId,
      title: `Leave ${status.toUpperCase()}`,
      message: `Your leave request for ${item.startDate} to ${item.endDate} was ${status}. Remark: ${item.reviewComment}`,
      type: status === 'approved' ? 'success' : 'warning',
    });

    this.notify();
    return item;
  }

  // Holidays
  public getHolidays(): Holiday[] {
    const raw = localStorage.getItem(STORAGE_KEYS.HOLIDAYS);
    return raw ? JSON.parse(raw) : INITIAL_HOLIDAYS;
  }

  public saveHoliday(holiday: Partial<Holiday> & { id?: string }): Holiday {
    const list = this.getHolidays();
    let saved: Holiday;
    if (holiday.id && list.some((h) => h.id === holiday.id)) {
      list.forEach((existing, idx) => {
        if (existing.id === holiday.id) {
          list[idx] = { ...existing, ...holiday } as Holiday;
          saved = list[idx];
        }
      });
    } else {
      saved = {
        id: `hol_${Date.now()}`,
        title: holiday.title || 'Company Holiday',
        date: holiday.date || new Date().toISOString().split('T')[0],
        type: holiday.type || 'company',
        isRecurring: holiday.isRecurring ?? false,
        description: holiday.description || '',
      };
      list.push(saved);
    }
    localStorage.setItem(STORAGE_KEYS.HOLIDAYS, JSON.stringify(list));
    this.notify();
    return saved!;
  }

  public deleteHoliday(id: string) {
    let list = this.getHolidays();
    list = list.filter((h) => h.id !== id);
    localStorage.setItem(STORAGE_KEYS.HOLIDAYS, JSON.stringify(list));
    this.notify();
  }

  // Notifications
  public getNotifications(): NotificationItem[] {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    return raw ? JSON.parse(raw) : INITIAL_NOTIFICATIONS;
  }

  public addNotification(notif: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>) {
    const list = this.getNotifications();
    const item: NotificationItem = {
      ...notif,
      id: `notif_${Date.now()}`,
      timestamp: 'Just now',
      read: false,
    };
    list.unshift(item);
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(list));
    this.notify();
  }

  public markNotificationAsRead(id: string) {
    const list = this.getNotifications();
    const target = list.find((n) => n.id === id);
    if (target) {
      target.read = true;
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(list));
      this.notify();
    }
  }

  public markAllNotificationsAsRead() {
    const list = this.getNotifications();
    list.forEach((n) => (n.read = true));
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(list));
    this.notify();
  }

  // Reset to initial demo data
  public resetToFactory() {
    localStorage.removeItem(STORAGE_KEYS.DEPARTMENTS);
    localStorage.removeItem(STORAGE_KEYS.SHIFTS);
    localStorage.removeItem(STORAGE_KEYS.EMPLOYEES);
    localStorage.removeItem(STORAGE_KEYS.ATTENDANCE);
    localStorage.removeItem(STORAGE_KEYS.LEAVES);
    localStorage.removeItem(STORAGE_KEYS.HOLIDAYS);
    localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
    localStorage.removeItem(STORAGE_KEYS.OFFICE_LOCATION);
    this.initializeData();
    this.notify();
  }
}

export const storage = new StorageService();
