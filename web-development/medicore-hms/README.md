# MediCore Hospital Management System

<div align="center">

[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg?style=flat-square)](package.json)
[![License](https://img.shields.io/badge/license-MIT-green.svg?style=flat-square)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-blue?style=flat-square&logo=node.js)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?style=flat-square&logo=mongodb)](https://www.mongodb.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-Latest-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![Security](https://img.shields.io/badge/Security-Enterprise%20Grade-red?style=flat-square)](SECURITY.md)

**An enterprise-grade, scalable Hospital Management System with advanced security, role-based access control, and comprehensive healthcare operations management.**

[Features](#features) • [Tech Stack](#tech-stack) • [Installation](#installation) • [Usage](#usage) • [API Documentation](#api-documentation) • [Security](#security) • [Contributing](#contributing)

</div>

---

## Overview

**MediCore HMS** is a production-ready Hospital Management System designed to streamline healthcare operations. It provides comprehensive functionality for patient management, appointment scheduling, staff administration, medical records, billing, and reporting—all backed by enterprise-grade security architecture.

Built with modern technologies and best practices, MediCore ensures reliability, scalability, and HIPAA-compliant data handling for healthcare institutions of all sizes.

---

## ✨ Features

### 🔐 Security & Authentication
- **Role-Based Access Control (RBAC)** - Fine-grained permissions for Admin, Doctor, Nurse, Receptionist, and Patient roles
- **JWT Authentication** - Secure token-based authentication with configurable expiration
- **Password Security** - Argon2 hashing with salt, preventing brute-force attacks
- **OAuth 2.0 Integration** - Support for external authentication providers
- **Two-Factor Authentication (2FA)** - OTP-based 2FA for enhanced account security
- **CSRF Protection** - Cross-Site Request Forgery mitigation with csurf middleware
- **Security Headers** - Helmet.js integration for comprehensive security headers

### 👥 User Management
- **Multi-role User System** - Dedicated roles with hierarchical permissions
- **User Profile Management** - Comprehensive user information and credentials
- **Session Management** - Secure session handling with automatic expiration
- **Audit Logging** - Complete user activity tracking and monitoring
- **Account Recovery** - Secure password reset with email verification

### 🏥 Clinical Features
- **Patient Management** - Complete patient profile, medical history, and demographics
- **Appointment Scheduling** - Calendar-based scheduling with conflict detection
- **Medical Records** - Secure storage and retrieval of patient medical documents
- **Prescription Management** - Digital prescription handling and pharmacy integration
- **Lab Results** - Laboratory test tracking and result management
- **Diagnosis Tracking** - Patient diagnosis history and clinical notes

### 📊 Administrative Features
- **Staff Management** - Employee records, shifts, and scheduling
- **Department Management** - Organize staff and resources by department
- **Billing & Invoicing** - Automated billing, invoice generation, and payment tracking
- **Reports & Analytics** - Comprehensive dashboards and business intelligence
- **Resource Allocation** - Bed management, equipment tracking, and inventory
- **Compliance Monitoring** - Regulatory compliance and audit trails

### 💬 Communication
- **Email Notifications** - Appointment reminders, confirmations, and alerts
- **In-App Messaging** - Internal communication between staff members
- **SMS Integration** - Optional SMS notifications for critical alerts
- **Notification Preferences** - User-configurable notification settings

### 📱 User Experience
- **Responsive Design** - Mobile-first, fully responsive interface with Tailwind CSS
- **Modern UI/UX** - Clean, intuitive design using React and Vite
- **Real-time Updates** - Socket.io integration for live data synchronization
- **Dark Mode Support** - User preference for light/dark theme
- **Accessibility** - WCAG 2.1 AA compliant for inclusive access

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose | Version |
|-----------|---------|---------|
| **Node.js** | Runtime environment | 18+ |
| **Express.js** | Web framework | 4.18+ |
| **MongoDB** | NoSQL database | Atlas (Cloud) |
| **Mongoose** | ODM & validation | 7.0+ |
| **JWT** | Authentication | 9.0+ |
| **Argon2** | Password hashing | 0.30+ |
| **Redis** | Caching & session | 4.6+ |
| **Socket.io** | Real-time communication | Latest |
| **Nodemailer** | Email service | 6.9+ |
| **Winston** | Logging | 3.18+ |

### Frontend
| Technology | Purpose | Version |
|-----------|---------|---------|
| **React** | UI library | 18+ |
| **TypeScript** | Type safety | Latest |
| **Vite** | Build tool | 4.0+ |
| **Tailwind CSS** | Styling | 3.0+ |
| **React Router** | Navigation | 6.0+ |
| **Axios** | HTTP client | 1.0+ |
| **React Query** | Data fetching | 3.0+ |

### DevOps & Testing
| Technology | Purpose |
|-----------|---------|
| **Mocha** | Testing framework |
| **Chai** | Assertion library |
| **Supertest** | HTTP testing |
| **Faker.js** | Mock data generation |
| **Nodemon** | Auto-reload development |

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** v18 or higher
- **npm** or **yarn** package manager
- **MongoDB Atlas** account (cloud database)
- **Redis** (optional, for caching)
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/muhammadsohaibcs/computer-science-portfolio.git
cd web-development/medicore-hms
```

2. **Install dependencies**
```bash
npm run install:all
```

This installs dependencies for both frontend and backend.

### Environment Setup

3. **Backend configuration** - Create `.env` in `backend/` directory:
```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/medicore

# Authentication
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRY=7d
REFRESH_TOKEN_SECRET=your-refresh-token-secret-min-32-chars
REFRESH_TOKEN_EXPIRY=30d

# Email Service
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Server
PORT=5000
NODE_ENV=development
BASE_URL=http://localhost:5000

# Security
CORS_ORIGIN=http://localhost:3000
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100

# Redis (Optional)
REDIS_URL=redis://localhost:6379
```

4. **Frontend configuration** - Create `.env` in `frontend/` directory:
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_NAME=MediCore HMS
```

### Running the Application

**Development mode (both frontend & backend):**
```bash
# Terminal 1 - Backend
npm run dev:backend

# Terminal 2 - Frontend
npm run dev:frontend
```

**Production build:**
```bash
npm run build:frontend
```

The application will be available at:
- **Frontend:** `http://localhost:3000`
- **Backend API:** `http://localhost:5000/api`

---

## 📖 Usage

### Initial Setup

1. **Seed Database** (Optional - populates sample data)
```bash
cd backend
npm run seed-all
```

2. **Login with Default Credentials**
```
Email: admin@medicore.com
Password: Admin@123
```

### Core Workflows

#### As a Patient
1. Register an account or login
2. View personal medical records
3. Schedule appointments with doctors
4. Receive appointment reminders
5. View test results and prescriptions
6. Manage profile information

#### As a Doctor
1. Login with doctor credentials
2. View assigned patients and schedules
3. Add clinical notes and diagnoses
4. Prescribe medications
5. Order lab tests
6. Generate medical reports

#### As an Administrator
1. Manage users and roles
2. Configure departments and staff
3. Monitor system usage and logs
4. Generate compliance reports
5. Manage system settings and notifications

---

## 📚 API Documentation

### Authentication Endpoints

**Register New User**
```bash
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "fullName": "John Doe",
  "role": "patient"
}
```

**Login**
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Enable 2FA**
```bash
POST /api/auth/2fa/enable
Authorization: Bearer <token>
```

### Patient Endpoints

**Get Patient Profile**
```bash
GET /api/patients/me
Authorization: Bearer <token>
```

**Schedule Appointment**
```bash
POST /api/appointments
Authorization: Bearer <token>
Content-Type: application/json

{
  "doctorId": "doctor-id",
  "appointmentDate": "2024-12-25T10:00:00Z",
  "reason": "Regular checkup"
}
```

**Get Medical Records**
```bash
GET /api/patients/:patientId/records
Authorization: Bearer <token>
```

### Doctor Endpoints

**Get Assigned Patients**
```bash
GET /api/doctors/patients
Authorization: Bearer <token>
```

**Add Diagnosis**
```bash
POST /api/patients/:patientId/diagnosis
Authorization: Bearer <token>
Content-Type: application/json

{
  "disease": "Hypertension",
  "severity": "moderate",
  "notes": "Patient shows signs of elevated blood pressure"
}
```

**Create Prescription**
```bash
POST /api/prescriptions
Authorization: Bearer <token>
Content-Type: application/json

{
  "patientId": "patient-id",
  "medication": "Lisinopril",
  "dosage": "10mg",
  "frequency": "Once daily",
  "duration": "30 days"
}
```

For comprehensive API documentation, see [API_DOCS.md](./backend/docs/API_DOCS.md)

---

## 🔒 Security

### Security Features Implemented

✅ **Authentication & Authorization**
- JWT-based authentication with refresh tokens
- Role-Based Access Control (RBAC)
- Session management and timeout

✅ **Data Protection**
- End-to-end encrypted sensitive data
- Argon2 password hashing
- SQL/NoSQL injection prevention
- XSS and CSRF protection

✅ **Network Security**
- HTTPS/TLS encryption
- CORS configuration
- Security headers (Helmet.js)
- Rate limiting and brute-force protection

✅ **Compliance**
- HIPAA-ready architecture
- GDPR data handling practices
- Audit logging and monitoring
- Secure data retention policies

### Reporting Security Issues

⚠️ **Please do NOT publicly disclose security vulnerabilities.** 

See [SECURITY.md](./SECURITY.md) for responsible disclosure guidelines and contact information.

### Running Security Tests

```bash
cd backend
npm test
```

Advanced security testing:
```bash
npm run test:security
```

---

## 🧪 Testing

### Run All Tests
```bash
cd backend
npm test
```

### Run Specific Test Suite
```bash
npm test -- tests/auth.test.js
```

### Test Coverage
```bash
npm run test:coverage
```

### Testing Tools
- **Mocha** - Test runner and framework
- **Chai** - Assertion library
- **Supertest** - HTTP assertion library
- **Faker.js** - Mock data generation

---

## 📁 Project Structure

```
medicore-hms/
├── frontend/                    # React TypeScript application
│   ├── src/
│   │   ├── components/          # Reusable React components
│   │   ├── pages/               # Page-level components
│   │   ├── services/            # API services
│   │   ├── hooks/               # Custom React hooks
│   │   ├── context/             # React context
│   │   ├── styles/              # Tailwind CSS
│   │   └── App.tsx
│   ├── package.json
│   └── vite.config.ts
│
├── backend/                     # Node.js Express application
│   ├── src/
│   │   ├── controllers/         # Route controllers
│   │   ├── models/              # Mongoose schemas
│   │   ├── middleware/          # Custom middleware
│   │   ├── routes/              # API routes
│   │   ├── services/            # Business logic
│   │   ├── validators/          # Input validation
│   │   ├── utils/               # Utility functions
│   │   ├── config/              # Configuration files
│   │   ├── database/            # Database setup
│   │   ├── errors/              # Custom error classes
│   │   └── server.js            # Application entry
│   ├── tests/                   # Test suites
│   ├── .env.example
│   └── package.json
│
├── package.json                 # Root package configuration
├── README.md                    # This file
└── SECURITY.md                  # Security guidelines
```

---

## 🚦 Development Workflow

### Running in Development

```bash
# Terminal 1: Backend (with auto-reload)
npm run dev:backend

# Terminal 2: Frontend (with HMR)
npm run dev:frontend

# Terminal 3: Run tests (optional)
cd backend && npm test
```

### Building for Production

```bash
# Build frontend
npm run build:frontend

# Production backend setup
cd backend
npm install --production
NODE_ENV=production npm start
```

### Code Quality

```bash
# Lint code
npm run lint

# Format code
npm run format

# Type checking
npm run type-check
```

---

## 📊 Performance Optimization

- **Frontend:** Vite's fast build system and automatic code splitting
- **Backend:** Request compression, caching with Redis, database indexing
- **Database:** MongoDB Atlas with automatic scaling and replication
- **CDN:** Integration-ready for static asset delivery
- **Monitoring:** Winston logging and application performance tracking

---

## 🛠️ Troubleshooting

### Backend Won't Start
```bash
# Clear node_modules and reinstall
cd backend
rm -rf node_modules package-lock.json
npm install

# Check MongoDB connection
# Verify MONGODB_URI in .env file
```

### Frontend Build Issues
```bash
# Clear Vite cache
cd frontend
rm -rf node_modules/.vite
npm run dev
```

### Port Already in Use
```bash
# Kill process on port 5000 (backend)
# Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux:
lsof -ti:5000 | xargs kill -9
```

### Database Connection Error
- Ensure MongoDB URI is correct
- Check IP whitelist in MongoDB Atlas (allow your IP)
- Verify network connectivity

---

## 📈 Roadmap

- [ ] Advanced Analytics Dashboard
- [ ] Mobile App (React Native)
- [ ] Telemedicine Integration
- [ ] AI-powered Diagnosis Assistant
- [ ] Advanced Billing & Insurance Integration
- [ ] Multi-language Support (i18n)
- [ ] Voice Prescription System
- [ ] Integration with External Lab Systems

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit changes** (`git commit -m 'Add amazing feature'`)
4. **Push to branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Development Guidelines
- Follow ESLint and Prettier configuration
- Write tests for new features
- Update documentation
- Ensure security best practices

---

## 📄 License

This project is licensed under the **MIT License** - see [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Muhammad Sohaib**
- GitHub: [@muhammadsohaibcs](https://github.com/muhammadsohaibcs)
- Portfolio: [computer-science-portfolio](https://github.com/muhammadsohaibcs/computer-science-portfolio)

---

## 📞 Support & Contact

- **Issues:** GitHub Issues for bug reports and feature requests
- **Security:** See [SECURITY.md](./SECURITY.md) for security-related inquiries
- **Questions:** Create a discussion or reach out via GitHub

---

## 🙏 Acknowledgments

- MongoDB Atlas for database hosting
- Express.js community for excellent documentation
- React and TypeScript communities
- All contributors and testers

---

<div align="center">

**Made with ❤️ for healthcare innovation**

⭐ If you find this project useful, please give it a star!

</div>
