import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  BedDouble,
  Calendar,
  Clock,
  FileText,
  FlaskConical,
  RefreshCw,
  Stethoscope,
  TrendingUp,
  Users,
  Users2,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getStats } from '../api/dashboard.api';
import Card from '../components/common/Card';
import Loading from '../components/common/Loading';
import Layout from '../components/layout/Layout';
import { useAuth } from '../contexts/AuthContext';
import { DashboardStats } from '../types/dashboard.types';

// ─── Mini bar chart component (pure SVG, no library needed) ─────────────────
const MiniBarChart: React.FC<{ data: number[]; color: string }> = ({ data, color }) => {
  const max = Math.max(...data, 1);
  const w = 40, h = 24, gap = 2;
  const barW = (w - gap * (data.length - 1)) / data.length;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
      {data.map((v, i) => {
        const bh = Math.max(2, (v / max) * h);
        return <rect key={i} x={i * (barW + gap)} y={h - bh} width={barW} height={bh} rx="1.5" fill={color} opacity={i === data.length - 1 ? 1 : 0.4} />;
      })}
    </svg>
  );
};

// ─── Donut chart (SVG) ───────────────────────────────────────────────────────
const DonutChart: React.FC<{ available: number; occupied: number; maintenance: number }> = ({ available, occupied, maintenance }) => {
  const total = available + occupied + maintenance || 1;
  const r = 36, cx = 44, cy = 44, stroke = 10;
  const circ = 2 * Math.PI * r;
  const segs = [
    { val: occupied, color: '#3b97f3' },
    { val: available, color: '#10b981' },
    { val: maintenance, color: '#f59e0b' },
  ];
  let offset = 0;
  const arcs = segs.map(s => {
    const len = (s.val / total) * circ;
    const el = { ...s, dasharray: `${len} ${circ - len}`, dashoffset: circ - offset };
    offset += len;
    return el;
  });
  return (
    <svg width={88} height={88} viewBox="0 0 88 88">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f1f5f9" strokeWidth={stroke} className="dark:stroke-slate-700" />
      {arcs.map((a, i) => (
        <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={a.color} strokeWidth={stroke}
          strokeDasharray={a.dasharray} strokeDashoffset={a.dashoffset} strokeLinecap="round"
          style={{ transform: 'rotate(-90deg)', transformOrigin: '44px 44px', transition: 'stroke-dasharray 0.6s ease' }} />
      ))}
      <text x={cx} y={cy + 5} textAnchor="middle" className="fill-slate-700 dark:fill-slate-200" fontSize="13" fontWeight="700">
        {Math.round((occupied / total) * 100)}%
      </text>
    </svg>
  );
};

// ─── Line sparkline ───────────────────────────────────────────────────────────
const Sparkline: React.FC<{ data: number[]; color: string }> = ({ data, color }) => {
  const w = 120, h = 36;
  if (data.length < 2) return null;
  const max = Math.max(...data, 1), min = Math.min(...data);
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / (max - min || 1)) * (h - 4) - 2;
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

// ─── Stat Card ────────────────────────────────────────────────────────────────
interface StatCardProps {
  title: string; value: number | string; icon: React.ReactNode;
  iconBg: string; iconColor: string; trend?: number; link?: string;
  chart?: React.ReactNode; subtitle?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, iconBg, iconColor, trend, link, chart, subtitle }) => (
  <Link to={link || '#'} className={`card p-5 block hover:shadow-card-md transition-all duration-200 hover:-translate-y-0.5 ${link ? 'cursor-pointer' : 'cursor-default'}`}>
    <div className="flex items-start justify-between mb-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg}`}>
        <span className={iconColor}>{icon}</span>
      </div>
      {trend !== undefined && (
        <span className={`flex items-center gap-1 text-xs font-600 ${trend >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
          <TrendingUp className={`w-3 h-3 ${trend < 0 ? 'rotate-180' : ''}`} />
          {Math.abs(trend)}%
        </span>
      )}
      {chart && <div className="opacity-60">{chart}</div>}
    </div>
    <p className="text-2xl font-800 text-slate-900 dark:text-white">{typeof value === 'number' ? value.toLocaleString() : value}</p>
    <p className="text-xs font-600 text-slate-500 dark:text-slate-400 mt-0.5">{title}</p>
    {subtitle && <p className="text-2xs text-slate-400 dark:text-slate-500 mt-0.5">{subtitle}</p>}
    {link && <div className="flex items-center gap-1 text-brand-600 dark:text-brand-400 text-xs font-600 mt-3"><span>View all</span><ArrowUpRight className="w-3 h-3" /></div>}
  </Link>
);

// ─── Weekly appointments bar chart ────────────────────────────────────────────
const WeeklyChart: React.FC<{ data: { day: string; count: number }[] }> = ({ data }) => {
  const max = Math.max(...data.map(d => d.count), 1);
  return (
    <div className="flex items-end gap-2 h-28">
      {data.map((d, i) => {
        const pct = (d.count / max) * 100;
        const isToday = i === new Date().getDay() - 1;
        return (
          <div key={d.day} className="flex-1 flex flex-col items-center gap-1.5 group">
            <span className="text-2xs text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">{d.count}</span>
            <div className="w-full relative" style={{ height: '80px' }}>
              <div
                className={`absolute bottom-0 left-0 right-0 rounded-t-md transition-all duration-500 ${isToday ? 'bg-brand-600' : 'bg-brand-200 dark:bg-brand-900 group-hover:bg-brand-400 dark:group-hover:bg-brand-700'}`}
                style={{ height: `${Math.max(pct, 5)}%` }}
              />
            </div>
            <span className={`text-2xs font-600 ${isToday ? 'text-brand-600' : 'text-slate-400'}`}>{d.day}</span>
          </div>
        );
      })}
    </div>
  );
};

// ─── Main Dashboard ─────────────────────────────────────────────────────────
const Dashboard: React.FC = () => {
  const { user, role } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const fetchStats = async () => {
    setLoading(true);
    try { const data = await getStats(); setStats(data); setLastRefresh(new Date()); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchStats(); }, []);

  const GREETING = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Mock weekly data (replace with real API when available)
  const weeklyData = [
    { day: 'Mon', count: 12 }, { day: 'Tue', count: 18 },
    { day: 'Wed', count: 14 }, { day: 'Thu', count: 22 },
    { day: 'Fri', count: 16 }, { day: 'Sat', count: 8 },
    { day: 'Sun', count: 5 },
  ];

  const roomStats = stats?.rooms || { total: 0, available: 0, occupied: 0 };
  const maintenance = (roomStats.total || 0) - (roomStats.available || 0) - (roomStats.occupied || 0);

  if (loading) return <Layout><Loading text="Loading dashboard…" /></Layout>;

  return (
    <Layout>
      <div className="space-y-6 max-w-7xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="section-title">{GREETING()}, {user?.username} 👋</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              <span className="mx-2 text-slate-300 dark:text-slate-600">·</span>
              <span className="text-brand-600 dark:text-brand-400 font-500">{role}</span>
            </p>
          </div>
          <button onClick={fetchStats} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>

        {/* KPI cards row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Patients" value={stats?.patients || 0} link="/patients"
            icon={<Users className="w-5 h-5" />}
            iconBg="bg-brand-50 dark:bg-brand-950"
            iconColor="text-brand-600 dark:text-brand-400"
            trend={8}
            chart={<MiniBarChart data={[6, 10, 8, 14, 12, 18, stats?.patients ? (stats.patients % 20) + 5 : 10]} color="#3b97f3" />}
            subtitle="Registered patients"
          />
          <StatCard
            title="Doctors" value={stats?.doctors || 0} link="/doctors"
            icon={<Stethoscope className="w-5 h-5" />}
            iconBg="bg-emerald-50 dark:bg-emerald-950"
            iconColor="text-emerald-600 dark:text-emerald-400"
            trend={3}
            chart={<MiniBarChart data={[4, 5, 4, 6, 5, 7, stats?.doctors ? (stats.doctors % 5) + 3 : 6]} color="#10b981" />}
            subtitle="Active physicians"
          />
          <StatCard
            title="Today's Appointments" value={stats?.appointments || 0} link="/appointments"
            icon={<Calendar className="w-5 h-5" />}
            iconBg="bg-violet-50 dark:bg-violet-950"
            iconColor="text-violet-600 dark:text-violet-400"
            trend={12}
            chart={<MiniBarChart data={[8, 14, 10, 16, 12, 20, stats?.appointments ? (stats.appointments % 15) + 5 : 14]} color="#7c3aed" />}
            subtitle="Scheduled today"
          />
          <StatCard
            title="Staff Members" value={stats?.staff || 0} link="/staff"
            icon={<Users2 className="w-5 h-5" />}
            iconBg="bg-amber-50 dark:bg-amber-950"
            iconColor="text-amber-600 dark:text-amber-400"
            trend={2}
            chart={<MiniBarChart data={[12, 14, 13, 15, 14, 16, stats?.staff ? (stats.staff % 8) + 8 : 14]} color="#f59e0b" />}
            subtitle="Active staff"
          />
        </div>

        {/* Second row - charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Weekly Appointments Chart */}
          <div className="lg:col-span-2 card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-600 text-slate-900 dark:text-white">Weekly Appointments</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Appointment volume this week</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-brand-600 inline-block" />
                <span className="text-xs text-slate-500">Today</span>
              </div>
            </div>
            <WeeklyChart data={weeklyData} />
          </div>

          {/* Room Occupancy Donut */}
          <div className="card p-5">
            <h3 className="text-base font-600 text-slate-900 dark:text-white mb-1">Room Occupancy</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Current bed status</p>
            <div className="flex items-center gap-4">
              <DonutChart available={roomStats.available || 0} occupied={roomStats.occupied || 0} maintenance={Math.max(0, maintenance)} />
              <div className="space-y-2 flex-1">
                {[
                  { label: 'Occupied', val: roomStats.occupied || 0, color: 'bg-brand-500' },
                  { label: 'Available', val: roomStats.available || 0, color: 'bg-emerald-500' },
                  { label: 'Maintenance', val: Math.max(0, maintenance), color: 'bg-amber-500' },
                ].map(s => (
                  <div key={s.label} className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${s.color}`} />
                    <span className="text-xs text-slate-500 dark:text-slate-400 flex-1">{s.label}</span>
                    <span className="text-xs font-600 text-slate-700 dark:text-slate-300">{s.val}</span>
                  </div>
                ))}
                <Link to="/rooms" className="flex items-center gap-1 text-xs text-brand-600 dark:text-brand-400 font-600 pt-1 hover:underline">
                  Manage rooms <ArrowUpRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions + Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Quick Actions */}
          <div className="card p-5">
            <h3 className="text-base font-600 text-slate-900 dark:text-white mb-4">Quick Actions</h3>
            <div className="space-y-2">
              {[
                { to: '/patients', icon: <Users className="w-4 h-4" />, label: 'Add New Patient', color: 'text-brand-600 bg-brand-50 dark:bg-brand-950' },
                { to: '/appointments', icon: <Calendar className="w-4 h-4" />, label: 'Schedule Appointment', color: 'text-violet-600 bg-violet-50 dark:bg-violet-950' },
                { to: '/lab-results', icon: <FlaskConical className="w-4 h-4" />, label: 'Add Lab Result', color: 'text-teal-600 bg-teal-50 dark:bg-teal-950' },
                { to: '/billing', icon: <FileText className="w-4 h-4" />, label: 'Create Invoice', color: 'text-amber-600 bg-amber-50 dark:bg-amber-950' },
                { to: '/prescriptions', icon: <Activity className="w-4 h-4" />, label: 'New Prescription', color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950' },
              ].map(a => (
                <Link key={a.to} to={a.to} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${a.color}`}>{a.icon}</div>
                  <span className="text-sm font-500 text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white">{a.label}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 ml-auto group-hover:text-brand-500 transition-colors" />
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-2 card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-600 text-slate-900 dark:text-white">Recent Activity</h3>
              <Clock className="w-4 h-4 text-slate-400" />
            </div>
            {stats?.recentActivity && stats.recentActivity.length > 0 ? (
              <div className="space-y-3">
                {stats.recentActivity.slice(0, 8).map((a, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-2 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-700 dark:text-slate-300 truncate">{a.description}</p>
                      <p className="text-2xs text-slate-400 mt-0.5">{new Date(a.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
                  <Activity className="w-6 h-6 text-slate-400" />
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">No recent activity</p>
                <p className="text-xs text-slate-400 mt-1">Actions will appear here as they happen</p>
              </div>
            )}
          </div>
        </div>

        {/* Status bar */}
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          System operational · Last updated {lastRefresh.toLocaleTimeString()}
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
