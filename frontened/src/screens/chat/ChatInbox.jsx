import { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, ChevronLeft, MoreHorizontal, Check, CheckCheck, Loader2 } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { EmptyState } from '../../components/ui/PageState';
import api from '../../utils/apiClient';

function getDeliveryIcon(status) {
  switch (status) {
    case 'sent': return <Check size={14} className="text-ink-soft" />;
    case 'delivered': return <CheckCheck size={14} className="text-ink-soft" />;
    case 'read': return <CheckCheck size={14} className="text-blue-500" />;
    default: return null;
  }
}

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs > 1 ? 's' : ''} ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return 'Yesterday';
  return `${days} days ago`;
}

export default function ChatInbox({ onBack, onSelectConversation }) {
  const { t } = useLanguage();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // all | unread | pinned

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/chat/conversations');
      // API returns { conversations: [...] } or an array
      const list = Array.isArray(res.data) ? res.data : (res.data?.conversations ?? []);
      setConversations(list);
    } catch (err) {
      setError(err?.message || 'Failed to load conversations.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const searchTrim = search.trim().toLowerCase();
  const unreadCount = conversations.filter(c => (c.unreadCount ?? c.unread ?? 0) > 0).length;

  const filtered = useMemo(() => {
    let list = [...conversations];
    if (searchTrim) {
      list = list.filter(c => {
        const name = (c.participants?.find(p => p._id !== c.currentUserId)?.name ?? c.name ?? '').toLowerCase();
        const last = (c.lastMessage?.content ?? c.lastMessage ?? '').toLowerCase();
        return name.includes(searchTrim) || last.includes(searchTrim);
      });
    }
    if (filter === 'unread') list = list.filter(c => (c.unreadCount ?? c.unread ?? 0) > 0);
    if (filter === 'pinned') list = list.filter(c => c.isPinned ?? c.pinned);
    list.sort((a, b) => {
      if ((a.isPinned || a.pinned) && !(b.isPinned || b.pinned)) return -1;
      if (!(a.isPinned || a.pinned) && (b.isPinned || b.pinned)) return 1;
      return new Date(b.lastMessage?.createdAt ?? b.updatedAt ?? 0) - new Date(a.lastMessage?.createdAt ?? a.updatedAt ?? 0);
    });
    return list;
  }, [conversations, searchTrim, filter]);

  if (loading) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <Loader2 size={28} className="animate-spin text-marigold" />
      </div>
    );
  }

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
            <h1 className="text-[20px] font-display font-semibold">Chats</h1>
          </div>
          <button onClick={load} className="p-1.5 text-ink-soft hover:text-ink" aria-label="Refresh">
            <MoreHorizontal size={20} />
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search conversations..."
            className="w-full pl-10 pr-4 py-2.5 bg-paper border border-line rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-marigold/40"
          />
        </div>

        {/* Filter chips */}
        <div className="flex gap-2">
          {[
            { id: 'all', label: 'All' },
            { id: 'unread', label: `Unread${unreadCount > 0 ? ` (${unreadCount})` : ''}` },
            { id: 'pinned', label: 'Pinned' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                filter === f.id
                  ? 'bg-ink text-white'
                  : 'bg-paper-card text-ink-soft border border-line hover:border-ink/20'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mx-4 mt-4 px-4 py-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-sm">
          {error} <button onClick={load} className="underline font-semibold ml-1">Retry</button>
        </div>
      )}

      {/* Conversation list */}
      <div className="px-3 py-2">
        {filtered.length === 0 ? (
          <div className="mt-8">
            <EmptyState
              title="No conversations found"
              subtitle={searchTrim ? 'Try a different search term.' : 'No chats yet. Start by posting a task.'}
            />
          </div>
        ) : (
          filtered.map((conv) => {
            const other = conv.participants?.find(p => p._id !== conv.currentUserId) ?? {};
            const displayName = other.name ?? conv.name ?? 'Unknown';
            const initials = displayName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
            const lastMsg = conv.lastMessage?.content ?? conv.lastMessage ?? '';
            const unread = conv.unreadCount ?? conv.unread ?? 0;
            const isPinned = conv.isPinned ?? conv.pinned ?? false;
            const ts = timeAgo(conv.lastMessage?.createdAt ?? conv.updatedAt);
            const avatar = other.avatar ?? conv.imageUrl ?? null;

            return (
              <button
                key={conv._id ?? conv.id}
                onClick={() => onSelectConversation?.(conv)}
                className="w-full flex items-start gap-3 p-3 rounded-xl hover:bg-white transition-colors text-left"
              >
                <div className="relative shrink-0">
                  {avatar ? (
                    <img src={avatar} alt={displayName} className="w-[50px] h-[50px] rounded-full object-cover" />
                  ) : (
                    <div className="w-[50px] h-[50px] rounded-full bg-ink text-marigold flex items-center justify-center font-bold text-sm font-display">
                      {initials}
                    </div>
                  )}
                  {conv.isOnline && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-banyan border-2 border-white rounded-full" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-[14px] font-semibold text-ink truncate">
                      {isPinned && <span className="text-marigold-deep mr-1">📌</span>}
                      {displayName}
                    </h3>
                    <span className="text-[11px] text-ink-soft shrink-0">{ts}</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="shrink-0">{getDeliveryIcon('delivered')}</span>
                    <p className="text-[13px] text-ink-soft truncate leading-relaxed">{lastMsg}</p>
                  </div>
                  {unread > 0 && (
                    <div className="mt-1 flex justify-end">
                      <span className="w-5 h-5 rounded-full bg-marigold-deep text-white text-[10px] font-bold flex items-center justify-center">
                        {unread > 9 ? '9+' : unread}
                      </span>
                    </div>
                  )}
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
