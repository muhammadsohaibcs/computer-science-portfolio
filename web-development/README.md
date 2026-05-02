# 🌐 Web Development Masterclass

<div align="center">

[![Full Stack](https://img.shields.io/badge/Full%20Stack-MERN-blue?style=for-the-badge)](.)
[![E-Commerce](https://img.shields.io/badge/E%20Commerce-WordPress-blue?style=for-the-badge)](.)
[![Status](https://img.shields.io/badge/Status-Production%20Ready-success?style=for-the-badge)](.)

**Enterprise-grade web applications spanning frontend, backend, databases, and DevOps**

</div>

---

## 📂 Directory Structure

```
web-development/
├── medicore-hms/              # ⭐ MERN Hospital Management System
│   ├── frontend/              # React + TypeScript + Tailwind
│   ├── backend/               # Node.js + Express + MongoDB
│   ├── docs/                  # API documentation
│   └── README.md
│
├── html-and-css/              # Frontend fundamentals
│   ├── projects/
│   └── labs/
│
└── (Additional projects)
```

---

## 🎯 Featured Project: MediCore HMS

### Project Overview

**MediCore Hospital Management System** is a production-grade full-stack application built on the MERN stack with enterprise-grade security, real-time communication, and comprehensive healthcare management features.

### 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│               Frontend (React + TypeScript)         │
│            - 6 Role-Based Portals                   │
│            - Real-time UI Updates                   │
│            - Responsive Design (Tailwind CSS)       │
└────────────────────┬────────────────────────────────┘
                     │
                  Axios/HTTP
                     │
┌────────────────────▼────────────────────────────────┐
│            Backend API (Express.js)                  │
│        - RESTful + WebSocket Endpoints              │
│        - JWT Authentication & 2FA                   │
│        - Validation & Error Handling                │
└────────────────────┬────────────────────────────────┘
                     │
                MongoDB Driver
                     │
┌────────────────────▼────────────────────────────────┐
│         Database (MongoDB Atlas)                     │
│     - Collections & Transactions                    │
│     - Indexing & Optimization                       │
│     - Cloud Backup & Replication                    │
└─────────────────────────────────────────────────────┘
```

### 🔑 Key Features

#### Security
- ✅ JWT with refresh token rotation
- ✅ Argon2 password hashing
- ✅ Role-Based Access Control (RBAC)
- ✅ Optional Two-Factor Authentication (2FA)
- ✅ CSRF protection
- ✅ SQL/NoSQL injection prevention
- ✅ Rate limiting & brute-force protection

#### Functionality
- ✅ Patient management and medical records
- ✅ Appointment scheduling with real-time updates
- ✅ Doctor schedules and availability
- ✅ Prescription management
- ✅ Lab results tracking
- ✅ Billing and invoicing
- ✅ Multi-user roles with granular permissions

#### Real-Time Features
- ✅ Live notifications
- ✅ Socket.io integration
- ✅ Real-time appointment updates
- ✅ Instant messaging between staff

### 💻 Technology Stack

**Frontend**
```
React 18         - UI library
TypeScript       - Type safety
Vite             - Fast build tool
Tailwind CSS     - Utility-first styling
React Router 6   - Client-side routing
Axios            - HTTP client
React Query      - Data fetching & caching
Socket.io        - Real-time communication
```

**Backend**
```
Node.js          - Runtime environment
Express.js       - Web framework
MongoDB          - NoSQL database
Mongoose         - ODM & validation
JWT              - Authentication
Argon2           - Password hashing
Redis            - Caching
Winston/Pino     - Logging
Nodemailer       - Email service
```

### 📝 Quick Start

```bash
# Clone and setup
git clone https://github.com/muhammadsohaibcs/computer-science-portfolio.git
cd web-development/medicore-hms

# Install all dependencies
npm run install:all

# Setup environment variables
# Backend: Create backend/.env
# Frontend: Create frontend/.env.local

# Run development
npm run dev:backend      # Terminal 1
npm run dev:frontend     # Terminal 2

# Build for production
npm run build:frontend
```

### 📚 API Endpoints Overview

**Authentication**
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/refresh-token
POST   /api/auth/2fa/enable
```

**Patients**
```
GET    /api/patients/me
PUT    /api/patients/:id
GET    /api/patients/:id/records
GET    /api/patients/:id/appointments
```

**Appointments**
```
GET    /api/appointments
POST   /api/appointments
PUT    /api/appointments/:id
DELETE /api/appointments/:id
```

**Medical Data**
```
GET    /api/diagnoses
POST   /api/prescriptions
GET    /api/lab-results
```

See [backend/docs](medicore-hms/backend/docs) for complete API documentation.

### 🔒 Security Highlights

- **Database Security:** Encrypted sensitive fields, secure indexing
- **API Security:** Rate limiting, CORS configuration, helmet middleware
- **Authentication:** JWT tokens with 7-day expiration, refresh token rotation
- **Authorization:** Fine-grained role-based permissions
- **Data Validation:** Express-validator on all inputs
- **Logging:** Winston logger for security audit trails

### 🚀 Deployment

**Frontend:**
- Vite optimized build
- CDN-ready assets
- Service worker support
- Environment-based configuration

**Backend:**
- MongoDB Atlas cloud database
- Node.js production setup
- PM2 process management ready
- Docker containerization support

### 📊 Database Schema

**Collections:**
- Users (Admin, Doctor, Nurse, Receptionist, Patient)
- Appointments
- Medical Records
- Prescriptions
- Lab Results
- Departments
- Shifts
- Billing

---

## 📚 Learning Resources

### Concepts Covered
- Full-stack MERN development
- Enterprise architecture
- Security best practices
- Real-time communication
- Database design & optimization
- API design & documentation
- Testing & CI/CD

### Best Practices Demonstrated
- ✅ Clean code architecture
- ✅ Separation of concerns
- ✅ DRY principle
- ✅ Error handling
- ✅ Logging & monitoring
- ✅ Configuration management
- ✅ Environment-based setup

---

## 🎓 Next Steps

1. **Study the Architecture**
   - Review backend structure and routing
   - Analyze database schema design

2. **Understand Security**
   - JWT implementation details
   - RBAC middleware
   - Input validation patterns

3. **Explore Real-Time Features**
   - Socket.io event handling
   - WebSocket communication

4. **Implement Features**
   - Add new endpoints
   - Create new roles
   - Extend functionality

---

## 📄 Related Projects

- **Era Demands E-Commerce** - WordPress + WooCommerce
- **HTML & CSS Fundamentals** - Frontend foundations

---

## 🔗 Links

- **GitHub:** [muhammadsohaibcs](https://github.com/muhammadsohaibcs)
- **MediCore Detailed README:** [medicore-hms/README.md](medicore-hms/README.md)
- **Main Portfolio:** [../PROJECTS.md](../PROJECTS.md)

---

<div align="center">

**Building scalable, secure web applications for real-world impact**

</div>
