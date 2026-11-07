import { useState, useEffect, useMemo, useCallback } from 'react';
import { ChevronLeft, Plus, Search, Ticket, AlertTriangle, CheckCircle2, Clock, MessageCircle, Loader2, RefreshCw } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { EmptyState } from '../../components/ui/PageState';
import { getMyTickets } from '../../utils/supportApi';

const STATUS_STYLE = {
  open: { bg: 'bg-amber-50 text-amber-700', dot: 'bg-amber-500', label: 'Open' },
  'in-progress': { bg: 'bg-blue-50 text-blue-700', dot: 'bg-blue-500', label: 'In Progress' },
  awaiting: { bg: 'bg-purple-50 text-purple-700', dot: 'bg-purple-500', label: 'Awaiting' },
  resolved: { bg: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500', label: 'Resolved' },
  closed: { bg: 'bg-slate-100 text-slate-500', dot: 'bg-slate-400', label: 'Closed' },
};

const PRIORITY_STYLE = {
  urgent: 'text-rose-600',
  high: 'text-amber-600',
  medium: 'text-blue-600',
  low: 'text-slate-400',
};

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function SupportTicketList({ onBack, onCreateTicket, onSelectTicket }) {
  const { t } = useLanguage();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getMyTickets({ limit: 50 });
      const list = Array.isArray(res) ? res : (res?.tickets ?? []);
      setTickets(list);
    } catch (err) {
      setError(err?.message || 'Failed to load support tickets.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const searchTrim = search.trim().toLowerCase();
  const openCount = tickets.filter(t => t.status !== 'resolved' && t.status !== 'closed').length;
  const resolvedCount = tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length;

  const filtered = useMemo(() => {
    let list = [...tickets];
    if (searchTrim) {
      list = list.filter(t =>
        (t.subject ?? t.title ?? '').toLowerCase().includes(searchTrim) ||
        (t.ticketId ?? t._id ?? '').toLowerCase().includes(searchTrim)
      );
    }
    if (statusFilter === 'open') list = list.filter(t => t.status !== 'resolved' && t.status !== 'closed');
    if (statusFilter === 'resolved') list = list.filter(t => t.status === 'resolved' || t.status === 'closed');
    return list.sort((a, b) => new Date(b.updatedAt ?? b.createdAt) - new Date(a.updatedAt ?? a.createdAt));
  }, [tickets, searchTrim, statusFilter]);

  return (
    <div className="min-h-screen bg-paper">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-line px-5 pt-4 pb-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            {onBack && (
              <button onClick={onBack} className="p-1 -ml-1 text-ink-soft hover:text-ink">
                <ChevronLeft size={20} />
              </button>
            )}
            <h1 className="text-[20px] font-display font-semibold">Support Tickets</h1>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={load} className="p-1.5 text-ink-soft hover:text-ink" aria-label="Refresh">
              <RefreshCw size={18} />
            </button>
            <button
              onClick={onCreateTicket}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-marigold text-ink text-xs font-bold hover:bg-marigold-deep transition-colors"
            >
              <Plus size={14} /> New Ticket
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tickets..."
            className="w-full pl-10 pr-4 py-2.5 bg-paper border border-line rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-marigold/40"
          />
        </div>

        {/* Filter chips */}
        <div className="flex gap-2">
          {[
            { id: 'all', label: `All (${tickets.length})` },
            { id: 'open', label: `Open (${openCount})` },
            { id: 'resolved', label: `Resolved (${resolvedCount})` },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setStatusFilter(f.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                statusFilter === f.id ? 'bg-ink text-white' : 'bg-paper-card text-ink-soft border border-line hover:border-ink/20'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-3 py-2">
        {loading && (
          <div className="flex justify-center mt-12">
            <Loader2 size={28} className="animate-spin text-marigold" />
          </div>
        )}

        {error && !loading && (
          <div className="mx-1 mt-4 px-4 py-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-sm">
            {error} <button onClick={load} className="underline font-semibold ml-1">Retry</button>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="mt-10">
            <EmptyState
              title="No tickets found"
              subtitle={searchTrim ? 'Try a different search.' : 'You have no support tickets yet.'}
              action={!searchTrim ? { label: 'Create a Ticket', onClick: onCreateTicket } : undefined}
            />
          </div>
        )}

        {!loading && filtered.map((ticket) => {
          const st = STATUS_STYLE[ticket.status] ?? STATUS_STYLE.open;
          const priorityClass = PRIORITY_STYLE[ticket.priority] ?? PRIORITY_STYLE.medium;
          const subject = ticket.subject ?? ticket.title ?? 'Untitled';
          const ticketId = ticket.ticketId ?? ticket._id ?? '';
          const replies = ticket.replies?.length ?? ticket.messages ?? 0;

          return (
            <button
              key={ticket._id ?? ticketId}
              onClick={() => onSelectTicket?.(ticket)}
              className="w-full text-left flex flex-col gap-2 p-4 mb-2 bg-white rounded-2xl border border-line shadow-xs hover:shadow-sm hover:border-marigold/30 transition-all"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-ink truncate">{subject}</p>
                  <p className="text-[11px] font-mono text-ink-soft mt-0.5">{ticketId}</p>
                </div>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shrink-0 ${st.bg}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                  {st.label}
                </span>
              </div>

              <div className="flex items-center gap-3 text-[11px] text-ink-soft">
                <span className={`font-semibold capitalize ${priorityClass}`}>{ticket.priority ?? 'medium'}</span>
                <span>·</span>
                <span className="capitalize">{ticket.category ?? 'general'}</span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <MessageCircle size={11} /> {replies}
                </span>
                <span className="ml-auto flex items-center gap-1">
                  <Clock size={11} /> {timeAgo(ticket.updatedAt ?? ticket.createdAt)}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
