import { Department, Shift, Employee, AttendanceRecord, LeaveRequest, Holiday, NotificationItem, CompanyLocation } from '../types';

export const DEFAULT_OFFICE_LOCATION: CompanyLocation = {
  name: 'Global Tech Headquarters - Silicon Park',
  latitude: 37.7749,
  longitude: -122.4194,
  radiusMeters: 200,
};

export const INITIAL_DEPARTMENTS: Department[] = [
  {
    id: 'dept_eng',
    name: 'Software Engineering',
    code: 'ENG',
    description: 'Product development, architecture, QA, and cloud infrastructure.',
    headName: 'Marcus Vance',
    headEmail: 'marcus.v@workpulse.com',
    createdAt: '2023-01-15',
  },
  {
    id: 'dept_hr',
    name: 'Human Resources',
    code: 'HR',
    description: 'Talent acquisition, employee engagement, payroll, and culture.',
    headName: 'Sarah Jenkins',
    headEmail: 'sarah.j@workpulse.com',
    createdAt: '2023-01-15',
  },
  {
    id: 'dept_fin',
    name: 'Finance & Accounts',
    code: 'FIN',
    description: 'Corporate budgeting, audit, billing, compliance, and accounts.',
    headName: 'David Chen',
    headEmail: 'david.c@workpulse.com',
    createdAt: '2023-02-01',
  },
  {
    id: 'dept_mkt',
    name: 'Growth & Marketing',
    code: 'MKT',
    description: 'Brand strategy, performance marketing, content, and events.',
    headName: 'Elena Rostova',
    headEmail: 'elena.r@workpulse.com',
    createdAt: '2023-03-10',
  },
  {
    id: 'dept_ops',
    name: 'Operations & Support',
    code: 'OPS',
    description: 'Client success, logistics, facilities, and customer support.',
    headName: 'Kavita Rao',
    headEmail: 'kavita.r@workpulse.com',
    createdAt: '2023-04-01',
  },
  {
    id: 'dept_des',
    name: 'UI/UX & Product Design',
    code: 'DES',
    description: 'User experience research, prototyping, design system, and visual branding.',
    headName: 'Liam O\'Connor',
    headEmail: 'liam.o@workpulse.com',
    createdAt: '2023-05-12',
  },
];

export const INITIAL_SHIFTS: Shift[] = [
  {
    id: 'shift_general',
    name: 'General Morning Shift',
    startTime: '09:00',
    endTime: '17:30',
    gracePeriodMinutes: 15,
    halfDayHours: 4,
    fullDayHours: 8,
    color: '#3B82F6', // Blue
    description: 'Standard 8.5-hour corporate day shift with 30-minute lunch break.',
  },
  {
    id: 'shift_early',
    name: 'Early Bird Shift',
    startTime: '07:30',
    endTime: '16:00',
    gracePeriodMinutes: 10,
    halfDayHours: 4,
    fullDayHours: 8,
    color: '#10B981', // Emerald
    description: 'Early morning shift for operations, infrastructure, and international client coverage.',
  },
  {
    id: 'shift_evening',
    name: 'Afternoon / Evening Shift',
    startTime: '13:00',
    endTime: '21:30',
    gracePeriodMinutes: 15,
    halfDayHours: 4,
    fullDayHours: 8,
    color: '#F59E0B', // Amber
    description: 'Afternoon shift supporting global clients and second-tier deployments.',
  },
  {
    id: 'shift_flex',
    name: 'Flexible Hours Shift',
    startTime: '10:00',
    endTime: '18:30',
    gracePeriodMinutes: 30,
    halfDayHours: 4,
    fullDayHours: 8,
    color: '#8B5CF6', // Purple
    description: 'Core hours with flexibility for senior research and design teams.',
  },
];

export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 'emp_admin',
    employeeId: 'ADM-001',
    firstName: 'Alexander',
    lastName: 'Wright',
    email: 'admin@workpulse.com',
    role: 'admin',
    departmentId: 'dept_hr',
    shiftId: 'shift_general',
    designation: 'Principal HR Director & Admin',
    phone: '+1 (555) 234-5678',
    dateOfJoining: '2022-01-10',
    status: 'active',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
    hourlyRate: 55.0,
    qrCodeToken: 'WP-ADM-001-TOKEN-9942',
    biometricId: 'BIO-ADM-001',
    annualLeaveBalance: 18,
    sickLeaveBalance: 10,
    casualLeaveBalance: 8,
    password: 'Ramya@123',
  },
  {
    id: 'emp_01',
    employeeId: 'EMP-101',
    firstName: 'Priya',
    lastName: 'Sharma',
    email: 'priya.s@workpulse.com',
    role: 'employee',
    departmentId: 'dept_eng',
    shiftId: 'shift_general',
    designation: 'Senior Full Stack Engineer',
    phone: '+1 (555) 345-6789',
    dateOfJoining: '2022-04-15',
    status: 'active',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=250&q=80',
    hourlyRate: 48.0,
    qrCodeToken: 'WP-EMP-101-TOKEN-3312',
    biometricId: 'BIO-EMP-101',
    annualLeaveBalance: 14,
    sickLeaveBalance: 8,
    casualLeaveBalance: 6,
  },
  {
    id: 'emp_02',
    employeeId: 'EMP-102',
    firstName: 'Marcus',
    lastName: 'Vance',
    email: 'marcus.v@workpulse.com',
    role: 'employee',
    departmentId: 'dept_eng',
    shiftId: 'shift_general',
    designation: 'VP of Engineering',
    phone: '+1 (555) 456-7890',
    dateOfJoining: '2021-08-01',
    status: 'active',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
    hourlyRate: 75.0,
    qrCodeToken: 'WP-EMP-102-TOKEN-5481',
    biometricId: 'BIO-EMP-102',
    annualLeaveBalance: 20,
    sickLeaveBalance: 12,
    casualLeaveBalance: 10,
  },
  {
    id: 'emp_03',
    employeeId: 'EMP-103',
    firstName: 'Sophia',
    lastName: 'Chen',
    email: 'sophia.c@workpulse.com',
    role: 'employee',
    departmentId: 'dept_des',
    shiftId: 'shift_flex',
    designation: 'Lead Product Designer',
    phone: '+1 (555) 567-8901',
    dateOfJoining: '2022-11-05',
    status: 'active',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=250&q=80',
    hourlyRate: 45.0,
    qrCodeToken: 'WP-EMP-103-TOKEN-6219',
    biometricId: 'BIO-EMP-103',
    annualLeaveBalance: 12,
    sickLeaveBalance: 7,
    casualLeaveBalance: 5,
  },
  {
    id: 'emp_04',
    employeeId: 'EMP-104',
    firstName: 'Daniel',
    lastName: 'Kim',
    email: 'daniel.k@workpulse.com',
    role: 'employee',
    departmentId: 'dept_eng',
    shiftId: 'shift_early',
    designation: 'DevOps & Cloud Specialist',
    phone: '+1 (555) 678-9012',
    dateOfJoining: '2023-03-20',
    status: 'active',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80',
    hourlyRate: 46.0,
    qrCodeToken: 'WP-EMP-104-TOKEN-7724',
    biometricId: 'BIO-EMP-104',
    annualLeaveBalance: 15,
    sickLeaveBalance: 9,
    casualLeaveBalance: 7,
  },
  {
    id: 'emp_05',
    employeeId: 'EMP-105',
    firstName: 'Elena',
    lastName: 'Rostova',
    email: 'elena.r@workpulse.com',
    role: 'employee',
    departmentId: 'dept_mkt',
    shiftId: 'shift_general',
    designation: 'Growth Marketing Manager',
    phone: '+1 (555) 789-0123',
    dateOfJoining: '2023-01-09',
    status: 'active',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=250&q=80',
    hourlyRate: 42.0,
    qrCodeToken: 'WP-EMP-105-TOKEN-1109',
    biometricId: 'BIO-EMP-105',
    annualLeaveBalance: 11,
    sickLeaveBalance: 6,
    casualLeaveBalance: 4,
  },
  {
    id: 'emp_06',
    employeeId: 'EMP-106',
    firstName: 'Amina',
    lastName: 'Diallo',
    email: 'amina.d@workpulse.com',
    role: 'employee',
    departmentId: 'dept_fin',
    shiftId: 'shift_general',
    designation: 'Senior Financial Analyst',
    phone: '+1 (555) 890-1234',
    dateOfJoining: '2022-09-14',
    status: 'active',
    avatarUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=250&q=80',
    hourlyRate: 44.0,
    qrCodeToken: 'WP-EMP-106-TOKEN-4487',
    biometricId: 'BIO-EMP-106',
    annualLeaveBalance: 13,
    sickLeaveBalance: 8,
    casualLeaveBalance: 5,
  },
  {
    id: 'emp_07',
    employeeId: 'EMP-107',
    firstName: 'Lucas',
    lastName: 'Silva',
    email: 'lucas.s@workpulse.com',
    role: 'employee',
    departmentId: 'dept_ops',
    shiftId: 'shift_evening',
    designation: 'Operations Coordinator',
    phone: '+1 (555) 901-2345',
    dateOfJoining: '2023-06-01',
    status: 'active',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=250&q=80',
    hourlyRate: 36.0,
    qrCodeToken: 'WP-EMP-107-TOKEN-8923',
    biometricId: 'BIO-EMP-107',
    annualLeaveBalance: 16,
    sickLeaveBalance: 10,
    casualLeaveBalance: 7,
  },
  {
    id: 'emp_08',
    employeeId: 'EMP-108',
    firstName: 'Grace',
    lastName: 'Hopper',
    email: 'grace.h@workpulse.com',
    role: 'employee',
    departmentId: 'dept_eng',
    shiftId: 'shift_general',
    designation: 'Backend Python Engineer',
    phone: '+1 (555) 012-3456',
    dateOfJoining: '2023-07-15',
    status: 'active',
    avatarUrl: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=250&q=80',
    hourlyRate: 45.0,
    qrCodeToken: 'WP-EMP-108-TOKEN-9031',
    biometricId: 'BIO-EMP-108',
    annualLeaveBalance: 14,
    sickLeaveBalance: 9,
    casualLeaveBalance: 6,
  }
];

// Generate past 14 days of realistic attendance records for all employees
export function generatePastAttendanceRecords(employees: Employee[]): AttendanceRecord[] {
  const records: AttendanceRecord[] = [];
  const today = new Date();

  // Helper date formatter
  const formatDate = (d: Date) => d.toISOString().split('T')[0];

  for (let i = 14; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dayOfWeek = d.getDay(); // 0 is Sunday, 6 is Saturday

    // Skip Sundays
    if (dayOfWeek === 0) continue;

    const dateStr = formatDate(d);
    const isToday = i === 0;

    employees.forEach((emp, empIdx) => {
      // For today, some have checked in, some haven't yet, some checked out
      if (isToday) {
        if (empIdx === 0 || empIdx === 1 || empIdx === 2 || empIdx === 4 || empIdx === 6) {
          // Checked in and already checked out or still in
          const checkedOut = empIdx === 2 || empIdx === 6;
          records.push({
            id: `att_${dateStr}_${emp.id}`,
            employeeId: emp.id,
            date: dateStr,
            checkIn: '08:55',
            checkOut: checkedOut ? '17:35' : undefined,
            status: 'present',
            workHours: checkedOut ? 8.6 : 5.2,
            overtimeHours: checkedOut ? 0.6 : 0,
            lateMinutes: 0,
            method: empIdx % 2 === 0 ? 'qr_code' : 'geofence',
            location: {
              latitude: 37.7751,
              longitude: -122.4190,
              address: 'HQ Floor 4, Silicon Park',
              distanceMeters: 45,
            },
            ipAddress: '192.168.1.104',
          });
        } else if (empIdx === 3) {
          // Late arrival today
          records.push({
            id: `att_${dateStr}_${emp.id}`,
            employeeId: emp.id,
            date: dateStr,
            checkIn: '09:28',
            checkOut: undefined,
            status: 'late',
            workHours: 4.8,
            overtimeHours: 0,
            lateMinutes: 28,
            method: 'biometric',
            location: {
              latitude: 37.7749,
              longitude: -122.4194,
              address: 'HQ Main Entrance Fingerprint Scanner',
              distanceMeters: 12,
            },
            ipAddress: '192.168.1.12',
          });
        } else if (empIdx === 5) {
          // Approved leave today
          records.push({
            id: `att_${dateStr}_${emp.id}`,
            employeeId: emp.id,
            date: dateStr,
            checkIn: '-',
            status: 'on_leave',
            workHours: 0,
            overtimeHours: 0,
            lateMinutes: 0,
            method: 'web',
            notes: 'Approved Casual Leave - Family occasion',
          });
        }
        // Others haven't checked in yet today (waiting)
        return;
      }

      // Past days
      // Deterministic pseudo-randomness based on date and emp
      const hash = (i * 17 + empIdx * 31) % 100;

      let status: AttendanceRecord['status'] = 'present';
      let checkIn = '08:52';
      let checkOut: string | undefined = '17:34';
      let workHours = 8.7;
      let overtimeHours = 0.7;
      let lateMinutes = 0;
      let method: AttendanceRecord['method'] = (['web', 'qr_code', 'geofence', 'biometric', 'face_recognition'] as const)[hash % 5];

      if (hash < 68) {
        // Normal On Time
        status = 'present';
        checkIn = `08:${45 + (hash % 14)}`.padStart(5, '0');
        checkOut = `17:${30 + (hash % 35)}`.padStart(5, '0');
        workHours = 8.5 + (hash % 10) / 10;
        overtimeHours = workHours > 8.0 ? parseFloat((workHours - 8.0).toFixed(1)) : 0;
      } else if (hash < 82) {
        // Late
        status = 'late';
        lateMinutes = 18 + (hash % 25);
        checkIn = `09:${lateMinutes < 10 ? '0' + lateMinutes : lateMinutes}`;
        checkOut = '17:40';
        workHours = 8.1;
        overtimeHours = 0.1;
      } else if (hash < 90) {
        // Half Day
        status = 'half_day';
        checkIn = '09:05';
        checkOut = '13:15';
        workHours = 4.2;
        overtimeHours = 0;
      } else if (hash < 95) {
        // Leave
        status = 'on_leave';
        checkIn = '-';
        checkOut = undefined;
        workHours = 0;
        overtimeHours = 0;
      } else {
        // Absent
        status = 'absent';
        checkIn = '-';
        checkOut = undefined;
        workHours = 0;
        overtimeHours = 0;
      }

      records.push({
        id: `att_${dateStr}_${emp.id}`,
        employeeId: emp.id,
        date: dateStr,
        checkIn,
        checkOut,
        status,
        workHours,
        overtimeHours,
        lateMinutes,
        method,
        location: {
          latitude: 37.7749 + (hash % 10) * 0.0001,
          longitude: -122.4194 + (hash % 10) * 0.0001,
          address: 'Main Office Gateway - Terminal 1',
          distanceMeters: 25 + (hash % 50),
        },
        ipAddress: `192.168.1.${100 + (hash % 90)}`,
      });
    });
  }

  return records;
}

export const INITIAL_LEAVE_REQUESTS: LeaveRequest[] = [
  {
    id: 'leave_01',
    employeeId: 'emp_05',
    leaveType: 'casual',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    totalDays: 2,
    reason: 'Family urgent wedding ceremony and travel.',
    status: 'approved',
    appliedOn: '2026-09-24',
    reviewedBy: 'Alexander Wright',
    reviewComment: 'Approved. Please coordinate handover with marketing team.',
    reviewedAt: '2026-09-24 16:30',
  },
  {
    id: 'leave_02',
    employeeId: 'emp_01',
    leaveType: 'sick',
    startDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    endDate: new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0],
    totalDays: 2,
    reason: 'Scheduled routine medical checkup & dental procedure.',
    status: 'pending',
    appliedOn: '2026-09-25',
  },
  {
    id: 'leave_03',
    employeeId: 'emp_04',
    leaveType: 'annual',
    startDate: new Date(Date.now() + 86400000 * 10).toISOString().split('T')[0],
    endDate: new Date(Date.now() + 86400000 * 15).toISOString().split('T')[0],
    totalDays: 5,
    reason: 'Annual family vacation trip to Rocky Mountains.',
    status: 'pending',
    appliedOn: '2026-09-26',
  },
  {
    id: 'leave_04',
    employeeId: 'emp_07',
    leaveType: 'casual',
    startDate: '2026-09-10',
    endDate: '2026-09-11',
    totalDays: 2,
    reason: 'Personal relocation and apartment shift.',
    status: 'approved',
    appliedOn: '2026-09-08',
    reviewedBy: 'Alexander Wright',
    reviewComment: 'Approved. Enjoy your new home.',
    reviewedAt: '2026-09-09 11:20',
  },
  {
    id: 'leave_05',
    employeeId: 'emp_08',
    leaveType: 'unpaid',
    startDate: '2026-09-18',
    endDate: '2026-09-18',
    totalDays: 1,
    reason: 'Personal urgent errand outside city.',
    status: 'rejected',
    appliedOn: '2026-09-17',
    reviewedBy: 'Alexander Wright',
    reviewComment: 'Cannot approve due to critical sprint release deployment deadline on that day.',
    reviewedAt: '2026-09-17 14:10',
  }
];

export const INITIAL_HOLIDAYS: Holiday[] = [
  {
    id: 'hol_01',
    title: 'New Year Celebration',
    date: '2026-01-01',
    type: 'national',
    isRecurring: true,
    description: 'First day of the calendar year official holiday.',
  },
  {
    id: 'hol_02',
    title: 'Memorial & Labor Day',
    date: '2026-05-25',
    type: 'national',
    isRecurring: true,
    description: 'Honoring service members and national workforce.',
  },
  {
    id: 'hol_03',
    title: 'Independence Day',
    date: '2026-07-04',
    type: 'national',
    isRecurring: true,
    description: 'National holiday commemorating independence.',
  },
  {
    id: 'hol_04',
    title: 'Company Foundation & Innovation Day',
    date: '2026-10-15',
    type: 'company',
    isRecurring: true,
    description: 'Annual corporate celebration, team hackathon, and company dinner.',
  },
  {
    id: 'hol_05',
    title: 'Thanksgiving Holiday',
    date: '2026-11-26',
    type: 'festival',
    isRecurring: true,
    description: 'Thanksgiving holiday for company employees and families.',
  },
  {
    id: 'hol_06',
    title: 'Winter Festive & Christmas Break',
    date: '2026-12-25',
    type: 'festival',
    isRecurring: true,
    description: 'Christmas Day company holiday.',
  }
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif_01',
    userId: 'all',
    title: 'Monthly Attendance Cut-off Approaching',
    message: 'Please review and regularize all pending check-in/check-out logs before Friday 5:00 PM for payroll processing.',
    type: 'warning',
    timestamp: '2 hours ago',
    read: false,
  },
  {
    id: 'notif_02',
    userId: 'emp_admin',
    title: 'New Leave Application Submitted',
    message: 'Sophia Chen has applied for 2 days of Sick Leave from Sept 29 to Sept 30.',
    type: 'leave',
    timestamp: '3 hours ago',
    read: false,
  },
  {
    id: 'notif_03',
    userId: 'emp_01',
    title: 'Check-in Verified via GPS',
    message: 'Your morning check-in at 08:55 AM has been recorded and geofence distance verified (45m from HQ).',
    type: 'attendance',
    timestamp: 'Today at 08:55 AM',
    read: true,
  },
  {
    id: 'notif_04',
    userId: 'all',
    title: 'Company Foundation Day Announced',
    message: 'Mark your calendar: Annual Foundation Day is on October 15th with dinner and hackathon awards!',
    type: 'info',
    timestamp: '1 day ago',
    read: true,
  }
];
