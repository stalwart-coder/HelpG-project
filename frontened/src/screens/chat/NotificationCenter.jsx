import { useState, useEffect, useCallback, useMemo } from 'react';
import { ChevronLeft, Bell, BellOff, CheckCircle2, AlertTriangle, Clock, Star, Wallet, MessageCircle, X, Loader2, Trash2, RefreshCw } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { EmptyState } from '../../components/ui/PageState';
import { getNotifications, markAsRead, markAllAsRead, deleteNotification } from '../../utils/notificationApi';

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

const TYPE_ICON = {
  booking: <CheckCircle2 size={18} />,
  payment: <Wallet size={18} />,
  message: <MessageCircle size={18} />,
  reminder: <Clock size={18} />,
  rating: <Star size={18} />,
  alert: <AlertTriangle size={18} />,
};

const TYPE_BG = {
  booking: 'bg-banyan/10 text-banyan',
  payment: 'bg-marigold/10 text-marigold-deep',
  message: 'bg-blue-50 text-blue-600',
  reminder: 'bg-purple-50 text-purple-600',
  rating: 'bg-amber-50 text-amber-600',
  alert: 'bg-rose-50 text-rose-600',
};

export default function NotificationCenter({ onBack }) {
  const { t } = useLanguage();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // all | unread
  const [markingAll, setMarkingAll] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getNotifications({ limit: 50 });
      const list = Array.isArray(res) ? res : (res?.notifications ?? []);
      setNotifications(list);
    } catch (err) {
      setError(err?.message || 'Failed to load notifications.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleMarkRead = useCallback(async (id) => {
    try {
      await markAsRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch {}
  }, []);

  const handleDelete = useCallback(async (id) => {
    try {
      await deleteNotification(id);
      setNotifications(prev => prev.filter(n => n._id !== id));
    } catch {}
  }, []);

  const handleMarkAllRead = useCallback(async () => {
    setMarkingAll(true);
    try {
      await markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch {}
    setMarkingAll(false);
  }, []);

  const filtered = useMemo(() => {
    if (filter === 'unread') return notifications.filter(n => !n.isRead);
    return notifications;
  }, [notifications, filter]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

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
            <h1 className="text-[20px] font-display font-semibold">Notifications</h1>
            {unreadCount > 0 && (
              <span className="bg-marigold-deep text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={load} className="p-1.5 text-ink-soft hover:text-ink" aria-label="Refresh">
              <RefreshCw size={18} />
            </button>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                disabled={markingAll}
                className="text-xs font-semibold text-marigold-deep hover:underline disabled:opacity-40"
              >
                {markingAll ? 'Marking…' : 'Mark all read'}
              </button>
            )}
          </div>
        </div>

        {/* Filter chips */}
        <div className="flex gap-2">
          {[
            { id: 'all', label: 'All' },
            { id: 'unread', label: `Unread${unreadCount > 0 ? ` (${unreadCount})` : ''}` },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                filter === f.id ? 'bg-ink text-white' : 'bg-paper-card text-ink-soft border border-line hover:border-ink/20'
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
              title="All caught up!"
              subtitle={filter === 'unread' ? 'No unread notifications.' : 'No notifications yet.'}
            />
          </div>
        )}

        {!loading && filtered.map((n) => {
          const iconKey = n.type ?? 'booking';
          const isRead = n.isRead ?? false;
          return (
            <div
              key={n._id}
              className={`flex items-start gap-3 p-3 rounded-xl mb-1 transition-colors ${
                isRead ? 'opacity-70' : 'bg-white shadow-xs'
              }`}
            >
              {/* Icon */}
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${TYPE_BG[iconKey] ?? TYPE_BG.booking}`}>
                {TYPE_ICON[iconKey] ?? TYPE_ICON.booking}
              </div>

              {/* Body */}
              <button
                className="flex-1 min-w-0 text-left"
                onClick={() => !isRead && handleMarkRead(n._id)}
              >
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-semibold text-ink">{n.title}</span>
                  {!isRead && <span className="w-2 h-2 rounded-full bg-marigold-deep shrink-0" />}
                  <span className="ml-auto text-[11px] text-ink-soft shrink-0">{timeAgo(n.createdAt)}</span>
                </div>
                <p className="text-[12px] text-ink-soft leading-relaxed mt-0.5">{n.message ?? n.body}</p>
              </button>

              {/* Delete */}
              <button
                onClick={() => handleDelete(n._id)}
                className="p-1 text-ink-soft hover:text-rose-500 transition-colors shrink-0"
                aria-label="Delete notification"
              >
                <Trash2 size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
