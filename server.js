// server.ts
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import mysql from "mysql2/promise";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
dotenv.config();
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var PORT = parseInt(process.env.PORT || "3000", 10);
var DB_HOST = process.env.DB_HOST || "gateway01.ap-southeast-1.prod.aws.tidbcloud.com";
var DB_PORT = parseInt(process.env.DB_PORT || "4000", 10);
var DB_USER = process.env.DB_USER || "XnGV2vyr5Hg8jwj.root";
var DB_PASSWORD = process.env.DB_PASSWORD || "Lu6g79FlLi8D7eDu";
var DB_NAME = process.env.DB_NAME || "attendance_db";
var pool = mysql.createPool({
  host: DB_HOST,
  port: DB_PORT,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  ssl: {
    minVersion: "TLSv1.2",
    rejectUnauthorized: true
  },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});
async function initDatabase() {
  try {
    const conn = await pool.getConnection();
    console.log(`[TiDB] Connected successfully to ${DB_HOST}:${DB_PORT}/${DB_NAME}`);
    await conn.query(`
      CREATE TABLE IF NOT EXISTS departments (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        code VARCHAR(32) NOT NULL,
        description TEXT,
        head_name VARCHAR(255),
        head_email VARCHAR(255),
        created_at VARCHAR(64)
      );
    `);
    await conn.query(`
      CREATE TABLE IF NOT EXISTS shifts (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        start_time VARCHAR(32) DEFAULT '09:00',
        end_time VARCHAR(32) DEFAULT '17:30',
        grace_period_minutes INT DEFAULT 15,
        half_day_hours DECIMAL(4,2) DEFAULT 4,
        full_day_hours DECIMAL(4,2) DEFAULT 8,
        color VARCHAR(32) DEFAULT '#3B82F6',
        description TEXT
      );
    `);
    try {
      await conn.query(`ALTER TABLE shifts MODIFY start_time VARCHAR(32) DEFAULT '09:00'`);
      await conn.query(`ALTER TABLE shifts MODIFY end_time VARCHAR(32) DEFAULT '17:30'`);
    } catch {
    }
    await conn.query(`
      CREATE TABLE IF NOT EXISTS employees (
        id VARCHAR(64) PRIMARY KEY,
        employee_id VARCHAR(64) UNIQUE NOT NULL,
        first_name VARCHAR(128) NOT NULL,
        last_name VARCHAR(128) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        role VARCHAR(32) NOT NULL,
        department_id VARCHAR(64),
        shift_id VARCHAR(64),
        designation VARCHAR(255),
        phone VARCHAR(64),
        date_of_joining VARCHAR(64),
        status VARCHAR(32) DEFAULT 'active',
        avatar_url TEXT,
        hourly_rate DECIMAL(10,2) DEFAULT 30.0,
        qr_code_token VARCHAR(255),
        biometric_id VARCHAR(64),
        annual_leave_balance INT DEFAULT 14,
        sick_leave_balance INT DEFAULT 8,
        casual_leave_balance INT DEFAULT 6,
        password VARCHAR(255) DEFAULT 'Ramya@123'
      );
    `);
    await conn.query(`
      CREATE TABLE IF NOT EXISTS attendance_records (
        id VARCHAR(64) PRIMARY KEY,
        employee_id VARCHAR(64) NOT NULL,
        date VARCHAR(32) NOT NULL,
        check_in_time VARCHAR(32),
        check_out_time VARCHAR(32),
        status VARCHAR(32) NOT NULL,
        method VARCHAR(32) NOT NULL,
        total_hours DECIMAL(6,2) DEFAULT 0,
        overtime_hours DECIMAL(6,2) DEFAULT 0,
        location_latitude DECIMAL(10,6),
        location_longitude DECIMAL(10,6),
        location_address TEXT,
        is_verified TINYINT(1) DEFAULT 1,
        notes TEXT,
        ip_address VARCHAR(64),
        device_info VARCHAR(255)
      );
    `);
    await conn.query(`
      CREATE TABLE IF NOT EXISTS leave_requests (
        id VARCHAR(64) PRIMARY KEY,
        employee_id VARCHAR(64) NOT NULL,
        leave_type VARCHAR(64) NOT NULL,
        start_date VARCHAR(32) NOT NULL,
        end_date VARCHAR(32) NOT NULL,
        reason TEXT,
        status VARCHAR(32) NOT NULL,
        applied_on VARCHAR(64),
        reviewed_by VARCHAR(64),
        reviewed_on VARCHAR(64),
        rejection_reason TEXT
      );
    `);
    await conn.query(`
      CREATE TABLE IF NOT EXISTS holidays (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        date VARCHAR(32) NOT NULL,
        type VARCHAR(64) NOT NULL,
        is_optional TINYINT(1) DEFAULT 0
      );
    `);
    await conn.query(`
      CREATE TABLE IF NOT EXISTS system_config (
        config_key VARCHAR(128) PRIMARY KEY,
        config_value LONGTEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);
    await conn.query(`
      UPDATE employees 
      SET password = 'Ramya@123' 
      WHERE role = 'admin' OR email = 'admin@workpulse.com' OR employee_id IN ('ADM-001', 'ADM-101');
    `);
    conn.release();
    console.log("[TiDB] Database tables initialized and verified.");
  } catch (err) {
    console.error("[TiDB] Initialization error:", err);
  }
}
async function startServer() {
  const app = express();
  app.use(express.json({ limit: "10mb" }));
  await initDatabase();
  app.get("/api/health", async (req, res) => {
    const start = Date.now();
    try {
      const [rows] = await pool.query("SELECT VERSION() as version, DATABASE() as db");
      const latencyMs = Date.now() - start;
      res.json({
        status: "connected",
        cluster: "Employee-Attendance-System",
        database: DB_NAME,
        host: DB_HOST,
        latencyMs,
        serverInfo: rows
      });
    } catch (err) {
      res.status(500).json({
        status: "disconnected",
        error: err.message
      });
    }
  });
  app.get("/api/data", async (req, res) => {
    try {
      const [rawDepartments] = await pool.query("SELECT * FROM departments");
      const departments = rawDepartments.map((d) => ({
        id: d.id,
        name: d.name,
        code: d.code,
        description: d.description || "",
        headName: d.head_name || d.headName || "",
        headEmail: d.head_email || d.headEmail || "",
        createdAt: d.created_at || d.createdAt || ""
      }));
      const [rawShifts] = await pool.query("SELECT * FROM shifts");
      const shifts = rawShifts.map((s) => ({
        id: s.id,
        name: s.name,
        startTime: s.start_time || s.startTime || "09:00",
        endTime: s.end_time || s.endTime || "17:30",
        start_time: s.start_time || s.startTime || "09:00",
        end_time: s.end_time || s.endTime || "17:30",
        gracePeriodMinutes: Number(s.grace_period_minutes ?? s.gracePeriodMinutes ?? 15),
        halfDayHours: Number(s.half_day_hours ?? s.halfDayHours ?? 4),
        fullDayHours: Number(s.full_day_hours ?? s.fullDayHours ?? 8),
        color: s.color || "#3B82F6",
        description: s.description || ""
      }));
      const [rawEmployees] = await pool.query("SELECT * FROM employees");
      const employees = rawEmployees.map((e) => ({
        id: e.id,
        employeeId: e.employee_id || e.employeeId,
        firstName: e.first_name || e.firstName,
        lastName: e.last_name || e.lastName,
        email: e.email,
        role: e.role,
        departmentId: e.department_id || e.departmentId,
        shiftId: e.shift_id || e.shiftId,
        designation: e.designation,
        phone: e.phone || "",
        dateOfJoining: e.date_of_joining || e.dateOfJoining,
        status: e.status || "active",
        avatarUrl: e.avatar_url || e.avatarUrl,
        hourlyRate: Number(e.hourly_rate ?? e.hourlyRate ?? 30),
        qrCodeToken: e.qr_code_token || e.qrCodeToken,
        biometricId: e.biometric_id || e.biometricId,
        annualLeaveBalance: Number(e.annual_leave_balance ?? e.annualLeaveBalance ?? 14),
        sickLeaveBalance: Number(e.sick_leave_balance ?? e.sickLeaveBalance ?? 8),
        casualLeaveBalance: Number(e.casual_leave_balance ?? e.casualLeaveBalance ?? 6),
        password: e.role === "admin" || e.employee_id === "ADM-001" || e.employee_id === "ADM-101" ? "Ramya@123" : e.password || "password123"
      }));
      const [rawAttendance] = await pool.query("SELECT * FROM attendance_records ORDER BY date DESC, check_in_time DESC LIMIT 500");
      const attendance = rawAttendance.map((a) => ({
        id: a.id,
        employeeId: a.employee_id || a.employeeId,
        date: a.date,
        checkIn: a.check_in_time || a.checkIn || a.checkInTime || "-",
        checkOut: a.check_out_time || a.checkOut || a.checkOutTime || null,
        status: a.status,
        method: a.method,
        workHours: Number(a.total_hours ?? a.workHours ?? 0),
        overtimeHours: Number(a.overtime_hours ?? a.overtimeHours ?? 0),
        isVerified: Boolean(a.is_verified ?? a.isVerified),
        location: a.location_latitude && a.location_longitude ? {
          latitude: Number(a.location_latitude),
          longitude: Number(a.location_longitude),
          address: a.location_address || ""
        } : void 0,
        notes: a.notes,
        ipAddress: a.ip_address,
        deviceInfo: a.device_info
      }));
      const [rawLeaves] = await pool.query("SELECT * FROM leave_requests ORDER BY applied_on DESC");
      const leaves = rawLeaves.map((l) => ({
        id: l.id,
        employeeId: l.employee_id || l.employeeId,
        leaveType: l.leave_type || l.leaveType,
        startDate: l.start_date || l.startDate,
        endDate: l.end_date || l.endDate,
        totalDays: Number(l.total_days || 1),
        reason: l.reason || "",
        status: l.status,
        appliedOn: l.applied_on || l.appliedOn,
        reviewedBy: l.reviewed_by || l.reviewedBy,
        reviewedOn: l.reviewed_on || l.reviewedOn,
        reviewComment: l.rejection_reason || l.reviewComment
      }));
      const [holidays] = await pool.query("SELECT * FROM holidays");
      const [configs] = await pool.query("SELECT * FROM system_config");
      const configMap = {};
      configs.forEach((c) => {
        try {
          configMap[c.config_key] = JSON.parse(c.config_value);
        } catch {
          configMap[c.config_key] = c.config_value;
        }
      });
      res.json({
        success: true,
        departments,
        shifts,
        employees,
        attendance,
        leaves,
        holidays,
        officeLocation: configMap["office_location"] || null
      });
    } catch (err) {
      console.error("[TiDB] Fetch error:", err);
      res.status(500).json({ success: false, error: err.message });
    }
  });
  app.post("/api/sync", async (req, res) => {
    const { departments, shifts, employees, attendance, leaves, holidays, officeLocation } = req.body;
    try {
      const conn = await pool.getConnection();
      await conn.beginTransaction();
      if (Array.isArray(departments) && departments.length > 0) {
        for (const d of departments) {
          const dName = d.name || "Department";
          const dCode = d.code || "DEPT";
          const dDesc = d.description || "";
          const dHead = d.headName || d.head_name || "";
          const dEmail = d.headEmail || d.head_email || "";
          const dCreated = d.createdAt || d.created_at || "";
          await conn.query(
            `INSERT INTO departments (id, name, code, description, head_name, head_email, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE name=VALUES(name), code=VALUES(code), description=VALUES(description), head_name=VALUES(head_name), head_email=VALUES(head_email)`,
            [d.id, dName, dCode, dDesc, dHead, dEmail, dCreated]
          );
        }
      }
      if (Array.isArray(shifts) && shifts.length > 0) {
        for (const s of shifts) {
          const sName = s.name || "General Shift";
          const sStart = s.startTime || s.start_time || "09:00";
          const sEnd = s.endTime || s.end_time || "17:30";
          const sGrace = Number(s.gracePeriodMinutes ?? s.grace_period_minutes ?? 15);
          const sHalf = Number(s.halfDayHours ?? s.half_day_hours ?? 4);
          const sFull = Number(s.fullDayHours ?? s.full_day_hours ?? 8);
          const sColor = s.color || "#3B82F6";
          const sDesc = s.description || "";
          await conn.query(
            `INSERT INTO shifts (id, name, start_time, end_time, grace_period_minutes, half_day_hours, full_day_hours, color, description)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE name=VALUES(name), start_time=VALUES(start_time), end_time=VALUES(end_time), grace_period_minutes=VALUES(grace_period_minutes), half_day_hours=VALUES(half_day_hours), full_day_hours=VALUES(full_day_hours), color=VALUES(color), description=VALUES(description)`,
            [s.id, sName, sStart, sEnd, sGrace, sHalf, sFull, sColor, sDesc]
          );
        }
      }
      if (Array.isArray(employees) && employees.length > 0) {
        for (const e of employees) {
          const empId = e.employeeId || e.employee_id || e.id;
          const fName = e.firstName || e.first_name || "Staff";
          const lName = e.lastName || e.last_name || "";
          const email = e.email;
          const role = e.role || "employee";
          const dept = e.departmentId || e.department_id || "dept_hr";
          const shift = e.shiftId || e.shift_id || "shift_general";
          const desig = e.designation || "Staff";
          const pwd = role === "admin" || empId === "ADM-001" || empId === "ADM-101" || email === "admin@workpulse.com" ? "Ramya@123" : e.password || "password123";
          await conn.query(
            `INSERT INTO employees (id, employee_id, first_name, last_name, email, role, department_id, shift_id, designation, phone, date_of_joining, status, avatar_url, hourly_rate, qr_code_token, biometric_id, annual_leave_balance, sick_leave_balance, casual_leave_balance, password)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE first_name=VALUES(first_name), last_name=VALUES(last_name), email=VALUES(email), role=VALUES(role), department_id=VALUES(department_id), shift_id=VALUES(shift_id), designation=VALUES(designation), phone=VALUES(phone), status=VALUES(status), avatar_url=VALUES(avatar_url), hourly_rate=VALUES(hourly_rate), password=VALUES(password)`,
            [
              e.id,
              empId,
              fName,
              lName,
              email,
              role,
              dept,
              shift,
              desig,
              e.phone || "",
              e.dateOfJoining || e.date_of_joining || "",
              e.status || "active",
              e.avatarUrl || e.avatar_url || "",
              e.hourlyRate ?? e.hourly_rate ?? 30,
              e.qrCodeToken || e.qr_code_token || "",
              e.biometricId || e.biometric_id || "",
              e.annualLeaveBalance ?? e.annual_leave_balance ?? 14,
              e.sickLeaveBalance ?? e.sick_leave_balance ?? 8,
              e.casualLeaveBalance ?? e.casual_leave_balance ?? 6,
              pwd
            ]
          );
        }
      }
      if (Array.isArray(attendance) && attendance.length > 0) {
        for (const a of attendance) {
          const checkIn = a.checkIn || a.checkInTime || a.check_in_time || "-";
          const checkOut = a.checkOut || a.checkOutTime || a.check_out_time || null;
          const workHours = Number(a.workHours ?? a.totalHours ?? a.total_hours ?? 0);
          const overtime = Number(a.overtimeHours ?? a.overtime_hours ?? 0);
          const lat = a.location?.latitude || a.location_latitude || null;
          const lon = a.location?.longitude || a.location_longitude || null;
          const addr = a.location?.address || a.location_address || null;
          const isVer = a.isVerified ?? a.is_verified ? 1 : 0;
          await conn.query(
            `INSERT INTO attendance_records (id, employee_id, date, check_in_time, check_out_time, status, method, total_hours, overtime_hours, location_latitude, location_longitude, location_address, is_verified, notes, ip_address, device_info)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE check_in_time=VALUES(check_in_time), check_out_time=VALUES(check_out_time), status=VALUES(status), method=VALUES(method), total_hours=VALUES(total_hours), overtime_hours=VALUES(overtime_hours), location_latitude=VALUES(location_latitude), location_longitude=VALUES(location_longitude), location_address=VALUES(location_address), is_verified=VALUES(is_verified), notes=VALUES(notes)`,
            [
              a.id,
              a.employeeId || a.employee_id,
              a.date,
              checkIn,
              checkOut,
              a.status || "present",
              a.method || "web",
              workHours,
              overtime,
              lat,
              lon,
              addr,
              isVer,
              a.notes || null,
              a.ipAddress || a.ip_address || null,
              a.deviceInfo || a.device_info || null
            ]
          );
        }
      }
      if (Array.isArray(leaves) && leaves.length > 0) {
        for (const l of leaves) {
          await conn.query(
            `INSERT INTO leave_requests (id, employee_id, leave_type, start_date, end_date, reason, status, applied_on, reviewed_by, reviewed_on, rejection_reason)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE status=VALUES(status), reviewed_by=VALUES(reviewed_by), reviewed_on=VALUES(reviewed_on), rejection_reason=VALUES(rejection_reason)`,
            [
              l.id,
              l.employeeId || l.employee_id,
              l.leaveType || l.leave_type,
              l.startDate || l.start_date,
              l.endDate || l.end_date,
              l.reason || "",
              l.status || "pending",
              l.appliedOn || l.applied_on || (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
              l.reviewedBy || l.reviewed_by || null,
              l.reviewedOn || l.reviewed_on || null,
              l.rejectionReason || l.reviewComment || null
            ]
          );
        }
      }
      if (officeLocation) {
        await conn.query(
          `INSERT INTO system_config (config_key, config_value) VALUES ('office_location', ?)
           ON DUPLICATE KEY UPDATE config_value=VALUES(config_value)`,
          [JSON.stringify(officeLocation)]
        );
      }
      await conn.commit();
      conn.release();
      res.json({ success: true, message: "Synchronized with TiDB Cloud successfully" });
    } catch (err) {
      console.error("[TiDB] Sync error:", err);
      res.status(500).json({ success: false, error: err.message });
    }
  });
  app.post("/api/attendance", async (req, res) => {
    try {
      const a = req.body;
      await pool.query(
        `INSERT INTO attendance_records (id, employee_id, date, check_in_time, check_out_time, status, method, total_hours, overtime_hours, location_latitude, location_longitude, location_address, is_verified, notes, ip_address, device_info)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE check_in_time=VALUES(check_in_time), check_out_time=VALUES(check_out_time), status=VALUES(status), method=VALUES(method), total_hours=VALUES(total_hours), overtime_hours=VALUES(overtime_hours), location_latitude=VALUES(location_latitude), location_longitude=VALUES(location_longitude), location_address=VALUES(location_address), is_verified=VALUES(is_verified), notes=VALUES(notes)`,
        [
          a.id,
          a.employeeId,
          a.date,
          a.checkInTime || null,
          a.checkOutTime || null,
          a.status,
          a.method,
          a.totalHours || 0,
          a.overtimeHours || 0,
          a.location?.latitude || null,
          a.location?.longitude || null,
          a.location?.address || null,
          a.isVerified ? 1 : 0,
          a.notes || null,
          a.ipAddress || null,
          a.deviceInfo || null
        ]
      );
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });
  if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.resolve(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.resolve(__dirname, "dist", "index.html"));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[WorkPulse Server] Running on http://0.0.0.0:${PORT}`);
  });
}
startServer().catch((err) => {
  console.error("[Server Fatal Error]:", err);
});
