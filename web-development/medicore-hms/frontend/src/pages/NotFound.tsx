import { Home, Search } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => (
  <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
    <div className="text-center max-w-sm animate-slide-up">
      <div className="w-24 h-24 rounded-3xl bg-brand-50 dark:bg-brand-950 flex items-center justify-center mx-auto mb-6">
        <Search className="w-12 h-12 text-brand-400" />
      </div>
      <h1 className="text-6xl font-800 text-slate-200 dark:text-slate-700" style={{ fontFamily: 'Syne, sans-serif' }}>404</h1>
      <h2 className="text-xl font-700 text-slate-900 dark:text-white mt-2">Page not found</h2>
      <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 mb-8">The page you're looking for doesn't exist or has been moved.</p>
      <Link to="/dashboard" className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white rounded-xl text-sm font-600 hover:bg-brand-700 transition-colors shadow-sm">
        <Home className="w-4 h-4" /> Back to Dashboard
      </Link>
    </div>
  </div>
);

export default NotFound;
