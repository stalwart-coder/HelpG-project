import { useState, useEffect, useCallback } from 'react';
import {
  Headphones,
  Search,
  Filter,
  CheckCircle,
  AlertTriangle,
  Loader2,
  RefreshCw,
  MessageSquare,
  Send,
  X,
} from 'lucide-react';
import { listTickets, resolveTicket, closeTicket, addTicketNote } from '../../utils/adminApi';

export default function AdminTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [resolutionText, setResolutionText] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTickets = useCallback(async () => {
    try {
      setError(null);
      const query = {};
      if (statusFilter) query.status = statusFilter;
      if (priorityFilter) query.priority = priorityFilter;

      const res = await listTickets(query);
      const list = res?.tickets || res?.data || [];
      setTickets(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(err?.message || 'Failed to fetch tickets');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [statusFilter, priorityFilter]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleAddNote = async () => {
    if (!replyText.trim()) return;
    setActionLoading(true);
    try {
      await addTicketNote(selectedTicket._id, replyText.trim());
      setReplyText('');
      fetchTickets();
    } catch (err) {
      alert(err.message || 'Failed to add reply note');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResolve = async () => {
    if (!resolutionText.trim()) {
      alert('Please summarize how this dispute or inquiry was resolved.');
      return;
    }
    setActionLoading(true);
    try {
      await resolveTicket(selectedTicket._id, resolutionText.trim());
      setSelectedTicket(null);
      setResolutionText('');
      fetchTickets();
    } catch (err) {
      alert(err.message || 'Failed to resolve ticket');
    } finally {
      setActionLoading(false);
    }
  };

  const priorityColors = {
    urgent: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    high: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    medium: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    low: 'bg-slate-800 text-slate-400 border-slate-700',
  };

  return (
    <div className="space-y-6">
      {/* ── Page Header ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-white tracking-tight">Support & Dispute Center</h1>
          <p className="text-xs text-slate-400 mt-1">
            Resolve consumer complaints, task cancellations, refund requests, and platform support inquiries.
          </p>
        </div>
        <button
          onClick={() => { setRefreshing(true); fetchTickets(); }}
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

      {/* ── Filter Controls ────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
        >
          <option value="">All Ticket Statuses</option>
          <option value="open">Open (Needs Attention)</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>

        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
        >
          <option value="">All Priorities</option>
          <option value="urgent">Urgent</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      {/* ── Tickets Table ──────────────────────────────────────── */}
      <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-12">
            <Loader2 className="w-6 h-6 text-amber-500 animate-spin mb-2" />
            <p className="text-xs text-slate-400 font-mono">Loading support queue...</p>
          </div>
        ) : tickets.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            No support tickets or disputes filed under current filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/60 uppercase font-mono text-[10px] text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-6 py-3.5">Subject & Ticket #</th>
                  <th className="px-6 py-3.5">User</th>
                  <th className="px-6 py-3.5">Priority</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Created</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {tickets.map((t) => (
                  <tr key={t._id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-white max-w-sm truncate">{t.subject}</div>
                      <div className="text-[11px] font-mono text-slate-500">#{t.ticketNumber || t._id?.slice(-6)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-white font-medium">{t.user?.name || 'Customer'}</div>
                      <div className="text-slate-500 text-[11px]">{t.user?.email || t.user?.phone || '—'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold border ${
                          priorityColors[t.priority] || priorityColors.medium
                        }`}
                      >
                        {t.priority || 'medium'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                        {t.status || 'open'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-mono">
                      {new Date(t.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedTicket(t)}
                        className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 text-xs font-semibold"
                      >
                        Handle Ticket
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Ticket Resolution Drawer ───────────────────────────── */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-mono text-amber-400 uppercase">
                  Ticket #{selectedTicket.ticketNumber || selectedTicket._id?.slice(-6)}
                </span>
                <h2 className="text-base font-bold text-white font-display mt-0.5">{selectedTicket.subject}</h2>
              </div>
              <button onClick={() => setSelectedTicket(null)} className="text-slate-500 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1">
              <div className="font-semibold text-white">Requester: {selectedTicket.user?.name}</div>
              <div className="text-slate-400">Category: {selectedTicket.category || 'General'}</div>
              <p className="text-slate-300 pt-2 border-t border-slate-800/80 mt-2">
                {selectedTicket.description}
              </p>
            </div>

            {/* Resolution Form */}
            {selectedTicket.status !== 'resolved' && selectedTicket.status !== 'closed' && (
              <div className="space-y-3 pt-2">
                <label className="block text-xs font-semibold text-white">
                  Official Resolution
                </label>
                <textarea
                  rows={3}
                  value={resolutionText}
                  onChange={(e) => setResolutionText(e.target.value)}
                  placeholder="Explain resolution (e.g. refund initiated, helper reassigned, issue resolved)..."
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
                <button
                  onClick={handleResolve}
                  disabled={actionLoading}
                  className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
                >
                  Mark as Resolved
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
