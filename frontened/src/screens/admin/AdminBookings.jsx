import { useState, useEffect, useCallback } from 'react';
import {
  CalendarCheck2,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Clock,
  MapPin,
  X,
} from 'lucide-react';
import { listAllBookings, adminCancelBooking } from '../../utils/adminApi';

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [cancelModal, setCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchBookings = useCallback(async () => {
    try {
      setError(null);
      const query = { page, limit: 15 };
      if (search.trim()) query.search = search.trim();
      if (statusFilter) query.status = statusFilter;
      if (categoryFilter) query.category = categoryFilter;

      const res = await listAllBookings(query);
      const list = res?.bookings || res?.data || [];
      setBookings(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(err?.message || 'Failed to fetch bookings');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [page, search, statusFilter, categoryFilter]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleCancelBooking = async () => {
    if (!cancelReason.trim()) {
      alert('Please provide a reason for cancelling this booking.');
      return;
    }
    setActionLoading(true);
    try {
      await adminCancelBooking(selectedBooking._id, cancelReason.trim());
      setBookings((prev) =>
        prev.map((b) => (b._id === selectedBooking._id ? { ...b, status: 'cancelled' } : b))
      );
      setCancelModal(false);
      setSelectedBooking(null);
      setCancelReason('');
    } catch (err) {
      alert(err.message || 'Failed to cancel booking');
    } finally {
      setActionLoading(false);
    }
  };

  const statusColors = {
    pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    confirmed: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    in_progress: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    cancelled: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  };

  return (
    <div className="space-y-6">
      {/* ── Page Header ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-white tracking-tight">Marketplace Bookings</h1>
          <p className="text-xs text-slate-400 mt-1">
            Monitor real-time task requests, status transitions, helper assignments, and intervenes when needed.
          </p>
        </div>
        <button
          onClick={() => { setRefreshing(true); fetchBookings(); }}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white"
        >
          <RefreshCw size={14} className={refreshing ? 'animate-spin text-amber-500' : ''} />
          <span>Refresh</span>
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
            placeholder="Search bookings by title, location..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending Acceptance</option>
          <option value="confirmed">Confirmed</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <select
          value={categoryFilter}
          onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
          className="px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
        >
          <option value="">All Categories</option>
          <option value="iron">Ironing & Wash</option>
          <option value="vehicle">Vehicle Wash</option>
          <option value="guard">Temporary Guard</option>
          <option value="event">Event Staff</option>
        </select>
      </div>

      {/* ── Bookings Table ─────────────────────────────────────── */}
      <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-12">
            <Loader2 className="w-6 h-6 text-amber-500 animate-spin mb-2" />
            <p className="text-xs text-slate-400 font-mono">Loading bookings ledger...</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            No bookings found matching current filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/60 uppercase font-mono text-[10px] text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-6 py-3.5">Task Info</th>
                  <th className="px-6 py-3.5">Customer</th>
                  <th className="px-6 py-3.5">Assigned Helper</th>
                  <th className="px-6 py-3.5">Amount</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Scheduled</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {bookings.map((b) => (
                  <tr key={b._id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-white max-w-xs truncate">{b.title}</div>
                      <div className="text-[11px] font-mono text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin size={11} />
                        <span className="truncate max-w-[180px]">{b.location}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-white font-medium">{b.customer?.name || 'Customer'}</div>
                      <div className="text-slate-500 text-[11px]">{b.customer?.phone || '—'}</div>
                    </td>
                    <td className="px-6 py-4">
                      {b.helper ? (
                        <>
                          <div className="text-white font-medium">{b.helper.name}</div>
                          <div className="text-slate-500 text-[11px]">{b.helper.phone || '—'}</div>
                        </>
                      ) : (
                        <span className="text-amber-500/80 font-mono text-[11px]">Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-white">
                      ₹{b.totalAmount || b.price}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-mono border ${
                          statusColors[b.status] || 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-mono">
                      {new Date(b.scheduledAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => setSelectedBooking(b)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
                      >
                        Details
                      </button>
                      {b.status !== 'cancelled' && b.status !== 'completed' && (
                        <button
                          onClick={() => { setSelectedBooking(b); setCancelModal(true); }}
                          className="px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-semibold transition-colors"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Details Modal ──────────────────────────────────────── */}
      {selectedBooking && !cancelModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-base font-bold text-white font-display">Booking Inspection</h2>
              <button onClick={() => setSelectedBooking(null)} className="text-slate-500 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-500 font-mono uppercase text-[10px]">Title & Category</span>
                <div className="text-sm font-semibold text-white mt-0.5">{selectedBooking.title}</div>
                <div className="text-amber-400 font-mono text-[11px] mt-0.5">Category: {selectedBooking.category}</div>
              </div>

              <div>
                <span className="text-slate-500 font-mono uppercase text-[10px]">Description / Customer Notes</span>
                <p className="text-slate-300 bg-slate-950 p-2.5 rounded-xl border border-slate-800 mt-1">
                  {selectedBooking.description || 'No additional instructions provided by customer.'}
                </p>
              </div>

              {selectedBooking.images?.length > 0 && (
                <div>
                  <span className="text-slate-500 font-mono uppercase text-[10px]">Attached Photos ({selectedBooking.images.length})</span>
                  <div className="flex gap-2 mt-1 overflow-x-auto pb-2">
                    {selectedBooking.images.map((url, i) => (
                      <a key={i} href={url} target="_blank" rel="noreferrer" className="shrink-0">
                        <img src={url} alt={`Upload ${i}`} className="h-16 w-16 object-cover rounded-lg border border-slate-700" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-500 font-mono uppercase">Customer</div>
                  <div className="text-white font-semibold">{selectedBooking.customer?.name}</div>
                  <div className="text-slate-400">{selectedBooking.customer?.phone}</div>
                </div>
                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-500 font-mono uppercase">Helper</div>
                  <div className="text-white font-semibold">{selectedBooking.helper?.name || 'Unassigned'}</div>
                  <div className="text-slate-400">{selectedBooking.helper?.phone || '—'}</div>
                </div>
              </div>

              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-500 font-mono uppercase">Financials</div>
                <div className="flex justify-between items-center text-sm font-semibold mt-1">
                  <span className="text-slate-300">Total Charged:</span>
                  <span className="text-amber-400 font-mono">₹{selectedBooking.totalAmount || selectedBooking.price}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedBooking(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Admin Cancel Modal ─────────────────────────────────── */}
      {cancelModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-white">Administrative Cancellation</h3>
            <p className="text-xs text-slate-400">
              Provide an official cancellation reason for booking "{selectedBooking?.title}".
            </p>
            <textarea
              rows={3}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="e.g. Duplicate booking, customer requested override via support..."
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => { setCancelModal(false); setCancelReason(''); }}
                className="px-3 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Exit
              </button>
              <button
                onClick={handleCancelBooking}
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
