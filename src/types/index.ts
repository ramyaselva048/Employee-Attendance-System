export type Role = 'admin' | 'employee';

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'half_day' | 'on_leave';

export type AttendanceMethod = 'web' | 'qr_code' | 'geofence' | 'biometric' | 'face_recognition';

export interface Department {
  id: string;
  name: string;
  code: string;
  description: string;
  headName: string;
  headEmail: string;
  employeeCount?: number;
  createdAt: string;
}

export interface Shift {
  id: string;
  name: string;
  startTime: string; // "09:00"
  endTime: string;   // "17:00"
  gracePeriodMinutes: number; // e.g. 15 mins
  halfDayHours: number; // e.g. 4 hours
  fullDayHours: number; // e.g. 8 hours
  color: string;
  description: string;
}

export interface Employee {
  id: string;
  employeeId: string; // e.g. "EMP001"
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  role: Role;
  departmentId: string;
  shiftId: string;
  designation: string;
  phone: string;
  dateOfJoining: string;
  status: 'active' | 'inactive';
  avatarUrl?: string;
  hourlyRate: number;
  qrCodeToken: string;
  biometricId?: string;
  annualLeaveBalance: number;
  sickLeaveBalance: number;
  casualLeaveBalance: number;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string; // "YYYY-MM-DD"
  checkIn: string; // ISO string or "HH:mm"
  checkOut?: string | null;
  status: AttendanceStatus;
  workHours: number; // in hours, e.g. 8.5
  overtimeHours: number; // e.g. 1.5
  lateMinutes: number; // e.g. 20
  method: AttendanceMethod;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
    distanceMeters?: number;
  };
  notes?: string;
  verifiedBy?: string;
  ipAddress?: string;
}

export type LeaveType = 'casual' | 'sick' | 'annual' | 'unpaid' | 'maternity' | 'paternity';
export type LeaveStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface LeaveRequest {
  id: string;
  employeeId: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: LeaveStatus;
  appliedOn: string;
  reviewedBy?: string;
  reviewComment?: string;
  reviewedAt?: string;
}

export interface Holiday {
  id: string;
  title: string;
  date: string;
  type: 'national' | 'festival' | 'company' | 'optional';
  isRecurring: boolean;
  description: string;
}

export interface NotificationItem {
  id: string;
  userId: string; // 'all' or specific employeeId
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'leave' | 'attendance';
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

export interface CompanyLocation {
  name: string;
  latitude: number;
  longitude: number;
  radiusMeters: number; // e.g. 150m allowed
}
