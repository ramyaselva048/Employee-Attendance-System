# WorkPulse - Enterprise Employee Attendance Management System

**Full Stack Internship Task Submission**
- **Backend:** Python 3.12, Django 5.x, Django REST Framework
- **Database:** MySQL 8.0 (InnoDB, foreign keys, indexes, triggers)
- **Frontend:** Bootstrap 5, HTML5, CSS3, JavaScript (ES6+), Chart.js
- **Verification:** GPS Geofencing, Dynamic QR Code Tokens, Biometric & Face Recognition

---

## 🌟 Features Implemented

1. **Role-Based Authentication & Permissions**
   - Admin (HR Director) vs Standard Staff (Employee)
   - Secure session handling and password hashing
2. **Interactive Real-Time Dashboards**
   - Headcount, Today Present, Late Arrivals, On Leave, Overtime
   - Chart.js interactive Donut Chart & 7-Day Trend Chart
3. **Multi-Factor Clock In / Out Terminal**
   - **GPS Geofencing:** Calculates distance via Haversine formula; restricts check-in outside 200m office perimeter
   - **Dynamic QR Code:** Dynamic QR token generation for kiosk and badge scanning
   - **Face AI & Biometrics:** Optical fingerprint & facial recognition landmark verification
4. **Shift & Department Management**
   - Department codes, leads, and staff distribution
   - Configurable shifts (Morning, Early, Evening, Flexible), arrival grace periods, half-day cutoffs, and overtime thresholds
5. **Leave & Time-Off Management**
   - Casual, Sick, Annual, and Unpaid leave allocations
   - Employee application flow & Admin approval/rejection with remarks
   - Automatic deduction from employee leave balances
6. **Holiday Calendar**
   - Company, national, and festival holidays
7. **Reports & Exports**
   - Daily, weekly, monthly, and custom date range reports
   - Real CSV/Excel download with full metadata
   - Printable timecard PDF layout

---

## 🚀 Running the Django + MySQL Backend Locally

### 1. Prerequisites
- Python 3.10+ (Recommended: Python 3.12)
- MySQL Server 8.0+
- pip and virtualenv

### 2. Setup Steps
```bash
# Clone project repository
git clone <repo-url>
cd employee-attendance-system

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate       # On Windows: venv\Scripts\activate

# Install all required Python packages
pip install -r requirements.txt

# Configure your .env file
cp .env.example .env
# Edit .env with your MySQL credentials (DB_NAME, DB_USER, DB_PASSWORD, DB_HOST)
```

### 3. Initialize MySQL Database
```bash
# Log in to MySQL and create the database:
mysql -u root -p
CREATE DATABASE workpulse_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
exit;

# Import the database.sql schema and seed data:
mysql -u root -p workpulse_db < database.sql
```

### 4. Run Django Migrations & Superuser
```bash
python manage.py makemigrations
python manage.py migrate

# Create Admin User
python manage.py createsuperuser
```

### 5. Start the Development Server
```bash
python manage.py runserver
```
Visit `http://127.0.0.1:8000/` in your browser.

---

## 📂 Project Architecture

```
├── manage.py
├── requirements.txt
├── database.sql
├── .env.example
├── README.md
├── attendance_system/
│   ├── settings.py
│   ├── urls.py
│   ├── wsgi.py
│   └── asgi.py
└── attendance/
    ├── models.py      # Relational MySQL models (Employee, Attendance, Shift, Dept, Leave)
    ├── views.py       # Controllers, APIs, exports
    ├── urls.py        # Routing
    ├── forms.py       # Validation forms
    ├── services.py    # Haversine geofence & overtime calculation engine
    ├── admin.py       # Django admin configuration
    └── tests.py       # Automated tests
```
