import { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  FileCheck2,
  CalendarCheck2,
  Headphones,
  ScrollText,
  LogOut,
  ExternalLink,
  Menu,
  X,
  ShieldAlert,
  ChevronRight,
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import ThemeToggle from '../../components/ThemeToggle';

export default function AdminShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const { admin, logout } = useAdmin();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const navItems = [
    { label: 'Overview', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Users & Helpers', path: '/admin/users', icon: Users },
    { label: 'KYC Verification', path: '/admin/kyc', icon: FileCheck2 },
    { label: 'All Bookings', path: '/admin/bookings', icon: CalendarCheck2 },
    { label: 'Disputes & Support', path: '/admin/tickets', icon: Headphones },
    { label: 'Audit Trail', path: '/admin/audit-logs', icon: ScrollText },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row font-sans">
      {/* ── Mobile Header ────────────────────────────────────────── */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-500">
            <ShieldAlert size={18} />
          </div>
          <span className="font-bold text-white text-base">HelpJi Console</span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* ── Sidebar Desktop / Mobile Overlay ─────────────────────── */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-900/95 border-r border-slate-800/80 backdrop-blur-xl flex flex-col transition-transform duration-200 md:translate-x-0 md:static ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 font-bold">
              HJ
            </div>
            <div>
              <div className="font-display font-bold text-base text-white leading-none">
                HelpJi Admin
              </div>
              <div className="text-[10px] font-mono text-amber-500 uppercase tracking-wider mt-0.5">
                Enterprise 2026
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/25 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-amber-500' : 'text-slate-400'} />
                <span>{item.label}</span>
                {isActive && <ChevronRight size={14} className="ml-auto text-amber-500/60" />}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer Admin Profile */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-900/40">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-9 w-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-amber-400 text-xs">
              {admin?.name ? admin.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold text-white truncate">{admin?.name || 'Admin'}</div>
              <div className="text-[11px] font-mono text-slate-400 truncate">{admin?.email || 'admin@helpji.com'}</div>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-2">
            <ThemeToggle showLabel className="w-full justify-between" />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/')}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-medium transition-colors"
              title="Return to Consumer Web Portal"
            >
              <ExternalLink size={13} />
              <span>Consumer App</span>
            </button>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors"
              title="Sign Out"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main Content Area ────────────────────────────────────── */}
      <main className="flex-1 min-w-0 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
