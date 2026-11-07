import { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  RefreshCw,
  ShieldAlert,
} from 'lucide-react';
import { listUsers, toggleUserStatus } from '../../utils/adminApi';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState(null);

  const fetchUsers = useCallback(async () => {
    try {
      setError(null);
      const query = { page, limit: 15 };
      if (search.trim()) query.search = search.trim();
      if (roleFilter) query.role = roleFilter;
      if (statusFilter !== '') query.isActive = statusFilter === 'active';

      const res = await listUsers(query);
      const userList = res?.users || res?.data || [];
      setUsers(Array.isArray(userList) ? userList : []);
      setTotalPages(res?.pagination?.pages || res?.totalPages || 1);
    } catch (err) {
      setError(err?.message || 'Failed to fetch user directory');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [page, search, roleFilter, statusFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleToggleStatus = async (user) => {
    const newStatus = !user.isActive;
    const confirmMsg = newStatus
      ? `Activate account for ${user.name}?`
      : `Deactivate account for ${user.name}? They will be logged out immediately.`;
    if (!window.confirm(confirmMsg)) return;

    setActionLoading(user._id);
    try {
      await toggleUserStatus(user._id, newStatus, newStatus ? 'Reactivated by admin' : 'Deactivated by admin');
      setUsers((prev) =>
        prev.map((u) => (u._id === user._id ? { ...u, isActive: newStatus } : u))
      );
    } catch (err) {
      alert(err.message || 'Status update failed');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Page Header ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-white tracking-tight">User Management</h1>
          <p className="text-xs text-slate-400 mt-1">
            Browse and manage all registered customers, helpers, and their platform access.
          </p>
        </div>
        <button
          onClick={() => { setRefreshing(true); fetchUsers(); }}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white"
        >
          <RefreshCw size={14} className={refreshing ? 'animate-spin text-amber-500' : ''} />
          <span>Refresh List</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 text-rose-400 text-sm">
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* ── Search & Filter Controls ───────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
          className="px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
        >
          <option value="">All Roles (Customer & Helper)</option>
          <option value="customer">Customers Only</option>
          <option value="helper">Helpers Only</option>
          <option value="admin">Administrators</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
        >
          <option value="">All Statuses (Active & Suspended)</option>
          <option value="active">Active Only</option>
          <option value="suspended">Suspended Only</option>
        </select>
      </div>

      {/* ── Users Table ────────────────────────────────────────── */}
      <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-12">
            <Loader2 className="w-6 h-6 text-amber-500 animate-spin mb-2" />
            <p className="text-xs text-slate-400 font-mono">Loading user directory...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            No matching users found for the selected query.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/60 uppercase font-mono text-[10px] text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-6 py-3.5">User</th>
                  <th className="px-6 py-3.5">Role</th>
                  <th className="px-6 py-3.5">Contact</th>
                  <th className="px-6 py-3.5">KYC Status</th>
                  <th className="px-6 py-3.5">Account Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-amber-400 font-bold text-xs uppercase">
                          {u.name ? u.name.charAt(0) : 'U'}
                        </div>
                        <div>
                          <div className="font-semibold text-white">{u.name || 'Unnamed User'}</div>
                          <div className="text-[11px] font-mono text-slate-500">
                            Joined {new Date(u.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold border ${
                          u.role === 'helper'
                            ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                            : u.role === 'admin'
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                            : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-mono text-slate-300">{u.phone || '—'}</div>
                      <div className="text-slate-500 text-[11px]">{u.email || '—'}</div>
                    </td>
                    <td className="px-6 py-4">
                      {u.role === 'helper' ? (
                        u.isKycVerified ? (
                          <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                            <CheckCircle size={13} /> Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-amber-400 font-medium">
                            <AlertTriangle size={13} /> Pending Review
                          </span>
                        )
                      ) : (
                        <span className="text-slate-600">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {u.isActive ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          Suspended
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleToggleStatus(u)}
                        disabled={actionLoading === u._id}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                          u.isActive
                            ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border-rose-500/20'
                            : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/20'
                        }`}
                      >
                        {actionLoading === u._id ? (
                          <Loader2 size={12} className="animate-spin inline mr-1" />
                        ) : null}
                        {u.isActive ? 'Suspend' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
