import { ShieldOff } from 'lucide-react';
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Loading from '../common/Loading';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps): JSX.Element {
  const { isAuthenticated, isLoading, role } = useAuth();

  if (isLoading) return <Loading fullScreen text="Verifying session..." />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (allowedRoles && allowedRoles.length > 0 && role && !allowedRoles.includes(role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
        <div className="card p-8 max-w-sm w-full text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-950 flex items-center justify-center mx-auto mb-4">
            <ShieldOff className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-lg font-700 text-slate-900 dark:text-white mb-2">Access Denied</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Your role <span className="font-600 text-slate-700 dark:text-slate-300">({role})</span> doesn't have permission for this page.</p>
          <p className="text-xs text-slate-400 mb-6">Required: {allowedRoles.join(', ')}</p>
          <button onClick={() => window.history.back()} className="px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-600 hover:bg-brand-700 transition-colors">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
