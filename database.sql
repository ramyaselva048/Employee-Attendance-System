-- =====================================================================
-- WorkPulse Enterprise Attendance Management System
-- Database Schema: MySQL 8.0
-- Python Full Stack Internship Project Submission
-- =====================================================================

CREATE DATABASE IF NOT EXISTS `workpulse_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `workpulse_db`;

-- 1. Departments Table
CREATE TABLE IF NOT EXISTS `departments` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL UNIQUE,
  `code` VARCHAR(20) NOT NULL UNIQUE,
  `description` TEXT,
  `head_name` VARCHAR(120),
  `head_email` VARCHAR(120),
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. Shifts Table
CREATE TABLE IF NOT EXISTS `shifts` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `start_time` TIME NOT NULL,
  `end_time` TIME NOT NULL,
  `grace_period_minutes` INT UNSIGNED DEFAULT 15,
  `half_day_hours` DECIMAL(4,2) DEFAULT 4.00,
  `full_day_hours` DECIMAL(4,2) DEFAULT 8.00,
  `color` VARCHAR(20) DEFAULT '#3B82F6',
  `description` TEXT
) ENGINE=InnoDB;

-- 3. Employees (Users) Table
CREATE TABLE IF NOT EXISTS `employees` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `password` VARCHAR(128) NOT NULL,
  `last_login` DATETIME NULL,
  `is_superuser` TINYINT(1) DEFAULT 0,
  `username` VARCHAR(150) NOT NULL UNIQUE,
  `first_name` VARCHAR(150) NOT NULL,
  `last_name` VARCHAR(150) NOT NULL,
  `email` VARCHAR(254) NOT NULL UNIQUE,
  `is_staff` TINYINT(1) DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `date_joined` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `employee_id` VARCHAR(30) NOT NULL UNIQUE,
  `role` ENUM('admin', 'employee') NOT NULL DEFAULT 'employee',
  `department_id` BIGINT NULL,
  `shift_id` BIGINT NULL,
  `designation` VARCHAR(120),
  `phone` VARCHAR(25),
  `date_of_joining` DATE NOT NULL,
  `hourly_rate` DECIMAL(8,2) DEFAULT 40.00,
  `qr_code_token` VARCHAR(64) NOT NULL UNIQUE,
  `biometric_id` VARCHAR(64) NULL,
  `annual_leave_balance` INT UNSIGNED DEFAULT 15,
  `sick_leave_balance` INT UNSIGNED DEFAULT 10,
  `casual_leave_balance` INT UNSIGNED DEFAULT 8,
  CONSTRAINT `fk_emp_dept` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_emp_shift` FOREIGN KEY (`shift_id`) REFERENCES `shifts` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 4. Attendance Records Table
CREATE TABLE IF NOT EXISTS `attendance_records` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `employee_id` BIGINT NOT NULL,
  `date` DATE NOT NULL,
  `check_in` TIME NULL,
  `check_out` TIME NULL,
  `status` ENUM('present', 'late', 'half_day', 'absent', 'on_leave') NOT NULL DEFAULT 'present',
  `work_hours` DECIMAL(5,2) DEFAULT 0.00,
  `overtime_hours` DECIMAL(5,2) DEFAULT 0.00,
  `late_minutes` INT UNSIGNED DEFAULT 0,
  `method` ENUM('web', 'qr_code', 'geofence', 'biometric', 'face_recognition') NOT NULL DEFAULT 'web',
  `latitude` DECIMAL(10,6) NULL,
  `longitude` DECIMAL(10,6) NULL,
  `distance_meters` INT UNSIGNED NULL,
  `notes` TEXT NULL,
  `ip_address` VARCHAR(45) NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_att_employee` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE,
  UNIQUE KEY `unique_emp_date` (`employee_id`, `date`),
  INDEX `idx_att_date` (`date`),
  INDEX `idx_att_status` (`status`)
) ENGINE=InnoDB;

-- 5. Leave Requests Table
CREATE TABLE IF NOT EXISTS `leave_requests` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `employee_id` BIGINT NOT NULL,
  `leave_type` ENUM('casual', 'sick', 'annual', 'unpaid') NOT NULL,
  `start_date` DATE NOT NULL,
  `end_date` DATE NOT NULL,
  `total_days` INT UNSIGNED NOT NULL DEFAULT 1,
  `reason` TEXT NOT NULL,
  `status` ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
  `applied_on` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `reviewed_by_id` BIGINT NULL,
  `review_comment` VARCHAR(255) NULL,
  `reviewed_at` DATETIME NULL,
  CONSTRAINT `fk_leave_emp` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_leave_reviewer` FOREIGN KEY (`reviewed_by_id`) REFERENCES `employees` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 6. Holidays Table
CREATE TABLE IF NOT EXISTS `holidays` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(150) NOT NULL,
  `date` DATE NOT NULL,
  `holiday_type` ENUM('national', 'company', 'festival') NOT NULL DEFAULT 'national',
  `is_recurring` TINYINT(1) DEFAULT 1,
  `description` TEXT NULL
) ENGINE=InnoDB;

-- 7. Sample Initial Seed Inserts
INSERT INTO `departments` (`name`, `code`, `head_name`, `head_email`) VALUES
('Software Engineering', 'ENG', 'Marcus Vance', 'marcus.v@workpulse.com'),
('Human Resources', 'HR', 'Sarah Jenkins', 'sarah.j@workpulse.com'),
('Finance & Accounts', 'FIN', 'David Chen', 'david.c@workpulse.com'),
('Growth & Marketing', 'MKT', 'Elena Rostova', 'elena.r@workpulse.com'),
('Operations & Support', 'OPS', 'Kavita Rao', 'kavita.r@workpulse.com'),
('UI/UX & Design', 'DES', 'Sophia Chen', 'sophia.c@workpulse.com');

INSERT INTO `shifts` (`name`, `start_time`, `end_time`, `grace_period_minutes`, `color`) VALUES
('General Morning Shift', '09:00:00', '17:30:00', 15, '#3B82F6'),
('Early Bird Shift', '07:30:00', '16:00:00', 10, '#10B981'),
('Afternoon Shift', '13:00:00', '21:30:00', 15, '#F59E0B'),
('Flexible Shift', '10:00:00', '18:30:00', 30, '#8B5CF6');

INSERT INTO `holidays` (`title`, `date`, `holiday_type`, `description`) VALUES
('New Year Celebration', '2026-01-01', 'national', 'First day of the year official holiday'),
('Labor Day', '2026-05-25', 'national', 'Honoring workforce'),
('Independence Day', '2026-07-04', 'national', 'Independence Day'),
('Company Foundation Day', '2026-10-15', 'company', 'Annual corporate awards and dinner');
