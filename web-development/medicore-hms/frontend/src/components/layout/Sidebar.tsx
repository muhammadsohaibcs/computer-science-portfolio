import {
  Activity, BarChart3, BedDouble, Building2, Calendar,
  ClipboardList, CreditCard, FileText, FlaskConical, Home,
  Key, Layers, LogOut, MessageCircle, Package, Shield, Stethoscope, Users, Users2, X
} from 'lucide-react';
import React, { memo } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface NavItem {
  to: string;
  icon: React.ReactNode;
  label: string;
  roles?: string[];
}

const navItems: NavItem[] = [
  { to: '/dashboard',        icon: <Home className="w-4 h-4" />,          label: 'Dashboard' },
  { to: '/patients',         icon: <Users className="w-4 h-4" />,          label: 'Patients',        roles: ['Admin','Doctor','Nurse','Receptionist'] },
  { to: '/doctors',          icon: <Stethoscope className="w-4 h-4" />,    label: 'Doctors',         roles: ['Admin'] },
  { to: '/staff',            icon: <Users2 className="w-4 h-4" />,         label: 'Staff',           roles: ['Admin'] },
  { to: '/departments',      icon: <Building2 className="w-4 h-4" />,      label: 'Departments',     roles: ['Admin'] },
  { to: '/appointments',     icon: <Calendar className="w-4 h-4" />,       label: 'Appointments',    roles: ['Admin','Doctor','Receptionist','Nurse'] },
  { to: '/medical-records',  icon: <ClipboardList className="w-4 h-4" />,  label: 'Medical Records', roles: ['Admin','Doctor','Nurse'] },
  { to: '/prescriptions',    icon: <FileText className="w-4 h-4" />,       label: 'Prescriptions',   roles: ['Admin','Doctor','Pharmacist'] },
  { to: '/lab-results',      icon: <FlaskConical className="w-4 h-4" />,   label: 'Lab Results',     roles: ['Admin','Doctor','Lab Technician','Nurse'] },
  { to: '/chat',             icon: <MessageCircle className="w-4 h-4" />,  label: 'Messages' },
  { to: '/billing',          icon: <CreditCard className="w-4 h-4" />,     label: 'Billing',         roles: ['Admin','Receptionist'] },
  { to: '/rooms',            icon: <BedDouble className="w-4 h-4" />,      label: 'Rooms',           roles: ['Admin','Nurse','Receptionist'] },
  { to: '/inventory',        icon: <Package className="w-4 h-4" />,        label: 'Inventory',       roles: ['Admin','Pharmacist'] },
  { to: '/services',         icon: <Activity className="w-4 h-4" />,       label: 'Services',        roles: ['Admin'] },
  { to: '/insurance',        icon: <Shield className="w-4 h-4" />,         label: 'Insurance',       roles: ['Admin','Receptionist'] },
  { to: '/suppliers',        icon: <Layers className="w-4 h-4" />,         label: 'Suppliers',       roles: ['Admin'] },
];

interface SidebarProps { open: boolean; onClose: () => void; }

const Sidebar: React.FC<SidebarProps> = memo(({ open, onClose }) => {
  const { role, logout, user } = useAuth();
  const navigate = useNavigate();
  const visible = navItems.filter(item => !item.roles || (role && item.roles.includes(role)));

  const handleLogout = async () => { await logout(); navigate('/login', { replace: true }); };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="flex items-center gap-3 px-4 h-[60px] border-b border-slate-100 dark:border-slate-800 flex-shrink-0">
        <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center flex-shrink-0 shadow-glow">
          <BarChart3 className="w-4 h-4 text-white" />
        </div>
        <div>
          <span className="text-sm font-800 text-slate-900 dark:text-white" style={{ fontFamily: 'Syne, sans-serif' }}>MediCore</span>
          <span className="block text-2xs text-slate-400 -mt-0.5 uppercase tracking-widest">HMS v2.0</span>
        </div>
        <button onClick={onClose} className="ml-auto p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 lg:hidden">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* User pill */}
      <div className="px-3 pt-3 pb-1">
        <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl bg-gradient-to-r from-brand-50 to-slate-50 dark:from-brand-950/50 dark:to-slate-800/30 border border-brand-100 dark:border-brand-900/50">
          <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center text-white text-xs font-700 flex-shrink-0 shadow-sm">
            {(user?.username || 'U')[0].toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-600 text-slate-800 dark:text-slate-200 truncate">{user?.username}</p>
            <p className="text-2xs text-brand-600 dark:text-brand-400">{role}</p>
          </div>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5">
        <p className="text-2xs font-600 text-slate-400 uppercase tracking-wider px-2 mb-1.5 mt-1">Navigation</p>
        {visible.map(item => (
          <NavLink key={item.to} to={item.to} onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all duration-100 relative group
              ${isActive ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'}`
            }
          >
            <span className="flex-shrink-0">{item.icon}</span>
            <span className="font-500 truncate">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer actions */}
      <div className="p-2 border-t border-slate-100 dark:border-slate-800 flex-shrink-0 space-y-0.5">
        <p className="text-2xs font-600 text-slate-400 uppercase tracking-wider px-2 mb-1.5">Account</p>
        <NavLink to="/security" onClick={onClose}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all w-full
            ${isActive ? 'bg-brand-600 text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'}`
          }
        >
          <Shield className="w-4 h-4 flex-shrink-0" />
          <span className="font-500">Security & 2FA</span>
        </NavLink>
        <NavLink to="/change-password" onClick={onClose}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all w-full
            ${isActive ? 'bg-brand-600 text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'}`
          }
        >
          <Key className="w-4 h-4 flex-shrink-0" />
          <span className="font-500">Change Password</span>
        </NavLink>
        <button onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-slate-600 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-600 dark:hover:text-red-400 transition-all w-full group">
          <LogOut className="w-4 h-4 flex-shrink-0 group-hover:translate-x-0.5 transition-transform" />
          <span className="font-500">Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {open && <div className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm animate-fade-in" onClick={onClose} />}
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 h-full w-[256px] bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 z-30">{sidebarContent}</aside>
      <aside className={`lg:hidden fixed left-0 top-0 h-full w-[256px] bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 z-50 transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full'}`}>{sidebarContent}</aside>
    </>
  );
});

Sidebar.displayName = 'Sidebar';
export default Sidebar;
