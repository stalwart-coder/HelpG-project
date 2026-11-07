import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Calendar,
  FileCheck2,
  TrendingUp,
  AlertCircle,
  Clock,
  ArrowUpRight,
  RefreshCw,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { getDashboardStats, listAllBookings, listPendingKycs } from '../../utils/adminApi';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [pendingKycCount, setPendingKycCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setError(null);
      const [statsData, bookingsData, kycData] = await Promise.allSettled([
        getDashboardStats(),
        listAllBookings({ limit: 5 }),
        listPendingKycs({ status: 'pending', limit: 1 }),
      ]);

      if (statsData.status === 'fulfilled') {
        setStats(statsData.value);
      }
      if (bookingsData.status === 'fulfilled') {
        const list = bookingsData.value?.bookings || bookingsData.value?.data || [];
        setRecentBookings(Array.isArray(list) ? list : []);
      }
      if (kycData.status === 'fulfilled') {
        const total = kycData.value?.total || kycData.value?.pagination?.total || 0;
        setPendingKycCount(total);
      }
    } catch (err) {
      setError(err?.message || 'Failed to fetch dashboard metrics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin mb-3" />
        <p className="text-sm text-slate-400 font-mono">Aggregating live platform metrics...</p>
      </div>
    );
  }

  const userMetrics = stats?.users || stats?.counts?.users || { total: 0, customers: 0, helpers: 0 };
  const bookingMetrics = stats?.bookings || stats?.counts?.bookings || { total: 0, completed: 0, in_progress: 0, pending: 0 };
  const revenueMetrics = stats?.financials || stats?.revenue || { grossTransactionValue: 0, platformRevenue: 0 };

  return (
    <div className="space-y-6">
      {/* ── Page Header ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-white tracking-tight">Platform Command Center</h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time monitoring across marketplace operations, verifications, and financial health.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin text-amber-500' : ''} />
            <span>Refresh Telemetry</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 text-rose-400 text-sm">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* ── Alert Bar for KYC ───────────────────────────────────── */}
      {pendingKycCount > 0 && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              {pendingKycCount}
            </div>
            <div>
              <div className="text-sm font-semibold text-white">Pending KYC Verifications</div>
              <div className="text-xs text-slate-400">Helpers are awaiting document review before taking jobs.</div>
            </div>
          </div>
          <button
            onClick={() => navigate('/admin/kyc')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors shrink-0"
          >
            <span>Review Queue</span>
            <ArrowUpRight size={14} />
          </button>
        </div>
      )}

      {/* ── 4 KPI Stat Cards ───────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Users */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 backdrop-blur">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold uppercase font-mono tracking-wider">Total Accounts</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Users size={16} />
            </div>
          </div>
          <div className="text-2xl font-bold font-display text-white">
            {(userMetrics.total || 0).toLocaleString()}
          </div>
          <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
            <span className="text-emerald-400 font-medium">{userMetrics.helpers || 0} helpers</span>
            <span>•</span>
            <span>{userMetrics.customers || 0} customers</span>
          </div>
        </div>

        {/* Card 2: Bookings */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 backdrop-blur">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold uppercase font-mono tracking-wider">Total Bookings</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Calendar size={16} />
            </div>
          </div>
          <div className="text-2xl font-bold font-display text-white">
            {(bookingMetrics.total || 0).toLocaleString()}
          </div>
          <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
            <span className="text-amber-400 font-medium">{bookingMetrics.in_progress || 0} active</span>
            <span>•</span>
            <span className="text-emerald-400">{bookingMetrics.completed || 0} completed</span>
          </div>
        </div>

        {/* Card 3: Platform GMV */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 backdrop-blur">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold uppercase font-mono tracking-wider">Gross Merchandise (GMV)</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <TrendingUp size={16} />
            </div>
          </div>
          <div className="text-2xl font-bold font-display text-white">
            ₹{(revenueMetrics.grossTransactionValue || revenueMetrics.totalGMV || 0).toLocaleString()}
          </div>
          <div className="mt-2 text-xs text-slate-400">
            Customer payments processed through marketplace
          </div>
        </div>

        {/* Card 4: Net Platform Cut */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 backdrop-blur">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold uppercase font-mono tracking-wider">HelpJi Commission</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="text-2xl font-bold font-display text-amber-400">
            ₹{(revenueMetrics.platformRevenue || revenueMetrics.commissionEarned || 0).toLocaleString()}
          </div>
          <div className="mt-2 text-xs text-slate-400">
            10% net commission on completed services
          </div>
        </div>
      </div>

      {/* ── Recent Bookings Table ──────────────────────────────── */}
      <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-base font-bold text-white font-display">Recent Marketplace Tasks</h2>
          <button
            onClick={() => navigate('/admin/bookings')}
            className="text-xs text-amber-400 hover:text-amber-300 font-semibold"
          >
            View All Bookings &rarr;
          </button>
        </div>

        {recentBookings.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm">
            No bookings recorded yet in the database.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/60 uppercase font-mono text-[10px] text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-6 py-3">Task Title</th>
                  <th className="px-6 py-3">Customer</th>
                  <th className="px-6 py-3">Helper</th>
                  <th className="px-6 py-3">Amount</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {recentBookings.map((b) => {
                  const statusColors = {
                    pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
                    confirmed: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
                    in_progress: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
                    completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
                    cancelled: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
                  };
                  return (
                    <tr key={b._id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-3.5 font-medium text-white max-w-xs truncate">
                        {b.title || 'Service Request'}
                      </td>
                      <td className="px-6 py-3.5 text-slate-400">
                        {b.customer?.name || 'Customer'}
                      </td>
                      <td className="px-6 py-3.5 text-slate-400">
                        {b.helper?.name || <span className="text-slate-600 italic">Unassigned</span>}
                      </td>
                      <td className="px-6 py-3.5 font-mono text-white">
                        ₹{b.totalAmount || b.price || 0}
                      </td>
                      <td className="px-6 py-3.5">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono border ${
                            statusColors[b.status] || 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {b.status}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-slate-500 font-mono">
                        {new Date(b.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
