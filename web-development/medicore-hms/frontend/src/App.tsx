import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Loading from './components/common/Loading';
import ErrorBoundary from './components/common/ErrorBoundary';
import ProtectedRoute from './components/layout/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';

import Login     from './pages/Login';
import Dashboard from './pages/Dashboard';

const Patients        = lazy(() => import('./pages/Patients'));
const Doctors         = lazy(() => import('./pages/Doctors'));
const Staff           = lazy(() => import('./pages/Staff'));
const Departments     = lazy(() => import('./pages/Departments'));
const Appointments    = lazy(() => import('./pages/Appointments'));
const MedicalRecords  = lazy(() => import('./pages/MedicalRecords'));
const Prescriptions   = lazy(() => import('./pages/Prescriptions'));
const LabResults      = lazy(() => import('./pages/LabResults'));
const Billing         = lazy(() => import('./pages/Billing'));
const Rooms           = lazy(() => import('./pages/Rooms'));
const Inventory       = lazy(() => import('./pages/Inventory'));
const Services        = lazy(() => import('./pages/Services'));
const Insurance       = lazy(() => import('./pages/Insurance'));
const Suppliers       = lazy(() => import('./pages/Suppliers'));
const ChangePassword  = lazy(() => import('./pages/ChangePassword'));
const SecuritySettings = lazy(() => import('./pages/SecuritySettings'));
const Chat            = lazy(() => import('./pages/Chat'));
const NotFound        = lazy(() => import('./pages/NotFound'));

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <Suspense fallback={<Loading text="Loading…" />}>
              <Routes>
                <Route path="/login" element={<Login />} />

                <Route path="/dashboard"      element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/change-password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />
                <Route path="/security"        element={<ProtectedRoute><SecuritySettings /></ProtectedRoute>} />
                <Route path="/chat"            element={<ProtectedRoute><Chat /></ProtectedRoute>} />

                <Route path="/patients"        element={<ProtectedRoute allowedRoles={['Admin','Doctor','Nurse','Receptionist']}><Patients /></ProtectedRoute>} />
                <Route path="/appointments"    element={<ProtectedRoute allowedRoles={['Admin','Doctor','Nurse','Receptionist']}><Appointments /></ProtectedRoute>} />
                <Route path="/medical-records" element={<ProtectedRoute allowedRoles={['Admin','Doctor','Nurse']}><MedicalRecords /></ProtectedRoute>} />
                <Route path="/prescriptions"   element={<ProtectedRoute allowedRoles={['Admin','Doctor','Pharmacist']}><Prescriptions /></ProtectedRoute>} />
                <Route path="/lab-results"     element={<ProtectedRoute allowedRoles={['Admin','Doctor','Lab Technician','Nurse']}><LabResults /></ProtectedRoute>} />
                <Route path="/doctors"         element={<ProtectedRoute allowedRoles={['Admin']}><Doctors /></ProtectedRoute>} />
                <Route path="/staff"           element={<ProtectedRoute allowedRoles={['Admin']}><Staff /></ProtectedRoute>} />
                <Route path="/departments"     element={<ProtectedRoute allowedRoles={['Admin']}><Departments /></ProtectedRoute>} />
                <Route path="/services"        element={<ProtectedRoute allowedRoles={['Admin']}><Services /></ProtectedRoute>} />
                <Route path="/suppliers"       element={<ProtectedRoute allowedRoles={['Admin']}><Suppliers /></ProtectedRoute>} />
                <Route path="/billing"         element={<ProtectedRoute allowedRoles={['Admin','Receptionist']}><Billing /></ProtectedRoute>} />
                <Route path="/rooms"           element={<ProtectedRoute allowedRoles={['Admin','Nurse','Receptionist']}><Rooms /></ProtectedRoute>} />
                <Route path="/inventory"       element={<ProtectedRoute allowedRoles={['Admin','Pharmacist']}><Inventory /></ProtectedRoute>} />
                <Route path="/insurance"       element={<ProtectedRoute allowedRoles={['Admin','Receptionist']}><Insurance /></ProtectedRoute>} />

                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
